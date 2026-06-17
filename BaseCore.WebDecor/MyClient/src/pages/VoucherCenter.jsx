// src/pages/VoucherCenter.jsx
import React, { useState, useEffect } from 'react';
import { couponApi } from '../services/api';
import { useAuth } from '../contexts/Authcontext';

const VoucherCenter = () => {
    const { isAuthenticated } = useAuth();
    const [myCoupons, setMyCoupons] = useState([]);
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('my');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [myRes, availRes] = await Promise.all([
                couponApi.getMyCoupons(),
                couponApi.getActiveCoupons()
            ]);
            setMyCoupons(myRes.data || []);
            setAvailableCoupons(availRes.data || []);
        } catch (err) {
            console.error('Lỗi tải voucher:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCoupon = async (coupon) => {
        if (!isAuthenticated) {
            alert('Vui lòng đăng nhập để lưu voucher');
            return;
        }
        try {
            await couponApi.saveCoupon(coupon.id);
            loadData();
            alert(`✅ Đã lưu mã ${coupon.code} thành công!`);
        } catch (err) {
            alert(err.response?.data?.message || 'Lưu mã thất bại');
        }
    };

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        alert(`Đã sao chép mã: ${code}`);
    };

    const formatCurrency = (value) => (value || 0).toLocaleString('vi-VN') + 'đ';

    if (loading) {
        return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
    }

    return (
        <div className="container mt-4">
            <h2 className="mb-4">
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
                                            </div>
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => handleSaveCoupon(coupon)}
                                            >
                                                <i className="fas fa-download me-1"></i>
                                                Lưu
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default VoucherCenter;