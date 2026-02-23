// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { motion, AnimatePresence } from 'framer-motion';
// import { 
//   FaLeaf, FaCamera, FaStore, FaBox, FaShoppingCart, FaPlus, 
//   FaEdit, FaTrash, FaClipboardList, FaGavel, FaMoneyBillWave, 
//   FaSearch, FaFilter, FaHeart, FaRegHeart, FaStar, FaRegStar, 
//   FaBars, FaTimes, FaCheck, FaBan, FaChevronDown, FaChevronUp,
//   FaUser, FaHistory, FaChartLine
// } from 'react-icons/fa';
// import { FiShoppingBag, FiDollarSign } from 'react-icons/fi';
// import { BsArrowLeft, BsArrowRight } from 'react-icons/bs';
// import PaymentComponent from '../components/PaymentComponent';
// import ProductCard from '../components/ProductCard';
// import BidCard from '../components/BidCard';
// import OrderCard from '../components/OrderCard';

// const MarketPlace = ({ userRole }) => {
//   // State management
//   const [activeTab, setActiveTab] = useState('browse');
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [orders, setOrders] = useState([]);
//   const [bids, setBids] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
//   const [cartOpen, setCartOpen] = useState(false);
//   const [cartItems, setCartItems] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const productsPerPage = 8;

//   // Product filters
//   const [filters, setFilters] = useState({
//     category: '',
//     minPrice: '',
//     maxPrice: '',
//     grade: '',
//     searchQuery: ''
//   });

//   // Bidding state
//   const [bidAmount, setBidAmount] = useState('');
//   const [selectedProductForBid, setSelectedProductForBid] = useState(null);
//   const [productBids, setProductBids] = useState([]);
//   const [viewBidsForProduct, setViewBidsForProduct] = useState(null);
  
//   // Payment state
//   const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);

//   // Product form state
//   const [isAddingProduct, setIsAddingProduct] = useState(false);
//   const [isEditingProduct, setIsEditingProduct] = useState(false);
//   const [currentProductId, setCurrentProductId] = useState(null);
//   const [newProduct, setNewProduct] = useState({
//     name: '',
//     description: '',
//     price: '',
//     category: 'Food & Produce',
//     grade: 'A',
//     stock: '',
//     farmingPractices: '',
//     images: [],
//     isBidding: false
//   });
//   const [productImages, setProductImages] = useState([]);
//   const [previewImages, setPreviewImages] = useState([]);

//   // Order placement state
//   const [selectedProductForOrder, setSelectedProductForOrder] = useState(null);
//   const [orderQuantity, setOrderQuantity] = useState(1);
//   const [orderDetails, setOrderDetails] = useState({
//     fullName: '',
//     phone: '',
//     address: '',
//     city: '',
//     postalCode: '',
//     paymentMethod: 'stripe'
//   });
//   const [isAddingToCart, setIsAddingToCart] = useState(false);

//   // Constants
//   const productCategories = [
//     'Food & Produce',
//     'Farm Inputs',
//     'Equipment',
//     'Seeds',
//     'Fertilizers',
//     'Livestock',
//     'Dairy'
//   ];

//   const productGrades = ['A', 'B', 'C'];
//   const stripePublishableKey = 'pk_test_51RNaGJPryyOk7xMW6RnVFn9nCW0dcG1pqMCQ0QZJ8rndXN1W59LXBqthnXlzjpbp3Sq5WLuer9XJ9fuTjZWLwJ2k00GJUTqYwC';

//   // Pagination logic
//   const indexOfLastProduct = currentPage * productsPerPage;
//   const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
//   const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
//   const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

//   // Fetch data on component mount
//   useEffect(() => {
//     fetchProducts();
//     fetchCartItems();
//     if (userRole === 'farmer') {
//       fetchFarmerProducts();
//       fetchFarmerOrders();
//       fetchFarmerBids();
//     } else if (userRole === 'buyer') {
//       fetchBuyerOrders();
//       fetchBuyerBids();
//     }
//   }, [userRole]);

//   // Apply filters when products or filters change
//   useEffect(() => {
//     applyFilters();
//   }, [filters, products]);

//   // Data fetching functions
//   const fetchProducts = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get('http://localhost:5000/api/farmer/products', {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
//       setProducts(response.data);
//       setFilteredProducts(response.data);
//     } catch (error) {
//       setError('Failed to fetch products');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchFarmerProducts = async () => {
//     try {
//       const response = await axios.get('http://localhost:5000/api/farmer/products/my-products', {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
//       setProducts(prev => [...prev, ...response.data]);
//     } catch (error) {
//       setError('Failed to fetch your products');
//     }
//   };

//   const fetchFarmerOrders = async () => {
//     try {
//       const response = await axios.get('http://localhost:5000/api/farmer/orders/farmer-orders', {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
//       setOrders(response.data);
//     } catch (error) {
//       setError('Failed to fetch orders');
//     }
//   };

//   const fetchFarmerBids = async () => {
//     try {
//       const response = await axios.get('http://localhost:5000/api/marketplace/bids/farmer-bids', {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
//       setBids(response.data);
//     } catch (error) {
//       setError('Failed to fetch bids on your products');
//     }
//   };

//   const fetchBuyerOrders = async () => {
//     try {
//       const response = await axios.get('http://localhost:5000/api/marketplace/orders/buyer-orders', {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
//       setOrders(response.data);
//     } catch (error) {
//       setError('Failed to fetch your orders');
//     }
//   };

//   const fetchBuyerBids = async () => {
//     try {
//       const response = await axios.get('http://localhost:5000/api/marketplace/bids/my-bids', {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
//       setBids(response.data);
//     } catch (error) {
//       setError('Failed to fetch your bids');
//     }
//   };

//   const fetchProductBids = async (productId) => {
//     try {
//       const response = await axios.get(`http://localhost:5000/api/marketplace/bids/product/${productId}`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
//       setProductBids(response.data);
//     } catch (error) {
//       setError('Failed to fetch bids for this product');
//     }
//   };

//   const fetchCartItems = async () => {
//     try {
//       const response = await axios.get('http://localhost:5000/api/marketplace/cart', {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
//       setCartItems(response.data.items || []);
//     } catch (error) {
//       setError('Failed to fetch cart items');
//     }
//   };

