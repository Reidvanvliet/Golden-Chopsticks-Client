import React from 'react';

const LoadingState = ({ message = "Loading..." }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 pt-16 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
      <p className="text-white text-lg">{message}</p>
    </div>
  </div>
);

export default LoadingState;