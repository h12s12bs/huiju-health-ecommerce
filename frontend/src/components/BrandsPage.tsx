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
          <span className="section-subtitle">Curated Brands</span>
          <h2 className="section-title">精選品牌美學</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
            專注於純手作質感與極致舒適機能，為您的毛毛寶貝嚴選生活配備。
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
          {[
            {
              name: 'Lè Lè Design (樂樂嚴選)',
              desc: '源自對奶油白色毛孩（如薩摩耶、金毛、拉布拉多）身型與毛色的體貼設計。專注於高防潑水機能雨衣、單手按壓隨行水杯與極輕量透氣胸背帶。強調大雨防水性、夜間安全反光條與溫暖舒服的材質，讓愛犬在多雨季節依然能自在探索世界。',
              tag: '機能防護 / 奶油白美學',
              img: petHero,
              brandKey: 'Lè Lè Design'
            },
            {
              name: 'Ròu Ròu Selection (肉肉推薦)',
              desc: '專為注重細節、手作溫度與經久耐用度的毛爸媽設計。主打義大利進口頂級植鞣革，由職人手工雙針雙線縫製的牽繩項圈，以及精緻雙色保暖針織毛衣。溫潤的焦糖紅銅皮革色澤，隨時光更顯沉穩。純黃銅防鏽五金扣件，堅固牢靠，體現卓越工藝。',
              tag: '職人手工 / 皮革焦糖美學',
              img: dogBed,
              brandKey: 'Ròu Ròu Selection'
            },
            {
              name: 'Wild Earth (荒野綠動)',
              desc: '致力於為大自然與毛孩提供綠色友善守護的原創品牌。嚴選純天然厚實帆布與耐磨抗咬的環保嗅聞藏食玩具，設計出兼具腦力開發與分離焦慮排解的趣味玩具，在玩耍的過程中自然消耗過剩精力，享受綠色純淨的陪伴時光。',
              tag: '天然環保 / 益智玩具',
              img: petFood,
              brandKey: 'Wild Earth'
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
