import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBook, FaSearch, FaBoxOpen, FaTemperatureLow, FaClock, FaTools, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';

const HarvestHandlingGuide = () => {
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [expanded, setExpanded] = useState(false);

  const fetchHandlingGuide = async (cropType = '') => {
    try {
      setLoading(true);
      setError('');
      setGuide(null);
      
      const response = await axios.get(
        'http://localhost:5000/api/farmer/harvest/handling-guide',
        {
          params: { cropType },
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}` 
          }
        }
      );

      setGuide(response.data);
      setExpanded(false); // Keep collapsed initially when guide is found
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch handling guide');
      if (err.response?.data?.suggestions) {
        setSuggestions(err.response.data.suggestions);
      }
      setExpanded(false);
    } finally {
      setLoading(false);
    }
  };

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        fetchHandlingGuide(searchTerm.trim());
      } else {
        setGuide(null);
        setExpanded(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 bg-gradient-to-r from-green-600 to-green-900 rounded-2xl p-8 shadow-lg"
      >
        <div className="flex items-center gap-3 mb-3">
          <FaBook className="text-4xl text-green-200" />
          <h1 className="text-4xl font-bold text-white">Post-Harvest Handling Guides</h1>
        </div>
        <p className="text-green-50 text-lg">Learn best practices for handling your crops after harvest</p>
      </motion.div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
          {suggestions.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium">Try one of these crops:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchTerm(suggestion);
                      fetchHandlingGuide(suggestion);
                    }}
                    className="px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
        <div className="relative mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for a crop..."
            className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-green-300 text-lg"
          />
          <FaSearch className="absolute left-4 top-5 text-gray-400 text-xl" />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
            <p className="mt-2 text-gray-600">Loading guide...</p>
          </div>
        ) : !guide && searchTerm ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <FaBook className="text-5xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No Handling Guide Found</h3>
            <p className="text-gray-500">Try searching for a different crop</p>
          </div>
        ) : !guide ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <FaBook className="text-5xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">Search for a Crop</h3>
            <p className="text-gray-500">Enter a crop name to view its handling guide</p>
          </div>
        ) : (
          <motion.div
            key={guide._id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6"
            >
              <div 
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={toggleExpand}
              >
                <div className="flex items-center">
                  <FaBook className="text-2xl text-green-600 mr-3" />
                  <h2 className="text-xl font-bold text-gray-800">{guide.cropType}</h2>
                </div>
                <motion.div
                  animate={{ rotate: expanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </motion.div>
              </div>

              {expanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Tool Handling */}
                  {guide.toolHandling && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-700 flex items-center mb-2">
                        <FaTools className="mr-2" /> Tool Handling
                      </h3>
                      <p className="text-gray-600">{guide.toolHandling}</p>
                    </div>
                  )}

                  {/* Storage Requirements */}
                  {guide.storageRequirements && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-700 flex items-center mb-2">
                        <FaTemperatureLow className="mr-2" /> Storage Requirements
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Temperature</p>
                          <p className="text-gray-700 font-medium">{guide.storageRequirements.temperature}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Humidity</p>
                          <p className="text-gray-700 font-medium">{guide.storageRequirements.humidity}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Duration</p>
                          <p className="text-gray-700 font-medium">{guide.storageRequirements.duration}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Crop Handling Stages */}
                  {guide.cropHandling && guide.cropHandling.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-700 mb-3">Crop Handling Stages</h3>
                      <div className="space-y-4">
                        {guide.cropHandling.map((stage, index) => (
                          <div key={stage._id} className="border-l-4 border-green-500 pl-4 py-2">
                            <h4 className="font-medium text-gray-700">{stage.stage}</h4>
                            <p className="text-gray-600 my-2">{stage.instructions}</p>
                            {stage.precautions && stage.precautions.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm font-medium text-gray-600 flex items-center">
                                  <FaExclamationTriangle className="mr-1" /> Precautions:
                                </p>
                                <ul className="list-disc list-inside text-gray-600 text-sm mt-1">
                                  {stage.precautions.map((precaution, i) => (
                                    <li key={i}>{precaution}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Packaging Suggestions */}
                  {guide.packagingSuggestions && guide.packagingSuggestions.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-700 flex items-center mb-2">
                        <FaBoxOpen className="mr-2" /> Packaging Suggestions
                      </h3>
                      <ul className="list-disc list-inside text-gray-600">
                        {guide.packagingSuggestions.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default HarvestHandlingGuide;