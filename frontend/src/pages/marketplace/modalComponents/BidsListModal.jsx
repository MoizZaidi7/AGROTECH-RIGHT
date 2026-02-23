import React from 'react';
import { motion } from 'framer-motion';
import { FaGavel, FaTimes, FaCheck, FaBan } from 'react-icons/fa';

const BidsListModal = ({
  viewBidsForProduct,
  products,
  productBids,
  setViewBidsForProduct,
  handleAcceptBid,
  handleRejectBid
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            Bids for {products.find(p => p._id === viewBidsForProduct)?.name}
          </h3>
          <button
            onClick={() => setViewBidsForProduct(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>
        
        {productBids.length === 0 ? (
          <div className="text-center py-8">
            <FaGavel className="text-4xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No bids placed for this product yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {productBids.map(bid => (
              <div key={bid._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">PKR {bid.amount}</p>
                    <p className="text-sm text-gray-500">By: {bid.buyer?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(bid.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    {bid.status === 'pending' ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAcceptBid(bid._id)}
                          className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                          title="Accept Bid"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => handleRejectBid(bid._id)}
                          className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                          title="Reject Bid"
                        >
                          <FaBan />
                        </button>
                      </div>
                    ) : (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        bid.status === 'accepted' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {bid.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BidsListModal;