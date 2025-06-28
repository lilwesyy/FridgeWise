require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Ingredient = require('./src/models/Ingredient');

const seedIngredients = [
  {
    name: 'tomato',
    category: 'vegetables',
    nutritionPer100g: {
      calories: 18,
      protein: 0.9,
      carbs: 3.9,
      fat: 0.2,
      fiber: 1.2
    },
    commonNames: ['tomato', 'tomatoes'],
    shelfLife: 7,
    storageType: 'fridge',
    isVerified: true
  },
  {
    name: 'onion',
    category: 'vegetables',
    nutritionPer100g: {
      calories: 40,
      protein: 1.1,
      carbs: 9.3,
      fat: 0.1,
      fiber: 1.7
    },
    commonNames: ['onion', 'onions'],
    shelfLife: 14,
    storageType: 'pantry',
    isVerified: true
  },
  {
    name: 'chicken breast',
    category: 'poultry',
    nutritionPer100g: {
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      fiber: 0
    },
    commonNames: ['chicken breast', 'chicken'],
    shelfLife: 3,
    storageType: 'fridge',
    isVerified: true
  },
  {
    name: 'apple',
    category: 'fruits',
    nutritionPer100g: {
      calories: 52,
      protein: 0.3,
      carbs: 14,
      fat: 0.2,
      fiber: 2.4
    },
    commonNames: ['apple', 'apples'],
    shelfLife: 21,
    storageType: 'fridge',
    isVerified: true
  },
  {
    name: 'rice',
    category: 'grains',
    nutritionPer100g: {
      calories: 130,
      protein: 2.7,
      carbs: 28,
      fat: 0.3,
      fiber: 0.4
    },
    commonNames: ['rice', 'white rice'],
    shelfLife: 365,
    storageType: 'pantry',
    isVerified: true
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing ingredients
    console.log('Clearing existing ingredients...');
    await Ingredient.deleteMany({});
    console.log('Cleared existing ingredients');

    // Insert seed data
    console.log('Inserting seed ingredients...');
    const result = await Ingredient.insertMany(seedIngredients);
    console.log(`Inserted ${result.length} ingredients`);

    // Verify the data
    const count = await Ingredient.countDocuments();
    console.log(`Total ingredients in database: ${count}`);

    // Show a few examples
    const examples = await Ingredient.find().limit(3);
    console.log('Sample ingredients:');
    examples.forEach(ing => {
      console.log(`- ${ing.name} (${ing.category})`);
    });

    console.log('Database seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
