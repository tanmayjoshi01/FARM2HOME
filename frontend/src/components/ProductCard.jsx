import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Tag, Info } from 'lucide-react';

const formatMoney = (cents) => `₹${(cents / 100).toFixed(2)}`;

const ProductCard = ({ product, auction, onAddToCart, onViewDetails }) => {
  const isOnAuction = auction && auction.status === 'active';
  const currentPrice = isOnAuction ? auction.current_price : product.price_cents;
  const isEndingSoon = isOnAuction && new Date(auction.end_time) - new Date() < 3 * 60 * 60 * 1000;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        <img
          src={`https://picsum.photos/seed/${product.id + 50}/400/300`}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isOnAuction ? (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow">
              🔥 Live Auction
            </span>
          ) : (
            <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow">
              Direct Buy
            </span>
          )}
          {isEndingSoon && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow">
              Ending Soon
            </span>
          )}
        </div>
        {product.stock !== undefined && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded">
            Stock: {product.stock}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 text-base mb-1 truncate">{product.name}</h3>
        {product.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{product.description}</p>
        )}

        {/* Price */}
        <div className="mt-auto">
          <div className="flex items-end justify-between mb-4">
            <div>
              {isOnAuction ? (
                <>
                  <span className="block text-[10px] text-gray-400 uppercase tracking-wider font-bold">Current Bid</span>
                  <span className="text-xl font-extrabold text-amber-600">{formatMoney(currentPrice)}</span>
                </>
              ) : (
                <>
                  <span className="block text-[10px] text-gray-400 uppercase tracking-wider font-bold">Price</span>
                  <span className="text-xl font-extrabold text-green-700">{formatMoney(currentPrice)}</span>
                </>
              )}
            </div>
            {isOnAuction && (
              <div className="text-right">
                <span className="block text-[10px] text-gray-400 font-bold">Start</span>
                <span className="text-sm font-semibold text-gray-500">{formatMoney(auction.start_price)}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {/* Details Button */}
            {onViewDetails && (
              <button
                onClick={() => onViewDetails({ product, auction })}
                className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors flex-shrink-0"
                title="View details"
              >
                <Info className="w-5 h-5" />
              </button>
            )}
            {isOnAuction ? (
              <Link
                to={`/auction/${auction.id}`}
                className="flex-1 flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-4 rounded-xl transition-colors text-sm"
              >
                <Eye className="w-4 h-4" />
                View Auction
              </Link>
            ) : (
              <>
                {onAddToCart && (
                  <button
                    onClick={() => onAddToCart(product)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-green-700 hover:bg-green-800 text-white font-bold py-2.5 px-4 rounded-xl transition-colors text-sm"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                )}
                {!onAddToCart && (
                  <div className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 text-gray-600 font-bold py-2.5 px-4 rounded-xl text-sm">
                    <Tag className="w-4 h-4" />
                    {formatMoney(product.price_cents)}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
