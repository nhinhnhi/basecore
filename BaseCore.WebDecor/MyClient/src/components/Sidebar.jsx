// src/components/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../constants/categories';

const Sidebar = () => {
  return (
    <aside style={{ width: 250, flexShrink: 0 }}>
      <h4 style={{ 
        borderBottom: '2px solid #1a5276', 
        paddingBottom: 8, 
        marginBottom: 16,
        fontSize: 16,
        fontWeight: 700,
        color: '#1a5276'
      }}>
        DANH MỤC SẢN PHẨM
      </h4>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {CATEGORIES.map((cat) => (
          <li key={cat.id} style={{ padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
            <Link 
              to={`/shop?category=${encodeURIComponent(cat.label)}`} 
              style={{ 
                color: '#333', 
                textDecoration: 'none', 
                fontSize: 13.5,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#1a5276'}
              onMouseLeave={(e) => e.target.style.color = '#333'}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;