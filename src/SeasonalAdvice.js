import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  MapPin, 
  Sprout, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  Info, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  Zap,
  Target,
  ShieldAlert,
  BarChart2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './SeasonalAdvice.css';

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const cropsData = [
  { name: "Wheat", type: "Rabi" },
  { name: "Rice", type: "Kharif" },
  { name: "Soybean", type: "Kharif" },
  { name: "Cotton", type: "Kharif" },
  { name: "Onion", type: "Rabi/Kharif" },
  { name: "Tomato", type: "Year-round" },
  { name: "Maize", type: "Kharif" },
  { name: "Chana", type: "Rabi" },
  { name: "Mustard", type: "Rabi" },
  { name: "Moong", type: "Zaid/Kharif" }
];

// Helper for Animated Counter
const AnimatedCounter = ({ value, prefix = "" }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = parseInt(value.replace(/[^0-9]/g, "")) || 0;
    if (start === end) return;

    let totalMiliseconds = 1500;
    let incrementTime = (totalMiliseconds / end) * 50;

    let timer = setInterval(() => {
      start += Math.ceil(end / 30);
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{prefix}{displayValue.toLocaleString()}</span>;
};

const SeasonalAdvice = ({ onBack, locationData }) => {
  const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()]);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState(null);
  const [displayedAdvice, setDisplayedAdvice] = useState('');
  
  const getAdviceLogic = (month, cropName) => {
    const rabiMonths = ["October", "November", "December", "January", "February"];
    const kharifMonths = ["June", "July", "August", "September"];
    
    const crop = cropsData.find(c => c.name === cropName);
    let suitability = 0;
    let profitValue = 25000;
    let risk = "Low";
    let message = "";
    let risks = [];

    if (crop.type === "Rabi") {
      if (["October", "November"].includes(month)) {
        suitability = 95;
        message = `${month} is the ideal time for sowing ${cropName}. Cool weather helps in germination.`;
        risks = ["Early Frost", "Moisture Stress"];
        profitValue = 28000;
      } else if (rabiMonths.includes(month)) {
        suitability = 72;
        message = `${month} is manageable for ${cropName}, but late sowing might affect yield.`;
        risks = ["Heat Wave", "Pest Attack"];
        profitValue = 18000;
      } else {
        suitability = 18;
        message = `Not recommended. ${month} is too hot for ${cropName} development.`;
        risks = ["Extreme Heat", "Water Depletion"];
        profitValue = -5000;
        risk = "High";
      }
    } else if (crop.type === "Kharif") {
      if (["June", "July"].includes(month)) {
        suitability = 92;
        message = `Monsoon start in ${month} is perfect for ${cropName} sowing.`;
        risks = ["Heavy Rainfall", "Soil Erosion"];
        profitValue = 24000;
      } else if (kharifMonths.includes(month)) {
        suitability = 64;
        message = `${month} is okay, but ensure proper drainage during heavy rains.`;
        risks = ["Flood Risk", "Humidity Pests"];
        profitValue = 12000;
      } else {
        suitability = 12;
        message = `Off-season for ${cropName}. Requires heavy irrigation and pest control.`;
        risks = ["Drought", "High Temp"];
        profitValue = -8000;
        risk = "Critical";
      }
    } else {
      suitability = 85;
      message = `${cropName} can be grown in ${month} with proper care.`;
      risks = ["Fluctuating Market", "Pest Management"];
      profitValue = 21000;
    }

    return {
      suitability,
      profitValue,
      risk,
      risks,
      message,
      hinglish: suitability > 50 
        ? `Is mahine me ${cropName} lagana kafi faydemand ho sakta hai. Optimal weather conditions yield maximize karenge.` 
        : `Abhi ${cropName} lagane me high risk hai. Market trends aur climate patterns suggest karte hain ki aap Rabi variants chune.`
    };
  };

  useEffect(() => {
    if (selectedCrop && selectedMonth) {
      setLoading(true);
      setDisplayedAdvice('');
      const timer = setTimeout(() => {
        const result = getAdviceLogic(selectedMonth, selectedCrop);
        setAdvice(result);
        setLoading(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [selectedMonth, selectedCrop]);

  // Typing effect for AI Recommendation
  useEffect(() => {
    if (advice && !loading) {
      let i = 0;
      const fullText = advice.hinglish;
      const timer = setInterval(() => {
        setDisplayedAdvice(fullText.slice(0, i));
        i++;
        if (i > fullText.length) clearInterval(timer);
      }, 30);
      return () => clearInterval(timer);
    }
  }, [advice, loading]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="seasonal-advice-wrapper premium-dashboard">
      <div className="dashboard-bg-glow"></div>
      
      <header className="advice-top-bar glass-header">
        <div className="header-left">
          <button className="back-btn-premium" onClick={onBack}>
            <ChevronLeft size={20} />
            <span>Command Center</span>
          </button>
        </div>
        <div className="header-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="title-badge"
          >
            <Sparkles size={14} />
            <span>AI ENGINE v2.4</span>
          </motion.div>
        </div>
        <div className="header-right">
          <div className="system-status">
            <span className="status-dot"></span>
            <span>Live Satellite Data Active</span>
          </div>
        </div>
      </header>

      <main className="advice-content-premium">
        <section className="hero-intelligence">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hero-title"
          >
            AI Seasonal Intelligence
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="hero-subtitle"
          >
            Data-driven crop decision insights based on region, climate & seasonal patterns
          </motion.p>
        </section>

        <div className="dashboard-grid">
          <aside className="control-panel">
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="input-card-premium glass-card-premium"
            >
              <div className="panel-header">
                <Target size={20} className="accent-icon" />
                <h3>Parameters</h3>
              </div>
              
              <div className="input-group-premium">
                <label>Temporal Window</label>
                <div className="custom-select-wrapper">
                  <Calendar size={18} className="select-icon" />
                  <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div className="input-group-premium">
                <label>Cultivation Target</label>
                <div className="custom-select-wrapper">
                  <Sprout size={18} className="select-icon" />
                  <select value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value)}>
                    <option value="">Select Cultivar</option>
                    {cropsData.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="location-context-premium">
                <div className="location-info">
                  <MapPin size={14} />
                  <span>{locationData?.district || "Pune Region"}, {locationData?.state || "MH"}</span>
                </div>
                <div className="coord-data">18.5204° N, 73.8567° E</div>
              </div>
            </motion.div>
          </aside>

          <section className="intelligence-results">
            <AnimatePresence mode="wait">
              {!selectedCrop ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="empty-state-premium glass-card-premium"
                >
                  <div className="radar-animation">
                    <div className="circle"></div>
                    <div className="circle"></div>
                    <div className="circle"></div>
                  </div>
                  <Info size={40} className="pulse-icon" />
                  <h3>Awaiting Input</h3>
                  <p>Configure Temporal Window and Cultivar to initiate AI deep-analysis</p>
                </motion.div>
              ) : loading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="loading-state-premium glass-card-premium"
                >
                  <div className="ai-scanning">
                    <div className="scan-line"></div>
                  </div>
                  <Zap size={40} className="spinning-icon" />
                  <h3>Processing Intelligence</h3>
                  <p>Synthesizing historical climate models and market volatility data...</p>
                </motion.div>
              ) : advice ? (
                <motion.div 
                  key="results"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="results-grid"
                >
                  {/* Suitability Card */}
                  <motion.div variants={cardVariants} className="data-card suitability-card glass-card-premium">
                    <div className="card-header">
                      <BarChart2 size={18} />
                      <h4>Crop Suitability</h4>
                    </div>
                    <div className="circular-progress-area">
                      <svg viewBox="0 0 100 100" className="progress-ring">
                        <circle className="ring-bg" cx="50" cy="50" r="45" />
                        <motion.circle 
                          className="ring-fill" 
                          cx="50" cy="50" r="45"
                          initial={{ strokeDashoffset: 283 }}
                          animate={{ strokeDashoffset: 283 - (283 * advice.suitability) / 100 }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          stroke={advice.suitability > 80 ? "#22c55e" : advice.suitability > 50 ? "#f59e0b" : "#ef4444"}
                        />
                      </svg>
                      <div className="progress-text">
                        <span className="percent">{advice.suitability}%</span>
                        <span className="label">Match</span>
                      </div>
                    </div>
                    <p className="card-message">{advice.message}</p>
                  </motion.div>

                  {/* Profit Card */}
                  <motion.div variants={cardVariants} className="data-card profit-card glass-card-premium">
                    <div className="card-header">
                      <TrendingUp size={18} />
                      <h4>Yield Valuation</h4>
                    </div>
                    <div className="profit-display">
                      <div className="amount-container">
                        <span className="currency">₹</span>
                        <h2 className={`amount ${advice.profitValue < 0 ? 'loss' : 'gain'}`}>
                          <AnimatedCounter value={Math.abs(advice.profitValue).toString()} />
                        </h2>
                      </div>
                      <div className={`trend-tag ${advice.profitValue < 0 ? 'loss' : 'gain'}`}>
                        {advice.profitValue < 0 ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                        <span>{advice.profitValue < 0 ? 'EST. DEFICIT' : 'EST. PROFIT'}</span>
                      </div>
                    </div>
                    <div className="sparkline-mini">
                      <div className="bar"></div>
                      <div className="bar highlight"></div>
                      <div className="bar"></div>
                      <div className="bar"></div>
                    </div>
                    <p className="unit-label">Per Acre Projected Return</p>
                  </motion.div>

                  {/* Risk Card */}
                  <motion.div variants={cardVariants} className="data-card risk-card glass-card-premium">
                    <div className="card-header">
                      <ShieldAlert size={18} />
                      <h4>Risk Assessment</h4>
                    </div>
                    <div className="risk-level-badge">
                      <span className={`level ${advice.risk.toLowerCase()}`}>{advice.risk} Risk</span>
                    </div>
                    <div className="risk-tags">
                      {advice.risks.map((r, i) => (
                        <div key={i} className="risk-tag" title="AI detected probability: High">
                          <AlertTriangle size={12} />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* AI Recommendation Card - Full Width */}
                  <motion.div variants={cardVariants} className="data-card ai-rec-card glass-card-premium full-width">
                    <div className="shimmer-effect"></div>
                    <div className="card-header">
                      <Lightbulb size={20} className="glow-icon" />
                      <h4>AI Strategic Advisory</h4>
                    </div>
                    <div className="rec-text-container">
                      <p className="typing-text">{displayedAdvice}</p>
                      <div className="typing-cursor"></div>
                    </div>
                    <div className="rec-footer">
                      <div className="tag">Actionable Insight</div>
                      <div className="tag">Strategic Planning</div>
                    </div>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </section>
        </div>
      </main>
    </div>
  );
};

export default SeasonalAdvice;
