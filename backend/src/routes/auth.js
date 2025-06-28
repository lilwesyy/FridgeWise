const express = require('express');
const { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  getUsage 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { 
  validateRegistration, 
  validateLogin, 
  validateProfileUpdate 
} = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, validateProfileUpdate, updateProfile);
router.get('/usage', protect, getUsage);

module.exports = router;
