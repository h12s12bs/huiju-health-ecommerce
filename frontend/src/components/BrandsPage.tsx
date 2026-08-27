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
            專注於全方位健康生活與照護服務，為您與全家提供預防保健、專業諮詢與品質生活方案。
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
          {[
            {
              name: '慧聚健康平台 (Huiju Health)',
              desc: '整合全家預防保健方案與質感健康生活選品。以科學驗證與品質第一為原則，陪伴全家建立優質健康生活習慣。',
              tag: '預防保健 / 全家照顧',
              img: petHero,
              brandKey: 'Huiju Health'
            },
            {
              name: '慧聚諮詢與照護 (Huiju Care)',
              desc: '提供專業線上 1-on-1 健康諮詢服務、客製化健康規劃與智慧照顧數據追蹤。陪伴您打造最適合自己的健康生活藍圖。',
              tag: '專業諮詢 / 智慧照顧',
              img: dogBed,
              brandKey: 'Huiju Care'
            },
            {
              name: '慧聚研發學院 (Huiju Academy)',
              desc: '專注於未來健康趨勢研究與衛教推廣。定期分享全方位養生保健、日常防護與靈活活力保養知識。',
              tag: '健康衛教 / 未來趨勢',
              img: petFood,
              brandKey: 'Huiju Academy'
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
                  <div style={{ borderRadius: '12px', overflow: 'hidden', height: '320px', background: 'var(--bg-secondary)', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={petHero} alt={brand.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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
                      瀏覽品牌旗下商品 <ArrowRight size={16} />
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
                      瀏覽品牌旗下商品 <ArrowRight size={16} />
                    </button>
                  </div>
                  <div style={{ borderRadius: '12px', overflow: 'hidden', height: '320px', background: 'var(--bg-secondary)', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={petHero} alt={brand.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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
