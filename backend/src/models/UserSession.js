const mongoose = require('mongoose');

const userSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: {
    type: String,
    default: null
  },
  detectedIngredients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ingredient'
  }],
  suggestedRecipes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  }],
  searchCriteria: {
    cuisine: String,
    difficulty: String,
    maxPrepTime: Number,
    tags: [String],
    minMatchPercentage: Number
  },
  userFeedback: {
    helpful: {
      type: Boolean,
      default: null
    },
    cookedRecipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
      default: null
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    comments: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
userSessionSchema.index({ userId: 1, createdAt: -1 });
userSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // Auto-delete after 30 days

// Virtual for session age
userSessionSchema.virtual('sessionAge').get(function() {
  return Date.now() - this.createdAt.getTime();
});

module.exports = mongoose.model('UserSession', userSessionSchema);
