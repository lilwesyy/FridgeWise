const express = require('express');
const {
  suggestRecipes,
  getRecipeDetails,
  saveFavorite,
  getFavorites,
  rateRecipe,
  searchRecipes,
  generateRecipeAI
} = require('../controllers/recipeController');
const { protect, checkUsageLimit, incrementUsage } = require('../middleware/auth');
const { validateRecipeSearch } = require('../middleware/validation');

const router = express.Router();

// Protected routes
router.post('/suggest', 
  protect, 
  checkUsageLimit('recipes'),
  validateRecipeSearch,
  incrementUsage('recipes'),
  suggestRecipes
);

router.get('/search', protect, searchRecipes);
router.get('/favorites', protect, getFavorites);
router.get('/:id', protect, getRecipeDetails);
router.post('/:id/favorite', protect, saveFavorite);
router.post('/:id/save', protect, saveFavorite);
router.post('/:id/rate', protect, rateRecipe);
router.post('/generate-ai', protect, generateRecipeAI);

module.exports = router;
