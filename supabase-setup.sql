-- AI SEO Chat App Database Setup for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Product Embeddings Table
CREATE TABLE IF NOT EXISTS "ProductEmbedding" (
    "id" TEXT PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "features" TEXT[] DEFAULT '{}',
    "useCases" TEXT[] DEFAULT '{}',
    "faqs" JSONB DEFAULT '[]',
    "embedding" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("shop", "productId")
);

-- Policy Embeddings Table
CREATE TABLE IF NOT EXISTS "PolicyEmbedding" (
    "id" TEXT PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "embedding" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("shop", "policyId")
);

-- Chat Transcripts Table
CREATE TABLE IF NOT EXISTS "ChatTranscript" (
    "id" TEXT PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "customerId" TEXT,
    "messages" JSONB DEFAULT '[]',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Chat Cache Table
CREATE TABLE IF NOT EXISTS "ChatCache" (
    "id" TEXT PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "response" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("shop", "query")
);

-- AI Metrics Table
CREATE TABLE IF NOT EXISTS "AIMetrics" (
    "id" TEXT PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "feedHits" INTEGER DEFAULT 0,
    "chatMessages" INTEGER DEFAULT 0,
    "seoGenerated" INTEGER DEFAULT 0,
    "altTextGenerated" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("shop", "date")
);

-- Job Queue Table
CREATE TABLE IF NOT EXISTS "JobQueue" (
    "id" TEXT PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "status" TEXT DEFAULT 'pending',
    "attempts" INTEGER DEFAULT 0,
    "maxAttempts" INTEGER DEFAULT 3,
    "scheduledAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- App Settings Table
CREATE TABLE IF NOT EXISTS "AppSettings" (
    "id" TEXT PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("shop")
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "ProductEmbedding_shop_idx" ON "ProductEmbedding"("shop");
CREATE INDEX IF NOT EXISTS "PolicyEmbedding_shop_idx" ON "PolicyEmbedding"("shop");
CREATE INDEX IF NOT EXISTS "ChatTranscript_shop_idx" ON "ChatTranscript"("shop");
CREATE INDEX IF NOT EXISTS "ChatCache_shop_idx" ON "ChatCache"("shop");
CREATE INDEX IF NOT EXISTS "AIMetrics_shop_idx" ON "AIMetrics"("shop");
CREATE INDEX IF NOT EXISTS "JobQueue_shop_idx" ON "JobQueue"("shop");
CREATE INDEX IF NOT EXISTS "JobQueue_status_idx" ON "JobQueue"("status");

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_product_embedding_updated_at BEFORE UPDATE ON "ProductEmbedding" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_policy_embedding_updated_at BEFORE UPDATE ON "PolicyEmbedding" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_transcript_updated_at BEFORE UPDATE ON "ChatTranscript" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_cache_updated_at BEFORE UPDATE ON "ChatCache" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_metrics_updated_at BEFORE UPDATE ON "AIMetrics" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_queue_updated_at BEFORE UPDATE ON "JobQueue" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON "AppSettings" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default app settings
INSERT INTO "AppSettings" ("id", "shop", "settings") 
VALUES (
    uuid_generate_v4(),
    'default',
    '{
        "chatWidget": {
            "enabled": true,
            "allowAddToCart": false,
            "restrictToQA": false,
            "tonePreset": "professional",
            "brandWords": ["quality", "premium", "sustainable"],
            "blocklist": ["medical", "financial"],
            "freeMessageLimit": 100,
            "proMessageLimit": 3000,
            "overageRate": 0.02
        },
        "seoGeneration": {
            "autoGenerate": true,
            "maxFeatures": 5,
            "maxUseCases": 5,
            "maxFaqs": 8
        },
        "caching": {
            "chatCacheHours": 24,
            "feedCacheHours": 1
        }
    }'
) ON CONFLICT ("shop") DO NOTHING;
