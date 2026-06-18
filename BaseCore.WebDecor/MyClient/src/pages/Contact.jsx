import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const Contact = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    file: null,
  });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setForm({ ...form, file: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form data:', form);
    setSent(true);
    setForm({ name: '', email: '', subject: '', message: '', file: null });
    document.getElementById('fileInput').value = '';
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="container" style={{ padding: '30px 0' }}>
      {/* Breadcrumb */}
      <nav style={{ fontSize: 14, marginBottom: 20 }}>
        <Link to="/" style={{ color: '#1a5276', textDecoration: 'none' }}>Trang chủ</Link>
        <span style={{ margin: '0 8px', color: '#888' }}>›</span>
        <span style={{ color: '#333' }}>Liên hệ</span>
      </nav>

      <div style={{ display: 'flex', gap: 30 }}>
        {/* Sidebar dùng chung */}
        <Sidebar />

        {/* Nội dung chính: Form liên hệ và thông tin công ty */}
        <main style={{ flex: 1 }}>
          <h2 style={{ color: '#1a5276', borderBottom: '2px solid #e8e8e8', paddingBottom: 10, marginBottom: 20 }}>
            LIÊN HỆ
          </h2>

          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
            {/* Form liên hệ */}
            <div style={{ flex: '1 1 300px' }}>
              {sent && (
                <div style={{ background: '#d4edda', color: '#155724', padding: 12, borderRadius: 4, marginBottom: 16 }}>
                  Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 14 }}>
                    Tên của bạn <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 4 }}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 14 }}>
                    Email <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 4 }}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 14 }}>
                    Tiêu đề
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 4 }}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 14 }}>
                    Nội dung
                  </label>
                  <textarea
                    name="message"
                    rows="4"
                    value={form.message}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 4 }}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 14 }}>
                    Tải ảnh
                  </label>
                  <input
                    type="file"
                    id="fileInput"
                    name="file"
                    onChange={handleChange}
                    style={{ display: 'block' }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    background: '#1a5276',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 30px',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 15,
                  }}
                >
                  Gửi
                </button>
              </form>
            </div>

            {/* Thông tin công ty */}
            <div style={{ flex: '1 1 300px' }}>
              <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: 6, border: '1px solid #e8e8e8' }}>
                <h5 style={{ color: '#1a5276', marginBottom: 16, borderBottom: '2px solid #1a5276', paddingBottom: 8 }}>
                  THÔNG TIN VỀ CHÚNG TÔI
                </h5>
                <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
                  <i className="fas fa-building" style={{ color: '#1a5276', width: 20 }}></i>
                  <span><strong>CÔNG TY TNHH KD THƯƠNG MẠI DECOPRO</strong></span>
                </div>
                <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
                  <i className="fas fa-store" style={{ color: '#1a5276', width: 20 }}></i>
                  <span>Showroom: Ngõ 234 Hoàng Quốc Việt, phường Nghĩa Đô, Quận Cầu Giấy, Hà Nội</span>
                </div>
                <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
                  <i className="fas fa-phone" style={{ color: '#1a5276', width: 20 }}></i>
                  <span>Điện thoại: 0898.434.568 – 0969.534.568</span>
                </div>
                <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
                  <i className="fas fa-headset" style={{ color: '#1a5276', width: 20 }}></i>
                  <span>Tư vấn miễn phí: 0969 534 568</span>
                </div>
                <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
                  <i className="fas fa-envelope" style={{ color: '#1a5276', width: 20 }}></i>
                  <span>Email: Decopro.vn@gmail.com</span>
                </div>
                <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
                  <i className="fas fa-globe" style={{ color: '#1a5276', width: 20 }}></i>
                  <span>Website: www.Decopro.vn</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <i className="fab fa-facebook" style={{ color: '#1a5276', width: 20 }}></i>
                  <span>Fanpage: www.facebook.com/Decopro.vn</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Contact;