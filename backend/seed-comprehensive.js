require('dotenv').config({ path: __dirname + '/../.env' });
const path = require('path');
const mongoose = require('mongoose');
const Ingredient = require('./src/models/Ingredient');

// Importa ingredienti Spoonacular se presenti
let spoonacularIngredients = [];
try {
  const spoonPath = path.resolve(__dirname, '../spoonacular-ingredients.json');
  spoonacularIngredients = require(spoonPath);
  console.log(`🛒 Caricati ${spoonacularIngredients.length} ingredienti da spoonacular-ingredients.json`);
} catch (e) {
  console.log('ℹ️  spoonacular-ingredients.json non trovato, uso solo sampleIngredients locali');
}

const sampleIngredients = [
  ...spoonacularIngredients,
  // Vegetables
  { name: 'tomato', category: 'vegetables', nutritionPer100g: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 }, commonNames: ['tomato', 'tomatoes'], shelfLife: 7, storageType: 'room-temperature' },
  { name: 'carrot', category: 'vegetables', nutritionPer100g: { calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, fiber: 2.8 }, commonNames: ['carrot', 'carrots'], shelfLife: 14, storageType: 'fridge' },
  { name: 'onion', category: 'vegetables', nutritionPer100g: { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 }, commonNames: ['onion', 'onions'], shelfLife: 30, storageType: 'pantry' },
  { name: 'garlic', category: 'vegetables', nutritionPer100g: { calories: 149, protein: 6.4, carbs: 33, fat: 0.5, fiber: 2.1 }, commonNames: ['garlic', 'garlic clove'], shelfLife: 30, storageType: 'pantry' },
  { name: 'bell pepper', category: 'vegetables', nutritionPer100g: { calories: 31, protein: 1, carbs: 7, fat: 0.3, fiber: 2.5 }, commonNames: ['bell pepper', 'pepper', 'capsicum'], shelfLife: 7, storageType: 'fridge' },
  { name: 'broccoli', category: 'vegetables', nutritionPer100g: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6 }, commonNames: ['broccoli'], shelfLife: 5, storageType: 'fridge' },
  { name: 'spinach', category: 'vegetables', nutritionPer100g: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 }, commonNames: ['spinach', 'baby spinach'], shelfLife: 5, storageType: 'fridge' },
  { name: 'cucumber', category: 'vegetables', nutritionPer100g: { calories: 16, protein: 0.7, carbs: 4, fat: 0.1, fiber: 0.5 }, commonNames: ['cucumber', 'cucumbers'], shelfLife: 7, storageType: 'fridge' },
  { name: 'lettuce', category: 'vegetables', nutritionPer100g: { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3 }, commonNames: ['lettuce', 'iceberg lettuce'], shelfLife: 7, storageType: 'fridge' },
  { name: 'potato', category: 'vegetables', nutritionPer100g: { calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2 }, commonNames: ['potato', 'potatoes'], shelfLife: 30, storageType: 'pantry' },

  // Fruits
  { name: 'apple', category: 'fruits', nutritionPer100g: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4 }, commonNames: ['apple', 'apples'], shelfLife: 14, storageType: 'fridge' },
  { name: 'banana', category: 'fruits', nutritionPer100g: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 }, commonNames: ['banana', 'bananas'], shelfLife: 5, storageType: 'room-temperature' },
  { name: 'orange', category: 'fruits', nutritionPer100g: { calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4 }, commonNames: ['orange', 'oranges'], shelfLife: 10, storageType: 'room-temperature' },
  { name: 'lemon', category: 'fruits', nutritionPer100g: { calories: 29, protein: 1.1, carbs: 9, fat: 0.3, fiber: 2.8 }, commonNames: ['lemon', 'lemons'], shelfLife: 14, storageType: 'fridge' },
  { name: 'strawberry', category: 'fruits', nutritionPer100g: { calories: 32, protein: 0.7, carbs: 8, fat: 0.3, fiber: 2 }, commonNames: ['strawberry', 'strawberries'], shelfLife: 3, storageType: 'fridge' },

  // Meat & Poultry
  { name: 'chicken breast', category: 'poultry', nutritionPer100g: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 }, commonNames: ['chicken breast', 'chicken', 'chicken fillet'], shelfLife: 2, storageType: 'fridge' },
  { name: 'ground beef', category: 'meat', nutritionPer100g: { calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0 }, commonNames: ['ground beef', 'minced beef', 'beef mince'], shelfLife: 2, storageType: 'fridge' },
  { name: 'pork chop', category: 'meat', nutritionPer100g: { calories: 231, protein: 25, carbs: 0, fat: 14, fiber: 0 }, commonNames: ['pork chop', 'pork'], shelfLife: 3, storageType: 'fridge' },

  // Seafood
  { name: 'salmon', category: 'seafood', nutritionPer100g: { calories: 208, protein: 25, carbs: 0, fat: 12, fiber: 0 }, commonNames: ['salmon', 'salmon fillet'], shelfLife: 2, storageType: 'fridge' },
  { name: 'shrimp', category: 'seafood', nutritionPer100g: { calories: 106, protein: 20, carbs: 0.9, fat: 1.7, fiber: 0 }, commonNames: ['shrimp', 'prawns', 'shrimps'], shelfLife: 2, storageType: 'fridge' },

  // Dairy
  { name: 'milk', category: 'dairy', nutritionPer100g: { calories: 42, protein: 3.4, carbs: 5, fat: 1, fiber: 0 }, commonNames: ['milk', 'whole milk'], shelfLife: 7, storageType: 'fridge' },
  { name: 'cheddar cheese', category: 'dairy', nutritionPer100g: { calories: 403, protein: 25, carbs: 1.3, fat: 33, fiber: 0 }, commonNames: ['cheddar', 'cheddar cheese', 'cheese'], shelfLife: 21, storageType: 'fridge' },
  { name: 'eggs', category: 'dairy', nutritionPer100g: { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 }, commonNames: ['eggs', 'egg', 'chicken eggs'], shelfLife: 21, storageType: 'fridge' },
  { name: 'yogurt', category: 'dairy', nutritionPer100g: { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0 }, commonNames: ['yogurt', 'plain yogurt'], shelfLife: 14, storageType: 'fridge' },

  // Grains
  { name: 'rice', category: 'grains', nutritionPer100g: { calories: 365, protein: 7.1, carbs: 80, fat: 0.7, fiber: 1.3 }, commonNames: ['rice', 'white rice', 'long grain rice'], shelfLife: 365, storageType: 'pantry' },
  { name: 'pasta', category: 'grains', nutritionPer100g: { calories: 371, protein: 13, carbs: 75, fat: 1.5, fiber: 3.2 }, commonNames: ['pasta', 'spaghetti', 'noodles'], shelfLife: 365, storageType: 'pantry' },
  { name: 'bread', category: 'grains', nutritionPer100g: { calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7 }, commonNames: ['bread', 'white bread', 'loaf'], shelfLife: 7, storageType: 'pantry' },
  { name: 'oats', category: 'grains', nutritionPer100g: { calories: 389, protein: 17, carbs: 66, fat: 7, fiber: 11 }, commonNames: ['oats', 'rolled oats', 'oatmeal'], shelfLife: 365, storageType: 'pantry' },

  // Legumes
  { name: 'black beans', category: 'legumes', nutritionPer100g: { calories: 339, protein: 21, carbs: 63, fat: 0.9, fiber: 15 }, commonNames: ['black beans', 'beans'], shelfLife: 730, storageType: 'pantry' },
  { name: 'chickpeas', category: 'legumes', nutritionPer100g: { calories: 364, protein: 19, carbs: 61, fat: 6, fiber: 17 }, commonNames: ['chickpeas', 'garbanzo beans'], shelfLife: 730, storageType: 'pantry' },
  { name: 'lentils', category: 'legumes', nutritionPer100g: { calories: 353, protein: 25, carbs: 63, fat: 1.1, fiber: 11 }, commonNames: ['lentils', 'red lentils'], shelfLife: 730, storageType: 'pantry' },

  // Nuts & Seeds
  { name: 'almonds', category: 'nuts-seeds', nutritionPer100g: { calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12 }, commonNames: ['almonds', 'almond'], shelfLife: 365, storageType: 'pantry' },
  { name: 'walnuts', category: 'nuts-seeds', nutritionPer100g: { calories: 654, protein: 15, carbs: 14, fat: 65, fiber: 7 }, commonNames: ['walnuts', 'walnut'], shelfLife: 365, storageType: 'pantry' },

  // Herbs & Spices
  { name: 'basil', category: 'herbs-spices', nutritionPer100g: { calories: 22, protein: 3.2, carbs: 2.6, fat: 0.6, fiber: 1.6 }, commonNames: ['basil', 'fresh basil'], shelfLife: 7, storageType: 'fridge' },
  { name: 'oregano', category: 'herbs-spices', nutritionPer100g: { calories: 265, protein: 9, carbs: 69, fat: 4.3, fiber: 43 }, commonNames: ['oregano', 'dried oregano'], shelfLife: 365, storageType: 'pantry' },
  { name: 'salt', category: 'herbs-spices', nutritionPer100g: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }, commonNames: ['salt', 'table salt'], shelfLife: 9999, storageType: 'pantry' },
  { name: 'black pepper', category: 'herbs-spices', nutritionPer100g: { calories: 251, protein: 10, carbs: 64, fat: 3.3, fiber: 26 }, commonNames: ['black pepper', 'pepper'], shelfLife: 730, storageType: 'pantry' },

  // Oils & Fats
  { name: 'olive oil', category: 'oils-fats', nutritionPer100g: { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 }, commonNames: ['olive oil', 'extra virgin olive oil'], shelfLife: 730, storageType: 'pantry' },
  { name: 'butter', category: 'oils-fats', nutritionPer100g: { calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0 }, commonNames: ['butter', 'unsalted butter'], shelfLife: 30, storageType: 'fridge' },

  // Condiments
  { name: 'soy sauce', category: 'condiments', nutritionPer100g: { calories: 60, protein: 10, carbs: 6, fat: 0, fiber: 0.8 }, commonNames: ['soy sauce', 'light soy sauce'], shelfLife: 730, storageType: 'pantry' },
  { name: 'vinegar', category: 'condiments', nutritionPer100g: { calories: 18, protein: 0, carbs: 0.04, fat: 0, fiber: 0 }, commonNames: ['vinegar', 'white vinegar'], shelfLife: 9999, storageType: 'pantry' },

  // Pantry
  { name: 'flour', category: 'pantry', nutritionPer100g: { calories: 364, protein: 10, carbs: 76, fat: 1, fiber: 2.7 }, commonNames: ['flour', 'all-purpose flour'], shelfLife: 365, storageType: 'pantry' },
  { name: 'sugar', category: 'pantry', nutritionPer100g: { calories: 387, protein: 0, carbs: 100, fat: 0, fiber: 0 }, commonNames: ['sugar', 'white sugar'], shelfLife: 9999, storageType: 'pantry' }
];

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI non definito nel file .env');
  process.exit(1);
}

async function seedDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing ingredients
    await Ingredient.deleteMany({});
    console.log('🧹 Cleared existing ingredients');

    // Insert sample ingredients
    console.log(`📦 Inserting ${sampleIngredients.length} ingredients...`);
    const insertedIngredients = await Ingredient.insertMany(sampleIngredients);
    console.log(`✅ Inserted ${insertedIngredients.length} ingredients`);

    // Create text indexes for search
    try {
      await Ingredient.collection.createIndex({ 
        name: "text", 
        commonNames: "text" 
      });
      console.log('📑 Created text search indexes');
    } catch (error) {
      console.log('ℹ️  Text indexes already exist');
    }

    // Show summary by category
    const categoryCounts = await Ingredient.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n📊 Ingredients by category:');
    categoryCounts.forEach(cat => {
      console.log(`  ${cat._id}: ${cat.count}`);
    });

    const totalCount = await Ingredient.countDocuments();
    console.log(`\n🎉 Total ingredients in database: ${totalCount}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

seedDatabase();
