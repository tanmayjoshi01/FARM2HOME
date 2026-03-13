import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Download, Package, Printer, ArrowRight } from 'lucide-react';

const fmt = (amount) =>
  `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const DetailRow = ({ label, value, highlight }) => (
  <div className="flex items-start justify-between py-3.5 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-500">{label}</span>
    <span className={`text-sm font-bold text-right max-w-[60%] break-all ${highlight ? 'text-green-700' : 'text-gray-900'}`}>
      {value}
    </span>
  </div>
);

const PaymentSuccess = () => {
  const { state } = useLocation();
  const navigate   = useNavigate();

  // If user lands here directly with no state, redirect to orders
  useEffect(() => {
    if (!state?.transactionId) {
      const timer = setTimeout(() => navigate('/orders'), 2000);
      return () => clearTimeout(timer);
    }
  }, [state, navigate]);

  if (!state?.transactionId) {
    return (
      <div className="bg-gray-50 min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Redirecting to your orders…</p>
        </div>
      </div>
    );
  }

  const { transactionId, orderId, productName, amount, paymentMethod } = state;

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* ── Success header ──────────────────────────── */}
        <div className="text-center mb-8">
          {/* Animated check circle */}
          <div className="relative inline-flex items-center justify-center w-24 h-24 mb-5">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-30" />
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Payment Successful!</h1>
          <p className="text-gray-500 mt-2">
            Your order has been confirmed. The farmer will prepare your produce for delivery.
          </p>
        </div>

        {/* ── Confirmation Card ────────────────────────── */}
        <div id="invoice-section" className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
          {/* Green top strip */}
          <div className="bg-green-700 px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-green-200 text-xs font-bold uppercase tracking-wider">Transaction Confirmed</p>
              <p className="text-white font-extrabold text-lg mt-0.5">{transactionId}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Details */}
          <div className="px-6 py-2">
            <DetailRow label="Transaction ID"  value={transactionId} />
            <DetailRow label="Order ID"         value={orderId} />
            <DetailRow label="Product Name"     value={productName} />
            <DetailRow label="Amount Paid"      value={fmt(amount)} highlight />
            <DetailRow label="Payment Method"   value={paymentMethod} />
            <DetailRow label="Payment Status"   value={
              <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Paid
              </span>
            } />
          </div>

          {/* Farm2Home branding footer */}
          <div className="border-t border-dashed border-gray-200 mx-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-green-700 rounded-lg flex items-center justify-center text-white font-black text-xs">F2H</div>
              <span className="font-extrabold text-gray-900 text-sm">Farm<span className="text-green-700">2</span>Home</span>
            </div>
            <span className="text-xs text-gray-400">Farm to Table, Farm to Home 🌾</span>
          </div>
        </div>

        {/* Progress tracker */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 mb-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Order Progress</p>
          <div className="flex items-center gap-0">
            {['Payment', 'Processing', 'Dispatched', 'Delivered'].map((step, i) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs
                    ${i === 0 ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {i === 0 ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  <p className={`text-[10px] font-bold mt-1.5 text-center ${i === 0 ? 'text-green-700' : 'text-gray-400'}`}>{step}</p>
                </div>
                {i < 3 && (
                  <div className={`h-0.5 flex-1 mx-1 rounded-full ${i === 0 ? 'bg-green-200' : 'bg-gray-100'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── Action Buttons ────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 hover:border-green-500 hover:text-green-700 font-bold py-3.5 px-4 rounded-xl transition-all text-sm"
          >
            <Printer className="w-4 h-4" />
            Download Invoice
          </button>
          <Link
            to="/orders"
            className="flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white font-bold py-3.5 px-4 rounded-xl transition-colors text-sm"
          >
            <Package className="w-4 h-4" />
            Go to Orders
          </Link>
        </div>

        {/* Dashboard link */}
        <div className="text-center mt-5">
          <Link to="/buyer-dashboard" className="text-green-700 hover:underline text-sm font-semibold inline-flex items-center gap-1">
            View Buyer Dashboard <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Print styles – hide everything except invoice */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #invoice-section { display: block !important; }
          #invoice-section * { display: revert !important; }
        }
      `}</style>
    </div>
  );
};

export default PaymentSuccess;
