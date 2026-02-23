import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import axios from 'axios';

const HarvestSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [newSchedule, setNewSchedule] = useState({
    cropType: '',
    quantity: '',
    preferredDate: '',
    notes: ''
  });
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/farmer/harvest/schedules', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSchedules(response.data.schedules);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/farmer/harvest/schedule', newSchedule, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSchedules([...schedules, response.data]);
      setNewSchedule({
        cropType: '',
        quantity: '',
        preferredDate: '',
        notes: ''
      });
      setIsAdding(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSchedule = (schedule) => {
    setEditingId(schedule._id);
    setEditData({
      cropType: schedule.cropType,
      quantity: schedule.quantity,
      preferredDate: schedule.preferredDate.split('T')[0],
      notes: schedule.notes || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleUpdateSchedule = async (id) => {
    try {
      setLoading(true);
      const response = await axios.patch(
        `http://localhost:5000/api/farmer/harvest/schedule/${id}`,
        editData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setSchedules(schedules.map(s => s._id === id ? response.data : s));
      setEditingId(null);
      setEditData({});
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;
    
    try {
      setLoading(true);
      await axios.delete(`http://localhost:5000/api/farmer/harvest/schedule/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSchedules(schedules.filter(s => s._id !== id));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e, field) => {
    setEditData({
      ...editData,
      [field]: e.target.value
    });
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
            <FaCalendarAlt className="text-4xl text-green-200" />
            <h1 className="text-4xl font-bold text-white">Harvest Schedules</h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-green-700 rounded-xl hover:bg-green-50 transition-all shadow-lg font-medium"
          >
            <FaCalendarAlt /> Add Schedule
          </motion.button>
        </div>
        <p className="text-green-50 text-lg">Manage your upcoming harvest schedules</p>
      </motion.div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {isAdding && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">New Harvest Schedule</h2>
          <form onSubmit={handleCreateSchedule}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Crop Type</label>
                <input
                  type="text"
                  value={newSchedule.cropType}
                  onChange={(e) => setNewSchedule({...newSchedule, cropType: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Quantity (kg)</label>
                <input
                  type="number"
                  value={newSchedule.quantity}
                  onChange={(e) => setNewSchedule({...newSchedule, quantity: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Preferred Date</label>
                <input
                  type="date"
                  value={newSchedule.preferredDate}
                  onChange={(e) => setNewSchedule({...newSchedule, preferredDate: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Notes</label>
                <textarea
                  value={newSchedule.notes}
                  onChange={(e) => setNewSchedule({...newSchedule, notes: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Schedule'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && schedules.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          <p className="mt-2 text-gray-600">Loading schedules...</p>
        </div>
      ) : schedules.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <FaCalendarAlt className="text-5xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">No Harvest Schedules</h3>
          <p className="text-gray-500">You haven't created any harvest schedules yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schedules.map(schedule => (
                  <tr key={schedule._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === schedule._id ? (
                        <input
                          type="text"
                          value={editData.cropType}
                          onChange={(e) => handleEditChange(e, 'cropType')}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      ) : (
                        <span className="font-medium text-gray-900">{schedule.cropType}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === schedule._id ? (
                        <input
                          type="number"
                          value={editData.quantity}
                          onChange={(e) => handleEditChange(e, 'quantity')}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      ) : (
                        `${schedule.quantity} kg`
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === schedule._id ? (
                        <input
                          type="date"
                          value={editData.preferredDate}
                          onChange={(e) => handleEditChange(e, 'preferredDate')}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      ) : (
                        new Date(schedule.preferredDate).toLocaleDateString()
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        schedule.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        schedule.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {schedule.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {editingId === schedule._id ? (
                        <textarea
                          value={editData.notes}
                          onChange={(e) => handleEditChange(e, 'notes')}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      ) : (
                        schedule.notes || 'N/A'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingId === schedule._id ? (
                        <>
                          <button
                            onClick={() => handleUpdateSchedule(schedule._id)}
                            className="text-green-600 hover:text-green-900 mr-3"
                            disabled={loading}
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-red-600 hover:text-red-900 mr-3"
                            disabled={loading}
                          >
                            <FaTimes />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditSchedule(schedule)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteSchedule(schedule._id)}
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
        </div>
      )}
    </div>
  );
};

export default HarvestSchedule;