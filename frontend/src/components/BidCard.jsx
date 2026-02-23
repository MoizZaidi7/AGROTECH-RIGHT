import React from 'react';
import { FaGavel, FaCheck, FaBan, FaUser, FaMoneyBillWave } from 'react-icons/fa';

const BidCard = ({ bid, userRole, onAccept, onReject, onCreateOrder }) => {
  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center mb-2">
            <FaUser className="text-gray-400 mr-2" />
            <span className="font-medium">
              {userRole === 'farmer' ? bid.buyer?.name || 'Anonymous' : bid.productId?.name || 'Product'}
            </span>
          </div>
          
          <div className="flex items-center mb-2">
            <FaMoneyBillWave className="text-green-400 mr-2" />
            <span className="font-bold text-green-600">PKR {bid.amount}</span>
          </div>
          
          <div className="text-sm text-gray-500">
            {new Date(bid.createdAt).toLocaleString()}
          </div>
        </div>
        
        <div>
          {bid.status === 'pending' && userRole === 'farmer' && (
            <div className="flex space-x-2">
              <button
                onClick={() => onAccept(bid._id)}
                className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                title="Accept Bid"
              >
                <FaCheck />
              </button>
              <button
                onClick={() => onReject(bid._id)}
                className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                title="Reject Bid"
              >
                <FaBan />
              </button>
            </div>
          )}
          
          {bid.status === 'accepted' && (
            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
              Accepted
            </span>
          )}
          
          {bid.status === 'rejected' && (
            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
              Rejected
            </span>
          )}
        </div>
      </div>
      
      {bid.status === 'accepted' && userRole === 'buyer' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => onCreateOrder(bid.productId?._id)}
            className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Complete Purchase
          </button>
        </div>
      )}
    </div>
  );
};

export default BidCard;