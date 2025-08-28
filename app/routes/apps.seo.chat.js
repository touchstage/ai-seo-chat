import { json } from '@remix-run/node';

export async function action({ request }) {
  try {
    const { message, sessionId, productId, shop } = await request.json();

    console.log('Chat API called:', { message, sessionId, productId, shop });

    // For now, return a demo response
    // In production, this would connect to Azure OpenAI
    const demoResponses = [
      "Thank you for your message! I'm your AI assistant for Canbury Ice Cream. I can help you with information about our delicious ice cream flavors, shipping options, store hours, and more. What would you like to know?",
      "Great question! At Canbury Ice Cream, we offer a wide variety of flavors including classic favorites like vanilla, chocolate, and strawberry, as well as unique creations. We also have dairy-free options available. Would you like to know about our current flavors or pricing?",
      "I'd be happy to help! We offer delivery and pickup options. Our store is open daily and we also have special promotions running. What specific information are you looking for about our services?",
      "That's a great question! We pride ourselves on using high-quality ingredients and offering both traditional and innovative ice cream flavors. We also have options for dietary restrictions. Is there something specific you'd like to know about our products?",
      "Thanks for reaching out! I'm here to help you with anything about Canbury Ice Cream - from flavor recommendations to ordering information. What can I assist you with today?"
    ];

    // Select a random demo response
    const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];

    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    return json({
      response: randomResponse,
      sessionId: sessionId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return json({
      response: "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.",
      error: error.message
    }, { status: 500 });
  }
}

export async function loader() {
  return json({ status: 'Chat API is running' });
}
