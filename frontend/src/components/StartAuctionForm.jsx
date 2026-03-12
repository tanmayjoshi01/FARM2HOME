import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Megaphone } from 'lucide-react';

const StartAuctionForm = ({ refreshTrigger, onAuctionSuccess }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    product_id: '',
    start_price: '',
    duration_minutes: 60
  });
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchMyProducts = async () => {
      try {
        setFetching(true);
        // The backend /products endpoint returns all products.
        // For a farmer to auction, they can only auction their own products.
        const res = await API.get('/products');
        const myProducts = res.data.filter(p => p.farmer_id === user.id);
        setProducts(myProducts);
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setFetching(false);
      }
    };
    
    fetchMyProducts();
  }, [user.id, refreshTrigger]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (!formData.product_id) {
        throw new Error("Please select a product");
      }

      const priceCents = Math.round(parseFloat(formData.start_price) * 100);
      
      await API.post('/auctions', {
        product_id: parseInt(formData.product_id, 10),
        start_price: priceCents,
        duration_minutes: parseInt(formData.duration_minutes, 10)
      });
      
      setSuccess(true);
      setFormData({ product_id: '', start_price: '', duration_minutes: 60 });
      if (onAuctionSuccess) onAuctionSuccess();
    } catch (err) {
      setError(err.message || err.response?.data?.error || "Failed to start auction");
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (e) => {
    const selectedId = e.target.value;
    const selectedProduct = products.find(p => p.id === parseInt(selectedId, 10));
    
    // Auto-fill starting bid if product is selected
    setFormData({
      ...formData,
      product_id: selectedId,
      start_price: selectedProduct ? (selectedProduct.price_cents / 100).toFixed(2) : ''
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-700">
          <Megaphone className="w-5 h-5 pointer-events-none" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Start New Auction</h3>
      </div>

      {error && <div className="text-red-500 mb-4 text-sm bg-red-50 p-3 rounded">{error}</div>}
      {success && <div className="text-green-600 mb-4 text-sm bg-green-50 p-3 rounded">Auction launched successfully!</div>}

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-5">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Select Product</label>
          <div className="relative">
            <select
              required
              value={formData.product_id}
              onChange={handleProductChange}
              disabled={fetching || products.length === 0}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white"
            >
              <option value="" disabled>-- Choose a Product --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
          {products.length === 0 && !fetching && (
            <p className="text-xs text-amber-600 mt-2">You don't have any products to auction yet. Create one first!</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Starting Bid ($)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-500 font-semibold">$</span>
            </div>
            <input 
              type="number" 
              required 
              min="0"
              step="0.01"
              placeholder="5.00"
              value={formData.start_price}
              onChange={(e) => setFormData({...formData, start_price: e.target.value})}
              className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-end mb-1">
            <label className="block text-xs font-bold text-gray-700">Duration (minutes)</label>
          </div>
          <div className="flex items-center gap-4">
            <input 
              type="range" 
              min="15" 
              max="1440" 
              step="15"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-700"
            />
          </div>
          <div className="text-center mt-3">
            <span className="text-sm font-bold text-green-700 tracking-wider">
              {formData.duration_minutes} mins
            </span>
          </div>
        </div>

        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg mt-auto">
          <p className="text-xs text-amber-800">
            <strong>Note:</strong> Auctions are binding once started. Ensure you have the stock available for immediate delivery.
          </p>
        </div>

        <div className="pt-2">
          <button 
            type="submit" 
            disabled={loading || products.length === 0}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Launching..." : "Launch Auction"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StartAuctionForm;
