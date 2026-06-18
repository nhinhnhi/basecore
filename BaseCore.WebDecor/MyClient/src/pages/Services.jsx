import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export const servicePosts = [
  {
    id: 1,
    title: 'Tuyển Đối Tác, Cộng Tác Viên Bán Đồ Decor Trang Trí',
    excerpt: 'A. CHÍNH SÁCH ĐỐI TÁC, CỘNG TÁC VIÊN BÁN ĐỒ DECOR TRANG TRÍ...',
    date: 'Tháng Mười-2-2026',
    comments: 0,
    category: 'Dịch vụ',
    content: `
      <h2>Tuyển Đối Tác, Cộng Tác Viên Bán Đồ Decor Trang Trí</h2>
      
      <h3>📌 MỤC LỤC</h3>
      <ol>
        <li><a href="#chinh-sach">A. CHÍNH SÁCH ĐỐI TÁC, CỘNG TÁC VIÊN</a></li>
        <li><a href="#form-dang-ky">B. FORM ĐĂNG KÝ</a></li>
        <li><a href="#danh-muc">C. DANH MỤC SẢN PHẨM DECOR TẠI DECOPRO</a></li>
      </ol>
      <hr />

      <h3 id="chinh-sach">A. CHÍNH SÁCH ĐỐI TÁC, CỘNG TÁC VIÊN BÁN ĐỒ DECOR TRANG TRÍ</h3>
      
      <h4>1/ Đối tượng áp dụng</h4>
      <ul>
        <li>ĐƠN VỊ THIẾT KẾ THI CÔNG NỘI THẤT, CỬA HÀNG NỘI THẤT</li>
        <li>ĐƠN VỊ KIẾN TRÚC XÂY DỰNG, KIẾN TRÚC SƯ</li>
      </ul>
      <p><strong>Không áp dụng</strong> với hình thức bán hàng Online, đăng bán sản phẩm lên Sàn TMĐT.</p>

      <h4>2/ Hình thức hợp tác</h4>
      <ul>
        <li>CTV giới thiệu khách hàng qua mua Đồ decor trực tiếp tại Showroom DECOPRO</li>
        <li>CTV Chọn sản phẩm hoặc Mua hàng hộ khách hàng</li>
        <li>CTV gửi link website Decopro.vn để khách hàng chọn sản phẩm.</li>
      </ul>

      <h4>3/ Chính sách chiết khấu Đối tác, Cộng tác viên bán đồ decor</h4>
      <table style="width:100%; border-collapse:collapse; margin:10px 0; font-size:14px;">
        <tr style="background:#1a5276; color:#fff;">
          <th style="border:1px solid #ddd; padding:8px;">Giá trị đơn hàng</th>
          <th style="border:1px solid #ddd; padding:8px;">Chiết khấu</th>
        </tr>
        <tr>
          <td style="border:1px solid #ddd; padding:8px;">Dưới 1 triệu</td>
          <td style="border:1px solid #ddd; padding:8px;">Không áp dụng</td>
        </tr>
        <tr>
          <td style="border:1px solid #ddd; padding:8px;">1 – 5 triệu</td>
          <td style="border:1px solid #ddd; padding:8px;">10% (CTV)</td>
        </tr>
        <tr>
          <td style="border:1px solid #ddd; padding:8px;">5 – 20 triệu</td>
          <td style="border:1px solid #ddd; padding:8px;">20% (KH 10% + CTV 10%, hoặc CTV 20%)</td>
        </tr>
        <tr>
          <td style="border:1px solid #ddd; padding:8px;">Trên 20 triệu</td>
          <td style="border:1px solid #ddd; padding:8px;">25% (KH 10% + CTV 15%, hoặc CTV 25%) – Không áp dụng Gốm Sứ Về Vàng</td>
        </tr>
      </table>
      <p><strong>Lưu ý:</strong> Ghi chú đơn hàng: Cộng tác viên + SĐT</p>
      <ul>
        <li>Đơn hàng tính theo giá niêm yết trên website Decopro.vn</li>
        <li>Tiền chiết khấu được trừ trực tiếp trên đơn hàng hoặc chuyển lại CTV sau khi giao hàng thành công.</li>
      </ul>

      <h4>4/ Điều kiện áp dụng chính sách Cộng tác viên</h4>
      <ul>
        <li>CTV đã đăng ký thành viên, có thông tin số điện thoại trên hệ thống của DECOPRO</li>
        <li>Đơn hàng của khách hàng <strong>PHẢI CÓ SĐT CỦA CỘNG TÁC VIÊN</strong></li>
      </ul>

      <h4>5/ Chính sách vận chuyển, bảo hành</h4>
      <ul>
        <li>Miễn phí vận chuyển tất cả đơn hàng (trừ một số mặt hàng dễ vỡ giá trị cao – sẽ thông báo sau)</li>
        <li>Khách hàng được quyền kiểm tra trước khi thanh toán. Từ chối nhận hàng nếu lỗi, vỡ, sai thông tin.</li>
        <li>Bảo hành đổi mới sản phẩm trong vòng 15 ngày nếu không phù hợp (phải báo lại DECOPRO trong 3 ngày từ lúc nhận hàng). Đổi ngang giá hoặc giá trị lớn hơn.</li>
      </ul>

      <hr />

      <h3 id="form-dang-ky">B. FORM ĐĂNG KÝ ĐỐI TÁC, CỘNG TÁC VIÊN</h3>
      <div style="background:#f8f9fa; padding:20px; border-radius:6px; margin:10px 0;">
        <p><strong>Tên của bạn:</strong> <input type="text" style="width:100%; padding:6px; margin:5px 0;" /></p>
        <p><strong>Số điện thoại:</strong> <input type="text" style="width:100%; padding:6px; margin:5px 0;" /></p>
        <p><strong>Tên công ty:</strong> <input type="text" style="width:100%; padding:6px; margin:5px 0;" /></p>
        <p><strong>Mã số thuế:</strong> <input type="text" style="width:100%; padding:6px; margin:5px 0;" /></p>
        <button style="background:#1a5276; color:#fff; padding:8px 24px; border:none; border-radius:4px; cursor:pointer;">Đăng ký</button>
      </div>

      <hr />

      <h3 id="danh-muc">C. DANH MỤC SẢN PHẨM DECOR TRANG TRÍ TẠI DECOPRO</h3>
      <ul>
        <li>Tượng decor trang trí</li>
        <li>Đồng hồ treo tường, tranh treo tường decor</li>
        <li>Giá treo ly rượu, ly rượu vang, kệ để rượu vang</li>
        <li>Đồ Thờ gốm sứ Bát Tràng, gốm Chu Đậu</li>
        <li>Bình họa, khay hoa quả, bộ ấm trà</li>
      </ul>
    `,
  },
  {
    id: 2,
    title: 'Địa chỉ bán sỉ đồ decor quà tặng cao cấp – Tuyến Đại Lý Toàn Quốc',
    excerpt: `TUYẾN ĐẠI LÝ SỈ ĐỒ DECOR & QUÀ TẶNG CAO CẤP TOÀN QUỐC
Nhiều cửa hàng đang "chôn vốn" vì nhập sản hàng...
Hàng về khó bán → tồn kho
Muốn mở rộng → sợ rủi ro
Nguồn hàng lỗi → không đổi được
Bán chậm → không xoay được tiền
Đây là lý do nhiều shop không đảm nhận thêm hoặc mở rộng`,
    date: 'Tháng Năm-25-2024',
    comments: 0,
    category: 'Dịch vụ - Tin tức',
  },
];

