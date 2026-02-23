import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // Enable HTTPS
});

// Custom folder naming for agricultural products
const getCloudinaryFolder = (req) => {
  const baseFolder = 'agrotech-marketplace';
  
  // Differentiate folders by user role if available
  if (req.user) {
    return `${baseFolder}/${req.user.role}s/${req.user._id}`;
  }
  return baseFolder;
};

// Custom filename for agricultural products
const getCloudinaryFilename = (req, file) => {
  const timestamp = Date.now();
  const originalName = file.originalname.split('.')[0];
  const productId = req.body.productId || 'new';
  
  return `product-${productId}-${originalName}-${timestamp}`;
};

// Storage configuration for agricultural product images
const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: getCloudinaryFolder(req),
    public_id: getCloudinaryFilename(req, file),
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 800, crop: 'limit' }, // Standardize image size
      { quality: 'auto:good' } // Optimize quality
    ],
    resource_type: 'auto'
  })
});

// File filter for agricultural product images
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WEBP are allowed.'), false);
  }
};

// Multer configuration optimized for agricultural product uploads
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max per file
    files: 5 // Max 5 files per upload
  }
});

// Middleware for handling upload errors
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    return res.status(400).json({
      success: false,
      message: err.code === 'LIMIT_FILE_SIZE' 
        ? 'File too large (max 5MB)' 
        : 'File upload error'
    });
  } else if (err) {
    // Other errors
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to upload files'
    });
  }
  next();
};

export { upload, handleUploadErrors };