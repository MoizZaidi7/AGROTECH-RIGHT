// 📁 routes/FarmerRoutes.js
import express from 'express';
import { createComplaint, viewComplaint } from '../controllers/FarmerController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import authorize from '../middleware/authorize.js';
import { updateLastActivity } from '../middleware/lastactivity.js';
import { 
  createProduct, 
  updateInventory, 
  createCampaign, 
  getProducts, 
  getFarmerProducts, 
  updateProduct, 
  deleteProduct, 
  getFarmerOrders 
} from '../controllers/MarketPlaceController.js';
import { handleUploadErrors, upload } from '../config/multer.js';
import { checkInactivity } from '../middleware/inactivity.js';
import { 
  createSchedule, 
  getSchedules, 
  updateSchedule, 
  getRecommendations, 
  getEquipment, 
  requestEquipment, 
  getHandlingGuide, 
  returnEquipment, 
  deleteSchedule
} from '../controllers/HarvestController.js';
import { 
  getTransportOptions,
  getPackagingMaterials,
  getTransportGuidelines,
  createTransportRequest,
  getRouteDetails,
  getFarmerTransportRequests
} from '../controllers/TransportController.js';
import {getFarmerAssessments, getFarmerReservations, getStorageFacilities, reserveStorageFacility, filterStorageFacilities} from '../controllers/StorageController.js'
import {getTrainingModuleById, getTrainingModules, createTrainingModule} from '../controllers/TrainingController.js'
import {getStorageGuidelineById, filterGuidelines, createStorageGuideline, getStorageGuidelines} from '../controllers/GuidelineController.js'
import {createScheduleSchema, updateScheduleSchema, equipmentRequestSchema, harvestQueryValidations} from '../middleware/harvestValidation.js';
import validate from '../middleware/validate.js';
import { assessCropMaturity } from '../controllers/ClaudeController.js';
import { uploadfile } from '../config/multerlocal.js';
import { assessCropQuality } from '../controllers/CropQualityController.js';
import {
  createEquipmentPaymentIntent,
  createStoragePaymentIntent,
  createTransportPaymentIntent,
  handlePaymentWebhook
} from '../controllers/PaymentController.js';

const FarmerRouter = express.Router();

// Apply activity tracking middleware
FarmerRouter.use(updateLastActivity);

// =======================
// 🛒 Marketplace Routes
// =======================
FarmerRouter.post(
  '/products',
  authMiddleware,
  authorize(['Farmer']),
  upload.array('images', 5),
  handleUploadErrors, // ✅ attach here
  createProduct
);

FarmerRouter.get('/products/my-products', 
  authMiddleware, 
  authorize(['Farmer']), 
  getFarmerProducts
);

FarmerRouter.put('/products/:id', 
  authMiddleware, 
  authorize(['Farmer']), 
  upload.array('images', 5), 
  updateProduct
);

FarmerRouter.delete('/products/:id', 
  authMiddleware, 
  authorize(['Farmer']), 
  deleteProduct
);

FarmerRouter.get('/orders/farmer-orders', 
  authMiddleware, 
  authorize(['Farmer']), 
  getFarmerOrders
);

FarmerRouter.put('/inventory', 
  authMiddleware, 
  authorize(['Farmer']), 
  updateInventory
);

FarmerRouter.post('/campaigns', 
  authMiddleware, 
  authorize(['Farmer']), 
  createCampaign
);

// =======================
// 🆘 Complaint Routes
// =======================
FarmerRouter.post("/complaints", 
  authMiddleware, 
  authorize(['Farmer']), 
  createComplaint
);

FarmerRouter.get("/complaints", 
  authMiddleware, 
  authorize(['Farmer']), 
  viewComplaint
);

// =======================
// 🌾 Harvest Management Routes
// =======================

// Schedule routes
FarmerRouter.post('/harvest/schedule', 
  authMiddleware, 
  authorize(['Farmer']), 
  validate(createScheduleSchema), 
  createSchedule
);

FarmerRouter.get('/harvest/schedules', 
  authMiddleware, 
  authorize(['Farmer']), 
  getSchedules
);

FarmerRouter.patch('/harvest/schedule/:id', 
  authMiddleware, 
  authorize(['Farmer']), 
  validate(updateScheduleSchema), 
  updateSchedule
);

FarmerRouter.delete(
  '/harvest/schedule/:id',
  authMiddleware,
  authorize(['Farmer']),
  deleteSchedule
);


