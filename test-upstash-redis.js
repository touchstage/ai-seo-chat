import 'dotenv/config';
import { Redis } from '@upstash/redis';

console.log('🧪 Testing Upstash Redis Connection...\n');

async function testUpstashRedis() {
  try {
    console.log('🔗 Connecting to Upstash Redis...');
    console.log('URL:', process.env.UPSTASH_REDIS_REST_URL);
    
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    
    console.log('✅ Redis client created successfully!');
    
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
    
    // Test list operations
    console.log('🧪 Testing list operations...');
    await redis.lpush('test-list', 'item1', 'item2', 'item3');
    const listItems = await redis.lrange('test-list', 0, -1);
    console.log('✅ List test successful:', listItems);
    
    // Test hash operations
    console.log('🧪 Testing hash operations...');
    await redis.hset('test-hash', { field1: 'value1', field2: 'value2' });
    const hashData = await redis.hgetall('test-hash');
    console.log('✅ Hash test successful:', hashData);
    
    // Clean up
    await redis.del('test-key');
    await redis.del('test-json');
    await redis.del('test-list');
    await redis.del('test-hash');
    console.log('🧹 Cleaned up test data');
    
    console.log('✅ All Redis operations successful!');
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
  
  console.log('\n🚀 Starting Upstash Redis connection test...\n');
  const success = await testUpstashRedis();
  
  if (success) {
    console.log('\n🎉 Upstash Redis connection test passed! Your Redis setup is working perfectly.');
  } else {
    console.log('\n❌ Upstash Redis connection test failed. Please check your configuration.');
  }
}

runTest().catch(console.error);
