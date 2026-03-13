import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Search, Trash2, Flag, Loader, Package } from 'lucide-react';

const formatMoney = c => `₹${(c/100).toFixed(2)}`;

const ProductsManagement = () => {
  const [products, setProducts]   = useState([]);
  const [auctions, setAuctions]   = useState([]);
  const [users, setUsers]         = useState({});
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [flagged, setFlagged]     = useState({});
  const [toast, setToast]         = useState('');

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [pRes, aRes, uRes] = await Promise.all([
          API.get('/products'),
          API.get('/auctions'),
          API.get('/auth/users').catch(() => ({ data: [] })),
        ]);
        const userMap = {};
        (uRes.data||[]).forEach(u => { userMap[u.id] = u; });
        setProducts(pRes.data || []);
        setAuctions(aRes.data || []);
        setUsers(userMap);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove product "${name}"?`)) return;
    try {
      await API.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast(`🗑️ "${name}" removed.`);
    } catch { showToast('Failed to delete product.'); }
  };

  const handleFlag = (id, name) => {
    setFlagged(prev => ({ ...prev, [id]: !prev[id] }));
    showToast(flagged[id] ? `✅ Unflagged "${name}"` : `🚩 Flagged "${name}" for review`);
  };

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div><h1 className="text-2xl font-extrabold text-gray-900">Product Management</h1><p className="text-gray-500 text-sm mt-1">All products listed on the platform</p></div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 bg-white w-60" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader className="w-10 h-10 animate-spin text-green-600" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] text-gray-400 uppercase tracking-wider bg-gray-50 border-b">
                <tr>{['ID','Product Name','Farmer','Price','Stock','Auction Status','Listed','Actions'].map(h => <th key={h} className="px-5 py-3 text-left whitespace-nowrap">{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8}>
                    <div className="py-14 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="font-bold text-gray-900">{search ? 'No products match your search' : 'No products listed yet'}</p>
                      {!search && <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">A farmer must log in and create products first.<br/>Login as <span className="font-mono font-bold">farmer@test.com</span> to add some.</p>}
                    </div>
                  </td></tr>
                ) : filtered.map(p => {
                  const activeAuction = auctions.find(a => a.product_id === p.id && a.status === 'active');
                  const farmer = users[p.farmer_id];
                  const isFlagged = flagged[p.id];
                  return (
                    <tr key={p.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${isFlagged ? 'bg-red-50/30' : ''}`}>
                      <td className="px-5 py-3 font-mono text-xs text-gray-500">#{p.id}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img src={`https://picsum.photos/seed/${p.id+50}/40/40`} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                          <div>
                            <p className="font-bold text-gray-900">{p.name}</p>
                            {isFlagged && <span className="text-[10px] text-red-600 font-bold">⚑ Flagged</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-600 text-xs">{farmer?.name || `#${p.farmer_id}`}</td>
                      <td className="px-5 py-3 font-bold text-green-700">{formatMoney(p.price_cents)}</td>
                      <td className="px-5 py-3 font-semibold text-gray-700">{p.stock}</td>
                      <td className="px-5 py-3">
                        {activeAuction
                          ? <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />Live Auction</span>
                          : <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200">Direct Buy</span>}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">{new Date(p.created_at).toLocaleDateString()}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleFlag(p.id, p.name)} title="Flag" className={`p-1.5 rounded-lg transition-colors ${isFlagged ? 'text-red-600 bg-red-100' : 'text-amber-500 hover:bg-amber-50'}`}><Flag className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(p.id, p.name)} title="Delete" className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {toast && <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl font-bold z-50">{toast}</div>}
    </div>
  );
};

export default ProductsManagement;
