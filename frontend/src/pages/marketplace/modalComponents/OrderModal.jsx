import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaMoneyBillWave, FaShoppingCart, FaTimes, FaBox, FaStar } from 'react-icons/fa';
import PaymentComponent from '../../../components/PaymentComponent';

const OrderModal = ({
  isAddingToCart,
  selectedProductForOrder,
  orderQuantity,
  setOrderQuantity,
  orderDetails,
  setOrderDetails,
  loading,
  setSelectedProductForOrder,
  setIsAddingToCart,
  error,
  setError,
  handleAddToCart,
  handlePlaceOrder,
  stripePublishableKey,
  onSubmitReview,
  order
}) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handlePlaceOrderWithPayment = async () => {
    try {
      const order = await handlePlaceOrder();
      if (order && order._id) {
        setCurrentOrder({
          ...order,
          totalPrice: selectedProductForOrder.price * orderQuantity
        });
        if (orderDetails.paymentMethod === 'stripe') {
          setShowPaymentModal(true);
        } else {
          setShowReviewForm(true);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to place order');
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setSelectedProductForOrder(null);
    setOrderQuantity(1);
    setIsAddingToCart(false);
    setError('');
    setShowReviewForm(true);
  };

  const handleSubmitReview = () => {
    onSubmitReview({
      orderId: currentOrder?._id || order?._id,
      productId: selectedProductForOrder?._id || order?.productId,
      farmerId: selectedProductForOrder?.farmerId?._id || order?.farmerId,
      rating,
      feedback
    });
    setShowReviewForm(false);
    setRating(0);
    setFeedback('');
  };

  return (
    <>
      {/* Main Order Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col"
        >
          {/* Modal Header */}
          <div className="p-6 pb-0">
            {showReviewForm ? (
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-gray-800">Rate Your Purchase</h3>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-gray-800">
                  {isAddingToCart ? 'Add to Cart' : 'Place Order'}
                </h3>
                <button
                  onClick={() => {
                    setSelectedProductForOrder(null);
                    setIsAddingToCart(false);
                    setError('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>
            )}
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto p-6 flex-1">
            {showReviewForm ? (
              <div>
                <div className="mb-6">
                  <p className="text-gray-700 mb-3">How would you rate this product?</p>
                  <div className="flex justify-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={`text-3xl ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                      >
                        <FaStar />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Feedback (optional)</label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    rows="3"
                    placeholder="Share your experience with this product..."
                  />
                </div>
              </div>
            ) : (
              <>
                {selectedProductForOrder && (
                  <div className="mb-6">
                    <div className="flex items-center mb-4">
                      {selectedProductForOrder.images?.[0] ? (
                        <img
                          src={selectedProductForOrder.images[0]}
                          alt={selectedProductForOrder.name}
                          className="w-16 h-16 object-cover rounded-lg mr-4"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                          <FaBox className="text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-gray-800">{selectedProductForOrder.name}</h4>
                        <p className="text-green-600 font-bold">PKR {selectedProductForOrder.price}</p>
                        <div className="flex items-center mt-1">
                          {selectedProductForOrder.farmerId && (
                            <>
                              <div className="w-6 h-6 rounded-full bg-gray-300 mr-2 overflow-hidden">
                                {selectedProductForOrder.farmerId.profileImage && (
                                  <img
                                    src={selectedProductForOrder.farmerId.profileImage}
                                    alt={selectedProductForOrder.farmerId.name}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <span className="text-sm text-gray-600">
                                {selectedProductForOrder.farmerId.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">Quantity</label>
                      <div className="flex items-center">
                        <button
                          onClick={() => setOrderQuantity(prev => Math.max(1, prev - 1))}
                          className="px-3 py-1 bg-gray-200 rounded-l-lg"
                          disabled={orderQuantity <= 1}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={orderQuantity}
                          onChange={(e) =>
                            setOrderQuantity(Math.max(1, Math.min(selectedProductForOrder.stock, Number(e.target.value))))
                          }
                          className="w-16 text-center py-1 border-t border-b border-gray-300"
                          min="1"
                          max={selectedProductForOrder.stock}
                        />
                        <button
                          onClick={() => setOrderQuantity(prev => Math.min(selectedProductForOrder.stock, prev + 1))}
                          className="px-3 py-1 bg-gray-200 rounded-r-lg"
                          disabled={orderQuantity >= selectedProductForOrder.stock}
                        >
                          +
                        </button>
                        <span className="ml-2 text-gray-500 text-sm">
                          {selectedProductForOrder.stock} available
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {!isAddingToCart && (
                  <>
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-800 mb-3">Shipping Details</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-gray-700 text-sm mb-1">Full Name*</label>
                          <input
                            type="text"
                            value={orderDetails.fullName}
                            onChange={(e) => setOrderDetails({ ...orderDetails, fullName: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 text-sm mb-1">Phone Number*</label>
                          <input
                            type="tel"
                            value={orderDetails.phone}
                            onChange={(e) => setOrderDetails({ ...orderDetails, phone: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 text-sm mb-1">Address*</label>
                          <textarea
                            value={orderDetails.address}
                            onChange={(e) => setOrderDetails({ ...orderDetails, address: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            rows="2"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-700 text-sm mb-1">City*</label>
                            <input
                              type="text"
                              value={orderDetails.city}
                              onChange={(e) => setOrderDetails({ ...orderDetails, city: e.target.value })}
                              className="w-full p-2 border border-gray-300 rounded-lg"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-gray-700 text-sm mb-1">Postal Code</label>
                            <input
                              type="text"
                              value={orderDetails.postalCode}
                              onChange={(e) => setOrderDetails({ ...orderDetails, postalCode: e.target.value })}
                              className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="font-medium text-gray-800 mb-3">Payment Method</h4>
                      <div className="space-y-2">
                        <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:border-green-500 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="stripe"
                            checked={orderDetails.paymentMethod === 'stripe'}
                            onChange={() => setOrderDetails({ ...orderDetails, paymentMethod: 'stripe' })}
                            className="mr-2"
                          />
                          <div>
                            <p className="font-medium">Credit/Debit Card</p>
                            <p className="text-sm text-gray-500">Pay securely with Stripe</p>
                          </div>
                        </label>

                        <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:border-green-500 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cod"
                            checked={orderDetails.paymentMethod === 'cod'}
                            onChange={() => setOrderDetails({ ...orderDetails, paymentMethod: 'cod' })}
                            className="mr-2"
                          />
                          <div>
                            <p className="font-medium">Cash on Delivery</p>
                            <p className="text-sm text-gray-500">Pay when you receive the order</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Fixed Footer */}
          <div className="p-6 pt-0 border-t border-gray-200">
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {showReviewForm ? (
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all"
                >
                  Skip
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={rating === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Review
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <button
                  onClick={() => {
                    setSelectedProductForOrder(null);
                    setOrderQuantity(1);
                    setIsAddingToCart(false);
                    setError('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all"
                >
                  Cancel
                </button>

                <button
                  onClick={isAddingToCart ? handleAddToCart : handlePlaceOrderWithPayment}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                  disabled={
                    loading ||
                    (!isAddingToCart && (
                      !orderDetails.fullName ||
                      !orderDetails.phone ||
                      !orderDetails.address ||
                      !orderDetails.city
                    ))
                  }
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      {isAddingToCart ? (
                        <>
                          <FaShoppingCart className="mr-2" /> Add to Cart
                        </>
                      ) : (
                        <>
                          <FaMoneyBillWave className="mr-2" /> Place Order
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && currentOrder && (
        <PaymentComponent
          key={currentOrder._id}
          orderId={currentOrder._id}
          orderTotal={currentOrder.totalPrice}
          onPaymentSuccess={handlePaymentSuccess}
          onClose={() => {
            setShowPaymentModal(false);
            setCurrentOrder(null);
          }}
          stripePublishableKey={stripePublishableKey}
        />
      )}
    </>
  );
};

export default OrderModal;