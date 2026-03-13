import React, { useState } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import DashboardOverview from '../components/admin/DashboardOverview';
import LiveAuctions from '../components/admin/LiveAuctions';
import UsersManagement from '../components/admin/UsersManagement';
import ProductsManagement from '../components/admin/ProductsManagement';
import AuctionHistory from '../components/admin/AuctionHistory';
import BidLogs from '../components/admin/BidLogs';
import Disputes from '../components/admin/Disputes';
import { Menu, Bell, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Settings = () => (
  <div className="space-y-6">
    <div><h1 className="text-2xl font-extrabold text-gray-900">Settings</h1><p className="text-gray-500 text-sm mt-1">Platform configuration and preferences</p></div>
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-xl">
      <h3 className="font-bold text-gray-900 mb-4">Platform Settings</h3>
      <div className="space-y-4">
        {[['Platform Name', 'Farm2Home'], ['Backend URL', 'http://localhost:5000'], ['Auction Minimum Increment', '₹100'], ['Default Auction Duration', '24 hours']].map(([label, val]) => (
          <div key={label} className="flex justify-between items-center py-3 border-b border-gray-50">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <span className="text-sm font-bold text-gray-500 bg-gray-50 px-3 py-1 rounded-lg">{val}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-6">Settings management requires backend configuration endpoint.</p>
    </div>
  </div>
);

const sectionMap = {
  overview:  DashboardOverview,
  live:      LiveAuctions,
  farmers:   () => <UsersManagement defaultTab="farmers" />,
  buyers:    () => <UsersManagement defaultTab="buyers" />,
  products:  ProductsManagement,
  history:   AuctionHistory,
  bids:      BidLogs,
  disputes:  Disputes,
  settings:  Settings,
};

const AdminDashboard = () => {
  const [section, setSection]      = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const SectionComponent = sectionMap[section] || DashboardOverview;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar
        activeSection={section}
        onNavigate={setSection}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 px-6 h-16 flex items-center justify-between flex-shrink-0 shadow-sm">
          <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-700" />
            <span className="font-bold text-gray-900 text-sm capitalize">
              {section === 'overview' ? 'Dashboard' : section.replace('_', ' ')}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 text-sm bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
              <div className="w-6 h-6 rounded-full bg-green-700 text-white text-[10px] font-black flex items-center justify-center uppercase">
                {(user?.name || 'A').substring(0, 1)}
              </div>
              <span className="font-semibold text-green-900">{user?.name || 'Admin'}</span>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <SectionComponent onNavigate={setSection} />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