//   // Filtering and pagination
//   const applyFilters = () => {
//     let result = [...products];
    
//     if (filters.category) {
//       result = result.filter(p => p.category === filters.category);
//     }
    
//     if (filters.grade) {
//       result = result.filter(p => p.grade === filters.grade);
//     }
    
//     if (filters.minPrice) {
//       result = result.filter(p => p.price >= Number(filters.minPrice));
//     }
    
//     if (filters.maxPrice) {
//       result = result.filter(p => p.price <= Number(filters.maxPrice));
//     }
    
//     if (filters.searchQuery) {
//       const query = filters.searchQuery.toLowerCase();
//       result = result.filter(p => 
//         p.name.toLowerCase().includes(query) || 
//         p.description.toLowerCase().includes(query) ||
//         p.category.toLowerCase().includes(query)
//       );
//     }
    
//     setFilteredProducts(result);
//     setCurrentPage(1); // Reset to first page when filters change
//   };

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters(prev => ({ ...prev, [name]: value }));
//   };

//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   // Product management
//   const handleProductImageChange = (e) => {
//     const files = Array.from(e.target.files);
//     setProductImages(files);
    
//     const previews = files.map(file => URL.createObjectURL(file));
//     setPreviewImages(previews);
//   };

//   const handleCreateProduct = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     const formData = new FormData();
//     formData.append('name', newProduct.name);
//     formData.append('description', newProduct.description);
//     formData.append('price', newProduct.price);
//     formData.append('category', newProduct.category);
//     formData.append('grade', newProduct.grade);
//     formData.append('stock', newProduct.stock);
//     formData.append('farmingPractices', newProduct.farmingPractices);
//     formData.append('isBidding', newProduct.isBidding);
//     productImages.forEach((image, index) => {
//       formData.append(`images`, image);
//     });

//     try {
//       const response = await axios.post('http://localhost:5000/api/marketplace/products', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//           Authorization: `Bearer ${localStorage.getItem('token')}`
//         }
//       });
//       setProducts([...products, response.data]);
//       resetProductForm();
//       setIsAddingProduct(false);
//     } catch (error) {
//       setError(error.response?.data?.message || 'Failed to create product');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUpdateProduct = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     const formData = new FormData();
//     formData.append('name', newProduct.name);
//     formData.append('description', newProduct.description);
//     formData.append('price', newProduct.price);
//     formData.append('category', newProduct.category);
//     formData.append('grade', newProduct.grade);
//     formData.append('stock', newProduct.stock);
//     formData.append('farmingPractices', newProduct.farmingPractices);
//     formData.append('isBidding', newProduct.isBidding);
//     productImages.forEach((image, index) => {
//       formData.append(`images`, image);
//     });

//     try {
//       const response = await axios.put(`http://localhost:5000/api/marketplace/products/${currentProductId}`, formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//           Authorization: `Bearer ${localStorage.getItem('token')}`
//         }
//       });
//       setProducts(products.map(p => p._id === currentProductId ? response.data : p));
//       resetProductForm();
//       setIsEditingProduct(false);
//     } catch (error) {
//       setError(error.response?.data?.message || 'Failed to update product');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteProduct = async (productId) => {
//     if (window.confirm('Are you sure you want to delete this product?')) {
//       try {
//         await axios.delete(`http://localhost:5000/api/marketplace/products/${productId}`, {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//         });
//         setProducts(products.filter(p => p._id !== productId));
//       } catch (error) {
//         setError('Failed to delete product');
//       }
//     }
//   };

//   const handleEditProduct = (product) => {
//     setNewProduct({
//       name: product.name,
//       description: product.description,
//       price: product.price,
//       category: product.category,
//       grade: product.grade,
//       stock: product.stock,
//       farmingPractices: product.farmingPractices,
//       isBidding: product.isBidding,
//       images: product.images
//     });
//     setPreviewImages(product.images);
//     setCurrentProductId(product._id);
//     setIsEditingProduct(true);
//     setIsAddingProduct(true);
//   };

//   const resetProductForm = () => {
//     setNewProduct({
//       name: '',
//       description: '',
//       price: '',
//       category: 'Food & Produce',
//       grade: 'A',
//       stock: '',
//       farmingPractices: '',
//       isBidding: false,
//       images: []
//     });
//     setProductImages([]);
//     setPreviewImages([]);
//     setCurrentProductId(null);
//   };

//   // Bidding functions
//   const handlePlaceBid = async (productId) => {
//     if (!bidAmount || isNaN(bidAmount)) {
//       setError('Please enter a valid bid amount');
//       return;
//     }

//     try {
//       const response = await axios.post('http://localhost:5000/api/marketplace/bids', {
//         productId,
//         amount: parseFloat(bidAmount)
//       }, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
      
//       const updatedProducts = products.map(p => {
//         if (p._id === productId) {
//           return { ...p, price: parseFloat(bidAmount) };
//         }
//         return p;
//       });
      
//       setProducts(updatedProducts);
//       setBids([...bids, response.data]);
//       setSelectedProductForBid(null);
//       setBidAmount('');
//     } catch (error) {
//       setError(error.response?.data?.message || 'Failed to place bid');
//     }
//   };

//   const handleViewBids = async (productId) => {
//     setViewBidsForProduct(productId);
//     await fetchProductBids(productId);
//   };

//   const handleAcceptBid = async (bidId) => {
//     try {
//       await axios.put(`http://localhost:5000/api/marketplace/bids/${bidId}/accept`, {}, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
      
//       // Update the product price to the accepted bid amount
//       const acceptedBid = productBids.find(b => b._id === bidId);
//       if (acceptedBid) {
//         const updatedProducts = products.map(p => {
//           if (p._id === acceptedBid.productId._id) {
//             return { ...p, price: acceptedBid.amount };
//           }
//           return p;
//         });
//         setProducts(updatedProducts);
//       }
      
//       // Refresh bids
//       await fetchProductBids(viewBidsForProduct);
//       setBids(bids.map(b => {
//         if (b._id === bidId) {
//           return { ...b, status: 'accepted' };
//         }
//         return b;
//       }));
//     } catch (error) {
//       setError('Failed to accept bid');
//     }
//   };

