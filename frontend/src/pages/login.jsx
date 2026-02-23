import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosConfig";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { auth } from "../firebase/firebase"; // Import Firebase auth instance
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"; // Import Google Sign-In methods
import { login } from '../Redux/authslice';
import { useDispatch } from 'react-redux';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Initialize Google Auth Provider
  const provider = new GoogleAuthProvider();

  // Handle window resize for responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosInstance.post("http://localhost:5000/api/users/login", {
        email,
        password,
        rememberMe,
      });

      const { token, expiresIn, user } = response.data;
      
      console.log("=== LOGIN DEBUG START ===");
      console.log("Full response.data:", response.data);
      console.log("Login response user:", user);
      console.log("User type:", user.userType);
      console.log("User type typeof:", typeof user.userType);
      console.log("Is Farmer?:", user.userType === "Farmer");
      console.log("=== LOGIN DEBUG END ===");
      
      localStorage.setItem("token", token);
      localStorage.setItem("expiresIn", expiresIn);
      localStorage.setItem("user", JSON.stringify(user));

      // Dispatch to Redux and wait a moment for state to update
      dispatch(login({ user, token }));

      console.log("About to navigate for userType:", user.userType);
      
      // Navigate based on user role or type
      let targetPath = "/dashboard"; // default
      
      if (user.userType === "Admin") {
        targetPath = "/dashboardadmin";
      } else if (user.userType === "Farmer") {
        targetPath = "/dashboardfarmer";
      } else if (user.userType === "Customer" || user.userType === "Seller") {
        targetPath = "/marketplace";
      }
      
      console.log("Navigating to:", targetPath);
      alert(`Login successful! Navigating to: ${targetPath}`);
      
      // Use setTimeout to ensure Redux state has updated
      setTimeout(() => {
        navigate(targetPath, { replace: true });
      }, 100);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const response = await axiosInstance.post("http://localhost:5000/api/users/google-login", {
        email: user.email,
        name: user.displayName,
        profilePicture: user.photoURL,
        googleId: user.uid,
      });

      const { token, expiresIn, user: userData } = response.data;
      
      // Store token and user data
      localStorage.setItem("token", token);
      localStorage.setItem("expiresIn", expiresIn);
      localStorage.setItem("user", JSON.stringify(userData));

      // Dispatch to Redux
      dispatch(login({ user: userData, token }));

      alert("Google Login successful!");
      
      // Navigate based on user type
      if (userData.userType === "Admin") {
        navigate("/dashboardadmin");
      } else if (userData.userType === "Farmer") {
        navigate("/dashboardfarmer");
      } else if (userData.userType === "Customer" || userData.userType === "Seller") {
        navigate("/marketplace");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Error during Google Sign-In:", err);
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen relative">
      {/* Background Video */}
      <div className="fixed inset-0 w-full h-full z-0">
        <video className="w-full h-full object-cover" autoPlay loop muted playsInline>
          <source src="/backvideo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Login Box */}
      <div className="flex items-center justify-center w-full h-full absolute inset-0 z-10">
        <motion.div
          className={`flex flex-col justify-center items-center p-8 rounded-lg shadow-xl w-full ${
            isMobile ? "max-w-xs" : "max-w-md"
          } space-y-6`} // Removed semi-transparent background
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          style={{ marginTop: isMobile ? "2rem" : "5rem" }} // Adjusted margin for mobile
        >
          <motion.h1
            className="text-3xl font-bold text-center text-white mb-6 drop-shadow-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            LOGIN
          </motion.h1>

          {error && (
            <motion.p
              className="text-red-300 text-center mb-4 drop-shadow-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              {error}
            </motion.p>
          )}

          <form onSubmit={handleLogin} className="w-full space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-white">User Email</label>
              <motion.input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 text-sm bg-transparent border border-white rounded-md text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Enter your email"
                required
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 1 }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Password</label>
              <motion.input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 text-sm bg-transparent border border-white rounded-md text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Enter your password"
                required
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
              />
            </div>

            <div className="flex justify-between items-center mb-4">
              <label className="flex items-center text-sm text-white">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  className="mr-2"
                />
                Show Password
              </label>
              <button
                onClick={() => navigate("/forgotPassword")}
                type="button"
                className="text-sm text-white hover:text-green-400 transition duration-300 ease-in-out"
              >
                Forgot Password
              </button>
            </div>

            <div className="flex justify-between items-center mb-4">
              <label className="flex items-center text-sm text-white">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="mr-2"
                />
                Remember Me
              </label>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-green-400 text-white py-2 px-4 rounded-md hover:bg-green-500 transition duration-300 ease-in-out"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {loading ? "Logging in..." : "Login"}
            </motion.button>
          </form>

          {/* Google Sign-In Button */}
          <div className="mt-4 w-full">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex items-center justify-center w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-300 ease-in-out"
            >
              <img
                src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png"
                alt="Google Logo"
                className="h-5 w-5 mr-2"
              />
              {loading ? "Signing in with Google..." : "Sign in with Google"}
            </button>
          </div>

          <motion.div
            className="mt-4 text-center text-sm text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
          >
            <button
              onClick={() => navigate("/register")}
              className="text-green hover:text-green-400 transition duration-300 ease-in-out underline"
            >
              Don't have an account? Register
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;