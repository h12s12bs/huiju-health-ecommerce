import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export class DatabaseWrapper {
  public pool: pg.Pool;

  constructor(pool: pg.Pool) {
    this.pool = pool;
  }

  // Convert SQLite ? parameters to Postgres $1, $2, ...
  private formatSql(sql: string): string {
    let index = 1;
    return sql.replace(/\?/g, () => `$${index++}`);
  }

  async get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    const formattedSql = this.formatSql(sql);
    const res = await this.pool.query(formattedSql, params);
    return res.rows[0];
  }

  async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const formattedSql = this.formatSql(sql);
    const res = await this.pool.query(formattedSql, params);
    return res.rows;
  }

  async run(sql: string, params: any[] = []): Promise<{ lastID?: any; changes?: number }> {
    const formattedSql = this.formatSql(sql);
    const res = await this.pool.query(formattedSql, params);
    return { changes: res.rowCount || 0 };
  }

  async exec(sql: string): Promise<void> {
    if (sql.trim().toUpperCase().startsWith('PRAGMA')) {
      return;
    }
    await this.pool.query(sql);
  }
}

export type Database = DatabaseWrapper;

let dbInstance: DatabaseWrapper | null = null;

export async function getDatabase(): Promise<DatabaseWrapper> {
  if (dbInstance) {
    return dbInstance;
  }

  const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgrespassword@localhost:5433/huiju_ecommerce';

  const pool = new Pool({
    connectionString,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
  });

  dbInstance = new DatabaseWrapper(pool);

  // Initialize tables
  await initTables(dbInstance);

  return dbInstance;
}