// Recommendation routes
FarmerRouter.get('/harvest/recommendations', 
  authMiddleware, 
  authorize(['Farmer']), 
  getRecommendations
);

// Equipment routes
FarmerRouter.get('/harvest/equipment', 
  authMiddleware, 
  authorize(['Farmer']), 
  getEquipment
);

FarmerRouter.post('/harvest/equipment/request', 
  authMiddleware, 
  authorize(['Farmer']), 
  validate(equipmentRequestSchema), 
  requestEquipment
);

FarmerRouter.post('/harvest/equipment/return', 
  authMiddleware, 
  authorize(['Farmer']), 
  returnEquipment
);

// Handling guide routes
FarmerRouter.get('/harvest/handling-guide', 
  authMiddleware, 
  authorize(['Farmer']), 
  getHandlingGuide
);

// Transport Routes
FarmerRouter.get('/transport/options', 
  authMiddleware, 
  authorize(['Farmer']), 
  getTransportOptions
);

// Packaging materials
FarmerRouter.get('/transport/packaging', 
  authMiddleware, 
  authorize(['Farmer']), 
  getPackagingMaterials
);

// Transport guidelines
FarmerRouter.get('/transport/guidelines', 
  authMiddleware, 
  authorize(['Farmer']), 
  getTransportGuidelines
);

// Create transport request
FarmerRouter.post('/transport/request', 
  authMiddleware, 
  authorize(['Farmer']), 
  createTransportRequest
);

// Calculate route
FarmerRouter.post('/transport/route', 
  authMiddleware, 
  authorize(['Farmer']), 
  getRouteDetails
);

// Get farmer's transport requests
FarmerRouter.get('/transport/requests', 
  authMiddleware, 
  authorize(['Farmer']), 
  getFarmerTransportRequests
);
// Storage facilities
FarmerRouter.get('/storage/facilities', 
  authMiddleware, 
  authorize(['Farmer']), 
  getStorageFacilities
);

FarmerRouter.get('/storage/facilities/filter', 
  authMiddleware, 
  authorize(['Farmer']), 
  filterStorageFacilities
);

FarmerRouter.post('/storage/reserve', 
  authMiddleware, 
  authorize(['Farmer']), 
  reserveStorageFacility
);

FarmerRouter.get('/storage/reservations', 
  authMiddleware, 
  authorize(['Farmer']), 
  getFarmerReservations
);

// Crop assessment
FarmerRouter.post('/crop/assess', 
  authMiddleware, 
  authorize(['Farmer']), 
  assessCropQuality
);

FarmerRouter.get('/crop/assessments', 
  authMiddleware, 
  authorize(['Farmer']), 
  getFarmerAssessments
);

// Training modules
FarmerRouter.get('/training/modules', 
  authMiddleware, 
  authorize(['Farmer']), 
  getTrainingModules
);

FarmerRouter.get('/training/modules/:id', 
  authMiddleware, 
  authorize(['Farmer']), 
  getTrainingModuleById
);

// Storage guidelines
FarmerRouter.get('/storage/guidelines', 
  authMiddleware, 
  authorize(['Farmer']), 
  getStorageGuidelines
);

FarmerRouter.get('/storage/guidelines/filter', 
  authMiddleware, 
  authorize(['Farmer']), 
  filterGuidelines
);

FarmerRouter.get('/storage/guidelines/:id', 
  authMiddleware, 
  authorize(['Farmer']), 
  getStorageGuidelineById
);

FarmerRouter.post('/cropmaturity'
  ,authMiddleware,
  uploadfile.single('image'),
  authorize(['Farmer']), 
  assessCropMaturity)

FarmerRouter.post('/cropquality'
  ,authMiddleware,
  uploadfile.single('image'),
  authorize(['Farmer']), 
  assessCropQuality)

FarmerRouter.post('/payment/equipment', authMiddleware,  authorize(['Farmer']), 
 createEquipmentPaymentIntent);
FarmerRouter.post('/payment/storage', authMiddleware,  authorize(['Farmer']), 
 createStoragePaymentIntent);
FarmerRouter.post('/payment/transport', authMiddleware,   authorize(['Farmer']), 
createTransportPaymentIntent);
FarmerRouter.post('/payment/webhook', express.raw({ type: 'application/json' }), handlePaymentWebhook);

export default FarmerRouter;