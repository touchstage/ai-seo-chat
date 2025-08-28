import express from 'express';
import cors from 'cors';
import { AIService } from './app/services/ai.server.ts';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Health check with Azure OpenAI status
app.get('/health', (req, res) => {
  const azureConfig = {
    hasApiKey: !!process.env.AZURE_OPENAI_API_KEY,
    hasEndpoint: !!process.env.AZURE_OPENAI_ENDPOINT,
    hasDeployment: !!process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
    chatDeployment: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT || 'gpt-4',
    embeddingDeployment: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT || 'text-embedding-ada-002',
  };

  res.json({ 
    status: 'OK', 
    message: 'AI SEO Chat Test Server Running (Azure OpenAI)',
    azureConfig,
    endpoints: [
      'POST /test/seo - Test AI SEO generation',
      'POST /test/chat - Test chat functionality', 
      'POST /test/embedding - Test embedding generation'
    ]
  });
});

// Test AI SEO generation
app.post('/test/seo', async (req, res) => {
  try {
    const { product } = req.body;
    
    if (!product) {
      return res.status(400).json({ error: 'Product data required' });
    }

    console.log('Generating SEO for product:', product.title);
    const seoData = await AIService.generateProductSEO(product, 'test-shop');
    
    if (!seoData) {
      return res.status(500).json({ error: 'Failed to generate SEO data' });
    }

    res.json({
      success: true,
      seoData,
      message: 'AI SEO generated successfully using Azure OpenAI!'
    });
  } catch (error) {
    console.error('SEO generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate SEO',
      details: error.message,
      suggestion: 'Check your Azure OpenAI configuration'
    });
  }
});

// Test chat functionality
app.post('/test/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    const settings = {
      tonePreset: 'professional',
      brandWords: ['quality', 'premium'],
      blocklist: ['medical', 'financial']
    };

    console.log('Processing chat message:', message);
    const response = await AIService.chatCompletion(
      [{ role: 'user', content: message }],
      'test-shop',
      settings
    );

    res.json({
      success: true,
      response: response.message?.content || 'No response generated',
      message: 'Chat response generated successfully using Azure OpenAI!'
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to generate chat response',
      details: error.message,
      suggestion: 'Check your Azure OpenAI configuration'
    });
  }
});

// Test embedding generation
app.post('/test/embedding', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text required' });
    }

    console.log('Generating embedding for text:', text.substring(0, 50) + '...');
    const embedding = await AIService.generateEmbedding(text);
    
    res.json({
      success: true,
      embedding: embedding.slice(0, 5), // Show first 5 dimensions
      dimensions: embedding.length,
      message: 'Embedding generated successfully using Azure OpenAI!'
    });
  } catch (error) {
    console.error('Embedding error:', error);
    res.status(500).json({ 
      error: 'Failed to generate embedding',
      details: error.message,
      suggestion: 'Check your Azure OpenAI configuration'
    });
  }
});

// Azure OpenAI configuration check
app.get('/config', (req, res) => {
  const config = {
    azureOpenAI: {
      hasApiKey: !!process.env.AZURE_OPENAI_API_KEY,
      hasEndpoint: !!process.env.AZURE_OPENAI_ENDPOINT,
      hasDeployment: !!process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      chatDeployment: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT,
      embeddingDeployment: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION,
    }
  };

  res.json(config);
});

app.listen(PORT, () => {
  console.log(`🚀 AI SEO Chat Test Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`⚙️  Config check: http://localhost:${PORT}/config`);
  console.log(`💡 Make sure you have set your Azure OpenAI configuration in the .env file`);
  console.log(`🔧 Required: AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_DEPLOYMENT_NAME`);
});
