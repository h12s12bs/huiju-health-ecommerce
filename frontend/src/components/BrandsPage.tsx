import React from 'react';
import { ArrowRight } from 'lucide-react';

interface BrandsPageProps {
  petHero: string;
  dogBed: string;
  petFood: string;
  setCurrentPage: (page: any) => void;
  setCategory: (category: string) => void;
}

export const BrandsPage: React.FC<BrandsPageProps> = ({
  petHero,
  dogBed,
  petFood,
  setCurrentPage,
  setCategory
}) => {
  return (
    <div className="brands-page-view" style={{ padding: '3rem 0 5rem' }}>
      <div className="container">
        
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span className="section-subtitle">Huiju Health Brands</span>
          <h2 className="section-title">慧聚健康品牌專區</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
            專注於國際專利原料與科學實驗數據，為您與全家嚴選高品質保健商品。
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
          {[
            {
              name: '慧聚健康 (Huiju Health)',
              desc: '專注於頂級高純度 rTG 深海魚油與專利軟膠囊萃取技術。以挪威優質遠洋鯷魚原料為起點，通過國際 IFOS 五星無重金屬安全認證，提供最純淨的心血管與思緒敏捷滋養。',
              tag: '頂級魚油 / 國際認證',
              img: petHero,
              brandKey: 'Huiju Health'
            },
            {
              name: '慧聚研發 (Huiju Labs)',
              desc: '專為現代螢幕族與上班族打造。結合 FloraGLO 美國專利游離型葉黃素與黃金比例 10:2，並添加山桑子與黑大豆皮萃取物，全方位守護視界晶亮舒適。',
              tag: '游離葉黃素 / 晶亮護理',
              img: dogBed,
              brandKey: 'Huiju Labs'
            },
            {
              name: 'HerbaCare 專利草本',
              desc: '嚴選 15 支高活性專利益生菌與天然漢方草本，搭配水溶性膳食纖維與包埋專利技術。有效穩定通過胃酸，維護消化道順暢機能與調節體質。',
              tag: '百億益生菌 / 漢方養生',
              img: petFood,
              brandKey: 'HerbaCare'
            }
          ].map((brand, idx) => (
            <div 
              key={idx} 
              className="recipe-card glass-panel" 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: idx % 2 === 0 ? '1.2fr 1.8fr' : '1.8fr 1.2fr', 
                gap: '2.5rem', 
                padding: '2.5rem', 
                borderRadius: '16px',
                alignItems: 'center'
              }}
            >
              {idx % 2 === 0 ? (
                <>
                  <div style={{ borderRadius: '12px', overflow: 'hidden', height: '320px' }}>
                    <img src={brand.img} alt={brand.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <span className="recipe-tag" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600 }}>{brand.tag}</span>
                    <h3 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-serif)', margin: '0.75rem 0 1.25rem', color: 'var(--text-primary)' }}>{brand.name}</h3>
                    <p style={{ fontSize: '0.95rem', lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: '2rem' }}>{brand.desc}</p>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => {
                        setCurrentPage('shop');
                        setCategory('all');
                      }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      瀏覽品牌旗下精品 <ArrowRight size={16} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="recipe-tag" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600 }}>{brand.tag}</span>
                    <h3 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-serif)', margin: '0.75rem 0 1.25rem', color: 'var(--text-primary)' }}>{brand.name}</h3>
                    <p style={{ fontSize: '0.95rem', lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: '2rem' }}>{brand.desc}</p>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => {
                        setCurrentPage('shop');
                        setCategory('all');
                      }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      瀏覽品牌旗下精品 <ArrowRight size={16} />
                    </button>
                  </div>
                  <div style={{ borderRadius: '12px', overflow: 'hidden', height: '320px' }}>
                    <img src={brand.img} alt={brand.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
