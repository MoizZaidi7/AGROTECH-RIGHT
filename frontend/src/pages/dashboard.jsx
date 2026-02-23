import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

const ImageSlider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, [images.length]);

  return (
    <div className="relative w-full h-48 overflow-hidden rounded-lg">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={index} className="w-full flex-shrink-0">
            <img
              src={image}
              alt={`slide-${index}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const navigate = useNavigate();

  const handleNavigationClick = (route) => {
    setShowLoginPopup(true);
    setPopupMessage("Can't Access This! Login First");
    setTimeout(() => {
      navigate("/login");
    }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col overflow-y-auto h-full">
      {/* Background Video */}
      <div className="absolute inset-0 -z-10 w-full h-screen overflow-y-auto">
        <video
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={`${process.env.PUBLIC_URL}/backvideo.mp4`} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Navbar */}
      <motion.div
        className="fixed inset-x-0 top-0 flex justify-between items-center p-4 sm:p-6 bg-white bg-opacity-20 backdrop-blur-lg shadow-md z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img
            src={`${process.env.PUBLIC_URL}/logo.png`}
            alt="Logo"
            className="h-10 w-10 rounded-full border-2 border-white"
          />
          <div>
            <h1 className="text-white text-xl font-bold">AgroTech</h1>
            <p className="text-gray-200 text-sm italic">
              Cultivating Smarter Futures
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex space-x-4 sm:space-x-6 text-sm sm:text-lg text-green-700 font-semibold">
          <button
            onClick={() => handleNavigationClick("/")}
            className="hover:text-green-900 transition duration-300"
          >
            Home
          </button>
          <button
            onClick={() => handleNavigationClick("/marketplace")}
            className="hover:text-green-900 transition duration-300"
          >
            Marketplace
          </button>
          <Link
            to="/support"
            className="hover:text-green-900 transition duration-300"
          >
            Support
          </Link>
          <Link
            to="/login"
            className="hover:text-green-900 transition duration-300"
          >
            Login / SignUp
          </Link>
        </div>
      </motion.div>

      {/* Main Section */}
      <div className="relative z-10 flex flex-col justify-center items-center h-screen text-white text-center px-4">
        <motion.h1
          className="text-4xl sm:text-5xl font-bold mb-4"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          Welcome to AgroTech
        </motion.h1>
        <motion.p
          className="text-lg sm:text-xl mb-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
        >
          Revolutionizing agriculture with smart tools and data-driven insights.
        </motion.p>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
        >
          <Link
            to="/login"
            className="bg-green-700 px-6 py-3 rounded-full text-white hover:bg-green-900 transition duration-300 shadow-lg hover:shadow-xl"
          >
            Get Started
          </Link>
        </motion.div>
      </div>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-8 bg-gray-100">
        <h2 className="text-3xl font-bold text-green-700 mb-8 text-center">
          Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Crop Monitoring Feature */}
          <motion.div
            className="bg-white p-6 rounded-lg shadow-md transform transition duration-500 hover:scale-105 hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
          >
            <ImageSlider images={[`${process.env.PUBLIC_URL}/crops1.jpg`, `${process.env.PUBLIC_URL}/crops2.jpg`, `${process.env.PUBLIC_URL}/crops3.jpg`]} />
            <h3 className="text-xl font-semibold text-green-700 mt-4">
              Crop Monitoring
            </h3>
            <p className="text-gray-600 mt-2">
              Monitor crop health, water, and nutrients efficiently.
            </p>
          </motion.div>

          {/* Marketplace Feature */}
          <motion.div
            className="bg-white p-6 rounded-lg shadow-md transform transition duration-500 hover:scale-105 hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
          >
            <ImageSlider
              images={[`${process.env.PUBLIC_URL}/marketplace1.jpg`, `${process.env.PUBLIC_URL}/marketplace2.jpg`, `${process.env.PUBLIC_URL}/marketplace3.jpg`]}
            />
            <h3 className="text-xl font-semibold text-green-700 mt-4">
              Marketplace
            </h3>
            <p className="text-gray-600 mt-2">
              Buy and sell agricultural products easily.
            </p>
          </motion.div>

          {/* Support Feature */}
          <motion.div
            className="bg-white p-6 rounded-lg shadow-md transform transition duration-500 hover:scale-105 hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
          >
            <ImageSlider images={[`${process.env.PUBLIC_URL}/support.jpg`]} />
            <h3 className="text-xl font-semibold text-green-700 mt-4">Support</h3>
            <p className="text-gray-600 mt-2">
              Access expert advice and troubleshooting resources.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Ads Section */}
      <section className="py-16 px-4 sm:px-8 bg-green-50">
        <h2 className="text-3xl font-bold text-green-700 mb-8 text-center">
          Advertisements
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            {
              image: `${process.env.PUBLIC_URL}/wheat.jpg`,
              title: "Wheat",
              description: "High-quality wheat for sale.",
              customer: "Mian Tayyab",
              price: "$50",
            },
            {
              image: `${process.env.PUBLIC_URL}/fertilizer.jpg`,
              title: "Fertilizers",
              description: "Organic fertilizers for better yields.",
              customer: "Hamad Gul",
              price: "$45",
            },
            {
              image: `${process.env.PUBLIC_URL}/Urea.jpg`,
              title: "Urea",
              description: "Premium urea for farming.",
              customer: "Basit",
              price: "$60",
            },
          ].map((ad, index) => (
            <motion.div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md transform transition duration-500 hover:scale-105 hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
            >
              <img
                src={ad.image}
                alt={ad.title}
                className="w-full h-48 object-cover rounded-lg"
              />
              <h3 className="text-xl font-semibold text-green-700 mt-4">
                {ad.title}
              </h3>
              <p className="text-gray-600 mt-2">{ad.description}</p>
              <div className="mt-4">
                <p className="text-sm text-gray-500">Customer: {ad.customer}</p>
                <p className="text-sm text-gray-500">Price: {ad.price}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-700 py-8 text-white">
        <div className="text-center">
          <p className="font-bold text-lg">Contact Us</p>
          <p>Email: agrotech@gmail.com</p>
          <p>Phone: 0314-1860287</p>
          <p>Instagram: AgroTech.pk</p>
          <p className="mt-4">&copy; 2024 AgroTech. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default DashboardPage;