import React from 'react';

const Onboarding = () => {
  return (
    <div className="p-4 flex flex-col justify-between h-screen">
      <div className="flex-1 flex items-center justify-center">
        {/* Image ou illustration */}
        <div className="bg-gray-300 w-64 h-64 rounded"></div>
      </div>
      <div className="space-y-2 text-center">
        <div className="bg-gray-300 h-6 w-3/4 rounded mx-auto"></div>
        <div className="bg-gray-300 h-4 w-1/2 rounded mx-auto"></div>
      </div>
      <button className="bg-gray-300 h-10 w-full rounded mt-6">Suivant</button>
      <div className="flex justify-center space-x-2 mt-4">
        <span className="bg-gray-300 w-2 h-2 rounded-full"></span>
        <span className="bg-gray-400 w-2 h-2 rounded-full"></span>
        <span className="bg-gray-400 w-2 h-2 rounded-full"></span>
      </div>
    </div>
  );
};

export default Onboarding; 