//   const handleRejectBid = async (bidId) => {
//     try {
//       await axios.put(`http://localhost:5000/api/marketplace/bids/${bidId}/reject`, {}, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
      
//       // Refresh bids
//       await fetchProductBids(viewBidsForProduct);
//       setBids(bids.map(b => {
//         if (b._id === bidId) {
//           return { ...b, status: 'rejected' };
//         }
//         return b;
//       }));
//     } catch (error) {
//       setError('Failed to reject bid');
//     }
//   };

//   // Payment functions
//   const handleInitiatePayment = (orderId) => {
//     setSelectedOrderForPayment(orderId);
//   };

//   const handlePaymentSuccess = () => {
//     setOrders(orders.map(order => 
//       order._id === selectedOrderForPayment ? { ...order, status: 'paid' } : order
//     ));
//     setSelectedOrderForPayment(null);
//   };

//   const handlePaymentClose = () => {
//     setSelectedOrderForPayment(null);
//   };

//   // Order functions
//   const handleCreateOrder = async (productId, quantity = 1) => {
//     try {
//       const response = await axios.post('http://localhost:5000/api/marketplace/orders', {
//         productId,
//         quantity
//       }, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
      
//       setOrders([...orders, response.data]);
      
//       const updatedProducts = products.map(p => {
//         if (p._id === productId) {
//           return { ...p, stock: p.stock - quantity };
//         }
//         return p;
//       });
      
//       setProducts(updatedProducts);
//     } catch (error) {
//       setError(error.response?.data?.message || 'Failed to create order');
//     }
//   };

//   const handleUpdateOrderStatus = async (orderId, status) => {
//     try {
//       await axios.put(`http://localhost:5000/api/marketplace/orders/${orderId}`, { status }, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
      
//       setOrders(orders.map(order => 
//         order._id === orderId ? { ...order, status } : order
//       ));
//     } catch (error) {
//       setError('Failed to update order status');
//     }
//   };

//   const handlePlaceOrder = async () => {
//     try {
//       setLoading(true);
//       setError('');

//       // First create the order
//       const orderResponse = await axios.post('http://localhost:5000/api/marketplace/orders', {
//         productId: selectedProductForOrder._id,
//         quantity: orderQuantity,
//         shippingDetails: {
//           fullName: orderDetails.fullName,
//           phone: orderDetails.phone,
//           address: orderDetails.address,
//           city: orderDetails.city,
//           postalCode: orderDetails.postalCode
//         }
//       }, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });

//       const newOrder = orderResponse.data;

//       // If payment method is stripe, initiate payment
//       if (orderDetails.paymentMethod === 'stripe') {
//         handleInitiatePayment(newOrder._id);
//       } else {
//         // For cash on delivery, just update the order status
//         await axios.put(
//           `http://localhost:5000/api/marketplace/orders/${newOrder._id}`,
//           { status: 'pending' },
//           {
//             headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//           }
//         );

//         setOrders([...orders, { ...newOrder, status: 'pending' }]);
//       }

//       // Update product stock
//       const updatedProducts = products.map(p => {
//         if (p._id === selectedProductForOrder._id) {
//           return { ...p, stock: p.stock - orderQuantity };
//         }
//         return p;
//       });
      
//       setProducts(updatedProducts);
//       setSelectedProductForOrder(null);
//       setOrderQuantity(1);
//       setOrderDetails({
//         fullName: '',
//         phone: '',
//         address: '',
//         city: '',
//         postalCode: '',
//         paymentMethod: 'stripe'
//       });

//     } catch (error) {
//       setError(error.response?.data?.message || 'Failed to place order');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Cart functions
//   const handleAddToCart = async () => {
//     try {
//       setLoading(true);
//       setError('');

//       await axios.post('http://localhost:5000/api/marketplace/cart', {
//         productId: selectedProductForOrder._id,
//         quantity: orderQuantity
//       }, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });

//       await fetchCartItems();
//       setSelectedProductForOrder(null);
//       setOrderQuantity(1);
//       setIsAddingToCart(false);
//     } catch (error) {
//       setError(error.response?.data?.message || 'Failed to add to cart');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRemoveFromCart = async (cartItemId) => {
//     try {
//       await axios.delete(`http://localhost:5000/api/marketplace/cart/${cartItemId}`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
//       await fetchCartItems();
//     } catch (error) {
//       setError('Failed to remove item from cart');
//     }
//   };

//   const handleUpdateCartItem = async (cartItemId, quantity) => {
//     try {
//       await axios.put(`http://localhost:5000/api/marketplace/cart/${cartItemId}`, {
//         quantity
//       }, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
//       await fetchCartItems();
//     } catch (error) {
//       setError('Failed to update cart item');
//     }
//   };

//   const handleCheckout = async () => {
//     try {
//       setLoading(true);
//       setError('');

//       // Create order from cart items
//       const response = await axios.post('http://localhost:5000/api/marketplace/orders/cart-checkout', {
//         shippingDetails: orderDetails,
//         paymentMethod: orderDetails.paymentMethod
//       }, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });

//       const newOrder = response.data;

//       // If payment method is stripe, initiate payment
//       if (orderDetails.paymentMethod === 'stripe') {
//         handleInitiatePayment(newOrder._id);
//       } else {
//         // For cash on delivery, just update the order status
//         await axios.put(
//           `http://localhost:5000/api/marketplace/orders/${newOrder._id}`,
//           { status: 'pending' },
//           {
//             headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//           }
//         );

//         setOrders([...orders, { ...newOrder, status: 'pending' }]);
//       }

//       // Clear cart
//       setCartItems([]);
//       setCartOpen(false);
//       setOrderDetails({
//         fullName: '',
//         phone: '',
//         address: '',
//         city: '',
//         postalCode: '',
//         paymentMethod: 'stripe'
//       });

//     } catch (error) {
//       setError(error.response?.data?.message || 'Failed to checkout');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Render functions for modals and sections
//   const renderBidModal = () => (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <motion.div
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
//       >
//         <h3 className="text-xl font-bold text-gray-800 mb-4">
//           Place Bid for {selectedProductForBid?.name}
//         </h3>
        
//         <div className="mb-4">
//           <p className="text-gray-600 mb-2">Current Price: PKR {selectedProductForBid?.price}</p>
//           <p className="text-sm text-gray-500">Enter an amount higher than the current price</p>
//         </div>
        
