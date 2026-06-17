    import React, { useState, useEffect } from 'react';
    import { brandApi } from '../services/api';
    import { useAuth } from '../contexts/AuthContext';
    import { getLogoUrl } from '../utils/helpers';

    const Brands = () => {
        const [brands, setBrands] = useState([]);
        const [loading, setLoading] = useState(true);
        const [keyword, setKeyword] = useState('');
        const [page, setPage] = useState(1);
        const [pageSize] = useState(10);
        const [totalPages, setTotalPages] = useState(0);
        const [totalCount, setTotalCount] = useState(0);
        const [showModal, setShowModal] = useState(false);
        const [editingBrand, setEditingBrand] = useState(null);
        const [formData, setFormData] = useState({
            name: '',
            slug: '',
            logoUrl: '',
            description: '',
            websiteUrl: '',
            isActive: true,
        });
        const [error, setError] = useState('');
        const { isAdmin } = useAuth();

        useEffect(() => {
            loadBrands();
        }, [page, keyword]);

        const loadBrands = async () => {
            setLoading(true);
            try {
                const response = await brandApi.getAll({ keyword, page, pageSize });
                const data = response.data;
                // Giả sử backend trả về { items, totalCount, totalPages }
                if (data.items) {
                    setBrands(data.items);
                    setTotalCount(data.totalCount);
                    setTotalPages(data.totalPages);
                } else if (Array.isArray(data)) {
                    // Fallback client-side pagination
                    const filtered = data.filter(b => b.name.toLowerCase().includes(keyword.toLowerCase()) || (b.description && b.description.toLowerCase().includes(keyword.toLowerCase())));
                    setTotalCount(filtered.length);
                    setTotalPages(Math.ceil(filtered.length / pageSize));
                    const start = (page - 1) * pageSize;
                    setBrands(filtered.slice(start, start + pageSize));
                }
            } catch (error) {
                console.error('Failed to load brands:', error);
            } finally {
                setLoading(false);
            }
        };

        const handleSearch = (e) => {
            e.preventDefault();
            setPage(1);
            loadBrands();
        };

        const openModal = (brand = null) => {
            if (brand) {
                setEditingBrand(brand);
                setFormData({
                    name: brand.name,
                    slug: brand.slug,
                    logoUrl: brand.logoUrl || '',
                    description: brand.description || '',
                    websiteUrl: brand.websiteUrl || '',
                    isActive: brand.isActive,
                });
            } else {
                setEditingBrand(null);
                setFormData({
                    name: '',
                    slug: '',
                    logoUrl: '',
                    description: '',
                    websiteUrl: '',
                    isActive: true,
                });
            }
            setError('');
            setShowModal(true);
        };

        const closeModal = () => {
            setShowModal(false);
            setEditingBrand(null);
            setError('');
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            setError('');
            try {
                if (editingBrand) {
                    await brandApi.update(editingBrand.id, { ...formData, id: editingBrand.id });
                } else {
                    await brandApi.create(formData);
                }
                closeModal();
                loadBrands();
            } catch (error) {
                setError(error.response?.data?.message || 'Operation failed');
            }
        };

        const handleDelete = async (id) => {
            if (!window.confirm('Are you sure you want to delete this brand? It may affect related products.')) return;
            try {
                await brandApi.delete(id);
                loadBrands();
            } catch (error) {
                alert('Failed to delete brand. It may have associated products.');
            }
        };

        const renderPagination = () => {
            const pages = [];
            for (let i = 1; i <= totalPages; i++) {
                pages.push(
                    <li key={i} className={`page-item ${page === i ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => setPage(i)}>{i}</button>
                    </li>
                );
            }
            return pages;
        };

        return (
            <div className="content-wrapper">
                <div className="content-header">
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                                <h1 className="m-0">Quản lý thương hiệu</h1>
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
                                        <form onSubmit={handleSearch} className="form-inline">
                                            <input
                                                type="text"
                                                className="form-control mr-2"
                                                placeholder="Search by name, description..."
                                                value={keyword}
                                                onChange={(e) => setKeyword(e.target.value)}
                                            />
                                            <button type="submit" className="btn btn-primary">
                                                <i className="fas fa-search"></i> Tìm kiếm
                                            </button>
                                        </form>
                                    </div>
                                    <div className="col-md-6 text-right">
                                        {isAdmin && (
                                            <button className="btn btn-success" onClick={() => openModal()}>
                                                <i className="fas fa-plus"></i> Thêm
                                            </button>
                                        )}
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
                                        <table className="table table-bordered table-striped">
                                            <thead>
                                                <tr>
                                                    <th style={{width: '80px'}}>Logo</th>
                                                    <th>Tên nhà cung cấp</th>

                                                    <th>Mô tả</th>
                                                    <th>Website</th>
                                                    <th>Hành động</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {brands.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="5" className="text-center">Không tìm thấy</td>
                                                    </tr>
                                                ) : (
                                                    brands.map(brand => (
                                                        <tr key={brand.id}>
                                                            <td>  {/* thay ô brand.name cũ, thêm logo trước */}
                                                                {brand.logoUrl ? (
                                                                    <img
                                                                        src={getLogoUrl(brand)}
                                                                        alt={brand.name}
                                                                        style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 6 }}
                                                                        onError={(e) => {
                                                                            e.target.style.display = 'none';
                                                                            e.target.nextSibling.style.display = 'flex';
                                                                        }}
                                                                    />
                                                                ) : null}
                                                                <div style={{
                                                                    display: brand.logoUrl ? 'none' : 'flex',
                                                                    width: 48, height: 48, borderRadius: 6,
                                                                    background: '#e8f0fe', alignItems: 'center',
                                                                    justifyContent: 'center', fontWeight: 500,
                                                                    fontSize: 13, color: '#185FA5'
                                                                }}>
                                                                    {brand.name.slice(0, 2).toUpperCase()}
                                                                </div>
                                                            </td>
                                                            <td>{brand.name}</td>
                                                            {/* xoá dòng <td>{brand.logoUrl}</td> */}
                                                            <td>{brand.description}</td>
                                                            <td>{brand.websiteUrl}</td>
                                                            <td>
                                                                <button
                                                                    className="btn btn-sm btn-info mr-1"
                                                                    onClick={() => openModal(brand)}
                                                                >
                                                                    <i className="fas fa-edit"></i> Sửa
                                                                    </button>
                                                                <button
                                                                className="btn btn-sm btn-danger"
                                                                onClick={() => handleDelete(brand.id)}
                                                                >
                                                                <i className="fas fa-trash"></i> Xóa
                                                            </button>
                                                                </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                        <div className="d-flex justify-content-between align-items-center mt-3">
                                            <span>Tổng: {totalCount} nhà cung cấp</span>
                                            <nav>
                                                <ul className="pagination mb-0">
                                                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                                        <button className="page-link" onClick={() => setPage(page - 1)}>Trước</button>
                                                    </li>
                                                    {renderPagination()}
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
                {showModal && (
                    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        {editingBrand ? 'Edit Brand' : 'Add Brand'}
                                    </h5>
                                    <button type="button" className="close" onClick={closeModal}><span>&times;</span></button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body">
    {error && <div className="alert alert-danger">{error}</div>}

    <div className="row">
        <div className="col-md-6">
            <div className="form-group">
                <label>Tên nhà cung cấp *</label>
                <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    required
                />
            </div>
        </div>
        <div className="col-md-6">
            <div className="form-group">
                <label>Định danh URL *</label>
                <input
                    type="text"
                    className="form-control"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                />
            </div>
        </div>
    </div>

    <div className="row">
        <div className="col-md-6">
            <div className="form-group">
                <label>Logo URL</label>
                <input
                    type="text"
                    className="form-control mb-2"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    placeholder="Nhập URL logo..."
                />
                <div style={{
                    width: '100%', height: 150,
                    border: '1px solid #dee2e6', borderRadius: 6,
                    background: '#f8f9fa', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden'
                }}>
                    {formData.logoUrl ? (
                        <img
                            src={getLogoUrl({ logoUrl: formData.logoUrl, websiteUrl: formData.websiteUrl })}
                            alt="Logo preview"
                            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    ) : (
                        <span style={{ color: '#aaa', fontSize: 13 }}>Chưa có logo</span>
                    )}
                </div>
            </div>
        </div>
        <div className="col-md-6">
            <div className="form-group">
                <label>Mô tả</label>
                <textarea
                    className="form-control"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    style={{ height: 210 }}
                />
            </div>
        </div>
    </div>

    <div className="row">
        <div className="col-md-6">
            <div className="form-group">
                <label>Website URL</label>
                <input
                    type="text"
                    className="form-control"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                />
            </div>
        </div>
        <div className="col-md-6">
            <div className="form-group">
                <label>Trạng thái</label>
                <div className="custom-control custom-switch mt-2">
                    <input
                        type="checkbox"
                        className="custom-control-input"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <label className="custom-control-label" htmlFor="isActive">Is Active</label>
                </div>
            </div>
        </div>
    </div>
</div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                                        <button type="submit" className="btn btn-primary">{editingBrand ? 'Update' : 'Create'}</button>
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

    export default Brands;