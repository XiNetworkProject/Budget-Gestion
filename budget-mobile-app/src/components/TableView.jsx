import React, { useEffect, useState } from 'react';
import { useStore } from '../contexts/StoreContext';

function TableView() {
  const { 
    data, 
    setData, 
    incomes, 
    setIncomes, 
    sideByMonth, 
    setSideByMonth,
    placedSavings,
    setPlacedSavings,
    getRemainingAmount 
  } = useStore();

  return (
    <div className="space-y-6">
      {/* Section Économies */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4 text-white">Économies</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-slate-300">Économies par mois</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={sideByMonth}
                onChange={(e) => setSideByMonth(Number(e.target.value))}
                className="w-32 px-3 py-2 bg-slate-700 rounded text-white"
              />
              <span className="text-slate-300">€</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-slate-300">Économies placées</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={placedSavings}
                onChange={(e) => setPlacedSavings(Number(e.target.value))}
                className="w-32 px-3 py-2 bg-slate-700 rounded text-white"
              />
              <span className="text-slate-300">€</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Montant Restant */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4 text-white">Montant Restant</h2>
        <div className="text-2xl font-bold text-green-400">
          {getRemainingAmount().toLocaleString()} €
        </div>
      </div>
    </div>
  );
}

export default TableView; 