const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ingredient name is required'],
    trim: true,
    unique: true,
    lowercase: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'vegetables',
      'fruits',
      'meat',
      'poultry',
      'seafood',
      'dairy',
      'grains',
      'legumes',
      'nuts-seeds',
      'herbs-spices',
      'oils-fats',
      'condiments',
      'pantry',
      'beverages',
      'other'
    ]
  },
  nutritionPer100g: {
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
      default: 0,
      min: 0
    },
    sugar: {
      type: Number,
      default: 0,
      min: 0
    },
    sodium: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  commonNames: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  shelfLife: {
    type: Number,
    required: true,
    min: 1 // days
  },
  storageType: {
    type: String,
    required: true,
    enum: ['fridge', 'pantry', 'freezer', 'room-temperature']
  },
  imageUrl: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Text index for search functionality
ingredientSchema.index({ 
  name: 'text', 
  commonNames: 'text' 
}, {
  weights: {
    name: 10,
    commonNames: 5
  }
});

// Index for category filtering
ingredientSchema.index({ category: 1 });

// Virtual for formatted nutrition display
ingredientSchema.virtual('nutritionSummary').get(function() {
  return {
    calories: this.nutritionPer100g.calories,
    macros: {
      protein: this.nutritionPer100g.protein,
      carbs: this.nutritionPer100g.carbs,
      fat: this.nutritionPer100g.fat
    }
  };
});

// Method to add common name
ingredientSchema.methods.addCommonName = function(name) {
  const normalizedName = name.toLowerCase().trim();
  if (!this.commonNames.includes(normalizedName)) {
    this.commonNames.push(normalizedName);
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method for search
ingredientSchema.statics.searchByName = function(query, limit = 20) {
  return this.find(
    { $text: { $search: query } },
    { score: { $meta: 'textScore' } }
  )
  .sort({ score: { $meta: 'textScore' } })
  .limit(limit);
};

module.exports = mongoose.model('Ingredient', ingredientSchema);
