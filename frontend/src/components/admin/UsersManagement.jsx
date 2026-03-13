import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Search, UserCheck, UserX, Loader } from 'lucide-react';

const RoleBadge = ({ role }) => (
  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
    role === 'farmer' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-blue-100 text-blue-800 border-blue-200'
  }`}>{role}</span>
);

const UsersManagement = ({ defaultTab = 'farmers' }) => {
  const [tab, setTab]         = useState(defaultTab);
  const [users, setUsers]     = useState([]);
  const [products, setProducts] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [suspended, setSuspended] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [toast, setToast]     = useState('');

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [uRes, pRes, aRes] = await Promise.all([
          API.get('/auth/users').catch(() => ({ data: [] })),
          API.get('/products'),
          API.get('/auctions'),
        ]);
        setUsers(uRes.data || []);
        setProducts(pRes.data || []);
        setAuctions(aRes.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const filtered = users
    .filter(u => u.role === (tab === 'farmers' ? 'farmer' : 'buyer'))
    .filter(u => !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  const toggleSuspend = (userId, name) => {
    setSuspended(prev => {
      const next = { ...prev, [userId]: !prev[userId] };
      showToast(next[userId] ? `🚫 ${name} suspended` : `✅ ${name} activated`);
      return next;
    });
  };

  const cols = {
    farmers: ['ID','Name','Email','Products','Auctions','Joined','Status','Actions'],
    buyers:  ['ID','Name','Email','Bids','Auctions','Joined','Status','Actions'],
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-extrabold text-gray-900">Users Management</h1><p className="text-gray-500 text-sm mt-1">Manage farmers and buyers on the platform</p></div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-2 bg-white border border-gray-200 rounded-xl p-1 w-max">
          {['farmers','buyers'].map(t => (
            <button key={t} onClick={() => { setTab(t); setSearch(''); }}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all capitalize ${tab === t ? 'bg-green-700 text-white shadow' : 'text-gray-500 hover:text-gray-900'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email..."
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white w-64" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader className="w-10 h-10 animate-spin text-green-600" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] text-gray-400 uppercase tracking-wider bg-gray-50 border-b">
                <tr>{cols[tab].map(h => <th key={h} className="px-5 py-3 text-left whitespace-nowrap">{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">No {tab} found</td></tr>
                ) : filtered.map(u => {
                  const isSuspended = suspended[u.id];
                  const userProducts  = products.filter(p => p.farmer_id === u.id);
                  const userAuctions  = auctions.filter(a => userProducts.some(p => p.id === a.product_id));
                  const joined = new Date(u.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });

                  return (
                    <tr key={u.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${isSuspended ? 'opacity-50' : ''}`}>
                      <td className="px-5 py-3 font-mono text-xs text-gray-500">#{u.id}</td>
                      <td className="px-5 py-3 font-bold text-gray-900">{u.name}</td>
                      <td className="px-5 py-3 text-gray-600 text-xs">{u.email}</td>
                      {tab === 'farmers' ? (
                        <>
                          <td className="px-5 py-3 text-center font-bold text-gray-700">{userProducts.length}</td>
                          <td className="px-5 py-3 text-center font-bold text-gray-700">{userAuctions.length}</td>
                        </>
                      ) : (
                        <>
                          <td className="px-5 py-3 text-center font-bold text-gray-700">—</td>
                          <td className="px-5 py-3 text-center font-bold text-gray-700">—</td>
                        </>
                      )}
                      <td className="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">{joined}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${isSuspended ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-800 border-green-200'}`}>
                          {isSuspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <button onClick={() => toggleSuspend(u.id, u.name)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${isSuspended ? 'text-green-700 bg-green-50 hover:bg-green-100' : 'text-red-600 bg-red-50 hover:bg-red-100'}`}>
                          {isSuspended ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                          {isSuspended ? 'Activate' : 'Suspend'}
                        </button>
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

export default UsersManagement;
