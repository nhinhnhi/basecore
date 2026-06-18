import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute'; // Thêm import PublicRoute
import OrderSuccess from './pages/OrderSuccess';
import OrderDetail from './pages/OrderDetail';
import VoucherCenter from './pages/VoucherCenter';
import News from './pages/News';
import Services from './pages/Services';
import Video from './pages/Video';
import NewsDetail from './pages/NewsDetail';
import ServiceDetail from './pages/ServiceDetail';

function App() {
    return (
        <>
            <Navbar />
            <main className="min-vh-100">
                <Routes>
                    {/* Các route công khai */}
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
                    <Route path="/order/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
                    <Route path="/vouchers" element={<ProtectedRoute><VoucherCenter /></ProtectedRoute>} />
                    
                    {/* Route đăng nhập/đăng ký chỉ dành cho chưa đăng nhập */}
                    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                    
                    {/* Các route yêu cầu đăng nhập */}
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                    <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />

                    <Route path="/news" element={<News />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/video" element={<Video />} />
                    <Route path="/news/:id" element={<NewsDetail />} />
                    <Route path="/services/:id" element={<ServiceDetail />} />

                </Routes>
            </main>
            <Footer />
        </>
    );
}

export default App;