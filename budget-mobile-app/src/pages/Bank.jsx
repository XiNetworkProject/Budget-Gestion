import React from 'react';

const Bank = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Banque</h1>
      {/* Liste des comptes bancaires */}
      <div className="space-y-4">
        <div className="bg-gray-300 h-16 rounded"></div>
        <div className="bg-gray-300 h-16 rounded"></div>
        <div className="bg-gray-300 h-16 rounded"></div>
      </div>
    </div>
  );
};

export default Bank; 