//         <div className="mb-6">
//           <label className="block text-gray-700 mb-2">Your Bid (PKR)*</label>
//           <input
//             type="number"
//             value={bidAmount}
//             onChange={(e) => setBidAmount(e.target.value)}
//             className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//             min={selectedProductForBid?.price ? selectedProductForBid.price + 1 : 1}
//             step="1"
//             required
//           />
//         </div>
        
//         {error && (
//           <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
//             <p className="text-red-700">{error}</p>
//           </div>
//         )}
        
//         <div className="flex justify-end space-x-4">
//           <button
//             onClick={() => {
//               setSelectedProductForBid(null);
//               setBidAmount('');
//               setError('');
//             }}
//             className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={() => selectedProductForBid && handlePlaceBid(selectedProductForBid._id)}
//             className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
//             disabled={!bidAmount || isNaN(bidAmount) || Number(bidAmount) <= (selectedProductForBid?.price || 0)}
//           >
//             <FaGavel className="mr-2" /> Place Bid
//           </button>
//         </div>
//       </motion.div>
//     </div>
//   );

//   const renderBidsListModal = () => (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <motion.div
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
//       >
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-xl font-bold text-gray-800">
//             Bids for {products.find(p => p._id === viewBidsForProduct)?.name}
//           </h3>
//           <button
//             onClick={() => setViewBidsForProduct(null)}
//             className="text-gray-500 hover:text-gray-700"
//           >
//             <FaTimes />
//           </button>
//         </div>
        
//         {productBids.length === 0 ? (
//           <div className="text-center py-8">
//             <FaGavel className="text-4xl text-gray-300 mx-auto mb-4" />
//             <p className="text-gray-500">No bids placed for this product yet</p>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {productBids.map(bid => (
//               <div key={bid._id} className="border border-gray-200 rounded-lg p-4">
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <p className="font-medium">PKR {bid.amount}</p>
//                     <p className="text-sm text-gray-500">By: {bid.buyer?.name || 'Unknown'}</p>
//                     <p className="text-xs text-gray-400">
//                       {new Date(bid.createdAt).toLocaleString()}
//                     </p>
//                   </div>
//                   <div>
//                     {bid.status === 'pending' ? (
//                       <div className="flex space-x-2">
//                         <button
//                           onClick={() => handleAcceptBid(bid._id)}
//                           className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
//                           title="Accept Bid"
//                         >
//                           <FaCheck />
//                         </button>
//                         <button
//                           onClick={() => handleRejectBid(bid._id)}
//                           className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
//                           title="Reject Bid"
//                         >
//                           <FaBan />
//                         </button>
//                       </div>
//                     ) : (
//                       <span className={`px-2 py-1 text-xs rounded-full ${
//                         bid.status === 'accepted' 
//                           ? 'bg-green-100 text-green-800' 
//                           : 'bg-red-100 text-red-800'
//                       }`}>
//                         {bid.status}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </motion.div>
//     </div>
//   );

//   const renderOrderModal = () => (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <motion.div
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
//       >
//         <h3 className="text-xl font-bold text-gray-800 mb-4">
//           {isAddingToCart ? 'Add to Cart' : 'Place Order'}
//         </h3>
        
//         {selectedProductForOrder && (
//           <div className="mb-6">
//             <div className="flex items-center mb-4">
//               {selectedProductForOrder.images?.[0] ? (
//                 <img 
//                   src={selectedProductForOrder.images[0]} 
//                   alt={selectedProductForOrder.name} 
//                   className="w-16 h-16 object-cover rounded-lg mr-4"
//                 />
//               ) : (
//                 <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
//                   <FaBox className="text-gray-400" />
//                 </div>
//               )}
//               <div>
//                 <h4 className="font-medium text-gray-800">{selectedProductForOrder.name}</h4>
//                 <p className="text-green-600 font-bold">PKR {selectedProductForOrder.price}</p>
//               </div>
//             </div>
            
//             <div className="mb-4">
//               <label className="block text-gray-700 mb-2">Quantity</label>
//               <div className="flex items-center">
//                 <button
//                   onClick={() => setOrderQuantity(prev => Math.max(1, prev - 1))}
//                   className="px-3 py-1 bg-gray-200 rounded-l-lg"
//                   disabled={orderQuantity <= 1}
//                 >
//                   -
//                 </button>
//                 <input
//                   type="number"
//                   value={orderQuantity}
//                   onChange={(e) => setOrderQuantity(Math.max(1, Math.min(selectedProductForOrder.stock, Number(e.target.value))))}
//                   className="w-16 text-center py-1 border-t border-b border-gray-300"
//                   min="1"
//                   max={selectedProductForOrder.stock}
//                 />
//                 <button
//                   onClick={() => setOrderQuantity(prev => Math.min(selectedProductForOrder.stock, prev + 1))}
//                   className="px-3 py-1 bg-gray-200 rounded-r-lg"
//                   disabled={orderQuantity >= selectedProductForOrder.stock}
//                 >
//                   +
//                 </button>
//                 <span className="ml-2 text-gray-500 text-sm">
//                   {selectedProductForOrder.stock} available
//                 </span>
//               </div>
//             </div>
//           </div>
//         )}
        
//         {!isAddingToCart && (
//           <>
//             <div className="mb-6">
//               <h4 className="font-medium text-gray-800 mb-3">Shipping Details</h4>
              
//               <div className="space-y-3">
//                 <div>
//                   <label className="block text-gray-700 text-sm mb-1">Full Name*</label>
//                   <input
//                     type="text"
//                     value={orderDetails.fullName}
//                     onChange={(e) => setOrderDetails({...orderDetails, fullName: e.target.value})}
//                     className="w-full p-2 border border-gray-300 rounded-lg"
//                     required
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-gray-700 text-sm mb-1">Phone Number*</label>
//                   <input
//                     type="tel"
//                     value={orderDetails.phone}
//                     onChange={(e) => setOrderDetails({...orderDetails, phone: e.target.value})}
//                     className="w-full p-2 border border-gray-300 rounded-lg"
//                     required
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-gray-700 text-sm mb-1">Address*</label>
//                   <textarea
//                     value={orderDetails.address}
//                     onChange={(e) => setOrderDetails({...orderDetails, address: e.target.value})}
//                     className="w-full p-2 border border-gray-300 rounded-lg"
//                     rows="2"
//                     required
//                   />
//                 </div>
                
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-gray-700 text-sm mb-1">City*</label>
//                     <input
//                       type="text"
//                       value={orderDetails.city}
//                       onChange={(e) => setOrderDetails({...orderDetails, city: e.target.value})}
//                       className="w-full p-2 border border-gray-300 rounded-lg"
//                       required
//                     />
//                   </div>
                  
