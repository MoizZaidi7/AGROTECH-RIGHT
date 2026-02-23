import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaLeaf, FaCamera } from 'react-icons/fa';

const CropHealthMonitoring = () => {
  const [healthImage, setHealthImage] = useState(null);
  const [healthImagePreview, setHealthImagePreview] = useState(null);
  const [healthPrediction, setHealthPrediction] = useState('');
  const [error, setError] = useState('');
  const [healthLoading, setHealthLoading] = useState(false);

  // Handle image preview for crop health monitoring
  useEffect(() => {
    if (healthImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHealthImagePreview(reader.result);
      };
      reader.readAsDataURL(healthImage);
    } else {
      setHealthImagePreview(null);
    }
  }, [healthImage]);

  const handleHealthImageUpload = async (e) => {
    e.preventDefault();
    if (!healthImage) {
      setError('Please upload an image.');
      return;
    }

    setHealthLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', healthImage);

    try {
      const response = await axios.post('http://127.0.0.1:5003/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setHealthLoading(false);
      if (response.data.prediction) {
        setHealthPrediction(response.data.prediction);
      } else {
        setError(response.data.error || 'Failed to predict crop health. Please try again.');
      }
    } catch (err) {
      setHealthLoading(false);
      console.error('Error:', err);
      setError('An error occurred while predicting crop health.');
    }
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
          <FaLeaf className="text-4xl text-green-200" />
          <h1 className="text-4xl font-bold text-white">Crop Health Monitoring</h1>
        </div>
        <p className="text-green-50 text-lg">
          Upload images of your crops to analyze health conditions and detect diseases using AI-powered detection.
        </p>
      </motion.div>

      <form
        onSubmit={handleHealthImageUpload}
        className="bg-white rounded-2xl shadow-2xl overflow-hidden p-6 md:p-8"
      >
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="mb-8">
          <label className="block text-xl font-semibold text-gray-800 mb-4">Upload Crop Image</label>
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="border-3 border-dashed border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 text-center transition-all hover:border-green-500 hover:shadow-lg"
          >
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setHealthImage(e.target.files[0])}
              className="hidden"
              id="cropImageInput"
            />
            <label
              htmlFor="cropImageInput"
              className="cursor-pointer flex flex-col items-center justify-center"
            >
              {healthImagePreview ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full"
                >
                  <img
                    src={healthImagePreview}
                    alt="Crop preview"
                    className="mb-4 max-h-72 mx-auto rounded-xl object-contain shadow-xl border-2 border-green-200"
                  />
                  <p className="text-sm text-gray-600 font-medium flex items-center justify-center gap-2">
                    <FaCamera /> Click to change image
                  </p>
                </motion.div>
              ) : (
                <>
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-4">
                    <FaCamera className="text-4xl text-white" />
                  </div>
                  <p className="text-gray-700 font-medium text-lg mb-2">Click to upload an image of your crop</p>
                  <p className="text-gray-500 text-sm">Supports JPG, PNG, and other image formats</p>
                </>
              )}
            </label>
          </motion.div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-xl hover:from-green-600 hover:to-green-800 transition-all shadow-lg hover:shadow-xl font-medium text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!healthImage}
        >
          <FaLeaf /> Analyze Crop Health
        </motion.button>

        {healthLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center my-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200"
          >
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-3 border-b-3 border-green-500"></div>
            <p className="mt-4 text-gray-700 font-medium text-lg">Analyzing crop health with AI...</p>
            <p className="text-gray-600 text-sm mt-2">This may take a few moments</p>
          </motion.div>
        )}

        {healthPrediction && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="mt-8 p-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center flex-shrink-0">
                <FaLeaf className="text-white text-2xl" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-green-800 mb-3">Analysis Result</h3>
                <p className="text-gray-800 text-lg leading-relaxed">{healthPrediction}</p>
              </div>
            </div>
          </motion.div>
        )}
      </form>
    </div>
  );
};

export default CropHealthMonitoring;