import React, { useState, useEffect } from 'react';
import { userApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ROLES = [
    { value: 'customer',     label: 'Khách hàng',    badge: 'badge-secondary' },
    { value: 'admin',        label: 'Admin',          badge: 'badge-danger' },
    { value: 'manufacturer', label: 'Nhà cung cấp',  badge: 'badge-info' },
    { value: 'staff',        label: 'Nhân viên',      badge: 'badge-warning' },
];

const getRoleBadge = (role) => ROLES.find(r => r.value === role) || { label: role, badge: 'badge-secondary' };

const EMPTY_FORM = {
    username: '', password: '', fullName: '', email: '', phone: '',
    role: 'customer', avatarUrl: '', contact: '', position: '',
    brandId: '', isActive: true, isEmailVerified: false,
};

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [activeFilter, setActiveFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('basic');
    const [showPassword, setShowPassword] = useState(false);

    const set = (field, value) => setFormData(f => ({ ...f, [field]: value }));

    useEffect(() => { loadUsers(); }, [page, keyword, roleFilter, activeFilter]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const res = await userApi.getAll({
                keyword: keyword || undefined,
                role: roleFilter || undefined,
                isActive: activeFilter !== '' ? activeFilter === 'true' : undefined,
                page, pageSize
            });
            const data = res.data;
            if (data.items) {
                setUsers(data.items);
                setTotalCount(data.totalCount);
                setTotalPages(data.totalPages);
            } else {
                setUsers(Array.isArray(data) ? data : []);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const openModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                username: user.userName || '',
                password: '',
                fullName: user.fullName || '',
                email: user.email || '',
                phone: user.phone || '',
                role: user.role || 'customer',
                avatarUrl: user.avatarUrl || '',
                contact: user.contact || '',
                position: user.position || '',
                brandId: user.brandId || '',
                isActive: user.isActive ?? true,
                isEmailVerified: user.isEmailVerified ?? false,
            });
        } else {
            setEditingUser(null);
            setFormData(EMPTY_FORM);
        }
        setError('');
        setActiveTab('basic');
        setShowPassword(false);
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); setEditingUser(null); setError(''); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editingUser) {
                const data = {
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    role: formData.role,
                    avatarUrl: formData.avatarUrl,
                    contact: formData.contact,
                    position: formData.position,
                    brandId: formData.brandId || undefined,
                    isActive: formData.isActive,
                    isEmailVerified: formData.isEmailVerified,
                };
                if (formData.password) data.password = formData.password;
                await userApi.update(editingUser.id, data);
            } else {
                if (!formData.password) { setError('Mật khẩu là bắt buộc'); return; }
                await userApi.create({
                    userName: formData.username,
                    password: formData.password,
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    role: formData.role,
                    avatarUrl: formData.avatarUrl,
                    contact: formData.contact,
                    position: formData.position,
                    brandId: formData.brandId || undefined,
                });
            }
            closeModal();
            loadUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi thao tác');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return;
        try {
            await userApi.delete(id);
            loadUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Không thể xóa người dùng');
        }
    };

    const renderPagination = () => Array.from({ length: totalPages }, (_, i) => i + 1).map(i => (
        <li key={i} className={`page-item ${page === i ? 'active' : ''}`}>
            <button className="page-link" onClick={() => setPage(i)}>{i}</button>
        </li>
    ));

    const formatDate = (d) => d ? new Date(d).toLocaleString('vi-VN') : '—';

    return (
        <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <h1 className="m-0">Quản lý người dùng</h1>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    <div className="card">
                        <div className="card-header">
                            <div className="d-flex justify-content-between align-items-center flex-wrap" style={{ gap: 8 }}>
                                <div className="d-flex align-items-center flex-wrap" style={{ gap: 8 }}>
                                    <input type="text" className="form-control" style={{ width: 220 }}
                                        placeholder="Tìm tên, email, SĐT..."
                                        value={keyword}
                                        onChange={e => { setKeyword(e.target.value); setPage(1); }} />
                                    <select className="form-control" style={{ width: 160 }}
                                        value={roleFilter}
                                        onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
                                        <option value="">Tất cả quyền</option>
                                        {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                    </select>
                                    <select className="form-control" style={{ width: 140 }}
                                        value={activeFilter}
                                        onChange={e => { setActiveFilter(e.target.value); setPage(1); }}>
                                        <option value="">Tất cả trạng thái</option>
                                        <option value="true">Đang hoạt động</option>
                                        <option value="false">Đã vô hiệu</option>
                                    </select>
                                </div>
                                <button className="btn btn-success" onClick={() => openModal()}>
                                    <i className="fas fa-plus"></i> Thêm người dùng
                                </button>
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
                                                <th style={{ width: 48 }}>Avatar</th>
                                                <th>Tài khoản</th>
                                                <th>Họ tên</th>
                                                <th>Email</th>
                                                <th>SĐT</th>
                                                <th>Chức vụ</th>
                                                <th>Quyền</th>
                                                <th>Email xác thực</th>
                                                <th>Trạng thái</th>
                                                <th>Đăng nhập lần cuối</th>
                                                <th>Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.length === 0 ? (
                                                <tr><td colSpan={11} className="text-center py-4">Không tìm thấy người dùng nào</td></tr>
                                            ) : users.map(user => {
                                                const role = getRoleBadge(user.role);
                                                return (
                                                    <tr key={user.id} style={{ opacity: user.isDeleted ? 0.5 : 1 }}>
                                                        <td>
                                                            {user.avatarUrl ? (
                                                                <img src={user.avatarUrl} alt={user.fullName}
                                                                    style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                                                                    onError={e => e.target.style.display = 'none'} />
                                                            ) : (
                                                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#666', fontSize: 14 }}>
                                                                    {(user.fullName || user.userName || '?')[0].toUpperCase()}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td><code>{user.userName}</code></td>
                                                        <td>{user.fullName || '—'}</td>
                                                        <td>{user.email || '—'}</td>
                                                        <td>{user.phone || '—'}</td>
                                                        <td>{user.position || '—'}</td>
                                                        <td><span className={`badge ${role.badge}`}>{role.label}</span></td>
                                                        <td>
                                                            <span className={`badge ${user.isEmailVerified ? 'badge-success' : 'badge-secondary'}`}>
                                                                {user.isEmailVerified ? '✓ Đã xác thực' : '✗ Chưa'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {user.isDeleted ? (
                                                                <span className="badge badge-dark">Đã xóa</span>
                                                            ) : (
                                                                <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td style={{ fontSize: 12 }}>{formatDate(user.lastLoginAt)}</td>
                                                        <td>
                                                            <button className="btn btn-sm btn-info mr-1" onClick={() => openModal(user)} title="Sửa">
                                                                <i className="fas fa-edit"></i>
                                                            </button>
                                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(user.id)} title="Xóa">
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="card-footer d-flex justify-content-between align-items-center">
                            <span>Tổng: {totalCount} người dùng</span>
                            <nav>
                                <ul className="pagination mb-0">
                                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => setPage(p => p - 1)}>Trước</button>
                                    </li>
                                    {renderPagination()}
                                    <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => setPage(p => p + 1)}>Sau</button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== MODAL ===== */}
            {showModal && (
                <div className="modal fade show" style={{ display: 'block', zIndex: 1050 }} tabIndex="-1">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingUser
                                        ? `✏️ Sửa: ${editingUser.fullName || editingUser.userName}`
                                        : '➕ Thêm người dùng mới'}
                                </h5>
                                <button type="button" className="close" onClick={closeModal}><span>&times;</span></button>
                            </div>

                            {/* Tabs */}
                            <div className="modal-header py-0" style={{ borderTop: '1px solid #dee2e6' }}>
                                <ul className="nav nav-tabs border-0">
                                    {[
                                        { key: 'basic', label: '👤 Thông tin' },
                                        { key: 'account', label: '🔐 Tài khoản' },
                                        { key: 'extra', label: '📋 Bổ sung' },
                                    ].map(tab => (
                                        <li key={tab.key} className="nav-item">
                                            <button type="button"
                                                className={`nav-link ${activeTab === tab.key ? 'active' : ''}`}
                                                style={{ border: 'none', borderBottom: activeTab === tab.key ? '2px solid #007bff' : 'none', borderRadius: 0, padding: '12px 16px' }}
                                                onClick={() => setActiveTab(tab.key)}>
                                                {tab.label}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    {error && <div className="alert alert-danger">{error}</div>}

                                    {/* TAB: THÔNG TIN */}
                                    {activeTab === 'basic' && (
                                        <div className="row">
                                            {/* Avatar preview */}
                                            <div className="col-md-12 mb-3 d-flex align-items-center" style={{ gap: 16 }}>
                                                <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#e9ecef', border: '2px solid #dee2e6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                                                    {formData.avatarUrl ? (
                                                        <img src={formData.avatarUrl} alt="avatar"
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            onError={e => e.target.style.display = 'none'} />
                                                    ) : (
                                                        <i className="fas fa-user fa-2x" style={{ color: '#aaa' }}></i>
                                                    )}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <label>URL Avatar</label>
                                                    <input type="text" className="form-control"
                                                        value={formData.avatarUrl}
                                                        onChange={e => set('avatarUrl', e.target.value)}
                                                        placeholder="https://... hoặc /img/avatar.jpg" />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label>Họ và tên</label>
                                                    <input type="text" className="form-control"
                                                        value={formData.fullName}
                                                        onChange={e => set('fullName', e.target.value)}
                                                        placeholder="Nguyễn Văn A" />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label>Email</label>
                                                    <input type="email" className="form-control"
                                                        value={formData.email}
                                                        onChange={e => set('email', e.target.value)}
                                                        placeholder="email@example.com" />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label>Số điện thoại</label>
                                                    <input type="text" className="form-control"
                                                        value={formData.phone}
                                                        onChange={e => set('phone', e.target.value)}
                                                        placeholder="0912345678" />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label>Chức vụ</label>
                                                    <input type="text" className="form-control"
                                                        value={formData.position}
                                                        onChange={e => set('position', e.target.value)}
                                                        placeholder="Trưởng phòng, Nhân viên..." />
                                                </div>
                                            </div>
                                            <div className="col-md-12">
                                                <div className="form-group">
                                                    <label>Thông tin liên hệ khác</label>
                                                    <input type="text" className="form-control"
                                                        value={formData.contact}
                                                        onChange={e => set('contact', e.target.value)}
                                                        placeholder="Zalo, Facebook, địa chỉ..." />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* TAB: TÀI KHOẢN */}
                                    {activeTab === 'account' && (
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label>Tên tài khoản <span className="text-danger">*</span></label>
                                                    <input type="text" className="form-control"
                                                        value={formData.username}
                                                        onChange={e => set('username', e.target.value)}
                                                        required disabled={!!editingUser}
                                                        placeholder="username" />
                                                    {editingUser && <small className="text-muted">Không thể thay đổi tên tài khoản</small>}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label>
                                                        Mật khẩu {editingUser && <span className="text-muted">(để trống = giữ nguyên)</span>}
                                                        {!editingUser && <span className="text-danger"> *</span>}
                                                    </label>
                                                    <div className="input-group">
                                                        <input
                                                            type={showPassword ? 'text' : 'password'}
                                                            className="form-control"
                                                            value={formData.password}
                                                            onChange={e => set('password', e.target.value)}
                                                            required={!editingUser}
                                                            placeholder={editingUser ? '••••••••' : 'Tối thiểu 6 ký tự'} />
                                                        <div className="input-group-append">
                                                            <button type="button" className="btn btn-outline-secondary"
                                                                onClick={() => setShowPassword(s => !s)}>
                                                                <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label>Quyền truy cập</label>
                                                    <select className="form-control"
                                                        value={formData.role}
                                                        onChange={e => set('role', e.target.value)}>
                                                        {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label>Tùy chọn tài khoản</label>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                                                        <div className="custom-control custom-switch">
                                                            <input type="checkbox" className="custom-control-input"
                                                                id="sw_isActive" checked={formData.isActive}
                                                                onChange={e => set('isActive', e.target.checked)} />
                                                            <label className="custom-control-label" htmlFor="sw_isActive">Kích hoạt tài khoản</label>
                                                        </div>
                                                        {editingUser && (
                                                            <div className="custom-control custom-switch">
                                                                <input type="checkbox" className="custom-control-input"
                                                                    id="sw_emailVerified" checked={formData.isEmailVerified}
                                                                    onChange={e => set('isEmailVerified', e.target.checked)} />
                                                                <label className="custom-control-label" htmlFor="sw_emailVerified">Email đã xác thực</label>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* TAB: BỔ SUNG */}
                                    {activeTab === 'extra' && (
                                        <div className="row">
                                            <div className="col-md-12">
                                                <div className="form-group">
                                                    <label>ID Thương hiệu (BrandId)</label>
                                                    <input type="text" className="form-control"
                                                        value={formData.brandId}
                                                        onChange={e => set('brandId', e.target.value)}
                                                        placeholder="GUID của Brand (dành cho nhà cung cấp)" />
                                                    <small className="text-muted">Chỉ điền nếu user là Nhà cung cấp (manufacturer)</small>
                                                </div>
                                            </div>
                                            {editingUser && (
                                                <div className="col-md-12">
                                                    <div className="card bg-light">
                                                        <div className="card-body py-2">
                                                            <h6 className="mb-2">Thông tin hệ thống</h6>
                                                            <div className="row" style={{ fontSize: 13 }}>
                                                                <div className="col-md-6">
                                                                    <strong>ID:</strong> <code style={{ fontSize: 11 }}>{editingUser.id}</code>
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <strong>Ngày tạo:</strong> {editingUser.createdAt ? new Date(editingUser.createdAt).toLocaleString('vi-VN') : '—'}
                                                                </div>
                                                                <div className="col-md-6 mt-1">
                                                                    <strong>Cập nhật:</strong> {editingUser.updatedAt ? new Date(editingUser.updatedAt).toLocaleString('vi-VN') : '—'}
                                                                </div>
                                                                <div className="col-md-6 mt-1">
                                                                    <strong>Đăng nhập cuối:</strong> {editingUser.lastLoginAt ? new Date(editingUser.lastLoginAt).toLocaleString('vi-VN') : 'Chưa đăng nhập'}
                                                                </div>
                                                                <div className="col-md-6 mt-1">
                                                                    <strong>Xác thực email lúc:</strong> {editingUser.emailVerifiedAt ? new Date(editingUser.emailVerifiedAt).toLocaleString('vi-VN') : '—'}
                                                                </div>
                                                                {editingUser.deletedAt && (
                                                                    <div className="col-md-6 mt-1">
                                                                        <strong className="text-danger">Đã xóa lúc:</strong> {new Date(editingUser.deletedAt).toLocaleString('vi-VN')}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={closeModal}>Hủy</button>
                                    {activeTab !== 'extra' && (
                                        <button type="button" className="btn btn-outline-primary"
                                            onClick={() => setActiveTab(activeTab === 'basic' ? 'account' : 'extra')}>
                                            Tiếp theo →
                                        </button>
                                    )}
                                    <button type="submit" className="btn btn-primary">
                                        <i className={`fas fa-${editingUser ? 'save' : 'plus'} mr-1`}></i>
                                        {editingUser ? 'Lưu thay đổi' : 'Thêm người dùng'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {showModal && <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>}
        </div>
    );
};

export default Users;
