const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Registration validation rules
const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  validate
];

// Login validation rules
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate
];

// Profile update validation rules
const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('dietaryPreferences')
    .optional()
    .isArray()
    .withMessage('Dietary preferences must be an array'),
  body('dietaryPreferences.*')
    .optional()
    .isIn(['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'low-carb', 'keto', 'paleo', 'mediterranean'])
    .withMessage('Invalid dietary preference'),
  body('allergies')
    .optional()
    .isArray()
    .withMessage('Allergies must be an array'),
  body('calorieGoal')
    .optional()
    .isInt({ min: 800, max: 5000 })
    .withMessage('Calorie goal must be between 800 and 5000'),
  body('activityLevel')
    .optional()
    .isIn(['sedentary', 'lightly-active', 'moderately-active', 'very-active', 'extremely-active'])
    .withMessage('Invalid activity level'),
  validate
];

// Recipe search validation
const validateRecipeSearch = [
  body('ingredients')
    .isArray({ min: 1 })
    .withMessage('At least one ingredient is required'),
  body('ingredients.*')
    .isMongoId()
    .withMessage('Invalid ingredient ID'),
  body('cuisine')
    .optional()
    .isIn(['american', 'italian', 'french', 'chinese', 'japanese', 'indian', 'mexican', 'thai', 'greek', 'spanish', 'turkish', 'korean', 'vietnamese', 'middle-eastern', 'mediterranean', 'german', 'british', 'russian', 'african', 'fusion', 'international'])
    .withMessage('Invalid cuisine type'),
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Invalid difficulty level'),
  body('maxPrepTime')
    .optional()
    .isInt({ min: 1, max: 480 })
    .withMessage('Max prep time must be between 1 and 480 minutes'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  validate
];

// Ingredient detection validation
const validateIngredientDetection = [
  body('confidence')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Confidence must be between 0 and 1'),
  validate
];

module.exports = {
  validate,
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validateRecipeSearch,
  validateIngredientDetection
};
