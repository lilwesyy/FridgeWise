const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp').split(',');
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
    }
  }
});

// @desc    Upload image to Cloudinary
// @route   POST /api/uploads/image
// @access  Private
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    // Upload to Cloudinary using buffer
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'fridgewise/ingredients',
          transformation: [
            { width: 1024, height: 1024, crop: 'limit', quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    res.status(200).json({
      success: true,
      data: {
        imageUrl: result.secure_url,
        publicId: result.public_id,
        dimensions: { width: result.width, height: result.height },
        size: result.bytes,
        message: 'Image uploaded successfully'
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Delete image from Cloudinary
// @route   DELETE /api/uploads/image/:publicId
// @access  Private
const deleteImage = async (req, res, next) => {
  try {
    const { publicId } = req.params;

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      res.status(200).json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Image not found or already deleted'
      });
    }

  } catch (error) {
    next(error);
  }
};

module.exports = {
  upload,
  uploadImage,
  deleteImage
};
