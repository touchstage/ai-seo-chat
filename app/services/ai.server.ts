import OpenAI from 'openai';
import { z } from 'zod';
import { nanoid } from 'nanoid';

// Azure OpenAI Configuration
const azureOpenAI = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
  defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview' },
  defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_API_KEY },
});

// Function schemas for AI chat
const getProductSchema = z.object({
  productId: z.string().optional(),
  query: z.string().optional(),
});

const getRelatedSchema = z.object({
  productId: z.string(),
});

const getPolicySchema = z.object({
  slug: z.string(),
});

const addToCartSchema = z.object({
  variantId: z.string(),
  quantity: z.number().min(1),
});

const findSizeSchema = z.object({
  productId: z.string(),
  bodyMeasurements: z.record(z.number()).optional(),
});

export class AIService {
  static async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await azureOpenAI.embeddings.create({
        model: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT || 'text-embedding-ada-002',
        input: text,
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error('Azure OpenAI embedding error:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  static async generateProductSEO(product: any, shop: string) {
    const prompt = `Generate SEO content for this product:

Product: ${product.title}
Description: ${product.description || 'No description provided'}
Type: ${product.productType || 'General'}
Vendor: ${product.vendor || 'Unknown'}

Generate the following in JSON format:
1. features: Array of 3-5 key product features
2. use_cases: Array of 3-5 use cases or scenarios
3. faqs: Array of 5-8 FAQ objects with "q" (question) and "a" (answer) fields
4. jsonld: Complete JSON-LD structured data for Product, Offer, and AggregateRating

Focus on being helpful, accurate, and avoiding medical/financial claims.`;

    try {
      const response = await azureOpenAI.chat.completions.create({
        model: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT || 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      });

      try {
        return JSON.parse(response.choices[0].message.content || '{}');
      } catch (error) {
        console.error('Failed to parse AI response:', error);
        return null;
      }
    } catch (error) {
      console.error('Azure OpenAI chat error:', error);
      return null;
    }
  }

  static async generateAltText(imageUrl: string, productTitle: string): Promise<string> {
    const prompt = `Generate a concise, descriptive alt text for this product image. 
    Product: ${productTitle}
    Focus on key visual elements, colors, and product features. Keep it under 125 characters.`;

    try {
      const response = await azureOpenAI.chat.completions.create({
        model: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT || 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 100,
      });

      return response.choices[0].message.content?.trim() || '';
    } catch (error) {
      console.error('Azure OpenAI alt text error:', error);
      return '';
    }
  }

  static async chatCompletion(
    messages: any[],
    shop: string,
    settings: any,
    availableFunctions: any[] = []
  ) {
    const systemPrompt = `You are a helpful AI assistant for an e-commerce store. 
    
    Guidelines:
    - Be helpful, accurate, and conversational
    - Focus on product information, sizing, materials, compatibility, shipping, and returns
    - Avoid medical, financial, or legal advice
    - Use the brand tone: ${settings.tonePreset}
    - Incorporate brand words: ${settings.brandWords.join(', ')}
    - Avoid blocked words: ${settings.blocklist.join(', ')}
    
    Available actions: ${availableFunctions.map(f => f.name).join(', ')}`;

    try {
      const response = await azureOpenAI.chat.completions.create({
        model: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT || 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        functions: availableFunctions.length > 0 ? availableFunctions : undefined,
        function_call: availableFunctions.length > 0 ? 'auto' : undefined,
        temperature: 0.7,
        max_tokens: 1000,
      });

      return response.choices[0];
    } catch (error) {
      console.error('Azure OpenAI chat completion error:', error);
      throw new Error('Failed to generate chat response');
    }
  }

  static async generateRelatedProducts(productId: string, features: string[], useCases: string[]) {
    const prompt = `Given these product features and use cases, suggest 3-5 related product types that would complement this product:

Features: ${features.join(', ')}
Use Cases: ${useCases.join(', ')}

Return as JSON array of product suggestions with:
- category: Product category
- reason: Why it's related
- overlap_score: 0-1 score of feature/use-case overlap`;

    try {
      const response = await azureOpenAI.chat.completions.create({
        model: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT || 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 500,
      });

      try {
        return JSON.parse(response.choices[0].message.content || '[]');
      } catch (error) {
        console.error('Failed to parse related products response:', error);
        return [];
      }
    } catch (error) {
      console.error('Azure OpenAI related products error:', error);
      return [];
    }
  }

  static async generateSearchSynonyms(useCases: string[]) {
    const prompt = `Generate search synonyms and boost terms for these product use cases:

Use Cases: ${useCases.join(', ')}

Return as JSON with:
- synonyms: Array of synonym groups
- boosts: Array of terms to boost in search
- negative_terms: Array of terms to avoid`;

    try {
      const response = await azureOpenAI.chat.completions.create({
        model: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT || 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 800,
      });

      try {
        return JSON.parse(response.choices[0].message.content || '{}');
      } catch (error) {
        console.error('Failed to parse search synonyms response:', error);
        return { synonyms: [], boosts: [], negative_terms: [] };
      }
    } catch (error) {
      console.error('Azure OpenAI search synonyms error:', error);
      return { synonyms: [], boosts: [], negative_terms: [] };
    }
  }
}

// Function definitions for AI chat
export const chatFunctions = [
  {
    name: 'get_product',
    description: 'Get product information by ID or search query',
    parameters: getProductSchema,
  },
  {
    name: 'get_related',
    description: 'Get related products based on features and use cases',
    parameters: getRelatedSchema,
  },
  {
    name: 'get_policy',
    description: 'Get store policy information (shipping, returns, warranty)',
    parameters: getPolicySchema,
  },
  {
    name: 'add_to_cart',
    description: 'Add a product variant to the cart',
    parameters: addToCartSchema,
  },
  {
    name: 'find_size',
    description: 'Find the right size for a product based on measurements',
    parameters: findSizeSchema,
  },
];
