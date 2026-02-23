import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaClipboardList } from 'react-icons/fa';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFarmerOrders();
  }, []);

  const fetchFarmerOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/farmer/orders/farmer-orders`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrders(response.data || []);
    } catch (error) {
      setError('Failed to fetch orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/marketplace/orders/${orderId}`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status } : order
      ));
    } catch (error) {
      setError('Failed to update order status');
      console.error('Error updating order status:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-16 text-center border-2 border-green-200">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500"></div>
          <p className="mt-6 text-gray-700 font-medium text-xl">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-12 text-center border-2 border-red-200">
          <p className="text-red-700 font-medium text-xl">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 bg-gradient-to-r from-green-600 to-green-900 rounded-2xl p-8 shadow-lg"
      >
        <div className="flex items-center gap-3 mb-3">
          <FaClipboardList className="text-4xl text-green-200" />
          <h1 className="text-4xl font-bold text-white">Order Management</h1>
        </div>
        <p className="text-green-50 text-lg">Manage and track customer orders for your products</p>
      </motion.div>

      {orders.length === 0 ? (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl shadow-lg p-16 text-center">
          <FaClipboardList className="text-8xl text-gray-300 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-700 mb-3">No Orders Yet</h3>
          <p className="text-gray-500 text-lg">You haven't received any orders for your products yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-green-600 to-green-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Qty</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map(order => (
                  <motion.tr 
                    key={order._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-green-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        #{order._id?.slice(-6).toUpperCase() || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <img 
                            className="h-12 w-12 rounded-xl object-cover border-2 border-green-200" 
                            src={order.productId?.images?.[0] || '/placeholder-product.png'} 
                            alt={order.productId?.name || 'Product'} 
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {order.productId?.name || 'Unknown Product'}
                          </div>
                          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded inline-block mt-1">
                            {order.productId?.category || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                      {order.customerId?.firstName || 'Anonymous'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {order.quantity || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-700">
                      PKR {order.totalPrice || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ${
                        order.status === 'pending' ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' :
                        order.status === 'paid' ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white' :
                        order.status === 'shipped' ? 'bg-gradient-to-r from-indigo-400 to-indigo-500 text-white' :
                        'bg-gradient-to-r from-green-400 to-green-500 text-white'
                      }`}>
                        {order.status || 'unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {order.status === 'pending' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateOrderStatus(order._id, 'paid')}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg hover:from-blue-600 hover:to-blue-800 transition-all shadow-md font-medium"
                        >
                          Mark as Paid
                        </motion.button>
                      )}
                      {order.status === 'paid' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateOrderStatus(order._id, 'shipped')}
                          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-800 transition-all shadow-md font-medium"
                        >
                          Ship Order
                        </motion.button>
                      )}
                      {order.status === 'shipped' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateOrderStatus(order._id, 'delivered')}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg hover:from-green-600 hover:to-green-800 transition-all shadow-md font-medium"
                        >
                          Mark Delivered
                        </motion.button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;