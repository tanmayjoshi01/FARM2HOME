import React, { useState, useEffect } from 'react';
import API from '../services/api';
import AdminTable from '../components/AdminTable';
import { ShieldCheck, Users, Package, TrendingUp, AlertTriangle } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [data, setData] = useState({ users: [], products: [], auctions: [] });
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  const showMessage = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(''), 3000);
  };

  useEffect(() => {
    // The backend does not have an explicit `GET /users` endpoint visible without extra logic, 
    // but we simulate it by catching errors or replacing with mock data if it fails.
    // We do have /products and /auctions from before.
    const fetchAdminData = async () => {
      try {
        const [productsRes, auctionsRes] = await Promise.all([
          API.get('/products').catch(() => ({ data: [] })),
          API.get('/auctions').catch(() => ({ data: [] }))
        ]);

        setData({
          users: [
            { id: 1, name: 'Paras Farmer', email: 'paras@farmer.com', role: 'farmer', status: 'active' },
            { id: 2, name: 'Paras Buyer', email: 'paras@buyer.com', role: 'buyer', status: 'active' },
            { id: 3, name: 'System Admin', email: 'admin@farm.com', role: 'admin', status: 'active' },
          ], // Fallback mock users since no explicit endpoint exists in backend router
          products: productsRes.data || [],
          auctions: auctionsRes.data || []
        });
      } catch (err) {
        console.error("Failed to fetch admin dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdminData();
  }, []);

  // Handlers for simulated actions
  const handleDeleteUser = (id) => {
    setData(prev => ({ ...prev, users: prev.users.filter(u => u.id !== id) }));
    showMessage(`User ${id} deleted.`);
  };

  const handleFreezeUser = (user) => {
    setData(prev => ({ 
      ...prev, 
      users: prev.users.map(u => u.id === user.id ? { ...u, status: u.status === 'active' ? 'frozen' : 'active' } : u) 
    }));
    showMessage(`User ${user.id} status changed.`);
  };

  const handleDeleteProduct = (id) => {
    // Simulated as per your instructions since backend doesn't have it
    setData(prev => ({ ...prev, products: prev.products.filter(p => p.id !== id) }));
    showMessage(`Product ${id} deleted.`);
  };

  const handleCloseAuction = (auction) => {
    setData(prev => ({ 
      ...prev, 
      auctions: prev.auctions.map(a => a.id === auction.id ? { ...a, status: 'ended' } : a) 
    }));
    showMessage(`Auction ${auction.id} closed manually.`);
  };

  if (loading) {
    return <div className="min-h-screen pt-20 flex justify-center text-gray-500 animate-pulse">Loading Admin Data...</div>;
  }

  // Column Definitions
  const userColumns = [
    { label: 'ID', key: 'id', render: (row) => <span className="font-mono text-xs text-gray-500">#{row.id}</span> },
    { label: 'Name', key: 'name', render: (row) => <span className="font-bold text-gray-900">{row.name}</span> },
    { label: 'Email', key: 'email' },
    { label: 'Role', key: 'role', render: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
          row.role === 'admin' ? 'bg-purple-100 text-purple-700' :
          row.role === 'farmer' ? 'bg-green-100 text-green-700' :
          'bg-blue-100 text-blue-700'
        }`}>
          {row.role}
        </span>
      ) 
    },
    { label: 'Status', key: 'status', render: (row) => (
        <span className={`px-2 py-1 flex items-center gap-1 w-max rounded-full text-[10px] font-bold uppercase ${
          row.status === 'active' ? 'text-green-600 bg-green-50 border border-green-200' : 'text-red-600 bg-red-50 border border-red-200'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${row.status === 'active' ? 'bg-green-600' : 'bg-red-600'}`}></div>
          {row.status}
        </span>
      ) 
    }
  ];

  const productColumns = [
    { label: 'ID', key: 'id', render: (row) => <span className="font-mono text-xs text-gray-500">#{row.id}</span> },
    { label: 'Farmer ID', key: 'farmer_id' },
    { label: 'Product Name', key: 'name', render: (row) => <span className="font-bold text-gray-900">{row.name}</span> },
    { label: 'Price', key: 'price_cents', render: (row) => `$${(row.price_cents / 100).toFixed(2)}` },
    { label: 'Stock', key: 'stock' }
  ];

  const auctionColumns = [
    { label: 'Auction ID', key: 'id', render: (row) => <span className="font-mono text-xs text-gray-500">#{row.id}</span> },
    { label: 'Product ID', key: 'product_id' },
    { label: 'Current Bid', key: 'current_price', render: (row) => <span className="font-bold text-[#f57f17]">${(row.current_price / 100).toFixed(2)}</span> },
    { label: 'Status', key: 'status', render: (row) => (
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
          {row.status}
        </span>
      ) 
    }
  ];

  const tabs = [
    { id: 'users', label: 'Manage Users', icon: <Users className="w-4 h-4" /> },
    { id: 'products', label: 'Manage Products', icon: <Package className="w-4 h-4" /> },
    { id: 'auctions', label: 'Live Auctions', icon: <TrendingUp className="w-4 h-4" /> }
  ];

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)]">
      {/* Admin Header */}
      <div className="bg-[#111827] text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8 shadow-inner">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">System Administrator</h1>
              <p className="text-gray-400 mt-1">Full access to manage the Farm2Home platform.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-20">
        
        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex gap-2 mb-8 w-max">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-purple-50 text-purple-700 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Table Rendering */}
        <div className="animate-in fade-in duration-300">
          {activeTab === 'users' && (
            <AdminTable 
              title="Registered Accounts"
              columns={userColumns}
              data={data.users}
              onDelete={handleDeleteUser}
              onAction={handleFreezeUser}
              actionLabel="Freeze/Unfreeze Account"
              actionIcon={<AlertTriangle className="w-4 h-4" />}
            />
          )}

          {activeTab === 'products' && (
            <AdminTable 
              title="Marketplace Listings"
              columns={productColumns}
              data={data.products}
              onDelete={handleDeleteProduct}
            />
          )}

          {activeTab === 'auctions' && (
            <AdminTable 
              title="Platform Auctions"
              columns={auctionColumns}
              data={data.auctions}
              onDelete={(id) => showMessage("Deleting auctions is disabled. Close them instead.")}
              onAction={handleCloseAuction}
              actionLabel="Force Close Auction"
              actionIcon={<ShieldCheck className="w-4 h-4" />}
              actionColor="red"
            />
          )}
        </div>
      </div>
      
      {/* Global Admin Toast */}
      {actionMessage && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl font-bold flex items-center gap-3 animate-in slide-in-from-bottom-5 z-50 border-l-4 border-purple-500">
          <ShieldCheck className="w-5 h-5 text-purple-400" />
          {actionMessage}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
