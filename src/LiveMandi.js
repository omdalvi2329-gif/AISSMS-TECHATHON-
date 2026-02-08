import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { MARKET_DATA, MANDIS } from './mandiData';
import './LiveMandi.css';

const LiveMandi = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMandi, setSelectedMandi] = useState('Lasalgaon');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const filteredMandis = useMemo(() => {
    if (!searchTerm.trim()) return MANDIS.slice(0, 10);
    return MANDIS.filter(mandi => 
      mandi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mandi.state.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10);
  }, [searchTerm]);

  const currentPrices = MARKET_DATA[selectedMandi] || [];

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleMandiSelect = (mandiName) => {
    setLoading(true);
    setSelectedMandi(mandiName);
    setSearchTerm('');
    setTimeout(() => setLoading(false), 600);
  };

  const TrendIcon = ({ trend }) => {
    if (trend === 'up') return <TrendingUp className="trend-icon up" size={16} />;
    if (trend === 'down') return <TrendingDown className="trend-icon down" size={16} />;
    return <Minus className="trend-icon stable" size={16} />;
  };

  return (
    <div className="live-mandi-container">
      <header className="mandi-header">
        <h1>Live Mandi Prices</h1>
        <p>Real-time agricultural commodity rates across India</p>
        
        <div className="search-wrapper">
          <div className="search-bar">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Search mandi by name or state..." 
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          
          {searchTerm && filteredMandis.length > 0 && (
            <div className="search-results">
              {filteredMandis.map(mandi => (
                <div 
                  key={mandi.id} 
                  className="search-item"
                  onClick={() => handleMandiSelect(mandi.name)}
                >
                  <MapPin size={14} />
                  <span>{mandi.name}, {mandi.state}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="current-selection-info">
        <MapPin size={18} className="text-green" />
        <span>Showing prices for: <strong>{selectedMandi}</strong></span>
      </div>

      <div className="price-grid">
        {loading ? (
          // Skeleton Loading
          Array(8).fill(0).map((_, i) => (
            <div key={i} className="price-card skeleton">
              <div className="skeleton-title"></div>
              <div className="skeleton-price"></div>
              <div className="skeleton-footer"></div>
            </div>
          ))
        ) : currentPrices.length > 0 ? (
          currentPrices.map((item) => (
            <div key={item.id} className="price-card">
              <div className="card-header">
                <h3>{item.product}</h3>
                <TrendIcon trend={item.trend} />
              </div>
              
              <div className="price-info">
                <div className="price-main">
                  <span className="label">Current Avg</span>
                  <span className="value">₹{item.price}</span>
                </div>
                <div className="price-range">
                  <div className="range-item">
                    <span className="label">Min</span>
                    <span className="value">₹{item.min}</span>
                  </div>
                  <div className="range-item">
                    <span className="label">Max</span>
                    <span className="value">₹{item.max}</span>
                  </div>
                </div>
              </div>

              <div className="card-footer">
                <span className="unit">per {item.unit}</span>
                <span className={`trend-tag ${item.trend}`}>
                  {item.trendPercentage} {item.trend !== 'stable' && (item.trend === 'up' ? 'Increase' : 'Decrease')}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <Info size={48} />
            <p>No data available for this mandi.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveMandi;