const Services = () => {
  return (
    <div className="container" style={{ padding: '30px 0' }}>
      <nav style={{ fontSize: 14, marginBottom: 20 }}>
        <Link to="/" style={{ color: '#1a5276', textDecoration: 'none' }}>Trang chủ</Link>
        <span style={{ margin: '0 8px', color: '#888' }}>›</span>
        <span style={{ color: '#333' }}>Dịch vụ</span>
      </nav>
      <div style={{ display: 'flex', gap: 30 }}>
        <Sidebar />
        <main style={{ flex: 1 }}>
          <h2 style={{ color: '#1a5276', borderBottom: '2px solid #e8e8e8', paddingBottom: 10 }}>
            DỊCH VỤ
          </h2>
          {servicePosts.map((post) => (
            <article key={post.id} style={{ padding: '20px 0', borderBottom: '1px solid #e8e8e8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ background: '#1a5276', color: '#fff', padding: '2px 12px', borderRadius: 2, fontSize: 12 }}>
                  {post.category}
                </span>
                <span style={{ fontSize: 13, color: '#888' }}>{post.comments} comment</span>
                <span style={{ fontSize: 13, color: '#888' }}>{post.date}</span>
              </div>
              <h3 style={{ margin: '8px 0 6px', fontSize: 20 }}>
                <Link to={`/services/${post.id}`} style={{ color: '#1a5276', textDecoration: 'none' }}>
                  {post.title}
                </Link>
              </h3>
              <p style={{ color: '#555', lineHeight: 1.6, marginBottom: 10, whiteSpace: 'pre-line' }}>{post.excerpt}</p>
              <Link to={`/services/${post.id}`} style={{ display: 'inline-block', color: '#fff', background: '#1a5276', padding: '4px 18px', borderRadius: 3, textDecoration: 'none', fontSize: 13 }}>
                Xem thêm
              </Link>
            </article>
          ))}
        </main>
      </div>
    </div>
  );
};

export default Services;