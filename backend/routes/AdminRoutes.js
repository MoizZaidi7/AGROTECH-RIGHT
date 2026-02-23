import express from 'express';
import {
  getRegisteredUsers,
  updateUserDetails,
  deleteUser,
  fetchComplaints,
  resolveComplaints,
  generateReport,
  fetchReports,
  registerUserByAdmin,
} from '../controllers/AdminController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import authorize from '../middleware/authorize.js';
import { updateLastActivity } from '../middleware/lastactivity.js';
import { addEquipment, removeEquipment, acceptEquipmentRequest, rejectEquipmentRequest, createRecommendation, createHandlingGuide, getEquipment, getAllEquipment, fetchEquipmentRequests, markEquipmentForMaintenance } from '../controllers/HarvestController.js';
import { AdminDeleteProduct, AdminUpdateProduct, deleteBidById, getAllCustomerOrders, getCustomerBids, getProductBids } from '../controllers/MarketPlaceController.js';
import { upload } from '../config/multer.js';
import { uploadfile } from '../config/multerlocal.js';
const AdminRouter = express.Router();

AdminRouter.use(updateLastActivity);

AdminRouter.get('/users', authMiddleware, authorize(['Admin']), getRegisteredUsers); // Only Admin can view users
AdminRouter.put('/users/:userId', authMiddleware, authorize(['Admin']), updateUserDetails); // Only Admin can edit users
AdminRouter.delete('/users/:userId', authMiddleware, authorize(['Admin']), deleteUser); // Only Admin can delete users
AdminRouter.get('/complaints', authMiddleware, authorize(['Admin']), fetchComplaints); // Only Admin can fetch complaints
AdminRouter.put('/complaints/:complaintId', authMiddleware, authorize(['Admin']), resolveComplaints); // Only Admin can resolve complaints
AdminRouter.post('/generate-report', authMiddleware, authorize(['Admin']), generateReport); // Only Admin can generate reports
AdminRouter.get('/reports', authMiddleware, authorize(['Admin']), fetchReports); // Only Admin can view reports
AdminRouter.post('/registerUser', authMiddleware, authorize(['Admin']), registerUserByAdmin); // Only Admin can register users


AdminRouter.post('/harvest/HandlingGuide', authMiddleware, authorize(['Admin']), createHandlingGuide);
AdminRouter.post('/harvest/recommendations', authMiddleware, authorize(['Admin']), createRecommendation);
AdminRouter.get('/harvest/equipment', authMiddleware, authorize(['Admin']), getEquipment); // get new equipment
AdminRouter.post(
  '/harvest/equipment',
  authMiddleware,
  authorize(['Admin']),
  uploadfile.single('image'),  // Use 'image' as the field name
  addEquipment
);
AdminRouter.delete('/harvest/equipment/:equipmentId', authMiddleware, authorize(['Admin']), removeEquipment); // Remove equipment
AdminRouter.patch('/harvest/equipment/request/:requestId/accept', authMiddleware, authorize(['Admin']), acceptEquipmentRequest); // Accept equipment request
AdminRouter.patch('/harvest/equipment/request/:requestId/reject', authMiddleware, authorize(['Admin']), rejectEquipmentRequest);
AdminRouter.get('/equipment/requests', authMiddleware, authorize(['Admin']), fetchEquipmentRequests);
AdminRouter.patch(
  '/harvest/equipment/:equipmentId/maintenance',
  authMiddleware,
  authorize(['Admin']),
  markEquipmentForMaintenance
);


AdminRouter.put('/products/:id', authMiddleware, authorize(['Admin']), AdminUpdateProduct);
AdminRouter.delete('/products/:id', authMiddleware, authorize(['Admin']), AdminDeleteProduct);
AdminRouter.get('/orders', authMiddleware, authorize(['Admin']), getAllCustomerOrders);

AdminRouter.get('/bids/my-bids', authMiddleware, authorize(['Admin']), getCustomerBids);
AdminRouter.get('/bids/product/:id', authMiddleware, authorize(['Admin']), getProductBids);
AdminRouter.delete('/bids/:bidId', authMiddleware, authorize(['Admin']), deleteBidById);





export default AdminRouter;