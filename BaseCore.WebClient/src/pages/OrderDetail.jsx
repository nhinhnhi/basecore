import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { getImageUrl } from '../utils/helpers';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAdmin, token } = useAuth();
    const [order, setOrder] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [adminNote, setAdminNote] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [shipment, setShipment] = useState(null);
    const [events, setEvents] = useState([]);
    const [payments, setPayments] = useState([]);
    const [coupon, setCoupon] = useState(null); // Thêm state cho coupon

    useEffect(() => {
        loadOrderDetail();
    }, [id]);

    const loadOrderDetail = async () => {
        setLoading(true);
        try {
            const response = await orderApi.getById(id);
            const data = response.data;
            // Giả sử API trả về { order, items }
            setOrder(data.order || data);
            setItems(data.items || []);
            setShipment(data.shipment);
            setPayments(data.payments || []);
            setCoupon(data.coupon || null); // Lấy thông tin coupon
            if (data.order?.adminNote) setAdminNote(data.order.adminNote);
            if (data.order?.trackingNumber) setTrackingNumber(data.order.trackingNumber);
            if (data.shipment?.events) {
                setEvents(data.shipment.events);
            }
        } catch (error) {
            console.error('Lỗi hiển thị đơn hàng:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (newStatus, extraData = {}) => {
        if (!window.confirm(`Bạn có chắc là muốn thay đổi trạng thái đơn hàng ${newStatus}?`)) return;
        setUpdating(true);
        try {
            await orderApi.updateStatus(id, { status: newStatus, ...extraData });
            loadOrderDetail(); // refresh
        } catch (error) {
            alert('Lỗi cập nhật trạng thái đơn hàng');
        } finally {
            setUpdating(false);
        }
    };

    const formatCurrency = (value) => {
        return (value || 0).toLocaleString('vi-VN') + ' ₫';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN');
    };

    // Hàm tính số tiền giảm từ coupon
    const calculateDiscount = () => {
        if (!order || !order.couponId) return 0;
        // Nếu API trả về số tiền giảm trực tiếp
        if (order.discountAmount) return order.discountAmount;
        
        // Hoặc tính từ thông tin coupon
        if (coupon) {
            if (coupon.discountType === 'percentage') {
                let discount = order.subtotal * coupon.discountValue / 100;
                if (coupon.maxDiscountAmount > 0 && discount > coupon.maxDiscountAmount) {
                    discount = coupon.maxDiscountAmount;
                }
                return discount;
            } else {
                return Math.min(coupon.discountValue, order.subtotal);
            }
        }
        return 0;
    };

    const statusSteps = [
        { key: 'pending', label: 'Đang chờ', description: 'Đã đặt hàng, đang chờ xác nhận' },
        { key: 'confirmed', label: 'Xác nhận', description: 'Đơn hàng đã được xác nhận, đang chuẩn bị giao hàng' },
        { key: 'shipped', label: 'Đang giao', description: 'Đơn hàng đã được gửi đi, đang trong quá trình vận chuyển' },
        { key: 'delivered', label: 'Giao thành công', description: 'Đơn hàng đã được giao thành công' },
    ];

    const getCurrentStepIndex = () => {
        if (!order) return -1;
        const status = order.status;
        if (status === 'cancelled') return -1;
        if (status === 'refunded') return -1;
        const idx = statusSteps.findIndex(s => s.key === status);
        return idx !== -1 ? idx : 0;
    };

    const discountAmount = calculateDiscount();

    if (loading) {
        return (
            <div className="content-wrapper">
                <div className="content-header"><div className="container-fluid"><h1>Chi tiết đơn hàng</h1></div></div>
                <section className="content"><div className="text-center py-5"><div className="spinner-border text-primary"></div></div></section>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="content-wrapper">
                <div className="content-header"><div className="container-fluid"><h1>Chi tiết đơn hàng</h1></div></div>
                <section className="content"><div className="alert alert-danger">Không tìm thấy đơn hàng</div></section>
            </div>
        );
    }

    const currentStepIndex = getCurrentStepIndex();

    return (
        <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">Chi tiết đơn #{order.id.slice(0, 8)}</h1>
                        </div>
                        <div className="col-sm-6 text-right">
                            <button className="btn btn-secondary" onClick={() => navigate('/orders')}>
                                <i className="fas fa-arrow-left"></i> Quay lại
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    {/* Order Information */}
                    <div className="row">
                        <div className="col-md-6">
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">Thông tin đơn hàng</h3>
                                </div>
                                <div className="card-body">
                                    <table className="table table-bordered">
                                        <tbody>
                                            <tr><th>Mã đơn hàng</th><td>{order.id}</td></tr>
                                            <tr><th>Mã người dùng</th><td>{order.userId}</td></tr>
                                            <tr><th>Ngày đặt hàng</th><td>{formatDate(order.orderDate)}</td></tr>
                                            <tr><th>Trạng thái</th>
                                                <td>
                                                    <span className={`badge ${
                                                        order.status === 'delivered' ? 'badge-success' :
                                                        order.status === 'cancelled' ? 'badge-danger' :
                                                        order.status === 'refunded' ? 'badge-warning' :
                                                        'badge-info'
                                                    }`}>
                                                        {order.status === 'pending' ? 'Đang chờ' :
                                                         order.status === 'confirmed' ? 'Đã xác nhận' :
                                                         order.status === 'shipped' ? 'Đang giao' :
                                                         order.status === 'delivered' ? 'Giao thành công' :
                                                         order.status === 'cancelled' ? 'Đã hủy' :
                                                         order.status === 'refunded' ? 'Đã hoàn trả' : order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr><th>Phương thức thanh toán</th><td>{order.paymentMethod?.toUpperCase()}</td></tr>
                                            <tr><th>Trạng thái thanh toán</th><td>{order.paymentStatus}</td></tr>
                                            <tr><th>Địa chỉ giao hàng</th><td>{order.shippingAddress}</td></tr>
                                            <tr><th>Ghi chú của khách hàng</th><td>{order.customerNote || '—'}</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">Tóm tắt đơn hàng</h3>
                                </div>
                                <div className="card-body">
                                    <table className="table table-bordered">
                                        <tbody>
                                            <tr><th>Tiền hàng</th><td>{formatCurrency(order.subtotal)}</td></tr>
                                            
                                            {/* Hiển thị thông tin mã giảm giá nếu có */}
                                            {coupon && (
                                                <>
                                                    <tr className="table-success">
                                                        <th>
                                                            Mã giảm giá 
                                                            {coupon.code && (
                                                                <span className="badge badge-info ml-2">{coupon.code}</span>
                                                            )}
                                                        </th>
                                                        <td>
                                                            {coupon.discountType === 'percentage' 
                                                                ? `Giảm ${coupon.discountValue}%` 
                                                                : `Giảm ${formatCurrency(coupon.discountValue)}`}
                                                            {coupon.maxDiscountAmount > 0 && coupon.discountType === 'percentage' && (
                                                                <small className="text-muted d-block">
                                                                    (Tối đa {formatCurrency(coupon.maxDiscountAmount)})
                                                                </small>
                                                            )}
                                                            {coupon.minOrderValue > 0 && (
                                                                <small className="text-muted d-block">
                                                                    Áp dụng cho đơn từ {formatCurrency(coupon.minOrderValue)}
                                                                </small>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    {discountAmount > 0 && (
                                                        <tr className="text-success">
                                                            <th>Tiết kiệm</th>
                                                            <td>- {formatCurrency(discountAmount)}</td>
                                                        </tr>
                                                    )}
                                                </>
                                            )}
                                            
                                            <tr><th>Phí ship</th><td>{formatCurrency(order.shippingFee)}</td></tr>
                                            <tr className="table-info">
                                                <th><strong>Tổng cộng</strong></th>
                                                <td><strong className="text-danger">{formatCurrency(order.total)}</strong></td>
                                            </tr>
                                            <tr><th>Ngày xác nhận</th><td>{formatDate(order.confirmedAt)}</td></tr>
                                            <tr><th>Đã gửi lúc</th><td>{formatDate(order.shippedAt)}</td></tr>
                                            <tr><th>Đã giao lúc</th><td>{formatDate(order.deliveredAt)}</td></tr>
                                            <tr><th>Hủy đơn</th><td>{formatDate(order.cancelledAt)}</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="row mt-3">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">Các mục đặt hàng</h3>
                                </div>
                                <div className="card-body p-0">
                                    <table className="table table-bordered table-striped mb-0">
                                        <thead>
                                            <tr>
                                                <th>Ảnh</th>
                                                <th>Tên sản phẩm</th>
                                                <th>Số lượng</th>
                                                <th>Đơn giá</th>
                                                <th>Thành tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map(item => (
                                                <tr key={item.id}>
                                                    <td>
                                                        {item.imageUrlSnapshot || item.product?.mainImageUrl ? (
                                                            <img
                                                                src={getImageUrl(item.imageUrlSnapshot || item.product?.mainImageUrl)}
                                                                alt={item.productNameSnapshot}
                                                                style={{ width: 60, height: 60, objectFit: 'contain', borderRadius: 6, border: '1px solid #dee2e6' }}
                                                                onError={(e) => { e.target.style.display = 'none'; }}
                                                            />
                                                        ) : (
                                                            <div style={{
                                                                width: 60, height: 60, borderRadius: 6,
                                                                background: '#f8f9fa', border: '1px solid #dee2e6',
                                                                display: 'flex', alignItems: 'center',
                                                                justifyContent: 'center', fontSize: 11, color: '#aaa'
                                                            }}>No img</div>
                                                        )}
                                                    </td>
                                                    <td>{item.productNameSnapshot || item.product?.name}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>{formatCurrency(item.unitPrice)}</td>
                                                    <td>{formatCurrency(item.subtotal)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan="3" className="text-end fw-bold"><strong>Tạm tính:</strong></td>
                                                <td className="fw-bold">{formatCurrency(order.subtotal)}</td>
                                            </tr>
                                            {coupon && discountAmount > 0 && (
                                                <tr className="text-success">
                                                    <td colSpan="3" className="text-end fw-bold">Giảm giá:</td>
                                                    <td className="fw-bold">-{formatCurrency(discountAmount)}</td>
                                                </tr>
                                            )}
                                            <tr>
                                                <td colSpan="3" className="text-end fw-bold"><strong>Phí ship:</strong></td>
                                                <td className="fw-bold">{formatCurrency(order.shippingFee)}</td>
                                            </tr>
                                            <tr className="table-info">
                                                <td colSpan="3" className="text-end fw-bold"><strong>Tổng cộng:</strong></td>
                                                <td className="fw-bold text-danger"><strong>{formatCurrency(order.total)}</strong></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipment Information */}
                    {shipment && (
                        <div className="row mt-3">
                            <div className="col-12">
                                <div className="card">
                                    <div className="card-header"><h3>Thông tin vận chuyển</h3></div>
                                    <div className="card-body">
                                        <table className="table table-bordered">
                                            <tbody>
                                                <tr><th>Đơn vị vận chuyển</th><td>{shipment.provider?.name || '—'}</td></tr>
                                                <tr><th>Mã vận đơn</th><td>{shipment.trackingNumber || '—'}</td></tr>
                                                <tr><th>Phí ship thực tế</th><td>{shipment.shippingFeeActual?.toLocaleString()} ₫</td></tr>
                                                <tr><th>Dự kiến giao</th><td>{shipment.estimatedDelivery ? new Date(shipment.estimatedDelivery).toLocaleString() : '—'}</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Shipment Timeline */}
                    {events.length > 0 && (
                        <div className="row mt-3">
                            <div className="col-12">
                                <div className="card">
                                    <div className="card-header"><h3>Lộ trình vận chuyển</h3></div>
                                    <div className="card-body">
                                        <div className="timeline">
                                            {events.sort((a,b) => new Date(a.eventAt) - new Date(b.eventAt)).map(event => (
                                                <div key={event.id} className="timeline-item">
                                                    <div className="timeline-badge"><i className="fas fa-truck"></i></div>
                                                    <div className="timeline-panel">
                                                        <div className="timeline-heading">
                                                            <h4 className="timeline-title">{event.status}</h4>
                                                            <p><small className="text-muted">{new Date(event.eventAt).toLocaleString()}</small></p>
                                                        </div>
                                                        <div className="timeline-body">
                                                            <p><strong>{event.location}</strong> — {event.description}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payment History */}
                    {payments.length > 0 && (
                        <div className="row mt-3">
                            <div className="col-12">
                                <div className="card">
                                    <div className="card-header"><h3>Lịch sử thanh toán</h3></div>
                                    <div className="card-body p-0">
                                        <table className="table table-bordered">
                                            <thead>
                                                <tr>
                                                    <th>Phương thức</th>
                                                    <th>Số tiền</th>
                                                    <th>Trạng thái</th>
                                                    <th>Mã giao dịch</th>
                                                    <th>Thời gian</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {payments.map(p => (
                                                    <tr key={p.id}>
                                                        <td>{p.paymentMethod?.toUpperCase()}</td>
                                                        <td>{p.amount?.toLocaleString()} ₫</td>
                                                        <td>
                                                            <span className={`badge ${p.status === 'success' ? 'badge-success' : p.status === 'failed' ? 'badge-danger' : 'badge-warning'}`}>
                                                                {p.status}
                                                            </span>
                                                        </td>
                                                        <td>{p.transactionId || '—'}</td>
                                                        <td>{new Date(p.createdAt).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Admin Actions */}
                    {isAdmin && (
                        <div className="row mt-3">
                            <div className="col-12">
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">Xử lí đơn hàng</h3>
                                    </div>
                                    <div className="card-body">
                                        {/* Status Timeline */}
                                        <div className="timeline">
                                            {statusSteps.map((step, idx) => {
                                                const isCompleted = idx <= currentStepIndex && order.status !== 'cancelled' && order.status !== 'refunded';
                                                const isCurrent = idx === currentStepIndex;
                                                return (
                                                    <div key={step.key} className="timeline-item">
                                                        <div className={`timeline-badge ${isCompleted ? 'bg-success' : 'bg-secondary'}`}>
                                                            {isCompleted ? <i className="fas fa-check"></i> : <i className="fas fa-circle"></i>}
                                                        </div>
                                                        <div className="timeline-content">
                                                            <h5>{step.label}</h5>
                                                            <p>{step.description}</p>
                                                            {isCurrent && (
                                                                <span className="badge bg-primary">Bước hiện tại</span>
                                                            )}
                                                            {isCompleted && !isCurrent && (
                                                                <span className="badge bg-success">Hoàn thành</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {/* Cancelled/Refunded status */}
                                            {(order.status === 'cancelled' || order.status === 'refunded') && (
                                                <div className="timeline-item">
                                                    <div className="timeline-badge bg-danger">
                                                        <i className="fas fa-times"></i>
                                                    </div>
                                                    <div className="timeline-content">
                                                        <h5>{order.status === 'cancelled' ? 'Đã hủy' : 'Đã hoàn trả'}</h5>
                                                        <p>Đơn hàng đã được {order.status === 'cancelled' ? 'hủy' : 'hoàn trả'}.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <hr />

                                        {/* Action Buttons */}
                                        <div className="mt-3">
                                            {order.status === 'pending' && (
                                                <button
                                                    className="btn btn-primary mr-2"
                                                    onClick={() => updateStatus('confirmed')}
                                                    disabled={updating}
                                                >
                                                    Xác nhận đơn
                                                </button>
                                            )}
                                            {order.status === 'confirmed' && (
                                                <button
                                                    className="btn btn-primary mr-2"
                                                    onClick={() => updateStatus('shipped')}
                                                    disabled={updating}
                                                >
                                                    Đánh dấu là đã gửi hàng
                                                </button>
                                            )}
                                            {order.status === 'shipped' && (
                                                <button
                                                    className="btn btn-primary mr-2"
                                                    onClick={() => updateStatus('delivered')}
                                                    disabled={updating}
                                                >
                                                    Đánh dấu là đã giao hàng
                                                </button>
                                            )}
                                            {(order.status === 'pending' || order.status === 'confirmed') && (
                                                <button
                                                    className="btn btn-danger mr-2"
                                                    onClick={() => updateStatus('cancelled')}
                                                    disabled={updating}
                                                >
                                                    Hủy đơn hàng
                                                </button>
                                            )}
                                            {order.status === 'delivered' && (
                                                <button
                                                    className="btn btn-warning mr-2"
                                                    onClick={() => updateStatus('refunded')}
                                                    disabled={updating}
                                                >
                                                    Hoàn đơn hàng
                                                </button>
                                            )}
                                            {order.status === 'cancelled' && (
                                                <button
                                                    className="btn btn-secondary mr-2"
                                                    onClick={() => navigate('/orders')}
                                                >
                                                    Quay lại
                                                </button>
                                            )}
                                        </div>

                                        {/* Admin Note */}
                                        <div className="form-group mt-3">
                                            <label>Ghi chú</label>
                                            <textarea
                                                className="form-control"
                                                rows="2"
                                                value={adminNote}
                                                onChange={(e) => setAdminNote(e.target.value)}
                                            />
                                            <button
                                                className="btn btn-sm btn-outline-primary mt-2"
                                                onClick={() => updateStatus(order.status, { adminNote })}
                                                disabled={updating}
                                            >
                                                Lưu ghi chú
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default OrderDetail;