// Simple API endpoint for Vercel deployment
export default function handler(req, res) {
  res.status(200).json({
    message: 'AI SEO Chat App is running!',
    status: 'success',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      chat: '/apps/seo/chat',
      aiFeed: '/apps/seo/ai-feed.json'
    }
  });
}
