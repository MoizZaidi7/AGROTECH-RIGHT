import React, { useState } from 'react';
import { FaShoppingCart, FaTimes, FaMoneyBillWave, FaTrash, FaBox, FaMinus, FaPlus } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import PaymentComponent from '../../../components/PaymentComponent';

const CartSidebar = ({
  cartOpen,
  setCartOpen,
  cartItems,
  orderDetails,
  setOrderDetails,
  loading,
  handleUpdateCartItem,
  handleRemoveFromCart,
  handleCheckout,
  setActiveTab,
  stripePublishableKey
}) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  const handleCheckoutWithPayment = async () => {
    try {
      const order = await handleCheckout();
      if (order && order._id) {
        setCurrentOrder(order);
        if (orderDetails.paymentMethod === 'stripe') {
          setShowPaymentModal(true);
        } else {
          // For COD, just close the cart
          setCartOpen(false);
        }
      }
    } catch (err) {
      console.error('Checkout error:', err);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setCartOpen(false);
  };

  const totalAmount = cartItems.reduce((total, item) => total + (item.productId.price * item.quantity), 0);
  
  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {cartOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Cart Sidebar */}
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: cartOpen ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white shadow-2xl z-50 flex flex-col max-h-screen"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 flex justify-between items-center shadow-md">
          <div className="flex items-center">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg mr-3">
              <FaShoppingCart className="text-2xl text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Your Cart</h2>
              {cartItems.length > 0 && (
                <p className="text-green-100 text-sm">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</p>
              )}
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCartOpen(false)}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <FaTimes className="text-xl" />
          </motion.button>
        </div>
      
      {/* Main content - scrollable */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {/* Cart items section */}
        <div className="p-6">
          {cartItems.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaShoppingCart className="text-5xl text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Your cart is empty</h3>
              <p className="text-gray-600 mb-6">Add some products to get started</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setCartOpen(false);
                  setActiveTab('browse');
                }}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-md font-semibold"
              >
                Browse Products
              </motion.button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {cartItems.map((item, index) => (
                  <motion.div 
                    key={item._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden border-2 border-green-100 shadow-md">
                      {item.productId.images?.[0] ? (
                        <img 
                          src={item.productId.images[0]} 
                          alt={item.productId.name} 
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaBox className="text-gray-400 text-2xl" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">{item.productId.name}</h3>
                      <p className="text-green-600 font-bold text-lg mb-2">₨{item.productId.price.toLocaleString()}</p>
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleUpdateCartItem(item._id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-700 rounded-lg font-bold transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <FaMinus className="text-xs" />
                        </motion.button>
                        <span className="w-12 text-center font-bold text-gray-900">{item.quantity}</span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleUpdateCartItem(item._id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-700 rounded-lg font-bold transition-colors"
                          disabled={item.quantity >= item.productId.stock}
                        >
                          <FaPlus className="text-xs" />
                        </motion.button>
                      </div>
                      {item.quantity >= item.productId.stock && (
                        <p className="text-xs text-red-600 mt-1">Max stock reached</p>
                      )}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRemoveFromCart(item._id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors ml-2"
                    >
                      <FaTrash />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
        
        {/* Order details section - only show if there are items */}
        {cartItems.length > 0 && (
          <div className="p-6 bg-white mx-4 rounded-2xl shadow-md mb-4">
            {/* Price summary */}
            <div className="mb-6">
              <h4 className="font-bold text-gray-900 text-lg mb-4 flex items-center">
                <FaMoneyBillWave className="mr-2 text-green-600" />
                Order Summary
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">₨{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t-2 border-green-100">
                  <span>Total</span>
                  <span className="text-green-600">₨{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            {/* Shipping details */}
            <div className="mb-6">
              <h4 className="font-bold text-gray-900 mb-4">Shipping Details</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={orderDetails.fullName}
                    onChange={(e) => setOrderDetails({...orderDetails, fullName: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={orderDetails.phone}
                    onChange={(e) => setOrderDetails({...orderDetails, phone: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                    placeholder="+92 300 1234567"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Address *</label>
                  <textarea
                    value={orderDetails.address}
                    onChange={(e) => setOrderDetails({...orderDetails, address: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all resize-none"
                    rows="3"
                    placeholder="Enter your complete address"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">City *</label>
                    <input
                      type="text"
                      value={orderDetails.city}
                      onChange={(e) => setOrderDetails({...orderDetails, city: e.target.value})}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                      placeholder="City"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Postal Code</label>
                    <input
                      type="text"
                      value={orderDetails.postalCode}
                      onChange={(e) => setOrderDetails({...orderDetails, postalCode: e.target.value})}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                      placeholder="54000"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Payment method */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Payment Method</h4>
              
              <div className="space-y-3">
                <motion.label 
                  whileHover={{ scale: 1.02 }}
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    orderDetails.paymentMethod === 'stripe' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-green-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="stripe"
                    checked={orderDetails.paymentMethod === 'stripe'}
                    onChange={() => setOrderDetails({...orderDetails, paymentMethod: 'stripe'})}
                    className="mr-3 w-5 h-5 text-green-600 focus:ring-green-500"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">Credit/Debit Card</p>
                    <p className="text-sm text-gray-600">Pay securely with Stripe</p>
                  </div>
                  {orderDetails.paymentMethod === 'stripe' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </motion.label>
                
                <motion.label 
                  whileHover={{ scale: 1.02 }}
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    orderDetails.paymentMethod === 'cod' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-green-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={orderDetails.paymentMethod === 'cod'}
                    onChange={() => setOrderDetails({...orderDetails, paymentMethod: 'cod'})}
                    className="mr-3 w-5 h-5 text-green-600 focus:ring-green-500"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">Cash on Delivery</p>
                    <p className="text-sm text-gray-600">Pay when you receive</p>
                  </div>
                  {orderDetails.paymentMethod === 'cod' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </motion.label>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer with checkout button - fixed at bottom */}
      {cartItems.length > 0 && (
        <div className="p-6 bg-white border-t-2 border-gray-100 shadow-lg">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCheckoutWithPayment}
            className="w-full flex items-center justify-center py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all font-bold text-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !orderDetails.fullName || !orderDetails.phone || !orderDetails.address || !orderDetails.city}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <FaMoneyBillWave className="mr-3 text-xl" /> Proceed to Checkout (₨{totalAmount.toLocaleString()})
              </>
            )}
          </motion.button>
        </div>
      )}

      {/* Payment modal */}
      <AnimatePresence>
        {showPaymentModal && currentOrder && (
          <PaymentComponent
            orderId={currentOrder._id}
            orderTotal={totalAmount}
            onPaymentSuccess={handlePaymentSuccess}
            onClose={() => setShowPaymentModal(false)}
            stripePublishableKey={stripePublishableKey}
          />
        )}
      </AnimatePresence>
    </motion.div>
    </>
  );
};

export default CartSidebar;