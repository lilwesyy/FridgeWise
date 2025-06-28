const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Recipe title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Recipe description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  ingredients: [{
    ingredientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ingredient',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      required: true,
      enum: [
        'g', 'kg', 'ml', 'l', 'cup', 'cups', 'tbsp', 'tsp', 
        'oz', 'lb', 'piece', 'pieces', 'slice', 'slices',
        'clove', 'cloves', 'bunch', 'handful', 'pinch', 'dash'
      ]
    },
    required: {
      type: Boolean,
      default: true
    },
    notes: {
      type: String,
      trim: true
    }
  }],
  instructions: [{
    step: {
      type: Number,
      required: true
    },
    instruction: {
      type: String,
      required: true,
      trim: true
    },
    duration: {
      type: Number, // minutes
      default: null
    }
  }],
  prepTime: {
    type: Number, // minutes
    required: true,
    min: 0
  },
  cookTime: {
    type: Number, // minutes
    required: true,
    min: 0
  },
  servings: {
    type: Number,
    required: true,
    min: 1,
    max: 20
  },
  difficulty: {
    level: {
      type: String,
      required: true,
      enum: ['easy', 'medium', 'hard']
    },
    reasons: [{
      type: String,
      enum: [
        'quick-prep',
        'simple-techniques',
        'few-ingredients',
        'special-equipment',
        'advanced-techniques',
        'long-cook-time',
        'many-steps',
        'timing-critical'
      ]
    }]
  },
  cuisine: {
    type: String,
    required: true,
    enum: [
      'american', 'italian', 'french', 'chinese', 'japanese', 'indian',
      'mexican', 'thai', 'greek', 'spanish', 'turkish', 'korean',
      'vietnamese', 'middle-eastern', 'mediterranean', 'german',
      'british', 'russian', 'african', 'fusion', 'international'
    ]
  },
  tags: [{
    type: String,
    enum: [
      'breakfast', 'lunch', 'dinner', 'snack', 'appetizer', 'dessert',
      'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'low-carb',
      'keto', 'paleo', 'healthy', 'comfort-food', 'quick', 'one-pot',
      'baking', 'grilling', 'roasting', 'stir-fry', 'soup', 'salad'
    ]
  }],
  nutrition: {
    perServing: {
      calories: {
        type: Number,
        required: true,
        min: 0
      },
      protein: {
        type: Number,
        required: true,
        min: 0
      },
      carbs: {
        type: Number,
        required: true,
        min: 0
      },
      fat: {
        type: Number,
        required: true,
        min: 0
      },
      fiber: {
        type: Number,
        default: 0
      },
      sugar: {
        type: Number,
        default: 0
      },
      sodium: {
        type: Number,
        default: 0
      }
    }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  matchingScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  seasonality: [{
    type: String,
    enum: ['spring', 'summer', 'fall', 'winter', 'year-round']
  }],
  cookingMethod: [{
    type: String,
    enum: [
      'baking', 'roasting', 'grilling', 'frying', 'sauteing',
      'steaming', 'boiling', 'simmering', 'braising', 'slow-cooking',
      'pressure-cooking', 'stir-frying', 'raw', 'no-cook'
    ]
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  source: {
    type: String,
    default: 'fridgewise'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total time
recipeSchema.virtual('totalTime').get(function() {
  return this.prepTime + this.cookTime;
});

// Virtual for primary image
recipeSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0] || null;
});

// Indexes for efficient queries
recipeSchema.index({ 'ingredients.ingredientId': 1 });
recipeSchema.index({ difficulty: 1, prepTime: 1 });
recipeSchema.index({ cuisine: 1 });
recipeSchema.index({ tags: 1 });
recipeSchema.index({ 'rating.average': -1 });
recipeSchema.index({ matchingScore: -1 });

// Text search index
recipeSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text'
});

// Method to calculate ingredient match percentage
recipeSchema.methods.calculateMatchPercentage = function(availableIngredientIds) {
  const requiredIngredients = this.ingredients.filter(ing => ing.required);
  const optionalIngredients = this.ingredients.filter(ing => !ing.required);
  
  const availableSet = new Set(availableIngredientIds.map(id => id.toString()));
  
  const requiredMatches = requiredIngredients.filter(ing => 
    availableSet.has(ing.ingredientId.toString())
  ).length;
  
  const optionalMatches = optionalIngredients.filter(ing => 
    availableSet.has(ing.ingredientId.toString())
  ).length;
  
  // Calculate percentage: required ingredients weight 80%, optional 20%
  const requiredWeight = 0.8;
  const optionalWeight = 0.2;
  
  const requiredPercentage = requiredIngredients.length > 0 
    ? (requiredMatches / requiredIngredients.length) * requiredWeight 
    : requiredWeight;
    
  const optionalPercentage = optionalIngredients.length > 0 
    ? (optionalMatches / optionalIngredients.length) * optionalWeight 
    : 0;
  
  return Math.round((requiredPercentage + optionalPercentage) * 100);
};

// Static method for finding recipes by ingredients
recipeSchema.statics.findByIngredients = function(ingredientIds, options = {}) {
  const {
    minMatchPercentage = 50,
    cuisine,
    difficulty,
    maxPrepTime,
    tags,
    limit = 20,
    page = 1
  } = options;
  
  let query = {
    'ingredients.ingredientId': { $in: ingredientIds }
  };
  
  if (cuisine) query.cuisine = cuisine;
  if (difficulty) query['difficulty.level'] = difficulty;
  if (maxPrepTime) query.prepTime = { $lte: maxPrepTime };
  if (tags && tags.length > 0) query.tags = { $in: tags };
  
  return this.find(query)
    .populate('ingredients.ingredientId', 'name category')
    .sort({ 'rating.average': -1, matchingScore: -1 })
    .limit(limit)
    .skip((page - 1) * limit);
};

// Pre-save middleware to sort instructions by step
recipeSchema.pre('save', function(next) {
  if (this.isModified('instructions')) {
    this.instructions.sort((a, b) => a.step - b.step);
  }
  next();
});

module.exports = mongoose.model('Recipe', recipeSchema);
