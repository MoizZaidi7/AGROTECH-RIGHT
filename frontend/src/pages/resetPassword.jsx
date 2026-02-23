import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion"; // Importing framer-motion

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  

  // Extract the token from the query params
  const token = new URLSearchParams(location.search).get("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing token.");
    }
  }, [token]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    console.log("Token extracted from URL:", token);
    console.log("New password being submitted:", newPassword);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`http://localhost:5000/api/users/resetPassword/${token}`, {
        newPassword,
      });
      console.log("Response from server:", response.data);


      if (response.data.message === "Password reset successfully") {
        setSuccess("Password reset successfully. Redirecting to login...");
        setTimeout(() => navigate("/login"), 3000); // Redirect to login page after success
      } else {
        setError(response.data.message || "Something went wrong.");
      }
    } catch (err) {
      console.error("Error in password reset request:", err.response?.data);
      setError(err.response?.data?.message || "Error resetting password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
    {/* Favicon */}
    <link rel="icon" type="image/png" href="/logo.png" />
  
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
  
    {/* Logo */}
    <motion.div
      className="absolute top-4 left-4 flex items-center space-x-3"
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1 }}
    >
      {/* Logo */}
      <img
        src="/logo.png"
        alt="Logo"
        className="h-12 w-12 bg-opacity-70 rounded-full border-2 border-white"
      />
      {/* Text */}
      <div className="flex flex-col">
        <span className="text-white text-2xl font-bold drop-shadow-lg">
          AgroTech
        </span>
        <span className="text-white text-sm font-medium italic drop-shadow-md">
          Cultivating Smarter Futures
        </span>
      </div>
    </motion.div>
  
    {/* Centered Form Container */}
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
    >
      <motion.div
        className="w-full max-w-md px-6 py-8 rounded-lg shadow-lg"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        style={{ background: 'transparent' }} // Transparent background
      >
        <motion.h1
          className="text-3xl font-bold text-center mb-6 text-white drop-shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Reset Password
        </motion.h1>
        {error && (
          <motion.p
            className="text-red-500 text-center mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {error}
          </motion.p>
        )}
        {success && (
          <motion.p
            className="text-green-500 text-center mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {success}
          </motion.p>
        )}
        <form onSubmit={handleResetPassword} className="space-y-5">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <label className="block text-sm font-medium mb-2 text-white">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 text-sm bg-transparent border-b-2 border-white rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-500"
              placeholder="Enter new password"
              required
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <label className="block text-sm font-medium mb-2 text-white">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 text-sm bg-transparent border-b-2 border-white rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-500"
              placeholder="Confirm new password"
              required
            />
          </motion.div>
  
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  </div>
    )};
export default ResetPassword;
