import { json } from '@remix-run/node';

export async function loader({ request }) {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  // Only allow GET requests
  if (request.method !== 'GET') {
    return json({ error: 'Method not allowed' }, { status: 405, headers });
  }

  try {
    const url = new URL(request.url);
    const shop = url.searchParams.get('shop');

    if (!shop) {
      return json({ error: 'Shop parameter is required' }, { status: 400, headers });
    }

    // In a real app, this would fetch from your database
    // For now, return default settings
    const settings = await getStoreSettings(shop);

    return json(settings, { headers });
  } catch (error) {
    console.error('Settings API error:', error);
    return json({ error: 'Failed to load settings' }, { status: 500, headers });
  }
}

// Function to get store-specific settings (placeholder for database integration)
async function getStoreSettings(shop) {
  // In a real app, this would query your database for the store's settings
  // For now, return default settings
  return {
    enabled: true,
    buttonLabel: 'Chat with AI',
    buttonColor: '#667eea',
    position: 'bottom-right',
    welcomeMessage: "Hi! I'm your AI assistant. How can I help you today?",
    personality: "You are a helpful AI assistant for this store. Be friendly, knowledgeable, and conversational. Help customers with product questions, orders, and general inquiries.",
    maxTokens: 300,
    temperature: 0.7,
    allowAddToCart: false,
    restrictToQA: true,
    tonePreset: 'Professional'
  };
}
