import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion"; // Importing framer-motion

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/users/forgotPassword", { email });
      setSuccess(response.data.message);
      console.log("Response from server:", response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
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
          Forgot Password
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

        <form onSubmit={handleForgotPassword} className="space-y-5">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <label className="block text-sm font-medium mb-2 text-white">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 text-sm bg-transparent border-b-2 border-white rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-500"
              placeholder="Enter your email"
              required
            />
          </motion.div>

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  </div>
  );
};

export default ForgotPassword;