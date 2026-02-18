import React, { useEffect, useState, useRef } from 'react';
import { supabase } from './supabaseClient';
import { translations, languages } from './translations';
import Dashboard from './Dashboard';
import WeatherDashboard from './weather/WeatherDashboard';
import GlobalMarket from './GlobalMarket';
import AIChatPage from './AIChatPage';
import AIImpactDashboard from './AIImpactDashboard';
import MarketReport from './MarketReport';
import FarmerOnboarding from './FarmerOnboarding';
import SeasonalAdvice from './SeasonalAdvice';
import LiveMandi from './LiveMandi';
import FarmerCommunity from './FarmerCommunity';
import Settings from './Settings';
import FarmerProfile from './FarmerProfile';
import './App.css';

function App() {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('agriSetuLang') || 'en';
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('loading'); // 'loading', 'login', 'onboarding', 'dashboard', ...
  const [userName, setUserName] = useState('');
  const [onboardingData, setOnboardingData] = useState(null);
  const [isOverviewVideoOpen, setIsOverviewVideoOpen] = useState(false);
  const [overviewVideoNonce, setOverviewVideoNonce] = useState(0);
  const [overviewVideoError, setOverviewVideoError] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    setIsSubmitting(true);
    try {
      const phone = `+91${formData.mobileNumber}`;
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phone,
        token: otp,
        type: 'sms',
      });

      if (error) throw error;

      if (data.session) {
        setSession(data.session);
        setIsLoggedIn(true);
        // fetchUserProfile will handle redirection
      }
    } catch (error) {
      setErrors({ otp: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    termsAccepted: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLanguageChange = (lang) => {
    setCurrentLanguage(lang);
    localStorage.setItem('agriSetuLang', lang);
  };

  const t = translations[currentLanguage];

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        
        if (currentSession) {
          setIsLoggedIn(true);
          const profile = await fetchUserProfile(currentSession.user.id);
          
          if (profile) {
            const isProfileIncomplete = !profile.state || !profile.village;
            if (isProfileIncomplete) {
              setCurrentPage('onboarding');
            } else {
              const hash = window.location.hash || '';
              const routeMap = {
                '#/farmer-profile': 'farmer-profile',
                '#/settings': 'settings',
                '#/dashboard': 'dashboard',
                '#/ai-chat': 'ai-chat',
                '#/seasonal-advice': 'seasonal-advice',
                '#/ai-impact': 'ai-impact',
                '#/community': 'community',
                '#/weather': 'weather',
                '#/market': 'market',
                '#/market-report': 'market-report',
                '#/global-market': 'global-market'
              };
              const targetPage = routeMap[hash] || (hash === '' || hash === '#/' ? 'dashboard' : null);
              setCurrentPage(targetPage || 'dashboard');
            }
          } else {
            setCurrentPage('onboarding');
          }
        } else {
          setIsLoggedIn(false);
          setCurrentPage('login');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setCurrentPage('login');
      } finally {
        setAuthLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setIsLoggedIn(true);
        if (!authLoading) {
          fetchUserProfile(session.user.id);
        }
      } else {
        setIsLoggedIn(false);
        setCurrentPage('login');
        if (window.location.hash !== '#/' && window.location.hash !== '') {
          window.location.hash = '#/';
        }
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setUserName(data.full_name);
        const profileData = {
          state: data.state,
          village: data.village,
          // Mapping for UI if needed, though DB only has state/village
          district: '',
          taluka: '',
          pinCode: ''
        };
        setOnboardingData(profileData);
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching profile:', error.message);
      return null;
    }
  };

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash || '';

      if (!isLoggedIn) return;

      const isProfileIncomplete = !onboardingData || !onboardingData.state || !onboardingData.village;
      
      if (currentPage !== 'onboarding' && isProfileIncomplete) {
        setCurrentPage('onboarding');
        return;
      }

      if (currentPage === 'onboarding' && !isProfileIncomplete) {
        setCurrentPage('dashboard');
        return;
      }

      const routeMap = {
        '#/farmer-profile': 'farmer-profile',
        '#/settings': 'settings',
        '#/dashboard': 'dashboard',
        '#/ai-chat': 'ai-chat',
        '#/seasonal-advice': 'seasonal-advice',
        '#/ai-impact': 'ai-impact',
        '#/community': 'community',
        '#/weather': 'weather',
        '#/market': 'market',
        '#/market-report': 'market-report',
        '#/global-market': 'global-market'
      };

      const targetPage = routeMap[hash] || (hash === '' || hash === '#/' ? 'dashboard' : null);
      
      if (targetPage && targetPage !== currentPage) {
        setCurrentPage(targetPage);
      } else if (currentPage === 'syncing') {
        setCurrentPage('dashboard');
      }
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, onboardingData]);

  const navigateToCommunity = () => {
    setCurrentPage('community');
    window.location.hash = '#/community';
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setCurrentPage('login');
    setUserName('');
    setSession(null);
    setOnboardingData(null);
    setFormData({
      fullName: '',
      mobileNumber: '',
      termsAccepted: false
    });
  };

  const navigateToWeather = () => {
    setCurrentPage('weather');
    window.location.hash = '#/weather';
  };

  const navigateToMarket = () => {
    setCurrentPage('market');
    window.location.hash = '#/market';
  };

  const navigateToMarketReport = () => {
    setCurrentPage('market-report');
    window.location.hash = '#/market-report';
  };

  const navigateToGlobalMarket = () => {
    setCurrentPage('global-market');
    window.location.hash = '#/global-market';
  };

  const navigateToDashboard = () => {
    setCurrentPage('dashboard');
    window.location.hash = '#/dashboard';
  };

  const navigateToAIChat = () => {
    setCurrentPage('ai-chat');
    window.location.hash = '#/ai-chat';
  };

  const navigateToSeasonalAdvice = () => {
    setCurrentPage('seasonal-advice');
    window.location.hash = '#/seasonal-advice';
  };

  const navigateToSettings = () => {
    setCurrentPage('settings');
    window.location.hash = '#/settings';
  };

  const navigateToProfile = () => {
    setCurrentPage('farmer-profile');
    window.location.hash = '#/farmer-profile';
  };

  const navigateToImpact = () => {
    setCurrentPage('ai-impact');
    window.location.hash = '#/ai-impact';
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = t.nameRequired;
    }
    
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = t.mobileRequired;
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = t.mobileDigits;
    }
    
    if (!formData.termsAccepted) {
      newErrors.terms = t.termsRequired;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'mobileNumber') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else if (name === 'fullName') {
      const alphabetValue = value.replace(/[^a-zA-Z\s]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: alphabetValue
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle form submission (Send OTP)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      setErrors({});
      
      try {
        const phone = `+91${formData.mobileNumber}`;
        const { error } = await supabase.auth.signInWithOtp({
          phone: phone,
        });

        if (error) throw error;
        
        setShowOtpInput(true);
      } catch (error) {
        setErrors({ submit: error.message });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleOnboardingComplete = async (data) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert([{
          user_id: session.user.id,
          full_name: formData.fullName || userName,
          phone_number: session.user.phone,
          state: data.state,
          village: data.village
          // Note: district, taluka, pin_code are not in current schema
          // We only save what the schema supports to avoid 400 errors
        }], { onConflict: 'user_id' });

      if (error) throw error;

      setOnboardingData(data);
      setUserName(formData.fullName || userName);
      setIsLoggedIn(true);
      setCurrentPage('dashboard');
    } catch (error) {
      console.error('Error creating profile:', error.message);
      setErrors({ submit: 'Failed to create profile. Please check connection or schema.' });
    }
  };

  // Check if form is valid for button state
  const isFormValid = formData.fullName.trim() && 
                     formData.mobileNumber.trim() && 
                     /^\d{10}$/.test(formData.mobileNumber) && 
                     formData.termsAccepted;

  const overviewVideoUrl = '/overview.mp4';
  const isLocalMp4 = typeof overviewVideoUrl === 'string' && overviewVideoUrl.toLowerCase().endsWith('.mp4');
  const overviewVideoSrc = isLocalMp4 ? `${overviewVideoUrl}?v=${overviewVideoNonce}` : overviewVideoUrl;

  if (authLoading || currentPage === 'loading') {
    return (
      <div className="loading-screen" style={{ backgroundColor: '#0a0e0a', height: '100vh', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ border: '4px solid rgba(34, 197, 94, 0.1)', borderTop: '4px solid #22c55e', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  if (currentPage === 'onboarding') {
    return <FarmerOnboarding onComplete={handleOnboardingComplete} t={t} />;
  }

  if (currentPage === 'market-report') {
    return <MarketReport onBack={navigateToDashboard} t={t} />;
  }

  if (isLoggedIn) {
    if (currentPage === 'weather') {
      return <WeatherDashboard onBack={navigateToDashboard} t={t} currentLanguage={currentLanguage} />;
    }
    if (currentPage === 'market') {
      return (
        <div style={{ backgroundColor: '#0a0e0a', minHeight: '100vh' }}>
          <button
            onClick={navigateToDashboard}
            style={{
              position: 'fixed',
              top: '20px',
              left: '20px',
              zIndex: 1000,
              padding: '10px 20px',
              backgroundColor: '#161b16',
              color: '#22c55e',
              border: '1px solid #2d362d',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            ← Back to Dashboard
          </button>
          <LiveMandi />
        </div>
      );
    }
    if (currentPage === 'global-market') {
      return <GlobalMarket onBack={navigateToDashboard} t={t} />;
    }
    if (currentPage === 'community') {
      return <FarmerCommunity onBack={navigateToDashboard} farmerName={userName} />;
    }
    if (currentPage === 'ai-chat') {
      return <AIChatPage onBack={navigateToDashboard} t={t} currentLanguage={currentLanguage} farmerName={userName} />;
    }
    if (currentPage === 'seasonal-advice') {
      return <SeasonalAdvice onBack={navigateToDashboard} locationData={onboardingData} t={t} />;
    }
    if (currentPage === 'settings') {
      return (
        <Settings
          onBack={navigateToDashboard}
          t={t}
          currentLanguage={currentLanguage}
          onLanguageChange={handleLanguageChange}
          farmerName={userName}
          locationData={onboardingData}
        />
      );
    }

    if (currentPage === 'farmer-profile') {
      return (
        <FarmerProfile
          onBack={navigateToDashboard}
          t={t}
          farmerName={userName}
          locationData={onboardingData}
        />
      );
    }

    if (currentPage === 'ai-impact') {
      return (
        <AIImpactDashboard
          onBack={navigateToDashboard}
          t={t}
          farmerName={userName}
          locationData={onboardingData}
        />
      );
    }

    return (
      <Dashboard
        onLogout={handleLogout}
        onNavigateToWeather={navigateToWeather}
        onNavigateToMarket={navigateToMarket}
        onNavigateToGlobalMarket={navigateToGlobalMarket}
        onNavigateToCommunity={navigateToCommunity}
        onNavigateToAIChat={navigateToAIChat}
        onNavigateToSeasonalAdvice={navigateToSeasonalAdvice}
        onNavigateToSettings={navigateToSettings}
        onNavigateToProfile={navigateToProfile}
        onNavigateToImpact={navigateToImpact}
        onNavigateToMarketReport={navigateToMarketReport}
        farmerName={userName}
        locationData={onboardingData}
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        t={t}
      />
    );
  }

  return (
    <div className="app-container">
      {/* Header with Language Selector */}
      <header className="header">
        <button
          type="button"
          className="overview-video-btn"
          onClick={() => {
            setOverviewVideoNonce(Date.now());
            setOverviewVideoError('');
            setIsOverviewVideoOpen(true);
          }}
          aria-label="Watch app overview"
          title="Watch app overview"
        >
          ▶
        </button>
        <select
          className="language-selector"
          value={currentLanguage}
          onChange={(e) => handleLanguageChange(e.target.value)}
        >
          {languages.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </header>

      {/* Main Login Container */}
      <main className="login-container">
        <div className="login-card fade-in">
          <h1 className="login-title">{t.farmerLogin}</h1>
          <p className="login-subtitle">{t.subtitle}</p>
          
          {errors.submit && (
            <div className="error-banner" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              {errors.submit}
            </div>
          )}

          {!showOtpInput ? (
            <form className="login-form" onSubmit={handleSubmit}>
              {/* Full Name Input */}
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">
                  {t.fullName}
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  className={`form-input ${errors.fullName ? 'error' : ''}`}
                  placeholder={t.fullName}
                  value={formData.fullName}
                  onChange={handleInputChange}
                  autoComplete="name"
                />
                {errors.fullName && (
                  <span className="error-message">{errors.fullName}</span>
                )}
              </div>

              {/* Mobile Number Input */}
              <div className="form-group">
                <label htmlFor="mobileNumber" className="form-label">
                  {t.mobileNumber}
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>+91</span>
                  <input
                    type="tel"
                    id="mobileNumber"
                    name="mobileNumber"
                    className={`form-input ${errors.mobileNumber ? 'error' : ''}`}
                    style={{ paddingLeft: '45px' }}
                    placeholder={t.mobileNumber}
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    autoComplete="tel"
                    maxLength="10"
                  />
                </div>
                {errors.mobileNumber && (
                  <span className="error-message">{errors.mobileNumber}</span>
                )}
              </div>

              {/* Terms and Conditions Checkbox */}
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="termsAccepted"
                  name="termsAccepted"
                  className="checkbox-input"
                  checked={formData.termsAccepted}
                  onChange={handleInputChange}
                />
                <label htmlFor="termsAccepted" className="checkbox-label">
                  {t.termsAndConditions}
                </label>
              </div>
              {errors.terms && (
                <span className="error-message">{errors.terms}</span>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="login-button slide-up"
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? 'Sending OTP...' : t.continue}
              </button>
            </form>
          ) : (
            <form className="login-form" onSubmit={handleVerifyOtp}>
              <div className="form-group">
                <label className="form-label" style={{ textAlign: 'center' }}>
                  Enter 6-Digit OTP sent to +91 {formData.mobileNumber}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  className={`form-input otp-single-input ${errors.otp ? 'error' : ''}`}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength="6"
                  required
                  autoFocus
                  style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem' }}
                />
                {errors.otp && (
                  <span className="error-message" style={{ textAlign: 'center' }}>{errors.otp}</span>
                )}
              </div>

              <button
                type="submit"
                className="login-button slide-up"
                disabled={otp.length !== 6 || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Verifying...
                  </>
                ) : 'Verify OTP'}
              </button>
              
              <button
                type="button"
                className="text-button"
                style={{ background: 'none', border: 'none', color: '#22c55e', marginTop: '15px', cursor: 'pointer', width: '100%' }}
                onClick={() => setShowOtpInput(false)}
              >
                Change Phone Number
              </button>
            </form>
          )}
        </div>
      </main>

      {isOverviewVideoOpen && (
        <div
          className="video-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsOverviewVideoOpen(false)}
        >
          <div
            className="video-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="video-modal__header">
              <div className="video-modal__title">App Overview</div>
              <button
                type="button"
                className="video-modal__close"
                onClick={() => setIsOverviewVideoOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            {overviewVideoUrl ? (
              <div className="video-modal__body">
                {isLocalMp4 ? (
                  <>
                    <video
                      className="video-modal__video"
                      src={overviewVideoSrc}
                      controls
                      onError={() => {
                        setOverviewVideoError('Video could not be loaded. Please confirm public/overview.mp4 exists and is not empty, then restart the dev server and hard refresh.');
                      }}
                    />
                    {overviewVideoError && (
                      <div className="video-modal__error">{overviewVideoError}</div>
                    )}
                  </>
                ) : (
                  <iframe
                    className="video-modal__frame"
                    src={overviewVideoSrc}
                    title="App Overview Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                )}
              </div>
            ) : (
              <div className="video-modal__empty">
                Add your overview video source in App.js (`overviewVideoUrl`). For local video, copy the mp4 into `public/` and set it to `/overview.mp4`.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
