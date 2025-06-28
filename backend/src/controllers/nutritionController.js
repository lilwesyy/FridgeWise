const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');
const UserSession = require('../models/UserSession');

// @desc    Calculate nutrition for a recipe
// @route   GET /api/nutrition/calculate/:recipeId
// @access  Private
const calculateRecipeNutrition = async (req, res, next) => {
  try {
    const { recipeId } = req.params;
    const { servings } = req.query;

    const recipe = await Recipe.findById(recipeId)
      .populate('ingredients.ingredientId', 'nutritionPer100g');

    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: 'Recipe not found'
      });
    }

    // Calculate total nutrition
    let totalNutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
    };

    recipe.ingredients.forEach(ingredient => {
      const nutrition = ingredient.ingredientId.nutritionPer100g;
      const quantity = ingredient.quantity;
      
      // Convert quantity to grams (simplified conversion)
      let quantityInGrams = quantity;
      switch (ingredient.unit) {
        case 'kg':
          quantityInGrams = quantity * 1000;
          break;
        case 'lb':
          quantityInGrams = quantity * 453.592;
          break;
        case 'oz':
          quantityInGrams = quantity * 28.3495;
          break;
        case 'cup':
        case 'cups':
          quantityInGrams = quantity * 240; // Approximate for liquids
          break;
        case 'tbsp':
          quantityInGrams = quantity * 15;
          break;
        case 'tsp':
          quantityInGrams = quantity * 5;
          break;
        // For pieces, slices, etc., use a rough estimate
        case 'piece':
        case 'pieces':
          quantityInGrams = quantity * 100; // 100g per piece average
          break;
        default:
          quantityInGrams = quantity; // Assume grams
      }

      // Calculate nutrition based on 100g portions
      const factor = quantityInGrams / 100;
      
      totalNutrition.calories += nutrition.calories * factor;
      totalNutrition.protein += nutrition.protein * factor;
      totalNutrition.carbs += nutrition.carbs * factor;
      totalNutrition.fat += nutrition.fat * factor;
      totalNutrition.fiber += (nutrition.fiber || 0) * factor;
      totalNutrition.sugar += (nutrition.sugar || 0) * factor;
      totalNutrition.sodium += (nutrition.sodium || 0) * factor;
    });

    // Calculate per serving
    const recipeServings = servings ? parseInt(servings) : recipe.servings;
    const perServingNutrition = {
      calories: Math.round(totalNutrition.calories / recipeServings),
      protein: Math.round((totalNutrition.protein / recipeServings) * 10) / 10,
      carbs: Math.round((totalNutrition.carbs / recipeServings) * 10) / 10,
      fat: Math.round((totalNutrition.fat / recipeServings) * 10) / 10,
      fiber: Math.round((totalNutrition.fiber / recipeServings) * 10) / 10,
      sugar: Math.round((totalNutrition.sugar / recipeServings) * 10) / 10,
      sodium: Math.round(totalNutrition.sodium / recipeServings)
    };

    res.status(200).json({
      success: true,
      data: {
        recipeId,
        servings: recipeServings,
        nutrition: {
          perServing: perServingNutrition,
          total: {
            calories: Math.round(totalNutrition.calories),
            protein: Math.round(totalNutrition.protein * 10) / 10,
            carbs: Math.round(totalNutrition.carbs * 10) / 10,
            fat: Math.round(totalNutrition.fat * 10) / 10,
            fiber: Math.round(totalNutrition.fiber * 10) / 10,
            sugar: Math.round(totalNutrition.sugar * 10) / 10,
            sodium: Math.round(totalNutrition.sodium)
          }
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get daily nutrition summary
// @route   GET /api/nutrition/daily-summary
// @access  Private
const getDailySummary = async (req, res, next) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    // Set time to start and end of day
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get user sessions for the day where recipes were actually cooked
    const sessions = await UserSession.find({
      userId: req.user.id,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      'userFeedback.cookedRecipe': { $exists: true, $ne: null }
    }).populate({
      path: 'userFeedback.cookedRecipe',
      select: 'title nutrition servings'
    });

    let dailyNutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
    };

    const cookedRecipes = [];

    sessions.forEach(session => {
      if (session.userFeedback.cookedRecipe) {
        const recipe = session.userFeedback.cookedRecipe;
        const nutrition = recipe.nutrition.perServing;
        
        dailyNutrition.calories += nutrition.calories || 0;
        dailyNutrition.protein += nutrition.protein || 0;
        dailyNutrition.carbs += nutrition.carbs || 0;
        dailyNutrition.fat += nutrition.fat || 0;
        dailyNutrition.fiber += nutrition.fiber || 0;
        dailyNutrition.sugar += nutrition.sugar || 0;
        dailyNutrition.sodium += nutrition.sodium || 0;
        
        cookedRecipes.push({
          id: recipe._id,
          title: recipe.title,
          nutrition: nutrition,
          cookedAt: session.createdAt
        });
      }
    });

    // Get user's calorie goal for comparison
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    const calorieGoal = user.profile.calorieGoal || 2000;

    // Calculate macronutrient percentages
    const totalCalories = dailyNutrition.calories;
    const macroPercentages = {
      protein: totalCalories > 0 ? Math.round((dailyNutrition.protein * 4 / totalCalories) * 100) : 0,
      carbs: totalCalories > 0 ? Math.round((dailyNutrition.carbs * 4 / totalCalories) * 100) : 0,
      fat: totalCalories > 0 ? Math.round((dailyNutrition.fat * 9 / totalCalories) * 100) : 0
    };

    res.status(200).json({
      success: true,
      data: {
        date: targetDate.toISOString().split('T')[0],
        nutrition: {
          ...dailyNutrition,
          calorieGoal,
          remainingCalories: Math.max(0, calorieGoal - dailyNutrition.calories),
          macroPercentages
        },
        cookedRecipes,
        recipesCount: cookedRecipes.length
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get weekly nutrition trends
// @route   GET /api/nutrition/weekly-trends
// @access  Private (Premium)
const getWeeklyTrends = async (req, res, next) => {
  try {
    const { startDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date();
    
    // Calculate 7 days from start date
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() - i);
      days.push(day);
    }

    const weeklyData = await Promise.all(
      days.map(async (day) => {
        const startOfDay = new Date(day);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(day);
        endOfDay.setHours(23, 59, 59, 999);

        const sessions = await UserSession.find({
          userId: req.user.id,
          createdAt: { $gte: startOfDay, $lte: endOfDay },
          'userFeedback.cookedRecipe': { $exists: true, $ne: null }
        }).populate({
          path: 'userFeedback.cookedRecipe',
          select: 'nutrition'
        });

        let dayNutrition = {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        };

        sessions.forEach(session => {
          if (session.userFeedback.cookedRecipe) {
            const nutrition = session.userFeedback.cookedRecipe.nutrition.perServing;
            dayNutrition.calories += nutrition.calories || 0;
            dayNutrition.protein += nutrition.protein || 0;
            dayNutrition.carbs += nutrition.carbs || 0;
            dayNutrition.fat += nutrition.fat || 0;
          }
        });

        return {
          date: day.toISOString().split('T')[0],
          nutrition: dayNutrition,
          recipesCooked: sessions.length
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        weeklyData: weeklyData.reverse(), // Oldest first
        averages: {
          calories: Math.round(weeklyData.reduce((sum, day) => sum + day.nutrition.calories, 0) / 7),
          protein: Math.round((weeklyData.reduce((sum, day) => sum + day.nutrition.protein, 0) / 7) * 10) / 10,
          carbs: Math.round((weeklyData.reduce((sum, day) => sum + day.nutrition.carbs, 0) / 7) * 10) / 10,
          fat: Math.round((weeklyData.reduce((sum, day) => sum + day.nutrition.fat, 0) / 7) * 10) / 10
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  calculateRecipeNutrition,
  getDailySummary,
  getWeeklyTrends
};
