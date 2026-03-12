import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';

const CartItem = ({ item, onRemove, onQuantityChange }) => {
  const { product, quantity } = item;
  const subtotal = (product.price_cents * quantity) / 100;

  return (
    <div className="flex gap-4 py-5 border-b border-gray-100 last:border-0">
      <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
        <img
          src={`https://picsum.photos/seed/${product.id + 100}/160/160`}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <h4 className="font-bold text-gray-900 truncate">{product.name}</h4>
            <p className="text-xs text-gray-500 mt-0.5">
              ${(product.price_cents / 100).toFixed(2)} / unit
            </p>
          </div>
          <span className="font-extrabold text-gray-900 flex-shrink-0">
            ${subtotal.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => onQuantityChange(product.id, quantity - 1)}
              className="p-2 text-gray-500 hover:bg-gray-50 hover:text-black transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-4 py-1 text-sm font-bold border-x border-gray-200 min-w-[40px] text-center">
              {quantity}
            </span>
            <button
              onClick={() => onQuantityChange(product.id, quantity + 1)}
              className="p-2 text-gray-500 hover:bg-gray-50 hover:text-black transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            onClick={() => onRemove(product.id)}
            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
