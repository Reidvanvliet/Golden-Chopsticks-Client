import React, { useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message, onDismiss, autoClose = true, duration = 5000 }) => {
  useEffect(() => {
    if (autoClose && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onDismiss]);

  return (
    <div className="fixed top-20 right-4 bg-red-900/90 border border-red-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-md">
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium text-sm">{message}</p>
        </div>
        {onDismiss && (
          <button 
            onClick={onDismiss}
            className="text-red-300 hover:text-red-100 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* Auto-close progress bar */}
      {autoClose && (
        <div className="mt-3 w-full bg-red-800 rounded-full h-1">
          <div 
            className="bg-red-400 h-1 rounded-full animate-pulse"
            style={{
              animation: `shrink ${duration}ms linear`,
            }}
          ></div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

export default ErrorMessage;