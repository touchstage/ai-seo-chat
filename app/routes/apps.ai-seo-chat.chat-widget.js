import { json } from '@remix-run/node';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function loader() {
  try {
    // Read the chat widget JavaScript file
    const chatWidgetPath = join(process.cwd(), 'public', 'chat-widget.js');
    const chatWidgetContent = readFileSync(chatWidgetPath, 'utf8');
    
    // Return the JavaScript content with proper headers
    return new Response(chatWidgetContent, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error serving chat widget:', error);
    return new Response('console.error("Chat widget not found");', {
      status: 404,
      headers: {
        'Content-Type': 'application/javascript',
      },
    });
  }
}
