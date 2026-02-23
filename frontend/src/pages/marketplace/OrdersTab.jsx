import React, { useState, useEffect } from 'react';
import { ClipboardList, TruckIcon, CheckCircle, Clock, DollarSign, AlertCircle, Package, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PaymentComponent from '../../components/PaymentComponent';
import axios from 'axios';
const OrdersTab = ({ 
  userRole = 'farmer', 
  onInitiatePayment, 
  onUpdateStatus,
  stripePublishableKey
}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/marketplace/orders/customer-orders', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log('Orders API Response:', response.data);
        // Handle different response structures
        const ordersData = Array.isArray(response.data) ? response.data : 
                          response.data.orders ? response.data.orders : 
                          response.data.data ? response.data.data : [];
        console.log('Parsed Orders:', ordersData);
        setOrders(ordersData);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.response?.data?.error || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userRole]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'processing':
        return <TruckIcon className="h-5 w-5 text-blue-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    if (onInitiatePayment && currentOrder) {
      onInitiatePayment(currentOrder._id);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/marketplace/orders/${orderId}`, 
        { status: newStatus }, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      // Refresh orders after update
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(err.response?.data?.error || 'Failed to update order status');
    }
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col justify-center items-center h-64"
      >
        <div className="relative">
          <div className="w-16 h-16 border-4 border-green-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Loading your orders...</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 p-6 mb-6 rounded-r-xl"
      >
        <div className="flex items-center">
          <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden border border-green-100"
      >
        {!Array.isArray(orders) || orders.length === 0 ? (
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="p-16 text-center flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-white"
          >
            <div className="bg-gradient-to-br from-green-100 to-green-200 p-6 rounded-full mb-6 shadow-lg">
              <ClipboardList className="text-green-600 w-14 h-14" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-4">No Orders Yet</h3>
            <p className="text-gray-600 max-w-md text-lg">
              You haven't received any orders for your products yet. Orders will appear here when customers make purchases.
            </p>
          </motion.div>
        ) : (
          <div>
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6 flex items-center justify-between">
              <div className="flex items-center">
                <Package className="text-white w-7 h-7 mr-3" />
                <h2 className="text-white font-bold text-2xl">Customer Orders</h2>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-white font-semibold">{orders.length} Total</span>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              <AnimatePresence>
                {orders.map((order, index) => (
                  <motion.div 
                    key={order._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 hover:bg-gradient-to-r hover:from-green-50 hover:to-transparent transition-all duration-300"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      {/* Product Image & Details */}
                      <div className="flex items-start flex-grow">
                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border-2 border-green-100 bg-gradient-to-br from-gray-50 to-gray-100 shadow-md">
                          {order.productId?.images?.[0] ? (
                            <img
                              src={order.productId.images[0]}
                              alt={order.productId.name}
                              className="h-full w-full object-cover object-center hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-400">
                              <Package className="h-10 w-10" />
                            </div>
                          )}
                        </div>
                        <div className="ml-5 flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {order.productId?.name || 'Product'}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                              <span className="font-semibold text-gray-800">
                                {order.quantity} × ₨{order.productId?.price?.toFixed(2) || '0.00'}
                              </span>
                              <span className="text-gray-400 mx-1">/</span>
                              <span>{order.productId?.unit || 'unit'}</span>
                            </div>
                            <div className="bg-green-50 px-3 py-1.5 rounded-lg">
                              <span className="font-bold text-green-700">
                                Total: ₨{(order.quantity * (order.productId?.price || 0)).toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mb-1">
                            <Clock className="h-4 w-4 mr-2" />
                            Ordered on {formatDate(order.createdAt)}
                          </div>
                          {order.customerId && (
                            <div className="flex items-center text-sm text-gray-500">
                              <User className="h-4 w-4 mr-2" />
                              <span className="font-medium">Customer:</span>
                              <span className="ml-1">{order.customerId.firstName} {order.customerId.lastName}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex flex-col lg:items-end space-y-3 lg:min-w-[200px]">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <span className={`text-sm font-bold px-4 py-2 rounded-xl shadow-sm ${getStatusClass(order.status)}`}>
                            {order.status?.charAt(0)?.toUpperCase() + order.status?.slice(1) || 'Unknown'}
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <DollarSign className={`h-4 w-4 mr-1 ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'}`} />
                          <span className={`text-sm font-bold px-4 py-2 rounded-xl shadow-sm ${order.paymentStatus === 'paid' ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800' : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800'}`}>
                            {order.paymentStatus === 'paid' ? 'Paid' : 'Payment Required'}
                          </span>
                        </div>

                        {/* Farmer Actions */}
                        {userRole === 'farmer' && order.status === 'processing' && (
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleUpdateStatus(order._id, 'delivered')} 
                            className="inline-flex items-center px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-green-600 to-green-700 rounded-xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-md transition-all"
                          >
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Mark as Delivered
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showPaymentModal && currentOrder && (
          <PaymentComponent
            orderId={currentOrder._id}
            orderTotal={currentOrder.totalPrice}
            onPaymentSuccess={handlePaymentSuccess}
            onClose={() => setShowPaymentModal(false)}
            stripePublishableKey={stripePublishableKey}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default OrdersTab;