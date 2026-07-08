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
          <p>多雨氣候的台灣，經常面臨毛孩出門就淋濕感冒的窘境。買雨衣最怕量錯尺寸摩擦受傷，或者買了全包覆式卻限制了關節跑跳。今天樂肉美學生活誌教你如何以最精確的三條線量出完美舒適的剪裁！</p>
          
          <h3>第一條線：背長 (Back Length)</h3>
          <p>背長是從毛孩的脖子根部（大概是項圈配戴的位置）一路測量到尾巴根部。量的時候請務必讓毛孩維持站立姿勢，如果坐著或躺著，量出來的數值會偏長，導致買回去的雨衣下擺太長拖地，容易踩到甚至弄髒。</p>
          
          <h3>第二條線：胸圍 (Chest Girth)</h3>
          <p>胸圍是影響服飾舒適度最關鍵的數值。請找到狗狗前腳後方、胸腔最寬、最厚實的一圈進行測量。量的時候尺要貼合毛髮，但不宜勒得太緊，建議預留 2-3 公分的空間（大約兩根手指的寬度），這樣毛孩跑跳時胸腔擴張才不會有壓迫感。</p>
          
          <h3>第三條線：頸圍 (Neck Girth)</h3>
          <p>頸圍是沿著項圈通常配戴的地方量一圈。機能雨衣為了防雨水滲入，領口通常會做抽繩收緊，所以量取合適的領口數值，能確保抽繩束緊後防風防雨又不會造成毛孩吞嚥困難。</p>
          
          <blockquote>
            <strong>樂肉美學提醒：</strong>薩摩耶、黃金獵犬等雙層毛豐厚或毛髮蓬鬆的毛孩，在量胸圍時要稍微把尺貼緊皮膚，否則量出來的數值會因為蓬鬆毛髮而被放大兩三個尺寸，穿起來就會過於寬鬆累贅。
          </blockquote>
          
          <h3>機能面料的保養</h3>
          <p>樂肉機能雨衣採用特製防潑水透氣面料，每次散步回家後，千萬不要直接丟進洗衣機脫水！只需要以常溫清水沖洗表面泥沙與髒污，隨後使用衣架懸掛於陰涼通風處陰乾，即可維持極佳防潑水塗層效能。</p>
        </>
      );
    }
    
    // recipe-2
    return (
      <>
        <p>優質皮革配件就像美酒，隨著時間與毛孩家長的共同足跡而發酵出獨一無二的風味。義大利植鞣牛皮之所以被奉為毛孩牽繩的首選，不只是因為它天然無毒的植物鞣製工藝，更是因為它卓越的抗拉伸韌性與絕佳手感。</p>
        
        <h3>什麼是植鞣革的「經年變化」？</h3>
        <p>植物鞣製（Vegetable Tanning）是使用從樹皮、果實等植物中萃取的單寧酸進行皮革鞣製。剛出廠的純素植鞣皮革會呈現淡雅的燕麥奶白或粉膚色。隨著每次您握在手中散步時的掌心油脂、日常陽光照射與毛孩毛髮的油脂摩擦，皮革表面會慢慢蛻變為沉穩內斂的蜜焦糖色，並散發溫潤自然的光澤。</p>
        
        <h3>職人雙針縫線的奧秘</h3>
        <p>市售量產牽繩大多使用針車單線縫製，一旦斷了一節，整條縫線就會像骨牌一樣全部鬆開，這在戶外拉力極大時是非常危險的。樂肉選品嚴選的職人手縫項圈牽繩，堅持採用馬鞍雙針交錯縫法。即便其中一條線磨損斷裂，另一條線依然能維持強固的鎖定力，保障出遊的絕對安全。</p>
        
        <h3>純黃銅防鏽五金</h3>
        <p>為避免牽繩受潮五金生鏽，我們全系列採用高規格實心純黃銅扣環。黃銅同樣會隨著歲月有些許氧化後的古銅質感，與皮革的焦糖色相得益彰，散發濃濃的復古英倫氣息。</p>
        
        <h3>日常保養三步驟</h3>
        <ol>
          <li><strong>避水乾燥</strong>：皮革若不慎淋雨，請立刻使用乾布輕輕按壓吸乾水分，放置於通風陰涼處自然晾乾，切勿使用吹風機熱風烘烤，否則皮革纖維會硬化龜裂。</li>
          <li><strong>油脂滋養</strong>：每季或每半年，建議使用極少許專用貂油或皮革保養油，以棉布畫圈抹勻表面。這能重新注入皮革纖維所需的油脂，維持皮革柔軟防裂。</li>
          <li><strong>防霉存放</strong>：若長期不使用，請放進隨附的防塵袋中，並置於乾燥陰涼處，內放乾燥劑，避免台灣潮濕氣候引起發霉。</li>
        </ol>
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
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Calendar size={14} /> 2026 年 7 月</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><User size={14} /> 樂肉主廚級毛爸媽</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Clock size={14} /> 5 分鐘閱讀時間</span>
              </div>
            </div>

            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '2.5rem' }}>
              <img 
                src={selectedPost.img} 
                alt={selectedPost.title} 
                style={{ width: '100%', maxHeight: '420px', objectFit: 'cover' }} 
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
              <span className="section-subtitle">Dog Life Blog</span>
              <h2 className="section-title">毛孩美學生活誌</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem' }}>與您分享機能穿搭、皮革保養與毛孩居家質感生活小學問</p>
            </div>

            <div className="recipes-grid">
              {blogArticles.map(recipe => (
                <div 
                  key={recipe.id} 
                  className="recipe-card glass-panel"
                  onClick={() => setSelectedPost(recipe)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="recipe-img-container">
                    <img src={recipe.img} alt={recipe.title} className="recipe-img" />
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