//                   <div>
//                     <label className="block text-gray-700 text-sm mb-1">Postal Code</label>
//                     <input
//                       type="text"
//                       value={orderDetails.postalCode}
//                       onChange={(e) => setOrderDetails({...orderDetails, postalCode: e.target.value})}
//                       className="w-full p-2 border border-gray-300 rounded-lg"
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>
            
//             <div className="mb-6">
//               <h4 className="font-medium text-gray-800 mb-3">Payment Method</h4>
              
//               <div className="space-y-2">
//                 <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:border-green-500 cursor-pointer">
//                   <input
//                     type="radio"
//                     name="paymentMethod"
//                     value="stripe"
//                     checked={orderDetails.paymentMethod === 'stripe'}
//                     onChange={() => setOrderDetails({...orderDetails, paymentMethod: 'stripe'})}
//                     className="mr-2"
//                   />
//                   <div>
//                     <p className="font-medium">Credit/Debit Card</p>
//                     <p className="text-sm text-gray-500">Pay securely with Stripe</p>
//                   </div>
//                 </label>
                
//                 <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:border-green-500 cursor-pointer">
//                   <input
//                     type="radio"
//                     name="paymentMethod"
//                     value="cod"
//                     checked={orderDetails.paymentMethod === 'cod'}
//                     onChange={() => setOrderDetails({...orderDetails, paymentMethod: 'cod'})}
//                     className="mr-2"
//                   />
//                   <div>
//                     <p className="font-medium">Cash on Delivery</p>
//                     <p className="text-sm text-gray-500">Pay when you receive the order</p>
//                   </div>
//                 </label>
//               </div>
//             </div>
//           </>
//         )}
        
//         <div className="flex justify-between items-center mt-6">
//           <button
//             onClick={() => {
//               setSelectedProductForOrder(null);
//               setOrderQuantity(1);
//               setIsAddingToCart(false);
//               setError('');
//             }}
//             className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all"
//           >
//             Cancel
//           </button>
          
//           <button
//             onClick={isAddingToCart ? handleAddToCart : handlePlaceOrder}
//             className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
//             disabled={loading || (!isAddingToCart && (
//               !orderDetails.fullName || 
//               !orderDetails.phone || 
//               !orderDetails.address || 
//               !orderDetails.city
//             ))}
//           >
//             {loading ? (
//               <>
//                 <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                 </svg>
//                 Processing...
//               </>
//             ) : (
//               <>
//                 {isAddingToCart ? (
//                   <>
//                     <FaShoppingCart className="mr-2" /> Add to Cart
//                   </>
//                 ) : (
//                   <>
//                     <FaMoneyBillWave className="mr-2" /> Place Order
//                   </>
//                 )}
//               </>
//             )}
//           </button>
//         </div>
//       </motion.div>
//     </div>
//   );

//   const renderCartSidebar = () => (
//     <div className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-xl transform ${cartOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out z-50`}>
//       <div className="h-full flex flex-col">
//         <div className="p-4 border-b border-gray-200 flex justify-between items-center">
//           <h2 className="text-xl font-bold text-gray-800">Your Cart</h2>
//           <button 
//             onClick={() => setCartOpen(false)}
//             className="text-gray-500 hover:text-gray-700"
//           >
//             <FaTimes />
//           </button>
//         </div>
        
//         <div className="flex-1 overflow-y-auto p-4">
//           {cartItems.length === 0 ? (
//             <div className="text-center py-12">
//               <FaShoppingCart className="text-5xl text-gray-300 mx-auto mb-4" />
//               <h3 className="text-lg font-medium text-gray-700 mb-2">Your cart is empty</h3>
//               <p className="text-gray-500">Add some products to get started</p>
//               <button
//                 onClick={() => {
//                   setCartOpen(false);
//                   setActiveTab('browse');
//                 }}
//                 className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
//               >
//                 Browse Products
//               </button>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {cartItems.map(item => (
//                 <div key={item._id} className="flex items-start border-b border-gray-100 pb-4">
//                   <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
//                     {item.productId.images?.[0] ? (
//                       <img 
//                         src={item.productId.images[0]} 
//                         alt={item.productId.name} 
//                         className="w-full h-full object-cover"
//                       />
//                     ) : (
//                       <div className="w-full h-full flex items-center justify-center">
//                         <FaBox className="text-gray-400" />
//                       </div>
//                     )}
//                   </div>
//                   <div className="ml-4 flex-1">
//                     <h3 className="font-medium text-gray-800">{item.productId.name}</h3>
//                     <p className="text-green-600 font-bold">PKR {item.productId.price}</p>
//                     <div className="flex items-center mt-2">
//                       <button
//                         onClick={() => handleUpdateCartItem(item._id, item.quantity - 1)}
//                         className="px-2 py-1 bg-gray-200 rounded-l"
//                         disabled={item.quantity <= 1}
//                       >
//                         -
//                       </button>
//                       <span className="px-4 py-1 bg-gray-100">{item.quantity}</span>
//                       <button
//                         onClick={() => handleUpdateCartItem(item._id, item.quantity + 1)}
//                         className="px-2 py-1 bg-gray-200 rounded-r"
//                         disabled={item.quantity >= item.productId.stock}
//                       >
//                         +
//                       </button>
//                     </div>
//                   </div>
//                   <button
//                     onClick={() => handleRemoveFromCart(item._id)}
//                     className="text-red-500 hover:text-red-700 ml-2"
//                   >
//                     <FaTrash />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
        
