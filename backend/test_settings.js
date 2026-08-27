import jwt from 'jsonwebtoken';

const JWT_SECRET = 'lerou_jwt_secret_key_2026_highly_secure';
const token = jwt.sign({ username: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

const settingsPayload = {
  announcementText: '測試公告',
  heroTitle: '測試標題',
  heroDesc: '測試描述',
  heroImage: '/assets/pet_hero.jpg',
  paymentProvider: 'GreenWorld',
  paymentApiKey: 'test',
  logisticsProvider: 'ECPay',
  logisticsApiKey: 'test',
  googleClientId: 'test',
  lineChannelId: 'test',
  instagramAccessToken: 'test',
  customCategories: '[]',
  bannerBtnText: '探索全系列選物',
  layoutOrder: '["banner","products","instagram"]',
  instagramUrl: 'https://instagram.com/lerou_select',
  lineUrl: 'https://line.me/R/ti/p/@lerou'
};

async function run() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(settingsPayload)
    });
    console.log('Status Code:', res.status);
    const body = await res.text();
    console.log('Response Body:', body);
  } catch (err) {
    console.error('Fetch Error:', err);
  }
}

run();
