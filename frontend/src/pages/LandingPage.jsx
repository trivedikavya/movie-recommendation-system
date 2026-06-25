import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, 
  ArrowRight, 
  ShoppingBag, 
  Percent, 
  TrendingUp, 
  Users, 
  ChevronRight, 
  Check, 
  Smartphone, 
  X,
  Sparkles,
  Zap,
  Shield,
  HelpCircle
} from 'lucide-react';

export default function LandingPage() {
  const handleEnterDemo = () => {
    localStorage.setItem('chatcart_token', 'mock_token_123');
    localStorage.setItem('chatcart_brand', JSON.stringify({
      id: 1,
      storeName: 'Zara India Lite',
      email: 'brand@chatcart.com',
      whatsappNumber: '+919876543210',
      webhookToken: 'chatcart_verify_token',
      discountPercent: 10,
      logoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'
    }));
    window.location.href = '/dashboard';
  };

  // Standalone WhatsApp simulator state on Landing Page
  const [simulatorOpen, setSimulatorOpen] = useState(true);
  const [chatStep, setChatStep] = useState(1);
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Simulated Apparel Catalog
  const mockProducts = [
    { id: 1, name: 'Classic White Cotton Shirt', price: 1299, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=150', category: 'Shirts', colours: 'White/Grey' },
    { id: 2, name: 'Slim Fit Black Jeans', price: 1999, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=150', category: 'Jeans', colours: 'Black' },
    { id: 3, name: 'Navy Blue Chino Trousers', price: 2499, image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=150', category: 'Trousers', colours: 'Navy/Blue' },
    { id: 4, name: 'Oversized Black Graphic Tee', price: 899, image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=150', category: 'T-Shirts', colours: 'Black' },
  ];

  const [customerDetails, setCustomerDetails] = useState({ name: '', address: '', phone: '' });
  const [selectedProduct, setSelectedProduct] = useState(mockProducts[0]);
  const [tempInput, setTempInput] = useState('');

  // Initial greeting
  useEffect(() => {
    resetChat();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typing]);

  const resetChat = () => {
    setChatStep(1);
    setCustomerDetails({ name: '', address: '', phone: '' });
    setSelectedProduct(mockProducts[0]);
    setMessages([
      {
        id: 1,
        sender: 'bot',
        type: 'product',
        product: mockProducts[0],
        text: `Hey! 👋 Loving the *${mockProducts[0].name}* from our ad?`,
        buttons: ['Yes, I want it 😍', 'What\'s the price?', 'Show other styles'],
        time: getFormattedTime()
      }
    ]);
  };

  const getFormattedTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleUserReply = (text, customPayload = null) => {
    // Add User Message
    const userMsgId = Date.now();
    setMessages(prev => [...prev, {
      id: userMsgId,
      sender: 'user',
      type: 'text',
      text: text,
      time: getFormattedTime()
    }]);

    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      
      // Bot logic transitions
      if (chatStep === 1) {
        if (text.includes('Yes') || text.includes('😍')) {
          setChatStep(2); // Capture Name
          setMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'bot',
            type: 'text',
            text: 'Awesome choice! Let\'s secure your delivery details.\n\nCould you please reply with your *Full Name*?',
            time: getFormattedTime()
          }]);
        } else if (text.includes('price') || text.includes('Price')) {
          setMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'bot',
            type: 'text',
            text: `The *${selectedProduct.name}* is priced at *₹${selectedProduct.price.toLocaleString('en-IN')}* (exclusive WhatsApp checkout offer included).`,
            buttons: ['Yes, I want it 😍', 'Show other styles'],
            time: getFormattedTime()
          }]);
        } else {
          // Show styles / Hesitation budget
          setChatStep(4);
          setMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'bot',
            type: 'text',
            text: 'No worries at all! What is your budget range for shopping today?',
            buttons: ['Under ₹1000', 'Around ₹2000', '₹3000+'],
            time: getFormattedTime()
          }]);
        }
      } 
      // Step 2: Capture Name
      else if (chatStep === 2) {
        setCustomerDetails(prev => ({ ...prev, name: text }));
        setChatStep(3); // Capture Address
        setMessages(prev => [...prev, {
          id: Date.now(),
          sender: 'bot',
          type: 'text',
          text: `Got it, *${text}*! 👍\n\nNow, please send us your complete *Delivery Address* (including City, State, and Pin Code):`,
          time: getFormattedTime()
        }]);
      }
      // Step 3: Capture Address & Payment Method
      else if (chatStep === 3) {
        setCustomerDetails(prev => ({ ...prev, address: text }));
        setChatStep(3.5); // Payment selection
        setMessages(prev => [...prev, {
          id: Date.now(),
          sender: 'bot',
          type: 'text',
          text: `Perfect! We have captured your address.\n\nHow would you like to make the payment? COD orders are processed immediately.`,
          buttons: ['Cash on Delivery 💵', 'Pay with GPay / UPI', 'Pay later'],
          time: getFormattedTime()
        }]);
      }
      // Step 3.5: Final Payment Response
      else if (chatStep === 3.5) {
        setChatStep(10); // Finished flow
        if (text.includes('Cash') || text.includes('COD')) {
          setMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'bot',
            type: 'text',
            text: `🎉 *Order Confirmed!*\n\nThank you, *${customerDetails.name}*! Your order for *${selectedProduct.name}* (Amount: *₹${(selectedProduct.price * 0.95).toLocaleString('en-IN')}* with 5% discount) is successfully registered via Cash on Delivery.\n\nWe will ship it to *${text === 'Cash on Delivery 💵' ? customerDetails.address : text}* soon! 👋`,
            buttons: ['Shop more 🛍️'],
            time: getFormattedTime()
          }]);
        } else if (text.includes('GPay') || text.includes('UPI')) {
          setMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'bot',
            type: 'text',
            text: `💳 *Secure Payment Link Generated!*\n\nClick the link below to pay with Google Pay / UPI:\n\n🔗 _http://localhost:8080/api/simulation/payment?orderId=1025&amount=${selectedProduct.price * 0.95}_\n\nOnce payment is complete, your order will automatically confirm.`,
            buttons: ['Simulate successful pay', 'Shop more 🛍️'],
            time: getFormattedTime()
          }]);
        } else {
          setMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'bot',
            type: 'text',
            text: `👍 *Placed via Pay Later!*\n\nYour order for *${selectedProduct.name}* is flagged for BNPL review. Our customer representative will call you shortly to confirm details. Thank you!`,
            buttons: ['Shop more 🛍️'],
            time: getFormattedTime()
          }]);
        }
      }
      // Step 4: Budget Input
      else if (chatStep === 4) {
        setChatStep(5); // Filter category
        setMessages(prev => [...prev, {
          id: Date.now(),
          sender: 'bot',
          type: 'text',
          text: `Great! What items are you looking for today?`,
          buttons: ['Shirts', 'T-Shirts', 'Jeans', 'Trousers'],
          time: getFormattedTime()
        }]);
      }
      // Step 5: Filter Category
      else if (chatStep === 5) {
        setChatStep(6); // Filter color
        setMessages(prev => [...prev, {
          id: Date.now(),
          sender: 'bot',
          type: 'text',
          text: `Got it, *${text}*! Now select your preferred colour:`,
          buttons: ['Navy/Blue', 'Black', 'White/Grey', 'Any colour'],
          time: getFormattedTime()
        }]);
      }
      // Step 6: Personalised Catalogue
      else if (chatStep === 6) {
        setChatStep(7); // Show results & select product
        setMessages(prev => [...prev, {
          id: Date.now(),
          sender: 'bot',
          type: 'catalogue',
          text: 'Here are our top 4 recommendations matching your preference. Tap to select! 👇',
          products: mockProducts,
          time: getFormattedTime()
        }]);
      }
      // Step 7: Product Clicked Nudge
      else if (chatStep === 7) {
        // Find product
        const prod = mockProducts.find(p => text.includes(p.name)) || mockProducts[0];
        setSelectedProduct(prod);
        setChatStep(8); // Smart nudge
        setMessages(prev => [...prev, {
          id: Date.now(),
          sender: 'bot',
          type: 'product_discount',
          product: prod,
          text: `Great choice! The *${prod.name}* looks absolutely stunning! ✨\n\nOriginal: ~₹${prod.price.toLocaleString('en-IN')}~\n*ChatCart Discount: ₹${(prod.price * 0.95).toLocaleString('en-IN')}* (5% Off!)\n\nOnly a few items left in stock. Secure yours now!`,
          buttons: ['Pay with COD 💵', 'Pay with GPay / UPI'],
          time: getFormattedTime()
        }]);
      }
      // Smart Nudge Button Clicked
      else if (chatStep === 8) {
        setChatStep(2); // Proceed to capture details
        setMessages(prev => [...prev, {
          id: Date.now(),
          sender: 'bot',
          type: 'text',
          text: `Excellent choice. Let's capture your shipping details to process the order.\n\nCould you please reply with your *Full Name*?`,
          time: getFormattedTime()
        }]);
      }
      // Completed / Reset
      else if (chatStep === 10) {
        resetChat();
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased relative">
      {/* Background Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-whatsapp-primary/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      <div className="absolute top-[800px] right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-200/50 backdrop-blur-md px-6 py-4 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-whatsapp-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-whatsapp-primary/20">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-whatsapp-dark to-whatsapp-primary bg-clip-text text-transparent">
            ChatCart
          </span>
        </div>
        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
          <a href="#how-it-works" className="hover:text-whatsapp-primary transition-colors">How It Works</a>
          <a href="#problem" className="hover:text-whatsapp-primary transition-colors">Why ChatCart</a>
          <a href="#benefits" className="hover:text-whatsapp-primary transition-colors">Benefits</a>
        </nav>
        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-whatsapp-primary transition-colors">
            Login
          </Link>
          <button 
            onClick={handleEnterDemo} 
            className="bg-whatsapp-primary hover:bg-whatsapp-dark text-white text-sm font-bold py-2.5 px-5 rounded-xl shadow-md hover:shadow-lg shadow-whatsapp-primary/10 transition-all duration-150 flex items-center space-x-1.5"
          >
            <span>Try Demo Store</span>
            <Sparkles className="h-4 w-4 fill-emerald-100" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-24 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center space-x-2 bg-whatsapp-primary/10 border border-whatsapp-primary/20 px-3 py-1.5 rounded-full text-xs font-bold text-whatsapp-dark">
            <Sparkles className="h-3 w-3" />
            <span>Frictionless 7-Step Conversational Checkout</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight tracking-tight">
            From ad-click to checkout — <span className="bg-gradient-to-r from-whatsapp-primary to-emerald-600 bg-clip-text text-transparent font-extrabold">without leaving the chat</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Convert Meta ad clicks into automated WhatsApp conversations. No slow website, no logins, no app installs. Shoppers browse collections, select sizes, submit shipping details, and pay via UPI or COD instantly in chat.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4 pt-2">
            <button 
              onClick={handleEnterDemo} 
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all duration-150 flex items-center justify-center space-x-2"
            >
              <span>Explore Brand Dashboard</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Hero Image / Animated Chat Simulator container */}
        <div className="lg:col-span-5 flex justify-center w-full relative">
          <div className="absolute -top-12 -left-12 w-24 h-24 bg-yellow-500/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-whatsapp-primary/10 rounded-full blur-xl animate-pulse"></div>
          
          {/* Chat Simulator Shell */}
          <div className="w-[360px] h-[580px] bg-slate-100 rounded-[40px] border-[12px] border-slate-900 shadow-2xl overflow-hidden relative flex flex-col">
            {/* Phone notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-20 flex items-center justify-center">
              <div className="w-12 h-1.5 bg-slate-800 rounded-full mb-1"></div>
            </div>

            {/* WhatsApp Simulator Header */}
            <div className="bg-whatsapp-dark text-white px-4 pt-8 pb-3 flex items-center justify-between shadow-md z-10">
              <div className="flex items-center space-x-2.5">
                <div className="relative">
                  <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-800 font-bold text-xs overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150" alt="avatar" className="object-cover h-full w-full" />
                  </div>
                  <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-whatsapp-dark"></div>
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">Zara India Bot</h3>
                  <p className="text-[10px] text-emerald-100 flex items-center"><Zap className="h-2 w-2 mr-0.5 fill-current" /> Online</p>
                </div>
              </div>
              <button onClick={resetChat} className="text-xs bg-whatsapp-primary hover:bg-whatsapp-primary/80 border border-whatsapp-primary/30 px-2 py-1 rounded-md text-emerald-50 font-bold">
                Reset
              </button>
            </div>

            {/* WhatsApp Simulator Chat Area */}
            <div className="flex-1 bg-whatsapp-bg p-4 overflow-y-auto space-y-4 relative" style={{ backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`, backgroundBlendMode: 'overlay' }}>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col w-full ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Bubble content */}
                  <div className={`relative max-w-[85%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${msg.sender === 'user' ? 'bg-whatsapp-bubble text-slate-800 rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none'}`}>
                    
                    {/* Render Product Hook Card */}
                    {msg.type === 'product' && (
                      <div className="mb-2 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                        <img src={msg.product.image} alt={msg.product.name} className="h-32 w-full object-cover" />
                        <div className="p-2.5">
                          <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{msg.product.name}</h4>
                          <div className="text-xs text-slate-500 mt-0.5">Category: {msg.product.category}</div>
                          <div className="font-bold text-whatsapp-dark text-sm mt-1">₹{msg.product.price}</div>
                        </div>
                      </div>
                    )}

                    {/* Render Product discount smart nudge card */}
                    {msg.type === 'product_discount' && (
                      <div className="mb-2 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                        <img src={msg.product.image} alt={msg.product.name} className="h-32 w-full object-cover" />
                        <div className="p-2.5">
                          <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{msg.product.name}</h4>
                          <div className="flex items-center space-x-1.5 mt-1">
                            <span className="line-through text-xs text-slate-400">₹{msg.product.price}</span>
                            <span className="font-bold text-emerald-600 text-sm">₹{(msg.product.price * 0.95).toFixed(0)}</span>
                            <span className="text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full">5% OFF</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Render Catalogue Carousel (Step 6) */}
                    {msg.type === 'catalogue' && (
                      <div className="grid grid-cols-2 gap-2 my-2">
                        {msg.products.map(p => (
                          <div key={p.id} onClick={() => handleUserReply(`I want to buy: ${p.name}`)} className="bg-slate-50 border border-slate-100 rounded-xl overflow-hidden cursor-pointer hover:border-whatsapp-primary transition-all p-1.5">
                            <img src={p.image} alt={p.name} className="h-20 w-full object-cover rounded-lg" />
                            <h5 className="font-bold text-[10px] text-slate-800 line-clamp-1 mt-1">{p.name}</h5>
                            <div className="text-[10px] text-whatsapp-dark font-bold">₹{p.price}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Raw Text Content */}
                    <div className="whitespace-pre-line leading-relaxed text-slate-800">{msg.text}</div>
                    
                    {/* Timestamp inside bubble */}
                    <div className="text-[9px] text-slate-400 text-right mt-1">{msg.time}</div>
                  </div>

                  {/* Bubble buttons below bot bubbles */}
                  {msg.sender === 'bot' && msg.buttons && (
                    <div className="mt-2 flex flex-col space-y-1.5 w-full max-w-[85%] self-start pl-1">
                      {msg.buttons.map((btn, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleUserReply(btn)}
                          className="bg-white hover:bg-slate-50 text-whatsapp-dark font-semibold text-xs py-2 px-3 border border-slate-200 rounded-xl text-center shadow-sm active:scale-95 transition-all"
                        >
                          {btn}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {typing && (
                <div className="flex items-center space-x-1 bg-white px-4 py-2.5 rounded-2xl rounded-tl-none max-w-[80px] shadow-sm">
                  <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Footer */}
            <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Type details or tap buttons..."
                value={tempInput}
                onChange={(e) => setTempInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && tempInput.trim() !== '') {
                    handleUserReply(tempInput);
                    setTempInput('');
                  }
                }}
                className="flex-1 bg-white border border-slate-200 rounded-full px-4 py-2 text-xs focus:outline-none focus:border-whatsapp-primary"
              />
              <button 
                onClick={() => {
                  if (tempInput.trim() !== '') {
                    handleUserReply(tempInput);
                    setTempInput('');
                  }
                }}
                className="h-8 w-8 bg-whatsapp-primary hover:bg-whatsapp-dark text-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Funnel Comparison Section */}
      <section id="problem" className="py-24 px-6 max-w-7xl mx-auto border-t border-slate-200/50">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Stop losing 98% of your ad clicks on mobile checkout
          </h2>
          <p className="text-slate-600 mt-4 leading-relaxed">
            A typical mobile e-commerce checkout funnel is a leaky bucket. Users drop off because of slow landing page loading speeds, login walls, complex checkout forms, and redirect steps.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Traditional Web funnel */}
          <div className="lg:col-span-6 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-red-500"></div>
              <span>Traditional Mobile Web Funnel</span>
            </h3>
            
            <div className="space-y-4">
              {/* Step 1 */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>1. Click Ad</span>
                  <span>100% (1,000 visitors)</span>
                </div>
                <div className="h-5 w-full bg-slate-100 rounded-lg overflow-hidden">
                  <div className="h-full bg-red-500/80" style={{ width: '100%' }}></div>
                </div>
              </div>
              {/* Step 2 */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>2. Page Load & Browse</span>
                  <span>60% (600 visitors) - 40% bounce</span>
                </div>
                <div className="h-5 w-full bg-slate-100 rounded-lg overflow-hidden">
                  <div className="h-full bg-red-500/80" style={{ width: '60%' }}></div>
                </div>
              </div>
              {/* Step 3 */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>3. Add To Cart</span>
                  <span>20% (200 visitors)</span>
                </div>
                <div className="h-5 w-full bg-slate-100 rounded-lg overflow-hidden">
                  <div className="h-full bg-red-500/70" style={{ width: '20%' }}></div>
                </div>
              </div>
              {/* Step 4 */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>4. Start Checkout & Account Creation</span>
                  <span>8% (80 visitors)</span>
                </div>
                <div className="h-5 w-full bg-slate-100 rounded-lg overflow-hidden">
                  <div className="h-full bg-red-500/60" style={{ width: '8%' }}></div>
                </div>
              </div>
              {/* Step 5 */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>5. Fill Shipping & Payment Details</span>
                  <span>4% (40 visitors)</span>
                </div>
                <div className="h-5 w-full bg-slate-100 rounded-lg overflow-hidden">
                  <div className="h-full bg-red-500/50" style={{ width: '4%' }}></div>
                </div>
              </div>
              {/* Step 6 */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1 font-bold text-red-600">
                  <span>6. Completed Orders</span>
                  <span>1.8% (18 orders)</span>
                </div>
                <div className="h-5 w-full bg-slate-100 rounded-lg overflow-hidden">
                  <div className="h-full bg-red-600" style={{ width: '1.8%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* ChatCart Funnel */}
          <div className="lg:col-span-6 bg-emerald-950 text-white p-8 rounded-3xl border border-emerald-800 shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-emerald-400 flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-whatsapp-light"></div>
              <span>ChatCart Conversational Commerce Funnel</span>
            </h3>

            <div className="space-y-4">
              {/* Step 1 */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-emerald-200 mb-1">
                  <span>1. Click Ad</span>
                  <span>100% (1,000 visitors)</span>
                </div>
                <div className="h-5 w-full bg-emerald-900 rounded-lg overflow-hidden">
                  <div className="h-full bg-whatsapp-primary" style={{ width: '100%' }}></div>
                </div>
              </div>
              {/* Step 2 */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-emerald-200 mb-1">
                  <span>2. Land in WhatsApp (Instantly)</span>
                  <span>95% (950 conversations started)</span>
                </div>
                <div className="h-5 w-full bg-emerald-900 rounded-lg overflow-hidden">
                  <div className="h-full bg-whatsapp-primary" style={{ width: '95%' }}></div>
                </div>
              </div>
              {/* Step 3 */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-emerald-200 mb-1">
                  <span>3. Bot Interaction & Flow</span>
                  <span>85% (810 responses received)</span>
                </div>
                <div className="h-5 w-full bg-emerald-900 rounded-lg overflow-hidden">
                  <div className="h-full bg-whatsapp-primary" style={{ width: '85%' }}></div>
                </div>
              </div>
              {/* Step 4 */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-emerald-200 mb-1">
                  <span>4. Quick Address & COD Select</span>
                  <span>75% (710 details captured)</span>
                </div>
                <div className="h-5 w-full bg-emerald-900 rounded-lg overflow-hidden">
                  <div className="h-full bg-whatsapp-primary" style={{ width: '75%' }}></div>
                </div>
              </div>
              {/* Step 5 */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-emerald-200 mb-1 font-bold text-whatsapp-light">
                  <span>5. Completed Orders</span>
                  <span>58% (580 orders confirmed)</span>
                </div>
                <div className="h-5 w-full bg-emerald-900 rounded-lg overflow-hidden">
                  <div className="h-full bg-whatsapp-light" style={{ width: '58%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="py-24 bg-white border-y border-slate-200/50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl font-extrabold text-slate-900">How ChatCart Works</h2>
            <p className="text-slate-500 mt-4">A complete integration that maps Meta click-to-chat ads to verified conversions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 mx-auto bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl">1</div>
              <h3 className="font-bold text-slate-800 text-lg">Shopper Clicks Ad</h3>
              <p className="text-sm text-slate-500 px-4">Customer clicks a &quot;Shop Now&quot; button on Facebook/Instagram which redirects straight into WhatsApp.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="h-16 w-16 mx-auto bg-whatsapp-primary/10 text-whatsapp-primary rounded-2xl flex items-center justify-center font-black text-xl">2</div>
              <h3 className="font-bold text-slate-800 text-lg">Greeting & Collection Hook</h3>
              <p className="text-sm text-slate-500 px-4">Bot greets them with the clicked product and uses quick buttons to answer price queries or offer filters.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="h-16 w-16 mx-auto bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center font-black text-xl">3</div>
              <h3 className="font-bold text-slate-800 text-lg">Frictionless Details</h3>
              <p className="text-sm text-slate-500 px-4">Details are captured in two quick messages: Full Name, and Shipping Address. No forms to fill.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="h-16 w-16 mx-auto bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center font-black text-xl">4</div>
              <h3 className="font-bold text-slate-800 text-lg">COD / UPI Confirmation</h3>
              <p className="text-sm text-slate-500 px-4">Customer chooses COD or completes a UPI link transaction. Order confirms and alerts your dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900">Why Brands Choose ChatCart</h2>
          <p className="text-slate-500 mt-4">Built specifically for high-growth direct-to-consumer apparel brands in India.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-md space-y-4 hover:border-whatsapp-primary transition-all">
            <div className="h-12 w-12 bg-whatsapp-primary/10 text-whatsapp-primary rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Recover Lost Clicks</h3>
            <p className="text-slate-500 text-sm">Capture customer telephone numbers instantly when they chat. Build an active lead pipeline automatically.</p>
          </div>
          {/* Card 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-md space-y-4 hover:border-whatsapp-primary transition-all">
            <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Zero-Friction COD</h3>
            <p className="text-slate-500 text-sm">COD represents over 70% of Indian clothing orders. Secure COD validation directly inside the WhatsApp bubble.</p>
          </div>
          {/* Card 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-md space-y-4 hover:border-whatsapp-primary transition-all">
            <div className="h-12 w-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center">
              <Percent className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Personalised Nudges</h3>
            <p className="text-slate-500 text-sm">Automatically trigger discount codes (e.g. 5% Off) directly when a shopper displays checkout hesitation.</p>
          </div>
          {/* Card 4 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-md space-y-4 hover:border-whatsapp-primary transition-all">
            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Own the Channel</h3>
            <p className="text-slate-500 text-sm">Build a permanent customer base. Broadcast restock alerts and marketing updates with 90%+ open rates.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-whatsapp-dark text-white px-6 py-20 text-center max-w-7xl mx-auto rounded-[32px] mb-24 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-whatsapp-primary/30 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="max-w-3xl mx-auto space-y-8 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">Ready to double your ad conversion rates?</h2>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto leading-relaxed">
            Join forward-thinking D2C apparel brands who have simplified their checkout flow. Connect your Meta ads manager and start getting orders via WhatsApp today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={handleEnterDemo} 
              className="w-full sm:w-auto bg-white hover:bg-slate-100 text-whatsapp-dark font-bold py-4 px-8 rounded-xl shadow-lg transition-all"
            >
              Explore Demo Store
            </button>
            <Link 
              to="/register" 
              className="w-full sm:w-auto bg-whatsapp-primary hover:bg-whatsapp-primary/95 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 px-6 py-12 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 gap-6 bg-slate-50">
        <div className="flex items-center space-x-2">
          <div className="h-6 w-6 bg-whatsapp-primary rounded-lg flex items-center justify-center text-white">
            <ShoppingBag className="h-3 w-3" />
          </div>
          <span className="font-bold text-slate-800">ChatCart</span>
        </div>
        <div>
          &copy; {new Date().getFullYear()} ChatCart Technologies Private Limited. All rights reserved.
        </div>
        <div className="flex space-x-6">
          <a href="#how-it-works" className="hover:text-slate-800 transition-colors">Privacy Policy</a>
          <a href="#problem" className="hover:text-slate-800 transition-colors">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}
