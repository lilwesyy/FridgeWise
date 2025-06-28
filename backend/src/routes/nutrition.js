const express = require('express');
const {
  calculateRecipeNutrition,
  getDailySummary,
  getWeeklyTrends
} = require('../controllers/nutritionController');
const { protect, premiumOnly } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.get('/calculate/:recipeId', protect, calculateRecipeNutrition);
router.get('/daily-summary', protect, getDailySummary);

// Premium only routes
router.get('/weekly-trends', protect, premiumOnly, getWeeklyTrends);

module.exports = router;
