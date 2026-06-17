import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/Authcontext';
import { useCart } from '../contexts/Cartcontext';

const CATEGORIES = [
  { label: 'ĐỒ TRANG TRÍ NỘI THẤT', icon: '🏠' },
  { label: 'ĐỒ DECOR TRANG TRÍ PHÒNG', icon: '🪴' },
  { label: 'QUÀ TẶNG TÂN GIA CAO CẤP', icon: '🎁' },
  { label: 'QUÀ TẶNG KHAI TRƯƠNG', icon: '🎊' },
  { label: 'QUÀ TẶNG SINH NHẬT', icon: '🎂' },
  { label: 'QUÀ TẶNG SẾP CAO CẤP', icon: '⭐' },
  { label: 'QUÀ TẶNG ĐỐI TÁC D.NGHIỆP', icon: '🤝' },
  { label: 'QUÀ CƯỚI – KỶ NIỆM NGÀY CƯỚI', icon: '💍' },
];

const NAV_LINKS = [
  { to: '/', label: 'TRANG CHỦ' },
  { to: '/shop', label: 'GIỚI THIỆU' },
  { to: '/shop', label: 'VIDEO' },
  { to: '/shop', label: 'SẢN PHẨM BÁN CHẠY' },
  { to: '/contact', label: 'TIN TỨC' },
  { to: '/shop', label: 'DỊCH VỤ' },
  { to: '/contact', label: 'LIÊN HỆ' },
];

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const [showCatMenu, setShowCatMenu] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const catRef = useRef();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <>
      <style>{`
        .nd-topbar { background: #1a5276; color: #fff; font-size: 13px; padding: 6px 0; }
        .nd-topbar a { color: #fff; text-decoration: none; }
        .nd-topbar a:hover { color: #aed6f1; }
        .nd-header { background: #fff; border-bottom: 1px solid #e8e8e8; padding: 14px 0; }
        .nd-logo-title { font-family: 'Georgia', serif; font-weight: 700; font-size: 20px; color: #1a5276; line-height: 1.1; }
        .nd-logo-sub { font-size: 11px; color: #888; letter-spacing: 1px; text-transform: uppercase; }
        .nd-logo-icon { width: 54px; height: 54px; object-fit: contain; }
        .nd-search-wrap { border: 2px solid #1a5276; border-radius: 3px; overflow: hidden; display: flex; flex: 1; max-width: 440px; }
        .nd-search-wrap input { border: none; outline: none; padding: 9px 14px; font-size: 14px; flex: 1; font-family: inherit; }
        .nd-search-wrap button { background: #1a5276; color: #fff; border: none; padding: 0 18px; cursor: pointer; font-size: 16px; transition: background .2s; }
        .nd-search-wrap button:hover { background: #154360; }
        .nd-header-action { display: flex; flex-direction: column; align-items: center; text-decoration: none; color: #333; font-size: 11px; gap: 3px; cursor: pointer; transition: color .2s; }
        .nd-header-action:hover { color: #1a5276; }
        .nd-header-action i { font-size: 22px; }
        .nd-cart-badge { position: relative; }
        .nd-cart-badge .badge { position: absolute; top: -8px; right: -8px; background: #e74c3c; color: #fff; border-radius: 50%; width: 18px; height: 18px; font-size: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; }
        .nd-nav { background: #1a5276; }
        .nd-nav-inner { display: flex; align-items: stretch; }
        .nd-cat-btn { background: #154360; color: #fff; border: none; padding: 0 20px; font-size: 13px; font-weight: 700; letter-spacing: .5px; cursor: pointer; display: flex; align-items: center; gap: 10px; height: 48px; white-space: nowrap; transition: background .2s; }
        .nd-cat-btn:hover { background: #1a2744; }
        .nd-cat-dropdown { position: absolute; top: 100%; left: 0; background: #fff; min-width: 280px; z-index: 9999; box-shadow: 0 6px 24px rgba(0,0,0,.15); border: 1px solid #e8e8e8; border-top: 3px solid #1a5276; }
        .nd-cat-item { display: flex; align-items: center; gap: 10px; padding: 11px 18px; text-decoration: none; color: #333; font-size: 13.5px; border-bottom: 1px solid #f4f4f4; transition: all .15s; }
        .nd-cat-item:hover { background: #eaf2fb; color: #1a5276; padding-left: 24px; }
        .nd-cat-item span { font-size: 17px; }
        .nd-navlink { color: #fff; text-decoration: none; padding: 0 15px; font-size: 13px; font-weight: 600; letter-spacing: .3px; height: 48px; display: flex; align-items: center; transition: background .15s; white-space: nowrap; }
        .nd-navlink:hover { background: rgba(255,255,255,.15); color: #fff; }
        .nd-hotline-box { background: #fff; border-radius: 4px; padding: 4px 12px; margin-left: auto; display: flex; align-items: center; gap: 8px; }
        .nd-hotline-box .phone { color: #e74c3c; font-weight: 700; font-size: 14px; }
        .nd-dropdown-menu { position: absolute; right: 0; top: calc(100% + 6px); background: #fff; border: 1px solid #e8e8e8; border-radius: 6px; min-width: 180px; box-shadow: 0 4px 16px rgba(0,0,0,.12); z-index: 9999; overflow: hidden; }
        .nd-dropdown-item { display: flex; align-items: center; gap: 10px; padding: 10px 16px; text-decoration: none; color: #333; font-size: 13.5px; transition: background .15s; cursor: pointer; border: none; background: none; width: 100%; text-align: left; }
        .nd-dropdown-item:hover { background: #eaf2fb; color: #1a5276; }
        @media (max-width: 768px) {
          .nd-desktop { display: none !important; }
          .nd-mobile-menu { display: block; }
        }
        @media (min-width: 769px) {
          .nd-mobile-toggle { display: none; }
        }
      `}</style>

      {/* TOP BAR */}
      <div className="nd-topbar">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center flex-wrap" style={{ gap: 8 }}>
            <div className="d-flex align-items-center" style={{ gap: 16, flexWrap: 'wrap' }}>
              <span><i className="fas fa-envelope me-1"></i>minimaldecor@gmail.com</span>
              <span><i className="fas fa-phone me-1"></i>0969.534.568</span>
              <div className="d-flex" style={{ gap: 10 }}>
                {['facebook', 'instagram', 'tiktok', 'twitter'].map(s => (
                  <a key={s} href="#"><i className={`fab fa-${s}`}></i></a>
                ))}
              </div>
            </div>
            <div className="d-flex align-items-center" style={{ gap: 12, fontSize: 12 }}>
              <span><i className="fas fa-map-marker-alt me-1"></i>HÀ NỘI: Số 24 ngõ 234 Hoàng Quốc Việt, Q.Nghĩa Đô</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN HEADER */}
      <div className="nd-header">
        <div className="container">
          <div className="d-flex align-items-center" style={{ gap: 20 }}>
            {/* Logo */}
            <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 54, height: 54, background: 'linear-gradient(135deg, #1a5276, #2980b9)',
                  borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <i className="fas fa-store" style={{ fontSize: 24, color: '#fff' }}></i>
                </div>
                <div>
                  <div className="nd-logo-title">Minimal<br />Decor</div>
                  <div className="nd-logo-sub">Trang Trí & Quà Tặng</div>
                </div>
              </div>
            </Link>

            {/* Contact info (desktop) */}
            <div className="d-none d-lg-flex flex-column" style={{ gap: 4, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ background: '#eaf2fb', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fas fa-map-marker-alt" style={{ color: '#1a5276', fontSize: 13 }}></i>
                </div>
                <div style={{ fontSize: 12 }}>
                  <div style={{ color: '#1a5276', fontWeight: 700 }}>HÀ NỘI:</div>
                  <div style={{ color: '#555' }}>Số 24 ngõ 234 Hoàng Quốc Việt, Q.Nghĩa Đô</div>
                </div>
              </div>
            </div>

            {/* Hotline */}
            <div className="d-none d-md-flex align-items-center" style={{ flexShrink: 0, gap: 10 }}>
              <div style={{ background: '#e74c3c', borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 2s infinite' }}>
                <i className="fas fa-phone" style={{ color: '#fff', fontSize: 16 }}></i>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#888' }}>Hotline:</div>
                <div style={{ color: '#e74c3c', fontWeight: 700, fontSize: 16 }}>0969.534.568</div>
              </div>
            </div>

            {/* Search bar */}
            <div className="nd-search-wrap" style={{ flex: 1 }}>
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && navigate('/shop?q=' + searchVal)}
              />
              <button onClick={() => navigate('/shop?q=' + searchVal)}>
                <i className="fas fa-search"></i>
              </button>
            </div>

            {/* Right actions */}
            <div className="d-flex align-items-center" style={{ gap: 18, flexShrink: 0 }}>
              {/* Cart */}
              <Link to="/cart" className="nd-header-action">
                <div className="nd-cart-badge">
                  <i className="fas fa-shopping-cart"></i>
                  {getTotalItems() > 0 && <span className="badge">{getTotalItems()}</span>}
                </div>
                <span>Giỏ hàng</span>
              </Link>

              {/* Account */}
              {!isAuthenticated ? (
                <Link to="/login" className="nd-header-action">
                  <i className="fas fa-user"></i>
                  <span>Đăng nhập</span>
                </Link>
              ) : (
                <div style={{ position: 'relative' }} className="dropdown">
                  <a className="nd-header-action dropdown-toggle" data-bs-toggle="dropdown" href="#">
                    <i className="fas fa-user-circle"></i>
                    <span>{user?.fullName?.split(' ').pop() || 'Tài khoản'}</span>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li><Link className="dropdown-item" to="/profile"><i className="fas fa-user me-2"></i>Hồ sơ</Link></li>
                    <li><Link className="dropdown-item" to="/orders"><i className="fas fa-shopping-bag me-2"></i>Đơn hàng</Link></li>
                    <li><Link className="dropdown-item" to="/vouchers"><i className="fas fa-ticket-alt me-2"></i>Kho voucher</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item" onClick={handleLogout}><i className="fas fa-sign-out-alt me-2"></i>Đăng xuất</button></li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* NAV BAR */}
      <div className="nd-nav">
        <div className="container">
          <div className="nd-nav-inner">
            {/* Category mega menu */}
            <div style={{ position: 'relative' }}
              onMouseEnter={() => setShowCatMenu(true)}
              onMouseLeave={() => setShowCatMenu(false)}
            >
              <button className="nd-cat-btn">
                <i className="fas fa-bars"></i>
                DANH MỤC SẢN PHẨM
                <i className="fas fa-chevron-down" style={{ fontSize: 10, marginLeft: 4 }}></i>
              </button>
              {showCatMenu && (
                <div className="nd-cat-dropdown">
                  {CATEGORIES.map(cat => (
                    <Link key={cat.label} to="/shop" className="nd-cat-item">
                      <span>{cat.icon}</span>
                      {cat.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Nav links */}
            {NAV_LINKS.map(item => (
              <Link key={item.label} to={item.to} className="nd-navlink">{item.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
