import React from 'react';
import { FaClipboardList, FaBox, FaShippingFast, FaCheckCircle, FaTimesCircle, FaMoneyBillWave } from 'react-icons/fa';

const OrderCard = ({ order, userRole, onInitiatePayment, onUpdateStatus }) => {
  if (!order || !order.product) {
    return (
      <div className="p-4 bg-red-50 text-red-600">
        Invalid order data
      </div>
    );
  }
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <FaClipboardList className="text-gray-400 mr-2" />
          <span className="font-medium">Order #{order._id.slice(-6).toUpperCase()}</span>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${statusColors[order.status]}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>
      
      <div className="flex items-start mb-4">
        {order.productId?.images?.[0] ? (
          <img 
            src={order.productId.images[0]} 
            alt={order.productId.name} 
            className="w-16 h-16 object-cover rounded-lg mr-4"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
            <FaBox className="text-gray-400" />
          </div>
        )}
        <div>
          <h4 className="font-medium text-gray-800">{order.productId?.name || 'Product'}</h4>
          <p className="text-gray-600">Quantity: {order.quantity}</p>
          <p className="text-green-600 font-bold">PKR {order.totalPrice}</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {new Date(order.createdAt).toLocaleString()}
        </div>
        
        <div className="flex space-x-2">
          {userRole === 'buyer' && order.status === 'pending' && (
            <button
              onClick={() => onInitiatePayment(order._id)}
              className="flex items-center px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              <FaMoneyBillWave className="mr-1" /> Pay Now
            </button>
          )}
          
          {userRole === 'farmer' && (
            <>
              {order.status === 'paid' && (
                <button
                  onClick={() => onUpdateStatus(order._id, 'shipped')}
                  className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <FaShippingFast className="mr-1" /> Mark as Shipped
                </button>
              )}
              
              {order.status === 'shipped' && (
                <button
                  onClick={() => onUpdateStatus(order._id, 'delivered')}
                  className="flex items-center px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  <FaCheckCircle className="mr-1" /> Mark as Delivered
                </button>
              )}
              
              {order.status === 'pending' && (
                <button
                  onClick={() => onUpdateStatus(order._id, 'cancelled')}
                  className="flex items-center px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                  <FaTimesCircle className="mr-1" /> Cancel Order
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;