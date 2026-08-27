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
  // Check if products exist
  const productCount = await db.get('SELECT COUNT(*) as count FROM products');
  if (parseInt(String(productCount?.count || '0'), 10) === 0) {
    console.log('Seeding default health products...');
    const defaultProducts = [
      {
        id: 'health-01',
        title: '慧聚高純度深海魚油 (rTG 型 85% 高濃度)',
        category: 'apparel',
        price: 1280,
        originalPrice: 1500,
        cost: 580,
        image: '/assets/logo.jpg',
        rating: 4.9,
        reviews: 96,
        description: '嚴選挪威乾淨海域小魚提取，rTG 型高吸收率，專利魚油軟膠囊，無腥味、高濃度 EPA/DHA，維持心血管與思路敏捷。',
        origin: '挪威原料 / 台灣生產',
        weight: '60 粒 / 盒 (30 天份)',
        storage: '請置於陰涼乾燥處，避免陽光直射',
        comfortRating: 11,
        cookingTip: '建議隨餐或餐後搭配溫開水食用，吸收效果最佳。',
        badges: '高純度, 國際專利認證',
        isNew: 1,
        brand: '慧聚健康生醫'
      },
      {
        id: 'health-02',
        title: '慧聚游離型金盞花葉黃素膠囊',
        category: 'accessories',
        price: 980,
        originalPrice: 1200,
        cost: 420,
        image: '/assets/logo.jpg',
        rating: 4.8,
        reviews: 128,
        description: '專為現代螢幕族與上班族打造，結合 FloraGLO 游離型葉黃素與玉米黃素黃金比例 10:2，添加山桑子與黑大豆皮萃取物，全方位守護晶亮舒適。',
        origin: '美國專利 / 台灣封裝',
        weight: '30 粒 / 盒',
        storage: '常溫陰涼處保存',
        comfortRating: 10,
        cookingTip: '每日 1 粒，飯後搭配溫開水食用。',
        badges: '晶亮舒適, 專利 FloraGLO',
        isNew: 0,
        brand: '慧聚健康生醫'
      },
      {
        id: 'health-03',
        title: '慧聚專利百億複合益生菌顆粒',
        category: 'outing',
        price: 880,
        originalPrice: 1100,
        cost: 380,
        image: '/assets/logo.jpg',
        rating: 5.0,
        reviews: 75,
        description: '包埋技術維護包覆保護，嚴選 15 支高活性專利益生菌搭配水溶性膳食纖維與半乳寡糖，維持消化道機能，調節體質。',
        origin: '台灣研發製造',
        weight: '30 包 / 盒',
        storage: '請勿放置於高溫車內或陽光直射處',
        comfortRating: 12,
        cookingTip: '每日 1-2 包，可直接入口或加入 40℃ 以下溫水果汁沖泡飲用。',
        badges: '百億菌株, 順暢防護',
        isNew: 1,
        brand: '慧聚健康生醫'
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
