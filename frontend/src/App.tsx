import { useState, useEffect } from 'react';
import { 
  ShoppingBag, Heart, Plus, Minus, X, ArrowRight, 
  User, CreditCard, Check, ArrowLeftRight, MessageCircle
} from 'lucide-react';
import './App.css';

// Importing official brand logo image
import logoImg from './assets/logo.jpg';

const petHero = logoImg;
const dogBed = logoImg;
const petFood = logoImg;

const appLogo = '/assets/logo.jpg';

// Importing custom components
import { AnnouncementBar } from './components/AnnouncementBar';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { BlogPage } from './components/BlogPage';
import { BrandsPage } from './components/BrandsPage';
import { PackingSlipModal } from './components/PackingSlipModal';
import { AdminPanel } from './components/AdminPanel';
import { MemberCenter } from './components/MemberCenter';

export interface Product {
  id: string;
  title: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  description: string;
  origin: string;
  weight: string;
  storage: string;
  comfortRating?: number;
  cookingTip: string;
  badges: string[];
  brand?: string;
  isNew?: boolean;
  dimensions?: string;
  stock?: number;
  isPreOrder?: boolean;
  cost?: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  items: { title: string; qty: number; price: number }[];
  total: number;
  status: string;
  shippingName?: string;
  shippingPhone?: string;
  shippingAddress?: string;
  shippingEmail?: string;
  paymentType?: string;
  logisticsType?: string;
  logisticsSubType?: string;
  cvsStoreID?: string;
  cvsStoreName?: string;
  ecpayLogisticsId?: string;
  ecpayLogisticsStatus?: string;
  couponCode?: string;
  discountAmount?: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  provider: string;
  signupDate: string;
  ordersCount: number;
  totalSpent: number;
  points: number;
  tags?: string;
  isBlacklisted?: number;
}

const DEFAULT_RECIPES = [
  {
    id: 'recipe-1',
    tag: '營養專欄',
    title: '高純度深海魚油選購三大黃金原則 🐟✨',
    desc: '外食族與上班族的日常保健首選！教您如何認明 rTG 高吸收型態、IFOS 五星認證與專利無重金屬純化技術。 #慧聚健康 #深海魚油 #生醫保健 #健康新生活',
    img: petHero
  },
  {
    id: 'recipe-2',
    tag: '晶亮護理',
    title: '游離型葉黃素黃金比例 10:2 全解析 👁️🌿',
    desc: '長時間使用電腦與手機？專利 FloraGLO 游離型葉黃素搭配山桑子與黑大豆皮萃取物，全方位守護您的晶亮舒適感。 #慧聚健康 #游離型葉黃素 #晶亮舒適 #靈活護理',
    img: dogBed
  }
];

