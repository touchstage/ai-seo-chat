import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Redis } from '@upstash/redis';

console.log('🧪 Testing Database and Redis Connections...\n');

// Test Database Connection
async function testDatabase() {
  console.log('1️⃣ Testing Supabase Database Connection...');
  
  try {
    const prisma = new PrismaClient();
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database query successful:', result);
    
    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('ProductEmbedding', 'PolicyEmbedding', 'ChatTranscript', 'ChatCache', 'AIMetrics', 'JobQueue', 'AppSettings')
    `;
    
    console.log('✅ Found tables:', tables.map(t => t.table_name));
    
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Test Redis Connection
async function testRedis() {
  console.log('\n2️⃣ Testing Upstash Redis Connection...');
  
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    
    console.log('✅ Redis client created successfully!');
    
    // Test set/get
    await redis.set('test-key', 'test-value');
    const value = await redis.get('test-key');
    console.log('✅ Redis set/get test successful:', value);
    
    // Clean up
    await redis.del('test-key');
    return true;
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    return false;
  }
}

// Test Environment Variables
function testEnvironment() {
  console.log('\n3️⃣ Testing Environment Variables...');
  
  const required = [
    'DATABASE_URL',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
    'AZURE_OPENAI_API_KEY',
    'AZURE_OPENAI_ENDPOINT',
    'AZURE_OPENAI_DEPLOYMENT_NAME'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length === 0) {
    console.log('✅ All required environment variables are set!');
    return true;
  } else {
    console.error('❌ Missing environment variables:', missing);
    return false;
  }
}

// Run all tests
async function runTests() {
  const envOk = testEnvironment();
  const dbOk = await testDatabase();
  const redisOk = await testRedis();
  
  console.log('\n📊 Test Results:');
  console.log(`Environment Variables: ${envOk ? '✅' : '❌'}`);
  console.log(`Database Connection: ${dbOk ? '✅' : '❌'}`);
  console.log(`Redis Connection: ${redisOk ? '✅' : '❌'}`);
  
  if (envOk && dbOk && redisOk) {
    console.log('\n🎉 All tests passed! Your setup is ready for production.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check your configuration.');
  }
}

runTests().catch(console.error);
