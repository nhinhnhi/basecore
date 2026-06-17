import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const MainLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, isAdmin } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <div className="wrapper">
            {/* Navbar */}
            <nav className="main-header navbar navbar-expand navbar-white navbar-light">
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <a className="nav-link" data-widget="pushmenu" href="#" role="button">
                            <i className="fas fa-bars"></i>
                        </a>
                    </li>
                    {user?.role === 'admin' && (
                        <li className="nav-item d-none d-sm-inline-block">
                            <Link to="/" className="nav-link">Home</Link>
                        </li>
                    )}
                </ul>

                <ul className="navbar-nav ml-auto">
                    <li className="nav-item dropdown">
                        <a className="nav-link" data-toggle="dropdown" href="#">
                            <i className="far fa-user"></i> {user?.fullName || user?.userName || user?.username}
                        </a>
                        <div className="dropdown-menu dropdown-menu-right">
                            <span className="dropdown-item dropdown-header">
                                {user?.email}
                            </span>
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item" onClick={handleLogout}>
                                <i className="fas fa-sign-out-alt mr-2"></i> Logout
                            </button>
                        </div>
                    </li>
                    {user?.role === 'admin' && (
                        <li className="nav-item">
                            <a className="nav-link" href="http://localhost:5173" target="_blank" rel="noopener noreferrer">
                                <i className="fas fa-store"></i> Cửa hàng
                            </a>
                        </li>
                    )}
                </ul>
            </nav>

            {/* Sidebar (giữ nguyên) */}
            <aside className="main-sidebar sidebar-dark-primary elevation-4">
                <Link to={user?.role === 'manufacturer' ? '/manufacturer/products' : '/'} className="brand-link">
                    <span className="brand-text font-weight-light ml-3">
                        <b>Store</b> Sales
                    </span>
                </Link>

                <div className="sidebar">
                    <div className="user-panel mt-3 pb-3 mb-3 d-flex">
                        <div className="image">
                            <i className="fas fa-user-circle fa-2x text-light"></i>
                        </div>
                        <div className="info">
                            <Link to="#" className="d-block">{user?.fullName || user?.userName || user?.username}</Link>
                        </div>
                    </div>

                    <nav className="mt-2">
                        <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu">
                            {user?.role === 'admin' && (
                                <>
                                    <li className="nav-item">
                                        <Link to="/" className={`nav-link ${isActive('/')}`}>
                                            <i className="nav-icon fas fa-tachometer-alt"></i>
                                            <p>Bảng điều khiển</p>
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to="/products" className={`nav-link ${isActive('/products')}`}>
                                            <i className="nav-icon fas fa-box"></i>
                                            <p>Sản Phẩm</p>
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to="/categories" className={`nav-link ${isActive('/categories')}`}>
                                            <i className="nav-icon fas fa-tags"></i>
                                            <p>Danh mục</p>
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to="/brands" className={`nav-link ${isActive('/brands')}`}>
                                            <i className="nav-icon fas fa-trademark"></i>
                                            <p>Thương hiệu</p>
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to="/users" className={`nav-link ${isActive('/users')}`}>
                                            <i className="nav-icon fas fa-users"></i>
                                            <p>Khách hàng</p>
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to="/orders" className={`nav-link ${isActive('/orders')}`}>
                                            <i className="nav-icon fas fa-shopping-cart"></i>
                                            <p>Đơn hàng</p>
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to="/inventory" className={`nav-link ${isActive('/inventory')}`}>
                                            <i className="nav-icon fas fa-warehouse"></i>
                                            <p>Tồn kho</p>
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to="/coupons" className={`nav-link ${isActive('/coupons')}`}>
                                            <i className="nav-icon fas fa-ticket-alt"></i>
                                            <p>Mã giảm giá</p>
                                        </Link>
                                    </li>
                                </>
                            )}
                            {user?.role === 'manufacturer' && (
                                <li className="nav-item">
                                    <Link to="/manufacturer/products" className={`nav-link ${isActive('/manufacturer/products')}`}>
                                        <i className="nav-icon fas fa-box"></i>
                                        <p>Sản phẩm của tôi</p>
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </nav>
                </div>
            </aside>

            {/* Content */}
            {children}

            {/* Footer */}
            <footer className="main-footer">
                <strong>Copyright &copy; 2024 <a href="#">BaseCore Sales</a>.</strong>
                <div className="float-right d-none d-sm-inline-block">
                    <b>Version</b> 1.0.0
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;