require('dotenv').config();
const mongoose = require('mongoose');
const Ingredient = require('../backend/src/models/Ingredient');
const Recipe = require('../backend/src/models/Recipe');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fridgewise');
    console.log('MongoDB connected for seeding...');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Sample ingredients data
const ingredientsData = [
  // Vegetables
  {
    name: 'tomato',
    category: 'vegetables',
    nutritionPer100g: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6, sodium: 5 },
    commonNames: ['tomato', 'tomatoes', 'cherry tomato', 'roma tomato'],
    shelfLife: 7,
    storageType: 'room-temperature'
  },
  {
    name: 'onion',
    category: 'vegetables', 
    nutritionPer100g: { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7, sugar: 4.2, sodium: 4 },
    commonNames: ['onion', 'onions', 'yellow onion', 'red onion', 'white onion'],
    shelfLife: 30,
    storageType: 'pantry'
  },
  {
    name: 'garlic',
    category: 'vegetables',
    nutritionPer100g: { calories: 149, protein: 6.4, carbs: 33, fat: 0.5, fiber: 2.1, sugar: 1, sodium: 17 },
    commonNames: ['garlic', 'garlic clove', 'garlic cloves'],
    shelfLife: 60,
    storageType: 'pantry'
  },
  {
    name: 'carrot',
    category: 'vegetables',
    nutritionPer100g: { calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, fiber: 2.8, sugar: 4.7, sodium: 69 },
    commonNames: ['carrot', 'carrots', 'baby carrot'],
    shelfLife: 21,
    storageType: 'fridge'
  },
  {
    name: 'bell pepper',
    category: 'vegetables',
    nutritionPer100g: { calories: 31, protein: 1, carbs: 7, fat: 0.3, fiber: 2.5, sugar: 4.2, sodium: 4 },
    commonNames: ['bell pepper', 'red pepper', 'green pepper', 'yellow pepper', 'sweet pepper'],
    shelfLife: 10,
    storageType: 'fridge'
  },

  // Proteins
  {
    name: 'chicken breast',
    category: 'poultry',
    nutritionPer100g: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74 },
    commonNames: ['chicken breast', 'chicken', 'boneless chicken breast'],
    shelfLife: 3,
    storageType: 'fridge'
  },
  {
    name: 'ground beef',
    category: 'meat',
    nutritionPer100g: { calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, sugar: 0, sodium: 75 },
    commonNames: ['ground beef', 'minced beef', 'beef mince'],
    shelfLife: 2,
    storageType: 'fridge'
  },
  {
    name: 'salmon',
    category: 'seafood',
    nutritionPer100g: { calories: 208, protein: 25, carbs: 0, fat: 12, fiber: 0, sugar: 0, sodium: 93 },
    commonNames: ['salmon', 'salmon fillet', 'atlantic salmon'],
    shelfLife: 2,
    storageType: 'fridge'
  },
  {
    name: 'eggs',
    category: 'dairy',
    nutritionPer100g: { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sugar: 1.1, sodium: 124 },
    commonNames: ['eggs', 'egg', 'chicken eggs'],
    shelfLife: 28,
    storageType: 'fridge'
  },

  // Grains & Pantry
  {
    name: 'rice',
    category: 'grains',
    nutritionPer100g: { calories: 365, protein: 7.1, carbs: 80, fat: 0.7, fiber: 1.3, sugar: 0.1, sodium: 5 },
    commonNames: ['rice', 'white rice', 'jasmine rice', 'basmati rice'],
    shelfLife: 365,
    storageType: 'pantry'
  },
  {
    name: 'pasta',
    category: 'grains',
    nutritionPer100g: { calories: 371, protein: 13, carbs: 75, fat: 1.5, fiber: 3.2, sugar: 2.7, sodium: 6 },
    commonNames: ['pasta', 'spaghetti', 'penne', 'fusilli', 'linguine'],
    shelfLife: 730,
    storageType: 'pantry'
  },
  {
    name: 'olive oil',
    category: 'oils-fats',
    nutritionPer100g: { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0, sodium: 2 },
    commonNames: ['olive oil', 'extra virgin olive oil', 'evoo'],
    shelfLife: 730,
    storageType: 'pantry'
  },

  // Herbs & Spices
  {
    name: 'basil',
    category: 'herbs-spices',
    nutritionPer100g: { calories: 22, protein: 3.2, carbs: 2.6, fat: 0.6, fiber: 1.6, sugar: 0.3, sodium: 4 },
    commonNames: ['basil', 'fresh basil', 'sweet basil'],
    shelfLife: 7,
    storageType: 'fridge'
  },
  {
    name: 'black pepper',
    category: 'herbs-spices',
    nutritionPer100g: { calories: 251, protein: 10, carbs: 64, fat: 3.3, fiber: 25, sugar: 0.6, sodium: 20 },
    commonNames: ['black pepper', 'pepper', 'ground black pepper'],
    shelfLife: 1095,
    storageType: 'pantry'
  },
  {
    name: 'salt',
    category: 'herbs-spices',
    nutritionPer100g: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 38758 },
    commonNames: ['salt', 'table salt', 'sea salt'],
    shelfLife: 1825,
    storageType: 'pantry'
  }
];

