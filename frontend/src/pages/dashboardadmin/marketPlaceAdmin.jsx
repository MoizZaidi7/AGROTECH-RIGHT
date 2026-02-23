import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import axios from 'axios';
import { 
  FaStore, 
  FaClipboardList, 
  FaGavel,
  FaSearch,
  FaFilter,
  FaEdit,
  FaTrash,
  FaEye,
  FaTimes,
  FaSpinner,
  FaCheck,
  FaBan,
  FaUser,
  FaBox,
  FaTrophy
} from 'react-icons/fa';

const MarketPlaceAdmin = () => {
  // State management
  const [activeTab, setActiveTab] = useState('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    minPrice: '',
    maxPrice: '',
    minQuantity: '',
    maxQuantity: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  
  // Data states
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [bids, setBids] = useState([]);
  const [filteredBids, setFilteredBids] = useState([]);
  const [selectedProductBids, setSelectedProductBids] = useState(null);

  // Categories
  const categories = [
    { id: 'all', name: 'All Categories', icon: '🌾' },
    { id: 'Food & Produce', name: 'Food & Produce', icon: '🌽' },
    { id: 'Farm Inputs', name: 'Farm Inputs', icon: '💰' },
    { id: 'Equipment', name: 'Equipment', icon: '🛠️' },
    { id: 'Seeds', name: 'Seeds', icon: '🌱' },
    { id: 'Fertilizers', name: 'Fertilizers', icon: '🧪' },
    { id: 'Livestock', name: 'Livestock', icon: '🐄' },
    { id: 'Dairy', name: 'Dairy', icon: '🥛' }
  ];

  // Order status options
  const orderStatusOptions = [
    'pending', 'paid', 'shipped', 'delivered', 'cancelled'
  ];

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {};
      if (filters.category !== 'all') params.category = filters.category;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/marketplace/products`, {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      setError('Failed to fetch products');
      console.error('Fetch products error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders from backend
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setOrders(response.data);
      setFilteredOrders(response.data);
    } catch (error) {
      setError('Failed to fetch orders');
      console.error('Fetch orders error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch bids from backend
  const fetchBids = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/bids/my-bids`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setBids(response.data);
      setFilteredBids(response.data);
    } catch (error) {
      setError('Failed to fetch bids');
      console.error('Fetch bids error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch bids for a specific product
  const fetchProductBids = async (productId) => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/bids/my-bids`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
        });
      
      setSelectedProductBids(response.data);
    } catch (error) {
      setError('Failed to fetch product bids');
      console.error('Fetch product bids error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Set a bid as winning
  const setWinningBid = async (bidId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.put(`${process.env.REACT_APP_API_URL}/api/admin/bids/${bidId}/win`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Refresh bids data
      if (selectedProductBids) {
        fetchProductBids(selectedProductBids[0].productId._id);
      }
      fetchBids();
    } catch (error) {
      setError('Failed to set winning bid');
      console.error('Set winning bid error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Delete a bid
  const deleteBid = async (bidId) => {
    if (!window.confirm('Are you sure you want to delete this bid?')) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/bids/${bidId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Refresh bids data
      if (selectedProductBids) {
        fetchProductBids(selectedProductBids[0].productId._id);
      }
      setBids(bids.filter(b => b._id !== bidId));
      setFilteredBids(filteredBids.filter(b => b._id !== bidId));
    } catch (error) {
      setError('Failed to delete bid');
      console.error('Delete bid error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === 'browse') {
      fetchProducts();
    } else if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'bids') {
      fetchBids();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Apply client-side filters for products
  useEffect(() => {
    if (products.length === 0) return;

    const filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (product.farmerId?.firstName && product.farmerId.firstName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesMinQuantity = !filters.minQuantity || product.stock >= Number(filters.minQuantity);
      const matchesMaxQuantity = !filters.maxQuantity || product.stock <= Number(filters.maxQuantity);
      
      return matchesSearch && matchesMinQuantity && matchesMaxQuantity;
    });
    
    setFilteredProducts(filtered);
  }, [searchQuery, filters.minQuantity, filters.maxQuantity, products]);

  // Apply client-side filters for orders
  useEffect(() => {
    if (orders.length === 0) return;

    const filtered = orders.filter(order => {
      return (
        order.productId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerId?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order._id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
    
    setFilteredOrders(filtered);
  }, [searchQuery, orders]);

  // Apply client-side filters for bids
  useEffect(() => {
    if (bids.length === 0) return;

    const filtered = bids.filter(bid => {
      return (
        bid.productId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bid.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bid._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bid.amount.toString().includes(searchQuery)
      );
    });
    
    setFilteredBids(filtered);
  }, [searchQuery, bids]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      category: 'all',
      minPrice: '',
      maxPrice: '',
      minQuantity: '',
      maxQuantity: ''
    });
    setSearchQuery('');
  };

  // Edit functionality for products
  const handleEdit = (product) => {
    setEditingId(product._id);
    setEditData({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      unit: product.unit,
      grade: product.grade
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSaveEdit = async (productId) => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/admin/products/${productId}`,
        editData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setProducts(products.map(p => p._id === productId ? response.data : p));
      setEditingId(null);
      setEditData({});
    } catch (error) {
      setError('Failed to update product');
      console.error('Update product error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Delete functionality for products
  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      setLoading(true);
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/products/${productId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setProducts(products.filter(p => p._id !== productId));
    } catch (error) {
      setError('Failed to delete product');
      console.error('Delete product error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/marketplace/orders/${orderId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setOrders(orders.map(order => 
        order._id === orderId ? response.data : order
      ));
    } catch (error) {
      setError('Failed to update order status');
      console.error('Update order status error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter panel component
  const FilterPanel = () => (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
        <button 
          onClick={resetFilters}
          className="text-sm text-green-600 hover:text-green-800"
        >
          Reset All
        </button>
      </div>
      
      <div className="space-y-4">
        {activeTab === 'browse' && (
          <>
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Range (RS)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  name="minPrice"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  className="border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
                />
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  className="border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            
            {/* Quantity Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Range</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  name="minQuantity"
                  placeholder="Min"
                  value={filters.minQuantity}
                  onChange={handleFilterChange}
                  className="border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
                />
                <input
                  type="number"
                  name="maxQuantity"
                  placeholder="Max"
                  value={filters.maxQuantity}
                  onChange={handleFilterChange}
                  className="border border-gray-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // Admin Products Table Component
  const AdminProductsTable = () => {
    if (loading && products.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 p-8 text-center">
          <FaSpinner className="animate-spin text-4xl text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 p-8 text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <button 
            onClick={fetchProducts}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      );
    }

    if (filteredProducts.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 p-8 text-center">
          <p className="text-gray-600">No products found matching your criteria</p>
          <button 
            onClick={resetFilters}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Reset Filters
          </button>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Farmer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price (RS)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Added
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {product.images?.[0] ? (
                          <img className="h-10 w-10 rounded-full" src={product.images[0]} alt={product.name} />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <FaStore className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        {editingId === product._id ? (
                          <input
                            type="text"
                            name="name"
                            value={editData.name}
                            onChange={handleEditChange}
                            className="border border-gray-300 rounded p-1 w-full"
                          />
                        ) : (
                          <>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.grade ? `Grade ${product.grade}` : ''}</div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === product._id ? (
                      <select
                        name="category"
                        value={editData.category}
                        onChange={handleEditChange}
                        className="border border-gray-300 rounded p-1 w-full"
                      >
                        {categories.filter(c => c.id !== 'all').map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-sm text-gray-900">
                        {product.category}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {product.farmerId?.firstName || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {product.farmerId?.location || ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === product._id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          name="stock"
                          value={editData.stock}
                          onChange={handleEditChange}
                          className="border border-gray-300 rounded p-1 w-20"
                        />
                        <input
                          type="text"
                          name="unit"
                          value={editData.unit}
                          onChange={handleEditChange}
                          className="border border-gray-300 rounded p-1 w-16"
                          placeholder="unit"
                        />
                      </div>
                    ) : (
                      <div className="text-sm text-gray-900">{product.stock} {product.unit || 'units'}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === product._id ? (
                      <input
                        type="number"
                        name="price"
                        value={editData.price}
                        onChange={handleEditChange}
                        className="border border-gray-300 rounded p-1 w-24"
                        step="0.01"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">{product.price?.toFixed(2) || '0.00'}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingId === product._id ? (
                      <>
                        <button 
                          onClick={() => handleSaveEdit(product._id)}
                          className="text-green-600 hover:text-green-900 mr-3"
                          disabled={loading}
                        >
                          <FaCheck />
                        </button>
                        <button 
                          onClick={handleCancelEdit}
                          className="text-red-600 hover:text-red-900"
                          disabled={loading}
                        >
                          <FaBan />
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Previous
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredProducts.length}</span> of{' '}
                <span className="font-medium">{filteredProducts.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  disabled
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Previous</span>
                  Previous
                </button>
                <button
                  aria-current="page"
                  className="z-10 bg-green-50 border-green-500 text-green-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                >
                  1
                </button>
                <button
                  className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                >
                  2
                </button>
                <button
                  className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                >
                  3
                </button>
                <button
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Next</span>
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Orders Table Component
  const OrdersTable = () => {
    if (loading && orders.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 p-8 text-center">
          <FaSpinner className="animate-spin text-4xl text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 p-8 text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <button 
            onClick={fetchOrders}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      );
    }

    if (filteredOrders.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 p-8 text-center">
          <p className="text-gray-600">No orders found matching your criteria</p>
          <button 
            onClick={() => setSearchQuery('')}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Clear Search
          </button>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Price (RS)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Ordered
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {order.productId?.images?.[0] ? (
                          <img className="h-10 w-10 rounded-full" src={order.productId.images[0]} alt={order.productId.name} />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <FaBox className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {order.productId?.name || 'Product not available'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.productId?.price ? `RS ${order.productId.price.toFixed(2)}` : ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <FaUser className="text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {order.customerId?.firstName || 'Unknown Customer'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.shippingAddress?.email || ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    RS {order.totalPrice?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      className={`text-sm rounded px-2 py-1 ${
                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'Paid' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      {orderStatusOptions.map(status => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Previous
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredOrders.length}</span> of{' '}
                <span className="font-medium">{filteredOrders.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  disabled
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Previous</span>
                  Previous
                </button>
                <button
                  aria-current="page"
                  className="z-10 bg-green-50 border-green-500 text-green-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                >
                  1
                </button>
                <button
                  className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                >
                  2
                </button>
                <button
                  className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                >
                  3
                </button>
                <button
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Next</span>
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Bids Table Component
  const BidsTable = () => {
    if (loading && bids.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 p-8 text-center">
          <FaSpinner className="animate-spin text-4xl text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading bids...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 p-8 text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <button 
            onClick={fetchBids}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      );
    }

    if (filteredBids.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 p-8 text-center">
          <p className="text-gray-600">No bids found matching your criteria</p>
          <button 
            onClick={() => setSearchQuery('')}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Clear Search
          </button>
        </div>
      );
    }

    if (selectedProductBids) {
      return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              Bids for: {selectedProductBids[0]?.productId?.name || 'Unknown Product'}
            </h3>
            <button 
              onClick={() => setSelectedProductBids(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bidder
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount (RS)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedProductBids.map((bid) => (
                  <tr key={bid._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <FaUser className="text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {bid.userId?.name || 'Unknown Bidder'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {bid.userId?.email || ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      RS {bid.amount?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        bid.isWinning ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {bid.isWinning ? 'Winning' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(bid.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {!bid.isWinning && (
                        <button 
                          onClick={() => setWinningBid(bid._id)}
                          className="text-green-600 hover:text-green-900 mr-3"
                          disabled={loading}
                        >
                          <FaTrophy title="Set as winning bid" />
                        </button>
                      )}
                      <button 
                        onClick={() => deleteBid(bid._id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={loading}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bidder
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount (RS)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBids.map((bid) => (
                <tr key={bid._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {bid.productId?.images?.[0] ? (
                          <img className="h-10 w-10 rounded-full" src={bid.productId.images[0]} alt={bid.productId.name} />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <FaBox className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {bid.productId?.name || 'Unknown Product'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {bid.productId?.price ? `Original: RS ${bid.productId.price.toFixed(2)}` : ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {bid.userId?.name || 'Unknown Bidder'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {bid.userId?.email || ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    RS {bid.amount?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      bid.isWinning ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {bid.isWinning ? 'Winning' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(bid.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => fetchProductBids(bid.productId._id)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <FaEye title="View all bids for this product" />
                    </button>
                    {!bid.isWinning && (
                      <button 
                        onClick={() => setWinningBid(bid._id)}
                        className="text-green-600 hover:text-green-900 mr-3"
                        disabled={loading}
                      >
                        <FaTrophy title="Set as winning bid" />
                      </button>
                    )}
                    <button 
                      onClick={() => deleteBid(bid._id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={loading}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Previous
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredBids.length}</span> of{' '}
                <span className="font-medium">{filteredBids.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  disabled
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Previous</span>
                  Previous
                </button>
                <button
                  aria-current="page"
                  className="z-10 bg-green-50 border-green-500 text-green-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                >
                  1
                </button>
                <button
                  className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                >
                  2
                </button>
                <button
                  className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                >
                  3
                </button>
                <button
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Next</span>
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo Section */}
            <motion.div
              className="flex items-center space-x-2 cursor-pointer"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
            >
              <img
                src={`${process.env.PUBLIC_URL}/logo.png`}
                alt="Logo"
                className="h-10 w-10 bg-opacity-70 rounded-full border-2 border-green-700"
              />
              <div className="flex flex-col">
                <span className="text-green-700 text-xl font-bold">AgroTech</span>
                <span className="text-green-600 text-xs font-medium italic">
                  Cultivating Smarter Futures
                </span>
              </div>
            </motion.div>
            
            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-xl mx-6">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder={
                    activeTab === 'browse' ? 'Search products...' : 
                    activeTab === 'orders' ? 'Search orders...' : 
                    'Search bids...'
                  }
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-5xl font-bold text-green-800">MARKETPLACE</h1>
            <p className="text-gray-600 mt-2">Admin Dashboard - Product Management</p>
          </div>
          
          {/* Filters button shifted to the right */}
          <div className="mt-4 md:mt-0 flex items-center justify-end w-full md:w-auto">
            {activeTab === 'browse' && (
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                <FaFilter />
                <span>Advanced Filters</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Filters Panel */}
        {showFilters && activeTab === 'browse' && <FilterPanel />}
        
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('browse')} 
              className={`flex items-center space-x-2 py-4 px-6 text-center font-medium ${
                activeTab === 'browse' 
                  ? 'text-green-600 border-b-2 border-green-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaStore />
              <span>All Products</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('orders')} 
              className={`flex items-center space-x-2 py-4 px-6 text-center font-medium ${
                activeTab === 'orders' 
                  ? 'text-green-600 border-b-2 border-green-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaClipboardList />
              <span>Orders</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('bids')} 
              className={`flex items-center space-x-2 py-4 px-6 text-center font-medium ${
                activeTab === 'bids' 
                  ? 'text-green-600 border-b-2 border-green-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaGavel />
              <span>Bids</span>
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="mb-8">
          {activeTab === 'browse' && <AdminProductsTable />}
          {activeTab === 'orders' && <OrdersTable />}
          {activeTab === 'bids' && <BidsTable />}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} AgroTech Marketplace. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MarketPlaceAdmin;