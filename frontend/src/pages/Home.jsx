import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import AuctionCard from '../components/AuctionCard';
import { ArrowRight, Leaf, Gavel, ShoppingBag, Truck } from 'lucide-react';

const Home = () => {
  const [featuredAuctions, setFeaturedAuctions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const [aRes, pRes] = await Promise.all([
          API.get('/auctions'),
          API.get('/products'),
        ]);
        const active = aRes.data.filter(a => a.status === 'active');
        setFeaturedAuctions(active.slice(0, 3));
        setProducts(pRes.data);
      } catch (e) {
        console.error('Failed to load featured auctions', e);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const getProductName = (productId) => {
    const p = products.find(p => p.id === productId);
    return p ? p.name : `Product #${productId}`;
  };

  const steps = [
    { icon: <Leaf className="w-7 h-7" />, color: 'bg-green-100 text-green-700', title: 'Farmers List Products', desc: 'Verified local producers upload their fresh harvest directly to our platform.' },
    { icon: <Gavel className="w-7 h-7" />, color: 'bg-amber-100 text-amber-700', title: 'Auctions Start', desc: 'Farmers set a starting price and duration. Live, transparent bidding begins.' },
    { icon: <ShoppingBag className="w-7 h-7" />, color: 'bg-blue-100 text-blue-700', title: 'Buyers Bid or Buy', desc: 'Follow live auctions, place competitive bids, or buy directly at listed prices.' },
    { icon: <Truck className="w-7 h-7" />, color: 'bg-purple-100 text-purple-700', title: 'Fresh Delivery', desc: 'Highest bidder wins! Farm-fresh produce delivered straight to your door.' },
  ];

  return (
    <div className="bg-white">
      {/* ─── Hero ─── */}
      <section className="relative bg-green-900 overflow-hidden min-h-[560px] flex items-center">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #ffffff 2px, transparent 2px)', backgroundSize: '32px 32px' }}
        />
        {/* decorative green blobs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-700 rounded-full opacity-30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-green-600 rounded-full opacity-20 blur-3xl" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-green-700/60 text-green-200 text-xs font-bold px-4 py-1.5 rounded-full mb-6 border border-green-600/40">
            <Leaf className="w-3.5 h-3.5" /> Farm Fresh, Direct to You
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
            Farm<span className="text-amber-400">2</span>Home
            <span className="block text-3xl md:text-4xl font-bold text-green-200 mt-2">Direct From Local Producers</span>
          </h1>
          <p className="text-green-100 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Fresh produce directly from farmers through auctions and marketplace buying. No middlemen, better prices, healthier food.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/products" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3.5 rounded-full transition-colors shadow-lg">
              Browse Products <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/register" className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-green-900 font-bold px-8 py-3.5 rounded-full transition-colors shadow-lg">
              Start Selling
            </Link>
            <Link to="/products?filter=auction" className="inline-flex items-center gap-2 border-2 border-white/60 hover:border-white text-white hover:bg-white/10 font-bold px-8 py-3.5 rounded-full transition-colors">
              Join Auctions
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ─── */}
      <div className="bg-green-800 py-4">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-center gap-8 md:gap-16 text-center">
          {[['500+', 'Products Listed'], ['150+', 'Farmers'], ['1K+', 'Happy Buyers'], ['Live', 'Auctions Daily']].map(([num, label]) => (
            <div key={label}>
              <div className="text-2xl font-black text-amber-400">{num}</div>
              <div className="text-green-300 text-xs font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── How It Works ─── */}
      <section className="py-24 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-500 max-w-xl mx-auto">A simple, transparent process connecting farmers directly with buyers.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-5`}>
                  {step.icon}
                </div>
                <div className="w-7 h-7 bg-gray-100 rounded-full text-gray-500 text-xs font-black flex items-center justify-center mx-auto mb-3">{i + 1}</div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Auctions ─── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-4xl font-black text-gray-900 mb-2">Featured Auctions</h2>
              <p className="text-gray-500">Live auctions happening right now. Place your bid!</p>
            </div>
            <Link to="/products?filter=auction" className="hidden sm:inline-flex items-center gap-1.5 text-green-700 font-bold hover:text-green-900 transition-colors">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <div key={i} className="h-[380px] bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : featuredAuctions.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl p-16 text-center border border-gray-100">
              <div className="text-5xl mb-4">🔨</div>
              <p className="text-gray-600 font-semibold text-lg mb-2">No Active Auctions Right Now</p>
              <p className="text-gray-400 text-sm mb-6">Check back soon or browse all our products!</p>
              <Link to="/products" className="bg-green-700 hover:bg-green-800 text-white font-bold px-6 py-3 rounded-xl transition-colors">Browse Products</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredAuctions.map(a => (
                <AuctionCard key={a.id} auction={a} productName={getProductName(a.product_id)} productId={a.product_id} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="bg-green-800 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-4">Ready to Get Started?</h2>
          <p className="text-green-200 mb-8">Join thousands of buyers and farmers already using Farm2Home for transparent, fair marketplace trading.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3.5 rounded-full transition-colors shadow-lg">
              Create Account
            </Link>
            <Link to="/products" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-8 py-3.5 rounded-full transition-colors">
              Browse Marketplace
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
