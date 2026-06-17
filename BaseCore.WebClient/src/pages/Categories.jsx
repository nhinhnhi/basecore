import React, { useState, useEffect } from 'react';
import { categoryApi, brandApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { getImageUrl } from '../utils/helpers';

const EMPTY_FORM = {
    name: '', slug: '', description: '', imageUrl: '', iconClass: 'fas fa-tag',
    isActive: true, showInMenu: true, sortOrder: 0,
    metaTitle: '', metaDescription: '', parentId: '', brandId: '',
};

const ICON_OPTIONS = [
    'fas fa-tag', 'fas fa-lightbulb', 'fas fa-palette', 'fas fa-image',
    'fas fa-seedling', 'fas fa-gift', 'fas fa-home', 'fas fa-couch',
    'fas fa-lamp', 'fas fa-star', 'fas fa-heart', 'fas fa-shopping-bag',
];

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [allCategories, setAllCategories] = useState([]); // for parent dropdown
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [error, setError] = useState('');
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [activeTab, setActiveTab] = useState('basic');
    const { isAdmin } = useAuth();

    const set = (field, value) => setFormData(f => ({ ...f, [field]: value }));

    const loadCategories = async () => {
        setLoading(true);
        try {
            const res = await categoryApi.getAll();
            const all = Array.isArray(res.data) ? res.data : [];
            setAllCategories(all);
            const filtered = keyword
                ? all.filter(c =>
                    c.name?.toLowerCase().includes(keyword.toLowerCase()) ||
                    c.description?.toLowerCase().includes(keyword.toLowerCase()))
                : all;
            setTotalCount(filtered.length);
            setTotalPages(Math.ceil(filtered.length / pageSize) || 1);
            setCategories(filtered.slice((page - 1) * pageSize, page * pageSize));
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const loadBrands = async () => {
        try {
            const res = await brandApi.getAll();
            setBrands(res.data?.items || res.data || []);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { loadCategories(); }, [page, keyword]);
    useEffect(() => { loadBrands(); }, []);

    const openModal = (cat = null) => {
        if (cat) {
            setEditingCategory(cat);
            setFormData({
                name: cat.name || '',
                slug: cat.slug || '',
                description: cat.description || '',
                imageUrl: cat.imageUrl || '',
                iconClass: cat.iconClass || 'fas fa-tag',
                isActive: cat.isActive ?? true,
                showInMenu: cat.showInMenu ?? true,
                sortOrder: cat.sortOrder ?? 0,
                metaTitle: cat.metaTitle || '',
                metaDescription: cat.metaDescription || '',
                parentId: cat.parentId || '',
                brandId: cat.brandId || '',
            });
        } else {
            setEditingCategory(null);
            setFormData(EMPTY_FORM);
        }
        setError('');
        setActiveTab('basic');
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); setEditingCategory(null); setError(''); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const data = {
                name: formData.name,
                slug: formData.slug || undefined,
                description: formData.description,
                imageUrl: formData.imageUrl,
                iconClass: formData.iconClass,
                isActive: formData.isActive,
                showInMenu: formData.showInMenu,
                sortOrder: parseInt(formData.sortOrder) || 0,
                metaTitle: formData.metaTitle,
                metaDescription: formData.metaDescription,
                parentId: formData.parentId || undefined,
                brandId: formData.brandId || undefined,
            };
            if (editingCategory) {
                await categoryApi.update(editingCategory.id, data);
            } else {
                await categoryApi.create(data);
            }
            closeModal();
            loadCategories();
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi thao tác');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;
        try {
            await categoryApi.delete(id);
            loadCategories();
        } catch (err) {
            alert(err.response?.data?.message || 'Không thể xóa danh mục');
        }
    };

    const renderPagination = () => Array.from({ length: totalPages }, (_, i) => i + 1).map(i => (
        <li key={i} className={`page-item ${page === i ? 'active' : ''}`}>
            <button className="page-link" onClick={() => setPage(i)}>{i}</button>
        </li>
    ));

    return (
        <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <h1 className="m-0">Quản lý danh mục</h1>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    <div className="card">
                        <div className="card-header">
                            <div className="d-flex justify-content-between align-items-center">
                                <input type="text" className="form-control" style={{ width: 280 }}
                                    placeholder="Tìm theo tên hoặc mô tả..."
                                    value={keyword}
                                    onChange={e => { setKeyword(e.target.value); setPage(1); }} />
                                {isAdmin && (
                                    <button className="btn btn-success" onClick={() => openModal()}>
                                        <i className="fas fa-plus"></i> Thêm danh mục
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
                                                <th>Tên danh mục</th>
                                                <th>Danh mục cha</th>
                                                <th>Icon</th>
                                                <th>Thứ tự</th>
                                                <th>Trạng thái</th>
                                                <th>Hiện menu</th>
                                                <th>Thương hiệu</th>
                                                {isAdmin && <th>Hành động</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {categories.length === 0 ? (
                                                <tr><td colSpan={9} className="text-center py-4">Không tìm thấy danh mục nào</td></tr>
                                            ) : categories.map(cat => (
                                                <tr key={cat.id}>
                                                    <td>
                                                        {cat.imageUrl ? (
                                                            <img src={getImageUrl(cat.imageUrl)} alt={cat.name}
                                                                style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 4 }}
                                                                onError={e => e.target.style.display = 'none'} />
                                                        ) : (
                                                            <div style={{ width: 44, height: 44, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <i className={cat.iconClass || 'fas fa-tag'} style={{ color: '#aaa' }}></i>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <strong>{cat.name}</strong>
                                                        {cat.description && <div style={{ fontSize: 12, color: '#888' }}>{cat.description.slice(0, 60)}{cat.description.length > 60 ? '...' : ''}</div>}
                                                    </td>
                                                    <td>{cat.parentName || <span className="text-muted">—</span>}</td>
                                                    <td><i className={cat.iconClass || 'fas fa-tag'}></i> <code style={{ fontSize: 10 }}>{cat.iconClass}</code></td>
                                                    <td>{cat.sortOrder}</td>
                                                    <td>
                                                        <span className={`badge ${cat.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                            {cat.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${cat.showInMenu ? 'badge-info' : 'badge-secondary'}`}>
                                                            {cat.showInMenu ? 'Có' : 'Không'}
                                                        </span>
                                                    </td>
                                                    <td>{cat.brand?.name || '—'}</td>
                                                    {isAdmin && (
                                                        <td>
                                                            <button className="btn btn-sm btn-info mr-1" onClick={() => openModal(cat)}>
                                                                <i className="fas fa-edit"></i>
                                                            </button>
                                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(cat.id)}>
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
                            <span>Tổng: {totalCount} danh mục</span>
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
                                    {editingCategory ? `✏️ Sửa: ${editingCategory.name}` : '➕ Thêm danh mục mới'}
                                </h5>
                                <button type="button" className="close" onClick={closeModal}><span>&times;</span></button>
                            </div>

                            {/* Tabs */}
                            <div className="modal-header py-0" style={{ borderTop: '1px solid #dee2e6' }}>
                                <ul className="nav nav-tabs border-0">
                                    {[
                                        { key: 'basic', label: '📁 Cơ bản' },
                                        { key: 'display', label: '🎨 Hiển thị' },
                                        { key: 'seo', label: '🔍 SEO' },
                                    ].map(tab => (
                                        <li key={tab.key} className="nav-item">
                                            <button
                                                type="button"
                                                className={`nav-link ${activeTab === tab.key ? 'active' : ''}`}
                                                style={{ border: 'none', borderBottom: activeTab === tab.key ? '2px solid #007bff' : 'none', borderRadius: 0, padding: '12px 16px' }}
                                                onClick={() => setActiveTab(tab.key)}
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
                                                    <label>Tên danh mục <span className="text-danger">*</span></label>
                                                    <input type="text" className="form-control"
                                                        value={formData.name}
                                                        onChange={e => set('name', e.target.value)}
                                                        required placeholder="Nhập tên danh mục..." />
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
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label>Danh mục cha</label>
                                                    <select className="form-control"
                                                        value={formData.parentId}
                                                        onChange={e => set('parentId', e.target.value)}>
                                                        <option value="">-- Không có (danh mục gốc) --</option>
                                                        {allCategories
                                                            .filter(c => c.id !== editingCategory?.id)
                                                            .map(c => (
                                                                <option key={c.id} value={c.id}>{c.name}</option>
                                                            ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
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
                                            <div className="col-md-12">
                                                <div className="form-group">
                                                    <label>Mô tả</label>
                                                    <textarea className="form-control" rows={3}
                                                        value={formData.description}
                                                        onChange={e => set('description', e.target.value)}
                                                        placeholder="Mô tả ngắn về danh mục..." />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* TAB: HIỂN THỊ */}
                                    {activeTab === 'display' && (
                                        <div className="row">
                                            <div className="col-md-5">
                                                <div className="form-group">
                                                    <label>URL ảnh danh mục</label>
                                                    <input type="text" className="form-control mb-2"
                                                        value={formData.imageUrl}
                                                        onChange={e => set('imageUrl', e.target.value)}
                                                        placeholder="/img/ten-anh.jpg" />
                                                    <div style={{
                                                        width: '100%', height: 160, border: '2px dashed #dee2e6',
                                                        borderRadius: 8, background: '#f8f9fa', display: 'flex',
                                                        alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                                                    }}>
                                                        {formData.imageUrl ? (
                                                            <img src={getImageUrl(formData.imageUrl)} alt="preview"
                                                                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                                                                onError={e => e.target.style.display = 'none'} />
                                                        ) : (
                                                            <div className="text-center text-muted">
                                                                <i className="fas fa-image fa-2x mb-1"></i>
                                                                <div style={{ fontSize: 12 }}>Preview ảnh</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-7">
                                                <div className="form-group">
                                                    <label>Icon Class (Font Awesome)</label>
                                                    <div className="d-flex flex-wrap" style={{ gap: 8, marginBottom: 8 }}>
                                                        {ICON_OPTIONS.map(icon => (
                                                            <button key={icon} type="button"
                                                                className={`btn btn-sm ${formData.iconClass === icon ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                                style={{ width: 40, height: 36 }}
                                                                onClick={() => set('iconClass', icon)}
                                                                title={icon}>
                                                                <i className={icon}></i>
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <input type="text" className="form-control"
                                                        value={formData.iconClass}
                                                        onChange={e => set('iconClass', e.target.value)}
                                                        placeholder="fas fa-tag" />
                                                    <small className="text-muted">
                                                        Preview: <i className={formData.iconClass}></i> <code>{formData.iconClass}</code>
                                                    </small>
                                                </div>
                                                <div className="row">
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label>Thứ tự hiển thị</label>
                                                            <input type="number" className="form-control"
                                                                value={formData.sortOrder}
                                                                onChange={e => set('sortOrder', e.target.value)}
                                                                min="0" />
                                                            <small className="text-muted">Số nhỏ hơn = hiển thị trước</small>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-8">
                                                        <div className="form-group">
                                                            <label>Tùy chọn hiển thị</label>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                                                                <div className="custom-control custom-switch">
                                                                    <input type="checkbox" className="custom-control-input"
                                                                        id="isActive" checked={formData.isActive}
                                                                        onChange={e => set('isActive', e.target.checked)} />
                                                                    <label className="custom-control-label" htmlFor="isActive">Kích hoạt</label>
                                                                </div>
                                                                <div className="custom-control custom-switch">
                                                                    <input type="checkbox" className="custom-control-input"
                                                                        id="showInMenu" checked={formData.showInMenu}
                                                                        onChange={e => set('showInMenu', e.target.checked)} />
                                                                    <label className="custom-control-label" htmlFor="showInMenu">Hiện trong menu</label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* TAB: SEO */}
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
                                                        placeholder="Để trống = dùng tên danh mục" />
                                                    <small className="text-muted">{formData.metaTitle?.length || 0}/160 ký tự</small>
                                                </div>
                                            </div>
                                            <div className="col-md-12">
                                                <div className="form-group">
                                                    <label>Meta Description</label>
                                                    <textarea className="form-control" rows={3}
                                                        value={formData.metaDescription}
                                                        onChange={e => set('metaDescription', e.target.value)}
                                                        placeholder="Mô tả hiển thị trên Google..." />
                                                    <small className="text-muted">{formData.metaDescription?.length || 0}/300 ký tự</small>
                                                </div>
                                            </div>
                                            {(formData.metaTitle || formData.name) && (
                                                <div className="col-md-12">
                                                    <label>Preview Google</label>
                                                    <div style={{ border: '1px solid #dee2e6', borderRadius: 8, padding: 16, background: '#fff' }}>
                                                        <div style={{ color: '#1a0dab', fontSize: 18, marginBottom: 2 }}>
                                                            {formData.metaTitle || formData.name}
                                                        </div>
                                                        <div style={{ color: '#006621', fontSize: 13 }}>
                                                            localhost:5173/category/{formData.slug || 'slug-danh-muc'}
                                                        </div>
                                                        <div style={{ color: '#545454', fontSize: 13, marginTop: 4 }}>
                                                            {formData.metaDescription || formData.description || 'Không có mô tả'}
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
                                            onClick={() => setActiveTab(activeTab === 'basic' ? 'display' : 'seo')}>
                                            Tiếp theo →
                                        </button>
                                    )}
                                    <button type="submit" className="btn btn-primary">
                                        <i className={`fas fa-${editingCategory ? 'save' : 'plus'} mr-1`}></i>
                                        {editingCategory ? 'Lưu thay đổi' : 'Thêm danh mục'}
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

export default Categories;
