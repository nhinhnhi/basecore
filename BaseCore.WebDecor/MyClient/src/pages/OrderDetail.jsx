import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/Authcontext';

const API_BASE = 'http://localhost:5001/api';

const STATUS_MAP = {
    pending:          { label: 'Chờ xử lý',       color: '#f39c12', bg: '#fef9e7', step: 1 },
    confirmed:        { label: 'Đã xác nhận',      color: '#2980b9', bg: '#eaf2fb', step: 2 },
    processing:       { label: 'Đang xử lý',       color: '#8e44ad', bg: '#f5eef8', step: 2 },
    ready_to_ship:    { label: 'Sẵn sàng giao',    color: '#16a085', bg: '#e8f8f5', step: 3 },
    shipped:          { label: 'Đang giao',         color: '#2471a3', bg: '#eaf2fb', step: 3 },
    delivered:        { label: 'Đã giao',           color: '#27ae60', bg: '#eafaf1', step: 4 },
    cancelled:        { label: 'Đã hủy',            color: '#e74c3c', bg: '#fdf0f0', step: -1 },
    canceled:         { label: 'Đã hủy',            color: '#e74c3c', bg: '#fdf0f0', step: -1 },
    refund_requested: { label: 'Yêu cầu hoàn tiền',color: '#e67e22', bg: '#fef5e7', step: -1 },
    refunded:         { label: 'Đã hoàn tiền',      color: '#e67e22', bg: '#fef5e7', step: -1 },
};
const getStatus = (s = '') => STATUS_MAP[s.toLowerCase()] || { label: s, color: '#888', bg: '#f5f5f5', step: 0 };

const fmt = (n) => Number(n || 0).toLocaleString('vi-VN');

const STEPS = [
    { label: 'Đặt hàng' },
    { label: 'Xác nhận' },
    { label: 'Đang giao' },
    { label: 'Hoàn thành' },
];