//         {cartItems.length > 0 && (
//           <div className="p-4 border-t border-gray-200">
//             <div className="flex justify-between mb-2">
//               <span className="text-gray-600">Subtotal</span>
//               <span className="font-medium">
//                 PKR {cartItems.reduce((total, item) => total + (item.productId.price * item.quantity), 0)}
//               </span>
//             </div>
//             <div className="flex justify-between mb-4">
//               <span className="text-gray-600">Shipping</span>
//               <span className="font-medium">PKR 0</span>
//             </div>
//             <div className="flex justify-between text-lg font-bold mb-6">
//               <span>Total</span>
//               <span>
//                 PKR {cartItems.reduce((total, item) => total + (item.productId.price * item.quantity), 0)}
//               </span>
//             </div>
            
//             <div className="mb-4">
//               <h4 className="font-medium text-gray-800 mb-3">Shipping Details</h4>
              
//               <div className="space-y-3">
//                 <div>
//                   <label className="block text-gray-700 text-sm mb-1">Full Name*</label>
//                   <input
//                     type="text"
//                     value={orderDetails.fullName}
//                     onChange={(e) => setOrderDetails({...orderDetails, fullName: e.target.value})}
//                     className="w-full p-2 border border-gray-300 rounded-lg"
//                     required
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-gray-700 text-sm mb-1">Phone Number*</label>
//                   <input
//                     type="tel"
//                     value={orderDetails.phone}
//                     onChange={(e) => setOrderDetails({...orderDetails, phone: e.target.value})}
//                     className="w-full p-2 border border-gray-300 rounded-lg"
//                     required
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-gray-700 text-sm mb-1">Address*</label>
//                   <textarea
//                     value={orderDetails.address}
//                     onChange={(e) => setOrderDetails({...orderDetails, address: e.target.value})}
//                     className="w-full p-2 border border-gray-300 rounded-lg"
//                     rows="2"
//                     required
//                   />
//                 </div>
                
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-gray-700 text-sm mb-1">City*</label>
//                     <input
//                       type="text"
//                       value={orderDetails.city}
//                       onChange={(e) => setOrderDetails({...orderDetails, city: e.target.value})}
//                       className="w-full p-2 border border-gray-300 rounded-lg"
//                       required
//                     />
//                   </div>
                  
//                   <div>
//                     <label className="block text-gray-700 text-sm mb-1">Postal Code</label>
//                     <input
//                       type="text"
//                       value={orderDetails.postalCode}
//                       onChange={(e) => setOrderDetails({...orderDetails, postalCode: e.target.value})}
//                       className="w-full p-2 border border-gray-300 rounded-lg"
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>
            
//             <div className="mb-6">
//               <h4 className="font-medium text-gray-800 mb-3">Payment Method</h4>
              
//               <div className="space-y-2">
//                 <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:border-green-500 cursor-pointer">
//                   <input
//                     type="radio"
//                     name="paymentMethod"
//                     value="stripe"
//                     checked={orderDetails.paymentMethod === 'stripe'}
//                     onChange={() => setOrderDetails({...orderDetails, paymentMethod: 'stripe'})}
//                     className="mr-2"
//                   />
//                   <div>
//                     <p className="font-medium">Credit/Debit Card</p>
//                     <p className="text-sm text-gray-500">Pay securely with Stripe</p>
//                   </div>
//                 </label>
                
//                 <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:border-green-500 cursor-pointer">
//                   <input
//                     type="radio"
//                     name="paymentMethod"
//                     value="cod"
//                     checked={orderDetails.paymentMethod === 'cod'}
//                     onChange={() => setOrderDetails({...orderDetails, paymentMethod: 'cod'})}
//                     className="mr-2"
//                   />
//                   <div>
//                     <p className="font-medium">Cash on Delivery</p>
//                     <p className="text-sm text-gray-500">Pay when you receive the order</p>
//                   </div>
//                 </label>
//               </div>
//             </div>
            
//             <button
//               onClick={handleCheckout}
//               className="w-full flex items-center justify-center py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
//               disabled={loading || !orderDetails.fullName || !orderDetails.phone || !orderDetails.address || !orderDetails.city}
//             >
//               {loading ? (
//                 <>
//                   <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   Processing...
//                 </>
//               ) : (
//                 <>
//                   <FaMoneyBillWave className="mr-2" /> Checkout (PKR {cartItems.reduce((total, item) => total + (item.productId.price * item.quantity), 0)})
//                 </>
//               )}
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );

//   const renderAddProductForm = () => (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.95 }}
//       animate={{ opacity: 1, scale: 1 }}
//       className="bg-white rounded-xl shadow-sm overflow-hidden mb-8 border border-gray-200"
//     >
//       <div className="p-6">
//         <h2 className="text-xl font-bold text-gray-800 mb-4">
//           {isEditingProduct ? 'Edit Product' : 'Add New Product'}
//         </h2>
        
//         <form onSubmit={isEditingProduct ? handleUpdateProduct : handleCreateProduct}>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div className="mb-4">
//               <label className="block text-gray-700 text-sm font-medium mb-2">Product Name*</label>
//               <input
//                 type="text"
//                 value={newProduct.name}
//                 onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                 required
//               />
//             </div>

//             <div className="mb-4">
//               <label className="block text-gray-700 text-sm font-medium mb-2">Category*</label>
//               <select
//                 value={newProduct.category}
//                 onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                 required
//               >
//                 {productCategories.map(category => (
//                   <option key={category} value={category}>{category}</option>
//                 ))}
//               </select>
//             </div>

//             <div className="mb-4">
//               <label className="block text-gray-700 text-sm font-medium mb-2">Price (PKR)*</label>
//               <input
//                 type="number"
//                 value={newProduct.price}
//                 onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                 required
//                 min="0"
//                 step="0.01"
//               />
//             </div>

//             <div className="mb-4">
//               <label className="block text-gray-700 text-sm font-medium mb-2">Quality Grade*</label>
//               <select
//                 value={newProduct.grade}
//                 onChange={(e) => setNewProduct({...newProduct, grade: e.target.value})}
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                 required
//               >
//                 <option value="A">Grade A (Premium)</option>
//                 <option value="B">Grade B (Standard)</option>
//                 <option value="C">Grade C (Economy)</option>
//               </select>
//             </div>

//             <div className="mb-4">
//               <label className="block text-gray-700 text-sm font-medium mb-2">Stock Quantity*</label>
//               <input
//                 type="number"
//                 value={newProduct.stock}
//                 onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                 required
//                 min="0"
//               />
//             </div>

