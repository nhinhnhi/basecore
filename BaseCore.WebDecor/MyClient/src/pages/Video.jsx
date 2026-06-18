import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const videoTabs = [
  'Tất cả',
  'Bình gốm chu đậu',
  'Bình gốm bát tràng',
  'Bình gốm nhập khẩu',
  'Tượng decor trang trí',
  'Kệ rượu vang decor',
  'Bộ ấm trà',
];

const videoData = [
  {
    id: 1,
    title: 'Quà tặng: Bình Hút Tài Lộc Bát Mã Gố...',
    videoId: '6vFV4zB6FCc',
    date: '7/1/2026',
    views: 437,
    likes: 0,
    category: 'Bình gốm chu đậu',
  },
  // Thêm các video khác ở đây
];

const Video = () => {
  const [activeTab, setActiveTab] = useState('Tất cả');
  const filteredVideos = activeTab === 'Tất cả' ? videoData : videoData.filter(v => v.category === activeTab);

  return (
    <div className="container" style={{ padding: '30px 0' }}>
      <nav style={{ fontSize: 14, marginBottom: 20 }}>
        <Link to="/" style={{ color: '#1a5276', textDecoration: 'none' }}>Trang chủ</Link>
        <span style={{ margin: '0 8px', color: '#888' }}>›</span>
        <span style={{ color: '#333' }}>Video review</span>
      </nav>

      <div style={{ display: 'flex', gap: 30 }}>
        <Sidebar />
        <main style={{ flex: 1 }}>
          <h2 style={{ color: '#1a5276', borderBottom: '2px solid #e8e8e8', paddingBottom: 10 }}>
            VIDEO REVIEW
          </h2>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '16px 0' }}>
            {videoTabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '6px 18px',
                  border: '1px solid #1a5276',
                  borderRadius: 20,
                  background: activeTab === tab ? '#1a5276' : 'transparent',
                  color: activeTab === tab ? '#fff' : '#1a5276',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: 13,
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {filteredVideos.map(video => (
              <div
                key={video.id}
                style={{
                  border: '1px solid #e8e8e8',
                  borderRadius: 6,
                  overflow: 'hidden',
                  background: '#fff',
                }}
              >
                {/* Video iframe thay vì ảnh */}
                <div style={{ aspectRatio: '16/9', background: '#000' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${video.videoId}`}
                    title={video.title}
                    frameBorder="0"
                    allowFullScreen
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>

                <div style={{ padding: '12px' }}>
                  <h4 style={{ fontSize: 14, margin: '0 0 4px', fontWeight: 600, color: '#1a5276' }}>
                    {video.title}
                  </h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888' }}>
                    <span>{video.date}</span>
                    <span>{video.views} Views • {video.likes} Likes</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredVideos.length === 0 && (
            <p style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
              Không có video nào trong danh mục này.
            </p>
          )}
        </main>
      </div>
    </div>
  );
};

export default Video;