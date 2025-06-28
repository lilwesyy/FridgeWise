// MongoDB initialization script
// This script will be executed when the MongoDB container starts

// Create database and collections
const db = db.getSiblingDB('fridgewise');

// Create indexes
print('Creating indexes...');

// Users collection indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "subscription.tier": 1 });

// Ingredients collection indexes
db.ingredients.createIndex({ "name": "text", "commonNames": "text" });
db.ingredients.createIndex({ "category": 1 });

// Recipes collection indexes
db.recipes.createIndex({ "ingredients.ingredientId": 1 });
db.recipes.createIndex({ "difficulty.level": 1, "prepTime": 1 });
db.recipes.createIndex({ "cuisine": 1 });
db.recipes.createIndex({ "tags": 1 });
db.recipes.createIndex({ "rating.average": -1 });

// User sessions collection indexes
db.usersessions.createIndex({ "userId": 1, "createdAt": -1 });

print('Database initialization completed successfully!');
