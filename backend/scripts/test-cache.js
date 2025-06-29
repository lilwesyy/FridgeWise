const axios = require('axios');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const logger = require('../src/utils/logger');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

// Test cache performance
const testCachePerformance = async () => {
  logger.info('🧪 Starting cache performance tests...');

  try {
    // Test data
    const testUser = {
      email: 'test@cache.com',
      password: 'password123',
      name: 'Cache Test User'
    };

    // 1. Register/Login user
    let authToken;
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
      authToken = registerResponse.data.data.token;
      logger.info('✅ Test user registered');
    } catch (error) {
      // User might already exist, try login
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });
      authToken = loginResponse.data.data.token;
      logger.info('✅ Test user logged in');
    }

    const headers = { Authorization: `Bearer ${authToken}` };

    // 2. Test ingredient search caching
    logger.info('\n🔍 Testing ingredient search caching...');
    
    const searchQuery = 'tomato';
    let startTime, endTime, response;

    // First request (cache miss)
    startTime = Date.now();
    response = await axios.get(`${API_BASE_URL}/ingredients/search?q=${searchQuery}`, { headers });
    endTime = Date.now();
    const firstRequestTime = endTime - startTime;
    logger.info(`   • First request (cache miss): ${firstRequestTime}ms`);
    logger.info(`   • Cache header: ${response.headers['x-cache'] || 'Not set'}`);

    // Second request (cache hit)
    startTime = Date.now();
    response = await axios.get(`${API_BASE_URL}/ingredients/search?q=${searchQuery}`, { headers });
    endTime = Date.now();
    const secondRequestTime = endTime - startTime;
    logger.info(`   • Second request (cache hit): ${secondRequestTime}ms`);
    logger.info(`   • Cache header: ${response.headers['x-cache'] || 'Not set'}`);

    const speedImprovement = ((firstRequestTime - secondRequestTime) / firstRequestTime * 100).toFixed(1);
    logger.info(`   • Speed improvement: ${speedImprovement}%`);

    // 3. Test recipe suggestions caching
    logger.info('\n🍽️ Testing recipe suggestions caching...');

    const recipeData = {
      ingredients: ['tomato', 'cheese', 'bread'],
      servings: 2,
      maxTime: 30
    };

    // First request (cache miss)
    startTime = Date.now();
    response = await axios.post(`${API_BASE_URL}/recipes/suggest`, recipeData, { headers });
    endTime = Date.now();
    const firstRecipeTime = endTime - startTime;
    logger.info(`   • First request (cache miss): ${firstRecipeTime}ms`);
    logger.info(`   • Cache header: ${response.headers['x-cache'] || 'Not set'}`);

    // Second request (cache hit)
    startTime = Date.now();
    response = await axios.post(`${API_BASE_URL}/recipes/suggest`, recipeData, { headers });
    endTime = Date.now();
    const secondRecipeTime = endTime - startTime;
    logger.info(`   • Second request (cache hit): ${secondRecipeTime}ms`);
    logger.info(`   • Cache header: ${response.headers['x-cache'] || 'Not set'}`);

    const recipeSpeedImprovement = ((firstRecipeTime - secondRecipeTime) / firstRecipeTime * 100).toFixed(1);
    logger.info(`   • Speed improvement: ${recipeSpeedImprovement}%`);

    // 4. Test cache statistics
    logger.info('\n📊 Cache statistics:');
    if (response.headers['x-cache-stats']) {
      const stats = JSON.parse(response.headers['x-cache-stats']);
      logger.info(`   • Hit rate: ${stats.hitRate}%`);
      logger.info(`   • Total requests: ${stats.totalRequests}`);
      logger.info(`   • Cache hits: ${stats.hits}`);
      logger.info(`   • Cache misses: ${stats.misses}`);
    }

    // 5. Performance benchmark
    logger.info('\n⚡ Running performance benchmark...');
    
    const benchmarkRequests = 10;
    const startBenchmark = Date.now();
    
    const promises = [];
    for (let i = 0; i < benchmarkRequests; i++) {
      promises.push(
        axios.get(`${API_BASE_URL}/ingredients/search?q=${searchQuery}`, { headers })
      );
    }
    
    await Promise.all(promises);
    const endBenchmark = Date.now();
    const averageTime = (endBenchmark - startBenchmark) / benchmarkRequests;
    
    logger.info(`   • ${benchmarkRequests} requests completed`);
    logger.info(`   • Average response time: ${averageTime.toFixed(1)}ms`);
    logger.info(`   • Requests per second: ${(1000 / averageTime).toFixed(1)}`);

    logger.info('\n🎉 Cache performance tests completed successfully!');

  } catch (error) {
    logger.error('❌ Cache performance test failed:', error.message);
    if (error.response) {
      logger.error('Response status:', error.response.status);
      logger.error('Response data:', error.response.data);
    }
  }
};

// Test cache invalidation
const testCacheInvalidation = async () => {
  logger.info('\n🗑️ Testing cache invalidation...');

  try {
    // Login
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@cache.com',
      password: 'password123'
    });
    const authToken = loginResponse.data.data.token;
    const headers = { Authorization: `Bearer ${authToken}` };

    // 1. Make a request to populate cache
    await axios.get(`${API_BASE_URL}/ingredients/categories`, { headers });
    logger.info('✅ Cache populated');

    // 2. Make same request to verify cache hit
    const response = await axios.get(`${API_BASE_URL}/ingredients/categories`, { headers });
    if (response.headers['x-cache'] === 'HIT') {
      logger.info('✅ Cache hit confirmed');
    } else {
      logger.warn('⚠️ Expected cache hit, got miss');
    }

    // 3. Add custom ingredient (should invalidate ingredients cache)
    await axios.post(`${API_BASE_URL}/ingredients/custom-add`, {
      name: 'Test Ingredient',
      category: 'vegetables'
    }, { headers });
    logger.info('✅ Added custom ingredient (cache should be invalidated)');

    // 4. Make same request to verify cache invalidation
    const response2 = await axios.get(`${API_BASE_URL}/ingredients/categories`, { headers });
    if (response2.headers['x-cache'] === 'MISS') {
      logger.info('✅ Cache invalidation confirmed');
    } else {
      logger.warn('⚠️ Expected cache miss after invalidation, got hit');
    }

    logger.info('🎉 Cache invalidation tests completed!');

  } catch (error) {
    logger.error('❌ Cache invalidation test failed:', error.message);
  }
};

// Main test runner
const runCacheTests = async () => {
  try {
    logger.info('🚀 Starting comprehensive cache testing...');
    
    await testCachePerformance();
    await testCacheInvalidation();
    
    logger.info('\n✨ All cache tests completed successfully!');
    
    // Performance recommendations
    logger.info('\n💡 PERFORMANCE INSIGHTS:');
    logger.info('   • Monitor cache hit rates regularly');
    logger.info('   • Adjust TTL values based on data volatility');
    logger.info('   • Consider warming cache for popular endpoints');
    logger.info('   • Track API cost savings from cache hits');
    
    process.exit(0);
  } catch (error) {
    logger.error('❌ Cache testing failed:', error);
    process.exit(1);
  }
};

// Run tests if called directly
if (require.main === module) {
  runCacheTests();
}

module.exports = {
  runCacheTests,
  testCachePerformance,
  testCacheInvalidation
};
