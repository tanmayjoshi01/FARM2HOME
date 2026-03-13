import React, { useState } from 'react';
import API from '../services/api';
import { Plus } from 'lucide-react';

const CreateProductForm = ({ onProductCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const priceCents = Math.round(parseFloat(formData.price) * 100);
      const stockInt = parseInt(formData.stock, 10);
      
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('description', formData.description);
      formDataObj.append('price_cents', priceCents);
      formDataObj.append('stock', stockInt);
      
      if (formData.image) {
        formDataObj.append('image', formData.image);
      }
      
      await API.post('/products', formDataObj);
      
      setSuccess(true);
      setFormData({ name: '', description: '', price: '', stock: '', image: null });
      if (onProductCreated) onProductCreated();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center text-green-700">
          <Plus className="w-5 h-5 pointer-events-none" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Create New Product</h3>
      </div>

      {error && <div className="text-red-500 mb-4 text-sm bg-red-50 p-3 rounded">{error}</div>}
      {success && <div className="text-green-600 mb-4 text-sm bg-green-50 p-3 rounded">Product created successfully!</div>}

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Product Name</label>
          <input 
            type="text" 
            required 
            placeholder="e.g. Organic Gala Apples"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
          <textarea 
            rows="3"
            placeholder="Describe the quality, source, and harvest date..."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
          ></textarea>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Base Price (₹)</label>
            <input 
              type="number" 
              required 
              min="0"
              step="0.01"
              placeholder="0.00"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Initial Stock (units)</label>
            <input 
              type="number" 
              required 
              min="1"
              placeholder="e.g. 50"
              value={formData.stock}
              onChange={(e) => setFormData({...formData, stock: e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Product Image</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
        </div>

        <div className="mt-auto pt-4">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-70"
          >
            {loading ? "Listing..." : "List Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProductForm;
