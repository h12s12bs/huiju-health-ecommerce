import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

let dbInstance: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  const dbDir = path.dirname(path.resolve(process.env.DATABASE_URL || './data/lerou_ecommerce.db'));
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  dbInstance = await open({
    filename: process.env.DATABASE_URL || './data/lerou_ecommerce.db',
    driver: sqlite3.Database
  });

  // Enable foreign keys
  await dbInstance.exec('PRAGMA foreign_keys = ON');

  // Initialize tables
  await initTables(dbInstance);

  return dbInstance;
}

async function initTables(db: Database) {
  // 1. Products Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      originalPrice REAL,
      image TEXT NOT NULL,
      rating REAL DEFAULT 5.0,
      reviews INTEGER DEFAULT 0,
      description TEXT,
      origin TEXT,
      weight TEXT,
      storage TEXT,
      comfortRating INTEGER,
      cookingTip TEXT,
      badges TEXT, -- Comma-separated badges
      isNew INTEGER DEFAULT 0, -- 0 = false, 1 = true
      brand TEXT
    )
  `);

  // 2. Orders Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      items TEXT NOT NULL, -- JSON stringified array
      total REAL NOT NULL,
      status TEXT NOT NULL,
      shippingName TEXT,
      shippingPhone TEXT,
      shippingAddress TEXT,
      shippingEmail TEXT,
      paymentType TEXT
    )
  `);

  // 3. Customers Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      provider TEXT NOT NULL,
      signupDate TEXT NOT NULL,
      ordersCount INTEGER DEFAULT 0,
      totalSpent REAL DEFAULT 0,
      points INTEGER DEFAULT 0
    )
  `);

  // 4. Config/Settings Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS system_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // 5. Admins Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      username TEXT PRIMARY KEY,
      password TEXT NOT NULL
    )
  `);

  // 6. Email OTP Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS email_otps (
      email TEXT PRIMARY KEY,
      otp TEXT NOT NULL,
      expiresAt INTEGER NOT NULL
    )
  `);

  // Run dynamic migrations to add new columns if they do not exist
  try {
    await db.exec("ALTER TABLE orders ADD COLUMN logisticsType TEXT");
  } catch (err) {}
  try {
    await db.exec("ALTER TABLE orders ADD COLUMN logisticsSubType TEXT");
  } catch (err) {}
  try {
    await db.exec("ALTER TABLE orders ADD COLUMN cvsStoreID TEXT");
  } catch (err) {}
  try {
    await db.exec("ALTER TABLE orders ADD COLUMN cvsStoreName TEXT");
  } catch (err) {}
  try {
    await db.exec("ALTER TABLE orders ADD COLUMN ecpayLogisticsId TEXT");
  } catch (err) {}
  try {
    await db.exec("ALTER TABLE orders ADD COLUMN ecpayLogisticsStatus TEXT");
  } catch (err) {}
  try {
    await db.exec("ALTER TABLE customers ADD COLUMN password TEXT");
  } catch (err) {}
  try {
    await db.exec("ALTER TABLE customers ADD COLUMN phone TEXT");
  } catch (err) {}
  try {
    await db.exec("ALTER TABLE customers ADD COLUMN address TEXT");
  } catch (err) {}
  try {
    await db.exec("ALTER TABLE orders ADD COLUMN couponCode TEXT");
  } catch (err) {}
  try {
    await db.exec("ALTER TABLE orders ADD COLUMN discountAmount INTEGER DEFAULT 0");
  } catch (err) {}

  // Seed default data if empty
  await seedDefaultData(db);

  // Migrate existing data to replace '狗狗' with '毛孩'
  try {
    await db.run("UPDATE products SET title = replace(title, '狗狗', '毛孩'), description = replace(description, '狗狗', '毛孩'), cookingTip = replace(cookingTip, '狗狗', '毛孩')");
    await db.run("UPDATE products SET image = replace(image, '/src/assets/', '/assets/')");
  } catch (err) {
    console.error('Failed to run data migration:', err);
  }
}

async function seedDefaultData(db: Database) {
  // Check if products exist
  const productCount = await db.get('SELECT COUNT(*) as count FROM products');
  if (productCount.count === 0) {
    console.log('Seeding default products...');
    const defaultProducts = [
      {
        id: 'apparel-01',
        title: '樂活防潑水機能狗狗全包覆雨衣',
        category: 'apparel',
        price: 1280,
        originalPrice: 1500,
        image: '/assets/pet_hero.jpg',
        rating: 4.9,
        reviews: 86,
        description: '專為多雨氣候設計的毛孩機能雨衣。採用超輕量防潑水透氣面料，肚圍與脖圍均可彈性調節，背部預留隱形牽繩扣環通道。搭配亮眼夜間反光條，保障毛孩雨天外出的舒適與安全。',
        origin: '台灣設計製造',
        weight: 'S / M / L / XL 規格可選',
        storage: '清水洗淨後懸掛晾乾',
        comfortRating: 11,
        cookingTip: '雨天出遊後，以常溫清水沖洗表面髒污即可，請置於陰涼通風處陰乾，切勿使用烘乾機以防縮水。',
        badges: '防潑水, 安全反光',
        isNew: 1,
        brand: 'Lè Lè Design'
      },
      {
        id: 'apparel-02',
        title: '肉肉聯名款英倫風雙色針織保暖毛衣',
        category: 'apparel',
        price: 980,
        originalPrice: 1200,
        image: '/assets/dog_bed.jpg',
        rating: 4.8,
        reviews: 114,
        description: '融合樂樂奶油白與肉肉焦糖褐的雙色復古針織毛衣。手感蓬鬆柔軟，彈性極佳，保暖而不臃腫，特別適合秋冬早晚低溫穿搭，讓毛孩日常跑跳依然活動自如。',
        origin: '手作針織工藝',
        weight: 'S / M / L 規格可選',
        storage: '裝入袋內溫和水洗',
        comfortRating: 12,
        cookingTip: '建議使用冷水手洗並平鋪晾乾。若使用洗衣機，請務必放入細網洗衣袋，選擇慢速溫和洗滌模式。',
        badges: '毛孩聯名款, 秋冬熱銷',
        isNew: 0,
        brand: 'Ròu Ròu Selection'
      },
      {
        id: 'acc-01',
        title: '義大利溫潤植鞣皮革手作牽繩項圈組',
        category: 'accessories',
        price: 1880,
        originalPrice: 2200,
        image: '/assets/pet_hero.jpg',
        rating: 5.0,
        reviews: 57,
        description: '精選義大利頂級植鞣牛皮，由職人手工雙針縫線製成。隨著毛孩與主人日常使用的摩擦與腳步，皮革會逐漸蛻變為溫潤沉穩的蜜焦糖色。搭配純黃銅防鏽鎖扣五金，質感奢華且堅固。',
        origin: '義大利皮革 / 台灣職人手縫',
        weight: '牽繩長度 120cm / 寬度 1.8cm',
        storage: '避免潮濕，存放於陰涼處',
        comfortRating: 10,
        cookingTip: '若皮革不慎受潮遇水，請以乾布輕輕吸乾後自然陰乾。每季塗抹少許植物性皮革保養油可保柔軟亮澤。',
        badges: '植鞣皮革, 職人手作',
        isNew: 0,
        brand: 'Ròu Ròu Selection'
      },
      {
        id: 'outing-01',
        title: '出遊必備一鍵智控防漏毛孩隨行水杯',
        category: 'outing',
        price: 480,
        originalPrice: 600,
        image: '/assets/pet_food.jpg',
        rating: 4.8,
        reviews: 73,
        description: '一鍵出水與回水設計，帶有貼心防漏安全開關，單手即可在散步或出遊時輕鬆餵水。瓶身採用食品級安全材質（不含雙酚 A），內置活性碳過濾芯，確保毛孩飲水乾淨。',
        origin: '樂寵美學精選',
        weight: '容量 400ml / 附掛繩',
        storage: '定期清洗並風乾',
        comfortRating: 9,
        cookingTip: '每次散步回家後請清洗乾淨並保持乾燥。為維持良好過濾效果，建議每 2-3 個月更換一次活性碳濾芯。',
        badges: '散步必備, 單手控水',
        isNew: 1,
        brand: 'Lè Lè Design'
      },
      {
        id: 'toys-01',
        title: '紓壓益智藏食嗅聞抗憂鬱橡木桶玩具',
        category: 'toys',
        price: 650,
        originalPrice: 800,
        image: '/assets/pet_food.jpg',
        rating: 4.9,
        reviews: 62,
        description: '專為毛孩天生嗅覺探索設計的益智藏食玩具。採用厚實耐抓撕的環保毛氈布與強化帆布，內藏多個小零食袋，能有效消耗毛孩過剩體力、激發腦力並舒緩分離焦慮。',
        origin: '台灣文創設計',
        weight: '直徑 15cm x 高 20cm',
        storage: '可放入洗衣網中清洗',
        comfortRating: 11,
        cookingTip: '可在不同夾層內放入不同硬度的零食增加探索樂趣。毛孩玩耍完畢後，建議定期清洗曬乾，維持衛生。',
        badges: '抗焦慮, 益智消耗體力',
        isNew: 0,
        brand: 'Wild Earth'
      }
    ];

    for (const prod of defaultProducts) {
      await db.run(
        `INSERT INTO products (id, title, category, price, originalPrice, image, rating, reviews, description, origin, weight, storage, comfortRating, cookingTip, badges, isNew, brand)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          prod.id, prod.title, prod.category, prod.price, prod.originalPrice, prod.image,
          prod.rating, prod.reviews, prod.description, prod.origin, prod.weight, prod.storage,
          prod.comfortRating, prod.cookingTip, prod.badges, prod.isNew, prod.brand
        ]
      );
    }
  }

  // Check if customers exist
  const customerCount = await db.get('SELECT COUNT(*) as count FROM customers');
  if (customerCount.count === 0) {
    console.log('Seeding default customers...');
    const defaultCustomers = [
      { id: 'CUST-001', name: '林小美', email: 'xiaomei@gmail.com', provider: 'Google', signupDate: '2026-03-12', ordersCount: 3, totalSpent: 6360, points: 636 },
      { id: 'CUST-002', name: '張大同', email: 'datong.line@line.me', provider: 'LINE', signupDate: '2026-04-18', ordersCount: 2, totalSpent: 3820, points: 382 },
      { id: 'CUST-003', name: '陳曉華', email: 'hannah.fb@facebook.com', provider: 'Facebook', signupDate: '2026-05-02', ordersCount: 1, totalSpent: 980, points: 98 }
    ];

    for (const cust of defaultCustomers) {
      await db.run(
        `INSERT INTO customers (id, name, email, provider, signupDate, ordersCount, totalSpent, points)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [cust.id, cust.name, cust.email, cust.provider, cust.signupDate, cust.ordersCount, cust.totalSpent, cust.points]
      );
    }
  }

  // Check if config exists
  const configCount = await db.get('SELECT COUNT(*) as count FROM system_config');
  if (configCount.count === 0) {
    console.log('Seeding default system configs...');
    const configs = [
      { key: 'paymentProvider', value: 'GreenWorld' },
      { key: 'paymentApiKey', value: 'gw_hashkey_2026_test_xxyyzz' },
      { key: 'logisticsProvider', value: '711_C2C' },
      { key: 'logisticsApiKey', value: 'log_711_c2c_storekey_89021' },
      { key: 'googleClientId', value: 'google-oauth-client-id-2890.apps.googleusercontent.com' },
      { key: 'lineChannelId', value: 'line-channel-id-189201' }
    ];

    for (const cfg of configs) {
      await db.run('INSERT INTO system_config (key, value) VALUES (?, ?)', [cfg.key, cfg.value]);
    }
  }

  // Check if admin exists
  const adminCount = await db.get('SELECT COUNT(*) as count FROM admins');
  if (adminCount.count === 0) {
    console.log('Seeding default admin...');
    const username = process.env.ADMIN_USERNAME || 'admin';
    const rawPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    await db.run('INSERT INTO admins (username, password) VALUES (?, ?)', [username, hashedPassword]);
  }
}
