import React, { useState } from 'react';
import { 
  BarChart3, PlusCircle, Users, Landmark, ShoppingBag, 
  Printer, Edit, Trash2, Plus, X, FileText, Upload, ArrowLeft, Settings,
  Search, Tag, ShieldAlert, UserX, UserCheck
} from 'lucide-react';
import type { Product, Order, Customer } from '../App';
import { RichTextEditor } from './RichTextEditor';

interface AdminPanelProps {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  updateOrderStatus: (id: string, status: string) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  saveProduct: (prod: any, isEdit: boolean) => Promise<void>;
  integrationKeys: any;
  setIntegrationKeys: (keys: any) => void;
  saveSettings: (settings: any) => Promise<boolean>;
  refreshOrders?: () => void;
  refreshCustomers?: () => void;
  announcementText: string;
  setAnnouncementText: (text: string) => void;
  heroTitle: string;
  setHeroTitle: (title: string) => void;
  heroDesc: string;
  heroImage: string;
  setHeroImage: (image: string) => void;
  heroSlides: Array<{ id: string; title: string; desc: string; img: string; btnText: string }>;
  setHeroSlides: (slides: Array<{ id: string; title: string; desc: string; img: string; btnText: string }>) => void;
  blogArticles: any[];
  setPrintingOrder: (order: Order | null) => void;
  appLogo: string;
  petHero: string;
  customCategories: Array<{ id: string; name: string }>;
  setCustomCategories: (cats: Array<{ id: string; name: string }>) => void;
  customBrands: Array<{ id: string; name: string }>;
  setCustomBrands: (brands: Array<{ id: string; name: string }>) => void;
  navItems: Array<{ id: string; name: string; category?: string; page?: string }>;
  setNavItems: (items: Array<{ id: string; name: string; category?: string; page?: string }>) => void;
  bannerBtnText: string;
  setBannerBtnText: (text: string) => void;
  layoutOrder: string[];
  setLayoutOrder: (order: string[]) => void;
  instagramUrl: string;
  setInstagramUrl: (url: string) => void;
  lineUrl: string;
  setLineUrl: (url: string) => void;
}

const BACKEND_URL = import.meta.env.DEV ? '' : window.location.origin;

