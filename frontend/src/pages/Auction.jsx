import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import CountdownTimer from '../components/CountdownTimer';
import BidForm from '../components/BidForm';
import BidHistory from '../components/BidHistory';
import { AlertTriangle, CheckCircle, Clock, ArrowLeft, Loader } from 'lucide-react';

const formatMoney = (cents) => `₹${(cents / 100).toFixed(2)}`;

const getAuctionStatus = (auction) => {
  if (!auction) return null;
  if (auction.status !== 'active') return { label: 'Ended', color: 'bg-gray-600', icon: <AlertTriangle className="w-4 h-4" /> };
  const msleft = new Date(auction.end_time) - new Date();
  if (msleft <= 0) return { label: 'Ended', color: 'bg-gray-600', icon: <AlertTriangle className="w-4 h-4" /> };
  if (msleft < 3 * 60 * 60 * 1000) return { label: 'Ending Soon', color: 'bg-red-500', icon: <Clock className="w-4 h-4" /> };
  return { label: 'Active', color: 'bg-green-500', icon: <CheckCircle className="w-4 h-4" /> };
};

const Auction = () => {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchData = async () => {
    try {
      const aRes = await API.get(`/auctions/${id}`);
      const auctionData = aRes.data.auction || aRes.data;
      setAuction(auctionData);
      const pRes = await API.get(`/products/${auctionData.product_id}`);
      setProduct(pRes.data);
    } catch (e) {
      console.error(e);
      setError('Failed to load auction. Please check if the auction ID is valid.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id, refreshTrigger]);

  // Poll for live bid updates every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => setRefreshTrigger(t => t + 1), 15000);
    return () => clearInterval(interval);
  }, []);

  const handleBidSuccess = () => setRefreshTrigger(t => t + 1);
  const handleAuctionExpire = () => setRefreshTrigger(t => t + 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader className="w-10 h-10 animate-spin text-green-600" />
          <p className="font-medium">Loading auction...</p>
        </div>
      </div>
    );
  }

  if (error || !auction || !product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-6">🔨</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Auction Not Found</h2>
        <p className="text-gray-500 mb-8">{error}</p>
        <Link to="/products" className="inline-flex items-center gap-2 text-green-700 font-bold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </Link>
      </div>
    );
  }

  const status = getAuctionStatus(auction);
  const isLive = status?.label === 'Active';
  const isEndingSoon = status?.label === 'Ending Soon';

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/products" className="hover:text-green-700 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Marketplace
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </div>

        {/* Live Poll Notice */}
        {isLive && (
          <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 px-5 py-3 rounded-xl text-sm font-medium">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live auction — bids refresh automatically every 15 seconds
          </div>
        )}
        {isEndingSoon && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-xl text-sm font-bold">
            <Clock className="w-4 h-4" /> This auction is ending soon! Place your bid now.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16">
          {/* Left: Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
              <img src={`https://picsum.photos/seed/${product.id + 100}/800/800`} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`aspect-square rounded-xl overflow-hidden ${i === 1 ? 'ring-2 ring-amber-500' : ''}`}>
                  <img src={`https://picsum.photos/seed/${product.id + 100 + i}/200/200`} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Details */}
          <div className="flex flex-col">
            {/* Status + Title */}
            <div className="mb-5">
              <div className="flex items-center gap-3 mb-3">
                {status && (
                  <span className={`inline-flex items-center gap-1.5 ${status.color} text-white text-[11px] font-bold px-3 py-1 rounded-full`}>
                    {status.icon} {status.label}
                  </span>
                )}
                <span className="text-xs text-gray-400">Auction #{auction.id?.toString().padStart(5, '0')}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">{product.name}</h1>
              <p className="text-gray-500 mt-3 leading-relaxed">{product.description || 'Fresh farm produce, harvested and delivered directly to your door.'}</p>
            </div>

            {/* Price Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-5 grid grid-cols-3 divide-x divide-gray-100">
              <div className="pr-4">
                <span className="block text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Current Bid</span>
                <span className="text-3xl font-extrabold text-amber-600">{formatMoney(auction.current_price)}</span>
              </div>
              <div className="px-4">
                <span className="block text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Starting Price</span>
                <span className="text-xl font-bold text-gray-400">{formatMoney(auction.start_price)}</span>
              </div>
              <div className="pl-4">
                <span className="block text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Min. Increment</span>
                <span className="text-xl font-bold text-gray-600">{formatMoney(auction.minimum_increment || 100)}</span>
              </div>
            </div>

            {/* Countdown Timer */}
            {isLive || isEndingSoon ? (
              <CountdownTimer endTime={auction.end_time} onExpire={handleAuctionExpire} />
            ) : (
              <div className="bg-gray-100 rounded-xl p-4 text-center font-bold text-gray-500 mb-4">
                This auction has ended.
              </div>
            )}

            {/* Bid Form */}
            <BidForm auction={auction} onBidSuccess={handleBidSuccess} />
          </div>
        </div>

        {/* Bid History - Full Width */}
        <div className="mt-14">
          <BidHistory auctionId={auction.id} refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
};

export default Auction;