async function initTables(db: DatabaseWrapper) {
  // 1. Products Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(255) PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      price DOUBLE PRECISION NOT NULL,
      originalPrice DOUBLE PRECISION,
      image TEXT NOT NULL,
      rating DOUBLE PRECISION DEFAULT 5.0,
      reviews INTEGER DEFAULT 0,
      description TEXT,
      origin TEXT,
      weight TEXT,
      storage TEXT,
      comfortRating INTEGER,
      cookingTip TEXT,
      badges TEXT,
      isNew INTEGER DEFAULT 0,
      brand TEXT,
      cost DOUBLE PRECISION DEFAULT 0
    )
  `);

  // 2. Orders Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(255) PRIMARY KEY,
      date TEXT NOT NULL,
      items TEXT NOT NULL,
      total DOUBLE PRECISION NOT NULL,
      status TEXT NOT NULL,
      shippingName TEXT,
      shippingPhone TEXT,
      shippingAddress TEXT,
      shippingEmail TEXT,
      paymentType TEXT,
      logisticsType TEXT,
      logisticsSubType TEXT,
      cvsStoreID TEXT,
      cvsStoreName TEXT,
      ecpayLogisticsId TEXT,
      ecpayLogisticsStatus TEXT,
      couponCode TEXT,
      discountAmount INTEGER DEFAULT 0
    )
  `);

  // 3. Customers Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id VARCHAR(255) PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      provider TEXT NOT NULL,
      signupDate TEXT NOT NULL,
      ordersCount INTEGER DEFAULT 0,
      totalSpent DOUBLE PRECISION DEFAULT 0,
      points INTEGER DEFAULT 0,
      tags TEXT DEFAULT '',
      isBlacklisted INTEGER DEFAULT 0,
      password TEXT,
      phone TEXT,
      address TEXT
    )
  `);

  // Columns alter statements if missing
  try {
    await db.exec("ALTER TABLE customers ADD COLUMN IF NOT EXISTS tags TEXT DEFAULT ''");
  } catch (err) {}
  try {
    await db.exec('ALTER TABLE customers ADD COLUMN IF NOT EXISTS isBlacklisted INTEGER DEFAULT 0');
  } catch (err) {}
  try {
    await db.exec('ALTER TABLE products ADD COLUMN IF NOT EXISTS cost DOUBLE PRECISION DEFAULT 0');
  } catch (err) {}
  try {
    await db.exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS logisticsType TEXT");
  } catch (err) {}
  try {
    await db.exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS logisticsSubType TEXT");
  } catch (err) {}
  try {
    await db.exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS cvsStoreID TEXT");
  } catch (err) {}
  try {
    await db.exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS cvsStoreName TEXT");
  } catch (err) {}
  try {
    await db.exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS ecpayLogisticsId TEXT");
  } catch (err) {}
  try {
    await db.exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS ecpayLogisticsStatus TEXT");
  } catch (err) {}
  try {
    await db.exec("ALTER TABLE customers ADD COLUMN IF NOT EXISTS password TEXT");
  } catch (err) {}
  try {
    await db.exec("ALTER TABLE customers ADD COLUMN IF NOT EXISTS phone TEXT");
  } catch (err) {}
  try {
    await db.exec("ALTER TABLE customers ADD COLUMN IF NOT EXISTS address TEXT");
  } catch (err) {}
  try {
    await db.exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS couponCode TEXT");
  } catch (err) {}
  try {
    await db.exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS discountAmount INTEGER DEFAULT 0");
  } catch (err) {}

  // 4. Config/Settings Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS system_config (
      key VARCHAR(255) PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // 5. Admins Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      username VARCHAR(255) PRIMARY KEY,
      password TEXT NOT NULL
    )
  `);

  // 6. Email OTP Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS email_otps (
      email VARCHAR(255) PRIMARY KEY,
      otp TEXT NOT NULL,
      expiresAt BIGINT NOT NULL
    )
  `);

  // Seed default data if empty
  await seedDefaultData(db);
}

async function seedDefaultData(db: DatabaseWrapper) {
  // Check if products exist or replace default products
  await db.run('DELETE FROM products WHERE id LIKE ? OR id LIKE ?', ['health-%', 'pet-%']);
  console.log('Seeding default health platform services and products...');
  const defaultProducts = [
    {
      id: 'health-01',
      title: '[預防保健] 慧聚全方位健康守護方案',
      category: 'apparel',
      price: 1280,
      originalPrice: 1500,
      cost: 580,
      image: '/assets/logo.jpg',
      rating: 4.9,
      reviews: 96,
      description: '結合日常健康維護、基礎營養規劃與家庭照護檢測指南，為您與家人建立全方位的健康防護。',
      origin: '慧聚健康團隊企劃',
      weight: '全家健康管理專案',
      storage: '線上與實體全方位服務',
      comfortRating: 11,
      cookingTip: '建議與專業健康顧問溝通後配合日常習慣執行。',
      badges: '熱銷推薦, 專業評估',
      isNew: 1,
      brand: '慧聚健康平台'
    },
    {
      id: 'health-02',
      title: '[健康諮詢] 專業團隊 1-on-1 客製化健康規劃服務',
      category: 'accessories',
      price: 980,
      originalPrice: 1200,
      cost: 420,
      image: '/assets/logo.jpg',
      rating: 4.8,
      reviews: 128,
      description: '由專業營養與健康顧問提供深度 1 對 1 線上諮詢，為您量身打造專屬的健康作息與飲食建議藍圖。',
      origin: '慧聚諮詢與照護團隊',
      weight: '1 次深度諮詢 (60 分鐘)',
      storage: '線上視訊或電話諮詢',
      comfortRating: 10,
      cookingTip: '諮詢前請先整理近期作息與個人健康目標。',
      badges: '1-on-1 諮詢, 客製規劃',
      isNew: 0,
      brand: '慧聚諮詢與照護'
    },
    {
      id: 'health-03',
      title: '[智慧照護] 智慧健康數據監測與全家照顧服務',
      category: 'outing',
      price: 1680,
      originalPrice: 2000,
      cost: 680,
      image: '/assets/logo.jpg',
      rating: 5.0,
      reviews: 75,
      description: '整合智慧裝置數據趨勢追蹤與健康提醒，隨時掌握全家人的身體狀況與照護需求。',
      origin: '慧聚智慧照護中心',
      weight: '全家月度數據監測方案',
      storage: '平台雲端數據管理',
      comfortRating: 12,
      cookingTip: '搭配智慧穿戴與健康 APP 獲得最佳體驗。',
      badges: '智慧照護, 數據追蹤',
      isNew: 1,
      brand: '慧聚諮詢與照護'
    }
  ];

    for (const prod of defaultProducts) {
      await db.run(
        `INSERT INTO products (id, title, category, price, originalPrice, image, rating, reviews, description, origin, weight, storage, comfortRating, cookingTip, badges, isNew, brand, cost)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          prod.id, prod.title, prod.category, prod.price, prod.originalPrice, prod.image,
          prod.rating, prod.reviews, prod.description, prod.origin, prod.weight, prod.storage,
          prod.comfortRating, prod.cookingTip, prod.badges, prod.isNew, prod.brand, prod.cost
        ]
      );
    }
  }

  // Check if customers exist
  const customerCount = await db.get('SELECT COUNT(*) as count FROM customers');
  if (parseInt(String(customerCount?.count || '0'), 10) === 0) {
    console.log('Seeding default customers...');
    const defaultCustomers = [
      { id: 'CUST-001', name: '王健康', email: 'wang@huiju-health.com', provider: 'Google', signupDate: '2026-03-12', ordersCount: 3, totalSpent: 6360, points: 636, tags: 'VIP會員,養生族', isBlacklisted: 0 },
      { id: 'CUST-002', name: '李美心', email: 'meixin.line@line.me', provider: 'LINE', signupDate: '2026-04-18', ordersCount: 2, totalSpent: 3820, points: 382, tags: '上班族,葉黃素愛用', isBlacklisted: 0 }
    ];

    for (const cust of defaultCustomers) {
      await db.run(
        `INSERT INTO customers (id, name, email, provider, signupDate, ordersCount, totalSpent, points, tags, isBlacklisted)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [cust.id, cust.name, cust.email, cust.provider, cust.signupDate, cust.ordersCount, cust.totalSpent, cust.points, cust.tags || '', cust.isBlacklisted || 0]
      );
    }
  }

  // Check if config exists
  const configCount = await db.get('SELECT COUNT(*) as count FROM system_config');
  if (parseInt(String(configCount?.count || '0'), 10) === 0) {
    console.log('Seeding default system configs...');
    const configs = [
      { key: 'paymentProvider', value: 'GreenWorld' },
      { key: 'paymentApiKey', value: 'gw_hashkey_2026_test_huiju' },
      { key: 'logisticsProvider', value: '711_C2C' },
      { key: 'logisticsApiKey', value: 'log_711_c2c_storekey_huiju' },
      { key: 'googleClientId', value: 'google-oauth-client-id-huiju.apps.googleusercontent.com' },
      { key: 'lineChannelId', value: 'line-channel-id-huiju' }
    ];

    for (const cfg of configs) {
      await db.run('INSERT INTO system_config (key, value) VALUES (?, ?)', [cfg.key, cfg.value]);
    }
  }

  // Check if admin exists
  const adminCount = await db.get('SELECT COUNT(*) as count FROM admins');
  if (parseInt(String(adminCount?.count || '0'), 10) === 0) {
    console.log('Seeding default admin...');
    const username = process.env.ADMIN_USERNAME || 'admin';
    const rawPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    await db.run('INSERT INTO admins (username, password) VALUES (?, ?)', [username, hashedPassword]);
  }
}
