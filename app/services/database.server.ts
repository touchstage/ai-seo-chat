import { PrismaClient } from '@prisma/client';
import { AIService } from './ai.server';

const prisma = new PrismaClient();

// Helper function to calculate cosine similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

interface EmbeddingWithSimilarity {
  id: string;
  shop: string;
  productId: string;
  title: string;
  description: string | null;
  features: string[];
  useCases: string[];
  faqs: any[];
  embedding: any;
  createdAt: Date;
  updatedAt: Date;
  similarity: number;
}

interface PolicyEmbeddingWithSimilarity {
  id: string;
  shop: string;
  policyId: string;
  title: string;
  content: string;
  type: string;
  embedding: any;
  createdAt: Date;
  updatedAt: Date;
  similarity: number;
}

export class DatabaseService {
  static async createProductEmbedding(
    shop: string,
    productId: string,
    title: string,
    description: string | null,
    features: string[],
    useCases: string[],
    faqs: any[]
  ) {
    const textForEmbedding = `${title} ${description || ''} ${features.join(' ')} ${useCases.join(' ')}`;
    const embedding = await AIService.generateEmbedding(textForEmbedding);

    return await prisma.productEmbedding.upsert({
      where: { shop_productId: { shop, productId } },
      update: {
        title,
        description,
        features,
        useCases,
        faqs,
        embedding,
        updatedAt: new Date(),
      },
      create: {
        shop,
        productId,
        title,
        description,
        features,
        useCases,
        faqs,
        embedding,
      },
    });
  }

  static async createPolicyEmbedding(
    shop: string,
    policyId: string,
    title: string,
    content: string,
    type: string
  ) {
    const embedding = await AIService.generateEmbedding(`${title} ${content}`);

    return await prisma.policyEmbedding.upsert({
      where: { shop_policyId: { shop, policyId } },
      update: {
        title,
        content,
        type,
        embedding,
        updatedAt: new Date(),
      },
      create: {
        shop,
        policyId,
        title,
        content,
        type,
        embedding,
      },
    });
  }

  static async searchSimilarProducts(
    shop: string,
    query: string,
    limit: number = 5
  ): Promise<EmbeddingWithSimilarity[]> {
    const queryEmbedding = await AIService.generateEmbedding(query);

    // Get all product embeddings for the shop
    const embeddings = await prisma.productEmbedding.findMany({
      where: { shop },
    });

    // Calculate similarities and sort
    const results = embeddings
      .map((embedding) => {
        const similarity = cosineSimilarity(
          queryEmbedding,
          embedding.embedding as number[]
        );
        return {
          ...embedding,
          similarity,
        };
      })
      .sort((a: EmbeddingWithSimilarity, b: EmbeddingWithSimilarity) => b.similarity - a.similarity)
      .slice(0, limit);

    return results;
  }

  static async searchPolicies(
    shop: string,
    query: string,
    limit: number = 3
  ): Promise<PolicyEmbeddingWithSimilarity[]> {
    const queryEmbedding = await AIService.generateEmbedding(query);

    // Get all policy embeddings for the shop
    const embeddings = await prisma.policyEmbedding.findMany({
      where: { shop },
    });

    // Calculate similarities and sort
    const results = embeddings
      .map((embedding) => {
        const similarity = cosineSimilarity(
          queryEmbedding,
          embedding.embedding as number[]
        );
        return {
          ...embedding,
          similarity,
        };
      })
      .sort((a: PolicyEmbeddingWithSimilarity, b: PolicyEmbeddingWithSimilarity) => b.similarity - a.similarity)
      .slice(0, limit);

    return results;
  }

  static async saveChatTranscript(
    shop: string,
    sessionId: string,
    messages: any[],
    metadata?: any
  ) {
    return await prisma.chatTranscript.create({
      data: {
        shop,
        sessionId,
        messages,
        metadata,
      },
    });
  }

  static async getChatCache(shop: string, query: string) {
    const cache = await prisma.chatCache.findUnique({
      where: { shop_query: { shop, query } },
    });

    if (cache && cache.expiresAt > new Date()) {
      return cache;
    }

    return null;
  }

  static async saveChatCache(
    shop: string,
    query: string,
    answer: string,
    actions?: any
  ) {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    return await prisma.chatCache.upsert({
      where: { shop_query: { shop, query } },
      update: {
        answer,
        actions,
        expiresAt,
      },
      create: {
        shop,
        query,
        answer,
        actions,
        expiresAt,
      },
    });
  }

  static async recordMetric(
    shop: string,
    metric: string,
    value: number,
    metadata?: any
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await prisma.aIMetrics.upsert({
      where: {
        shop_date_metric: {
          shop,
          date: today,
          metric,
        },
      },
      update: {
        value,
        metadata,
      },
      create: {
        shop,
        date: today,
        metric,
        value,
        metadata,
      },
    });
  }

  static async getMetrics(shop: string, startDate: Date, endDate: Date) {
    return await prisma.aIMetrics.findMany({
      where: {
        shop,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  static async createJob(
    shop: string,
    type: string,
    data?: any
  ) {
    return await prisma.jobQueue.create({
      data: {
        shop,
        type,
        status: 'pending',
        data,
      },
    });
  }

  static async updateJobStatus(
    id: string,
    status: string,
    result?: any,
    error?: string
  ) {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'running') {
      updateData.startedAt = new Date();
    } else if (status === 'completed' || status === 'failed') {
      updateData.completedAt = new Date();
      if (result) updateData.result = result;
      if (error) updateData.error = error;
    }

    return await prisma.jobQueue.update({
      where: { id },
      data: updateData,
    });
  }

  static async getPendingJobs(shop: string, type?: string) {
    return await prisma.jobQueue.findMany({
      where: {
        shop,
        status: 'pending',
        ...(type && { type }),
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  static async getAppSettings(shop: string) {
    let settings = await prisma.appSettings.findUnique({
      where: { shop },
    });

    if (!settings) {
      // Create default settings
      settings = await prisma.appSettings.create({
        data: {
          shop,
          allowAddToCart: false,
          restrictToQA: false,
          tonePreset: 'professional',
          brandWords: [],
          blocklist: [],
          starterPrompts: [],
          suggestedQuestions: [],
          transcriptRetention: false,
          transcriptRetentionDays: 30,
          freeMessageLimit: 100,
          proMessageLimit: 3000,
          overageRate: 0.02,
        },
      });
    }

    return settings;
  }

  static async updateAppSettings(shop: string, updates: any) {
    return await prisma.appSettings.update({
      where: { shop },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    });
  }

  static async getProductEmbedding(shop: string, productId: string) {
    return await prisma.productEmbedding.findUnique({
      where: { shop_productId: { shop, productId } },
    });
  }

  static async getAllProductEmbeddings(shop: string) {
    return await prisma.productEmbedding.findMany({
      where: { shop },
      orderBy: { updatedAt: 'desc' },
    });
  }

  static async deleteProductEmbedding(shop: string, productId: string) {
    return await prisma.productEmbedding.delete({
      where: { shop_productId: { shop, productId } },
    });
  }

  static async cleanupExpiredCache() {
    return await prisma.chatCache.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  static async cleanupOldTranscripts(shop: string, retentionDays: number) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    return await prisma.chatTranscript.deleteMany({
      where: {
        shop,
        createdAt: {
          lt: cutoffDate,
        },
      },
    });
  }
}
