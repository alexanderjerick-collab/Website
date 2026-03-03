import React from 'react';
import { Link } from 'react-router-dom';

const Forbidden = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-2xl mb-6">
          <span className="text-4xl font-bold text-red-400 dark:text-red-500">403</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">You don't have permission to access this page. Contact your administrator if you believe this is an error.</p>
        <Link to="/dashboard" className="inline-flex px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Forbidden;
