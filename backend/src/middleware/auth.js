const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id);

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized, user not found'
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized, no token'
    });
  }
};

// Check if user can use feature (for freemium limits)
const checkUsageLimit = (featureType) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      
      // Reset monthly usage if needed
      await user.resetMonthlyUsage();
      
      // Allow unlimited usage for specific email
      if (user.email === 'mirco.carp@icloud.com') {
        return next();
      }

      // Check if user can use the feature
      if (!user.canUseFeature(featureType)) {
        return res.status(403).json({
          success: false,
          error: `Usage limit exceeded for ${featureType}. Please upgrade to premium.`,
          code: 'USAGE_LIMIT_EXCEEDED',
          upgradeRequired: true
        });
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Increment usage counter
const incrementUsage = (featureType) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      
      // Only increment for free users
      if (!user.isSubscriptionActive) {
        user.subscription.usageCount[featureType] += 1;
        await user.save();
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Premium only features
const premiumOnly = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.isSubscriptionActive) {
      return res.status(403).json({
        success: false,
        error: 'This feature requires a premium subscription',
        code: 'PREMIUM_REQUIRED',
        upgradeRequired: true
      });
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  protect,
  checkUsageLimit,
  incrementUsage,
  premiumOnly
};
