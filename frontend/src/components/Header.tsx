import React from 'react';
import { User, ShoppingBag } from 'lucide-react';

interface HeaderProps {
  appLogo: string;
  isLoggedIn: boolean;
  currentUser: { name: string; email: string } | null;
  handleLogout: () => void;
  setIsLoginModalOpen: (open: boolean) => void;
  setIsCartOpen: (open: boolean) => void;
  cartTotalQty: number;
  currentPage: string;
  setCurrentPage: (page: any) => void;
  category: string;
  setCategory: (category: string) => void;
  isAdminMode: boolean;
  setIsAdminMode: (admin: boolean) => void;
  scrolled: boolean;
  navItems: Array<{ id: string; name: string; category?: string; page?: string }>;
}

export const Header: React.FC<HeaderProps> = ({
  appLogo,
  isLoggedIn,
  currentUser,
  handleLogout,
  setIsLoginModalOpen,
  setIsCartOpen,
  cartTotalQty,
  currentPage,
  setCurrentPage,
  category,
  setCategory,
  isAdminMode,
  setIsAdminMode,
  scrolled,
  navItems
}) => {
  return (
    <header className={`app-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container header-container">
        
        {/* Row 1: Left Placeholder, Center Logo, Right User/Cart actions */}
        <div className="header-top-row">
          <div className="header-top-left" style={{ width: '33%' }}>
            {/* Empty placeholder to keep center alignment for logo */}
          </div>

          <a 
            href="#" 
            className="brand-logo" 
            onClick={(e) => { 
              e.preventDefault(); 
              setCurrentPage('home'); 
              setIsAdminMode(false); 
            }} 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
          >
            <img 
              src={appLogo} 
              alt="Lè Ròu Logo" 
              style={{ height: '80px', width: '80px', borderRadius: '16px', objectFit: 'cover', border: '1px solid var(--border)', transition: 'all 0.3s' }} 
            />
          </a>

          <div className="header-actions">
            {isLoggedIn ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span 
                  style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500, cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => {
                    if (currentUser?.email === 'admin@lerou.com') {
                      setIsAdminMode(true);
                      setCurrentPage('admin');
                    } else {
                      setIsAdminMode(false);
                      setCurrentPage('member-center');
                    }
                  }}
                  title="進入會員中心 / 管理後台"
                >
                  Hi, {currentUser?.name}
                </span>
                {currentUser?.email !== 'admin@lerou.com' && (
                  <button 
                    className="btn btn-secondary"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', border: '1px solid var(--border)', background: 'transparent' }}
                    onClick={() => {
                      setIsAdminMode(false);
                      setCurrentPage('member-center');
                    }}
                  >
                    會員中心
                  </button>
                )}
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                  onClick={handleLogout}
                >
                  登出
                </button>
              </div>
            ) : (
              <button 
                className="action-btn" 
                onClick={() => setIsLoginModalOpen(true)}
                aria-label="會員登入"
              >
                <User size={20} />
              </button>
            )}
            <button 
              className="action-btn" 
              onClick={() => setIsCartOpen(true)}
              aria-label="購物車"
            >
              <ShoppingBag size={20} />
              {cartTotalQty > 0 && <span className="cart-count">{cartTotalQty}</span>}
            </button>
          </div>
        </div>

        {/* Row 2: Centered Navigation Menu */}
        <div className="header-nav-row">
          <nav>
            <ul className="nav-menu" style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', listStyle: 'none' }}>
              {navItems.map((item) => {
                const isActive = !isAdminMode && (
                  (item.page === 'shop' && currentPage === 'shop' && (item.category === 'all' || category === item.category)) ||
                  (item.page === 'brands' && currentPage === 'brands') ||
                  (item.page === 'blog' && currentPage === 'blog')
                );
                const hasDropdown = ['apparel', 'accessories', 'outing'].includes(item.category || '') || item.page === 'brands';

                return (
                  <li key={item.id} className={hasDropdown ? 'has-dropdown' : ''}>
                    <a 
                      href="#" 
                      className={`nav-link ${isActive ? 'active' : ''}`}
                      onClick={(e) => { 
                        e.preventDefault(); 
                        setCurrentPage(item.page || 'shop'); 
                        if (item.category) setCategory(item.category);
                        setIsAdminMode(false); 
                      }}
                    >
                      {item.name}
                    </a>
                    {item.category === 'apparel' && (
                      <ul className="dropdown-menu">
                        <li><a href="#apparel" onClick={(e) => { e.preventDefault(); setCurrentPage('shop'); setCategory('apparel'); setIsAdminMode(false); }}>外套及背心</a></li>
                        <li><a href="#apparel" onClick={(e) => { e.preventDefault(); setCurrentPage('shop'); setCategory('apparel'); setIsAdminMode(false); }}>裙類及洋裝</a></li>
                        <li><a href="#apparel" onClick={(e) => { e.preventDefault(); setCurrentPage('shop'); setCategory('apparel'); setIsAdminMode(false); }}>褲類及連身褲</a></li>
                        <li><a href="#apparel" onClick={(e) => { e.preventDefault(); setCurrentPage('shop'); setCategory('apparel'); setIsAdminMode(false); }}>單件式上衣</a></li>
                        <li><a href="#apparel" onClick={(e) => { e.preventDefault(); setCurrentPage('shop'); setCategory('apparel'); setIsAdminMode(false); }}>機能服飾</a></li>
                      </ul>
                    )}
                    {item.category === 'accessories' && (
                      <ul className="dropdown-menu">
                        <li><a href="#accessories" onClick={(e) => { e.preventDefault(); setCurrentPage('shop'); setCategory('accessories'); setIsAdminMode(false); }}>帽子</a></li>
                        <li><a href="#accessories" onClick={(e) => { e.preventDefault(); setCurrentPage('shop'); setCategory('accessories'); setIsAdminMode(false); }}>領巾及圍脖</a></li>
                        <li><a href="#accessories" onClick={(e) => { e.preventDefault(); setCurrentPage('shop'); setCategory('accessories'); setIsAdminMode(false); }}>玩具</a></li>
                      </ul>
                    )}
                    {item.category === 'outing' && (
                      <ul className="dropdown-menu">
                        <li><a href="#outing" onClick={(e) => { e.preventDefault(); setCurrentPage('shop'); setCategory('outing'); setIsAdminMode(false); }}>水壺</a></li>
                        <li><a href="#outing" onClick={(e) => { e.preventDefault(); setCurrentPage('shop'); setCategory('outing'); setIsAdminMode(false); }}>撿便袋包</a></li>
                        <li><a href="#outing" onClick={(e) => { e.preventDefault(); setCurrentPage('shop'); setCategory('outing'); setIsAdminMode(false); }}>胸背</a></li>
                        <li><a href="#outing" onClick={(e) => { e.preventDefault(); setCurrentPage('shop'); setCategory('outing'); setIsAdminMode(false); }}>牽繩</a></li>
                        <li><a href="#outing" onClick={(e) => { e.preventDefault(); setCurrentPage('shop'); setCategory('outing'); setIsAdminMode(false); }}>外出提袋</a></li>
                        <li><a href="#outing" onClick={(e) => { e.preventDefault(); setCurrentPage('shop'); setCategory('outing'); setIsAdminMode(false); }}>外出推車</a></li>
                        <li><a href="#outing" onClick={(e) => { e.preventDefault(); setCurrentPage('shop'); setCategory('outing'); setIsAdminMode(false); }}>外出碗</a></li>
                        <li><a href="#outing" onClick={(e) => { e.preventDefault(); setCurrentPage('shop'); setCategory('outing'); setIsAdminMode(false); }}>汽車坐墊</a></li>
                      </ul>
                    )}
                    {item.page === 'brands' && (
                      <ul className="dropdown-menu">
                        <li><a href="#brands" onClick={(e) => { e.preventDefault(); setCurrentPage('brands'); setIsAdminMode(false); }}>樂樂嚴選 (Lè Lè Design)</a></li>
                        <li><a href="#brands" onClick={(e) => { e.preventDefault(); setCurrentPage('brands'); setIsAdminMode(false); }}>肉肉推薦 (Ròu Ròu Selection)</a></li>
                        <li><a href="#brands" onClick={(e) => { e.preventDefault(); setCurrentPage('brands'); setIsAdminMode(false); }}>Wild Earth 毛孩機能</a></li>
                      </ul>
                    )}
                  </li>
                );
              })}
              {isLoggedIn && currentUser?.email === 'admin@lerou.com' && (
                <li>
                  <a 
                    href="#admin" 
                    className={`nav-link ${isAdminMode ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); setIsAdminMode(true); setCurrentPage('admin'); }}
                    style={{ gap: '0.4rem' }}
                  >
                    管理後台 <span className="admin-nav-indicator" style={{ display: 'inline-block', verticalAlign: 'middle' }}>ADMIN</span>
                  </a>
                </li>
              )}
            </ul>
          </nav>
        </div>

      </div>
    </header>
  );
};
