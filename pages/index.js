import React from 'react';

export default function HomePage() {
  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '40px 20px',
      textAlign: 'center'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        🤖 AI SEO Chat - Shopify App
      </h1>
      
      <p style={{ fontSize: '18px', color: '#666', marginBottom: '30px' }}>
        A powerful AI-powered chat widget for Shopify stores that provides intelligent customer support, 
        product recommendations, and SEO optimization.
      </p>
      
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h3 style={{ color: '#333', marginBottom: '15px' }}>🚀 Features</h3>
        <ul style={{ textAlign: 'left', lineHeight: '1.6' }}>
          <li>AI-powered product questions and answers</li>
          <li>Smart product recommendations</li>
          <li>SEO optimization suggestions</li>
          <li>Real-time chat with instant responses</li>
          <li>Product data synchronization</li>
          <li>Redis-powered caching for performance</li>
        </ul>
      </div>
      
      <div style={{ 
        backgroundColor: '#e8f4fd', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h3 style={{ color: '#333', marginBottom: '15px' }}>🛠️ Tech Stack</h3>
        <p style={{ lineHeight: '1.6' }}>
          <strong>Frontend:</strong> React, Remix, Shopify Polaris<br/>
          <strong>Backend:</strong> Node.js, Remix<br/>
          <strong>AI:</strong> Azure OpenAI (GPT-4o)<br/>
          <strong>Database:</strong> Supabase PostgreSQL<br/>
          <strong>Caching:</strong> Upstash Redis<br/>
          <strong>Hosting:</strong> Vercel<br/>
          <strong>Platform:</strong> Shopify App Framework
        </p>
      </div>
      
      <div style={{ 
        backgroundColor: '#f0f8f0', 
        padding: '20px', 
        borderRadius: '8px'
      }}>
        <h3 style={{ color: '#333', marginBottom: '15px' }}>📊 Status</h3>
        <p style={{ color: '#28a745', fontWeight: 'bold' }}>
          ✅ App is running successfully on Vercel!
        </p>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
          This is the deployment server for the AI SEO Chat Shopify app. 
          The app is ready for integration with Shopify stores.
        </p>
      </div>
      
      <div style={{ marginTop: '40px', padding: '20px', borderTop: '1px solid #eee' }}>
        <p style={{ fontSize: '14px', color: '#999' }}>
          Built with ❤️ for Shopify store owners
        </p>
      </div>
    </div>
  );
}
