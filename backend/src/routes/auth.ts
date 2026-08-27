import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { getDatabase } from '../db.js';
import { authenticateAdmin, AuthenticatedRequest, authenticateCustomer, CustomerAuthenticatedRequest } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'lerou_jwt_secret_key_2026_highly_secure';

// Nodemailer transport setup using environment variables (fallback to console logging if not set)
const createMailTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
};

// ==========================================
// 1. Admin Auth Routes
// ==========================================
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const db = await getDatabase();
    const admin = await db.get('SELECT * FROM admins WHERE username = ?', [username]);

    if (!admin) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ username: admin.username, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({ token, username: admin.username });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/verify', authenticateAdmin, (req: AuthenticatedRequest, res: Response) => {
  return res.json({ valid: true, username: req.adminUser });
});

// ==========================================
// 2. Email OTP Routes (二次驗證)
// ==========================================

// Send OTP code to email
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const db = await getDatabase();
    
    // Generate a 6-digit verification code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiration

    // Store/replace in database
    await db.run(
      'INSERT OR REPLACE INTO email_otps (email, otp, expiresAt) VALUES (?, ?, ?)',
      [email, otp, expiresAt]
    );

    console.log(`[OTP DEBUG] Sent OTP to ${email}: ${otp}`);

    const transporter = createMailTransporter();
    if (transporter) {
      // Send real email
      await transporter.sendMail({
        from: `"慧聚健康 Huiju Health" <${process.env.SMTP_USER}>`,
        to: email,
        subject: '[慧聚健康 Huiju Health] 您的信箱二次驗證碼',
        text: `親愛的會員您好：\n\n您的電子郵件二次驗證碼為：${otp}\n\n此驗證碼於 5 分鐘內有效，請儘速在網頁上完成輸入。\n\n慧聚健康 團隊 敬上`,
        html: `
          <div style="font-family: sans-serif; padding: 2rem; background-color: #f9f9f9; border-radius: 8px;">
            <h2 style="color: #2d6a4f;">慧聚健康 Huiju Health - 驗證郵件</h2>
            <p>親愛的會員您好：</p>
            <p>您的電子郵件二次驗證碼為：</p>
            <div style="font-size: 2rem; font-weight: bold; letter-spacing: 4px; padding: 1rem; background: #fff; border: 1px solid #ddd; text-align: center; border-radius: 4px; color: #b19777; margin: 1.5rem 0;">
              ${otp}
            </div>
            <p>此驗證碼於 <strong>5 分鐘內有效</strong>，請儘速回到網頁完成輸入。</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 2rem 0;" />
            <p style="font-size: 0.8rem; color: #888;">此信件為系統自動發送，請勿直接回信。</p>
          </div>
        `
      });
      return res.json({ success: true, message: '驗證碼已寄出' });
    } else {
      // In development/test mode without SMTP
      return res.json({ 
        success: true, 
        message: '驗證碼已寄出（測試模式，已輸出至終端機）', 
        debugCode: otp // Exposed for testing without SMTP configuration
      });
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({ error: '無法發送驗證碼' });
  }
});

// Verify OTP code
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  try {
    const db = await getDatabase();
    const record = await db.get('SELECT * FROM email_otps WHERE email = ?', [email]);

    if (!record) {
      return res.status(400).json({ error: '請先發送驗證碼' });
    }

    if (Date.now() > record.expiresAt) {
      await db.run('DELETE FROM email_otps WHERE email = ?', [email]);
      return res.status(400).json({ error: '驗證碼已過期，請重新獲取' });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ error: '驗證碼不正確' });
    }

    // Delete OTP after successful verification
    await db.run('DELETE FROM email_otps WHERE email = ?', [email]);
    return res.json({ success: true, message: '信箱驗證成功' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ error: '驗證失敗，請重試' });
  }
});

// ==========================================
// 3. Customer Auth Routes
// ==========================================

