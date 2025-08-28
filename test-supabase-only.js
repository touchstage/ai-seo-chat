import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

console.log('🧪 Testing Supabase Database Connection...\n');

async function testSupabase() {
  try {
    console.log('🔗 Connecting to Supabase...');
    console.log('URL:', process.env.DATABASE_URL?.replace(/\/\/.*@/, '//***:***@'));
    
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
    
    // Test inserting a sample record
    console.log('🧪 Testing insert operation...');
    const testSettings = await prisma.$queryRaw`
      INSERT INTO "AppSettings" ("id", "shop", "settings") 
      VALUES (gen_random_uuid(), 'test-shop', '{"test": true}')
      ON CONFLICT ("shop") DO NOTHING
      RETURNING "id"
    `;
    console.log('✅ Insert test successful');
    
    // Clean up test data
    await prisma.$queryRaw`DELETE FROM "AppSettings" WHERE "shop" = 'test-shop'`;
    console.log('🧹 Cleaned up test data');
    
    await prisma.$disconnect();
    console.log('✅ Database connection closed');
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
    return false;
  }
}

// Test environment variables
function testEnvironment() {
  console.log('🔍 Checking environment variables...');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set');
    console.log('\n📝 To set it up:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Settings → Database');
    console.log('3. Copy the connection string (URI)');
    console.log('4. Update your .env file');
    return false;
  }
  
  console.log('✅ DATABASE_URL is set');
  return true;
}

// Run test
async function runTest() {
  const envOk = testEnvironment();
  
  if (!envOk) {
    console.log('\n⚠️  Environment variables not set correctly.');
    return;
  }
  
  console.log('\n🚀 Starting Supabase connection test...\n');
  const success = await testSupabase();
  
  if (success) {
    console.log('\n🎉 Supabase connection test passed! Your database is ready.');
  } else {
    console.log('\n❌ Supabase connection test failed. Please check your configuration.');
  }
}

runTest().catch(console.error);
