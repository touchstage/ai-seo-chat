// Health check endpoint
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    message: 'AI SEO Chat App is running successfully!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
}
