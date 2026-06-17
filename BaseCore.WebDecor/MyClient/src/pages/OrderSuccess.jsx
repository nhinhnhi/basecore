import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const OrderSuccess = () => {
    const { state } = useLocation();
    if (!state?.orderId) return (
        <div style={{ maxWidth:500, margin:'80px auto', textAlign:'center', fontFamily:'Arial,sans-serif' }}>
            <div style={{ fontSize:64 }}>✅</div>
            <h3 style={{ marginTop:12 }}>Đặt hàng thành công!</h3>
            <Link to="/shop" style={{ display:'inline-block', marginTop:20, padding:'12px 32px', background:'#f5371e', color:'#fff', borderRadius:6, textDecoration:'none', fontWeight:700 }}>Tiếp tục mua sắm</Link>
        </div>
    );

    const { orderId, orderDate, total, email, phone, address, fullName, note, paymentMethod, items=[] } = state;

    return (
        <>
        <style>{`
            *{box-sizing:border-box}
            .os{max-width:680px;margin:0 auto;padding:24px 14px 60px;font-family:Arial,sans-serif;color:#333;font-size:14px}

            /* SUCCESS BANNER */
            .os-banner{background:linear-gradient(135deg,#f5371e,#ff6b4a);border-radius:12px;padding:28px 24px;text-align:center;color:#fff;margin-bottom:20px}
            .os-check{width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:32px}
            .os-banner h2{margin:0 0 6px;font-size:22px;font-weight:800}
            .os-banner p{margin:0;opacity:.9;font-size:14px}

            /* INFO GRID */
            .os-grid{display:grid;grid-template-columns:1fr 1fr;gap:2px;background:#ebebeb;border:1px solid #ebebeb;border-radius:10px;overflow:hidden;margin-bottom:14px}
            .os-cell{background:#fff;padding:14px 16px}
            .os-cell-label{font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:#999;font-weight:700;margin-bottom:6px}
            .os-cell-value{font-size:15px;font-weight:700;color:#222;line-height:1.4;word-break:break-word}
            .os-cell-value.red{color:#f5371e}
            .os-cell.full{grid-column:1/-1}

            /* PRODUCTS */
            .os-products{background:#fff;border:1px solid #ebebeb;border-radius:10px;overflow:hidden;margin-bottom:14px}
            .os-prod-head{padding:12px 16px;font-weight:700;font-size:14px;border-bottom:1px solid #f5f5f5;background:#fafafa}
            .os-prod-item{display:flex;gap:12px;padding:12px 16px;border-bottom:1px solid #f5f5f5;align-items:center}
            .os-prod-item:last-child{border-bottom:none}
            .os-prod-img{width:52px;height:52px;object-fit:cover;border-radius:6px;border:1px solid #eee;flex-shrink:0;background:#f5f5f5}
            .os-prod-name{flex:1;font-size:13px;font-weight:600;color:#222;line-height:1.4}
            .os-prod-price{font-size:13px;font-weight:700;color:#f5371e;white-space:nowrap}

            /* WHAT NEXT */
            .os-next{background:#fff;border:1px solid #ebebeb;border-radius:10px;padding:18px;margin-bottom:20px}
            .os-next h4{margin:0 0 14px;font-size:15px;font-weight:700}
            .os-step{display:flex;align-items:center;gap:12px;margin-bottom:12px}
            .os-step-icon{width:36px;height:36px;border-radius:50%;background:#fff5f5;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
            .os-step-text{font-size:13px;color:#555;line-height:1.5}
            .os-step-text strong{color:#333;display:block;font-size:13.5px}

            /* BUTTONS */
            .os-actions{display:flex;gap:10px}
            .os-btn-orders{flex:1;background:#fff;border:2px solid #f5371e;color:#f5371e;border-radius:8px;padding:13px;text-align:center;text-decoration:none;font-weight:700;font-size:15px;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:6px}
            .os-btn-orders:hover{background:#fff5f5}
            .os-btn-shop{flex:1;background:#f5371e;border:2px solid #f5371e;color:#fff;border-radius:8px;padding:13px;text-align:center;text-decoration:none;font-weight:700;font-size:15px;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:6px}
            .os-btn-shop:hover{background:#d42e18;border-color:#d42e18}

            @media(max-width:480px){
                .os-grid{grid-template-columns:1fr}
                .os-cell.full{grid-column:1}
                .os-actions{flex-direction:column}
            }
        `}</style>

        <div className="os">
            {/* Banner thành công */}
            <div className="os-banner">
                <div className="os-check">✓</div>
                <h2>Đặt hàng thành công!</h2>
                <p>Cảm ơn bạn đã mua sắm tại Minimal Decor 🎉</p>
            </div>

            {/* Thông tin đơn hàng */}
            <div className="os-grid">
                <div className="os-cell">
                    <div className="os-cell-label">Mã đơn hàng</div>
                    <div className="os-cell-value" style={{ fontSize:12, fontFamily:'monospace' }}>#{orderId}</div>
                </div>
                <div className="os-cell">
                    <div className="os-cell-label">Ngày đặt</div>
                    <div className="os-cell-value">{orderDate}</div>
                </div>
                <div className="os-cell">
                    <div className="os-cell-label">Tổng cộng</div>
                    <div className="os-cell-value red">{Number(total).toLocaleString('vi-VN')}₫</div>
                </div>
                <div className="os-cell">
                    <div className="os-cell-label">Thanh toán</div>
                    <div className="os-cell-value" style={{ fontSize:13 }}>{paymentMethod}</div>
                </div>
                <div className="os-cell">
                    <div className="os-cell-label">Người nhận</div>
                    <div className="os-cell-value">{fullName}</div>
                </div>
                <div className="os-cell">
                    <div className="os-cell-label">Điện thoại</div>
                    <div className="os-cell-value">{phone}</div>
                </div>
                <div className="os-cell full">
                    <div className="os-cell-label">Địa chỉ giao hàng</div>
                    <div className="os-cell-value" style={{ fontSize:13 }}>{address}</div>
                </div>
                {note && (
                    <div className="os-cell full">
                        <div className="os-cell-label">Ghi chú</div>
                        <div className="os-cell-value" style={{ fontSize:13, color:'#666', fontWeight:400 }}>{note}</div>
                    </div>
                )}
                {email && (
                    <div className="os-cell full">
                        <div className="os-cell-label">Email xác nhận</div>
                        <div className="os-cell-value" style={{ fontSize:13 }}>{email}</div>
                    </div>
                )}
            </div>

            {/* Sản phẩm đã mua */}
            {items.length > 0 && (
                <div className="os-products">
                    <div className="os-prod-head">Sản phẩm đã đặt</div>
                    {items.map((item, i) => (
                        <div key={i} className="os-prod-item">
                            {item.img && <img src={item.img} alt={item.name} className="os-prod-img" onError={e => e.target.style.display='none'} />}
                            <div className="os-prod-name">{item.name}<br/><span style={{ color:'#999', fontWeight:400, fontSize:12 }}>x{item.qty}</span></div>
                            <div className="os-prod-price">{(item.price * item.qty).toLocaleString('vi-VN')}₫</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Bước tiếp theo */}
            <div className="os-next">
                <h4>Tiếp theo sẽ xảy ra gì?</h4>
                <div className="os-step">
                    <div className="os-step-icon">📧</div>
                    <div className="os-step-text"><strong>Xác nhận qua email</strong>Chúng tôi sẽ gửi email xác nhận đơn hàng trong vài phút.</div>
                </div>
                <div className="os-step">
                    <div className="os-step-icon">📦</div>
                    <div className="os-step-text"><strong>Đóng gói & giao hàng</strong>Đơn hàng sẽ được đóng gói cẩn thận và bàn giao cho đơn vị vận chuyển.</div>
                </div>
                <div className="os-step">
                    <div className="os-step-icon">🚚</div>
                    <div className="os-step-text"><strong>Nhận hàng & thanh toán</strong>Kiểm tra hàng trước khi thanh toán (nếu COD). Liên hệ 0969.534.568 nếu cần hỗ trợ.</div>
                </div>
            </div>

            {/* Buttons */}
            <div className="os-actions">
                <Link to="/orders" className="os-btn-orders">📋 Lịch sử đơn hàng</Link>
                <Link to="/shop" className="os-btn-shop">🛍 Tiếp tục mua sắm</Link>
            </div>
        </div>
        </>
    );
};

export default OrderSuccess;
