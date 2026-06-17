import React, { useState, useEffect, useCallback } from 'react';
import { productApi, categoryApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { getImageUrl } from '../utils/helpers';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const EMPTY_FORM = {
    name: '',
    slug: '',
    shortDescription: '',
    description: '',
    basePrice: '',
    salePrice: '',
    totalStock: 0,
    categoryId: '',
    brandId: '',
    sku: '',
    mainImageUrl: '',
    status: 'active',
    isFeatured: false,
    isNewArrival: false,
    metaTitle: '',
    metaDescription: '',
    isPublished: false,
};

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('basic'); // basic | seo | advanced
    const { isAdmin, token } = useAuth();

    const loadCategories = async () => {
        try {
            const res = await categoryApi.getAll();
            setCategories(res.data || []);
        } catch (e) { console.error(e); }
    };

    const loadBrands = async () => {
        try {
            const res = await axios.get(`${API_BASE}/Brands`, {
                headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` }
            });
            setBrands(res.data?.items || res.data || []);
        } catch (e) { console.error('Brands:', e); }
    };

    const loadProducts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await productApi.search({
                keyword, categoryId: categoryId || undefined,
                minPrice: minPrice || undefined, maxPrice: maxPrice || undefined,
                page, pageSize,
            });
            setProducts(res.data.items || []);
            setTotalPages(res.data.totalPages || 0);
            setTotalCount(res.data.totalCount || 0);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [keyword, categoryId, minPrice, maxPrice, page, pageSize]);

    useEffect(() => { loadCategories(); loadBrands(); }, []);
    useEffect(() => { loadProducts(); }, [loadProducts]);

    const set = (field, value) => setFormData(f => ({ ...f, [field]: value }));

    const openModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name || '',
                slug: product.slug || '',
                shortDescription: product.shortDescription || '',
                description: product.description || '',
                basePrice: product.basePrice || '',
                salePrice: product.salePrice || '',
                totalStock: product.totalStock || 0,
                categoryId: product.categoryId || '',
                brandId: product.brandId || '',
                sku: product.sku || '',
                mainImageUrl: product.mainImageUrl || '',
                status: product.status || 'active',
                isFeatured: product.isFeatured || false,
                isNewArrival: product.isNewArrival || false,
                metaTitle: product.metaTitle || '',
                metaDescription: product.metaDescription || '',
                isPublished: !!product.publishedAt,
            });
        } else {
            setEditingProduct(null);
            setFormData({ ...EMPTY_FORM, categoryId: categories[0]?.id || '' });
        }
        setError('');
        setActiveTab('basic');
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); setEditingProduct(null); setError(''); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!formData.categoryId) { 
            setError('Vui lòng chọn danh mục'); 
            return; 
        }

        try {
            const data = {
                name: formData.name,
                slug: formData.slug || undefined,
                shortDescription: formData.shortDescription,
                description: formData.description,
                basePrice: parseFloat(formData.basePrice) || 0,
                salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
                totalStock: parseInt(formData.totalStock) || 0,
                categoryId: formData.categoryId,
                brandId: formData.brandId || undefined,
                sku: formData.sku || undefined,
                mainImageUrl: formData.mainImageUrl,
                status: formData.status,
                isFeatured: formData.isFeatured,
                isNewArrival: formData.isNewArrival,
                metaTitle: formData.metaTitle,
                metaDescription: formData.metaDescription,
                isPublished: formData.isPublished,
            };

            if (editingProduct) {
                await productApi.update(editingProduct.id, data);
            } else {
                await productApi.create(data);
            }
            closeModal();
            loadProducts();
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi thao tác');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
        try {
            await productApi.delete(id);
            loadProducts();
        } catch { alert('Không thể xóa sản phẩm'); }
    };

    const renderPagination = () =>
    Array.from({ length: totalPages }, (_, i) => i + 1)
    .map(i => (
        <li
            key={i}
            className={`page-item ${page === i ? 'active' : ''}`}
        >
            <button
                className="page-link"
                onClick={() => setPage(i)}
            >
                {i}
            </button>
        </li>
    ));

    return (
        <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <h1 className="m-0">Quản lý sản phẩm</h1>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    <div className="card">
                        <div className="card-header">
                            <div className="d-flex justify-content-between align-items-center flex-wrap" style={{ gap: 8 }}>
                                <div className="d-flex align-items-center flex-wrap" style={{ gap: 8 }}>
                                    <input type="text" className="form-control" style={{ width: 180 }}
                                        placeholder="Tìm kiếm..." value={keyword}
                                        onChange={e => setKeyword(e.target.value)} />
                                    <input type="number" className="form-control" style={{ width: 120 }}
                                        placeholder="Giá tối thiểu" value={minPrice}
                                        onChange={e => setMinPrice(e.target.value)} />
                                    <input type="number" className="form-control" style={{ width: 120 }}
                                        placeholder="Giá tối đa" value={maxPrice}
                                        onChange={e => setMaxPrice(e.target.value)} />
                                    <select className="form-control" style={{ width: 160 }}
                                        value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                                        <option value="">Tất cả danh mục</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                {isAdmin && (
                                    <button className="btn btn-success" onClick={() => openModal()}>
                                        <i className="fas fa-plus"></i> Thêm sản phẩm
                                    </button>
                                )}
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
                                                <th style={{ width: 60 }}>Ảnh</th>
                                                <th>Tên sản phẩm</th>
                                                <th>SKU</th>
                                                <th>Danh mục</th>
                                                <th>Giá</th>
                                                <th>Giá giảm</th>
                                                <th>Tồn kho</th>
                                                <th>Trạng thái</th>
                                                {isAdmin && <th>Hành động</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.length === 0 ? (
                                                <tr><td colSpan={9} className="text-center py-4">Không tìm thấy sản phẩm nào</td></tr>
                                            ) : products.map(p => (
                                                <tr key={p.id}>
                                                    <td>
                                                        {p.mainImageUrl ? (
                                                            <img src={getImageUrl(p.mainImageUrl)} alt={p.name}
                                                                style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }}
                                                                onError={e => e.target.style.display = 'none'} />
                                                        ) : (
                                                            <div style={{ width: 48, height: 48, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#aaa' }}>N/A</div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <strong>{p.name}</strong>
                                                        {p.isFeatured && <span className="badge badge-warning ml-1" style={{ fontSize: 10 }}>Nổi bật</span>}
                                                        {p.isNewArrival && <span className="badge badge-info ml-1" style={{ fontSize: 10 }}>Mới</span>}
                                                    </td>
                                                    <td><code style={{ fontSize: 11 }}>{p.sku}</code></td>
                                                    <td>{p.category?.name || '—'}</td>
                                                    <td>{p.basePrice?.toLocaleString('vi-VN')} ₫</td>
                                                    <td>
                                                        {p.salePrice
                                                            ? <span className="text-danger font-weight-bold">{p.salePrice?.toLocaleString('vi-VN')} ₫</span>
                                                            : <span className="text-muted">—</span>}
                                                    </td>
                                                    <td>{p.totalStock}</td>
                                                    <td>
                                                        <span className={`badge ${p.status === 'active' ? 'badge-success' : p.status === 'inactive' ? 'badge-danger' : 'badge-secondary'}`}>
                                                            {p.status}
                                                        </span>
                                                    </td>
                                                    {isAdmin && (
                                                        <td>
                                                            <button className="btn btn-sm btn-info mr-1" onClick={() => openModal(p)}>
                                                                <i className="fas fa-edit"></i>
                                                            </button>
                                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}>
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </td>
                                                    )}
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
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingProduct ? `✏️ Sửa: ${editingProduct.name}` : '➕ Thêm sản phẩm mới'}
                                </h5>
                                <button type="button" className="close" onClick={closeModal}>
                                    <span>&times;</span>
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="modal-header py-0" style={{ borderTop: '1px solid #dee2e6' }}>
                                <ul className="nav nav-tabs border-0">
                                    {[
                                        { key: 'basic', label: '📦 Cơ bản' },
                                        { key: 'media', label: '🖼️ Ảnh & Mô tả' },
                                        { key: 'seo', label: '🔍 SEO & Nâng cao' },
                                    ].map(tab => (
                                        <li key={tab.key} className="nav-item">
                                            <button
                                                className={`nav-link ${activeTab === tab.key ? 'active' : ''}`}
                                                style={{ border: 'none', borderBottom: activeTab === tab.key ? '2px solid #007bff' : 'none', borderRadius: 0, padding: '12px 16px' }}
                                                onClick={() => setActiveTab(tab.key)}
                                                type="button"
                                            >
                                                {tab.label}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    {error && <div className="alert alert-danger">{error}</div>}

                                    {/* TAB: CƠ BẢN */}
                                    {activeTab === 'basic' && (
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label>Tên sản phẩm <span className="text-danger">*</span></label>
                                                    <input type="text" className="form-control"
                                                        value={formData.name}
                                                        onChange={e => set('name', e.target.value)}
                                                        required placeholder="Nhập tên sản phẩm..." />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label>Slug (URL)</label>
                                                    <input type="text" className="form-control"
                                                        value={formData.slug}
                                                        onChange={e => set('slug', e.target.value)}
                                                        placeholder="tu-dong-tao-tu-ten" />
                                                    <small className="text-muted">Để trống sẽ tự động tạo từ tên</small>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label>Giá gốc (VND) <span className="text-danger">*</span></label>
                                                    <input type="number" className="form-control"
                                                        value={formData.basePrice}
                                                        onChange={e => set('basePrice', e.target.value)}
                                                        required min="0" step="1000" />
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label>Giá giảm (VND)</label>
                                                    <input type="number" className="form-control"
                                                        value={formData.salePrice}
                                                        onChange={e => set('salePrice', e.target.value)}
                                                        min="0" step="1000"
                                                        placeholder="Để trống nếu không giảm" />
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label>Tồn kho <span className="text-danger">*</span></label>
                                                    <input type="number" className="form-control"
                                                        value={formData.totalStock}
                                                        onChange={e => set('totalStock', e.target.value)}
                                                        required min="0" />
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label>Danh mục <span className="text-danger">*</span></label>
                                                    <select className="form-control"
                                                        value={formData.categoryId}
                                                        onChange={e => set('categoryId', e.target.value)}
                                                        required>
                                                        <option value="">-- Chọn danh mục --</option>
                                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label>Thương hiệu</label>
                                                    <select className="form-control"
                                                        value={formData.brandId}
                                                        onChange={e => set('brandId', e.target.value)}>
                                                        <option value="">-- Không có --</option>
                                                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label>SKU</label>
                                                    <input type="text" className="form-control"
                                                        value={formData.sku}
                                                        onChange={e => set('sku', e.target.value)}
                                                        placeholder="Tự động tạo nếu để trống" />
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label>Trạng thái</label>
                                                    <select className="form-control"
                                                        value={formData.status}
                                                        onChange={e => set('status', e.target.value)}>
                                                        <option value="active">Active</option>
                                                        <option value="inactive">Inactive</option>
                                                        <option value="draft">Draft</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-8">
                                                <div className="form-group">
                                                    <label>Tùy chọn</label>
                                                    <div className="d-flex" style={{ gap: 24, marginTop: 8 }}>
                                                        <div className="custom-control custom-switch">
                                                            <input type="checkbox" className="custom-control-input"
                                                                id="isFeatured"
                                                                checked={formData.isFeatured}
                                                                onChange={e => set('isFeatured', e.target.checked)} />
                                                            <label className="custom-control-label" htmlFor="isFeatured">Nổi bật</label>
                                                        </div>
                                                        <div className="custom-control custom-switch">
                                                            <input type="checkbox" className="custom-control-input"
                                                                id="isNewArrival"
                                                                checked={formData.isNewArrival}
                                                                onChange={e => set('isNewArrival', e.target.checked)} />
                                                            <label className="custom-control-label" htmlFor="isNewArrival">Hàng mới</label>
                                                        </div>
                                                        <div className="custom-control custom-switch">
                                                            <input type="checkbox" className="custom-control-input"
                                                                id="isPublished"
                                                                checked={formData.isPublished}
                                                                onChange={e => set('isPublished', e.target.checked)} />
                                                            <label className="custom-control-label" htmlFor="isPublished">Công khai</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* TAB: ẢNH & MÔ TẢ */}
                                    {activeTab === 'media' && (
                                        <div className="row">
                                            <div className="col-md-5">
                                                <div className="form-group">
                                                    <label>URL ảnh chính</label>
                                                    <input type="text" className="form-control mb-2"
                                                        value={formData.mainImageUrl}
                                                        onChange={e => set('mainImageUrl', e.target.value)}
                                                        placeholder="/img/ten-anh.jpg" />
                                                    <div style={{
                                                        width: '100%', height: 220,
                                                        border: '2px dashed #dee2e6', borderRadius: 8,
                                                        background: '#f8f9fa', display: 'flex',
                                                        alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                                                    }}>
                                                        {formData.mainImageUrl ? (
                                                            <img
                                                                src={getImageUrl(formData.mainImageUrl)}
                                                                alt="Preview"
                                                                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                                                                onError={e => { e.target.style.display = 'none'; }}
                                                            />
                                                        ) : (
                                                            <div className="text-center text-muted">
                                                                <i className="fas fa-image fa-3x mb-2"></i>
                                                                <div style={{ fontSize: 13 }}>Nhập URL ảnh để xem preview</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <small className="text-muted">
                                                        Ảnh nằm trong <code>public/img/</code> của WebDecor.<br />
                                                        Ví dụ: <code>/img/den_ban_go.jpg</code>
                                                    </small>
                                                </div>
                                            </div>
                                            <div className="col-md-7">
                                                <div className="form-group">
                                                    <label>Mô tả ngắn</label>
                                                    <textarea className="form-control"
                                                        value={formData.shortDescription}
                                                        onChange={e => set('shortDescription', e.target.value)}
                                                        rows={3}
                                                        placeholder="Mô tả ngắn gọn hiển thị trong danh sách sản phẩm..." />
                                                </div>
                                                <div className="form-group">
                                                    <label>Mô tả chi tiết</label>
                                                    <textarea className="form-control"
                                                        value={formData.description}
                                                        onChange={e => set('description', e.target.value)}
                                                        rows={7}
                                                        placeholder="Mô tả chi tiết sản phẩm..." />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* TAB: SEO & NÂNG CAO */}
                                    {activeTab === 'seo' && (
                                        <div className="row">
                                            <div className="col-md-12">
                                                <div className="alert alert-info py-2">
                                                    <i className="fas fa-info-circle"></i> Các trường SEO giúp tối ưu hiển thị trên Google
                                                </div>
                                            </div>
                                            <div className="col-md-12">
                                                <div className="form-group">
                                                    <label>Meta Title</label>
                                                    <input type="text" className="form-control"
                                                        value={formData.metaTitle}
                                                        onChange={e => set('metaTitle', e.target.value)}
                                                        placeholder="Tiêu đề hiển thị trên Google (để trống = dùng tên sản phẩm)" />
                                                    <small className="text-muted">{formData.metaTitle?.length || 0}/160 ký tự</small>
                                                </div>
                                            </div>
                                            <div className="col-md-12">
                                                <div className="form-group">
                                                    <label>Meta Description</label>
                                                    <textarea className="form-control"
                                                        value={formData.metaDescription}
                                                        onChange={e => set('metaDescription', e.target.value)}
                                                        rows={3}
                                                        placeholder="Mô tả hiển thị trên Google..." />
                                                    <small className="text-muted">{formData.metaDescription?.length || 0}/300 ký tự</small>
                                                </div>
                                            </div>
                                            {/* Preview Google */}
                                            {(formData.metaTitle || formData.name) && (
                                                <div className="col-md-12">
                                                    <label>Preview Google</label>
                                                    <div style={{ border: '1px solid #dee2e6', borderRadius: 8, padding: 16, background: '#fff' }}>
                                                        <div style={{ color: '#1a0dab', fontSize: 18, marginBottom: 2 }}>
                                                            {formData.metaTitle || formData.name}
                                                        </div>
                                                        <div style={{ color: '#006621', fontSize: 13 }}>
                                                            localhost:5173/product/{formData.slug || 'slug-san-pham'}
                                                        </div>
                                                        <div style={{ color: '#545454', fontSize: 13, marginTop: 4 }}>
                                                            {formData.metaDescription || formData.shortDescription || 'Không có mô tả'}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={closeModal}>Hủy</button>
                                    {activeTab !== 'seo' && (
                                        <button type="button" className="btn btn-outline-primary"
                                            onClick={() => setActiveTab(activeTab === 'basic' ? 'media' : 'seo')}>
                                            Tiếp theo →
                                        </button>
                                    )}
                                    <button type="submit" className="btn btn-primary">
                                        <i className={`fas fa-${editingProduct ? 'save' : 'plus'} mr-1`}></i>
                                        {editingProduct ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
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

export default Products;
