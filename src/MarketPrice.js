import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Clock, 
  MapPin, 
  Filter,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MANDIS, MARKET_DATA } from './mandiData';
import './MarketPrice.css';

const MarketPrice = ({ onBack, t }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMandi, setSelectedMandi] = useState('Lasalgaon');
  const [isLoading, setIsLoading] = useState(false);
  const [marketData, setMarketData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter suggestions based on search term
  const suggestions = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return MANDIS.filter(m => 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.state.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);
  }, [searchTerm]);

  useEffect(() => {
    loadMarketData('Lasalgaon');
    setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const loadMarketData = (mandiName) => {
    setIsLoading(true);
    setShowSuggestions(false);
    // Simulate API delay
    setTimeout(() => {
      const data = MARKET_DATA[mandiName] || [];
      setMarketData(data);
      setSelectedMandi(mandiName);
      setIsLoading(false);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      // Scroll to top on load
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
  };

  const handleSuggestionClick = (mandiName) => {
    setSearchTerm(mandiName);
    loadMarketData(mandiName);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp size={16} />;
      case 'down': return <TrendingDown size={16} />;
      default: return <Minus size={16} />;
    }
  };

  return (
    <div className="market-price-page">
      {/* Header Area */}
      <header className="market-header">
        <div className="header-top">
          <button className="back-button" onClick={onBack}>
            <ArrowLeft size={24} />
          </button>
          <h1>{t.marketPrice || 'Market Price'}</h1>
          <div className="header-actions">
            <button className="icon-btn refresh-btn" onClick={() => loadMarketData(selectedMandi)}>
              <RefreshCw size={20} className={isLoading ? 'spinning' : ''} />
            </button>
          </div>
        </div>

        <div className="search-container">
          <div className="search-bar-wrapper">
            <div className="search-bar">
              <Search className="search-icon" size={20} />
              <input 
                type="text" 
                placeholder="Search mandi (e.g. Pune, Indore, Azadpur)" 
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setShowSuggestions(true)}
              />
              <Filter className="filter-icon" size={20} />
            </div>
            
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div 
                  className="suggestions-dropdown"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {suggestions.map(m => (
                    <button 
                      key={m.id} 
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(m.name)}
                    >
                      <MapPin size={16} />
                      <div className="suggestion-info">
                        <span className="suggestion-name">{m.name}</span>
                        <span className="suggestion-state">{m.state}</span>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="current-location-bar">
          <div className="mandi-info">
            <MapPin size={16} />
            <span>Mandi: <strong>{selectedMandi}</strong></span>
          </div>
          <div className="last-updated">
            <Clock size={14} /> {lastUpdated}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="market-content">
        {isLoading ? (
          <div className="skeleton-container">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="skeleton-card"></div>
            ))}
          </div>
        ) : marketData.length > 0 ? (
          <motion.div 
            className="price-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {marketData.map((item) => (
              <motion.div 
                key={item.id} 
                className="market-card"
                variants={cardVariants}
                whileHover={{ y: -5 }}
              >
                <div className="card-top">
                  <div className="crop-info">
                    <div className="crop-icon-bg">
                      <TrendingUp size={20} className="crop-icon" />
                    </div>
                    <div>
                      <h3>{item.crop}</h3>
                      <p className="mandi-tag">{item.category}</p>
                    </div>
                  </div>
                  <div className={`trend-indicator ${item.trend}`}>
                    {getTrendIcon(item.trend)}
                    <span>{item.trendPercentage}</span>
                  </div>
                </div>
                
                <div className="card-price-info">
                  <div className="price-main">
                    <span className="currency">₹</span>
                    <span className="amount">{item.price}</span>
                    <span className="unit">/{item.unit}</span>
                  </div>
                  <ChevronRight size={20} className="details-arrow" />
                </div>

                <div className="card-footer">
                  <span className="state-pill">{item.state}</span>
                  <span className="update-time">{item.lastUpdated}</span>
                </div>
                <div className="card-glow"></div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon-wrapper">
              <Search size={48} />
            </div>
            <h3>No market data available</h3>
            <p>We couldn't find any results for "{searchTerm}". Please try another mandi or location.</p>
            <button className="reset-btn" onClick={() => {
              setSearchTerm('');
              loadMarketData('Lasalgaon');
            }}>
              Reset Search
            </button>
          </div>
        )}
      </main>

      {/* Bottom Floating Info */}
      <div className="market-footer-info">
        <p>Real-time mock data for hackathon demonstration purposes.</p>
      </div>
    </div>
  );
};

export default MarketPrice;

