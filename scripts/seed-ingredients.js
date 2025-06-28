const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Ingredient = require('../backend/src/models/Ingredient');
const Recipe = require('../backend/src/models/Recipe');

// Sample ingredients data
const sampleIngredients = [
  {
    name: 'Tomato',
    category: 'vegetable',
    commonNames: ['tomatoes', 'red tomato', 'cherry tomato'],
    nutritionalInfo: {
      calories: 18,
      protein: 0.9,
      carbs: 3.9,
      fat: 0.2,
      fiber: 1.2,
      sugar: 2.6,
      vitamins: { C: 14, K: 7.9 },
      minerals: { potassium: 237, folate: 15 }
    },
    storageInfo: {
      shelfLife: 7,
      storageConditions: 'Room temperature until ripe, then refrigerate'
    }
  },
  {
    name: 'Chicken Breast',
    category: 'protein',
    commonNames: ['chicken', 'chicken breast', 'boneless chicken'],
    nutritionalInfo: {
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      fiber: 0,
      sugar: 0,
      vitamins: { B6: 0.5, niacin: 8.5 },
      minerals: { phosphorus: 196, selenium: 22.5 }
    },
    storageInfo: {
      shelfLife: 2,
      storageConditions: 'Refrigerate at 40°F or below'
    }
  },
  {
    name: 'Rice',
    category: 'grain',
    commonNames: ['white rice', 'basmati rice', 'jasmine rice'],
    nutritionalInfo: {
      calories: 130,
      protein: 2.7,
      carbs: 28,
      fat: 0.3,
      fiber: 0.4,
      sugar: 0.1,
      vitamins: { thiamin: 0.07, folate: 58 },
      minerals: { manganese: 0.55, iron: 1.2 }
    },
    storageInfo: {
      shelfLife: 730,
      storageConditions: 'Store in airtight container in cool, dry place'
    }
  },
  {
    name: 'Onion',
    category: 'vegetable',
    commonNames: ['onions', 'yellow onion', 'white onion'],
    nutritionalInfo: {
      calories: 40,
      protein: 1.1,
      carbs: 9.3,
      fat: 0.1,
      fiber: 1.7,
      sugar: 4.2,
      vitamins: { C: 7.4, B6: 0.1 },
      minerals: { potassium: 146, manganese: 0.1 }
    },
    storageInfo: {
      shelfLife: 30,
      storageConditions: 'Store in cool, dry, well-ventilated place'
    }
  },
  {
    name: 'Garlic',
    category: 'vegetable',
    commonNames: ['garlic cloves', 'fresh garlic'],
    nutritionalInfo: {
      calories: 149,
      protein: 6.4,
      carbs: 33,
      fat: 0.5,
      fiber: 2.1,
      sugar: 1,
      vitamins: { C: 31.2, B6: 1.2 },
      minerals: { manganese: 1.7, selenium: 14.2 }
    },
    storageInfo: {
      shelfLife: 90,
      storageConditions: 'Store in cool, dry place with good air circulation'
    }
  },
  {
    name: 'Olive Oil',
    category: 'fat',
    commonNames: ['extra virgin olive oil', 'olive oil'],
    nutritionalInfo: {
      calories: 884,
      protein: 0,
      carbs: 0,
      fat: 100,
      fiber: 0,
      sugar: 0,
      vitamins: { E: 14.4, K: 60.2 },
      minerals: {}
    },
    storageInfo: {
      shelfLife: 730,
      storageConditions: 'Store in cool, dark place away from light'
    }
  },
  {
    name: 'Eggs',
    category: 'protein',
    commonNames: ['egg', 'chicken eggs', 'large eggs'],
    nutritionalInfo: {
      calories: 155,
      protein: 13,
      carbs: 1.1,
      fat: 11,
      fiber: 0,
      sugar: 1.1,
      vitamins: { B12: 0.6, riboflavin: 0.4 },
      minerals: { selenium: 22, phosphorus: 172 }
    },
    storageInfo: {
      shelfLife: 21,
      storageConditions: 'Refrigerate at 40°F or below'
    }
  },
  {
    name: 'Milk',
    category: 'dairy',
    commonNames: ['whole milk', '2% milk', 'cow milk'],
    nutritionalInfo: {
      calories: 61,
      protein: 3.2,
      carbs: 4.8,
      fat: 3.3,
      fiber: 0,
      sugar: 5.1,
      vitamins: { B12: 0.4, riboflavin: 0.2 },
      minerals: { calcium: 113, phosphorus: 84 }
    },
    storageInfo: {
      shelfLife: 7,
      storageConditions: 'Refrigerate at 40°F or below'
    }
  }
];

