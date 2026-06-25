import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ShoppingCart, 
  MessageSquare, 
  Settings, 
  GitFork, 
  LogOut, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Filter, 
  RefreshCw, 
  Sparkles,
  CheckCircle,
  Clock,
  Truck,
  User,
  MapPin,
  HelpCircle,
  Send,
  Zap,
  ArrowRight,
  Upload,
  ChevronRight,
  X,
  ChevronDown,
  CreditCard,
  Tag
} from 'lucide-react';

const MOCK_PRODUCTS = [
  { id: 1, name: 'Classic White Cotton Shirt', price: 1299, category: 'Shirts', colours: 'White/Grey', imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500', inStock: true },
  { id: 2, name: 'Slim Fit Black Jeans', price: 1999, category: 'Jeans', colours: 'Black', imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500', inStock: true },
  { id: 3, name: 'Navy Blue Chino Trousers', price: 2499, category: 'Trousers', colours: 'Navy/Blue', imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500', inStock: true },
  { id: 4, name: 'Oversized Black Graphic Tee', price: 899, category: 'T-Shirts', colours: 'Black', imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500', inStock: true },
  { id: 5, name: 'Minimalist Grey Melange Tee', price: 699, category: 'T-Shirts', colours: 'White/Grey', imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500', inStock: true },
  { id: 6, name: 'Denim Jacket Indigo', price: 3299, category: 'Shirts', colours: 'Navy/Blue', imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500', inStock: true },
  { id: 7, name: 'Premium Leather Trousers Black', price: 3999, category: 'Trousers', colours: 'Black', imageUrl: 'https://images.unsplash.com/photo-1551854838-212c50b4c184?w=500', inStock: true },
  { id: 8, name: 'Ripped Blue Denim Jeans', price: 1499, category: 'Jeans', colours: 'Navy/Blue', imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500', inStock: true }
];

const MOCK_ORDERS = [
  { id: 101, customerName: 'Arjun Mehta', phone: '+919876543211', address: 'Flat 405, Heights Residency, Bandra West, Mumbai, MH - 400050', productName: 'Classic White Cotton Shirt', amount: 1234.05, discountApplied: 64.95, paymentMethod: 'UPI', status: 'DELIVERED', createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
  { id: 102, customerName: 'Priya Sharma', phone: '+919876543212', address: '12/A, Sector 4, HSR Layout, Bengaluru, KA - 560102', productName: 'Navy Blue Chino Trousers', amount: 2499.00, discountApplied: 0.00, paymentMethod: 'COD', status: 'SHIPPED', createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString() },
  { id: 103, customerName: 'Vikram Singh', phone: '+919876543213', address: 'House 89, Gali 3, Karol Bagh, Delhi, DL - 110005', productName: 'Oversized Black Graphic Tee', amount: 809.10, discountApplied: 89.90, paymentMethod: 'COD', status: 'CONFIRMED', createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString() }
];

const MOCK_CONVERSATIONS = [
  { phone: '+919876543213', currentStep: 'SMART_NUDGE', status: 'ACTIVE', lastMessageAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString() },
  { phone: '+919876543212', currentStep: 'PAYMENT_SELECTION', status: 'ACTIVE', lastMessageAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString() },
  { phone: '+919876543211', currentStep: 'GREETING_PRODUCT', status: 'COMPLETED', lastMessageAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() }
];

const MOCK_CHAT_HISTORY = {
  '+919876543213': [
    { id: 1, phone: '+919876543213', sender: 'USER', messageType: 'TEXT', content: 'Hi, I saw your ad for the black graphic tee', createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString() },
    { id: 2, phone: '+919876543213', sender: 'BOT', messageType: 'TEXT', content: 'Hey! 👋 Loving the Oversized Black Graphic Tee from our ad?', createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString() },
    { id: 3, phone: '+919876543213', sender: 'USER', messageType: 'TEXT', content: 'Yes, I want it 😍', createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString() },
    { id: 4, phone: '+919876543213', sender: 'BOT', messageType: 'TEXT', content: 'Great! Please provide your delivery details:\n\nCould you please reply with your *Full Name*?', createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString() },
    { id: 5, phone: '+919876543213', sender: 'USER', messageType: 'TEXT', content: 'Vikram Singh', createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString() },
    { id: 6, phone: '+919876543213', sender: 'BOT', messageType: 'TEXT', content: 'Got it, *Vikram Singh*! 👍\n\nNow, please send us your complete *Delivery Address* (including City, State, and Pin Code):', createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString() },
    { id: 7, phone: '+919876543213', sender: 'USER', messageType: 'TEXT', content: 'House 89, Gali 3, Karol Bagh, Delhi, DL - 110005', createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString() },
    { id: 8, phone: '+919876543213', sender: 'BOT', messageType: 'TEXT', content: 'Perfect! We have captured your address.\n\nHow would you like to make the payment?\nButtons: Cash on Delivery 💵, Pay with GPay / UPI, Pay later', createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString() }
  ],
  '+919876543212': [
    { id: 1, phone: '+919876543212', sender: 'BOT', messageType: 'TEXT', content: 'Hey! 👋 Loving the Classic White Cotton Shirt from our ad?', createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
    { id: 2, phone: '+919876543212', sender: 'USER', messageType: 'TEXT', content: 'Yes, I want it 😍', createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() }
  ]
};

const MOCK_METRICS = {
  totalConversations: 124,
  conversionRate: 46.8,
  revenue: 145900,
  avgOrderValue: 2150
};

const MOCK_CHART = [
  { date: 'Jun 19', conversations: 28, conversions: 12, revenue: 24000 },
  { date: 'Jun 20', conversations: 35, conversions: 18, revenue: 36000 },
  { date: 'Jun 21', conversations: 42, conversions: 22, revenue: 44000 },
  { date: 'Jun 22', conversations: 31, conversions: 15, revenue: 30000 },
  { date: 'Jun 23', conversations: 45, conversions: 24, revenue: 48000 },
  { date: 'Jun 24', conversations: 39, conversions: 20, revenue: 40000 },
  { date: 'Jun 25', conversations: 48, conversions: 26, revenue: 52000 }
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [brand, setBrand] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch token
  const token = localStorage.getItem('chatcart_token');
  const isMockMode = token === 'mock_token_123';

  // Dashboard Overview Metrics State
  const [metrics, setMetrics] = useState(isMockMode ? MOCK_METRICS : {
    totalConversations: 0,
    conversionRate: 0,
    revenue: 0,
    avgOrderValue: 0
  });
  const [chartData, setChartData] = useState(isMockMode ? MOCK_CHART : []);
  
  // Collections/Lists state
  const [products, setProducts] = useState(isMockMode ? MOCK_PRODUCTS : []);
  const [orders, setOrders] = useState(isMockMode ? MOCK_ORDERS : []);
  const [conversations, setConversations] = useState(isMockMode ? MOCK_CONVERSATIONS : []);
  const [selectedChatPhone, setSelectedChatPhone] = useState(isMockMode ? MOCK_CONVERSATIONS[0].phone : null);
  const [chatTranscript, setChatTranscript] = useState([]);
  const [localChatHistories, setLocalChatHistories] = useState(MOCK_CHAT_HISTORY);

  // Modal / Form states
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', price: '', category: 'Shirts', colours: 'Black,White', imageUrl: '' });
  const [productImageFile, setProductImageFile] = useState(null);

  // Settings state
  const [settingsForm, setSettingsForm] = useState({
    storeName: '',
    whatsappNumber: '',
    metaAccessToken: '',
    discountPercent: 10,
    logoUrl: ''
  });
  const [settingsSavedMsg, setSettingsSavedMsg] = useState('');

  // Active Simulator state
  const [simPhone, setSimPhone] = useState('+919876543299');
  const [simInput, setSimInput] = useState('');
  const [simMessages, setSimMessages] = useState([]);
  const [simActive, setSimActive] = useState(false);
  const [simTyping, setSimTyping] = useState(false);

  // Client-side simulator bot flow tracking
  const [simStep, setSimStep] = useState(1);
  const [simSelectedProduct, setSimSelectedProduct] = useState(null);
  const [simName, setSimName] = useState('');
  const [simAddress, setSimAddress] = useState('');
  const [simPhoneInput, setSimPhoneInput] = useState('');
  const [simColor, setSimColor] = useState('');
  const [simSize, setSimSize] = useState('');
  const [simDiscountValue, setSimDiscountValue] = useState(10);
  
  // Bot Flow Editor configurations (used dynamically in simulator!)
  const [flowConfig, setFlowConfig] = useState({
    step1Greeting: "Hey! 👋 Loving the *[Product Name]* from our ad?",
    step1Buttons: "Yes, I want it 😍, Details & Price 🏷️, Show other styles 🛍️",
    step3Discount: 10,
    step3NudgeMsg: "🎉 Good news! I've automatically applied a [Discount]% discount for you! Offer price is now *₹[DiscountedPrice]* (originally ~₹[OriginalPrice]~).\n\nOnly a few items left in stock. Secure yours now!",
    step4Categories: "Shirts, T-Shirts, Jeans, Trousers",
    step4Budgets: "Under ₹1000, Around ₹2000, ₹3000+",
    step5NamePrompt: "Please reply with your *Full Name*:",
    step5PhonePrompt: "Got it! Now, enter your *Mobile Number* (e.g., +919876543210):",
    step5AddressPrompt: "Great! Lastly, enter your complete *Delivery Address* (City, State, Pin Code):",
    step6ConfirmMsg: "Perfect! We have captured your order details.\n\nHow would you like to make the payment?",
    step7SuccessMsg: "🎉 *Order Confirmed!*\n\nThank you, *[Name]*! Your order for *[Product]* (Amount: *₹[Amount]* with [Discount]% discount applied) has been successfully placed via Cash on Delivery.\n\nWe will ship it to your address: *[Address]* shortly!"
  });

  // Filter States for Orders
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [orderPayFilter, setOrderPayFilter] = useState('ALL');

  // Flow Editor State - selected node configuration
  const [selectedFlowNode, setSelectedFlowNode] = useState(1);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const localBrand = localStorage.getItem('chatcart_brand');
    if (localBrand) {
      const parsedBrand = JSON.parse(localBrand);
      setBrand(parsedBrand);
      setSettingsForm({
        storeName: parsedBrand.storeName || '',
        whatsappNumber: parsedBrand.whatsappNumber || '',
        metaAccessToken: parsedBrand.metaAccessToken || '',
        discountPercent: parsedBrand.discountPercent || 10,
        logoUrl: parsedBrand.logoUrl || ''
      });
    }
    fetchData();
  }, [token]);

  // Handle periodic polling for active simulator & conversations transcript
  useEffect(() => {
    let interval;
    if (activeTab === 'conversations' && selectedChatPhone) {
      fetchChatHistory(selectedChatPhone);
      if (!isMockMode) {
        interval = setInterval(() => fetchChatHistory(selectedChatPhone), 3000);
      }
    }
    if (activeTab === 'simulator' && simActive && !isMockMode) {
      pollSimulatorMessages();
      interval = setInterval(pollSimulatorMessages, 3000);
    }
    return () => clearInterval(interval);
  }, [activeTab, selectedChatPhone, simActive]);

  const getHeaders = () => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  const recalculateMetrics = (currentOrders) => {
    const totalConv = conversations.length > 0 ? conversations.length : 124;
    const conversions = currentOrders.filter(o => ['DELIVERED', 'SHIPPED', 'CONFIRMED'].includes(o.status)).length;
    const revenue = currentOrders.filter(o => ['DELIVERED', 'SHIPPED', 'CONFIRMED'].includes(o.status))
      .reduce((sum, o) => sum + Number(o.amount), 0);
    const aov = conversions > 0 ? revenue / conversions : 0;
    
    setMetrics({
      totalConversations: totalConv,
      conversionRate: Math.round((conversions / totalConv) * 100 * 10) / 10,
      revenue: revenue,
      avgOrderValue: Math.round(aov)
    });
  };

  const fetchData = async () => {
    if (isMockMode) {
      recalculateMetrics(orders);
      return;
    }
    setLoading(true);
    try {
      await Promise.all([
        fetchOverview(),
        fetchChart(),
        fetchProducts(),
        fetchOrders(),
        fetchConversations()
      ]);
    } catch (err) {
      console.error("Failed to load initial metrics", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOverview = async () => {
    if (isMockMode) return;
    const res = await fetch('http://localhost:8080/api/analytics/overview', { headers: getHeaders() });
    if (res.ok) setMetrics(await res.json());
  };

  const fetchChart = async () => {
    if (isMockMode) return;
    const res = await fetch('http://localhost:8080/api/analytics/chart?days=7', { headers: getHeaders() });
    if (res.ok) setChartData(await res.json());
  };

  const fetchProducts = async () => {
    if (isMockMode) return;
    const res = await fetch('http://localhost:8080/api/products', { headers: getHeaders() });
    if (res.ok) setProducts(await res.json());
  };

  const fetchOrders = async () => {
    if (isMockMode) {
      let filtered = [...MOCK_ORDERS];
      if (orderStatusFilter !== 'ALL') {
        filtered = filtered.filter(o => o.status === orderStatusFilter);
      }
      if (orderPayFilter !== 'ALL') {
        filtered = filtered.filter(o => o.paymentMethod === orderPayFilter);
      }
      setOrders(filtered);
      return;
    }
    const url = `http://localhost:8080/api/orders?status=${orderStatusFilter}&paymentMethod=${orderPayFilter}`;
    const res = await fetch(url, { headers: getHeaders() });
    if (res.ok) setOrders(await res.json());
  };

  const fetchConversations = async () => {
    if (isMockMode) return;
    const res = await fetch('http://localhost:8080/api/conversations', { headers: getHeaders() });
    if (res.ok) {
      const data = await res.json();
      setConversations(data);
      if (data.length > 0 && !selectedChatPhone) {
        setSelectedChatPhone(data[0].phone);
      }
    }
  };

  const fetchChatHistory = async (phone) => {
    if (isMockMode) {
      const history = localChatHistories[phone] || [];
      setChatTranscript(history);
      return;
    }
    const res = await fetch(`http://localhost:8080/api/conversations/${phone}`, { headers: getHeaders() });
    if (res.ok) setChatTranscript(await res.json());
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    if (isMockMode) {
      const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
      setOrders(updated);
      recalculateMetrics(updated);
      return;
    }
    const res = await fetch(`http://localhost:8080/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      fetchOrders();
      fetchOverview();
    }
  };

  // Product CRUD
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (isMockMode) {
      if (editingProduct) {
        // Edit product
        const updated = products.map(p => p.id === editingProduct.id ? {
          ...p,
          name: productForm.name,
          price: parseFloat(productForm.price),
          category: productForm.category,
          colours: productForm.colours,
          imageUrl: productForm.imageUrl || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500'
        } : p);
        setProducts(updated);
      } else {
        // Add product
        const newProduct = {
          id: Date.now(),
          name: productForm.name,
          price: parseFloat(productForm.price),
          category: productForm.category,
          colours: productForm.colours,
          imageUrl: productForm.imageUrl || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500',
          inStock: true
        };
        setProducts([newProduct, ...products]);
      }
      setShowProductModal(false);
      setEditingProduct(null);
      setProductForm({ name: '', price: '', category: 'Shirts', colours: 'Black,White', imageUrl: '' });
      setProductImageFile(null);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('price', productForm.price);
      formData.append('category', productForm.category);
      formData.append('colours', productForm.colours);
      if (productForm.imageUrl) {
        formData.append('imageUrl', productForm.imageUrl);
      }
      if (productImageFile) {
        formData.append('image', productImageFile);
      }

      let url = 'http://localhost:8080/api/products';
      let method = 'POST';

      if (editingProduct) {
        url = `http://localhost:8080/api/products/${editingProduct.id}`;
        method = 'PUT';
      }

      let response;
      if (method === 'POST') {
        response = await fetch(url, {
          method,
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
      } else {
        response = await fetch(url, {
          method,
          headers: getHeaders(),
          body: JSON.stringify(productForm)
        });
      }

      if (response.ok) {
        setShowProductModal(false);
        setEditingProduct(null);
        setProductForm({ name: '', price: '', category: 'Shirts', colours: 'Black,White', imageUrl: '' });
        setProductImageFile(null);
        fetchProducts();
        fetchOverview();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      price: prod.price,
      category: prod.category,
      colours: prod.colours,
      imageUrl: prod.imageUrl
    });
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      if (isMockMode) {
        setProducts(products.filter(p => p.id !== id));
        return;
      }
      const res = await fetch(`http://localhost:8080/api/products/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        fetchProducts();
        fetchOverview();
      }
    }
  };

  // Settings Save
  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSettingsSavedMsg('');
    try {
      const updatedBrand = {
        ...brand,
        storeName: settingsForm.storeName,
        whatsappNumber: settingsForm.whatsappNumber,
        metaAccessToken: settingsForm.metaAccessToken,
        discountPercent: parseInt(settingsForm.discountPercent),
        logoUrl: settingsForm.logoUrl
      };
      localStorage.setItem('chatcart_brand', JSON.stringify(updatedBrand));
      setBrand(updatedBrand);
      setSettingsSavedMsg('Settings updated successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  const updateLocalConversation = (phone, currentStep, status) => {
    const existing = conversations.find(c => c.phone === phone);
    let updated;
    if (existing) {
      updated = conversations.map(c => c.phone === phone ? { ...c, currentStep, status, lastMessageAt: new Date().toISOString() } : c);
    } else {
      updated = [
        { phone, currentStep, status, lastMessageAt: new Date().toISOString() },
        ...conversations
      ];
    }
    setConversations(updated);
  };

  // Webhook Simulator Operations
  const startSimulator = () => {
    setSimActive(true);
    setSimMessages([]);
    
    // Load config from localStorage if present
    const savedConfig = localStorage.getItem('chatcart_flow_config');
    let activeConfig = flowConfig;
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setFlowConfig(parsed);
        activeConfig = parsed;
      } catch (e) {
        console.error(e);
      }
    }

    if (isMockMode) {
      setSimStep(1);
      const initialProduct = products.length > 0 ? products[0] : MOCK_PRODUCTS[0];
      setSimSelectedProduct(initialProduct);
      setSimColor('');
      setSimSize('');
      setSimDiscountValue(activeConfig.step3Discount || 10);
      
      const greetingMsg = {
        id: Date.now(),
        phone: simPhone,
        sender: 'BOT',
        messageType: 'PRODUCT',
        product: initialProduct,
        content: activeConfig.step1Greeting.replace('[Product Name]', initialProduct.name),
        buttons: ["Yes, I want it 😍", "Surprise Discount 🎁", "Show other styles 🛍️"],
        createdAt: new Date().toISOString()
      };
      setSimMessages([greetingMsg]);
      setLocalChatHistories(prev => ({
        ...prev,
        [simPhone]: [greetingMsg]
      }));
      updateLocalConversation(simPhone, 'GREETING_PRODUCT', 'ACTIVE');
      return;
    }
    resetSimulatorState();
  };

  const resetSimulatorState = async () => {
    if (isMockMode) {
      setSimStep(1);
      setSimMessages([]);
      setLocalChatHistories(prev => ({
        ...prev,
        [simPhone]: []
      }));
      return;
    }
    await fetch(`http://localhost:8080/api/simulation/reset?phone=${encodeURIComponent(simPhone)}&brandId=${brand.id}`, {
      method: 'POST'
    });
    pollSimulatorMessages();
  };

  const pollSimulatorMessages = async () => {
    if (isMockMode) return;
    const res = await fetch(`http://localhost:8080/api/simulation/messages?phone=${encodeURIComponent(simPhone)}`);
    if (res.ok) {
      setSimMessages(await res.json());
    }
  };

  const sendSimulatorMessage = async (text) => {
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      phone: simPhone,
      sender: 'USER',
      messageType: 'TEXT',
      content: text,
      createdAt: new Date().toISOString()
    };
    
    setSimMessages(prev => [...prev, userMsg]);
    setSimInput('');
    setSimTyping(true);

    if (isMockMode) {
      // Save user message to history
      setLocalChatHistories(prev => {
        const history = prev[simPhone] || [];
        return {
          ...prev,
          [simPhone]: [...history, userMsg]
        };
      });

      // Load config from localStorage if present
      const savedConfig = localStorage.getItem('chatcart_flow_config');
      let activeConfig = flowConfig;
      if (savedConfig) {
        try {
          activeConfig = JSON.parse(savedConfig);
        } catch (e) {}
      }

      setTimeout(() => {
        setSimTyping(false);
        let nextStep = simStep;
        let replyContent = '';
        let replyType = 'TEXT';
        let replyProduct = null;
        let replyButtons = [];
        const lowerText = text.toLowerCase().trim();
        
        // Handle "reset" or "restart" Command
        if (lowerText === 'reset' || lowerText === 'restart') {
          setSimStep(1);
          const initialProduct = products.length > 0 ? products[0] : MOCK_PRODUCTS[0];
          setSimSelectedProduct(initialProduct);
          setSimColor('');
          setSimSize('');
          setSimDiscountValue(activeConfig.step3Discount || 10);

          const botMsg = {
            id: Date.now() + 1,
            phone: simPhone,
            sender: 'BOT',
            messageType: 'PRODUCT',
            product: initialProduct,
            content: activeConfig.step1Greeting.replace('[Product Name]', initialProduct.name),
            buttons: ["Yes, I want it 😍", "Surprise Discount 🎁", "Show other styles 🛍️"],
            createdAt: new Date().toISOString()
          };
          setSimMessages(prev => [...prev, botMsg]);
          return;
        }

        // Branching State Machine Flow
        if (simStep === 1) {
          const wantsToBuy = lowerText.includes('yes') || lowerText.includes('😍') || lowerText.includes('buy') || lowerText.includes('want');
          const wantsDiscount = lowerText.includes('surprise') || lowerText.includes('discount') || lowerText.includes('🎁') || lowerText.includes('i want it') || lowerText.includes('coupon');
          const showOther = lowerText.includes('other') || lowerText.includes('style') || lowerText.includes('catalog') || lowerText.includes('🛍️');

          if (wantsToBuy) {
            // Path 1: Direct Checkout
            nextStep = 5.1;
            replyContent = activeConfig.step5NamePrompt;
          } else if (wantsDiscount) {
            // Path 2: Surprise Discount Nudge
            nextStep = 2.1;
            replyContent = `🎁 *EXCLUSIVE DEALS CHAT* 🎁\n\nWould you like to unlock a special surprise discount for this purchase?`;
            replyButtons = ["Yes, surprise me! 🎉", "No, standard checkout 🚚"];
          } else if (showOther) {
            // Path 3: Catalogue Filtering - color select
            nextStep = 4.1;
            replyContent = `Excellent! Let's find your perfect style. First, select your preferred colour tag:`;
            replyButtons = ["Black 🖤", "White/Grey 🤍", "Navy/Blue 💙", "Any colour 🌈"];
          } else {
            replyContent = "Sorry, I didn't get that. Please select one of the quick replies or reply \"reset\" to restart:";
            replyButtons = ["Yes, I want it 😍", "Surprise Discount 🎁", "Show other styles 🛍️"];
          }
        } 
        else if (simStep === 2.1) {
          // Do you want discount?
          if (lowerText.includes('yes') || lowerText.includes('surprise') || lowerText.includes('🎉')) {
            nextStep = 2.2;
            setSimDiscountValue(20); // Set surprise 20% discount
            
            const originalPrice = simSelectedProduct ? simSelectedProduct.price : 1299;
            const finalPrice20 = Math.round(originalPrice * 0.8);
            
            replyContent = `🎁 *SURPRISE UNLOCKED!* 🎉\n\nI've automatically generated a special developer coupon for you: *CHART20* (20% Off!).\n\n• *Product:* ${simSelectedProduct.name}\n• *Original Price:* ~₹${originalPrice}~\n• *Surprise Price:* *₹${finalPrice20}* (Save ₹${originalPrice - finalPrice20}!)\n\nDo you want to checkout with this discount now?`;
            replyButtons = ["Yes, checkout now 🚚", "No, standard checkout 🛍️"];
          } else {
            // Proceed to standard checkout
            nextStep = 5.1;
            setSimDiscountValue(activeConfig.step3Discount || 10);
            replyContent = activeConfig.step5NamePrompt;
          }
        }
        else if (simStep === 2.2) {
          // Checkout with surprise discount confirmation
          if (lowerText.includes('yes') || lowerText.includes('checkout') || lowerText.includes('🚚')) {
            nextStep = 5.1;
            replyContent = activeConfig.step5NamePrompt;
          } else {
            nextStep = 1;
            replyType = 'PRODUCT';
            replyProduct = simSelectedProduct;
            replyContent = activeConfig.step1Greeting.replace('[Product Name]', simSelectedProduct.name);
            replyButtons = ["Yes, I want it 😍", "Surprise Discount 🎁", "Show other styles 🛍️"];
          }
        }
        else if (simStep === 4.1) {
          // Color Selection
          const selectedColor = text.replace(/[🖤🤍💙🌈]/g, '').trim();
          setSimColor(selectedColor);
          nextStep = 4.2;
          replyContent = `Got it, *${selectedColor}* looks great! Now, select your preferred size:`;
          replyButtons = ["Medium (M)", "Large (L)", "Extra Large (XL)", "XXL"];
        }
        else if (simStep === 4.2) {
          // Size Selection
          setSimSize(text);
          nextStep = 4.3;
          replyContent = `Perfect! Here are our top apparel picks matching your preferences in size *${text}* and color *${simColor}*. Tap one to select:`;
          replyType = 'CATALOGUE';
          replyButtons = ["Restart Search 🔄"];
        }
        else if (simStep === 4.3) {
          // Product Catalog Selection responses
          if (lowerText.includes('restart') || lowerText.includes('🔄')) {
            nextStep = 4.1;
            replyContent = `Let's restart the search. Select your preferred colour tag:`;
            replyButtons = ["Black 🖤", "White/Grey 🤍", "Navy/Blue 💙", "Any colour 🌈"];
          } else if (lowerText.includes('select')) {
            const prodName = text.replace(/select/i, '').trim().toLowerCase();
            const matched = products.find(p => p.name.toLowerCase().includes(prodName)) || products[0];
            setSimSelectedProduct(matched);
            
            // Move to step 3 (Smart Coupon Nudge)
            nextStep = 3;
            const originalPrice = matched.price;
            const disc = Math.round(originalPrice * (simDiscountValue / 100));
            const finalPrice = originalPrice - disc;

            replyType = 'PRODUCT';
            replyProduct = matched;
            replyContent = activeConfig.step3NudgeMsg
              .replace('[Discount]', simDiscountValue)
              .replace('[DiscountedPrice]', finalPrice)
              .replace('[OriginalPrice]', originalPrice);
            
            replyButtons = ["Confirm & Buy 🚚", "Restart Search 🔄"];
          } else {
            replyContent = `Please select one of the products in the grid or click to restart search:`;
            replyType = 'CATALOGUE';
            replyButtons = ["Restart Search 🔄"];
          }
        }
        else if (simStep === 3) {
          // Smart Nudge responses
          const confirmBuy = lowerText.includes('buy') || lowerText.includes('confirm') || lowerText.includes('truck') || lowerText.includes('delivery') || lowerText.includes('yes');
          
          if (confirmBuy) {
            nextStep = 5.1;
            replyContent = activeConfig.step5NamePrompt;
          } else {
            nextStep = 4.1;
            replyContent = `Let's filter styles again. Select your preferred colour tag:`;
            replyButtons = ["Black 🖤", "White/Grey 🤍", "Navy/Blue 💙", "Any colour 🌈"];
          }
        }
        else if (simStep === 5.1) {
          // Captured name
          setSimName(text);
          nextStep = 5.3; // Skip phone number capture step
          replyContent = activeConfig.step5AddressPrompt;
        }
        else if (simStep === 5.3) {
          // Captured Address
          setSimAddress(text);
          nextStep = 6;
          
          const originalPrice = simSelectedProduct ? simSelectedProduct.price : 1299;
          const disc = Math.round(originalPrice * (simDiscountValue / 100));
          const finalPrice = originalPrice - disc;

          replyContent = `📦 *ORDER PREVIEW SUMMARY:*\n\n` +
            `• *Product:* ${simSelectedProduct.name}\n` +
            `• *Original Price:* ₹${originalPrice}\n` +
            `• *Coupon Applied:* -₹${disc} (${simDiscountValue}% discount)\n` +
            `• *Final Amount:* *₹${finalPrice}*\n\n` +
            `• *Deliver to:* ${simName}\n` +
            `• *WhatsApp Phone:* ${simPhone}\n` +
            `• *Address:* ${text}\n\n` +
            `${activeConfig.step6ConfirmMsg}`;
          replyButtons = ["Cash on Delivery (COD) 💵", "Pay with GPay / UPI 💳"];
        }
        else if (simStep === 6) {
          // Payment select
          const originalPrice = simSelectedProduct ? simSelectedProduct.price : 1299;
          const disc = Math.round(originalPrice * (simDiscountValue / 100));
          const finalPrice = originalPrice - disc;

          if (lowerText.includes('cash') || lowerText.includes('cod') || lowerText.includes('delivery')) {
            nextStep = 10;
            replyContent = activeConfig.step7SuccessMsg
              .replace('[Name]', simName)
              .replace('[Product]', simSelectedProduct.name)
              .replace('[Amount]', finalPrice)
              .replace('[Discount]', simDiscountValue)
              .replace('[Address]', simAddress);
            
            const newOrder = {
              id: Date.now(),
              customerName: simName,
              phone: simPhone,
              address: simAddress,
              productName: simSelectedProduct.name,
              amount: finalPrice,
              discountApplied: disc,
              paymentMethod: 'COD',
              status: 'CONFIRMED',
              createdAt: new Date().toISOString()
            };
            const updatedOrders = [newOrder, ...orders];
            setOrders(updatedOrders);
            recalculateMetrics(updatedOrders);
            updateLocalConversation(simPhone, 'GREETING_PRODUCT', 'COMPLETED');
          } else {
            nextStep = 6.5;
            replyContent = `💳 *Secure UPI Payment Link Generated!*\n\nClick the link below to verify and pay with Google Pay or any UPI app:\n\n🔗 _http://localhost:8080/api/simulation/payment?orderId=1025&amount=${finalPrice}_\n\nOnce paid, click the button below to confirm payment success.`;
            replyButtons = ["[Confirm Payment Success]"];
            
            const newOrder = {
              id: 1025,
              customerName: simName,
              phone: simPhone,
              address: simAddress,
              productName: simSelectedProduct.name,
              amount: finalPrice,
              discountApplied: disc,
              paymentMethod: 'UPI',
              status: 'PENDING',
              createdAt: new Date().toISOString()
            };
            const updatedOrders = [newOrder, ...orders];
            setOrders(updatedOrders);
            recalculateMetrics(updatedOrders);
            updateLocalConversation(simPhone, 'PAYMENT_SELECTION', 'ACTIVE');
          }
        }
        else if (simStep === 6.5) {
          nextStep = 10;
          const originalPrice = simSelectedProduct ? simSelectedProduct.price : 1299;
          const disc = Math.round(originalPrice * (simDiscountValue / 100));
          const finalPrice = originalPrice - disc;

          replyContent = `✅ *Payment Success Verified!*\n\nThank you, *${simName}*! Your payment of *₹${finalPrice}* has been successfully received.\n\nYour order has been confirmed and shipping to: *${simAddress}*!`;
          
          const updatedOrders = orders.map(o => o.id === 1025 ? { ...o, status: 'CONFIRMED' } : o);
          setOrders(updatedOrders);
          recalculateMetrics(updatedOrders);
          updateLocalConversation(simPhone, 'GREETING_PRODUCT', 'COMPLETED');
        }
        else if (simStep === 10) {
          nextStep = 1;
          const initialProduct = products.length > 0 ? products[0] : MOCK_PRODUCTS[0];
          setSimSelectedProduct(initialProduct);
          setSimColor('');
          setSimSize('');
          setSimDiscountValue(activeConfig.step3Discount || 10);
          
          replyType = 'PRODUCT';
          replyProduct = initialProduct;
          replyContent = activeConfig.step1Greeting.replace('[Product Name]', initialProduct.name);
          replyButtons = ["Yes, I want it 😍", "Surprise Discount 🎁", "Show other styles 🛍️"];
        }

        setSimStep(nextStep);
        
        const botMsg = {
          id: Date.now() + 1,
          phone: simPhone,
          sender: 'BOT',
          messageType: replyType,
          product: replyProduct || simSelectedProduct,
          content: replyContent,
          buttons: replyButtons,
          createdAt: new Date().toISOString()
        };
        
        setSimMessages(prev => [...prev, botMsg]);
        setLocalChatHistories(prev => {
          const history = prev[simPhone] || [];
          return {
            ...prev,
            [simPhone]: [...history, botMsg]
          };
        });
        
        let stepLabel = 'GREETING_PRODUCT';
        if (nextStep >= 5.1 && nextStep <= 5.3) stepLabel = 'SMART_NUDGE';
        if (nextStep === 6 || nextStep === 6.5) stepLabel = 'PAYMENT_SELECTION';
        if (nextStep === 10) stepLabel = 'COMPLETED';

        updateLocalConversation(simPhone, stepLabel, nextStep === 10 ? 'COMPLETED' : 'ACTIVE');

      }, 1000);
      return;
    }

    await fetch('http://localhost:8080/api/simulation/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: simPhone,
        text: text,
        brandId: brand.id
      })
    });

    pollSimulatorMessages();
    setTimeout(() => setSimTyping(false), 800);
  };

  const handleLogout = () => {
    localStorage.removeItem('chatcart_token');
    localStorage.removeItem('chatcart_brand');
    navigate('/login');
  };

  const formatINR = (val) => {
    return '₹' + Number(val).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Sidebar Nav */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-4 shrink-0 shadow-xl">
        <div className="space-y-8">
          {/* Brand Header */}
          <div className="flex items-center space-x-3 px-2 py-3 border-b border-slate-800">
            <img src={brand.logoUrl} alt="Logo" className="h-9 w-9 rounded-xl object-cover border border-slate-700 bg-white" />
            <div>
              <h1 className="font-extrabold text-sm text-white truncate max-w-[130px]">{brand.storeName}</h1>
              <span className="text-[10px] text-emerald-400 flex items-center font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                Active Bot
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'catalogue', label: 'Catalogue', icon: ShoppingBag },
              { id: 'orders', label: 'Orders', icon: ShoppingCart },
              { id: 'conversations', label: 'Conversations', icon: MessageSquare },
              { id: 'flow', label: 'Bot Flow Editor', icon: GitFork },
              { id: 'simulator', label: 'Live Chat Test', icon: Zap },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all ${
                    activeTab === item.id 
                      ? 'bg-whatsapp-primary text-white shadow-lg shadow-whatsapp-primary/10' 
                      : 'hover:bg-slate-800 hover:text-white text-slate-400'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout */}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-bold text-slate-400 hover:bg-red-950/40 hover:text-red-400 transition-all border-t border-slate-800 pt-4"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-extrabold text-slate-800 capitalize tracking-tight">{activeTab.replace('-', ' ')}</h2>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={fetchData} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors">
              <RefreshCw className="h-4.5 w-4.5" />
            </button>
            <div className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center">
              Webhook: <span className="font-mono text-whatsapp-dark font-bold ml-1">{brand.webhookToken}</span>
            </div>
          </div>
        </header>

        {/* Tab Subviews */}
        <div className="flex-1 overflow-y-auto p-8 min-h-0">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* KPIs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: 'Total Conversations', val: metrics.totalConversations, suffix: '', desc: 'WhatsApp sessions started', color: 'border-l-blue-500' },
                  { label: 'Conversion Rate', val: metrics.conversionRate, suffix: '%', desc: 'Flows completed with orders', color: 'border-l-emerald-500' },
                  { label: 'Revenue This Month', val: formatINR(metrics.revenue), suffix: '', desc: 'Total confirmed order sum', color: 'border-l-whatsapp-primary' },
                  { label: 'Avg Order Value', val: formatINR(metrics.avgOrderValue), suffix: '', desc: 'Total Revenue / total orders', color: 'border-l-yellow-500' },
                ].map((kpi, idx) => (
                  <div key={idx} className={`bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm border-l-4 ${kpi.color} space-y-2`}>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</div>
                    <div className="text-2xl font-black text-slate-900">{kpi.val}{kpi.suffix}</div>
                    <div className="text-[11px] text-slate-500 font-medium">{kpi.desc}</div>
                  </div>
                ))}
              </div>

              {/* Line Chart */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-slate-800">Conversations vs Conversions</h3>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-md">Last 7 Days</span>
                </div>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} fontWeight={600} />
                      <YAxis stroke="#94a3b8" fontSize={11} fontWeight={600} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} />
                      <Line type="monotone" dataKey="conversations" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} name="Sessions" />
                      <Line type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={3} activeDot={{ r: 6 }} name="Orders" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Orders table */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4 p-6">
                <h3 className="font-extrabold text-slate-800">Recent Conversational Orders</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold">
                        <th className="pb-3 pl-2">Order ID</th>
                        <th className="pb-3">Customer</th>
                        <th className="pb-3">Product</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Payment</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                      {orders.slice(0, 5).map(o => (
                        <tr key={o.id} className="hover:bg-slate-50/50">
                          <td className="py-3.5 pl-2 font-mono text-xs">#{o.id}</td>
                          <td className="py-3.5">
                            <div className="font-bold text-slate-900">{o.customerName || 'Anonymous'}</div>
                            <div className="text-xs text-slate-400">{o.phone}</div>
                          </td>
                          <td className="py-3.5">{o.productName}</td>
                          <td className="py-3.5 font-bold text-slate-900">{formatINR(o.amount)}</td>
                          <td className="py-3.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              o.paymentMethod === 'UPI' ? 'bg-blue-50 text-blue-600' :
                              o.paymentMethod === 'COD' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {o.paymentMethod || 'PENDING'}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                              o.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700' :
                              o.status === 'SHIPPED' ? 'bg-indigo-50 text-indigo-700' :
                              o.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-700' :
                              o.status === 'PENDING' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CATALOGUE */}
          {activeTab === 'catalogue' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-slate-800 text-lg">Manage Product Inventory</h3>
                <button 
                  onClick={() => {
                    setEditingProduct(null);
                    setProductForm({ name: '', price: '', category: 'Shirts', colours: 'Black,White,Grey', imageUrl: '' });
                    setProductImageFile(null);
                    setShowProductModal(true);
                  }}
                  className="bg-whatsapp-primary hover:bg-whatsapp-dark text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow-md flex items-center space-x-1.5"
                >
                  <Plus className="h-4.5 w-4.5" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Catalogue Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {products.map(p => (
                  <div key={p.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden hover:shadow-lg transition-all group flex flex-col justify-between">
                    <div className="relative h-48 bg-slate-100 overflow-hidden">
                      <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-all duration-300" />
                      <div className="absolute top-3 right-3 flex space-x-1">
                        <button onClick={() => handleEditProduct(p)} className="p-2 bg-white/95 hover:bg-white text-slate-700 rounded-lg shadow-md transition-all">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="p-2 bg-white/95 hover:bg-red-50 text-red-600 rounded-lg shadow-md transition-all">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="absolute bottom-3 left-3 bg-slate-900/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                        {p.category}
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h4 className="font-extrabold text-slate-900 truncate">{p.name}</h4>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {p.colours.split(',').map((c, i) => (
                            <span key={i} className="text-[10px] bg-slate-100 border border-slate-200 text-slate-500 font-bold px-2 py-0.5 rounded-md">
                              {c.trim()}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                        <span className="text-lg font-black text-slate-900">{formatINR(p.price)}</span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${p.inStock ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                          {p.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 space-y-6">
              
              {/* Filters Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <h3 className="font-extrabold text-slate-800 text-lg">Orders Ledger</h3>
                <div className="flex items-center space-x-3">
                  {/* Status Filter */}
                  <div className="flex items-center space-x-1 text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
                    <select 
                      value={orderStatusFilter} 
                      onChange={(e) => { setOrderStatusFilter(e.target.value); setTimeout(fetchOrders, 50); }}
                      className="bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-whatsapp-primary"
                    >
                      <option value="ALL">All Status</option>
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  {/* Payment Method Filter */}
                  <div className="flex items-center space-x-1 text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-wider mr-1">Payment:</span>
                    <select 
                      value={orderPayFilter} 
                      onChange={(e) => { setOrderPayFilter(e.target.value); setTimeout(fetchOrders, 50); }}
                      className="bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-whatsapp-primary"
                    >
                      <option value="ALL">All Payments</option>
                      <option value="COD">Cash on Delivery</option>
                      <option value="UPI">UPI Payment</option>
                      <option value="BNPL">Pay Later</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold">
                      <th className="pb-3 pl-2">Order ID</th>
                      <th className="pb-3">Customer Profile</th>
                      <th className="pb-3">Address Details</th>
                      <th className="pb-3">Product Name</th>
                      <th className="pb-3">Final Amount</th>
                      <th className="pb-3">Payment</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right pr-2">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {orders.map(o => (
                      <tr key={o.id} className="hover:bg-slate-50/50">
                        <td className="py-4 pl-2 font-mono text-xs">#{o.id}</td>
                        <td className="py-4">
                          <div className="font-bold text-slate-900">{o.customerName || 'Anonymous'}</div>
                          <div className="text-xs text-slate-400">{o.phone}</div>
                        </td>
                        <td className="py-4 max-w-[200px] truncate text-slate-500" title={o.address}>
                          {o.address || 'No Address Captured'}
                        </td>
                        <td className="py-4">{o.productName}</td>
                        <td className="py-4">
                          <div className="font-bold text-slate-900">{formatINR(o.amount)}</div>
                          {o.discountApplied > 0 && <div className="text-[10px] text-red-500">Disc: -{formatINR(o.discountApplied)}</div>}
                        </td>
                        <td className="py-4">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            o.paymentMethod === 'UPI' ? 'bg-blue-50 text-blue-600' :
                            o.paymentMethod === 'COD' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {o.paymentMethod || 'PENDING'}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            o.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700' :
                            o.status === 'SHIPPED' ? 'bg-indigo-50 text-indigo-700' :
                            o.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-700' :
                            o.status === 'PENDING' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-4 text-right pr-2">
                          <select 
                            value={o.status}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg p-1.5 focus:outline-none focus:border-whatsapp-primary"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirm</option>
                            <option value="SHIPPED">Ship</option>
                            <option value="DELIVERED">Deliver</option>
                            <option value="CANCELLED">Cancel</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: CONVERSATIONS */}
          {activeTab === 'conversations' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden flex h-[620px]">
              {/* Chat Threads Sidebar */}
              <div className="w-80 border-r border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 h-4.5 w-4.5" />
                    <input
                      type="text"
                      placeholder="Search phone number..."
                      className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-2 text-xs focus:outline-none focus:border-whatsapp-primary"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                  {conversations.map(chat => (
                    <div 
                      key={chat.phone} 
                      onClick={() => {
                        setSelectedChatPhone(chat.phone);
                        fetchChatHistory(chat.phone);
                      }}
                      className={`p-4 cursor-pointer hover:bg-slate-50 flex justify-between items-center transition-colors ${selectedChatPhone === chat.phone ? 'bg-emerald-50/40 border-l-4 border-whatsapp-primary' : ''}`}
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 text-sm">{chat.phone}</div>
                        <div className="text-xs text-slate-500 truncate mt-0.5">
                          Step: <span className="font-mono bg-slate-100 border border-slate-200 px-1 rounded text-[10px] text-slate-600">{chat.currentStep}</span>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${chat.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                        {chat.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Thread Panel */}
              <div className="flex-1 flex flex-col bg-whatsapp-bg" style={{ backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`, backgroundBlendMode: 'overlay' }}>
                {selectedChatPhone ? (
                  <>
                    {/* Chat Header */}
                    <div className="bg-whatsapp-dark text-white p-4 flex items-center justify-between shadow-md z-10 shrink-0">
                      <div className="flex items-center space-x-3">
                        <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-800 font-extrabold text-sm">
                          {selectedChatPhone.substring(3, 5)}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm leading-tight">{selectedChatPhone}</h4>
                          <p className="text-[10px] text-emerald-100">Live conversation log</p>
                        </div>
                      </div>
                    </div>

                    {/* Chat Bubbles */}
                    <div className="flex-1 p-6 overflow-y-auto space-y-4">
                      {chatTranscript.map(msg => (
                        <div key={msg.id} className={`flex flex-col w-full ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}>
                          <div className={`relative max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${msg.sender === 'USER' ? 'bg-whatsapp-bubble text-slate-800 rounded-tr-none bubble-tail bubble-tail-user' : 'bg-white text-slate-800 rounded-tl-none bubble-tail bubble-tail-bot'}`}>
                            
                            {/* Structured interactive items viewer */}
                            {msg.messageType === 'PRODUCT' && (
                              <div className="mb-2 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden shadow-sm max-w-[200px]">
                                <div className="p-2 bg-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b">WhatsApp Product Card</div>
                                <div className="p-2.5">
                                  <h4 className="font-bold text-xs text-slate-800">Apparel selection</h4>
                                </div>
                              </div>
                            )}

                            <div className="whitespace-pre-line leading-relaxed">{msg.content}</div>
                            <div className="text-[8px] text-slate-400 text-right mt-1.5">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-white/70 backdrop-blur-sm p-8 space-y-2">
                    <MessageSquare className="h-12 w-12 text-slate-300" />
                    <h4 className="font-bold text-slate-800">No Chat Selected</h4>
                    <p className="text-xs text-slate-500">Pick a phone number thread from the sidebar to inspect the bot logs.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: BOT FLOW EDITOR */}
          {activeTab === 'flow' && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[600px]">
                
                {/* Visual Flow diagram */}
                <div className="lg:col-span-8 space-y-6 flex flex-col justify-start">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-lg">WhatsApp Bot Architecture Flow</h3>
                      <p className="text-xs text-slate-500 mt-1">A step-by-step visual blueprint of ChatCart's 7-step customer checkout conversion machine.</p>
                    </div>
                    <span className="text-xs bg-whatsapp-primary/10 text-whatsapp-dark px-3 py-1 rounded-full font-bold">
                      7 Steps Auto-Active
                    </span>
                  </div>
                  
                  {/* Flow Canvas Container */}
                  <div className="relative flex flex-col items-center py-6 bg-slate-100/60 rounded-3xl border border-slate-200 overflow-y-auto max-h-[620px] scrollbar-thin">
                    <div className="w-full max-w-lg space-y-8 relative px-4">
                      
                      {/* Connection track SVG line drawn vertically behind cards */}
                      <div className="absolute left-[38px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-emerald-500 via-indigo-500 to-teal-500 -z-0"></div>

                      {[
                        { id: 1, name: 'Step 1: Greeting & Ad Hook', desc: 'Asks if customer likes ad product.', icon: MessageSquare, color: 'bg-emerald-500', border: 'border-emerald-200', text: 'text-emerald-700' },
                        { id: 2, name: 'Step 2: Product Specifications', desc: 'Displays sizing guidelines and specs.', icon: ShoppingBag, color: 'bg-blue-500', border: 'border-blue-200', text: 'text-blue-700' },
                        { id: 3, name: 'Step 3: Smart Coupon Nudge', desc: 'Offers discounts to recover cart drop-offs.', icon: Tag, color: 'bg-amber-500', border: 'border-amber-200', text: 'text-amber-700' },
                        { id: 4, name: 'Step 4: Browse Collections Catalog', desc: 'Interactive gallery matching shopper filters.', icon: LayoutDashboard, color: 'bg-indigo-500', border: 'border-indigo-200', text: 'text-indigo-700' },
                        { id: 5, name: 'Step 5: Conversational Capture', desc: 'Queries full name, phone number, and address.', icon: MapPin, color: 'bg-rose-500', border: 'border-rose-200', text: 'text-rose-700' },
                        { id: 6, name: 'Step 6: Payment Method Options', desc: 'COD or secure Razorpay UPI links in-chat.', icon: CreditCard, color: 'bg-purple-500', border: 'border-purple-200', text: 'text-purple-700' },
                        { id: 7, name: 'Step 7: Order Confirmed', desc: 'Logs order details to CRM & confirms checkout.', icon: CheckCircle, color: 'bg-teal-500', border: 'border-teal-200', text: 'text-teal-700' }
                      ].map((node) => {
                        const Icon = node.icon;
                        const isSelected = selectedFlowNode === node.id;
                        return (
                          <div 
                            key={node.id}
                            onClick={() => setSelectedFlowNode(node.id)}
                            className={`flex items-start space-x-6 relative z-10 transition-all cursor-pointer group`}
                          >
                            {/* Node icon bubble wrapper */}
                            <div className={`h-11 w-11 rounded-full flex items-center justify-center shrink-0 shadow-md transition-all ${
                              isSelected 
                                ? `${node.color} ring-4 ring-offset-2 ring-whatsapp-primary text-white scale-110 animate-pulse` 
                                : 'bg-white border-2 border-slate-200 text-slate-500 group-hover:border-whatsapp-primary group-hover:text-whatsapp-primary'
                            }`}>
                              <Icon className="h-5 w-5" />
                            </div>

                            {/* Node details card content */}
                            <div className={`flex-1 p-4 rounded-2xl border transition-all ${
                              isSelected 
                                ? 'bg-white border-whatsapp-primary shadow-xl shadow-whatsapp-primary/5 translate-x-2' 
                                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                            }`}>
                              <div className="flex justify-between items-center">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                  isSelected ? `${node.color} text-white` : 'bg-slate-100 text-slate-500'
                                }`}>
                                  Step {node.id}
                                </span>
                                <ChevronRight className={`h-4.5 w-4.5 transition-transform ${
                                  isSelected ? 'text-whatsapp-primary translate-x-1' : 'text-slate-300 group-hover:text-slate-400'
                                }`} />
                              </div>
                              <h4 className="font-extrabold text-slate-800 text-sm mt-1.5">{node.name}</h4>
                              <p className="text-xs text-slate-500 mt-1">{node.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Node config properties pane */}
                <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-lg flex flex-col justify-between space-y-6">
                  <div className="space-y-6 overflow-y-auto max-h-[500px] pr-1">
                    <div className="border-b border-slate-100 pb-3.5">
                      <h4 className="font-extrabold text-slate-800 flex items-center space-x-1.5">
                        <Settings className="h-4.5 w-4.5 text-whatsapp-primary" />
                        <span>Node Properties</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">Configure automated replies & templates for step {selectedFlowNode}</p>
                    </div>

                    {selectedFlowNode === 1 && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Greeting Template</label>
                          <textarea 
                            value={flowConfig.step1Greeting}
                            onChange={(e) => setFlowConfig({...flowConfig, step1Greeting: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-700 focus:outline-none focus:border-whatsapp-primary h-24 resize-none leading-relaxed"
                          />
                          <span className="text-[10px] text-slate-400 mt-1 block">Use `[Product Name]` as dynamic variable placeholder.</span>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Interactive Action Buttons</label>
                          <input 
                            type="text"
                            value={flowConfig.step1Buttons}
                            onChange={(e) => setFlowConfig({...flowConfig, step1Buttons: e.target.value})}
                            placeholder="Comma separated buttons"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-whatsapp-primary"
                          />
                          <span className="text-[10px] text-slate-400 mt-1 block">Provide up to 3 options separated by commas.</span>
                        </div>
                      </div>
                    )}

                    {selectedFlowNode === 2 && (
                      <div className="space-y-4">
                        <div className="bg-slate-50 border border-slate-200 p-4.5 rounded-2xl text-xs text-slate-500 space-y-3">
                          <p className="font-bold text-slate-700">Display Guidelines:</p>
                          <p className="leading-relaxed">This step renders the specific specs, measurements, and colours configuration dynamically fetched from the brand catalogue inventory databases.</p>
                          <div className="space-y-1 pt-1.5 border-t">
                            <label className="flex items-center space-x-2 font-semibold text-slate-700">
                              <input type="checkbox" defaultChecked className="rounded border-slate-300 text-whatsapp-primary focus:ring-whatsapp-primary" />
                              <span>Show full inventory pictures</span>
                            </label>
                            <label className="flex items-center space-x-2 font-semibold text-slate-700 mt-1">
                              <input type="checkbox" defaultChecked className="rounded border-slate-300 text-whatsapp-primary focus:ring-whatsapp-primary" />
                              <span>Enable Size Selector quick replies</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedFlowNode === 3 && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Coupon Value Discount (%)</label>
                          <div className="relative">
                            <input 
                              type="number" 
                              value={flowConfig.step3Discount}
                              onChange={(e) => setFlowConfig({...flowConfig, step3Discount: parseInt(e.target.value) || 10})}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-whatsapp-primary" 
                            />
                            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 font-bold text-slate-400 text-xs">%</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Coupon Nudge Copy</label>
                          <textarea 
                            value={flowConfig.step3NudgeMsg}
                            onChange={(e) => setFlowConfig({...flowConfig, step3NudgeMsg: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-700 focus:outline-none focus:border-whatsapp-primary h-28 resize-none leading-relaxed"
                          />
                          <span className="text-[10px] text-slate-400 mt-1 block">Variables: `[Discount]`, `[DiscountedPrice]`, `[OriginalPrice]`</span>
                        </div>
                      </div>
                    )}

                    {selectedFlowNode === 4 && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Filter Categories</label>
                          <input 
                            type="text"
                            value={flowConfig.step4Categories}
                            onChange={(e) => setFlowConfig({...flowConfig, step4Categories: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-whatsapp-primary"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Budget Buckets</label>
                          <input 
                            type="text"
                            value={flowConfig.step4Budgets}
                            onChange={(e) => setFlowConfig({...flowConfig, step4Budgets: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-whatsapp-primary"
                          />
                        </div>
                      </div>
                    )}

                    {selectedFlowNode === 5 && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Full Name Question</label>
                          <input 
                            type="text"
                            value={flowConfig.step5NamePrompt}
                            onChange={(e) => setFlowConfig({...flowConfig, step5NamePrompt: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-whatsapp-primary"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Mobile Number Question</label>
                          <input 
                            type="text"
                            value={flowConfig.step5PhonePrompt}
                            onChange={(e) => setFlowConfig({...flowConfig, step5PhonePrompt: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-whatsapp-primary"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Delivery Address Question</label>
                          <input 
                            type="text"
                            value={flowConfig.step5AddressPrompt}
                            onChange={(e) => setFlowConfig({...flowConfig, step5AddressPrompt: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-whatsapp-primary"
                          />
                        </div>
                      </div>
                    )}

                    {selectedFlowNode === 6 && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Payment Method Prompt</label>
                          <textarea 
                            value={flowConfig.step6ConfirmMsg}
                            onChange={(e) => setFlowConfig({...flowConfig, step6ConfirmMsg: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-700 focus:outline-none focus:border-whatsapp-primary h-20 resize-none leading-relaxed"
                          />
                        </div>
                      </div>
                    )}

                    {selectedFlowNode === 7 && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Success Order Confirmed Copy</label>
                          <textarea 
                            value={flowConfig.step7SuccessMsg}
                            onChange={(e) => setFlowConfig({...flowConfig, step7SuccessMsg: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-700 focus:outline-none focus:border-whatsapp-primary h-36 resize-none leading-relaxed"
                          />
                          <span className="text-[10px] text-slate-400 mt-1 block">Variables: `[Name]`, `[Product]`, `[Amount]`, `[Discount]`, `[Address]`</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => {
                      localStorage.setItem('chatcart_flow_config', JSON.stringify(flowConfig));
                      alert('Bot flow changes deployed & synchronized with simulation playground!');
                    }}
                    className="w-full bg-whatsapp-primary hover:bg-whatsapp-dark text-white font-extrabold py-3.5 px-4 rounded-xl text-center text-xs shadow-lg shadow-whatsapp-primary/10 transition-all cursor-pointer active:scale-98"
                  >
                    Deploy Flow Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: WHATSAPP BOT SIMULATOR PLAYGROUND */}
          {activeTab === 'simulator' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Simulator settings / phone register */}
              <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-6">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-lg">WhatsApp Simulator</h3>
                  <p className="text-xs text-slate-500 mt-1">Simulate real-time user experiences for your automated bot flow.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Simulation Phone (WaId)</label>
                    <input 
                      type="tel"
                      value={simPhone}
                      onChange={(e) => setSimPhone(e.target.value)}
                      placeholder="+919876543299"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-whatsapp-primary"
                    />
                  </div>

                  <button 
                    onClick={startSimulator}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl text-center text-sm shadow-lg transition-all"
                  >
                    Start Chat Session
                  </button>
                  
                  {simActive && (
                    <button 
                      onClick={resetSimulatorState}
                      className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 px-4 rounded-xl text-center text-sm transition-all"
                    >
                      Clear/Reset Chat Log
                    </button>
                  )}
                </div>
                
                <div className="text-xs text-slate-400 bg-slate-50 p-4 rounded-2xl space-y-2 border">
                  <h5 className="font-bold text-slate-600 flex items-center"><HelpCircle className="h-3.5 w-3.5 mr-1" /> How to test:</h5>
                  <p>1. Tap &quot;Start Chat Session&quot;.</p>
                  <p>2. The bot starts step 1 by greeting you with the product.</p>
                  <p>3. Reply using the bubble quick options or type free text inputs to complete details, check the payment redirect, or query filters!</p>
                </div>
              </div>

              {/* Chat Simulator Pane */}
              <div className="lg:col-span-8 flex justify-center w-full">
                {simActive ? (
                  <div className="w-[360px] h-[580px] bg-slate-100 rounded-[40px] border-[12px] border-slate-900 shadow-2xl overflow-hidden relative flex flex-col">
                    {/* Top status bar notch */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-20 flex items-center justify-center">
                      <div className="w-12 h-1.5 bg-slate-800 rounded-full mb-1"></div>
                    </div>

                    {/* Chat Header */}
                    <div className="bg-whatsapp-dark text-white px-4 pt-8 pb-3 flex items-center justify-between shadow-md z-10 shrink-0">
                      <div className="flex items-center space-x-2.5">
                        <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-800 font-bold text-xs overflow-hidden">
                          <img src={brand.logoUrl} alt="logo" className="object-cover h-full w-full" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm leading-tight">{brand.storeName} Bot</h3>
                          <p className="text-[10px] text-emerald-100 flex items-center"><Zap className="h-2 w-2 mr-0.5 fill-current" /> Active simulation</p>
                        </div>
                      </div>
                    </div>

                    {/* Chat Feed */}
                    <div className="flex-1 bg-whatsapp-bg p-4 overflow-y-auto space-y-4" style={{ backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`, backgroundBlendMode: 'overlay' }}>
                      {simMessages.map((msg, idx) => (
                        <div key={idx} className={`flex flex-col w-full ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}>
                          
                          {/* Chat bubble content */}
                          <div className={`relative max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                            msg.sender === 'USER' 
                              ? 'bg-whatsapp-bubble text-slate-800 rounded-tr-none bubble-tail bubble-tail-user' 
                              : 'bg-white text-slate-800 rounded-tl-none bubble-tail bubble-tail-bot'
                          }`}>
                            
                            {/* Parse custom PRODUCT structures */}
                            {msg.messageType === 'PRODUCT' && (
                              <div className="mb-2 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-xs max-w-[220px]">
                                <img 
                                  src={(msg.product || simSelectedProduct || MOCK_PRODUCTS[0]).imageUrl} 
                                  alt={(msg.product || simSelectedProduct || MOCK_PRODUCTS[0]).name} 
                                  className="w-full h-32 object-cover" 
                                />
                                <div className="p-3 space-y-1 bg-white">
                                  <h4 className="font-bold text-xs text-slate-800 line-clamp-2">
                                    {(msg.product || simSelectedProduct || MOCK_PRODUCTS[0]).name}
                                  </h4>
                                  <div className="flex items-center justify-between text-xs mt-1.5 border-t pt-1.5">
                                    <span className="font-extrabold text-slate-900">₹{(msg.product || simSelectedProduct || MOCK_PRODUCTS[0]).price}</span>
                                    <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                                      {(msg.product || simSelectedProduct || MOCK_PRODUCTS[0]).category}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Parse dynamic CATALOGUE grids */}
                            {msg.messageType === 'CATALOGUE' && (
                              <div className="mb-2 grid grid-cols-2 gap-2 max-w-[260px]">
                                {products.slice(0, 4).map(p => (
                                  <div key={p.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:border-whatsapp-primary transition-all flex flex-col justify-between">
                                    <img src={p.imageUrl} alt={p.name} className="w-full h-16 object-cover" />
                                    <div className="p-2 space-y-1 flex-1 flex flex-col justify-between">
                                      <div>
                                        <h5 className="font-bold text-[9px] text-slate-800 line-clamp-1">{p.name}</h5>
                                        <p className="font-extrabold text-[9px] text-slate-900">₹{p.price}</p>
                                      </div>
                                      <button
                                        onClick={() => sendSimulatorMessage(`Select ${p.name}`)}
                                        className="w-full bg-whatsapp-primary hover:bg-whatsapp-dark text-white font-extrabold text-[8px] py-1 px-1.5 rounded-lg text-center mt-1 transition-all cursor-pointer active:scale-95"
                                      >
                                        Select
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="whitespace-pre-line leading-relaxed">{msg.content}</div>
                            <div className="text-[8px] text-slate-400 text-right mt-1">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>

                          {/* Quick replies block */}
                          {msg.sender === 'BOT' && (msg.buttons || (msg.content && msg.content.includes('Buttons:'))) && (
                            <div className="mt-2 flex flex-col space-y-1.5 w-full max-w-[85%] self-start pl-1">
                              {msg.buttons ? (
                                msg.buttons.map((btn, i) => (
                                  <button
                                    key={i}
                                    onClick={() => sendSimulatorMessage(btn)}
                                    className="bg-white hover:bg-slate-50 text-whatsapp-dark font-extrabold text-xs py-2 px-3 border border-slate-200 rounded-xl text-center shadow-sm active:scale-95 transition-all cursor-pointer"
                                  >
                                    {btn}
                                  </button>
                                ))
                              ) : (
                                msg.content.split('Buttons:')[1].split(',').map((btn, i) => (
                                  <button
                                    key={i}
                                    onClick={() => sendSimulatorMessage(btn.trim())}
                                    className="bg-white hover:bg-slate-50 text-whatsapp-dark font-extrabold text-xs py-2 px-3 border border-slate-200 rounded-xl text-center shadow-sm active:scale-95 transition-all cursor-pointer"
                                  >
                                    {btn.trim()}
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      ))}

                      {simTyping && (
                        <div className="flex items-center space-x-1 bg-white px-4 py-2.5 rounded-2xl rounded-tl-none max-w-[80px] shadow-sm">
                          <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                          <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                        </div>
                      )}
                    </div>

                    {/* Input Footer */}
                    <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center space-x-2 shrink-0">
                      <input
                        type="text"
                        placeholder="Type message..."
                        value={simInput}
                        onChange={(e) => setSimInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') sendSimulatorMessage(simInput);
                        }}
                        className="flex-1 bg-white border border-slate-200 rounded-full px-4 py-2 text-xs focus:outline-none focus:border-whatsapp-primary"
                      />
                      <button 
                        onClick={() => sendSimulatorMessage(simInput)}
                        className="h-8 w-8 bg-whatsapp-primary hover:bg-whatsapp-dark text-white rounded-full flex items-center justify-center shadow-md"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-96 w-full max-w-md bg-white border border-slate-200 rounded-3xl flex flex-col items-center justify-center p-8 text-center space-y-4">
                    <Zap className="h-12 w-12 text-slate-300" />
                    <div>
                      <h4 className="font-extrabold text-slate-800">Launch Test Playground</h4>
                      <p className="text-xs text-slate-400 mt-1">Register a virtual shopper number in the sidebar and click Start to play with the bot flow.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-8 max-w-2xl">
              <h3 className="font-extrabold text-slate-800 text-lg border-b border-slate-100 pb-3 mb-6">WhatsApp API Configuration</h3>
              
              {settingsSavedMsg && (
                <div className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-semibold px-4 py-3 rounded-xl mb-6">
                  {settingsSavedMsg}
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Store Name</label>
                    <input 
                      type="text" 
                      required
                      value={settingsForm.storeName}
                      onChange={(e) => setSettingsForm({...settingsForm, storeName: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-whatsapp-primary focus:bg-white transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Store logo URL</label>
                    <input 
                      type="url" 
                      value={settingsForm.logoUrl}
                      onChange={(e) => setSettingsForm({...settingsForm, logoUrl: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-whatsapp-primary focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Meta Phone ID / WhatsApp Number</label>
                    <input 
                      type="text" 
                      value={settingsForm.whatsappNumber}
                      onChange={(e) => setSettingsForm({...settingsForm, whatsappNumber: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-whatsapp-primary focus:bg-white transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Default step discount %</label>
                    <input 
                      type="number" 
                      value={settingsForm.discountPercent}
                      onChange={(e) => setSettingsForm({...settingsForm, discountPercent: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-whatsapp-primary focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Meta Cloud API access token</label>
                  <input 
                    type="text" 
                    value={settingsForm.metaAccessToken}
                    onChange={(e) => setSettingsForm({...settingsForm, metaAccessToken: e.target.value})}
                    placeholder="Enter Meta EAAB... key (or 'mock' for local simulation)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-whatsapp-primary focus:bg-white transition-all font-mono text-xs"
                  />
                </div>

                <button 
                  type="submit"
                  className="bg-whatsapp-primary hover:bg-whatsapp-dark text-white font-bold py-3 px-6 rounded-xl text-sm shadow-md transition-all"
                >
                  Save Configuration
                </button>
              </form>
            </div>
          )}

        </div>
      </main>

      {/* Product ADD / EDIT Modal popup */}
      {showProductModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative border border-slate-100 space-y-6">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-lg">{editingProduct ? 'Edit Catalog Item' : 'Add Catalog Item'}</h3>
              <button 
                onClick={() => {
                  setShowProductModal(false);
                  setEditingProduct(null);
                }} 
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
              {/* Product Name */}
              <div className="space-y-1">
                <label>Product Name</label>
                <input 
                  type="text" 
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  placeholder="Premium Cotton Shirt"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm normal-case font-medium text-slate-700 focus:outline-none focus:border-whatsapp-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div className="space-y-1">
                  <label>Category</label>
                  <select 
                    value={productForm.category}
                    onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:border-whatsapp-primary"
                  >
                    <option value="Shirts">Shirts</option>
                    <option value="T-Shirts">T-Shirts</option>
                    <option value="Jeans">Jeans</option>
                    <option value="Trousers">Trousers</option>
                  </select>
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <label>Price (₹)</label>
                  <input 
                    type="number" 
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                    placeholder="1299"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:border-whatsapp-primary"
                  />
                </div>
              </div>

              {/* Colours */}
              <div className="space-y-1">
                <label>Colour Tags (comma separated)</label>
                <input 
                  type="text" 
                  required
                  value={productForm.colours}
                  onChange={(e) => setProductForm({...productForm, colours: e.target.value})}
                  placeholder="Black, White, Blue"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm normal-case font-medium text-slate-700 focus:outline-none focus:border-whatsapp-primary"
                />
              </div>

              {/* Image upload / URL */}
              <div className="space-y-2 border-t pt-3">
                <label>Product Photo</label>
                
                {/* File Upload Selector */}
                <div className="flex items-center space-x-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl p-3">
                  <Upload className="h-5 w-5 text-slate-400" />
                  <div className="flex-1 min-w-0">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files.length > 0) {
                          setProductImageFile(e.target.files[0]);
                          // Clear image url input to prevent confusion
                          setProductForm({...productForm, imageUrl: ''});
                        }
                      }}
                      className="text-xs font-semibold text-slate-500 cursor-pointer block w-full file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300"
                    />
                  </div>
                </div>

                <div className="text-center text-[10px] text-slate-400 my-1">- OR -</div>

                {/* Direct Image URL */}
                <input 
                  type="url" 
                  value={productForm.imageUrl}
                  onChange={(e) => {
                    setProductForm({...productForm, imageUrl: e.target.value});
                    setProductImageFile(null); // Clear selected file to prevent conflict
                  }}
                  placeholder="Paste Unsplash or static image URL..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm normal-case font-medium text-slate-700 focus:outline-none focus:border-whatsapp-primary"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-whatsapp-primary hover:bg-whatsapp-dark text-white font-bold py-3 px-4 rounded-xl text-center text-sm shadow-md transition-all pt-2.5"
              >
                {editingProduct ? 'Save Changes' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
