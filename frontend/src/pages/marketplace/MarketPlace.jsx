import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { switchProfile } from '../../Redux/authslice';
import axiosInstance from '../../utils/axiosConfig';
import { 
  FaStore, 
  FaClipboardList, 
  FaGavel, 
  FaShoppingCart,
  FaSearch,
  FaPlus,
  FaBell,
  FaUser,
  FaHome
} from 'react-icons/fa';
import axios from 'axios';

// Import components
import BidModal from './modalComponents/BidModal';
import BidsListModal from './modalComponents/BidsListModal';
import CartSidebar from './modalComponents/CartSidebar.jsx';
import OrderModal from './modalComponents/OrderModal.jsx';
import BidsTab from './BidsTab';
import OrdersTab from './OrdersTab';
import ProductBrowser from './ProductBrowser.jsx'
import ProductManagement from './ProductManagement.jsx';
import PaymentComponent from '../../components/PaymentComponent.jsx';


const MarketPlace = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const profileMenuRef = useRef(null);
  
  // Derive userRole from Redux user state, defaulting to 'customer'
  const userRole = user?.userType?.toLowerCase() || 'customer';
  
  console.log("MarketPlace - user:", user, "userRole:", userRole);
  
  // State management
  const [activeTab, setActiveTab] = useState('browse');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

  // Product and order state
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [bids, setBids] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [viewBidsForProduct, setViewBidsForProduct] = useState(null);
  const [productBids, setProductBids] = useState([]);

  // Order and payment state
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderDetails, setOrderDetails] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'stripe'
  });
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);

  // Bid state
  const [bidAmount, setBidAmount] = useState('');
  const [selectedProductForBid, setSelectedProductForBid] = useState(null);

  useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`
      };

      // Fetch products (if needed to be authenticated)
      const productsResponse = await axios.get(
        'http://localhost:5000/api/marketplace/products',
        { headers }
      );
      setProducts(Array.isArray(productsResponse.data) ? productsResponse.data : []);

      // Fetch orders 
      const ordersResponse = await axios.get(
        'http://localhost:5000/api/marketplace/orders/customer-orders',
        { headers }
      );
      console.log('Orders Response:', ordersResponse.data);
      const ordersData = Array.isArray(ordersResponse.data) ? ordersResponse.data : 
                        ordersResponse.data.orders ? ordersResponse.data.orders : [];
      setOrders(ordersData);

      // Fetch bids
      const bidsResponse = await axios.get(
        'http://localhost:5000/api/marketplace/bids',
        { headers }
      );
      console.log('Bids Response:', bidsResponse.data);
      const bidsData = bidsResponse.data.bids ? bidsResponse.data.bids : 
                      Array.isArray(bidsResponse.data) ? bidsResponse.data : [];
      setBids(bidsData);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [userRole]);

  // Filter bids for selected product
  useEffect(() => {
    if (viewBidsForProduct && Array.isArray(bids)) {
      const filteredBids = bids.filter(bid => bid.productId === viewBidsForProduct);
      setProductBids(filteredBids);
    }
  }, [viewBidsForProduct, bids]);

  // Navigation handler
  const handleNavigateToDashboard = () => {
    if (user?.userType === "Admin") {
      navigate("/dashboardadmin");
    } else if (user?.userType === "Farmer") {
      navigate("/dashboardfarmer");
    } else if (user?.userType === "Customer" || user?.userType === "Seller") {
      // For now, customers/sellers stay in marketplace unless they have specific dashboards
      navigate("/");
    } else {
      navigate("/");
    }
  };

  // Profile switching handler
  const handleSwitchProfile = async (newUserType) => {
    try {
      const response = await axiosInstance.post(
        "/users/switch-profile",
        { userType: newUserType },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.user) {
        dispatch(switchProfile({ userType: newUserType }));
        setShowProfileMenu(false);
        
        // Navigate based on new profile type
        if (newUserType === "Farmer") {
          navigate("/dashboardfarmer");
        } else if (newUserType === "Customer" || newUserType === "Seller") {
          navigate("/marketplace");
        }
      }
    } catch (error) {
      console.error("Error switching profile:", error);
      alert("Failed to switch profile. Please try again.");
    }
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu]);

  // Product handlers
  const handleSaveProduct = async (formData) => {
    try {
      // Add these inside the handleSaveProduct function
      const endpoint = isEditingProduct 
        ? `http://localhost:5000/api/marketplace/products/${selectedProduct._id}`
        : 'http://localhost:5000/api/marketplace/products';

      const method = isEditingProduct ? 'put' : 'post';

      const response = await axios[method](endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (isEditingProduct) {
        setProducts(products.map(p => p._id === selectedProduct._id ? response.data : p));
      } else {
        setProducts([...products, response.data]);
      }
    } catch (err) {
      setError(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      setLoading(true);
      // TODO: Implement product deletion logic
      console.log('Deleting product:', productId);
    } catch (err) {
      setError(err.message || 'Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  // Bid handlers
  const handlePlaceBid = async (productId) => {
    try {
      setLoading(true);
        const response = await axios.post('http://localhost:5000/api/marketplace/bids', {
        productId: selectedProductForBid._id,
        amount: parseFloat(bidAmount)
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setBids([...bids, response.data]);
    } catch (err) {
      setError(err.message || 'Failed to place bid');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBid = async (bidId) => {
    try {
      setLoading(true);
      await axios.put(`http://localhost:5000/api/marketplace/bids/${bidId}/accept`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('Accepting bid:', bidId);
    } catch (err) {
      setError(err.message || 'Failed to accept bid');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectBid = async (bidId) => {
    try {
      setLoading(true);
      await axios.put(`http://localhost:5000/api/marketplace/bids/${bidId}/reject`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });      
      console.log('Rejecting bid:', bidId);
    } catch (err) {
      setError(err.message || 'Failed to reject bid');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrderFromBid = async (bidId) => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/marketplace/orders', {
        productId: selectedProduct._id,
        quantity: orderQuantity,
        shippingDetails: {
          fullName: orderDetails.fullName,
          phone: orderDetails.phone,
          address: orderDetails.address,
          city: orderDetails.city,
          postalCode: orderDetails.postalCode
        },
        paymentMethod: orderDetails.paymentMethod
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setOrders([...orders, response.data]);      console.log('Creating order from bid:', bidId);
    } catch (err) {
      setError(err.message || 'Failed to create order from bid');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
  try {
    setLoading(true);
    setError('');

    // 1. Prepare payload
    const payload = {
      productId: selectedProduct._id,
      quantity: orderQuantity
    };

    // 2. Send order request to backend
    const response = await axios.post('http://localhost:5000/api/marketplace/orders', payload, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    const newOrder = response.data;

    // 3. Handle Stripe flow if needed
    if (orderDetails.paymentMethod === 'stripe') {
      setSelectedOrderForPayment(newOrder);
    }

    // 4. Update orders state
    setOrders(prev => [...prev, newOrder]);

    // 5. Reset form
    setSelectedProduct(null);
    setOrderQuantity(1);
    setOrderDetails({
      fullName: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      paymentMethod: 'stripe'
    });

    return newOrder;
  } catch (err) {
    setError(err.response?.data?.error || 'Failed to place order');
    throw err;
  } finally {
    setLoading(false);
  }
};

  const handleAddToCart = async () => {
    try {
      setLoading(true);
      // Add to cart logic
      const newCartItem = {
        _id: Date.now().toString(),
        productId: selectedProduct,
        quantity: orderQuantity
      };
      setCartItems(prev => [...prev, newCartItem]);
      setIsAddingToCart(false);
      setSelectedProduct(null);
    } catch (err) {
      setError(err.message || 'Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  // Cart handlers
  const handleUpdateCartItem = (itemId, quantity) => {
    setCartItems(prev =>
      prev.map(item =>
        item._id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const handleRemoveFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item._id !== itemId));
  };

  const handleCheckout = async () => {
  try {
    setLoading(true);
    setError('');

    // Prepare payload matching backend expectations
    const payload = {
      items: cartItems.map(item => ({
        productId: item.productId._id,
        quantity: item.quantity
      })),
      shippingDetails: orderDetails,
      paymentMethod: orderDetails.paymentMethod
    };

    // Create order
    const { data } = await axios.post(
      'http://localhost:5000/api/marketplace/orders/cart-checkout',
      payload,
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );

    // Handle response
    if (orderDetails.paymentMethod === 'stripe') {
      // For Stripe - use first order for payment (or implement multi-order payment)
      setSelectedOrderForPayment(data.orders[0]);
    } else {
      // For COD - update state
      setOrders(prev => [...prev, ...data.orders]);
      setCartItems([]);
      setCartOpen(false);
      
      // Show success
      alert(`${data.orders.length} orders placed successfully!`);
    }

    return data;

  } catch (err) {
    const errorMsg = err.response?.data?.error || 
                    err.response?.data?.message || 
                    'Checkout failed';
    setError(errorMsg);
    throw new Error(errorMsg);
  } finally {
    setLoading(false);
  }
};

  // Payment handlers
 const handlePaymentSuccess = async () => {
  if (selectedOrderForPayment) {
    try {
      // Verify payment with backend
      await axios.put(
        `http://localhost:5000/api/marketplace/orders/${selectedOrderForPayment._id}/confirm-payment`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      // Update local state
      setOrders(prev => [...prev, selectedOrderForPayment]);
      setCartItems([]);
      setCartOpen(false);
    } catch (err) {
      setError('Payment verification failed');
    }
  }
  setSelectedOrderForPayment(null);
};

  const handlePaymentClose = () => {
    setSelectedOrderForPayment(null);
  };

  // Order status handlers
  const handleUpdateOrderStatus = (orderId, status) => {
    setOrders(prev =>
      prev.map(order =>
        order._id === orderId ? { ...order, status } : order
      )
    );
  };

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'browse':
        return (
          <ProductBrowser
            products={products}
            userRole={userRole}
            loading={loading}
            onEditProduct={(product) => {
              setSelectedProduct(product);
              setIsEditingProduct(true);
            }}
            onDeleteProduct={handleDeleteProduct}
            onViewBids={(productId) => setViewBidsForProduct(productId)}
            onPlaceBid={(product) => setSelectedProductForBid(product)}
            onAddToCart={(product) => {
              setSelectedProduct(product);
              setIsAddingToCart(true);
            }}
            onBuyNow={(product) => {
              setSelectedProduct(product);
              setIsAddingToCart(false);
            }}
          />
        );
      case 'orders':
        return (
          <OrdersTab
            orders={orders}
            userRole={userRole}
            onInitiatePayment={(orderId) => {
              const order = orders.find(o => o._id === orderId);
              if (order) setSelectedOrderForPayment(order);
            }}
            onUpdateStatus={handleUpdateOrderStatus}
            stripePublishableKey={stripePublishableKey}
          />
        );
      case 'bids':
        return (
          <BidsTab
            userRole={userRole}
            onAccept={handleAcceptBid}
            onReject={handleRejectBid}
            onCreateOrder={handleCreateOrderFromBid}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-gray-100">
      {/* Modern Header */}
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo & Title */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                <FaStore className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  AgroTech Marketplace
                </h1>
                <p className="text-sm text-gray-500">Fresh from Farm to Your Door</p>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              {/* Back to Dashboard Button */}
              {user && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNavigateToDashboard}
                  className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <FaHome className="text-sm" />
                  <span>Dashboard</span>
                </motion.button>
              )}

              {/* Profile Switcher - Only for non-Admin users */}
              {user && user.userType !== "Admin" && (
                <div className="relative" ref={profileMenuRef}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
                  >
                    <FaUser className="text-sm" />
                    <span>{user.userType}</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${showProfileMenu ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </motion.button>

                  {/* Dropdown Menu */}
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50"
                    >
                      {["Farmer", "Customer", "Seller"].map((type) => (
                        <button
                          key={type}
                          onClick={() => handleSwitchProfile(type)}
                          disabled={user?.userType === type}
                          className={`w-full text-left px-4 py-3 hover:bg-green-50 transition-colors ${
                            user?.userType === type
                              ? "bg-green-100 text-green-800 font-semibold cursor-not-allowed"
                              : "text-gray-700"
                          }`}
                        >
                          {type}
                          {user?.userType === type && (
                            <span className="ml-2 text-xs">(Current)</span>
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              )}

              {/* Notification */}
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <FaBell className="text-xl text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Cart Button */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors group"
              >
                <FaShoppingCart className="text-xl text-gray-600 group-hover:text-green-600 transition-colors" />
                {cartItems.length > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-green-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg"
                  >
                    {cartItems.length}
                  </motion.span>
                )}
              </button>

              {/* Add Product Button (Farmers only) */}
              {userRole === 'farmer' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedProduct({
                      name: '',
                      category: '',
                      price: 0,
                      stock: 0,
                      grade: 'A',
                      description: '',
                      images: [],
                      isBidding: false,
                      farmingPractices: ''
                    });
                    setIsEditingProduct(false);
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <FaPlus className="text-sm" />
                  <span>Add Product</span>
                </motion.button>
              )}

              {/* User Avatar */}
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:shadow-lg transition-shadow">
                <FaUser />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Modern Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-6">
          <nav className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('browse')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center space-x-2 ${
                activeTab === 'browse'
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaSearch className="text-lg" />
              <span>Browse Products</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center space-x-2 ${
                activeTab === 'orders'
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaClipboardList className="text-lg" />
              <span>My Orders</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('bids')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center space-x-2 ${
                activeTab === 'bids'
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaGavel className="text-lg" />
              <span>Bids</span>
            </motion.button>
          </nav>
        </div>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Product Management Modal */}
        {selectedProduct && (
          <ProductManagement
            isEditing={isEditingProduct}
            product={selectedProduct}
            onSave={handleSaveProduct}
            onCancel={() => {
              setSelectedProduct(null);
              setIsEditingProduct(false);
            }}
            loading={loading}
          />
        )}
      </main>

      {/* Modals */}
      {selectedProductForBid && (
        <BidModal
          selectedProductForBid={selectedProductForBid}
          bidAmount={bidAmount}
          setBidAmount={setBidAmount}
          error={error}
          setSelectedProductForBid={setSelectedProductForBid}
          setError={setError}
          handlePlaceBid={handlePlaceBid}
        />
      )}
      
      {viewBidsForProduct && (
        <BidsListModal
          viewBidsForProduct={viewBidsForProduct}
          products={products}
          productBids={productBids}
          setViewBidsForProduct={setViewBidsForProduct}
          handleAcceptBid={handleAcceptBid}
          handleRejectBid={handleRejectBid}
        />
      )}
      
      {selectedProduct && !isEditingProduct && (
        <OrderModal
          isAddingToCart={isAddingToCart}
          selectedProductForOrder={selectedProduct}
          orderQuantity={orderQuantity}
          setOrderQuantity={setOrderQuantity}
          orderDetails={orderDetails}
          setOrderDetails={setOrderDetails}
          loading={loading}
          setSelectedProductForOrder={setSelectedProduct}
          setIsAddingToCart={setIsAddingToCart}
          error={error}
          setError={setError}
          handleAddToCart={handleAddToCart}
          handlePlaceOrder={handlePlaceOrder}
          stripePublishableKey={stripePublishableKey}
        />
      )}
      
      <CartSidebar
        cartOpen={cartOpen}
        setCartOpen={setCartOpen}
        cartItems={cartItems.map(item => ({
          ...item,
          productId: products.find(p => p._id === item.productId._id) || item.productId
        }))}
        orderDetails={orderDetails}
        setOrderDetails={setOrderDetails}
        loading={loading}
        handleUpdateCartItem={handleUpdateCartItem}
        handleRemoveFromCart={handleRemoveFromCart}
        handleCheckout={handleCheckout}
        setActiveTab={setActiveTab}
        stripePublishableKey={stripePublishableKey}
      />

      {selectedOrderForPayment && orderDetails.paymentMethod === 'stripe' && (
  <PaymentComponent
    orderId={selectedOrderForPayment._id}
    orderTotal={selectedOrderForPayment.totalPrice}
    onPaymentSuccess={handlePaymentSuccess}
    onClose={handlePaymentClose}
    stripePublishableKey={stripePublishableKey}
  />
)}
    </div>
  );
};

export default MarketPlace;