import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Loader, Download } from 'lucide-react';

const formatMoney = c => `₹${(c/100).toFixed(2)}`;

const AuctionHistory = () => {
  const [auctions, setAuctions] = useState([]);
  const [products, setProducts] = useState({});
  const [users, setUsers]       = useState({});
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [aRes, pRes, uRes] = await Promise.all([
          API.get('/auctions'),
          API.get('/products'),
          API.get('/auth/users').catch(() => ({ data: [] })),
        ]);
        const productMap = {};
        (pRes.data||[]).forEach(p => { productMap[p.id] = p; });
        const userMap = {};
        (uRes.data||[]).forEach(u => { userMap[u.id] = u; });

        // Enrich ended auctions with bid info
        const ended = (aRes.data||[]).filter(a => a.status !== 'active');
        const enriched = await Promise.all(ended.map(async a => {
          try {
            const bRes = await API.get(`/auctions/${a.id}/bids`);
            const history = (bRes.data.bid_history||[]).reverse();
            return { ...a, winner: history[0] || null, totalBids: history.length };
          } catch { return { ...a, winner: null, totalBids: 0 }; }
        }));
        setAuctions(enriched);
        setProducts(productMap);
        setUsers(userMap);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div><h1 className="text-2xl font-extrabold text-gray-900">Auction History</h1><p className="text-gray-500 text-sm mt-1">All completed and cancelled auctions</p></div>
        <button className="flex items-center gap-2 text-sm font-bold text-green-700 border border-green-200 px-4 py-2 rounded-xl hover:bg-green-50">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader className="w-10 h-10 animate-spin text-green-600" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] text-gray-400 uppercase tracking-wider bg-gray-50 border-b">
                <tr>{['Auction ID','Product','Farmer','Winner','Final Bid','Total Bids','End Time','Status'].map(h => <th key={h} className="px-5 py-3 text-left whitespace-nowrap">{h}</th>)}</tr>
              </thead>
              <tbody>
                {auctions.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">No completed auctions yet</td></tr>
                ) : auctions.map(a => {
                  const product = products[a.product_id];
                  const farmer  = users[product?.farmer_id];
                  return (
                    <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-5 py-3 font-mono text-xs text-gray-500">#{a.id}</td>
                      <td className="px-5 py-3 font-bold text-gray-900 max-w-[140px] truncate">{product?.name || `#${a.product_id}`}</td>
                      <td className="px-5 py-3 text-gray-600 text-xs">{farmer?.name || `#${product?.farmer_id}`}</td>
                      <td className="px-5 py-3 text-gray-700">{a.winner?.bidder_name || '—'}</td>
                      <td className="px-5 py-3 font-extrabold text-amber-600">{formatMoney(a.current_price)}</td>
                      <td className="px-5 py-3 text-center font-bold text-gray-600">{a.totalBids}</td>
                      <td className="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">{new Date(a.end_time).toLocaleString()}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${a.status === 'ended' ? 'bg-gray-100 text-gray-600 border-gray-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionHistory;
