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
          <p>隨著步調加快與生活型態改變，健康不再只是生病時的治療，而是涵蓋日常飲食、心理舒壓、規律運動與定期檢驗的全方位管理。慧聚健康團隊為您整理建立全家預防保健的三大核心步驟！</p>
          
          <h3>步驟一：建立個人與家庭的日常健康數據檔案</h3>
          <p>了解自己與家人的身體狀態是健康管理的第一步。建議定期進行基礎健康數據紀錄，包含血壓、睡眠品質、飲食攝取與日常活動量，建立長期的健康動態趨勢。</p>
          
          <h3>步驟二：注重預防保健與均衡生活方式</h3>
          <p>預防勝於治療。透過營養均衡的飲食規劃、適當的補充與規律的生活作息，能為身體建立良好的防護基礎。</p>
          
          <h3>步驟三：尋求專業諮詢與定期檢視</h3>
          <p>面對豐富的健康資訊，尋求專業營養師或醫療專業團隊的客製化指導，能讓您與家人的健康管理更具效益與安心感。</p>
          
          <blockquote>
            <strong>慧聚健康照護提醒：</strong>定期關心自己與家人的身體變化，建立專屬的健康管理習慣，是送給家人最好的禮物。
          </blockquote>
        </>
      );
    }
    
    // recipe-2
    return (
      <>
        <p>隨著數位醫療與遠距照護科技發展，未來的健康管理將結合專業諮詢、智慧監測與客製化服務，為每個家庭提供全天候的健康陪伴。</p>
        
        <h3>1. 線上 1-on-1 專業健康諮詢</h3>
        <p>打破時間與地域限制，讓您隨時能與專業健康顧問、營養師進行深度討論，獲得符合個人需求的健康與作息建議。</p>
        
        <h3>2. 智慧照顧與健康趨勢追蹤</h3>
        <p>運用智慧裝置與平台數據分析，及時掌握長者與全家人的健康數據變化，提供主動式的提醒與照護服務。</p>
        
        <h3>3. 綜合性的全方位健康平台</h3>
        <p>慧聚健康將持續拓展服務範疇，包含預防保健方案、健康諮詢服務與智慧健康追蹤，致力成為每個家庭最值得信賴的健康夥伴。</p>
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
