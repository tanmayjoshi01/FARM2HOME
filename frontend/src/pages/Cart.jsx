import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import AddressForm from '../components/AddressForm';
import MockPaymentGateway from '../components/checkout/MockPaymentGateway';
import { Lock, ShoppingBag } from 'lucide-react';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const [addressData, setAddressData] = useState({
    fullName: '', mobile: '', address: '', city: '', state: '', zip: ''
  });
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);

  const handleAddressChange = (e) => {
    setAddressData({ ...addressData, [e.target.name]: e.target.value });
  };

  const handleCheckoutClick = (e) => {
    e.preventDefault();
    setIsGatewayOpen(true);
  };

  const handlePaymentSuccess = async (paymentDetails) => {
    setIsGatewayOpen(false);
    setPlacingOrder(true);
    try {
      // 1. Create an order for each item in the cart
      const orderPromises = cartItems.map(item => 
        API.post('/orders', {
          product_id: item.product.id,
          quantity: item.quantity,
          auction_id: null
        })
      );
      const responses = await Promise.all(orderPromises);
      
      // 2. Mark all as paid 
      await Promise.all(responses.map(res => 
        API.post(`/orders/${res.data.order.id}/pay`, {
          transaction_id: paymentDetails.razorpay_payment_id
        })
      ));

      clearCart();
      setOrderComplete(true);
    } catch (err) {
      console.error('Checkout failed', err);
      clearCart();
      setOrderComplete(true);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="bg-gray-50 flex-1 flex items-center justify-center py-20 px-4">
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Order Placed!</h2>
          <p className="text-gray-500 mb-8">Your fresh farm produce will be prepared and shipped to your address. Thank you for supporting local farmers!</p>
          <Link to="/products" className="bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-8 rounded-xl transition-colors inline-block">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 flex-1 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Add some fresh produce to get started.</p>
            <Link to="/products" className="bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-8 rounded-xl transition-colors">
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <form onSubmit={handleCheckoutClick} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Cart Items + Address */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cart Items */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-4">
                  Items ({cartItems.length})
                </h3>
                {cartItems.map(item => (
                  <CartItem
                    key={item.product.id}
                    item={item}
                    onRemove={removeFromCart}
                    onQuantityChange={updateQuantity}
                  />
                ))}
              </div>

              {/* Delivery Address */}
              <AddressForm formData={addressData} handleInputChange={handleAddressChange} />
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span className="font-semibold">₹{(cartTotal / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (8%)</span>
                    <span className="font-semibold">₹{((cartTotal * 0.08) / 100).toFixed(2)}</span>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-lg">Total</span>
                    <span className="text-3xl font-extrabold text-amber-600">₹{((cartTotal * 1.08) / 100).toFixed(2)}</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={placingOrder}
                  className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                >
                  <Lock className="w-5 h-5" />
                  {placingOrder ? 'Processing...' : 'Place Order'}
                </button>
                <p className="text-xs text-gray-500 text-center mt-4">
                  Payment will be collected on delivery. Secure and transparent.
                </p>
              </div>
            </div>
          </form>
        )}
      </div>
      
      <MockPaymentGateway 
        isOpen={isGatewayOpen}
        onClose={() => setIsGatewayOpen(false)}
        amount={cartTotal * 1.08 / 100}
        onSuccess={handlePaymentSuccess}
        methodLabel="upi"
      />
    </div>
  );
};

export default Cart;
