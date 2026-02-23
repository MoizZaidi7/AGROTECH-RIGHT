import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSeedling, FaSearch } from 'react-icons/fa';
import axios from 'axios';

const HarvestRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const fetchRecommendations = async (cropType = '') => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/farmer/harvest/recommendations`,
        {
          params: { cropType }, // Send as query parameter
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}` 
          }
        }
      );

      // Handle response based on whether we're searching or viewing all
      if (cropType) {
        // Single recommendation response
        setRecommendations([response.data]);
      } else {
        // Array of all recommendations
        setRecommendations(response.data.schedules || []);
      }
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch recommendations');
      if (err.response?.data?.suggestions) {
        setSuggestions(err.response.data.suggestions);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial load - fetch all recommendations
  useEffect(() => {
    fetchRecommendations();
  }, []);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        fetchRecommendations(searchTerm.trim());
      } else {
        fetchRecommendations();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div className="p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 bg-gradient-to-r from-green-600 to-green-900 rounded-2xl p-8 shadow-lg"
      >
        <div className="flex items-center gap-3 mb-3">
          <FaSeedling className="text-4xl text-green-200" />
          <h1 className="text-4xl font-bold text-white">Harvest Recommendations</h1>
        </div>
        <p className="text-green-50 text-lg">Get crop-specific harvest recommendations and best practices</p>
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
                      fetchRecommendations(suggestion);
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
            <p className="mt-2 text-gray-600">Loading recommendations...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <FaSeedling className="text-5xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              {searchTerm.trim() ? 'No Recommendations Found' : 'No Recommendations Available'}
            </h3>
            <p className="text-gray-500">
              {searchTerm.trim() 
                ? 'Try searching for a different crop' 
                : 'Search for a crop to get recommendations'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map(rec => (
              <motion.div
                key={rec._id || rec.cropType}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
              >
                <div className="flex items-center mb-4">
                  <FaSeedling className="text-2xl text-green-600 mr-3" />
                  <h2 className="text-xl font-bold text-gray-800">{rec.cropType}</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                  <h3 className="font-medium text-gray-700">Optimal Harvest Time:</h3>
                  <ul className="list-disc list-inside text-gray-600 ml-4">
                    {rec.optimalHarvestTime?.morning && <li>Morning</li>}
                    {rec.optimalHarvestTime?.afternoon && <li>Afternoon</li>}
                    {rec.optimalHarvestTime?.evening && <li>Evening</li>}
                  </ul>
                  {rec.optimalHarvestTime?.notes && (
                    <p className="text-sm text-gray-500 italic mt-1">Note: {rec.optimalHarvestTime.notes}</p>
                  )}
                </div>

                  
                  <div>
                    <h3 className="font-medium text-gray-700">Yield Estimation:</h3>
                    <p className="text-gray-600">{rec.yieldEstimation}</p>
                  </div>
                  
                  {rec.qualityIndicators && rec.qualityIndicators.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-700">Quality Indicators:</h3>
                      <ul className="list-disc list-inside text-gray-600">
                        {rec.qualityIndicators.map((indicator, i) => (
                          <li key={i}>{indicator}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {rec.specialNotes && (
                    <div>
                      <h3 className="font-medium text-gray-700">Special Notes:</h3>
                      <p className="text-gray-600">{rec.specialNotes}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HarvestRecommendations;