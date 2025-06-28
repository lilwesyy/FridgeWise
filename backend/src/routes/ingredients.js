const express = require('express');
const {
  detectFromImage,
  searchIngredients,
  addCustomIngredient,
  getIngredientById,
  getCategories,
  seedDatabase
} = require('../controllers/ingredientController');
const { protect, checkUsageLimit, incrementUsage } = require('../middleware/auth');
const { validateIngredientDetection } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/categories', getCategories);
router.post('/seed-dev', seedDatabase);

// Protected routes
router.post('/detect-from-image', 
  protect, 
  checkUsageLimit('photos'), 
  validateIngredientDetection,
  incrementUsage('photos'),
  detectFromImage
);

router.get('/search', protect, searchIngredients);
router.post('/custom-add', protect, addCustomIngredient);

// Dynamic routes (must be last)
router.get('/:id', protect, getIngredientById);

module.exports = router;
