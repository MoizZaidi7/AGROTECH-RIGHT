import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { FaLeaf, FaArrowLeft, FaArrowRight, FaMapMarkerAlt, FaCheck, FaInfoCircle } from 'react-icons/fa';

const CropRecommendation = () => {
  // Enhanced parameter limits with proper labels
  const PARAMETER_LIMITS = {
    Nitrogen: { 
      label: 'Nitrogen (N)', 
      min: 0, 
      max: 140, 
      unit: 'kg/ha',
      description: 'Essential for leaf growth and plant protein synthesis'
    },
    Phosphorus: { 
      label: 'Phosphorus (P)', 
      min: 5, 
      max: 145, 
      unit: 'kg/ha',
      description: 'Important for root development and energy transfer'
    },
    Potassium: { 
      label: 'Potassium (K)', 
      min: 5, 
      max: 205, 
      unit: 'kg/ha',
      description: 'Vital for fruit quality and disease resistance'
    },
    Ph: { 
      label: 'pH Level', 
      min: 3.5, 
      max: 9.5, 
      unit: 'pH',
      description: 'Measures soil acidity/alkalinity'
    },
    Rainfall: { 
      label: 'Rainfall', 
      min: 20, 
      max: 300, 
      unit: 'mm',
      description: 'Annual precipitation in your region'
    }
  };
  const [formData, setFormData] = useState({
    Nitrogen: '',
    Phosphorus: '',
    Potassium: '',
    Ph: '',
    Rainfall: '',
    location: '',
    latitude: '',
    longitude: '',
  });
  const [step, setStep] = useState(1);
  const [result, setResult] = useState('');
  const [cropImage, setCropImage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [useMap, setUseMap] = useState(false);
  const [showFormula, setShowFormula] = useState(false);

  // Map configuration
  const mapContainerStyle = {
    width: '100%',
    height: '300px',
  };

  const defaultCenter = { lat: 31.5204, lng: 74.3587 }; // Lahore, Pakistan

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Basic validation for numeric fields
    if (['Nitrogen', 'Phosphorus', 'Potassium', 'Ph', 'Rainfall'].includes(name)) {
      if (value && isNaN(value)) return;
    }
    
    setFormData({ ...formData, [name]: value });
  };

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setSelectedLocation({ lat, lng });
    setFormData({
      ...formData,
      location: { lat, lng },
      latitude: lat,
      longitude: lng,
    });
  };

  // Enhanced validation with threshold checks
  const validateForm = () => {
    let errorMessage = '';
    
    if (step === 1) {
      const requiredSoilParams = ['Nitrogen', 'Phosphorus', 'Potassium'];
      for (const param of requiredSoilParams) {
        if (!formData[param]) {
          errorMessage = 'All soil parameters are required.';
          break;
        }
        
        const { min, max, unit } = PARAMETER_LIMITS[param];
        const value = parseFloat(formData[param]);
        
        if (value < min || value > max) {
          errorMessage = `${param} should be between ${min}-${max} ${unit}`;
          break;
        }
      }
    }
    
    if (step === 2) {
      if (!formData.location && !selectedLocation && !formData.latitude && !formData.longitude) {
        errorMessage = 'Location is required.';
      } else if (formData.latitude && formData.longitude) {
        const lat = parseFloat(formData.latitude);
        const lng = parseFloat(formData.longitude);
        
        if (isNaN(lat)) errorMessage = 'Latitude must be a valid number';
        else if (lat < -90 || lat > 90) errorMessage = 'Latitude must be between -90 and 90';
        else if (isNaN(lng)) errorMessage = 'Longitude must be a valid number';
        else if (lng < -180 || lng > 180) errorMessage = 'Longitude must be between -180 and 180';
      }
    }
    
    if (step === 3) {
      const requiredEnvParams = ['Ph', 'Rainfall'];
      for (const param of requiredEnvParams) {
        if (!formData[param]) {
          errorMessage = 'Both Ph and Rainfall are required.';
          break;
        }
        
        const { min, max, unit } = PARAMETER_LIMITS[param];
        const value = parseFloat(formData[param]);
        
        if (value < min || value > max) {
          errorMessage = `${param} should be between ${min}-${max} ${unit}`;
          break;
        }
      }
    }
    
    setError(errorMessage);
    return !errorMessage;
  };

  const handleNextStep = () => {
    if (validateForm()) {
      setLoadingStep(step + 1);
      setLoading(true);
      setTimeout(() => {
        setStep(step + 1);
        setLoading(false);
        setLoadingStep(null);
      }, 800);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) {
      return;
    }
    setLoadingStep(3);
    setLoading(true);

    const payload = {
      ...formData,
      location: useMap ? { lat: formData.latitude, lng: formData.longitude } : formData.location,
    };

    try {
      const response = await axios.post('http://127.0.0.1:5001/api/predict', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      setLoading(false);
      setLoadingStep(null);
      if (response.data.success) {
        setResult(`Recommended Crop: ${response.data.data.recommendedCrop}`);
        setCropImage(`http://localhost:5001${response.data.data.cropImage}`);
      } else {
        setError(response.data.message || 'Failed to get recommendation. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      setLoadingStep(null);
      console.error('Error:', err);
      setError('An error occurred while fetching the recommendation.');
    }
  };

 const FormField = ({ label, name, type, value, onChange, min, max, unit, placeholder, options, description }) => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-5"
    >
      <label className="block text-base font-semibold text-gray-800 mb-2">
        {label} {unit && <span className="text-sm text-gray-500 font-normal">({unit})</span>}
      </label>
      {description && <p className="text-sm text-gray-500 mb-2">{description}</p>}
      {options ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white hover:border-green-300"
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <div className="relative">
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
          {min !== undefined && max !== undefined && (
            <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
              <span className="bg-gray-100 px-2 py-1 rounded">Min: {min} {unit}</span>
              <span className="bg-gray-100 px-2 py-1 rounded">Max: {max} {unit}</span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );

  const renderStepForm = () => {
    const soilParams = [
      { name: 'Nitrogen', ...PARAMETER_LIMITS.Nitrogen },
      { name: 'Phosphorus', ...PARAMETER_LIMITS.Phosphorus },
      { name: 'Potassium', ...PARAMETER_LIMITS.Potassium },
    ];

    const environmentParams = [
      { name: 'Ph', ...PARAMETER_LIMITS.Ph },
      { name: 'Rainfall', ...PARAMETER_LIMITS.Rainfall },
    ];

    const stepContent = {
      1: (
        <div className="space-y-4">
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              🌱 Soil Analysis
            </h2>
            <p className="text-gray-700">Enter the soil composition parameters to analyze soil quality and nutrient levels.</p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {soilParams.map((param) => (
              <FormField
                key={param.name}
                label={param.name}
                name={param.name}
                type="number"
                value={formData[param.name]}
                onChange={handleChange}
                min={param.min}
                max={param.max}
                unit={param.unit}
              />
            ))}
          </div>
        </div>
      ),
      2: (
        <div className="space-y-4">
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              📍 Location Analysis
            </h2>
            <p className="text-gray-700">Provide your farm location for accurate climate-based recommendations.</p>
          </div>
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setUseMap(!useMap)}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all shadow-md ${
                  useMap ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaMapMarkerAlt className="mr-2" /> Use Map
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setUseMap(!useMap)}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all shadow-md ${
                  !useMap ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaCheck className="mr-2" /> Manual Entry
              </motion.button>
            </div>

            {useMap ? (
              <div className="rounded-xl overflow-hidden shadow-lg border-2 border-gray-200">
                <LoadScript googleMapsApiKey="AIzaSyAul5d2P43ED8RbSgfsFiTgmPoeneYyuOk">
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={selectedLocation || defaultCenter}
                    zoom={6}
                    onClick={handleMapClick}
                  >
                    {selectedLocation && <Marker position={selectedLocation} />}
                  </GoogleMap>
                </LoadScript>
                {selectedLocation && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 border-t-2 border-green-200">
                    <p className="text-sm font-medium text-gray-800">
                      📍 Selected location: Lat: {selectedLocation.lat.toFixed(4)}, Lng: {selectedLocation.lng.toFixed(4)}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Latitude"
                  name="latitude"
                  type="number"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="Enter latitude (-90 to 90)"
                  min="-90"
                  max="90"
                  step="0.0001"
                />
                <FormField
                  label="Longitude"
                  name="longitude"
                  type="number"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="Enter longitude (-180 to 180)"
                  min="-180"
                  max="180"
                  step="0.0001"
                />
              </div>
            )}
          </div>
        </div>
      ),
      3: (
        <div className="space-y-4">
          <div className="mb-6 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              🌤️ Environmental Factors
            </h2>
            <p className="text-gray-700">Enter environmental factors to complete the comprehensive recommendation analysis.</p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {environmentParams.map((param) => (
              <FormField
                key={param.name}
                label={param.name}
                name={param.name}
                type="number"
                value={formData[param.name]}
                onChange={handleChange}
                min={param.min}
                max={param.max}
                unit={param.unit}
                step={param.name === 'Ph' ? '0.1' : '1'}
              />
            ))}
          </div>
        </div>
      ),
    };

    return stepContent[step] || null;
  };

  const renderStepIndicator = () => {
    const steps = [
      { label: 'Soil Analysis', icon: '🌱', isActive: step >= 1, isDone: step > 1 },
      { label: 'Location', icon: '📍', isActive: step >= 2, isDone: step > 2 },
      { label: 'Environment', icon: '🌤️', isActive: step >= 3, isDone: false },
    ];

    return (
      <div className="mb-10">
        <div className="flex justify-between mb-2 relative">
          <div className="absolute top-5 left-0 h-1 bg-gray-200 w-full -z-10"></div>
          <div 
            className="absolute top-5 left-0 h-1 bg-gradient-to-r from-green-500 to-green-600 -z-10 transition-all duration-500"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          ></div>
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center flex-1">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shadow-lg ${
                  s.isDone
                    ? 'bg-gradient-to-br from-green-500 to-green-700 text-white'
                    : s.isActive
                    ? 'bg-gradient-to-br from-green-400 to-green-600 text-white'
                    : 'bg-white text-gray-400 border-2 border-gray-300'
                }`}
              >
                {s.isDone ? <FaCheck className="text-white" /> : s.icon}
              </motion.div>
              <span
                className={`mt-3 text-sm font-medium ${
                  s.isActive ? 'text-green-700' : 'text-gray-500'
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFormulaSection = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 shadow-lg"
    >
      <h3 className="text-2xl font-bold text-blue-800 mb-4 flex items-center gap-2">
        <FaInfoCircle className="text-3xl" /> How the Recommendation Works
      </h3>
      <div className="prose prose-blue max-w-none">
        <p className="mb-6 text-gray-700 text-base">
          Our crop recommendation system uses a machine learning model trained on agricultural data to predict the best crop for your conditions.
        </p>
        
        <h4 className="font-bold text-blue-700 mt-6 mb-3 text-lg">Key Parameters Considered:</h4>
        <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
          <li><strong>Soil Nutrients:</strong> Nitrogen (N), Phosphorus (P), Potassium (K) levels</li>
          <li><strong>pH Level:</strong> Soil acidity/alkalinity (3.5-9.5 pH range)</li>
          <li><strong>Rainfall:</strong> Annual precipitation in your region</li>
          <li><strong>Location:</strong> Latitude and longitude for climate considerations</li>
        </ul>
        
        <h4 className="font-bold text-blue-700 mt-6 mb-3 text-lg">Algorithm Details:</h4>
        <p className="mb-4 text-gray-700">
          The system uses a <strong>Random Forest Classifier</strong> trained on historical crop performance data with the following features:
        </p>
        <pre className="bg-white p-4 rounded-xl text-sm overflow-x-auto border-2 border-blue-200 shadow-inner">
          {`Features: [N, P, K, pH, rainfall, temperature, humidity]
Target: Optimal crop`}
        </pre>
        
        <h4 className="font-bold text-blue-700 mt-6 mb-4 text-lg">Parameter Thresholds:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(PARAMETER_LIMITS).map(([param, {min, max, unit}]) => (
            <div key={param} className="bg-white p-4 rounded-xl shadow-md border border-blue-200 hover:shadow-lg transition-shadow">
              <div className="font-semibold text-blue-700 text-base">{param}</div>
              <div className="text-sm text-gray-600 mt-1">{min} to {max} {unit}</div>
            </div>
          ))}
        </div>
      </div>
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
          <FaLeaf className="text-4xl text-green-200" />
          <h1 className="text-4xl font-bold text-white">Crop Recommendation</h1>
        </div>
        <p className="text-green-50 text-lg">
          Get personalized crop recommendations based on your soil and environment.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 md:p-8">
          {renderStepIndicator()}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepForm()}
            </motion.div>
          </AnimatePresence>

          {loading && loadingStep && (
            <div className="text-center my-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
              <p className="mt-2 text-gray-600">Processing data...</p>
            </div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl shadow-lg"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center">
                  <FaLeaf className="text-white text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-green-800">{result}</h3>
              </div>
              {cropImage && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-4 rounded-xl overflow-hidden shadow-xl border-2 border-green-200"
                >
                  <img src={cropImage} alt="Recommended crop" className="w-full h-64 object-cover" />
                </motion.div>
              )}
            </motion.div>
          )}

          <div className="mt-8 flex justify-between">
            {step > 1 ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handlePrevStep}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg hover:shadow-xl font-medium"
              >
                <FaArrowLeft className="mr-2" /> Back
              </motion.button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleNextStep}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-xl hover:from-green-600 hover:to-green-800 transition-all shadow-lg hover:shadow-xl font-medium"
              >
                Next <FaArrowRight className="ml-2" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="flex items-center px-8 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-xl hover:from-green-600 hover:to-green-800 transition-all shadow-lg hover:shadow-xl font-medium"
              >
                Get Recommendation <FaLeaf className="ml-2" />
              </motion.button>
            )}
          </div>
        </div>
      </form>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowFormula(!showFormula)}
        className="mt-6 flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl font-medium"
      >
        <FaInfoCircle className="mr-2" /> {showFormula ? 'Hide' : 'Show'} Recommendation Details
      </motion.button>

      {showFormula && renderFormulaSection()}
    </div>
  );
};

export default CropRecommendation;