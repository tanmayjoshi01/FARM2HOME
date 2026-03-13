import React from 'react';
import { ShieldCheck } from 'lucide-react';
import PriceBreakdown, { computePriceBreakdown } from './PriceBreakdown';
import PaymentMethodSelector from './PaymentMethodSelector';
import CheckoutButton from './CheckoutButton';

const fmt = (rupees) =>
  `₹${rupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PaymentSummaryCard = ({
  winningBidCents,
  deliveryFeeRupees = 120,
  selectedMethod,
  onSelectMethod,
  onPay,
  loading,
}) => {
  const { total } = computePriceBreakdown(winningBidCents, deliveryFeeRupees);

  return (
    <div className="lg:sticky lg:top-24 space-y-4">
      {/* Price Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-extrabold text-gray-900 mb-4 pb-4 border-b border-gray-100">
          Order Summary
        </h3>
        <PriceBreakdown
          winningBidCents={winningBidCents}
          deliveryFeeRupees={deliveryFeeRupees}
        />

        {/* Total Box */}
        <div className="mt-4 bg-green-700 rounded-xl px-5 py-4 flex items-center justify-between">
          <span className="text-green-100 font-bold text-sm">Total Payable</span>
          <span className="text-white font-extrabold text-xl">{fmt(total)}</span>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-extrabold text-gray-900 mb-4">Payment Method</h3>
        <PaymentMethodSelector selected={selectedMethod} onSelect={onSelectMethod} />
      </div>

      {/* CTA */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <CheckoutButton
          onClick={onPay}
          loading={loading}
          disabled={!selectedMethod}
          total={fmt(total)}
        />

        {/* Trust badge */}
        <div className="flex items-center justify-center gap-2 mt-4 text-gray-400 text-xs">
          <ShieldCheck className="w-4 h-4 text-green-500" />
          <span>Secured by Farm2Home · 256-bit SSL Encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummaryCard;
