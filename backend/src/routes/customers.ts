import { Router, Response } from 'express';
import { getDatabase } from '../db.js';
import { authenticateAdmin, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// 1. Get all customers (Admin only)
router.get('/', authenticateAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDatabase();
    const rows = await db.all('SELECT * FROM customers ORDER BY signupDate DESC');
    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// 2. Create new customer (Admin only)
router.post('/', authenticateAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, provider, tags, isBlacklisted, points } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: '顧客姓名與電子郵件為必填欄位' });
    }
    
    const db = await getDatabase();

    // Check if email already exists
    const existing = await db.get('SELECT * FROM customers WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ error: '此電子郵件已被註冊過！請直接搜尋或編輯該顧客。' });
    }

    const id = `CUST-${Date.now().toString().slice(-6)}`;
    const signupDate = new Date().toISOString().split('T')[0];
    
    await db.run(
      `INSERT INTO customers (id, name, email, provider, signupDate, ordersCount, totalSpent, points, tags, isBlacklisted)
       VALUES (?, ?, ?, ?, ?, 0, 0, ?, ?, ?)`,
      [
        id, 
        name, 
        email, 
        provider || 'Custom', 
        signupDate, 
        points || 0, 
        tags || '手動建立', 
        isBlacklisted ? 1 : 0
      ]
    );
    
    // Generate Email Verification OTP and store in email_otps
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await db.run(
      'INSERT OR REPLACE INTO email_otps (email, otp, expiresAt) VALUES (?, ?, ?)',
      [email, otp, expiresAt]
    );

    console.log(`[CUSTOMER VERIFICATION] Admin created customer ${email}. Generated setup OTP: ${otp}`);

    const newCustomer = await db.get('SELECT * FROM customers WHERE id = ?', [id]);
    return res.status(201).json({
      ...newCustomer,
      message: '顧客新增成功！已自動產生 Email 身份驗證碼，引導顧客開通並設定密碼。',
      otp
    });
  } catch (error) {
    console.error('Customer creation error:', error);
    return res.status(500).json({ error: '建立顧客失敗：' + (error as Error).message });
  }
});

// 3. Update customer (Admin only)
router.put('/:id', authenticateAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, tags, isBlacklisted, points } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and Email are required' });
    }
    
    const db = await getDatabase();
    await db.run(
      `UPDATE customers 
       SET name = ?, email = ?, tags = ?, isBlacklisted = ?, points = ?
       WHERE id = ?`,
      [
        name, 
        email, 
        tags || '', 
        isBlacklisted ? 1 : 0, 
        points || 0, 
        id
      ]
    );
    
    const updatedCustomer = await db.get('SELECT * FROM customers WHERE id = ?', [id]);
    if (!updatedCustomer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    return res.json(updatedCustomer);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to update customer' });
  }
});

// 4. Delete customer (Admin only)
router.delete('/:id', authenticateAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();
    
    const customer = await db.get('SELECT * FROM customers WHERE id = ?', [id]);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    await db.run('DELETE FROM customers WHERE id = ?', [id]);
    return res.json({ message: 'Customer deleted successfully', id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to delete customer' });
  }
});

export default router;
