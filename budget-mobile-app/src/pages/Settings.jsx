import React from 'react';

const Settings = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Paramètres</h1>
      {/* Liste des options */}
      <ul className="divide-y divide-gray-400">
        <li className="py-4"><div className="bg-gray-300 h-4 w-1/2 rounded"></div></li>
        <li className="py-4"><div className="bg-gray-300 h-4 w-2/3 rounded"></div></li>
        <li className="py-4"><div className="bg-gray-300 h-4 w-1/3 rounded"></div></li>
        <li className="py-4"><div className="bg-gray-300 h-4 w-1/2 rounded"></div></li>
      </ul>
    </div>
  );
};

export default Settings; 