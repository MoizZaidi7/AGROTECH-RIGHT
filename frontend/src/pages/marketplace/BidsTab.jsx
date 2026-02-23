import React, { useState, useEffect } from 'react';
import { FaGavel, FaDollarSign, FaCheckCircle, FaTimesCircle, FaClock, FaBox } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';

const BidsPage = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, accepted, rejected

  // Fetch user's bids
  const fetchUserBids = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/marketplace/bids`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Bids API Response:', response.data);
      // Handle different response structures
      const bidsData = response.data.bids ? response.data.bids : 
                      Array.isArray(response.data) ? response.data : 
                      response.data.data ? response.data.data : [];
      console.log('Parsed Bids:', bidsData);
      setBids(bidsData);
    } catch (error) {
      console.error('Error fetching bids:', error);
      toast.error(error.response?.data?.error || 'Failed to fetch bids');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserBids();
  }, []);

  // Handle bid acceptance
  const handleAcceptBid = async (bidId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${process.env.REACT_APP_API_URL}/api/marketplace/bids/${bidId}/accept`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Bid accepted successfully! 🎉');
      fetchUserBids(); // Refresh the bids list
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to accept bid');
    }
  };

  // Handle bid rejection
  const handleRejectBid = async (bidId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${process.env.REACT_APP_API_URL}/api/marketplace/bids/${bidId}/reject`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Bid rejected');
      fetchUserBids(); // Refresh the bids list
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reject bid');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <FaCheckCircle className="text-green-600" />;
      case 'rejected':
        return <FaTimesCircle className="text-red-600" />;
      case 'pending':
      default:
        return <FaClock className="text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300';
      case 'pending':
      default:
        return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300';
    }
  };

  const filteredBids = filter === 'all' ? (Array.isArray(bids) ? bids : []) : (Array.isArray(bids) ? bids.filter(bid => bid.status === filter) : []);

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col justify-center items-center h-64"
      >
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Loading bids...</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl mr-4">
              <FaGavel className="text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">My Bids</h1>
              <p className="text-blue-100 text-sm mt-1">Manage your product bids</p>
            </div>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex gap-2 bg-white/10 backdrop-blur-sm p-2 rounded-xl">
            {['all', 'pending', 'accepted', 'rejected'].map((status) => (
              <motion.button
                key={status}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  filter === status 
                    ? 'bg-white text-blue-600 shadow-md' 
                    : 'bg-transparent text-white hover:bg-white/20'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Bids List */}
      {filteredBids.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-12 text-center shadow-lg border border-blue-100"
        >
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaGavel className="text-5xl text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            {filter === 'all' ? 'No Bids Found' : `No ${filter} Bids`}
          </h3>
          <p className="text-gray-600 text-lg">
            {filter === 'all' 
              ? "You haven't placed or received any bids yet" 
              : `No ${filter} bids at the moment`}
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {filteredBids.map((bid, index) => (
              <motion.div 
                key={bid._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Product Info */}
                  <div className="flex items-start gap-4 flex-1">
                    {bid.productId?.images?.[0] ? (
                      <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-blue-100 flex-shrink-0 shadow-md">
                        <img 
                          src={bid.productId.images[0]} 
                          alt={bid.productId.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                        <FaBox className="text-3xl text-blue-400" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {bid.productId?.name || 'Product'}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center bg-gradient-to-r from-green-50 to-green-100 px-4 py-2 rounded-xl border border-green-200">
                          <FaDollarSign className="text-green-600 mr-1" />
                          <span className="font-bold text-green-700">₨{bid.amount?.toLocaleString()}</span>
                        </div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${getStatusColor(bid.status || 'pending')}`}>
                          {getStatusIcon(bid.status || 'pending')}
                          <span className="font-bold capitalize">{bid.status || 'pending'}</span>
                        </div>
                      </div>
                      {bid.message && (
                        <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          💬 {bid.message}
                        </p>
                      )}
                      {bid.createdAt && (
                        <p className="mt-2 text-xs text-gray-500">
                          Placed on {new Date(bid.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  {bid.status === 'pending' && (
                    <div className="flex gap-3 lg:flex-col">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAcceptBid(bid._id)}
                        className="flex-1 lg:flex-none px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 font-semibold shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <FaCheckCircle /> Accept
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRejectBid(bid._id)}
                        className="flex-1 lg:flex-none px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 font-semibold shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <FaTimesCircle /> Reject
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default BidsPage;