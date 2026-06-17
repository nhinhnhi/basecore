import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/Cartcontext';

const API_BASE = 'http://localhost:5001/api';

const PRICE_RANGES = [
  { label: 'Tất cả mức giá', min: 0, max: Infinity },
  { label: 'Dưới 200.000đ', min: 0, max: 200000 },
  { label: '200.000đ – 500.000đ', min: 200000, max: 500000 },
  { label: '500.000đ – 1.000.000đ', min: 500000, max: 1000000 },
  { label: 'Trên 1.000.000đ', min: 1000000, max: Infinity },
];

function StarRating({ rating = 5 }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <i key={i} className="fas fa-star" style={{ color: i <= rating ? '#f39c12' : '#ddd', fontSize: 11 }}></i>
      ))}
    </span>
  );
}

function Shop() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [inputVal, setInputVal] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priceRange, setPriceRange] = useState(0);
  const [sortBy, setSortBy] = useState('default');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE}/Categories`).then(res => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const params = { page, pageSize: 12 };
    if (keyword) params.keyword = keyword;
    if (categoryId) params.categoryId = categoryId;
    axios.get(`${API_BASE}/Products`, { params })
      .then(res => {
        let items = res.data.items || res.data;
        // Client-side price filter
        const range = PRICE_RANGES[priceRange];
        if (range.min > 0 || range.max < Infinity) {
          items = items.filter(p => p.basePrice >= range.min && p.basePrice <= range.max);
        }
        // Sort
        if (sortBy === 'price-asc') items = [...items].sort((a,b) => a.basePrice - b.basePrice);
        if (sortBy === 'price-desc') items = [...items].sort((a,b) => b.basePrice - a.basePrice);
        if (sortBy === 'name') items = [...items].sort((a,b) => a.name.localeCompare(b.name));
        setProducts(items);
        setTotalPages(res.data.totalPages || 1);
        setTotalItems(res.data.totalItems || items.length);
      })
      .catch(() => {});
  }, [keyword, categoryId, page, priceRange, sortBy]);

  const handleSearch = (e) => { e.preventDefault(); setKeyword(inputVal); setPage(1); };

  return (
    <>
      <style>{`
        .nd-shop { font-family: 'Segoe UI', Arial, sans-serif; }
        /* BREADCRUMB */
        .nd-breadcrumb { background: #f8f9fa; border-bottom: 1px solid #e8e8e8; padding: 10px 0; font-size: 13px; }
        .nd-breadcrumb a { color: #1a5276; text-decoration: none; }
        .nd-breadcrumb a:hover { text-decoration: underline; }
        /* SIDEBAR */
        .nd-sidebar-card { background: #fff; border: 1px solid #e8e8e8; border-radius: 4px; overflow: hidden; margin-bottom: 16px; }
        .nd-sidebar-head { background: #1a5276; color: #fff; font-weight: 700; font-size: 14px; padding: 10px 16px; letter-spacing: .5px; display: flex; align-items: center; gap: 8px; }
        .nd-sidebar-body { padding: 8px 0; }
        .nd-sidebar-item { display: flex; align-items: center; justify-content: space-between; padding: 9px 16px; font-size: 13.5px; color: #333; cursor: pointer; transition: all .15s; border: none; background: none; width: 100%; text-align: left; text-decoration: none; }
        .nd-sidebar-item:hover, .nd-sidebar-item.active { background: #eaf2fb; color: #1a5276; }
        .nd-sidebar-item .count { color: #999; font-size: 12px; }
        /* TOOLBAR */
        .nd-toolbar { background: #fff; border: 1px solid #e8e8e8; border-radius: 4px; padding: 10px 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .nd-toolbar-left { font-size: 13px; color: #666; }
        .nd-sort-select { border: 1px solid #ddd; border-radius: 3px; padding: 6px 10px; font-size: 13px; outline: none; }
        .nd-view-btn { background: none; border: 1px solid #ddd; border-radius: 3px; padding: 6px 10px; cursor: pointer; color: #666; transition: all .15s; }
        .nd-view-btn.active, .nd-view-btn:hover { background: #1a5276; color: #fff; border-color: #1a5276; }
        /* GRID */
        .nd-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(195px, 1fr)); gap: 14px; }
        .nd-product-card { background: #fff; border: 1px solid #e8e8e8; border-radius: 4px; overflow: hidden; cursor: pointer; transition: box-shadow .2s, transform .2s; }
        .nd-product-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,.12); transform: translateY(-3px); }
        .nd-product-img-wrap { position: relative; overflow: hidden; height: 195px; }
        .nd-product-img { width: 100%; height: 100%; object-fit: cover; transition: transform .35s; }
        .nd-product-card:hover .nd-product-img { transform: scale(1.06); }
        .nd-badge-sale { position: absolute; top: 8px; left: 8px; background: #e74c3c; color: #fff; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 2px; }
        .nd-product-overlay { position: absolute; inset: 0; background: rgba(26,82,118,.55); display: flex; align-items: center; justify-content: center; gap: 8px; opacity: 0; transition: opacity .25s; }
        .nd-product-card:hover .nd-product-overlay { opacity: 1; }
        .nd-btn-cart { background: #fff; color: #1a5276; border: none; padding: 7px 13px; border-radius: 3px; font-size: 12px; font-weight: 700; cursor: pointer; }
        .nd-btn-cart:hover { background: #1a5276; color: #fff; }
        .nd-btn-wish { background: rgba(255,255,255,.9); color: #e74c3c; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 14px; }
        .nd-product-body { padding: 10px 12px; }
        .nd-product-name { font-size: 13.5px; font-weight: 600; color: #222; margin-bottom: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 38px; line-height: 1.4; }
        .nd-price-new { color: #e74c3c; font-weight: 700; font-size: 15px; }
        .nd-price-old { color: #999; text-decoration: line-through; font-size: 12px; margin-right: 6px; }
        /* LIST VIEW */
        .nd-list-item { background: #fff; border: 1px solid #e8e8e8; border-radius: 4px; display: flex; gap: 0; overflow: hidden; margin-bottom: 12px; cursor: pointer; transition: box-shadow .2s; }
        .nd-list-item:hover { box-shadow: 0 3px 12px rgba(0,0,0,.1); }
        .nd-list-img { width: 180px; flex-shrink: 0; object-fit: cover; }
        .nd-list-body { padding: 16px; flex: 1; }
        /* PAGINATION */
        .nd-pagination { display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; margin-top: 24px; }
        .nd-page-btn { width: 36px; height: 36px; border: 1px solid #ddd; background: #fff; border-radius: 3px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all .15s; display: flex; align-items: center; justify-content: center; }
        .nd-page-btn:hover, .nd-page-btn.active { background: #1a5276; color: #fff; border-color: #1a5276; }
        .nd-page-btn:disabled { opacity: .4; cursor: not-allowed; }
      `}</style>

      <div className="nd-shop">
        {/* Breadcrumb */}
        <div className="nd-breadcrumb">
          <div className="container">
            <Link to="/">Trang chủ</Link>
            <i className="fas fa-chevron-right mx-2" style={{ fontSize: 10 }}></i>
            <span>Sản phẩm</span>
            {categoryId && categories.find(c => c.id.toString() === categoryId) && (
              <>
                <i className="fas fa-chevron-right mx-2" style={{ fontSize: 10 }}></i>
                <span>{categories.find(c => c.id.toString() === categoryId)?.name}</span>
              </>
            )}
          </div>
        </div>

        <div className="container" style={{ paddingTop: 20, paddingBottom: 40 }}>
          <div className="row">
            {/* SIDEBAR */}
            <div className="col-md-3 col-lg-2">
              {/* Search */}
              <div className="nd-sidebar-card">
                <div className="nd-sidebar-head"><i className="fas fa-search"></i> TÌM KIẾM</div>
                <div style={{ padding: '12px' }}>
                  <form onSubmit={handleSearch}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Tìm sản phẩm..."
                        value={inputVal}
                        onChange={e => setInputVal(e.target.value)}
                      />
                      <button type="submit" className="btn btn-sm" style={{ background: '#1a5276', color: '#fff', flexShrink: 0 }}>
                        <i className="fas fa-search"></i>
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Categories */}
              <div className="nd-sidebar-card">
                <div className="nd-sidebar-head"><i className="fas fa-list"></i> DANH MỤC</div>
                <div className="nd-sidebar-body">
                  <button className={`nd-sidebar-item ${categoryId === '' ? 'active' : ''}`} onClick={() => { setCategoryId(''); setPage(1); }}>
                    <span>Tất cả sản phẩm</span>
                  </button>
                  {categories.map(cat => (
                    <button key={cat.id} className={`nd-sidebar-item ${categoryId === cat.id.toString() ? 'active' : ''}`}
                      onClick={() => { setCategoryId(cat.id.toString()); setPage(1); }}>
                      <span>{cat.name}</span>
                      <i className="fas fa-chevron-right" style={{ fontSize: 10, color: '#ccc' }}></i>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price filter */}
              <div className="nd-sidebar-card">
                <div className="nd-sidebar-head"><i className="fas fa-tag"></i> GIÁ</div>
                <div className="nd-sidebar-body">
                  {PRICE_RANGES.map((r, i) => (
                    <button key={i} className={`nd-sidebar-item ${priceRange === i ? 'active' : ''}`} onClick={() => { setPriceRange(i); setPage(1); }}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hotline box */}
              <div style={{ background: '#1a5276', borderRadius: 4, padding: '16px', textAlign: 'center', color: '#fff' }}>
                <i className="fas fa-headset" style={{ fontSize: 28, marginBottom: 8 }}></i>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Cần tư vấn?</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#aed6f1' }}>0969.534.568</div>
                <div style={{ fontSize: 12, marginTop: 4, opacity: .8 }}>Thứ 2 – Thứ 7: 8:00 – 20:00</div>
              </div>
            </div>

            {/* PRODUCT AREA */}
            <div className="col-md-9 col-lg-10">
              {/* Toolbar */}
              <div className="nd-toolbar">
                <div className="nd-toolbar-left">
                  Hiển thị <strong>{products.length}</strong> sản phẩm
                  {keyword && <span> cho "<strong>{keyword}</strong>"</span>}
                </div>
                <div className="d-flex align-items-center gap-2 ms-auto">
                  <span style={{ fontSize: 13, color: '#666' }}>Sắp xếp:</span>
                  <select className="nd-sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="default">Mặc định</option>
                    <option value="price-asc">Giá: Thấp → Cao</option>
                    <option value="price-desc">Giá: Cao → Thấp</option>
                    <option value="name">Tên A–Z</option>
                  </select>
                  <button className={`nd-view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
                    <i className="fas fa-th"></i>
                  </button>
                  <button className={`nd-view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
                    <i className="fas fa-list"></i>
                  </button>
                </div>
              </div>

              {/* Products */}
              {products.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-box-open fa-4x mb-3" style={{ color: '#ddd' }}></i>
                  <h5 style={{ color: '#999' }}>Không tìm thấy sản phẩm nào</h5>
                  <button className="btn btn-sm mt-2" style={{ background: '#1a5276', color: '#fff' }} onClick={() => { setKeyword(''); setInputVal(''); setCategoryId(''); }}>
                    Xóa bộ lọc
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="nd-grid">
                  {products.map(p => (
                    <div key={p.id} className="nd-product-card" onClick={() => navigate(`/product/${p.id}`)}>
                      <div className="nd-product-img-wrap">
                        <img src={p.mainImageUrl || '/img/default.jpg'} alt={p.name} className="nd-product-img" />
                        {p.salePrice && p.salePrice < p.basePrice && <div className="nd-badge-sale">SALE</div>}
                        <div className="nd-product-overlay">
                          <button className="nd-btn-cart" onClick={e => { e.stopPropagation(); addToCart({ ...p, price: p.basePrice }, 1); }}>
                            <i className="fas fa-cart-plus me-1"></i>Thêm giỏ
                          </button>
                          <button className="nd-btn-wish"><i className="far fa-heart"></i></button>
                        </div>
                      </div>
                      <div className="nd-product-body">
                        <div className="nd-product-name">{p.name}</div>
                        <div className="mb-1"><StarRating /></div>
                        <div>
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
                  ))}
                </div>
              ) : (
                <div>
                  {products.map(p => (
                    <div key={p.id} className="nd-list-item" onClick={() => navigate(`/product/${p.id}`)}>
                      <img src={p.mainImageUrl || '/img/default.jpg'} alt={p.name} className="nd-list-img" />
                      <div className="nd-list-body">
                        <div style={{ fontWeight: 700, fontSize: 16, color: '#222', marginBottom: 6 }}>{p.name}</div>
                        <div className="mb-2"><StarRating /></div>
                        <div style={{ color: '#666', fontSize: 13, marginBottom: 10, lineHeight: 1.6 }}>{p.shortDescription?.substring(0, 100)}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <span className="nd-price-new" style={{ fontSize: 18 }}>{p.basePrice?.toLocaleString()}đ</span>
                          <button className="btn btn-sm" style={{ background: '#1a5276', color: '#fff', fontSize: 13 }}
                            onClick={e => { e.stopPropagation(); addToCart({ ...p, price: p.basePrice }, 1); }}>
                            <i className="fas fa-cart-plus me-1"></i>Thêm vào giỏ
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="nd-pagination">
                  <button className="nd-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  {[...Array(totalPages).keys()].map(p => (
                    <button key={p} className={`nd-page-btn ${page === p + 1 ? 'active' : ''}`} onClick={() => setPage(p + 1)}>
                      {p + 1}
                    </button>
                  ))}
                  <button className="nd-page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Shop;
