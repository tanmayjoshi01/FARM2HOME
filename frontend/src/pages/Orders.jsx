import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, Clock, CheckCircle, ArrowRight } from 'lucide-react';

// Placeholder order data — replace with API.get('/orders') when backend endpoint is ready
const MOCK_ORDERS = [
  { id: 'ORD-0001', product: 'Organic Tomatoes', price_cents: 1299, date: '2026-03-10', status: 'delivered' },
  { id: 'ORD-0002', product: 'Raw Honey 1kg', price_cents: 3499, date: '2026-03-08', status: 'shipped' },
  { id: 'ORD-0003', product: 'Fresh Milk 2L', price_cents: 899, date: '2026-03-05', status: 'delivered' },
];

const statusConfig = {
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800 border-green-200', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  shipped: { label: 'Shipped', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: <Clock className="w-3.5 h-3.5" /> },
  processing: { label: 'Processing', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: <Clock className="w-3.5 h-3.5" /> },
};

const Orders = () => {
  return (
    <div className="bg-gray-50 flex-1 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Order History</h1>
            <p className="text-gray-500 mt-1">Track your past farm produce orders.</p>
          </div>
          <Link to="/products" className="hidden sm:flex items-center gap-2 text-green-700 font-bold hover:underline text-sm">
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {MOCK_ORDERS.length === 0 ? (
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
        ) : (
          <div className="space-y-4">
            {MOCK_ORDERS.map(order => {
              const s = statusConfig[order.status] || statusConfig.processing;
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-6">
                  <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={`https://picsum.photos/seed/${order.id}/80/80`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <p className="font-bold text-gray-900">{order.product}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Order {order.id} · {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase border flex-shrink-0 ${s.color}`}>
                        {s.icon} {s.label}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-extrabold text-gray-900">${(order.price_cents / 100).toFixed(2)}</p>
                    <button className="text-xs text-green-700 font-bold hover:underline mt-1">View Receipt</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 p-5 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
          <div className="text-blue-600 mt-0.5">ℹ️</div>
          <div>
            <p className="text-sm text-blue-800 font-semibold">Backend Integration Ready</p>
            <p className="text-sm text-blue-600 mt-0.5">Replace <code className="bg-blue-100 px-1 rounded">MOCK_ORDERS</code> with <code className="bg-blue-100 px-1 rounded">API.get('/orders')</code> once the backend endpoint is available.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