function App() {
  const BACKEND_URL = import.meta.env.DEV ? '' : window.location.origin;

  // ROUTER STATE
  const [currentPage, setCurrentPage] = useState<'home' | 'shop' | 'product-detail' | 'blog' | 'blog-post' | 'brands' | 'portal' | 'member-center' | 'admin'>('home');
  const [category, setCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');

  // DATABASE DATA STATES
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // CUSTOM WEB CONFIGS (LOADED FROM system_config DB)
  const [announcementText, setAnnouncementText] = useState('🌿 全館滿 NT$2000 即享免運！新會員註冊即贈 $100 健康體驗金！ 🌿');
  const [heroTitle, setHeroTitle] = useState('草本生醫與極致品質兼顧\n守護您與全家人的健康生活');
  const [heroDesc, setHeroDesc] = useState('以科學數據與國際專利為研發核心。我們嚴選高純度深海魚油、游離型葉黃素與百億專利益生菌。用極緻品質照顧您的全家健康。');
  const [heroImage, setHeroImage] = useState('');
  const [heroSlides, setHeroSlides] = useState<Array<{ id: string; title: string; desc: string; img: string; btnText: string }>>([
    {
      id: 'slide-1',
      title: '草本生醫與極致品質兼顧\n守護您與全家人的健康生活',
      desc: '以科學數據與國際專利為研發核心。我們嚴選高純度深海魚油、游離型葉黃素與百億專利益生菌。',
      img: '',
      btnText: '探索全系列健康選品'
    },
    {
      id: 'slide-2',
      title: 'rTG 高純度 85% 深海魚油\n思緒敏捷與心血管護理',
      desc: '挪威乾淨海域提取，專利軟膠囊無腥味，高吸收率保健首選。',
      img: '',
      btnText: '查看深海魚油'
    },
    {
      id: 'slide-3',
      title: '專利百億複合益生菌\n維持腸道消化道順暢機能',
      desc: '包埋專利技術，15 支高活性專利益生菌與水溶性膳食纖維。',
      img: '',
      btnText: '選購順暢益生菌'
    }
  ]);
  const [blogArticles, setBlogArticles] = useState<any[]>(DEFAULT_RECIPES);
  const [customCategories, setCustomCategories] = useState<Array<{ id: string; name: string }>>([
    { id: 'apparel', name: '核心保健' },
    { id: 'accessories', name: '個人護理' },
    { id: 'outing', name: '順暢消化' },
    { id: 'toys', name: '紓壓玩具' }
  ]);
  const [customBrands, setCustomBrands] = useState<Array<{ id: string; name: string }>>([
    { id: 'brand-huiju-health', name: '慧聚健康 (Huiju Health)' },
    { id: 'brand-huiju-labs', name: '慧聚研發 (Huiju Labs)' },
    { id: 'brand-herbacare', name: 'HerbaCare 專利草本' }
  ]);
  const [navItems, setNavItems] = useState<Array<{ id: string; name: string; category?: string; page?: string }>>([
    { id: 'nav-new', name: '熱銷推薦', category: 'new', page: 'shop' },
    { id: 'nav-apparel', name: '核心保健', category: 'apparel', page: 'shop' },
    { id: 'nav-accessories', name: '個人護理', category: 'accessories', page: 'shop' },
    { id: 'nav-outing', name: '順暢消化', category: 'outing', page: 'shop' },
    { id: 'nav-brands', name: '品牌專區', page: 'brands' },
    { id: 'nav-blog', name: '健康專欄', page: 'blog' }
  ]);
  const [bannerBtnText, setBannerBtnText] = useState('探索慧聚健康全系列');
  const [layoutOrder, setLayoutOrder] = useState<string[]>(['banner', 'products', 'instagram']);
  const [instagramUrl, setInstagramUrl] = useState('https://instagram.com');
  const [lineUrl, setLineUrl] = useState('https://line.me');

  // SHOPPING & INTERACTIVE STATES
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const [footerDoc, setFooterDoc] = useState<'shopping' | 'privacy' | 'returns' | null>(null);

  // AUTHENTICATION STATES
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; provider: string } | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Forgot & Reset Password States
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [forgotDebugLink, setForgotDebugLink] = useState('');

  const [resetPasswordToken, setResetPasswordToken] = useState('');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetPasswordInput, setResetPasswordInput] = useState('');
  const [resetPasswordConfirm, setResetPasswordConfirm] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regOtp, setRegOtp] = useState('');

  // CHECKOUT STATES
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<number>(1);
  const [shippingInfo, setShippingInfo] = useState({ name: '', phone: '', address: '', email: '' });
  const [paymentInfo, setPaymentInfo] = useState({ cardNum: '', expiry: '', cvv: '' });
  const [shippingMethod, setShippingMethod] = useState<'HOME' | 'UNIMART' | 'FAMI'>('HOME');
  const [selectedCvsStore, setSelectedCvsStore] = useState<{
    storeId: string;
    storeName: string;
    storeAddress: string;
    storeType: string;
  } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CreditCard' | 'GreenWorld'>('CreditCard');

  // Coupon States
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; type: 'amount' | 'percent' | 'free_shipping'; value: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  // SCROLLED HEADER EFFECT
  const [scrolled, setScrolled] = useState(false);

  // Integration Config states
  const [integrationKeys, setIntegrationKeys] = useState({
    paymentProvider: 'GreenWorld',
    paymentApiKey: 'gw_hashkey_2026_test_xxyyzz',
    logisticsProvider: '711_C2C',
    logisticsApiKey: 'log_711_c2c_storekey_89021',
    googleClientId: 'google-oauth-client-id-2890.apps.googleusercontent.com',
    lineChannelId: 'line-channel-id-189201',
    instagramAccessToken: 'ig_mock_token_123456'
  });

  // Fetch products from backend
  const fetchProducts = () => {
    fetch(`${BACKEND_URL}/api/products?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
        }
      })
      .catch(err => console.error("Failed to load products", err));
  };

  // Fetch Homepage and integration settings
  const fetchSettings = () => {
    fetch(`${BACKEND_URL}/api/auth/settings?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          if (data.announcementText) setAnnouncementText(data.announcementText);
          if (data.heroTitle) setHeroTitle(data.heroTitle);
          if (data.heroDesc) setHeroDesc(data.heroDesc);
          if (data.heroImage) setHeroImage(data.heroImage);
          if (data.heroSlides) {
            try {
              setHeroSlides(JSON.parse(data.heroSlides));
            } catch (e) {
              console.error("Failed to parse heroSlides", e);
            }
          }
          if (data.blogArticles) {
            try {
              setBlogArticles(JSON.parse(data.blogArticles));
            } catch (e) {
              console.error("Failed to parse articles", e);
            }
          }
          if (data.customCategories) {
            try {
              setCustomCategories(JSON.parse(data.customCategories));
            } catch (e) {
              console.error("Failed to parse categories", e);
            }
          }
          if (data.customBrands) {
            try {
              setCustomBrands(JSON.parse(data.customBrands));
            } catch (e) {
              console.error("Failed to parse brands", e);
            }
          }
          if (data.navItems) {
            try {
              setNavItems(JSON.parse(data.navItems));
            } catch (e) {
              console.error("Failed to parse navItems", e);
            }
          }
          if (data.bannerBtnText) setBannerBtnText(data.bannerBtnText);
          if (data.layoutOrder) {
            try {
              setLayoutOrder(JSON.parse(data.layoutOrder));
            } catch (e) {
              console.error("Failed to parse layout order", e);
            }
          }
          if (data.instagramUrl) setInstagramUrl(data.instagramUrl);
          if (data.lineUrl) setLineUrl(data.lineUrl);

          setIntegrationKeys(prev => ({
            ...prev,
            paymentProvider: data.paymentProvider || prev.paymentProvider,
            paymentApiKey: data.paymentApiKey || prev.paymentApiKey,
            logisticsProvider: data.logisticsProvider || prev.logisticsProvider,
            logisticsApiKey: data.logisticsApiKey || prev.logisticsApiKey,
            googleClientId: data.googleClientId || prev.googleClientId,
            lineChannelId: data.lineChannelId || prev.lineChannelId,
            instagramAccessToken: data.instagramAccessToken || prev.instagramAccessToken
          }));
        }
      })
      .catch(err => console.error("Failed to fetch settings", err));
  };

  useEffect(() => {
    fetchProducts();
    fetchSettings();

    // Check if redirected from ECPay Map Callback or Reset Password Link
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get('checkout');
    const storeId = params.get('storeId');
    const storeName = params.get('storeName');
    const storeAddress = params.get('storeAddress');
    const storeType = params.get('storeType');
    const resetToken = params.get('resetToken');

    if (resetToken) {
      setResetPasswordToken(resetToken);
      setIsResetModalOpen(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (checkout && storeId && storeName) {
      const decodedName = decodeURIComponent(storeName);
      const decodedAddress = decodeURIComponent(storeAddress || '');
      setSelectedCvsStore({
        storeId,
        storeName: decodedName,
        storeAddress: decodedAddress,
        storeType: storeType || 'UNIMART'
      });
      setShippingMethod(storeType as any || 'UNIMART');
      
      // Update shipping address state
      setShippingInfo(prev => ({
        ...prev,
        address: `[${storeType === 'UNIMART' ? '7-11' : '全家'}] 門市: ${decodedName} (${storeId}) - 地址: ${decodedAddress}`
      }));
      
      // Open checkout modal automatically
      setIsCheckoutOpen(true);
      setCheckoutStep(1);
      
      // Clean query parameters from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Admin Auto-login
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      fetch(`${BACKEND_URL}/api/auth/verify`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      })
      .then(res => {
        if (!res.ok) throw new Error("Invalid token");
        return res.json();
      })
      .then(_data => {
        setIsLoggedIn(true);
        setCurrentUser({ name: '管理員', email: 'admin@lerou.com', provider: 'Email' });
        setIsAdminMode(true);
        setCurrentPage('admin');
      })
      .catch(() => {
        localStorage.removeItem('adminToken');
      });
    }
  }, []);

  const fetchOrders = () => {
    if (!isAdminMode) return;
    const token = localStorage.getItem('adminToken');
    const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

    fetch(`${BACKEND_URL}/api/orders?t=${Date.now()}`, { headers })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch(err => console.error("Failed to fetch orders", err));
  };

  const fetchCustomers = () => {
    const token = localStorage.getItem('adminToken');
    const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
    // Fetch Customers
    fetch(`${BACKEND_URL}/api/customers?t=${Date.now()}`, { headers })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCustomers(data);
      })
      .catch(err => console.error("Failed to fetch customers", err));
  };

  // Fetch admin-protected data when admin mode is activated
  useEffect(() => {
    if (!isAdminMode) return;
    fetchOrders();
    fetchCustomers();
  }, [isAdminMode]);

  // Scroll to top on page navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [currentPage, selectedProduct, selectedPost, isAdminMode]);

  // Handle page scrolling header effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update order status on backend
  const updateOrderStatus = async (orderId: string, status: string) => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
      } else {
        alert('修改訂單狀態失敗');
      }
    } catch (e) {
      console.error(e);
      alert('無法連接到伺服器');
    }
  };

  // Delete product on backend
  const deleteProduct = async (id: string) => {
    if (confirm('確定要下架此商品嗎？')) {
      const token = localStorage.getItem('adminToken');
      try {
        const res = await fetch(`${BACKEND_URL}/api/products/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setProducts(products.filter(p => p.id !== id));
        } else {
          alert('商品刪除失敗');
        }
      } catch (error) {
        console.error(error);
        alert('連線失敗');
      }
    }
  };

  // Add or edit product on backend
  const saveProduct = async (payload: any, isEdit: boolean) => {
    const token = localStorage.getItem('adminToken');
    const headers = { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    try {
      const url = isEdit ? `${BACKEND_URL}/api/products/${payload.id}` : `${BACKEND_URL}/api/products`;
      const method = isEdit ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const savedProd = await res.json();
        if (isEdit) {
          setProducts(products.map(p => p.id === savedProd.id ? savedProd : p));
          alert('商品修改成功！');
        } else {
          setProducts([...products, savedProd]);
          alert('全新商品上架成功！');
        }
      } else {
        const err = await res.json();
        alert(err.error || '儲存商品失敗');
      }
    } catch (e) {
      console.error(e);
      alert('連線失敗');
    }
  };

  // Save Settings Config on backend
  const saveSettings = async (settings: any): Promise<boolean> => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/settings`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        return true;
      } else {
        alert('儲存系統內容設定失敗');
        return false;
      }
    } catch (e) {
      console.error(e);
      alert('連線失敗: ' + (e instanceof Error ? e.message : String(e)));
      return false;
    }
  };

  // Wishlist actions
  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter(item => item !== id));
    } else {
      setWishlist([...wishlist, id]);
    }
  };

  // Cart actions
  const addToCart = (product: Product, quantity = 1, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity }]);
    }
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const cartTotalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  const shippingFee = cartSubtotal >= 2000 || cartSubtotal === 0 ? 0 : 100;

  // Email OTP States
  const [otpCountdown, setOtpCountdown] = useState<number>(0);

  // Send Email verification OTP code
  const handleSendOtp = async (email: string) => {
    if (!email) {
      alert('請先輸入電子郵件信箱');
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || '驗證碼已發送');
        if (data.debugCode) {
          console.log(`[TEST ONLY] OTP code is: ${data.debugCode}`);
          alert(`【測試環境】您的電子郵件二次驗證碼為：${data.debugCode}`);
        }
        setOtpCountdown(60);
      } else {
        alert(data.error || '發送失敗');
      }
    } catch (error) {
      console.error(error);
      alert('無法連線至發送服務');
    }
  };

  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  // Social Login handler
  const handleSocialLogin = (provider: 'Google' | 'LINE' | 'Facebook') => {
    setIsLoggedIn(true);
    const mockUser = {
      name: provider === 'Google' ? '會員王先生' : provider === 'LINE' ? '慧聚健康忠實會員' : '會員張小姐',
      email: `${provider.toLowerCase()}User@huiju-health.com`,
      provider
    };
    setCurrentUser(mockUser);
    setIsLoginModalOpen(false);
  };

  // Email login (Handles admin login too)
  const handleEmailLogin = async (emailInput: string, passwordInput: string) => {
    if (!emailInput) {
      alert('請輸入電子郵件信箱');
      return;
    }
    if (emailInput === 'admin@lerou.com' || emailInput === 'admin') {
      try {
        const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'admin', password: passwordInput })
        });
        const data = await res.json();
        if (res.ok && data.token) {
          localStorage.setItem('adminToken', data.token);
          setIsLoggedIn(true);
          setCurrentUser({ name: '管理員', email: 'admin@lerou.com', provider: 'Email' });
          setIsAdminMode(true);
          setCurrentPage('admin');
          setIsLoginModalOpen(false);
        } else {
          alert(data.error || '管理員登入失敗');
        }
      } catch (error) {
        console.error(error);
        alert('伺服器連線錯誤');
      }
    } else {
      // Customer Login
      try {
        const res = await fetch(`${BACKEND_URL}/api/auth/customer-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailInput, password: passwordInput })
        });
        const data = await res.json();
        if (res.ok && data.token) {
          localStorage.setItem('customerToken', data.token);
          setIsLoggedIn(true);
          setCurrentUser({ 
            name: data.customer.name, 
            email: data.customer.email, 
            provider: 'Email' 
          });
          setShippingInfo(prev => ({
            ...prev,
            name: data.customer.name,
            phone: data.customer.phone || prev.phone,
            email: data.customer.email,
            address: data.customer.address || prev.address
          }));
          setIsLoginModalOpen(false);
          alert(`歡迎回來，${data.customer.name}！`);
        } else {
          alert(data.error || '登入失敗，請確認信箱與密碼');
        }
      } catch (error) {
        console.error(error);
        alert('伺服器連線失敗');
      }
    }
  };

  // Email registration
  const handleEmailRegister = async (regForm: { name: string; phone: string; email: string; address: string; password?: string; otp?: string }) => {
    if (!regForm.email || !regForm.name || !regForm.phone || !regForm.password || !regForm.otp) {
      alert('請填寫完整註冊資訊與電子郵件驗證碼！');
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/customer-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm)
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('customerToken', data.token);
        setIsLoggedIn(true);
        setCurrentUser({ 
          name: data.customer.name, 
          email: data.customer.email, 
          provider: 'Email' 
        });
        setShippingInfo({
          name: data.customer.name,
          phone: data.customer.phone || '',
          email: data.customer.email,
          address: data.customer.address || ''
        });
        alert('🎉 註冊成功！已為您自動登入並設定預設收件資訊。');
        setIsLoginModalOpen(false);
      } else {
        alert(data.error || '註冊失敗');
      }
    } catch (error) {
      console.error(error);
      alert('伺服器連線失敗');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('customerToken');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setIsAdminMode(false);
    setCurrentPage('home');
  };

  // Forgot Password Request
  const handleForgotPassword = async (emailInput: string) => {
    if (!emailInput) {
      setForgotMessage({ text: '請輸入註冊的電子郵件信箱', type: 'error' });
      return;
    }
    setForgotLoading(true);
    setForgotMessage(null);
    setForgotDebugLink('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput })
      });
      const data = await res.json();
      if (res.ok) {
        setForgotMessage({ text: data.message, type: 'success' });
        if (data.debugLink) {
          setForgotDebugLink(data.debugLink);
        }
      } else {
        setForgotMessage({ text: data.error || '發送郵件失敗', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setForgotMessage({ text: '伺服器連線失敗，請重試', type: 'error' });
    } finally {
      setForgotLoading(false);
    }
  };

  // Reset Password Action
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordInput || resetPasswordInput !== resetPasswordConfirm) {
      setResetMessage({ text: '新密碼與確認新密碼不一致', type: 'error' });
      return;
    }
    setResetLoading(true);
    setResetMessage(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetPasswordToken, password: resetPasswordInput })
      });
      const data = await res.json();
      if (res.ok) {
        setResetMessage({ text: data.message || '密碼已變更！請使用新密碼登入。', type: 'success' });
        setTimeout(() => {
          setIsResetModalOpen(false);
          setResetPasswordInput('');
          setResetPasswordConfirm('');
          setResetMessage(null);
          // Auto open login modal for user convenience
          setIsLoginModalOpen(true);
          setAuthMode('login');
        }, 2000);
      } else {
        setResetMessage({ text: data.error || '密碼重設失敗', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setResetMessage({ text: '伺服器連線失敗，請重試', type: 'error' });
    } finally {
      setResetLoading(false);
    }
  };

  // Electronic Map selector handler
  const handleSelectCvsStore = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/payments/ecpay-map`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          logisticsSubType: shippingMethod, 
          isCollection: 'N' 
        })
      });
      const data = await res.json();
      if (res.ok && data.action && data.params) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.action;
        
        for (const [key, value] of Object.entries(data.params)) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value as string;
          form.appendChild(input);
        }
        
        document.body.appendChild(form);
        form.submit();
      } else {
        alert(data.error || '無法開啟超商電子地圖');
      }
    } catch (err) {
      console.error(err);
      alert('連線電子地圖服務失敗');
    }
  };

  // Checkout submit handler
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkoutStep === 1) {
      if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address || !shippingInfo.email) {
        alert('請填寫所有配送資訊');
        return;
      }
      if (shippingMethod !== 'HOME' && !selectedCvsStore) {
        alert('請先選擇收件的超商門市');
        return;
      }
      setCheckoutStep(2);
    } else if (checkoutStep === 2) {
      if (paymentMethod === 'CreditCard' && (!paymentInfo.cardNum || !paymentInfo.expiry || !paymentInfo.cvv)) {
        alert('請填寫完整信用卡付款資訊');
        return;
      }

      // Calculate final total with coupon discount
      let discountAmount = 0;
      let finalShippingFee = shippingFee;
      if (appliedCoupon) {
        if (appliedCoupon.type === 'amount') {
          discountAmount = appliedCoupon.value;
        } else if (appliedCoupon.type === 'percent') {
          discountAmount = Math.round(cartSubtotal * (1 - appliedCoupon.value));
        } else if (appliedCoupon.type === 'free_shipping') {
          finalShippingFee = 0;
        }
      }
      const finalTotal = Math.max(0, cartSubtotal + finalShippingFee - discountAmount);

      // Submit order creation to backend
      const orderData = {
        items: cart.map(item => ({
          title: item.product.title,
          qty: item.quantity,
          price: item.product.price
        })),
        total: finalTotal,
        shippingInfo,
        paymentType: paymentMethod, // 'CreditCard' or 'GreenWorld'
        logisticsType: shippingMethod === 'HOME' ? 'HOME' : 'CVS',
        logisticsSubType: shippingMethod,
        cvsStoreID: selectedCvsStore?.storeId || null,
        cvsStoreName: selectedCvsStore?.storeName || null,
        couponCode: appliedCoupon?.code || null,
        discountAmount: discountAmount
      };

      try {
        const res = await fetch(`${BACKEND_URL}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });
        const data = await res.json();
        if (res.ok) {
          if (data.paymentNeeded && data.paymentForm) {
            // Redirect to ECPay page via auto-submitting form
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = data.paymentForm.action;
            
            for (const [key, value] of Object.entries(data.paymentForm.params)) {
              const input = document.createElement('input');
              input.type = 'hidden';
              input.name = key;
              input.value = value as string;
              form.appendChild(input);
            }
            
            document.body.appendChild(form);
            form.submit();
            return;
          }
          
          setCart([]);
          setCheckoutStep(3);
          setAppliedCoupon(null);
          setCouponCodeInput('');
        } else {
          alert(data.error || '訂單建立失敗');
        }
      } catch (error) {
        console.error(error);
        alert('無法連接到伺服器建立訂單');
      }
    }
  };

  // Filter & Sort Products (for Mall Catalog view)
  const filteredProducts = products.filter(p => {
    if (category === 'all') return true;
    if (category === 'new') return p.isNew === true;
    return p.category === category;
  });
  
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return 0; // default popular
  });

  return (
    <>
      <div className="sticky-header-container">
        {/* Top Announcement Bar */}
        <AnnouncementBar text={announcementText} />

        {/* Centered Navigation Header */}
        <Header 
          appLogo={appLogo}
          isLoggedIn={isLoggedIn}
          currentUser={currentUser}
          handleLogout={handleLogout}
          setIsLoginModalOpen={setIsLoginModalOpen}
          setIsCartOpen={setIsCartOpen}
          cartTotalQty={cartTotalQty}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          category={category}
          setCategory={setCategory}
          isAdminMode={isAdminMode}
          setIsAdminMode={setIsAdminMode}
          scrolled={scrolled}
          navItems={navItems}
        />
      </div>

      {/* Main Pages Content */}
      <main>
        {isAdminMode ? (
          /* ==================== ADMINISTRATOR BACKEND PANEL ==================== */
          <AdminPanel 
            products={products}
            orders={orders}
            customers={customers}
            updateOrderStatus={updateOrderStatus}
            deleteProduct={deleteProduct}
            saveProduct={saveProduct}
            integrationKeys={integrationKeys}
            setIntegrationKeys={setIntegrationKeys}
            refreshOrders={fetchOrders}
            refreshCustomers={fetchCustomers}
            saveSettings={saveSettings}
            announcementText={announcementText}
            setAnnouncementText={setAnnouncementText}
            heroTitle={heroTitle}
            setHeroTitle={setHeroTitle}
            heroDesc={heroDesc}
            heroImage={heroImage}
            setHeroImage={setHeroImage}
            heroSlides={heroSlides}
            setHeroSlides={setHeroSlides}
            blogArticles={blogArticles}
            setPrintingOrder={setPrintingOrder}
            appLogo={appLogo}
            petHero={petHero}
            customCategories={customCategories}
            setCustomCategories={setCustomCategories}
            customBrands={customBrands}
            setCustomBrands={setCustomBrands}
            navItems={navItems}
            setNavItems={setNavItems}
            bannerBtnText={bannerBtnText}
            setBannerBtnText={setBannerBtnText}
            layoutOrder={layoutOrder}
            setLayoutOrder={setLayoutOrder}
            instagramUrl={instagramUrl}
            setInstagramUrl={setInstagramUrl}
            lineUrl={lineUrl}
            setLineUrl={setLineUrl}
          />
        ) : (
          /* ==================== USER FACING FRONTEND ==================== */
          <>
            {/* 1. HOMEPAGE */}
            {currentPage === 'home' && (
              <HomePage 
                petHero={petHero}
                dogBed={dogBed}
                petFood={petFood}
                heroTitle={heroTitle}
                heroImage={heroImage}
                heroSlides={heroSlides}
                products={products}
                setCurrentPage={setCurrentPage}
                setCategory={setCategory}
                setSelectedProduct={setSelectedProduct}
                addToCart={addToCart}
                customCategories={customCategories}
                bannerBtnText={bannerBtnText}
                layoutOrder={layoutOrder}
                blogArticles={blogArticles}
                appLogo={appLogo}
              />
            )}

            {/* 2. MALL CATALOG SHOP */}
            {currentPage === 'shop' && (
              <section className="shop-section" style={{ padding: '3rem 0 5rem' }}>
                <div className="container">
                  <div className="section-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <span className="section-subtitle">Premium Selection</span>
                    <h2 className="section-title">慧聚健康選物</h2>
                  </div>

                  {/* Toolbar Filters */}
                  <div className="shop-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
                    <div className="category-tabs" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                      {[
                        { id: 'all', label: '全部選物' },
                        { id: 'new', label: '新品推薦' },
                        ...customCategories.map(cat => ({ id: cat.id, label: cat.name }))
                      ].map(tab => (
                        <button
                          key={tab.id}
                          className={`category-btn ${category === tab.id ? 'active' : ''}`}
                          onClick={() => setCategory(tab.id)}
                          id={`filter-btn-${tab.id}`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div className="sort-select-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>排序方式:</span>
                      <select 
                        className="sort-select" 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        id="product-sort-select"
                        style={{ border: '2px solid #8c5a3c', borderRadius: '8px', padding: '0.45rem 1rem', background: '#ffffff', color: '#2b2b2b', fontWeight: 600, fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}
                      >
                        <option value="popular">熱門推薦</option>
                        <option value="price-asc">價格：由低到高</option>
                        <option value="price-desc">價格：由高到低</option>
                      </select>
                    </div>
                  </div>

                  {/* Products Grid */}
                  {sortedProducts.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>暫時沒有符合分類的選物商品</p>
                  ) : (
                    <div className="products-grid">
                      {sortedProducts.map(product => (
                        <div 
                          key={product.id} 
                          className="product-card glass-panel"
                          onClick={() => { setSelectedProduct(product); setCurrentPage('product-detail'); }}
                        >
                          <div className="product-image-container">
                            <img 
                              src={(product.image && !product.image.includes('pet_') && !product.image.includes('dog_') && !product.image.includes('cat_')) ? product.image : appLogo} 
                              alt={product.title} 
                              className="product-image" 
                              style={{ objectFit: 'contain', padding: '0.75rem' }} 
                            />
                            <div className="product-badges">
                              {product.badges?.map((badge, idx) => (
                                <span 
                                  key={idx} 
                                  className={`badge ${badge.includes('手作') || badge.includes('專利') ? 'badge-gold' : 'badge-red'}`}
                                >
                                  {badge}
                                </span>
                              ))}
                            </div>
                            <button 
                              className={`product-wishlist-btn ${wishlist.includes(product.id) ? 'active' : ''}`}
                              onClick={(e) => toggleWishlist(product.id, e)}
                              aria-label="加入收藏"
                              id={`wishlist-btn-${product.id}`}
                            >
                              <Heart size={18} fill={wishlist.includes(product.id) ? '#ff4757' : 'none'} />
                            </button>
                          </div>

                          <div className="product-info">
                            <span className="product-category">
                              {(product.brand && product.brand !== 'Lè Lè Design' && product.brand !== 'Ròu Ròu Selection' && product.brand !== 'Wild Earth') ? product.brand : '慧聚健康'} &middot; {product.category === 'apparel' ? '核心保健' : product.category === 'accessories' ? '個人護理' : product.category === 'outing' ? '順暢消化' : '健康商品'}
                            </span>
                            <h3 className="product-title">{product.title}</h3>
                            


                            <div className="product-footer">
                              <div className="product-price-box">
                                <span className="product-price">NT$ {product.price.toLocaleString()}</span>
                                {product.originalPrice && (
                                  <span className="product-original-price">NT$ {product.originalPrice.toLocaleString()}</span>
                                )}
                              </div>
                              <button 
                                className="add-to-cart-icon-btn"
                                onClick={(e) => addToCart(product, 1, e)}
                                aria-label="加入購物車"
                                id={`add-to-cart-btn-${product.id}`}
                              >
                                <Plus size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* 3. PRODUCT DETAILS PAGE */}
            {currentPage === 'product-detail' && selectedProduct && (
              <ProductDetailPage 
                product={selectedProduct}
                products={products}
                addToCart={addToCart}
                setCurrentPage={setCurrentPage}
                setSelectedProduct={setSelectedProduct}
                setIsCartOpen={setIsCartOpen}
                wishlist={wishlist}
                toggleWishlist={toggleWishlist}
              />
            )}

            {/* 4. BLOG PAGE (LIFETIMES) */}
            {(currentPage === 'blog' || currentPage === 'blog-post') && (
              <BlogPage 
                blogArticles={blogArticles}
                selectedPost={selectedPost}
                setSelectedPost={(post) => {
                  setSelectedPost(post);
                  if (post) {
                    setCurrentPage('blog-post');
                  } else {
                    setCurrentPage('blog');
                  }
                }}
              />
            )}

            {/* 5. BRAND INTROS */}
            {currentPage === 'brands' && (
              <BrandsPage 
                petHero={petHero}
                dogBed={dogBed}
                petFood={petFood}
                setCurrentPage={setCurrentPage}
                setCategory={setCategory}
              />
            )}

            {/* 6. USER BACKOFFICE DASHBOARD (MEMBER CENTER) */}
            {(currentPage === 'portal' || currentPage === 'member-center') && (
              <MemberCenter 
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
                orders={orders}
                products={products}
                wishlist={wishlist}
                toggleWishlist={toggleWishlist}
                addToCart={addToCart}
                setCurrentPage={setCurrentPage}
                setSelectedProduct={setSelectedProduct}
                BACKEND_URL={BACKEND_URL}
              />
            )}
          </>
        )}
      </main>

      {/* Footer (Same design but with aligned links and pages routing) */}
      <footer className="app-footer" style={{ borderTop: '1px solid var(--border)', padding: '4rem 0 2rem', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
              <span className="footer-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.4rem', fontWeight: 'bold', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}>
                <img src={appLogo} alt="慧聚健康 Logo" style={{ height: '60px', width: '60px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--border)' }} />
                <span>慧聚健康 <span style={{ whiteSpace: 'nowrap' }}>Huiju Health</span></span>
              </span>
              <p className="footer-desc" style={{ marginTop: '1rem', fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                專門為您與全家健康打造的慧聚健康。嚴選頂級深海魚油、游離型葉黃素與專利百億益生菌，守護您的全方位健康。
              </p>

            <div className="footer-links-col">
              <h4 className="footer-title" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem' }}>健康精品</h4>
              <ul className="footer-links" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setIsAdminMode(false); setCurrentPage('shop'); setCategory('apparel'); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>天然營養補充</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setIsAdminMode(false); setCurrentPage('shop'); setCategory('apparel'); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>草本養生調理</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setIsAdminMode(false); setCurrentPage('shop'); setCategory('accessories'); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>個人健康護理</a></li>
              </ul>
            </div>

            <div className="footer-links-col">
              <h4 className="footer-title" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem' }}>健康專欄</h4>
              <ul className="footer-links" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setIsAdminMode(false); setCurrentPage('blog'); setSelectedPost(null); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>保健品選購指南</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setIsAdminMode(false); setCurrentPage('blog'); setSelectedPost(null); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>日常養生須知</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setIsAdminMode(false); setCurrentPage('portal'); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>會員點數機制</a></li>
                <li><a href="#doc" onClick={(e) => { e.preventDefault(); setFooterDoc('returns'); }} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}><ArrowLeftRight size={14} /> 退換貨政策</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom" style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <p>&copy; 2026 慧聚健康 Huiju Health. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="#doc" onClick={(e) => { e.preventDefault(); setFooterDoc('privacy'); }} style={{ color: 'var(--text-muted)' }}>隱私權政策</a>
              <a href="#doc" onClick={(e) => { e.preventDefault(); setFooterDoc('returns'); }} style={{ color: 'var(--text-muted)' }}>服務條款</a>
            </div>
          </div>
        </div>
      </footer>

      {/* LOGIN MODAL */}
      {isLoginModalOpen && (
        <div className="modal-overlay" onClick={() => setIsLoginModalOpen(false)}>
          <div className="modal-content glass-panel" style={{ maxWidth: '420px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close-btn" 
              onClick={() => setIsLoginModalOpen(false)}
              aria-label="關閉"
              id="login-modal-close"
            >
              <X size={20} />
            </button>

            {authMode === 'login' ? (
              <div style={{ padding: '2.5rem', textAlign: 'center' }}>
                <img src={appLogo} alt="慧聚健康 Logo" style={{ height: '80px', width: '80px', borderRadius: '16px', objectFit: 'cover', border: '1px solid var(--border)', marginBottom: '1.5rem' }} />
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>會員登入</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>登入後即可享有「慧聚健康」會員特權與消費點數累計</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button 
                    className="btn-social"
                    style={{ borderColor: '#06C755', color: '#06C755', background: 'rgba(6, 199, 85, 0.03)' }}
                    onClick={() => handleSocialLogin('LINE')}
                    id="line-login-btn"
                  >
                    使用 LINE 快速登入
                  </button>
                  <button 
                    className="btn-social btn-google"
                    style={{ borderColor: '#4285F4', color: '#4285F4', background: 'rgba(66, 133, 244, 0.03)' }}
                    onClick={() => handleSocialLogin('Google')}
                    id="google-login-btn"
                  >
                    使用 Google 快速登入
                  </button>
                </div>

                <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ height: '1px', flexGrow: 1, background: 'var(--border)' }}></span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>或一般電子郵件登入</span>
                  <span style={{ height: '1px', flexGrow: 1, background: 'var(--border)' }}></span>
                </div>

                <div className="checkout-form" style={{ textAlign: 'left' }}>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>信箱或手機</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      placeholder="電子郵件信箱" 
                      required 
                      id="email-login-input" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>密碼</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      placeholder="密碼" 
                      required 
                      id="pwd-login-input" 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>
                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '0.75rem' }}
                    onClick={() => {
                      handleEmailLogin(loginEmail, loginPassword);
                    }}
                    id="email-submit-login-btn"
                  >
                    登入
                  </button>
                  <p style={{ fontSize: '0.85rem', marginTop: '1.5rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    尚未註冊？ <a href="#" onClick={(e) => { e.preventDefault(); setAuthMode('register'); }} style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'underline' }}>點此註冊帳號</a>
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ padding: '2.5rem', textAlign: 'center' }}>
                <img src={appLogo} alt="Lè Ròu Logo" style={{ height: '80px', width: '80px', borderRadius: '16px', objectFit: 'cover', border: '1px solid var(--border)', marginBottom: '1.5rem' }} />
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>註冊帳號</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>建立新帳號以累積特權與快速結帳</p>

                <div className="checkout-form" style={{ textAlign: 'left' }}>
                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>姓名</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="例如：林小美" 
                      required 
                      id="reg-name-input" 
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>性別</label>
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.4rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <input type="radio" name="reg-gender" value="male" defaultChecked /> 男
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <input type="radio" name="reg-gender" value="female" /> 女
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <input type="radio" name="reg-gender" value="other" /> 不透露
                      </label>
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>手機號碼 (收貨聯繫)</label>
                    <input 
                      type="tel" 
                      className="form-input" 
                      placeholder="例如：0912345678" 
                      required 
                      id="reg-phone-input" 
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>電子郵件信箱</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="email" 
                        className="form-input" 
                        placeholder="例如：parent@lerou.com" 
                        required 
                        id="reg-email-input" 
                        style={{ flexGrow: 1 }} 
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', whiteSpace: 'nowrap', height: 'auto' }}
                        disabled={otpCountdown > 0}
                        onClick={() => {
                          handleSendOtp(regEmail);
                        }}
                      >
                        {otpCountdown > 0 ? `重新發送 (${otpCountdown}s)` : '傳送驗證碼'}
                      </button>
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>信箱驗證碼 (6位數)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="請輸入6位數驗證碼" 
                      required 
                      id="reg-otp-input" 
                      maxLength={6} 
                      value={regOtp}
                      onChange={(e) => setRegOtp(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>設定密碼</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      placeholder="請輸入密碼" 
                      required 
                      id="reg-pwd-input" 
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>預設送貨地址</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="例如：台北市大安區敦化南路二段x號" 
                      id="reg-addr-input" 
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" id="reg-default-addr-chk" defaultChecked style={{ cursor: 'pointer' }} />
                    <label htmlFor="reg-default-addr-chk" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}>將此地址設為預設收件地址</label>
                  </div>
                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '0.75rem' }}
                    onClick={() => {
                      handleEmailRegister({ 
                        name: regName, 
                        phone: regPhone, 
                        email: regEmail, 
                        address: regAddress, 
                        password: regPassword, 
                        otp: regOtp 
                      });
                    }}
                    id="email-submit-register-btn"
                  >
                    註冊並登入
                  </button>
                  <p style={{ fontSize: '0.85rem', marginTop: '1.5rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    已經有帳號？ <a href="#" onClick={(e) => { e.preventDefault(); setAuthMode('login'); }} style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'underline' }}>點此返回登入</a>
                  </p>
                </div>
              </div>
            )}
            </div>
          </div>
        )}

      {/* FOOTER PAGES MODAL */}
      {footerDoc && (
        <div className="modal-overlay" onClick={() => setFooterDoc(null)}>
          <div className="modal-content glass-panel" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close-btn" 
              onClick={() => setFooterDoc(null)}
              aria-label="關閉"
              id="footer-modal-close"
            >
              <X size={20} />
            </button>

            <div style={{ padding: '3rem' }}>
              {footerDoc === 'shopping' && (
                <div>
                  <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>購物須知</h2>
                  <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.8', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <p><strong>1. 訂購與出貨流程</strong>：下單完成付款後，系統會自動串接超商與宅配 API 進行訂單處理。常規用品與服飾將於 2-3 個工作天內完成出貨。</p>
                    <p><strong>2. 配送運費與免運</strong>：全站單筆訂單消費滿 NT$ 2,000 即享免運費優惠；未滿免運門檻者，超商店到店或快遞宅配需酌收 NT$ 100 運費。</p>
                    <p><strong>3. 配送範圍</strong>：目前限台灣本島及澎湖、金門、馬祖等超商店到店支援區域。</p>
                    <p><strong>4. 散步外出用品注意事項</strong>：所有水壺及胸背帶配件，建議每次使用後以清水洗淨、晾乾，維持清潔衛生。</p>
                  </div>
                </div>
              )}

              {footerDoc === 'privacy' && (
                <div>
                  <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>隱私權保護政策</h2>
                  <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.8', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <p>樂肉選品（以下稱本網站）非常重視您的個人隱私權。我們將依據本政策蒐集、處理及利用您的個人資料：</p>
                    <p><strong>1. 資料蒐集目的</strong>：本網站透過 Google、LINE 或 Facebook 社群快速登入系統，蒐集會員的基本聯絡資料（如姓名、電子郵件、電話），僅用於訂單配送、CRM 客戶積點與行銷優惠通知。</p>
                    <p><strong>2. 安全防護</strong>：我們使用業界標準的 SSL 傳輸加密技術，確保您的交易與付款金鑰不被第三方攔截。</p>
                    <p><strong>3. 權利行使</strong>：會員可隨時登入個人後台，申請刪除、修改或查閱其個人隱私資料。</p>
                  </div>
                </div>
              )}

              {footerDoc === 'returns' && (
                <div>
                  <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>退換貨政策</h2>
                  <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.8', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <p><strong>1. 七天鑑賞期</strong>：依消費者保護法規定，會員享有商品到貨七天猶豫期（鑑賞期非試用期）之權利。退回商品必須是全新狀態且包裝完整。</p>
                    <p><strong>2. 保健食品退換貨說明</strong>：由於口服與生醫保健食品之食品安全考量，商品若已拆封、封口膜破損或外盒損壞者，恕**不接受退換貨**。</p>
                    <p><strong>3. 產品品質與瑕疵處理</strong>：若商品於運送過程中受損或有瑕疵，請於收到貨 24 小時內拍下商品與外盒照片聯繫客服，我們將儘速為您辦理免費換貨處理。</p>
                    <p><strong>4. 退款處理</strong>：確認退回商品無誤後，我們將於 7 個工作天內退款至您的指定帳戶，不收取任何平台退款手續費。</p>
                  </div>
                </div>
              )}

              <button 
                className="btn btn-primary" 
                style={{ marginTop: '2rem', width: '100%' }}
                onClick={() => setFooterDoc(null)}
              >
                我已閱讀並同意以上條款
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CART DRAWER */}
      {isCartOpen && (
        <>
          <div className="cart-drawer-overlay" onClick={() => setIsCartOpen(false)}></div>
          <div className="cart-drawer" id="cart-drawer-panel">
            <div className="cart-header">
              <h2 className="cart-title">購物車 ({cartTotalQty})</h2>
              <button 
                className="cart-close-btn" 
                onClick={() => setIsCartOpen(false)}
                aria-label="關閉購物車"
                id="cart-close-x"
              >
                <X size={24} />
              </button>
            </div>

            <div className="cart-items-container">
              {cart.length === 0 ? (
                <div className="cart-empty-state">
                  <ShoppingBag size={48} strokeWidth={1} />
                  <p>您的選物車空空如也</p>
                  <button 
                    className="btn btn-secondary" 
                    style={{ fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}
                    onClick={() => setIsCartOpen(false)}
                    id="cart-start-shopping"
                  >
                    前去選購
                  </button>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.product.id} className="cart-item">
                    <img src={item.product.image} alt={item.product.title} className="cart-item-img" />
                    <div className="cart-item-info">
                      <h4 className="cart-item-title">{item.product.title}</h4>
                      <div className="cart-item-price">NT$ {item.product.price.toLocaleString()}</div>
                      
                      <div className="cart-item-actions">
                        <div className="cart-item-quantity">
                          <button 
                            className="cart-item-qbtn" 
                            onClick={() => updateCartQty(item.product.id, -1)}
                            id={`cart-minus-${item.product.id}`}
                          >
                            <Minus size={12} />
                          </button>
                          <span className="cart-item-qval">{item.quantity}</span>
                          <button 
                            className="cart-item-qbtn" 
                            onClick={() => updateCartQty(item.product.id, 1)}
                            id={`cart-plus-${item.product.id}`}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <button 
                          className="cart-item-remove" 
                          onClick={() => removeFromCart(item.product.id)}
                          id={`cart-remove-${item.product.id}`}
                        >
                          <X size={12} /> 刪除
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-summary-row">
                  <span>商品小計:</span>
                  <span>NT$ {cartSubtotal.toLocaleString()}</span>
                </div>
                <div className="cart-summary-row">
                  <span>精品物流運費:</span>
                  <span>{shippingFee === 0 ? <span className="gold-text">滿額免運</span> : `NT$ ${shippingFee}`}</span>
                </div>
                <div className="cart-summary-row cart-summary-total">
                  <span>結帳總計:</span>
                  <span>NT$ {(cartSubtotal + shippingFee).toLocaleString()}</span>
                </div>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: '0.5rem' }}
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                    setCheckoutStep(1);
                  }}
                  id="cart-checkout-btn"
                >
                  前往結帳 <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* CHECKOUT MODAL */}
      {isCheckoutOpen && (
        <div className="modal-overlay" onClick={() => setIsCheckoutOpen(false)}>
          <div className="modal-content glass-panel checkout-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close-btn" 
              onClick={() => setIsCheckoutOpen(false)}
              aria-label="關閉"
              id="checkout-close-btn"
            >
              <X size={20} />
            </button>

            <div style={{ padding: '2.5rem' }}>
              <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.8rem', fontWeight: 'bold' }}>極致安全美學結帳</h2>

              {/* Steps Indicator */}
              <div className="checkout-steps">
                <div className={`checkout-step ${checkoutStep >= 1 ? 'active' : ''} ${checkoutStep > 1 ? 'completed' : ''}`}>
                  <div className="checkout-step-number">1</div>
                  <span>配送資訊</span>
                </div>
                <div className={`checkout-step ${checkoutStep >= 2 ? 'active' : ''} ${checkoutStep > 2 ? 'completed' : ''}`}>
                  <div className="checkout-step-number">2</div>
                  <span>付款驗證</span>
                </div>
                <div className={`checkout-step ${checkoutStep === 3 ? 'active completed' : ''}`}>
                  <div className="checkout-step-number">3</div>
                  <span>訂單成立</span>
                </div>
              </div>

              {/* Form Content */}
              {checkoutStep < 3 ? (
                <form onSubmit={handleCheckoutSubmit} className="checkout-form">
                  {checkoutStep === 1 && (
                    <>
                      <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                        <label className="form-label" style={{ fontWeight: 600 }}>配送方式</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                          <button
                            type="button"
                            className={`btn ${shippingMethod === 'HOME' ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ padding: '0.5rem', fontSize: '0.85rem' }}
                            onClick={() => {
                              setShippingMethod('HOME');
                              setShippingInfo(prev => ({ ...prev, address: '' }));
                              setSelectedCvsStore(null);
                            }}
                          >
                            質感宅配
                          </button>
                          <button
                            type="button"
                            className={`btn ${shippingMethod === 'UNIMART' ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ padding: '0.5rem', fontSize: '0.85rem' }}
                            onClick={() => {
                              setShippingMethod('UNIMART');
                              setShippingInfo(prev => ({ ...prev, address: '' }));
                              setSelectedCvsStore(null);
                            }}
                          >
                            7-11 超商取貨
                          </button>
                          <button
                            type="button"
                            className={`btn ${shippingMethod === 'FAMI' ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ padding: '0.5rem', fontSize: '0.85rem' }}
                            onClick={() => {
                              setShippingMethod('FAMI');
                              setShippingInfo(prev => ({ ...prev, address: '' }));
                              setSelectedCvsStore(null);
                            }}
                          >
                            全家超商取貨
                          </button>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">收件人姓名</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="例如：林小美" 
                          required
                          value={shippingInfo.name}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                          id="checkout-input-name"
                        />
                      </div>
                      
                      <div className="form-group-row">
                        <div className="form-group">
                          <label className="form-label">行動電話 (物流聯繫)</label>
                          <input 
                            type="tel" 
                            className="form-input" 
                            placeholder="例如：0912345678" 
                            required
                            value={shippingInfo.phone}
                            onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                            id="checkout-input-phone"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">電子信箱 (出貨通知)</label>
                          <input 
                            type="email" 
                            className="form-input" 
                            placeholder="例如：parent@lerou.com" 
                            required
                            value={shippingInfo.email}
                            onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                            id="checkout-input-email"
                          />
                        </div>
                      </div>

                      {shippingMethod === 'HOME' ? (
                        <div className="form-group">
                          <label className="form-label">配送地址</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="例如：台北市大安區敦化南路二段x號" 
                            required
                            value={shippingInfo.address}
                            onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                            id="checkout-input-address"
                          />
                        </div>
                      ) : (
                        <div className="form-group" style={{ background: 'rgba(177, 151, 119, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '1rem' }}>
                          <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                            {shippingMethod === 'UNIMART' ? '7-11 電子地圖' : '全家 電子地圖'}
                          </label>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ width: '100%', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
                            onClick={handleSelectCvsStore}
                          >
                            📍 開啟電子地圖選擇門市
                          </button>
                          {selectedCvsStore ? (
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                              <div><strong>門市名稱：</strong>{selectedCvsStore.storeName} ({selectedCvsStore.storeId})</div>
                              <div style={{ marginTop: '0.25rem' }}><strong>門市地址：</strong>{selectedCvsStore.storeAddress}</div>
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.5rem 0' }}>
                              ⚠️ 尚未選擇門市，請點擊上方按鈕開啟地圖
                            </div>
                          )}
                          <input 
                            type="hidden" 
                            required 
                            value={shippingInfo.address} 
                          />
                        </div>
                      )}
                    </>
                  )}

                  {checkoutStep === 2 && (
                    <>
                      <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                        <label className="form-label" style={{ fontWeight: 600 }}>付款方式</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                          <button
                            type="button"
                            className={`btn ${paymentMethod === 'CreditCard' ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ padding: '0.5rem', fontSize: '0.85rem' }}
                            onClick={() => setPaymentMethod('CreditCard')}
                          >
                            模擬快速刷卡
                          </button>
                          <button
                            type="button"
                            className={`btn ${paymentMethod === 'GreenWorld' ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ padding: '0.5rem', fontSize: '0.85rem' }}
                            onClick={() => setPaymentMethod('GreenWorld')}
                          >
                            綠界科技安全金流
                          </button>
                        </div>
                      </div>

                      {paymentMethod === 'CreditCard' ? (
                        <>
                          <div className="form-group">
                            <label className="form-label">信用卡卡號</label>
                            <div style={{ position: 'relative' }}>
                              <input 
                                type="text" 
                                className="form-input" 
                                style={{ paddingLeft: '2.5rem', width: '100%' }}
                                placeholder="xxxx xxxx xxxx xxxx" 
                                required
                                maxLength={19}
                                value={paymentInfo.cardNum}
                                onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNum: e.target.value })}
                                id="checkout-input-cardnum"
                              />
                              <CreditCard size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                            </div>
                          </div>
                          <div className="form-group-row">
                            <div className="form-group">
                              <label className="form-label">有效期限 (MM/YY)</label>
                              <input 
                                type="text" 
                                className="form-input" 
                                placeholder="MM/YY" 
                                required
                                maxLength={5}
                                value={paymentInfo.expiry}
                                onChange={(e) => setPaymentInfo({ ...paymentInfo, expiry: e.target.value })}
                                id="checkout-input-expiry"
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label">安全碼 (CVV)</label>
                              <input 
                                type="password" 
                                className="form-input" 
                                placeholder="***" 
                                required
                                maxLength={3}
                                value={paymentInfo.cvv}
                                onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
                                id="checkout-input-cvv"
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '1.5rem 1rem', background: 'rgba(177, 151, 119, 0.05)', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '1.25rem' }}>
                          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>💳</div>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '0.4rem' }}>您將被引導至綠界科技安全付款網頁</h4>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                            按下下方按鈕後，系統將安全地導向綠界測試刷卡頁面，支援信用卡一次付清。付款完成後將自動導回本站。
                          </p>
                        </div>
                      )}

                      {/* Coupon Input Area */}
                      <div style={{ marginBottom: '1.25rem' }}>
                        <label className="form-label" style={{ fontWeight: 600 }}>使用優惠券/折扣碼</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="輸入折扣碼（例如 LEROU90）" 
                            style={{ flexGrow: 1 }}
                            value={couponCodeInput}
                            onChange={(e) => {
                              setCouponCodeInput(e.target.value);
                              setCouponError('');
                            }}
                          />
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap', height: 'auto' }}
                            onClick={() => {
                              const code = couponCodeInput.trim().toUpperCase();
                              if (code === 'WELCOME100') {
                                if (cartSubtotal < 1000) {
                                  setCouponError('滿 NT$ 1,000 元方可使用此優惠券');
                                  setAppliedCoupon(null);
                                } else {
                                  setAppliedCoupon({ code, type: 'amount', value: 100 });
                                  setCouponError('');
                                }
                              } else if (code === 'LEROU90') {
                                setAppliedCoupon({ code, type: 'percent', value: 0.9 });
                                setCouponError('');
                              } else if (code === 'FREEPING') {
                                setAppliedCoupon({ code, type: 'free_shipping', value: 0 });
                                setCouponError('');
                              } else if (code === '') {
                                setAppliedCoupon(null);
                                setCouponError('');
                              } else {
                                setCouponError('無效的折扣碼');
                                setAppliedCoupon(null);
                              }
                            }}
                          >
                            套用
                          </button>
                        </div>
                        {couponError && (
                          <div style={{ color: '#e63946', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                            ❌ {couponError}
                          </div>
                        )}
                        {appliedCoupon && (
                          <div style={{ color: '#2a9d8f', fontSize: '0.8rem', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(42, 157, 143, 0.05)', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                            <span>
                              ✅ 已套用：{appliedCoupon.code} (
                              {appliedCoupon.type === 'amount' && `折抵 NT$ ${appliedCoupon.value} 元`}
                              {appliedCoupon.type === 'percent' && `享有 9 折優惠`}
                              {appliedCoupon.type === 'free_shipping' && `免運費`}
                              )
                            </span>
                            <button 
                              type="button" 
                              style={{ background: 'none', border: 'none', color: '#e63946', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}
                              onClick={() => {
                                setAppliedCoupon(null);
                                setCouponCodeInput('');
                              }}
                            >
                              取消
                            </button>
                          </div>
                        )}
                      </div>

                      <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span>選物小計:</span>
                          <span>NT$ {cartSubtotal.toLocaleString()}</span>
                        </div>
                        
                        {appliedCoupon && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#2a9d8f', fontWeight: 500 }}>
                            <span>優惠折抵 ({appliedCoupon.code}):</span>
                            <span>
                              {appliedCoupon.type === 'amount' && `- NT$ ${appliedCoupon.value}`}
                              {appliedCoupon.type === 'percent' && `- NT$ ${Math.round(cartSubtotal * 0.1)}`}
                              {appliedCoupon.type === 'free_shipping' && `運費折抵`}
                            </span>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span>物流運費:</span>
                          <span>
                            {appliedCoupon?.type === 'free_shipping' ? (
                              <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>NT$ {shippingFee}</span>
                            ) : shippingFee === 0 ? (
                              'NT$ 0'
                            ) : (
                              `NT$ ${shippingFee}`
                            )}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid var(--border)', paddingTop: '0.5rem', color: 'var(--primary)', fontSize: '1rem' }}>
                          <span>總計扣款:</span>
                          <span>
                            NT$ {Math.max(0, 
                              cartSubtotal + 
                              (appliedCoupon?.type === 'free_shipping' ? 0 : shippingFee) - 
                              (appliedCoupon?.type === 'amount' ? appliedCoupon.value : appliedCoupon?.type === 'percent' ? Math.round(cartSubtotal * 0.1) : 0)
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ width: '100%', marginTop: '1rem' }}
                    id="checkout-submit-btn"
                  >
                    {checkoutStep === 1 ? '確認配送資訊，前往付款' : paymentMethod === 'GreenWorld' ? '前往綠界安全付款' : '安全驗證並付款'}
                  </button>
                </form>
              ) : (
                <div className="checkout-success-view" style={{ textAlign: 'center' }}>
                  <div className="success-icon-wrapper" style={{ display: 'inline-flex', padding: '1rem', background: 'var(--primary-light)', borderRadius: '50%', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                    <Check size={40} />
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>您的優質選物訂單已成立！</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                      感謝您的支持，我們正在小心包裝您的健康生醫選物，出貨時會以簡訊及郵件通知您。
                    </p>
                  </div>
                  <div style={{ background: 'var(--bg-secondary)', width: '100%', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.9rem', textAlign: 'left', marginBottom: '1.5rem' }}>
                    <div style={{ marginBottom: '0.5rem' }}><span style={{ color: 'var(--text-muted)' }}>收件人：</span>{shippingInfo.name}</div>
                    <div style={{ marginBottom: '0.5rem' }}><span style={{ color: 'var(--text-muted)' }}>連絡電話：</span>{shippingInfo.phone}</div>
                    <div><span style={{ color: 'var(--text-muted)' }}>配送地址：</span>{shippingInfo.address}</div>
                  </div>
                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%' }}
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      setCurrentPage('portal');
                    }}
                    id="checkout-done-btn"
                  >
                    查看歷史訂單與積點 &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PRINT SLIP MODAL OVERLAY */}
      {printingOrder && (
        <PackingSlipModal 
          order={printingOrder}
          onClose={() => setPrintingOrder(null)}
        />
      )}

      {/* Floating contact service widget */}
      {!isCartOpen && !isCheckoutOpen && (
        <div className="floating-contact-widget">
          <a href={lineUrl} target="_blank" rel="noopener noreferrer" className="contact-icon-btn line" title="LINE 官方客服">
            <MessageCircle size={16} /> LINE 客服
          </a>
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="contact-icon-btn ig" title="Instagram 官方專頁">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.51"/></svg> IG 訊息
          </a>
        </div>
      )}
    </>
  );
}

export default App;
