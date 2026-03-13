import React from 'react';
import {
  LayoutDashboard, Gavel, Users, Package,
  History, FileText, AlertTriangle, Settings,
  ChevronRight, Leaf, X
} from 'lucide-react';

const navItems = [
  { id: 'overview',  label: 'Dashboard',       icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'live',      label: 'Live Auctions',    icon: <Gavel className="w-5 h-5" /> },
  { id: 'farmers',   label: 'Farmers',          icon: <Users className="w-5 h-5" />, parent: 'Users' },
  { id: 'buyers',    label: 'Buyers',           icon: <Users className="w-5 h-5" />, parent: 'Users' },
  { id: 'products',  label: 'Products',         icon: <Package className="w-5 h-5" /> },
  { id: 'history',   label: 'Auction History',  icon: <History className="w-5 h-5" /> },
  { id: 'bids',      label: 'Bid Logs',         icon: <FileText className="w-5 h-5" /> },
  { id: 'disputes',  label: 'Disputes',         icon: <AlertTriangle className="w-5 h-5" /> },
  { id: 'settings',  label: 'Settings',         icon: <Settings className="w-5 h-5" /> },
];

const AdminSidebar = ({ activeSection, onNavigate, mobileOpen, onClose }) => {
  const grouped = [
    { label: null,    items: navItems.filter(n => !n.parent && n.id !== 'settings') },
    { label: 'Users', items: navItems.filter(n => n.parent === 'Users') },
    { label: null,    items: navItems.filter(n => n.id === 'settings') },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-green-700/30">
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-extrabold text-lg text-white tracking-tight leading-none">Farm2Home</span>
          <span className="block text-green-300 text-[11px] font-medium">Admin Panel</span>
        </div>
        {mobileOpen && (
          <button onClick={onClose} className="ml-auto text-green-300 hover:text-white md:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {grouped.map((group, gi) => (
          <div key={gi} className="mb-2">
            {group.label && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-green-400/60 px-5 mb-1 mt-3">
                {group.label}
              </p>
            )}
            {group.items.map(item => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); onClose?.(); }}
                  className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm font-semibold transition-all rounded-lg mx-0 my-0.5 ${
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-green-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-green-400'}>{item.icon}</span>
                  {item.label}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto text-white/60" />}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-green-700/30 px-5 py-4">
        <p className="text-[11px] text-green-400/70">Farm2Home Admin v1.0</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 flex-shrink-0 bg-green-900 flex-col h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-green-900 flex flex-col h-full shadow-2xl">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/50" onClick={onClose} />
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
