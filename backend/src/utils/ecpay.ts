import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const HASH_KEY = process.env.ECPAY_HASH_KEY || '5294y06JbISpM5x9';
const HASH_IV = process.env.ECPAY_HASH_IV || 'v77hoKGq4kWxNNIS';
const MERCHANT_ID = process.env.ECPAY_MERCHANT_ID || '2000132';
const RETURN_URL = process.env.ECPAY_RETURN_URL || 'http://localhost:5000/api/payments/ecpay-callback';
const CLIENT_BACK_URL = process.env.ECPAY_CLIENT_BACK_URL || 'http://localhost:5173/?status=success';

const ECPAY_API_URL = 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5'; // Sandbox

/**
 * Custom URL encoding to match Ecpay's requirements (RFC 1866)
 */
function ecpayUrlEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/%20/g, '+')
    .replace(/%2d/g, '-')
    .replace(/%5f/g, '_')
    .replace(/%2e/g, '.')
    .replace(/%21/g, '!')
    .replace(/%2a/g, '*')
    .replace(/%28/g, '(')
    .replace(/%29/g, ')')
    .replace(/%2f/g, '%2F')
    .replace(/%3a/g, '%3A');
}

/**
 * Generates the CheckMacValue (MD5/SHA256 signature) for Ecpay
 */
export function generateCheckMacValue(params: Record<string, string>): string {
  // Sort keys alphabetically
  const sortedKeys = Object.keys(params).sort();
  
  // Join key=value with &
  const paramString = sortedKeys
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  // Wrap with HashKey and HashIV
  const wrapString = `HashKey=${HASH_KEY}&${paramString}&HashIV=${HASH_IV}`;
  
  // URL encode
  const encoded = ecpayUrlEncode(wrapString).toLowerCase();
  
  // SHA256 hashing
  const hash = crypto.createHash('sha256').update(encoded).digest('hex').toUpperCase();
  
  return hash;
}

/**
 * Creates the automated HTML form to post parameters to Ecpay stage or production.
 */
export function generateEcpayForm(orderId: string, amount: number, itemName: string): { action: string; params: Record<string, string> } {
  const dateStr = new Date().toISOString()
    .replace(/T/, ' ')
    .replace(/\..+/, '')
    .replace(/-/g, '/'); // Formats to YYYY/MM/DD HH:mm:ss

  const params: Record<string, string> = {
    MerchantID: MERCHANT_ID,
    MerchantTradeNo: orderId.replace(/-/g, 'x'), // Ecpay trade number allows alphanumeric only (up to 20 chars)
    MerchantTradeDate: dateStr,
    PaymentType: 'aio',
    TotalAmount: Math.round(amount).toString(),
    TradeDesc: ecpayUrlEncode(`Order ${orderId}`),
    ItemName: itemName,
    ReturnURL: RETURN_URL,
    ChoosePayment: 'ALL',
    EncryptType: '1',
    ClientBackURL: CLIENT_BACK_URL
  };

  params.CheckMacValue = generateCheckMacValue(params);

  return {
    action: ECPAY_API_URL,
    params
  };
}

/**
 * Verifies callback parameters from Ecpay to ensure authenticity.
 */
export function verifyCallbackMac(params: Record<string, string>): boolean {
  const checkMacValue = params.CheckMacValue;
  if (!checkMacValue) return false;

  // Make a shallow copy and delete CheckMacValue to compute the check value
  const paramsToVerify = { ...params };
  delete paramsToVerify.CheckMacValue;

  const computedMac = generateCheckMacValue(paramsToVerify);
  return computedMac === checkMacValue;
}

/**
 * Generates the CheckMacValue for Logistics (MD5)
 */
