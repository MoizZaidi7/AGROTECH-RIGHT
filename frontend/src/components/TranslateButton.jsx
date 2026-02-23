import React from 'react';

const TranslateButton = ({ onClick }) => {
  return (
    <button
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      onClick={onClick}
    >
      Translate to Urdu
    </button>
  );
};

export default TranslateButton;