//             <div className="mb-4">
//               <label className="block text-gray-700 text-sm font-medium mb-2">Farming Practices</label>
//               <input
//                 type="text"
//                 value={newProduct.farmingPractices}
//                 onChange={(e) => setNewProduct({...newProduct, farmingPractices: e.target.value})}
//                 placeholder="e.g., Organic, Rainfed"
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//               />
//             </div>

//             <div className="mb-4 md:col-span-2">
//               <label className="flex items-center">
//                 <input
//                   type="checkbox"
//                   checked={newProduct.isBidding}
//                   onChange={(e) => setNewProduct({...newProduct, isBidding: e.target.checked})}
//                   className="rounded border-gray-300 text-green-600 focus:ring-green-500"
//                 />
//                 <span className="ml-2 text-gray-700 text-sm font-medium">Enable Bidding</span>
//               </label>
//               <p className="text-gray-500 text-xs mt-1">Allow buyers to place bids on this product</p>
//             </div>

//             <div className="md:col-span-2 mb-4">
//               <label className="block text-gray-700 text-sm font-medium mb-2">Description*</label>
//               <textarea
//                 value={newProduct.description}
//                 onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 h-32"
//                 required
//               />
//             </div>

//             <div className="md:col-span-2 mb-4">
//               <label className="block text-gray-700 text-sm font-medium mb-2">Product Images*</label>
//               <input
//                 type="file"
//                 multiple
//                 onChange={handleProductImageChange}
//                 accept="image/*"
//                 className="hidden"
//                 id="productImages"
//               />
//               <label
//                 htmlFor="productImages"
//                 className="border-2 border-dashed border-gray-300 rounded-lg p-6 block text-center cursor-pointer hover:bg-gray-50 transition-colors"
//               >
//                 <FaCamera className="text-3xl text-gray-400 mx-auto mb-2" />
//                 <p className="text-gray-600">Click to upload product images</p>
//                 <p className="text-sm text-gray-500 mt-1">Maximum 5 images (JPEG/PNG)</p>
//               </label>

//               {previewImages.length > 0 && (
//                 <div className="mt-4 flex flex-wrap gap-4">
//                   {previewImages.map((img, index) => (
//                     <div key={index} className="relative w-24 h-24 group">
//                       <img
//                         src={img}
//                         alt={`Preview ${index}`}
//                         className="w-full h-full object-cover rounded-lg"
//                       />
//                       <button
//                         type="button"
//                         onClick={() => {
//                           const newPreviews = [...previewImages];
//                           const newImages = [...productImages];
//                           newPreviews.splice(index, 1);
//                           newImages.splice(index, 1);
//                           setPreviewImages(newPreviews);
//                           setProductImages(newImages);
//                         }}
//                         className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
//                       >
//                         <FaTimes className="text-xs" />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="flex justify-end space-x-4 mt-6">
//             <button
//               type="button"
//               onClick={() => {
//                 setIsAddingProduct(false);
//                 resetProductForm();
//               }}
//               className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
//               disabled={loading}
//             >
//               {loading ? (
//                 <>
//                   <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   Processing...
//                 </>
//               ) : (
//                 <>
//                   {isEditingProduct ? <FaEdit className="mr-2" /> : <FaPlus className="mr-2" />}
//                   {isEditingProduct ? 'Update Product' : 'Add Product'}
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </motion.div>
//   );

//   const renderBrowseProducts = () => (
//     <div className="space-y-6">
//       <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//           <div className="relative flex-1">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <FaSearch className="text-gray-400" />
//             </div>
//             <input
//               type="text"
//               name="searchQuery"
//               value={filters.searchQuery}
//               onChange={handleFilterChange}
//               placeholder="Search farm products..."
//               className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//             />
//           </div>
//           <button 
//             onClick={() => setMobileFiltersOpen(true)}
//             className="md:hidden flex items-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
//           >
//             <FaFilter className="mr-2" /> Filters
//           </button>
//           <div className="hidden md:flex items-center space-x-2">
//             <select
//               name="category"
//               value={filters.category}
//               onChange={handleFilterChange}
//               className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
//             >
//               <option value="">All Categories</option>
//               {productCategories.map(category => (
//                 <option key={category} value={category}>{category}</option>
//               ))}
//             </select>
//             <select
//               name="grade"
//               value={filters.grade}
//               onChange={handleFilterChange}
//               className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
//             >
//               <option value="">All Grades</option>
//               {productGrades.map(grade => (
//                 <option key={grade} value={grade}>Grade {grade}</option>
//               ))}
//             </select>
//             <button 
//               onClick={() => applyFilters()}
//               className="flex items-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm"
//             >
//               <FaFilter className="mr-2" /> Apply Filters
//             </button>
//           </div>
//         </div>
//       </div>

//       {loading ? (
//         <div className="text-center my-12">
//           <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
//           <p className="mt-2 text-gray-600">Loading farm products...</p>
//         </div>
//       ) : filteredProducts.length === 0 ? (
//         <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
//           <FaBox className="text-5xl text-gray-300 mx-auto mb-4" />
//           <h3 className="text-xl font-medium text-gray-700 mb-2">No Products Found</h3>
//           <p className="text-gray-500">Try adjusting your search or filters</p>
//           <button
//             onClick={() => setFilters({
//               category: '',
//               minPrice: '',
//               maxPrice: '',
//               grade: '',
//               searchQuery: ''
//             })}
//             className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
//           >
//             Reset Filters
//           </button>
//         </div>
//       ) : (
//         <>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {currentProducts.map(product => (
//               <ProductCard 
//                 key={product._id}
//                 product={product}
//                 userRole={userRole}
//                 onEdit={handleEditProduct}
//                 onDelete={handleDeleteProduct}
//                 onViewBids={handleViewBids}
//                 onPlaceBid={() => setSelectedProductForBid(product)}
//                 onAddToCart={() => {
//                   setSelectedProductForOrder(product);
//                   setIsAddingToCart(true);
//                 }}
//                 onBuyNow={() => setSelectedProductForOrder(product)}
//               />
//             ))}
//           </div>

