import React from 'react';
import { FaStar } from 'react-icons/fa';

const ReviewList = ({ reviews }) => {
  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review._id} className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start mb-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden mr-4">
              {review.customerId.avatar && (
                <img 
                  src={review.customerId.avatar} 
                  alt={review.customerId.firstName}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div>
              <h4 className="font-medium">
                {review.customerId.firstName} {review.customerId.lastName}
              </h4>
              <div className="flex items-center text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <FaStar 
                    key={i} 
                    className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'} 
                  />
                ))}
                <span className="ml-2 text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
            <div>
              <p className="text-gray-500">Product Quality</p>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <FaStar 
                    key={`quality-${i}`} 
                    size={14}
                    className={i < review.breakdown.productQuality ? 'text-yellow-500' : 'text-gray-300'} 
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-gray-500">Shipping Speed</p>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <FaStar 
                    key={`shipping-${i}`} 
                    size={14}
                    className={i < review.breakdown.shippingSpeed ? 'text-yellow-500' : 'text-gray-300'} 
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-gray-500">Communication</p>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <FaStar 
                    key={`communication-${i}`} 
                    size={14}
                    className={i < review.breakdown.communication ? 'text-yellow-500' : 'text-gray-300'} 
                  />
                ))}
              </div>
            </div>
          </div>

          {review.comment && (
            <p className="text-gray-700 mb-4">{review.comment}</p>
          )}

          {review.images?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {review.images.map((img, index) => (
                <div key={index} className="w-20 h-20">
                  <img
                    src={img}
                    alt={`Review ${index}`}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReviewList;