import React from 'react';

/**
 * LoadingSpinner Component
 * Shows loading state with spinner animation
 */
const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-gray-600 font-semibold">{message}</p>
      </div>
    </div>
  );
};

/**
 * ErrorMessage Component
 * Display error message with optional retry button
 */
const ErrorMessage = ({ message, onRetry, onDismiss }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-red-800">Error</h3>
          <p className="text-red-700 text-sm mt-1">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-500 hover:text-red-700 font-bold text-lg"
          >
            ×
          </button>
        )}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-semibold transition-colors duration-200"
        >
          Retry
        </button>
      )}
    </div>
  );
};

/**
 * EmptyState Component
 * Shows when no data is available
 */
const EmptyState = ({ message = 'No data found', icon: Icon, action, actionLabel }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {Icon && <Icon size={48} className="text-gray-300 mb-4" />}
      <p className="text-gray-600 font-semibold mb-4">{message}</p>
      {action && (
        <button
          onClick={action}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
        >
          {actionLabel || 'Take Action'}
        </button>
      )}
    </div>
  );
};

/**
 * SkeletonLoader Component
 * Show skeleton placeholders while loading
 */
const SkeletonLoader = ({ count = 3, className = '' }) => {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-4 mb-4 animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-3 w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
          <div className="h-4 bg-gray-200 rounded mb-3 w-2/3"></div>
          <div className="flex gap-2">
            <div className="h-10 bg-gray-200 rounded flex-1"></div>
            <div className="h-10 bg-gray-200 rounded flex-1"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * SuccessMessage Component
 * Show success notification
 */
const SuccessMessage = ({ message, onDismiss }) => {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-green-800">Success</h3>
          <p className="text-green-700 text-sm mt-1">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-green-500 hover:text-green-700 font-bold text-lg"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export { LoadingSpinner, ErrorMessage, EmptyState, SkeletonLoader, SuccessMessage };
