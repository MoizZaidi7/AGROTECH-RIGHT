import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTruck, FaRoute, FaBoxOpen, FaLeaf, FaMapMarkedAlt, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from '../../components/PaymentForm';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const TransportAssist = () => {
  const [transportOptions, setTransportOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    vehicleType: '',
    maxDistance: '',
    search: '',
    minCapacity: '',
  });
  const [selectedOption, setSelectedOption] = useState(null);
  const [transportDetails, setTransportDetails] = useState({
    pickupLocation: '',
    deliveryLocation: '',
    pickupDate: '',
    deliveryDate: '',
    packagingType: '',
    cropType: '',
    quantity: ''
  });
  const [routeDetails, setRouteDetails] = useState(null);
  const [packagingMaterials, setPackagingMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [transportGuidelines, setTransportGuidelines] = useState([]);
  const [activeTab, setActiveTab] = useState('transport');
  const [paymentModal, setPaymentModal] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);

  useEffect(() => {
    fetchTransportOptions();
    fetchPackagingMaterials();
    fetchTransportGuidelines();
  }, []);

  useEffect(() => {
    filterOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transportOptions, filters]);

  const fetchTransportOptions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/farmer/transport/options`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const safeOptions = (response.data?.options || []).map(option => ({
        _id: option._id || Math.random().toString(36).substr(2, 9),
        providerName: option.providerName || 'Unknown Provider',
        price: Number(option.price) || 0,
        vehicleType: option.vehicleType || 'Standard',
        capacity: Number(option.capacity) || 0,
        maxDistance: Number(option.maxDistance) || 0,
        description: option.description || 'No description available',
        availability: option.availability !== undefined ? option.availability : true
      }));
      
      setTransportOptions(safeOptions);
      setError('');
    } catch (err) {
      console.error('Fetch transport options error:', err);
      setError(err.response?.data?.error || 'Failed to fetch transport options');
      setTransportOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPackagingMaterials = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/farmer/transport/packaging`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPackagingMaterials(response.data.materials || []);
    } catch (err) {
      console.error('Failed to fetch packaging materials:', err);
      setError('Failed to fetch packaging materials. Please try again.');
    }
  };

  const fetchTransportGuidelines = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/farmer/transport/guidelines`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTransportGuidelines(response.data.guidelines || []);
    } catch (err) {
      console.error('Failed to fetch transport guidelines:', err);
      setError('Failed to fetch transport guidelines. Please try again.');
    }
  };

  const filterOptions = () => {
    let filtered = [...transportOptions];
    
    if (filters.vehicleType) {
      filtered = filtered.filter(item => item.vehicleType === filters.vehicleType);
    }
    
    if (filters.maxDistance) {
      filtered = filtered.filter(item => item.maxDistance >= Number(filters.maxDistance));
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.providerName.toLowerCase().includes(searchTerm) || 
        item.description.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filters.minCapacity) {
      filtered = filtered.filter(item => item.capacity >= Number(filters.minCapacity));
    }
    
    setFilteredOptions(filtered);
  };

  const calculateTransportCost = (distance, pricePerKm) => {
    return Math.round(distance * pricePerKm);
  };

  const handlePaymentRequest = async () => {
    if (!selectedOption || !transportDetails.pickupLocation || !transportDetails.deliveryLocation) {
      setError('Please select transport option and fill required details');
      return;
    }
    
    try {
      setLoading(true);
      
      // First calculate route to get distance
      const routeResponse = await axios.post(`${process.env.REACT_APP_API_URL}/api/farmer/transport/route`, {
        pickup: transportDetails.pickupLocation,
        delivery: transportDetails.deliveryLocation
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const distance = routeResponse.data.route.distance;
      const amount = calculateTransportCost(distance, selectedOption.price);
      
      const paymentResponse = await axios.post(`${process.env.REACT_APP_API_URL}/api/farmer/payment/transport`, {
        transportId: selectedOption._id,
        distance,
        amount
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setRouteDetails(routeResponse.data.route);
      setClientSecret(paymentResponse.data.clientSecret);
      setPaymentAmount(amount);
      setPaymentModal(true);
      
    } catch (err) {
      console.error("Payment request error:", err);
      setError(err.response?.data?.error || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/farmer/transport/request`, {
        optionId: selectedOption._id,
        ...transportDetails
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setTransportOptions(transportOptions.map(item => 
        item._id === selectedOption._id ? response.data.option : item
      ));
      
      setSelectedOption(null);
      setTransportDetails({
        pickupLocation: '',
        deliveryLocation: '',
        pickupDate: '',
        deliveryDate: '',
        packagingType: '',
        cropType: '',
        quantity: ''
      });
      setPaymentModal(false);
    } catch (err) {
      console.error("Transport request error:", err);
      setError(err.response?.data?.error || 'Failed to complete transport request');
    } finally {
      setLoading(false);
    }
  };

  const calculateOptimalRoute = async () => {
    if (!transportDetails.pickupLocation || !transportDetails.deliveryLocation) {
      setError('Please enter pickup and delivery locations');
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/farmer/transport/route`, {
        pickup: transportDetails.pickupLocation,
        delivery: transportDetails.deliveryLocation
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setRouteDetails(response.data.route);
    } catch (err) {
      console.error("Route calculation error:", err);
      setError(err.response?.data?.error || 'Failed to calculate optimal route');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 bg-gradient-to-r from-green-600 to-green-900 rounded-2xl p-8 shadow-lg"
      >
        <div className="flex items-center gap-3 mb-3">
          <FaTruck className="text-4xl text-green-200" />
          <h1 className="text-4xl font-bold text-white">Crop Transportation Assistance</h1>
        </div>
        <p className="text-green-50 text-lg">Manage your crop transportation with optimal routes and sustainable packaging</p>
      </motion.div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => setError('')} 
            className="text-sm text-red-700 underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg mb-8 p-2 flex flex-wrap gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('transport')}
          className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all ${
            activeTab === 'transport' 
              ? 'bg-gradient-to-r from-green-500 to-green-700 text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaTruck /> Transportation
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('route')}
          className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all ${
            activeTab === 'route' 
              ? 'bg-gradient-to-r from-green-500 to-green-700 text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaRoute /> Optimal Route
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('packaging')}
          className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all ${
            activeTab === 'packaging' 
              ? 'bg-gradient-to-r from-green-500 to-green-700 text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaBoxOpen /> Packaging
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('guidelines')}
          className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all ${
            activeTab === 'guidelines' 
              ? 'bg-gradient-to-r from-green-500 to-green-700 text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaMapMarkedAlt /> Guidelines
        </motion.button>
      </div>

      {activeTab === 'transport' && (
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaTruck className="text-green-600" /> Transportation Options
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-gray-800 font-semibold mb-2">Vehicle Type</label>
              <select
                value={filters.vehicleType}
                onChange={(e) => setFilters({...filters, vehicleType: e.target.value})}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-green-300"
              >
                <option value="">All Types</option>
                <option value="Truck">Truck</option>
                <option value="Van">Van</option>
                <option value="Pickup">Pickup</option>
                <option value="Refrigerated">Refrigerated Truck</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Max Distance (km)</label>
              <input
                type="number"
                value={filters.maxDistance}
                onChange={(e) => setFilters({...filters, maxDistance: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="e.g. 100"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  placeholder="Search providers..."
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg"
                />
                <FaSearch className="absolute left-3 top-4 text-gray-400" />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Min Capacity (kg)</label>
              <input
                type="number"
                value={filters.minCapacity}
                onChange={(e) => setFilters({...filters, minCapacity: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="e.g. 500"
              />
            </div>
          </div>

          {loading && filteredOptions.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
              <p className="mt-2 text-gray-600">Loading transport options...</p>
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <FaTruck className="text-5xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">No Transport Options Found</h3>
              <p className="text-gray-500">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOptions.map(option => (
                <motion.div
                  key={option._id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
                >
                  <div className="relative h-48 bg-gray-100 flex items-center justify-center">
                    <div className="text-4xl text-blue-600">
                      <FaTruck />
                    </div>
                    <div className={`absolute top-2 right-2 text-white text-xs font-bold px-2 py-1 rounded ${
                      option.availability ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                      {option.availability ? 'Available' : 'Unavailable'}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-800">{option.providerName}</h3>
                      <span className="text-green-600 font-bold">PKR {option.price}/km</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-1">
                      <span className="font-medium">Vehicle Type:</span> {option.vehicleType}
                    </p>
                    <p className="text-gray-600 text-sm mb-1">
                      <span className="font-medium">Capacity:</span> {option.capacity} kg
                    </p>
                    <p className="text-gray-600 text-sm mb-1">
                      <span className="font-medium">Max Distance:</span> {option.maxDistance} km
                    </p>
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">{option.description}</p>
                    
                    <button
                      onClick={() => setSelectedOption(option)}
                      disabled={!option.availability}
                      className={`w-full flex items-center justify-center py-2 rounded-lg transition-all ${
                        option.availability 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {option.availability ? 'Book Transport' : 'Unavailable'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'route' && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FaRoute className="mr-2" /> Optimal Route Planning
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Pickup Location</label>
              <input
                type="text"
                value={transportDetails.pickupLocation}
                onChange={(e) => setTransportDetails({...transportDetails, pickupLocation: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Enter pickup address"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Delivery Location</label>
              <input
                type="text"
                value={transportDetails.deliveryLocation}
                onChange={(e) => setTransportDetails({...transportDetails, deliveryLocation: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Enter delivery address"
              />
            </div>
          </div>
          
          <button
            onClick={calculateOptimalRoute}
            className="w-full md:w-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
            disabled={loading || !transportDetails.pickupLocation || !transportDetails.deliveryLocation}
          >
            {loading ? 'Calculating...' : 'Calculate Optimal Route'}
          </button>
          
          {routeDetails && (
            <div className="mt-6 bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Route Map</h3>
              <div className="h-64 w-full bg-gray-200 rounded-lg overflow-hidden">
                <iframe
                  title="Transport Route Map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps/embed/v1/directions?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&origin=${encodeURIComponent(transportDetails.pickupLocation)}&destination=${encodeURIComponent(transportDetails.deliveryLocation)}&mode=driving`}
                  allowFullScreen
                ></iframe>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-600">Distance</p>
                  <p className="font-bold">{routeDetails.distanceText || `${routeDetails.distance} km`}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-600">Duration</p>
                  <p className="font-bold">{routeDetails.durationText || routeDetails.time}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-sm text-purple-600">Estimated Cost</p>
                  <p className="font-bold">
                    PKR {selectedOption 
                      ? calculateTransportCost(routeDetails.distance, selectedOption.price)
                      : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">Route Summary</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Start: {routeDetails.startAddress || transportDetails.pickupLocation}</li>
                  {routeDetails.waypoints?.length > 0 && (
                    <li>Waypoints: {routeDetails.waypoints.join(', ')}</li>
                  )}
                  <li>End: {routeDetails.endAddress || transportDetails.deliveryLocation}</li>
                  {routeDetails.fuelEfficiency && (
                    <li>Fuel Efficiency: {routeDetails.fuelEfficiency}</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'packaging' && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FaBoxOpen className="mr-2" /> Sustainable Packaging Options
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packagingMaterials.map(material => (
              <motion.div
                key={material._id}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 cursor-pointer"
                onClick={() => setSelectedMaterial(material)}
              >
                <div className="relative h-40 bg-gray-100 flex items-center justify-center">
                  <div className="text-4xl text-green-600">
                    <FaLeaf />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                    {material.ecoRating}/5
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{material.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{material.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">PKR {material.price}/unit</span>
                    <span className="text-sm font-medium text-green-600">View Details</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'guidelines' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FaMapMarkedAlt className="mr-2" /> Transportation Guidelines
          </h2>
          
          <div className="space-y-4">
            {transportGuidelines.map(guideline => (
              <div key={guideline._id} className="border-b border-gray-200 pb-4 last:border-0">
                <h3 className="text-lg font-bold text-gray-800 mb-2">{guideline.cropType} - {guideline.quantityRange}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Packaging Recommendations</h4>
                    <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                      {guideline.packagingRecommendations.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Transportation Tips</h4>
                    <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                      {guideline.transportTips.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Book Transport Modal */}
      {selectedOption && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Book {selectedOption.providerName}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Pickup Location</label>
                <input
                  type="text"
                  value={transportDetails.pickupLocation}
                  onChange={(e) => setTransportDetails({...transportDetails, pickupLocation: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Enter pickup address"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Delivery Location</label>
                <input
                  type="text"
                  value={transportDetails.deliveryLocation}
                  onChange={(e) => setTransportDetails({...transportDetails, deliveryLocation: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Enter delivery address"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Pickup Date</label>
                <input
                  type="date"
                  value={transportDetails.pickupDate}
                  onChange={(e) => setTransportDetails({...transportDetails, pickupDate: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Delivery Date</label>
                <input
                  type="date"
                  value={transportDetails.deliveryDate}
                  onChange={(e) => setTransportDetails({...transportDetails, deliveryDate: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  min={transportDetails.pickupDate || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Crop Type</label>
                <select
                  value={transportDetails.cropType}
                  onChange={(e) => setTransportDetails({...transportDetails, cropType: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Select Crop Type</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Rice">Rice</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Quantity (kg)</label>
                <input
                  type="number"
                  value={transportDetails.quantity}
                  onChange={(e) => setTransportDetails({...transportDetails, quantity: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  min="1"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Packaging Type</label>
                <select
                  value={transportDetails.packagingType}
                  onChange={(e) => setTransportDetails({...transportDetails, packagingType: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Select Packaging</option>
                  {packagingMaterials.map(material => (
                    <option key={material._id} value={material._id}>{material.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setSelectedOption(null)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentRequest}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                disabled={loading || 
                  !transportDetails.pickupLocation || 
                  !transportDetails.deliveryLocation ||
                  !transportDetails.pickupDate ||
                  !transportDetails.deliveryDate ||
                  !transportDetails.cropType ||
                  !transportDetails.quantity
                }
              >
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Packaging Material Details Modal */}
      {selectedMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{selectedMaterial.name}</h2>
            
            <div className="mb-4">
              <p className="text-gray-700 mb-2">{selectedMaterial.description}</p>
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <span className="mr-4">Eco Rating: {selectedMaterial.ecoRating}/5</span>
                <span>Price: PKR {selectedMaterial.price}/unit</span>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-2">Material Specifications</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2"><span className="font-medium">Material Type:</span> {selectedMaterial.materialType}</p>
                <p className="text-gray-700 mb-2"><span className="font-medium">Weight Capacity:</span> {selectedMaterial.weightCapacity} kg</p>
                <p className="text-gray-700 mb-2"><span className="font-medium">Recyclable:</span> {selectedMaterial.recyclable ? 'Yes' : 'No'}</p>
                <p className="text-gray-700"><span className="font-medium">Biodegradable:</span> {selectedMaterial.biodegradable ? 'Yes' : 'No'}</p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedMaterial(null)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentModal && clientSecret && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Complete Payment</h2>
            <p className="mb-4 text-gray-600">Total Amount: PKR {paymentAmount.toLocaleString()}</p>
            
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm 
                amount={paymentAmount}
                clientSecret={clientSecret}
                onSuccess={handlePaymentSuccess}
                onCancel={() => setPaymentModal(false)}
              />
            </Elements>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportAssist;