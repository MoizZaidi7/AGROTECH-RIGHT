// VendorProfile.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../../components/ProductCard';

const VendorProfile = ({ vendorId }) => {
  const [vendor, setVendor] = useState(null);
  const [vendorProducts, setVendorProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        setLoading(true);
        const [vendorRes, productsRes] = await Promise.all([
          axios.get(`/api/vendors/${vendorId}`),
          axios.get(`/api/products?farmerId=${vendorId}`)
        ]);
        
        setVendor(vendorRes.data);
        setVendorProducts(productsRes.data);
      } catch (err) {
        setError('Failed to load vendor data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVendorData();
  }, [vendorId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!vendor) return <div>Vendor not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4">
            <div className="bg-gray-200 h-48 rounded-lg flex items-center justify-center">
              {vendor.profileImage ? (
                <img 
                  src={vendor.profileImage} 
                  alt={vendor.name}
                  className="h-full w-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-gray-500">No Image</span>
              )}
            </div>
          </div>
          
          <div className="w-full md:w-3/4">
            <h1 className="text-2xl font-bold mb-2">{vendor.name}</h1>
            <div className="flex items-center mb-4">
              <span className="text-yellow-500">★★★★☆</span>
              <span className="ml-2 text-gray-600">({vendor.rating?.toFixed(1) || 'No ratings'})</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-600">Location</p>
                <p className="font-medium">{vendor.location || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-gray-600">Member Since</p>
                <p className="font-medium">{new Date(vendor.joinDate).getFullYear()}</p>
              </div>
              <div>
                <p className="text-gray-600">Products</p>
                <p className="font-medium">{vendorProducts.length}</p>
              </div>
              <div>
                <p className="text-gray-600">Farming Practices</p>
                <p className="font-medium">{vendor.farmingPractices?.join(', ') || 'Conventional'}</p>
              </div>
            </div>
            
            <p className="text-gray-700">{vendor.description || 'No description provided.'}</p>
          </div>
        </div>
      </div>
      
      <h2 className="text-xl font-bold mb-4">Products from this Vendor</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {vendorProducts.map(product => (
          <ProductCard 
            key={product._id}
            product={product}
            showVendorInfo={false} // Don't show vendor info since we're on their page
          />
        ))}
      </div>
    </div>
  );
};

export default VendorProfile;