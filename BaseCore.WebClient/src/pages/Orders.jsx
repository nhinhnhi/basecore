import React, { useState, useEffect } from 'react';
import { orderApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Orders = () => {
    const { isAdmin } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    const [totalRevenue, setTotalRevenue]     = useState(0);
    const [deliveredCount, setDeliveredCount] = useState(0);
    const [refundedCount, setRefundedCount]   = useState(0);

    useEffect(() => { loadOrders(); }, [page, statusFilter, paymentFilter, startDate, endDate]);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const response = await orderApi.getAll({
                page, pageSize,
                status:        statusFilter  || undefined,
                paymentMethod: paymentFilter || undefined,
                keyword:       searchKeyword || undefined,
                fromDate:      startDate     || undefined,
                toDate:        endDate       || undefined,
            });
            const data  = response.data;
            const items = data.items || [];
            setOrders(items);
            setTotalCount(data.totalCount || 0);
            setTotalPages(data.totalPages || 0);

            let revenue = 0, delivered = 0, refunded = 0;
            items.forEach(o => {
                if (o.status === 'delivered') { delivered++; revenue += o.total || 0; }
                if (o.status === 'refunded')  refunded++;
            });
            setTotalRevenue(revenue);
            setDeliveredCount(delivered);
            setRefundedCount(refunded);
        } catch (err) {
            console.error('Lỗi tải đơn hàng:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => { e.preventDefault(); setPage(1); loadOrders(); };

    const updateOrderStatus = async (id, newStatus) => {
        try {
            await orderApi.updateStatus(id, { status: newStatus });
            loadOrders();
        } catch { alert('Lỗi không thể cập nhật trạng thái'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa đơn hàng?')) return;
        try { await orderApi.delete(id); loadOrders(); }
        catch { alert('Không thể xóa đơn'); }
    };

    const fmt  = v => (v || 0).toLocaleString('vi-VN') + ' ₫';

    // ← SỬA: thử cả 2 tên field (created và createdAt) để tương thích
    const fmtDate = s => {
        const d = s ? new Date(s) : null;
        if (!d || isNaN(d)) return '—';
        return d.toLocaleString('vi-VN');
    };

    const statusBadge = s => ({
        delivered: 'badge-success', refunded: 'badge-warning',
        pending: 'badge-info', cancelled: 'badge-danger',
        confirmed: 'badge-primary', shipped: 'badge-secondary',
    })[s] || 'badge-secondary';

    const statusLabel = s => ({
        pending: 'Đang chờ', confirmed: 'Xác nhận', shipped: 'Đang giao',
        delivered: 'Giao thành công', cancelled: 'Hủy đơn', refunded: 'Đã hoàn trả',
    })[s] || s;

    const paymentColor = m => ({
        cod: '#6c757d', bank: '#1a5276', momo: '#ae2070',
        vnpay: '#005baa', zalopay: '#0068ff',
    })[m?.toLowerCase()] || '#6c757d';

    return (
        <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <h1 className="m-0">Quản lý đơn hàng</h1>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">

                    {/* Summary Cards */}
                    <div className="row">
                        {[
                            { label: 'Tổng đơn hàng', value: totalCount,            bg: 'bg-info',    icon: 'fa-shopping-cart' },
                            { label: 'Tổng doanh thu', value: fmt(totalRevenue),     bg: 'bg-success', icon: 'fa-dollar-sign'   },
                            { label: 'Đã giao hàng',   value: deliveredCount,        bg: 'bg-primary', icon: 'fa-check-circle'  },
                            { label: 'Đã hoàn trả',    value: refundedCount,         bg: 'bg-warning', icon: 'fa-undo-alt'      },
                        ].map(c => (
                            <div key={c.label} className="col-lg-3 col-6">
                                <div className={`small-box ${c.bg}`}>
                                    <div className="inner"><h3>{c.value}</h3><p>{c.label}</p></div>
                                    <div className="icon"><i className={`fas ${c.icon}`}></i></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Filters + Table */}
                    <div className="card">
                        <div className="card-header">
                            <form onSubmit={handleSearch} className="row g-2 align-items-center">
                                <div className="col-md-3">
                                    <input type="text" className="form-control"
                                        placeholder="Mã đơn hàng, SĐT, tên..."
                                        value={searchKeyword}
                                        onChange={e => setSearchKeyword(e.target.value)} />
                                </div>
                                <div className="col-md-2">
                                    <select className="form-control" value={statusFilter}
                                        onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
                                        <option value="">Tất cả trạng thái</option>
                                        <option value="pending">Đang chờ</option>
                                        <option value="confirmed">Xác nhận</option>
                                        <option value="shipped">Đang giao</option>
                                        <option value="delivered">Giao thành công</option>
                                        <option value="cancelled">Hủy đơn</option>
                                        <option value="refunded">Đã hoàn trả</option>
                                    </select>
                                </div>
                                <div className="col-md-2">
                                    <select className="form-control" value={paymentFilter}
                                        onChange={e => { setPaymentFilter(e.target.value); setPage(1); }}>
                                        <option value="">Tất cả thanh toán</option>
                                        <option value="cod">COD</option>
                                        <option value="bank">Chuyển khoản</option>
                                        <option value="momo">MoMo</option>
                                        <option value="vnpay">VNPay</option>
                                        <option value="zalopay">ZaloPay</option>
                                    </select>
                                </div>
                                <div className="col-md-2">
                                    <input type="date" className="form-control" value={startDate}
                                        onChange={e => { setStartDate(e.target.value); setPage(1); }} />
                                </div>
                                <div className="col-md-2">
                                    <input type="date" className="form-control" value={endDate}
                                        onChange={e => { setEndDate(e.target.value); setPage(1); }} />
                                </div>
                                <div className="col-md-1">
                                    <button type="submit" className="btn btn-primary w-100">Tìm</button>
                                </div>
                            </form>
                        </div>

                        <div className="card-body p-0">
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary"></div>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-bordered table-striped mb-0" style={{ fontSize: 13 }}>
                                        <thead className="thead-dark">
                                            <tr>
                                                <th>Mã đơn</th>
                                                <th>Khách hàng</th>
                                                <th>Tiền hàng</th>
                                                <th>Phí ship</th>
                                                <th>Giảm giá</th>
                                                <th>Tổng tiền</th>
                                                <th>Thanh toán</th>
                                                <th>Trạng thái</th>
                                                {/* ← SỬA: thêm cột mã giảm giá */}
                                                <th>Mã giảm giá</th>
                                                <th>Ngày xác nhận</th>
                                                {/* ← SỬA: ngày tạo */}
                                                <th>Ngày tạo</th>
                                                <th>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.length === 0 ? (
                                                <tr><td colSpan="12" className="text-center py-4">Không có đơn nào</td></tr>
                                            ) : orders.map(order => (
                                                <tr key={order.id}>
                                                    <td>
                                                        <code style={{ fontSize: 12 }}>
                                                            {order.id?.slice(0, 8)}…
                                                        </code>
                                                    </td>
                                                    <td style={{ fontSize: 12 }}>
                                                        <div style={{ fontWeight: 600 }}>{order.recipientName || '—'}</div>
                                                        <div style={{ color: '#888' }}>{order.recipientPhone || ''}</div>
                                                    </td>
                                                    <td>{fmt(order.subtotal)}</td>
                                                    <td>{fmt(order.shippingFee)}</td>
                                                    {/* ← SỬA: hiển thị discountAmount */}
                                                    <td>
                                                        {order.discountAmount > 0
                                                            ? <span style={{ color: '#27ae60', fontWeight: 600 }}>
                                                                -{fmt(order.discountAmount)}
                                                              </span>
                                                            : '—'}
                                                    </td>
                                                    <td><strong style={{ color: '#e74c3c' }}>{fmt(order.total)}</strong></td>
                                                    <td>
                                                        <span style={{
                                                            background: paymentColor(order.paymentMethod),
                                                            color: '#fff', borderRadius: 4,
                                                            padding: '2px 8px', fontSize: 11, fontWeight: 700
                                                        }}>
                                                            {order.paymentMethod?.toUpperCase() || '—'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${statusBadge(order.status)}`}>
                                                            {statusLabel(order.status)}
                                                        </span>
                                                    </td>
                                                    {/* ← SỬA: couponId có thì hiện, không thì — */}
                                                    <td>
                                                        {order.couponId
                                                            ? <span style={{
                                                                background: '#fff0ee', color: '#f5371e',
                                                                borderRadius: 4, padding: '2px 8px',
                                                                fontSize: 11, fontWeight: 700
                                                            }}>🏷 Có mã</span>
                                                            : order.discountAmount > 0
                                                                // discountAmount > 0 nhưng không có couponId → vẫn đánh dấu
                                                                ? <span style={{
                                                                    background: '#fff0ee', color: '#f5371e',
                                                                    borderRadius: 4, padding: '2px 8px',
                                                                    fontSize: 11, fontWeight: 700
                                                                }}>🏷 Có mã</span>
                                                                : '—'}
                                                    </td>
                                                    {/* ← SỬA: thử confirmedAt rồi confirmed */}
                                                    <td style={{ fontSize: 12 }}>
                                                        {fmtDate(order.confirmedAt || order.confirmed)}
                                                    </td>
                                                    {/* ← SỬA: thử created rồi createdAt */}
                                                    <td style={{ fontSize: 12 }}>
                                                        {fmtDate(order.created || order.createdAt)}
                                                    </td>
                                                    <td>
                                                        <div className="btn-group btn-group-sm">
                                                            <button className="btn btn-info"
                                                                onClick={() => window.location.href = `/order/${order.id}`}>
                                                                <i className="fas fa-eye"></i> Xem
                                                            </button>
                                                            <div className="dropdown d-inline-block">
                                                                <button className="btn btn-secondary dropdown-toggle"
                                                                    data-toggle="dropdown">
                                                                    Trạng thái
                                                                </button>
                                                                <div className="dropdown-menu">
                                                                    {[
                                                                        { label: 'Đang chờ',        value: 'pending'   },
                                                                        { label: 'Xác nhận',        value: 'confirmed' },
                                                                        { label: 'Đang giao',       value: 'shipped'   },
                                                                        { label: 'Giao thành công', value: 'delivered' },
                                                                        { label: 'Hủy đơn',         value: 'cancelled' },
                                                                        { label: 'Đã hoàn trả',     value: 'refunded'  },
                                                                    ].map(s => (
                                                                        <button key={s.value} className="dropdown-item"
                                                                            onClick={() => updateOrderStatus(order.id, s.value)}>
                                                                            {s.label}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            {isAdmin && (
                                                                <button className="btn btn-danger"
                                                                    onClick={() => handleDelete(order.id)}>
                                                                    <i className="fas fa-trash"></i>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="card-footer d-flex justify-content-between align-items-center">
                            <span>Tổng: <strong>{totalCount}</strong> đơn hàng</span>
                            <nav>
                                <ul className="pagination mb-0">
                                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => setPage(p => p - 1)}>Trước</button>
                                    </li>
                                    {[...Array(totalPages).keys()].map(i => (
                                        <li key={i+1} className={`page-item ${page === i+1 ? 'active' : ''}`}>
                                            <button className="page-link" onClick={() => setPage(i+1)}>{i+1}</button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => setPage(p => p + 1)}>Sau</button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Orders;