// Register a new customer
router.post('/customer-register', async (req, res) => {
  const { name, email, phone, password, address, otp } = req.body;
  
  if (!name || !email || !phone || !password || !otp) {
    return res.status(400).json({ error: '請填寫完整註冊資訊與驗證碼' });
  }

  try {
    const db = await getDatabase();

    // 1. Verify OTP first
    const record = await db.get('SELECT * FROM email_otps WHERE email = ?', [email]);
    if (!record) {
      return res.status(400).json({ error: '請先獲取電子郵件驗證碼' });
    }
    if (Date.now() > record.expiresAt) {
      await db.run('DELETE FROM email_otps WHERE email = ?', [email]);
      return res.status(400).json({ error: '驗證碼已過期' });
    }
    if (record.otp !== otp) {
      return res.status(400).json({ error: '電子郵件驗證碼錯誤' });
    }

    // Delete OTP
    await db.run('DELETE FROM email_otps WHERE email = ?', [email]);

    // 2. Check if email already registered
    const existing = await db.get('SELECT * FROM customers WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ error: '此電子郵件信箱已被註冊' });
    }

    // 3. Create customer
    const customerId = `CUST-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const signupDate = new Date().toISOString().split('T')[0];
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.run(
      `INSERT INTO customers (id, name, email, provider, signupDate, password, phone, address, ordersCount, totalSpent, points)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0)`,
      [customerId, name, email, 'Email', signupDate, hashedPassword, phone, address]
    );

    const token = jwt.sign(
      { customerId, name, email, role: 'customer' }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      customer: {
        id: customerId,
        name,
        email,
        phone,
        address,
        points: 0
      }
    });
  } catch (error) {
    console.error('Customer registration error:', error);
    return res.status(500).json({ error: '註冊失敗，請重試' });
  }
});

// Login customer
router.post('/customer-login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: '請輸入電子信箱與密碼' });
  }

  try {
    const db = await getDatabase();
    const customer = await db.get('SELECT * FROM customers WHERE email = ?', [email]);

    if (!customer) {
      return res.status(401).json({ error: '電子信箱或密碼不正確' });
    }

    if (customer.isBlacklisted === 1) {
      return res.status(403).json({ error: '此帳戶已被列入黑名單，無法登入。如有疑問請聯絡客服。' });
    }

    // If it's a social account that hasn't set a password
    if (customer.provider !== 'Email' && !customer.password) {
      return res.status(400).json({ 
        error: `此帳號當初使用 ${customer.provider} 快速登入。請改用社群快速登入，或聯繫客服設定密碼。` 
      });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({ error: '電子信箱或密碼不正確' });
    }

    const token = jwt.sign(
      { customerId: customer.id, name: customer.name, email: customer.email, role: 'customer' }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
        address: customer.address || customer.shippingAddress || '',
        points: customer.points
      }
    });
  } catch (error) {
    console.error('Customer login error:', error);
    return res.status(500).json({ error: '登入失敗，請重試' });
  }
});

// ==========================================
// 4. System Settings Routes
// ==========================================
router.get('/settings', async (req, res) => {
  try {
    const db = await getDatabase();
    const rows = await db.all('SELECT key, value FROM system_config');
    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return res.json(settings);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/settings', authenticateAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const settings = req.body;
  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ error: 'Invalid settings format' });
  }

  try {
    const db = await getDatabase();
    await db.run('BEGIN TRANSACTION');
    for (const [key, value] of Object.entries(settings)) {
      await db.run(
        'INSERT INTO system_config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?',
        [key, String(value), String(value)]
      );
    }
    await db.run('COMMIT');
    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    try {
      const db = await getDatabase();
      await db.run('ROLLBACK');
    } catch (_) {}
    return res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Update customer profile
router.put('/customer-profile', authenticateCustomer, async (req: CustomerAuthenticatedRequest, res: Response) => {
  const { name, phone, address, password } = req.body;
  const customerId = req.customer?.customerId;

  if (!customerId) {
    return res.status(401).json({ error: '未授權' });
  }

  try {
    const db = await getDatabase();
    
    // Check if customer exists
    const customer = await db.get('SELECT * FROM customers WHERE id = ?', [customerId]);
    if (!customer) {
      return res.status(404).json({ error: '顧客帳號不存在' });
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.run(
        'UPDATE customers SET name = ?, phone = ?, address = ?, password = ? WHERE id = ?',
        [name || customer.name, phone || null, address || null, hashedPassword, customerId]
      );
    } else {
      await db.run(
        'UPDATE customers SET name = ?, phone = ?, address = ? WHERE id = ?',
        [name || customer.name, phone || null, address || null, customerId]
      );
    }

    const updated = await db.get('SELECT id, name, email, phone, address, points FROM customers WHERE id = ?', [customerId]);
    
    return res.json({
      success: true,
      message: '個人資訊更新成功！',
      customer: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone || '',
        address: updated.address || '',
        points: updated.points
      }
    });
  } catch (error) {
    console.error('Update customer profile error:', error);
    return res.status(500).json({ error: '更新個人資訊失敗，請重試' });
  }
});

// Forgot Password - Send Reset Email/Link
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: '請輸入電子信箱' });
  }

  try {
    const db = await getDatabase();
    const customer = await db.get('SELECT * FROM customers WHERE email = ?', [email]);
    
    if (!customer) {
      return res.status(400).json({ error: '此電子信箱尚未註冊會員' });
    }

    if (customer.provider !== 'Email') {
      return res.status(400).json({ error: `此帳號使用 ${customer.provider} 快速登入，無須重設密碼。` });
    }

    // Generate token valid for 15 minutes
    const token = jwt.sign(
      { email, type: 'reset-password' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const resetLink = `${req.headers.origin || 'http://localhost:5173'}/?resetToken=${token}`;

    console.log(`[RESET PASSWORD DEBUG] Sent reset link to ${email}: ${resetLink}`);

    const transporter = createMailTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: `"慧聚健康 Huiju Health" <${process.env.SMTP_USER}>`,
        to: email,
        subject: '[慧聚健康 Huiju Health] 重設您的會員密碼',
        text: `親愛的會員您好：\n\n您收到這封信是因為您（或有人）申請重設慧聚健康的會員密碼。\n\n請點擊以下連結以重設您的密碼：\n\n${resetLink}\n\n此連結於 15 分鐘內有效，如果您並未申請重設密碼，請忽略此郵件。\n\n慧聚健康 團隊 敬上`,
        html: `
          <div style="font-family: sans-serif; padding: 2rem; background-color: #f9f9f9; border-radius: 8px;">
            <h2 style="color: #2d6a4f;">慧聚健康 Huiju Health - 重設密碼</h2>
            <p>親愛的會員您好：</p>
            <p>我們收到了您重設會員密碼的請求。請點擊下方的按鈕來重設密碼：</p>
            <div style="text-align: center; margin: 2rem 0;">
              <a href="${resetLink}" style="background-color: #634b35; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
                重設密碼
              </a>
            </div>
            <p>您也可以直接複製並在瀏覽器貼上此連結：</p>
            <p style="word-break: break-all; color: #888; font-size: 0.85rem;">${resetLink}</p>
            <p>此重設連結於 <strong>15 分鐘內有效</strong>。如果您並未提出此申請，可直接忽略此信件，您的密碼將保持安全不變。</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 2rem 0;" />
            <p style="font-size: 0.8rem; color: #888;">此信件為系統自動發送，請勿直接回信。</p>
          </div>
        `
      });
      return res.json({ success: true, message: '重設密碼連結已發送至您的信箱！' });
    } else {
      // In development/test mode without SMTP
      return res.json({ 
        success: true, 
        message: '重設密碼信已寄出（測試模式，已輸出連結至終端機與回傳）',
        debugLink: resetLink // Exposed for testing locally
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: '發送重設郵件失敗，請稍後再試' });
  }
});

// Reset Password - Verify Token & Save New Password
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ error: '權限憑證或新密碼不可為空' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string; type: string };
    
    if (decoded.type !== 'reset-password') {
      return res.status(400).json({ error: '無效的重設密碼憑證' });
    }

    const db = await getDatabase();
    
    // Check if customer exists
    const customer = await db.get('SELECT * FROM customers WHERE email = ?', [decoded.email]);
    if (!customer) {
      return res.status(404).json({ error: '此電子信箱對應的會員不存在' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update password
    await db.run('UPDATE customers SET password = ? WHERE email = ?', [hashedPassword, decoded.email]);

    return res.json({ success: true, message: '密碼已成功重設！請使用新密碼登入。' });
  } catch (error) {
    console.error('Reset password error:', error);
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(400).json({ error: '重設密碼連結已過期，請重新申請' });
    }
    return res.status(400).json({ error: '憑證無效或已過期，請重新申請' });
  }
});

export default router;
