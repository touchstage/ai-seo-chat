import fetch from 'node-fetch';

const TEST_SERVER = 'http://localhost:3001';

// Test product data
const sampleProduct = {
  title: "Premium Wireless Bluetooth Headphones",
  description: "High-quality wireless headphones with noise cancellation, 30-hour battery life, and premium sound quality. Perfect for music lovers and professionals.",
  productType: "Electronics",
  vendor: "AudioTech Pro"
};

// Test chat messages
const chatMessages = [
  "What are the key features of these headphones?",
  "How long does the battery last?",
  "Is there a warranty included?",
  "Can I use these for phone calls?"
];

async function testAI() {
  console.log('🧪 Testing AI SEO Chat App...\n');

  // Test 1: Health Check
  console.log('1️⃣ Testing Health Check...');
  try {
    const healthResponse = await fetch(`${TEST_SERVER}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData.status);
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
    return;
  }

  // Test 2: AI SEO Generation
  console.log('\n2️⃣ Testing AI SEO Generation...');
  try {
    const seoResponse = await fetch(`${TEST_SERVER}/test/seo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: sampleProduct })
    });
    const seoData = await seoResponse.json();
    
    if (seoData.success) {
      console.log('✅ SEO Generated Successfully!');
      console.log('📝 Features:', seoData.seoData.features?.slice(0, 3) || 'None');
      console.log('🎯 Use Cases:', seoData.seoData.use_cases?.slice(0, 3) || 'None');
      console.log('❓ FAQs:', seoData.seoData.faqs?.length || 0, 'questions generated');
    } else {
      console.log('❌ SEO Generation Failed:', seoData.error);
    }
  } catch (error) {
    console.log('❌ SEO Test Error:', error.message);
  }

  // Test 3: Chat Functionality
  console.log('\n3️⃣ Testing Chat Functionality...');
  for (const message of chatMessages) {
    try {
      console.log(`💬 Testing: "${message}"`);
      const chatResponse = await fetch(`${TEST_SERVER}/test/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      const chatData = await chatResponse.json();
      
      if (chatData.success) {
        console.log('🤖 AI Response:', chatData.response.substring(0, 100) + '...');
      } else {
        console.log('❌ Chat Failed:', chatData.error);
      }
    } catch (error) {
      console.log('❌ Chat Test Error:', error.message);
    }
  }

  // Test 4: Embedding Generation
  console.log('\n4️⃣ Testing Embedding Generation...');
  try {
    const embedResponse = await fetch(`${TEST_SERVER}/test/embedding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: sampleProduct.title })
    });
    const embedData = await embedResponse.json();
    
    if (embedData.success) {
      console.log('✅ Embedding Generated!');
      console.log('📊 Dimensions:', embedData.dimensions);
      console.log('🔢 Sample Values:', embedData.embedding);
    } else {
      console.log('❌ Embedding Failed:', embedData.error);
    }
  } catch (error) {
    console.log('❌ Embedding Test Error:', error.message);
  }

  console.log('\n🎉 Testing Complete!');
  console.log('\n📋 Next Steps:');
  console.log('1. Set up your database (PostgreSQL)');
  console.log('2. Configure Redis for caching');
  console.log('3. Deploy to Shopify Partners');
  console.log('4. Install on your Shopify store');
}

// Run the test
testAI().catch(console.error);
