import { Router } from 'express';
import { getDatabase } from '../db.js';
import { 
  verifyCallbackMac, 
  generateLogisticsMapForm, 
  generateLogisticsCheckMacValue, 
  generateLogisticsCvsParams, 
  generateLogisticsHomeParams 
} from '../utils/ecpay.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = Router();

// ==========================================
// 1. ECPay AIO Payment Callback (Webhook)
// ==========================================
router.post('/ecpay-callback', async (req, res) => {
  const params = req.body;

  console.log('Received Ecpay callback payload:', params);

  // 1. Verify Callback Signature
  const isValid = verifyCallbackMac(params);
  if (!isValid) {
    console.error('Ecpay callback signature verification failed!');
    return res.status(400).send('0|Signature Verification Failed');
  }

  // 2. Parse Order ID (Convert "LRx20260708x1234" back to "LR-20260708-1234")
  const merchantTradeNo = params.MerchantTradeNo;
  const orderId = merchantTradeNo.replace(/x/g, '-');

  const rtnCode = params.RtnCode; // '1' means payment succeeded

  try {
    const db = await getDatabase();
    const order = await db.get('SELECT * FROM orders WHERE id = ?', [orderId]);

    if (!order) {
      console.error(`Order ${orderId} not found in database!`);
      return res.status(404).send('0|Order Not Found');
    }

    if (rtnCode === '1') {
      console.log(`Payment successful for Order: ${orderId}`);
      // Update order status to "已付款" or "已付款 / 待出貨"
      await db.run(
        `UPDATE orders SET status = ? WHERE id = ?`,
        ['已付款', orderId]
      );
    } else {
      console.log(`Payment failed or pending for Order: ${orderId}, RtnCode: ${rtnCode}`);
      await db.run(
        `UPDATE orders SET status = ? WHERE id = ?`,
        [`付款失敗 (${params.RtnMsg || '未知錯誤'})`, orderId]
      );
    }

    // Ecpay requires returning "1|OK" upon successful handling of callback
    return res.send('1|OK');
  } catch (error) {
    console.error('Error handling Ecpay callback:', error);
    return res.status(500).send('0|Internal Server Error');
  }
});

// ==========================================
// 2. ECPay Electronic Map (電子地圖選店)
// ==========================================
router.post('/ecpay-map', async (req, res) => {
  const { logisticsSubType, isCollection } = req.body;
  
  if (!logisticsSubType) {
    return res.status(400).json({ error: 'logisticsSubType is required (FAMI or UNIMART)' });
  }

  try {
    const mapForm = generateLogisticsMapForm(logisticsSubType, isCollection || 'N');
    return res.json(mapForm);
  } catch (error) {
    console.error('Error generating ECPay Map Form:', error);
    return res.status(500).json({ error: 'Failed to generate Map Form' });
  }
});

// Map Callback URL (ECPay will post selected store info here)
router.post('/ecpay-map-callback', (req, res) => {
  const { CVSStoreID, CVSStoreName, CVSAddress, LogisticsSubType } = req.body;
  
  console.log('Received ECPay Map Callback:', req.body);
  
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  
  // Redirect browser back to frontend with selected store parameters
  res.redirect(`${frontendUrl}/?checkout=true&storeId=${CVSStoreID || ''}&storeName=${encodeURIComponent(CVSStoreName || '')}&storeAddress=${encodeURIComponent(CVSAddress || '')}&storeType=${LogisticsSubType || ''}`);
});

