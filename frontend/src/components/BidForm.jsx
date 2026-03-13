import React, { useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const BidForm = ({ auction, onBidSuccess }) => {
  const { isAuthenticated } = useAuth();
  
  const minNextBidCents = auction.current_price + auction.minimum_increment;
  const minNextBidDollars = (minNextBidCents / 100).toFixed(2);
  
  const [bidAmount, setBidAmount] = useState(minNextBidDollars);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!isAuthenticated) {
      setError('You must be logged in to place a bid.');
      return;
    }

    const bidCents = Math.round(parseFloat(bidAmount) * 100);
    
    if (isNaN(bidCents) || bidCents < minNextBidCents) {
      setError(`Minimum bid must be ₹${minNextBidDollars}`);
      return;
    }

    setLoading(true);
    try {
      await API.post(`/auctions/${auction.id}/bid`, {
        bid_amount: bidCents
      });
      // Clear input and trigger success
      setBidAmount(((bidCents + auction.minimum_increment) / 100).toFixed(2));
      if (onBidSuccess) onBidSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place bid');
    } finally {
      setLoading(false);
    }
  };

  const isEnded = auction.status !== 'active' || new Date(auction.end_time) <= new Date();

  if (!isAuthenticated && !isEnded) {
    return (
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-6 text-center">
        <p className="text-gray-600 mb-3 text-sm">Please log in to place a bid on this auction.</p>
        <Link to="/login" className="inline-block bg-green-700 hover:bg-green-800 text-white font-medium px-6 py-2 rounded-lg transition-colors">
          Log In to Bid
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h4 className="text-sm font-bold text-gray-900 mb-3 tracking-wide">Enter Your Bid</h4>
      
      {error && (
        <div className="mb-3 text-red-600 text-sm bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-4">
        <div className="relative flex-[2]">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-gray-500 font-semibold">₹</span>
          </div>
          <input
            type="number"
            min={minNextBidDollars}
            step="0.01"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            disabled={isEnded || loading}
            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-bold text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isEnded || loading}
          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-xl shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Submitting...' : isEnded ? 'Ended' : 'Place Bid'}
        </button>
      </form>
      <div className="mt-2 text-[11px] text-gray-500">
        Minimum next bid: <span className="font-semibold text-gray-700">₹${minNextBidDollars}</span>
      </div>
    </div>
  );
};

export default BidForm;
