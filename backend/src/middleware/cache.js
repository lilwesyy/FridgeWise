const { cacheConfig, cacheHelpers } = require('../config/redis');
const logger = require('../utils/logger');

// Smart caching middleware with intelligent key generation
const cacheMiddleware = (cacheType = 'recipes', options = {}) => {
  return async (req, res, next) => {
    try {
      const config = cacheConfig[cacheType] || cacheConfig.recipes;
      const ttl = options.ttl || config.ttl;
      const prefix = options.prefix || config.prefix;
      
      // Generate intelligent cache key based on request
      const cacheKey = generateCacheKey(prefix, req, options);
      
      // Try to get from cache
      const cachedData = await cacheHelpers.getCache(cacheKey);
      
      if (cachedData) {
        logger.info(`Cache HIT: ${cacheKey}`);
        // Add cache metadata to response
        res.set('X-Cache', 'HIT');
        res.set('X-Cache-Key', cacheKey);
        return res.json(cachedData);
      }
      
      logger.info(`Cache MISS: ${cacheKey}`);
      res.set('X-Cache', 'MISS');
      res.set('X-Cache-Key', cacheKey);
      
      // Store original res.json method
      const originalJson = res.json;
      
      // Override res.json to cache the response
      res.json = function(data) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // Don't await - cache in background
          cacheHelpers.setCache(cacheKey, data, ttl).catch(error => {
            logger.error('Background caching failed:', error);
          });
        }
        
        // Call original json method
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      // Continue without caching on error
      next();
    }
  };
};

// Generate intelligent cache keys based on request context
const generateCacheKey = (prefix, req, options = {}) => {
  const parts = [prefix];
  
  // Add route-specific parts
  const route = req.route?.path || req.path;
  parts.push(route.replace(/[/:]/g, '_'));
  
  // Add user context for personalized content
  if (req.user?.id && !options.ignoreUser) {
    parts.push(`user_${req.user.id}`);
  }
  
  // Add query parameters (sorted for consistency)
  const queryKeys = Object.keys(req.query || {}).sort();
  if (queryKeys.length > 0) {
    const queryString = queryKeys
      .map(key => `${key}_${req.query[key]}`)
      .join('_');
    parts.push(`query_${queryString}`);
  }
  
  // Add body hash for POST requests
  if (req.method === 'POST' && req.body && Object.keys(req.body).length > 0) {
    const bodyHash = generateBodyHash(req.body);
    parts.push(`body_${bodyHash}`);
  }
  
  // Add custom cache key parts
  if (options.customParts) {
    parts.push(...options.customParts);
  }
  
  return parts.join(':');
};

// Generate consistent hash for request body
const generateBodyHash = (body) => {
  try {
    // Sort object keys for consistent hashing
    const sortedBody = sortObjectKeys(body);
    const bodyString = JSON.stringify(sortedBody);
    
    // Simple hash function (for cache keys, not security)
    let hash = 0;
    for (let i = 0; i < bodyString.length; i++) {
      const char = bodyString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  } catch (error) {
    logger.error('Body hash generation error:', error);
    return 'unknown';
  }
};

// Recursively sort object keys for consistent serialization
const sortObjectKeys = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  
  const sorted = {};
  Object.keys(obj).sort().forEach(key => {
    sorted[key] = sortObjectKeys(obj[key]);
  });
  
  return sorted;
};

// Cache invalidation middleware for data updates
const cacheInvalidationMiddleware = (patterns = []) => {
  return async (req, res, next) => {
    // Store original response methods
    const originalJson = res.json;
    const originalSend = res.send;
    
    const invalidateCache = async () => {
      try {
        for (const pattern of patterns) {
          await cacheHelpers.deleteCachePattern(pattern);
          logger.info(`Invalidated cache pattern: ${pattern}`);
        }
      } catch (error) {
        logger.error('Cache invalidation error:', error);
      }
    };
    
    // Override response methods to invalidate cache after successful operations
    res.json = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Invalidate cache in background
        invalidateCache().catch(error => {
          logger.error('Background cache invalidation failed:', error);
        });
      }
      return originalJson.call(this, data);
    };
    
    res.send = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Invalidate cache in background
        invalidateCache().catch(error => {
          logger.error('Background cache invalidation failed:', error);
        });
      }
      return originalSend.call(this, data);
    };
    
    next();
  };
};

