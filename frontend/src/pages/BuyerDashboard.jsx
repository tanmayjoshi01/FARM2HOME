import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import AuctionCard from '../components/AuctionCard';
import { ShoppingBag, TrendingUp, Package, Clock, Gavel, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const formatMoney = (cents) => `$${(cents / 100).toFixed(2)}`;

const BuyerDashboard = () => {
  const { user } = useAuth();
  const { cartCount, cartTotal } = useCart();
  const [activeTab, setActiveTab] = useState('overview');
  const [auctions, setAuctions] = useState([]);
  const [products, setProducts] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBids, setLoadingBids] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aRes, pRes] = await Promise.all([API.get('/auctions'), API.get('/products')]);
        setAuctions(aRes.data.filter(a => a.status === 'active'));
        setProducts(pRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch my bids when tab is selected
  useEffect(() => {
    if (activeTab !== 'bids') return;
    const fetchMyBids = async () => {
      setLoadingBids(true);
      try {
        const aRes = await API.get('/auctions');
        const allAuctions = aRes.data;
        const foundBids = [];

        for (const auction of allAuctions) {
          try {
            const bRes = await API.get(`/auctions/${auction.id}/bids`);
            const history = bRes.data.bid_history || [];
            const myBid = [...history].reverse().find(b => b.bidder_name === user?.name);
            if (myBid) {
              const product = products.find(p => p.id === auction.product_id);
              foundBids.push({
                auction,
                product,
                myBidAmount: myBid.bid_amount,
                isLeading: myBid.bid_amount === auction.current_price,
              });
            }
          } catch { /* skip */ }
        }
        setMyBids(foundBids);
      } catch (e) { console.error(e); }
      finally { setLoadingBids(false); }
    };
    fetchMyBids();
  }, [activeTab, user, products]);

  const getProductName = (productId) => products.find(p => p.id === productId)?.name || `Product #${productId}`;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'bids', label: 'My Bids', icon: <Gavel className="w-4 h-4" /> },
  ];

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Buyer Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome, {user?.name}. Track your bids and cart.</p>
          </div>
          <Link to="/products" className="hidden sm:block bg-green-700 hover:bg-green-800 text-white font-bold py-2.5 px-6 rounded-xl transition-colors">
            Browse Products
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 w-max">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id ? 'bg-green-700 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Overview Tab ─── */}
        {activeTab === 'overview' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {[
                { icon: <TrendingUp className="w-6 h-6" />, bg: 'bg-amber-100 text-amber-600', label: 'Live Auctions', value: auctions.length },
                { icon: <ShoppingBag className="w-6 h-6" />, bg: 'bg-green-100 text-green-600', label: 'Cart Items', value: cartCount },
                { icon: <Package className="w-6 h-6" />, bg: 'bg-blue-100 text-blue-600', label: 'Cart Total', value: `$${(cartTotal / 100).toFixed(2)}` },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.bg}`}>{s.icon}</div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">{s.label}</p>
                    <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
                  </div>
                </div>
              ))}
              <Link to="/cart" className="bg-green-700 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:bg-green-800 transition-colors">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white"><ShoppingBag className="w-6 h-6" /></div>
                <div>
                  <p className="text-[11px] text-green-200 font-bold uppercase tracking-wider">View Cart</p>
                  <p className="text-lg font-extrabold text-white">Checkout →</p>
                </div>
              </Link>
            </div>

            {/* Live Auctions */}
            <div className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Clock className="w-5 h-5 text-amber-500" /> Live Auctions</h2>
                <Link to="/products?filter=auction" className="text-green-700 font-bold text-sm hover:underline">View all →</Link>
              </div>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => <div key={i} className="h-[340px] bg-gray-100 rounded-2xl animate-pulse" />)}
                </div>
              ) : auctions.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                  <p className="text-gray-500">No live auctions right now. Check back soon!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {auctions.slice(0, 6).map(auction => (
                    <AuctionCard key={auction.id} auction={auction} productName={getProductName(auction.product_id)} productId={auction.product_id} />
                  ))}
                </div>
              )}
            </div>

            {/* Recommended */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recommended Products</h2>
                <Link to="/products" className="text-green-700 font-bold text-sm hover:underline">Browse all →</Link>
              </div>
              {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {products.slice(0, 4).map(p => (
                    <Link key={p.id} to="/products" className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        <img src={`https://picsum.photos/seed/${p.id + 50}/80/80`} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-gray-900 truncate">{p.name}</p>
                        <p className="text-xs text-green-700 font-semibold">{formatMoney(p.price_cents)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ─── My Bids Tab ─── */}
        {activeTab === 'bids' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">My Active Bids</h2>
            </div>
            {loadingBids ? (
              <div className="animate-pulse space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}</div>
            ) : myBids.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                <div className="text-5xl mb-4">🔨</div>
                <p className="text-gray-700 font-bold text-lg mb-2">No bids placed yet</p>
                <p className="text-gray-400 text-sm mb-6">Head to the marketplace to find and bid on live auctions.</p>
                <Link to="/products" className="bg-green-700 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-green-800 transition-colors">Browse Auctions</Link>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="text-[10px] text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left">Product</th>
                      <th className="px-6 py-4 text-left">Current Bid</th>
                      <th className="px-6 py-4 text-left">Your Bid</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myBids.map(({ auction, product, myBidAmount, isLeading }) => (
                      <tr key={auction.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900">{product?.name || `Product #${auction.product_id}`}</td>
                        <td className="px-6 py-4 font-bold text-amber-600">{formatMoney(auction.current_price)}</td>
                        <td className="px-6 py-4 font-bold text-gray-700">{formatMoney(myBidAmount)}</td>
                        <td className="px-6 py-4 text-center">
                          {isLeading ? (
                            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-800 border border-green-200">LEADING</span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">OUTBID</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link to={`/auction/${auction.id}`} className="text-green-700 font-bold text-xs hover:underline">Bid Again →</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;
