import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Header = () => {
  const navigate = useNavigate();

  const handleNavigationClick = (path) => {
    navigate(path); // Navigate to the specified path
  };

  return (
    <div className="relative">
      <motion.div
        className="fixed inset-x-0 top-0 flex justify-between items-center p-4 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{ backgroundColor: "transparent" }} // Removed the white background
      >
        {/* Logo Section */}
        <motion.div
          className="flex items-center space-x-2"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <img
            src="/logo.png"
            alt="Logo"
            className="h-10 w-10 rounded-full border-2 border-green-700"
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
          className="flex space-x-4 text-lg text-green-700 font-bold tracking-wide"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <button
            onClick={() => handleNavigationClick("/")}
            className="hover:text-green-900 transform hover:scale-110 transition-transform"
          >
            Home
          </button>
          <button
            onClick={() => handleNavigationClick("/marketplace")}
            className="hover:text-green-900 transform hover:scale-110 transition-transform"
          >
            Marketplace
          </button>
          <Link
            to="/support"
            className="hover:text-green-900 transform hover:scale-110 transition-transform"
          >
            Support
          </Link>
          <Link
            to="/login"
            className="hover:text-green-900 transform hover:scale-110 transition-transform"
          >
            Login / SignUp
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Header;