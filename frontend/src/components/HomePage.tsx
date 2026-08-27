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
    img: s.img || (idx === 0 ? (heroImage || petHero) : idx === 1 ? dogBed : petFood),
    title: s.title || heroTitle || '樂肉選品\n與毛孩共居的質感生活',
    desc: s.desc || '與樂樂與肉肉的溫暖共居日常',
    btnText: s.btnText || bannerBtnText || '探索樂肉選品'
  })) : [
    { 
      img: heroImage || petHero, 
      title: heroTitle || '樂肉選品\n與毛孩共居的質感生活',
      desc: '與樂樂與肉肉的溫暖共居日常',
      btnText: bannerBtnText || '探索樂肉選品'
    },
    { 
      img: dogBed, 
      title: '職人手工雙針雙線\n義大利植鞣牛皮牽繩',
      desc: '經年累月的溫潤皮革焦糖色澤',
      btnText: '查看植鞣選品'
    },
    { 
      img: petFood, 
      title: '舒緩分離焦慮\n天然藏食嗅聞益智玩具',
      desc: '健康消耗毛孩多餘精力與壓力',
      btnText: '選購紓壓玩具'
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
            <section key="banner" className="hero-section" style={{ height: '70vh', minHeight: '480px', position: 'relative', overflow: 'hidden' }}>
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
                    backgroundImage: `url(${slide.img})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transition: 'opacity 0.8s ease-in-out',
                    opacity: activeSlide === idx ? 1 : 0,
                    zIndex: activeSlide === idx ? 1 : 0
                  }}
                >
                  <div className="hero-overlay" style={{ background: 'rgba(0, 0, 0, 0.25)', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}></div>
                  <div className="container" style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', alignItems: 'center' }}>
                    <div className="hero-content" style={{ maxWidth: '650px', textAlign: 'left' }}>
                      <h1 className="hero-title" style={{ whiteSpace: 'pre-line', fontSize: '2.8rem', fontFamily: 'var(--font-serif)', lineHeight: 1.2, color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.3)', marginBottom: '1rem' }}>
                        {slide.title}
                      </h1>
                      <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '1.1rem', marginBottom: '2rem', fontWeight: 500 }}>
                        {slide.desc}
                      </p>
                      <button 
                        className="btn btn-primary" 
                        onClick={() => { setCurrentPage('shop'); setCategory('all'); }}
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '0.6rem', 
                          padding: '0.85rem 2rem', 
                          fontSize: '1rem', 
                          fontWeight: 600, 
                          borderRadius: '50px',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
                        }}
                      >
                        {slide.btnText || bannerBtnText || '探索全系列選物'} <ArrowRight size={18} />
                      </button>
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
                  <h2 className="section-title" style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)' }}>毛孩精品系列</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>依據真實使用體驗，為您嚴選的高品質寵物生活用具</p>
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
                            <img src={product.image} alt={product.title} className="product-image" />
                            
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
                            <span className="product-category">{product.brand || 'Lè Rou'} &middot; 精選</span>
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
                  <span className="section-subtitle">Instagram @lerou_select</span>
                  <h2 className="section-title" style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)' }}>生活美學分享牆</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>樂肉官方 IG 社群即時同步，與我們分享您與毛孩的質感穿搭！</p>
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
                          <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#333' }}>lerou_select</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Instagram 貼文</div>
                        </div>
                      </div>
                      
                      <div style={{ height: '220px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #eee' }}>
                        <img src={post.media_url} alt="IG feed image" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
