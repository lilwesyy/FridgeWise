const OpenAI = require('openai');
const Ingredient = require('../models/Ingredient');
const logger = require('../utils/logger');
const ollamaService = require('../services/ollamaService');

// Initialize OpenAI only when needed
const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith('sk-placeholder')) {
    throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
};

// Helper function for OpenAI Vision detection
const detectWithOpenAI = async (imageUrl, confidence) => {
  const openai = getOpenAIClient();
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze this image and identify all visible food ingredients. Return a JSON array of objects with the following structure:
            [
              {
                "name": "ingredient_name",
                "confidence": 0.95,
                "category": "vegetables|fruits|meat|poultry|seafood|dairy|grains|legumes|nuts-seeds|herbs-spices|oils-fats|condiments|pantry|beverages|other",
                "quantity_estimate": "approximate amount visible",
                "freshness": "fresh|good|questionable"
              }
            ]
            Only include ingredients you can clearly identify with confidence >= ${confidence}. Use common ingredient names that people would search for in recipes.`
          },
          {
            type: "image_url",
            image_url: {
              url: imageUrl
            }
          }
        ]
      }
    ],
    max_tokens: 1000
  });

  let detectedIngredients = [];
  
  try {
    const content = response.choices[0].message.content;
    const jsonMatch = content.match(/\[.*\]/s);
    
    if (jsonMatch) {
      detectedIngredients = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('No valid JSON found in response');
    }
  } catch (parseError) {
    logger.error('Error parsing OpenAI response:', parseError);
    throw new Error('Failed to parse ingredient detection results');
  }

  return {
    ingredients: detectedIngredients,
    providerInfo: {
      model: 'gpt-4o',
      totalDetected: detectedIngredients.length
    }
  };
};

// @desc    Detect ingredients from image using AI (OpenAI Vision or Ollama)
// @route   POST /api/ingredients/detect-from-image
// @access  Private
const detectFromImage = async (req, res, next) => {
  try {
    const { imageUrl, confidence = 0.7, preferOllama = false } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Image URL is required'
      });
    }

    let detectedIngredients = [];
    let aiProvider = '';
    let providerInfo = {};

    // Try Ollama first if preferred or if OpenAI is not available
    const useOllama = preferOllama || !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith('sk-placeholder');
    
    if (useOllama) {
      try {
        logger.info('Attempting ingredient detection with Ollama...');
        const ollamaResult = await ollamaService.detectIngredientsFromImage(imageUrl, confidence);
        detectedIngredients = ollamaResult.ingredients;
        aiProvider = 'ollama';
        providerInfo = {
          model: ollamaResult.model,
          totalDetected: ollamaResult.totalDetected
        };
        logger.info(`Ollama detection successful: ${detectedIngredients.length} ingredients found`);
      } catch (ollamaError) {
        logger.warn('Ollama detection failed:', ollamaError.message);
        
        // Fallback to OpenAI if Ollama fails
        if (!preferOllama) {
          logger.info('Falling back to OpenAI Vision...');
          const openaiResult = await detectWithOpenAI(imageUrl, confidence);
          detectedIngredients = openaiResult.ingredients;
          aiProvider = 'openai';
          providerInfo = openaiResult.providerInfo;
        } else {
          throw ollamaError; // If user prefers Ollama, don't fallback
        }
      }
    } else {
      try {
        logger.info('Attempting ingredient detection with OpenAI Vision...');
        const openaiResult = await detectWithOpenAI(imageUrl, confidence);
        detectedIngredients = openaiResult.ingredients;
        aiProvider = 'openai';
        providerInfo = openaiResult.providerInfo;
        logger.info(`OpenAI detection successful: ${detectedIngredients.length} ingredients found`);
      } catch (openaiError) {
        logger.warn('OpenAI detection failed:', openaiError.message);
        
        // Fallback to Ollama if OpenAI fails
        logger.info('Falling back to Ollama...');
        const ollamaResult = await ollamaService.detectIngredientsFromImage(imageUrl, confidence);
        detectedIngredients = ollamaResult.ingredients;
        aiProvider = 'ollama';
        providerInfo = {
          model: ollamaResult.model,
          totalDetected: ollamaResult.totalDetected
        };
      }
    }

    // Match detected ingredients with database
    const matchedIngredients = [];
    const unknownIngredients = [];

    for (const detected of detectedIngredients) {
      // Search for ingredient in database
      const dbIngredient = await Ingredient.findOne({
        $or: [
          { name: detected.name.toLowerCase() },
          { commonNames: detected.name.toLowerCase() }
        ]
      });

      if (dbIngredient) {
        matchedIngredients.push({
          ...detected,
          ingredientId: dbIngredient._id,
          nutritionPer100g: dbIngredient.nutritionPer100g,
          storageType: dbIngredient.storageType,
          shelfLife: dbIngredient.shelfLife
        });
      } else {
        unknownIngredients.push(detected);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        totalDetected: detectedIngredients.length,
        matched: matchedIngredients,
        unknown: unknownIngredients,
        imageUrl,
        aiProvider,
        providerInfo
      }
    });

  } catch (error) {
    logger.error('Error in ingredient detection:', error);
    next(error);
  }
};

// @desc    Search ingredients by name
// @route   GET /api/ingredients/search
// @access  Private
const searchIngredients = async (req, res, next) => {
  try {
    const { q: query, category, limit = 20 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Query must be at least 2 characters long'
      });
    }

    let searchCriteria = {};
    
    if (category) {
      searchCriteria.category = category;
    }

    // Use text search for better results
    const ingredients = await Ingredient.find({
      $text: { $search: query },
      ...searchCriteria
    }, {
      score: { $meta: 'textScore' }
    })
    .sort({ score: { $meta: 'textScore' } })
    .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        ingredients,
        count: ingredients.length,
        query
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Add custom ingredient
// @route   POST /api/ingredients/custom-add
// @access  Private
const addCustomIngredient = async (req, res, next) => {
  try {
    const { name, category, estimatedNutrition } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        error: 'Name and category are required'
      });
    }

    // Check if ingredient already exists
    const existingIngredient = await Ingredient.findOne({
      $or: [
        { name: name.toLowerCase() },
        { commonNames: name.toLowerCase() }
      ]
    });

    if (existingIngredient) {
      return res.status(200).json({
        success: true,
        data: {
          ingredient: existingIngredient,
          message: 'Ingredient already exists in database'
        }
      });
    }

    // Create new ingredient with default nutritional values
    const defaultNutrition = {
      calories: 50,
      protein: 1,
      carbs: 10,
      fat: 0.5,
      fiber: 1,
      ...estimatedNutrition
    };

    const newIngredient = await Ingredient.create({
      name: name.toLowerCase(),
      category,
      nutritionPer100g: defaultNutrition,
      commonNames: [name.toLowerCase()],
      shelfLife: 7, // Default 7 days
      storageType: category === 'vegetables' || category === 'fruits' ? 'fridge' : 'pantry',
      isVerified: false // Mark as user-generated
    });

    res.status(201).json({
      success: true,
      data: {
        ingredient: newIngredient,
        message: 'Custom ingredient added successfully'
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get ingredient by ID
// @route   GET /api/ingredients/:id
// @access  Private
const getIngredientById = async (req, res, next) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        error: 'Ingredient not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { ingredient }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get all ingredient categories
// @route   GET /api/ingredients/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = [
      'vegetables',
      'fruits', 
      'meat',
      'poultry',
      'seafood',
      'dairy',
      'grains',
      'legumes',
      'nuts-seeds',
      'herbs-spices',
      'oils-fats',
      'condiments',
      'pantry',
      'beverages',
      'other'
    ];

    // Get count for each category
    const categoryCounts = await Ingredient.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const categoriesWithCounts = categories.map(category => {
      const categoryData = categoryCounts.find(c => c._id === category);
      return {
        name: category,
        count: categoryData ? categoryData.count : 0
      };
    });

    res.status(200).json({
      success: true,
      data: categoriesWithCounts
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get total count of ingredients
// @route   GET /api/ingredients/total-count
// @access  Public
const getTotalCount = async (req, res, next) => {
  try {
    const totalCount = await Ingredient.countDocuments();

    res.status(200).json({
      success: true,
      data: { totalCount }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Seed database with sample ingredients (development only)
// @route   POST /api/ingredients/seed-dev
// @access  Public (development only)
const seedDatabase = async (req, res, next) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        success: false,
        error: 'Seeding is only allowed in development environment'
      });
    }

    const sampleIngredients = [
      { name: 'carrot', category: 'vegetables', nutritionPer100g: { calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, fiber: 2.8 }, commonNames: ['carrot', 'carrots'], shelfLife: 14, storageType: 'fridge' },
      { name: 'onion', category: 'vegetables', nutritionPer100g: { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 }, commonNames: ['onion', 'onions'], shelfLife: 30, storageType: 'pantry' },
      { name: 'apple', category: 'fruits', nutritionPer100g: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4 }, commonNames: ['apple', 'apples'], shelfLife: 14, storageType: 'fridge' },
      { name: 'banana', category: 'fruits', nutritionPer100g: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 }, commonNames: ['banana', 'bananas'], shelfLife: 5, storageType: 'room-temperature' },
      { name: 'chicken breast', category: 'poultry', nutritionPer100g: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 }, commonNames: ['chicken breast', 'chicken'], shelfLife: 2, storageType: 'fridge' },
      { name: 'rice', category: 'grains', nutritionPer100g: { calories: 365, protein: 7.1, carbs: 80, fat: 0.7, fiber: 1.3 }, commonNames: ['rice', 'white rice'], shelfLife: 365, storageType: 'pantry' },
      { name: 'milk', category: 'dairy', nutritionPer100g: { calories: 42, protein: 3.4, carbs: 5, fat: 1, fiber: 0 }, commonNames: ['milk'], shelfLife: 7, storageType: 'fridge' },
      { name: 'olive oil', category: 'oils-fats', nutritionPer100g: { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 }, commonNames: ['olive oil'], shelfLife: 730, storageType: 'pantry' }
    ];

    // Clear existing ingredients
    await Ingredient.deleteMany({});
    
    // Insert sample ingredients
    const insertedIngredients = await Ingredient.insertMany(sampleIngredients);

    res.status(200).json({
      success: true,
      data: {
        message: 'Database seeded successfully',
        ingredientsAdded: insertedIngredients.length,
        ingredients: insertedIngredients.map(ing => ({ name: ing.name, category: ing.category }))
      }
    });

  } catch (error) {
    logger.error('Error seeding database:', error);
    next(error);
  }
};

// @desc    Check AI providers status
// @route   GET /api/ingredients/ai-providers-status
// @access  Private
const getAIProvidersStatus = async (req, res, next) => {
  try {
    // Check OpenAI availability
    let openaiStatus = {
      available: false,
      error: null
    };
    
    try {
      getOpenAIClient();
      openaiStatus.available = true;
    } catch (error) {
      openaiStatus.error = error.message;
    }

    // Check Ollama availability
    const ollamaStatus = await ollamaService.checkOllamaAvailability();

    res.status(200).json({
      success: true,
      data: {
        openai: openaiStatus,
        ollama: ollamaStatus,
        recommendations: {
          preferred: ollamaStatus.hasVisionModel ? 'ollama' : (openaiStatus.available ? 'openai' : 'none'),
          fallback: openaiStatus.available && ollamaStatus.hasVisionModel ? 'both' : 'single'
        }
      }
    });

  } catch (error) {
    logger.error('Error checking AI providers status:', error);
    next(error);
  }
};

module.exports = {
  detectFromImage,
  searchIngredients,
  addCustomIngredient,
  getIngredientById,
  getCategories,
  getTotalCount,
  seedDatabase,
  getAIProvidersStatus
};
