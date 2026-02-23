import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWarehouse, FaClipboardCheck, FaGraduationCap, FaBook, FaSearch, FaCalendarAlt, FaCheckCircle, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from '../../components/PaymentForm';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const StorageAssist = () => {
  // State for storage facilities
  const [storageFacilities, setStorageFacilities] = useState([]);
  const [filteredFacilities, setFilteredFacilities] = useState([]);
  const [facilityFilters, setFacilityFilters] = useState({
    capacity: '',
    location: '',
    search: '',
    minPrice: '',
    maxPrice: '',
    climateControlled: false
  });
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [reservationDates, setReservationDates] = useState({
    startDate: '',
    endDate: ''
  });
  const [reservationCapacity, setReservationCapacity] = useState('');
  
  // State for crop assessment
  const [cropAssessment, setCropAssessment] = useState({
    cropType: '',
    starch: '',
    sugar: '',
    size: '',
    color: '',
    texture: '',
    moistureContent: '',
    image: null
  });
  const [assessmentResult, setAssessmentResult] = useState(null);

  // State for training modules
  const [trainingModules, setTrainingModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);

  // State for storage guidelines
  const [storageGuidelines, setStorageGuidelines] = useState([]);
  const [selectedGuideline, setSelectedGuideline] = useState(null);

  // Common state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('storage');
  const [successMessage, setSuccessMessage] = useState('');
  const [reservationComplete, setReservationComplete] = useState(false);
  const [reservationDetails, setReservationDetails] = useState(null);
  const [paymentModal, setPaymentModal] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);

  useEffect(() => {
    if (activeTab === 'storage') {
      fetchStorageFacilities();
    } else if (activeTab === 'training') {
      fetchTrainingModules();
    } else if (activeTab === 'guidelines') {
      fetchStorageGuidelines();
    }
  }, [activeTab]);

  useEffect(() => {
    filterFacilities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageFacilities, facilityFilters]);

  useEffect(() => {
    let timer;
    if (successMessage) {
      timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [successMessage]);

  const fetchStorageFacilities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/farmer/storage/facilities`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const facilities = response.data.facilities.map(facility => {
        const reservedCapacity = facility.reservations.reduce((sum, reservation) => {
          return sum + (reservation.reservedCapacity || 0);
        }, 0);
        
        return {
          ...facility,
          totalCapacity: facility.capacity,
          reservedCapacity
        };
      });
      
      setStorageFacilities(facilities || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch storage facilities');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainingModules = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/farmer/training/modules`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTrainingModules(response.data.modules || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch training modules');
    } finally {
      setLoading(false);
    }
  };

  const fetchStorageGuidelines = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/farmer/storage/guidelines`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStorageGuidelines(response.data.guidelines || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch storage guidelines');
    } finally {
      setLoading(false);
    }
  };

  const filterFacilities = () => {
    let filtered = [...storageFacilities];
    
    if (facilityFilters.capacity) {
      filtered = filtered.filter(item => 
        (item.totalCapacity - item.reservedCapacity) >= Number(facilityFilters.capacity)
      );
    }
    
    if (facilityFilters.location) {
      filtered = filtered.filter(item => 
        item.location.toLowerCase().includes(facilityFilters.location.toLowerCase())
      );
    }
    
    if (facilityFilters.search) {
      const searchTerm = facilityFilters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm) || 
        item.description.toLowerCase().includes(searchTerm)
      );
    }
    
    if (facilityFilters.minPrice) {
      filtered = filtered.filter(item => item.price >= Number(facilityFilters.minPrice));
    }
    
    if (facilityFilters.maxPrice) {
      filtered = filtered.filter(item => item.price <= Number(facilityFilters.maxPrice));
    }
    
    if (facilityFilters.climateControlled) {
      filtered = filtered.filter(item => item.climateControlled);
    }
    
    setFilteredFacilities(filtered);
  };

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleReserveFacility = async () => {
    if (!selectedFacility || !reservationDates.startDate || !reservationDates.endDate || !reservationCapacity) {
      setError('Please fill all required fields');
      return;
    }

    const availableCapacity = selectedFacility.totalCapacity - selectedFacility.reservedCapacity;

    if (Number(reservationCapacity) > availableCapacity) {
      setError(`Requested capacity (${reservationCapacity}kg) exceeds available capacity (${availableCapacity}kg)`);
      return;
    }

    try {
      setLoading(true);
      const days = calculateDays(reservationDates.startDate, reservationDates.endDate);
      const amount = selectedFacility.price * days * (Number(reservationCapacity) / 1000); // Assuming price is per ton
      
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/farmer/payment/storage`, {
        facilityId: selectedFacility._id,
        days,
        amount,
        capacity: reservationCapacity
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.data && response.data.clientSecret) {
        setClientSecret(response.data.clientSecret);
        setPaymentAmount(amount);
        setPaymentModal(true);
      } else {
        throw new Error('No client secret received from server');
      }
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
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/farmer/storage/reserve`, {
        facilityId: selectedFacility._id,
        startDate: reservationDates.startDate,
        endDate: reservationDates.endDate,
        reservedCapacity: Number(reservationCapacity)
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setStorageFacilities(facilities => facilities.map(facility => 
        facility._id === selectedFacility._id ? {
          ...facility,
          reservedCapacity: facility.reservedCapacity + Number(reservationCapacity),
          reservations: [...facility.reservations, response.data.reservation]
        } : facility
      ));
      
      setReservationDetails({
        capacity: reservationCapacity,
        facilityName: selectedFacility.name,
        startDate: reservationDates.startDate,
        endDate: reservationDates.endDate
      });

      setSelectedFacility(null);
      setReservationCapacity('');
      setReservationDates({ startDate: '', endDate: '' });
      setError('');
      setReservationComplete(true);
      setPaymentModal(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to complete reservation');
    } finally {
      setLoading(false);
    }
  };

  const handleCropAssessment = async () => {
  if (!cropAssessment.cropType || !cropAssessment.moistureContent || !cropAssessment.image) {
    setError('Please fill all required fields including image upload');
    return;
  }

  try {
    setLoading(true);
    setError('');
    setAssessmentResult(null);

    const formData = new FormData();
    formData.append('image', cropAssessment.image);
    formData.append('cropType', cropAssessment.cropType);
    formData.append('starch', cropAssessment.starch);
    formData.append('sugar', cropAssessment.sugar);
    formData.append('texture', cropAssessment.texture);
    formData.append('moistureContent', cropAssessment.moistureContent);

    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/farmer/cropquality`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    setAssessmentResult({
      predictedQuality: response.data.result // Matches backend response
    });

  } catch (err) {
    console.error('Assessment error:', err);
    setError(err.response?.data?.error || 'Failed to assess crop quality');
  } finally {
    setLoading(false);
  }
};

  const SuccessNotification = () => {
    useEffect(() => {
      const timer = setTimeout(() => {
        setReservationComplete(false);
        setReservationDetails(null);
      }, 5000);
      return () => clearTimeout(timer);
    }, []);
    
    if (!reservationComplete || !reservationDetails) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="fixed top-4 right-4 bg-green-50 border-l-4 border-green-500 p-4 mb-6 z-50"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaCheckCircle className="text-green-500 mr-2" />
            <p className="text-green-700">
              {`Successfully reserved ${reservationDetails.capacity}kg at ${reservationDetails.facilityName} ` +
              `from ${new Date(reservationDetails.startDate).toLocaleDateString()} ` +
              `to ${new Date(reservationDetails.endDate).toLocaleDateString()}`}
            </p>
          </div>
          <button 
            onClick={() => {
              setReservationComplete(false);
              setReservationDetails(null);
            }}
            className="text-green-600 hover:text-green-800 ml-4"
          >
            <FaTimes />
          </button>
        </div>
      </motion.div>
    );
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
          <FaWarehouse className="text-4xl text-green-200" />
          <h1 className="text-4xl font-bold text-white">Storage Assist</h1>
        </div>
        <p className="text-green-50 text-lg">Manage your crop storage, quality assessment, and improve your agricultural skills</p>
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

      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-green-50 border-l-4 border-green-500 p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaCheckCircle className="text-green-500 mr-2" />
                <p className="text-green-700">{successMessage}</p>
              </div>
              <button 
                onClick={() => setSuccessMessage('')}
                className="text-green-600 hover:text-green-800 ml-4"
              >
                <FaTimes />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SuccessNotification />

      <div className="bg-white rounded-xl shadow-lg mb-6 p-2 flex overflow-x-auto">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('storage')}
          className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'storage' 
              ? 'bg-gradient-to-r from-green-500 to-green-700 text-white shadow-md' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FaWarehouse /> Storage Facilities
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('assessment')}
          className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-2 ml-2 ${
            activeTab === 'assessment' 
              ? 'bg-gradient-to-r from-green-500 to-green-700 text-white shadow-md' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FaClipboardCheck /> Crop Assessment
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('training')}
          className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-2 ml-2 ${
            activeTab === 'training' 
              ? 'bg-gradient-to-r from-green-500 to-green-700 text-white shadow-md' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FaGraduationCap /> Training
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('guidelines')}
          className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-2 ml-2 ${
            activeTab === 'guidelines' 
              ? 'bg-gradient-to-r from-green-500 to-green-700 text-white shadow-md' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FaBook /> Guidelines
        </motion.button>
      </div>

      {activeTab === 'storage' && (
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FaSearch className="text-green-600" /> Filter Storage Facilities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-gray-800 font-medium mb-2">Minimum Capacity (kg)</label>
                <input
                  type="number"
                  value={facilityFilters.capacity}
                  onChange={(e) => setFacilityFilters({...facilityFilters, capacity: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-green-300"
                  placeholder="Enter minimum capacity"
                />
              </div>
              <div>
                <label className="block text-gray-800 font-medium mb-2">Location</label>
                <input
                  type="text"
                  value={facilityFilters.location}
                  onChange={(e) => setFacilityFilters({...facilityFilters, location: e.target.value})}
                  placeholder="Search by location..."
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-green-300"
                />
              </div>
              <div>
                <label className="block text-gray-800 font-medium mb-2">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    value={facilityFilters.search}
                    onChange={(e) => setFacilityFilters({...facilityFilters, search: e.target.value})}
                    placeholder="Search facilities..."
                    className="w-full p-3 pl-10 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-green-300"
                  />
                  <FaSearch className="absolute left-3 top-4 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-gray-800 font-medium mb-2">Min Price (PKR)</label>
                <input
                  type="number"
                  value={facilityFilters.minPrice}
                  onChange={(e) => setFacilityFilters({...facilityFilters, minPrice: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-green-300"
                  placeholder="Minimum price"
                />
              </div>
              <div>
                <label className="block text-gray-800 font-medium mb-2">Max Price (PKR)</label>
                <input
                  type="number"
                  value={facilityFilters.maxPrice}
                  onChange={(e) => setFacilityFilters({...facilityFilters, maxPrice: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-green-300"
                  placeholder="Maximum price"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all w-full">
                  <input
                    type="checkbox"
                    id="climateControlled"
                    checked={facilityFilters.climateControlled}
                    onChange={(e) => setFacilityFilters({...facilityFilters, climateControlled: e.target.checked})}
                    className="h-5 w-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <span className="text-gray-800 font-medium">Climate Controlled Only</span>
                </label>
              </div>
            </div>
          </div>

          {loading && filteredFacilities.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-3 border-b-3 border-green-500"></div>
              <p className="mt-4 text-gray-700 font-medium text-lg">Loading facilities...</p>
            </div>
          ) : filteredFacilities.length === 0 ? (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl shadow-lg p-12 text-center">
              <FaWarehouse className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No Storage Facilities Found</h3>
              <p className="text-gray-500 text-lg">Try adjusting your filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFacilities.map(facility => (
                <motion.div
                  key={facility._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-100 hover:border-green-300 hover:shadow-2xl"
                >
                  <div className="relative h-52 bg-gradient-to-br from-green-100 to-emerald-100">
                    {facility.image ? (
                      <img
                        src={facility.image}
                        alt={facility.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaWarehouse className="text-6xl text-green-400" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      <span className={facility.climateControlled ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white px-3 py-1.5 rounded-full' : 'bg-gray-600 text-white px-3 py-1.5 rounded-full'}>
                        {facility.climateControlled ? '❄️ Climate-Controlled' : '📦 Standard'}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-800">{facility.name}</h3>
                      <span className="text-green-700 font-bold text-lg bg-green-100 px-3 py-1 rounded-lg">PKR {facility.price}/mo</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-green-600" />
                      <span className="font-medium">{facility.location}</span>
                    </p>
                    <p className="text-gray-600 text-sm mb-3">
                      <span className="font-semibold">Capacity:</span> 
                      <span className="text-gray-800"> {facility.totalCapacity} kg</span>
                      <span className="block text-green-600 mt-1">Available: {facility.totalCapacity - facility.reservedCapacity} kg</span>
                    </p>
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">{facility.description}</p>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedFacility(facility)}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-xl hover:from-green-600 hover:to-green-800 transition-all shadow-md hover:shadow-lg font-medium"
                    >
                      <FaCalendarAlt /> Reserve Now
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'assessment' && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Crop Quality Assessment</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Crop Type*</label>
              <select
                value={cropAssessment.cropType}
                onChange={(e) => setCropAssessment({...cropAssessment, cropType: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Select Crop Type</option>
                <option value="Rice">Rice</option>
                <option value="Maize">Maize</option>
                <option value="Chickpea">Chickpea</option>
                <option value="Kidneybeans">Kidneybeans</option>
                <option value="Pigeonpeas">Pigeonpeas</option>
                <option value="Mothbeans">Mothbeans</option>
                <option value="Mungbean">Mungbean</option>
                <option value="Blackgram">Blackgram</option>
                <option value="Lentil">Lentil</option>
                <option value="Pomegranate">Pomegranate</option>
                <option value="Banana">Banana</option>
                <option value="Mango">Mango</option>
                <option value="Grapes">Grapes</option>
                <option value="Watermelon">Watermelon</option>
                <option value="Muskmelon">Muskmelon</option>
                <option value="Apple">Apple</option>
                <option value="Orange">Orange</option>
                <option value="Papaya">Papaya</option>
                <option value="Coconut">Coconut</option>
                <option value="Cotton">Cotton</option>
                <option value="Jute">Jute</option>
                <option value="Coffee">Coffee</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Moisture Content (%)*</label>
              <input
                type="number"
                value={cropAssessment.moistureContent}
                onChange={(e) => setCropAssessment({...cropAssessment, moistureContent: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg"
                min="0"
                max="100"
                step="0.1"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Starch Content (%)</label>
              <input
                type="number"
                value={cropAssessment.starch}
                onChange={(e) => setCropAssessment({...cropAssessment, starch: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg"
                min="0"
                max="100"
                step="0.1"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Sugar Content (°Brix)</label>
              <input
                type="number"
                value={cropAssessment.sugar}
                onChange={(e) => setCropAssessment({...cropAssessment, sugar: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg"
                min="0"
                step="0.1"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Size (cm)</label>
              <input
                type="number"
                value={cropAssessment.size}
                onChange={(e) => setCropAssessment({...cropAssessment, size: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg"
                min="0"
                step="0.1"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Color</label>
              <select
                value={cropAssessment.color}
                onChange={(e) => setCropAssessment({...cropAssessment, color: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="">Select Color</option>
                <option value="Green">Green</option>
                <option value="Yellow">Yellow</option>
                <option value="Brown">Brown</option>
                <option value="Red">Red</option>
                <option value="White">White</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Texture</label>
              <select
                value={cropAssessment.texture}
                onChange={(e) => setCropAssessment({...cropAssessment, texture: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="">Select Texture</option>
                <option value="Smooth">Smooth</option>
                <option value="Rough">Rough</option>
                <option value="Fibrous">Fibrous</option>
                <option value="Soft">Soft</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div className="mb-4">
            <label className="block text-gray-700 mb-2">Crop Image*</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCropAssessment({...cropAssessment, image: e.target.files[0]})}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
            </div>
          </div>
          
          <button
            onClick={handleCropAssessment}
            className="w-full md:w-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
            disabled={loading}
          >
            {loading ? 'Assessing...' : 'Assess Crop Quality'}
          </button>
          
          {assessmentResult && (
            <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Assessment Result</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-gray-700 mb-1">
                    <span className="font-medium">Predicted Quality:</span> 
                    <span className="font-bold text-lg ml-2">{assessmentResult.predictedQuality}</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'training' && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Grading Skills Improvement</h2>
          
          {loading && trainingModules.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
              <p className="mt-2 text-gray-600">Loading training modules...</p>
            </div>
          ) : trainingModules.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <FaGraduationCap className="text-5xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">No Training Modules Available</h3>
              <p className="text-gray-500">Check back later for new training content</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trainingModules.map(module => (
                <motion.div
                  key={module._id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 cursor-pointer"
                  onClick={() => setSelectedModule(module)}
                >
                  <div className="relative h-40 bg-gray-100 flex items-center justify-center">
                    <div className="text-4xl text-green-600">
                      <FaGraduationCap />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                      {module.level}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{module.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{module.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{module.duration} mins</span>
                      <span className="text-sm font-medium text-green-600">Start Learning</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'guidelines' && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Storage & Handling Guidelines</h2>
          
          {loading && storageGuidelines.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
              <p className="mt-2 text-gray-600">Loading guidelines...</p>
            </div>
          ) : storageGuidelines.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <FaBook className="text-5xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">No Guidelines Available</h3>
              <p className="text-gray-500">Check back later for updated guidelines</p>
            </div>
          ) : (
            <div className="space-y-6">
              {storageGuidelines.map(guideline => (
                <div 
                  key={guideline._id} 
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedGuideline(guideline)}
                >
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {guideline.cropType} - Grade {guideline.grade}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Storage Requirements</h4>
                      <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                        {guideline.storageRequirements.slice(0, 2).map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                        {guideline.storageRequirements.length > 2 && (
                          <li className="text-green-600">+{guideline.storageRequirements.length - 2} more</li>
                        )}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Handling Procedures</h4>
                      <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                        {guideline.handlingProcedures.slice(0, 2).map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                        {guideline.handlingProcedures.length > 2 && (
                          <li className="text-green-600">+{guideline.handlingProcedures.length - 2} more</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedFacility && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Reserve {selectedFacility.name}
            </h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Capacity Needed (kg)</label>
              <input
                type="number"
                value={reservationCapacity}
                onChange={(e) => setReservationCapacity(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                min="1"
                max={selectedFacility.totalCapacity - selectedFacility.reservedCapacity}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Available: {selectedFacility.totalCapacity - selectedFacility.reservedCapacity} kg
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={reservationDates.startDate}
                onChange={(e) => setReservationDates({...reservationDates, startDate: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={reservationDates.endDate}
                onChange={(e) => setReservationDates({...reservationDates, endDate: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg"
                min={reservationDates.startDate || new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            
            {reservationDates.startDate && reservationDates.endDate && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-800 font-medium">Rental Summary</p>
                <div className="flex justify-between mt-2">
                  <span>Days:</span>
                  <span>{calculateDays(reservationDates.startDate, reservationDates.endDate)}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span>Capacity:</span>
                  <span>{reservationCapacity} kg</span>
                </div>
                <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
                  <span className="font-medium">Estimated Total:</span>
                  <span className="font-medium">
                    PKR {(selectedFacility.price * calculateDays(reservationDates.startDate, reservationDates.endDate) * (Number(reservationCapacity) / 1000)).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => {
                  setSelectedFacility(null);
                  setReservationCapacity('');
                  setReservationDates({ startDate: '', endDate: '' });
                  setError('');
                }}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReserveFacility}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                disabled={loading || !reservationDates.startDate || !reservationDates.endDate || !reservationCapacity}
              >
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {paymentModal && clientSecret && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6">
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

      {selectedModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{selectedModule.title}</h2>
            
            <div className="mb-4">
              <p className="text-gray-700 mb-2">{selectedModule.description}</p>
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <span className="mr-4">Level: {selectedModule.level}</span>
                <span>Duration: {selectedModule.duration} minutes</span>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-2">Training Content</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                {selectedModule.content}
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedModule(null)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedGuideline && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {selectedGuideline.cropType} - Grade {selectedGuideline.grade} Guidelines
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Storage Requirements</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  {selectedGuideline.storageRequirements.map((item, index) => (
                    <li key={`storage-${index}`}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Handling Procedures</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  {selectedGuideline.handlingProcedures.map((item, index) => (
                    <li key={`handling-${index}`}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-bold text-gray-800 mb-2">Additional Notes</h3>
              <p className="text-gray-700">{selectedGuideline.notes || 'No additional notes provided.'}</p>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedGuideline(null)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorageAssist;