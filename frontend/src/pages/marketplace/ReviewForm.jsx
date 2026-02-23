import React, { useState } from 'react';
import { FaStar, FaCamera } from 'react-icons/fa';

const ReviewForm = ({ order, onSubmit, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [breakdown, setBreakdown] = useState({
    productQuality: 0,
    shippingSpeed: 0,
    communication: 0
  });
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const handleSubmit = () => {
    onSubmit({
      orderId: order._id,
      rating,
      breakdown,
      comment,
      images
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold mb-4">Rate Your Experience</h3>
      
      <div className="mb-6">
        <p className="mb-2">Overall Rating</p>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="text-3xl focus:outline-none"
            >
              <FaStar
                className={`${(hoverRating || rating) >= star ? 'text-yellow-500' : 'text-gray-300'}`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block mb-1">Product Quality</label>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={`quality-${star}`}
                onClick={() => setBreakdown({...breakdown, productQuality: star})}
                className="text-xl focus:outline-none"
              >
                <FaStar
                  className={`${breakdown.productQuality >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-1">Shipping Speed</label>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={`shipping-${star}`}
                onClick={() => setBreakdown({...breakdown, shippingSpeed: star})}
                className="text-xl focus:outline-none"
              >
                <FaStar
                  className={`${breakdown.shippingSpeed >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-1">Communication</label>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={`communication-${star}`}
                onClick={() => setBreakdown({...breakdown, communication: star})}
                className="text-xl focus:outline-none"
              >
                <FaStar
                  className={`${breakdown.communication >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block mb-2">Additional Comments</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          rows="3"
          placeholder="Share your experience with this vendor..."
        />
      </div>

      <div className="mb-6">
        <label className="block mb-2">Upload Photos (Optional)</label>
        <input
          type="file"
          multiple
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
          id="reviewImages"
        />
        <label
          htmlFor="reviewImages"
          className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
        >
          <FaCamera className="text-xl text-gray-400 mr-2" />
          <span>Add Photos</span>
        </label>

        {previewImages.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {previewImages.map((img, index) => (
              <div key={index} className="relative w-16 h-16">
                <img
                  src={img}
                  alt={`Preview ${index}`}
                  className="w-full h-full object-cover rounded"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={rating === 0}
          className={`px-4 py-2 rounded-lg ${rating === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
        >
          Submit Review
        </button>
      </div>
    </div>
  );
};
export default ReviewForm;