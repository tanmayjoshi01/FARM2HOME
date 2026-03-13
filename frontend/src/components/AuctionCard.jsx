import React from 'react';
import { Link } from 'react-router-dom';
import CountdownTimer from './CountdownTimer';
import { Eye } from 'lucide-react';

const formatMoney = (cents) => `₹${(cents / 100).toFixed(2)}`;

const AuctionCard = ({ auction, productName, productId }) => {
  const isActive = auction.status === 'active';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        <img
          src={`https://picsum.photos/seed/${productId + 80}/400/225`}
          alt={productName}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3">
          <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider text-white shadow ${isActive ? 'bg-green-600' : 'bg-gray-500'}`}>
            {isActive ? '⚡ Live' : 'Ended'}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-gray-900 truncate mb-3">{productName}</h3>
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Current Bid</span>
            <span className="text-xl font-extrabold text-amber-600">{formatMoney(auction.current_price)}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Starting</span>
            <span className="text-base font-semibold text-gray-400">{formatMoney(auction.start_price)}</span>
          </div>
        </div>
        {isActive && <CountdownTimer endTime={auction.end_time} />}
        <Link
          to={`/auction/${auction.id}`}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl transition-colors"
        >
          <Eye className="w-4 h-4" />
          View & Bid
        </Link>
      </div>
    </div>
  );
};

export default AuctionCard;
