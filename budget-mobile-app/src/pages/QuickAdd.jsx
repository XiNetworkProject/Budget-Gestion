import React from 'react';

const QuickAdd = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Ajout Rapide</h1>
      {/* Actions rapides */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-300 h-24 rounded flex items-center justify-center">Nouvelle dépense</div>
        <div className="bg-gray-300 h-24 rounded flex items-center justify-center">Dette / Code-barres</div>
      </div>
    </div>
  );
};

export default QuickAdd; 