// Sample recipes data
const recipesData = [
  {
    title: 'Classic Spaghetti Aglio e Olio',
    description: 'A simple yet delicious Italian pasta dish with garlic, olive oil, and herbs.',
    prepTime: 10,
    cookTime: 15,
    servings: 4,
    difficulty: { level: 'easy', reasons: ['quick-prep', 'simple-techniques', 'few-ingredients'] },
    cuisine: 'italian',
    tags: ['dinner', 'vegetarian', 'quick', 'italian'],
    nutrition: {
      perServing: { calories: 420, protein: 12, carbs: 65, fat: 14, fiber: 3, sugar: 3, sodium: 180 }
    },
    instructions: [
      { step: 1, instruction: 'Bring a large pot of salted water to boil. Cook spaghetti according to package directions until al dente.' },
      { step: 2, instruction: 'While pasta cooks, heat olive oil in a large skillet over medium heat.' },
      { step: 3, instruction: 'Add minced garlic and cook for 1-2 minutes until fragrant, being careful not to burn.' },
      { step: 4, instruction: 'Drain pasta, reserving 1/2 cup pasta water. Add pasta to skillet with garlic oil.' },
      { step: 5, instruction: 'Toss pasta with garlic oil, adding pasta water as needed. Season with salt and pepper.' },
      { step: 6, instruction: 'Serve immediately topped with fresh basil and black pepper.' }
    ],
    images: [{
      url: 'https://via.placeholder.com/800x600/FFB6C1/000000?text=Spaghetti+Aglio+e+Olio',
      alt: 'Classic Spaghetti Aglio e Olio',
      isPrimary: true
    }],
    seasonality: ['year-round'],
    cookingMethod: ['boiling', 'sauteing'],
    rating: { average: 4.6, count: 1250 }
  },
  {
    title: 'Grilled Chicken with Roasted Vegetables',
    description: 'Healthy and flavorful grilled chicken breast served with a medley of roasted vegetables.',
    prepTime: 20,
    cookTime: 30,
    servings: 4,
    difficulty: { level: 'medium', reasons: ['timing-critical'] },
    cuisine: 'american',
    tags: ['dinner', 'healthy', 'gluten-free', 'high-protein'],
    nutrition: {
      perServing: { calories: 350, protein: 45, carbs: 18, fat: 12, fiber: 6, sugar: 12, sodium: 320 }
    },
    instructions: [
      { step: 1, instruction: 'Preheat grill to medium-high heat and oven to 425°F (220°C).' },
      { step: 2, instruction: 'Season chicken breasts with salt, pepper, and your favorite herbs.' },
      { step: 3, instruction: 'Cut vegetables into similar-sized pieces and toss with olive oil, salt, and pepper.' },
      { step: 4, instruction: 'Place vegetables on a baking sheet and roast for 25-30 minutes.' },
      { step: 5, instruction: 'Grill chicken for 6-7 minutes per side until internal temperature reaches 165°F (74°C).' },
      { step: 6, instruction: 'Let chicken rest for 5 minutes before slicing. Serve with roasted vegetables.' }
    ],
    images: [{
      url: 'https://via.placeholder.com/800x600/98FB98/000000?text=Grilled+Chicken+Vegetables',
      alt: 'Grilled Chicken with Roasted Vegetables',
      isPrimary: true
    }],
    seasonality: ['spring', 'summer', 'fall'],
    cookingMethod: ['grilling', 'roasting'],
    rating: { average: 4.4, count: 892 }
  },
  {
    title: 'Simple Fried Rice',
    description: 'Quick and easy fried rice with eggs and vegetables - perfect for using leftover rice.',
    prepTime: 10,
    cookTime: 10,
    servings: 3,
    difficulty: { level: 'easy', reasons: ['quick-prep', 'simple-techniques'] },
    cuisine: 'chinese',
    tags: ['dinner', 'lunch', 'quick', 'vegetarian', 'one-pot'],
    nutrition: {
      perServing: { calories: 280, protein: 12, carbs: 45, fat: 8, fiber: 2, sugar: 4, sodium: 650 }
    },
    instructions: [
      { step: 1, instruction: 'Heat oil in a large skillet or wok over high heat.' },
      { step: 2, instruction: 'Add beaten eggs and scramble until just set. Remove and set aside.' },
      { step: 3, instruction: 'Add more oil if needed, then add diced onions and cook for 2 minutes.' },
      { step: 4, instruction: 'Add garlic and cook for 30 seconds until fragrant.' },
      { step: 5, instruction: 'Add cold cooked rice, breaking up clumps, and stir-fry for 3-4 minutes.' },
      { step: 6, instruction: 'Return eggs to pan, add vegetables, and season with salt and pepper. Serve hot.' }
    ],
    images: [{
      url: 'https://via.placeholder.com/800x600/F0E68C/000000?text=Fried+Rice',
      alt: 'Simple Fried Rice',
      isPrimary: true
    }],
    seasonality: ['year-round'],
    cookingMethod: ['stir-frying'],
    rating: { average: 4.2, count: 567 }
  }
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await Ingredient.deleteMany({});
    await Recipe.deleteMany({});
    console.log('✅ Cleared existing data');

    // Insert ingredients
    console.log('📦 Inserting ingredients...');
    const insertedIngredients = await Ingredient.insertMany(ingredientsData);
    console.log(`✅ Inserted ${insertedIngredients.length} ingredients`);

    // Create ingredient mapping for recipes
    const ingredientMap = {};
    insertedIngredients.forEach(ingredient => {
      ingredientMap[ingredient.name] = ingredient._id;
    });

    // Prepare recipes with ingredient references
    const recipesWithIngredients = recipesData.map(recipe => {
      let ingredients = [];
      
      switch (recipe.title) {
        case 'Classic Spaghetti Aglio e Olio':
          ingredients = [
            { ingredientId: ingredientMap['pasta'], quantity: 400, unit: 'g', required: true },
            { ingredientId: ingredientMap['garlic'], quantity: 4, unit: 'cloves', required: true },
            { ingredientId: ingredientMap['olive oil'], quantity: 60, unit: 'ml', required: true },
            { ingredientId: ingredientMap['basil'], quantity: 10, unit: 'g', required: false },
            { ingredientId: ingredientMap['black pepper'], quantity: 2, unit: 'tsp', required: true },
            { ingredientId: ingredientMap['salt'], quantity: 1, unit: 'tsp', required: true }
          ];
          break;
          
        case 'Grilled Chicken with Roasted Vegetables':
          ingredients = [
            { ingredientId: ingredientMap['chicken breast'], quantity: 600, unit: 'g', required: true },
            { ingredientId: ingredientMap['bell pepper'], quantity: 2, unit: 'pieces', required: true },
            { ingredientId: ingredientMap['carrot'], quantity: 3, unit: 'pieces', required: true },
            { ingredientId: ingredientMap['onion'], quantity: 1, unit: 'piece', required: true },
            { ingredientId: ingredientMap['olive oil'], quantity: 30, unit: 'ml', required: true },
            { ingredientId: ingredientMap['salt'], quantity: 1, unit: 'tsp', required: true },
            { ingredientId: ingredientMap['black pepper'], quantity: 1, unit: 'tsp', required: true }
          ];
          break;
          
        case 'Simple Fried Rice':
          ingredients = [
            { ingredientId: ingredientMap['rice'], quantity: 300, unit: 'g', required: true },
            { ingredientId: ingredientMap['eggs'], quantity: 3, unit: 'pieces', required: true },
            { ingredientId: ingredientMap['onion'], quantity: 1, unit: 'piece', required: true },
            { ingredientId: ingredientMap['garlic'], quantity: 2, unit: 'cloves', required: true },
            { ingredientId: ingredientMap['carrot'], quantity: 1, unit: 'piece', required: false },
            { ingredientId: ingredientMap['olive oil'], quantity: 30, unit: 'ml', required: true },
            { ingredientId: ingredientMap['salt'], quantity: 1, unit: 'tsp', required: true }
          ];
          break;
      }
      
      return { ...recipe, ingredients };
    });

    // Insert recipes
    console.log('🍽️  Inserting recipes...');
    const insertedRecipes = await Recipe.insertMany(recipesWithIngredients);
    console.log(`✅ Inserted ${insertedRecipes.length} recipes`);

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - ${insertedIngredients.length} ingredients`);
    console.log(`   - ${insertedRecipes.length} recipes`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeding if this script is executed directly
if (require.main === module) {
  connectDB().then(() => {
    seedDatabase();
  });
}

module.exports = { seedDatabase };
