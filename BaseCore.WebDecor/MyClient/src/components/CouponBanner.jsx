// MyClient/src/components/CouponBanner.jsx
import React, { useState, useEffect } from 'react';
import { couponApi } from '../services/api';
import { useAuth } from '../contexts/Authcontext';

const CouponBanner = () => {
    const [coupons, setCoupons] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [savedMessage, setSavedMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { isAuthenticated, token } = useAuth();

    useEffect(() => {
        loadActiveCoupons();
    }, []);

    const loadActiveCoupons = async () => {
        try {
            const res = await couponApi.getActiveCoupons();
            console.log('Coupons loaded:', res.data);
            setCoupons(res.data || []);
        } catch (err) {
            console.error('Lỗi tải coupon:', err);
        }
    };

    const handleSaveCoupon = async (coupon) => {
        // Kiểm tra đăng nhập
        if (!isAuthenticated) {
            setSelectedCoupon(coupon);
            setShowModal(true);
            return;
        }

        // Kiểm tra token
        const tk = token || localStorage.getItem('token');
        if (!tk) {
            setSelectedCoupon(coupon);
            setShowModal(true);
            return;
        }

        setLoading(true);
        try {
            console.log('Saving coupon:', coupon.id, coupon.code);
            const response = await couponApi.save(coupon.id);
            console.log('Save response:', response.data);
            
            setSavedMessage(`✅ Đã lưu mã ${coupon.code} vào tài khoản của bạn!`);
            setTimeout(() => setSavedMessage(''), 3000);
        } catch (err) {
            console.error('Save coupon error:', err);
            console.error('Error response:', err.response);
            
            let errorMessage = 'Lưu mã thất bại';
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.status === 401) {
                errorMessage = 'Vui lòng đăng nhập lại';
                setSelectedCoupon(coupon);
                setShowModal(true);
                return;
            } else if (err.response?.status === 404) {
                errorMessage = 'Mã giảm giá không tồn tại';
            } else if (err.response?.status === 400) {
                errorMessage = err.response.data.message || 'Mã giảm giá không khả dụng';
            }
            
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code);
        alert(`Đã sao chép mã ${code}`);
    };

    if (coupons.length === 0) return null;

    // Format số tiền
    const formatCurrency = (value) => {
        return (value || 0).toLocaleString('vi-VN') + 'đ';
    };

    return (
        <>
            {/* Banner Coupon chính */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                marginBottom: '30px',
                overflow: 'hidden'
            }}>
                <div className="container py-4">
                    <div className="row align-items-center">
                        <div className="col-md-8">
                            <h3 className="text-white mb-2">
                                <i className="fas fa-gift me-2"></i>
                                Ưu đãi đặc biệt
                            </h3>
                            <p className="text-white-50 mb-0">
                                Nhận ngay mã giảm giá cho đơn hàng của bạn!
                            </p>
                        </div>
                        <div className="col-md-4 text-md-end mt-3 mt-md-0">
                            <div className="d-flex gap-2 justify-content-md-end">
                                {coupons.slice(0, 2).map(coupon => (
                                    <button
                                        key={coupon.id}
                                        className="btn btn-light"
                                        onClick={() => copyToClipboard(coupon.code)}
                                        style={{ fontWeight: 'bold' }}
                                    >
                                        <i className="fas fa-tag me-1"></i>
                                        {coupon.code}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Danh sách coupon */}
            <div className="row mb-4">
                {coupons.map(coupon => (
                    <div key={coupon.id} className="col-md-4 col-lg-3 mb-3">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body text-center">
                                <div style={{
                                    background: '#f8f9fa',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    fontFamily: 'monospace',
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    letterSpacing: '2px'
                                }}>
                                    {coupon.code}
                                </div>
                                <h6 className="mt-2 mb-2">{coupon.name}</h6>
                                <p className="small text-muted">{coupon.description}</p>
                                <div className="mb-2">
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
                                <button
                                    className="btn btn-sm btn-outline-primary w-100"
                                    onClick={() => handleSaveCoupon(coupon)}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="spinner-border spinner-border-sm me-1"></span>
                                    ) : (
                                        <i className="fas fa-save me-1"></i>
                                    )}
                                    Lưu voucher
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Thông báo */}
            {savedMessage && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <i className="fas fa-check-circle me-2"></i>
                    {savedMessage}
                    <button type="button" className="btn-close" onClick={() => setSavedMessage('')}></button>
                </div>
            )}

            {/* Modal yêu cầu đăng nhập */}
            {showModal && selectedCoupon && (
                <div className="modal fade show" style={{ display: 'block', zIndex: 1050 }} tabIndex="-1">
                    <div className="modal-dialog modal-sm">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">Yêu cầu đăng nhập</h5>
                                <button type="button" className="btn-close text-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body text-center py-4">
                                <i className="fas fa-heart text-danger" style={{ fontSize: '48px' }}></i>
                                <p className="mt-3">Vui lòng đăng nhập để lưu voucher <strong>{selectedCoupon.code}</strong></p>
                                <small className="text-muted">Đăng nhập ngay để nhận ưu đãi!</small>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Để sau</button>
                                <a href="/login" className="btn btn-primary">Đăng nhập ngay</a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showModal && <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>}
        </>
    );
};

export default CouponBanner;