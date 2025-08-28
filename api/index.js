// Simple API endpoint for Vercel deployment
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Return JSON response
  res.status(200).json({
    message: 'AI SEO Chat App is running!',
    status: 'success',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      chat: '/apps/seo/chat',
      aiFeed: '/apps/seo/ai-feed.json'
    },
    version: '1.0.0'
  });
}
