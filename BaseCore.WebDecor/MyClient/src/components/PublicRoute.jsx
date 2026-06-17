import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/Authcontext';

const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="text-center mt-5">Loading...</div>;
    }

    if (isAuthenticated) {
        // Nếu đã đăng nhập, chuyển về trang chủ
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PublicRoute;