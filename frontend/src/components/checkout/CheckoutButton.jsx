import React from 'react';
import { Lock, Loader } from 'lucide-react';

const CheckoutButton = ({ onClick, loading, disabled, total }) => {
  const isDisabled = disabled || loading;
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-extrabold text-base transition-all duration-200 shadow-md
        ${isDisabled
          ? 'bg-gray-300 text-gray-400 cursor-not-allowed shadow-none'
          : 'bg-green-700 hover:bg-green-800 active:scale-[0.98] text-white hover:shadow-lg'
        }`}
    >
      {loading ? (
        <>
          <Loader className="w-5 h-5 animate-spin" />
          Processing Payment…
        </>
      ) : (
        <>
          <Lock className="w-5 h-5" />
          {total ? `Pay ${total}` : 'Proceed to Payment'}
        </>
      )}
    </button>
  );
};

export default CheckoutButton;
