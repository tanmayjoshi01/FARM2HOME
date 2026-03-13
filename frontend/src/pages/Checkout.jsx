import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { ArrowLeft, Loader, AlertTriangle } from 'lucide-react';
import CheckoutProductCard from '../components/checkout/CheckoutProductCard';
import PaymentSummaryCard from '../components/checkout/PaymentSummaryCard';
import { computePriceBreakdown } from '../components/checkout/PriceBreakdown';
import { METHODS } from '../components/checkout/PaymentMethodSelector';
import MockPaymentGateway from '../components/checkout/MockPaymentGateway';

/* ── Skeleton loader ──────────────────────────────────── */
const SkeletonBlock = ({ className }) => (
  <div className={`bg-gray-200 animate-pulse rounded-2xl ${className}`} />
);

const CheckoutSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <SkeletonBlock className="h-6 w-48 mb-8" />
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
      <div className="space-y-4">
        <SkeletonBlock className="h-[340px]" />
        <SkeletonBlock className="h-32" />
      </div>
      <div className="space-y-4">
        <SkeletonBlock className="h-64" />
        <SkeletonBlock className="h-56" />
        <SkeletonBlock className="h-20" />
      </div>
    </div>
  </div>
);

/* ── Main Checkout Page ───────────────────────────────── */
const Checkout = () => {
  const { auctionId } = useParams();
  const navigate       = useNavigate();

  const [auction,  setAuction]  = useState(null);
  const [product,  setProduct]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [method,   setMethod]   = useState('');
  const [paying,   setPaying]   = useState(false);
  const [payError, setPayError] = useState('');
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);

  /* ── Fetch auction & product ────────────────────────── */
  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const aRes = await API.get(`/auctions/${auctionId}`);
        const aData = aRes.data.auction || aRes.data;
        setAuction(aData);

        const pRes = await API.get(`/products/${aData.product_id}`);
        setProduct(pRes.data);
      } catch (e) {
        console.error(e);
        setError('Could not load auction details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [auctionId]);

  /* ── Payment handler ────────────────────────────────── */
  const handlePayClick = () => {
    if (!method) return;
    setPayError('');
    setIsGatewayOpen(true);
  };

  const handlePaymentSuccess = async (paymentDetails) => {
    setIsGatewayOpen(false);
    setPaying(true);

    try {
      const transactionId = paymentDetails.razorpay_payment_id;
      const { total } = computePriceBreakdown(auction.current_price, 120);
      const methodLabel = METHODS.find((m) => m.id === method)?.label || method;

      // Call our original auction-pay endpoint to finalize the order
      const payRes = await API.post('/orders/auction-pay', {
        auction_id: Number(auctionId),
        product_id: product.id,
        transaction_id: transactionId,
      });

      const orderId = payRes.data?.order_id || auctionId;

      navigate('/payment-success', {
        state: {
          transactionId,
          orderId: `ORD-${String(orderId).padStart(5, '0')}`,
          productName: product?.name || 'Product',
          amount: total,
          paymentMethod: methodLabel,
          auctionId,
        },
      });
    } catch (e) {
      console.error(e);
      setPayError('Failed to record payment in database. Please contact support.');
    } finally {
      setPaying(false);
    }
  };

  /* ── Loading skeleton ───────────────────────────────── */
  if (loading) return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)]">
      <CheckoutSkeleton />
    </div>
  );

  /* ── Error state ────────────────────────────────────── */
  if (error || !auction || !product) return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Checkout Unavailable</h2>
        <p className="text-gray-500 mb-8">{error || 'Auction or product not found.'}</p>
        <Link to="/products" className="inline-flex items-center gap-2 bg-green-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </Link>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/products" className="flex items-center gap-1 hover:text-green-700 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" /> Marketplace
          </Link>
          <span className="text-gray-300">/</span>
          <Link to={`/auction/${auctionId}`} className="hover:text-green-700 transition-colors">
            Auction #{auctionId}
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-semibold">Checkout</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Checkout</h1>
          <p className="text-gray-500 mt-1">
            Review your auction win and complete payment securely.
          </p>
        </div>

        {/* ── Two-column Layout ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

          {/* LEFT: Order Details */}
          <div className="space-y-6">
            {/* Step badge */}
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-green-700 text-white font-bold text-xs flex items-center justify-center">1</div>
              <span className="font-bold text-gray-800">Order Details</span>
            </div>

            <CheckoutProductCard auction={auction} product={product} />

            {/* Security note */}
            <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-start gap-3">
              <div className="text-green-600 text-xl mt-0.5">🌾</div>
              <div>
                <p className="font-bold text-green-800 text-sm">Direct from Farm to Your Home</p>
                <p className="text-green-700 text-xs mt-0.5">
                  Your purchase supports local Indian farmers. Payment is held securely until delivery is confirmed.
                </p>
              </div>
            </div>

            {/* Step badge 2 – visible on mobile only */}
            <div className="flex items-center gap-3 lg:hidden">
              <div className="w-7 h-7 rounded-full bg-green-700 text-white font-bold text-xs flex items-center justify-center">2</div>
              <span className="font-bold text-gray-800">Payment Summary</span>
            </div>

            {/* Mobile payment summary */}
            <div className="lg:hidden">
              <PaymentSummaryCard
                winningBidCents={auction.current_price}
                deliveryFeeRupees={120}
                selectedMethod={method}
                onSelectMethod={setMethod}
                onPay={handlePayClick}
                loading={paying}
              />
            </div>
          </div>

          {/* RIGHT: Payment Summary (desktop sticky) */}
          <div className="hidden lg:block">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-7 h-7 rounded-full bg-green-700 text-white font-bold text-xs flex items-center justify-center">2</div>
              <span className="font-bold text-gray-800">Payment Summary</span>
            </div>
            <PaymentSummaryCard
              winningBidCents={auction.current_price}
              deliveryFeeRupees={120}
              selectedMethod={method}
              onSelectMethod={setMethod}
              onPay={handlePayClick}
              loading={paying}
            />
          </div>
        </div>

        {/* Pay error banner */}
        {payError && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 flex items-center gap-3 font-medium text-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            {payError}
          </div>
        )}
      </div>

      <MockPaymentGateway 
        isOpen={isGatewayOpen}
        onClose={() => setIsGatewayOpen(false)}
        amount={computePriceBreakdown(auction.current_price, 120).total}
        onSuccess={handlePaymentSuccess}
        methodLabel={METHODS.find((m) => m.id === method)?.label || method}
      />
    </div>
  );
};

export default Checkout;
