import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-6">
          <span className="text-4xl font-bold text-gray-400 dark:text-gray-500">404</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Page Not Found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/dashboard" className="inline-flex px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
