// src/pages/ServiceDetail.jsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { servicePosts } from './Services';

const ServiceDetail = () => {
  const { id } = useParams();
  const post = servicePosts.find(p => p.id === parseInt(id));

  if (!post) {
    return (
      <div className="container" style={{ padding: '30px 0' }}>
        <h2>Bài viết không tồn tại</h2>
        <Link to="/services">Quay lại danh sách</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '30px 0' }}>
      <nav style={{ fontSize: 14, marginBottom: 20 }}>
        <Link to="/" style={{ color: '#1a5276', textDecoration: 'none' }}>Trang chủ</Link>
        <span style={{ margin: '0 8px', color: '#888' }}>›</span>
        <Link to="/services" style={{ color: '#1a5276', textDecoration: 'none' }}>Dịch vụ</Link>
        <span style={{ margin: '0 8px', color: '#888' }}>›</span>
        <span style={{ color: '#333' }}>{post.title}</span>
      </nav>

      <div style={{ display: 'flex', gap: 30 }}>
        <Sidebar />
        <main style={{ flex: 1 }}>
          <h2 style={{ color: '#1a5276', borderBottom: '2px solid #e8e8e8', paddingBottom: 10 }}>
            {post.title}
          </h2>

          <div style={{ display: 'flex', gap: 20, fontSize: 14, color: '#888', margin: '10px 0 20px' }}>
            <span><strong>Tác giả:</strong> {post.author || 'Admin'}</span>
            <span><strong>Ngày cập nhật:</strong> {post.date}</span>
          </div>

          {post.image && (
            <img src={post.image} alt={post.title} style={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 6, marginBottom: 20 }} />
          )}

          <div dangerouslySetInnerHTML={{ __html: post.content }} style={{ lineHeight: 1.8, fontSize: 16 }} />

          <Link to="/services" style={{ display: 'inline-block', marginTop: 20, color: '#1a5276', textDecoration: 'none' }}>
            ← Quay lại danh sách
          </Link>
        </main>
      </div>
    </div>
  );
};

export default ServiceDetail;