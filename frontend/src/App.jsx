import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Loader } from 'lucide-react';

// Lazy-load all pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Products = lazy(() => import('./pages/Products'));
const Auction = lazy(() => import('./pages/Auction'));
const Cart = lazy(() => import('./pages/Cart'));
const BuyerDashboard = lazy(() => import('./pages/BuyerDashboard'));
const FarmerDashboard = lazy(() => import('./pages/FarmerDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Orders = lazy(() => import('./pages/Orders'));

// Page loader fallback
const PageLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-400">
    <Loader className="w-10 h-10 animate-spin text-green-600 mb-3" />
    <span className="text-sm font-medium">Loading...</span>
  </div>
);

// Protected Route Wrapper with Role-Based Access Control
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
    if (user?.role === 'farmer') return <Navigate to="/farmer-dashboard" replace />;
    if (user?.role === 'buyer') return <Navigate to="/buyer-dashboard" replace />;
    return <Navigate to="/" replace />;
  }
  return children;
};

// Main Layout with Navbar and Footer
const Layout = ({ children }) => (
  <div className="min-h-screen flex flex-col pt-16">
    <Navbar />
    <main className="flex-1 flex flex-col">
      {children}
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<div className="pt-16"><PageLoader /></div>}>
        <Routes>
          {/* Public Routes with Navbar */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/products" element={<Layout><Products /></Layout>} />
          <Route path="/auction/:id" element={<Layout><Auction /></Layout>} />

          {/* Auth Routes (No Navbar) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Buyer Routes */}
          <Route path="/buyer-dashboard" element={
            <ProtectedRoute requiredRole="buyer">
              <Layout><BuyerDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/cart" element={
            <ProtectedRoute requiredRole="buyer">
              <Layout><Cart /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute requiredRole="buyer">
              <Layout><Orders /></Layout>
            </ProtectedRoute>
          } />

          {/* Farmer Routes */}
          <Route path="/farmer-dashboard" element={
            <ProtectedRoute requiredRole="farmer">
              <Layout><FarmerDashboard /></Layout>
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <Layout><AdminDashboard /></Layout>
            </ProtectedRoute>
          } />

          {/* 404 Default */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
