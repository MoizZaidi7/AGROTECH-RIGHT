import React from 'react';
import { motion } from 'framer-motion';
import { FaGavel } from 'react-icons/fa';

const BidModal = ({
  selectedProductForBid,
  bidAmount,
  setBidAmount,
  error,
  setSelectedProductForBid,
  setError,
  handlePlaceBid
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Place Bid for {selectedProductForBid?.name}
        </h3>
        
        <div className="mb-4">
          <p className="text-gray-600 mb-2">Current Price: PKR {selectedProductForBid?.price}</p>
          <p className="text-sm text-gray-500">Enter an amount higher than the current price</p>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Your Bid (PKR)*</label>
          <input
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            min={selectedProductForBid?.price ? selectedProductForBid.price + 1 : 1}
            step="1"
            required
          />
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => {
              setSelectedProductForBid(null);
              setBidAmount('');
              setError('');
            }}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => selectedProductForBid && handlePlaceBid(selectedProductForBid._id)}
            className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
            disabled={!bidAmount || isNaN(bidAmount) || Number(bidAmount) <= (selectedProductForBid?.price || 0)}
          >
            <FaGavel className="mr-2" /> Place Bid
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default BidModal;