import React from 'react';
import { useStore } from '../store';

function Archives() {
  const { archivedMonths } = useStore();

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-white">Archives</h2>
      <div className="space-y-4">
        {archivedMonths.map((archive, index) => (
          <div key={index} className="bg-slate-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-white">{archive.month}</h3>
              <span className="text-sm text-slate-400">
                {new Date(archive.date).toLocaleDateString('fr-FR')}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-2">Dépenses</h4>
                <div className="space-y-1">
                  {Object.entries(archive.data).map(([category, amount]) => (
                    <div key={category} className="flex justify-between text-sm">
                      <span className="text-slate-300">{category}</span>
                      <span className={amount > 0 ? 'text-red-400' : 'text-green-400'}>
                        {amount.toLocaleString()} €
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-2">Revenus</h4>
                <div className="space-y-1">
                  {Object.entries(archive.incomes).map(([type, amount]) => (
                    <div key={type} className="flex justify-between text-sm">
                      <span className="text-slate-300">{type}</span>
                      <span className="text-green-400">
                        {amount.toLocaleString()} €
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Revenus totaux</span>
                <span className="text-green-400">
                  {archive.revenus.toLocaleString()} €
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Économies</span>
                <span className={archive.sideByMonth > 0 ? 'text-green-400' : 'text-red-400'}>
                  {archive.sideByMonth.toLocaleString()} €
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Archives; 