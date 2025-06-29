const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');
const UserSession = require('../models/UserSession');
const { generateRecipe } = require('../services/openaiService');

// @desc    Suggest recipes based on available ingredients
// @route   POST /api/recipes/suggest
// @access  Private
const suggestRecipes = async (req, res, next) => {
  try {
    const {
      ingredients,
      cuisine,
      difficulty,
      maxPrepTime,
      tags,
      minMatchPercentage = 50,
      limit = 20,
      page = 1,
      servings = 2
    } = req.body;

    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one ingredient is required'
      });
    }

    // Genera sempre una ricetta AI
    try {
      const aiRecipe = await generateRecipe(
        ingredients,
        servings,
        maxPrepTime,
        difficulty
      );
      // Salva la sessione utente per tracciare la richiesta
      await UserSession.create({
        userId: req.user.id,
        detectedIngredients: ingredients,
        suggestedRecipes: [aiRecipe.id],
        aiRecipe: aiRecipe,
        searchCriteria: {
          cuisine,
          difficulty,
          maxPrepTime,
          tags,
          minMatchPercentage
        }
      });
      return res.status(200).json({
        success: true,
        data: {
          recipes: [aiRecipe],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 1
          },
          filters: {
            cuisine,
            difficulty,
            maxPrepTime,
            tags,
            minMatchPercentage
          }
        }
      });
    } catch (aiError) {
      console.error('AI recipe generation failed:', aiError.message);
      // Fallback: return empty results with message
      return res.status(200).json({
        success: true,
        data: {
          recipes: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0
          },
          filters: {
            cuisine,
            difficulty,
            maxPrepTime,
            tags,
            minMatchPercentage
          },
          message: 'AI service is temporarily unavailable. Please try again later.'
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get recipe details by ID
// @route   GET /api/recipes/:id
// @access  Private
const getRecipeDetails = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('ingredients.ingredientId', 'name category nutritionPer100g storageType');

    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: 'Recipe not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { recipe }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Save recipe as favorite
// @route   POST /api/recipes/:id/favorite
// @access  Private
const saveFavorite = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const Recipe = require('../models/Recipe');
    const UserSession = require('../models/UserSession');
    
    const user = await User.findById(req.user.id);
    const recipeId = req.params.id;

    let recipe = null;

    // Handle AI recipes (id starts with 'ai-')
    if (typeof recipeId === 'string' && recipeId.startsWith('ai-')) {
      // First check if this AI recipe is already saved in the database
      recipe = await Recipe.findOne({ aiId: recipeId });
      
      if (!recipe) {
        // Try to find the AI recipe in user sessions
        const session = await UserSession.findOne({
          userId: req.user.id,
          'aiRecipe.id': recipeId
        }).sort({ createdAt: -1 });

        if (session && session.aiRecipe) {
          // Create a new Recipe from the AI recipe data
          const aiRecipeData = session.aiRecipe;
          recipe = new Recipe({
            title: aiRecipeData.title,
            description: aiRecipeData.description,
            ingredients: aiRecipeData.ingredients,
            instructions: aiRecipeData.instructions.map((inst, index) => ({
              step: index + 1,
              instruction: inst
            })),
            prepTime: aiRecipeData.prepTime || 15,
            cookTime: aiRecipeData.cookTime || aiRecipeData.cookingTime || 30,
            servings: aiRecipeData.servings || 2,
            difficulty: {
              level: aiRecipeData.difficulty || 'medium',
              reasons: []
            },
            cuisine: aiRecipeData.cuisine || 'international',
            tags: aiRecipeData.tags || [],
            nutrition: {
              perServing: {
                calories: aiRecipeData.nutritionInfo?.calories || 0,
                protein: aiRecipeData.nutritionInfo?.protein || 0,
                carbs: aiRecipeData.nutritionInfo?.carbs || 0,
                fat: aiRecipeData.nutritionInfo?.fat || 0
              }
            },
            isVerified: false,
            source: 'ai',
            author: user._id,
            aiId: recipeId
          });
          
          recipe = await recipe.save();
        } else if (req.body.aiRecipe) {
          // Fallback: use AI recipe data from request body
          const aiRecipeData = req.body.aiRecipe;
          recipe = new Recipe({
            title: aiRecipeData.title,
            description: aiRecipeData.description,
            ingredients: aiRecipeData.ingredients,
            instructions: aiRecipeData.instructions.map((inst, index) => ({
              step: index + 1,
              instruction: inst
            })),
            prepTime: aiRecipeData.prepTime || 15,
            cookTime: aiRecipeData.cookTime || aiRecipeData.cookingTime || 30,
            servings: aiRecipeData.servings || 2,
            difficulty: {
              level: aiRecipeData.difficulty || 'medium',
              reasons: []
            },
            cuisine: aiRecipeData.cuisine || 'international',
            tags: aiRecipeData.tags || [],
            nutrition: {
              perServing: {
                calories: aiRecipeData.nutritionInfo?.calories || 0,
                protein: aiRecipeData.nutritionInfo?.protein || 0,
                carbs: aiRecipeData.nutritionInfo?.carbs || 0,
                fat: aiRecipeData.nutritionInfo?.fat || 0
              }
            },
            isVerified: false,
            source: 'ai',
            author: user._id,
            aiId: recipeId
          });
          
          recipe = await recipe.save();
        }
      }
    } else {
      // Handle regular recipes with ObjectId
      if (/^[a-f\d]{24}$/i.test(recipeId)) {
        recipe = await Recipe.findById(recipeId);
      }
    }

    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: 'Recipe not found'
      });
    }

    // Initialize favorites array if it doesn't exist
    if (!user.favorites) {
      user.favorites = [];
    }

    const isFavorited = user.favorites.some(id => id.toString() === recipe._id.toString());
    
    if (isFavorited) {
      // Remove from favorites
      user.favorites = user.favorites.filter(id => id.toString() !== recipe._id.toString());
    } else {
      // Add to favorites
      user.favorites.push(recipe._id);
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        isFavorited: !isFavorited,
        recipeId: recipe._id,
        message: isFavorited ? 'Recipe removed from favorites' : 'Recipe added to favorites'
      }
    });

  } catch (error) {
    console.error('Error in saveFavorite:', error);
    next(error);
  }
};

