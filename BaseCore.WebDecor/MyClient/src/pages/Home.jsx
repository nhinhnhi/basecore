import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../contexts/Cartcontext';
import { useAuth } from '../contexts/Authcontext';

const API_BASE = 'http://localhost:5001/api';

const CATEGORIES = [
  { label: 'ĐỒ TRANG TRÍ NỘI THẤT', icon: '🏠', id: '' },
  { label: 'ĐỒ DECOR TRANG TRÍ PHÒNG', icon: '🪴', id: '' },
  { label: 'QUÀ TẶNG TÂN GIA CAO CẤP', icon: '🎁', id: '' },
  { label: 'QUÀ TẶNG KHAI TRƯƠNG', icon: '🎊', id: '' },
  { label: 'QUÀ TẶNG SINH NHẬT', icon: '🎂', id: '' },
  { label: 'QUÀ TẶNG SẾP CAO CẤP', icon: '⭐', id: '' },
  { label: 'QUÀ TẶNG ĐỐI TÁC D.NGHIỆP', icon: '🤝', id: '' },
  { label: 'QUÀ CƯỚI – KỶ NIỆM NGÀY CƯỚI', icon: '💍', id: '' },
];

const SLIDES = [
  { bg: 'linear-gradient(135deg, #1a5276 0%, #2980b9 60%, #aed6f1 100%)', title: 'Không Gian Sống Tinh Tế', sub: 'Bộ sưu tập đồ trang trí cao cấp, phong cách tối giản hiện đại', cta: 'Khám phá ngay' },
  { bg: 'linear-gradient(135deg, #1a2744 0%, #1a5276 60%, #2e86c1 100%)', title: 'Quà Tặng Sang Trọng', sub: 'Lựa chọn hoàn hảo cho mọi dịp đặc biệt – tân gia, khai trương, sinh nhật', cta: 'Xem bộ sưu tập' },
  { bg: 'linear-gradient(135deg, #154360 0%, #1a5276 50%, #117a8b 100%)', title: 'Đèn Trang Trí Cao Cấp', sub: 'Thắp sáng không gian của bạn với những chiếc đèn nghệ thuật độc đáo', cta: 'Mua ngay' },
];

const FEATURES = [
  { icon: 'fas fa-shipping-fast', title: 'Giao hàng toàn quốc', desc: 'Hà Nội nội thành 2–4h, tỉnh thành 1–3 ngày' },
  { icon: 'fas fa-undo-alt', title: 'Đổi trả 7 ngày', desc: 'Miễn phí đổi trả trong vòng 7 ngày nếu lỗi sản phẩm' },
  { icon: 'fas fa-shield-alt', title: 'Cam kết chính hãng', desc: '100% sản phẩm chính hãng, có nguồn gốc rõ ràng' },
  { icon: 'fas fa-headset', title: 'Hỗ trợ 24/7', desc: 'Tư vấn miễn phí qua hotline, zalo, facebook' },
];

function StarRating({ rating = 5 }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <i key={i} className={`fas fa-star`} style={{ color: i <= rating ? '#f39c12' : '#ddd', fontSize: 12 }}></i>
      ))}
    </span>
  );
}

function ProductCard({ p, addToCart }) {
  const navigate = useNavigate();
  return (
    <div className="nd-product-card" onClick={() => navigate(`/product/${p.id}`)}>
      <div className="nd-product-img-wrap">
        <img src={p.mainImageUrl || '/img/default.jpg'} alt={p.name} className="nd-product-img" />
        {p.salePrice && p.salePrice < p.basePrice && (
          <div className="nd-badge-sale">SALE</div>
        )}
        <div className="nd-product-overlay">
          <button className="nd-btn-cart" onClick={e => { e.stopPropagation(); addToCart({ ...p, price: p.basePrice }, 1); }}>
            <i className="fas fa-cart-plus me-1"></i> Thêm giỏ
          </button>
          <button className="nd-btn-view" onClick={e => { e.stopPropagation(); navigate(`/product/${p.id}`); }}>
            <i className="fas fa-eye"></i>
          </button>
        </div>
      </div>
      <div className="nd-product-body">
        <div style={{ fontSize: 11, color: '#888', marginBottom: 3 }}>Minimal Decor</div>
        <div className="nd-product-name">{p.name}</div>
        <div className="mb-1"><StarRating /></div>
        <div className="nd-product-price">
          {p.salePrice && p.salePrice < p.basePrice ? (
            <>
              <span className="nd-price-old">{p.basePrice?.toLocaleString()}đ</span>
              <span className="nd-price-new">{p.salePrice?.toLocaleString()}đ</span>
            </>
          ) : (
            <span className="nd-price-new">{p.basePrice?.toLocaleString()}đ</span>
          )}
        </div>
      </div>
    </div>
  );
}

