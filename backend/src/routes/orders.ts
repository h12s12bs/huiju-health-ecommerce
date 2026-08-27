import { Router, Response } from 'express';
import { getDatabase } from '../db.js';
import { authenticateAdmin, AuthenticatedRequest } from '../middleware/auth.js';
import { generateEcpayForm } from '../utils/ecpay.js';

const router = Router();

// Get all orders (Admin only)
router.get('/', authenticateAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDatabase();
    const rows = await db.all('SELECT * FROM orders ORDER BY date DESC');
    const formatted = rows.map(row => ({
      ...row,
      items: JSON.parse(row.items)
    }));
    return res.json(formatted);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Create a new order
router.post('/', async (req, res) => {
  const { 
    items, total, shippingInfo, paymentType, 
    logisticsType, logisticsSubType, cvsStoreID, cvsStoreName,
    couponCode, discountAmount 
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0 || !total || !shippingInfo) {
    return res.status(400).json({ error: 'Invalid order request: items, total, and shippingInfo are required' });
  }

  const db = await getDatabase();

  // Generate order ID: LR-YYYYMMDD-Random
  const dateObj = new Date();
  const datePrefix = dateObj.toISOString().slice(0, 10).replace(/-/g, '');
  const randSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderId = `LR-${datePrefix}-${randSuffix}`;

  const dateStr = dateObj.toISOString().split('T')[0];
  const itemsJson = JSON.stringify(items);
  
  // Set initial status based on payment type
  const status = paymentType === 'GreenWorld' ? '待付款' : '處理中 / 質感宅配';

  try {
    if (shippingInfo.email) {
      const customer = await db.get('SELECT * FROM customers WHERE email = ?', [shippingInfo.email]);
      if (customer && customer.isBlacklisted === 1) {
        return res.status(403).json({ error: '此電子郵件已被列入黑名單，無法進行下單。如有疑問請聯絡客服。' });
      }
    }

    await db.run(
      `INSERT INTO orders (
        id, date, items, total, status, shippingName, shippingPhone, shippingAddress, shippingEmail, paymentType,
        logisticsType, logisticsSubType, cvsStoreID, cvsStoreName, couponCode, discountAmount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId, dateStr, itemsJson, Number(total), status,
        shippingInfo.name, shippingInfo.phone, shippingInfo.address, shippingInfo.email, paymentType,
        logisticsType || 'HOME', logisticsSubType || 'TCAT', cvsStoreID || null, cvsStoreName || null,
        couponCode || null, Number(discountAmount) || 0
      ]
    );

    // Auto-register Guest user if customer does not exist & send verification trigger
    if (shippingInfo.email) {
      let customer = await db.get('SELECT * FROM customers WHERE email = ?', [shippingInfo.email]);
      if (!customer) {
        const custId = `CUST-${Date.now().toString().slice(-6)}`;
        const signupDate = dateStr;
        await db.run(
          `INSERT INTO customers (id, name, email, phone, address, provider, signupDate, ordersCount, totalSpent, points, tags, isBlacklisted)
           VALUES (?, ?, ?, ?, ?, 'GuestCheckout', ?, 1, ?, 0, '訪客自動註冊', 0)`,
          [
            custId, 
            shippingInfo.name || '訪客買家', 
            shippingInfo.email, 
            shippingInfo.phone || '', 
            shippingInfo.address || '', 
            signupDate, 
            Number(total)
          ]
        );
        
        // Generate OTP for email verification and password setup
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        await db.run(
          'INSERT OR REPLACE INTO email_otps (email, otp, expiresAt) VALUES (?, ?, ?)',
          [shippingInfo.email, otp, expiresAt]
        );

        console.log(`[GUEST CHECKOUT AUTO-REGISTER] Registered customer ${shippingInfo.email} with ID ${custId}. Generated verification OTP: ${otp}`);
      } else {
        await db.run(
          `UPDATE customers SET 
            ordersCount = ordersCount + 1, 
            totalSpent = totalSpent + ?
           WHERE email = ?`,
          [Number(total), shippingInfo.email]
        );
      }
    }

    const createdOrder = {
      id: orderId,
      date: dateStr,
      items,
      total,
      status,
      shippingInfo,
      paymentType,
      logisticsType: logisticsType || 'HOME',
      logisticsSubType: logisticsSubType || 'TCAT',
      cvsStoreID: cvsStoreID || null,
      cvsStoreName: cvsStoreName || null,
      couponCode: couponCode || null,
      discountAmount: Number(discountAmount) || 0
    };

    // If payment type is GreenWorld (Ecpay), generate the form parameters
    if (paymentType === 'GreenWorld') {
      const itemNames = items.map(item => `${item.title} x${item.qty}`).join('#');
      const truncatedItemName = itemNames.length > 150 ? itemNames.slice(0, 150) + '...' : itemNames;

      const ecpayForm = generateEcpayForm(orderId, total, truncatedItemName);
      
      return res.status(201).json({
        order: createdOrder,
        paymentNeeded: true,
        paymentForm: ecpayForm
      });
    }

    return res.status(201).json({
      order: createdOrder,
      paymentNeeded: false
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

// Edit order (Admin only)
router.put('/:id', authenticateAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { 
    items, total, status, 
    shippingName, shippingPhone, shippingAddress, shippingEmail, 
    paymentType, logisticsType, logisticsSubType, cvsStoreID, cvsStoreName, 
    couponCode, discountAmount 
  } = req.body;

  try {
    const db = await getDatabase();
    const existing = await db.get('SELECT * FROM orders WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const oldEmail = existing.shippingEmail;
    const oldTotal = existing.total;

    // Perform UPDATE
    await db.run(
      `UPDATE orders SET 
        items = ?, total = ?, status = ?, 
        shippingName = ?, shippingPhone = ?, shippingAddress = ?, shippingEmail = ?, 
        paymentType = ?, logisticsType = ?, logisticsSubType = ?, cvsStoreID = ?, cvsStoreName = ?, 
        couponCode = ?, discountAmount = ?
       WHERE id = ?`,
      [
        JSON.stringify(items || []), Number(total) || 0, status || existing.status,
        shippingName || '', shippingPhone || '', shippingAddress || '', shippingEmail || '',
        paymentType || '', logisticsType || 'HOME', logisticsSubType || 'TCAT', cvsStoreID || null, cvsStoreName || null,
        couponCode || null, Number(discountAmount) || 0, id
      ]
    );

    // Adjust customer totalSpent if email changed or total changed
    if (oldEmail && oldEmail === shippingEmail) {
      const diff = Number(total) - Number(oldTotal);
      if (diff !== 0) {
        await db.run(
          'UPDATE customers SET totalSpent = totalSpent + ? WHERE email = ?',
          [diff, oldEmail]
        );
      }
    } else {
      // Email changed: deduct from old customer, add to new customer
      if (oldEmail) {
        await db.run(
          'UPDATE customers SET ordersCount = MAX(0, ordersCount - 1), totalSpent = MAX(0, totalSpent - ?) WHERE email = ?',
          [Number(oldTotal), oldEmail]
        );
      }
      if (shippingEmail) {
        const newCust = await db.get('SELECT * FROM customers WHERE email = ?', [shippingEmail]);
        if (newCust) {
          await db.run(
            'UPDATE customers SET ordersCount = ordersCount + 1, totalSpent = totalSpent + ? WHERE email = ?',
            [Number(total), shippingEmail]
          );
        }
      }
    }

    return res.json({ success: true, message: `Order ${id} updated successfully` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to update order' });
  }
});

// Delete order (Admin only)
router.delete('/:id', authenticateAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const db = await getDatabase();
    const existing = await db.get('SELECT * FROM orders WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { shippingEmail, total } = existing;

    // Delete order
    await db.run('DELETE FROM orders WHERE id = ?', [id]);

    // Update customer stats
    if (shippingEmail) {
      await db.run(
        `UPDATE customers SET 
          ordersCount = MAX(0, ordersCount - 1), 
          totalSpent = MAX(0, totalSpent - ?) 
         WHERE email = ?`,
        [Number(total), shippingEmail]
      );
    }

    return res.json({ success: true, message: `Order ${id} deleted successfully` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to delete order' });
  }
});

export default router;
