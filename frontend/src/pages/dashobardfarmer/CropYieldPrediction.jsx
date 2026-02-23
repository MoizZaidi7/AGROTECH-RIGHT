import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaChartLine } from 'react-icons/fa';

const CropYieldPrediction = () => {
  const [cropYieldData, setCropYieldData] = useState({
    Year: new Date().getFullYear(),
    average_rain_fall_mm_per_year: '',
    pesticides_tonnes: '',
    avg_temp: '',
    Country: 'Pakistan',
    Crop: '',
  });
  const [cropYieldResult, setCropYieldResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Updated crop list to match backend expectations
  const crops = [
    'Maize',
    'Plantains and others',
    'Potatoes',
    'Rice, paddy',
    'Sorghum',
    'Soybeans',
    'Sweet potatoes',
    'Wheat',
    'Yams'
  ];

  const handleCropYieldChange = (e) => {
    const { name, value } = e.target;
    setCropYieldData({ ...cropYieldData, [name]: value });
  };

  const handleCropYieldSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      Year: parseInt(cropYieldData.Year),
      average_rain_fall_mm_per_year: parseFloat(cropYieldData.average_rain_fall_mm_per_year),
      pesticides_tonnes: parseFloat(cropYieldData.pesticides_tonnes),
      avg_temp: parseFloat(cropYieldData.avg_temp),
      Country: cropYieldData.Country,
      Crop: cropYieldData.Crop,
    };

    try {
      const response = await axios.post('http://127.0.0.1:5000/predict', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      setLoading(false);
      if (response.data.predicted_yield) {
        setCropYieldResult(`Predicted Yield: ${response.data.predicted_yield} tons`);
      } else {
        setError(response.data.error || 'Failed to predict crop yield. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      console.error('Error:', err);
      setError('An error occurred while predicting crop yield.');
    }
  };

  const FormField = ({ label, name, type, value, onChange, min, max, unit, placeholder, options }) => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-5"
    >
      <label className="block text-base font-semibold text-gray-800 mb-2">
        {label} {unit && <span className="text-sm text-gray-500 font-normal">({unit})</span>}
      </label>
      {options ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white hover:border-green-300"
          required
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type || "text"}
          name={name}
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          placeholder={placeholder || `Enter ${label}`}
          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white hover:border-green-300"
          required
        />
      )}
    </motion.div>
  );

  return (
    <div className="p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 bg-gradient-to-r from-green-600 to-green-900 rounded-2xl p-8 shadow-lg"
      >
        <div className="flex items-center gap-3 mb-3">
          <FaChartLine className="text-4xl text-green-200" />
          <h1 className="text-4xl font-bold text-white">Crop Yield Prediction</h1>
        </div>
        <p className="text-green-50 text-lg">
          Predict your expected crop yield based on environmental conditions and agricultural inputs using AI.
        </p>
      </motion.div>

      <form
        onSubmit={handleCropYieldSubmit}
        className="bg-white rounded-2xl shadow-2xl overflow-hidden p-6 md:p-8"
      >
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Year"
            name="Year"
            type="number"
            value={cropYieldData.Year}
            onChange={handleCropYieldChange}
            placeholder="Enter year"
          />
          <FormField
            label="Average Rainfall"
            name="average_rain_fall_mm_per_year"
            type="number"
            value={cropYieldData.average_rain_fall_mm_per_year}
            onChange={handleCropYieldChange}
            placeholder="Enter average rainfall"
            unit="mm/year"
          />
          <FormField
            label="Pesticides Used"
            name="pesticides_tonnes"
            type="number"
            value={cropYieldData.pesticides_tonnes}
            onChange={handleCropYieldChange}
            placeholder="Enter pesticides amount"
            unit="tonnes"
          />
          <FormField
            label="Average Temperature"
            name="avg_temp"
            type="number"
            value={cropYieldData.avg_temp}
            onChange={handleCropYieldChange}
            placeholder="Enter average temperature"
            unit="°C"
          />
          <FormField
            label="Crop Type"
            name="Crop"
            value={cropYieldData.Crop}
            onChange={handleCropYieldChange}
            options={crops}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="mt-8 w-full md:w-auto px-8 py-4 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-xl hover:from-green-600 hover:to-green-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center font-medium text-lg gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              Predicting...
            </>
          ) : (
            <>
              <FaChartLine /> Predict Yield
            </>
          )}
        </motion.button>

        {cropYieldResult && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="mt-8 p-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center flex-shrink-0">
                <FaChartLine className="text-white text-3xl" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-green-800">{cropYieldResult}</h3>
                <p className="text-gray-600 mt-2">Based on current environmental data and inputs</p>
              </div>
            </div>
          </motion.div>
        )}
      </form>
    </div>
  );
};

export default CropYieldPrediction;