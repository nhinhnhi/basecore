import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/Authcontext';
import { Link } from 'react-router-dom';

const API_BASE = 'http://localhost:5001/api';

const Orders = () => {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get(`${API_BASE}/Orders`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const ordersData = Array.isArray(res.data) ? res.data : (res.data?.items || []);
                setOrders(ordersData);
            } catch (err) {
                console.error('Lỗi khi tải đơn hàng:', err);
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [token]);

    if (loading) {
        return <div className="text-center mt-5">Đang tải...</div>;
    }

    if (orders.length === 0) {
        return (
            <div className="container mt-5 text-center">
                <h3>Bạn chưa có đơn hàng nào</h3>
                <Link to="/shop" className="btn btn-primary mt-3">Mua sắm ngay</Link>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <h2>Lịch sử đơn hàng</h2>
            <div className="table-responsive">
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>Mã đơn hàng</th>
                            <th>Ngày đặt</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td>#{order.id}</td>
                                <td>{new Date(order.orderDate).toLocaleDateString('vi-VN')}</td>
                                <td>{order.total?.toLocaleString() || order.totalAmount?.toLocaleString()} VND</td>
                                <td>
                                    <span className={`badge bg-${order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'danger' : 'warning'}`}>
                                        {order.status === 'pending' ? 'Chờ xử lý' : 
                                         order.status === 'confirmed' ? 'Đã xác nhận' :
                                         order.status === 'shipped' ? 'Đang giao' :
                                         order.status === 'delivered' ? 'Đã giao' :
                                         order.status === 'cancelled' ? 'Đã hủy' : order.status}
                                    </span>
                                </td>
                                <td>
                                    <Link to={`/order/${order.id}`} className="btn btn-sm btn-outline-primary">Chi tiết</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Orders;