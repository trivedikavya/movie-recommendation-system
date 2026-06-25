import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Lock, Mail, User, Phone, Image, ArrowRight } from 'lucide-react';

export default function Register() {
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeName,
          email,
          password,
          whatsappNumber,
          logoUrl,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('chatcart_token', data.token);
        localStorage.setItem('chatcart_brand', JSON.stringify(data.brand));
        navigate('/dashboard');
      } else {
        setError(data.message || 'Registration failed. Try again.');
      }
    } catch (err) {
      setError('Connection failed. Is the Spring Boot backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 relative overflow-hidden" style={{ backgroundImage: `radial-gradient(circle at 90% 80%, rgba(18, 140, 126, 0.05) 0%, transparent 60%)` }}>
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-whatsapp-primary/5 rounded-full blur-[80px] -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] -z-10"></div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-white/40 shadow-2xl space-y-6">
        
        {/* Branding Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <Link to="/" className="h-12 w-12 bg-whatsapp-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-whatsapp-primary/20 hover:scale-105 transition-all">
            <ShoppingBag className="h-6 w-6" />
          </Link>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Create Brand Store</h2>
            <p className="text-sm text-slate-500 mt-1">Start converting ad-clicks into customers</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 text-xs font-semibold px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Store Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Store/Brand Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Zara India Lite"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-whatsapp-primary focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="brand@example.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-whatsapp-primary focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* WhatsApp Phone */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">WhatsApp number (WaId)</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="tel"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+919876543210"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-whatsapp-primary focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-whatsapp-primary focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Brand Logo URL */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Logo URL (Optional)</label>
            <div className="relative">
              <Image className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-whatsapp-primary focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-whatsapp-primary hover:bg-whatsapp-dark text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-whatsapp-primary/20 hover:shadow-whatsapp-primary/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed pt-2.5"
          >
            <span>{loading ? 'Creating Account...' : 'Register'}</span>
            {!loading && <ArrowRight className="h-4.5 w-4.5" />}
          </button>

          <button
            type="button"
            onClick={() => {
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
              navigate('/dashboard');
            }}
            className="w-full bg-emerald-50 hover:bg-emerald-100 text-whatsapp-primary font-bold py-3 px-4 rounded-xl text-center shadow-sm border border-whatsapp-primary/10 transition-all flex items-center justify-center space-x-1.5"
          >
            <span>Try Simulated Demo Mode</span>
            <Sparkles className="h-4 w-4 text-emerald-500 fill-emerald-500" />
          </button>
        </form>

        <div className="text-center text-sm text-slate-500 pt-2 border-t border-slate-200/50">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-whatsapp-primary hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
