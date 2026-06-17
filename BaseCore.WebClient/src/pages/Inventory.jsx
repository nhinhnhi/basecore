import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { getImageUrl } from '../utils/helpers';

const API = 'http://localhost:5001/api';
const LOW_THRESHOLD = 10;

const TYPE_MAP = {
    import: { label: 'Nhập kho',   badge: 'badge-success', icon: '📦' },
    export: { label: 'Xuất kho',   badge: 'badge-warning', icon: '📤' },
    adjust: { label: 'Điều chỉnh', badge: 'badge-info',    icon: '✏️' },
    order:  { label: 'Đơn hàng',   badge: 'badge-secondary',icon: '🛒' },
};

const StockBadge = ({ stock }) => {
    if (stock === 0)               return <span className="badge badge-danger">Hết hàng</span>;
    if (stock <= LOW_THRESHOLD)    return <span className="badge badge-warning">Sắp hết ({stock})</span>;
    return <span className="badge badge-success">{stock}</span>;
};

const Inventory = () => {
    const { token } = useAuth();
    const headers = { Authorization: `Bearer ${token || localStorage.getItem('token')}` };

    // ── State ──────────────────────────────────────────────────────────
    const [tab, setTab]         = useState('overview'); // overview | import | export | logs | alerts
    const [products, setProducts] = useState([]);
    const [stats, setStats]     = useState(null);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage]       = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Modal nhập/xuất/điều chỉnh
    const [modal, setModal]     = useState(null); // { type:'import'|'export'|'adjust', product }
    const [qty, setQty]         = useState('');
    const [newStock, setNewStock] = useState('');
    const [note, setNote]       = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [modalMsg, setModalMsg] = useState('');

    // Lịch sử
    const [logProduct, setLogProduct] = useState(null);
    const [logs, setLogs]       = useState([]);
    const [logTotal, setLogTotal] = useState(0);
    const [logPage, setLogPage] = useState(1);
    const [logLoading, setLogLoading] = useState(false);

    // Cảnh báo
    const [alerts, setAlerts]   = useState([]);
    const [alertLoading, setAlertLoading] = useState(false);

    // ── Load danh sách ─────────────────────────────────────────────────
    const loadProducts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/Inventory`, {
                headers,
                params: { keyword: keyword || undefined, status: statusFilter || undefined, page, pageSize: 20 }
            });
            setProducts(res.data.items || []);
            setTotalPages(res.data.totalPages || 1);
            setTotalCount(res.data.totalCount || 0);
            if (res.data.stats) setStats(res.data.stats);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [keyword, statusFilter, page, token]);

    useEffect(() => { loadProducts(); }, [loadProducts]);

    // ── Load cảnh báo ──────────────────────────────────────────────────
    const loadAlerts = async () => {
        setAlertLoading(true);
        try {
            const res = await axios.get(`${API}/Inventory/alerts`, { headers });
            setAlerts(res.data.items || []);
        } catch (e) { console.error(e); }
        finally { setAlertLoading(false); }
    };

    useEffect(() => { if (tab === 'alerts') loadAlerts(); }, [tab]);

    // ── Load logs ──────────────────────────────────────────────────────
    const loadLogs = async (productId, p = 1) => {
        setLogLoading(true);
        try {
            const res = await axios.get(`${API}/Inventory/${productId}/logs`, {
                headers, params: { page: p, pageSize: 15 }
            });
            setLogProduct(res.data.product);
            setLogs(res.data.logs || []);
            setLogTotal(res.data.totalCount || 0);
            setLogPage(p);
        } catch (e) { console.error(e); }
        finally { setLogLoading(false); }
    };

    const openLogs = (product) => {
        setTab('logs');
        loadLogs(product.id);
    };

    // ── Submit nhập/xuất/điều chỉnh ───────────────────────────────────
    const openModal = (type, product) => {
        setModal({ type, product });
        setQty('');
        setNewStock(String(product.totalStock));
        setNote('');
        setModalMsg('');
    };

    const handleSubmit = async () => {
        if (!modal) return;
        setSubmitting(true);
        setModalMsg('');
        try {
            const { type, product } = modal;
            let res;
            if (type === 'adjust') {
                if (!newStock || isNaN(newStock) || Number(newStock) < 0)
                    return setModalMsg('Vui lòng nhập số tồn kho hợp lệ');
                res = await axios.post(`${API}/Inventory/adjust`, {
                    productId: product.id, newStock: Number(newStock), note
                }, { headers });
            } else {
                if (!qty || isNaN(qty) || Number(qty) <= 0)
                    return setModalMsg('Vui lòng nhập số lượng hợp lệ (> 0)');
                res = await axios.post(`${API}/Inventory/${type}`, {
                    productId: product.id, quantity: Number(qty), note
                }, { headers });
            }
            setModal(null);
            loadProducts();
            alert(res.data.message || 'Thành công');
        } catch (err) {
            setModalMsg(err.response?.data?.message || 'Lỗi thao tác');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Render helpers ─────────────────────────────────────────────────
    const StatCard = ({ label, value, bg, icon }) => (
        <div className={`small-box ${bg}`} style={{ marginBottom: 0 }}>
            <div className="inner">
                <h3 style={{ fontSize: 28 }}>{value}</h3>
                <p>{label}</p>
            </div>
            <div className="icon"><i className={icon}></i></div>
        </div>
    );

    const fmt = (n) => Number(n || 0).toLocaleString('vi-VN');

    return (
        <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <h1 className="m-0">📦 Quản lý tồn kho</h1>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    {/* Stats */}
                    {stats && (
                        <div className="row mb-3">
                            <div className="col-lg-3 col-6"><StatCard label="Tổng sản phẩm"   value={stats.totalProducts}  bg="bg-info"    icon="fas fa-box" /></div>
                            <div className="col-lg-3 col-6"><StatCard label="Hết hàng"        value={stats.outOfStock}     bg="bg-danger"  icon="fas fa-times-circle" /></div>
                            <div className="col-lg-3 col-6"><StatCard label="Sắp hết hàng"    value={stats.lowStock}       bg="bg-warning" icon="fas fa-exclamation-triangle" /></div>
                            <div className="col-lg-3 col-6"><StatCard label="Giá trị tồn kho" value={fmt(stats.totalStockValue) + '₫'} bg="bg-success" icon="fas fa-dollar-sign" /></div>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="card">
                        <div className="card-header p-0">
                            <ul className="nav nav-tabs" style={{ borderBottom: 0 }}>
                                {[
                                    { key: 'overview', label: '📋 Tổng quan' },
                                    { key: 'alerts',   label: '⚠️ Cảnh báo' },
                                    { key: 'logs',     label: '📜 Lịch sử' },
                                ].map(t => (
                                    <li key={t.key} className="nav-item">
                                        <button
                                            className={`nav-link ${tab === t.key ? 'active' : ''}`}
                                            style={{ border: 'none', borderBottom: tab === t.key ? '2px solid #007bff' : 'none', borderRadius: 0, padding: '12px 20px', background: 'none', cursor: 'pointer' }}
                                            onClick={() => setTab(t.key)}>
                                            {t.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* ── TAB: TỔNG QUAN ── */}
                        {tab === 'overview' && (
                            <>
                            <div className="card-header" style={{ borderTop: '1px solid #dee2e6' }}>
                                <div className="d-flex align-items-center flex-wrap" style={{ gap: 8 }}>
                                    <input type="text" className="form-control" style={{ width: 220 }}
                                        placeholder="Tìm tên, SKU..."
                                        value={keyword} onChange={e => { setKeyword(e.target.value); setPage(1); }} />
                                    <select className="form-control" style={{ width: 160 }}
                                        value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
                                        <option value="">Tất cả</option>
                                        <option value="ok">✅ Còn hàng</option>
                                        <option value="low">⚠️ Sắp hết</option>
                                        <option value="out">❌ Hết hàng</option>
                                    </select>
                                </div>
                            </div>
                            <div className="card-body p-0">
                                {loading ? (
                                    <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-striped mb-0">
                                            <thead>
                                                <tr>
                                                    <th style={{ width: 52 }}>Ảnh</th>
                                                    <th>Tên sản phẩm</th>
                                                    <th>SKU</th>
                                                    <th>Danh mục</th>
                                                    <th>Tồn kho</th>
                                                    <th>Đã bán</th>
                                                    <th>Trạng thái</th>
                                                    <th>Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {products.length === 0 ? (
                                                    <tr><td colSpan={8} className="text-center py-4">Không có sản phẩm nào</td></tr>
                                                ) : products.map(p => (
                                                    <tr key={p.id} style={{ background: p.totalStock === 0 ? '#fff5f5' : p.totalStock <= LOW_THRESHOLD ? '#fffbf0' : '' }}>
                                                        <td>
                                                            {p.mainImageUrl ? (
                                                                <img src={`http://localhost:5173${p.mainImageUrl}`} alt={p.name}
                                                                    style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                                                                    onError={e => e.target.style.display = 'none'} />
                                                            ) : <div style={{ width: 40, height: 40, background: '#f0f0f0', borderRadius: 4 }}></div>}
                                                        </td>
                                                        <td>
                                                            <strong>{p.name}</strong>
                                                            {p.deletedAt && <span className="badge badge-dark ml-1" style={{ fontSize: 10 }}>Đã xóa</span>}
                                                        </td>
                                                        <td><code style={{ fontSize: 11 }}>{p.sku}</code></td>
                                                        <td>{p.categoryName || '—'}</td>
                                                        <td><StockBadge stock={p.totalStock} /></td>
                                                        <td>{p.soldCount || 0}</td>
                                                        <td>
                                                            <span className={`badge ${p.status === 'active' ? 'badge-success' : 'badge-secondary'}`}>
                                                                {p.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="btn-group btn-group-sm">
                                                                <button className="btn btn-success" title="Nhập kho" onClick={() => openModal('import', p)}>
                                                                    <i className="fas fa-plus"></i> Nhập
                                                                </button>
                                                                <button className="btn btn-warning" title="Xuất kho" onClick={() => openModal('export', p)}>
                                                                    <i className="fas fa-minus"></i> Xuất
                                                                </button>
                                                                <button className="btn btn-info" title="Điều chỉnh" onClick={() => openModal('adjust', p)}>
                                                                    <i className="fas fa-edit"></i>
                                                                </button>
                                                                <button className="btn btn-secondary" title="Xem lịch sử" onClick={() => openLogs(p)}>
                                                                    <i className="fas fa-history"></i>
                                                                </button>
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
                                <span>Tổng: {totalCount} sản phẩm</span>
                                <nav>
                                    <ul className="pagination mb-0">
                                        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => setPage(p => p - 1)}>Trước</button>
                                        </li>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(i => (
                                            <li key={i} className={`page-item ${page === i ? 'active' : ''}`}>
                                                <button className="page-link" onClick={() => setPage(i)}>{i}</button>
                                            </li>
                                        ))}
                                        <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => setPage(p => p + 1)}>Sau</button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                            </>
                        )}

                        {/* ── TAB: CẢNH BÁO ── */}
                        {tab === 'alerts' && (
                            <div className="card-body">
                                {alertLoading ? (
                                    <div className="text-center py-5"><div className="spinner-border text-warning"></div></div>
                                ) : alerts.length === 0 ? (
                                    <div className="text-center py-5 text-success">
                                        <i className="fas fa-check-circle fa-3x mb-2"></i>
                                        <div>Tất cả sản phẩm đều còn hàng!</div>
                                    </div>
                                ) : (
                                    <>
                                    <div className="alert alert-warning">
                                        ⚠️ Có <strong>{alerts.length}</strong> sản phẩm cần bổ sung hàng
                                        ({alerts.filter(a => a.totalStock === 0).length} hết hàng,{' '}
                                        {alerts.filter(a => a.totalStock > 0).length} sắp hết)
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-striped">
                                            <thead>
                                                <tr>
                                                    <th>Tên sản phẩm</th>
                                                    <th>SKU</th>
                                                    <th>Tồn kho</th>
                                                    <th>Đã bán</th>
                                                    <th>Tình trạng</th>
                                                    <th>Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {alerts.map(p => (
                                                    <tr key={p.id} style={{ background: p.totalStock === 0 ? '#fff5f5' : '#fffbf0' }}>
                                                        <td><strong>{p.name}</strong></td>
                                                        <td><code style={{ fontSize: 11 }}>{p.sku}</code></td>
                                                        <td><StockBadge stock={p.totalStock} /></td>
                                                        <td>{p.soldCount || 0}</td>
                                                        <td>
                                                            {p.totalStock === 0
                                                                ? <span className="badge badge-danger">❌ Hết hàng</span>
                                                                : <span className="badge badge-warning">⚠️ Sắp hết</span>}
                                                        </td>
                                                        <td>
                                                            <button className="btn btn-sm btn-success"
                                                                onClick={() => { setTab('overview'); openModal('import', p); }}>
                                                                <i className="fas fa-plus"></i> Nhập kho
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* ── TAB: LỊCH SỬ ── */}
                        {tab === 'logs' && (
                            <div className="card-body">
                                {!logProduct ? (
                                    <div className="text-center py-5 text-muted">
                                        <i className="fas fa-history fa-3x mb-2"></i>
                                        <div>Chọn một sản phẩm ở tab <strong>Tổng quan</strong> để xem lịch sử</div>
                                    </div>
                                ) : (
                                    <>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div>
                                            <h5 className="mb-0">{logProduct.name}</h5>
                                            <small className="text-muted">SKU: {logProduct.sku} — Tồn kho hiện tại: <strong>{logProduct.totalStock}</strong></small>
                                        </div>
                                        <button className="btn btn-sm btn-outline-secondary" onClick={() => setLogProduct(null)}>
                                            ← Đóng
                                        </button>
                                    </div>

                                    {logLoading ? (
                                        <div className="text-center py-3"><div className="spinner-border text-primary spinner-border-sm"></div></div>
                                    ) : logs.length === 0 ? (
                                        <div className="text-center py-4 text-muted">Chưa có lịch sử thay đổi tồn kho</div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-bordered table-striped">
                                                <thead>
                                                    <tr>
                                                        <th>Thời gian</th>
                                                        <th>Loại</th>
                                                        <th>Thay đổi</th>
                                                        <th>Tồn kho sau</th>
                                                        <th>Ghi chú</th>
                                                        <th>Người thực hiện</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {logs.map(log => {
                                                        const t = TYPE_MAP[log.type] || { label: log.type, badge: 'badge-secondary', icon: '•' };
                                                        return (
                                                            <tr key={log.id}>
                                                                <td style={{ fontSize: 12 }}>{new Date(log.createdAt).toLocaleString('vi-VN')}</td>
                                                                <td><span className={`badge ${t.badge}`}>{t.icon} {t.label}</span></td>
                                                                <td>
                                                                    <span style={{
                                                                        color: log.quantityChanged > 0 ? '#27ae60' : '#e74c3c',
                                                                        fontWeight: 'bold', fontSize: 15
                                                                    }}>
                                                                        {log.quantityChanged > 0 ? `+${log.quantityChanged}` : log.quantityChanged}
                                                                    </span>
                                                                </td>
                                                                <td><strong>{log.stockAfter}</strong></td>
                                                                <td>{log.note || '—'}</td>
                                                                <td>{log.createdByName || '—'}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* Pagination logs */}
                                    {logTotal > 15 && (
                                        <div className="d-flex justify-content-between align-items-center mt-2">
                                            <small className="text-muted">Tổng: {logTotal} bản ghi</small>
                                            <div className="btn-group btn-group-sm">
                                                <button className="btn btn-outline-secondary" disabled={logPage === 1}
                                                    onClick={() => loadLogs(logProduct.id, logPage - 1)}>Trước</button>
                                                <button className="btn btn-outline-secondary" disabled={logPage * 15 >= logTotal}
                                                    onClick={() => loadLogs(logProduct.id, logPage + 1)}>Sau</button>
                                            </div>
                                        </div>
                                    )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ── MODAL NHẬP/XUẤT/ĐIỀU CHỈNH ── */}
            {modal && (
                <div className="modal fade show" style={{ display: 'block', zIndex: 1050 }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {modal.type === 'import' && '📦 Nhập kho'}
                                    {modal.type === 'export' && '📤 Xuất kho'}
                                    {modal.type === 'adjust' && '✏️ Điều chỉnh tồn kho'}
                                </h5>
                                <button type="button" className="close" onClick={() => setModal(null)}><span>&times;</span></button>
                            </div>
                            <div className="modal-body">
                                <div className="alert alert-light border mb-3">
                                    <strong>{modal.product.name}</strong><br />
                                    <small className="text-muted">SKU: {modal.product.sku} — Tồn kho hiện tại: <strong>{modal.product.totalStock}</strong></small>
                                </div>

                                {modalMsg && <div className="alert alert-danger py-2">{modalMsg}</div>}

                                {modal.type === 'adjust' ? (
                                    <div className="form-group">
                                        <label>Tồn kho mới <span className="text-danger">*</span></label>
                                        <input type="number" className="form-control" min="0"
                                            value={newStock} onChange={e => setNewStock(e.target.value)}
                                            placeholder="Nhập số lượng tồn kho mới" />
                                        {newStock !== '' && !isNaN(newStock) && (
                                            <small className={`text-${Number(newStock) >= modal.product.totalStock ? 'success' : 'danger'}`}>
                                                Thay đổi: {Number(newStock) - modal.product.totalStock >= 0 ? '+' : ''}{Number(newStock) - modal.product.totalStock}
                                            </small>
                                        )}
                                    </div>
                                ) : (
                                    <div className="form-group">
                                        <label>Số lượng {modal.type === 'import' ? 'nhập' : 'xuất'} <span className="text-danger">*</span></label>
                                        <input type="number" className="form-control" min="1"
                                            value={qty} onChange={e => setQty(e.target.value)}
                                            placeholder={`Số lượng ${modal.type === 'import' ? 'nhập vào' : 'xuất ra'}`} />
                                        {modal.type === 'export' && qty && Number(qty) > modal.product.totalStock && (
                                            <small className="text-danger">⚠ Vượt quá tồn kho hiện tại ({modal.product.totalStock})</small>
                                        )}
                                    </div>
                                )}

                                <div className="form-group mb-0">
                                    <label>Ghi chú</label>
                                    <textarea className="form-control" rows={2}
                                        value={note} onChange={e => setNote(e.target.value)}
                                        placeholder="Lý do nhập/xuất, tên nhà cung cấp..." />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setModal(null)}>Hủy</button>
                                <button
                                    className={`btn ${modal.type === 'import' ? 'btn-success' : modal.type === 'export' ? 'btn-warning' : 'btn-info'}`}
                                    onClick={handleSubmit} disabled={submitting}>
                                    {submitting ? 'Đang xử lý...' : modal.type === 'import' ? '📦 Xác nhận nhập' : modal.type === 'export' ? '📤 Xác nhận xuất' : '✏️ Lưu điều chỉnh'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {modal && <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>}
        </div>
    );
};

export default Inventory;