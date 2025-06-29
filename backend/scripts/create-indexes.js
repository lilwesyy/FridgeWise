const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const logger = require('../src/utils/logger');

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/fridgewise_dev?authSource=admin');
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn.connection.db;
  } catch (error) {
    logger.error('Database connection error:', error);
    process.exit(1);
  }
};

// Create performance indexes
const createPerformanceIndexes = async (db) => {
  logger.info('🔍 Creating performance indexes...');

  try {
    // Recipes collection indexes
    await db.collection('recipes').createIndex(
      { "ingredients.ingredientId": 1 },
      { background: true, name: "recipes_ingredients_idx" }
    );
    logger.info('✅ Created recipes ingredients index');

    await db.collection('recipes').createIndex(
      { "prepTime": 1, "difficulty.level": 1, "cuisine": 1 },
      { background: true, name: "recipes_filters_idx" }
    );
    logger.info('✅ Created recipes filters index');

    await db.collection('recipes').createIndex(
      { "tags": 1, "rating.average": -1 },
      { background: true, name: "recipes_tags_rating_idx" }
    );
    logger.info('✅ Created recipes tags and rating index');

    await db.collection('recipes').createIndex(
      { "isVerified": 1, "source": 1, "createdAt": -1 },
      { background: true, name: "recipes_status_idx" }
    );
    logger.info('✅ Created recipes status index');

    // Text search index for recipes
    await db.collection('recipes').createIndex(
      { "title": "text", "description": "text", "tags": "text" },
      { background: true, name: "recipes_text_search_idx" }
    );
    logger.info('✅ Created recipes text search index');

    // Ingredients collection indexes
    await db.collection('ingredients').createIndex(
      { "name": "text", "commonNames": "text" },
      { background: true, name: "ingredients_text_search_idx" }
    );
    logger.info('✅ Created ingredients text search index');

    await db.collection('ingredients').createIndex(
      { "category": 1, "name": 1 },
      { background: true, name: "ingredients_category_idx" }
    );
    logger.info('✅ Created ingredients category index');

    await db.collection('ingredients').createIndex(
      { "nutritionPer100g.calories": 1 },
      { background: true, name: "ingredients_nutrition_idx" }
    );
    logger.info('✅ Created ingredients nutrition index');

    // Users collection indexes
    await db.collection('users').createIndex(
      { "email": 1 },
      { background: true, unique: true, name: "users_email_idx" }
    );
    logger.info('✅ Created users email index');

    await db.collection('users').createIndex(
      { "subscription.tier": 1, "subscription.validUntil": 1 },
      { background: true, name: "users_subscription_idx" }
    );
    logger.info('✅ Created users subscription index');

    await db.collection('users').createIndex(
      { "usage.resetDate": 1 },
      { background: true, name: "users_usage_reset_idx" }
    );
    logger.info('✅ Created users usage reset index');

    // UserSessions collection indexes
    await db.collection('usersessions').createIndex(
      { "userId": 1, "createdAt": -1 },
      { background: true, name: "sessions_user_date_idx" }
    );
    logger.info('✅ Created user sessions index');

    await db.collection('usersessions').createIndex(
      { "createdAt": 1 },
      { background: true, expireAfterSeconds: 86400 * 7, name: "sessions_ttl_idx" } // 7 days TTL
    );
    logger.info('✅ Created user sessions TTL index');

    await db.collection('usersessions').createIndex(
      { "aiRecipe.id": 1 },
      { background: true, name: "sessions_ai_recipe_idx" }
    );
    logger.info('✅ Created AI recipe sessions index');

    logger.info('🎉 All performance indexes created successfully!');
  } catch (error) {
    logger.error('❌ Error creating indexes:', error);
    throw error;
  }
};

