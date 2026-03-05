import React, { useEffect, useState, useRef, lazy, Suspense, useCallback } from 'react';
import { Play, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseClient';
import { translations } from './translations';
import Dashboard from './Dashboard';
import WeatherDashboard from './weather/WeatherDashboard';
import AIChatPage from './AIChatPage';
import AIImpactDashboard from './AIImpactDashboard';
import SmartLossProtection from './SmartLossProtection';
import OptimizePlanPage from './OptimizePlanPage';
import MarketReport from './MarketReport';
import FarmerOnboarding from './FarmerOnboarding';
import SeasonalAdvice from './SeasonalAdvice';
import LiveMandi from './LiveMandi';
import FarmerCommunity from './FarmerCommunity';
import Settings from './Settings';
import FarmerProfile from './FarmerProfile';
import { fetchGlobalMarketData } from './globalMarketApi';
import './App.css';

const GlobalMarket = lazy(() => import('./GlobalMarket'));

function App() {
  const [currentLanguage, setCurrentLanguage] = useState(() => localStorage.getItem('agriSetuLang') || 'en');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('loading');
  const [userName, setUserName] = useState('');
  const [onboardingData, setOnboardingData] = useState(null);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({ fullName: '', mobileNumber: '', termsAccepted: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalMarketLoading, setGlobalMarketLoading] = useState(false);
  const [globalMarketData, setGlobalMarketData] = useState(null);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  const toastTimerRef = useRef(null);

  const showToast = useCallback((message, type = 'info') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const [showVideoModal, setShowVideoModal] = useState(false);

  const t = translations[currentLanguage];

  const fetchUserProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase.from('user_profiles').select('*').eq('user_id', userId).single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setUserName(data.full_name);
        setOnboardingData({ state: data.state, village: data.village, district: '', taluka: '', pinCode: '' });
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching profile:', error.message);
      return null;
    }
  }, []);

  // 1. Initialize Auth
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        const { data: { session: s }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        
        if (!isMounted) return;
        setSession(s);
        if (s) {
          setIsLoggedIn(true);
          const profile = await fetchUserProfile(s.user.id);
          if (!isMounted) return;
          if (!profile || !profile.state || !profile.village) {
            setCurrentPage('onboarding');
          } else {
            setAuthLoading(false);
          }
        } else {
          setIsLoggedIn(false);
          setCurrentPage('login');
          setAuthLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Auth init error:', error);
          const isNetworkError = error.message?.includes('fetch') || error.message?.includes('NetworkError') || !window.navigator.onLine;
          if (isNetworkError) {
            showToast('Connection error. Please check if your Supabase project is active.', 'error');
          }
          setAuthLoading(false);
          setIsLoggedIn(false);
          setCurrentPage('login');
        }
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!isMounted) return;
      setSession(s);
      if (s) {
        setIsLoggedIn(true);
        fetchUserProfile(s.user.id);
      } else {
        setIsLoggedIn(false);
        setCurrentPage('login');
      }
    });

    return () => {
      isMounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  // 2. Sync Routes from Hash (only when logged in and profile is ready)
  useEffect(() => {
    if (!isLoggedIn || currentPage === 'onboarding' || currentPage === 'loading') return;

    const sync = () => {
      const hash = window.location.hash || '';
      const routeMap = {
        '#/farmer-profile': 'farmer-profile',
        '#/settings': 'settings',
        '#/dashboard': 'dashboard',
        '#/ai-chat': 'ai-chat',
        '#/seasonal-advice': 'seasonal-advice',
        '#/ai-impact': 'ai-impact',
        '#/optimize-plan': 'optimize-plan',
        '#/community': 'community',
        '#/weather': 'weather',
        '#/market': 'market',
        '#/market-report': 'market-report',
        '#/global-market': 'global-market',
        '#/insurance': 'insurance'
      };
      const target = routeMap[hash] || 'dashboard';
      if (target !== currentPage) setCurrentPage(target);
    };

    sync();
    window.addEventListener('hashchange', sync);
    setAuthLoading(false); // Auth is fully ready
    return () => window.removeEventListener('hashchange', sync);
  }, [isLoggedIn, currentPage]);

  const navigate = (page, hash) => {
    setCurrentPage(page);
    window.location.hash = hash;
    localStorage.setItem('agriSetuLastHash', hash);
  };

  const handleGlobalMarketAccess = async () => {
    if (globalMarketLoading) return;
    setGlobalMarketLoading(true);
    try {
      const { data: { session: s } } = await supabase.auth.getSession();
      const token = s?.access_token;
      if (!token) throw new Error('Auth token missing');
      const result = await fetchGlobalMarketData({ token });
      if (!result.ok) throw new Error(result.error?.message || 'Failed to fetch');
      setGlobalMarketData(result.data);
      navigate('global-market', '#/global-market');
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setGlobalMarketLoading(false);
    }
  };

  const handleOnboardingComplete = async (data) => {
    try {
      const { error } = await supabase.from('user_profiles').upsert([{
        user_id: session.user.id,
        full_name: formData.fullName || userName,
        state: data.state,
        village: data.village
      }], { onConflict: 'user_id' });
      if (error) throw error;
      setOnboardingData(data);
      navigate('dashboard', '#/dashboard');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  if (authLoading && currentPage === 'loading') return <div className="loading-screen">Loading...</div>;

  if (!isLoggedIn) {
    return (
      <div className="app-container">
        <header className="header">
          <button 
            className="overview-video-btn" 
            onClick={() => setShowVideoModal(true)}
            title="Watch App Overview"
          >
            <Play size={20} fill="currentColor" />
          </button>
          <button className="language-selector" onClick={() => {
            const nextLang = currentLanguage === 'en' ? 'hi' : 'en';
            setCurrentLanguage(nextLang);
            localStorage.setItem('agriSetuLang', nextLang);
          }}>
            {currentLanguage === 'en' ? 'हिंदी' : 'English'}
          </button>
        </header>

        <AnimatePresence>
          {showVideoModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="video-modal-overlay"
              onClick={() => setShowVideoModal(false)}
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="video-modal"
                onClick={e => e.stopPropagation()}
              >
                <div className="video-modal__header">
                  <span className="video-modal__title">AgriSetu Overview</span>
                  <button className="video-modal__close" onClick={() => setShowVideoModal(false)}>
                    <X size={20} />
                  </button>
                </div>
                <div className="video-modal__body">
                  <video 
                    className="video-modal__video" 
                    controls 
                    autoPlay
                    src="/overview.mp4"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="login-container">
          <div className="login-card slide-up">
            <h1 className="login-title">AgriSetu</h1>
            <p className="login-subtitle">
              {currentLanguage === 'hi' 
                ? "नमस्ते! 👨‍🌾 मैं कृषि-सेतु AI हूँ, आपका स्मार्ट खेती साथी। मैं आपकी कैसे मदद कर सकता हूँ?"
                : "Namaste! 👨‍🌾 I am AgriSetu AI, your smart farming companion. How can I help you today?"}
            </p>
            
            {!showOtpInput ? (
              <form className="login-form" onSubmit={async (e) => {
                e.preventDefault();
                if (!formData.fullName || !formData.mobileNumber) {
                  setErrors({ submit: 'Please fill all fields' });
                  return;
                }
                setIsSubmitting(true);
                try {
                  const { error } = await supabase.auth.signInWithOtp({ phone: `+91${formData.mobileNumber}` });
                  if (error) {
                    if (error.message.includes('fetch')) {
                      throw new Error('Could not connect to database. Please check if the Supabase project is active.');
                    }
                    throw error;
                  }
                  setShowOtpInput(true);
                  showToast('OTP sent successfully', 'success');
                } catch (err) { 
                  setErrors({ submit: err.message }); 
                  showToast(err.message, 'error');
                } finally { 
                  setIsSubmitting(false); 
                }
              }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    className={`form-input ${errors.submit ? 'error' : ''}`}
                    name="fullName" 
                    value={formData.fullName} 
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
                    placeholder="Enter your name" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input 
                    className={`form-input ${errors.submit ? 'error' : ''}`}
                    name="mobileNumber" 
                    type="tel"
                    value={formData.mobileNumber} 
                    onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})} 
                    placeholder="10-digit mobile number" 
                  />
                </div>
                
                <div className="checkbox-group">
                  <input 
                    type="checkbox" 
                    className="checkbox-input"
                    checked={formData.termsAccepted}
                    onChange={(e) => setFormData({...formData, termsAccepted: e.target.checked})}
                    id="terms"
                  />
                  <label htmlFor="terms" className="checkbox-label">
                    I agree to the Terms of Service and Privacy Policy
                  </label>
                </div>

                {errors.submit && <span className="error-message">{errors.submit}</span>}
                
                <button className="login-button" type="submit" disabled={isSubmitting || !formData.termsAccepted}>
                  {isSubmitting ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form className="login-form" onSubmit={async (e) => {
                e.preventDefault();
                if (!otp) return;
                setIsSubmitting(true);
                try {
                  const { data, error } = await supabase.auth.verifyOtp({ 
                    phone: `+91${formData.mobileNumber}`, 
                    token: otp, 
                    type: 'sms' 
                  });
                  if (error) {
                    if (error.message.includes('fetch')) {
                      throw new Error('Connection failed. Please check your internet or Supabase status.');
                    }
                    throw error;
                  }
                  if (data.session) { 
                    setSession(data.session); 
                    setIsLoggedIn(true); 
                    showToast('Login successful', 'success');
                  }
                } catch (err) { 
                  setErrors({ otp: err.message }); 
                  showToast(err.message, 'error');
                } finally { 
                  setIsSubmitting(false); 
                }
              }}>
                <div className="form-group">
                  <label className="form-label text-center">Enter 6-Digit OTP</label>
                  <input 
                    className="form-input otp-single-input"
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)} 
                    placeholder="••••••" 
                    maxLength={6}
                  />
                </div>
                {errors.otp && <span className="error-message text-center">{errors.otp}</span>}
                <button className="login-button" type="submit" disabled={isSubmitting || otp.length < 6}>
                  {isSubmitting ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button 
                  type="button" 
                  className="text-gray-400 text-xs mt-4 hover:text-white transition-all text-center w-full"
                  onClick={() => setShowOtpInput(false)}
                >
                  Change Mobile Number
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    const props = { onBack: () => navigate('dashboard', '#/dashboard'), t, farmerName: userName, currentLanguage };
    switch (currentPage) {
      case 'onboarding': return <FarmerOnboarding onComplete={handleOnboardingComplete} t={t} />;
      case 'weather': return <WeatherDashboard {...props} />;
      case 'market': return <LiveMandi {...props} />;
      case 'global-market': 
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <GlobalMarket {...props} globalMarketData={globalMarketData} />
          </Suspense>
        );
      case 'community': return <FarmerCommunity {...props} />;
      case 'ai-chat': return <AIChatPage {...props} />;
      case 'seasonal-advice': return <SeasonalAdvice {...props} locationData={onboardingData} />;
      case 'settings': return <Settings {...props} onLanguageChange={(l) => { setCurrentLanguage(l); localStorage.setItem('agriSetuLang', l); }} />;
      case 'farmer-profile': return <FarmerProfile {...props} locationData={onboardingData} />;
      case 'ai-impact': return <AIImpactDashboard {...props} onNavigateToOptimize={() => navigate('optimize-plan', '#/optimize-plan')} />;
      case 'optimize-plan': return <OptimizePlanPage onBack={() => navigate('ai-impact', '#/ai-impact')} locationData={onboardingData} />;
      case 'insurance': return <SmartLossProtection {...props} />;
      case 'market-report': return <MarketReport {...props} />;
      default:
        return (
          <Dashboard
            {...props}
            onLogout={async () => { await supabase.auth.signOut(); setIsLoggedIn(false); setCurrentPage('login'); }}
            onNavigateToWeather={() => navigate('weather', '#/weather')}
            onNavigateToMarket={() => navigate('market', '#/market')}
            onNavigateToGlobalMarket={handleGlobalMarketAccess}
            onNavigateToCommunity={() => navigate('community', '#/community')}
            onNavigateToAIChat={() => navigate('ai-chat', '#/ai-chat')}
            onNavigateToSeasonalAdvice={() => navigate('seasonal-advice', '#/seasonal-advice')}
            onNavigateToSettings={() => navigate('settings', '#/settings')}
            onNavigateToProfile={() => navigate('farmer-profile', '#/farmer-profile')}
            onNavigateToImpact={() => navigate('ai-impact', '#/ai-impact')}
            onNavigateToInsurance={() => navigate('insurance', '#/insurance')}
            onNavigateToMarketReport={() => navigate('market-report', '#/market-report')}
            currentLanguage={currentLanguage}
            onLanguageChange={(l) => { setCurrentLanguage(l); localStorage.setItem('agriSetuLang', l); }}
          />
        );
    }
  };

  return (
    <div className="app-container">
      {toast?.message && (
        <div className={`toast toast-${toast.type}`} style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}>
          {toast.message}
        </div>
      )}
      {renderContent()}
    </div>
  );
}

export default App;

