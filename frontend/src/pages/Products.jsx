import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, X } from 'lucide-react';

// ─── Product Details Modal ────────────────────────────────────────────────────
const ProductModal = ({ item, onClose, onAddToCart, userRole }) => {
  if (!item) return null;
  const { product, auction } = item;
  const isOnAuction = auction && auction.status === 'active';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative aspect-video bg-gray-100 overflow-hidden rounded-t-3xl">
          <img 
            src={product.image_url ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${product.image_url}` : "/mango-placeholder.jpg"} 
            alt={product.name} 
            className="w-full h-full object-cover" 
          />
          <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors">
            <X className="w-5 h-5" />
          </button>
          {isOnAuction && <div className="absolute top-4 left-4 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">🔥 Live Auction</div>}
        </div>

        <div className="p-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{product.name}</h2>
          <p className="text-gray-500 leading-relaxed mb-6">{product.description || 'No description provided.'}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Price</p>
              <p className="text-2xl font-extrabold text-green-700">₹{(product.price_cents / 100).toFixed(2)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Stock Available</p>
              <p className="text-2xl font-extrabold text-gray-900">{product.stock ?? 'N/A'} units</p>
            </div>
            {isOnAuction && (
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Current Bid</p>
                <p className="text-2xl font-extrabold text-amber-600">₹{(auction.current_price / 100).toFixed(2)}</p>
              </div>
            )}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Farmer ID</p>
              <p className="text-lg font-bold text-gray-700">#{product.farmer_id}</p>
            </div>
          </div>

          <div className="flex gap-3">
            {isOnAuction ? (
              <Link to={`/auction/${auction.id}`} onClick={onClose} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-xl transition-colors text-center">
                View Auction & Bid →
              </Link>
            ) : (
              userRole === 'buyer' && (
                <button onClick={() => { onAddToCart(product); onClose(); }} className="flex-1 bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-6 rounded-xl transition-colors">
                  Add to Cart
                </button>
              )
            )}
            <button onClick={onClose} className="px-6 py-3 border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold rounded-xl transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Products Page ─────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 12;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [addedMessage, setAddedMessage] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const { user } = useAuth();
  const { addToCart } = useCart();

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 1 on filter change
  useEffect(() => { setPage(1); }, [debouncedSearch, filterStatus, sortBy]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [pRes, aRes] = await Promise.all([API.get('/products'), API.get('/auctions')]);
        setProducts(pRes.data || []);
        setAuctions(aRes.data || []);
      } catch (e) {
        console.error(e);
        setError('Failed to load marketplace. Please check your backend connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const enriched = useMemo(() => products.map(product => ({
    product,
    auction: auctions.find(a => a.product_id === product.id && a.status === 'active') || null
  })), [products, auctions]);

  const filtered = useMemo(() => {
    let items = [...enriched];
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      items = items.filter(({ product }) =>
        product.name.toLowerCase().includes(q) ||
        (product.description || '').toLowerCase().includes(q)
      );
    }
    if (filterStatus === 'auction') items = items.filter(({ auction }) => auction !== null);
    else if (filterStatus === 'direct') items = items.filter(({ auction }) => auction === null);

    if (sortBy === 'price_asc') items.sort((a, b) => a.product.price_cents - b.product.price_cents);
    else if (sortBy === 'price_desc') items.sort((a, b) => b.product.price_cents - a.product.price_cents);

    return items;
  }, [enriched, debouncedSearch, filterStatus, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleAddToCart = useCallback((product) => {
    addToCart(product);
    setAddedMessage(`${product.name} added to cart!`);
    setTimeout(() => setAddedMessage(''), 3000);
  }, [addToCart]);

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)]">
      {/* Hero Banner */}
      <div className="bg-green-800 relative py-14 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 2px, transparent 2px)', backgroundSize: '30px 30px' }} />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">Farm2Home Marketplace</h1>
          <p className="text-green-100 text-lg max-w-xl mx-auto mb-8">Fresh produce directly from local farmers.</p>
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products by name or description..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white text-gray-900 shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter + Sort Bar */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal className="w-4 h-4 text-gray-400" />
            {['all', 'auction', 'direct'].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${filterStatus === s ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {s === 'all' ? 'All Products' : s === 'auction' ? '🔥 On Auction' : '🛒 Direct Buy'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-sm border border-gray-200 rounded-lg py-1.5 px-3 focus:ring-green-500 focus:border-green-500 bg-white">
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
            </select>
            <span className="text-sm text-gray-400 font-medium">{filtered.length} items</span>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <div key={i} className="h-[380px] bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : error ? (
          <div className="text-center p-12 bg-red-50 rounded-2xl border border-red-100">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-red-600 font-semibold">{error}</p>
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🌾</div>
            <p className="text-lg font-bold text-gray-700 mb-2">No products found</p>
            <p className="text-gray-400 text-sm mb-6">Try adjusting your search or filters.</p>
            <button onClick={() => { setSearch(''); setFilterStatus('all'); }} className="text-green-700 font-bold hover:underline">Clear all filters</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginated.map(item => (
                <ProductCard
                  key={item.product.id}
                  product={item.product}
                  auction={item.auction}
                  imageUrl={item.product.image_url}
                  onAddToCart={user?.role === 'buyer' ? handleAddToCart : undefined}
                  onViewDetails={() => setSelectedItem(item)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-colors ${page === i + 1 ? 'bg-green-700 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedItem && (
        <ProductModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={handleAddToCart}
          userRole={user?.role}
        />
      )}

      {/* Toast */}
      {addedMessage && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl font-bold z-50 flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 13l4 4L19 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          {addedMessage}
        </div>
      )}
    </div>
  );
};

export default Products;
