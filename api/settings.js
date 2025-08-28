export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { shop } = req.query;

    if (!shop) {
      return res.status(400).json({ error: 'Shop parameter is required' });
    }

    // In a real app, this would fetch from your database
    // For now, return default settings
    const settings = await getStoreSettings(shop);

    res.status(200).json(settings);
  } catch (error) {
    console.error('Settings API error:', error);
    res.status(500).json({ error: 'Failed to load settings' });
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
