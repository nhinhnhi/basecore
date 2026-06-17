import React, { useState, useEffect } from 'react';
import { productApi, userApi, categoryApi, orderApi, brandApi, inventoryApi, couponApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
    const [stats, setStats] = useState({
        products: 0,
        categories: 0,
        users: 0,
        orders: 0,
        brands: 0,
        inventory: 0, 
        coupon: 0,
    });
    const [loading, setLoading] = useState(true);
    const { isAdmin } = useAuth();

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [productsRes, categoriesRes, ordersRes, brandRes, inventoryRes, couponRes] = await Promise.all([
                productApi.getAll(),
                categoryApi.getAll(),
                orderApi.getAll({ pageSize: 1 }),
                brandApi.getAll(),
                inventoryApi.getAll({pageSize: 1}),
                couponApi.getAll(),
            ]);

            let usersCount = 0;
            if (isAdmin) {
                try {
                    const usersRes = await userApi.getAll({ page: 1, pageSize: 1 });
                    usersCount = usersRes.data.totalCount || 0;
                } catch (e) {
                    console.log('Cannot fetch users count');
                }
            }

            const totalInventoryCount = inventoryRes.data?.totalCount || inventoryRes.data?.length || 0;

            const couponCount = couponRes.data?.totalCount || couponRes.data?.items?.length || couponRes.data?.length || 0;

            setStats({
                products: productsRes.data?.totalCount || productList.length || 0,
                categories: categoriesRes.data?.length || categoriesRes.data?.totalCount || 0,
                users: usersCount,
                orders: ordersRes.data?.totalCount || 0,
                brands: brandRes.data?.totalCount || brandRes.data?.length || 0, // Lấy luôn từ brandRes ở trên
                inventory: totalInventoryCount, // 2. Gán giá trị tính toán được vào state
                coupon: couponCount,
            });
            
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">Bảng điều khiển</h1>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="sr-only">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="row">
                            {/* Khối Sản Phẩm */}
                            <div className="col-lg-3 col-6 mb-3">
                                <div className="small-box bg-info">
                                    <div className="inner">
                                        <h3>{stats.products}</h3>
                                        <p>Sản phẩm</p>
                                    </div>
                                    <div className="icon"><i className="fas fa-box"></i></div>
                                    <a href="/products" className="small-box-footer">
                                        More info <i className="fas fa-arrow-circle-right"></i>
                                    </a>
                                </div>
                            </div>

                            {/* Khối Danh Mục */}
                            <div className="col-lg-3 col-6 mb-3">
                                <div className="small-box bg-success">
                                    <div className="inner">
                                        <h3>{stats.categories}</h3>
                                        <p>Danh mục</p>
                                    </div>
                                    <div className="icon"><i className="fas fa-tags"></i></div>
                                    <a href="/categories" className="small-box-footer">
                                        More info <i className="fas fa-arrow-circle-right"></i>
                                    </a>
                                </div>
                            </div>

                            {/* Khối Đơn Hàng */}
                            <div className="col-lg-3 col-6 mb-3">
                                <div className="small-box bg-danger">
                                    <div className="inner">
                                        <h3>{stats.orders}</h3>
                                        <p>Đơn hàng</p>
                                    </div>
                                    <div className="icon"><i className="fas fa-shopping-cart"></i></div>
                                    <a href="/orders" className="small-box-footer">
                                        More info <i className="fas fa-arrow-circle-right"></i>
                                    </a>
                                </div>
                            </div>

                            {/* Khối Khách Hàng (Admin) */}
                            {isAdmin && (
                                <div className="col-lg-3 col-6 mb-3">
                                    <div className="small-box bg-warning">
                                        <div className="inner">
                                            <h3>{stats.users}</h3>
                                            <p>Khách hàng</p>
                                        </div>
                                        <div className="icon"><i className="fas fa-users"></i></div>
                                        <a href="/users" className="small-box-footer">
                                            More info <i className="fas fa-arrow-circle-right"></i>
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Khối Thương Hiệu */}
                            <div className="col-lg-3 col-6 mb-3">
                                <div className="small-box bg-purple">
                                    <div className="inner">
                                        <h3>{stats.brands}</h3>
                                        <p>Thương hiệu</p>
                                    </div>
                                    <div className="icon"><i className="fas fa-trademark"></i></div>
                                    <a href="/brands" className="small-box-footer">
                                        More info <i className="fas fa-arrow-circle-right"></i>
                                    </a>
                                </div>
                            </div>

                            {/* Khối Tồn Kho - ĐÃ SỬA LỖI ĐỊNH DẠNG */}
                            <div className="col-lg-3 col-6 mb-3">
                                <div className="small-box bg-secondary"> {/* Đổi sang màu xám ngầu hơn hoặc giữ bg-danger tùy bạn */}
                                    <div className="inner">
                                        <h3>{stats.inventory}</h3> {/* Đã sửa từ inventorys thành inventory */}
                                        <p>Tồn kho</p>
                                    </div>
                                    <div className="icon"><i className="fas fa-warehouse"></i></div> {/* Thay bằng icon Nhà kho */}
                                    <a href="/inventory" className="small-box-footer"> {/* Đường dẫn chuẩn tới trang kho */}
                                        More info <i className="fas fa-arrow-circle-right"></i>
                                    </a>
                                </div>
                            </div>

                            <div className="col-lg-3 col-6 mb-3">
                                <div className="small-box bg-orange">
                                    <div className="inner">
                                        <h3>{stats.coupon}</h3>
                                        <p>Mã giảm giá</p>
                                    </div>
                                    <div className="icon"><i className="fas fa-ticket-alt"></i></div>
                                    <a href="/coupons" className="small-box-footer">
                                        More info <i className="fas fa-arrow-circle-right"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Khối Welcome Row */}
                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">Welcome to BaseCore Sales System</h3>
                                </div>
                                <div className="card-body">
                                    <p>This is a teaching framework for web development using:</p>
                                    <ul>
                                        <li><strong>Backend:</strong> .NET Core 8.0 with Entity Framework Core</li>
                                        <li><strong>Frontend:</strong> React 18 with React Router</li>
                                        <li><strong>UI:</strong> AdminLTE 3 with Bootstrap 4</li>
                                        <li><strong>Authentication:</strong> JWT Bearer Token</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;