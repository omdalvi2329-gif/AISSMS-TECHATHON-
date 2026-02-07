import React, { useState } from 'react';
import { translations, languages } from './translations';
import Dashboard from './Dashboard';
import Weather from './Weather';
import GlobalMarket from './GlobalMarket';
import MarketPrice from './MarketPrice';
import FarmMap from './FarmMap';
import './App.css';

function App() {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('agriSetuLang') || 'en';
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('login'); // 'login', 'dashboard', 'weather', 'market'
  const [userName, setUserName] = useState('');
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

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('login');
    setUserName('');
    setFormData({
      fullName: '',
      mobileNumber: '',
      termsAccepted: false
    });
  };

  const navigateToWeather = () => {
    setCurrentPage('weather');
  };

  const navigateToMarket = () => {
    setCurrentPage('market');
  };

  const navigateToGlobalMarket = () => {
    setCurrentPage('global-market');
  };

  const navigateToDashboard = () => {
    setCurrentPage('dashboard');
  };

  const navigateToFarmMap = () => {
    setCurrentPage('farm-map');
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
      // Only allow digits
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
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
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Simulate login success
      setTimeout(() => {
        setUserName(formData.fullName);
        setIsLoggedIn(true);
        setCurrentPage('dashboard');
        setIsSubmitting(false);
      }, 1000);
    }
  };

  // Check if form is valid for button state
  const isFormValid = formData.fullName.trim() && 
                     formData.mobileNumber.trim() && 
                     /^\d{10}$/.test(formData.mobileNumber) && 
                     formData.termsAccepted;

  if (isLoggedIn) {
    if (currentPage === 'weather') {
      return <Weather onBack={navigateToDashboard} t={t} />;
    }
    if (currentPage === 'market') {
      return <MarketPrice onBack={navigateToDashboard} t={t} />;
    }
    if (currentPage === 'global-market') {
      return <GlobalMarket onBack={navigateToDashboard} t={t} />;
    }
    if (currentPage === 'farm-map') {
      return <FarmMap onBack={navigateToDashboard} t={t} />;
    }
    return (
      <Dashboard 
        onLogout={handleLogout} 
        onNavigateToWeather={navigateToWeather} 
        onNavigateToMarket={navigateToMarket} 
        onNavigateToGlobalMarket={navigateToGlobalMarket}
        onNavigateToFarmMap={navigateToFarmMap}
        farmerName={userName}
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
              <input
                type="tel"
                id="mobileNumber"
                name="mobileNumber"
                className={`form-input ${errors.mobileNumber ? 'error' : ''}`}
                placeholder={t.mobileNumber}
                value={formData.mobileNumber}
                onChange={handleInputChange}
                autoComplete="tel"
                maxLength="10"
              />
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
              {isSubmitting ? 'Processing...' : t.continue}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default App;
