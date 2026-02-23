import React from 'react';

const FormField = ({ 
  label, 
  name, 
  type, 
  value, 
  onChange, 
  min, 
  max, 
  unit, 
  placeholder, 
  options,
  className = '',
  required = true
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-lg font-medium text-gray-700 mb-2">
        {label} {unit && `(${unit})`}
      </label>
      {options ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white/80 backdrop-blur-sm"
          required={required}
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
          className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white/80 backdrop-blur-sm"
          required={required}
        />
      )}
      {min && max && (
        <p className="text-sm text-gray-500 mt-1">
          Recommended range: {min}-{max} {unit}
        </p>
      )}
    </div>
  );
};

export default FormField;