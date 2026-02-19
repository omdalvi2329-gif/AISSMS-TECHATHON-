import React, { useEffect, useState } from 'react';
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
  const [currentPage, setCurrentPage] = useState('login'); // 'loading', 'login', 'onboarding', 'dashboard', ...
  const [userName, setUserName] = useState('');
  const [onboardingData, setOnboardingData] = useState(null);
  const [isOverviewVideoOpen, setIsOverviewVideoOpen] = useState(false);
  const [overviewVideoNonce, setOverviewVideoNonce] = useState(0);
  const [overviewVideoError, setOverviewVideoError] = useState('');
  const [loginMode] = useState('otp');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    termsAccepted: false,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLanguageChange = (lang) => {
    setCurrentLanguage(lang);
    localStorage.setItem('agriSetuLang', lang);
  };

  const t = translations[currentLanguage];

  useEffect(() => {
    setCurrentPage('login');
  }, []);

  const navigateToCommunity = () => {
    setCurrentPage('community');
  };

  const handleLogout = async () => {
    setIsLoggedIn(false);
    setCurrentPage('login');
    setUserName('');
    setOnboardingData(null);
    setErrors({});
    setShowOtpInput(false);
    setOtp('');
    setGeneratedOtp('');
    setFormData({
      fullName: '',
      mobileNumber: '',
      termsAccepted: false,
    });
  };

  const navigateToWeather = () => {
    setCurrentPage('weather');
  };

  const navigateToMarket = () => {
    setCurrentPage('market');
  };

  const navigateToMarketReport = () => {
    setCurrentPage('market-report');
  };

  const navigateToGlobalMarket = () => {
    setCurrentPage('global-market');
  };

  const navigateToDashboard = () => {
    setCurrentPage('dashboard');
  };

  const navigateToAIChat = () => {
    setCurrentPage('ai-chat');
  };

  const navigateToSeasonalAdvice = () => {
    setCurrentPage('seasonal-advice');
  };

  const navigateToSettings = () => {
    setCurrentPage('settings');
  };

  const navigateToProfile = () => {
    setCurrentPage('farmer-profile');
  };

  const navigateToImpact = () => {
    setCurrentPage('ai-impact');
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
    const { name, value } = e.target;

    if (name === 'termsAccepted') {
      setFormData((prev) => ({
        ...prev,
        termsAccepted: e.target.checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle form submission (Login)
  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      if (validateForm()) {
        const phone = `+91${formData.mobileNumber}`;
        const res = await fetch('http://localhost:5000/send-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phone }),
        });

        const contentType = res.headers.get('content-type') || '';
        const payload = contentType.includes('application/json') ? await res.json().catch(() => ({})) : {};

        if (!res.ok) {
          const msg = payload?.message || `Failed to send OTP (${res.status})`;
          throw new Error(msg);
        }

        setGeneratedOtp(String(payload?.otp || ''));
        setOtp('');
        setShowOtpInput(true);
        return;
      }
    } catch (error) {
      setErrors({ submit: error?.message || 'Request failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (otp.length !== 6) return;

    setIsSubmitting(true);
    try {
      const phone = `+91${formData.mobileNumber}`;
      const res = await fetch('http://localhost:5000/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otp }),
      });

      const contentType = res.headers.get('content-type') || '';
      const payload = contentType.includes('application/json') ? await res.json().catch(() => ({})) : {};

      if (!res.ok) {
        const msg = payload?.message || `OTP verification failed (${res.status})`;
        throw new Error(msg);
      }

      if (!payload?.success) {
        setErrors({ otp: 'Invalid OTP. Please try again.' });
        return;
      }

      setIsLoggedIn(true);
      setUserName(formData.fullName.trim());
      setCurrentPage('dashboard');
      setErrors({});
    } catch (error) {
      setErrors({ otp: error?.message || 'Invalid OTP. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOnboardingComplete = async (data) => {
    setOnboardingData(data);
    setCurrentPage('dashboard');
  };

  // Check if form is valid for button state
  const isFormValid = formData.fullName.trim() && 
                     formData.mobileNumber.trim() && 
                     /^\d{10}$/.test(formData.mobileNumber) && 
                     formData.termsAccepted;

  const overviewVideoUrl = '/overview.mp4';
  const isLocalMp4 = typeof overviewVideoUrl === 'string' && overviewVideoUrl.toLowerCase().endsWith('.mp4');
  const overviewVideoSrc = isLocalMp4 ? `${overviewVideoUrl}?v=${overviewVideoNonce}` : overviewVideoUrl;

  if (currentPage === 'loading') {
    return (
      <div className="loading-screen" style={{ backgroundColor: '#0a0e0a', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form className="login-form" onSubmit={handleVerifyOtp}>
              <div className="form-group">
                <label htmlFor="otp" className="form-label">
                  Enter 6-Digit OTP sent to +91 {formData.mobileNumber}
                </label>
                {generatedOtp ? (
                  <p className="text-green-400 mt-2">Demo OTP: {generatedOtp}</p>
                ) : null}
                <input
                  type="text"
                  id="otp"
                  className={`form-input ${errors.otp ? 'error' : ''}`}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => {
                    setOtp(String(e.target.value || '').replace(/\D/g, '').slice(0, 6));
                    if (errors.otp) setErrors((prev) => ({ ...prev, otp: '' }));
                  }}
                  maxLength="6"
                  required
                />
                {errors.otp && <span className="error-message">{errors.otp}</span>}
              </div>

              <button
                type="submit"
                className="login-button slide-up"
                disabled={otp.length !== 6 || isSubmitting}
              >
                {isSubmitting ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                type="button"
                className="text-button"
                style={{ background: 'none', border: 'none', color: '#22c55e', marginTop: '15px', cursor: 'pointer', width: '100%' }}
                onClick={() => {
                  setShowOtpInput(false);
                  setOtp('');
                  setGeneratedOtp('');
                  setErrors({});
                }}
                disabled={isSubmitting}
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
