import React from 'react';

const History = () => {
  // Données fictives pour wireframe
  const items = [
    { icon: '🍔', title: 'McD, Point Cook', date: '5 jan 2021, Food', amount: '$5.00' },
    { icon: '🛒', title: 'Woolworths, Tarneit', date: '5 jan 2021, Groceries', amount: '$65.00' }
  ];
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Activité Récente</h1>
      {/* Liste des transactions */}
      <div className="space-y-4 mb-6">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center space-x-4">
            <div className="bg-gray-300 w-10 h-10 rounded flex items-center justify-center">
              {item.icon}
            </div>
            <div className="flex-1 space-y-1">
              <div className="bg-gray-300 h-4 w-1/3 rounded"></div>
              <div className="bg-gray-300 h-3 w-1/4 rounded"></div>
            </div>
            <div className="bg-gray-300 h-4 w-16 rounded"></div>
          </div>
        ))}
      </div>
      {/* Calendrier placeholder */}
      <div className="bg-gray-300 h-56 rounded mb-6"></div>
      {/* Résumé */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-base">Économies</span>
          <span className="font-bold">100 €</span>
        </div>
        <div className="flex justify-between">
          <span className="text-base">Revenus</span>
          <span className="font-bold">180 €</span>
        </div>
        <div className="flex justify-between">
          <span className="text-base">Dépenses</span>
          <span className="font-bold">120 €</span>
        </div>
      </div>
    </div>
  );
};

export default History; 