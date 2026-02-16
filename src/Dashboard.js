import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  User, 
  Settings as SettingsIcon, 
  Globe, 
  LogOut, 
  Mic, 
  Send,
  Cloud,
  TrendingUp,
  Calendar,
  ChevronRight,
  Languages,
  Bot,
  Users,
  Image as ImageIcon,
  Sparkles,
  ArrowUpRight,
  Play,
  Award,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { languages } from './translations';
import './Dashboard.css';

const Dashboard = ({ onLogout, onNavigateToWeather, onNavigateToMarket, onNavigateToGlobalMarket, onNavigateToCommunity, onNavigateToAIChat, onNavigateToSeasonalAdvice, onNavigateToSettings, onNavigateToProfile, onNavigateToImpact, farmerName, currentLanguage, onLanguageChange, t }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [voiceAssistant, setVoiceAssistant] = useState(true);

  const suggestions = [
    "Aaj cotton ke liye pani dena sahi rahega?",
    "Soybean mandi bhav kya hai?",
    "Is week barish hogi kya?",
    "Tamatar me keede kaise roke?"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setSuggestionIndex((prev) => (prev + 1) % suggestions.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const firstName = farmerName ? farmerName.split(' ')[0] : '';
  const greeting = t.aiGreeting.replace('{name}', firstName || 'Farmer');

  const featureCards = [
    {
      id: 1,
      title: t.weather,
      description: "Aaj ka mausam, barish aur alert",
      icon: <Cloud className="card-icon" />,
      color: "#3b82f6",
      onClick: onNavigateToWeather,
      badge: "LIVE"
    },
    {
      id: 2,
      title: t.marketPrice,
      description: "Aaj ke mandi bhav",
      icon: <TrendingUp className="card-icon" />,
      color: "#10b981",
      onClick: onNavigateToMarket,
      trend: "up"
    },
    {
      id: 3,
      title: t.globalMarket,
      description: "Export & bade buyers se judo",
      icon: <Globe className="card-icon globe-icon" />,
      color: "#8b5cf6",
      onClick: onNavigateToGlobalMarket
    },
    {
      id: 4,
      title: t.seasonalAdvice,
      description: "Is mahine kya ugaye?",
      icon: <Calendar className="card-icon" />,
      color: "#f59e0b",
      onClick: onNavigateToSeasonalAdvice
    },
    {
      id: 5,
      title: "AI Impact Dashboard",
      description: "Dekhe AI se kitna fayda hua",
      icon: <BarChart3 className="card-icon" />,
      color: "#22c55e",
      onClick: onNavigateToImpact,
      isPremium: true
    },
    {
      id: 6,
      title: t.farmerCommunity,
      description: "Gaav ke farmers ke daily updates",
      icon: <Users className="card-icon" />,
      color: "#22c55e",
      onClick: onNavigateToCommunity,
      isNew: true
    },
    {
      id: 7,
      title: t.settings,
      description: "App settings",
      icon: <SettingsIcon className="card-icon" />,
      color: "#64748b",
      onClick: onNavigateToSettings
    }
  ];

  const sidebarItems = [
    { icon: <User size={20} />, label: t.profile, onClick: onNavigateToProfile },
    { icon: <SettingsIcon size={20} />, label: t.settings, onClick: onNavigateToSettings },
    { icon: <Globe size={20} />, label: t.language, onClick: () => setIsLangOpen(!isLangOpen) },
  ];

  return (
    <div className="dashboard-layout">
      {/* Top Navigation */}
      <nav className="top-nav">
        <button 
          className="icon-button menu-btn" 
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={28} />
        </button>
        
        <div className="app-logo" aria-label="AgriSetu">
          <div className="agrisetu-logo" role="img" aria-hidden="true">
            <span className="agrisetu-logo__sun" />
            <span className="agrisetu-logo__leaf" />
          </div>
          <span className="agrisetu-wordmark">AgriSetu</span>
        </div>

        <div className="header-right">
          <div className="lang-selector-wrapper">
            <button 
              className="lang-pill"
              onClick={() => setIsLangOpen(!isLangOpen)}
            >
              <Languages size={18} />
              <span>{languages.find(l => l.code === currentLanguage)?.name}</span>
            </button>
            
            <AnimatePresence>
              {isLangOpen && (
                <motion.div 
                  className="lang-dropdown"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      className={`lang-option ${currentLanguage === lang.code ? 'active' : ''}`}
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setIsLangOpen(false);
                      }}
                    >
                      {lang.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* Sidebar Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              className="sidebar-overlay-modern"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.aside 
              className="sidebar-drawer-modern"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            >
              <div className="drawer-container-modern">
                {/* Header */}
                <div 
                  className="drawer-header-modern" 
                  onClick={() => { onNavigateToProfile(); setIsSidebarOpen(false); }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="profile-group-modern">
                    <div className="avatar-container-modern">
                      <div className="avatar-glow-modern"></div>
                      <div className="avatar-circle-modern">
                        <User size={28} color="#22c55e" />
                      </div>
                    </div>
                    <div className="profile-text-modern">
                      <h3 className="profile-name-modern">{farmerName || 'Rahul Sharma'}</h3>
                      <span className="profile-badge-modern">Premium Farmer</span>
                    </div>
                  </div>
                  <button 
                    className="close-btn-modern" 
                    onClick={(e) => { e.stopPropagation(); setIsSidebarOpen(false); }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Navigation Menu */}
                <nav className="drawer-nav-modern">
                  <button className="nav-item-modern" onClick={() => { onNavigateToImpact(); setIsSidebarOpen(false); }}>
                    <BarChart3 size={20} className="nav-icon-modern" />
                    <span>AI Impact Dashboard</span>
                    <span className="premium-tag-mini">PREMIUM</span>
                  </button>
                  <button className="nav-item-modern" onClick={() => { onNavigateToProfile(); setIsSidebarOpen(false); }}>
                    <User size={20} className="nav-icon-modern" />
                    <span>Farmer Profile</span>
                  </button>
                  <button className="nav-item-modern" onClick={() => { onNavigateToSettings(); setIsSidebarOpen(false); }}>
                    <SettingsIcon size={20} className="nav-icon-modern" />
                    <span>Settings</span>
                  </button>
                  <button className="nav-item-modern" onClick={() => setIsLangOpen(true)}>
                    <Globe size={20} className="nav-icon-modern" />
                    <span>Language</span>
                  </button>

                  <div className="drawer-divider-modern"></div>

                  <button className="nav-item-modern logout-item-modern" onClick={onLogout}>
                    <LogOut size={20} className="nav-icon-modern" />
                    <span>Logout</span>
                  </button>
                </nav>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="dashboard-main">
        {/* Hero Section */}
        <section className="hero-banner">
          <div className="hero-image-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" 
              alt="Farming" 
              className="hero-image"
            />
            <div className="hero-overlay"></div>
            <motion.div 
              className="hero-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="hero-title">Grow Smarter with <span className="highlight-ai">AI</span></h1>
              <p className="hero-subtitle">Your digital farming companion for crops, weather & markets</p>
              <p className="hero-subcaption">Daily insights. Better decisions. Higher income.</p>
            </motion.div>
          </div>
        </section>

        {/* AI Chat Section - Clickable Hero Card */}
        <section className="chat-hero-section">
          <motion.div 
            className="ai-chat-hero-card"
            onClick={onNavigateToAIChat}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(34, 197, 94, 0.2)" }}
          >
            <div className="card-glow"></div>
            <div className="chat-hero-content">
              <div className="chat-hero-left">
                <div className="ai-icon-wrapper">
                  <Bot size={32} color="#4ade80" />
                  <div className="pulse-dot"></div>
                </div>
                <div className="chat-hero-text">
                  <div className="title-with-spark">
                    <h3>{t.aiAssistant}</h3>
                    <Sparkles size={16} className="spark-icon" />
                  </div>
                  <p className="ai-suggestion-text">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={suggestionIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5 }}
                      >
                        {suggestions[suggestionIndex]}
                      </motion.span>
                    </AnimatePresence>
                  </p>
                </div>
              </div>
              <div className="chat-hero-right">
                <div className="input-placeholder-container">
                  <div className="input-placeholder">
                    <span>Ask anything...</span>
                    <div className="placeholder-actions">
                      <ImageIcon size={20} className="action-icon" />
                      <Mic size={20} className="action-icon" />
                      <div className="send-circle">
                        <Send size={18} />
                      </div>
                    </div>
                  </div>
                  <span className="voice-helper">Bol ke poocho, likhne ki zarurat nahi.</span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="features-section">
          <div className="grid-container">
            {featureCards.map((card, index) => (
              <motion.div
                key={card.id}
                className="feature-card"
                onClick={card.onClick}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1), duration: 0.5 }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  boxShadow: "0 20px 40px rgba(34, 197, 94, 0.15)" 
                }}
              >
                <div className="card-inner">
                  {card.badge && <span className="live-badge">{card.badge}</span>}
                  {card.isNew && <span className="new-badge">NEW</span>}
                  <div className="card-icon-wrapper" style={{ '--icon-color': card.color }}>
                    {card.icon}
                    {card.trend && <ArrowUpRight className="trend-arrow" size={14} />}
                  </div>
                  <div className="card-content">
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                  </div>
                  <ChevronRight className="card-arrow" size={20} />
                </div>
                <div className="card-glow" style={{ background: `radial-gradient(circle at center, ${card.color}22, transparent 70%)` }}></div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Today's Farmer Feed Section */}
        <section className="dashboard-section feed-section">
          <div className="section-header">
            <h2>🌾 Aaj Gaav Me Kya Ho Raha Hai?</h2>
            <button className="add-update-btn" onClick={onNavigateToCommunity}>
              Apna Update Daalen +
            </button>
          </div>
          <div className="horizontal-scroll-feed">
            {[
              { id: 1, name: "Ramesh Pawar", text: "Aaj cotton me pani diya", time: "2 hours ago" },
              { id: 2, name: "Suresh Patil", text: "Khad dalne ka kam shuru", time: "5 hours ago" },
              { id: 3, name: "Anita Deshmukh", text: "Fasal badhiya badh rahi hai", time: "Yesterday" }
            ].map(item => (
              <div key={item.id} className="feed-mini-card glass-card">
                <div className="feed-card-top">
                  <div className="user-mini-avatar">{(item.name[0]).toUpperCase()}</div>
                  <div className="user-mini-info">
                    <h4>{item.name}</h4>
                    <span>{item.time}</span>
                  </div>
                </div>
                <p className="feed-mini-text">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Farmer Ranking Preview Section */}
        <section className="dashboard-section ranking-preview-section">
          <div className="section-header">
            <h2>🏆 Gaav Farmer Ranking (AI Based)</h2>
            <button className="view-all-btn" onClick={onNavigateToCommunity}>
              Full Ranking Dekhe →
            </button>
          </div>
          <div className="ranking-preview-card glass-card">
            <div className="ranking-list-mini">
              {[
                { rank: 1, name: "Anita Deshmukh", crop: "Soybean", stars: 5 },
                { rank: 2, name: "Ramesh Pawar", crop: "Wheat", stars: 5 },
                { rank: 3, name: "Sunil Shinde", crop: "Onion", stars: 4 }
              ].map(item => (
                <div key={item.rank} className="rank-item-mini">
                  <div className="rank-badge-mini">{item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : '🥉'}</div>
                  <div className="rank-info-mini">
                    <h4>{item.name}</h4>
                    <span>{item.crop}</span>
                  </div>
                  <div className="rank-stars-mini">
                    {Array(item.stars).fill('⭐').join('')}
                  </div>
                </div>
              ))}
            </div>
            <p className="ranking-note">Ranking AI ke dwara daily activity ke basis par hoti hai.</p>
          </div>
        </section>

        {/* About Us Section (Footer) */}
        <section className="about-section footer-about">
          <motion.div 
            className="about-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="about-header">
              <h2 className="about-title">{t.aboutTitle}</h2>
              <p className="about-subtitle">{t.aboutSubtitle}</p>
            </div>

            <div className="about-content">
              <div className="about-description">
                <p>{t.aboutPara1}</p>
                <p>{t.aboutPara2}</p>
              </div>

              <div className="about-divider"></div>

              <div className="trust-section">
                <h3 className="trust-title">🌾 {t.whyTrustTitle}</h3>
                <ul className="trust-list">
                  <li><span className="trust-icon">🤖</span> {t.trustPoint1}</li>
                  <li><span className="trust-icon">🎤</span> {t.trustPoint2}</li>
                  <li><span className="trust-icon">👥</span> {t.trustPoint3}</li>
                  <li><span className="trust-icon">⭐</span> {t.trustPoint4}</li>
                  <li><span className="trust-icon">🏡</span> {t.trustPoint5}</li>
                </ul>
              </div>

              <div className="about-divider"></div>

              <div className="mission-vision-grid">
                <div className="mv-card">
                  <h4>🌍 {t.missionTitle}</h4>
                  <p>{t.missionDesc}</p>
                </div>
                <div className="mv-card">
                  <h4>🚀 {t.visionTitle}</h4>
                  <p>{t.visionDesc}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
