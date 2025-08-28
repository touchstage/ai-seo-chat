import 'dotenv/config';
import { Redis } from '@upstash/redis';

console.log('🧪 Testing Upstash Redis Connection...\n');

async function testRedis() {
  try {
    console.log('🔗 Connecting to Upstash Redis...');
    console.log('URL:', process.env.UPSTASH_REDIS_REST_URL);
    
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN
    });
    console.log('✅ Redis connection established!');
    
    // Test set/get
    console.log('🧪 Testing set/get operations...');
    await redis.set('test-key', 'Hello from AI SEO Chat!');
    const value = await redis.get('test-key');
    console.log('✅ Set/Get test successful:', value);
    
    // Test with JSON
    console.log('🧪 Testing JSON operations...');
    const testData = { 
      message: 'Redis is working!', 
      timestamp: new Date().toISOString(),
      app: 'AI SEO Chat'
    };
    await redis.set('test-json', testData);
    const jsonValue = await redis.get('test-json');
    console.log('✅ JSON test successful:', jsonValue);
    
    // Clean up
    await redis.del('test-key');
    await redis.del('test-json');
    console.log('🧹 Cleaned up test data');
    
    // No need to disconnect for Upstash Redis
    console.log('✅ Redis connection closed');
    
    return true;
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    console.error('Full error:', error);
    return false;
  }
}

// Test environment variables
function testEnvironment() {
  console.log('🔍 Checking environment variables...');
  
  const required = [
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length === 0) {
    console.log('✅ All Redis environment variables are set!');
    return true;
  } else {
    console.error('❌ Missing environment variables:', missing);
    return false;
  }
}

// Run test
async function runTest() {
  const envOk = testEnvironment();
  
  if (!envOk) {
    console.log('\n⚠️  Environment variables not set correctly.');
    return;
  }
  
  console.log('\n🚀 Starting Redis connection test...\n');
  const success = await testRedis();
  
  if (success) {
    console.log('\n🎉 Redis connection test passed! Your Upstash setup is working perfectly.');
  } else {
    console.log('\n❌ Redis connection test failed. Please check your Upstash configuration.');
  }
}

runTest().catch(console.error);
