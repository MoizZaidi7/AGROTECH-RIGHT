import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';

const RegisterUserByAdmin = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('Farmer');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Handle form submission for user registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const userData = { username, email, password, userType };

    try {
      const response = await axiosInstance.post('http://localhost:5000/api/admin/registerUser', userData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      setSuccessMessage(response.data.message);
      setUsername('');
      setEmail('');
      setPassword('');
      setUserType('Farmer');
    } catch (err) {
      console.error('Error registering user:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Error registering user. Please try again.');
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

      {/* Top Bar */}
      <motion.div
        className="fixed inset-x-0 top-0 flex justify-between items-center p-2 bg-white backdrop-blur-md z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Logo */}
        <motion.div
          className="flex items-center space-x-2"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <img
            src="/logo.png"
            alt="Logo"
            className="h-10 w-10 bg-opacity-70 rounded-full border-2 border-white"
          />
          <div className="flex flex-col">
            <span className="text-green-700 text-xl font-bold">AgroTech</span>
            <span className="text-green-600 text-xs font-medium italic">
              Cultivating Smarter Futures
            </span>
          </div>
        </motion.div>

        {/* Navigation Links */}
        <motion.div
          className="flex space-x-4 text-lg text-green-700"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <button
            className="hover:text-green-900"
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </button>
          <button
            className="hover:text-green-900"
            onClick={() => navigate('/login')}
          >
            Logout
          </button>
        </motion.div>
      </motion.div>

      {/* Page Content */}
      <motion.div
        className="relative z-0 pt-24 px-6 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-4xl font-bold text-center text-green-700 mb-8">
          Register User by Admin
        </h1>

        {/* Error or Success Message */}
        {error && (
          <div className="bg-red-500 text-white p-4 mb-6 rounded-md">{error}</div>
        )}
        {successMessage && (
          <div className="bg-green-500 text-white p-4 mb-6 rounded-md">{successMessage}</div>
        )}

        {/* User Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
          <div>
            <label htmlFor="username" className="block text-lg font-medium text-green-700">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full mt-2 p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-lg font-medium text-green-700">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-2 p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-lg font-medium text-green-700">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-2 p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label htmlFor="userType" className="block text-lg font-medium text-green-700">User Type</label>
            <select
              id="userType"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="w-full mt-2 p-2 border border-gray-300 rounded-md"
            >
              <option value="Farmer">Farmer</option>
              <option value="Customer">Customer</option>
              <option value="Seller">Seller</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div className="mt-4">
            <button type="submit" className="w-full bg-green-700 text-white p-2 rounded-md">
              Register User
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default RegisterUserByAdmin;