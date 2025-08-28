import { Redis } from '@upstash/redis';

// Initialize Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export class RedisService {
  // Chat response caching
  static async cacheChatResponse(shop: string, query: string, response: any, ttlHours: number = 24) {
    const key = `chat:${shop}:${Buffer.from(query).toString('base64')}`;
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
    
    try {
      await redis.set(key, {
        response,
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Failed to cache chat response:', error);
      return false;
    }
  }

  static async getCachedChatResponse(shop: string, query: string) {
    const key = `chat:${shop}:${Buffer.from(query).toString('base64')}`;
    
    try {
      const cached = await redis.get(key);
      if (!cached) return null;
      
      const expiresAt = new Date(cached.expiresAt);
      if (expiresAt < new Date()) {
        await redis.del(key);
        return null;
      }
      
      return cached.response;
    } catch (error) {
      console.error('Failed to get cached chat response:', error);
      return null;
    }
  }

  // Product data caching
  static async cacheProductData(shop: string, productId: string, data: any, ttlHours: number = 1) {
    const key = `product:${shop}:${productId}`;
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
    
    try {
      await redis.set(key, {
        data,
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Failed to cache product data:', error);
      return false;
    }
  }

  static async getCachedProductData(shop: string, productId: string) {
    const key = `product:${shop}:${productId}`;
    
    try {
      const cached = await redis.get(key);
      if (!cached) return null;
      
      const expiresAt = new Date(cached.expiresAt);
      if (expiresAt < new Date()) {
        await redis.del(key);
        return null;
      }
      
      return cached.data;
    } catch (error) {
      console.error('Failed to get cached product data:', error);
      return null;
    }
  }

  // Job queue management
  static async addToJobQueue(queueName: string, jobData: any) {
    const key = `queue:${queueName}`;
    
    try {
      await redis.lpush(key, {
        id: Date.now().toString(),
        data: jobData,
        createdAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Failed to add job to queue:', error);
      return false;
    }
  }

  static async getNextJob(queueName: string) {
    const key = `queue:${queueName}`;
    
    try {
      const job = await redis.rpop(key);
      return job;
    } catch (error) {
      console.error('Failed to get next job:', error);
      return null;
    }
  }

  // Rate limiting
  static async checkRateLimit(key: string, limit: number, windowSeconds: number = 60) {
    const now = Date.now();
    const windowStart = now - (windowSeconds * 1000);
    
    try {
      // Get current requests in window
      const requests = await redis.zrangebyscore(key, windowStart, now);
      
      if (requests.length >= limit) {
        return false; // Rate limited
      }
      
      // Add current request
      await redis.zadd(key, now, now.toString());
      await redis.expire(key, windowSeconds);
      
      return true; // Allowed
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return true; // Allow on error
    }
  }

  // Metrics tracking
  static async incrementMetric(shop: string, metric: string, value: number = 1) {
    const key = `metrics:${shop}:${metric}:${new Date().toISOString().split('T')[0]}`;
    
    try {
      await redis.incrby(key, value);
      await redis.expire(key, 86400); // 24 hours
      return true;
    } catch (error) {
      console.error('Failed to increment metric:', error);
      return false;
    }
  }

  static async getMetric(shop: string, metric: string, date?: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const key = `metrics:${shop}:${metric}:${targetDate}`;
    
    try {
      const value = await redis.get(key);
      return value || 0;
    } catch (error) {
      console.error('Failed to get metric:', error);
      return 0;
    }
  }

  // Health check
  static async healthCheck() {
    try {
      await redis.set('health:check', 'ok');
      const result = await redis.get('health:check');
      await redis.del('health:check');
      return result === 'ok';
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }
}

export default redis;
