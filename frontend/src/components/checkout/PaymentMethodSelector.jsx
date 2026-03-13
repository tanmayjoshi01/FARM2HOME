import React from 'react';
import { Smartphone, CreditCard, Landmark, Wifi } from 'lucide-react';

const METHODS = [
  {
    id: 'upi',
    label: 'UPI',
    subLabel: 'GPay, PhonePe, Paytm',
    icon: Smartphone,
  },
  {
    id: 'debit_card',
    label: 'Debit Card',
    subLabel: 'Visa, Mastercard, RuPay',
    icon: CreditCard,
  },
  {
    id: 'credit_card',
    label: 'Credit Card',
    subLabel: 'All major cards accepted',
    icon: CreditCard,
  },
  {
    id: 'net_banking',
    label: 'Net Banking',
    subLabel: 'All major banks',
    icon: Landmark,
  },
];

const PaymentMethodSelector = ({ selected, onSelect }) => (
  <div className="space-y-2.5">
    {METHODS.map(({ id, label, subLabel, icon: Icon }) => {
      const isActive = selected === id;
      return (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-150
            ${isActive
              ? 'border-green-600 bg-green-50 shadow-sm'
              : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/40'
            }`}
        >
          {/* Icon bubble */}
          <div className={`w-10 h-10 flex-shrink-0 rounded-lg flex items-center justify-center
            ${isActive ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
            <Icon className="w-5 h-5" />
          </div>

          {/* Labels */}
          <div className="flex-1 min-w-0">
            <p className={`font-bold text-sm ${isActive ? 'text-green-800' : 'text-gray-800'}`}>{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{subLabel}</p>
          </div>

          {/* Radio indicator */}
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
            ${isActive ? 'border-green-600' : 'border-gray-300'}`}>
            {isActive && <div className="w-2.5 h-2.5 rounded-full bg-green-600" />}
          </div>
        </button>
      );
    })}
  </div>
);

export { METHODS };
export default PaymentMethodSelector;