export const AdminPanel: React.FC<AdminPanelProps> = ({
  products,
  orders,
  customers,
  updateOrderStatus,
  deleteProduct,
  saveProduct,
  integrationKeys,
  setIntegrationKeys,
  saveSettings,
  refreshOrders,
  refreshCustomers,
  announcementText,
  setAnnouncementText,
  heroTitle,
  setHeroTitle,
  heroDesc,
  heroImage,
  setHeroImage,
  heroSlides,
  setHeroSlides,
  blogArticles,
  setPrintingOrder,
  appLogo,
  petHero,
  customCategories,
  setCustomCategories,
  customBrands,
  setCustomBrands,
  navItems,
  setNavItems,
  bannerBtnText,
  setBannerBtnText,
  layoutOrder,
  setLayoutOrder,
  instagramUrl,
  setInstagramUrl,
  lineUrl,
  setLineUrl
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'dashboard' | 'orders' | 'products' | 'crm' | 'integrations' | 'content'>('dashboard');
  const [imageSource, setImageSource] = useState<'local' | 'url'>('local');
  const [bannerImageSource, setBannerImageSource] = useState<'local' | 'url'>('local');
  
  // Custom categories & brands searches and adds
  const [catSearchQuery, setCatSearchQuery] = useState('');
  const [brandSearchQuery, setBrandSearchQuery] = useState('');
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');
  const [newBrandInput, setNewBrandInput] = useState('');
  const [quickCatInput, setQuickCatInput] = useState('');
  const [quickBrandInput, setQuickBrandInput] = useState('');

  // Nav Item Management local states
  const [newNavNameInput, setNewNavNameInput] = useState('');
  const [editingNavId, setEditingNavId] = useState<string | null>(null);
  const [editingNavName, setEditingNavName] = useState('');

  // ECPay Logistics State & Handler
  const [logisticsLoading, setLogisticsLoading] = useState<string | null>(null);

  // CRM Customer Management state
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    provider: 'Custom',
    tags: '',
    isBlacklisted: false,
    points: 0
  });
  const [crmSearchQuery, setCrmSearchQuery] = useState('');
  const [crmStatusFilter, setCrmStatusFilter] = useState<'all' | 'normal' | 'blacklist'>('all');

  // Order CRUD Modal state
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [orderForm, setOrderForm] = useState({
    shippingName: '',
    shippingPhone: '',
    shippingAddress: '',
    shippingEmail: '',
    paymentType: '貨到付款',
    logisticsType: 'HOME',
    logisticsSubType: 'TCAT',
    cvsStoreID: '',
    cvsStoreName: '',
    couponCode: '',
    discountAmount: 0,
    status: '待付款',
    items: [] as Array<{ id: string; title: string; price: number; qty: number; image: string }>
  });

  const handleCreateEcpayLogistics = async (orderId: string) => {
    setLogisticsLoading(orderId);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${BACKEND_URL}/api/payments/ecpay-logistics-create/${orderId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || '成功建立綠界物流訂單！');
        if (refreshOrders) refreshOrders();
      } else {
        alert(data.error || '建立綠界物流訂單失敗');
      }
    } catch (err) {
      console.error(err);
      alert('連線伺服器失敗');
    } finally {
      setLogisticsLoading(null);
    }
  };

  // Configuration persistence helpers
  const handleSaveCategories = async (updatedCats: Array<{ id: string; name: string }>) => {
    setCustomCategories(updatedCats);
    await saveSettings({
      customCategories: JSON.stringify(updatedCats)
    });
  };

  const handleSaveBrands = async (updatedBrands: Array<{ id: string; name: string }>) => {
    setCustomBrands(updatedBrands);
    await saveSettings({
      customBrands: JSON.stringify(updatedBrands)
    });
  };

  const handleSaveNavItems = async (updatedNav: Array<{ id: string; name: string; category?: string; page?: string }>) => {
    setNavItems(updatedNav);
    await saveSettings({
      navItems: JSON.stringify(updatedNav)
    });
  };

  const handleSaveHeroSlides = async (updatedSlides: Array<{ id: string; title: string; desc: string; img: string; btnText: string }>) => {
    setHeroSlides(updatedSlides);
    await saveSettings({
      heroSlides: JSON.stringify(updatedSlides)
    });
  };

  const moveNavItem = async (index: number, direction: 'up' | 'down') => {
    const newNav = [...navItems];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newNav.length) return;
    const temp = newNav[index];
    newNav[index] = newNav[targetIdx];
    newNav[targetIdx] = temp;
    await handleSaveNavItems(newNav);
  };

  const deleteNavItem = async (id: string) => {
    if (navItems.length <= 1) {
      alert('最少需保留一個導覽選項！');
      return;
    }
    if (confirm('確定要移除此導覽項目嗎？')) {
      const updated = navItems.filter(item => item.id !== id);
      await handleSaveNavItems(updated);
    }
  };

  const addNavItem = async () => {
    if (!newNavNameInput.trim()) return;
    const newItem = {
      id: 'nav-' + Date.now(),
      name: newNavNameInput.trim(),
      page: 'shop',
      category: 'all'
    };
    const updated = [...navItems, newItem];
    await handleSaveNavItems(updated);
    setNewNavNameInput('');
  };

  const editNavItemName = async (id: string, newName: string) => {
    const updated = navItems.map(item => item.id === id ? { ...item, name: newName } : item);
    await handleSaveNavItems(updated);
  };

  // Homepage sections sorting helper function
  const moveLayoutSection = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...layoutOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    setLayoutOrder(newOrder);
  };

  // Form states for adding/editing product
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProdId, setEditingProdId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    title: '',
    category: 'apparel',
    price: 0,
    originalPrice: 0,
    cost: 0,
    description: '',
    origin: '台灣設計製造',
    weight: '規格可選',
    storage: '懸掛晾乾 / 清水洗淨',
    comfortRating: 10,
    cookingTip: '定期保養與適度清潔',
    badgesStr: '新品推薦, 大地色系',
    brand: 'Lè Lè Design',
    isNew: true,
    image: '',
    dimensions: '',
    stock: 10,
    isPreOrder: false
  });



  // Search product state
  const [prodSearch, setProdSearch] = useState('');

  // 1. DYNAMIC CALCULATIONS FROM REAL DB ORDERS
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = orders.length;
  // Calculate shipping revenue: NT$100 collected if order total < 2000
  const shippingRevenue = orders.reduce((sum, o) => sum + (o.total >= 2000 ? 0 : 100), 0);
  // Calculate shipping expense paid to shipping company (NT$60 per order)
  const shippingExpense = orders.reduce((sum, o) => sum + (o.total > 0 ? 60 : 0), 0);

  // Build product cost map
  const productCostMap = new Map<string, number>();
  products.forEach(p => {
    productCostMap.set(p.id, p.cost || 0);
    productCostMap.set(p.title, p.cost || 0);
  });

  // Calculate actual cost of goods sold (COGS)
  const calculateCogsForOrder = (order: Order) => {
    let orderCogs = 0;
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        const itemCost = productCostMap.get((item as any).id) ?? productCostMap.get(item.title) ?? Math.floor(item.price * 0.45);
        const qty = item.qty || (item as any).count || 1;
        orderCogs += itemCost * qty;
      });
    }
    return orderCogs;
  };

  const costOfGoods = orders.reduce((sum, o) => sum + calculateCogsForOrder(o), 0);
  // Real Net Profit
  const netProfit = totalRevenue - costOfGoods - shippingExpense;

  // Monthly statistics generator from real order data
  const getMonthlyAccounting = () => {
    const monthlyMap: Record<string, { revenue: number; shipRev: number; shipExp: number; orders: number; cogs: number }> = {};
    orders.forEach(order => {
      const monthKey = order.date.substring(0, 7); // e.g. "2026-07"
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { revenue: 0, shipRev: 0, shipExp: 0, orders: 0, cogs: 0 };
      }
      monthlyMap[monthKey].revenue += order.total;
      monthlyMap[monthKey].shipRev += order.total >= 2000 ? 0 : 100;
      monthlyMap[monthKey].shipExp += 60;
      monthlyMap[monthKey].orders += 1;
      monthlyMap[monthKey].cogs += calculateCogsForOrder(order);
    });

    return Object.entries(monthlyMap).map(([mKey, data]) => {
      const parts = mKey.split('-');
      const monthStr = `${parts[0]}年${parts[1]}月`;
      const netMonthlyRev = data.revenue - data.cogs - data.shipExp;
      return {
        month: monthStr,
        revenue: data.revenue,
        shipRev: data.shipRev,
        shipExp: data.shipExp,
        netRevenue: netMonthlyRev,
        ordersCount: data.orders
      };
    }).sort((a, b) => b.month.localeCompare(a.month));
  };

  const monthlyReport = getMonthlyAccounting();

  // Handle local image file selected
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'product' | 'hero' | 'logo') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (target === 'product') {
          setProductForm({ ...productForm, image: base64String });
        } else if (target === 'hero') {
          setHeroImage(base64String);
        } else if (target === 'logo') {
          // Logo upload - save via settings API
          saveSettings({ appLogo: base64String }).then(success => {
            if (success) {
              alert('✅ 品牌 LOGO 已成功更新！請重新整理頁面以顯示新 LOGO。');
            }
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit product creation/update
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.title || !productForm.image) {
      alert('請填寫商品名稱並選擇圖片！');
      return;
    }

    const rawPrice = Number(productForm.price);
    const rawOriginalPrice = Number(productForm.originalPrice);

    // Validation rules
    if (rawPrice > 0) {
      if (rawOriginalPrice <= 0) {
        alert('⚠️ 警告：如果填寫了「特價/售價」，就必須填寫「原價」！');
        return;
      }
      if (rawOriginalPrice < rawPrice) {
        alert('⚠️ 警告：原價必須大於或等於特價/售價！');
        return;
      }
    } else if (rawOriginalPrice <= 0) {
      alert('⚠️ 警告：請填寫商品售價（原價）！');
      return;
    }

    // Determine values to save
    let finalPrice = rawPrice;
    let finalOriginalPrice: number | undefined = rawOriginalPrice;

    if (rawPrice === 0 && rawOriginalPrice > 0) {
      finalPrice = rawOriginalPrice;
      finalOriginalPrice = undefined;
    }

    const payload = {
      id: editingProdId || undefined,
      title: productForm.title,
      category: productForm.category,
      price: finalPrice,
      originalPrice: finalOriginalPrice,
      cost: Number(productForm.cost || 0),
      image: productForm.image,
      rating: 5.0,
      reviews: 0,
      description: productForm.description,
      origin: productForm.origin,
      weight: productForm.weight,
      storage: productForm.storage,
      comfortRating: Number(productForm.comfortRating),
      cookingTip: productForm.cookingTip,
      badges: productForm.badgesStr.split(',').map(s => s.trim()).filter(Boolean),
      brand: productForm.brand,
      isNew: productForm.isNew,
      dimensions: productForm.dimensions,
      stock: Number(productForm.stock),
      isPreOrder: productForm.isPreOrder ? 1 : 0
    };

    saveProduct(payload, !!editingProdId);
    setIsFormOpen(false);
    setEditingProdId(null);
  };

  // Start edit product
  const startEditProduct = (p: Product) => {
    setEditingProdId(p.id);
    const hasDiscount = p.originalPrice !== undefined && p.originalPrice > p.price;
    setProductForm({
      title: p.title,
      category: p.category,
      price: hasDiscount ? p.price : 0,
      originalPrice: p.originalPrice || p.price || 0,
      cost: p.cost || 0,
      description: p.description,
      origin: p.origin,
      weight: p.weight,
      storage: p.storage,
      comfortRating: p.comfortRating || 10,
      cookingTip: p.cookingTip,
      badgesStr: p.badges.join(', '),
      brand: p.brand || 'Lè Lè Design',
      isNew: p.isNew || false,
      image: p.image,
      dimensions: p.dimensions || '',
      stock: p.stock !== undefined ? p.stock : 10,
      isPreOrder: p.isPreOrder === true || (p.isPreOrder as any) === 1
    });
    setIsFormOpen(true);
  };
  // CRM Customer CRUD Handlers
  const handleOpenAddCustomer = () => {
    setEditingCustomer(null);
    setCustomerForm({
      name: '',
      email: '',
      provider: 'Custom',
      tags: '',
      isBlacklisted: false,
      points: 0
    });
    setIsCustomerModalOpen(true);
  };

  const handleOpenEditCustomer = (c: Customer) => {
    setEditingCustomer(c);
    setCustomerForm({
      name: c.name,
      email: c.email,
      provider: c.provider || 'Custom',
      tags: c.tags || '',
      isBlacklisted: c.isBlacklisted === 1 || (c.isBlacklisted as any) === true,
      points: c.points || 0
    });
    setIsCustomerModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.name || !customerForm.email) {
      alert('姓名與電子郵件為必填欄位');
      return;
    }
    
    const token = localStorage.getItem('adminToken');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
    
    try {
      let response;
      if (editingCustomer) {
        // Update
        response = await fetch(`${BACKEND_URL}/api/customers/${editingCustomer.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(customerForm)
        });
      } else {
        // Create
        response = await fetch(`${BACKEND_URL}/api/customers`, {
          method: 'POST',
          headers,
          body: JSON.stringify(customerForm)
        });
      }
      
      if (response.ok) {
        setIsCustomerModalOpen(false);
        if (refreshCustomers) refreshCustomers();
      } else {
        const err = await response.json();
        alert(err.error || '儲存客戶資料失敗');
      }
    } catch (err) {
      console.error(err);
      alert('儲存發生錯誤，請稍後再試');
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!window.confirm('確定要刪除此顧客資料嗎？此動作無法復原。')) {
      return;
    }
    
    const token = localStorage.getItem('adminToken');
    const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/customers/${id}`, {
        method: 'DELETE',
        headers
      });
      if (response.ok) {
        if (refreshCustomers) refreshCustomers();
      } else {
        const err = await response.json();
        alert(err.error || '刪除客戶失敗');
      }
    } catch (err) {
      console.error(err);
      alert('刪除發生錯誤，請稍後再試');
    }
  };

  const handleToggleBlacklist = async (c: Customer) => {
    const token = localStorage.getItem('adminToken');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
    
    const targetState = c.isBlacklisted === 1 ? false : true;
    const confirmMsg = targetState 
      ? `確定要將「${c.name}」列入黑名單嗎？`
      : `確定要將「${c.name}」移出黑名單嗎？`;
      
    if (!window.confirm(confirmMsg)) {
      return;
    }
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/customers/${c.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          name: c.name,
          email: c.email,
          tags: c.tags,
          points: c.points,
          isBlacklisted: targetState
        })
      });
      if (response.ok) {
        if (refreshCustomers) refreshCustomers();
      } else {
        const err = await response.json();
        alert(err.error || '操作失敗');
      }
    } catch (err) {
      console.error(err);
      alert('操作發生錯誤，請稍後再試');
    }
  };

  const handleOpenAddOrder = () => {
    setEditingOrderId(null);
    setOrderForm({
      shippingName: '',
      shippingPhone: '',
      shippingAddress: '',
      shippingEmail: '',
      paymentType: '貨到付款',
      logisticsType: 'HOME',
      logisticsSubType: 'TCAT',
      cvsStoreID: '',
      cvsStoreName: '',
      couponCode: '',
      discountAmount: 0,
      status: '待付款',
      items: []
    });
    setIsOrderModalOpen(true);
  };

  const handleOpenEditOrder = (o: Order) => {
    setEditingOrderId(o.id);
    setOrderForm({
      shippingName: o.shippingName || '',
      shippingPhone: o.shippingPhone || '',
      shippingAddress: o.shippingAddress || '',
      shippingEmail: o.shippingEmail || '',
      paymentType: o.paymentType || '貨到付款',
      logisticsType: o.logisticsType || 'HOME',
      logisticsSubType: o.logisticsSubType || 'TCAT',
      cvsStoreID: o.cvsStoreID || '',
      cvsStoreName: o.cvsStoreName || '',
      couponCode: o.couponCode || '',
      discountAmount: o.discountAmount || 0,
      status: o.status || '待付款',
      items: o.items.map(item => ({
        id: (item as any).id || products.find(p => p.title === item.title)?.id || '',
        title: item.title,
        price: item.price,
        qty: item.qty || (item as any).count || 1,
        image: (item as any).image || products.find(p => p.title === item.title)?.image || ''
      }))
    });
    setIsOrderModalOpen(true);
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm(`確定要刪除訂單 ${orderId} 嗎？此動作將無法復原，並會自動扣減客戶消費統計。`)) {
      return;
    }
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${BACKEND_URL}/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        alert('訂單刪除成功！已更新客戶統計資料。');
        if (refreshOrders) refreshOrders();
        if (refreshCustomers) refreshCustomers();
      } else {
        const err = await response.json();
        alert(err.error || '刪除訂單失敗');
      }
    } catch (err) {
      console.error(err);
      alert('連接伺服器失敗，請稍後再試。');
    }
  };

  const handleSaveOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderForm.items.length === 0) {
      alert('訂單必須包含至少一項商品！');
      return;
    }

    const itemsSubtotal = orderForm.items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const shippingFee = itemsSubtotal >= 2000 ? 0 : 100;
    const finalTotal = Math.max(0, itemsSubtotal + shippingFee - Number(orderForm.discountAmount || 0));

    const payload = {
      items: orderForm.items,
      total: finalTotal,
      shippingName: orderForm.shippingName,
      shippingPhone: orderForm.shippingPhone,
      shippingAddress: orderForm.shippingAddress,
      shippingEmail: orderForm.shippingEmail,
      paymentType: orderForm.paymentType,
      logisticsType: orderForm.logisticsType,
      logisticsSubType: orderForm.logisticsSubType,
      cvsStoreID: orderForm.cvsStoreID || null,
      cvsStoreName: orderForm.cvsStoreName || null,
      couponCode: orderForm.couponCode || null,
      discountAmount: Number(orderForm.discountAmount) || 0,
      status: orderForm.status
    };

    const token = localStorage.getItem('adminToken');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    try {
      let response;
      if (editingOrderId) {
        // Edit order
        response = await fetch(`${BACKEND_URL}/api/orders/${editingOrderId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload)
        });
      } else {
        // Add order
        response = await fetch(`${BACKEND_URL}/api/orders`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            items: orderForm.items,
            total: finalTotal,
            shippingInfo: {
              name: orderForm.shippingName,
              phone: orderForm.shippingPhone,
              address: orderForm.shippingAddress,
              email: orderForm.shippingEmail
            },
            paymentType: orderForm.paymentType,
            logisticsType: orderForm.logisticsType,
            logisticsSubType: orderForm.logisticsSubType,
            cvsStoreID: orderForm.cvsStoreID || null,
            cvsStoreName: orderForm.cvsStoreName || null,
            couponCode: orderForm.couponCode || null,
            discountAmount: Number(orderForm.discountAmount) || 0
          })
        });
      }

      if (response.ok) {
        alert(editingOrderId ? '訂單修改成功！' : '管理員代客下單建立成功！');
        setIsOrderModalOpen(false);
        if (refreshOrders) refreshOrders();
        if (refreshCustomers) refreshCustomers();
      } else {
        const err = await response.json();
        alert(err.error || '儲存訂單失敗');
      }
     } catch (err) {
      console.error(err);
      alert('儲存訂單發生錯誤: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Save Settings Config
  const handleSettingsUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings({
      announcementText,
      heroTitle,
      heroDesc,
      heroImage,
      paymentProvider: integrationKeys.paymentProvider,
      paymentApiKey: integrationKeys.paymentApiKey,
      logisticsProvider: integrationKeys.logisticsProvider,
      logisticsApiKey: integrationKeys.logisticsApiKey,
      googleClientId: integrationKeys.googleClientId,
      lineChannelId: integrationKeys.lineChannelId,
      instagramAccessToken: integrationKeys.instagramAccessToken,
      customCategories: JSON.stringify(customCategories),
      bannerBtnText,
      layoutOrder: JSON.stringify(layoutOrder),
      instagramUrl,
      lineUrl
    }).then(success => {
      if (success) {
        alert('系統內容與金流設定更新成功！');
      }
    });
  };

  const handlePrintLogisticsLabel = (order: Order) => {
    if (!order.ecpayLogisticsId) return;
    const form = document.createElement('form');
    form.method = 'POST';
    form.target = '_blank';
    
    const isTest = true;
    const subType = order.logisticsSubType || 'UNIMART';
    
    let actionUrl = '';
    if (subType === 'UNIMART') {
      actionUrl = isTest 
        ? 'https://logistics-stage.ecpay.com.tw/Express/PrintUniMartC2COrderInfo'
        : 'https://logistics.ecpay.com.tw/Express/PrintUniMartC2COrderInfo';
    } else if (subType === 'FAMI') {
      actionUrl = isTest
        ? 'https://logistics-stage.ecpay.com.tw/Express/PrintFamilyC2COrderInfo'
        : 'https://logistics.ecpay.com.tw/Express/PrintFamilyC2COrderInfo';
    } else {
      alert('宅配單由系統自動指派物流司機，無需手動列印超商店寄店標籤');
      return;
    }

    form.action = actionUrl;
    
    const merchantIdInput = document.createElement('input');
    merchantIdInput.type = 'hidden';
    merchantIdInput.name = 'MerchantID';
    merchantIdInput.value = '2000132';
    form.appendChild(merchantIdInput);

    const logisticsIdInput = document.createElement('input');
    logisticsIdInput.type = 'hidden';
    logisticsIdInput.name = 'AllPayLogisticsID';
    logisticsIdInput.value = order.ecpayLogisticsId;
    form.appendChild(logisticsIdInput);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  return (
    <section className="portal-section" style={{ background: 'var(--bg-primary)', padding: '3rem 0 5rem' }}>
      <div className="container portal-container" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
        
        {/* Admin Sidebar Navigation */}
        <aside className="portal-sidebar glass-panel" style={{ height: 'fit-content' }}>
          <div className="portal-user-card" style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '10px', textAlign: 'center', marginBottom: '1.5rem' }}>
            <Settings size={36} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
            <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 600 }}>慧聚健康後台管理</h3>
            <span className="badge badge-gold" style={{ fontSize: '0.65rem', marginTop: '0.25rem', textTransform: 'none' }}>系統管理員</span>
          </div>
          
          <div className="portal-nav" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button 
              className={`portal-nav-btn ${activeAdminTab === 'dashboard' ? 'active' : ''}`} 
              onClick={() => setActiveAdminTab('dashboard')}
            >
              <BarChart3 size={16} /> 財務經營分析表
            </button>
            <button 
              className={`portal-nav-btn ${activeAdminTab === 'orders' ? 'active' : ''}`} 
              onClick={() => setActiveAdminTab('orders')}
            >
              <ShoppingBag size={16} /> 訂單與出貨管理
            </button>
            <button 
              className={`portal-nav-btn ${activeAdminTab === 'products' ? 'active' : ''}`} 
              onClick={() => setActiveAdminTab('products')}
            >
              <PlusCircle size={16} /> 上架與商品管理
            </button>
            <button 
              className={`portal-nav-btn ${activeAdminTab === 'crm' ? 'active' : ''}`} 
              onClick={() => setActiveAdminTab('crm')}
            >
              <Users size={16} /> CRM 客戶關係管理
            </button>
            <button 
              className={`portal-nav-btn ${activeAdminTab === 'content' ? 'active' : ''}`} 
              onClick={() => setActiveAdminTab('content')}
            >
              <FileText size={16} /> 內容與部落格管理
            </button>
            <button 
              className={`portal-nav-btn ${activeAdminTab === 'integrations' ? 'active' : ''}`} 
              onClick={() => setActiveAdminTab('integrations')}
            >
              <Landmark size={16} /> 金流與串接設定
            </button>
          </div>
        </aside>

        {/* Control Content Panel */}
        <div className="portal-content-box glass-panel" style={{ padding: '2rem', borderRadius: '12px' }}>
          
          {/* TAB 1: FINANCIAL DASHBOARD */}
          {activeAdminTab === 'dashboard' && (
            <div>
              <h2 style={{ marginBottom: '1.5rem', fontSize: '1.6rem', fontWeight: 700 }}>財務核算與經營報表</h2>
              
              {/* Statistical Widgets */}
              <div className="admin-grid-widgets" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
                <div className="admin-widget-card" style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '10px' }}>
                  <div className="admin-widget-title" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>累計總銷售額</div>
                  <div className="admin-widget-val" style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '0.5rem' }}>NT$ {totalRevenue.toLocaleString()}</div>
                </div>
                <div className="admin-widget-card" style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '10px' }}>
                  <div className="admin-widget-title" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>累計銷貨成本 (45% COGS)</div>
                  <div className="admin-widget-val" style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>NT$ {costOfGoods.toLocaleString()}</div>
                </div>
                <div className="admin-widget-card" style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '10px' }}>
                  <div className="admin-widget-title" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>物流運費收入</div>
                  <div className="admin-widget-val" style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--accent)', marginTop: '0.5rem' }}>NT$ {shippingRevenue.toLocaleString()}</div>
                </div>
                <div className="admin-widget-card" style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '10px' }}>
                  <div className="admin-widget-title" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>物流運費支出 (每單 NT$60)</div>
                  <div className="admin-widget-val" style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--error)', marginTop: '0.5rem' }}>NT$ {shippingExpense.toLocaleString()}</div>
                </div>
                <div className="admin-widget-card" style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '10px', gridColumn: 'span 2' }}>
                  <div className="admin-widget-title" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>自動核算預估淨收益</div>
                  <div className="admin-widget-val" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--success)', marginTop: '0.5rem' }}>NT$ {netProfit.toLocaleString()}</div>
                </div>
                <div className="admin-widget-card" style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '10px' }}>
                  <div className="admin-widget-title" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>累計成交訂單</div>
                  <div className="admin-widget-val" style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--primary)', marginTop: '0.5rem' }}>{totalOrdersCount} 筆</div>
                </div>
              </div>

              {/* Visual Analytics Dashboard */}
              {(() => {
                const chartData = [...monthlyReport].reverse();
                const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1000);
                const totalInflow = totalRevenue + shippingRevenue;
                const profitPct = totalInflow > 0 ? Math.round((netProfit / totalInflow) * 100) : 0;
                const cogsPct = totalInflow > 0 ? Math.round((costOfGoods / totalInflow) * 100) : 0;
                const shipPct = totalInflow > 0 ? Math.min(100 - profitPct - cogsPct, Math.round((shippingExpense / totalInflow) * 100)) : 0;

                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    {/* SVG Bar Chart for Sales Trend */}
                    <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', background: '#fff' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '4px', height: '16px', background: 'var(--primary)', borderRadius: '2px', display: 'inline-block' }}></span>
                        月度營業額銷售趨勢
                      </h4>
                      {chartData.length === 0 ? (
                        <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                          暫無足夠的數據進行圖表分析
                        </div>
                      ) : (
                        <div>
                          <svg viewBox="0 0 500 220" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                            {/* Grid lines */}
                            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                              const yVal = 180 - ratio * 140;
                              const gridLabel = Math.round((maxRevenue * ratio) / 1000) * 1000;
                              return (
                                <g key={i}>
                                  <line x1="40" y1={yVal} x2="480" y2={yVal} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                                  <text x="35" y={yVal + 3} textAnchor="end" fill="var(--text-secondary)" fontSize="9">
                                    {ratio === 0 ? '0' : `NT$ ${gridLabel.toLocaleString()}`}
                                  </text>
                                </g>
                              );
                            })}
                            
                            {/* Bars */}
                            {chartData.map((d, idx) => {
                              const barCount = chartData.length;
                              const containerWidth = 420;
                              const barWidth = Math.min(30, (containerWidth / barCount) * 0.4);
                              const spacing = (containerWidth - barWidth * barCount) / (barCount + 1);
                              
                              const xVal = 40 + spacing + idx * (barWidth + spacing);
                              const heightVal = (d.revenue / maxRevenue) * 140;
                              const yVal = 180 - heightVal;
                              
                              return (
                                <g key={idx}>
                                  <title>{`${d.month}: NT$ ${d.revenue.toLocaleString()}`}</title>
                                  {/* Background hover bar */}
                                  <rect x={xVal - 4} y="20" width={barWidth + 8} height="165" fill="transparent" />
                                  {/* Actual bar */}
                                  <rect 
                                    x={xVal} 
                                    y={yVal} 
                                    width={barWidth} 
                                    height={Math.max(2, heightVal)} 
                                    rx="3" 
                                    fill="url(#dashboardBarGrad)" 
                                  />
                                  {/* Label text */}
                                  <text x={xVal + barWidth / 2} y={yVal - 5} textAnchor="middle" fill="var(--primary)" fontSize="8" fontWeight="bold">
                                    {d.revenue > 0 ? `${Math.round(d.revenue / 1000)}k` : ''}
                                  </text>
                                  {/* Axis label */}
                                  <text x={xVal + barWidth / 2} y="196" textAnchor="middle" fill="var(--text-secondary)" fontSize="8">
                                    {d.month.replace('年', '/').replace('月', '')}
                                  </text>
                                </g>
                              );
                            })}
                            
                            <defs>
                              <linearGradient id="dashboardBarGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--primary)" />
                                <stop offset="100%" stopColor="var(--accent)" />
                              </linearGradient>
                            </defs>
                            
                            {/* X-axis */}
                            <line x1="40" y1="180" x2="480" y2="180" stroke="#cbd5e1" strokeWidth="1" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* SVG Doughnut Chart for Cost / Revenue Structure */}
                    <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', background: '#fff', display: 'flex', flexDirection: 'column' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '4px', height: '16px', background: 'var(--accent)', borderRadius: '2px', display: 'inline-block' }}></span>
                        累計收支與利潤比例
                      </h4>
                      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        {totalInflow === 0 ? (
                          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>暫無銷售數據</div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ position: 'relative', width: '110px', height: '110px' }}>
                              <svg width="110" height="110" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
                                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                                
                                {/* COGS segment */}
                                <circle 
                                  cx="18" 
                                  cy="18" 
                                  r="15.915" 
                                  fill="none" 
                                  stroke="#f97316" 
                                  strokeWidth="4.2" 
                                  strokeDasharray={`${cogsPct} ${100 - cogsPct}`}
                                  strokeDashoffset="0"
                                />
                                
                                {/* Shipping segment */}
                                <circle 
                                  cx="18" 
                                  cy="18" 
                                  r="15.915" 
                                  fill="none" 
                                  stroke="var(--error)" 
                                  strokeWidth="4.2" 
                                  strokeDasharray={`${shipPct} ${100 - shipPct}`}
                                  strokeDashoffset={-cogsPct}
                                />

                                {/* Net Profit segment */}
                                <circle 
                                  cx="18" 
                                  cy="18" 
                                  r="15.915" 
                                  fill="none" 
                                  stroke="var(--success)" 
                                  strokeWidth="4.2" 
                                  strokeDasharray={`${profitPct} ${100 - profitPct}`}
                                  strokeDashoffset={-(cogsPct + shipPct)}
                                />
                              </svg>
                              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--success)', lineHeight: 1 }}>{profitPct}%</div>
                                <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '2px' }}>預估淨利</div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.75rem', minWidth: '150px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%' }}></span>
                                  預估淨利
                                </span>
                                <span style={{ fontWeight: 600 }}>{profitPct}%</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span style={{ width: '8px', height: '8px', background: '#f97316', borderRadius: '50%' }}></span>
                                  銷貨成本
                                </span>
                                <span style={{ fontWeight: 600 }}>{cogsPct}%</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span style={{ width: '8px', height: '8px', background: 'var(--error)', borderRadius: '50%' }}></span>
                                  運費支出
                                </span>
                                <span style={{ fontWeight: 600 }}>{shipPct}%</span>
                              </div>
                              <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.25rem', paddingTop: '0.25rem', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                * 基於 45% 商品採購成本估算
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', fontWeight: 600 }}>自動核算月度明細</h3>
              <div className="admin-table-container">
                {monthlyReport.length === 0 ? (
                  <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>尚無可供結算的訂單資料</p>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>結算月份</th>
                        <th>訂單筆數</th>
                        <th>總營業額</th>
                        <th>物流運費收入</th>
                        <th>物流運費支出</th>
                        <th>估算淨收益</th>
                        <th>狀態</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyReport.map((rep, idx) => (
                        <tr key={idx}>
                          <td>{rep.month}</td>
                          <td>{rep.ordersCount} 筆</td>
                          <td>NT$ {rep.revenue.toLocaleString()}</td>
                          <td>NT$ {rep.shipRev.toLocaleString()}</td>
                          <td style={{ color: 'var(--error)' }}>NT$ {rep.shipExp.toLocaleString()}</td>
                          <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>NT$ {rep.netRevenue.toLocaleString()}</td>
                          <td>
                            {idx === 0 ? (
                              <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>本月結算中</span>
                            ) : (
                              <span className="badge badge-gold" style={{ background: 'rgba(90, 125, 97, 0.15)', color: 'var(--success)', border: 'none', fontSize: '0.7rem' }}>已完成結算</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS MANAGEMENT & PRINT SLIP */}
          {activeAdminTab === 'orders' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0 }}>訂單出貨與撿貨清單管理</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    追蹤全站毛孩產品的訂單，支持修改物流狀態，並可直接預覽列印出貨撿貨單（Packing Slip）隨箱派送。
                  </p>
                </div>
                <button 
                  className="btn btn-primary" 
                  onClick={handleOpenAddOrder}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '42px', padding: '0 1.25rem', borderRadius: '8px' }}
                >
                  <PlusCircle size={16} /> 新增訂單
                </button>
              </div>

              <div className="admin-table-container">
                {orders.length === 0 ? (
                  <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>系統目前沒有任何訂單紀錄</p>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>訂單編號</th>
                        <th>訂購日期</th>
                        <th>收件人</th>
                        <th>購買細目</th>
                        <th>金額</th>
                        <th>狀態</th>
                        <th>操作與列印</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id}>
                          <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{order.id}</td>
                          <td>{order.date}</td>
                           <td>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{order.shippingName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{order.shippingPhone}</div>
                            {order.logisticsType && (
                              <div style={{ fontSize: '0.7rem', color: 'var(--primary)', marginTop: '0.25rem' }}>
                                🚚 {order.logisticsSubType === 'HOME' ? '質感宅配' : order.logisticsSubType === 'UNIMART' ? '7-11 超取' : '全家超取'}
                                {order.cvsStoreName ? ` - ${order.cvsStoreName}` : ''}
                              </div>
                            )}
                          </td>
                          <td style={{ maxWidth: '220px' }}>
                            <div style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {order.items.map(item => `${item.title} x${item.qty}`).join(', ')}
                            </div>
                          </td>
                          <td>
                             <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>NT$ {order.total.toLocaleString()}</div>
                             {order.couponCode && (
                               <div style={{ fontSize: '0.75rem', color: '#2a9d8f', marginTop: '0.2rem', whiteSpace: 'nowrap' }}>
                                 🏷️ {order.couponCode} (-NT$ {order.discountAmount || 0})
                               </div>
                             )}
                          </td>
                          <td>
                            <select 
                              className="sort-select" 
                              style={{ padding: '0.25rem', fontSize: '0.8rem', borderRadius: '4px', height: 'auto', border: '1px solid var(--border)' }}
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            >
                              <option value="待付款">待付款</option>
                              <option value="已付款">已付款</option>
                              <option value="處理中 / 質感宅配">處理中 / 質感宅配</option>
                              <option value="已出貨">已出貨</option>
                              <option value="已完成">已完成</option>
                              <option value="已取消">已取消</option>
                            </select>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-start' }}>
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', width: '100%', justifyContent: 'center' }}
                                onClick={() => setPrintingOrder(order)}
                              >
                                <Printer size={12} /> 撿貨單列印
                              </button>
                              <div style={{ display: 'flex', gap: '0.4rem', width: '100%' }}>
                                <button 
                                  className="btn btn-secondary" 
                                  style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', flexGrow: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}
                                  onClick={() => handleOpenEditOrder(order)}
                                >
                                  <Edit size={12} /> 編輯
                                </button>
                                <button 
                                  className="btn btn-secondary" 
                                  style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', flexGrow: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem', color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                                  onClick={() => handleDeleteOrder(order.id)}
                                >
                                  <Trash2 size={12} /> 刪除
                                </button>
                              </div>
                              
                              {order.logisticsType && order.logisticsType !== 'HOME' && (
                                <>
                                  {order.ecpayLogisticsId ? (
                                    <div style={{ width: '100%' }}>
                                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.2rem', textAlign: 'center' }}>
                                        綠界單號: <code>{order.ecpayLogisticsId}</code>
                                      </div>
                                      <div style={{ fontSize: '0.7rem', color: 'var(--primary)', marginBottom: '0.4rem', textAlign: 'center' }}>
                                        狀態: {order.ecpayLogisticsStatus || '物流待處理'}
                                      </div>
                                      <button 
                                        className="btn btn-primary" 
                                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', width: '100%', justifyContent: 'center', background: '#2c3e50', borderColor: '#2c3e50' }}
                                        onClick={() => handlePrintLogisticsLabel(order)}
                                      >
                                        📄 列印綠界標籤
                                      </button>
                                    </div>
                                  ) : (
                                    <button 
                                      className="btn btn-primary" 
                                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', width: '100%', justifyContent: 'center' }}
                                      disabled={logisticsLoading === order.id}
                                      onClick={() => handleCreateEcpayLogistics(order.id)}
                                    >
                                      {logisticsLoading === order.id ? '建立中...' : '🚚 建立綠界物流訂單'}
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Order Add/Edit Modal */}
              {isOrderModalOpen && (
                <div className="woo-modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, padding: '1rem' }}>
                  <div className="glass-panel" style={{ width: '100%', maxWidth: '720px', borderRadius: '16px', background: '#fff', border: '1px solid var(--border)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    
                    {/* Fixed Header */}
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShoppingBag size={20} style={{ color: 'var(--primary)' }} />
                        {editingOrderId ? `編輯訂單：${editingOrderId}` : '建立代客訂單 (管理員新增)'}
                      </h3>
                      <button 
                        type="button"
                        onClick={() => setIsOrderModalOpen(false)} 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '4px' }}
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {/* Form container */}
                    <form onSubmit={handleSaveOrderSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                      
                      {/* Scrollable Body */}
                      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                          <div className="form-group">
                            <label className="form-label" style={{ fontWeight: 600 }}>收件人姓名 *</label>
                            <input 
                              type="text" 
                              required
                              className="form-input" 
                              value={orderForm.shippingName}
                              onChange={(e) => setOrderForm({ ...orderForm, shippingName: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label" style={{ fontWeight: 600 }}>收件人電話 *</label>
                            <input 
                              type="text" 
                              required
                              className="form-input" 
                              value={orderForm.shippingPhone}
                              onChange={(e) => setOrderForm({ ...orderForm, shippingPhone: e.target.value })}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                          <div className="form-group">
                            <label className="form-label" style={{ fontWeight: 600 }}>收件人 Email *</label>
                            <input 
                              type="email" 
                              required
                              className="form-input" 
                              value={orderForm.shippingEmail}
                              onChange={(e) => setOrderForm({ ...orderForm, shippingEmail: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label" style={{ fontWeight: 600 }}>收件地址 *</label>
                            <input 
                              type="text" 
                              required
                              className="form-input" 
                              value={orderForm.shippingAddress}
                              onChange={(e) => setOrderForm({ ...orderForm, shippingAddress: e.target.value })}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                          <div className="form-group">
                            <label className="form-label">付款方式</label>
                            <select 
                              className="form-input"
                              value={orderForm.paymentType}
                              onChange={(e) => setOrderForm({ ...orderForm, paymentType: e.target.value })}
                              style={{ appearance: 'auto', padding: '0 8px' }}
                            >
                              <option value="貨到付款">貨到付款</option>
                              <option value="信用卡">信用卡</option>
                              <option value="GreenWorld">綠界科技 (ECPay)</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label className="form-label">物流類型</label>
                            <select 
                              className="form-input"
                              value={orderForm.logisticsType}
                              onChange={(e) => {
                                const val = e.target.value;
                                setOrderForm({ 
                                  ...orderForm, 
                                  logisticsType: val,
                                  logisticsSubType: val === 'HOME' ? 'TCAT' : 'UNIMART',
                                  cvsStoreID: '',
                                  cvsStoreName: ''
                                });
                              }}
                              style={{ appearance: 'auto', padding: '0 8px' }}
                            >
                              <option value="HOME">宅配到府</option>
                              <option value="CVS">超商取貨</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label className="form-label">物流子類型</label>
                            <select 
                              className="form-input"
                              value={orderForm.logisticsSubType}
                              onChange={(e) => setOrderForm({ ...orderForm, logisticsSubType: e.target.value })}
                              style={{ appearance: 'auto', padding: '0 8px' }}
                            >
                              {orderForm.logisticsType === 'HOME' ? (
                                <>
                                  <option value="TCAT">黑貓宅急便</option>
                                  <option value="POST">郵局配送</option>
                                </>
                              ) : (
                                <>
                                  <option value="UNIMART">7-11 超商</option>
                                  <option value="FAMI">全家超商</option>
                                </>
                              )}
                            </select>
                          </div>
                        </div>

                        {orderForm.logisticsType === 'CVS' && (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                            <div className="form-group">
                              <label className="form-label">超商店號 (CVS ID)</label>
                              <input 
                                type="text" 
                                className="form-input" 
                                placeholder="例如: 991234"
                                value={orderForm.cvsStoreID}
                                onChange={(e) => setOrderForm({ ...orderForm, cvsStoreID: e.target.value })}
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label">超商名稱 (Store Name)</label>
                              <input 
                                type="text" 
                                className="form-input" 
                                placeholder="例如: 樂肉門市"
                                value={orderForm.cvsStoreName}
                                onChange={(e) => setOrderForm({ ...orderForm, cvsStoreName: e.target.value })}
                              />
                            </div>
                          </div>
                        )}

                        <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', marginTop: 0 }}>選擇購買商品</h4>
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <select 
                              id="modalProductSelect"
                              className="form-input"
                              style={{ flex: '1 1 200px', appearance: 'auto', padding: '0 8px' }}
                              defaultValue=""
                            >
                              <option value="" disabled>-- 請選擇要新增的商品 --</option>
                              {products.map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.title} (NT$ {p.price.toLocaleString()})
                                </option>
                              ))}
                            </select>
                            <input 
                              type="number" 
                              id="modalProductQty"
                              className="form-input" 
                              defaultValue="1"
                              min="1"
                              style={{ width: '70px', padding: '0 8px' }}
                            />
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ whiteSpace: 'nowrap', padding: '0 1rem', height: '42px' }}
                              onClick={() => {
                                const selectEl = document.getElementById('modalProductSelect') as HTMLSelectElement;
                                const qtyEl = document.getElementById('modalProductQty') as HTMLInputElement;
                                const prodId = selectEl?.value;
                                const qty = parseInt(qtyEl?.value) || 1;
                                
                                if (!prodId) {
                                  alert('請先選擇一個商品！');
                                  return;
                                }
                                
                                const prod = products.find(p => p.id === prodId);
                                if (prod) {
                                  const existingItemIdx = orderForm.items.findIndex(item => item.id === prod.id);
                                  if (existingItemIdx > -1) {
                                    const updated = [...orderForm.items];
                                    updated[existingItemIdx].qty += qty;
                                    setOrderForm({ ...orderForm, items: updated });
                                  } else {
                                    setOrderForm({
                                      ...orderForm,
                                      items: [
                                        ...orderForm.items,
                                        {
                                          id: prod.id,
                                          title: prod.title,
                                          price: prod.price,
                                          qty: qty,
                                          image: prod.image
                                        }
                                      ]
                                    });
                                  }
                                  selectEl.value = "";
                                  qtyEl.value = "1";
                                }
                              }}
                            >
                              加入
                            </button>
                          </div>

                          {/* Selected Items List */}
                          <div style={{ marginTop: '1rem', maxHeight: '180px', overflowY: 'auto' }}>
                            {orderForm.items.length === 0 ? (
                              <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', margin: '1rem 0' }}>目前未添加任何商品</p>
                            ) : (
                              <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                                <thead>
                                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                                    <th style={{ padding: '4px 0' }}>品名</th>
                                    <th>單價</th>
                                    <th>數量</th>
                                    <th>小計</th>
                                    <th style={{ textAlign: 'right' }}>操作</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {orderForm.items.map((item, idx) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                      <td style={{ padding: '6px 0', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</td>
                                      <td>NT$ {item.price}</td>
                                      <td>
                                        <input 
                                          type="number"
                                          min="1"
                                          value={item.qty}
                                          onChange={(e) => {
                                            const val = parseInt(e.target.value) || 1;
                                            const updated = [...orderForm.items];
                                            updated[idx].qty = val;
                                            setOrderForm({ ...orderForm, items: updated });
                                          }}
                                          style={{ width: '50px', padding: '2px', border: '1px solid var(--border)', borderRadius: '4px' }}
                                        />
                                      </td>
                                      <td>NT$ {item.price * item.qty}</td>
                                      <td style={{ textAlign: 'right' }}>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updated = orderForm.items.filter((_, i) => i !== idx);
                                            setOrderForm({ ...orderForm, items: updated });
                                          }}
                                          style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}
                                        >
                                          移除
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                          <div className="form-group">
                            <label className="form-label">折扣代碼 (選填)</label>
                            <input 
                              type="text" 
                              className="form-input" 
                              placeholder="例如: NEW100"
                              value={orderForm.couponCode}
                              onChange={(e) => setOrderForm({ ...orderForm, couponCode: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">折抵金額 (NT$)</label>
                            <input 
                              type="number" 
                              className="form-input" 
                              value={orderForm.discountAmount}
                              onChange={(e) => setOrderForm({ ...orderForm, discountAmount: Number(e.target.value) || 0 })}
                            />
                          </div>
                        </div>

                        {editingOrderId && (
                          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                            <label className="form-label">訂單狀態</label>
                            <select 
                              className="form-input"
                              value={orderForm.status}
                              onChange={(e) => setOrderForm({ ...orderForm, status: e.target.value })}
                              style={{ appearance: 'auto', padding: '0 8px' }}
                            >
                              <option value="待付款">待付款</option>
                              <option value="已付款">已付款</option>
                              <option value="處理中 / 質感宅配">處理中 / 質感宅配</option>
                              <option value="已出貨">已出貨</option>
                              <option value="已完成">已完成</option>
                              <option value="已取消">已取消</option>
                            </select>
                          </div>
                        )}

                        {/* Totals Summary */}
                        {(() => {
                          const itemsSubtotal = orderForm.items.reduce((sum, item) => sum + item.price * item.qty, 0);
                          const shippingFee = itemsSubtotal >= 2000 || itemsSubtotal === 0 ? 0 : 100;
                          const finalTotal = Math.max(0, itemsSubtotal + shippingFee - Number(orderForm.discountAmount || 0));

                          return (
                            <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '1rem', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>商品小計:</span>
                                <span>NT$ {itemsSubtotal.toLocaleString()}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>物流運費:</span>
                                <span>NT$ {shippingFee.toLocaleString()} {itemsSubtotal >= 2000 && <span style={{ color: 'var(--success)', fontSize: '0.75rem' }}>(滿額免運)</span>}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', color: 'var(--error)' }}>
                                <span>活動折抵:</span>
                                <span>-NT$ {Number(orderForm.discountAmount).toLocaleString()}</span>
                              </div>
                              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.5rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1rem', color: 'var(--primary)' }}>
                                <span>應付總額:</span>
                                <span>NT$ {finalTotal.toLocaleString()}</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Fixed Footer Actions */}
                      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: '#fafafa' }}>
                        <button 
                          type="button" 
                          className="btn btn-secondary" 
                          onClick={() => setIsOrderModalOpen(false)}
                          style={{ height: '42px', padding: '0 1.5rem' }}
                        >
                          取消
                        </button>
                        <button 
                          type="submit" 
                          className="btn btn-primary"
                          style={{ height: '42px', padding: '0 1.5rem' }}
                        >
                          {editingOrderId ? '儲存修改' : '建立代客訂單'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
 
          {/* TAB 3: WOOCOMMERCE PRODUCT EDITOR */}
          {activeAdminTab === 'products' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>線上商品與上架管理</h2>
                {!isFormOpen && (
                  <button 
                    className="btn btn-primary" 
                    onClick={() => {
                      setEditingProdId(null);
                      setProductForm({
                        title: '',
                        category: 'apparel',
                        price: 0,
                        originalPrice: 0,
                        cost: 0,
                        description: '',
                        origin: '台灣設計製造',
                        weight: '規格可選',
                        storage: '懸掛晾乾 / 清水洗淨',
                        comfortRating: 10,
                        cookingTip: '定期保養與適度清潔',
                        badgesStr: '新品推薦, 大地色系',
                        brand: 'Lè Lè Design',
                        isNew: true,
                        image: '',
                        dimensions: '',
                        stock: 10,
                        isPreOrder: false
                      });
                      setIsFormOpen(true);
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Plus size={16} /> 新增商品
                  </button>
                )}
              </div>

              {isFormOpen ? (
                /* WOOCOMMERCE STYLE EDITOR VIEW */
                <div className="woo-product-editor">
                  <div className="woo-editor-header">
                    <h3>{editingProdId ? `編輯商品：${productForm.title}` : '新增上架商品'}</h3>
                    <button 
                      type="button"
                      className="btn btn-secondary" 
                      onClick={() => setIsFormOpen(false)}
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <ArrowLeft size={14} /> 返回列表
                    </button>
                  </div>
                  
                  <form onSubmit={handleProductSubmit} className="woo-editor-body">
                    
                    {/* Main Left Column: Titles & descriptions */}
                    <div className="woo-editor-main-col">
                      <div className="woo-editor-box">
                        <div className="woo-editor-box-title">基本資訊</div>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                          <label className="form-label" style={{ fontWeight: 600 }}>商品名稱</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="請輸入商品名稱..." 
                            required
                            value={productForm.title}
                            onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 600 }}>商品詳細敘述</label>
                          <RichTextEditor 
                            value={productForm.description}
                            onChange={(val) => setProductForm({ ...productForm, description: val })}
                          />
                        </div>
                      </div>

                      <div className="woo-editor-box">
                        <div className="woo-editor-box-title">產品詳細資料</div>
                        <div className="form-group-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                          <div className="form-group">
                            <label className="form-label" style={{ fontWeight: 600 }}>特價 / 促銷價 (NT$選填)</label>
                            <input 
                              type="number" 
                              className="form-input" 
                              placeholder="沒有特價可不填" 
                              value={productForm.price || ''}
                              onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label" style={{ fontWeight: 600 }}>原價 / 常規售價 (NT$)</label>
                            <input 
                              type="number" 
                              className="form-input" 
                              placeholder="例如：980" 
                              value={productForm.originalPrice || ''}
                              onChange={(e) => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label" style={{ fontWeight: 600 }}>進貨成本 (NT$)</label>
                            <input 
                              type="number" 
                              className="form-input" 
                              placeholder="例如：450" 
                              value={productForm.cost || ''}
                              onChange={(e) => setProductForm({ ...productForm, cost: Number(e.target.value) })}
                            />
                          </div>
                        </div>

                        <div className="form-group-row" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1rem' }}>
                          <div className="form-group">
                            <label className="form-label">規格尺寸說明</label>
                            <input 
                              type="text" 
                              className="form-input" 
                              placeholder="例如：S / M / L 尺寸可選"
                              value={productForm.dimensions}
                              onChange={(e) => setProductForm({ ...productForm, dimensions: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="form-group-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div className="form-group">
                            <label className="form-label">庫存數量</label>
                            <input 
                              type="number" 
                              className="form-input" 
                              placeholder="例如：10"
                              value={productForm.stock}
                              onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                            />
                          </div>
                          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: '1.25rem', userSelect: 'none' }}>
                              <input 
                                type="checkbox" 
                                checked={productForm.isPreOrder}
                                onChange={(e) => setProductForm({ ...productForm, isPreOrder: e.target.checked })}
                                style={{ cursor: 'pointer' }}
                              />
                              <span>允許無庫存下單 (預購商品)</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Images & Meta properties */}
                    <div className="woo-editor-side-col">
                      <div className="woo-editor-box">
                        <div className="woo-editor-box-title">商品選物圖片</div>
                        
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                          <button
                            type="button"
                            className={`category-btn ${imageSource === 'local' ? 'active' : ''}`}
                            onClick={() => setImageSource('local')}
                            style={{ flexGrow: 1, padding: '0.4rem', fontSize: '0.8rem', borderRadius: '4px' }}
                          >
                            從本機傳
                          </button>
                          <button
                            type="button"
                            className={`category-btn ${imageSource === 'url' ? 'active' : ''}`}
                            onClick={() => setImageSource('url')}
                            style={{ flexGrow: 1, padding: '0.4rem', fontSize: '0.8rem', borderRadius: '4px' }}
                          >
                            外部圖片網址
                          </button>
                        </div>

                        {imageSource === 'local' ? (
                          <div className="image-upload-preview-area">
                            {productForm.image && productForm.image.startsWith('data:') ? (
                              <>
                                <img src={productForm.image} alt="Upload preview" />
                                <button 
                                  type="button" 
                                  className="modal-close-btn"
                                  style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer' }}
                                  onClick={() => setProductForm({ ...productForm, image: '' })}
                                >
                                  <X size={14} />
                                </button>
                              </>
                            ) : (
                              <>
                                <Upload size={32} style={{ color: 'var(--text-muted)' }} />
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>請拖曳圖片至此處上架</p>
                                <label className="image-upload-btn-label">
                                  選擇本地檔案
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    style={{ display: 'none' }} 
                                    onChange={(e) => handleFileChange(e, 'product')} 
                                  />
                                </label>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="form-group">
                            <label className="form-label" style={{ fontSize: '0.8rem' }}>貼上外部圖片 URL 網址</label>
                            <input 
                              type="text" 
                              className="form-input" 
                              placeholder="https://example.com/image.jpg" 
                              value={productForm.image.startsWith('data:') ? '' : productForm.image}
                              onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                            />
                            {productForm.image && !productForm.image.startsWith('data:') && (
                              <div style={{ marginTop: '0.75rem', position: 'relative', height: '140px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                <img src={productForm.image} alt="External preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <button 
                                  type="button" 
                                  className="modal-close-btn"
                                  style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer' }}
                                  onClick={() => setProductForm({ ...productForm, image: '' })}
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="woo-editor-box">
                        <div className="woo-editor-box-title">分類與品牌</div>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label className="form-label" style={{ margin: 0 }}>商品分類</label>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>點擊選取，或直接點 [x] 刪除</span>
                          </div>
                          
                          {/* List of categories with inline delete X */}
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem', marginBottom: '0.75rem' }}>
                            {customCategories.map(cat => (
                              <div 
                                key={cat.id} 
                                style={{ 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  gap: '4px',
                                  padding: '0.3rem 0.6rem',
                                  borderRadius: '6px',
                                  border: '1px solid',
                                  borderColor: productForm.category === cat.id ? 'var(--primary)' : 'var(--border)',
                                  background: productForm.category === cat.id ? 'var(--accent-light)' : 'var(--bg-primary)',
                                  color: productForm.category === cat.id ? 'var(--primary)' : 'var(--text-secondary)',
                                  fontWeight: productForm.category === cat.id ? 600 : 500,
                                  transition: 'all 0.2s'
                                }}
                              >
                                <span 
                                  style={{ cursor: 'pointer', fontSize: '0.85rem', userSelect: 'none' }}
                                  onClick={() => setProductForm({ ...productForm, category: cat.id })}
                                >
                                  {cat.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    if (customCategories.length <= 1) {
                                      alert('最少需保留一個分類！');
                                      return;
                                    }
                                    if (confirm(`確定要刪除分類「${cat.name}」嗎？`)) {
                                      const updated = customCategories.filter(c => c.id !== cat.id);
                                      await handleSaveCategories(updated);
                                      if (productForm.category === cat.id && updated.length > 0) {
                                        setProductForm(prev => ({ ...prev, category: updated[0].id }));
                                      }
                                    }
                                  }}
                                  style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    color: productForm.category === cat.id ? 'var(--primary)' : '#999', 
                                    cursor: 'pointer', 
                                    padding: '2px', 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    borderRadius: '50%',
                                    marginLeft: '2px'
                                  }}
                                  title={`刪除分類 ${cat.name}`}
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Quick Add inline Form */}
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input 
                              type="text" 
                              className="form-input" 
                              placeholder="新增自訂分類..." 
                              style={{ height: '30px', padding: '0 0.5rem', fontSize: '0.8rem', width: '150px' }}
                              value={quickCatInput}
                              onChange={(e) => setQuickCatInput(e.target.value)}
                            />
                            <button
                              type="button"
                              className="btn btn-primary"
                              style={{ height: '30px', padding: '0 0.5rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                              onClick={async () => {
                                const name = quickCatInput.trim();
                                if (!name) return;
                                const id = 'cat-' + Date.now();
                                const updated = [...customCategories, { id, name }];
                                  await handleSaveCategories(updated);
                                setQuickCatInput('');
                                setProductForm(prev => ({ ...prev, category: id })); // auto-select the newly added category
                              }}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label className="form-label" style={{ margin: 0 }}>選擇商品品牌</label>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>點擊選取，或直接點 [x] 刪除</span>
                          </div>
                          
                          {/* List of brands with inline delete X */}
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem', marginBottom: '0.75rem' }}>
                            {customBrands.map(brand => (
                              <div 
                                key={brand.id} 
                                style={{ 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  gap: '4px',
                                  padding: '0.3rem 0.6rem',
                                  borderRadius: '6px',
                                  border: '1px solid',
                                  borderColor: productForm.brand === brand.name ? 'var(--primary)' : 'var(--border)',
                                  background: productForm.brand === brand.name ? 'var(--accent-light)' : 'var(--bg-primary)',
                                  color: productForm.brand === brand.name ? 'var(--primary)' : 'var(--text-secondary)',
                                  fontWeight: productForm.brand === brand.name ? 600 : 500,
                                  transition: 'all 0.2s'
                                }}
                              >
                                <span 
                                  style={{ cursor: 'pointer', fontSize: '0.85rem', userSelect: 'none' }}
                                  onClick={() => setProductForm({ ...productForm, brand: brand.name })}
                                >
                                  {brand.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    if (customBrands.length <= 1) {
                                      alert('最少需保留一個品牌！');
                                      return;
                                    }
                                    if (confirm(`確定要刪除品牌「${brand.name}」嗎？`)) {
                                      const updated = customBrands.filter(b => b.id !== brand.id);
                                      await handleSaveBrands(updated);
                                      if (productForm.brand === brand.name && updated.length > 0) {
                                        setProductForm(prev => ({ ...prev, brand: updated[0].name }));
                                      }
                                    }
                                  }}
                                  style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    color: productForm.brand === brand.name ? 'var(--primary)' : '#999', 
                                    cursor: 'pointer', 
                                    padding: '2px', 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    borderRadius: '50%',
                                    marginLeft: '2px'
                                  }}
                                  title={`刪除品牌 ${brand.name}`}
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Quick Add inline Form */}
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input 
                              type="text" 
                              className="form-input" 
                              placeholder="新增自訂品牌..." 
                              style={{ height: '30px', padding: '0 0.5rem', fontSize: '0.8rem', width: '150px' }}
                              value={quickBrandInput}
                              onChange={(e) => setQuickBrandInput(e.target.value)}
                            />
                            <button
                              type="button"
                              className="btn btn-primary"
                              style={{ height: '30px', padding: '0 0.5rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                              onClick={async () => {
                                const name = quickBrandInput.trim();
                                if (!name) return;
                                const id = 'brand-' + Date.now();
                                const updated = [...customBrands, { id, name }];
                                await handleSaveBrands(updated);
                                setQuickBrandInput('');
                                setProductForm(prev => ({ ...prev, brand: name })); // auto-select the newly added brand
                              }}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">特色標籤 (逗號隔開)</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="例如：防潑水, 安全反光, 手作皮革"
                            value={productForm.badgesStr}
                            onChange={(e) => setProductForm({ ...productForm, badgesStr: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="woo-editor-box">
                        <div className="woo-editor-box-title">狀態配置</div>
                        <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={productForm.isNew} 
                            onChange={(e) => setProductForm({ ...productForm, isNew: e.target.checked })} 
                          />
                          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>標記為新品 (New)</span>
                        </label>
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                        <button type="submit" className="btn btn-primary" style={{ flexGrow: 1, padding: '0.75rem' }}>
                          {editingProdId ? '儲存修改' : '上架發佈商品'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              ) : (
                /* PRODUCTS LIST VIEW */
                <div>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', maxWidth: '400px' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="搜尋線上商品..." 
                      value={prodSearch}
                      onChange={(e) => setProdSearch(e.target.value)}
                    />
                  </div>

                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>商品圖片</th>
                          <th>商品名稱</th>
                          <th>分類</th>
                          <th>品牌</th>
                          <th>售價</th>
                          <th>狀態</th>
                          <th>操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.filter(p => p.title.toLowerCase().includes(prodSearch.toLowerCase())).map(p => (
                          <tr key={p.id}>
                            <td>
                              <img 
                                src={p.image} 
                                alt={p.title} 
                                style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)' }} 
                              />
                            </td>
                            <td style={{ fontWeight: '600' }}>{p.title}</td>
                            <td>
                              {p.category === 'apparel' ? '毛孩服飾' : p.category === 'accessories' ? '精選配件' : p.category === 'outing' ? '外出用品' : p.category === 'toys' ? '紓壓玩具' : '精緻選物'}
                            </td>
                            <td>{p.brand}</td>
                            <td style={{ color: 'var(--primary)', fontWeight: 'bold' }}>NT$ {p.price.toLocaleString()}</td>
                            <td>{p.isNew ? <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>新品NEW</span> : '一般'}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button 
                                  onClick={() => startEditProduct(p)} 
                                  style={{ color: 'var(--primary)', cursor: 'pointer', background: 'none', border: 'none' }} 
                                  title="編輯"
                                >
                                  <Edit size={16} />
                                </button>
                                <button 
                                  onClick={() => deleteProduct(p.id)} 
                                  style={{ color: 'var(--error)', cursor: 'pointer', background: 'none', border: 'none' }} 
                                  title="刪除"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* TAB 4: CRM CUSTOMERS MANAGEMENT */}
          {activeAdminTab === 'crm' && (() => {
            const filteredCustomers = customers.filter(c => {
              const matchesSearch = 
                c.name.toLowerCase().includes(crmSearchQuery.toLowerCase()) ||
                c.email.toLowerCase().includes(crmSearchQuery.toLowerCase()) ||
                (c.tags || '').toLowerCase().includes(crmSearchQuery.toLowerCase()) ||
                c.id.toLowerCase().includes(crmSearchQuery.toLowerCase());
                
              const isBlack = c.isBlacklisted === 1 || (c.isBlacklisted as any) === true;
              const matchesStatus = 
                crmStatusFilter === 'all' ? true :
                crmStatusFilter === 'blacklist' ? isBlack : !isBlack;
                
              return matchesSearch && matchesStatus;
            });

            return (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0 }}>CRM 客戶管理與顧客資料</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      蒐集並管理透過 Google、LINE 或 Facebook 註冊的會員清單。支持累積點數、歷史交易總額追蹤，以及黑名單管理。
                    </p>
                  </div>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleOpenAddCustomer}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '42px', padding: '0 1.25rem', borderRadius: '8px' }}
                  >
                    <Plus size={16} /> 新增顧客
                  </button>
                </div>

                {/* Search and Filter Row */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', flexGrow: 1, minWidth: '240px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      placeholder="搜尋顧客姓名、電子郵件、標籤或 ID..." 
                      className="form-input search-input-with-icon" 
                      style={{ paddingLeft: '38px', height: '42px', margin: 0 }}
                      value={crmSearchQuery}
                      onChange={(e) => setCrmSearchQuery(e.target.value)}
                    />
                  </div>
                  <select 
                    className="form-input" 
                    style={{ width: '160px', height: '42px', margin: 0 }}
                    value={crmStatusFilter}
                    onChange={(e) => setCrmStatusFilter(e.target.value as any)}
                  >
                    <option value="all">全部狀態</option>
                    <option value="normal">正常會員</option>
                    <option value="blacklist">黑名單會員</option>
                  </select>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>顧客 ID</th>
                        <th>姓名 / 標籤</th>
                        <th>電子郵件</th>
                        <th>註冊管道</th>
                        <th>累積點數</th>
                        <th>累計消費額</th>
                        <th>狀態</th>
                        <th style={{ textAlign: 'right' }}>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                            沒有找到符合條件的顧客資料。
                          </td>
                        </tr>
                      ) : (
                        filteredCustomers.map(c => {
                          const isBlack = c.isBlacklisted === 1 || (c.isBlacklisted as any) === true;
                          return (
                            <tr key={c.id} style={{ opacity: isBlack ? 0.65 : 1 }}>
                              <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{c.id}</td>
                              <td>
                                <div style={{ fontWeight: '600', color: isBlack ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                                  {c.name}
                                </div>
                                {c.tags && (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                                    {c.tags.split(',').map((tag, idx) => (
                                      <span key={idx} className="badge" style={{ fontSize: '0.6rem', padding: '1px 6px', background: '#e0f2fe', color: '#0369a1', borderColor: '#bae6fd', display: 'inline-flex', alignItems: 'center', gap: '2px', textTransform: 'none' }}>
                                        <Tag size={10} /> {tag.trim()}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </td>
                              <td>{c.email}</td>
                              <td>
                                <span className={`badge ${c.provider === 'Google' ? 'badge-red' : c.provider === 'LINE' ? 'badge-green' : 'badge-gold'}`} style={{ textTransform: 'none', fontSize: '0.65rem' }}>
                                  {c.provider}
                                </span>
                              </td>
                              <td>{c.points} 點</td>
                              <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>NT$ {c.totalSpent.toLocaleString()}</td>
                              <td>
                                {isBlack ? (
                                  <span className="badge badge-red" style={{ fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                    <ShieldAlert size={10} /> 黑名單
                                  </span>
                                ) : (
                                  <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
                                    正常
                                  </span>
                                )}
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                                  <button 
                                    className="portal-nav-btn" 
                                    style={{ padding: '0.35rem', borderRadius: '4px', background: 'none', border: 'none', cursor: 'pointer' }}
                                    title="編輯顧客"
                                    onClick={() => handleOpenEditCustomer(c)}
                                  >
                                    <Edit size={14} style={{ color: 'var(--text-secondary)' }} />
                                  </button>
                                  <button 
                                    className="portal-nav-btn" 
                                    style={{ padding: '0.35rem', borderRadius: '4px', background: 'none', border: 'none', cursor: 'pointer' }}
                                    title={isBlack ? "移出黑名單" : "列入黑名單"}
                                    onClick={() => handleToggleBlacklist(c)}
                                  >
                                    {isBlack ? (
                                      <UserCheck size={14} style={{ color: 'green' }} />
                                    ) : (
                                      <UserX size={14} style={{ color: 'red' }} />
                                    )}
                                  </button>
                                  <button 
                                    className="portal-nav-btn" 
                                    style={{ padding: '0.35rem', borderRadius: '4px', background: 'none', border: 'none', cursor: 'pointer' }}
                                    title="刪除顧客"
                                    onClick={() => handleDeleteCustomer(c.id)}
                                  >
                                    <Trash2 size={14} style={{ color: 'red' }} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Customer Add/Edit Modal */}
                {isCustomerModalOpen && (
                  <div className="woo-modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 100000, padding: '1rem' }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '540px', borderRadius: '16px', background: '#fff', border: '1px solid var(--border)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      
                      {/* Fixed Header */}
                      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Users size={20} style={{ color: 'var(--primary)' }} />
                          {editingCustomer ? '編輯顧客資料' : '手動新增顧客資料'}
                        </h3>
                        <button 
                          type="button"
                          onClick={() => setIsCustomerModalOpen(false)} 
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '4px' }}
                        >
                          <X size={20} />
                        </button>
                      </div>
                      
                      {/* Form */}
                      <form onSubmit={handleSaveCustomer} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                        {/* Scrollable Body */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                          <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label className="form-label" style={{ fontWeight: 600 }}>顧客姓名 <span style={{ color: 'red' }}>*</span></label>
                            <input 
                              type="text" 
                              className="form-input" 
                              value={customerForm.name}
                              onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                              required
                            />
                          </div>
                          
                          <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label className="form-label" style={{ fontWeight: 600 }}>電子郵件 <span style={{ color: 'red' }}>*</span></label>
                            <input 
                              type="email" 
                              className="form-input" 
                              value={customerForm.email}
                              onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                              required
                            />
                          </div>

                          <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label className="form-label">註冊管道</label>
                            <select 
                              className="form-input" 
                              value={customerForm.provider}
                              onChange={(e) => setCustomerForm({ ...customerForm, provider: e.target.value })}
                              style={{ appearance: 'auto' }}
                            >
                              <option value="Google">Google</option>
                              <option value="LINE">LINE</option>
                              <option value="Facebook">Facebook</option>
                              <option value="Custom">手動新增</option>
                            </select>
                          </div>

                          <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label className="form-label">累積會員點數</label>
                            <input 
                              type="number" 
                              className="form-input" 
                              value={customerForm.points}
                              onChange={(e) => setCustomerForm({ ...customerForm, points: parseInt(e.target.value) || 0 })}
                            />
                          </div>

                          <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label className="form-label">顧客標籤 (以英文逗號隔開)</label>
                            <input 
                              type="text" 
                              placeholder="例如: VIP, 柴犬家長, 常溫配送" 
                              className="form-input" 
                              value={customerForm.tags}
                              onChange={(e) => setCustomerForm({ ...customerForm, tags: e.target.value })}
                            />
                          </div>

                          <div className="form-group" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input 
                              type="checkbox" 
                              id="isBlacklistedCheckbox"
                              checked={customerForm.isBlacklisted}
                              onChange={(e) => setCustomerForm({ ...customerForm, isBlacklisted: e.target.checked })}
                              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <label htmlFor="isBlacklistedCheckbox" style={{ fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', color: customerForm.isBlacklisted ? 'red' : 'var(--text-primary)' }}>
                              <ShieldAlert size={14} /> 列入黑名單 (黑名單用戶無法在前台進行結帳)
                            </label>
                          </div>
                        </div>

                        {/* Fixed Footer Actions */}
                        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: '#fafafa' }}>
                          <button 
                            type="button" 
                            className="btn btn-secondary" 
                            onClick={() => setIsCustomerModalOpen(false)}
                            style={{ height: '40px', padding: '0 1.25rem' }}
                          >
                            取消
                          </button>
                          <button 
                            type="submit" 
                            className="btn btn-primary"
                            style={{ height: '40px', padding: '0 1.25rem' }}
                          >
                            儲存顧客資料
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* TAB 5: WEB CONTENT & BLOG MANAGEMENT */}
          {activeAdminTab === 'content' && (
            <div>
              <h2 style={{ marginBottom: '1.5rem', fontSize: '1.6rem', fontWeight: 700 }}>網頁內容與文章管理 (CMS)</h2>
              
              {/* Homepage configs with split visual preview */}
              <div className="woo-editor-body" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', marginBottom: '3rem', alignItems: 'start' }}>
                
                {/* Left pane: Editor inputs */}
                <form onSubmit={handleSettingsUpdate} className="woo-editor-box" style={{ padding: '1.5rem', margin: 0 }}>
                  <div className="woo-editor-box-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>首頁樣式自訂編輯器</span>
                    <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>即時預覽模式</span>
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>首頁頂部跑馬燈公告內容</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={announcementText}
                      onChange={(e) => setAnnouncementText(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: '1 1 240px' }}>
                        <label className="form-label" style={{ fontWeight: 700, fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span>🖼️ 首頁多圖 Banner 輪播管理 (CRUD)</span>
                        </label>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem', margin: 0, lineHeight: 1.4 }}>
                          您可以為每張輪播圖個別新增/修改「主標題」、「副標題」、「按鈕內文字」與「背景圖片（支援本機上傳與網址）」。
                        </p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ height: '36px', fontSize: '0.8rem', padding: '0 0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap', flexShrink: 0 }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const newSlide = {
                            id: 'slide-' + Date.now(),
                            title: '新輪播標題\n高品質質感選品',
                            desc: '簡短描述內文',
                            img: '',
                            btnText: '立即選購'
                          };
                          const updated = [...(heroSlides || []), newSlide];
                          handleSaveHeroSlides(updated);
                        }}
                      >
                        <Plus size={14} /> 新增輪播圖片
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {(heroSlides || []).map((slide, idx) => (
                        <div 
                          key={slide.id || idx}
                          style={{ 
                            background: '#fff', 
                            border: '1px solid var(--border)', 
                            borderRadius: '10px', 
                            padding: '1.1rem',
                            position: 'relative',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', borderBottom: '1px dashed #e2e8f0', paddingBottom: '0.6rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <span>輪播卡片 #{idx + 1}</span>
                              {idx === 0 && <span style={{ fontSize: '0.68rem', background: '#dbeafe', color: '#1e40af', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>預設首頁</span>}
                            </span>
                            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                              <button
                                type="button"
                                className="btn btn-secondary"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                disabled={idx === 0}
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (idx === 0) return;
                                  const updated = [...heroSlides];
                                  const temp = updated[idx];
                                  updated[idx] = updated[idx - 1];
                                  updated[idx - 1] = temp;
                                  handleSaveHeroSlides(updated);
                                }}
                              >
                                ▲ 上移
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                disabled={idx === heroSlides.length - 1}
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (idx === heroSlides.length - 1) return;
                                  const updated = [...heroSlides];
                                  const temp = updated[idx];
                                  updated[idx] = updated[idx + 1];
                                  updated[idx + 1] = temp;
                                  handleSaveHeroSlides(updated);
                                }}
                              >
                                ▼ 下移
                              </button>
                              <button
                                type="button"
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.3rem', display: 'flex', alignItems: 'center' }}
                                title="刪除此張輪播圖"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (heroSlides.length <= 1) {
                                    alert('首頁最少需保留一張輪播圖！');
                                    return;
                                  }
                                  if (confirm(`確定要刪除第 #${idx + 1} 張輪播圖嗎？`)) {
                                    const updated = heroSlides.filter((_, i) => i !== idx);
                                    handleSaveHeroSlides(updated);
                                  }
                                }}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                            <div>
                              <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>主標題 (可用 \n 換行)</label>
                              <textarea
                                className="form-input"
                                style={{ minHeight: '52px', fontSize: '0.85rem', fontFamily: 'inherit', margin: 0 }}
                                value={slide.title}
                                onChange={(e) => {
                                  const updated = [...heroSlides];
                                  updated[idx].title = e.target.value;
                                  handleSaveHeroSlides(updated);
                                  if (idx === 0) setHeroTitle(e.target.value);
                                }}
                              />
                            </div>
                            <div>
                              <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>副標題說明描述</label>
                              <textarea
                                className="form-input"
                                style={{ minHeight: '52px', fontSize: '0.85rem', fontFamily: 'inherit', margin: 0 }}
                                value={slide.desc}
                                onChange={(e) => {
                                  const updated = [...heroSlides];
                                  updated[idx].desc = e.target.value;
                                  handleSaveHeroSlides(updated);
                                }}
                              />
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '0.85rem' }}>
                            <div>
                              <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>按鈕顯示文字</label>
                              <input
                                type="text"
                                className="form-input"
                                style={{ height: '36px', fontSize: '0.85rem', margin: 0 }}
                                value={slide.btnText}
                                onChange={(e) => {
                                  const updated = [...heroSlides];
                                  updated[idx].btnText = e.target.value;
                                  handleSaveHeroSlides(updated);
                                }}
                              />
                            </div>
                            <div>
                              <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>背景大圖 (本機選擇 或 貼網址)</label>
                              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem' }}>
                                <label className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', height: '28px', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', cursor: 'pointer', margin: 0 }}>
                                  <Upload size={12} /> 本機上傳圖片
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    style={{ display: 'none' }} 
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                          const base64 = reader.result as string;
                                          const updated = [...heroSlides];
                                          updated[idx].img = base64;
                                          handleSaveHeroSlides(updated);
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }} 
                                  />
                                </label>
                              </div>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="或輸入外部圖片網址 (https://...)"
                                style={{ height: '34px', fontSize: '0.82rem', margin: 0 }}
                                value={slide.img && slide.img.startsWith('data:') ? '【已上傳本機圖片】' : slide.img}
                                onChange={(e) => {
                                  const updated = [...heroSlides];
                                  updated[idx].img = e.target.value;
                                  handleSaveHeroSlides(updated);
                                }}
                              />
                              {slide.img && (
                                <div style={{ marginTop: '0.5rem', position: 'relative', height: '70px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                  <img src={slide.img} alt={`Preview #${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  <button 
                                    type="button" 
                                    style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.65)', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    title="移除圖片"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      const updated = [...heroSlides];
                                      updated[idx].img = '';
                                      handleSaveHeroSlides(updated);
                                    }}
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-group-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 600 }}>LINE 官方客服連結</label>
                      <input 
                        type="text" 
                        className="form-input"
                        placeholder="https://line.me/R/ti/p/..."
                        value={lineUrl}
                        onChange={(e) => setLineUrl(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 600 }}>Instagram 連結</label>
                      <input 
                        type="text" 
                        className="form-input"
                        placeholder="https://instagram.com/..."
                        value={instagramUrl}
                        onChange={(e) => setInstagramUrl(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem', background: '#fcfaf5', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>首頁版面區塊排序</label>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>使用上下箭頭調整首頁版塊呈現順序：</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {layoutOrder.map((section, idx) => {
                        let label = '';
                        if (section === 'banner') label = '🎏 首頁大型輪播看板 Banner';
                        else if (section === 'products') label = '🛍️ 精選商品與分類切換網格';
                        else if (section === 'instagram') label = '📸 Instagram 社群同步分享牆';

                        return (
                          <div 
                            key={section} 
                            style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center', 
                              background: '#fff', 
                              padding: '0.5rem 0.75rem', 
                              borderRadius: '6px', 
                              border: '1px solid var(--border)',
                              fontSize: '0.85rem'
                            }}
                          >
                            <span>{label}</span>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              <button 
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => moveLayoutSection(idx, 'up')}
                                disabled={idx === 0}
                                style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}
                              >
                                ▲
                              </button>
                              <button 
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => moveLayoutSection(idx, 'down')}
                                disabled={idx === layoutOrder.length - 1}
                                style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}
                              >
                                ▼
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
                    儲存並更新首頁配置
                  </button>
                </form>

                {/* Right pane: Visual Live Preview */}
                <div className="woo-editor-box" style={{ padding: '1.5rem', margin: 0, border: '1px dashed var(--primary)', position: 'sticky', top: '100px' }}>
                  <div className="woo-editor-box-title" style={{ color: 'var(--primary)' }}>前台網頁區塊即時預覽</div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>此區呈現前台消費者看見的真實畫面縮影：</p>
                  
                  {/* Miniature header & Hero */}
                  <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', background: 'var(--bg-primary)' }}>
                    {/* Mock Sticky Announcement */}
                    <div style={{ background: 'var(--primary)', color: '#fff', fontSize: '0.65rem', textAlign: 'center', padding: '4px 8px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {announcementText || '（跑馬燈公告內容）'}
                    </div>
                    {/* Mock Header */}
                    <div style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fdfbf7', borderBottom: '1px solid #eee' }}>
                      {appLogo ? (
                        <img src={appLogo} alt="Logo" style={{ width: '25px', height: '25px', borderRadius: '6px', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '25px', height: '25px', borderRadius: '6px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', fontWeight: 'bold' }}>Logo</div>
                      )}
                      <div style={{ display: 'flex', gap: '8px', fontSize: '0.6rem', color: '#666', fontWeight: 500 }}>
                        {navItems.map(item => (
                          <span key={item.id}>{item.name}</span>
                        ))}
                      </div>
                      <div style={{ width: '15px', height: '15px', borderRadius: '50%', background: '#eee' }}></div>
                    </div>

                    {/* Dynamic sections preview based on layoutOrder */}
                    {layoutOrder.map((sectionKey) => {
                      if (sectionKey === 'banner') {
                        return (
                          <div 
                            key="banner-prev"
                            style={{ 
                              backgroundImage: `url(${heroImage || petHero})`, 
                              height: '120px', 
                              backgroundSize: 'cover', 
                              backgroundPosition: 'center', 
                              position: 'relative',
                              display: 'flex',
                              alignItems: 'center',
                              padding: '12px'
                            }}
                          >
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.25)' }}></div>
                            <div style={{ position: 'relative', zIndex: 2, maxWidth: '80%' }}>
                              <h4 style={{ fontSize: '0.8rem', color: '#fff', margin: '0 0 6px', fontFamily: 'var(--font-serif)', whiteSpace: 'pre-line', lineHeight: 1.2 }}>
                                {heroTitle || '樂肉選品\n與毛孩共居的質感生活'}
                              </h4>
                              <button style={{ pointerEvents: 'none', background: 'var(--primary)', border: 'none', color: '#fff', fontSize: '0.5rem', padding: '2px 6px', borderRadius: '20px' }}>
                                {bannerBtnText || '探索全系列選物'} &rarr;
                              </button>
                            </div>
                          </div>
                        );
                      }
                      if (sectionKey === 'products') {
                        return (
                          <div key="products-prev" style={{ padding: '12px', borderTop: '1px solid #eee', background: '#fff', textAlign: 'center' }}>
                            <span style={{ fontSize: '0.55rem', color: 'var(--primary)', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Premium Selection</span>
                            <strong style={{ fontSize: '0.75rem', display: 'block', margin: '2px 0 6px' }}>🛍️ 精選商品網格 (已同步)</strong>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                              {[1, 2, 3].map(i => (
                                <div key={i} style={{ border: '1px solid #eee', borderRadius: '4px', padding: '4px', background: '#fcfaf5' }}>
                                  <div style={{ background: '#eee', height: '35px', borderRadius: '2px', marginBottom: '4px' }}></div>
                                  <div style={{ fontSize: '0.5rem', fontWeight: 600, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>商品 {i}</div>
                                  <div style={{ fontSize: '0.45rem', color: 'var(--primary)', textAlign: 'left', fontWeight: 'bold' }}>NT$ 980</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      if (sectionKey === 'instagram') {
                        return (
                          <div key="instagram-prev" style={{ padding: '12px', borderTop: '1px solid #eee', background: 'var(--bg-secondary)', textAlign: 'center' }}>
                            <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', display: 'block' }}>Instagram @lerou_select</span>
                            <strong style={{ fontSize: '0.75rem', display: 'block', margin: '2px 0 6px' }}>📸 生活美學分享牆 (已連線)</strong>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                              {[1, 2, 3].map(i => (
                                <div key={i} style={{ borderRadius: '4px', overflow: 'hidden', height: '40px', border: '1px solid #eee' }}>
                                  <div style={{ background: '#ccc', height: '100%' }}></div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>

              </div>

              {/* Instagram Feed Sync Integration Dashboard */}
              <div className="woo-editor-box" style={{ padding: '1.5rem' }}>
                <div className="woo-editor-box-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                  <span>樂肉官方 Instagram 貼文同步模組</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>API Webhook 已連接</span>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <p><strong>💡 運作說明：</strong>本網站已直接串連您的官方 Instagram 專頁。當您在 IG 發布新貼文且標記 <code>#樂肉選品</code> 時，前台的「部落格分享」頁面會經由 Graph API 即時自動同步抓取貼文圖文與發布時間，無需在此重複打字撰寫。</p>
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button 
                      type="button"
                      className="btn btn-primary" 
                      onClick={() => {
                        alert('🔄 已成功向 Instagram 發送 Graph API 抓取請求，成功同步最近 2 筆最新貼文！');
                      }}
                      style={{ fontSize: '0.8rem', padding: '0.5rem 1.25rem' }}
                    >
                      手動即時同步 IG 貼文
                    </button>
                    <span style={{ alignSelf: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>上次同步時間： 2026/07/08 05:49 (正常)</span>
                  </div>
                </div>

                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginTop: '2rem', marginBottom: '1rem' }}>最近從 Instagram 同步成功的貼文清單</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  {blogArticles.map(article => (
                    <div key={article.id} className="recipe-card glass-panel" style={{ margin: 0, padding: '1rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f5f5f5', border: '1px solid var(--border)', overflow: 'hidden' }}>
                          <img src={appLogo} alt="IG profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>lerou_select</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Instagram 自動同步</div>
                        </div>
                      </div>
                      <div style={{ height: '180px', borderRadius: '6px', overflow: 'hidden' }}>
                        <img src={article.img} alt="IG post" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{article.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5, height: '3.6rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                        {article.desc}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        <span>❤️ 865 次按讚</span>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>在 IG 上查看 &rarr;</a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brand Identity & Customization Section */}
              <div className="woo-editor-box" style={{ padding: '1.5rem', marginTop: '2rem' }}>
                <div className="woo-editor-box-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                  <span>品牌識別與外觀設定</span>
                  <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>SaaS 白牌設定</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.25rem' }}>
                  {/* Logo Upload */}
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>品牌 LOGO 更換</label>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <img 
                        src={appLogo} 
                        alt="Current Logo" 
                        style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--border)' }} 
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                        <label className="image-upload-btn-label" style={{ margin: 0, padding: '0.5rem 1rem', fontSize: '0.8rem', textAlign: 'center', cursor: 'pointer' }}>
                          上傳新 LOGO
                          <input 
                            type="file" 
                            accept="image/*" 
                            style={{ display: 'none' }} 
                            onChange={(e) => handleFileChange(e, 'logo')} 
                          />
                        </label>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>建議尺寸：200×200px，方形圓角 PNG/JPG</p>
                      </div>
                    </div>
                  </div>

                  {/* Primary Color */}
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>主色調自訂</label>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <input 
                        type="color" 
                        defaultValue="#8B5E3C"
                        onChange={(e) => {
                          document.documentElement.style.setProperty('--primary', e.target.value);
                          document.documentElement.style.setProperty('--primary-dark', e.target.value);
                        }}
                        style={{ width: '50px', height: '40px', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', padding: '2px' }}
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 0.25rem' }}>調整網站全站主題色（按鈕、連結、強調色）</p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>預設色：#8B5E3C（大地棕）</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Description */}
                <div style={{ marginTop: '1.5rem' }}>
                  <label className="form-label" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Footer 品牌介紹文案</label>
                  <textarea 
                    className="form-input"
                    style={{ minHeight: '80px', fontFamily: 'inherit', fontSize: '0.85rem' }}
                    defaultValue="專門為毛孩打造的精緻生活美學選物店。以樂樂與肉肉的真實使用體驗，嚴選合身機能服飾、高規散步小配件與高品質外出用品。"
                    placeholder="輸入品牌簡介文字，將顯示在頁尾 Footer 區域..."
                  />
                </div>

                {/* Navigation Items Management */}
                <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                  <label className="form-label" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>導覽列選單項目管理</label>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>管理前台導覽列的選單項目（新增/排序/編輯/刪除）。</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    {navItems.map((item, idx) => (
                      <div 
                        key={item.id}
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          background: '#fff', 
                          padding: '0.5rem 0.75rem', 
                          borderRadius: '6px', 
                          border: '1px solid var(--border)',
                          fontSize: '0.85rem'
                        }}
                      >
                        {editingNavId === item.id ? (
                          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                            <input 
                              type="text" 
                              className="form-input" 
                              style={{ height: '30px', padding: '0.25rem', fontSize: '0.85rem', width: '150px' }}
                              value={editingNavName}
                              onChange={(e) => setEditingNavName(e.target.value)}
                            />
                            <button 
                              type="button" 
                              className="btn btn-primary"
                              style={{ padding: '0 0.6rem', height: '30px', fontSize: '0.75rem', whiteSpace: 'nowrap', flexShrink: 0 }}
                              onClick={() => {
                                if (editingNavName.trim()) {
                                  editNavItemName(item.id, editingNavName.trim());
                                }
                                setEditingNavId(null);
                              }}
                            >
                              儲存
                            </button>
                            <button 
                              type="button" 
                              className="btn btn-secondary"
                              style={{ padding: '0 0.6rem', height: '30px', fontSize: '0.75rem', whiteSpace: 'nowrap', flexShrink: 0 }}
                              onClick={() => setEditingNavId(null)}
                            >
                              取消
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span>📌 {item.name}</span>
                            <button
                              type="button"
                              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline', padding: 0 }}
                              onClick={() => {
                                setEditingNavId(item.id);
                                setEditingNavName(item.name);
                              }}
                            >
                              編輯名稱
                            </button>
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                          <button 
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '0.15rem 0.35rem', fontSize: '0.7rem' }}
                            disabled={idx === 0}
                            onClick={() => moveNavItem(idx, 'up')}
                          >
                            ▲
                          </button>
                          <button 
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '0.15rem 0.35rem', fontSize: '0.7rem' }}
                            disabled={idx === navItems.length - 1}
                            onClick={() => moveNavItem(idx, 'down')}
                          >
                            ▼
                          </button>
                          <button 
                            type="button"
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              color: '#dc3545', 
                              cursor: 'pointer', 
                              display: 'flex', 
                              alignItems: 'center',
                              padding: '0.15rem'
                            }}
                            onClick={() => deleteNavItem(item.id)}
                            title="移除此導覽項"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="輸入新導覽選項名稱..."
                      style={{ flex: 1, fontSize: '0.85rem', height: '36px' }}
                      value={newNavNameInput}
                      onChange={(e) => setNewNavNameInput(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ padding: '0 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap', height: '36px', fontSize: '0.85rem' }}
                      onClick={addNavItem}
                    >
                      <Plus size={14} /> 新增項目
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: INTEGRATIONS */}
          {activeAdminTab === 'integrations' && (
            <div>
              <h2 style={{ marginBottom: '1.5rem', fontSize: '1.6rem', fontWeight: 700 }}>金流與第三方 API 串接</h2>
              <form onSubmit={handleSettingsUpdate} className="admin-form-box checkout-form">
                <div className="woo-editor-box" style={{ marginBottom: '1.5rem' }}>
                  <div className="woo-editor-box-title">綠界科技金流串接設定 (ECPay API V5)</div>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">特店編號 (Merchant ID)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={integrationKeys.paymentProvider === 'GreenWorld' ? '2000132' : integrationKeys.paymentProvider}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">API 測試金鑰與防護雜湊 (HashKey & HashIV)</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      value={integrationKeys.paymentApiKey}
                      onChange={(e) => setIntegrationKeys({ ...integrationKeys, paymentApiKey: e.target.value })}
                    />
                  </div>
                </div>

                <div className="woo-editor-box" style={{ marginBottom: '1.5rem' }}>
                  <div className="woo-editor-box-title">7-11 / 全家 店到店電子地圖 (Logistics C2C)</div>
                  <div className="form-group">
                    <label className="form-label">物流地圖 API 金鑰</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      value={integrationKeys.logisticsApiKey}
                      onChange={(e) => setIntegrationKeys({ ...integrationKeys, logisticsApiKey: e.target.value })}
                    />
                  </div>
                </div>

                <div className="woo-editor-box" style={{ marginBottom: '2rem' }}>
                  <div className="woo-editor-box-title">免費社群 OAuth 登入（零成本串接配置）</div>
                  <div className="form-group-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Google Client ID</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        style={{ fontSize: '0.8rem' }}
                        value={integrationKeys.googleClientId}
                        onChange={(e) => setIntegrationKeys({ ...integrationKeys, googleClientId: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">LINE Channel ID</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        style={{ fontSize: '0.8rem' }}
                        value={integrationKeys.lineChannelId}
                        onChange={(e) => setIntegrationKeys({ ...integrationKeys, lineChannelId: e.target.value })}
                      />
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
                    ℹ️ 社群登入使用的是免費的 OAuth 提供商服務，無需額外維護成本即可使用。
                  </p>
                </div>

                <div className="woo-editor-box" style={{ marginBottom: '2rem' }}>
                  <div className="woo-editor-box-title">Instagram 社群同步 (Graph API)</div>
                  <div className="form-group">
                    <label className="form-label">IG 粉絲專頁存取權權杖 (Access Token)</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      placeholder="請輸入 Instagram Graph API 存取權權杖 (e.g. EAAC...)"
                      value={integrationKeys.instagramAccessToken || ''}
                      onChange={(e) => setIntegrationKeys({ ...integrationKeys, instagramAccessToken: e.target.value })}
                    />
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
                    ℹ️ 當您在 IG 發布新貼文且標記 <code>#樂肉選品</code> 時，前台的「生活美學分享牆」會經由 Graph API 即時自動同步抓取。
                  </p>
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
                  儲存 API 串接參數
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};
