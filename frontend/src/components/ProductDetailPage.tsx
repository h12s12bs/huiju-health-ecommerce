import React, { useState } from 'react';
import { ShoppingBag, ArrowLeft, Plus, Minus, Info, Truck, ShieldCheck, Heart } from 'lucide-react';
import type { Product } from '../App';

interface ProductDetailPageProps {
  product: Product;
  products: Product[];
  addToCart: (product: Product, quantity: number, e?: React.MouseEvent) => void;
  setCurrentPage: (page: any) => void;
  setSelectedProduct: (prod: Product | null) => void;
  setIsCartOpen: (open: boolean) => void;
  wishlist: string[];
  toggleWishlist: (id: string, e: React.MouseEvent) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  products,
  addToCart,
  setCurrentPage,
  setSelectedProduct,
  setIsCartOpen,
  wishlist,
  toggleWishlist
}) => {
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'shipping'>('desc');

  // Determine stock availability
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;
  const isPreOrder = !!product.isPreOrder;

  // Get related products from same category
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="product-detail-page-view" style={{ padding: '3rem 0 5rem' }}>
      <div className="container">
        
        {/* Breadcrumb & Back button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => setCurrentPage('home')}>首頁</span>
            <span style={{ margin: '0 0.5rem' }}>/</span>
            <span style={{ cursor: 'pointer' }} onClick={() => setCurrentPage('shop')}>線上商城</span>
            <span style={{ margin: '0 0.5rem' }}>/</span>
            <span style={{ color: 'var(--text-muted)' }}>{product.title}</span>
          </div>
          
          <button 
            className="btn btn-secondary" 
            onClick={() => setCurrentPage('shop')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <ArrowLeft size={16} /> 返回商城
          </button>
        </div>

        {/* Product details layout */}
        <div className="product-detail-grid" style={{ background: 'var(--bg-glass)', borderRadius: '16px', border: '1px solid var(--border)', padding: '2.5rem', marginBottom: '4rem' }}>
          <div className="detail-gallery" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img 
              src={product.image} 
              alt={product.title} 
              className="detail-img" 
              style={{ width: '100%', maxHeight: '480px', objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--border)' }} 
            />
          </div>

          <div className="detail-body">
            <div className="detail-header">
              <span className="product-category" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                {(product.brand && product.brand !== 'Lè Rou' && product.brand !== 'Lè Lè Design' && product.brand !== 'Ròu Ròu Selection') ? product.brand : '慧聚健康'} &middot; {product.category === 'apparel' ? '核心保健' : product.category === 'accessories' ? '個人護理' : product.category === 'outing' ? '順暢消化' : '健康商品'}
              </span>
              
              <h1 className="detail-title" style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0.5rem 0 1rem', color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
                {product.title}
              </h1>

              {/* Price Row */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', margin: '1.25rem 0' }}>
                <span className="detail-price" style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'var(--primary-dark)' }}>
                  NT$ {product.price.toLocaleString()}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span style={{ fontSize: '1.2rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                    NT$ {product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Stock and Pre-order Notice */}
              <div style={{ marginBottom: '1.5rem' }}>
                {isOutOfStock ? (
                  isPreOrder ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(217, 119, 6, 0.1)', color: '#d97706', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
                      <Info size={16} /> <span>預購商品（無現貨，下單後需等候 7-14 個工作天）</span>
                    </div>
                  ) : (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
                      <Info size={16} /> <span>此商品目前已售完（補貨中）</span>
                    </div>
                  )
                ) : (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <span>庫存狀態：現貨商品 (剩餘 {product.stock !== undefined ? product.stock : 8} 件)</span>
                  </div>
                )}
              </div>
            </div>

            {/* TAB SELECTOR HEADER */}
            <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', marginBottom: '1.5rem', gap: '1.5rem' }}>
              <button
                onClick={() => setActiveTab('desc')}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'desc' ? '3px solid var(--primary)' : '3px solid transparent',
                  padding: '0.5rem 0.25rem 0.75rem',
                  fontSize: '0.95rem',
                  fontWeight: activeTab === 'desc' ? 700 : 500,
                  color: activeTab === 'desc' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                商品描述
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'specs' ? '3px solid var(--primary)' : '3px solid transparent',
                  padding: '0.5rem 0.25rem 0.75rem',
                  fontSize: '0.95rem',
                  fontWeight: activeTab === 'specs' ? 700 : 500,
                  color: activeTab === 'specs' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                規格尺寸
              </button>
              <button
                onClick={() => setActiveTab('shipping')}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'shipping' ? '3px solid var(--primary)' : '3px solid transparent',
                  padding: '0.5rem 0.25rem 0.75rem',
                  fontSize: '0.95rem',
                  fontWeight: activeTab === 'shipping' ? 700 : 500,
                  color: activeTab === 'shipping' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                送貨及付款方式
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div style={{ minHeight: '160px', marginBottom: '2.5rem' }}>
              {activeTab === 'desc' && (
                <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                  {/<[a-z][\s\S]*>/i.test(product.description || '') ? (
                    <div dangerouslySetInnerHTML={{ __html: product.description || '' }} />
                  ) : (
                    <p style={{ whiteSpace: 'pre-line' }}>{product.description}</p>
                  )}
                </div>
              )}

              {activeTab === 'specs' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', fontSize: '0.9rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f3f3f3' }}>
                    <span style={{ color: 'var(--text-muted)' }}>材質規格 / 尺寸</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{product.dimensions || product.weight || '依外包裝標示'}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', fontSize: '0.9rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f3f3f3' }}>
                    <span style={{ color: 'var(--text-muted)' }}>產地製造</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{product.origin || '台灣原創設計'}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>品牌經銷</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{product.brand || '慧聚健康'}</span>
                  </div>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '1rem', lineHeight: 1.6 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <Truck size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>送貨方式</strong>
                      <p style={{ marginTop: '0.25rem', fontSize: '0.85rem' }}>全家/7-11 超商取貨付款 (運費 $100)、黑貓宅急便配送 (運費 $100)，單筆消費滿 NT$ 2,000 即享免運費優惠。</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <ShieldCheck size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>付款方式</strong>
                      <p style={{ marginTop: '0.25rem', fontSize: '0.85rem' }}>支援 LINE Pay 快速結帳、信用卡一次付清、ATM 轉帳以及超商取貨付款。</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quantity Selector and Buttons */}
            <div className="detail-actions" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div className="cart-item-quantity" style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', height: '48px', background: 'var(--bg-primary)' }}>
                <button 
                  className="cart-item-qbtn" 
                  onClick={() => qty > 1 && setQty(qty - 1)}
                  disabled={isOutOfStock && !isPreOrder}
                  style={{ width: '40px', height: '100%', border: 'none', background: 'none', cursor: isOutOfStock && !isPreOrder ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}
                >
                  <Minus size={14} />
                </button>
                <span className="cart-item-qval" style={{ width: '40px', textAlign: 'center', fontWeight: 'bold' }}>
                  {isOutOfStock && !isPreOrder ? 0 : qty}
                </span>
                <button 
                  className="cart-item-qbtn" 
                  onClick={() => setQty(qty + 1)}
                  disabled={isOutOfStock && !isPreOrder}
                  style={{ width: '40px', height: '100%', border: 'none', background: 'none', cursor: isOutOfStock && !isPreOrder ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}
                >
                  <Plus size={14} />
                </button>
              </div>

              <button 
                className="btn btn-primary" 
                style={{ 
                  flexGrow: 1, 
                  height: '48px', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '0.6rem', 
                  fontSize: '1rem',
                  fontWeight: 600,
                  background: isOutOfStock && !isPreOrder ? '#ccc' : 'var(--primary)',
                  cursor: isOutOfStock && !isPreOrder ? 'not-allowed' : 'pointer',
                  borderColor: isOutOfStock && !isPreOrder ? '#ccc' : 'var(--primary)'
                }}
                disabled={isOutOfStock && !isPreOrder}
                onClick={() => {
                  addToCart(product, qty);
                  setIsCartOpen(true);
                }}
              >
                <ShoppingBag size={18} />
                {isOutOfStock ? (isPreOrder ? '立即預購' : '已售完') : '加入購物車'}
              </button>
            </div>

            <div style={{ marginTop: '0.75rem' }}>
              <button
                type="button"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  borderRadius: '12px',
                  border: '1px solid',
                  background: wishlist.includes(product.id) ? '#ffebee' : '#fff',
                  borderColor: wishlist.includes(product.id) ? '#ff1744' : 'var(--border)',
                  color: wishlist.includes(product.id) ? '#d50000' : 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={(e) => toggleWishlist(product.id, e)}
              >
                <Heart size={18} fill={wishlist.includes(product.id) ? '#ff1744' : 'none'} color={wishlist.includes(product.id) ? '#ff1744' : 'currentColor'} />
                {wishlist.includes(product.id) ? '已加入追蹤清單' : '加入追蹤清單'}
              </button>
            </div>

          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="shop-section">
            <div className="section-header" style={{ marginBottom: '2.5rem' }}>
              <span className="section-subtitle">Recommendations</span>
              <h2 className="section-title" style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)' }}>相關推薦商品</h2>
            </div>
            
            <div className="products-grid">
              {relatedProducts.map(rp => (
                <div 
                  key={rp.id} 
                  className="product-card glass-panel"
                  onClick={() => { setSelectedProduct(rp); setQty(1); }}
                >
                  <div className="product-image-container">
                    <img src={rp.image} alt={rp.title} className="product-image" />
                  </div>
                  <div className="product-info">
                    <span className="product-category">{rp.brand || 'Lè Rou'} &middot; 精選</span>
                    <h3 className="product-title" style={{ fontSize: '0.9rem', height: '2.4rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', margin: '0.5rem 0' }}>
                      {rp.title}
                    </h3>
                    <div className="product-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="product-price-box">
                        <span className="product-price" style={{ fontWeight: 700 }}>NT$ {rp.price.toLocaleString()}</span>
                      </div>
                      <span className="recipe-link" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)', fontWeight: 700 }}>
                        詳情 &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};
