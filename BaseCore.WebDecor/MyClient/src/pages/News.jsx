import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export const posts = [
  {
    id: 1,
    title: 'Tân gia nên tặng gì? Những món quà ý nghĩa, bền lâu và gắn kết',
    excerpt: 'Khi được mời dự tiệc mừng nhà mới, không ít người băn khoăn: Tân gia nên tặng gì? để vừa ý nghĩa, vừa hợp lòng gia chủ?...',
    date: 'Tháng Bảy-12-2025',
    comments: 0,
    category: 'TƯ VẤN QUÀ TẶNG',
    image: '/img/Decor-hanh-phuc-tai-loc-vien-man.jpg', 
    author: 'Bùi Trường Giang',
    content: `
      <h2>Tân gia nên tặng gì? Những món quà ý nghĩa, bền lâu và gắn kết</h2>
      <p><strong>Tác giả:</strong> Bùi Trường Giang</p>
      <p><strong>Ngày cập nhật:</strong> 12-07-2025</p>
      <p>Khi được mời dự tiệc mừng nhà mới, không ít người băn khoăn: <strong>Tân gia nên tặng gì?</strong> để vừa ý nghĩa, vừa hợp lòng gia chủ? Một món <strong>quà tặng tân gia</strong> không chỉ là lời chúc mừng, mà còn thể hiện sự tinh tế và thành ý của người tặng.</p>
      <p>Nếu bạn cũng đang tìm câu trả lời cho câu hỏi <strong>“Tân gia nhà mới nên tặng gì?”, hay “Quà tân gia nên mua gì?”,</strong> hãy cùng <strong>Decopro</strong> tham khảo 5 gợi ý dưới đây.</p>

      <h3>📌 MỤC LỤC</h3>
      <ol>
        <li>Bình hút tài lộc – Quà tân gia tặng gì để chiêu tài, giữ lộc?</li>
        <li>Tượng phong thủy – Tặng gì khi tân gia để chúc may mắn, thịnh vượng?</li>
        <li>Đồng hồ treo tường đẹp – Quà tân gia hiện đại và ý nghĩa thời vận</li>
        <li>Bộ ấm chén uống trà – Quà tân gia ấm cúng và đầy tinh tế</li>
        <li>Kệ rượu vang/ Bộ ly uống rượu cao cấp – Tân gia nhà mới nên tặng gì cho gia chủ nam?</li>
      </ol>

      <hr />

      <h3>1. Bình hút tài lộc – Quà tân gia tặng gì để chiêu tài, giữ lộc?</h3>
      <p>Quà tân gia tặng gì để thể hiện lời chúc phát đạt, sung túc? Bình hút tài lộc chính là lựa chọn lý tưởng. Theo phong thủy, chiếc bình có Miệng loe, cổ thắt, thân phình giúp giữ của cải, tiền bạc và thu hút vượng khí cho ngôi nhà.</p>
      <ul>
        <li><strong>Ý nghĩa:</strong> Hút tài – tụ lộc – kích hoạt may mắn.</li>
        <li><strong>Công năng:</strong> Trưng bày trên kệ tivi, kệ tủ phòng khách, phòng làm việc</li>
        <li><strong>Phù hợp với:</strong> Gia chủ làm ăn, kinh doanh, về nhà mới.</li>
      </ul>
      <img src="/img/Binh-hut-tai-loc.jpg" alt="Bình hút tài lộc" style="width:100%; max-width:600px; margin:10px 0; border-radius:6px;" />
      <p><a href="/shop?category=QUÀ TẶNG TÂN GIA CAO CẤP" style="color:#1a5276;font-weight:bold;text-decoration:underline;">➡ Xem thêm BÌNH HÚT TÀI LỘC</a></p>

      <h3>2. Tượng phong thủy – Tặng gì khi tân gia để chúc may mắn, thịnh vượng?</h3>
      <p>Một trong những món quà tân gia được nhiều người ưa chuộng hiện nay là tượng phong thủy để bàn hoặc trưng phòng khách.</p>
      <h4>Gợi ý tượng phong thủy tặng tân gia:</h4>
      <ul>
        <li>Cá chép hóa rồng: Biểu tượng cho thịnh vượng, bền vững và trường thọ.</li>
        <li>Mã đáo thành công: Chúc công danh sự nghiệp phát triển.</li>
        <li>Thuận buồm xuôi gió: Mọi việc hanh thông, “đầu xuôi đuôi lọt”.</li>
        <li>Không gian trưng bày: Kệ phòng khách, tủ decor – tránh đặt ở ban thờ.</li>
        <li>Phù hợp với: Gia chủ làm kinh doanh, yêu thích phong thủy, decor hiện đại.</li>
      </ul>
      <img src="/img/Bat-ma-trang-tri.jpg" alt="Tượng phong thủy" style="width:100%; max-width:600px; margin:10px 0; border-radius:6px;" />
      <p><a href="/shop?category=ĐỒ TRANG TRÍ NỘI THẤT" style="color:#1a5276;font-weight:bold;text-decoration:underline;">➡ Xem thêm ĐỒ TRANG TRÍ PHONG THỦY</a></p>

      <h3>3. Đồng hồ treo tường đẹp – Quà tân gia hiện đại và ý nghĩa thời vận</h3>
      <p>Nếu bạn vẫn đang phân vân tân gia tặng gì để gia chủ nhớ mãi, đồng hồ treo tường phong thủy là gợi ý đáng cân nhắc.</p>
      <h4>Mẫu đồng hồ phong thủy nên chọn:</h4>
      <ul>
        <li>Chim công: Biểu tượng phú quý, may mắn.</li>
        <li>Hươu tài lộc: Gợi tài, gợi lộc – tạo khí tốt trong nhà.</li>
        <li>Thuận buồm xuôi gió: Tượng trưng cho cuộc sống suôn sẻ, tròn đầy.</li>
        <li>Không gian trưng bày: Phòng khách, phòng ngủ.</li>
        <li>Phù hợp với: Người trẻ, gia chủ yêu thích decor hiện đại.</li>
      </ul>
      <img src="/img/Dong-ho-treo-tuong.jpg" alt="Đồng hồ treo tường" style="width:100%; max-width:600px; margin:10px 0; border-radius:6px;" />
      <p><a href="/shop?category=ĐỒ TRANG TRÍ NỘI THẤT" style="color:#1a5276;font-weight:bold;text-decoration:underline;">➡ Xem thêm ĐỒNG HỒ TREO TƯỜNG</a></p>

      <h3>4. Bộ ấm chén uống trà – Quà tân gia ấm cúng và đầy tinh tế</h3>
      <p>Quà tân gia nên mua gì để dễ sử dụng, ý nghĩa và thanh lịch? Bộ ấm chén uống trà cao cấp chính là câu trả lời. Đây là món quà mang đậm tính truyền thống, gần gũi và rất được lòng người trung niên trở lên.</p>
      <ul>
        <li><strong>Ý nghĩa:</strong> Gắn kết, sum vầy, giữ lửa hạnh phúc gia đình.</li>
        <li><strong>Công năng:</strong> Dùng hàng ngày, tiếp khách, trang trí bàn trà.</li>
        <li><strong>Thích hợp với:</strong> Gia chủ yêu trà đạo, sống theo lối sống truyền thống hoặc tối giản.</li>
      </ul>
      <img src="/img/bo-am-che.jpg" alt="Bộ ấm chén" style="width:100%; max-width:600px; margin:10px 0; border-radius:6px;" />
      <p><a href="/shop?category=QUÀ TẶNG TÂN GIA CAO CẤP" style="color:#1a5276;font-weight:bold;text-decoration:underline;">➡ Xem thêm BỘ ẤM CHÉN UỐNG TRÀ</a></p>

      <h3>5. Kệ rượu vang/ Bộ ly uống rượu cao cấp – Tân gia nhà mới nên tặng gì cho gia chủ nam?</h3>
      <p>Đối với nam giới, bạn bè, đối tác, <strong>Kệ rượu vang hoặc bộ ly rượu cao cấp</strong> là món quà thể hiện sự sang trọng, chín chắn và tinh tế.</p>
      <ul>
        <li><strong>Ý nghĩa:</strong> Chúc mừng thành công, mối quan hệ bền vững và thịnh vượng.</li>
        <li><strong>Công năng:</strong> Dùng thưởng thức rượu, trưng bày tủ rượu, decor phòng khách.</li>
        <li><strong>Rất phù hợp với:</strong> Gia chủ cá tính, có gu thẩm mỹ mạnh, yêu thích phong cách sống hiện đại.</li>
      </ul>
      <img src="/img/ke-ruou-vang.jpg" alt="Kệ rượu vang" style="width:100%; max-width:600px; margin:10px 0; border-radius:6px;" />
      <p><a href="/shop?category=QUÀ TẶNG TÂN GIA CAO CẤP" style="color:#1a5276;font-weight:bold;text-decoration:underline;">➡ Xem thêm KỆ RƯỢU, LY UỐNG RƯỢU</a></p>

      <hr />

      <h3>📝 Tổng kết – Tân gia tặng gì để vừa đẹp, vừa ý nghĩa?</h3>
      <ul>
        <li>Ưu tiên những món có tính trưng bày cao, phù hợp phong cách nội thất.</li>
        <li>Nên chọn vật phẩm phong thủy có thông điệp tốt lành.</li>
        <li>Chú trọng chất lượng, thiết kế sang trọng để thể hiện tâm ý của người tặng.</li>
      </ul>
      <p>Với các gợi ý như: bình hút tài lộc, tượng phong thủy, đồng hồ treo tường đẹp, bộ ấm chén uống trà, bộ ly rượu cao cấp – bạn sẽ không còn lo lắng về việc <strong>quà tân gia nên tặng gì</strong> cho thật đẳng cấp và đáng nhớ.</p>

      <h3>📞 Liên hệ tư vấn & đặt quà tặng tân gia Decopro.vn:</h3>
      <ul>
        <li><strong>Showroom Hà Nội:</strong> Ngõ 234 Hoàng Quốc Việt, phường Nghĩa Đô, Quận Cầu Giấy, Hà Nội </li>
        <li><strong>Showroom Hồ Chí Minh:</strong> Số 268/12 đường Nguyễn Thái Bình, P12, Q. Tân Bình</li>
        <li><strong>Hotline:</strong> 0969 534 568 – 0898 434 568</li>
      </ul>
    `,
  },
  {
    id: 2,
    title: '40+ món quà tặng sếp nữ cao cấp ý nghĩa cho mọi dịp',
    excerpt: 'Việc chọn quà tặng sếp nữ không chỉ là cách thể hiện sự trân trọng mà còn là cơ hội để bạn ghi điểm với cấp trên của mình...',
    date: 'Tháng Tư-16-2025',
    comments: 0,
    category: 'TƯ VẤN QUÀ TẶNG',
  },
  {
    id: 3,
    title: '#1 Cửa hàng đồ decor tại Hà Nội, HCM – Decopro',
    excerpt: 'Decopro là địa chỉ uy tín chuyên cung cấp các sản phẩm trang trí nội thất và quà tặng cao cấp...',
    date: 'Tháng Mười Một-3-2025',
    comments: 0,
    category: 'TIN TỨC',
  },
];

