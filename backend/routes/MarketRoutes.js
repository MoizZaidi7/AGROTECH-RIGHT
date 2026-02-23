import express from 'express';
import {
  createOrder,
  updateOrderStatus,
  placeBid,
  initiatePayment,
  getCustomerOrders,
  getCustomerBids,
  confirmPayment,
  addToCart,
  acceptBid,
  rejectBid,
  checkoutCart,
  updateCartItem,
  removeFromCart,
  getProducts,
  getProductBids,
  fetchCartItems,
  updateProduct,
  deleteProduct,
  processPaymentConfirmation,
  submitReview,
  getFarmerReviews,
  getFarmerOrders
} from '../controllers/MarketPlaceController.js';

import authMiddleware from '../middleware/authMiddleware.js';
import { updateLastActivity } from '../middleware/lastactivity.js';

const MarketRouter = express.Router();

MarketRouter.use(updateLastActivity);

// FE-5: Direct Purchase
MarketRouter.post('/orders', authMiddleware, createOrder);
MarketRouter.put('/orders/:id', authMiddleware, updateOrderStatus);
MarketRouter.get('/orders/farmer-orders', authMiddleware, getFarmerOrders);
MarketRouter.get('/orders/customer-orders', authMiddleware, getCustomerOrders);

// FE-6: Bidding System
MarketRouter.post('/bids', authMiddleware, placeBid);
MarketRouter.get('/bids', authMiddleware, getCustomerBids);
MarketRouter.get('/bids/product/:id', authMiddleware, getProductBids);       // ✅ NEW
MarketRouter.put('/bids/:id/accept', authMiddleware, acceptBid);             // ✅ NEW
MarketRouter.put('/bids/:id/reject', authMiddleware, rejectBid);             // ✅ NEW


MarketRouter.get('/products',authMiddleware, getProducts);

MarketRouter.post('/orders/:orderId/review', authMiddleware, submitReview);
MarketRouter.get('/farmers/:farmerId/reviews', authMiddleware, getFarmerReviews)

// Cart System
MarketRouter.post('/cart', authMiddleware, addToCart);
MarketRouter.put('/cart/:id', authMiddleware, updateCartItem);               // ✅ NEW
MarketRouter.delete('/cart/:id', authMiddleware, removeFromCart);            // ✅ NEW
MarketRouter.post('/orders/cart-checkout', authMiddleware, checkoutCart);    // ✅ NEW
MarketRouter.get('/cart', authMiddleware, fetchCartItems);                   // ✅ NEW


// FE-8: Payments
MarketRouter.post('/payment', authMiddleware, initiatePayment);
MarketRouter.post('/payment/confirm', authMiddleware, confirmPayment);
MarketRouter.put('/orders/:orderId/confirm-payment', authMiddleware, processPaymentConfirmation);

export default MarketRouter;
