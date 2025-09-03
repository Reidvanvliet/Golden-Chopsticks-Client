import React from 'react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800/90 backdrop-blur-sm p-8 rounded-lg border border-gray-700 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
        <p className="text-white font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;