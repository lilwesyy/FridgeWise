const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      profile: { name }
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.profile.name,
          subscription: user.subscription,
          isSupporter: user.isSupporter // aggiunto
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Reset monthly usage if needed
    await user.resetMonthlyUsage();

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.profile.name,
          subscription: user.subscription,
          isSupporter: user.isSupporter // aggiunto
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          profile: user.profile,
          subscription: user.subscription,
          isSupporter: user.isSupporter, // aggiunto
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, dietaryPreferences, allergies, calorieGoal, activityLevel } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (name) user.profile.name = name;
    if (dietaryPreferences) user.profile.dietaryPreferences = dietaryPreferences;
    if (allergies) user.profile.allergies = allergies;
    if (calorieGoal) user.profile.calorieGoal = calorieGoal;
    if (activityLevel) user.profile.activityLevel = activityLevel;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          profile: user.profile,
          subscription: user.subscription
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get usage statistics
// @route   GET /api/auth/usage
// @access  Private
const getUsage = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    const limits = {
      photos: user.isSubscriptionActive ? 'unlimited' : 3,
      recipes: user.isSubscriptionActive ? 'unlimited' : 10
    };
    
    res.status(200).json({
      success: true,
      data: {
        usage: user.subscription.usageCount,
        limits,
        subscription: {
          tier: user.subscription.tier,
          isActive: user.isSubscriptionActive,
          validUntil: user.subscription.validUntil
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  getUsage
};