const PAY_LABEL = {
    cod: 'Tiền mặt khi nhận hàng',
    bank: 'Chuyển khoản ngân hàng',
    momo: 'Ví MoMo',
    vnpay: 'VNPay',
    zalopay: 'ZaloPay',
};

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancelling, setCancelling] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [showCancelModal, setShowCancelModal] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            const tk = token || localStorage.getItem('token');
            try {
                const res = await axios.get(`${API_BASE}/Orders/${id}`, {
                    headers: { Authorization: `Bearer ${tk}` }
                });
                setData(res.data);
            } catch (err) {
                setError('Không thể tải thông tin đơn hàng');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id, token]);

    const handleCancelOrder = async () => {
        setCancelling(true);
        try {
            const tk = token || localStorage.getItem('token');
            await axios.put(`${API_BASE}/Orders/${id}/cancel`,
                { reason: cancelReason },
                { headers: { Authorization: `Bearer ${tk}` } }
            );
            setShowCancelModal(false);
            window.location.reload();
        } catch (err) {
            alert('Hủy đơn thất bại: ' + (err.response?.data?.message || err.message));
        } finally {
            setCancelling(false);
        }
    };

    const handleReorder = () => {
        if (!items.length) { alert('Không thể mua lại đơn hàng này'); return; }
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        items.forEach(item => {
            const existing = cart.find(p => p.id === item.productId);
            if (existing) existing.quantity = (existing.quantity || 1) + 1;
            else cart.push({
                id: item.productId,
                name: item.productNameSnapshot,
                price: item.unitPrice,
                image: item.imageUrlSnapshot,
                quantity: 1
            });
        });
        localStorage.setItem('cart', JSON.stringify(cart));
        alert('Đã thêm sản phẩm vào giỏ hàng');
        navigate('/cart');
    };

    if (loading) return <div style={{ textAlign:'center', padding:80 }}>Đang tải...</div>;
    if (error)   return <div style={{ textAlign:'center', marginTop:60 }}><h3>{error}</h3><Link to="/orders">← Lịch sử đơn hàng</Link></div>;
    if (!data)   return null;

    const order    = data.order    ?? data;
    const items    = Array.isArray(data.items)    ? data.items    : [];
    const shipment = data.shipment ?? null;
    const payments = Array.isArray(data.payments) ? data.payments : [];
    const coupon   = data.coupon   ?? null;

    const statusRaw   = (order.status || '').toLowerCase();
    const status      = getStatus(statusRaw);
    const currentStep = status.step >= 1 ? status.step : 0;
    // Cho hủy khi pending hoặc confirmed
    const canCancel   = ['pending', 'confirmed'].includes(statusRaw);
    const orderDate   = order.orderDate ? new Date(order.orderDate).toLocaleDateString('vi-VN') : '';
    const estimatedDelivery = order.estimatedDelivery
        ? new Date(order.estimatedDelivery).toLocaleDateString('vi-VN') : null;
    const payMethod   = (order.paymentMethod || '').toLowerCase();
    const payLabel    = PAY_LABEL[payMethod] || payMethod || 'COD';

    const subtotal       = Number(order.subtotal ?? 0);
    const shippingFee    = Number(order.shippingFee ?? 0);
    const discountAmount = Number(order.discountAmount ?? 0);
    const total          = Number(order.total ?? (subtotal + shippingFee - discountAmount));

    return (
        <>
        <style>{`
            .od { max-width:860px; margin:0 auto; padding:24px; font-family:Arial,sans-serif; }
            .od-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
            .od-top h1 { font-size:1.4rem; margin:0; }
            .badge { padding:5px 16px; border-radius:20px; font-size:0.85rem; font-weight:bold; }
            .timeline { display:flex; margin:0 0 24px; }
            .step { flex:1; text-align:center; position:relative; }
            .step:not(:last-child)::after { content:''; position:absolute; top:16px; left:50%; width:100%; height:2px; background:#ddd; z-index:0; }
            .step.completed::after { background:#27ae60; }
            .circle { width:32px; height:32px; border-radius:50%; margin:0 auto 8px; line-height:32px; font-size:0.85rem; position:relative; z-index:1; background:#eee; color:#888; }
            .step.active .circle { background:#1a5276; color:#fff; }
            .step.completed .circle { background:#27ae60; color:#fff; }
            .step-lbl { font-size:0.78rem; color:#666; }
            .step.active .step-lbl, .step.completed .step-lbl { color:#222; font-weight:bold; }
            .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; }
            .card { border:1px solid #e0e0e0; border-radius:8px; padding:16px; }
            .card-title { font-weight:bold; margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid #f0f0f0; }
            .row { display:flex; gap:8px; margin-bottom:8px; font-size:0.9rem; }
            .lbl { color:#888; min-width:130px; flex-shrink:0; }
            .od-table { width:100%; border-collapse:collapse; margin-bottom:12px; }
            .od-table th, .od-table td { padding:10px 12px; text-align:left; border-bottom:1px solid #eee; font-size:0.9rem; }
            .od-table th { background:#f8f8f8; }
            .od-table td.r { text-align:right; }
            .prod-wrap { display:flex; gap:10px; align-items:center; }
            .prod-img { width:52px; height:52px; object-fit:cover; border-radius:4px; border:1px solid #eee; }
            .summary { display:flex; justify-content:flex-end; }
            .summary-box { min-width:280px; }
            .sum-row { display:flex; justify-content:space-between; padding:6px 0; font-size:0.9rem; border-bottom:1px solid #f0f0f0; }
            .sum-row.discount { color:#27ae60; }
            .sum-row.total { font-weight:bold; font-size:1.05rem; color:#e74c3c; border-bottom:none; }
            .actions { display:flex; gap:12px; margin:20px 0; flex-wrap:wrap; }
            .btn { padding:10px 20px; border-radius:6px; border:none; cursor:pointer; font-size:0.9rem; text-decoration:none; display:inline-flex; align-items:center; }
            .btn-cancel { border:2px solid #e74c3c !important; color:#e74c3c; background:#fff; }
            .btn-reorder { background:#1a5276; color:#fff; }
            .btn-back { background:#fff; border:2px solid #1a5276 !important; color:#1a5276; }
            .btn-shop { background:#e74c3c; color:#fff; }
            /* Cancel modal */
            .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.45); display:flex; align-items:center; justify-content:center; z-index:999; }
            .modal-box { background:#fff; border-radius:12px; padding:24px; max-width:400px; width:90%; }
            .modal-box h3 { margin:0 0 12px; font-size:1.1rem; }
            .modal-box textarea { width:100%; border:1px solid #e0e0e0; border-radius:6px; padding:10px; font-size:14px; resize:vertical; min-height:80px; margin-bottom:16px; font-family:inherit; }
            .modal-actions { display:flex; gap:10px; }
            .modal-actions button { flex:1; padding:11px; border-radius:6px; border:none; cursor:pointer; font-weight:700; font-size:14px; }
            .modal-cancel-btn { background:#e74c3c; color:#fff; }
            .modal-close-btn { background:#f5f5f5; color:#555; }
            @media(max-width:600px) { .grid2 { grid-template-columns:1fr; } }
        `}</style>

        <div className="od">
            <div style={{ fontSize:'0.85rem', color:'#888', marginBottom:12 }}>
                <Link to="/">Trang chủ</Link> › <Link to="/orders">Lịch sử đơn hàng</Link> › Chi tiết
            </div>

            <div className="od-top">
                <h1>Đơn hàng #{(order.id || id).toString().slice(0, 8)}</h1>
                <span className="badge" style={{ background:status.bg, color:status.color }}>{status.label}</span>
            </div>

            {/* Timeline */}
            <div className="timeline">
                {STEPS.map((s, idx) => {
                    let cls = '';
                    if (currentStep > idx + 1) cls = 'completed';
                    else if (currentStep === idx + 1) cls = 'active';
                    return (
                        <div key={idx} className={`step ${cls}`}>
                            <div className="circle">{cls === 'completed' ? '✓' : idx + 1}</div>
                            <div className="step-lbl">{s.label}</div>
                        </div>
                    );
                })}
            </div>

            {/* Info grid */}
            <div className="grid2">
                <div className="card">
                    <div className="card-title">Thông tin đơn hàng</div>
                    <div className="row"><span className="lbl">Mã đơn:</span><span style={{ fontSize:'0.8rem', wordBreak:'break-all' }}>#{order.id || id}</span></div>
                    <div className="row"><span className="lbl">Ngày đặt:</span><span>{orderDate || '—'}</span></div>
                    {estimatedDelivery && (
                        <div className="row"><span className="lbl">Dự kiến giao:</span><span style={{ color:'#27ae60', fontWeight:'bold' }}>{estimatedDelivery}</span></div>
                    )}
                    <div className="row"><span className="lbl">Thanh toán:</span><span>{payLabel}</span></div>
                    <div className="row"><span className="lbl">Trạng thái TT:</span>
                        <span style={{ color: order.paymentStatus === 'paid' ? '#27ae60' : '#e74c3c', fontWeight:'bold' }}>
                            {order.paymentStatus === 'paid' ? '✓ Đã thanh toán' : '⏳ Chưa thanh toán'}
                        </span>
                    </div>
                    {coupon && (
                        <div className="row"><span className="lbl">Mã giảm giá:</span>
                            <span style={{ color:'#27ae60' }}>🏷 {coupon.code}</span>
                        </div>
                    )}
                </div>
                <div className="card">
                    <div className="card-title">Địa chỉ giao hàng</div>
                    {/* Hiển thị RecipientName + RecipientPhone mới */}
                    {(order.recipientName || order.recipientPhone) && (
                        <div style={{ fontWeight:'bold', marginBottom:6 }}>
                            {order.recipientName} {order.recipientPhone && `– ${order.recipientPhone}`}
                        </div>
                    )}
                    <div style={{ color:'#555', marginBottom:8 }}>{order.shippingAddress || '—'}</div>
                    {shipment?.trackingNumber && (
                        <div className="row"><span className="lbl">Mã vận đơn:</span><span style={{ fontWeight:'bold' }}>{shipment.trackingNumber}</span></div>
                    )}
                    {shipment?.provider?.name && (
                        <div className="row"><span className="lbl">Đơn vị VC:</span><span>{shipment.provider.name}</span></div>
                    )}
                    {order.customerNote && (
                        <div style={{ marginTop:10, padding:8, background:'#fffbf0', borderRadius:4, fontSize:'0.85rem' }}>
                            <strong>Ghi chú:</strong> {order.customerNote}
                        </div>
                    )}
                </div>
            </div>

            {/* Items */}
            <div className="card" style={{ marginBottom:20 }}>
                <div className="card-title">Sản phẩm đã đặt ({items.length})</div>
                {items.length > 0 ? (
                    <>
                    <table className="od-table">
                        <thead>
                            <tr>
                                <th>Sản phẩm</th>
                                <th>SL</th>
                                <th>Đơn giá</th>
                                <th className="r">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => {
                                const name = item.product?.name || item.productNameSnapshot || 'Sản phẩm';
                                const imgUrl = item.product?.mainImageUrl || item.imageUrlSnapshot || '';
                                const qty = Number(item.quantity ?? 1);
                                const unitPrice = Number(item.unitPrice ?? 0);
                                const subtotalItem = Number(item.subtotal ?? unitPrice * qty);
                                return (
                                    <tr key={item.id || idx}>
                                        <td>
                                            <div className="prod-wrap">
                                                {imgUrl && <img src={imgUrl} className="prod-img" alt={name} onError={e => e.target.style.display='none'} />}
                                                <div>
                                                    <strong>{name}</strong>
                                                    {item.variantInfoSnapshot && <div style={{ fontSize:'0.8rem', color:'#888' }}>{item.variantInfoSnapshot}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td>{qty}</td>
                                        <td>{fmt(unitPrice)}₫</td>
                                        <td className="r">{fmt(subtotalItem)}₫</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <div className="summary">
                        <div className="summary-box">
                            <div className="sum-row"><span>Tạm tính</span><span>{fmt(subtotal)}₫</span></div>
                            <div className="sum-row"><span>Phí vận chuyển</span><span>{fmt(shippingFee)}₫</span></div>
                            {discountAmount > 0 && (
                                <div className="sum-row discount">
                                    <span>Giảm giá{coupon ? ` (${coupon.code})` : ''}</span>
                                    <span>-{fmt(discountAmount)}₫</span>
                                </div>
                            )}
                            <div className="sum-row total"><span>Tổng cộng</span><span>{fmt(total)}₫</span></div>
                        </div>
                    </div>
                    </>
                ) : (
                    <div style={{ padding:24, textAlign:'center', color:'#888' }}>Không có sản phẩm nào</div>
                )}
            </div>

            {/* Payments */}
            {payments.length > 0 && (
                <div className="card" style={{ marginBottom:20 }}>
                    <div className="card-title">Lịch sử thanh toán</div>
                    {payments.map((p, i) => (
                        <div key={i} className="row" style={{ borderBottom:'1px solid #f5f5f5', paddingBottom:8 }}>
                            <span className="lbl">{PAY_LABEL[p.paymentMethod?.toLowerCase()] || p.paymentMethod}</span>
                            <span>{fmt(p.amount)}₫ — <span style={{ color: p.status === 'success' ? '#27ae60' : '#e74c3c' }}>{p.status}</span> — {p.createdAt ? new Date(p.createdAt).toLocaleDateString('vi-VN') : ''}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="actions">
                {canCancel && (
                    <button className="btn btn-cancel" onClick={() => setShowCancelModal(true)} disabled={cancelling}>
                        Hủy đơn hàng
                    </button>
                )}
                {items.length > 0 && !['cancelled', 'refunded'].includes(statusRaw) && (
                    <button className="btn btn-reorder" onClick={handleReorder}>Mua lại</button>
                )}
                <Link to="/orders" className="btn btn-back">← Lịch sử đơn hàng</Link>
                <Link to="/shop" className="btn btn-shop">Tiếp tục mua sắm</Link>
            </div>
        </div>

        {/* Cancel Modal */}
        {showCancelModal && (
            <div className="modal-overlay">
                <div className="modal-box">
                    <h3>Hủy đơn hàng</h3>
                    <p style={{ color:'#666', fontSize:14, marginBottom:12 }}>Vui lòng cho chúng tôi biết lý do hủy:</p>
                    <textarea
                        placeholder="Ví dụ: Đặt nhầm sản phẩm, muốn đổi địa chỉ..."
                        value={cancelReason}
                        onChange={e => setCancelReason(e.target.value)}
                    />
                    <div className="modal-actions">
                        <button className="modal-close-btn" onClick={() => setShowCancelModal(false)}>Quay lại</button>
                        <button className="modal-cancel-btn" onClick={handleCancelOrder} disabled={cancelling}>
                            {cancelling ? 'Đang xử lý...' : 'Xác nhận hủy'}
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default OrderDetail;
