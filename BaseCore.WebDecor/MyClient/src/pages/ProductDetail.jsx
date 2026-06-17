import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../contexts/Cartcontext';

const API_BASE = 'http://localhost:5001/api';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [images, setImages] = useState([]);
    const [variants, setVariants] = useState([]);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                // Lấy thông tin sản phẩm
                const productRes = await axios.get(`${API_BASE}/Products/${id}`);
                setProduct(productRes.data);
                
                // Lấy danh sách ảnh của sản phẩm
                try {
                    const imagesRes = await axios.get(`${API_BASE}/ProductImages/product/${id}`);
                    setImages(imagesRes.data);
                } catch (err) {
                    // Nếu không có ảnh riêng, dùng ảnh chính
                    if (productRes.data.mainImageUrl) {
                        setImages([{ imageUrl: productRes.data.mainImageUrl, isPrimary: true }]);
                    }
                }
                
                // Lấy danh sách biến thể (nếu có)
                try {
                    const variantsRes = await axios.get(`${API_BASE}/ProductVariants/product/${id}`);
                    setVariants(variantsRes.data);
                    if (variantsRes.data.length > 0) {
                        setSelectedVariant(variantsRes.data[0]);
                    }
                } catch (err) {
                    // Không có biến thể
                    setVariants([]);
                }
            } catch (err) {
                console.error('Lỗi tải sản phẩm:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        const itemToAdd = {
            id: product.id,
            name: product.name,
            basePrice: selectedVariant?.priceOverride || product.basePrice,
            imageUrl: images.find(img => img.isPrimary)?.imageUrl || product.mainImageUrl || '/img/default.jpg',
            variant: selectedVariant ? {
                id: selectedVariant.id,
                sku: selectedVariant.skuVariant,
                attributes: selectedVariant.attributes
            } : null
        };
        addToCart(itemToAdd, quantity);
        navigate('/cart');
    };

    const getCurrentPrice = () => {
        let price = selectedVariant?.priceOverride || product?.basePrice || 0;
        if (product?.salePrice && product.salePrice < price) {
            return product.salePrice;
        }
        return price;
    };

    const getOriginalPrice = () => {
        return selectedVariant?.priceOverride || product?.basePrice || 0;
    };

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
                <p className="mt-3">Đang tải thông tin sản phẩm...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mt-5 text-center">
                <h3>Không tìm thấy sản phẩm</h3>
                <button className="btn btn-primary mt-3" onClick={() => navigate('/shop')}>
                    Quay lại cửa hàng
                </button>
            </div>
        );
    }

    const currentPrice = getCurrentPrice();
    const originalPrice = getOriginalPrice();
    const hasDiscount = product.salePrice && product.salePrice < originalPrice;

    return (
        <div className="container mt-4">
            <div className="row">
                {/* Phần ảnh sản phẩm - Gallery */}
                <div className="col-md-6">
                    <div className="product-gallery">
                        {/* Ảnh chính */}
                        <div className="main-image mb-3">
                            <img 
                                src={images[selectedImage]?.imageUrl || product.mainImageUrl || '/img/default.jpg'} 
                                className="img-fluid w-100" 
                                alt={product.name}
                                style={{ borderRadius: '8px', objectFit: 'cover', height: '400px' }}
                            />
                        </div>
                        {/* Danh sách ảnh nhỏ */}
                        {images.length > 1 && (
                            <div className="thumbnail-list d-flex gap-2">
                                {images.map((img, idx) => (
                                    <img 
                                        key={idx}
                                        src={img.imageUrl}
                                        className={`thumbnail ${selectedImage === idx ? 'border-primary' : ''}`}
                                        alt={`${product.name} - ${idx + 1}`}
                                        onClick={() => setSelectedImage(idx)}
                                        style={{ 
                                            width: '80px', 
                                            height: '80px', 
                                            objectFit: 'cover', 
                                            cursor: 'pointer',
                                            border: selectedImage === idx ? '2px solid #d4c5b0' : '1px solid #e2dcd5',
                                            borderRadius: '4px'
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Phần thông tin sản phẩm */}
                <div className="col-md-6">
                    <h1 className="mb-3">{product.name}</h1>
                    
                    {/* Giá sản phẩm */}
                    <div className="price-section mb-3">
                        {hasDiscount ? (
                            <>
                                <span className="original-price text-muted text-decoration-line-through me-2">
                                    {originalPrice.toLocaleString()} VND
                                </span>
                                <span className="sale-price text-danger fw-bold fs-3">
                                    {currentPrice.toLocaleString()} VND
                                </span>
                            </>
                        ) : (
                            <span className="price fw-bold fs-3">
                                {currentPrice.toLocaleString()} VND
                            </span>
                        )}
                    </div>

                    {/* Mô tả ngắn */}
                    {product.shortDescription && (
                        <p className="text-muted mb-3">{product.shortDescription}</p>
                    )}

                    {/* Biến thể sản phẩm */}
                    {variants.length > 0 && (
                        <div className="variants-section mb-4">
                            <label className="fw-bold mb-2">Biến thể:</label>
                            <div className="d-flex flex-wrap gap-2">
                                {variants.map(variant => (
                                    <button
                                        key={variant.id}
                                        className={`btn btn-sm ${selectedVariant?.id === variant.id ? 'btn-primary' : 'btn-outline-secondary'}`}
                                        onClick={() => setSelectedVariant(variant)}
                                        style={{ borderRadius: '20px' }}
                                    >
                                        {variant.attributes || variant.skuVariant || `Biến thể ${variant.id}`}
                                        {variant.priceOverride && variant.priceOverride !== product.basePrice && (
                                            <span className="ms-1 small">
                                                ({variant.priceOverride.toLocaleString()} VND)
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Số lượng tồn kho */}
                    <div className="stock-info mb-3">
                        {product.totalStock > 0 ? (
                            <span className="text-success">
                                <i className="fas fa-check-circle me-1"></i>
                                Còn hàng ({product.totalStock} sản phẩm)
                            </span>
                        ) : (
                            <span className="text-danger">
                                <i className="fas fa-times-circle me-1"></i>
                                Hết hàng
                            </span>
                        )}
                    </div>

                    {/* Chọn số lượng */}
                    <div className="quantity-section mb-4">
                        <label className="fw-bold mb-2">Số lượng:</label>
                        <div className="d-flex align-items-center">
                            <button 
                                className="btn btn-outline-secondary" 
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={quantity <= 1}
                            >
                                <i className="fas fa-minus"></i>
                            </button>
                            <input 
                                type="number" 
                                className="form-control text-center mx-2" 
                                value={quantity} 
                                onChange={(e) => setQuantity(Math.min(product.totalStock, Math.max(1, parseInt(e.target.value) || 1)))}
                                style={{ width: '80px' }}
                                min="1"
                                max={product.totalStock}
                            />
                            <button 
                                className="btn btn-outline-secondary" 
                                onClick={() => setQuantity(Math.min(product.totalStock, quantity + 1))}
                                disabled={quantity >= product.totalStock}
                            >
                                <i className="fas fa-plus"></i>
                            </button>
                            <span className="ms-3 text-muted">tối đa {product.totalStock}</span>
                        </div>
                    </div>

                    {/* Nút Thêm vào giỏ */}
                    <div className="action-buttons">
                        <button 
                            className="btn btn-primary btn-lg w-100 mb-3" 
                            onClick={handleAddToCart}
                            disabled={product.totalStock <= 0}
                        >
                            <i className="fas fa-shopping-bag me-2"></i>
                            Thêm vào giỏ hàng
                        </button>
                        <button 
                            className="btn btn-outline-secondary w-100" 
                            onClick={() => navigate('/shop')}
                        >
                            <i className="fas fa-arrow-left me-2"></i>
                            Tiếp tục mua sắm
                        </button>
                    </div>
                </div>
            </div>

            {/* Mô tả chi tiết sản phẩm */}
            <div className="row mt-5">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header bg-transparent">
                            <h5 className="mb-0">Mô tả sản phẩm</h5>
                        </div>
                        <div className="card-body">
                            <p className="mb-0">{product.description || product.shortDescription || 'Chưa có mô tả chi tiết.'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;