const express = require('express');
const { upload, uploadImage, deleteImage } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.post('/image', protect, upload.single('image'), uploadImage);
router.delete('/image/:publicId', protect, deleteImage);

module.exports = router;
