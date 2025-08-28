export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, sessionId, productId, shop } = req.body;

    console.log('Chat API called:', { message, sessionId, productId, shop });

    // Get Azure OpenAI configuration from environment variables
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o';

    if (!apiKey || !endpoint) {
      console.error('Azure OpenAI configuration missing');
      return res.status(500).json({
        response: "I'm sorry, my AI service is not properly configured right now. Please try again later.",
        error: 'Azure OpenAI not configured'
      });
    }

    // Get store-specific settings (in a real app, this would come from your database)
    const storeSettings = await getStoreSettings(shop);

    // Create context for the AI based on store settings
    const context = `You are an AI assistant for ${shop || 'this store'}. 

${storeSettings.personality || 'You should be helpful, friendly, and knowledgeable about the store\'s products and services.'}

Current conversation context:
- Customer message: "${message}"
- Store: ${shop || 'this store'}
- Session: ${sessionId}

Respond naturally as if you're a friendly store employee helping a customer. Be conversational, helpful, and specific to this store's products and services.`;

    // Call Azure OpenAI
    const response = await fetch(`${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=2024-02-15-preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: context
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: storeSettings.maxTokens || 300,
        temperature: storeSettings.temperature || 0.7,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`Azure OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Return the AI response
    res.status(200).json({
      response: aiResponse,
      sessionId: sessionId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Fallback to a more natural response if AI fails
    const fallbackResponses = [
      "Hey there! I'm having trouble connecting to my brain right now, but I'd love to help you with anything about our store! What can I tell you about?",
      "Oops, my AI is taking a coffee break! But I'm here to help - what would you like to know about our products or services?",
      "Sorry about that! I'm back now. What were you asking about? I'm excited to help!"
    ];
    
    const fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    res.status(500).json({
      response: fallbackResponse,
      error: error.message
    });
  }
}

// Function to get store-specific settings (placeholder for database integration)
async function getStoreSettings(shop) {
  // In a real app, this would query your database for the store's settings
  // For now, return default settings
  return {
    personality: "You are a helpful AI assistant for this store. Be friendly, knowledgeable, and conversational. Help customers with product questions, orders, and general inquiries.",
    welcomeMessage: "Hi! I'm your AI assistant. How can I help you today?",
    maxTokens: 300,
    temperature: 0.7,
    enabled: true,
    buttonLabel: 'Chat with AI',
    buttonColor: '#667eea',
    position: 'bottom-right'
  };
}
