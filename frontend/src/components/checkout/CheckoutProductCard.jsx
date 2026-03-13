import React from 'react';
import { MapPin, User, Tag, Gavel, Clock, Award } from 'lucide-react';

const formatMoney = (cents) => `₹${(cents / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const InfoRow = ({ icon: Icon, label, value, highlight }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
    <div className="flex items-center gap-2 text-gray-500 text-sm">
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{label}</span>
    </div>
    <span className={`text-sm font-semibold ${highlight ? 'text-green-700' : 'text-gray-800'}`}>
      {value}
    </span>
  </div>
);

const CheckoutProductCard = ({ auction, product }) => {
  if (!auction || !product) return null;

  const endTime = new Date(auction.end_time).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const auctionId = `AUC-${String(auction.id).padStart(5, '0')}`;
  const sellerName = product.seller_name || product.farmer_name || `Farmer #${product.user_id || ''}`;
  const location    = product.location || 'India';
  const category    = product.category || product.type || 'Agricultural Produce';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Product Image */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        <img
          src={product.image_url ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${product.image_url}` : "/mango-placeholder.jpg"}
          alt={product.name}
          onError={(e) => { e.currentTarget.src = '/mango-placeholder.jpg'; }}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <span className="inline-flex items-center gap-1.5 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
            <Award className="w-3.5 h-3.5" /> Winning Bid
          </span>
        </div>
        {/* Auction ended badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-gray-900/70 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
            Auction Ended
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        <h2 className="text-xl font-extrabold text-gray-900 leading-snug mb-1">{product.name}</h2>
        {product.description && (
          <p className="text-sm text-gray-500 mb-5 line-clamp-2">{product.description}</p>
        )}

        <div className="space-y-0 mb-5">
          <InfoRow icon={Tag}   label="Category"       value={category} />
          <InfoRow icon={User}  label="Farmer / Seller" value={sellerName} />
          <InfoRow icon={MapPin} label="Location"       value={location} />
          <InfoRow icon={Gavel} label="Auction ID"      value={auctionId} />
          <InfoRow icon={Clock} label="Auction Ended"   value={endTime} />
        </div>

        {/* Winning Bid Highlight */}
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-green-600 uppercase tracking-wider mb-0.5">Your Winning Bid</p>
            <p className="text-2xl font-extrabold text-green-700">{formatMoney(auction.current_price)}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Seller Summary Card */}
      <div className="mx-6 mb-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Seller Summary</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-400">Seller</p>
            <p className="font-bold text-gray-800 text-sm truncate" title={sellerName}>{sellerName.split(' ')[0]}</p>
          </div>
          <div className="text-center border-x border-gray-200">
            <p className="text-xs text-gray-400">Location</p>
            <p className="font-bold text-gray-800 text-sm truncate" title={location}>{location.split(',')[0]}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Auction ID</p>
            <p className="font-bold text-gray-800 text-sm">{auctionId}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutProductCard;
