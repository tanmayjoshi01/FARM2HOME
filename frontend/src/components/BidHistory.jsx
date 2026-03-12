import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import API from '../services/api';

const formatMoney = (cents) => `$${(cents / 100).toFixed(2)}`;

const BidHistory = ({ auctionId, refreshTrigger }) => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const res = await API.get(`/auctions/${auctionId}/bids`);
        setBids(res.data.bid_history || []);
      } catch (err) {
        console.error("Failed to fetch bid history", err);
      } finally {
        setLoading(false);
      }
    };

    if (auctionId) {
      fetchBids();
    }
  }, [auctionId, refreshTrigger]);

  if (loading) {
    return <div className="py-6 text-center text-gray-500 text-sm animate-pulse">Loading bid history...</div>;
  }

  // Bids come sorted chronologically ascending, we want descending for recent first
  const displayBids = [...bids].reverse().slice(0, 10); // Show max 10 bids

  return (
    <div className="mt-12">
      <div className="flex justify-between items-end mb-4">
        <h3 className="text-xl font-bold text-gray-900">Bid History</h3>
        <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
          {bids.length} Total Bids
        </span>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {displayBids.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No bids yet. Be the first to bid!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4 text-left">Amount</th>
                  <th className="px-6 py-4 text-center">Time</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {displayBids.map((bid, index) => {
                  const isLeading = index === 0;
                  return (
                    <tr key={bid.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 font-bold uppercase">
                          {bid.bidder_name.substring(0, 2)}
                        </div>
                        {bid.bidder_name}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900 text-left">
                        {formatMoney(bid.bid_amount)}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-center text-xs">
                        {formatDistanceToNow(new Date(bid.created_at), { addSuffix: true })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isLeading ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            LEADING
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
                            OUTBID
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {bids.length > 10 && (
              <div className="p-4 text-center border-t border-gray-100 bg-gray-50">
                <button className="text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors">
                  View All Bids
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BidHistory;
