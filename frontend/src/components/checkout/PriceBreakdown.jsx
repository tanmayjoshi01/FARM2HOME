import React from 'react';

const fmt = (rupees) =>
  `₹${rupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * PriceBreakdown
 * Takes winningBidCents (integer, paise) and deliveryFeeRupees (integer, ₹)
 * Computes platform fee, GST, and total.
 */
export const computePriceBreakdown = (winningBidCents, deliveryFeeRupees = 120) => {
  const bid        = winningBidCents / 100;           // ₹
  const platFee    = Math.round(bid * 0.03 * 100) / 100; // 3%
  const gst        = Math.round(platFee * 0.18 * 100) / 100; // 18% of platform fee
  const delivery   = deliveryFeeRupees;
  const total      = bid + platFee + gst + delivery;
  return { bid, platFee, gst, delivery, total };
};

const Row = ({ label, value, muted, bold, green }) => (
  <div className={`flex items-center justify-between py-3 ${muted ? 'opacity-60' : ''}`}>
    <span className={`text-sm ${bold ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{label}</span>
    <span className={`text-sm ${bold ? 'text-lg font-extrabold' : 'font-semibold'} ${green ? 'text-green-700' : bold ? 'text-gray-900' : 'text-gray-800'}`}>
      {value}
    </span>
  </div>
);

const Divider = () => <hr className="border-gray-100 my-1" />;

const PriceBreakdown = ({ winningBidCents, deliveryFeeRupees = 120 }) => {
  const { bid, platFee, gst, delivery, total } = computePriceBreakdown(winningBidCents, deliveryFeeRupees);

  return (
    <div>
      <Row label="Winning Bid Amount"       value={fmt(bid)} />
      <Row label="Platform Fee (3%)"        value={`+ ${fmt(platFee)}`} />
      <Row label="GST on Platform Fee (18%)" value={`+ ${fmt(gst)}`} />
      <Row label="Delivery Charges"          value={`+ ${fmt(delivery)}`} />
      <Divider />
      <Row label="Total Payable" value={fmt(total)} bold green />
    </div>
  );
};

export default PriceBreakdown;
