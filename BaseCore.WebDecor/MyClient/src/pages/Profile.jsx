import React from 'react';
import { useAuth } from '../contexts/Authcontext';

const Profile = () => {
    const { user } = useAuth();

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-md-6 mx-auto">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="mb-0">Thông tin tài khoản</h4>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <label className="form-label fw-bold">Họ tên</label>
                                <p className="form-control-plaintext">{user?.fullName || user?.userName || 'Chưa cập nhật'}</p>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Email</label>
                                <p className="form-control-plaintext">{user?.email || 'Chưa cập nhật'}</p>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Số điện thoại</label>
                                <p className="form-control-plaintext">{user?.phone || 'Chưa cập nhật'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;