import React, { useState, useEffect } from 'react';
import { couponApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Coupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [discountTypeFiller, setDiscountTypeFiller] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        discountType: 'percentage',
        discountValue: 0,
        minOrderValue: 0,
        maxDiscountAmount: 0,
        usageLimit: 0,
        validFrom: '',
        validUntil: '',
        isActive: true,
    });
    const [error, setError] = useState('');

    const loadCoupons = async () => {
        setLoading(true);
        try {
            const response = await couponApi.getAll({ keyword, page, pageSize, discountType: discountTypeFiller });
            setCoupons(response.data.items);
            setTotalCount(response.data.totalCount);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Failed to load coupons:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCoupons();
    }, [page, keyword, discountTypeFiller]);

    const openModal = (coupon = null) => {
        if (coupon) {
            setEditingCoupon(coupon);
            setFormData({
                code: coupon.code,
                name: coupon.name,
                description: coupon.description || '',
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                minOrderValue: coupon.minOrderValue,
                maxDiscountAmount: coupon.maxDiscountAmount || 0,
                usageLimit: coupon.usageLimit || 0,
                validFrom: coupon.validFrom?.split('T')[0] || '',
                validUntil: coupon.validUntil?.split('T')[0] || '',
                isActive: coupon.isActive,
            });
        } else {
            setEditingCoupon(null);
            setFormData({
                code: '',
                name: '',
                description: '',
                discountType: 'percentage',
                discountValue: 0,
                minOrderValue: 0,
                maxDiscountAmount: 0,
                usageLimit: 0,
                validFrom: '',
                validUntil: '',
                isActive: true,
            });
        }
        setError('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingCoupon(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editingCoupon) {
                await couponApi.update(editingCoupon.id, formData);
            } else {
                await couponApi.create(formData);
            }
            closeModal();
            loadCoupons();
        } catch (error) {
            setError(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this coupon?')) return;
        try {
            await couponApi.delete(id);
            loadCoupons();
        } catch (error) {
            alert('Failed to delete coupon');
        }
    };

    const formatCurrency = (value) => {
        return (value || 0).toLocaleString('vi-VN') + ' ₫';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    return (
        <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">Quản lý mã giảm giá</h1>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    <div className="card">
                        <div className="card-header">
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="d-flex align-items-center" style={{ gap: 8 }}>
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{ width: 280 }}
                                            placeholder="Tìm theo mã hoặc tên..."
                                            value={keyword}
                                            onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
                                        />

                                        <select
                                            className = 'form-control'
                                            style={{width: 180}}
                                            value={discountTypeFiller}
                                            onChange={(e) => { setDiscountTypeFiller(e.target.value); setPage(1); }}
                                        >
                                            <option value=''>Các loại giảm giá</option>
                                            <option value='percentage'>Phần trăm (%)</option>
                                            <option value='fixed'>Tiền mặt (₫)</option>
                                        </select>
                                           
                                    </div>
                                </div>
                                <div className="col-md-6 text-right">
                                    <button className="btn btn-success" onClick={() => openModal()}>
                                        <i className="fas fa-plus"></i> Thêm mã giảm giá
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="card-body">
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary"></div>
                                </div>
                            ) : (
                                <>
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-striped">
                                            <thead>
                                                <tr>
                                                    <th>Mã</th>
                                                    <th>Tên</th>
                                                    <th>Loại giảm</th>
                                                    <th>Giá trị</th>
                                                    <th>Đơn tối thiểu</th>
                                                    <th>Giảm tối đa</th>
                                                    <th>Số lượt</th>
                                                    <th>Đã dùng</th>
                                                    <th>Hiệu lực</th>
                                                    <th>Trạng thái</th>
                                                    <th>Hành động</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {coupons.map(coupon => (
                                                    <tr key={coupon.id}>
                                                        <td><strong>{coupon.code}</strong></td>
                                                        <td>{coupon.name}</td>
                                                        <td>
                                                            {coupon.discountType === 'percentage' ? 'Phần trăm' : 'Tiền mặt'}
                                                        </td>
                                                        <td>
                                                            {coupon.discountType === 'percentage' 
                                                                ? `${coupon.discountValue}%` 
                                                                : formatCurrency(coupon.discountValue)}
                                                        </td>
                                                        <td>{formatCurrency(coupon.minOrderValue)}</td>
                                                        <td>
                                                            {coupon.discountType === 'percentage' && coupon.maxDiscountAmount > 0 
                                                                ? formatCurrency(coupon.maxDiscountAmount) 
                                                                : '—'}
                                                        </td>
                                                        <td>{coupon.usageLimit || '∞'}</td>
                                                        <td>{coupon.usedCount || 0}</td>
                                                        <td>
                                                            {formatDate(coupon.validFrom)} → {formatDate(coupon.validUntil)}
                                                        </td>
                                                        <td>
                                                            <span className={`badge ${coupon.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                                {coupon.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                                            </span>
                                                         </td>
                                                        <td>
                                                            <button className="btn btn-sm btn-info mr-1" onClick={() => openModal(coupon)}>
                                                                <i className="fas fa-edit"></i>
                                                            </button>
                                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(coupon.id)}>
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                         </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mt-3">
                                        <span>Tổng: {totalCount} mã giảm giá</span>
                                        <nav>
                                            <ul className="pagination mb-0">
                                                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                                    <button className="page-link" onClick={() => setPage(page - 1)}>Trước</button>
                                                </li>
                                                {[...Array(totalPages).keys()].map(i => (
                                                    <li key={i+1} className={`page-item ${page === i+1 ? 'active' : ''}`}>
                                                        <button className="page-link" onClick={() => setPage(i+1)}>{i+1}</button>
                                                    </li>
                                                ))}
                                                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                                    <button className="page-link" onClick={() => setPage(page + 1)}>Sau</button>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Modal Thêm/Sửa */}
            {/* Modal Thêm/Sửa */}
{showModal && (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
        <div className="modal-dialog modal-md">
            <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                    <h5 className="modal-title">
                        <i className="fas fa-ticket-alt mr-2"></i>
                        {editingCoupon ? 'Sửa mã giảm giá' : 'Thêm mã giảm giá'}
                    </h5>
                    <button type="button" className="close text-white" onClick={closeModal}>
                        <span>&times;</span>
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                        {error && <div className="alert alert-danger alert-dismissible fade show">
                            <button type="button" className="close" onClick={() => setError('')}>×</button>
                            {error}
                        </div>}
                        
                        {/* Hàng 1: Mã và Tên */}
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="font-weight-bold">Mã giảm giá <span className="text-danger">*</span></label>
                                    <input 
                                        type="text" 
                                        className="form-control form-control-sm" 
                                        value={formData.code}
                                        onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                                        placeholder="VD: SUMMER20"
                                        required 
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="font-weight-bold">Tên mã giảm giá <span className="text-danger">*</span></label>
                                    <input 
                                        type="text" 
                                        className="form-control form-control-sm"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        placeholder="VD: Khuyến mãi hè 2026"
                                        required 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Hàng 2: Loại và Giá trị */}
                        <div className="row">
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label className="font-weight-bold">Loại giảm <span className="text-danger">*</span></label>
                                    <select className="form-control form-control-sm"
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({...formData, discountType: e.target.value})}>
                                        <option value="percentage">% Phần trăm</option>
                                        <option value="fixed">₫ Tiền mặt</option>
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label className="font-weight-bold">Giá trị giảm <span className="text-danger">*</span></label>
                                    <div className="input-group input-group-sm">
                                        <input type="number" className="form-control"
                                            value={formData.discountValue}
                                            onChange={(e) => setFormData({...formData, discountValue: parseFloat(e.target.value)})}
                                            required min="0" />
                                        <div className="input-group-append">
                                            <span className="input-group-text">
                                                {formData.discountType === 'percentage' ? '%' : '₫'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label className="font-weight-bold">Trạng thái</label>
                                    <select className="form-control form-control-sm"
                                        value={formData.isActive}
                                        onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}>
                                        <option value="true">✅ Hoạt động</option>
                                        <option value="false">❌ Không hoạt động</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Hàng 3: Đơn tối thiểu và Giảm tối đa */}
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="font-weight-bold">Đơn hàng tối thiểu (₫)</label>
                                    <div className="input-group input-group-sm">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text">₫</span>
                                        </div>
                                        <input type="number" className="form-control"
                                            value={formData.minOrderValue}
                                            onChange={(e) => setFormData({...formData, minOrderValue: parseFloat(e.target.value)})}
                                            min="0" step="1000" />
                                    </div>
                                    <small className="text-muted">Để 0 nếu không giới hạn</small>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="font-weight-bold">Giảm tối đa (₫)</label>
                                    <div className="input-group input-group-sm">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text">₫</span>
                                        </div>
                                        <input type="number" className="form-control"
                                            value={formData.maxDiscountAmount}
                                            onChange={(e) => setFormData({...formData, maxDiscountAmount: parseFloat(e.target.value)})}
                                            min="0" step="10000"
                                            disabled={formData.discountType !== 'percentage'} />
                                    </div>
                                    <small className="text-muted">Chỉ áp dụng cho %</small>
                                </div>
                            </div>
                        </div>

                        {/* Hàng 4: Số lượt */}
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="font-weight-bold">Số lượt sử dụng tối đa</label>
                                    <input type="number" className="form-control form-control-sm"
                                        value={formData.usageLimit}
                                        onChange={(e) => setFormData({...formData, usageLimit: parseInt(e.target.value)})}
                                        min="0" />
                                    <small className="text-muted">Để 0 nếu không giới hạn</small>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="font-weight-bold">&nbsp;</label>
                                    <div className="form-control-plaintext text-success">
                                        <i className="fas fa-info-circle"></i> Đã dùng: {editingCoupon?.usedCount || 0} lượt
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hàng 5: Ngày bắt đầu và kết thúc */}
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="font-weight-bold">Ngày bắt đầu <span className="text-danger">*</span></label>
                                    <input type="date" className="form-control form-control-sm"
                                        value={formData.validFrom}
                                        onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
                                        required />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="font-weight-bold">Ngày kết thúc <span className="text-danger">*</span></label>
                                    <input type="date" className="form-control form-control-sm"
                                        value={formData.validUntil}
                                        onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                                        required />
                                </div>
                            </div>
                        </div>

                        {/* Hàng 6: Mô tả */}
                        <div className="form-group">
                            <label className="font-weight-bold">Mô tả</label>
                            <textarea className="form-control form-control-sm"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                rows="2"
                                placeholder="Nhập mô tả chi tiết về chương trình khuyến mãi..." />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary btn-sm" onClick={closeModal}>
                            <i className="fas fa-times"></i> Hủy
                        </button>
                        <button type="submit" className="btn btn-primary btn-sm">
                            <i className="fas fa-save"></i> {editingCoupon ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
)}
            {showModal && <div className="modal-backdrop fade show"></div>}
        </div>
    );
};

export default Coupons;