// ==========================================
// 3. ECPay Logistics Order Creation (Admin)
// ==========================================
router.post('/ecpay-logistics-create/:orderId', authenticateAdmin, async (req, res) => {
  const { orderId } = req.params;
  try {
    const db = await getDatabase();
    const order = await db.get('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check if logistics order was already created
    if (order.ecpayLogisticsId) {
      return res.status(400).json({ 
        error: 'Logistics order already created for this order', 
        ecpayLogisticsId: order.ecpayLogisticsId 
      });
    }

    let params: Record<string, string>;
    const items = JSON.parse(order.items);
    const goodsName = items.map((item: any) => `${item.title} x${item.qty}`).join('#');

    if (order.logisticsType === 'CVS') {
      params = generateLogisticsCvsParams(order, goodsName);
    } else {
      params = generateLogisticsHomeParams(order, goodsName);
    }

    console.log('Sending logistics creation request to ECPay:', params);
    
    // Convert params to URLSearchParams body
    const bodyParams = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      bodyParams.append(k, v);
    }

    const response = await fetch('https://logistics-stage.ecpay.com.tw/Express/Create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: bodyParams.toString()
    });

    const resText = await response.text();
    console.log('ECPay Logistics Response:', resText);
    
    // Parse pipe-separated response: 1|OK|AllPayLogisticsID=xxx&CVSPaymentNo=xxx&CVSValidationNo=xxx
    const parts = resText.split('|');
    if (parts[0] === '1') {
      const details: Record<string, string> = {};
      const pairs = parts[2].split('&');
      for (const pair of pairs) {
        const [k, v] = pair.split('=');
        details[k] = v;
      }
      
      const allPayLogisticsID = details.AllPayLogisticsID;
      const cvsPaymentNo = details.CVSPaymentNo || '';
      const cvsValidationNo = details.CVSValidationNo || '';
      
      // Update order in database
      await db.run(
        `UPDATE orders SET 
          ecpayLogisticsId = ?, 
          ecpayLogisticsStatus = ?,
          status = ?
         WHERE id = ?`,
        [allPayLogisticsID, '訂單處理中', '已出貨', orderId]
      );
      
      return res.json({
        success: true,
        ecpayLogisticsId: allPayLogisticsID,
        cvsPaymentNo,
        cvsValidationNo,
        message: 'Logistics order created successfully'
      });
    } else {
      return res.status(400).json({ error: `ECPay error: ${resText}` });
    }
  } catch (error) {
    console.error('Error creating ECPay logistics order:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ==========================================
// 4. ECPay Logistics Status Callback (Webhook)
// ==========================================
router.post('/ecpay-logistics-callback', async (req, res) => {
  const params = req.body;
  console.log('Received ECPay logistics callback:', params);
  
  // 1. Verify signatures
  const { CheckMacValue } = params;
  if (!CheckMacValue) {
    return res.status(400).send('0|Missing CheckMacValue');
  }
  
  // Calculate computed CheckMacValue using generateLogisticsCheckMacValue
  const calculated = generateLogisticsCheckMacValue(params);
  if (calculated !== CheckMacValue) {
    console.error('ECPay logistics callback signature mismatch!');
    return res.status(400).send('0|Signature mismatch');
  }
  
  const allPayLogisticsID = params.AllPayLogisticsID;
  const rtnCode = params.RtnCode; // Code indicating status
  const rtnMsg = params.RtnMsg;
  
  // Determine standard status string
  // CVS status: 2067/3022 = consumer picked up, 3018 = package arrived at store
  let logisticsStatus = rtnMsg || `Code ${rtnCode}`;
  let orderStatusUpdate = '';
  
  if (rtnCode === '300') {
    logisticsStatus = '訂單處理中';
  } else if (rtnCode === '3018') {
    logisticsStatus = '商品已到店';
    orderStatusUpdate = '已出貨'; // Wait, let's keep it as is or show arrived
  } else if (rtnCode === '2067' || rtnCode === '3022') {
    logisticsStatus = '已取貨';
    orderStatusUpdate = '已完成';
  }
  
  try {
    const db = await getDatabase();
    
    // Find order by ecpayLogisticsId
    const order = await db.get('SELECT id FROM orders WHERE ecpayLogisticsId = ?', [allPayLogisticsID]);
    if (order) {
      if (orderStatusUpdate) {
        await db.run(
          `UPDATE orders SET ecpayLogisticsStatus = ?, status = ? WHERE ecpayLogisticsId = ?`,
          [logisticsStatus, orderStatusUpdate, allPayLogisticsID]
        );
      } else {
        await db.run(
          `UPDATE orders SET ecpayLogisticsStatus = ? WHERE ecpayLogisticsId = ?`,
          [logisticsStatus, allPayLogisticsID]
        );
      }
      console.log(`Updated Order ${order.id} status via logistics callback`);
    } else {
      console.warn(`No order found for AllPayLogisticsID: ${allPayLogisticsID}`);
    }
    
    // Return 1|OK to ECPay
    return res.send('1|OK');
  } catch (error) {
    console.error('Error handling ECPay logistics callback:', error);
    return res.status(500).send('0|Internal Server Error');
  }
});

export default router;
