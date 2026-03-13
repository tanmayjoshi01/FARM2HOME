import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Package, ShoppingBag, ArrowRight, CheckCircle, Clock, Loader, ExternalLink } from 'lucide-react';

const statusConfig = {
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800 border-green-200',  icon: <CheckCircle className="w-3.5 h-3.5" /> },
  shipped:   { label: 'Shipped',   color: 'bg-blue-100 text-blue-800 border-blue-200',    icon: <Clock className="w-3.5 h-3.5" /> },
  paid:      { label: 'Paid',      color: 'bg-purple-100 text-purple-800 border-purple-200', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  pending:   { label: 'Pending',   color: 'bg-amber-100 text-amber-800 border-amber-200',  icon: <Clock className="w-3.5 h-3.5" /> },
  failed:    { label: 'Failed',    color: 'bg-red-100 text-red-700 border-red-200',        icon: <ExternalLink className="w-3.5 h-3.5" /> },
};

import { useAuth } from '../context/AuthContext';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;
    const fetchData = async () => {
      try {
        // Use buyer-specific endpoint which returns enriched data (product_name, farmer_name)
        const ordersRes = await API.get(`/orders/buyer/${user.id}`);
        setOrders(ordersRes.data || []);
      } catch (e) {
        console.error(e);
        setError('Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  return (
    <div className="bg-gray-50 flex-1 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Order History</h1>
            <p className="text-gray-500 mt-1">Track your past farm produce orders.</p>
          </div>
          <Link to="/products" className="hidden sm:flex items-center gap-2 text-green-700 font-bold hover:underline text-sm">
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader className="w-10 h-10 animate-spin text-green-600 mb-3" />
            <p className="text-sm font-medium">Loading your orders...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
            <p className="text-red-600 font-semibold">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && orders.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No Orders Yet</h2>
            <p className="text-gray-500 max-w-sm mx-auto mb-8">
              Your completed orders will appear here once you make a purchase.
            </p>
            <Link to="/products" className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-8 rounded-xl transition-colors">
              <ShoppingBag className="w-5 h-5" /> Browse Marketplace
            </Link>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map(order => {
              const s = statusConfig[order.payment_status] || statusConfig.pending;
              // buyer endpoint returns enriched fields: product_name, farmer_name
              const productName = order.product_name || `Product #${order.product_id}`;
              const farmerName = order.farmer_name || '';
              const orderId = `ORD-${String(order.order_id || order.id).padStart(4, '0')}`;
              const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

              return (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={order.image_url ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${order.image_url}` : "/mango-placeholder.jpg"}
                      alt={productName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <p className="font-bold text-gray-900">{productName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {orderId} · {date}{order.quantity ? ` · Qty: ${order.quantity}` : ''}
                        </p>
                        {farmerName && (
                          <p className="text-xs text-green-700 mt-0.5 font-semibold">Farmer: {farmerName}</p>
                        )}
                        {order.transaction_id && (
                          <p className="text-xs text-gray-400 mt-0.5 font-mono">
                            TXN: {order.transaction_id.slice(0, 20)}…
                          </p>
                        )}
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase border flex-shrink-0 ${s.color}`}>
                        {s.icon} {s.label}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-extrabold text-gray-900">
                      ₹{(order.amount / 100).toFixed(2)}
                    </p>
                    {order.payment_status === 'pending' && order.auction_id && (
                      <Link
                        to={`/checkout/${order.auction_id}`}
                        className="inline-flex items-center gap-1 text-xs text-green-700 font-bold hover:underline mt-1"
                      >
                        <ExternalLink className="w-3 h-3" /> Checkout
                      </Link>
                    )}
                    {order.payment_status === 'pending' && !order.auction_id && (
                      <button
                        onClick={async () => {
                          try {
                            await API.post(`/orders/${order.id}/pay`);
                            setOrders(prev => prev.map(o => o.id === order.id ? { ...o, payment_status: 'paid' } : o));
                          } catch (e) { console.error(e); }
                        }}
                        className="text-xs text-amber-600 font-bold hover:underline mt-1 block"
                      >
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default Orders;