// Specialized middleware for different content types
const recipesCacheMiddleware = cacheMiddleware('recipes', {
  customParts: ['recipes']
});

const ingredientsCacheMiddleware = cacheMiddleware('ingredients', {
  customParts: ['ingredients']
});

const nutritionCacheMiddleware = cacheMiddleware('nutrition', {
  customParts: ['nutrition']
});

const aiResultsCacheMiddleware = cacheMiddleware('aiResults', {
  customParts: ['ai']
});

const userSessionsCacheMiddleware = cacheMiddleware('userSessions', {
  customParts: ['sessions']
});

// Batch caching for multiple requests
const batchCacheMiddleware = (batchSize = 10, waitTime = 2000) => {
  const requestQueue = new Map();
  
  return async (req, res, next) => {
    const cacheKey = generateCacheKey('batch:', req);
    
    // Check if we already have this request in queue
    if (requestQueue.has(cacheKey)) {
      const existingRequest = requestQueue.get(cacheKey);
      // Wait for the existing request to complete
      try {
        const result = await existingRequest.promise;
        return res.json(result);
      } catch (error) {
        // If existing request failed, continue with normal flow
      }
    }
    
    // Create a promise for this request
    let resolvePromise, rejectPromise;
    const promise = new Promise((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    });
    
    requestQueue.set(cacheKey, {
      promise,
      resolve: resolvePromise,
      reject: rejectPromise,
      req,
      res,
      timestamp: Date.now()
    });
    
    // Store original res.json
    const originalJson = res.json;
    res.json = function(data) {
      // Resolve the promise with the data
      resolvePromise(data);
      // Remove from queue
      requestQueue.delete(cacheKey);
      return originalJson.call(this, data);
    };
    
    // Set timeout to process queue
    setTimeout(() => {
      processBatchQueue(requestQueue, batchSize);
    }, waitTime);
    
    next();
  };
};

// Process batch queue when timeout or size limit reached
const processBatchQueue = async (requestQueue, batchSize) => {
  const requests = Array.from(requestQueue.values());
  
  if (requests.length === 0) return;
  
  // Process in batches
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    
    try {
      // Process batch requests
      // This would contain the actual batch processing logic
      // For now, we'll just continue with normal processing
      batch.forEach(({ req, res, resolve, reject }) => {
        // The normal middleware chain will handle the request
      });
    } catch (error) {
      // Reject all promises in this batch
      batch.forEach(({ reject }) => {
        reject(error);
      });
    }
  }
};

// Cache warming utility
const warmCache = async (routes = []) => {
  logger.info('Starting cache warming...');
  
  for (const route of routes) {
    try {
      // Pre-populate cache with common requests
      // This would make actual HTTP requests to warm the cache
      logger.info(`Warming cache for route: ${route}`);
    } catch (error) {
      logger.error(`Cache warming failed for route ${route}:`, error);
    }
  }
  
  logger.info('Cache warming completed');
};

// Cache statistics middleware
const cacheStatsMiddleware = () => {
  const stats = {
    hits: 0,
    misses: 0,
    errors: 0,
    totalRequests: 0
  };
  
  return (req, res, next) => {
    stats.totalRequests++;
    
    // Intercept cache headers
    const originalSet = res.set;
    res.set = function(field, value) {
      if (field === 'X-Cache') {
        if (value === 'HIT') {
          stats.hits++;
        } else if (value === 'MISS') {
          stats.misses++;
        }
      }
      return originalSet.call(this, field, value);
    };
    
    // Add stats to response headers
    res.set('X-Cache-Stats', JSON.stringify({
      hitRate: stats.totalRequests > 0 ? (stats.hits / stats.totalRequests * 100).toFixed(2) : 0,
      totalRequests: stats.totalRequests,
      hits: stats.hits,
      misses: stats.misses
    }));
    
    next();
  };
};

module.exports = {
  cacheMiddleware,
  cacheInvalidationMiddleware,
  recipesCacheMiddleware,
  ingredientsCacheMiddleware,
  nutritionCacheMiddleware,
  aiResultsCacheMiddleware,
  userSessionsCacheMiddleware,
  batchCacheMiddleware,
  warmCache,
  cacheStatsMiddleware,
  generateCacheKey
};