// @desc    Get user's favorite recipes
// @route   GET /api/recipes/favorites
// @access  Private
const getFavorites = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findById(req.user.id);
    
    if (!user.favorites || user.favorites.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          recipes: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0
          }
        }
      });
    }

    const recipes = await Recipe.find({
      _id: { $in: user.favorites }
    })
    .populate('ingredients.ingredientId', 'name category')
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        recipes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: user.favorites.length
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Rate a recipe
// @route   POST /api/recipes/:id/rate
// @access  Private
const rateRecipe = async (req, res, next) => {
  try {
    const { rating } = req.body;
    const recipeId = req.params.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: 'Recipe not found'
      });
    }

    // For simplicity, we'll just update the average rating
    // In a real app, you'd want to track individual user ratings
    const currentTotal = recipe.rating.average * recipe.rating.count;
    const newCount = recipe.rating.count + 1;
    const newAverage = (currentTotal + rating) / newCount;

    recipe.rating.average = Math.round(newAverage * 10) / 10; // Round to 1 decimal
    recipe.rating.count = newCount;

    await recipe.save();

    res.status(200).json({
      success: true,
      data: {
        rating: recipe.rating,
        message: 'Recipe rated successfully'
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Search recipes by text
// @route   GET /api/recipes/search
// @access  Private
const searchRecipes = async (req, res, next) => {
  try {
    const { 
      q: query, 
      cuisine, 
      difficulty, 
      maxPrepTime, 
      tags,
      page = 1, 
      limit = 20 
    } = req.query;

    let searchCriteria = {};

    // Text search
    if (query) {
      searchCriteria.$text = { $search: query };
    }

    // Filters
    if (cuisine) searchCriteria.cuisine = cuisine;
    if (difficulty) searchCriteria['difficulty.level'] = difficulty;
    if (maxPrepTime) searchCriteria.prepTime = { $lte: parseInt(maxPrepTime) };
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      searchCriteria.tags = { $in: tagArray };
    }

    const recipes = await Recipe.find(searchCriteria)
      .populate('ingredients.ingredientId', 'name category')
      .sort({ 'rating.average': -1, updatedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalCount = await Recipe.countDocuments(searchCriteria);

    res.status(200).json({
      success: true,
      data: {
        recipes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit))
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Generate a recipe using OpenAI
// @route   POST /api/recipes/generate-ai
// @access  Private
const generateRecipeAI = async (req, res, next) => {
  try {
    const { ingredients } = req.body;
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ success: false, error: 'Ingredients array required' });
    }
    const recipe = await generateRecipe(ingredients);
    res.json({ success: true, data: recipe });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  suggestRecipes,
  getRecipeDetails,
  saveFavorite,
  getFavorites,
  rateRecipe,
  searchRecipes,
  generateRecipeAI
};
