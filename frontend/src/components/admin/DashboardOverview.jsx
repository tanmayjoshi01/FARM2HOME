import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Users, Package, Gavel, TrendingUp, ShoppingBag, FileText, Clock, Loader } from 'lucide-react';

const StatCard = ({ label, value, icon, color, loading }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">{label}</p>
      {loading
        ? <div className="h-8 w-16 bg-gray-100 animate-pulse rounded mt-1" />
        : <p className="text-3xl font-extrabold text-gray-900">{value}</p>}
    </div>
  </div>
);

const DashboardOverview = ({ onNavigate }) => {
  const [stats, setStats] = useState({});
  const [recentBids, setRecentBids]       = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [endingSoon, setEndingSoon]       = useState([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [uRes, pRes, aRes] = await Promise.all([
          API.get('/auth/users').catch(() => ({ data: [] })),
          API.get('/products'),
          API.get('/auctions'),
        ]);

        const users     = uRes.data || [];
        const products  = pRes.data || [];
        const auctions  = aRes.data || [];

        const farmers   = users.filter(u => u.role === 'farmer');
        const buyers    = users.filter(u => u.role === 'buyer');
        const active    = auctions.filter(a => a.status === 'active');
        const ended     = auctions.filter(a => a.status !== 'active');

        // Gather recent bids — sample from active auctions
        let bids = [];
        for (const a of active.slice(0, 3)) {
          try {
            const bRes = await API.get(`/auctions/${a.id}/bids`);
            const history = bRes.data.bid_history || [];
            const product = products.find(p => p.id === a.product_id);
            bids.push(...history.slice(-2).map(b => ({ ...b, productName: product?.name || `#${a.product_id}`, auctionId: a.id })));
          } catch { /* skip */ }
        }

        setStats({
          farmers: farmers.length,
          buyers: buyers.length,
          products: products.length,
          activeAuctions: active.length,
          completedAuctions: ended.length,
          totalBids: bids.length,
        });

        setRecentBids([...bids].reverse().slice(0, 5));
        setRecentProducts(products.slice(0, 5));
        setEndingSoon(
          active
            .filter(a => new Date(a.end_time) - new Date() < 3 * 3600 * 1000)
            .slice(0, 5)
            .map(a => ({ ...a, productName: products.find(p => p.id === a.product_id)?.name || `#${a.product_id}` }))
        );
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const statCards = [
    { label: 'Total Farmers',   value: stats.farmers,           icon: <Users className="w-7 h-7 text-green-700" />,   color: 'bg-green-100' },
    { label: 'Total Buyers',    value: stats.buyers,            icon: <ShoppingBag className="w-7 h-7 text-blue-700" />,  color: 'bg-blue-100' },
    { label: 'Total Products',  value: stats.products,          icon: <Package className="w-7 h-7 text-purple-700" />, color: 'bg-purple-100' },
    { label: 'Active Auctions', value: stats.activeAuctions,    icon: <Gavel className="w-7 h-7 text-amber-700" />,   color: 'bg-amber-100' },
    { label: 'Completed',       value: stats.completedAuctions, icon: <TrendingUp className="w-7 h-7 text-teal-700" />, color: 'bg-teal-100' },
    { label: 'Total Bids',      value: stats.totalBids,         icon: <FileText className="w-7 h-7 text-red-700" />,   color: 'bg-red-100' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Real-time platform statistics</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map(s => (
          <StatCard key={s.label} {...s} loading={loading} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bids */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center px-6 pt-5 pb-3 border-b border-gray-50">
            <h3 className="font-bold text-gray-900">Recent Bids</h3>
            <button onClick={() => onNavigate('bids')} className="text-xs text-green-700 font-bold hover:underline">View all →</button>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          ) : recentBids.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">No recent bids</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentBids.map((bid, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center uppercase">{(bid.bidder_name||'?').substring(0,2)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{bid.bidder_name}</p>
                    <p className="text-xs text-gray-500 truncate">on {bid.productName}</p>
                  </div>
                  <span className="font-extrabold text-amber-600 text-sm">₹${(bid.bid_amount/100).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ending Soon */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center px-6 pt-5 pb-3 border-b border-gray-50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2"><Clock className="w-4 h-4 text-red-500" />Ending Soon</h3>
            <button onClick={() => onNavigate('live')} className="text-xs text-green-700 font-bold hover:underline">View →</button>
          </div>
          {loading ? (
            <div className="p-4 space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          ) : endingSoon.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">None ending soon</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {endingSoon.map(a => {
                const msleft = new Date(a.end_time) - new Date();
                const mins = Math.floor(msleft/60000);
                return (
                  <div key={a.id} className="px-6 py-3">
                    <p className="text-sm font-semibold text-gray-900 truncate">{a.productName}</p>
                    <div className="flex justify-between mt-0.5">
                      <span className="text-xs text-red-500 font-bold">{mins}m left</span>
                      <span className="text-xs text-amber-600 font-bold">₹${(a.current_price/100).toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center px-6 pt-5 pb-3 border-b border-gray-50">
          <h3 className="font-bold text-gray-900">Recently Listed Products</h3>
          <button onClick={() => onNavigate('products')} className="text-xs text-green-700 font-bold hover:underline">Manage →</button>
        </div>
        {loading ? (
          <div className="p-4 grid grid-cols-2 md:grid-cols-5 gap-3">{[...Array(5)].map((_,i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : (
          <div className="p-4 grid grid-cols-2 md:grid-cols-5 gap-3">
            {recentProducts.map(p => (
              <div key={p.id} className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                <img src={`https://picsum.photos/seed/${p.id+50}/40/40`} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-green-700 font-semibold">₹${(p.price_cents/100).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;
