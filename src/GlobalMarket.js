import React, { useState } from 'react';
import { 
  Home, 
  MessageSquare, 
  Bell, 
  ArrowLeft, 
  CheckCircle, 
  Globe, 
  BarChart3, 
  MapPin, 
  Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './GlobalMarket.css';

const GlobalMarketHome = ({ t }) => {
  const demandInsights = [
    {
      id: 1,
      crop: "Organic Turmeric",
      country: "Germany",
      industry: "Pharmaceutical",
      volume: "High",
      priceRange: "$2.5 - $3.8 / kg",
      verified: true
    },
    {
      id: 2,
      crop: "Multani Mitti (Fuller's Earth)",
      country: "UAE",
      industry: "Cosmetic",
      volume: "Medium",
      priceRange: "$1.8 - $2.4 / kg",
      verified: true
    },
    {
      id: 3,
      crop: "Basmati Rice",
      country: "United Kingdom",
      industry: "Food & Beverage",
      volume: "High",
      priceRange: "$1.2 - $1.6 / kg",
      verified: true
    },
    {
      id: 4,
      crop: "Alphonso Mangoes",
      country: "USA",
      industry: "Premium Fruit",
      volume: "Medium",
      priceRange: "$15 - $22 / box",
      verified: true
    }
  ];

  return (
    <motion.div 
      className="market-home-feed"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="feed-header">
        <h2>{t.demandFeed}</h2>
        <p>{t.demandSubtitle}</p>
      </div>
      
      {demandInsights.map((item, index) => (
        <motion.div 
          key={item.id}
          className="demand-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="demand-card-header">
            <div className="verified-badge">
              <CheckCircle size={14} />
              <span>{t.verifiedDemand}</span>
            </div>
          </div>
          
          <div className="demand-card-body">
            <div className="crop-info">
              <h3>{item.crop}</h3>
              <div className="region-info">
                <MapPin size={16} />
                <span>{item.country}</span>
              </div>
            </div>
            
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">{t.industry}</span>
                <span className="stat-value">{item.industry}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">{t.demandVolume}</span>
                <span className={`volume-tag ${item.volume.toLowerCase()}`}>
                  {item.volume}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">{t.expPrice}</span>
                <span className="stat-value price">{item.priceRange}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

const GlobalMarketPosts = ({ t }) => {
  const posts = [
    {
      id: 1,
      company: "Indo-Euro Logistics",
      crop: "Dehydrated Onion Powder",
      quantity: "50 Metric Tons",
      region: "Maharashtra / Gujarat",
      description: "Looking for verified farmers who can provide consistent quality onion powder. We handle all export documentation and global shipping.",
      time: "2h ago"
    },
    {
      id: 2,
      company: "Gulf Food Partners",
      crop: "Green Chilies (G4 Variety)",
      quantity: "10 Tons / Weekly",
      region: "South India",
      description: "Immediate requirement for export-grade green chilies. Weekly procurement cycle. Premium rates for GLOBALGAP certified farms.",
      time: "5h ago"
    }
  ];

  return (
    <motion.div 
      className="market-posts-feed"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {posts.map((post, index) => (
        <motion.div 
          key={post.id}
          className="post-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="post-header">
            <div className="company-logo">
              <Building2 size={24} />
            </div>
            <div className="company-info">
              <div className="company-name">
                <h4>{post.company}</h4>
                <CheckCircle size={14} className="verified-icon" />
              </div>
              <span className="post-time">{post.time}</span>
            </div>
          </div>
          
          <div className="post-content">
            <div className="post-requirement">
              <span className="req-label">{t.required}:</span>
              <span className="req-value">{post.crop}</span>
            </div>
            <p className="post-desc">{post.description}</p>
            
            <div className="post-details">
              <div className="detail">
                <BarChart3 size={16} />
                <span>{post.quantity}</span>
              </div>
              <div className="detail">
                <MapPin size={16} />
                <span>{post.region}</span>
              </div>
            </div>
          </div>
          
          <div className="post-actions">
            <button className="interest-btn">{t.interestedBtn}</button>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

const GlobalMarketNotifications = ({ t }) => {
  const notifications = {
    today: [
      {
        id: 1,
        text: "New export demand for Turmeric from Europe",
        time: "10:30 AM",
        isNew: true
      },
      {
        id: 2,
        text: "Verified Partner: Gulf Food Partners posted a new requirement",
        time: "08:15 AM",
        isNew: true
      }
    ],
    thisWeek: [
      {
        id: 3,
        text: "High demand for Multani Mitti this month in UAE",
        time: "Yesterday",
        isNew: false
      },
      {
        id: 4,
        text: "Monthly Market Insight: Export prices for Basmati Rice increased by 5%",
        time: "2 days ago",
        isNew: false
      }
    ]
  };

  return (
    <motion.div 
      className="market-notifications"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="notif-section">
        <h3>{t.today}</h3>
        {notifications.today.map((notif) => (
          <div key={notif.id} className={`notif-item ${notif.isNew ? 'new' : ''}`}>
            <div className="notif-icon">
              <Bell size={18} />
            </div>
            <div className="notif-text">
              <p>{notif.text}</p>
              <span>{notif.time}</span>
            </div>
            {notif.isNew && <div className="new-dot"></div>}
          </div>
        ))}
      </div>

      <div className="notif-section">
        <h3>{t.thisWeek}</h3>
        {notifications.thisWeek.map((notif) => (
          <div key={notif.id} className="notif-item">
            <div className="notif-icon">
              <Bell size={18} />
            </div>
            <div className="notif-text">
              <p>{notif.text}</p>
              <span>{notif.time}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const GlobalMarket = ({ onBack, t }) => {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <GlobalMarketHome t={t} />;
      case 'posts': return <GlobalMarketPosts t={t} />;
      case 'notifications': return <GlobalMarketNotifications t={t} />;
      default: return <GlobalMarketHome t={t} />;
    }
  };

  return (
    <div className="global-market-page">
      <nav className="market-nav">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={24} />
          <span>{t.dashboard}</span>
        </button>
        <div className="market-logo">
          <Globe size={24} className="globe-icon" />
          <h1>{t.marketAccessTitle}</h1>
        </div>
      </nav>

      <main className="market-main-content">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </main>

      <div className="bottom-tabs">
        <button 
          className={`tab-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <Home size={22} />
          <span>{t.marketHome}</span>
        </button>
        <button 
          className={`tab-item ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          <MessageSquare size={22} />
          <span>{t.marketPosts}</span>
        </button>
        <button 
          className={`tab-item ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <Bell size={22} />
          <span className="notif-badge-pill">2</span>
          <span>{t.marketAlerts}</span>
        </button>
      </div>
    </div>
  );
};

export default GlobalMarket;
