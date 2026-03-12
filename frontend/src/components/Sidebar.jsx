import React from 'react';
import { Home, Package, TrendingUp, Settings } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5 mr-3" /> },
    { id: 'products', label: 'Products', icon: <Package className="w-5 h-5 mr-3" /> },
    { id: 'auctions', label: 'Auctions', icon: <TrendingUp className="w-5 h-5 mr-3" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5 mr-3" /> },
  ];

  return (
    <div className="w-64 bg-[#111827] text-gray-300 min-h-screen py-6 flex flex-col pt-16 mt-[-64px]">
      <div className="px-6 mb-8 flex items-center gap-3">
        {/* Placeholder for optional Farmer Logo inside sidebar */}
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
              activeTab === item.id 
                ? 'bg-green-700 text-white shadow-lg font-medium' 
                : 'hover:bg-gray-800 hover:text-white'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
      
      <div className="px-6 py-4 border-t border-gray-800 text-xs text-gray-500 text-center">
        Powered by Farm2Home
      </div>
    </div>
  );
};

export default Sidebar;
