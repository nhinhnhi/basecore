import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/Cartcontext';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, getTotalPrice } = useCart();
    const navigate = useNavigate();
    const getPrice = (item) => item.price ?? item.basePrice ?? 0;
    const total = getTotalPrice();
    const totalQty = cart.reduce((s, i) => s + i.quantity, 0);

    if (cart.length === 0) return (
        <div style={{ maxWidth: 480, margin: '80px auto', textAlign: 'center', fontFamily: 'Arial,sans-serif' }}>
            <div style={{ fontSize: 64, marginBottom: 12 }}>🛒</div>
            <h3 style={{ color: '#333', marginBottom: 8 }}>Giỏ hàng trống</h3>
            <p style={{ color: '#999', marginBottom: 20 }}>Hãy khám phá sản phẩm và thêm vào giỏ!</p>
            <Link to="/shop" style={{ display: 'inline-block', padding: '12px 32px', background: '#f5371e', color: '#fff', borderRadius: 4, textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>Mua sắm ngay</Link>
        </div>
    );

    return (
        <>
        <style>{`
            *{box-sizing:border-box}
            .ct{max-width:860px;margin:0 auto;padding:16px 12px 100px;font-family:Arial,sans-serif;color:#333;font-size:14px}
            .ct-title{font-size:20px;font-weight:700;margin-bottom:16px}

            /* PRODUCT LIST */
            .ct-item{background:#fff;border:1px solid #ebebeb;border-radius:8px;padding:14px;display:flex;gap:14px;align-items:flex-start;margin-bottom:10px}
            .ct-img{width:88px;height:88px;object-fit:cover;border-radius:6px;border:1px solid #f0f0f0;flex-shrink:0;background:#f9f9f9}
            .ct-img-ph{width:88px;height:88px;border-radius:6px;border:1px solid #f0f0f0;background:#f5f5f5;display:flex;align-items:center;justify-content:center;font-size:28px;flex-shrink:0}
            .ct-info{flex:1;min-width:0}
            .ct-name{font-weight:600;font-size:14px;color:#222;margin-bottom:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.4}
            .ct-variant{font-size:12px;color:#999;margin-bottom:8px}
            .ct-price-row{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px}
            .ct-price{color:#f5371e;font-weight:700;font-size:16px}

            /* QTY CONTROL */
            .ct-qty{display:flex;align-items:center;border:1px solid #e0e0e0;border-radius:20px;overflow:hidden;background:#fff}
            .ct-qty-btn{background:none;border:none;width:32px;height:32px;font-size:18px;cursor:pointer;color:#555;display:flex;align-items:center;justify-content:center;transition:background .15s}
            .ct-qty-btn:hover{background:#f5f5f5}
            .ct-qty-btn:disabled{color:#ccc;cursor:not-allowed}
            .ct-qty-num{width:36px;height:32px;border:none;border-left:1px solid #e0e0e0;border-right:1px solid #e0e0e0;text-align:center;font-size:14px;font-weight:700;outline:none;background:#fff}
            .ct-del{background:none;border:none;cursor:pointer;color:#ccc;font-size:18px;padding:4px;margin-left:8px;flex-shrink:0;transition:color .15s}
            .ct-del:hover{color:#f5371e}

            /* SUMMARY */
            .ct-summary{background:#fff;border:1px solid #ebebeb;border-radius:8px;padding:16px;margin-bottom:10px}
            .ct-sum-row{display:flex;justify-content:space-between;font-size:14px;margin-bottom:10px;color:#555}
            .ct-sum-row.total{font-size:17px;font-weight:700;color:#333;margin-bottom:0;padding-top:10px;border-top:1px solid #f0f0f0}
            .ct-sum-row.total span:last-child{color:#f5371e}

            /* COUPON HINT */
            .ct-coupon-hint{background:#fff8f7;border:1px dashed #f5371e;border-radius:8px;padding:12px 16px;display:flex;align-items:center;gap:10px;margin-bottom:10px;font-size:13px;color:#c0392b}

            /* STICKY BOTTOM */
            .ct-bottom{position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid #ebebeb;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;z-index:100;box-shadow:0 -2px 12px rgba(0,0,0,.08)}
            .ct-bottom-total{display:flex;flex-direction:column}
            .ct-bottom-label{font-size:12px;color:#999}
            .ct-bottom-price{font-size:20px;font-weight:700;color:#f5371e}
            .ct-checkout-btn{background:#f5371e;color:#fff;border:none;border-radius:6px;padding:13px 32px;font-size:16px;font-weight:700;cursor:pointer;transition:background .2s;white-space:nowrap}
            .ct-checkout-btn:hover{background:#d42e18}
            .ct-continue{color:#1a5276;text-decoration:none;font-size:13px;padding:8px 0;display:inline-block}
        `}</style>

        <div className="ct">
            <div className="ct-title">Giỏ hàng ({totalQty} sản phẩm)</div>

            {/* Danh sách sản phẩm */}
            {cart.map(item => {
                const price = getPrice(item);
                return (
                    <div key={item.id} className="ct-item">
                        {item.imageUrl || item.mainImageUrl
                            ? <img src={item.imageUrl || item.mainImageUrl} alt={item.name} className="ct-img" onError={e => e.target.style.display='none'} />
                            : <div className="ct-img-ph">🖼</div>
                        }
                        <div className="ct-info">
                            <div className="ct-name">{item.name}</div>
                            {item.variant?.attributes && <div className="ct-variant">Phân loại: {item.variant.attributes}</div>}
                            <div className="ct-price-row">
                                <span className="ct-price">{price.toLocaleString('vi-VN')}₫</span>
                                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                    <div className="ct-qty">
                                        <button className="ct-qty-btn" disabled={item.quantity <= 1}
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                                        <input className="ct-qty-num" type="number" min="1"
                                            value={item.quantity}
                                            onChange={e => updateQuantity(item.id, parseInt(e.target.value)||1)} />
                                        <button className="ct-qty-btn"
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                    </div>
                                    <button className="ct-del" onClick={() => removeFromCart(item.id)} title="Xóa">🗑</button>
                                </div>
                            </div>
                            <div style={{ textAlign:'right', fontSize:13, color:'#999', marginTop:6 }}>
                                Thành tiền: <span style={{ color:'#f5371e', fontWeight:700 }}>{(price * item.quantity).toLocaleString('vi-VN')}₫</span>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Gợi ý dùng mã giảm giá ở bước thanh toán */}
            <div className="ct-coupon-hint">
                <span style={{ fontSize:18 }}>🏷️</span>
                <span>Bạn có mã giảm giá? Nhập ở bước <strong>Thanh toán</strong> để được giảm giá!</span>
            </div>

            {/* Tóm tắt đơn */}
            <div className="ct-summary">
                <div className="ct-sum-row">
                    <span>Tạm tính ({totalQty} sản phẩm)</span>
                    <span>{total.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="ct-sum-row">
                    <span>Phí vận chuyển</span>
                    <span style={{ color:'#27ae60', fontWeight:600 }}>Miễn phí</span>
                </div>
                <div className="ct-sum-row total">
                    <span>Tổng cộng</span>
                    <span>{total.toLocaleString('vi-VN')}₫</span>
                </div>
            </div>

            <Link to="/shop" className="ct-continue">← Tiếp tục mua sắm</Link>
        </div>

        {/* Sticky bottom bar */}
        <div className="ct-bottom">
            <div className="ct-bottom-total">
                <span className="ct-bottom-label">Tổng thanh toán</span>
                <span className="ct-bottom-price">{total.toLocaleString('vi-VN')}₫</span>
            </div>
            <button className="ct-checkout-btn" onClick={() => navigate('/checkout')}>
                Mua hàng ({totalQty})
            </button>
        </div>
        </>
    );
};

export default Cart;