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
      page = 1
    } = req.body;

    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one ingredient is required'
      });
    }

    // Find recipes that contain at least one of the provided ingredients
    const recipes = await Recipe.findByIngredients(ingredients, {
      cuisine,
      difficulty,
      maxPrepTime,
      tags,
      limit: parseInt(limit),
      page: parseInt(page)
    });

    // Calculate match percentage for each recipe
    const recipesWithMatch = recipes.map(recipe => {
      const matchPercentage = recipe.calculateMatchPercentage(ingredients);
      return {
        ...recipe.toObject(),
        matchPercentage
      };
    });

    // Filter by minimum match percentage and sort
    const filteredRecipes = recipesWithMatch
      .filter(recipe => recipe.matchPercentage >= minMatchPercentage)
      .sort((a, b) => {
        // Sort by match percentage first, then by rating
        if (b.matchPercentage !== a.matchPercentage) {
          return b.matchPercentage - a.matchPercentage;
        }
        return b.rating.average - a.rating.average;
      });

    // Calculate missing ingredients for each recipe
    const recipesWithMissingIngredients = await Promise.all(
      filteredRecipes.map(async (recipe) => {
        const availableIngredientIds = new Set(ingredients.map(id => id.toString()));
        const missingIngredients = [];

        for (const recipeIngredient of recipe.ingredients) {
          if (!availableIngredientIds.has(recipeIngredient.ingredientId.toString())) {
            const ingredient = await Ingredient.findById(recipeIngredient.ingredientId);
            if (ingredient) {
              missingIngredients.push({
                ...ingredient.toObject(),
                quantity: recipeIngredient.quantity,
                unit: recipeIngredient.unit,
                required: recipeIngredient.required
              });
            }
          }
        }

        return {
          ...recipe,
          missingIngredients
        };
      })
    );

    // Se non ci sono ricette trovate, fallback su AI
    if (recipesWithMissingIngredients.length === 0) {
      const aiRecipe = await generateRecipe(
        ingredients,
        req.body.servings,
        req.body.maxPrepTime,
        req.body.difficulty
      );
      // Create user session for AI recipe fallback
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
    }

    // Create user session to track this search
    if (recipesWithMissingIngredients.length > 0) {
      await UserSession.create({
        userId: req.user.id,
        detectedIngredients: ingredients,
        suggestedRecipes: recipesWithMissingIngredients.map(r => r._id),
        searchCriteria: {
          cuisine,
          difficulty,
          maxPrepTime,
          tags,
          minMatchPercentage
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        recipes: recipesWithMissingIngredients,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: recipesWithMissingIngredients.length
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
    const user = await User.findById(req.user.id);
    const recipeId = req.params.id;

    let recipe = null;
    // Se è una ricetta AI (id non ObjectId), gestisci prima
    if (typeof recipeId === 'string' && recipeId.startsWith('ai-')) {
      // Recupera le ultime sessioni dell'utente e cerca manualmente la ricetta AI
      const sessions = await require('../models/UserSession').find({
        userId: req.user.id
      }).sort({ createdAt: -1 }).limit(10);
      let session = null;
      for (const s of sessions) {
        if (s.aiRecipe && s.aiRecipe.id === recipeId) {
          session = s;
          break;
        }
      }
      if (session && session.aiRecipe && session.aiRecipe.id === recipeId) {
        // Check if a Recipe with this aiId already exists
        let existingRecipe = await Recipe.findOne({ aiId: recipeId });
        if (existingRecipe) {
          recipe = existingRecipe;
        } else {
          const newRecipe = new Recipe({
            ...session.aiRecipe,
            _id: undefined,
            isVerified: false,
            source: 'ai',
            author: user._id,
            aiId: recipeId // Store the AI id for deduplication
          });
          recipe = await newRecipe.save();
        }
      } else {
        // Fallback: allow saving if full AI recipe is provided in the request body
        const aiRecipeFromBody = req.body && req.body.aiRecipe;
        if (aiRecipeFromBody && aiRecipeFromBody.id === recipeId) {
          // Check for deduplication
          let existingRecipe = await Recipe.findOne({ aiId: recipeId });
          if (existingRecipe) {
            recipe = existingRecipe;
          } else {
            const newRecipe = new Recipe({
              ...aiRecipeFromBody,
              _id: undefined,
              isVerified: false,
              source: 'ai',
              author: user._id,
              aiId: recipeId
            });
            recipe = await newRecipe.save();
          }
        } else {
          return res.status(404).json({ success: false, error: 'AI recipe not found in session or request' });
        }
      }
    } else {
      // Solo se è un ObjectId valido
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
    if (!user.favorites) {
      user.favorites = [];
    }
    const isFavorited = user.favorites.includes(recipe._id.toString());
    if (isFavorited) {
      user.favorites = user.favorites.filter(id => id.toString() !== recipe._id.toString());
    } else {
      user.favorites.push(recipe._id);
    }
    await user.save();
    res.status(200).json({
      success: true,
      data: {
        isFavorited: !isFavorited,
        message: isFavorited ? 'Recipe removed from favorites' : 'Recipe added to favorites'
      }
    });
  } catch (error) {
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
