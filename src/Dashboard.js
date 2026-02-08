import React, { useState } from 'react';
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
  Map,
  Calendar,
  ChevronRight,
  Languages,
  Image as ImageIcon,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { languages } from './translations';
import './Dashboard.css';

const Dashboard = ({ onLogout, onNavigateToWeather, onNavigateToMarket, onNavigateToGlobalMarket, onNavigateToFarmMap, onNavigateToAIChat, onNavigateToSeasonalAdvice, farmerName, currentLanguage, onLanguageChange, t }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const firstName = farmerName ? farmerName.split(' ')[0] : '';
  const greeting = t.aiGreeting.replace('{name}', firstName || 'Farmer');

  const featureCards = [
    {
      id: 1,
      title: t.weather,
      description: t.weatherDesc,
      icon: <Cloud className="card-icon" />,
      color: "#3b82f6",
      onClick: onNavigateToWeather
    },
    {
      id: 2,
      title: t.marketPrice,
      description: t.marketPriceDesc,
      icon: <TrendingUp className="card-icon" />,
      color: "#10b981",
      onClick: onNavigateToMarket
    },
    {
      id: 3,
      title: t.globalMarket,
      description: t.globalMarketDesc,
      icon: <Globe className="card-icon" />,
      color: "#8b5cf6",
      onClick: onNavigateToGlobalMarket
    },
    {
      id: 4,
      title: t.seasonalAdvice,
      description: t.seasonalAdviceDesc,
      icon: <Calendar className="card-icon" />,
      color: "#f59e0b",
      onClick: onNavigateToSeasonalAdvice
    },
    {
      id: 5,
      title: t.farmMap,
      description: t.farmMapDesc,
      icon: <Map className="card-icon" />,
      color: "#22c55e",
      onClick: onNavigateToFarmMap
    },
    {
      id: 6,
      title: t.settings,
      description: t.settings,
      icon: <SettingsIcon className="card-icon" />,
      color: "#64748b"
    }
  ];

  const sidebarItems = [
    { icon: <User size={20} />, label: t.profile },
    { icon: <SettingsIcon size={20} />, label: t.settings },
    { icon: <Globe size={20} />, label: t.language },
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
        
        <div className="app-logo">
          <span className="logo-text">AgriSetu</span>
          <div className="logo-dot"></div>
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

      {/* Sidebar Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              className="sidebar-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.aside 
              className="sidebar"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="sidebar-header">
                <div className="profile-section">
                  <div className="profile-avatar">
                    <User size={32} />
                  </div>
                  <div className="profile-info">
                    <h3>{farmerName || t.farmerLogin}</h3>
                    <p>{t.premiumFarmer}</p>
                  </div>
                </div>
                <button className="icon-button close-btn" onClick={() => setIsSidebarOpen(false)}>
                  <X size={24} />
                </button>
              </div>

              <div className="sidebar-content">
                {sidebarItems.map((item, index) => (
                  <button key={index} className="sidebar-item">
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
                <div className="sidebar-divider"></div>
                <button className="sidebar-item logout" onClick={onLogout}>
                  <LogOut size={20} />
                  <span>{t.logout}</span>
                </button>
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
              <h1 className="hero-title">Grow Smarter with AI</h1>
              <p className="hero-subtitle">Your digital farming companion for crops, weather & markets</p>
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
                  <h3>{t.aiAssistant}</h3>
                  <p>{greeting}</p>
                </div>
              </div>
              <div className="chat-hero-right">
                <div className="input-placeholder">
                  <span>Ask anything...</span>
                  <div className="placeholder-actions">
                    <ImageIcon size={20} />
                    <Mic size={20} />
                    <div className="send-circle">
                      <Send size={18} />
                    </div>
                  </div>
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
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="card-inner">
                  <div className="card-icon-wrapper" style={{ '--icon-color': card.color }}>
                    {card.icon}
                  </div>
                  <div className="card-content">
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                  </div>
                  <ChevronRight className="card-arrow" size={20} />
                </div>
                <div className="card-glow"></div>
              </motion.div>
            ))}
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
              <p>{t.aboutPara1}</p>
              <p>{t.aboutPara2}</p>
              <p>{t.aboutPara3}</p>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
