const express = require('express');
const {
  detectFromImage,
  searchIngredients,
  addCustomIngredient,
  getIngredientById,
  getCategories,
  getTotalCount,
  seedDatabase
} = require('../controllers/ingredientController');
const { protect, checkUsageLimit, incrementUsage } = require('../middleware/auth');
const { validateIngredientDetection } = require('../middleware/validation');
const {
  ingredientsCacheMiddleware,
  aiResultsCacheMiddleware,
  cacheInvalidationMiddleware,
  cacheStatsMiddleware
} = require('../middleware/cache');

const router = express.Router();

// Add cache stats middleware to all routes
router.use(cacheStatsMiddleware());

// Public routes with caching
router.get('/categories', 
  ingredientsCacheMiddleware,
  getCategories
);

router.get('/total-count', 
  ingredientsCacheMiddleware,
  getTotalCount
);

router.post('/seed-dev', 
  cacheInvalidationMiddleware(['ingredients:*', 'static:*']),
  seedDatabase
);

// Protected routes with caching
router.post('/detect-from-image', 
  protect, 
  checkUsageLimit('photos'), 
  validateIngredientDetection,
  aiResultsCacheMiddleware,
  incrementUsage('photos'),
  detectFromImage
);

router.get('/search', 
  protect, 
  ingredientsCacheMiddleware,
  searchIngredients
);

router.post('/custom-add', 
  protect, 
  cacheInvalidationMiddleware(['ingredients:*']),
  addCustomIngredient
);

// Dynamic routes (must be last)
router.get('/:id', 
  protect, 
  ingredientsCacheMiddleware,
  getIngredientById
);

module.exports = router;
