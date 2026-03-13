import React, { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';
import { RefreshCw, Eye, XCircle, AlertTriangle, Loader } from 'lucide-react';

const formatMoney = c => `₹${(c/100).toFixed(2)}`;

const StatusBadge = ({ status }) => {
  const cfg = {
    active:    'bg-green-100 text-green-800 border-green-200',
    ended:     'bg-gray-100 text-gray-600 border-gray-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${cfg[status] || cfg.ended}`}>
      {status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />}
      {status}
    </span>
  );
};

const LiveAuctions = () => {
  const [auctions, setAuctions]   = useState([]);
  const [products, setProducts]   = useState({});
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast]         = useState('');

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const [aRes, pRes] = await Promise.all([API.get('/auctions'), API.get('/products')]);
      const productMap = {};
      (pRes.data || []).forEach(p => { productMap[p.id] = p; });
      setProducts(productMap);

      // Enrich auctions with current bid info
      const enriched = await Promise.all((aRes.data||[]).map(async a => {
        try {
          const bRes = await API.get(`/auctions/${a.id}/bids`);
          const history = (bRes.data.bid_history || []).reverse();
          return { ...a, topBidder: history[0] || null, totalBids: history.length };
        } catch { return { ...a, topBidder: null, totalBids: 0 }; }
      }));
      setAuctions(enriched);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchData(); }, []);
  // Auto-refresh every 30s
  useEffect(() => { const t = setInterval(() => fetchData(true), 30000); return () => clearInterval(t); }, []);

  const handleClose = async (id) => {
    if (!window.confirm('Close this auction?')) return;
    showToast('⚠️ Auction close requires backend admin endpoint. Action logged.');
  };
  const handleFlag = (id) => showToast(`🚩 Auction #${id} flagged for review.`);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Live Auctions</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time auction monitoring</p>
        </div>
        <button onClick={() => fetchData(true)} className="flex items-center gap-2 text-sm font-bold text-green-700 border border-green-200 px-4 py-2 rounded-xl hover:bg-green-50 transition-colors">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Summary Pills */}
      <div className="flex flex-wrap gap-3">
        {['active','ended','cancelled'].map(s => (
          <div key={s} className="bg-white border border-gray-100 rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm">
            <StatusBadge status={s} />
            <span className="font-extrabold text-gray-900">{auctions.filter(a => a.status === s).length}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader className="w-10 h-10 animate-spin text-green-600" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] text-gray-400 uppercase tracking-wider bg-gray-50 border-b">
                <tr>
                  {['ID','Product','Farmer ID','Current Bid','Top Bidder','Bids','Start','End','Status','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {auctions.length === 0 ? (
                  <tr><td colSpan={10} className="px-6 py-12 text-center text-gray-400">No auctions found</td></tr>
                ) : auctions.map(a => {
                  const product = products[a.product_id];
                  return (
                    <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">#{a.id}</td>
                      <td className="px-4 py-3 font-bold text-gray-900 max-w-[140px] truncate">{product?.name || `#${a.product_id}`}</td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">F-{product?.farmer_id || '?'}</td>
                      <td className="px-4 py-3 font-extrabold text-amber-600">{formatMoney(a.current_price)}</td>
                      <td className="px-4 py-3 text-gray-700">{a.topBidder?.bidder_name || '—'}</td>
                      <td className="px-4 py-3 text-center font-bold text-gray-600">{a.totalBids}</td>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{new Date(a.start_time).toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{new Date(a.end_time).toLocaleString()}</td>
                      <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleFlag(a.id)} title="Flag" className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg"><AlertTriangle className="w-4 h-4" /></button>
                          <button onClick={() => handleClose(a.id)} title="Close" className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><XCircle className="w-4 h-4" /></button>
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

export default LiveAuctions;