// Create compound indexes for complex queries
const createCompoundIndexes = async (db) => {
  logger.info('🔗 Creating compound indexes...');

  try {
    // Recipe matching optimization
    await db.collection('recipes').createIndex(
      { 
        "ingredients.ingredientId": 1, 
        "difficulty.level": 1, 
        "prepTime": 1,
        "rating.average": -1
      },
      { background: true, name: "recipes_matching_compound_idx" }
    );
    logger.info('✅ Created recipe matching compound index');

    // User recipe history
    await db.collection('usersessions').createIndex(
      { 
        "userId": 1, 
        "suggestedRecipes": 1, 
        "createdAt": -1 
      },
      { background: true, name: "sessions_user_recipes_idx" }
    );
    logger.info('✅ Created user recipe history compound index');

    // Nutrition filtering
    await db.collection('recipes').createIndex(
      { 
        "nutrition.perServing.calories": 1,
        "nutrition.perServing.protein": 1,
        "difficulty.level": 1
      },
      { background: true, name: "recipes_nutrition_compound_idx" }
    );
    logger.info('✅ Created nutrition filtering compound index');

    logger.info('🎉 All compound indexes created successfully!');
  } catch (error) {
    logger.error('❌ Error creating compound indexes:', error);
    throw error;
  }
};

// List all indexes for verification
const listAllIndexes = async (db) => {
  logger.info('📋 Listing all indexes...');

  try {
    const collections = ['recipes', 'ingredients', 'users', 'usersessions'];
    
    for (const collectionName of collections) {
      const indexes = await db.collection(collectionName).indexes();
      logger.info(`\n📁 ${collectionName.toUpperCase()} COLLECTION:`);
      
      indexes.forEach(index => {
        const indexInfo = {
          name: index.name,
          keys: Object.keys(index.key).join(', '),
          unique: index.unique || false,
          background: index.background || false,
          sparse: index.sparse || false
        };
        
        if (index.expireAfterSeconds) {
          indexInfo.ttl = `${index.expireAfterSeconds}s`;
        }
        
        logger.info(`   • ${indexInfo.name}: {${indexInfo.keys}} ${JSON.stringify(indexInfo)}`);
      });
    }
  } catch (error) {
    logger.error('❌ Error listing indexes:', error);
  }
};

// Get collection statistics
const getCollectionStats = async (db) => {
  logger.info('📊 Getting collection statistics...');

  try {
    const collections = ['recipes', 'ingredients', 'users', 'usersessions'];
    
    for (const collectionName of collections) {
      const stats = await db.collection(collectionName).stats();
      
      logger.info(`\n📈 ${collectionName.toUpperCase()} STATS:`);
      logger.info(`   • Documents: ${stats.count}`);
      logger.info(`   • Average Object Size: ${Math.round(stats.avgObjSize || 0)} bytes`);
      logger.info(`   • Data Size: ${Math.round((stats.size || 0) / 1024)} KB`);
      logger.info(`   • Index Size: ${Math.round((stats.totalIndexSize || 0) / 1024)} KB`);
      logger.info(`   • Indexes: ${stats.nindexes}`);
    }
  } catch (error) {
    logger.error('❌ Error getting collection stats:', error);
  }
};

// Main execution function
const optimizeDatabase = async () => {
  try {
    logger.info('🚀 Starting database optimization...');
    
    const db = await connectDB();
    
    // Create performance indexes
    await createPerformanceIndexes(db);
    
    // Create compound indexes
    await createCompoundIndexes(db);
    
    // List all indexes for verification
    await listAllIndexes(db);
    
    // Get collection statistics
    await getCollectionStats(db);
    
    logger.info('\n🎉 Database optimization completed successfully!');
    
    // Performance recommendations
    logger.info('\n💡 PERFORMANCE RECOMMENDATIONS:');
    logger.info('   • Monitor query performance with explain()');
    logger.info('   • Consider adding indexes for frequently queried fields');
    logger.info('   • Use projection to limit returned fields');
    logger.info('   • Implement proper pagination for large result sets');
    logger.info('   • Monitor index usage with db.collection.getIndexes()');
    
    process.exit(0);
  } catch (error) {
    logger.error('❌ Database optimization failed:', error);
    process.exit(1);
  }
};

// Run optimization if called directly
if (require.main === module) {
  optimizeDatabase();
}

module.exports = {
  optimizeDatabase,
  createPerformanceIndexes,
  createCompoundIndexes,
  listAllIndexes,
  getCollectionStats
};
