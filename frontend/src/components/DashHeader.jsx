import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { logout, switchProfile } from "../Redux/authslice";
import axiosInstance from "../utils/axiosConfig";

const DashHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const inactivityTimer = useRef(null);
  const profileMenuRef = useRef(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const headerTexts = {
    home: "Home",
    marketplace: "Marketplace",
    support: "Support",
    logout: "Logout",
    logoText: "AgroTech",
    logoSubtext: "Cultivating Smarter Futures"
  };

  const INACTIVITY_LIMIT = 4 * 60 * 1000; // 2 minutes

  const handleLogout = async () => {
    try {
      await axiosInstance.post(
        "/users/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (error) {
      console.error("Error during logout:", error.response?.data || error.message);
    }

    dispatch(logout());
    localStorage.removeItem("token");
    navigate("/login");
  };

  const resetInactivityTimer = () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);

    inactivityTimer.current = setTimeout(() => {
      alert("Session expired due to inactivity.");
      handleLogout();
    }, INACTIVITY_LIMIT);
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetInactivityTimer));

    resetInactivityTimer(); // Start the timer initially

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetInactivityTimer));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu]);

  const handleHomeClick = () => {
    if (user?.userType === "Admin") navigate("/dashboardadmin");
    else if (user?.userType === "Farmer") navigate("/dashboardfarmer");
    else if (user?.userType === "Customer" || user?.userType === "Seller") navigate("/marketplace");
    else alert("Role not recognized. Please contact support.");
  };

  const handleMarketplaceClick = () => {
    if (user?.userType === "Admin") navigate("/marketplaceAdmin");
    else if (user?.userType === "Farmer") navigate("/marketplace");
    else if (user?.userType === "Customer" || user?.userType === "Seller") navigate("/marketplace");
    else alert("Role not recognized. Please contact support.");
  };
const handleSwitchProfile = async (newUserType) => {
    try {
      const response = await axiosInstance.post(
        "/users/switch-profile",
        { userType: newUserType },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.user) {
        dispatch(switchProfile({ userType: newUserType }));
        setShowProfileMenu(false);
        
        // Navigate based on new profile type
        if (newUserType === "Farmer") {
          navigate("/dashboardfarmer");
        } else if (newUserType === "Customer" || newUserType === "Seller") {
          navigate("/marketplace");
        }
      }
    } catch (error) {
      console.error("Error switching profile:", error);
      alert("Failed to switch profile. Please try again.");
    }
  };

  
  return (
    <div className="relative">
      <motion.div
        className="fixed inset-x-0 top-0 flex justify-between items-center p-4 z-50 bg-white/90 backdrop-blur-md shadow-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Logo Section */}
        <motion.div
          className="flex items-center space-x-2 cursor-pointer"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          onClick={handleHomeClick}
        >
          <img
            src="/logo.png"
            alt="Logo"
            className="h-10 w-10 bg-opacity-70 rounded-full border-2 border-green-700"
          />
          <div className="flex flex-col">
            <span className="text-green-700 text-xl font-bold">{headerTexts.logoText}</span>
            <span className="text-green-600 text-xs font-medium italic">
              {headerTexts.logoSubtext}
            </span>
          </div>
        </motion.div>


        {/* Navigation Links and Translate Button */}
        <motion.div
          className="flex items-center space-x-6"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="flex space-x-6 text-lg font-medium">
            <Link
              to="#"
              onClick={handleHomeClick}
              className="text-green-700 hover:text-green-900 transition-colors"
            >
              {headerTexts.home}
            </Link>
            <div
              onClick={handleMarketplaceClick}
              className="cursor-pointer text-green-700 hover:text-green-900 transition-colors"
            >
              {headerTexts.marketplace}
            </div>
            <Link
              to="/support"
              className="text-green-700 hover:text-green-900 transition-colors"
            >
              {headerTexts.support}
            </Link>

            {/* Profile Switcher Dropdown - Only for non-Admin users */}
            {user?.userType !== "Admin" && (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 bg-green-600 text-white py-1 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <span>Switch Profile: {user?.userType}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      showProfileMenu ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
                  >
                    {["Farmer", "Customer", "Seller"].map((type) => (
                      <button
                        key={type}
                        onClick={() => handleSwitchProfile(type)}
                        disabled={user?.userType === type}
                        className={`w-full text-left px-4 py-2 hover:bg-green-50 transition-colors ${
                          user?.userType === type
                            ? "bg-green-100 text-green-800 font-semibold cursor-not-allowed"
                            : "text-gray-700"
                        }`}
                      >
                        {type}
                        {user?.userType === type && (
                          <span className="ml-2 text-xs">(Current)</span>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            )}

            <button
              onClick={handleLogout}
              className="bg-red-600 text-white py-1 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              {headerTexts.logout}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DashHeader;