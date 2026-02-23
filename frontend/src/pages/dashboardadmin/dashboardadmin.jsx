import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import Requests from './Requests';
import { 
  FaUsers, 
  FaUserPlus, 
  FaExclamationCircle, 
  FaChartLine, 
  FaTools,
  FaSearch,
  FaBell,
  FaEnvelope,
  FaCog,
  FaSignOutAlt,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaFilter
} from 'react-icons/fa';


const DashAdmin = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('Manage Users');
  const [complaintTab, setComplaintTab] = useState('Active'); // 'Active' or 'Resolved'
  const navigate = useNavigate();

  // Register User States
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    userType: 'Farmer',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Complaints States
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [complaintStatus, setComplaintStatus] = useState('Pending');
  const [complaintResponse, setComplaintResponse] = useState('');
  const [updateError, setUpdateError] = useState('');

  // Reports States
  const [reportType, setReportType] = useState("user-engagement");
  const [selectedReportType, setSelectedReportType] = useState("All");
  const [reports, setReports] = useState({
    userEngagement: [],
    webAnalytics: [],
    salesReport: []
  });
  const [reportsLoading, setReportsLoading] = useState({
    userEngagement: false,
    webAnalytics: false,
    salesReport: false
  });

  // Fetch Users
  useEffect(() => {
    if (activeSection === 'Manage Users') {
      const fetchUsers = async () => {
        try {
          const response = await axiosInstance.get('http://localhost:5000/api/admin/users', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          setUsers(response.data.users);
        } catch (error) {
          console.error('Error fetching users:', error.response?.data || error.message);
        }
      };
      fetchUsers();
    }
  }, [activeSection]);

  useEffect(() => {
    if (activeSection === "Manage Complaints") {
      fetchComplaints();
    }
  }, [activeSection]);

  // Fetch reports when Reports and Analytics section is active
  useEffect(() => {
    if (activeSection === "Reports and Analytics") {
      // If "All" is selected, fetch all reports, otherwise fetch specific type
      if (selectedReportType === "All") {
        fetchAllReports();
      } else {
        const reportEndpoints = {
          "User Engagement": "user-engagement",
          "Web Analytics": "web-analytics",
          "Sales and Revenue": "sales-report",
        };
        const endpoint = reportEndpoints[selectedReportType] || reportType;
        fetchReportByType(endpoint);
      }
    }
  }, [activeSection]);

  // Add this useEffect for real-time updates
useEffect(() => {
  const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');
  
  socket.on('webAnalyticsUpdate', (data) => {
    setReports(prev => ({
      ...prev,
      webAnalytics: data
    }));
  });

  return () => {
    socket.disconnect();
  };
}, []);

  // Separate function to fetch complaints for reuse
  const fetchComplaints = async () => {
    setLoading(true); // Show loading while fetching complaints

    try {
      const response = await axiosInstance.get("http://localhost:5000/api/admin/complaints", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (response.status === 200) {
        console.log("Received complaints:", response.data.complaints);
        setComplaints(response.data.complaints);
      } else {
        console.error("Failed to fetch complaints:", response.data);
      }
    } catch (error) {
      console.error("Error fetching complaints:", error.response?.data || error.message);
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  const fetchReportByType = async (type) => {
  const typeMapping = {
    'user-engagement': 'userEngagement',
    'web-analytics': 'webAnalytics',
    'sales-report': 'salesReport'
  };
  
  const storeKey = typeMapping[type] || type;
  setReportsLoading(prev => ({ ...prev, [storeKey]: true }));

  try {
    const response = await axiosInstance.get(
      `/reports/${type}`,
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );

    console.log(`Fetched ${type} report:`, response.data);
    setReports(prev => ({
      ...prev,
      [storeKey]: response.data
    }));
  } catch (error) {
    console.error(`Error fetching ${type} report:`, error);
  } finally {
    setReportsLoading(prev => ({ ...prev, [storeKey]: false }));
  }
};

  // Fetch all reports at once
  const fetchAllReports = async () => {
    setReportsLoading({
      userEngagement: true,
      webAnalytics: true,
      salesReport: true
    });

    try {
      const [userEngagementRes, webAnalyticsRes, salesReportRes] = await Promise.all([
        axiosInstance.get('/reports/user-engagement', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        axiosInstance.get('/reports/web-analytics', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        axiosInstance.get('/reports/sales-report', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
      ]);

      console.log('All Reports Fetched:');
      console.log('User Engagement:', userEngagementRes.data);
      console.log('Web Analytics:', webAnalyticsRes.data);
      console.log('Sales Report:', salesReportRes.data);

      setReports({
        userEngagement: userEngagementRes.data,
        webAnalytics: webAnalyticsRes.data,
        salesReport: salesReportRes.data
      });
    } catch (error) {
      console.error('Error fetching all reports:', error);
    } finally {
      setReportsLoading({
        userEngagement: false,
        webAnalytics: false,
        salesReport: false
      });
    }
  };

  // Handle Register User
  const handleRegisterUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      const response = await axiosInstance.post(
        'http://localhost:5000/api/admin/registerUser',
        registerForm,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      setSuccessMessage(response.data.message);
      setRegisterForm({
        username: '',
        email: '',
        password: '',
        userType: 'Farmer',
      });

      // Refresh user list if on manage users page
      if (activeSection === 'Manage Users') {
        const usersResponse = await axiosInstance.get('http://localhost:5000/api/admin/users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUsers(usersResponse.data.users);
      }
    } catch (err) {
      console.error('Error registering user:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Error registering user. Please try again.');
    }
  };

  // Delete User
  const handleDeleteUser = async (userId) => {
    try {
      const response = await axiosInstance.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (response.status === 200) {
        alert('User deleted successfully');
        setUsers(users.filter(user => user._id !== userId));
      }
    } catch (error) {
      console.error('Error deleting user:', error.message);
      alert('Error deleting user. Please try again.');
    }
  };

  // Save User Changes
  const handleSaveChanges = async () => {
    if (!selectedUser) return;
    setLoading(true);

    try {
      const response = await axiosInstance.put(
        `http://localhost:5000/api/admin/users/${selectedUser._id}`,
        selectedUser,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      if (response.status === 200) {
        setUsers(users.map(user => (user._id === selectedUser._id ? selectedUser : user)));
        setIsModalOpen(false);
        alert('User updated successfully');
      }
    } catch (error) {
      console.error('Error updating user:', error.message);
      alert('Failed to update user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Update Complaint Status
  const handleUpdateComplaintStatus = async (e) => {
    e.preventDefault(); // Prevent form submission refresh
    if (!selectedComplaint) return;

    setLoading(true);
    setUpdateError('');

    try {
      const requestData = { 
        status: complaintStatus 
      };

      if (complaintResponse.trim()) {
        requestData.adminResponse = complaintResponse;
      }

      const response = await axiosInstance.put(
        `http://localhost:5000/api/admin/complaints/${selectedComplaint._id}`,
        requestData,
        {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
        }
      );

      if (response.status === 200) {
        await fetchComplaints();
        setIsComplaintModalOpen(false);
        alert('Complaint status updated successfully');
      }
    } catch (error) {
      console.error('Error updating complaint status:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update complaint status. Please try again.';
      setUpdateError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get username by userId
  const getUsernameById = (userId) => {
    const user = users.find(user => user._id === userId);
    return user ? user.username : 'Unknown User';
  };

  const sidebarItems = [
    { title: 'Manage Users', icon: FaUsers },
    { title: 'Register User', icon: FaUserPlus },
    { title: 'Manage Complaints', icon: FaExclamationCircle },
    { title: 'Reports and Analytics', icon: FaChartLine },
    { title: 'Manage Equipment Requests', icon: FaTools },
  ];

  // Fixed filtering of complaints based on status
  const getFilteredComplaints = () => {
    if (!complaints || complaints.length === 0) {
      return { activeComplaints: [], resolvedComplaints: [] };
    }

    const resolvedComplaints = complaints.filter(complaint => 
      complaint.status && complaint.status.toLowerCase() === 'resolved'
    );

    const activeComplaints = complaints.filter(complaint => 
      !complaint.status || complaint.status.toLowerCase() !== 'resolved'
    );

    return { activeComplaints, resolvedComplaints };
  };

  const { activeComplaints, resolvedComplaints } = getFilteredComplaints();

  const renderContent = () => {
    switch (activeSection) {
       case 'Manage Equipment Requests':
        return <Requests />;
      case 'Manage Users':
        return (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div 
                className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Users</p>
                    <h3 className="text-3xl font-bold mt-2">{users.length}</h3>
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <FaUsers className="text-2xl" />
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Farmers</p>
                    <h3 className="text-3xl font-bold mt-2">
                      {users.filter(u => u.userType === 'Farmer').length}
                    </h3>
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <FaUsers className="text-2xl" />
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Customers</p>
                    <h3 className="text-3xl font-bold mt-2">
                      {users.filter(u => u.userType === 'Customer').length}
                    </h3>
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <FaUsers className="text-2xl" />
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Sellers</p>
                    <h3 className="text-3xl font-bold mt-2">
                      {users.filter(u => u.userType === 'Seller').length}
                    </h3>
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <FaUsers className="text-2xl" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800">All Users</h2>
                  <div className="flex items-center space-x-3">
                    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center space-x-2">
                      <FaFilter className="text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Filter</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map(user => (
                      <motion.tr 
                        key={user._id}
                        className="hover:bg-gray-50 transition-colors"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                              {user.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900">{user.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{user.email}</div>
                          <div className="text-sm text-gray-500">{user.phoneNumber}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${user.userType === 'Farmer' ? 'bg-green-100 text-green-800' :
                              user.userType === 'Customer' ? 'bg-purple-100 text-purple-800' :
                              user.userType === 'Seller' ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-800'}`}>
                            {user.userType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setIsModalOpen(true);
                            }}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <FaEdit className="mr-1" />
                            <span className="text-sm font-medium">Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <FaTrash className="mr-1" />
                            <span className="text-sm font-medium">Delete</span>
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modern Edit Modal */}
            {isModalOpen && selectedUser && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm px-4">
                <motion.div
                  className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-5">
                    <h2 className="text-2xl font-bold text-white">Edit User</h2>
                    <p className="text-green-100 text-sm mt-1">Update user information</p>
                  </div>
                  
                  <form className="p-6 space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                      <input
                        type="text"
                        value={selectedUser.username}
                        onChange={(e) =>
                          setSelectedUser({ ...selectedUser, username: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={selectedUser.email}
                        onChange={(e) =>
                          setSelectedUser({ ...selectedUser, email: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">User Type</label>
                      <select
                        value={selectedUser.userType}
                        onChange={(e) =>
                          setSelectedUser({ ...selectedUser, userType: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      >
                        <option value="Farmer">Farmer</option>
                        <option value="Customer">Customer</option>
                        <option value="Seller">Seller</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                    
                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveChanges}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg transition-all disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </div>
        );
      case 'Register User':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6">
                <h2 className="text-3xl font-bold text-white">Register New User</h2>
                <p className="text-green-100 mt-2">Add a new user to the AgroTech platform</p>
              </div>

              <div className="p-8">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg"
                  >
                    <div className="flex items-center">
                      <FaTimes className="mr-2" />
                      <span>{error}</span>
                    </div>
                  </motion.div>
                )}
                
                {successMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg"
                  >
                    <div className="flex items-center">
                      <FaCheck className="mr-2" />
                      <span>{successMessage}</span>
                    </div>
                  </motion.div>
                )}

                <form onSubmit={handleRegisterUser} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Username *
                      </label>
                      <input
                        type="text"
                        value={registerForm.username}
                        onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Enter username"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="user@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Password *
                      </label>
                      <input
                        type="password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Enter secure password"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        User Type *
                      </label>
                      <select
                        value={registerForm.userType}
                        onChange={(e) => setRegisterForm({...registerForm, userType: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      >
                        <option value="Farmer">Farmer</option>
                        <option value="Customer">Customer</option>
                        <option value="Seller">Seller</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                    >
                      <FaUserPlus />
                      <span>Register User</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        );
      case 'Manage Complaints':
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg" whileHover={{ scale: 1.02 }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">Total Complaints</p>
                    <h3 className="text-3xl font-bold mt-2">{complaints.length}</h3>
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <FaExclamationCircle className="text-2xl" />
                  </div>
                </div>
              </motion.div>

              <motion.div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-lg" whileHover={{ scale: 1.02 }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium">Active</p>
                    <h3 className="text-3xl font-bold mt-2">{activeComplaints.length}</h3>
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <FaExclamationCircle className="text-2xl" />
                  </div>
                </div>
              </motion.div>

              <motion.div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg" whileHover={{ scale: 1.02 }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Resolved</p>
                    <h3 className="text-3xl font-bold mt-2">{resolvedComplaints.length}</h3>
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <FaCheck className="text-2xl" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Modern Tab Navigation */}
            <div className="bg-white rounded-2xl shadow-lg p-2">
              <div className="flex space-x-2">
                <button
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                    complaintTab === 'Active'
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setComplaintTab('Active')}
                >
                  Active Complaints ({activeComplaints.length})
                </button>
                <button
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                    complaintTab === 'Resolved'
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setComplaintTab('Resolved')}
                >
                  Resolved Complaints ({resolvedComplaints.length})
                </button>
              </div>
            </div>

            {/* Complaints Grid */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {loading ? (
                <div className="flex justify-center items-center p-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading complaints...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
                  {(complaintTab === 'Active' ? activeComplaints : resolvedComplaints).length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-12">
                      <FaExclamationCircle className="text-6xl text-gray-300 mb-4" />
                      <p className="text-gray-500 text-lg">No {complaintTab.toLowerCase()} complaints found.</p>
                    </div>
                  ) : (
                    (complaintTab === 'Active' ? activeComplaints : resolvedComplaints).map(complaint => (
                      <motion.div
                        key={complaint._id}
                        className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-100"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -5 }}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-bold text-gray-800 line-clamp-2">
                            {complaint.name || 'No Title'}
                          </h3>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ml-2 ${
                            complaint.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                            complaint.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {complaint.status || 'Pending'}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <FaUsers className="mr-2 text-gray-400" />
                            <span className="font-medium">{complaint.userId ? getUsernameById(complaint.userId) : 'Unknown User'}</span>
                          </div>

                          <div className="flex items-center text-sm text-gray-600">
                            <FaExclamationCircle className="mr-2 text-gray-400" />
                            <span>{complaint.type || 'General'}</span>
                          </div>

                          <div className="p-3 bg-gray-100 rounded-lg">
                            <p className="text-sm text-gray-700 line-clamp-3">{complaint.description || 'No description provided'}</p>
                          </div>

                          {complaint.adminResponse && (
                            <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                              <p className="text-xs font-semibold text-green-700 mb-1">Admin Response</p>
                              <p className="text-sm text-gray-700 line-clamp-2">{complaint.adminResponse}</p>
                            </div>
                          )}

                          <div className="pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-500 mb-2">
                              📅 {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown date'}
                            </p>
                            <button
                              onClick={() => {
                                setSelectedComplaint(complaint);
                                setComplaintStatus(complaint.status || 'Pending');
                                setComplaintResponse(complaint.adminResponse || '');
                                setIsComplaintModalOpen(true);
                              }}
                              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-2 rounded-lg transition-all flex items-center justify-center space-x-2"
                            >
                              <FaEdit />
                              <span>{complaint.status === 'Resolved' ? 'View Details' : 'Update Status'}</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Modern Complaint Modal */}
            {isComplaintModalOpen && selectedComplaint && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm px-4">
                <motion.div
                  className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-5">
                    <h2 className="text-2xl font-bold text-white">Update Complaint Status</h2>
                    <p className="text-green-100 text-sm mt-1">Review and respond to complaint</p>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                      <h3 className="font-bold text-gray-800 mb-2">{selectedComplaint.name || 'No Title'}</h3>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-600">
                          <span className="font-medium">Submitted by:</span> {selectedComplaint.userId ? getUsernameById(selectedComplaint.userId) : 'Unknown User'}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Type:</span> {selectedComplaint.type || 'General'}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Description:</span> {selectedComplaint.description}
                        </p>
                      </div>
                    </div>
                    
                    {updateError && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg"
                      >
                        <div className="flex items-center">
                          <FaTimes className="mr-2" />
                          <span>{updateError}</span>
                        </div>
                      </motion.div>
                    )}
                    
                    <form onSubmit={handleUpdateComplaintStatus} className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                        <select
                          value={complaintStatus}
                          onChange={(e) => setComplaintStatus(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Response</label>
                        <textarea
                          value={complaintResponse}
                          onChange={(e) => setComplaintResponse(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                          rows="5"
                          placeholder="Enter your detailed response to this complaint..."
                        />
                      </div>
                      
                      <div className="flex space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setIsComplaintModalOpen(false);
                            setUpdateError('');
                          }}
                          className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg transition-all disabled:opacity-50"
                        >
                          {loading ? 'Updating...' : 'Update Status'}
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        );
      case 'Reports and Analytics':
        return (
          <div className="space-y-6">
            {/* Filter Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Report Type
                  </label>
                  <select
                    value={selectedReportType}
                    onChange={(e) => {
                      const type = e.target.value;
                      setSelectedReportType(type);
                      if (type === "All") {
                        fetchAllReports();
                      } else {
                        const reportEndpoints = {
                          "User Engagement": "user-engagement",
                          "Web Analytics": "web-analytics",
                          "Sales and Revenue": "sales-report",
                        };
                        fetchReportByType(reportEndpoints[type]);
                      }
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  >
                    <option value="All">All Reports</option>
                    <option value="User Engagement">User Engagement</option>
                    <option value="Web Analytics">Web Analytics</option>
                    <option value="Sales and Revenue">Sales and Revenue</option>
                  </select>
                </div>
                
                <button
                  onClick={() => navigate('/reports')}
                  className="md:ml-4 px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <FaChartLine />
                  <span>Detailed Analytics</span>
                </button>
              </div>
            </div>

            {/* Reports Content */}
            {Object.values(reportsLoading).some((isLoading) => isLoading) ? (
              <div className="flex justify-center items-center p-12 bg-white rounded-2xl shadow-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4 font-medium">Loading reports...</p>
                </div>
              </div>
            ) : Object.keys(reports).length === 0 ? (
              <div className="flex justify-center items-center p-12 bg-white rounded-2xl shadow-lg">
                <div className="text-center">
                  <FaChartLine className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No reports found.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {(() => {
                  // Map display names to camelCase keys
                  const reportKeyMapping = {
                    "User Engagement": "userEngagement",
                    "Web Analytics": "webAnalytics",
                    "Sales and Revenue": "salesReport"
                  };
                  
                  if (selectedReportType === "All") {
                    return Object.entries(reports).map(([type, data], index) =>
                      data && Object.keys(data).length > 0 ? (
                        <motion.div
                          key={index}
                          className="bg-white rounded-2xl shadow-lg overflow-hidden"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                            <h2 className="text-xl font-bold text-white capitalize">
                              {type.replace(/([A-Z])/g, ' $1').trim()}
                            </h2>
                          </div>
                          <div className="p-6 space-y-3">
                            {Object.entries(data).map(([key, value]) => (
                              <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                <span className="font-medium text-gray-700 capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                                </span>
                                <span className="text-gray-900 font-semibold">
                                  {typeof value === 'object' ? JSON.stringify(value) : value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ) : null
                    );
                  } else {
                    const reportKey = reportKeyMapping[selectedReportType];
                    const reportData = reports[reportKey];
                    
                    return reportData && Object.keys(reportData).length > 0 ? (
                      <motion.div
                        className="bg-white rounded-2xl shadow-lg overflow-hidden lg:col-span-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                          <h2 className="text-xl font-bold text-white capitalize">
                            {selectedReportType}
                          </h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(reportData).map(([key, value]) => (
                            <div key={key} className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
                              <p className="text-sm font-medium text-gray-600 capitalize mb-1">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </p>
                              <p className="text-2xl font-bold text-gray-900">
                                {typeof value === 'object' ? JSON.stringify(value) : value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ) : (
                      <div className="lg:col-span-2 flex justify-center items-center p-12 bg-white rounded-2xl shadow-lg">
                        <div className="text-center">
                          <FaChartLine className="text-6xl text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 text-lg">No data available for this report.</p>
                        </div>
                      </div>
                    );
                  }
                })()}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-gray-100">
      {/* Modern Left Sidebar */}
      <div className="w-72 bg-gradient-to-b from-green-800 via-green-700 to-green-900 shadow-2xl fixed top-0 left-0 h-full overflow-y-auto z-40">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-green-600/30">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-green-700">A</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AgroTech</h2>
              <p className="text-xs text-green-200">Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4">
          <p className="text-xs font-semibold text-green-300 uppercase tracking-wider mb-3 px-3">
            Main Menu
          </p>
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <motion.li
                  key={item.title}
                  className={`cursor-pointer flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${activeSection === item.title 
                      ? 'bg-white text-green-700 shadow-lg' 
                      : 'text-white hover:bg-green-600/30'
                    }`}
                  onClick={() => setActiveSection(item.title)}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="text-xl" />
                  <span className="font-medium">{item.title}</span>
                </motion.li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-green-600/30 bg-green-900/50">
          <div className="flex items-center space-x-3 px-4 py-3 text-white/80 hover:text-white cursor-pointer">
            <FaSignOutAlt className="text-lg" />
            <span className="font-medium">Logout</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 ml-72">
        {/* Top Navigation Bar */}
        <div className="bg-white shadow-md sticky top-0 z-30 px-8 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-800">{activeSection}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                />
              </div>
              
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <FaBell className="text-xl text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <FaCog className="text-xl text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default DashAdmin;