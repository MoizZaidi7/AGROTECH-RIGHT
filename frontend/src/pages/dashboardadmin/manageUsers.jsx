import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../../utils/axiosConfig';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch Users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUsers(response.data.users);
      } catch (error) {
        console.error('Error fetching users:', error.response?.data || error.message);
      }
    };
    fetchUsers();
  }, []);

  // Delete User
  const handleDeleteUser = async (userId) => {
    try {
      const response = await axiosInstance.delete(`${process.env.REACT_APP_API_URL}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (response.status === 200) {
        alert('User deleted successfully');
        setUsers(users.filter(user => user._id !== userId));
      } else {
        alert('Error deleting user');
      }
    } catch (error) {
      console.error('Error deleting user:', error.response?.data || error.message);
      alert('Error deleting user. Please try again or contact support.');
    }
  };

  // Open Modal for Editing
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // Save User Changes
  const handleSaveChanges = async () => {
    if (!selectedUser) return;
    setLoading(true);

    try {
      const response = await axiosInstance.put(
        `${process.env.REACT_APP_API_URL}/api/admin/users/${selectedUser._id}`,
        selectedUser,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      if (response.status === 200) {
        alert('User updated successfully');
        setUsers(users.map(user => (user._id === selectedUser._id ? selectedUser : user)));
        setIsModalOpen(false);
      } else {
        alert('Failed to update user.');
      }
    } catch (error) {
      console.error('Error updating user:', error.response?.data || error.message);
      alert('Failed to update user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-white">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full">
        <video
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/backvideo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Page Content */}
      <motion.div
        className="relative z-0 pt-24 px-6 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-4xl font-bold text-center text-green-700 mb-8">
          Manage Users
        </h1>
        <p className="text-center text-lg text-gray-600">
          View and manage all registered users on the platform.
        </p>

        {/* User List */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {users.map(user => (
            <motion.div
              key={user._id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-xl font-semibold text-green-700">
                {user.username}
              </h2>
              <p className="text-sm text-gray-600 mt-2">{user.email}</p>
              <p className="text-sm text-gray-600 mt-2">{user.phoneNumber}</p>
              <p className="text-sm text-gray-600 mt-2">Type: {user.userType}</p>
              <div className="mt-4">
                <button
                  className="text-green-700 hover:text-green-900 mr-2"
                  onClick={() => handleEditUser(user)}
                >
                  Edit
                </button>
                <button
                  className="text-red-700 hover:text-red-900"
                  onClick={() => handleDeleteUser(user._id)}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold text-green-700 mb-4 text-center">Edit User</h2>
            <form>
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={selectedUser?.username || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={selectedUser?.email || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="text"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={selectedUser?.phoneNumber || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, phoneNumber: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="userType" className="block text-sm font-medium text-gray-700">
                  User Type
                </label>
                <select
                  id="userType"
                  name="userType"
                  value={selectedUser?.userType || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, userType: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                >
                  <option value="">Select a type</option>
                  <option value="Farmer">Farmer</option>
                  <option value="Customer">Customer</option>
                  <option value="Seller">Seller</option>
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg mr-2"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
                  onClick={handleSaveChanges}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
