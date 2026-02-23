import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaLeaf, FaUpload, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';

const CropMaturityAssessment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    cropType: '',
    location: '',
    season: ''
  });

  const cropTypes = [
    "Tomato", "Wheat", "Maize", "Rice", "Chickpea", 
    "Kidneybeans", "Pigeonpeas", "Mothbeans", "Mungbean", 
    "Blackgram", "Lentil", "Pomegranate", "Banana", "Mango", 
    "Grapes", "Watermelon", "Muskmelon", "Apple", "Orange", 
    "Papaya", "Coconut", "Cotton", "Jute", "Coffee"
  ];

  const seasons = ["Spring", "Summer", "Fall", "Winter", "Monsoon"];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please upload an image of your crop');
      return;
    }

    if (!formData.cropType) {
      setError('Please select a crop type');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setResult(null);

      const formDataToSend = new FormData();
      formDataToSend.append('image', selectedFile);
      formDataToSend.append('cropType', formData.cropType);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('season', formData.season);

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/farmer/cropmaturity`, formDataToSend, {
  headers: {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${localStorage.getItem('token')}`  // Only send one auth token
  }
});

      setResult(response.data.result);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to assess crop maturity');
      console.error('Assessment error:', err);
    } finally {
      setLoading(false);
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
          <h1 className="text-4xl font-bold text-white">Crop Maturity Assessment</h1>
        </div>
        <p className="text-green-50 text-lg">Evaluate your crop's readiness for harvest using AI-powered analysis</p>
      </motion.div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaLeaf className="text-green-600" /> Assessment Form
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-800 font-semibold mb-2">Crop Type</label>
              <select
                value={formData.cropType}
                onChange={(e) => setFormData({...formData, cropType: e.target.value})}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-green-300"
                required
              >
                <option value="">Select Crop Type</option>
                {cropTypes.map((crop) => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-800 font-semibold mb-2">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-green-300"
                placeholder="Enter your farm location"
              />
            </div>

            <div>
              <label className="block text-gray-800 font-semibold mb-2">Season</label>
              <select
                value={formData.season}
                onChange={(e) => setFormData({...formData, season: e.target.value})}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-green-300"
              >
                <option value="">Select Season</option>
                {seasons.map((season) => (
                  <option key={season} value={season}>{season}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Crop Image</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {previewUrl ? (
                  <div className="mb-4">
                    <img 
                      src={previewUrl} 
                      alt="Crop preview" 
                      className="max-h-48 mx-auto rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <FaUpload className="text-3xl text-gray-400" />
                    <p className="text-gray-500">Drag & drop your crop image here or click to browse</p>
                  </div>
                )}
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  id="cropImageUpload"
                />
                <label
                  htmlFor="cropImageUpload"
                  className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  {previewUrl ? 'Change Image' : 'Upload Image'}
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Assessing...
                </>
              ) : (
                'Assess Maturity'
              )}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FaInfoCircle className="mr-2" /> Assessment Results
          </h2>

          {loading && !result ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
              <p className="mt-2 text-gray-600">Analyzing your crop image...</p>
            </div>
          ) : result ? (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Maturity Assessment</h3>
              <div className="prose max-w-none text-gray-700">
                {result.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-2">How it works</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Upload a clear image of your crop</li>
                <li>Select the crop type from the dropdown</li>
                <li>Optionally provide location and season information</li>
                <li>Our AI will analyze the image and provide maturity assessment</li>
                <li>Get harvest readiness recommendations</li>
              </ul>
              <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
                <h4 className="font-bold text-gray-800 mb-2">Tips for best results:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Take photos in good natural lighting</li>
                  <li>Capture close-ups of fruits/grains and the plant</li>
                  <li>Include multiple angles if possible</li>
                  <li>Avoid blurry or shadowed images</li>
                </ul>
              </div>
            </div>
          )}

          {result && previewUrl && (
            <div className="mt-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Reference Image</h3>
              <img 
                src={previewUrl} 
                alt="Submitted crop" 
                className="max-h-64 rounded-lg border border-gray-200"
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <FaLeaf className="mr-2" /> Common Maturity Indicators
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cropTypes.slice(0, 12).map((crop) => (
            <div key={crop} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-2">{crop}</h3>
              <p className="text-sm text-gray-600">
                {(() => {
                  switch(crop) {
                    case "Tomato": return "Fully red color, soft to touch, drying stem";
                    case "Wheat": return "Golden grain color, dry brittle stem";
                    case "Maize": return "Dented firm kernels, dry husk";
                    case "Rice": return "80-90% grains golden, bent panicle";
                    case "Chickpea": return "Pods turn yellow, dry plant, seeds harden";
                    case "Kidneybeans": return "Pods dry and yellow, seeds firm";
                    case "Pigeonpeas": return "Yellowing leaves, dry pods";
                    case "Mothbeans": return "Dry pods, hardened seeds, brown leaves";
                    case "Mungbean": return "70-80% pods turn black or brown";
                    case "Blackgram": return "Pods mature black/dark brown, dry stem";
                    case "Lentil": return "Yellow-brown pods, dry leaves";
                    case "Pomegranate": return "Skin turns deep red, makes metallic sound on tap";
                    default: return "Check for color change and firmness";
                  }
                })()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CropMaturityAssessment;