import React, { useState } from 'react';
import { FaPlus, FaEdit, FaCamera, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ProductManagement = ({ isEditing, product, onSave, onCancel, loading }) => {
  const [newProduct, setNewProduct] = useState(product);
  const [productImages, setProductImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  const productCategories = [
    'Food & Produce',
    'Farm Inputs',
    'Equipment',
    'Seeds',
    'Fertilizers',
    'Livestock',
    'Dairy'
  ];

  const handleProductImageChange = (e) => {
    const files = Array.from(e.target.files);
    setProductImages(files);
    
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    
    // Append all product data
    Object.entries(newProduct).forEach(([key, value]) => {
      if (key !== 'images') {
        formData.append(key, value);
      }
    });
    
    // Append images
    productImages.forEach((image, index) => {
      formData.append(`images`, image);
    });

    onSave(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden mb-8 border border-gray-200"
    >
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Product Name*</label>
              <input
                type="text"
                name="name"
                value={newProduct.name}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Category*</label>
              <select
                name="category"
                value={newProduct.category}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                {productCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Price (PKR)*</label>
              <input
                type="number"
                name="price"
                value={newProduct.price}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Quality Grade*</label>
              <select
                name="grade"
                value={newProduct.grade}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="A">Grade A (Premium)</option>
                <option value="B">Grade B (Standard)</option>
                <option value="C">Grade C (Economy)</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Stock Quantity*</label>
              <input
                type="number"
                name="stock"
                value={newProduct.stock}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
                min="0"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Farming Practices</label>
              <input
                type="text"
                name="farmingPractices"
                value={newProduct.farmingPractices}
                onChange={handleChange}
                placeholder="e.g., Organic, Rainfed"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div className="mb-4 md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isBidding"
                  checked={newProduct.isBidding}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-gray-700 text-sm font-medium">Enable Bidding</span>
              </label>
              <p className="text-gray-500 text-xs mt-1">Allow buyers to place bids on this product</p>
            </div>

            <div className="md:col-span-2 mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Description*</label>
              <textarea
                name="description"
                value={newProduct.description}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 h-32"
                required
              />
            </div>

            <div className="md:col-span-2 mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Product Images*</label>
              <input
                type="file"
                multiple
                onChange={handleProductImageChange}
                accept="image/*"
                className="hidden"
                id="productImages"
              />
              <label
                htmlFor="productImages"
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 block text-center cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <FaCamera className="text-3xl text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Click to upload product images</p>
                <p className="text-sm text-gray-500 mt-1">Maximum 5 images (JPEG/PNG)</p>
              </label>

              {previewImages.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-4">
                  {previewImages.map((img, index) => (
                    <div key={index} className="relative w-24 h-24 group">
                      <img
                        src={img}
                        alt={`Preview ${index}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newPreviews = [...previewImages];
                          const newImages = [...productImages];
                          newPreviews.splice(index, 1);
                          newImages.splice(index, 1);
                          setPreviewImages(newPreviews);
                          setProductImages(newImages);
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  {isEditing ? <FaEdit className="mr-2" /> : <FaPlus className="mr-2" />}
                  {isEditing ? 'Update Product' : 'Add Product'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default ProductManagement;