import React from 'react';
import { X, Printer } from 'lucide-react';

interface OrderItem {
  title: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: string;
  shippingName?: string;
  shippingPhone?: string;
  shippingAddress?: string;
  shippingEmail?: string;
  paymentType?: string;
}

interface PackingSlipModalProps {
  order: Order;
  onClose: () => void;
}

export const PackingSlipModal: React.FC<PackingSlipModalProps> = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const shippingFee = order.total >= 2000 ? 0 : 100;

  return (
    <div className="print-slip-modal-overlay" onClick={onClose}>
      <div className="print-slip-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header (Hidden during print) */}
        <div className="print-slip-header">
          <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>出貨撿貨單預覽</span>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              className="btn btn-primary" 
              onClick={handlePrint}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              <Printer size={16} /> 列印此單
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={onClose}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              <X size={16} /> 關閉
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="print-slip-body">
          <div className="packing-slip-title">樂肉選品 &middot; 出貨撿貨單</div>
          
          <div className="packing-slip-meta">
            <div>
              <p><strong>訂單編號：</strong>{order.id}</p>
              <p><strong>訂購日期：</strong>{order.date}</p>
              <p><strong>付款方式：</strong>{order.paymentType === 'GreenWorld' ? '綠界科技安全信用卡付款' : order.paymentType === '貨到付款' ? '貨到付款' : '線上支付'}</p>
              <p><strong>訂單狀態：</strong>{order.status}</p>
            </div>
            <div>
              <p><strong>收件姓名：</strong>{order.shippingName || '會員'}</p>
              <p><strong>聯絡電話：</strong>{order.shippingPhone || '無'}</p>
              <p><strong>配送地址：</strong>{order.shippingAddress || '無'}</p>
              <p><strong>電子信箱：</strong>{order.shippingEmail || '無'}</p>
            </div>
          </div>

          <table className="packing-slip-table">
            <thead>
              <tr>
                <th style={{ width: '8%' }}>撿貨</th>
                <th>商品選物名稱</th>
                <th style={{ width: '15%' }}>單價</th>
                <th style={{ width: '12%', textAlign: 'center' }}>數量</th>
                <th style={{ width: '15%', textAlign: 'right' }}>小計</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ textAlign: 'center' }}>
                    <span className="packing-slip-checklist-item"></span>
                  </td>
                  <td style={{ fontWeight: 'bold' }}>{item.title}</td>
                  <td>NT$ {item.price.toLocaleString()}</td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{item.qty}</td>
                  <td style={{ textAlign: 'right' }}>NT$ {(item.price * item.qty).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="packing-slip-totals">
            <p>商品小計：NT$ {subtotal.toLocaleString()}</p>
            <p>運費：{shippingFee === 0 ? '免運費' : `NT$ ${shippingFee}`}</p>
            <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#000', marginTop: '0.25rem', borderTop: '2px double #000', paddingTop: '0.25rem' }}>
              應收總金額：NT$ {order.total.toLocaleString()}
            </p>
          </div>

          <div style={{ marginTop: '3rem', borderTop: '1px dashed #999', paddingTop: '1.5rem', fontSize: '0.85rem', color: '#666' }}>
            <p><strong>【備註與說明】</strong></p>
            <p>1. 本單為內部出貨及人員配箱專用之撿貨清單，請依照表格內「撿貨」核取方塊逐項點收裝箱。</p>
            <p>2. 樂肉精選毛孩機能服飾出貨前請再次確認線頭已修剪，並確保包裝紙盒完好無損，謝謝出貨團隊的辛勞！</p>
          </div>
        </div>

      </div>
    </div>
  );
};