export function generateLogisticsCheckMacValue(params: Record<string, string>): string {
  // Sort keys alphabetically case-insensitively
  const sortedKeys = Object.keys(params)
    .filter(key => key !== 'CheckMacValue')
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  
  const paramString = sortedKeys
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  const wrapString = `HashKey=${HASH_KEY}&${paramString}&HashIV=${HASH_IV}`;
  
  // URL encode specifically for logistics (lower case and specific symbol mapping)
  let encoded = encodeURIComponent(wrapString)
    .replace(/%20/g, '+')
    .replace(/~/g, '%7e')
    .replace(/'/g, '%27')
    .toLowerCase()
    .replace(/%2d/g, '-')
    .replace(/%5f/g, '_')
    .replace(/%2e/g, '.')
    .replace(/%21/g, '!')
    .replace(/%2a/g, '*')
    .replace(/%28/g, '(')
    .replace(/%29/g, ')');
  
  return crypto.createHash('md5').update(encoded).digest('hex').toUpperCase();
}

/**
 * Generates ECPay Map Form parameters and returns action + params
 */
export function generateLogisticsMapForm(logisticsSubType: string, isCollection: 'Y' | 'N' = 'N'): { action: string; params: Record<string, string> } {
  const mapAction = 'https://logistics-stage.ecpay.com.tw/Express/map';
  const params: Record<string, string> = {
    MerchantID: MERCHANT_ID,
    MerchantTradeNo: 'MAP' + Date.now(),
    LogisticsType: 'CVS',
    LogisticsSubType: logisticsSubType, // FAMI, UNIMART, HILIFE
    IsCollection: isCollection,
    ServerReplyURL: `${process.env.BACKEND_API_URL || 'http://localhost:5000'}/api/payments/ecpay-map-callback`
  };
  
  params.CheckMacValue = generateLogisticsCheckMacValue(params);
  
  return {
    action: mapAction,
    params
  };
}

/**
 * Generates ECPay CVS Logistics Order parameters
 */
export function generateLogisticsCvsParams(order: any, goodsName: string): Record<string, string> {
  const dateStr = new Date().toISOString()
    .replace(/T/, ' ')
    .replace(/\..+/, '')
    .replace(/-/g, '/'); // Formats to YYYY/MM/DD HH:mm:ss

  const params: Record<string, string> = {
    MerchantID: MERCHANT_ID,
    MerchantTradeNo: order.id.replace(/-/g, 'x') + 'L', // Alphanumeric only, add suffix to distinguish from payment
    MerchantTradeDate: dateStr,
    LogisticsType: 'CVS',
    LogisticsSubType: order.logisticsSubType, // UNIMART, FAMI, etc.
    GoodsAmount: Math.round(order.total).toString(),
    GoodsName: goodsName.slice(0, 50),
    SenderName: '樂肉選品',
    SenderCellPhone: '0912345678', // Test sender phone
    ReceiverName: order.shippingName.slice(0, 10),
    ReceiverCellPhone: order.shippingPhone,
    ReceiverStoreID: order.cvsStoreID,
    ServerReplyURL: `${process.env.BACKEND_API_URL || 'http://localhost:5000'}/api/payments/ecpay-logistics-callback`
  };

  if (order.logisticsSubType === 'UNIMART') {
    // For 7-11, CollectionAmount is required and must match GoodsAmount
    params.CollectionAmount = params.GoodsAmount;
  }

  params.CheckMacValue = generateLogisticsCheckMacValue(params);
  return params;
}

/**
 * Generates ECPay Home Delivery Logistics Order parameters
 */
export function generateLogisticsHomeParams(order: any, goodsName: string): Record<string, string> {
  const dateStr = new Date().toISOString()
    .replace(/T/, ' ')
    .replace(/\..+/, '')
    .replace(/-/g, '/'); // Formats to YYYY/MM/DD HH:mm:ss

  const params: Record<string, string> = {
    MerchantID: MERCHANT_ID,
    MerchantTradeNo: order.id.replace(/-/g, 'x') + 'L',
    MerchantTradeDate: dateStr,
    LogisticsType: 'HOME',
    LogisticsSubType: 'TCAT', // TCAT=黑貓, POST=郵局
    GoodsAmount: Math.round(order.total).toString(),
    GoodsName: goodsName.slice(0, 50),
    SenderName: '樂肉選品',
    SenderCellPhone: '0912345678',
    SenderZipCode: '106',
    SenderAddress: '台北市大安區敦化南路二段100號',
    ReceiverName: order.shippingName.slice(0, 10),
    ReceiverCellPhone: order.shippingPhone,
    ReceiverZipCode: '110',
    ReceiverAddress: order.shippingAddress,
    Temperature: '0001', // 常溫
    Distance: '00', // 同縣市
    Specification: '0001', // 60cm
    ScheduledPickupTime: '4', // 不限時
    ScheduledDeliveryTime: '4', // 不限時
    ServerReplyURL: `${process.env.BACKEND_API_URL || 'http://localhost:5000'}/api/payments/ecpay-logistics-callback`
  };

  params.CheckMacValue = generateLogisticsCheckMacValue(params);
  return params;
}

