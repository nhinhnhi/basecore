import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Users from './pages/Users';
import Categories from './pages/Categories';
import Orders from './pages/Orders';
import Brands from './pages/Brands';
import ManufacturerProducts from './pages/ManufacturerProducts';
import OrderDetail from './pages/OrderDetail';
import Inventory from './pages/Inventory';
import Coupons from './pages/Coupon';

const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
    }
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }
    return children;
};

// Component chuyển hướng dựa trên role
const HomeRedirect = () => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    if (user?.role === 'manufacturer') {
        return <Navigate to="/manufacturer/products" replace />;
    }
    return <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute adminOnly={true}><MainLayout><Products /></MainLayout></ProtectedRoute>} />
            <Route path="/categories" element={<ProtectedRoute adminOnly={true}><MainLayout><Categories /></MainLayout></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute adminOnly={true}><MainLayout><Users /></MainLayout></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute adminOnly={true}><MainLayout><Orders /></MainLayout></ProtectedRoute>} />
            <Route path="/brands" element={<ProtectedRoute adminOnly={true}><MainLayout><Brands /></MainLayout></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute adminOnly={true}><MainLayout><Inventory /></MainLayout></ProtectedRoute>} />
            <Route path="/coupons" element={<ProtectedRoute adminOnly={true}><MainLayout><Coupons /></MainLayout></ProtectedRoute>} />
            <Route path="/order/:id" element={<ProtectedRoute><MainLayout><OrderDetail /></MainLayout></ProtectedRoute>} />
            <Route path="/manufacturer/products" element={<ProtectedRoute roles={['manufacturer']}><MainLayout><ManufacturerProducts /></MainLayout></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </Router>
    );
}

export default App;