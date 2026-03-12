import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogOut, User, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const navLink = "text-sm font-medium text-gray-600 hover:text-green-700 transition-colors whitespace-nowrap";

  const guestLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
    { to: '/products?filter=auction', label: 'Auctions' },
  ];

  const buyerLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
    { to: '/products?filter=auction', label: 'Auctions' },
    { to: '/orders', label: 'Orders' },
    { to: '/buyer-dashboard', label: 'Dashboard' },
  ];

  const farmerLinks = [
    { to: '/', label: 'Home' },
    { to: '/farmer-dashboard', label: 'Dashboard' },
    { to: '/farmer-dashboard?tab=products', label: 'My Products' },
    { to: '/farmer-dashboard?tab=auctions', label: 'My Auctions' },
  ];

  const adminLinks = [
    { to: '/', label: 'Home' },
    { to: '/admin', label: 'Admin Panel' },
    { to: '/admin?tab=users', label: 'Users' },
    { to: '/admin?tab=products', label: 'Products' },
    { to: '/admin?tab=auctions', label: 'Auctions' },
  ];

  const getLinks = () => {
    if (!isAuthenticated) return guestLinks;
    if (user?.role === 'buyer') return buyerLinks;
    if (user?.role === 'farmer') return farmerLinks;
    if (user?.role === 'admin') return adminLinks;
    return guestLinks;
  };

  const links = getLinks();

  return (
    <nav className="bg-white border-b border-gray-100 h-16 fixed w-full top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0" onClick={() => setMobileOpen(false)}>
          <div className="w-9 h-9 rounded-xl bg-green-700 flex items-center justify-center text-white font-black text-sm shadow-sm">
            F2H
          </div>
          <span className="font-extrabold text-xl text-gray-900 tracking-tight hidden sm:block">Farm<span className="text-green-700">2</span>Home</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map(l => <Link key={l.to + l.label} to={l.to} className={navLink}>{l.label}</Link>)}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {isAuthenticated && user?.role === 'buyer' && (
            <Link to="/cart" className="relative p-2 text-gray-500 hover:text-gray-900">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
          )}

          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                <User className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-semibold">{user?.name?.split(' ')[0]}</span>
                <span className="text-gray-400 text-xs capitalize">({user?.role})</span>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm font-bold text-gray-600 hover:text-red-600 bg-gray-100 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-green-700 px-3 py-2 rounded-lg transition-colors">Login</Link>
              <Link to="/register" className="text-sm font-bold bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-full transition-colors shadow-sm">Register</Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button onClick={() => setMobileOpen(o => !o)} className="md:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-100 shadow-lg z-50 py-4 px-4 space-y-1">
          {links.map(l => (
            <Link key={l.to + l.label} to={l.to} onClick={() => setMobileOpen(false)}
              className="block font-medium text-gray-700 hover:text-green-700 hover:bg-green-50 px-4 py-3 rounded-xl transition-colors">
              {l.label}
            </Link>
          ))}
          <div className="border-t border-gray-100 pt-3 mt-3">
            {isAuthenticated ? (
              <button onClick={handleLogout} className="w-full text-left font-bold text-red-600 hover:bg-red-50 px-4 py-3 rounded-xl transition-colors flex items-center gap-2">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            ) : (
              <div className="space-y-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-center font-semibold text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl hover:bg-gray-50">Login</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block text-center font-bold text-white bg-green-700 px-4 py-2.5 rounded-xl hover:bg-green-800">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
