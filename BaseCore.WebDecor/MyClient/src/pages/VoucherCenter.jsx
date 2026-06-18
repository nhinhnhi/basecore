// src/pages/VoucherCenter.jsx
import React, { useState, useEffect } from 'react';
import { couponApi } from '../services/api';
import { useAuth } from '../contexts/Authcontext';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const VoucherCenter = () => {
    const { isAuthenticated, token, user } = useAuth(); // 👈 lấy token
    const [myCoupons, setMyCoupons] = useState([]);
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('my');
    const [savingId, setSavingId] = useState(null);
    const [messages, setMessages] = useState({});

    useEffect(() => {
        if (isAuthenticated) {
            loadData();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Đảm bảo token được gửi qua interceptor hoặc header
            const [myRes, availRes] = await Promise.all([
                couponApi.getMyCoupons(),
                couponApi.getActiveCoupons()
            ]);
            setMyCoupons(myRes.data || []);
            setAvailableCoupons(availRes.data || []);
        } catch (err) {
            console.error('❌ Lỗi tải voucher:', err);
            // Nếu lỗi 401 (unauthorized), có thể token hết hạn
            if (err.response?.status === 401) {
                alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                // Có thể điều hướng về login nếu muốn
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCoupon = async (coupon) => {
        if (!isAuthenticated) {
            alert('Vui lòng đăng nhập để lưu voucher');
            return;
        }

        setSavingId(coupon.id);
        setMessages(prev => ({ ...prev, [coupon.id]: null }));

        try {
            // Kiểm tra token tồn tại
            const tk = token || localStorage.getItem('token');
            if (!tk) {
                throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại.');
            }

            console.log(`📤 Đang lưu mã ${coupon.code} (id: ${coupon.id})`);

            // Gọi API lưu
            const response = await couponApi.saveCoupon(coupon.id);

            console.log('✅ Lưu thành công:', response.data);
            setMessages(prev => ({
                ...prev,
                [coupon.id]: { type: 'success', text: '✅ Đã lưu mã thành công!' }
            }));

            // Tải lại danh sách
            await loadData();

        } catch (err) {
            console.error('❌ Lỗi lưu voucher:', err);

            let errorMsg = 'Không thể lưu voucher. Vui lòng thử lại.';
            if (err.response) {
                // Lỗi từ server
                const serverMsg = err.response.data?.message;
                if (serverMsg) {
                    errorMsg = serverMsg;
                } else if (err.response.status === 401) {
                    errorMsg = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
                } else if (err.response.status === 400) {
                    errorMsg = 'Yêu cầu không hợp lệ. Kiểm tra lại thông tin.';
                } else if (err.response.status === 409) {
                    errorMsg = 'Voucher này đã được lưu trước đó.';
                }
            } else if (err.request) {
                errorMsg = 'Không kết nối được server. Kiểm tra kết nối mạng.';
            } else {
                errorMsg = err.message || 'Đã xảy ra lỗi.';
            }

            setMessages(prev => ({
                ...prev,
                [coupon.id]: { type: 'error', text: errorMsg }
            }));
        } finally {
            setSavingId(null);
        }
    };

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        alert(`Đã sao chép mã: ${code}`);
    };

    const formatCurrency = (value) => (value || 0).toLocaleString('vi-VN') + 'đ';

    if (loading) {
        return (
            <div className="container" style={{ padding: '30px 0' }}>
                <div className="text-center py-5">
                    <div className="spinner-border text-primary"></div>
                    <p>Đang tải voucher...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="container" style={{ padding: '30px 0' }}>
                <div style={{ display: 'flex', gap: 30 }}>
                    <Sidebar />
                    <main style={{ flex: 1, textAlign: 'center', padding: '40px 0' }}>
                        <i className="fas fa-lock" style={{ fontSize: 64, color: '#ccc' }}></i>
                        <h4 className="mt-3">Vui lòng đăng nhập để xem voucher</h4>
                        <Link to="/login" className="btn btn-primary mt-3">Đăng nhập</Link>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '30px 0' }}>
            <nav style={{ fontSize: 14, marginBottom: 20 }}>
                <Link to="/" style={{ color: '#1a5276', textDecoration: 'none' }}>Trang chủ</Link>
                <span style={{ margin: '0 8px', color: '#888' }}>›</span>
                <span style={{ color: '#333' }}>Kho voucher</span>
            </nav>

            <div style={{ display: 'flex', gap: 30 }}>
                <Sidebar />
                <main style={{ flex: 1 }}>
                    <h2 className="mb-4" style={{ color: '#1a5276', borderBottom: '2px solid #e8e8e8', paddingBottom: 10 }}>
                        <i className="fas fa-ticket-alt me-2 text-primary"></i>
                        Kho voucher của bạn
                    </h2>

                    {/* Tab buttons */}
                    <ul className="nav nav-tabs mb-4">
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'my' ? 'active' : ''}`}
                                onClick={() => setActiveTab('my')}
                            >
                                <i className="fas fa-wallet me-1"></i>
                                Voucher của tôi ({myCoupons.length})
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'available' ? 'active' : ''}`}
                                onClick={() => setActiveTab('available')}
                            >
                                <i className="fas fa-gift me-1"></i>
                                Nhận voucher ({availableCoupons.length})
                            </button>
                        </li>
                    </ul>

                    {/* My Coupons Tab */}
                    {activeTab === 'my' && (
                        <div className="row">
                            {myCoupons.length === 0 ? (
                                <div className="col-12 text-center py-5">
                                    <i className="fas fa-folder-open" style={{ fontSize: '64px', color: '#ccc' }}></i>
                                    <p className="mt-3">Bạn chưa có voucher nào</p>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setActiveTab('available')}
                                    >
                                        Nhận voucher ngay
                                    </button>
                                </div>
                            ) : (
                                myCoupons.map(uc => (
                                    <div key={uc.id} className="col-md-6 mb-3">
                                        <div className="card border-0 shadow-sm">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <div className="coupon-code mb-2" style={{
                                                            background: '#e8f0fe',
                                                            padding: '6px 12px',
                                                            borderRadius: '6px',
                                                            display: 'inline-block',
                                                            fontFamily: 'monospace',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {uc.coupon.code}
                                                        </div>
                                                        <h6 className="mt-2">{uc.coupon.name}</h6>
                                                        <p className="small text-muted mb-1">{uc.coupon.description}</p>
                                                        <div className="mt-2">
                                                            {uc.coupon.discountType === 'percentage' ? (
                                                                <span className="badge bg-danger">Giảm {uc.coupon.discountValue}%</span>
                                                            ) : (
                                                                <span className="badge bg-warning">Giảm {formatCurrency(uc.coupon.discountValue)}</span>
                                                            )}
                                                            {uc.coupon.minOrderValue > 0 && (
                                                                <span className="badge bg-secondary ms-1">
                                                                    Đơn tối thiểu {formatCurrency(uc.coupon.minOrderValue)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="small text-muted mt-2">
                                                            <i className="fas fa-calendar-alt me-1"></i>
                                                            HSD: {new Date(uc.coupon.validUntil).toLocaleDateString('vi-VN')}
                                                        </p>
                                                    </div>
                                                    <button
                                                        className="btn btn-sm btn-outline-success"
                                                        onClick={() => copyCode(uc.coupon.code)}
                                                    >
                                                        <i className="fas fa-copy"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Available Coupons Tab */}
                    {activeTab === 'available' && (
                        <div className="row">
                            {availableCoupons.length === 0 ? (
                                <div className="col-12 text-center py-5">
                                    <i className="fas fa-calendar-times" style={{ fontSize: '64px', color: '#ccc' }}></i>
                                    <p className="mt-3">Hiện tại chưa có chương trình khuyến mãi nào</p>
                                </div>
                            ) : (
                                availableCoupons.map(coupon => (
                                    <div key={coupon.id} className="col-md-6 mb-3">
                                        <div className="card border-0 shadow-sm">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <div className="coupon-code mb-2" style={{
                                                            background: '#fff3cd',
                                                            padding: '6px 12px',
                                                            borderRadius: '6px',
                                                            display: 'inline-block',
                                                            fontFamily: 'monospace',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {coupon.code}
                                                        </div>
                                                        <h6 className="mt-2">{coupon.name}</h6>
                                                        <p className="small text-muted mb-1">{coupon.description}</p>
                                                        <div className="mt-2">
                                                            {coupon.discountType === 'percentage' ? (
                                                                <span className="badge bg-danger">Giảm {coupon.discountValue}%</span>
                                                            ) : (
                                                                <span className="badge bg-warning">Giảm {formatCurrency(coupon.discountValue)}</span>
                                                            )}
                                                            {coupon.minOrderValue > 0 && (
                                                                <span className="badge bg-secondary ms-1">
                                                                    Đơn tối thiểu {formatCurrency(coupon.minOrderValue)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="small text-muted mt-2">
                                                            <i className="fas fa-calendar-alt me-1"></i>
                                                            HSD: {new Date(coupon.validUntil).toLocaleDateString('vi-VN')}
                                                        </p>
                                                        {/* Hiển thị thông báo lỗi nếu có */}
                                                        {messages[coupon.id] && (
                                                            <div className={`mt-2 alert alert-${messages[coupon.id].type === 'success' ? 'success' : 'danger'} py-1`} style={{ fontSize: '13px' }}>
                                                                {messages[coupon.id].text}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button
                                                        className={`btn btn-sm ${savingId === coupon.id ? 'btn-secondary' : 'btn-primary'}`}
                                                        onClick={() => handleSaveCoupon(coupon)}
                                                        disabled={savingId === coupon.id}
                                                    >
                                                        {savingId === coupon.id ? (
                                                            <span className="spinner-border spinner-border-sm" role="status"></span>
                                                        ) : (
                                                            <><i className="fas fa-download me-1"></i>Lưu</>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default VoucherCenter;