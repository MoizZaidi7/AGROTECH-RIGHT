import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaTractor, FaTools, FaCheck, FaTimes, FaInfoCircle } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosConfig';

const Requests = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  const [error, setError] = useState('');

  // Fetch equipment
  useEffect(() => {
    const fetchEquipmentrequest = async () => {
  try {
    setLoading(true);
    const response = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/admin/equipment/requests`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    const requestData = response.data.requests || [];
    setEquipmentList(Array.isArray(requestData) ? requestData : []);
  } catch (err) {
    setError(err.response?.data?.error || 'Failed to fetch equipment requests');
    setEquipmentList([]);
  } finally {
    setLoading(false);
  }
};


    fetchEquipmentrequest();
  }, []);

  // Filter equipment based on status and search
  const filterEquipment = () => {
  if (!Array.isArray(equipmentList)) return [];

  let filtered = [...equipmentList];

  if (filters.status) {
    filtered = filtered.filter(item => item.status === filters.status);
  }

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter(item => 
      item.equipmentName?.toLowerCase().includes(searchTerm) ||
      item.equipmentType?.toLowerCase().includes(searchTerm) ||
      item.farmer?.firstName?.toLowerCase().includes(searchTerm) ||
      item.farmer?.email?.toLowerCase().includes(searchTerm)
    );
  }

  return filtered;
};


  // Update equipment status
  const handleUpdateStatus = async (equipmentId, newStatus) => {
    try {
      setLoading(true);
      const response = await axiosInstance.patch(
        `/api/admin/equipment/${equipmentId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      if (response.status === 200) {
        alert(`Equipment status updated to ${newStatus}`);
        setEquipmentList(equipmentList.map(item => 
          item._id === equipmentId ? { ...item, status: newStatus } : item
        ));
      }
    } catch (error) {
      console.error('Error updating status:', error.response?.data || error.message);
      alert('Failed to update equipment status');
    } finally {
      setLoading(false);
    }
  };

  // View equipment details
  const handleViewDetails = (equipment) => {
    setSelectedEquipment(equipment);
    setIsModalOpen(true);
  };

  const filteredEquipment = filterEquipment();

return (
  <div className="p-4 md:p-8">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Equipment Management</h1>
      <p className="text-gray-600">Manage harvest equipment in the system</p>
    </motion.div>

    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Filters</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Search</label>
          <div className="relative">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              placeholder="Search equipment..."
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg"
            />
            <FaInfoCircle className="absolute left-3 top-4 text-gray-400" />
          </div>
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
      <div className="grid grid-cols-1 gap-6">
        {filteredEquipment.map(request => (
          <motion.div
            key={request.scheduleId}
            whileHover={{ scale: 1.01 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {request.equipmentName || 'N/A'}
                  </h3>
                  <p className="text-gray-600">{request.equipmentType || 'N/A'}</p>
                  <p className="text-gray-600">Availability: {request.equipmentAvailability}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  request.status === 'Active'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {request.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-500 text-sm">Farmer</p>
                  <p className="font-medium">{request.farmer?.firstName || 'N/A'}</p>
                  <p className="text-gray-500 text-sm">Email</p>
                  <p className="font-medium">{request.farmer?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Rental Period</p>
                  <p className="font-medium">
                    {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => handleViewDetails(request)}
                  className="flex items-center px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all"
                >
                  <FaInfoCircle className="mr-2" /> Details
                </button>
                <button
                  onClick={() => handleUpdateStatus(request.equipmentId, 'Maintenance')}
                  className="flex items-center px-4 py-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-all"
                  disabled={loading}
                >
                  <FaTools className="mr-2" /> Mark for Maintenance
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    )}
  </div>
);
}

export default Requests;
