import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/Authcontext';
import { useCart } from '../contexts/Cartcontext';
import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

// ─── QR Code generator (không cần thư viện) ───
// Dùng QR Server API (miễn phí, không cần key)
const QRCode = ({ value, size = 160 }) => {
    const encoded = encodeURIComponent(value);
    return (
        <img
            src={`https://api.qrserver.com/v1/create-qr-code/?data=${encoded}&size=${size}x${size}&margin=8`}
            alt="QR Code"
            style={{ width: size, height: size, borderRadius: 8, border: '1px solid #e0e0e0' }}
        />
    );
};

// ─── Steps indicator ───
const Steps = ({ current }) => {
    const steps = ['Địa chỉ', 'Vận chuyển', 'Thanh toán'];
    return (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:0, marginBottom:24 }}>
            {steps.map((s, i) => {
                const done = i < current, active = i === current;
                return (
                    <React.Fragment key={i}>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                            <div style={{
                                width:32, height:32, borderRadius:'50%', display:'flex',
                                alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14,
                                background: done ? '#27ae60' : active ? '#f5371e' : '#e0e0e0',
                                color: done || active ? '#fff' : '#999', flexShrink:0
                            }}>{done ? '✓' : i+1}</div>
                            <span style={{ fontSize:12, color: active ? '#f5371e' : done ? '#27ae60' : '#999', fontWeight: active ? 700 : 400 }}>{s}</span>
                        </div>
                        {i < steps.length - 1 && (
                            <div style={{ width:60, height:2, background: i < current ? '#27ae60' : '#e0e0e0', margin:'0 4px', marginBottom:20, flexShrink:0 }} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

const PAYMENT_METHODS = [
    { id:'cod',     icon:'💵', label:'Tiền mặt khi nhận hàng', sub:'Thanh toán khi nhận được hàng' },
    { id:'bank',    icon:'🏦', label:'Chuyển khoản ngân hàng',  sub:'Chuyển khoản trước khi giao' },
    { id:'momo',    icon:'💜', label:'Ví MoMo',                 sub:'Thanh toán qua ví điện tử MoMo' },
    { id:'vnpay',   icon:'💳', label:'VNPay',                   sub:'Thẻ ATM / Visa / QR Code' },
    { id:'zalopay', icon:'🔵', label:'ZaloPay',                 sub:'Thanh toán qua ví ZaloPay' },
];

// Tỉnh/thành phố nội thành được giao nhanh/trong ngày
const INNER_CITY_PROVINCES = ['Hà Nội', 'Hồ Chí Minh', 'Thành phố Hà Nội', 'Thành phố Hồ Chí Minh'];

const getShippingOptions = (shippingAddress = '') => {
    const addr = shippingAddress.toLowerCase();
    const isInnerCity = INNER_CITY_PROVINCES.some(p => addr.includes(p.toLowerCase()));
    return [
        {
            id:'standard',
            name:'Giao hàng tiêu chuẩn',
            sub:'Dự kiến 3–5 ngày làm việc • Toàn quốc',
            fee:0,
            feeLabel:'Miễn phí',
            available: true,
            note: null
        },
        {
            id:'express',
            name:'Giao hàng nhanh',
            sub: isInnerCity ? 'Dự kiến 1–2 ngày • Nội thành HN & HCM' : 'Chỉ áp dụng nội thành Hà Nội & TP.HCM',
            fee: isInnerCity ? 30000 : 0,
            feeLabel: isInnerCity ? '30.000₫' : 'Không khả dụng',
            available: isInnerCity,
            note: isInnerCity ? null : 'Địa chỉ của bạn không thuộc khu vực giao nhanh'
        },
        {
            id:'same',
            name:'Giao trong ngày',
            sub: isInnerCity ? 'Đặt trước 14:00 • Nội thành HN & HCM' : 'Chỉ áp dụng nội thành Hà Nội & TP.HCM',
            fee: isInnerCity ? 50000 : 0,
            feeLabel: isInnerCity ? '50.000₫' : 'Không khả dụng',
            available: isInnerCity,
            note: isInnerCity ? null : 'Địa chỉ của bạn không thuộc khu vực giao trong ngày'
        },
    ];
};

// ─── Address Selector Component ───
const AddressSelector = ({ value, onChange, onValidChange }) => {
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards]         = useState([]);
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedWard, setSelectedWard]         = useState('');
    const [streetAddress, setStreetAddress]       = useState('');
    const [loading, setLoading] = useState(true);
    const [touched, setTouched] = useState({ street:false, province:false, district:false, ward:false });

    useEffect(() => {
        fetch('/vn_address_data.json')
            .then(r => r.json())
            .then(data => { setProvinces(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    // Khi province thay đổi
    const handleProvince = (e) => {
        const pid = e.target.value;
        setSelectedProvince(pid);
        setSelectedDistrict('');
        setSelectedWard('');
        setWards([]);
        setTouched(t => ({...t, province:true}));
        const prov = provinces.find(p => p.id === pid);
        setDistricts(prov ? prov.districts : []);
        buildAddress(streetAddress, '', '', pid, provinces);
    };

    // Khi district thay đổi
    const handleDistrict = (e) => {
        const did = e.target.value;
        setSelectedDistrict(did);
        setSelectedWard('');
        setTouched(t => ({...t, district:true}));
        const dist = districts.find(d => d.id === did);
        setWards(dist ? dist.wards : []);
        buildAddress(streetAddress, did, '', selectedProvince, provinces, districts);
    };

    // Khi ward thay đổi
    const handleWard = (e) => {
        const wid = e.target.value;
        setSelectedWard(wid);
        setTouched(t => ({...t, ward:true}));
        buildAddress(streetAddress, selectedDistrict, wid, selectedProvince, provinces, districts, wards);
    };

    // Khi số nhà / tên đường thay đổi
    const handleStreet = (e) => {
        const val = e.target.value;
        setStreetAddress(val);
        setTouched(t => ({...t, street:true}));
        buildAddress(val, selectedDistrict, selectedWard, selectedProvince, provinces, districts, wards);
    };

    const buildAddress = (street, did, wid, pid, provs, dists = districts, wds = wards) => {
        const parts = [];
        if (street.trim()) parts.push(street.trim());
        const ward = wds.find(w => w.id === wid);
        if (ward) parts.push(ward.name);
        const dist = (dists || []).find(d => d.id === did);
        if (dist) parts.push(dist.name);
        const prov = (provs || []).find(p => p.id === pid);
        if (prov) parts.push(prov.name);
        const fullAddr = parts.join(', ');
        onChange(fullAddr);
        // Báo cho parent biết địa chỉ đã đủ chưa
        const isComplete = !!street.trim() && !!pid && !!did && !!wid;
        if (onValidChange) onValidChange(isComplete);
    };

    if (loading) return <div style={{ color:'#999', fontSize:13, padding:'12px 0' }}>Đang tải dữ liệu địa chỉ...</div>;

    const err = (field) => ({
        street:   touched.street   && !streetAddress.trim(),
        province: touched.province && !selectedProvince,
        district: touched.district && !selectedDistrict,
        ward:     touched.ward     && !selectedWard,
    })[field];

    const selStyle = (hasErr) => ({
        border:`1px solid ${hasErr ? '#e74c3c' : '#e0e0e0'}`, borderRadius:8, padding:'11px 14px',
        fontSize:14, outline:'none', background:'#fff', width:'100%',
        cursor:'pointer', appearance:'none', WebkitAppearance:'none',
        backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23999' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat:'no-repeat', backgroundPosition:'right 12px center',
        paddingRight:36, transition:'border .15s'
    });

    const isComplete = !!streetAddress.trim() && !!selectedProvince && !!selectedDistrict && !!selectedWard;

    return (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {/* Số nhà, tên đường */}
            <div className="ck-field" style={{ marginBottom:0 }}>
                <label>Số nhà, tên đường <em style={{ color:'#f5371e', fontStyle:'normal' }}>*</em></label>
                <input
                    placeholder="VD: Số 24, ngõ 234 Hoàng Quốc Việt"
                    value={streetAddress}
                    onChange={handleStreet}
                    onBlur={() => setTouched(t => ({...t, street:true}))}
                    style={{ border:`1px solid ${err('street') ? '#e74c3c' : '#e0e0e0'}`, borderRadius:8, padding:'11px 14px', fontSize:14, outline:'none', width:'100%', transition:'border .15s' }}
                    onFocus={e => e.target.style.borderColor='#f5371e'}
                />
                {err('street') && <span style={{ fontSize:11, color:'#e74c3c' }}>⚠ Vui lòng nhập số nhà, tên đường</span>}
            </div>

            {/* Tỉnh / Thành phố */}
            <div className="ck-field" style={{ marginBottom:0 }}>
                <label>Tỉnh / Thành phố <em style={{ color:'#f5371e', fontStyle:'normal' }}>*</em></label>
                <select value={selectedProvince} onChange={handleProvince}
                    onBlur={() => setTouched(t => ({...t, province:true}))}
                    style={selStyle(err('province'))}>
                    <option value="">-- Chọn tỉnh/thành phố --</option>
                    {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {err('province') && <span style={{ fontSize:11, color:'#e74c3c' }}>⚠ Vui lòng chọn tỉnh/thành phố</span>}
            </div>

            {/* Quận / Huyện */}
            <div className="ck-field" style={{ marginBottom:0 }}>
                <label>Quận / Huyện <em style={{ color:'#f5371e', fontStyle:'normal' }}>*</em></label>
                <select value={selectedDistrict} onChange={handleDistrict}
                    onBlur={() => setTouched(t => ({...t, district:true}))}
                    style={{ ...selStyle(err('district')), opacity: districts.length ? 1 : 0.5 }}
                    disabled={!districts.length}>
                    <option value="">-- Chọn quận/huyện --</option>
                    {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                {err('district') && <span style={{ fontSize:11, color:'#e74c3c' }}>⚠ Vui lòng chọn quận/huyện</span>}
            </div>

            {/* Phường / Xã */}
            <div className="ck-field" style={{ marginBottom:0 }}>
                <label>Phường / Xã <em style={{ color:'#f5371e', fontStyle:'normal' }}>*</em></label>
                <select value={selectedWard} onChange={handleWard}
                    onBlur={() => setTouched(t => ({...t, ward:true}))}
                    style={{ ...selStyle(err('ward')), opacity: wards.length ? 1 : 0.5 }}
                    disabled={!wards.length}>
                    <option value="">-- Chọn phường/xã --</option>
                    {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
                {err('ward') && <span style={{ fontSize:11, color:'#e74c3c' }}>⚠ Vui lòng chọn phường/xã</span>}
            </div>

            {/* Progress indicator */}
            {selectedProvince && (
                <div style={{ display:'flex', gap:6, alignItems:'center', fontSize:12 }}>
                    {['Tỉnh/TP','Quận/Huyện','Phường/Xã','Số nhà'].map((label, i) => {
                        const done = [!!selectedProvince, !!selectedDistrict, !!selectedWard, !!streetAddress.trim()][i];
                        return <span key={i} style={{ display:'flex', alignItems:'center', gap:3, color: done ? '#27ae60' : '#ccc' }}>
                            <span style={{ fontSize:14 }}>{done ? '✓' : '○'}</span> {label}
                            {i < 3 && <span style={{ color:'#e0e0e0', margin:'0 2px' }}>›</span>}
                        </span>;
                    })}
                </div>
            )}

            {/* Preview địa chỉ đầy đủ */}
            {isComplete && (
                <div style={{ background:'#f8fff8', border:'1px solid #a9dfbf', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#27ae60' }}>
                    📍 <strong>Địa chỉ đầy đủ:</strong> {value}
                </div>
            )}
        </div>
    );
};

// ─── Coupon Section ───
const CouponSection = ({ subtotal, couponApplied, setCouponApplied, token }) => {
    const [code, setCode]               = useState('');
    const [loading, setLoading]         = useState(false);
    const [error, setError]             = useState('');
    const [myCoupons, setMyCoupons]     = useState([]);
    const [showList, setShowList]       = useState(false);
    const [loadingList, setLoadingList] = useState(false);
    const listRef = useRef(null);

    // Close dropdown khi click ngoài
    useEffect(() => {
        const handler = (e) => {
            if (listRef.current && !listRef.current.contains(e.target)) setShowList(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const loadMyCoupons = async () => {
        if (myCoupons.length > 0) { setShowList(s => !s); return; }
        setLoadingList(true);
        try {
            const tk = token || localStorage.getItem('token');
            const res = await axios.get(`${API_BASE}/Coupons/my-coupons`, {
                headers: { Authorization: `Bearer ${tk}` }
            });
            setMyCoupons(res.data || []);
            setShowList(true);
        } catch { setMyCoupons([]); setShowList(true); }
        finally { setLoadingList(false); }
    };

    const validateCoupon = async (couponCode) => {
        setLoading(true); setError('');
        try {
            const tk = token || localStorage.getItem('token');
            const res = await axios.post(`${API_BASE}/Coupons/validate`, {
                code: couponCode, orderAmount: subtotal
            }, { headers: { Authorization: `Bearer ${tk}` } });
            if (res.data.isValid) {
                setCouponApplied({
                    id: res.data.coupon.id,
                    code: res.data.coupon.code,
                    discount: res.data.discountAmount,
                    discountType: res.data.coupon.discountType,
                    discountValue: res.data.coupon.discountValue
                });
                setShowList(false);
                setError('');
            } else {
                setError('Mã giảm giá không hợp lệ');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn');
        } finally { setLoading(false); }
    };

    const applyFromInput = () => { if (code.trim()) validateCoupon(code.trim()); };
    const applyFromList  = (uc) => { setCode(uc.coupon.code); validateCoupon(uc.coupon.code); };
    const remove = () => { setCouponApplied(null); setCode(''); setError(''); };

    return (
        <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid #f5f5f5' }}>
            <div style={{ fontWeight:700, fontSize:13, marginBottom:10, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span>🏷 Mã giảm giá</span>
                {!couponApplied && (
                    <div style={{ position:'relative' }} ref={listRef}>
                        <button onClick={loadMyCoupons} style={{
                            background:'none', border:'1px solid #f5371e', color:'#f5371e',
                            fontSize:12, cursor:'pointer', borderRadius:20, padding:'4px 12px',
                            fontWeight:700, display:'flex', alignItems:'center', gap:5
                        }}>
                            {loadingList ? '...' : `🎫 Voucher của tôi`}
                        </button>

                        {/* Dropdown danh sách voucher */}
                        {showList && (
                            <div style={{
                                position:'absolute', right:0, top:'calc(100% + 6px)', zIndex:200,
                                background:'#fff', border:'1px solid #e0e0e0', borderRadius:10,
                                boxShadow:'0 8px 24px rgba(0,0,0,.12)', minWidth:280, maxHeight:300,
                                overflowY:'auto'
                            }}>
                                <div style={{ padding:'10px 14px', fontWeight:700, fontSize:12, color:'#999', borderBottom:'1px solid #f0f0f0', background:'#fafafa', borderRadius:'10px 10px 0 0' }}>
                                    VOUCHER CỦA BẠN
                                </div>
                                {myCoupons.length === 0 ? (
                                    <div style={{ padding:'20px 14px', textAlign:'center', color:'#999', fontSize:13 }}>Bạn chưa có voucher nào</div>
                                ) : myCoupons.map(uc => (
                                    <div key={uc.id} onClick={() => applyFromList(uc)} style={{
                                        padding:'12px 14px', borderBottom:'1px solid #f5f5f5',
                                        cursor:'pointer', display:'flex', alignItems:'center', gap:10,
                                        transition:'background .15s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background='#fff8f7'}
                                    onMouseLeave={e => e.currentTarget.style.background='#fff'}>
                                        <div style={{ background:'#fff0ee', borderRadius:6, padding:'6px 10px', textAlign:'center', minWidth:70 }}>
                                            <div style={{ fontFamily:'monospace', fontWeight:700, fontSize:13, color:'#f5371e' }}>{uc.coupon.code}</div>
                                        </div>
                                        <div style={{ flex:1 }}>
                                            <div style={{ fontSize:13, fontWeight:700, color:'#333' }}>
                                                {uc.coupon.discountType === 'percentage'
                                                    ? `Giảm ${uc.coupon.discountValue}%`
                                                    : `Giảm ${uc.coupon.discountValue.toLocaleString('vi-VN')}₫`}
                                            </div>
                                            {uc.coupon.minOrderValue > 0 && (
                                                <div style={{ fontSize:11, color:'#999' }}>Đơn tối thiểu {uc.coupon.minOrderValue.toLocaleString('vi-VN')}₫</div>
                                            )}
                                        </div>
                                        <span style={{ fontSize:11, color:'#f5371e', fontWeight:700, background:'#fff0ee', padding:'3px 8px', borderRadius:4 }}>Dùng</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {couponApplied ? (
                <div style={{ background:'#eafaf1', border:'1px solid #a9dfbf', borderRadius:8, padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:13, color:'#27ae60', fontWeight:700 }}>
                    <span>✓ <strong>{couponApplied.code}</strong> — Giảm {couponApplied.discount.toLocaleString('vi-VN')}₫</span>
                    <button onClick={remove} style={{ background:'none', border:'none', color:'#e74c3c', cursor:'pointer', fontSize:20, lineHeight:1, padding:'0 4px' }}>×</button>
                </div>
            ) : (
                <>
                <div style={{ display:'flex', gap:8 }}>
                    <input
                        placeholder="Nhập mã giảm giá..."
                        value={code}
                        onChange={e => setCode(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key === 'Enter' && applyFromInput()}
                        style={{ flex:1, border:'1px solid #e0e0e0', borderRadius:8, padding:'10px 14px', fontSize:14, outline:'none', textTransform:'uppercase' }}
                        onFocus={e => e.target.style.borderColor='#f5371e'}
                        onBlur={e => e.target.style.borderColor='#e0e0e0'}
                    />
                    <button onClick={applyFromInput} disabled={loading || !code.trim()} style={{
                        background:'#f5371e', color:'#fff', border:'none', borderRadius:8,
                        padding:'10px 18px', fontSize:14, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap',
                        opacity: (loading || !code.trim()) ? 0.6 : 1
                    }}>
                        {loading ? '...' : 'Áp dụng'}
                    </button>
                </div>
                {error && <div style={{ fontSize:12, color:'#e74c3c', marginTop:6 }}>⚠ {error}</div>}
                </>
            )}
        </div>
    );
};

// ─── Copy button helper ───
const CopyBtn = ({ value }) => {
    const [copied, setCopied] = React.useState(false);
    const handle = () => {
        navigator.clipboard?.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };
    return (
        <button onClick={handle} style={{
            background: copied ? '#27ae60' : 'none',
            border: `1px solid ${copied ? '#27ae60' : '#e0e0e0'}`,
            borderRadius:4, padding:'2px 8px', fontSize:11,
            cursor:'pointer', color: copied ? '#fff' : '#666', flexShrink:0,
            transition:'all .2s'
        }}>{copied ? '✓ Đã copy' : 'Copy'}</button>
    );
};

// ─── Info row helper ───
const InfoRow = ({ label, value, bold, red, copy, minLabel = 110 }) => (
    <div style={{ display:'flex', gap:8, alignItems:'center', fontSize:13 }}>
        <span style={{ color:'#888', minWidth:minLabel, flexShrink:0 }}>{label}:</span>
        <span style={{ fontWeight: bold ? 700 : 400, color: red ? '#f5371e' : '#222', flex:1 }}>{value}</span>
        {copy && <CopyBtn value={value} />}
    </div>
);

// ─── Bank QR ───
const BankQRSection = ({ recipientPhone, amount }) => {
    const BANK = { bankName:'Vietcombank', accountNo:'1234567890', accountName:'CONG TY MINIMAL DECOR', bin:'970436' };
    const content = `MINIMALDECOR ${recipientPhone}`;
    const qrSrc = `https://img.vietqr.io/image/${BANK.bin}-${BANK.accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(BANK.accountName)}`;
    const fallback = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(`Bank:${BANK.bankName}|Acc:${BANK.accountNo}|Amount:${amount}|Content:${content}`)}&size=180x180&margin=8`;

    return (
        <div style={{ background:'#f8f9fa', border:'1px solid #e0e0e0', borderRadius:10, padding:16, marginTop:8 }}>
            <div style={{ fontWeight:700, marginBottom:12, fontSize:14 }}>📱 Quét mã QR để thanh toán</div>
            <div style={{ display:'flex', gap:16, alignItems:'flex-start', flexWrap:'wrap' }}>
                <div style={{ textAlign:'center' }}>
                    <img src={qrSrc} alt="VietQR" style={{ width:180, height:180, borderRadius:10, border:'1px solid #e0e0e0', background:'#fff' }}
                        onError={e => { e.target.onerror=null; e.target.src=fallback; }} />
                    <div style={{ fontSize:11, color:'#999', marginTop:6 }}>Quét bằng app ngân hàng</div>
                </div>
                <div style={{ flex:1, minWidth:180, display:'flex', flexDirection:'column', gap:8 }}>
                    <InfoRow label="Ngân hàng"    value={BANK.bankName} />
                    <InfoRow label="Số tài khoản" value={BANK.accountNo} bold copy />
                    <InfoRow label="Chủ tài khoản" value={BANK.accountName} bold />
                    <InfoRow label="Số tiền"      value={`${amount.toLocaleString('vi-VN')}₫`} bold red />
                    <InfoRow label="Nội dung CK"  value={content} bold red copy />
                    <div style={{ marginTop:4, background:'#fff8e1', border:'1px solid #ffe082', borderRadius:6, padding:'8px 12px', fontSize:12, color:'#856404' }}>
                        ⚠️ Vui lòng nhập <strong>đúng nội dung</strong> chuyển khoản để đơn hàng được xử lý tự động.
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── MoMo QR ───
const MomoQRSection = ({ recipientPhone, amount }) => {
    // Số điện thoại MoMo của shop — thay bằng SĐT thật
    const MOMO_PHONE = '0969534568';
    const MOMO_NAME  = 'MINIMAL DECOR';
    const content    = `DH MINIMALDECOR ${recipientPhone}`;

    // Deep link MoMo (mở thẳng app MoMo nếu đã cài)
    const momoDeepLink = `momo://app?action=payWithAppToken&isMobile=true&partnerCode=MINIMAL&storeName=${encodeURIComponent(MOMO_NAME)}&storeId=MINIMAL001&orderId=${recipientPhone}&amount=${amount}&orderLabel=${encodeURIComponent(content)}&phoneNumber=${MOMO_PHONE}`;

    // QR data: quét bằng MoMo app
    const qrData = `2|99|${MOMO_PHONE}|${MOMO_NAME}||0|0|${amount}|${content}`;
    const qrSrc  = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrData)}&size=180x180&margin=8&color=ae2070`;

    return (
        <div style={{ background:'#fdf0f5', border:'1px solid #f0a8c8', borderRadius:10, padding:16, marginTop:8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                <span style={{ fontSize:20 }}>💜</span>
                <span style={{ fontWeight:700, fontSize:14, color:'#ae2070' }}>Thanh toán qua MoMo</span>
            </div>
            <div style={{ display:'flex', gap:16, alignItems:'flex-start', flexWrap:'wrap' }}>
                <div style={{ textAlign:'center' }}>
                    <div style={{ background:'#fff', borderRadius:10, padding:8, border:'2px solid #ae2070', display:'inline-block' }}>
                        <img src={qrSrc} alt="MoMo QR" style={{ width:164, height:164, display:'block' }} />
                    </div>
                    <div style={{ fontSize:11, color:'#ae2070', marginTop:6, fontWeight:600 }}>Quét bằng app MoMo</div>
                </div>
                <div style={{ flex:1, minWidth:180, display:'flex', flexDirection:'column', gap:8 }}>
                    <InfoRow label="Số MoMo"   value={MOMO_PHONE} bold copy minLabel={90} />
                    <InfoRow label="Tên"        value={MOMO_NAME} bold minLabel={90} />
                    <InfoRow label="Số tiền"   value={`${amount.toLocaleString('vi-VN')}₫`} bold red minLabel={90} />
                    <InfoRow label="Nội dung"  value={content} bold red copy minLabel={90} />
                    <a href={momoDeepLink} style={{
                        display:'block', marginTop:4, background:'#ae2070', color:'#fff',
                        borderRadius:8, padding:'10px 0', textAlign:'center', fontWeight:700,
                        fontSize:14, textDecoration:'none'
                    }}>
                        💜 Mở app MoMo
                    </a>
                    <div style={{ fontSize:11, color:'#999', textAlign:'center' }}>Hoặc quét QR bằng camera MoMo</div>
                </div>
            </div>
        </div>
    );
};

// ─── VNPay QR ───
const VNPayQRSection = ({ recipientPhone, amount }) => {
    const VNPAY_MERCHANT = 'MINIMALDECOR';
    const content = `TTTM ${recipientPhone}`;
    // VNPay QR chuẩn EMVCo — dạng demo tĩnh
    const qrData = `00020101021238570010A000000727012700069704220113${VNPAY_MERCHANT}0208QRIBFTTA5204599953037045802VN5915MINIMAL DECOR6005HANOI6304`;
    const qrSrc  = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrData)}&size=180x180&margin=8&color=005baa`;

    return (
        <div style={{ background:'#f0f5ff', border:'1px solid #a8c0f0', borderRadius:10, padding:16, marginTop:8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                <span style={{ fontSize:20 }}>💳</span>
                <span style={{ fontWeight:700, fontSize:14, color:'#005baa' }}>Thanh toán qua VNPay</span>
            </div>
            <div style={{ display:'flex', gap:16, alignItems:'flex-start', flexWrap:'wrap' }}>
                <div style={{ textAlign:'center' }}>
                    <div style={{ background:'#fff', borderRadius:10, padding:8, border:'2px solid #005baa', display:'inline-block' }}>
                        <img src={qrSrc} alt="VNPay QR" style={{ width:164, height:164, display:'block' }} />
                    </div>
                    <div style={{ fontSize:11, color:'#005baa', marginTop:6, fontWeight:600 }}>Quét bằng app ngân hàng / VNPay</div>
                </div>
                <div style={{ flex:1, minWidth:180, display:'flex', flexDirection:'column', gap:10 }}>
                    <InfoRow label="Merchant"  value={VNPAY_MERCHANT} bold minLabel={90} />
                    <InfoRow label="Số tiền"   value={`${amount.toLocaleString('vi-VN')}₫`} bold red minLabel={90} />
                    <InfoRow label="Nội dung"  value={content} bold red copy minLabel={90} />
                    <div style={{ background:'#e8f0fe', border:'1px solid #a8c0f0', borderRadius:6, padding:'8px 12px', fontSize:12, color:'#005baa' }}>
                        ℹ️ Mở app ngân hàng → Quét QR → Xác nhận số tiền <strong>{amount.toLocaleString('vi-VN')}₫</strong>
                    </div>
                    <div style={{ background:'#fff8e1', border:'1px solid #ffe082', borderRadius:6, padding:'8px 12px', fontSize:11, color:'#856404' }}>
                        ⚠️ Đây là QR demo. Để tích hợp VNPay thật, cần đăng ký tài khoản merchant tại vnpay.vn
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── ZaloPay QR ───
const ZaloPayQRSection = ({ recipientPhone, amount }) => {
    const ZALO_PHONE = '0969534568'; // SĐT ZaloPay của shop — thay bằng SĐT thật
    const ZALO_NAME  = 'MINIMAL DECOR';
    const content    = `DH MINIMAL ${recipientPhone}`;
    const qrData     = `zalopay://payment?phone=${ZALO_PHONE}&amount=${amount}&description=${encodeURIComponent(content)}`;
    const qrSrc      = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrData)}&size=180x180&margin=8&color=0068ff`;

    return (
        <div style={{ background:'#f0f5ff', border:'1px solid #a0c0ff', borderRadius:10, padding:16, marginTop:8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                <span style={{ fontSize:20 }}>🔵</span>
                <span style={{ fontWeight:700, fontSize:14, color:'#0068ff' }}>Thanh toán qua ZaloPay</span>
            </div>
            <div style={{ display:'flex', gap:16, alignItems:'flex-start', flexWrap:'wrap' }}>
                <div style={{ textAlign:'center' }}>
                    <div style={{ background:'#fff', borderRadius:10, padding:8, border:'2px solid #0068ff', display:'inline-block' }}>
                        <img src={qrSrc} alt="ZaloPay QR" style={{ width:164, height:164, display:'block' }} />
                    </div>
                    <div style={{ fontSize:11, color:'#0068ff', marginTop:6, fontWeight:600 }}>Quét bằng app ZaloPay</div>
                </div>
                <div style={{ flex:1, minWidth:180, display:'flex', flexDirection:'column', gap:8 }}>
                    <InfoRow label="Số ZaloPay" value={ZALO_PHONE} bold copy minLabel={100} />
                    <InfoRow label="Tên"         value={ZALO_NAME} bold minLabel={100} />
                    <InfoRow label="Số tiền"    value={`${amount.toLocaleString('vi-VN')}₫`} bold red minLabel={100} />
                    <InfoRow label="Nội dung"   value={content} bold red copy minLabel={100} />
                    <a href={`zalopay://payment?phone=${ZALO_PHONE}&amount=${amount}`} style={{
                        display:'block', marginTop:4, background:'#0068ff', color:'#fff',
                        borderRadius:8, padding:'10px 0', textAlign:'center', fontWeight:700,
                        fontSize:14, textDecoration:'none'
                    }}>
                        🔵 Mở app ZaloPay
                    </a>
                    <div style={{ fontSize:11, color:'#999', textAlign:'center' }}>Hoặc quét QR bằng camera ZaloPay</div>
                </div>
            </div>
        </div>
    );
};

// ─── Main Checkout ───
const Checkout = () => {
    const { user, token } = useAuth();
    const { cart, getTotalPrice, clearCart } = useCart();
    const navigate = useNavigate();
    const getPrice = (item) => item.salePrice ?? item.price ?? item.basePrice ?? 0;

    const [step, setStep] = useState(0);
    const [form, setForm] = useState({
        recipientName: user?.fullName || user?.userName || '',
        recipientPhone: user?.phone || '',
        shippingAddress: '',
        email: user?.email || '',
        customerNote: ''
    });
    const [addressValid, setAddressValid]  = useState(false);
    const [shipping, setShipping]         = useState('standard');
    const [payMethod, setPayMethod]       = useState('cod');
    const [couponApplied, setCouponApplied] = useState(null);
    const [submitting, setSubmitting]     = useState(false);
    const [error, setError]               = useState('');

    const subtotal       = getTotalPrice();
    const shippingOptions = getShippingOptions(form.shippingAddress);
    const currentShipping = shippingOptions.find(s => s.id === shipping);
    // Nếu option đang chọn không khả dụng → tự động về standard
    const shippingFee    = (currentShipping?.available ?? true) ? (currentShipping?.fee ?? 0) : 0;
    const discount       = couponApplied?.discount ?? 0;
    const total          = subtotal + shippingFee - discount;

    // Reset về standard nếu tỉnh thay đổi và option cũ không còn khả dụng
    React.useEffect(() => {
        const opts = getShippingOptions(form.shippingAddress);
        const cur  = opts.find(s => s.id === shipping);
        if (cur && !cur.available) setShipping('standard');
    }, [form.shippingAddress]);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const validateStep0 = () => {
        if (!form.recipientName.trim())  { setError('Vui lòng nhập họ tên người nhận'); return false; }
        if (!form.recipientPhone.trim()) { setError('Vui lòng nhập số điện thoại'); return false; }
        if (!addressValid) { setError('Vui lòng chọn đầy đủ địa chỉ: số nhà, tỉnh/thành phố, quận/huyện và phường/xã'); return false; }
        return true;
    };

    const nextStep = () => {
        setError('');
        if (step === 0 && !validateStep0()) return;
        setStep(s => Math.min(s + 1, 2));
    };

    const handleSubmit = async () => {
        setError('');
        const tk = token || localStorage.getItem('token');
        if (!tk) { navigate('/login'); return; }

        const orderData = {
            items: cart.map(item => ({
                productId:   item.id,
                variantId:   item.variantId   || null,
                variantInfo: item.variantInfo  || null,
                quantity:    item.quantity,
            })),
            recipientName:   form.recipientName.trim(),
            recipientPhone:  form.recipientPhone.trim(),
            shippingAddress: form.shippingAddress.trim(),
            customerNote:    form.customerNote.trim(),
            shippingFee:     shippingFee,
            paymentMethod:   payMethod,
            couponCode:      couponApplied?.code || null,
        };

        setSubmitting(true);
        try {
            const res = await axios.post(`${API_BASE}/Orders`, orderData, {
                headers: { Authorization: `Bearer ${tk}`, 'Content-Type': 'application/json' }
            });

            const orderId = res.data?.order?.id || res.data?.id || res.data?.orderId || Date.now();
            clearCart();
            navigate('/order-success', {
                state: {
                    orderId,
                    orderDate: new Date().toLocaleDateString('vi-VN', { day:'2-digit', month:'long', year:'numeric' }),
                    total, subtotal, shippingFee, discount,
                    couponCode:    couponApplied?.code,
                    email:         form.email,
                    phone:         form.recipientPhone,
                    address:       form.shippingAddress,
                    fullName:      form.recipientName,
                    note:          form.customerNote,
                    paymentMethod: PAYMENT_METHODS.find(p => p.id === payMethod)?.label || payMethod,
                    items: cart.map(i => ({
                        name:  i.name,
                        qty:   i.quantity,
                        price: getPrice(i),
                        img:   i.imageUrl || i.mainImageUrl
                    }))
                }
            });
        } catch (err) {
            if (err.response?.status === 401)
                setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            else if (err.response?.data?.message)
                setError(err.response.data.message);
            else if (err.response?.data?.errors) {
                // Xử lý validation errors từ .NET
                const errs = err.response.data.errors;
                const msgs = Object.values(errs).flat().join(' | ');
                setError(msgs);
            } else
                setError('Đặt hàng thất bại. Vui lòng thử lại!');
            // Scroll lên để thấy lỗi
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setSubmitting(false);
        }
    };

    if (cart.length === 0) return (
        <div style={{ maxWidth:480, margin:'80px auto', textAlign:'center', fontFamily:'Arial,sans-serif' }}>
            <div style={{ fontSize:64, marginBottom:12 }}>🛒</div>
            <h3>Giỏ hàng trống</h3>
            <Link to="/shop" style={{ display:'inline-block', marginTop:16, padding:'12px 32px', background:'#f5371e', color:'#fff', borderRadius:4, textDecoration:'none', fontWeight:700 }}>Mua sắm ngay</Link>
        </div>
    );

    return (
        <>
        <style>{`
            *{box-sizing:border-box}
            .ck{max-width:760px;margin:0 auto;padding:20px 12px 60px;font-family:Arial,sans-serif;color:#333;font-size:14px}
            .ck-bc{font-size:13px;color:#888;margin-bottom:20px}
            .ck-bc a{color:#1a5276;text-decoration:none}
            .ck-card{background:#fff;border:1px solid #ebebeb;border-radius:10px;overflow:hidden;margin-bottom:14px}
            .ck-card-head{padding:14px 18px;font-weight:700;font-size:15px;border-bottom:1px solid #f5f5f5;display:flex;align-items:center;gap:8px}
            .ck-card-body{padding:18px}
            .ck-row2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}
            .ck-field{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}
            .ck-field label{font-size:13px;font-weight:700;color:#555}
            .ck-field label span{color:#999;font-weight:400}
            .ck-field input,.ck-field textarea{border:1px solid #e0e0e0;border-radius:8px;padding:11px 14px;font-size:14px;outline:none;transition:border .15s;font-family:inherit;width:100%}
            .ck-field input:focus,.ck-field textarea:focus{border-color:#f5371e;box-shadow:0 0 0 2px rgba(245,55,30,.08)}
            .ck-field textarea{resize:vertical;min-height:80px}
            .ck-ship-opt{border:2px solid #e0e0e0;border-radius:8px;padding:13px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;transition:all .15s;margin-bottom:10px}
            .ck-ship-opt.sel{border-color:#f5371e;background:#fff8f7}
            .ck-ship-opt input{accent-color:#f5371e;width:16px;height:16px}
            .ck-ship-opt-info{flex:1}
            .ck-ship-opt-name{font-weight:700;font-size:14px}
            .ck-ship-opt-sub{font-size:12px;color:#999;margin-top:2px}
            .ck-ship-opt-price{font-weight:700;color:#27ae60}
            .ck-pay-opt{border:2px solid #e0e0e0;border-radius:8px;padding:13px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;transition:all .15s;margin-bottom:10px}
            .ck-pay-opt.sel{border-color:#f5371e;background:#fff8f7}
            .ck-pay-opt input{accent-color:#f5371e;width:16px;height:16px;flex-shrink:0}
            .ck-pay-icon{font-size:22px;flex-shrink:0}
            .ck-pay-info{flex:1}
            .ck-pay-name{font-weight:700;font-size:14px}
            .ck-pay-sub{font-size:12px;color:#999}
            .ck-preview-item{display:flex;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid #f5f5f5}
            .ck-preview-item:last-child{border-bottom:none}
            .ck-preview-img{width:52px;height:52px;object-fit:cover;border-radius:6px;border:1px solid #eee;flex-shrink:0;background:#f5f5f5}
            .ck-preview-name{font-size:13px;font-weight:600;color:#222;flex:1;line-height:1.4}
            .ck-preview-price{font-size:13px;font-weight:700;color:#f5371e;white-space:nowrap}
            .ck-totals{padding:14px 0 0}
            .ck-tl{display:flex;justify-content:space-between;font-size:14px;margin-bottom:8px;color:#666}
            .ck-tl.big{font-size:18px;font-weight:700;color:#f5371e;border-top:1px solid #f0f0f0;padding-top:12px;margin-top:4px}
            .ck-tl.big span:first-child{color:#333}
            .ck-tl.discount{color:#27ae60}
            .ck-btn-next{width:100%;background:#f5371e;color:#fff;border:none;border-radius:8px;padding:15px;font-size:16px;font-weight:700;cursor:pointer;transition:background .2s;margin-top:8px}
            .ck-btn-next:hover:not(:disabled){background:#d42e18}
            .ck-btn-next:disabled{opacity:.6;cursor:not-allowed}
            .ck-btn-back{background:#fff;color:#555;border:1px solid #e0e0e0;border-radius:8px;padding:13px 24px;font-size:15px;font-weight:600;cursor:pointer;margin-top:8px}
            .ck-btn-back:hover{background:#f5f5f5}
            .ck-btn-row{display:flex;gap:10px}
            .ck-btn-row .ck-btn-back{flex:1}
            .ck-btn-row .ck-btn-next{flex:2;margin-top:0}
            .ck-err{background:#fff5f5;border:1px solid #f5c6c6;border-radius:6px;padding:11px 14px;color:#c0392b;font-size:14px;margin-bottom:14px;display:flex;gap:8px;align-items:flex-start}
            .spin{display:inline-block;width:14px;height:14px;border:2px solid #fff;border-top:2px solid transparent;border-radius:50%;animation:spin 1s linear infinite;margin-right:8px;vertical-align:middle}
            @keyframes spin{to{transform:rotate(360deg)}}
            @media(max-width:520px){.ck-row2{grid-template-columns:1fr}}
        `}</style>

        <div className="ck">
            <div className="ck-bc">
                <Link to="/">Trang chủ</Link> › <Link to="/cart">Giỏ hàng</Link> › <span>Thanh toán</span>
            </div>

            <Steps current={step} />

            {error && (
                <div className="ck-err">
                    <span>⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            {/* ─── STEP 0: ĐỊA CHỈ ─── */}
            {step === 0 && (
                <div className="ck-card">
                    <div className="ck-card-head">📍 Thông tin giao hàng</div>
                    <div className="ck-card-body">
                        <div className="ck-row2">
                            <div className="ck-field">
                                <label>Họ và tên người nhận <em style={{ color:'#f5371e', fontStyle:'normal' }}>*</em></label>
                                <input name="recipientName" placeholder="Nguyễn Văn A"
                                    value={form.recipientName} onChange={handleChange} />
                            </div>
                            <div className="ck-field">
                                <label>Số điện thoại <em style={{ color:'#f5371e', fontStyle:'normal' }}>*</em></label>
                                <input name="recipientPhone" placeholder="0912 345 678" type="tel"
                                    value={form.recipientPhone} onChange={handleChange} />
                            </div>
                        </div>

                        {/* Địa chỉ tách ô */}
                        <div className="ck-field" style={{ marginBottom:16 }}>
                            <label>Địa chỉ giao hàng <em style={{ color:'#f5371e', fontStyle:'normal' }}>*</em></label>
                            <AddressSelector
                                value={form.shippingAddress}
                                onChange={addr => setForm(f => ({ ...f, shippingAddress: addr }))}
                                onValidChange={valid => setAddressValid(valid)}
                            />
                        </div>

                        <div className="ck-field">
                            <label>Email <span>(tuỳ chọn, nhận xác nhận đơn)</span></label>
                            <input name="email" type="email" value={form.email} onChange={handleChange} />
                        </div>
                        <div className="ck-field" style={{ marginBottom:0 }}>
                            <label>Ghi chú <span>(tuỳ chọn)</span></label>
                            <textarea name="customerNote"
                                placeholder="Giao giờ hành chính, gọi trước khi giao..."
                                value={form.customerNote} onChange={handleChange} />
                        </div>
                        <button className="ck-btn-next" onClick={nextStep}>Tiếp theo →</button>
                    </div>
                </div>
            )}

            {/* ─── STEP 1: VẬN CHUYỂN ─── */}
            {step === 1 && (
                <>
                <div className="ck-card">
                    <div className="ck-card-head">🚚 Phương thức vận chuyển</div>
                    <div className="ck-card-body">
                        {shippingOptions.map(opt => (
                            <div key={opt.id}
                                className={`ck-ship-opt ${shipping===opt.id?'sel':''} ${!opt.available?'disabled':''}`}
                                onClick={() => opt.available && setShipping(opt.id)}
                                style={{ opacity: opt.available ? 1 : 0.5, cursor: opt.available ? 'pointer' : 'not-allowed' }}>
                                <input type="radio" name="ship" checked={shipping===opt.id}
                                    disabled={!opt.available}
                                    onChange={() => opt.available && setShipping(opt.id)} />
                                <div className="ck-ship-opt-info">
                                    <div className="ck-ship-opt-name">{opt.name}</div>
                                    <div className="ck-ship-opt-sub">{opt.sub}</div>
                                    {opt.note && (
                                        <div style={{ fontSize:11, color:'#e67e22', marginTop:3 }}>
                                            ⚠️ {opt.note}
                                        </div>
                                    )}
                                </div>
                                <div className="ck-ship-opt-price" style={{ color: opt.available ? (opt.fee===0?'#27ae60':'#333') : '#ccc' }}>
                                    {opt.feeLabel}
                                </div>
                            </div>
                        ))}
                        {/* Ghi chú phí vận chuyển chưa tính vào tổng */}
                        <div style={{ background:'#fff8e1', border:'1px solid #ffe082', borderRadius:6, padding:'8px 12px', fontSize:12, color:'#856404', marginTop:4 }}>
                            ℹ️ Phí vận chuyển sẽ được tính vào tổng đơn hàng ở bước thanh toán.
                        </div>
                    </div>
                </div>
                <div className="ck-btn-row">
                    <button className="ck-btn-back" onClick={() => setStep(0)}>← Quay lại</button>
                    <button className="ck-btn-next" onClick={nextStep}>Tiếp theo →</button>
                </div>
                </>
            )}

            {/* ─── STEP 2: THANH TOÁN ─── */}
            {step === 2 && (
                <>
                {/* Preview đơn hàng */}
                <div className="ck-card">
                    <div className="ck-card-head">🛍 Đơn hàng của bạn</div>
                    <div className="ck-card-body">
                        {cart.map(item => {
                            const price = getPrice(item);
                            return (
                                <div key={item.id} className="ck-preview-item">
                                    <img src={item.imageUrl || item.mainImageUrl || ''}
                                        alt={item.name} className="ck-preview-img"
                                        onError={e => e.target.style.display='none'} />
                                    <div className="ck-preview-name">
                                        {item.name}
                                        {item.variantInfo && <div style={{ fontSize:11, color:'#999', fontWeight:400 }}>{item.variantInfo}</div>}
                                    </div>
                                    <div style={{ textAlign:'right', flexShrink:0 }}>
                                        <div className="ck-preview-price">{(price * item.quantity).toLocaleString('vi-VN')}₫</div>
                                        <div style={{ fontSize:11, color:'#999' }}>x{item.quantity}</div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Mã giảm giá */}
                        <CouponSection
                            subtotal={subtotal}
                            couponApplied={couponApplied}
                            setCouponApplied={setCouponApplied}
                            token={token}
                        />

                        {/* Tổng tiền */}
                        <div className="ck-totals">
                            <div className="ck-tl"><span>Tạm tính</span><span>{subtotal.toLocaleString('vi-VN')}₫</span></div>
                            <div className="ck-tl">
                                <span>Vận chuyển</span>
                                <span style={{ color: shippingFee===0 ? '#27ae60' : '#333' }}>
                                    {shippingFee===0 ? 'Miễn phí' : shippingFee.toLocaleString('vi-VN')+'₫'}
                                </span>
                            </div>
                            {discount > 0 && (
                                <div className="ck-tl discount">
                                    <span>Giảm giá ({couponApplied?.code})</span>
                                    <span>-{discount.toLocaleString('vi-VN')}₫</span>
                                </div>
                            )}
                            <div className="ck-tl big"><span>Tổng cộng</span><span>{total.toLocaleString('vi-VN')}₫</span></div>
                        </div>
                    </div>
                </div>

                {/* Phương thức thanh toán */}
                <div className="ck-card">
                    <div className="ck-card-head">💳 Phương thức thanh toán</div>
                    <div className="ck-card-body">
                        {PAYMENT_METHODS.map(pm => (
                            <div key={pm.id} className={`ck-pay-opt ${payMethod===pm.id?'sel':''}`}
                                onClick={() => setPayMethod(pm.id)}>
                                <input type="radio" name="pay" checked={payMethod===pm.id} onChange={() => setPayMethod(pm.id)} />
                                <span className="ck-pay-icon">{pm.icon}</span>
                                <div className="ck-pay-info">
                                    <div className="ck-pay-name">{pm.label}</div>
                                    <div className="ck-pay-sub">{pm.sub}</div>
                                </div>
                            </div>
                        ))}

                        {/* QR theo phương thức thanh toán */}
                        {payMethod === 'bank' && (
                            <BankQRSection recipientPhone={form.recipientPhone} amount={total} />
                        )}
                        {payMethod === 'momo' && (
                            <MomoQRSection recipientPhone={form.recipientPhone} amount={total} />
                        )}
                        {payMethod === 'vnpay' && (
                            <VNPayQRSection recipientPhone={form.recipientPhone} amount={total} />
                        )}
                        {payMethod === 'zalopay' && (
                            <ZaloPayQRSection recipientPhone={form.recipientPhone} amount={total} />
                        )}
                    </div>
                </div>

                {/* Địa chỉ tóm tắt */}
                <div className="ck-card">
                    <div className="ck-card-head" style={{ justifyContent:'space-between' }}>
                        <span>📍 Địa chỉ giao hàng</span>
                        <button onClick={() => setStep(0)} style={{ background:'none', border:'none', color:'#f5371e', cursor:'pointer', fontSize:13, fontWeight:700 }}>Sửa</button>
                    </div>
                    <div className="ck-card-body" style={{ paddingTop:12, paddingBottom:12 }}>
                        <div style={{ fontWeight:700 }}>{form.recipientName} – {form.recipientPhone}</div>
                        <div style={{ color:'#666', marginTop:4 }}>{form.shippingAddress}</div>
                        {form.customerNote && <div style={{ color:'#999', fontSize:12, marginTop:4 }}>Ghi chú: {form.customerNote}</div>}
                    </div>
                </div>

                <div className="ck-btn-row">
                    <button className="ck-btn-back" onClick={() => setStep(1)}>← Quay lại</button>
                    <button className="ck-btn-next" disabled={submitting} onClick={handleSubmit}>
                        {submitting
                            ? <><span className="spin"></span>Đang đặt hàng...</>
                            : `Đặt hàng – ${total.toLocaleString('vi-VN')}₫`
                        }
                    </button>
                </div>
                </>
            )}
        </div>
        </>
    );
};

export default Checkout;