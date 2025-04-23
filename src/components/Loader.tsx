import React from 'react';

const Loader: React.FC = () => {
  return (
    <div data-testid="loading-indicator" className="text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      <span className="ml-2">Loading...</span>
    </div>
  );
};

export default Loader;