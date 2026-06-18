import React from 'react';
import { Link } from 'react-router-dom'; // thêm dòng này
import Sidebar from '../components/Sidebar';

const About = () => {
  return (
    <div className="container" style={{ padding: '30px 0' }}>
      <nav style={{ fontSize: 14, marginBottom: 20 }}>
        <Link to="/" style={{ color: '#1a5276', textDecoration: 'none' }}>Trang chủ</Link>
        <span style={{ margin: '0 8px', color: '#888' }}>›</span>
        <span style={{ color: '#333' }}>Giới thiệu</span>
      </nav>
      <div style={{ display: 'flex', gap: 30 }}>
        <Sidebar />
        <main style={{ flex: 1 }}>
          <h2 style={{ color: '#1a5276', borderBottom: '2px solid #e8e8e8', paddingBottom: 10 }}>
            VỀ CHÚNG TÔI
          </h2>
          <h3>ĐỒ TRANG TRÍ NHÀ & QUÀ TẶNG DECOPRO</h3>
          <h4>XIN CHÀO QUÝ KHÁCH HÀNG</h4>
          <p>Lời đầu tiên, Công ty TNHH KD TM DECOPRO xin chân thành cảm ơn Quý Khách Hàng đã dành thời gian tìm hiểu về các sản phẩm <strong>đồ trang trí nhà</strong> cũng như chính sách bảo hành, vận chuyển và các chương trình ưu đãi của chúng tôi!</p>
          <p>Thương hiệu Decopro là đơn vị bán đồ decor, qua từng được thành lập năm 2018, chuyên cung cấp các sản phẩm trang trí nội thất, quà tặng lưu niệm và đồ thờ tâm linh cao cấp. Lấy chất lượng và sự hài lòng của khách hàng làm trọng tâm, chúng tôi luôn nỗ lực mang tới những sản phẩm độc đáo, sáng tạo và dịch vụ tư vấn tận tâm.</p>
          <p>Với mong muốn trở thành thương hiệu dẫn đầu trong lĩnh vực trang trí nội thất và quà tặng lưu niệm tại Việt Nam, Decopro không ngừng cải tiến sản phẩm và dịch vụ, mở rộng thị trường và nâng cao chất lượng đội ngũ nhân viên để đáp ứng tốt hơn nhu cầu ngày càng cao của khách hàng. Chúng tôi cam kết mang lại giá trị đích thực cho không gian sống và làm việc của bạn.</p>
          <div style={{ marginTop: 20 }}>
            <p><strong>HÀ NỘI:</strong> Số 24 ngõ 234 Hoàng Quốc Việt, Q.Nghĩa Đô</p>
            <p><strong>Hotline:</strong> 0969.534.568</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default About;