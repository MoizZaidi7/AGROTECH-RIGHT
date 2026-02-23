import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTractor, FaTools, FaShoppingCart, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from '../../components/PaymentForm';

// Make sure this key is properly set in your .env file
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const HarvestEquipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    availability: 'Available',
    search: '',
    minPrice: '',
    maxPrice: ''
  });
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [requestDates, setRequestDates] = useState({
    startDate: '',
    endDate: ''
  });
  const [schedules, setSchedules] = useState([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState('');
  const [paymentModal, setPaymentModal] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);

  useEffect(() => {
    fetchEquipment();
    fetchSchedules();
  }, []);

  useEffect(() => {
    filterEquipment();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipment, filters]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/farmer/harvest/equipment`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEquipment(response.data.equipment);
      setFilteredEquipment(response.data.equipment); // Initialize filtered equipment
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch equipment');
      console.error("Equipment fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/farmer/harvest/schedules`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSchedules(response.data.schedules || []);
    } catch (err) {
      console.error('Failed to fetch schedules:', err);
      setError('Failed to fetch schedules. Please try again.');
    }
  };

  const filterEquipment = () => {
    if (!equipment.length) return;
    
    let filtered = [...equipment];
    
    if (filters.type) {
      filtered = filtered.filter(item => item.type === filters.type);
    }
    
    if (filters.availability) {
      filtered = filtered.filter(item => item.availability === filters.availability);
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm) || 
        item.description.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filters.minPrice) {
      filtered = filtered.filter(item => item.price >= Number(filters.minPrice));
    }
    
    if (filters.maxPrice) {
      filtered = filtered.filter(item => item.price <= Number(filters.maxPrice));
    }
    
    setFilteredEquipment(filtered);
  };

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
  };

  const handlePaymentRequest = async () => {
    if (!selectedEquipment || !requestDates.startDate || !requestDates.endDate) {
      setError('Please select equipment and dates');
      return;
    }
    if (!selectedScheduleId) {
      setError('Please select a schedule');
      return;
    }

    try {
      setLoading(true);
      const days = calculateDays(requestDates.startDate, requestDates.endDate);
      const amount = selectedEquipment.price * days;
      
      console.log("Initiating payment request for:", {
        equipmentId: selectedEquipment._id,
        days,
        amount
      });
      
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/farmer/payment/equipment`, {
        equipmentId: selectedEquipment._id,
        days,
        amount
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      console.log("Payment request response:", response.data);
      
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
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/farmer/harvest/equipment/request`, {
        equipmentId: selectedEquipment._id,
        startDate: requestDates.startDate,
        endDate: requestDates.endDate,
        scheduleId: selectedScheduleId
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setEquipment(equipment.map(item => 
        item._id === selectedEquipment._id ? response.data.equipment : item
      ));
      
      setSelectedEquipment(null);
      setRequestDates({ startDate: '', endDate: '' });
      setSelectedScheduleId('');
      setPaymentModal(false);
    } catch (err) {
      console.error("Equipment request error:", err);
      setError(err.response?.data?.error || 'Failed to complete equipment request');
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
          <FaTractor className="text-4xl text-green-200" />
          <h1 className="text-4xl font-bold text-white">Harvest Equipment</h1>
        </div>
        <p className="text-green-50 text-lg">Browse and request equipment for your harvest operations</p>
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

      <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FaSearch className="text-green-600" /> Filter Equipment
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-gray-800 font-semibold mb-2">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-green-300"
            >
              <option value="">All Types</option>
              <option value="Tractor">Tractor</option>
              <option value="Harvester">Harvester</option>
              <option value="Irrigation">Irrigation</option>
              <option value="Tool">Tool</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-800 font-semibold mb-2">Availability</label>
            <select
              value={filters.availability}
              onChange={(e) => setFilters({...filters, availability: e.target.value})}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-green-300"
            >
              <option value="Available">Available</option>
              <option value="Rented Out">Rented Out</option>
              <option value="Under Maintenance">Under Maintenance</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-800 font-semibold mb-2">Search</label>
            <div className="relative">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                placeholder="Search equipment..."
                className="w-full p-3 pl-10 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-green-300"
              />
              <FaSearch className="absolute left-3 top-4 text-gray-400" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Min Price (PKR)</label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Max Price (PKR)</label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      {loading && filteredEquipment.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          <p className="mt-2 text-gray-600">Loading equipment...</p>
        </div>
      ) : filteredEquipment.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <FaTools className="text-5xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">No Equipment Found</h3>
          <p className="text-gray-500">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map(item => (
            <motion.div
              key={item._id}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="relative h-48 bg-gray-100">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FaTractor className="text-4xl" />
                  </div>
                )}
                <div className={`absolute top-2 right-2 text-white text-xs font-bold px-2 py-1 rounded ${
                  item.availability === 'Available' ? 'bg-green-600' : 
                  item.availability === 'Rented Out' ? 'bg-red-600' : 'bg-yellow-600'
                }`}>
                  {item.availability}
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                  <span className="text-green-600 font-bold">PKR {item.price}/day</span>
                </div>
                <p className="text-gray-600 text-sm mb-3">{item.type}</p>
                <p className="text-gray-700 text-sm mb-4 line-clamp-2">{item.description}</p>
                
                <button
                  onClick={() => setSelectedEquipment(item)}
                  disabled={item.availability !== 'Available'}
                  className={`w-full flex items-center justify-center py-2 rounded-lg transition-all ${
                    item.availability === 'Available' 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <FaShoppingCart className="mr-2" /> 
                  {item.availability === 'Available' ? 'Request' : 'Unavailable'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Equipment Request Modal */}
      {selectedEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Request {selectedEquipment.name}</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={requestDates.startDate}
                onChange={(e) => setRequestDates({...requestDates, startDate: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={requestDates.endDate}
                onChange={(e) => setRequestDates({...requestDates, endDate: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg"
                min={requestDates.startDate || new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Select Schedule</label>
              <select
                value={selectedScheduleId}
                onChange={(e) => setSelectedScheduleId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Select a Schedule</option>
                {schedules.map(schedule => {
                  if (!schedule) return null;
                  const formattedDate = new Date(schedule.preferredDate).toLocaleDateString();
                  return (
                    <option key={schedule._id} value={schedule._id}>
                      {`${schedule.cropType} - ${formattedDate} (${schedule.status || 'Scheduled'})`}
                    </option>
                  );
                })}
              </select>
            </div>
            
            {requestDates.startDate && requestDates.endDate && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-800 font-medium">Rental Summary</p>
                <div className="flex justify-between mt-2">
                  <span>Days:</span>
                  <span>{calculateDays(requestDates.startDate, requestDates.endDate)}</span>
                </div>
                <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
                  <span className="font-medium">Total:</span>
                  <span className="font-medium">
                    PKR {(selectedEquipment.price * calculateDays(requestDates.startDate, requestDates.endDate)).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setSelectedEquipment(null)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentRequest}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                disabled={loading || !requestDates.startDate || !requestDates.endDate || !selectedScheduleId}
              >
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal with Stripe Elements */}
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
    </div>
  );
};

export default HarvestEquipment;