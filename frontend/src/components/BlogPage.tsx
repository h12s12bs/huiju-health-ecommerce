import React from 'react';
import { ArrowLeft, Clock, Calendar, User } from 'lucide-react';

interface Article {
  id: string;
  tag: string;
  title: string;
  desc: string;
  img: string;
  content?: string;
}

interface BlogPageProps {
  blogArticles: Article[];
  selectedPost: Article | null;
  setSelectedPost: (post: Article | null) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({
  blogArticles,
  selectedPost,
  setSelectedPost
}) => {
  // Mock rich content for articles if not exists
  const getArticleContent = (id: string) => {
    if (id === 'recipe-1') {
      return (
        <>
          <p>現代人外食比例高、工作壓力大，深海魚油成為許多家庭日常不可或缺的頂級保健品。但面對市面上琳瑯滿目的魚油產品，該如何挑選才能發揮最佳保健功效？今天慧聚健康營養團隊特別為您整理深海魚油選購的三大關鍵指標！</p>
          
          <h3>原則一：認明 rTG 型態，高吸收率是關鍵</h3>
          <p>魚油的型態主要分為 TG 型、EE 型與 rTG 型。其中 rTG（Re-esterified Triglycerides）重組型魚油經過專利純化與結構重組，不僅濃度大幅提升至 80%-85% 以上，人體吸收率更是傳統 TG 型與 EE 型的 3 倍以上。</p>
          
          <h3>原則二：查看國際 IFOS 五星認證與無重金屬檢驗</h3>
          <p>海洋污染日益嚴峻，挑選魚油時必須確認原料來源是否來自無污染的冷水海域（如挪威或小型鯷魚），並確認通過 IFOS（International Fish Oil Standards）五星權威認證，確保塑化劑、重金屬與戴奧辛殘留均為未檢出。</p>
          
          <h3>原則三：補充時間與劑量建議</h3>
          <p>魚油屬於脂溶性營養素，建議於隨餐或餐後 30 分鐘內搭配溫開水食用，食物中的油脂能顯著提升 Omega-3 的吸收效率。成人每日建議補充 1000mg - 2000mg 的高純度魚油。</p>
          
          <blockquote>
            <strong>慧聚健康營養提醒：</strong>若同時有在服用抗凝血藥物或即將進行手術者，建議在補充高濃度魚油前先諮詢專業醫師或營養師意見。
          </blockquote>
        </>
      );
    }
    
    // recipe-2
    return (
      <>
        <p>隨著平板手機與電腦螢幕成為工作與生活不可或缺的一部份，許多人常常感到眼睛乾澀與疲勞。游離型葉黃素搭配黃金比例，能有效建立防護層，提供極緻晶亮感受。</p>
        
        <h3>什麼是黃金比例 10:2？</h3>
        <p>美國國家衛生研究院（NIH）大型研究指出，葉黃素（Lutein）與玉米黃素（Zeaxanthin）以 10mg : 2mg 的比例搭配時，能達到最佳的協同吸收與防護效能。</p>
        
        <h3>游離型（Free Form）vs 酯化型（Ester Form）</h3>
        <p>傳統酯化型葉黃素分子較大，需要經由腸道酵素水解後才能被吸收；而專利游離型葉黃素（如 FloraGLO）分子量小，無需消化過程即可直接為腸道高效吸收，生物利用率提升 23%。</p>
        
        <h3>搭配複方效果更佳</h3>
        <p>除了葉黃素與玉米黃素外，添加山桑子（富含花青素）、黑大豆皮萃取物以及鋅元素，能全方位舒緩疲勞感，達到加倍的防護力。</p>
      </>
    );
  };

  return (
    <div className="blog-page-view" style={{ padding: '3rem 0 5rem' }}>
      <div className="container">
        
        {selectedPost ? (
          /* ==================== SINGLE POST VIEW ==================== */
          <article style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => setSelectedPost(null)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.85rem', marginBottom: '2rem' }}
            >
              <ArrowLeft size={16} /> 返回文章列表
            </button>

            <div style={{ marginBottom: '2rem' }}>
              <span className="recipe-tag" style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                {selectedPost.tag}
              </span>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', margin: '1rem 0 1.25rem', color: 'var(--text-primary)', lineHeight: '1.3' }}>
                {selectedPost.title}
              </h1>
              
              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Calendar size={14} /> 2026 年 8 月</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><User size={14} /> 慧聚健康營養團隊</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Clock size={14} /> 4 分鐘閱讀時間</span>
              </div>
            </div>

            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '2.5rem' }}>
              <img 
                src={(selectedPost.img && !selectedPost.img.includes('pet_') && !selectedPost.img.includes('dog_') && !selectedPost.img.includes('cat_')) ? selectedPost.img : '/assets/logo.jpg'} 
                alt={selectedPost.title} 
                style={{ width: '100%', maxHeight: '420px', objectFit: 'contain', background: 'var(--bg-secondary)', padding: '1.5rem' }} 
              />
            </div>

            <div className="blog-post-content" style={{ fontSize: '1.05rem', lineHeight: '1.9', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {selectedPost.content ? (
                <div dangerouslySetInnerHTML={{ __html: selectedPost.content }}></div>
              ) : (
                getArticleContent(selectedPost.id)
              )}
            </div>
          </article>
        ) : (
          /* ==================== BLOG POSTS LIST VIEW ==================== */
          <div>
            <div className="section-header" style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <span className="section-subtitle">Health & Wellness Blog</span>
              <h2 className="section-title">慧聚健康專欄</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem' }}>與您分享生醫保健、葉黃素吸收與日常養生保健常識</p>
            </div>

            <div className="recipes-grid">
              {blogArticles.map(recipe => (
                <div 
                  key={recipe.id} 
                  className="recipe-card glass-panel"
                  onClick={() => setSelectedPost(recipe)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ height: '220px', overflow: 'hidden', background: 'var(--bg-secondary)', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img 
                      src={(recipe.img && !recipe.img.includes('pet_') && !recipe.img.includes('dog_') && !recipe.img.includes('cat_')) ? recipe.img : '/assets/logo.jpg'} 
                      alt={recipe.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                    />
                  </div>
                  <div className="recipe-content">
                    <span className="recipe-tag">{recipe.tag}</span>
                    <h3 className="recipe-title">{recipe.title}</h3>
                    <p className="recipe-desc">{recipe.desc}</p>
                    <span className="recipe-link">
                      閱讀文章內容 &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
