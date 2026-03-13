import React, { useState, useEffect } from 'react';
import { CreditCard, Smartphone, ShieldCheck, X, Loader2, CheckCircle2 } from 'lucide-react';

const MockPaymentGateway = ({ isOpen, onClose, amount, onSuccess, methodLabel }) => {
  const [method, setMethod] = useState('upi'); // 'upi', 'card', 'netbanking'
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Auto-select method based on what user picked in checkout
  useEffect(() => {
    if (methodLabel?.toLowerCase().includes('card')) setMethod('card');
    else if (methodLabel?.toLowerCase().includes('bank')) setMethod('netbanking');
    else setMethod('upi');
  }, [methodLabel]);

  if (!isOpen) return null;

  const handlePay = () => {
    setProcessing(true);
    
    // Simulate network delay and bank processing
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      
      // Pass back a fake transaction ID after showing success for 1 second
      setTimeout(() => {
        onSuccess({
          razorpay_payment_id: `pay_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          razorpay_order_id: `order_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          razorpay_signature: "mock_signature_for_testing"
        });
      }, 1000);
      
    }, 2500); // 2.5 seconds fake loading
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transform transition-all animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-green-700 p-6 text-white relative">
          {!processing && !success && (
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-green-100 hover:text-white hover:bg-green-600 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2 text-white/90 mb-6">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-medium tracking-wide">FARM2HOME SECURE PAY</span>
          </div>
          
          <div className="text-green-100 text-sm mb-1">Total Amount Payable</div>
          <div className="text-4xl font-bold flex items-center gap-1">
            <span className="text-2xl mt-1">₹</span>
            {amount?.toLocaleString('en-IN') || '0'}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 bg-gray-50 flex-1 relative min-h-[300px]">
          
          {/* Success State */}
          {success && (
            <div className="absolute inset-0 bg-white flex flex-col items-center justify-center z-10 animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-12 h-12 text-green-600 animate-in spin-in-180 duration-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
              <p className="text-gray-500">Redirecting to order confirmation...</p>
            </div>
          )}

          {/* Processing State */}
          {processing && !success && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center z-10 flex flex-col gap-4">
              <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
              <div className="text-center">
                <p className="font-bold text-gray-900">Processing Payment</p>
                <p className="text-sm text-gray-500">Please do not close this window</p>
              </div>
            </div>
          )}

          {/* Form State */}
          {!processing && !success && (
            <>
              {/* Fake Tabs */}
              <div className="flex gap-2 mb-6 p-1 bg-gray-200 rounded-xl">
                <button
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${method === 'upi' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setMethod('upi')}
                >
                  <Smartphone className="w-4 h-4" /> UPI
                </button>
                <button
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${method === 'card' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setMethod('card')}
                >
                  <CreditCard className="w-4 h-4" /> Card
                </button>
              </div>

              {/* Fake Inputs */}
              {method === 'upi' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Enter UPI ID</label>
                    <input 
                      type="text" 
                      defaultValue="buyer@ok1gc"
                      disabled
                      className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent opacity-80"
                    />
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                       A payment request will be sent to this UPI ID.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                     <p className="text-sm font-medium text-gray-800 mb-3">Or scan to pay</p>
                     <div className="w-32 h-32 bg-white rounded-xl border-2 border-dashed border-gray-300 mx-auto flex items-center justify-center text-gray-400 p-2">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full opacity-20">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                        </svg>
                     </div>
                  </div>
                </div>
              )}

              {method === 'card' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                    <input 
                      type="text" 
                      defaultValue="4242 4242 4242 4242"
                      disabled
                      className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 focus:outline-none opacity-80"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                      <input 
                        type="text" 
                        defaultValue="12/28"
                        disabled
                        className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 focus:outline-none opacity-80"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                      <input 
                        type="password" 
                        defaultValue="***"
                        disabled
                        className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 focus:outline-none opacity-80 text-xl tracking-widest"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {method === 'netbanking' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 text-center py-8 text-gray-500">
                  Please proceed to authenticate with your bank.
                </div>
              )}
            </>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 bg-white border-t border-gray-100">
           <button
             onClick={handlePay}
             disabled={processing || success}
             className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-700/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
           >
             {processing ? 'Processing...' : `Pay ₹${amount?.toLocaleString('en-IN') || '0'}`}
           </button>
           <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
             <ShieldCheck className="w-3 h-3" /> Secured by AES-256 Encryption
           </p>
        </div>

      </div>
    </div>
  );
};

export default MockPaymentGateway;
