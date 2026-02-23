import React, { useState } from 'react';
import { 
  FaLeaf, 
  FaShoppingCart, 
  FaGavel, 
  FaHeart, 
  FaRegHeart, 
  FaStar, 
  FaRegStar, 
  FaEdit, 
  FaTrash, 
  FaMapMarkerAlt,
  FaTruck,
  FaCheckCircle
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const ProductCard = ({ 
  product, 
  userRole,
  onEdit, 
  onDelete, 
  onViewBids, 
  onPlaceBid, 
  onAddToCart, 
  onBuyNow,
  onViewVendor,
  showVendorInfo = true
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const vendor = product.farmerId || {};
  const vendorName = vendor.name || product.vendorName;
  const vendorLocation = vendor.location || product.vendorLocation;
  const vendorRating = vendor.rating?.average || product.vendorRating || 0;
  const reviewCount = vendor.rating?.count || 0;
  const vendorImage = vendor.profileImage || product.vendorImage;

  // Calculate discount if original price exists
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Rating display logic
  const renderRatingStars = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          i < Math.floor(rating) ? (
            <FaStar key={i} className="text-yellow-400 text-xs" />
          ) : (
            <FaRegStar key={i} className="text-yellow-400 text-xs" />
          )
        ))}
        <span className="ml-1 text-xs text-gray-500">({reviewCount})</span>
      </div>
    );
  };

  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 group"
      whileHover={{ y: -8 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Section */}
      <div className="relative overflow-hidden">
        {product.images?.[0] ? (
          <div className="aspect-w-4 aspect-h-3 overflow-hidden">
            <img 
              src={product.images[0]} 
              alt={product.name} 
              className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>
        ) : (
          <div className="w-full h-64 bg-gradient-to-br from-green-50 via-green-100 to-green-50 flex items-center justify-center">
            <FaLeaf className="text-6xl text-green-300" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col space-y-2 z-10">
          {hasDiscount && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full shadow-md"
            >
              -{discountPercentage}% OFF
            </motion.span>
          )}
          {product.isBidding && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full shadow-md flex items-center"
            >
              <FaGavel className="mr-1" /> BIDDING
            </motion.span>
          )}
          {product.stock < 10 && product.stock > 0 && (
            <span className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold rounded-full shadow-md">
              Only {product.stock} left
            </span>
          )}
          {product.stock === 0 && (
            <span className="px-3 py-1.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-xs font-bold rounded-full shadow-md">
              OUT OF STOCK
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 20 }}
          transition={{ duration: 0.3 }}
          className="absolute top-4 right-4 flex flex-col space-y-2"
        >
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsFavorite(!isFavorite)}
            className="p-2.5 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite ? (
              <FaHeart className="text-red-500 text-lg" />
            ) : (
              <FaRegHeart className="text-gray-500 hover:text-red-500 text-lg" />
            )}
          </motion.button>
          {userRole === 'admin' && (
            <>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onEdit(product)}
                className="p-2.5 bg-white rounded-full shadow-lg hover:bg-blue-50 transition-colors"
                aria-label="Edit product"
              >
                <FaEdit className="text-blue-600 text-lg" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(product._id)}
                className="p-2.5 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                aria-label="Delete product"
              >
                <FaTrash className="text-red-600 text-lg" />
              </motion.button>
            </>
          )}
        </motion.div>

        {/* Gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>
      
      {/* Product Info Section */}
      <div className="p-5">
        {/* Vendor Info */}
        {showVendorInfo && vendorName && (
          <div className="mb-4 pb-4 border-b border-gray-100">
            <div 
              className="flex items-center cursor-pointer group/vendor"
              onClick={() => onViewVendor?.(product.farmerId || product.vendorId)}
            >
              {vendorImage && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-green-200 mr-3 overflow-hidden border-2 border-green-200 group-hover/vendor:border-green-400 transition-colors">
                  <img 
                    src={vendorImage} 
                    alt={vendorName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <span className="text-sm font-semibold text-gray-800 group-hover/vendor:text-green-600 transition-colors flex items-center">
                  {vendorName}
                  {vendorRating >= 4.5 && (
                    <FaCheckCircle className="ml-1 text-green-500 text-xs" title="Verified Vendor" />
                  )}
                </span>
                <div className="flex items-center text-xs text-gray-500 mt-0.5">
                  <FaMapMarkerAlt className="mr-1 text-green-600" />
                  <span>{vendorLocation || 'Pakistan'}</span>
                </div>
              </div>
            </div>
            <div className="mt-2">
              {renderRatingStars(vendorRating)}
            </div>
          </div>
        )}
        
        {/* Product Title and Grade */}
        <div className="mb-3">
          <h3 className="font-bold text-gray-900 line-clamp-2 leading-tight text-lg mb-2">{product.name}</h3>
          <div className="flex justify-between items-center">
            <span className="bg-gradient-to-r from-green-50 to-green-100 text-green-700 text-xs px-3 py-1.5 rounded-full font-semibold border border-green-200">
              Grade {product.grade}
            </span>
            {product.category && (
              <span className="text-xs text-gray-500 font-medium">{product.category}</span>
            )}
          </div>
        </div>
        
        {/* Price Section */}
        <div className="my-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-green-600">₨{product.price.toLocaleString()}</span>
            {hasDiscount && (
              <>
                <span className="text-sm text-gray-400 line-through">₨{product.originalPrice.toLocaleString()}</span>
                <span className="text-xs text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded">Save {discountPercentage}%</span>
              </>
            )}
          </div>
          {product.unit && (
            <span className="text-xs text-gray-500 mt-1 block">per {product.unit}</span>
          )}
          {product.stock > 0 && (
            <div className="flex items-center text-xs text-green-600 mt-2 bg-green-50 px-2 py-1 rounded-lg w-fit">
              <FaCheckCircle className="mr-1" />
              <span className="font-medium">{product.stock} units available</span>
            </div>
          )}
        </div>
        
        {/* Delivery Info */}
        <div className="flex items-center text-xs text-gray-600 mb-4 bg-blue-50 px-3 py-2 rounded-lg">
          <FaTruck className="mr-2 text-blue-600" />
          <span className="font-medium">Free delivery on orders over ₨5,000</span>
        </div>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
            className={`py-3 rounded-xl transition-all text-sm font-semibold flex items-center justify-center shadow-sm ${
              product.stock === 0 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-green-600 border-2 border-green-600 hover:bg-green-50'
            }`}
          >
            <FaShoppingCart className="mr-2" /> Add to Cart
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onBuyNow(product)}
            disabled={product.stock === 0}
            className={`py-3 rounded-xl transition-all text-sm font-semibold shadow-md ${
              product.stock === 0 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
            }`}
          >
            Buy Now
          </motion.button>
        </div>

        {/* Bidding Section (shown only if bidding is enabled) */}
        {product.isBidding && (
          <div className="mt-3 grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onViewBids(product._id)}
              className="py-3 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all text-sm font-semibold flex items-center justify-center border border-blue-200"
            >
              <FaGavel className="mr-2" /> View Bids
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onPlaceBid(product)}
              className="py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all text-sm font-semibold shadow-md"
            >
              Place Bid
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;