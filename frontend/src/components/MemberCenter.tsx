import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, Heart, ShoppingBag, Landmark, Copy, AlertCircle, Eye, EyeOff } from 'lucide-react';
import type { Product, Order } from '../App';

interface MemberCenterProps {
  currentUser: { name: string; email: string; phone?: string; address?: string; points?: number } | null;
  setCurrentUser: (user: any) => void;
  orders: Order[];
  products: Product[];
  wishlist: string[];
  toggleWishlist: (id: string, e: React.MouseEvent) => void;
  addToCart: (product: Product, quantity?: number) => void;
  setCurrentPage: (page: any) => void;
  setSelectedProduct: (prod: Product | null) => void;
  BACKEND_URL: string;
}

export const MemberCenter: React.FC<MemberCenterProps> = ({
  currentUser,
  setCurrentUser,
  orders,
  products,
  wishlist,
  toggleWishlist,
  addToCart,
  setCurrentPage,
  setSelectedProduct,
  BACKEND_URL
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'points' | 'coupons' | 'orders' | 'wishlist'>('profile');
  
  // Profile form states
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Sync state if currentUser changes (e.g. after fresh login)
  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [currentUser]);

  // Filter orders for the current user
  const userOrders = orders.filter(o => o.shippingEmail === currentUser?.email);

  // Filter wishlist products
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  // Predefined coupons list
  const coupons = [
    { code: 'LEROU100', description: '滿 NT$ 1,000 元現折 NT$ 100 元', terms: '單筆結帳金額需滿千元方得使用。' },
    { code: 'MEOW90', description: '全店商品結帳打 9 折', terms: '適用於全館所有選物商品，無使用金額限制。' },
    { code: 'FREESHIP', description: '全店消費享免運費', terms: '適用於店到店及宅配，享單筆訂單免運優惠。' }
  ];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`已複製優惠碼：${code}`);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (profileForm.password && profileForm.password !== profileForm.confirmPassword) {
      setMessage({ text: '密碼與確認密碼不一致', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('customerToken');
      const res = await fetch(`${BACKEND_URL}/api/auth/customer-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: profileForm.name,
          phone: profileForm.phone,
          address: profileForm.address,
          password: profileForm.password || undefined
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ text: data.message || '資訊更新成功！', type: 'success' });
        // Update global user state in App.tsx
        setCurrentUser(data.customer);
        setProfileForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
      } else {
        setMessage({ text: data.error || '更新失敗，請檢查輸入內容', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: '伺服器連線失敗，請稍後再試', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', minHeight: '80vh' }}>
      <div className="section-header" style={{ marginBottom: '2rem' }}>
        <span className="section-subtitle">MEMBER CENTER</span>
        <h2 className="section-title" style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)' }}>樂肉會員中心</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Sidebar Navigation */}
        <div className="glass-panel" style={{ padding: '1rem', borderRadius: '12px', background: '#fdfbf7', border: '1px solid var(--border)' }}>
          <div style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid var(--border)', marginBottom: '1rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', margin: '0 auto 0.75rem' }}>
              {currentUser?.name ? currentUser.name.slice(0, 1) : 'U'}
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>{currentUser?.name}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentUser?.email}</span>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <button
              onClick={() => setActiveTab('profile')}
              style={{ ...tabBtnStyle, background: activeTab === 'profile' ? 'var(--primary-light)' : 'transparent', color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text-secondary)' }}
            >
              <User size={16} /> <span>個人資訊修改</span>
            </button>
            <button
              onClick={() => setActiveTab('points')}
              style={{ ...tabBtnStyle, background: activeTab === 'points' ? 'var(--primary-light)' : 'transparent', color: activeTab === 'points' ? 'var(--primary)' : 'var(--text-secondary)' }}
            >
              <Landmark size={16} /> <span>商店購物金</span>
            </button>
            <button
              onClick={() => setActiveTab('coupons')}
              style={{ ...tabBtnStyle, background: activeTab === 'coupons' ? 'var(--primary-light)' : 'transparent', color: activeTab === 'coupons' ? 'var(--primary)' : 'var(--text-secondary)' }}
            >
              <ShoppingBag size={16} /> <span>我的專屬優惠券</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              style={{ ...tabBtnStyle, background: activeTab === 'orders' ? 'var(--primary-light)' : 'transparent', color: activeTab === 'orders' ? 'var(--primary)' : 'var(--text-secondary)' }}
            >
              <ShieldCheck size={16} /> <span>我的訂單紀錄</span>
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              style={{ ...tabBtnStyle, background: activeTab === 'wishlist' ? 'var(--primary-light)' : 'transparent', color: activeTab === 'wishlist' ? 'var(--primary)' : 'var(--text-secondary)' }}
            >
              <Heart size={16} /> <span>我的追蹤清單</span>
            </button>
          </nav>
        </div>

        {/* Content Panel */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '12px', background: '#fff', border: '1px solid var(--border)', minHeight: '400px' }}>
          
          {/* TAB 1: PROFILE EDIT */}
          {activeTab === 'profile' && (
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>👤 修改個人資料</h3>
              
              {message && (
                <div style={{ 
                  padding: '0.75rem 1rem', 
                  borderRadius: '6px', 
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: message.type === 'success' ? '#e6f4ea' : '#fce8e6',
                  color: message.type === 'success' ? '#137333' : '#c5221f'
                }}>
                  <AlertCircle size={16} />
                  <span>{message.text}</span>
                </div>
              )}

              <form onSubmit={handleProfileSubmit} style={{ display: 'grid', gap: '1.25rem', maxWidth: '500px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>電子信箱 (帳號，不可修改)</label>
                  <input type="text" className="form-input" value={currentUser?.email || ''} disabled style={{ background: '#f5f5f5', color: '#888' }} />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>中文姓名</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    value={profileForm.name} 
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>手機號碼</label>
                  <input 
                    type="tel" 
                    className="form-input" 
                    placeholder="如：0912345678"
                    value={profileForm.phone} 
                    onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>常用收件地址</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="請輸入常用收件地址"
                    value={profileForm.address} 
                    onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                  />
                </div>

                <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.75rem' }}>若不打算變更密碼，以下密碼欄位留空即可。</span>
                  
                  <div className="form-group-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group" style={{ position: 'relative' }}>
                      <label className="form-label" style={{ fontWeight: 600 }}>新密碼</label>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        className="form-input" 
                        placeholder="留空代表不修改"
                        value={profileForm.password} 
                        onChange={e => setProfileForm({ ...profileForm, password: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '10px', top: '35px', background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 600 }}>確認新密碼</label>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        className="form-input" 
                        placeholder="再次輸入新密碼"
                        value={profileForm.confirmPassword} 
                        onChange={e => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={loading}
                  style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
                >
                  {loading ? '更新中...' : '儲存修改'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: SHOPPING POINTS */}
          {activeTab === 'points' && (
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>💰 商店購物金餘額</h3>
              
              <div className="glass-panel" style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                color: '#fff',
                padding: '2rem',
                borderRadius: '12px',
                textAlign: 'center',
                boxShadow: 'var(--shadow-md)',
                marginBottom: '2rem',
                maxWidth: '400px'
              }}>
                <span style={{ fontSize: '0.9rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px' }}>Current Balance</span>
                <div style={{ fontSize: '3rem', fontWeight: 800, margin: '0.5rem 0' }}>
                  NT$ {currentUser?.points || 0}
                </div>
                <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.75rem', borderRadius: '20px' }}>
                  1 點購物金 = 折抵 NT$ 1 元
                </span>
              </div>

              <div style={{ lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>購物金使用條款與說明：</h4>
                <ul style={{ paddingLeft: '1.2rem', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <li>購物金可於結帳頁面直接勾選並全額或部分折抵訂單金額。</li>
                  <li>每次購物消費時，將依訂單最終實付金額的 **10%** 自動累積回饋為下次消費的購物金點數！</li>
                  <li>購物金無使用期限，唯不可要求兌換現金。</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: COUPONS */}
          {activeTab === 'coupons' && (
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>🏷️ 我的專屬優惠券</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>以下為您目前擁有的專屬折扣券。結帳時輸入代碼即可套用優惠：</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {coupons.map((coupon) => (
                  <div 
                    key={coupon.code}
                    className="glass-panel"
                    style={{
                      border: '1px dashed var(--primary)',
                      borderRadius: '10px',
                      padding: '1.25rem',
                      background: '#fdfbf7',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative'
                    }}
                  >
                    <div>
                      <span style={{ 
                        display: 'inline-block',
                        background: 'var(--primary)',
                        color: '#fff',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        marginBottom: '0.75rem'
                      }}>
                        COUPON
                      </span>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.25rem', color: 'var(--primary-dark)' }}>{coupon.description}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 1rem' }}>限制：{coupon.terms}</p>
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      background: '#fff',
                      border: '1px solid var(--border)',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '6px'
                    }}>
                      <code style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                        {coupon.code}
                      </code>
                      <button 
                        type="button"
                        onClick={() => handleCopy(coupon.code)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}
                      >
                        <Copy size={12} /> 複製
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS */}
          {activeTab === 'orders' && (
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>📦 訂單歷史紀錄</h3>
              
              {userOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                  <ShoppingBag size={48} style={{ strokeWidth: 1, marginBottom: '1rem', color: '#ccc' }} />
                  <p>尚無任何訂單紀錄</p>
                  <button onClick={() => setCurrentPage('shop')} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    前往商城選購
                  </button>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)', fontWeight: 600 }}>
                        <th style={{ padding: '0.75rem 0.5rem' }}>訂單編號</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>日期</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>收件人</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>運送方式</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>實付金額</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>狀態</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userOrders.map((order) => {
                        let statusColor = '#e2a100';
                        let statusBg = '#fff8e1';
                        if (order.status === 'Completed' || order.status === '已出貨') {
                          statusColor = '#137333';
                          statusBg = '#e6f4ea';
                        } else if (order.status === 'Cancelled' || order.status === '已取消') {
                          statusColor = '#c5221f';
                          statusBg = '#fce8e6';
                        }
                        
                        return (
                          <tr key={order.id} style={{ borderBottom: '1px solid #f3f3f3', verticalAlign: 'middle' }}>
                            <td style={{ padding: '1rem 0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              #{order.id.slice(-6).toUpperCase()}
                            </td>
                            <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>
                              {order.date}
                            </td>
                            <td style={{ padding: '1rem 0.5rem', color: 'var(--text-primary)' }}>
                              {order.shippingName}
                            </td>
                            <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>
                              {order.logisticsType === 'CVS' ? '超商取貨' : '宅配到府'} 
                              {order.cvsStoreName && ` (${order.cvsStoreName})`}
                            </td>
                            <td style={{ padding: '1rem 0.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                              NT$ {order.total}
                            </td>
                            <td style={{ padding: '1rem 0.5rem' }}>
                              <span style={{ 
                                display: 'inline-block',
                                color: statusColor,
                                background: statusBg,
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 600
                              }}>
                                {order.status === 'Pending' ? '處理中' : 
                                 order.status === 'Processing' ? '備貨中' : 
                                 order.status === 'Shipped' ? '已出貨' : 
                                 order.status === 'Completed' ? '已完成' : 
                                 order.status === 'Cancelled' ? '已取消' : order.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>❤️ 我的追蹤商品清單</h3>
              
              {wishlistProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                  <Heart size={48} style={{ strokeWidth: 1, marginBottom: '1rem', color: '#ccc' }} />
                  <p>追蹤清單中目前沒有商品</p>
                  <button onClick={() => setCurrentPage('shop')} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    去商城逛逛
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                  {wishlistProducts.map((product) => {
                    const isOutOfStock = product.stock !== undefined && product.stock <= 0;
                    
                    return (
                      <div 
                        key={product.id}
                        className="product-card"
                        style={{
                          border: '1px solid var(--border)',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          background: '#fff',
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative'
                        }}
                      >
                        {/* Remove Heart Trigger */}
                        <button
                          type="button"
                          onClick={(e) => toggleWishlist(product.id, e)}
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: 'rgba(255,255,255,0.85)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            zIndex: 10
                          }}
                          title="移出追蹤清單"
                        >
                          <Heart size={14} fill="#ff1744" color="#ff1744" />
                        </button>

                        <div 
                          onClick={() => { setSelectedProduct(product); setCurrentPage('product-detail'); }}
                          style={{ cursor: 'pointer', height: '160px', overflow: 'hidden', background: '#f5f5f5' }}
                        >
                          <img src={product.image} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>

                        <div style={{ padding: '0.75rem', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <h4 
                              onClick={() => { setSelectedProduct(product); setCurrentPage('product-detail'); }}
                              style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 0.5rem', cursor: 'pointer', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: '2.4rem' }}
                            >
                              {product.title}
                            </h4>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.75rem' }}>
                              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)' }}>NT$ {product.price}</span>
                              {product.originalPrice && (
                                <span style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>NT$ {product.originalPrice}</span>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ 
                              width: '100%', 
                              padding: '0.4rem', 
                              fontSize: '0.75rem', 
                              borderRadius: '6px',
                              background: isOutOfStock ? '#ccc' : 'var(--primary)',
                              borderColor: isOutOfStock ? '#ccc' : 'var(--primary)',
                              cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                            }}
                            disabled={isOutOfStock}
                            onClick={() => {
                              if (!isOutOfStock) {
                                addToCart(product, 1);
                                alert('已將商品加入選物車！');
                              }
                            }}
                          >
                            {isOutOfStock ? '已售完' : '加入選物車'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

const tabBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  width: '100%',
  padding: '0.75rem 1rem',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  textAlign: 'left',
  fontSize: '0.9rem',
  fontWeight: 600,
  transition: 'all 0.2s'
};
