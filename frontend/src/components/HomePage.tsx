import React, { useState, useEffect } from 'react';
import { ArrowRight, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '../App';

interface HomePageProps {
  petHero: string;
  dogBed: string;
  petFood: string;
  heroTitle: string;
  heroImage: string;
  heroSlides?: Array<{ id: string; title: string; desc: string; img: string; btnText: string }>;
  products: Product[];
  setCurrentPage: (page: any) => void;
  setCategory: (category: string) => void;
  setSelectedProduct: (prod: Product | null) => void;
  addToCart: (product: Product, quantity: number, e?: React.MouseEvent) => void;
  customCategories: Array<{ id: string; name: string }>;
  bannerBtnText: string;
  layoutOrder: string[];
  blogArticles: any[];
  appLogo: string;
}

export const HomePage: React.FC<HomePageProps> = ({
  petHero,
  dogBed,
  petFood,
  heroTitle,
  heroImage,
  heroSlides,
  products,
  setCurrentPage,
  setCategory,
  setSelectedProduct,
  addToCart,
  customCategories,
  bannerBtnText,
  layoutOrder,
  blogArticles,
  appLogo
}) => {
  const slides = (heroSlides && heroSlides.length > 0) ? heroSlides.map((s, idx) => ({
    img: s.img || appLogo,
    title: s.title || heroTitle || '慧聚健康\n帶給每個家庭全方位的健康與照顧',
    desc: s.desc || '以專業、創新與關懷為核心。我們致力於提供全方位健康照護方案、預防保健與優質生活體驗。',
    btnText: s.btnText || bannerBtnText || '探索慧聚健康'
  })) : [
    { 
      img: appLogo, 
      title: heroTitle || '慧聚健康\n帶給每個家庭全方位的健康與照顧',
      desc: '以專業、創新與關懷為核心。我們致力於提供全方位健康照護方案、預防保健與優質生活體驗。',
      btnText: bannerBtnText || '探索慧聚健康'
    },
    { 
      img: appLogo, 
      title: '全方位健康管理與諮詢服務\n打造專屬您的健康生活藍圖',
      desc: '整合預防保健、健康諮詢與品質生活方案，陪伴您與家人邁向更健康美好的每一天。',
      btnText: '了解健康服務'
    },
    { 
      img: appLogo, 
      title: '嚴選品質與科學驗證\n帶給每個家庭安心與健康',
      desc: '從日常健康維護到未來智慧健康照護，慧聚健康為您把關每一個細節。',
      btnText: '探索全站服務'
    }
  ];

  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedCatId, setSelectedCatId] = useState('all');
  const [instagramPosts, setInstagramPosts] = useState<any[]>([]);

  useEffect(() => {
    const BACKEND_URL = import.meta.env.DEV ? '' : window.location.origin;
    fetch(`${BACKEND_URL}/api/instagram/feed`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setInstagramPosts(data);
        }
      })
      .catch(err => {
        console.error('Error fetching Instagram posts:', err);
      });
  }, []);

  // Auto rotate banner every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  // Filter products based on active tab
  const filteredProducts = selectedCatId === 'all'
    ? products
    : products.filter(p => p.category === selectedCatId);

  // Tabs array: All + Custom categories list
  const tabs = [
    { id: 'all', name: '全部商品' },
    ...customCategories
  ];

  return (
    <div className="homepage-view">
      
      {layoutOrder.map((sectionKey) => {
        // 1. HERO CAROUSEL BANNER SECTION
        if (sectionKey === 'banner') {
          return (
            <section key="banner" className="hero-section" style={{ height: '72vh', minHeight: '500px', position: 'relative', overflow: 'hidden', background: '#1b4332' }}>
              {slides.map((slide, idx) => (
                <div 
                  key={idx}
                  className="hero-slide"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 60%, #40916c 100%)',
                    transition: 'opacity 0.8s ease-in-out',
                    opacity: activeSlide === idx ? 1 : 0,
                    zIndex: activeSlide === idx ? 1 : 0
                  }}
                >
                  <div className="container" style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem' }}>
                    <div className="hero-content" style={{ maxWidth: '650px', textAlign: 'left' }}>
                      <span style={{ display: 'inline-block', padding: '0.35rem 1rem', background: 'rgba(197, 160, 89, 0.25)', color: '#f4e8c1', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid rgba(197, 160, 89, 0.4)', marginBottom: '1.25rem' }}>
                        🌿 慧聚健康 · 專利品質保健
                      </span>
                      <h1 className="hero-title" style={{ whiteSpace: 'pre-line', fontSize: '2.8rem', fontFamily: 'var(--font-serif)', lineHeight: 1.25, color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.3)', marginBottom: '1.25rem' }}>
                        {slide.title}
                      </h1>
                      <p style={{ color: 'rgba(255,255,255,0.92)', fontSize: '1.1rem', marginBottom: '2.2rem', fontWeight: 400, lineHeight: 1.6 }}>
                        {slide.desc}
                      </p>
                      <button 
                        className="btn" 
                        onClick={() => { setCurrentPage('shop'); setCategory('all'); }}
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '0.6rem', 
                          padding: '0.9rem 2.2rem', 
                          fontSize: '1rem', 
                          fontWeight: 600, 
                          borderRadius: '50px',
                          background: '#c5a059',
                          color: '#fff',
                          border: 'none',
                          boxShadow: '0 6px 20px rgba(197,160,89,0.4)',
                          cursor: 'pointer'
                        }}
                      >
                        {slide.btnText || bannerBtnText || '探索慧聚健康全系列'} <ArrowRight size={18} />
                      </button>
                    </div>

                    <div className="hero-logo-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '320px', height: '320px', borderRadius: '24px', background: '#ffffff', padding: '1.75rem', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '4px solid #c5a059', flexShrink: 0 }}>
                      <img src={appLogo} alt="慧聚健康 Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                  </div>
                </div>
              ))}

              {/* Carousel controls */}
              <button 
                className="carousel-control prev" 
                onClick={handlePrevSlide}
                aria-label="上一張"
                style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', transition: 'background 0.3s' }}
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                className="carousel-control next" 
                onClick={handleNextSlide}
                aria-label="下一張"
                style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', transition: 'background 0.3s' }}
              >
                <ChevronRight size={24} />
              </button>

              {/* Carousel indicator dots */}
              <div className="carousel-dots" style={{ position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', gap: '0.5rem' }}>
                {slides.map((_, idx) => (
                  <button 
                    key={idx}
                    className={`carousel-dot ${activeSlide === idx ? 'active' : ''}`}
                    onClick={() => setActiveSlide(idx)}
                    aria-label={`切換至幻燈片 ${idx + 1}`}
                    style={{ width: '10px', height: '10px', borderRadius: '50%', border: 'none', background: activeSlide === idx ? '#fff' : 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 0 }}
                  />
                ))}
              </div>
            </section>
          );
        }

        // 2. PRODUCTS GRID SECTION WITH TAB FILTER
        if (sectionKey === 'products') {
          return (
            <section key="products" className="shop-section" style={{ padding: '5rem 0', borderBottom: '1px solid var(--border)' }}>
              <div className="container">
                
                {/* Header title */}
                <div className="section-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                  <span className="section-subtitle">Premium Selection</span>
                  <h2 className="section-title" style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)' }}>慧聚健康全方位服務與商品</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>為您與家人提供預防保健、專業諮詢與品質生活方案</p>
                </div>

                {/* Categories Tab Selector */}
                <div className="category-tabs" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '3rem' }}>
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      className={`category-btn ${selectedCatId === tab.id ? 'active' : ''}`}
                      onClick={() => setSelectedCatId(tab.id)}
                      style={{ padding: '0.6rem 1.5rem', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 600 }}
                    >
                      {tab.name}
                    </button>
                  ))}
                </div>

                {/* Filtered Products Grid */}
                {filteredProducts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
                    <p style={{ fontSize: '1rem' }}>此分類目前無商品，敬請期待全新商品上架！</p>
                  </div>
                ) : (
                  <div className="products-grid">
                    {filteredProducts.map(product => {
                      // Determine availability based on stock
                      const isOutOfStock = product.stock !== undefined && product.stock <= 0;
                      const isPreOrder = !!product.isPreOrder;

                      return (
                        <div 
                          key={product.id} 
                          className="product-card glass-panel"
                          onClick={() => { setSelectedProduct(product); setCurrentPage('product-detail'); }}
                          style={{ cursor: 'pointer', position: 'relative' }}
                        >
                          <div className="product-image-container">
                            <img 
                              src={(product.image && !product.image.includes('pet_') && !product.image.includes('dog_') && !product.image.includes('cat_')) ? product.image : appLogo} 
                              alt={product.title} 
                              className="product-image" 
                              style={{ objectFit: 'contain', padding: '0.75rem' }}
                            />
                            
                            {/* Colorful CTA Badges */}
                            <div className="product-badges" style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexWrap: 'wrap', gap: '4px', zIndex: 5 }}>
                              {product.isNew && (
                                <span className="badge badge-new">新品</span>
                              )}
                              {isOutOfStock && (
                                <span className="badge" style={{ background: '#333', color: '#fff' }}>
                                  {isPreOrder ? '預購' : '已售完'}
                                </span>
                              )}
                              {product.badges && product.badges.map((badgeText, idx) => {
                                let badgeClass = "badge-custom-1";
                                if (badgeText.includes("熱銷") || badgeText.includes("推薦") || badgeText.includes("爆款")) badgeClass = "badge-hot";
                                else if (badgeText.includes("折") || badgeText.includes("優惠") || badgeText.includes("特價")) badgeClass = "badge-promo";
                                else if (idx % 2 === 1) badgeClass = "badge-custom-2";
                                
                                return (
                                  <span key={idx} className={`badge ${badgeClass}`}>
                                    {badgeText}
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          <div className="product-info">
                            <span className="product-category">{(product.brand && product.brand !== 'Lè Rou' && product.brand !== 'Lè Lè Design' && product.brand !== 'Ròu Ròu Selection') ? product.brand : '慧聚健康'} &middot; 保健商品</span>
                            <h3 className="product-title" style={{ fontSize: '0.95rem', height: '2.4rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', margin: '0.5rem 0' }}>
                              {product.title}
                            </h3>
                            <div className="product-footer" style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div className="product-price-box">
                                <span className="product-price" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
                                  NT$ {product.price.toLocaleString()}
                                </span>
                                {product.originalPrice && product.originalPrice > product.price && (
                                  <span className="product-original-price" style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                                    NT$ {product.originalPrice.toLocaleString()}
                                  </span>
                                )}
                              </div>

                              {/* Add to cart / Pre-order button */}
                              <button 
                                className="add-to-cart-icon-btn"
                                onClick={(e) => {
                                  if (isOutOfStock && !isPreOrder) {
                                    e.stopPropagation();
                                    alert('此商品目前已售完！');
                                    return;
                                  }
                                  addToCart(product, 1, e);
                                }}
                                disabled={isOutOfStock && !isPreOrder}
                                aria-label={isOutOfStock ? (isPreOrder ? "預購此商品" : "商品已售完") : "直接加入選物車"}
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '50%',
                                  background: isOutOfStock && !isPreOrder ? '#ccc' : 'var(--primary)',
                                  color: 'var(--bg-primary)',
                                  border: 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: isOutOfStock && !isPreOrder ? 'not-allowed' : 'pointer',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                              >
                                <ShoppingBag size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            </section>
          );
        }

        // 3. INSTAGRAM FEED SYNCED SECTION
        if (sectionKey === 'instagram') {
          const displayPosts = instagramPosts.length > 0 ? instagramPosts.slice(0, 3) : blogArticles.slice(0, 3).map(article => ({
            id: article.id,
            media_url: article.img,
            permalink: 'https://instagram.com',
            caption: article.desc,
            timestamp: new Date().toISOString(),
            like_count: article.id === 'recipe-1' ? 1286 : 942
          }));

          return (
            <section key="instagram" className="shop-section" style={{ padding: '5rem 0', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
              <div className="container">
                
                {/* Header */}
                <div className="section-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                  <span className="section-subtitle">Instagram @huiju_health</span>
                  <h2 className="section-title" style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)' }}>健康美學分享牆</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>慧聚健康官方 IG 即時同步，與我們分享您的日常健康與靈活活力保養！</p>
                </div>

                {/* IG feed cards grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  {displayPosts.map(post => (
                    <div key={post.id} className="recipe-card glass-panel" style={{ margin: 0, padding: '1.25rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#fff' }}>
                      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f5f5f5', border: '1px solid var(--border)', overflow: 'hidden' }}>
                          <img src={appLogo} alt="IG profile avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#333' }}>huiju_health</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Instagram 貼文</div>
                        </div>
                      </div>
                      
                      <div style={{ height: '220px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-secondary)', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img 
                          src={(post.media_url && !post.media_url.includes('pet_') && !post.media_url.includes('dog_') && !post.media_url.includes('cat_')) ? post.media_url : appLogo} 
                          alt="慧聚健康官方貼文" 
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                        />
                      </div>
                      
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, minHeight: '3.6rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                        {post.caption}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', borderTop: '1px solid #f5f5f5', paddingTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span style={{ fontWeight: 600 }}>❤️ {post.like_count.toLocaleString()} 次按讚</span>
                        <a href={post.permalink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>在 IG 上查看 &rarr;</a>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </section>
          );
        }

        return null;
      })}

    </div>
  );
};
