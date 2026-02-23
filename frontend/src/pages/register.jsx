import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // Importing framer-motion
import '../styles/styles.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    userType: "user",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // New state for success message
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle window resize for responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Registration successful:", data);
        setShowOtpModal(true);
        setSuccessMessage("Registration successful! Please verify your OTP.");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Error during registration:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    setOtpError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("OTP verified successfully:", data);
        setShowOtpModal(false);
        setSuccessMessage("Registration successful! You can now log in.");
        setTimeout(() => {
          navigate("/login"); // Navigate to login after success
        }, 2000); // Delay before navigating
      } else {
        setOtpError(data.message || "OTP verification failed");
      }
    } catch (err) {
      console.error("Error during OTP verification:", err);
      setOtpError("Something went wrong. Please try again.");
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
          className="w-full h-full object-cover fixed"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/backvideo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Centered Form Container */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pt-24" // Added padding to push down the form
      >
        <motion.div
          className={`w-full ${isMobile ? "max-w-xs" : "max-w-md"} px-6 py-8 rounded-lg shadow-lg max-h-[80vh] overflow-y-auto invisible-scrollbar`} // Applied invisible scrollbar class
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          style={{ background: "transparent" }} // Remove background
        >
          <motion.h1
            className="text-3xl font-bold text-center mb-6 text-white drop-shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            REGISTER
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
          {successMessage && (
            <motion.p
              className="text-green-500 text-center mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {successMessage}
            </motion.p>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <label className="block text-sm font-medium mb-2 text-white">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-2 text-sm bg-transparent border-b-2 border-white rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-500"
                placeholder="Enter your username"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <label className="block text-sm font-medium mb-2 text-white">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-2 text-sm bg-transparent border-b-2 border-white rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-500"
                placeholder="Enter your first name"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              <label className="block text-sm font-medium mb-2 text-white">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-2 text-sm bg-transparent border-b-2 border-white rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-500"
                placeholder="Enter your last name"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.1 }}
            >
              <label className="block text-sm font-medium mb-2 text-white">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 text-sm bg-transparent border-b-2 border-white rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-500"
                placeholder="Enter your email"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.3 }}
            >
              <label className="block text-sm font-medium mb-2 text-white">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 text-sm bg-transparent border-b-2 border-white rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-500"
                placeholder="Enter your password"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.5 }}
            >
              <label className="block text-sm font-medium mb-2 text-white">Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 text-sm bg-transparent border-b-2 border-white rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-500"
                placeholder="Enter your phone number"
                required
              />
            </motion.div>

            {/* Custom User Type Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.7 }}
            >
              <label className="block text-sm font-medium mb-2 text-white">User Type</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full px-4 py-2 text-sm bg-transparent border-b-2 border-white rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-500"
                >
                  {formData.userType}
                </button>
                {dropdownOpen && (
                  <ul className="absolute w-full mt-2 bg-white text-black rounded-md shadow-lg">
                    <li
                      onClick={() => {
                        setFormData({ ...formData, userType: "Farmer" });
                        setDropdownOpen(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      Farmer
                    </li>
                    <li
                      onClick={() => {
                        setFormData({ ...formData, userType: "Admin" });
                        setDropdownOpen(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      Admin
                    </li>
                    <li
                      onClick={() => {
                        setFormData({ ...formData, userType: "Customer" });
                        setDropdownOpen(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      Customer
                    </li>
                    <li
                      onClick={() => {
                        setFormData({ ...formData, userType: "Seller" });
                        setDropdownOpen(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      Seller
                    </li>
                  </ul>
                )}
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.9 }}
            >
              {loading ? "Registering..." : "Register"}
            </motion.button>
          </form>

          {/* OTP Modal */}
          {showOtpModal && (
            <div
              className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50"
              onClick={() => setShowOtpModal(false)}
            >
              <div
                className="bg-white p-6 rounded-lg shadow-lg w-[350px] max-w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold mb-4">Enter OTP</h2>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  className="w-full px-4 py-2 text-sm border-b-2 border-gray-300 rounded-md mb-4"
                />
                {otpError && (
                  <p className="text-red-500 text-sm">{otpError}</p>
                )}
                <button
                  onClick={handleOtpSubmit}
                  className="w-full py-2 bg-green-500 text-white rounded-md mt-4"
                >
                  Verify OTP
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;