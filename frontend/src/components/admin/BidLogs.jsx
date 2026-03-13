import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Loader } from 'lucide-react';

const formatMoney = c => `₹${(c/100).toFixed(2)}`;

const BidLogs = () => {
  const [bids, setBids]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [aRes, pRes] = await Promise.all([API.get('/auctions'), API.get('/products')]);
        const productMap = {};
        (pRes.data||[]).forEach(p => { productMap[p.id] = p; });

        const allBids = [];
        for (const a of aRes.data||[]) {
          try {
            const bRes = await API.get(`/auctions/${a.id}/bids`);
            const product = productMap[a.product_id];
            (bRes.data.bid_history||[]).forEach(b => {
              allBids.push({ ...b, auctionId: a.id, productName: product?.name || `#${a.product_id}` });
            });
          } catch { /* skip */ }
        }
        // Sort newest first
        allBids.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setBids(allBids.slice(0, 100));
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Bid Logs</h1>
        <p className="text-gray-500 text-sm mt-1">Complete transparency log of all platform bids</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader className="w-10 h-10 animate-spin text-green-600" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] text-gray-400 uppercase tracking-wider bg-gray-50 border-b">
                <tr>{['Bid ID','Auction ID','Product','Buyer','Bid Amount','Timestamp'].map(h => <th key={h} className="px-5 py-3 text-left whitespace-nowrap">{h}</th>)}</tr>
              </thead>
              <tbody>
                {bids.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No bids recorded yet</td></tr>
                ) : bids.map(bid => (
                  <tr key={bid.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-gray-500">#{bid.id}</td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-500">#{bid.auctionId}</td>
                    <td className="px-5 py-3 font-semibold text-gray-900 max-w-[150px] truncate">{bid.productName}</td>
                    <td className="px-5 py-3 text-gray-700">{bid.bidder_name}</td>
                    <td className="px-5 py-3 font-extrabold text-amber-600">{formatMoney(bid.bid_amount)}</td>
                    <td className="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">{new Date(bid.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
            Showing latest {bids.length} bids across all auctions
          </div>
        </div>
      )}
    </div>
  );
};

export default BidLogs;
