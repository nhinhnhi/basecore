import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/Authcontext';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:5001/api';

const CouponBanner = () => {
    const { isAuthenticated, token, user } = useAuth();
    const navigate = useNavigate();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [savingId, setSavingId] = useState(null);
    const [messages, setMessages] = useState({});

    // Hàm tải danh sách coupon
    const loadCoupons = async () => {
        setLoading(true);
        try {
            const tk = token || localStorage.getItem('token');
            if (!tk) {
                console.warn('No token found, skip loading coupons');
                setCoupons([]);
                setLoading(false);
                return;
            }
            const res = await axios.get(`${API_BASE}/Coupons/available-with-status`, {
                headers: { Authorization: `Bearer ${tk}` }
            });
            console.log('✅ Coupons loaded:', res.data);
            setCoupons(res.data || []);
        } catch (error) {
            console.error('❌ Load coupons error:', error);
            setCoupons([]);
        } finally {
            setLoading(false);
        }
    };

    // Hàm lưu coupon
    const handleSave = async (coupon) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (!coupon.canSave) {
            console.warn('Cannot save coupon:', coupon.code, ' - condition not met');
            return;
        }

        setSavingId(coupon.id);
        setMessages(prev => ({ ...prev, [coupon.id]: null }));

        try {
            const tk = token || localStorage.getItem('token');
            if (!tk) {
                throw new Error('Vui lòng đăng nhập lại');
            }

            console.log(`📤 Saving coupon ${coupon.code} (id: ${coupon.id})`);
            const response = await axios.post(
                `${API_BASE}/Coupons/save`,
                { couponId: coupon.id },
                {
                    headers: {
                        Authorization: `Bearer ${tk}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ Save success:', response.data);
            setMessages(prev => ({
                ...prev,
                [coupon.id]: { type: 'success', text: '✓ Đã lưu vào ví voucher!' }
            }));

            // Tải lại danh sách để cập nhật trạng thái
            await loadCoupons();

        } catch (error) {
            console.error('❌ Save error:', error);

            let errorMsg = 'Không thể lưu voucher. Vui lòng thử lại sau.';
            if (error.response) {
                // Server trả về lỗi
                const serverMsg = error.response.data?.message;
                if (serverMsg) {
                    errorMsg = serverMsg;
                } else {
                    // Fallback theo status code
                    if (error.response.status === 401) {
                        errorMsg = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
                    } else if (error.response.status === 400) {
                        errorMsg = 'Yêu cầu không hợp lệ. Kiểm tra lại thông tin.';
                    } else if (error.response.status === 409) {
                        errorMsg = 'Voucher này đã được lưu trước đó.';
                    }
                }
            } else if (error.request) {
                // Không nhận được response
                errorMsg = 'Không kết nối được server. Kiểm tra kết nối mạng.';
            } else {
                // Lỗi khác
                errorMsg = error.message || 'Đã xảy ra lỗi.';
            }

            setMessages(prev => ({
                ...prev,
                [coupon.id]: { type: 'error', text: errorMsg }
            }));
        } finally {
            setSavingId(null);
        }
    };

    const fmt = (n) => Number(n || 0).toLocaleString('vi-VN');

    // Tính % tiến độ chi tiêu (cho thanh progress)
    const getProgress = (coupon) => {
        if (coupon.minOrderValue <= 0) return 100;
        return Math.min(100, Math.round((coupon.userTotalSpent / coupon.minOrderValue) * 100));
    };

    if (!isAuthenticated) {
        // Khách chưa đăng nhập: hiển thị banner mời đăng nhập
        return (
            <div style={{
                background: 'linear-gradient(135deg, #6c3483, #2980b9)',
                borderRadius: 10, padding: '20px 24px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: 12, margin: '16px 0'
            }}>
                <div>
                    <div style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>🎁 Ưu đãi đặc biệt dành cho bạn</div>
                    <div style={{ color: 'rgba(255,255,255,.8)', fontSize: 13, marginTop: 4 }}>
                        Đăng nhập để xem và lưu các mã giảm giá độc quyền
                    </div>
                </div>
                <button onClick={() => navigate('/login')} style={{
                    background: '#fff', color: '#6c3483', fontWeight: 700,
                    border: 'none', borderRadius: 6, padding: '10px 24px',
                    cursor: 'pointer', fontSize: 14
                }}>
                    Đăng nhập ngay
                </button>
            </div>
        );
    }

    if (loading) return (
        <div style={{ textAlign: 'center', padding: '20px 0', color: '#888' }}>
            <span>Đang tải voucher...</span>
        </div>
    );

    if (!coupons.length) return null;

    return (
        <div style={{ margin: '16px 0' }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #6c3483, #2980b9)',
                borderRadius: '10px 10px 0 0', padding: '14px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
                <div>
                    <div style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>🎁 Ưu đãi đặc biệt</div>
                    <div style={{ color: 'rgba(255,255,255,.8)', fontSize: 12, marginTop: 2 }}>
                        Lưu voucher về ví để dùng khi thanh toán
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {coupons.filter(c => c.isSaved).map(c => (
                        <span key={c.id} style={{
                            background: 'rgba(255,255,255,.2)', color: '#fff',
                            borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700
                        }}>
                            🏷 {c.code}
                        </span>
                    ))}
                </div>
            </div>

            {/* Coupon cards */}
            <div style={{
                background: '#f8f9fa', border: '1px solid #e0e0e0',
                borderTop: 'none', borderRadius: '0 0 10px 10px',
                padding: 16,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: 12
            }}>
                {coupons.map(coupon => {
                    const progress = getProgress(coupon);
                    const msg = messages[coupon.id];

                    return (
                        <div key={coupon.id} style={{
                            background: '#fff',
                            border: `2px solid ${coupon.isSaved ? '#27ae60' : coupon.canSave ? '#f5371e' : '#e0e0e0'}`,
                            borderRadius: 10, overflow: 'hidden',
                            opacity: coupon.isSaved || coupon.canSave ? 1 : 0.75
                        }}>
                            {/* Top strip màu */}
                            <div style={{
                                height: 5,
                                background: coupon.isSaved ? '#27ae60' : coupon.canSave ? '#f5371e' : '#ccc'
                            }} />

                            <div style={{ padding: '12px 14px' }}>
                                {/* Mã và tên */}
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                                    <div>
                                        <div style={{
                                            fontFamily: 'monospace', fontWeight: 800,
                                            fontSize: 16, color: '#f5371e', letterSpacing: 1
                                        }}>{coupon.code}</div>
                                        <div style={{ fontWeight: 700, fontSize: 13, color: '#333', marginTop: 2 }}>
                                            {coupon.name}
                                        </div>
                                    </div>
                                    {/* Badge giảm */}
                                    <div style={{
                                        background: coupon.discountType === 'percentage' ? '#fff0ee' : '#fff8e1',
                                        border: `1px solid ${coupon.discountType === 'percentage' ? '#f5c6c6' : '#ffe082'}`,
                                        borderRadius: 6, padding: '4px 8px', textAlign: 'center', flexShrink: 0
                                    }}>
                                        <div style={{
                                            fontWeight: 800, fontSize: 15,
                                            color: coupon.discountType === 'percentage' ? '#f5371e' : '#f39c12'
                                        }}>
                                            {coupon.discountType === 'percentage'
                                                ? `${coupon.discountValue}%`
                                                : `-${fmt(coupon.discountValue)}đ`}
                                        </div>
                                        <div style={{ fontSize: 10, color: '#888' }}>
                                            {coupon.discountType === 'percentage' ? 'phần trăm' : 'tiền mặt'}
                                        </div>
                                    </div>
                                </div>

                                {/* Điều kiện */}
                                <div style={{ fontSize: 12, color: '#888', marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {coupon.minOrderValue > 0 && (
                                        <span>Đơn tối thiểu: <strong>{fmt(coupon.minOrderValue)}đ</strong></span>
                                    )}
                                    {coupon.discountType === 'percentage' && coupon.maxDiscountAmount > 0 && (
                                        <span>Giảm tối đa: <strong>{fmt(coupon.maxDiscountAmount)}đ</strong></span>
                                    )}
                                </div>

                                {/* Hiệu lực */}
                                <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>
                                    HSD: {new Date(coupon.validUntil).toLocaleDateString('vi-VN')}
                                    {' · '}
                                    Còn {coupon.usageLimit > 0 ? coupon.usageLimit - coupon.usedCount : '∞'} lượt
                                </div>

                                {/* Thanh tiến độ chi tiêu (chỉ hiện nếu chưa đủ điều kiện) */}
                                {!coupon.isSaved && coupon.minOrderValue > 0 && (
                                    <div style={{ marginTop: 10 }}>
                                        <div style={{
                                            display: 'flex', justifyContent: 'space-between',
                                            fontSize: 11, color: '#888', marginBottom: 4
                                        }}>
                                            <span>Đã mua: {fmt(coupon.userTotalSpent)}đ</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <div style={{
                                            height: 5, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                height: '100%', width: `${progress}%`,
                                                background: progress >= 100 ? '#27ae60' : '#f5371e',
                                                borderRadius: 3, transition: 'width .4s'
                                            }} />
                                        </div>
                                    </div>
                                )}

                                {/* Thông báo trạng thái điều kiện */}
                                <div style={{
                                    marginTop: 8, fontSize: 12, fontWeight: 600,
                                    color: coupon.isSaved ? '#27ae60' : coupon.canSave ? '#27ae60' : '#e67e22'
                                }}>
                                    {coupon.isSaved
                                        ? '✓ Đã lưu vào ví voucher'
                                        : coupon.canSave
                                            ? '✓ Bạn đủ điều kiện lưu voucher này!'
                                            : `⚠ ${coupon.conditionNote}`}
                                </div>

                                {/* Thông báo sau khi bấm lưu */}
                                {msg && (
                                    <div style={{
                                        marginTop: 6, fontSize: 12, padding: '4px 8px', borderRadius: 4,
                                        background: msg.type === 'success' ? '#eafaf1' : '#fff5f5',
                                        color: msg.type === 'success' ? '#27ae60' : '#e74c3c',
                                        border: `1px solid ${msg.type === 'success' ? '#a9dfbf' : '#f5c6c6'}`
                                    }}>
                                        {msg.text}
                                    </div>
                                )}

                                {/* Nút */}
                                <button
                                    onClick={() => handleSave(coupon)}
                                    disabled={coupon.isSaved || !coupon.canSave || savingId === coupon.id}
                                    style={{
                                        marginTop: 10, width: '100%', padding: '9px 0',
                                        borderRadius: 6, border: 'none', fontWeight: 700,
                                        fontSize: 13, cursor: coupon.canSave && !coupon.isSaved ? 'pointer' : 'not-allowed',
                                        background: coupon.isSaved ? '#eafaf1'
                                            : coupon.canSave ? '#f5371e' : '#f0f0f0',
                                        color: coupon.isSaved ? '#27ae60'
                                            : coupon.canSave ? '#fff' : '#aaa',
                                        transition: 'all .2s'
                                    }}
                                >
                                    {savingId === coupon.id ? '...' :
                                     coupon.isSaved ? '✓ Đã lưu' :
                                     coupon.canSave ? '🏷 Lưu voucher' :
                                     'Chưa đủ điều kiện'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CouponBanner;