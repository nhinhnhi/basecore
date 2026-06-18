// src/constants/categories.js
export const CATEGORIES = [
  { label: 'ĐỒ TRANG TRÍ NỘI THẤT', icon: '🏠', id: 'noi-that' },
  { label: 'ĐỒ DECOR TRANG TRÍ PHÒNG', icon: '🪴', id: 'decor-phong' },
  { label: 'QUÀ TẶNG TÂN GIA CAO CẤP', icon: '🎁', id: 'tan-gia' },
  { label: 'QUÀ TẶNG KHAI TRƯƠNG', icon: '🎊', id: 'khai-truong' },
  { label: 'QUÀ TẶNG SINH NHẬT', icon: '🎂', id: 'sinh-nhat' },
  { label: 'QUÀ TẶNG SẾP CAO CẤP', icon: '⭐', id: 'sep' },
  { label: 'QUÀ TẶNG ĐỐI TÁC D.NGHIỆP', icon: '🤝', id: 'doi-tac' },
  { label: 'QUÀ CƯỚI – KỶ NIỆM NGÀY CƯỚI', icon: '💍', id: 'cuoi' },
];

// Nếu muốn dùng mảng string đơn giản hơn:
export const CATEGORY_LABELS = CATEGORIES.map(cat => cat.label);