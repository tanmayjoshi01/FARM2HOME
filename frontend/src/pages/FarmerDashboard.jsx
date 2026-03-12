import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import CreateProductForm from '../components/CreateProductForm';
import StartAuctionForm from '../components/StartAuctionForm';
import DashboardStats from '../components/DashboardStats';
import { Package, TrendingUp, LayoutDashboard, Trash2, Gavel } from 'lucide-react';

const formatMoney = (cents) => `$${(cents / 100).toFixed(2)}`;

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [myProducts, setMyProducts] = useState([]);
  const [myAuctions, setMyAuctions] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingAuctions, setLoadingAuctions] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const showMessage = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(''), 3000);
  };

  const fetchMyProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await API.get('/products');
      const farmerProducts = res.data.filter(p => p.farmer_id === user.id);
      setMyProducts(farmerProducts);
    } catch (e) { console.error(e); }
    finally { setLoadingProducts(false); }
  };

  const fetchMyAuctions = async () => {
    setLoadingAuctions(true);
    try {
      const [auctionsRes, productsRes] = await Promise.all([
        API.get('/auctions'),
        API.get('/products'),
      ]);
      const myProductIds = productsRes.data
        .filter(p => p.farmer_id === user.id)
        .map(p => p.id);
      const farmerAuctions = auctionsRes.data.filter(a => myProductIds.includes(a.product_id));
      // Enrich with product name
      const enriched = farmerAuctions.map(a => ({
        ...a,
        productName: productsRes.data.find(p => p.id === a.product_id)?.name || `Product #${a.product_id}`
      }));
      setMyAuctions(enriched);
    } catch (e) { console.error(e); }
    finally { setLoadingAuctions(false); }
  };

  useEffect(() => {
    if (activeTab === 'products') fetchMyProducts();
    if (activeTab === 'auctions') fetchMyAuctions();
  }, [activeTab, refreshTrigger]);

  const handleDataChange = () => setRefreshTrigger(prev => prev + 1);

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await API.delete(`/products/${productId}`);
      setMyProducts(prev => prev.filter(p => p.id !== productId));
      showMessage('Product deleted.');
    } catch (e) {
      showMessage('Failed to delete product.');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'products', label: 'My Products', icon: <Package className="w-4 h-4" /> },
    { id: 'auctions', label: 'My Auctions', icon: <Gavel className="w-4 h-4" /> },
  ];

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)]">
      {/* Farmer Header */}
      <div className="bg-green-800 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Farmer Dashboard</h1>
            <p className="text-green-200 mt-1">Welcome, {user?.name}. Manage your harvest and sales.</p>
          </div>
          <div className="hidden sm:flex gap-3">
            <button onClick={() => setActiveTab('products')} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold py-2 px-5 rounded-xl transition-colors">
              + Add Product
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 w-max">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all text-sm ${
                activeTab === tab.id
                  ? 'bg-green-700 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <DashboardStats key={refreshTrigger} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <CreateProductForm onProductCreated={handleDataChange} />
              <StartAuctionForm refreshTrigger={refreshTrigger} onAuctionSuccess={handleDataChange} />
            </div>
          </div>
        )}

        {/* My Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">My Listed Products</h2>
              <span className="text-sm text-gray-500">{myProducts.length} products</span>
            </div>
            {loadingProducts ? (
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
              </div>
            ) : myProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="text-4xl mb-4">📦</div>
                <p className="text-gray-500 mb-6">You have no products listed yet.</p>
                <button onClick={() => setActiveTab('overview')} className="bg-green-700 text-white font-bold py-2 px-6 rounded-xl hover:bg-green-800 transition-colors">
                  Create Your First Product
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="text-[10px] text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left">Product</th>
                      <th className="px-6 py-4 text-left">Price</th>
                      <th className="px-6 py-4 text-left">Stock</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myProducts.map(p => (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{p.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">{p.description || '—'}</div>
                        </td>
                        <td className="px-6 py-4 font-bold text-green-700">{formatMoney(p.price_cents)}</td>
                        <td className="px-6 py-4 text-gray-700">{p.stock ?? '—'}</td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                          <button
                            onClick={() => { setActiveTab('overview'); }}
                            title="Start Auction"
                            className="text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 p-2 rounded-lg transition-colors"
                          >
                            <Gavel className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            title="Delete"
                            className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* My Auctions Tab */}
        {activeTab === 'auctions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">My Auctions</h2>
            </div>
            {loadingAuctions ? (
              <div className="animate-pulse space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
              </div>
            ) : myAuctions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="text-4xl mb-4">🔨</div>
                <p className="text-gray-500 mb-6">No auctions yet. Start one from your products!</p>
                <button onClick={() => setActiveTab('overview')} className="bg-green-700 text-white font-bold py-2 px-6 rounded-xl hover:bg-green-800 transition-colors">
                  Start an Auction
                </button>
              </div>
            ) : (
              <>
                {/* Active Auctions */}
                {myAuctions.filter(a => a.status === 'active').length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-green-700 uppercase tracking-widest mb-3">Active Auctions</h3>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="text-[10px] text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="px-6 py-4 text-left">Product</th>
                            <th className="px-6 py-4 text-left">Current Bid</th>
                            <th className="px-6 py-4 text-left">Ends</th>
                            <th className="px-6 py-4 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {myAuctions.filter(a => a.status === 'active').map(a => (
                            <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                              <td className="px-6 py-4 font-bold text-gray-900">{a.productName}</td>
                              <td className="px-6 py-4 font-extrabold text-amber-600">{formatMoney(a.current_price)}</td>
                              <td className="px-6 py-4 text-gray-500 text-xs">{new Date(a.end_time).toLocaleString()}</td>
                              <td className="px-6 py-4 text-center">
                                <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-800 border border-green-200">ACTIVE</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Ended Auctions */}
                {myAuctions.filter(a => a.status !== 'active').length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Ended Auctions</h3>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="text-[10px] text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="px-6 py-4 text-left">Product</th>
                            <th className="px-6 py-4 text-left">Final Bid</th>
                            <th className="px-6 py-4 text-left">Ended At</th>
                            <th className="px-6 py-4 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {myAuctions.filter(a => a.status !== 'active').map(a => (
                            <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                              <td className="px-6 py-4 font-bold text-gray-900">{a.productName}</td>
                              <td className="px-6 py-4 font-extrabold text-gray-500">{formatMoney(a.current_price)}</td>
                              <td className="px-6 py-4 text-gray-500 text-xs">{new Date(a.end_time).toLocaleString()}</td>
                              <td className="px-6 py-4 text-center">
                                <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200 uppercase">{a.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Action Toast */}
      {actionMessage && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl font-bold z-50">
          {actionMessage}
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;
