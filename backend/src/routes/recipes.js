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
const {
  recipesCacheMiddleware,
  aiResultsCacheMiddleware,
  cacheInvalidationMiddleware,
  cacheStatsMiddleware
} = require('../middleware/cache');

const router = express.Router();

// Add cache stats middleware to all routes
router.use(cacheStatsMiddleware());

// Protected routes with caching
router.post('/suggest', 
  protect, 
  checkUsageLimit('recipes'),
  validateRecipeSearch,
  aiResultsCacheMiddleware,
  incrementUsage('recipes'),
  suggestRecipes
);

router.get('/search', 
  protect, 
  recipesCacheMiddleware,
  searchRecipes
);

router.get('/favorites', 
  protect, 
  recipesCacheMiddleware,
  getFavorites
);

router.get('/saved', 
  protect, 
  recipesCacheMiddleware,
  getFavorites
); // Alias for favorites

router.get('/:id', 
  protect, 
  recipesCacheMiddleware,
  getRecipeDetails
);

router.post('/:id/favorite', 
  protect, 
  cacheInvalidationMiddleware(['recipes:*', 'session:*']),
  saveFavorite
);

router.post('/:id/save', 
  protect, 
  cacheInvalidationMiddleware(['recipes:*', 'session:*']),
  saveFavorite
);

router.post('/:id/rate', 
  protect, 
  cacheInvalidationMiddleware(['recipes:*']),
  rateRecipe
);

router.post('/generate-ai', 
  protect, 
  aiResultsCacheMiddleware,
  generateRecipeAI
);

module.exports = router;
