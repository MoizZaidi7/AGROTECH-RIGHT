import React from 'react';
import { FaCheck } from 'react-icons/fa';

const StepIndicator = ({ step, steps }) => {
  return (
    <div className="flex justify-between mb-8 relative">
      <div className="absolute top-1/2 h-1 bg-gray-200 w-full -z-10 transform -translate-y-1/2"></div>
      {steps.map((s, i) => (
        <div key={i} className="flex flex-col items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
              s.isDone
                ? 'bg-green-600 text-white'
                : s.isActive
                ? 'bg-green-500 text-white'
                : 'bg-white text-gray-500 border-2 border-gray-300'
            }`}
          >
            {s.isDone ? <FaCheck className="text-white" /> : i + 1}
          </div>
          <span
            className={`mt-2 ${
              s.isActive ? 'text-green-600 font-medium' : 'text-gray-500'
            }`}
          >
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;