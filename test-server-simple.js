import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Azure OpenAI Configuration
const azureOpenAI = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
  defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION || '2024-12-01-preview' },
  defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_API_KEY },
});

// Separate Azure OpenAI client for embeddings
const azureOpenAIEmbeddings = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT}`,
  defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION || '2024-12-01-preview' },
  defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_API_KEY },
});

// Health check with Azure OpenAI status
app.get('/health', (req, res) => {
  const azureConfig = {
    hasApiKey: !!process.env.AZURE_OPENAI_API_KEY,
    hasEndpoint: !!process.env.AZURE_OPENAI_ENDPOINT,
    hasDeployment: !!process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
    chatDeployment: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT || 'gpt-4o',
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

    const response = await azureOpenAI.chat.completions.create({
      model: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT || 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    let seoData;
    try {
      let content = response.choices[0].message.content || '{}';
      
      // Handle markdown code blocks
      if (content.includes('```json')) {
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      } else if (content.includes('```')) {
        content = content.replace(/```\n?/g, '').trim();
      }
      
      seoData = JSON.parse(content);
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      console.error('Raw response:', response.choices[0].message.content);
      return res.status(500).json({ error: 'Failed to parse AI response' });
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
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    console.log('Processing chat message:', message);
    
    const systemPrompt = `You are a helpful AI assistant for an e-commerce store. 
    
    Guidelines:
    - Be helpful, accurate, and conversational
    - Focus on product information, sizing, materials, compatibility, shipping, and returns
    - Avoid medical, financial, or legal advice
    - Use a professional tone
    - Be concise and helpful`;

    const response = await azureOpenAI.chat.completions.create({
      model: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT || 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    res.json({
      success: true,
      response: response.choices[0].message?.content || 'No response generated',
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
    
    const response = await azureOpenAIEmbeddings.embeddings.create({
      model: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT || 'text-embedding-ada-002',
      input: text,
    });
    
    const embedding = response.data[0].embedding;
    
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
