import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaBox, FaPlus, FaEdit, FaTrash, FaCamera } from 'react-icons/fa';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Food & Produce',
    grade: 'A',
    stock: '',
    farmingPractices: '',
    images: []
  });
  const [productImages, setProductImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [loading, setLoading] = useState(false);


  const productCategories = [
    'Food & Produce',
    'Farm Inputs',
    'Equipment',
    'Seeds',
    'Fertilizers',
    'Livestock',
    'Dairy'
  ];

  useEffect(() => {
    fetchFarmerProducts();
  }, []);

  const fetchFarmerProducts = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/farmer/products/my-products`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProducts(response.data);
    } catch (error) {
      setError('Failed to fetch products');
    }
  };

  const handleProductImageChange = (e) => {
    const files = Array.from(e.target.files);
    setProductImages(files);
    
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('description', newProduct.description);
    formData.append('price', newProduct.price);
    formData.append('category', newProduct.category);
    formData.append('grade', newProduct.grade);
    formData.append('stock', newProduct.stock);
    formData.append('farmingPractices', newProduct.farmingPractices);
    
    // Append images
    productImages.forEach((image) => {
      formData.append('images', image);
    });

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/farmer/products`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setProducts([...products, response.data]);
      resetProductForm();
      setIsAddingProduct(false);
    } catch (error) {
      setError(error.response?.data?.details || error.response?.data?.error || 'Failed to create product');
    } finally {
      setLoading(false);
    }
};


  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('description', newProduct.description);
    formData.append('price', newProduct.price);
    formData.append('category', newProduct.category);
    formData.append('grade', newProduct.grade);
    formData.append('stock', newProduct.stock);
    formData.append('farmingPractices', newProduct.farmingPractices);
    productImages.forEach((image, index) => {
      formData.append(`images`, image);
    });

    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/farmer/products/${currentProductId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setProducts(products.map(p => p._id === currentProductId ? response.data : p));
      resetProductForm();
      setIsEditingProduct(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/farmer/products/${productId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setProducts(products.filter(p => p._id !== productId));
      } catch (error) {
        setError('Failed to delete product');
      }
    }
  };

  const handleEditProduct = (product) => {
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      grade: product.grade,
      stock: product.stock,
      farmingPractices: product.farmingPractices,
      images: product.images
    });
    setPreviewImages(product.images);
    setCurrentProductId(product._id);
    setIsEditingProduct(true);
    setIsAddingProduct(true);
  };

  const resetProductForm = () => {
    setNewProduct({
      name: '',
      description: '',
      price: '',
      category: 'Food & Produce',
      grade: 'A',
      stock: '',
      farmingPractices: '',
      images: []
    });
    setProductImages([]);
    setPreviewImages([]);
    setCurrentProductId(null);
  };

  return (
    <div className="p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 bg-gradient-to-r from-green-600 to-green-900 rounded-2xl p-8 shadow-lg"
      >
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <FaBox className="text-4xl text-green-200" />
            <h1 className="text-4xl font-bold text-white">My Products</h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              resetProductForm();
              setIsAddingProduct(true);
              setIsEditingProduct(false);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-white text-green-700 rounded-xl hover:bg-green-50 transition-all shadow-lg font-medium"
          >
            <FaPlus /> Add Product
          </motion.button>
        </div>
        <p className="text-green-50 text-lg">Manage your agricultural products for sale in the marketplace</p>
      </motion.div>

      {isAddingProduct ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-8"
        >
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              {isEditingProduct ? <><FaEdit className="text-blue-600" /> Edit Product</> : <><FaPlus className="text-green-600" /> Add New Product</>}
            </h2>
            
            <form onSubmit={isEditingProduct ? handleUpdateProduct : handleCreateProduct}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-800 font-semibold mb-2">Product Name</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-green-300"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-800 font-semibold mb-2">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-green-300"
                  >
                    {productCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-800 font-semibold mb-2">Price (PKR)</label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-green-300"
                    placeholder="Enter price"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-800 font-semibold mb-2">Quality Grade</label>
                  <select
                    value={newProduct.grade}
                    onChange={(e) => setNewProduct({...newProduct, grade: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-green-300"
                  >
                    <option value="A">Grade A (Premium)</option>
                    <option value="B">Grade B (Standard)</option>
                    <option value="C">Grade C (Economy)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-800 font-semibold mb-2">Stock Quantity</label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-green-300"
                    placeholder="Enter stock quantity"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-800 font-semibold mb-2">Farming Practices</label>
                  <input
                    type="text"
                    value={newProduct.farmingPractices}
                    onChange={(e) => setNewProduct({...newProduct, farmingPractices: e.target.value})}
                    placeholder="e.g., Organic, Rainfed"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-green-300"
                  />
                </div>

                <div className="md:col-span-2 mb-4">
                  <label className="block text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg h-32"
                    required
                  />
                </div>

                <div className="md:col-span-2 mb-4">
                  <label className="block text-gray-700 mb-2">Product Images</label>
                  <input
                    type="file"
                    multiple
                    onChange={handleProductImageChange}
                    className="hidden"
                    id="productImages"
                  />
                  <label
                    htmlFor="productImages"
                    className="border-3 border-dashed border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 block text-center cursor-pointer hover:border-green-500 hover:shadow-lg transition-all"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FaCamera className="text-3xl text-white" />
                    </div>
                    <p className="text-gray-700 font-medium text-lg">Click to upload product images</p>
                    <p className="text-sm text-gray-500 mt-2">Maximum  5 images (JPEG/PNG)</p>
                  </label>

                  {previewImages.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {previewImages.map((img, index) => (
                        <div key={index} className="relative w-28 h-28 rounded-xl overflow-hidden border-2 border-green-200 shadow-md">
                          <img
                            src={img}
                            alt={`Preview ${index}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    setIsAddingProduct(false);
                    resetProductForm();
                  }}
                  className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-xl hover:from-green-600 hover:to-green-800 transition-all shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      {isEditingProduct ? <FaEdit /> : <FaPlus />}
                      {isEditingProduct ? 'Update Product' : 'Add Product'}
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      ) : (
        <>
          {products.length === 0 ? (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl shadow-lg p-12 text-center">
              <FaBox className="text-7xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No Products Listed</h3>
              <p className="text-gray-500 mb-6 text-lg">You haven't listed any products for sale yet</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAddingProduct(true)}
                className="flex items-center gap-2 mx-auto px-8 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-xl hover:from-green-600 hover:to-green-800 transition-all shadow-lg font-medium"
              >
                <FaPlus /> Add Your First Product
              </motion.button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-100 hover:border-green-300 hover:shadow-2xl"
                >
                  <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200">
                    {product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaBox className="text-6xl text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-green-700 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                      Grade {product.grade}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
                      <span className="text-green-700 font-bold text-lg bg-green-100 px-3 py-1 rounded-lg">PKR {product.price}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 bg-gray-100 px-2 py-1 rounded inline-block">{product.category}</p>
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">{product.description}</p>
                    
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                      <div>
                        <span className="text-sm text-gray-500">Stock:</span>
                        <span className="ml-2 font-semibold text-gray-800">{product.stock} units</span>
                      </div>
                      <div className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                        {product.farmingPractices || 'Conventional'}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleEditProduct(product)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl hover:from-blue-600 hover:to-blue-800 transition-all shadow-md font-medium"
                      >
                        <FaEdit /> Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDeleteProduct(product._id)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-xl hover:from-red-600 hover:to-red-800 transition-all shadow-md font-medium"
                      >
                        <FaTrash /> Delete
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductManagement;