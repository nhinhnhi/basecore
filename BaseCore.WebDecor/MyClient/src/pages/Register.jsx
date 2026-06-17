// MyClient/src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi, couponApi } from '../services/api';

const Register = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        userName: '',
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (form.password !== form.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }
        
        if (form.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }
        
        setError('');
        setLoading(true);
        
        try {
            // 1. Đăng ký tài khoản
            await authApi.register({
                userName: form.userName,
                fullName: form.fullName,
                email: form.email,
                phone: form.phone,
                password: form.password
            });
            
            // 2. Đăng nhập tự động sau khi đăng ký
            const loginRes = await authApi.login(form.userName, form.password);
            const token = loginRes.data.token;
            const userData = loginRes.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            
            // 3. Nhận voucher chào mừng (nếu có)
            let voucherMessage = '';
            try {
                const couponRes = await couponApi.getWelcomeCoupon();
                voucherMessage = couponRes.data?.message || ' Bạn đã nhận được voucher 50.000đ!';
            } catch (couponErr) {
                console.log('Không thể nhận voucher welcome:', couponErr.response?.data);
                // Không sao, vẫn đăng ký thành công
            }
            
            alert(`🎉 Đăng ký thành công!${voucherMessage}\nChào mừng bạn đến với Minimal Decor.`);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow-sm border-0 rounded-3">
                        <div className="card-header bg-primary text-white rounded-top-3">
                            <h5 className="mb-0">📝 Đăng ký tài khoản</h5>
                        </div>
                        <div className="card-body">
                            {error && <div className="alert alert-danger">{error}</div>}
                            
                            {/* Banner thông báo nhận voucher */}
                            <div className="alert alert-success bg-light border-success mb-4" style={{ fontSize: '13px' }}>
                                <div className="d-flex align-items-center">
                                    <i className="fas fa-gift text-success fs-4 me-3"></i>
                                    <div>
                                        <strong>🎁 Ưu đãi đặc biệt!</strong>
                                        <p className="mb-0 small">Đăng ký ngay hôm nay nhận ngay voucher 50.000đ cho đơn hàng đầu tiên.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Tên đăng nhập *</label>
                                    <input 
                                        name="userName" 
                                        type="text"
                                        className="form-control" 
                                        value={form.userName} 
                                        onChange={handleChange} 
                                        required 
                                        placeholder="VD: nguyenvana"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Họ tên *</label>
                                    <input 
                                        name="fullName" 
                                        type="text"
                                        className="form-control" 
                                        value={form.fullName} 
                                        onChange={handleChange} 
                                        required 
                                        placeholder="Nguyễn Văn A"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Email *</label>
                                    <input 
                                        name="email" 
                                        type="email" 
                                        className="form-control" 
                                        value={form.email} 
                                        onChange={handleChange} 
                                        required 
                                        placeholder="example@email.com"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Số điện thoại</label>
                                    <input 
                                        name="phone" 
                                        type="tel"
                                        className="form-control" 
                                        value={form.phone} 
                                        onChange={handleChange} 
                                        placeholder="0912 345 678"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Mật khẩu *</label>
                                    <input 
                                        name="password" 
                                        type="password" 
                                        className="form-control" 
                                        value={form.password} 
                                        onChange={handleChange} 
                                        required 
                                        placeholder="Ít nhất 6 ký tự"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Xác nhận mật khẩu *</label>
                                    <input 
                                        name="confirmPassword" 
                                        type="password" 
                                        className="form-control" 
                                        value={form.confirmPassword} 
                                        onChange={handleChange} 
                                        required 
                                        placeholder="Nhập lại mật khẩu"
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary w-100 py-2" 
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        'Đăng ký ngay'
                                    )}
                                </button>
                            </form>
                            <p className="mt-3 text-center">
                                Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;