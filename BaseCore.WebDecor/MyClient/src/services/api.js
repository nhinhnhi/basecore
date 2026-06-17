// MyClient/src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authApi = {
    login: (username, password) => api.post('/auth/login', { username, password }),
    register: (data) => api.post('/auth/register', data),
};

// Product API
export const productApi = {
    getAll: (params) => api.get('/products', { params }),
    getById: (id) => api.get(`/products/${id}`),
};

// Category API
export const categoryApi = {
    getAll: () => api.get('/categories'),
};

// Order API
export const orderApi = {
    create: (data) => api.post('/orders', data),
    getMyOrders: () => api.get('/orders'),
    getById: (id) => api.get(`/orders/${id}`),
    updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
};

// Coupon API
export const couponApi = {
    // Lấy danh sách coupon đang hoạt động (cho banner)
    getActiveCoupons: () => api.get('/coupons/available'),
    
    // Lấy coupon của người dùng đã lưu
    getMyCoupons: () => api.get('/coupons/my-coupons'),
    
    // Lưu coupon vào tài khoản
    save: (couponId) => api.post('/coupons/save', { couponId }),
    
    // Validate coupon khi checkout
    validateCoupon: (code, orderAmount) => api.post('/coupons/validate', { code, orderAmount }),
    
    // Nhận voucher chào mừng khi đăng ký
    getWelcomeCoupon: () => api.post('/coupons/welcome-coupon', {}),
};

export default api;