const News = () => {
  return (
    <div className="container" style={{ padding: '30px 0' }}>
      <nav style={{ fontSize: 14, marginBottom: 20 }}>
        <Link to="/" style={{ color: '#1a5276', textDecoration: 'none' }}>Trang chủ</Link>
        <span style={{ margin: '0 8px', color: '#888' }}>›</span>
        <span style={{ color: '#333' }}>Tin tức</span>
      </nav>
      <div style={{ display: 'flex', gap: 30 }}>
        <Sidebar />
        <main style={{ flex: 1 }}>
          <h2 style={{ color: '#1a5276', borderBottom: '2px solid #e8e8e8', paddingBottom: 10 }}>
            TIN TỨC
          </h2>
          {posts.map((post) => (
            <article key={post.id} style={{ padding: '20px 0', borderBottom: '1px solid #e8e8e8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ background: '#1a5276', color: '#fff', padding: '2px 12px', borderRadius: 2, fontSize: 12 }}>
                  Tin tức
                </span>
                <span style={{ fontSize: 13, color: '#888' }}>{post.comments} comment</span>
                <span style={{ fontSize: 13, color: '#888' }}>{post.date}</span>
              </div>
              <h3 style={{ margin: '8px 0 6px', fontSize: 20 }}>
                <Link to={`/news/${post.id}`} style={{ color: '#1a5276', textDecoration: 'none' }}>
                  {post.title}
                </Link>
              </h3>
              <p style={{ color: '#555', lineHeight: 1.6, marginBottom: 10 }}>{post.excerpt}</p>
              <Link to={`/news/${post.id}`} style={{ display: 'inline-block', color: '#fff', background: '#1a5276', padding: '4px 18px', borderRadius: 3, textDecoration: 'none', fontSize: 13 }}>
                Xem thêm
              </Link>
            </article>
          ))}
        </main>
      </div>
    </div>
  );
};

export default News;