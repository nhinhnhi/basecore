import React, { useState, useEffect } from 'react';
import { manufacturerProductApi, categoryApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ManufacturerProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [allowedCategoryIds, setAllowedCategoryIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        basePrice: 0,
        totalStock: 0,
        description: '',
        mainImageUrl: '',
        categoryId: '',
    });
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        loadCategories();
    }, [page, keyword, categoryId, minPrice, maxPrice]);

    useEffect(() => {
        loadProducts();
    }, [page, keyword, categoryId, minPrice, maxPrice]);

    const loadCategories = async () => {
        try {
            const res = await categoryApi.getAll();
            // Lọc chính xác theo tên (không phân biệt dấu cách, viết hoa/thường)
            const allowed = res.data.filter(c => 
                c.name.includes("Tranh treo tường") || c.name.includes("Phụ kiện trang trí")
            );
            setCategories(allowed);
            // Nếu chưa có category mặc định, đặt category đầu tiên
            if (allowed.length > 0 && !formData.categoryId) {
                setFormData(prev => ({ ...prev, categoryId: allowed[0].id }));
            }
        } catch (err) { console.error(err); }
    };

    const loadProducts = async () => {
        setLoading(true);
        try {
            const params = {
                keyword: keyword || undefined,
                categoryId: categoryId || undefined,
                minPrice: minPrice ? parseFloat(minPrice) : undefined,
                maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
                page, pageSize,
                categoryId: categoryId || undefined,
            };
            const res = await manufacturerProductApi.getAll(params);
            console.log("API response:", res.data);
            setProducts(res.data.items);
            setTotalPages(res.data.totalPages || 0);
            setTotalCount(res.data.totalCount || 0);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => { e.preventDefault(); setPage(1); };
    const openModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                basePrice: product.basePrice,
                totalStock: product.totalStock,
                description: product.description || '',
                mainImageUrl: product.mainImageUrl || '',
                categoryId: product.categoryId,
            });
        } else {
            setEditingProduct(null);
            const defaultCat = categories[0]?.id || '';
            setFormData({
                name: '',
                basePrice: 0,
                totalStock: 0,
                description: '',
                mainImageUrl: '',
                categoryId: defaultCat,
            });
        }
        setError('');
        setShowModal(true);
    };
    const closeModal = () => { setShowModal(false); setEditingProduct(null); setError(''); };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!allowedCategoryIds.includes(formData.categoryId)) {
            setError('Bạn không được phép chọn danh mục này!');
            return;
        }
        try {
            const data = {
                name: formData.name,
                basePrice: parseFloat(formData.basePrice),
                totalStock: parseInt(formData.totalStock, 10),
                categoryId: formData.categoryId,
                description: formData.description,
                mainImageUrl: formData.mainImageUrl,
            };
            if (editingProduct) {
                await manufacturerProductApi.update(editingProduct.id, data);
            } else {
                await manufacturerProductApi.create(data);
            }
            closeModal();
            loadProducts();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await manufacturerProductApi.delete(id);
            loadProducts();
        } catch (err) {
            alert('Failed to delete product');
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
            <div className="content-header"><div className="container-fluid"><div className="row mb-2"><div className="col-sm-6"><h1 className="m-0">Quản lý sản phẩm (Nhà sản xuất)</h1></div></div></div></div>
            <section className="content">
                <div className="container-fluid">
                    <div className="card">
                        <div className="card-header">
                            <div className="row">
                                <div className="col-md-8">
                                    <form onSubmit={(e) => { e.preventDefault(); setPage(1); }} className="row mb-3">
                                        <div className="col-md-3">
                                            <input type="text" className="form-control" placeholder="Tìm kiếm tên..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                                        </div>
                                        <div className="col-md-2">
                                            <input type="number" className="form-control" placeholder="Giá từ" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                                        </div>
                                        <div className="col-md-2">
                                            <input type="number" className="form-control" placeholder="Giá đến" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                                        </div>
                                        <div className="col-md-3">
                                            <select className="form-control" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                                                <option value="">Tất cả danh mục</option>
                                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-2">
                                            <button type="submit" className="btn btn-primary w-100">Tìm kiếm</button>
                                        </div>
                                    </form>
                                </div>
                                <div className="col-md-4 text-right">
                                    <button className="btn btn-success" onClick={() => openModal()}>
                                        <i className="fas fa-plus"></i> Thêm sản phẩm
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="card-body">
                            {loading ? <div className="text-center py-5"><div className="spinner-border text-primary"></div></div> : (
                                <>
                                    <table className="table table-bordered table-striped">
                                        <thead><tr><th>ID</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {products.length === 0 ? <tr><td colSpan="6" className="text-center">No products found</td></tr> : products.map(product => (
                                                <tr key={product.id}>
                                                    <td>{product.id}</td>
                                                    <td>{product.name}</td>
                                                    <td>{product.category?.name}</td>
                                                    <td>{product.basePrice?.toLocaleString()} VND</td>
                                                    <td>{product.totalStock}</td>
                                                    <td>
                                                        <button className="btn btn-sm btn-info mr-1" onClick={() => openModal(product)}><i className="fas fa-edit"></i></button>
                                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(product.id)}><i className="fas fa-trash"></i></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span>Total: {totalCount} products</span>
                                        <nav><ul className="pagination mb-0">
                                            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}><button className="page-link" onClick={() => setPage(page - 1)}>Previous</button></li>
                                            {renderPagination()}
                                            <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}><button className="page-link" onClick={() => setPage(page + 1)}>Next</button></li>
                                        </ul></nav>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            {/* Modal thêm/sửa - giữ nguyên nhưng chỉ cho chọn danh mục trong allowedCategories */}
            {showModal && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                    <div className="modal-dialog"><div className="modal-content">
                        <div className="modal-header"><h5 className="modal-title">{editingProduct ? 'Edit Product' : 'Add Product'}</h5><button type="button" className="close" onClick={closeModal}><span>&times;</span></button></div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {error && <div className="alert alert-danger">{error}</div>}
                                <div className="form-group"><label>Name</label><input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div>
                                <div className="form-group"><label>Category</label>
                                    <select className="form-control" value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})} required>
                                        <option value="">Select Category</option>
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group"><label>Base Price (VND)</label><input type="number" className="form-control" value={formData.basePrice} onChange={(e) => setFormData({...formData, basePrice: e.target.value})} required min="0" step="1000" /></div>
                                <div className="form-group"><label>Stock</label><input type="number" className="form-control" value={formData.totalStock} onChange={(e) => setFormData({...formData, totalStock: e.target.value})} required min="0" /></div>
                                <div className="form-group"><label>Image URL</label><input type="text" className="form-control" value={formData.mainImageUrl} onChange={(e) => setFormData({...formData, mainImageUrl: e.target.value})} /></div>
                                <div className="form-group"><label>Description</label><textarea className="form-control" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="3" /></div>
                            </div>
                            <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button><button type="submit" className="btn btn-primary">{editingProduct ? 'Update' : 'Create'}</button></div>
                        </form>
                    </div></div>
                </div>
            )}
            {showModal && <div className="modal-backdrop fade show"></div>}
        </div>
    );
};

export default ManufacturerProducts;