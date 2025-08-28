export default function handler(req, res) {
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

    // Demo responses for Canbury Ice Cream
    const demoResponses = [
      "Thank you for your message! I'm your AI assistant for Canbury Ice Cream. I can help you with information about our delicious ice cream flavors, shipping options, store hours, and more. What would you like to know?",
      "Great question! At Canbury Ice Cream, we offer a wide variety of flavors including classic favorites like vanilla, chocolate, and strawberry, as well as unique creations. We also have dairy-free options available. Would you like to know about our current flavors or pricing?",
      "I'd be happy to help! We offer delivery and pickup options. Our store is open daily and we also have special promotions running. What specific information are you looking for about our services?",
      "That's a great question! We pride ourselves on using high-quality ingredients and offering both traditional and innovative ice cream flavors. We also have options for dietary restrictions. Is there something specific you'd like to know about our products?",
      "Thanks for reaching out! I'm here to help you with anything about Canbury Ice Cream - from flavor recommendations to ordering information. What can I assist you with today?"
    ];

    // Select a random demo response
    const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];

    // Return the response
    res.status(200).json({
      response: randomResponse,
      sessionId: sessionId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({
      response: "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.",
      error: error.message
    });
  }
}