// Sample recipes data
const sampleRecipes = [
  {
    title: 'Simple Tomato Rice',
    description: 'A quick and easy one-pot rice dish with fresh tomatoes',
    ingredients: [
      { name: 'Rice', amount: 1, unit: 'cup' },
      { name: 'Tomato', amount: 2, unit: 'medium' },
      { name: 'Onion', amount: 1, unit: 'small' },
      { name: 'Garlic', amount: 2, unit: 'cloves' },
      { name: 'Olive Oil', amount: 2, unit: 'tbsp' }
    ],
    instructions: [
      'Heat olive oil in a pan',
      'Sauté minced garlic and diced onion until soft',
      'Add diced tomatoes and cook until they break down',
      'Add rice and stir for 2 minutes',
      'Add 2 cups water, bring to boil, then simmer for 18 minutes',
      'Let rest for 5 minutes before serving'
    ],
    prepTime: 10,
    cookTime: 25,
    servings: 4,
    difficulty: 'easy',
    cuisine: 'Mediterranean',
    tags: ['vegetarian', 'one-pot', 'gluten-free'],
    nutritionalInfo: {
      calories: 220,
      protein: 4,
      carbs: 42,
      fat: 7,
      fiber: 2
    }
  },
  {
    title: 'Garlic Butter Chicken',
    description: 'Tender chicken breast cooked in aromatic garlic butter',
    ingredients: [
      { name: 'Chicken Breast', amount: 4, unit: 'pieces' },
      { name: 'Garlic', amount: 4, unit: 'cloves' },
      { name: 'Olive Oil', amount: 2, unit: 'tbsp' }
    ],
    instructions: [
      'Season chicken breasts with salt and pepper',
      'Heat olive oil in a large skillet over medium-high heat',
      'Cook chicken for 6-7 minutes per side until golden',
      'Add minced garlic and cook for 1 minute',
      'Remove from heat and let rest for 5 minutes',
      'Slice and serve immediately'
    ],
    prepTime: 5,
    cookTime: 15,
    servings: 4,
    difficulty: 'easy',
    cuisine: 'American',
    tags: ['protein-rich', 'low-carb', 'gluten-free'],
    nutritionalInfo: {
      calories: 195,
      protein: 32,
      carbs: 1,
      fat: 6,
      fiber: 0
    }
  },
  {
    title: 'Basic Scrambled Eggs',
    description: 'Creamy and fluffy scrambled eggs perfect for breakfast',
    ingredients: [
      { name: 'Eggs', amount: 4, unit: 'large' },
      { name: 'Milk', amount: 2, unit: 'tbsp' },
      { name: 'Olive Oil', amount: 1, unit: 'tsp' }
    ],
    instructions: [
      'Crack eggs into a bowl and whisk with milk',
      'Heat olive oil in a non-stick pan over low heat',
      'Pour in egg mixture and let sit for 30 seconds',
      'Gently stir with a spatula, creating large curds',
      'Continue stirring gently until eggs are just set',
      'Remove from heat and serve immediately'
    ],
    prepTime: 5,
    cookTime: 5,
    servings: 2,
    difficulty: 'easy',
    cuisine: 'International',
    tags: ['breakfast', 'protein-rich', 'vegetarian'],
    nutritionalInfo: {
      calories: 180,
      protein: 14,
      carbs: 2,
      fat: 13,
      fiber: 0
    }
  }
];

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding');

    // Clear existing data
    await Ingredient.deleteMany({});
    await Recipe.deleteMany({});
    console.log('Cleared existing data');

    // Insert ingredients
    const ingredients = await Ingredient.insertMany(sampleIngredients);
    console.log(`Inserted ${ingredients.length} ingredients`);

    // Insert recipes with ingredient references
    const recipes = await Recipe.insertMany(sampleRecipes);
    console.log(`Inserted ${recipes.length} recipes`);

    console.log('Database seeding completed successfully');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
