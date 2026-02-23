import React, { useState } from 'react';
import { FaCamera, FaTimes, FaPlus, FaEdit } from 'react-icons/fa';
import FormField from './FormField';

const ProductForm = ({
  product,
  setProduct,
  productImages,
  setProductImages,
  previewImages,
  setPreviewImages,
  onSubmit,
  onCancel,
  isEditing,
  loading
}) => {
  const productCategories = [
    'Food & Produce',
    'Farm Inputs',
    'Equipment',
    'Seeds',
    'Fertilizers',
    'Livestock',
    'Dairy'
  ];

  const qualityGrades = ['A', 'B', 'C'];

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setProductImages(files);
    
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const removeImage = (index) => {
    const newImages = [...productImages];
    newImages.splice(index, 1);
    setProductImages(newImages);

    const newPreviews = [...previewImages];
    newPreviews.splice(index, 1);
    setPreviewImages(newPreviews);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        {isEditing ? 'Edit Product' : 'Add New Product'}
      </h2>
      
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Product Name"
            name="name"
            value={product.name}
            onChange={handleChange}
          />

          <FormField
            label="Category"
            name="category"
            value={product.category}
            onChange={handleChange}
            options={productCategories}
          />

          <FormField
            label="Price (PKR)"
            name="price"
            type="number"
            value={product.price}
            onChange={handleChange}
          />

          <FormField
            label="Quality Grade"
            name="grade"
            value={product.grade}
            onChange={handleChange}
            options={qualityGrades}
          />

          <FormField
            label="Stock Quantity"
            name="stock"
            type="number"
            value={product.stock}
            onChange={handleChange}
          />

          <FormField
            label="Farming Practices"
            name="farmingPractices"
            value={product.farmingPractices}
            onChange={handleChange}
            placeholder="e.g., Organic, Rainfed"
            required={false}
          />

          <div className="md:col-span-2">
            <FormField
              label="Description"
              name="description"
              value={product.description}
              onChange={handleChange}
              type="textarea"
              className="md:col-span-2"
            />
          </div>

          <div className="md:col-span-2 mb-4">
            <label className="block text-gray-700 mb-2">Product Images</label>
            <input
              type="file"
              multiple
              onChange={handleImageChange}
              className="hidden"
              id="productImages"
              accept="image/*"
            />
            <label
              htmlFor="productImages"
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 block text-center cursor-pointer hover:bg-gray-50"
            >
              <FaCamera className="text-3xl text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Click to upload product images</p>
              <p className="text-sm text-gray-500 mt-1">Maximum 5 images (JPEG/PNG)</p>
            </label>

            {previewImages.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-4">
                {previewImages.map((img, index) => (
                  <div key={index} className="relative w-24 h-24 group">
                    <img
                      src={img}
                      alt={`Preview ${index}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                {isEditing ? <FaEdit className="mr-2" /> : <FaPlus className="mr-2" />}
                {isEditing ? 'Update Product' : 'Add Product'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;