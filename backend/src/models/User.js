const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  profile: {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    dietaryPreferences: [{
      type: String,
      enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'low-carb', 'keto', 'paleo', 'mediterranean']
    }],
    allergies: [{
      type: String,
      trim: true
    }],
    calorieGoal: {
      type: Number,
      min: [800, 'Calorie goal too low'],
      max: [5000, 'Calorie goal too high']
    },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'lightly-active', 'moderately-active', 'very-active', 'extremely-active'],
      default: 'moderately-active'
    }
  },
  subscription: {
    tier: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free'
    },
    validUntil: {
      type: Date,
      default: null
    },
    usageCount: {
      photos: {
        type: Number,
        default: 0
      },
      recipes: {
        type: Number,
        default: 0
      },
      lastReset: {
        type: Date,
        default: Date.now
      }
    }
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  }],
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isSupporter: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for checking if subscription is active
userSchema.virtual('isSubscriptionActive').get(function() {
  return this.subscription.tier === 'premium' && 
         this.subscription.validUntil && 
         this.subscription.validUntil > new Date();
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to reset monthly usage
userSchema.methods.resetMonthlyUsage = function() {
  const now = new Date();
  const lastReset = this.subscription.usageCount.lastReset;
  
  // Check if a month has passed
  if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    this.subscription.usageCount.photos = 0;
    this.subscription.usageCount.recipes = 0;
    this.subscription.usageCount.lastReset = now;
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Method to check usage limits
userSchema.methods.canUseFeature = function(featureType) {
  if (this.isSubscriptionActive) return true;

  const limits = {
    photos: 3,    // 3 photo analyses per day
    recipes: 10   // 10 recipe suggestions per month (unchanged)
  };

  // Check if lastReset is today, otherwise reset
  const now = new Date();
  const lastReset = this.subscription.usageCount.lastReset;
  const isSameDay = now.getDate() === lastReset.getDate() &&
                    now.getMonth() === lastReset.getMonth() &&
                    now.getFullYear() === lastReset.getFullYear();
  if (!isSameDay) {
    this.subscription.usageCount.photos = 0;
    this.subscription.usageCount.lastReset = now;
    this.save();
  }

  return this.subscription.usageCount[featureType] < limits[featureType];
};

// Index for efficient queries
userSchema.index({ 'subscription.tier': 1 });

module.exports = mongoose.model('User', userSchema);
