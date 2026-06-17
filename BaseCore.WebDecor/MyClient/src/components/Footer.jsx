import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <>
            <style>{`
                .nd-footer { background: #1a2744; color: #bdc3c7; font-family: 'Segoe UI', Arial, sans-serif; margin-top: 0; }
                .nd-footer a { color: #bdc3c7; text-decoration: none; transition: color .15s; }
                .nd-footer a:hover { color: #aed6f1; }
                .nd-footer-title { color: #fff; font-weight: 700; font-size: 15px; margin-bottom: 18px; padding-bottom: 10px; border-bottom: 2px solid #1a5276; display: flex; align-items: center; gap: 8px; }
                .nd-footer-link { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; font-size: 13.5px; }
                .nd-footer-link i { color: #1a5276; font-size: 10px; }
                .nd-footer-social { display: flex; gap: 10px; margin-top: 16px; }
                .nd-footer-social a { width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,.1); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 15px; transition: background .2s; }
                .nd-footer-social a:hover { background: #1a5276; }
                .nd-footer-contact { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; font-size: 13.5px; }
                .nd-footer-contact i { color: #1a5276; margin-top: 3px; flex-shrink: 0; font-size: 14px; }
                .nd-footer-bottom { background: #111c30; padding: 14px 0; text-align: center; font-size: 12.5px; color: #888; border-top: 1px solid rgba(255,255,255,.07); }
                .nd-footer-bottom a { color: #aaa; }
                .nd-footer-cert { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 8px; }
                .nd-register-badge { background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15); border-radius: 4px; padding: 6px 14px; font-size: 12px; color: #aaa; }
            `}</style>

            <footer className="nd-footer">
                <div className="container py-5">
                    <div className="row g-4">
                        {/* Brand */}
                        <div className="col-md-4 col-lg-3">
                            <div className="nd-footer-title">
                                <i className="fas fa-store"></i> Minimal Decor
                            </div>
                            <p style={{ fontSize: 13.5, lineHeight: 1.8, color: '#bdc3c7' }}>
                                Chuyên cung cấp đồ trang trí nội thất và quà tặng cao cấp, phong cách tối giản, tinh tế. Uy tín – Chất lượng – Giá tốt.
                            </p>
                            <div className="nd-footer-contact">
                                <i className="fas fa-map-marker-alt"></i>
                                <span>Số 24 ngõ 234 Hoàng Quốc Việt, Q.Nghĩa Đô, Hà Nội</span>
                            </div>
                            <div className="nd-footer-contact">
                                <i className="fas fa-phone"></i>
                                <span>0969.534.568</span>
                            </div>
                            <div className="nd-footer-social">
                                {['facebook', 'instagram', 'tiktok', 'youtube'].map(s => (
                                    <a key={s} href="#"><i className={`fab fa-${s}`}></i></a>
                                ))}
                            </div>
                        </div>

                        {/* Danh mục */}
                        <div className="col-6 col-md-2">
                            <div className="nd-footer-title">Danh mục</div>
                            {[
                                'Đồ trang trí nội thất',
                                'Đồ decor phòng',
                                'Quà tặng tân gia',
                                'Quà tặng khai trương',
                                'Quà cưới cao cấp',
                            ].map(item => (
                                <div key={item} className="nd-footer-link">
                                    <i className="fas fa-chevron-right"></i>
                                    <Link to="/shop">{item}</Link>
                                </div>
                            ))}
                        </div>

                        {/* Hỗ trợ */}
                        <div className="col-6 col-md-2">
                            <div className="nd-footer-title">Hỗ trợ</div>
                            {[
                                { to: '/about', label: 'Giới thiệu' },
                                { to: '/contact', label: 'Liên hệ' },
                                { to: '/orders', label: 'Tra cứu đơn hàng' },
                                { to: '/shop', label: 'Sản phẩm bán chạy' },
                                { to: '/contact', label: 'Chính sách đổi trả' },
                            ].map(item => (
                                <div key={item.to + item.label} className="nd-footer-link">
                                    <i className="fas fa-chevron-right"></i>
                                    <Link to={item.to}>{item.label}</Link>
                                </div>
                            ))}
                        </div>

                        {/* Liên hệ & Map */}
                        <div className="col-md-4 col-lg-5">
                            <div className="nd-footer-title"><i className="fas fa-map-marked-alt"></i> Thông tin liên hệ</div>
                            <div className="nd-footer-contact">
                                <i className="fas fa-map-marker-alt"></i>
                                <div>
                                    <strong style={{ color: '#fff' }}>HÀ NỘI:</strong><br />
                                    Số 24 ngõ 234 Hoàng Quốc Việt, Q.Nghĩa Đô, Hà Nội
                                </div>
                            </div>
                            <div className="nd-footer-contact">
                                <i className="fas fa-phone"></i>
                                <span><strong style={{ color: '#aed6f1' }}>0969.534.568</strong></span>
                            </div>
                            <div className="nd-footer-contact">
                                <i className="fas fa-envelope"></i>
                                <span>minimaldecor@gmail.com</span>
                            </div>
                            <div className="nd-footer-contact">
                                <i className="fas fa-clock"></i>
                                <span>Thứ 2 – Thứ 7: 8:00 – 20:00 | CN: 9:00 – 18:00</span>
                            </div>
                            {/* Map placeholder */}
                            <div style={{ background: 'rgba(255,255,255,.06)', borderRadius: 6, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 12, border: '1px solid rgba(255,255,255,.1)', fontSize: 13, color: '#888' }}>
                                <i className="fas fa-map me-2"></i> Bản đồ cửa hàng
                            </div>
                        </div>
                    </div>
                </div>

                <div className="nd-footer-bottom">
                    <div className="container">
                        <div>© 2025 Minimal Decor. All rights reserved. | <Link to="/contact">Liên hệ</Link> | <Link to="/about">Giới thiệu</Link></div>
                        <div className="nd-footer-cert">
                            <span className="nd-register-badge"><i className="fas fa-certificate me-1"></i>Đã đăng ký Bộ Công Thương</span>
                            <span className="nd-register-badge"><i className="fas fa-shield-alt me-1"></i>Thanh toán an toàn</span>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default Footer;