//           {totalPages > 1 && (
//             <div className="flex justify-center mt-8">
//               <nav className="inline-flex rounded-md shadow">
//                 <button
//                   onClick={() => paginate(Math.max(1, currentPage - 1))}
//                   disabled={currentPage === 1}
//                   className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
//                 >
//                   <BsArrowLeft className="h-5 w-5" />
//                 </button>
//                 {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
//                   <button
//                     key={number}
//                     onClick={() => paginate(number)}
//                     className={`px-4 py-2 border-t border-b border-gray-300 ${currentPage === number ? 'bg-green-100 text-green-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
//                   >
//                     {number}
//                   </button>
//                 ))}
//                 <button
//                   onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
//                   disabled={currentPage === totalPages}
//                   className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
//                 >
//                   <BsArrowRight className="h-5 w-5" />
//                 </button>
//               </nav>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );

//   const renderOrdersTab = () => (
//     <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
//       {orders.length === 0 ? (
//         <div className="p-8 text-center">
//           <FaClipboardList className="text-5xl text-gray-300 mx-auto mb-4" />
//           <h3 className="text-xl font-medium text-gray-700 mb-2">No Orders Yet</h3>
//           <p className="text-gray-500">
//             {userRole === 'farmer' 
//               ? "You haven't received any orders for your products" 
//               : "You haven't placed any orders yet"}
//           </p>
//         </div>
//       ) : (
//         <div className="divide-y divide-gray-200">
//           {orders.map(order => order.productId && (
//             <OrderCard 
//               key={order._id}
//               order={order}
//               userRole={userRole}
//               onInitiatePayment={handleInitiatePayment}
//               onUpdateStatus={handleUpdateOrderStatus}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );

//   const renderBidsTab = () => (
//     <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
//       {bids.length === 0 ? (
//         <div className="p-8 text-center">
//           <FaGavel className="text-5xl text-gray-300 mx-auto mb-4" />
//           <h3 className="text-xl font-medium text-gray-700 mb-2">
//             {userRole === 'farmer' ? 'No Bids on Your Products' : 'No Bids Yet'}
//           </h3>
//           <p className="text-gray-500">
//             {userRole === 'farmer' 
//               ? "You haven't received any bids on your products" 
//               : "You haven't placed any bids on products yet"}
//           </p>
//         </div>
//       ) : (
//         <div className="divide-y divide-gray-200">
//           {bids.map(bid => bid.productId && (
//             <BidCard 
//               key={bid._id}
//               bid={bid}
//               userRole={userRole}
//               onAccept={handleAcceptBid}
//               onReject={handleRejectBid}
//               onCreateOrder={handleCreateOrder}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );

//   return (
//     <div className="bg-gradient-to-br from-green-50 to-green-100 min-h-screen p-4 md:p-8">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="mb-8"
//       >
//         <div className="flex justify-between items-start">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-800 mb-2">AgroTech Marketplace</h1>
//             <p className="text-gray-600">
//               {userRole === 'farmer' 
//                 ? 'Manage your agricultural products and orders' 
//                 : 'Browse and purchase high-quality agricultural products'}
//             </p>
//           </div>
//           {userRole === 'buyer' && (
//             <button 
//               onClick={() => setCartOpen(true)}
//               className="relative p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-lg"
//             >
//               <FaShoppingCart className="text-xl" />
//               {cartItems.length > 0 && (
//                 <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
//                   {cartItems.length}
//                 </span>
//               )}
//             </button>
//           )}
//         </div>
//       </motion.div>

//       <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 mb-6">
//         <div className="flex border-b border-gray-200 overflow-x-auto">
//           <button
//             onClick={() => setActiveTab('browse')}
//             className={`flex-1 py-4 px-6 text-center font-medium text-sm ${
//               activeTab === 'browse' 
//                 ? 'text-green-600 border-b-2 border-green-600' 
//                 : 'text-gray-500 hover:text-gray-700'
//             }`}
//           >
//             <FaStore className="inline mr-2" /> Browse Products
//           </button>
          
//           {userRole === 'farmer' && (
//             <button
//               onClick={() => setActiveTab('add')}
//               className={`flex-1 py-4 px-6 text-center font-medium text-sm ${
//                 activeTab === 'add' 
//                   ? 'text-green-600 border-b-2 border-green-600' 
//                   : 'text-gray-500 hover:text-gray-700'
//               }`}
//             >
//               <FaPlus className="inline mr-2" /> Add Product
//             </button>
//           )}
          
//           <button
//             onClick={() => setActiveTab('orders')}
//             className={`flex-1 py-4 px-6 text-center font-medium text-sm ${
//               activeTab === 'orders' 
//                 ? 'text-green-600 border-b-2 border-green-600' 
//                 : 'text-gray-500 hover:text-gray-700'
//             }`}
//           >
//             <FaClipboardList className="inline mr-2" /> Orders
//           </button>
          
//           <button
//             onClick={() => setActiveTab('bids')}
//             className={`flex-1 py-4 px-6 text-center font-medium text-sm ${
//               activeTab === 'bids' 
//                 ? 'text-green-600 border-b-2 border-green-600' 
//                 : 'text-gray-500 hover:text-gray-700'
//             }`}
//           >
//             <FaGavel className="inline mr-2" /> {userRole === 'farmer' ? 'Bids on My Products' : 'My Bids'}
//           </button>
//         </div>
//       </div>

//       {error && (
//         <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
//           <p className="text-red-700">{error}</p>
//         </div>
//       )}

//       {activeTab === 'browse' && renderBrowseProducts()}
//       {activeTab === 'add' && renderAddProductForm()}
//       {activeTab === 'orders' && renderOrdersTab()}
//       {activeTab === 'bids' && renderBidsTab()}

//       {/* Modals */}
//       {selectedProductForBid && renderBidModal()}
//       {viewBidsForProduct && renderBidsListModal()}
//       {selectedProductForOrder && renderOrderModal()}
//       {selectedOrderForPayment && (
//         <PaymentComponent
//           orderId={selectedOrderForPayment}
//           orderTotal={orders.find(o => o._id === selectedOrderForPayment)?.totalPrice}
//           onPaymentSuccess={handlePaymentSuccess}
//           onClose={handlePaymentClose}
//           stripePublishableKey={stripePublishableKey}
//         />
//       )}
//       {renderCartSidebar()}
//     </div>
//   );
// };

// export default MarketPlace;