const Home = () => {
  const [products, setProducts] = useState([]);
  const [slide, setSlide] = useState(0);
  const { addToCart } = useCart();
  const slideRef = useRef();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    axios.get(`${API_BASE}/Products`, { params: { page: 1, pageSize: 12 } })
      .then(res => setProducts(res.data.items || res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    slideRef.current = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 4000);
    return () => clearInterval(slideRef.current);
  }, []);

  return (
    <>
      <style>{`
        .nd-home { font-family: 'Segoe UI', 'Arial', sans-serif; }
        /* HERO LAYOUT */
        .nd-hero-layout { display: flex; gap: 0; min-height: 380px; }
        .nd-cat-sidebar { width: 220px; flex-shrink: 0; background: #fff; border-right: 1px solid #e8e8e8; display: flex; flex-direction: column; }
        .nd-cat-sidebar-item { display: flex; align-items: center; gap: 10px; padding: 11px 16px; font-size: 13.5px; color: #333; text-decoration: none; border-bottom: 1px solid #f4f4f4; transition: all .15s; cursor: pointer; }
        .nd-cat-sidebar-item:hover { background: #eaf2fb; color: #1a5276; padding-left: 22px; }
        .nd-cat-sidebar-item span.cat-icon { font-size: 16px; }
        .nd-cat-sidebar-item i { font-size: 10px; color: #aaa; margin-left: auto; }
        /* SLIDER */
        .nd-slider { flex: 1; position: relative; overflow: hidden; min-height: 380px; }
        .nd-slide { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; flex-direction: column; text-align: center; padding: 40px; opacity: 0; transition: opacity .7s ease; }
        .nd-slide.active { opacity: 1; }
        .nd-slide-title { color: #fff; font-size: 32px; font-weight: 800; font-family: 'Georgia', serif; text-shadow: 0 2px 8px rgba(0,0,0,.3); margin-bottom: 12px; line-height: 1.2; }
        .nd-slide-sub { color: rgba(255,255,255,.9); font-size: 15px; margin-bottom: 24px; max-width: 500px; }
        .nd-slide-cta { background: #fff; color: #1a5276; font-weight: 700; border: none; padding: 12px 32px; border-radius: 3px; font-size: 14px; cursor: pointer; letter-spacing: .5px; transition: all .2s; text-decoration: none; display: inline-block; }
        .nd-slide-cta:hover { background: #1a5276; color: #fff; }
        .nd-slide-dots { position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; }
        .nd-dot { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,.5); cursor: pointer; border: none; transition: background .2s; }
        .nd-dot.active { background: #fff; }
        /* FEATURES BAR */
        .nd-features { background: #f8f9fa; border-top: 3px solid #1a5276; border-bottom: 1px solid #e8e8e8; padding: 20px 0; }
        .nd-feature-item { display: flex; align-items: center; gap: 14px; }
        .nd-feature-icon { width: 46px; height: 46px; background: #1a5276; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .nd-feature-icon i { color: #fff; font-size: 18px; }
        .nd-feature-title { font-weight: 700; font-size: 14px; color: #1a5276; }
        .nd-feature-desc { font-size: 12px; color: #888; }
        /* SECTION */
        .nd-section { padding: 40px 0; }
        .nd-section-header { display: flex; align-items: center; gap: 0; margin-bottom: 28px; border-bottom: 2px solid #1a5276; padding-bottom: 10px; }
        .nd-section-title { background: #1a5276; color: #fff; padding: 8px 20px; font-size: 16px; font-weight: 700; letter-spacing: .5px; margin: 0; }
        .nd-section-more { margin-left: auto; color: #1a5276; font-size: 13px; text-decoration: none; font-weight: 600; }
        .nd-section-more:hover { text-decoration: underline; }
        /* PRODUCT CARDS */
        .nd-products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
        .nd-product-card { background: #fff; border: 1px solid #e8e8e8; border-radius: 4px; overflow: hidden; cursor: pointer; transition: box-shadow .2s, transform .2s; }
        .nd-product-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,.12); transform: translateY(-3px); }
        .nd-product-img-wrap { position: relative; overflow: hidden; height: 200px; }
        .nd-product-img { width: 100%; height: 100%; object-fit: cover; transition: transform .35s; }
        .nd-product-card:hover .nd-product-img { transform: scale(1.06); }
        .nd-badge-sale { position: absolute; top: 10px; left: 10px; background: #e74c3c; color: #fff; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 2px; }
        .nd-product-overlay { position: absolute; inset: 0; background: rgba(26,82,118,.5); display: flex; align-items: center; justify-content: center; gap: 8px; opacity: 0; transition: opacity .25s; }
        .nd-product-card:hover .nd-product-overlay { opacity: 1; }
        .nd-btn-cart { background: #fff; color: #1a5276; border: none; padding: 8px 14px; border-radius: 3px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .2s; }
        .nd-btn-cart:hover { background: #1a5276; color: #fff; }
        .nd-btn-view { background: rgba(255,255,255,.9); color: #1a5276; border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-size: 15px; }
        .nd-product-body { padding: 12px; }
        .nd-product-name { font-size: 14px; font-weight: 600; color: #222; margin-bottom: 5px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4; min-height: 40px; }
        .nd-price-new { color: #e74c3c; font-weight: 700; font-size: 16px; }
        .nd-price-old { color: #999; text-decoration: line-through; font-size: 13px; margin-right: 8px; }
        .nd-product-price { margin-top: 6px; }
        /* BANNER ROW */
        .nd-banner-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; }
        .nd-banner { border-radius: 6px; height: 120px; display: flex; align-items: center; padding: 20px 24px; text-decoration: none; overflow: hidden; position: relative; }
        .nd-banner-title { color: #fff; font-size: 18px; font-weight: 800; font-family: 'Georgia', serif; line-height: 1.2; text-shadow: 0 2px 6px rgba(0,0,0,.3); }
        .nd-banner-sub { color: rgba(255,255,255,.85); font-size: 12px; margin-top: 4px; }
        /* TESTIMONIAL */
        .nd-testimonials { background: #f8f9fa; padding: 40px 0; }
        .nd-testi-card { background: #fff; border-radius: 8px; padding: 24px; box-shadow: 0 2px 12px rgba(0,0,0,.06); }
        .nd-testi-text { font-size: 14px; color: #555; font-style: italic; line-height: 1.7; margin-bottom: 16px; }
        .nd-testi-author { font-weight: 700; color: #1a5276; font-size: 14px; }
        @media (max-width: 768px) {
          .nd-hero-layout { flex-direction: column; }
          .nd-cat-sidebar { width: 100%; flex-direction: row; flex-wrap: wrap; overflow-x: auto; }
          .nd-products-grid { grid-template-columns: repeat(2, 1fr); }
          .nd-banner-row { grid-template-columns: 1fr; }
          .nd-slide-title { font-size: 22px; }
        }
      `}</style>

      <div className="nd-home">

        {/* HERO: CATEGORIES SIDEBAR + SLIDER */}
        <div className="container" style={{ padding: '16px 12px 0' }}>
          <div className="nd-hero-layout" style={{ border: '1px solid #e8e8e8', borderRadius: 4, overflow: 'hidden' }}>
            {/* Category sidebar */}
            <div className="nd-cat-sidebar d-none d-md-flex">
              {CATEGORIES.map(cat => (
                <Link key={cat.label} to="/shop" className="nd-cat-sidebar-item">
                  <span className="cat-icon">{cat.icon}</span>
                  <span style={{ flex: 1, fontSize: 13 }}>{cat.label}</span>
                  <i className="fas fa-chevron-right"></i>
                </Link>
              ))}
            </div>
            {/* Slider */}
            <div className="nd-slider">
              {SLIDES.map((s, i) => (
                <div key={i} className={`nd-slide ${i === slide ? 'active' : ''}`} style={{ background: s.bg }}>
                  <div className="nd-slide-title">{s.title}</div>
                  <div className="nd-slide-sub">{s.sub}</div>
                  <Link to="/shop" className="nd-slide-cta">{s.cta}</Link>
                </div>
              ))}
              <div className="nd-slide-dots">
                {SLIDES.map((_, i) => (
                  <button key={i} className={`nd-dot ${i === slide ? 'active' : ''}`} onClick={() => setSlide(i)} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FEATURES BAR */}
        <div className="nd-features">
          <div className="container">
            <div className="row g-3">
              {FEATURES.map((f, i) => (
                <div key={i} className="col-6 col-md-3">
                  <div className="nd-feature-item">
                    <div className="nd-feature-icon"><i className={f.icon}></i></div>
                    <div>
                      <div className="nd-feature-title">{f.title}</div>
                      <div className="nd-feature-desc">{f.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BANNER ROW */}
        <div className="container">
          <div className="nd-banner-row" style={{ marginTop: 24 }}>
            <Link to="/shop" className="nd-banner" style={{ background: 'linear-gradient(135deg, #1a5276, #2980b9)' }}>
              <div>
                <div className="nd-banner-title">Đồ Trang Trí<br />Nội Thất</div>
                <div className="nd-banner-sub">Phong cách tối giản, hiện đại ✨</div>
              </div>
            </Link>
            <Link to="/shop" className="nd-banner" style={{ background: 'linear-gradient(135deg, #1a2744, #154360)' }}>
              <div>
                <div className="nd-banner-title">Quà Tặng<br />Cao Cấp</div>
                <div className="nd-banner-sub">Sang trọng, ý nghĩa, đẳng cấp 🎁</div>
              </div>
            </Link>
          </div>
        </div>

        {/* FEATURED PRODUCTS */}
        <div className="nd-section">
          <div className="container">
            <div className="nd-section-header">
              <div className="nd-section-title">SẢN PHẨM NỔI BẬT</div>
              <Link to="/shop" className="nd-section-more">Xem tất cả <i className="fas fa-arrow-right"></i></Link>
            </div>
            {products.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="fas fa-box-open fa-3x mb-3 d-block" style={{ color: '#ccc' }}></i>
                Đang tải sản phẩm...
              </div>
            ) : (
              <div className="nd-products-grid">
                {products.slice(0, 8).map(p => (
                  <ProductCard key={p.id} p={p} addToCart={addToCart} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* BANNER: VTV Feature */}
        <div style={{ background: 'linear-gradient(135deg, #1a2744 0%, #1a5276 100%)', padding: '32px 0', margin: '0 0 32px' }}>
          <div className="container text-center">
            <div style={{ color: '#aed6f1', fontSize: 13, letterSpacing: 2, marginBottom: 8 }}>ĐÃ ĐƯỢC PHÁT SÓNG TRÊN</div>
            <div style={{ color: '#fff', fontSize: 28, fontWeight: 800, fontFamily: 'Georgia, serif', marginBottom: 8 }}>
              VTV1 – Không Gian Văn Hóa Nghệ Thuật
            </div>
            <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 14, marginBottom: 20 }}>
              Minimal Decor – thương hiệu đồ trang trí uy tín, được hàng nghìn khách hàng tin tưởng
            </div>
            <Link to="/shop" style={{ background: '#fff', color: '#1a5276', fontWeight: 700, padding: '10px 28px', borderRadius: 3, textDecoration: 'none', fontSize: 14 }}>
              Khám phá cửa hàng
            </Link>
          </div>
        </div>

        {/* NEW ARRIVALS */}
        <div className="nd-section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="nd-section-header">
              <div className="nd-section-title">SẢN PHẨM MỚI NHẤT</div>
              <Link to="/shop" className="nd-section-more">Xem tất cả <i className="fas fa-arrow-right"></i></Link>
            </div>
            <div className="nd-products-grid">
              {products.slice(4, 12).map(p => (
                <ProductCard key={p.id} p={p} addToCart={addToCart} />
              ))}
            </div>
          </div>
        </div>

        {/* TESTIMONIALS */}
        <div className="nd-testimonials">
          <div className="container">
            <div className="nd-section-header">
              <div className="nd-section-title">KHÁCH HÀNG NÓI GÌ</div>
            </div>
            <div className="row g-3">
              {[
                { text: 'Sản phẩm đẹp xuất sắc, đúng như mô tả. Giao hàng nhanh, đóng gói cẩn thận. Sẽ ủng hộ lâu dài!', author: 'Nguyễn Thị Lan – Hà Nội', rating: 5 },
                { text: 'Mua làm quà tặng khai trương cho bạn, được khen rất nhiều. Chất lượng vượt ngoài mong đợi với giá tiền.', author: 'Trần Minh Tuấn – TP.HCM', rating: 5 },
                { text: 'Shop tư vấn nhiệt tình, sản phẩm đúng mẫu, đóng gói rất chắc chắn. Cảm ơn shop!', author: 'Lê Thu Hà – Đà Nẵng', rating: 5 },
              ].map((t, i) => (
                <div key={i} className="col-md-4">
                  <div className="nd-testi-card">
                    <div className="mb-2"><StarRating rating={t.rating} /></div>
                    <div className="nd-testi-text">"{t.text}"</div>
                    <div className="nd-testi-author">— {t.author}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default Home;
