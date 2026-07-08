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

    // Update customer order count and total spent (Loyalty points are disabled as requested)
    if (shippingInfo.email) {
      const customer = await db.get('SELECT * FROM customers WHERE email = ?', [shippingInfo.email]);
      if (customer) {
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

// Update order status (Admin only)
router.put('/:id', authenticateAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    const db = await getDatabase();
    const existing = await db.get('SELECT id FROM orders WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await db.run('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    return res.json({ success: true, message: `Order ${id} status updated to: ${status}` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;
