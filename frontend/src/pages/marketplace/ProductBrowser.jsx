import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFilter, FaSearch, FaBox, FaStar, FaTimes, FaChevronDown } from 'react-icons/fa';
import { BsArrowLeft, BsArrowRight } from 'react-icons/bs';
import ProductCard from '../../components/ProductCard';

const ProductBrowser = ({ 
  products, 
  userRole, 
  loading, 
  onEditProduct, 
  onDeleteProduct, 
  onViewBids, 
  onPlaceBid, 
  onAddToCart, 
  onBuyNow 
}) => {
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    grade: '',
    searchQuery: '',
    vendorName: '',
    location: '',
    minRating: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const productsPerPage = 8;

  const productCategories = [
    'Food & Produce',
    'Farm Inputs',
    'Equipment',
    'Seeds',
    'Fertilizers',
    'Livestock',
    'Dairy'
  ];

  const productGrades = ['A', 'B', 'C'];

  const vendorOptions = Array.from(
    new Set(products.map(p => p.farmerId?.name || p.vendorName))
  ).filter(Boolean);

  const applyFilters = () => {
    let result = [...products];
    
    if (filters.category) {
      result = result.filter(p => p.category === filters.category);
    }
    
    if (filters.grade) {
      result = result.filter(p => p.grade === filters.grade);
    }
    
    if (filters.minPrice) {
      result = result.filter(p => p.price >= Number(filters.minPrice));
    }
    
    if (filters.maxPrice) {
      result = result.filter(p => p.price <= Number(filters.maxPrice));
    }
    
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }
    
    if (filters.vendorName) {
      result = result.filter(p => 
        p.farmerId?.name?.includes(filters.vendorName) || 
        p.vendorName?.includes(filters.vendorName)
      );
    }
    
    if (filters.location) {
      result = result.filter(p => 
        p.farmerId?.location?.includes(filters.location) ||
        p.vendorLocation?.includes(filters.location)
      );
    }
    
    if (filters.minRating > 0) {
      result = result.filter(p => 
        p.farmerId?.rating >= filters.minRating ||
        p.vendorRating >= filters.minRating
      );
    }
    
    return result;
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredProducts = applyFilters();
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const resetFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      grade: '',
      searchQuery: '',
      vendorName: '',
      location: '',
      minRating: 0
    });
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Modern Search & Filter Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
      >
        {/* Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400 text-lg" />
            </div>
            <input
              type="text"
              name="searchQuery"
              value={filters.searchQuery}
              onChange={handleFilterChange}
              placeholder="Search products, categories, vendors..."
              className="pl-12 w-full p-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-700 placeholder-gray-400"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm font-medium text-gray-700"
            >
              <option value="">All Categories</option>
              {productCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              name="grade"
              value={filters.grade}
              onChange={handleFilterChange}
              className="px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm font-medium text-gray-700"
            >
              <option value="">All Grades</option>
              {productGrades.map(grade => (
                <option key={grade} value={grade}>Grade {grade}</option>
              ))}
            </select>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(1)}
              className="flex items-center px-6 py-3.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              <FaFilter className="mr-2" /> Filter
            </motion.button>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">Vendor Name</label>
              <input
                type="text"
                name="vendorName"
                value={filters.vendorName}
                onChange={handleFilterChange}
                placeholder="Search by vendor"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                list="vendorOptions"
              />
              <datalist id="vendorOptions">
                {vendorOptions.map((vendor, index) => (
                  <option key={index} value={vendor} />
                ))}
              </datalist>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="Filter by location"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">Minimum Rating</label>
              <div className="flex items-center space-x-2">
                <select
                  name="minRating"
                  value={filters.minRating}
                  onChange={handleFilterChange}
                  className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                >
                  <option value="0">Any Rating</option>
                  <option value="3">3+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                </select>
                <FaStar className="text-yellow-400 text-xl" />
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">Min Price (PKR)</label>
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="0"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                min="0"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">Max Price (PKR)</label>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="10000"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                min="0"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> products
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all font-medium"
            >
              Reset All Filters
            </motion.button>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-green-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading farm products...</p>
        </motion.div>
      ) : filteredProducts.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-lg p-12 text-center border border-green-100"
        >
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaBox className="text-4xl text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No Products Found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search or filters to find what you're looking for</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetFilters}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-md font-medium"
          >
            Reset All Filters
          </motion.button>
        </motion.div>
      ) : (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {currentProducts.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ProductCard 
                  product={product}
                  userRole={userRole}
                  onEdit={onEditProduct}
                  onDelete={onDeleteProduct}
                  onViewBids={onViewBids}
                  onPlaceBid={onPlaceBid}
                  onAddToCart={onAddToCart}
                  onBuyNow={onBuyNow}
                />
              </motion.div>
            ))}
          </motion.div>

          {totalPages > 1 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center mt-10"
            >
              <nav className="inline-flex items-center gap-1 bg-white rounded-xl shadow-md p-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <BsArrowLeft className="h-5 w-5" />
                </motion.button>
                
                <div className="flex items-center gap-1 px-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                    <motion.button
                      key={number}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => paginate(number)}
                      className={`min-w-[40px] h-10 rounded-lg font-medium transition-all ${
                        currentPage === number 
                          ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md' 
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {number}
                    </motion.button>
                  ))}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <BsArrowRight className="h-5 w-5" />
                </motion.button>
              </nav>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductBrowser;