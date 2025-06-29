const Redis = require('redis');
const logger = require('../utils/logger');

let redisClient = null;

const createRedisClient = async () => {
  try {
const client = Redis.createClient({
  socket: {
    host: 'redis',
    port: 6379,
    family: 4
  },
  protocol: 3,
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });

    client.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    client.on('connect', () => {
      logger.info('Redis client connected');
    });

    client.on('ready', () => {
      logger.info('Redis client ready');
    });

    client.on('end', () => {
      logger.info('Redis client disconnected');
    });

    await client.connect();
    return client;
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    return null;
  }
};

const getRedisClient = async () => {
  if (!redisClient) {
    redisClient = await createRedisClient();
  }
  return redisClient;
};

// Cache configuration with TTL settings
const cacheConfig = {
  // High-value, stable data
  nutrition: { ttl: 86400, prefix: 'nutrition:' }, // 24 hours
  ingredients: { ttl: 43200, prefix: 'ingredients:' }, // 12 hours
  
  // Dynamic but cacheable
  recipes: { ttl: 3600, prefix: 'recipes:' }, // 1 hour
  aiResults: { ttl: 7200, prefix: 'ai:' }, // 2 hours
  
  // Static content
  images: { ttl: 604800, prefix: 'images:' }, // 7 days
  staticData: { ttl: 2592000, prefix: 'static:' }, // 30 days
  
  // User sessions
  userSessions: { ttl: 7200, prefix: 'session:' }, // 2 hours
  popularCombos: { ttl: 604800, prefix: 'popular:' } // 7 days
};

// Helper functions for cache operations
const cacheHelpers = {
  // Generate cache key
  generateKey: (prefix, ...parts) => {
    return `${prefix}${parts.join(':')}`;
  },

  // Set cache with TTL
  setCache: async (key, data, ttl = 3600) => {
    try {
      const client = await getRedisClient();
      if (!client) return false;
      
      const serializedData = JSON.stringify(data);
      await client.setEx(key, ttl, serializedData);
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  },

  // Get cache
  getCache: async (key) => {
    try {
      const client = await getRedisClient();
      if (!client) return null;
      
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  },

  // Delete cache
  deleteCache: async (key) => {
    try {
      const client = await getRedisClient();
      if (!client) return false;
      
      await client.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  },

  // Delete cache by pattern
  deleteCachePattern: async (pattern) => {
    try {
      const client = await getRedisClient();
      if (!client) return false;
      
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
      return true;
    } catch (error) {
      logger.error('Cache pattern delete error:', error);
      return false;
    }
  },

  // Check if cache exists
  cacheExists: async (key) => {
    try {
      const client = await getRedisClient();
      if (!client) return false;
      
      const exists = await client.exists(key);
      return exists === 1;
    } catch (error) {
      logger.error('Cache exists check error:', error);
      return false;
    }
  },

  // Get cache TTL
  getCacheTTL: async (key) => {
    try {
      const client = await getRedisClient();
      if (!client) return -1;
      
      return await client.ttl(key);
    } catch (error) {
      logger.error('Cache TTL check error:', error);
      return -1;
    }
  }
};

// Graceful shutdown
const closeRedisConnection = async () => {
  if (redisClient) {
    try {
      await redisClient.quit();
      logger.info('Redis connection closed gracefully');
    } catch (error) {
      logger.error('Error closing Redis connection:', error);
    }
  }
};

module.exports = {
  getRedisClient,
  cacheConfig,
  cacheHelpers,
  closeRedisConnection
};
