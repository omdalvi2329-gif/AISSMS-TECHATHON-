import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabaseClient';
import { 
  Home, 
  MessageSquare, 
  Bell, 
  ArrowLeft,
  CheckCircle, 
  Globe, 
  Building2,
  TrendingUp,
  ChevronRight,
  X,
  Info,
  Truck,
  ShieldCheck,
  Sprout,
  Handshake,
  Loader2,
  Globe2,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import './GlobalMarket.css';

const GlobalMarketHome = ({ t, setGlobalRequests, setShowRequestDropdown }) => {
  const [selectedCrop, setSelectedCrop] = useState("Organic Turmeric");
  const [farmSize, setFarmSize] = useState(5);
  const [location, setLocation] = useState("Maharashtra, India");
  const [expandedRisk, setExpandedRisk] = useState(false);
  const [expectedYield, setExpectedYield] = useState(10); // per acre
  const [showBuyerModal, setShowBuyerModal] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [timeFilter, setTimeFilter] = useState('7D');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showLogisticsDrawer, setShowLogisticsDrawer] = useState(false);
  const [dbProfile, setDbProfile] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && isMounted) {
          const { data } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
          if (data && isMounted) setDbProfile(data);
        }
      } catch (err) {
        if (isMounted) console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
    return () => { isMounted = false; };
  }, []);

  const cropsData = {
    "Organic Turmeric": {
      bestCountry: "Germany",
      flag: "🇩🇪",
      reason: "High demand for clean-label organic spices and low seasonal competition.",
      demandScore: 88,
      riskLevel: "Low",
      profitMargin: 42,
      logisticsCost: "₹45,000",
      netEarnings: "₹8.4L",
      domesticPrice: 80,
      exportPrice: 240,
      riskBreakdown: {
        currency: { level: "Low", desc: "Stable EUR/INR exchange rate forecast." },
        policy: { level: "Low", desc: "No upcoming trade barriers for organic spices." },
        demand: { level: "Medium", desc: "Seasonal dip expected in early Q3." },
        logistics: { level: "Low", desc: "Established shipping lanes to Hamburg." }
      },
      buyers: [
        { country: "Germany", importers: 12, volume: "450 Tons", flag: "🇩🇪", certs: "EU Organic, GLOBALGAP" },
        { country: "Netherlands", importers: 8, volume: "300 Tons", flag: "🇳🇱", certs: "EU Organic" }
      ],
      priceTrends: {
        '7D': [
          { name: 'Day 1', price: 210 }, { name: 'Day 2', price: 215 }, { name: 'Day 3', price: 212 },
          { name: 'Day 4', price: 225 }, { name: 'Day 5', price: 235 }, { name: 'Day 6', price: 238 },
          { name: 'Day 7', price: 240 }
        ],
        '30D': Array.from({ length: 30 }, (_, i) => ({ name: `Day ${i+1}`, price: 200 + Math.random() * 50 })),
        '6M': Array.from({ length: 6 }, (_, i) => ({ name: `Month ${i+1}`, price: 180 + Math.random() * 80 }))
      },
      logistics: {
        cost: "₹45,000",
        port: "Nhava Sheva (JNPT) to Hamburg",
        timeline: "22-25 Days",
        checklist: ["Phytosanitary Certificate", "Commercial Invoice", "Packing List", "Bill of Lading", "Organic Certificate (EU Standard)"]
      }
    },
    "Basmati Rice": {
      bestCountry: "UAE",
      flag: "🇦🇪",
      reason: "Consistent demand for premium long-grain rice and favorable import duty relaxations.",
      demandScore: 92,
      riskLevel: "Medium",
      profitMargin: 35,
      logisticsCost: "₹28,000",
      netEarnings: "₹12.2L",
      domesticPrice: 65,
      exportPrice: 115,
      riskBreakdown: {
        currency: { level: "Low", desc: "Dirham is pegged to USD, low volatility." },
        policy: { level: "Medium", desc: "New food security regulations being implemented." },
        demand: { level: "Low", desc: "Steady year-round consumption pattern." },
        logistics: { level: "Medium", desc: "Port congestion reported at Jebel Ali." }
      },
      buyers: [
        { country: "UAE", importers: 25, volume: "2200 Tons", flag: "🇦🇪", certs: "HACCP, ISO 22000" },
        { country: "Saudi Arabia", importers: 18, volume: "1800 Tons", flag: "🇸🇦", certs: "SFDA Registered" }
      ],
      priceTrends: {
        '7D': Array.from({ length: 7 }, (_, i) => ({ name: `Day ${i+1}`, price: 100 + Math.random() * 20 })),
        '30D': Array.from({ length: 30 }, (_, i) => ({ name: `Day ${i+1}`, price: 90 + Math.random() * 40 })),
        '6M': Array.from({ length: 6 }, (_, i) => ({ name: `Month ${i+1}`, price: 85 + Math.random() * 50 }))
      },
      logistics: {
        cost: "₹28,000",
        port: "Mundra to Jebel Ali",
        timeline: "4-6 Days",
        checklist: ["FSSAI License", "Health Certificate", "Certificate of Origin", "SGS Inspection Report"]
      }
    },
    "Multani Mitti": {
      bestCountry: "USA",
      flag: "🇺🇸",
      reason: "Rising trend in natural skincare and high margin in premium cosmetic retailers.",
      demandScore: 75,
      riskLevel: "Low",
      profitMargin: 55,
      logisticsCost: "₹55,000",
      netEarnings: "₹6.2L",
      domesticPrice: 40,
      exportPrice: 180,
      riskBreakdown: {
        currency: { level: "Low", desc: "USD remains strong against INR." },
        policy: { level: "Low", desc: "Standard FDA cosmetic regulations apply." },
        demand: { level: "High", desc: "High growth in organic beauty sector." },
        logistics: { level: "Medium", desc: "High air freight costs for small batches." }
      },
      buyers: [
        { country: "USA", importers: 15, volume: "120 Tons", flag: "🇺🇸", certs: "FDA Approved, GMP" },
        { country: "UK", importers: 9, volume: "85 Tons", flag: "🇬🇧", certs: "UKCA, COSMOS" }
      ],
      priceTrends: {
        '7D': Array.from({ length: 7 }, (_, i) => ({ name: `Day ${i+1}`, price: 160 + Math.random() * 30 })),
        '30D': Array.from({ length: 30 }, (_, i) => ({ name: `Day ${i+1}`, price: 150 + Math.random() * 50 })),
        '6M': Array.from({ length: 6 }, (_, i) => ({ name: `Month ${i+1}`, price: 140 + Math.random() * 60 }))
      },
      logistics: {
        cost: "₹55,000",
        port: "Nhava Sheva to New York",
        timeline: "28-32 Days",
        checklist: ["FDA Registration", "MSDS (Safety Data Sheet)", "Inorganic Matter Test Report", "Commercial Invoice"]
      }
    },
    "Neem Powder": {
      bestCountry: "Japan",
      flag: "🇯🇵",
      reason: "Demand for bio-pesticides and natural health supplements in East Asian markets.",
      demandScore: 82,
      riskLevel: "Medium",
      profitMargin: 48,
      logisticsCost: "₹50,000",
      netEarnings: "₹5.5L",
      domesticPrice: 120,
      exportPrice: 450,
      riskBreakdown: {
        currency: { level: "Medium", desc: "JPY/INR volatility due to interest rate changes." },
        policy: { level: "Medium", desc: "Strict quality standards for herbal products." },
        demand: { level: "Low", desc: "Steady demand for bio-agri inputs." },
        logistics: { level: "Low", desc: "Efficient sea routes to Tokyo/Osaka." }
      },
      buyers: [
        { country: "Japan", importers: 11, volume: "180 Tons", flag: "🇯🇵", certs: "JAS Organic" },
        { country: "South Korea", importers: 7, volume: "110 Tons", flag: "🇰🇷", certs: "KFDA Certified" }
      ],
      priceTrends: {
        '7D': Array.from({ length: 7 }, (_, i) => ({ name: `Day ${i+1}`, price: 420 + Math.random() * 50 })),
        '30D': Array.from({ length: 30 }, (_, i) => ({ name: `Day ${i+1}`, price: 400 + Math.random() * 80 })),
        '6M': Array.from({ length: 6 }, (_, i) => ({ name: `Month ${i+1}`, price: 380 + Math.random() * 100 }))
      },
      logistics: {
        cost: "₹50,000",
        port: "Chennai to Yokohama",
        timeline: "15-18 Days",
        checklist: ["JAS Certification", "Non-GMO Declaration", "Phytosanitary Certificate", "Lab Analysis Report"]
      }
    },
    "Neem Oil": {
      bestCountry: "Australia",
      flag: "🇦🇺",
      reason: "High demand in organic gardening and eco-friendly household pest control.",
      demandScore: 79,
      riskLevel: "Low",
      profitMargin: 50,
      logisticsCost: "₹42,000",
      netEarnings: "₹7.1L",
      domesticPrice: 250,
      exportPrice: 850,
      riskBreakdown: {
        currency: { level: "Low", desc: "Stable AUD/INR exchange rate." },
        policy: { level: "Low", desc: "Favorable trade agreements for bio-inputs." },
        demand: { level: "Low", desc: "Consistent year-round demand." },
        logistics: { level: "Low", desc: "Reliable shipping to Melbourne/Sydney." }
      },
      buyers: [
        { country: "Australia", importers: 14, volume: "250 Tons", flag: "🇦🇺", certs: "ACO Organic" },
        { country: "Canada", importers: 10, volume: "190 Tons", flag: "🇨🇦", certs: "COR Organic" }
      ],
      priceTrends: {
        '7D': Array.from({ length: 7 }, (_, i) => ({ name: `Day ${i+1}`, price: 800 + Math.random() * 100 })),
        '30D': Array.from({ length: 30 }, (_, i) => ({ name: `Day ${i+1}`, price: 750 + Math.random() * 150 })),
        '6M': Array.from({ length: 6 }, (_, i) => ({ name: `Month ${i+1}`, price: 700 + Math.random() * 200 }))
      },
      logistics: {
        cost: "₹42,000",
        port: "Visakhapatnam to Sydney",
        timeline: "18-22 Days",
        checklist: ["ACO Accreditation", "MSDS", "Analysis Certificate", "B/L"]
      }
    },
    "Sandalwood Powder": {
      bestCountry: "France",
      flag: "🇫🇷",
      reason: "Premium ingredient for luxury perfume industry in Grasse and Paris.",
      demandScore: 95,
      riskLevel: "High",
      profitMargin: 65,
      logisticsCost: "₹85,000",
      netEarnings: "₹18.5L",
      domesticPrice: 1500,
      exportPrice: 4200,
      riskBreakdown: {
        currency: { level: "Low", desc: "Stable EUR exchange rate." },
        policy: { level: "High", desc: "CITES regulations and strict export permits." },
        demand: { level: "Low", desc: "Constant demand from luxury brands." },
        logistics: { level: "Medium", desc: "High security transport required." }
      },
      buyers: [
        { country: "France", importers: 18, volume: "45 Tons", flag: "🇫🇷", certs: "CITES Permit, IFRA" },
        { country: "Switzerland", importers: 6, volume: "22 Tons", flag: "🇨🇭", certs: "ISO 9001" }
      ],
      priceTrends: {
        '7D': Array.from({ length: 7 }, (_, i) => ({ name: `Day ${i+1}`, price: 4000 + Math.random() * 300 })),
        '30D': Array.from({ length: 30 }, (_, i) => ({ name: `Day ${i+1}`, price: 3800 + Math.random() * 500 })),
        '6M': Array.from({ length: 6 }, (_, i) => ({ name: `Month ${i+1}`, price: 3500 + Math.random() * 800 }))
      },
      logistics: {
        cost: "₹85,000",
        port: "Bengaluru (Air) to Paris (CDG)",
        timeline: "2-3 Days",
        checklist: ["CITES Export Permit", "Wildlife Board NOC", "Security Clearance", "IFRA Compliance Doc"]
      }
    },
    "Aloe Vera Powder": {
      bestCountry: "UK",
      flag: "🇬🇧",
      reason: "High growth in vegan health drinks and natural skincare formulations.",
      demandScore: 84,
      riskLevel: "Low",
      profitMargin: 38,
      logisticsCost: "₹38,000",
      netEarnings: "₹4.8L",
      domesticPrice: 180,
      exportPrice: 520,
      riskBreakdown: {
        currency: { level: "Low", desc: "GBP remains a strong currency." },
        policy: { level: "Low", desc: "Simplified import rules for plant extracts." },
        demand: { level: "Medium", desc: "High competition from Mexican suppliers." },
        logistics: { level: "Low", desc: "Fast shipping routes to London." }
      },
      buyers: [
        { country: "UK", importers: 22, volume: "320 Tons", flag: "🇬🇧", certs: "Soil Association, BRC" },
        { country: "Germany", importers: 16, volume: "280 Tons", flag: "🇩🇪", certs: "EU Organic" }
      ],
      priceTrends: {
        '7D': Array.from({ length: 7 }, (_, i) => ({ name: `Day ${i+1}`, price: 480 + Math.random() * 60 })),
        '30D': Array.from({ length: 30 }, (_, i) => ({ name: `Day ${i+1}`, price: 450 + Math.random() * 100 })),
        '6M': Array.from({ length: 6 }, (_, i) => ({ name: `Month ${i+1}`, price: 420 + Math.random() * 150 }))
      },
      logistics: {
        cost: "₹38,000",
        port: "Kandla to Felixstowe",
        timeline: "24-27 Days",
        checklist: ["Health Certificate", "Certificate of Analysis", "Packing List", "Invoice"]
      }
    }
  };

  const currentData = cropsData[selectedCrop] || cropsData["Organic Turmeric"];

  const readinessScore = useMemo(() => {
    const factors = {
      demand: currentData.demandScore * 0.4,
      risk: (currentData.riskLevel === "Low" ? 90 : currentData.riskLevel === "Medium" ? 60 : 30) * 0.3,
      size: Math.min(farmSize * 10, 100) * 0.2,
      yield: Math.min(expectedYield * 8, 100) * 0.1
    };
    return Math.round(factors.demand + factors.risk + factors.size + factors.yield);
  }, [currentData.demandScore, currentData.riskLevel, farmSize, expectedYield]);

  const domesticRev = farmSize * expectedYield * currentData.domesticPrice;
  const exportRev = farmSize * expectedYield * currentData.exportPrice;
  const profitIncrease = domesticRev > 0 ? ((exportRev - domesticRev) / domesticRev * 100).toFixed(1) : 0;

  const AnimatedNumber = ({ value, prefix = "", suffix = "" }) => {
    const [displayValue, setDisplayValue] = useState(0);
    useEffect(() => {
      let start = 0;
      const end = parseFloat(value);
      if (start === end) return;
      let totalMiliseconds = 1000;
      let incrementTime = (totalMiliseconds / end) * 5;
      let timer = setInterval(() => {
        start += 1;
        setDisplayValue(Math.min(start, end));
        if (start >= end) clearInterval(timer);
      }, incrementTime);
      return () => clearInterval(timer);
    }, [value]);
    return <span>{prefix}{displayValue.toLocaleString()}{suffix}</span>;
  };

  const handleBuyerRequest = (buyer) => {
    setSelectedBuyer(buyer);
    setShowBuyerModal(true);
    
    // Create request object for Global Request Viewer
    const newRequest = {
      id: Date.now(),
      cropName: selectedCrop,
      country: buyer.country,
      exportPrice: currentData.exportPrice,
      logisticsCost: currentData.logisticsCost,
      demandScore: currentData.demandScore,
      timestamp: new Date().toLocaleString(),
      status: "Pending"
    };
    
    setGlobalRequests(prev => [newRequest, ...prev]);
    // Show dropdown automatically to give feedback
    setShowRequestDropdown(true);
  };

  const handleDownloadReport = () => {
    alert(`Generating Market Intelligence Report for ${selectedCrop}...\nReport will be downloaded shortly.`);
  };

  const submitBuyerRequest = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Please login to submit requests");
        return;
      }

      const { error } = await supabase.from('market_requests').insert([{
        user_id: user.id,
        crop_name: selectedCrop,
        quantity: e.target.elements[0].value,
        expected_price: parseFloat(e.target.elements[1].value),
        location: dbProfile?.village ? `${dbProfile.village}, ${dbProfile.state}` : "Unknown",
        status: 'pending'
      }]);

      if (error) throw error;

      setIsSubmitted(true);
      setTimeout(() => {
        setShowBuyerModal(false);
        setIsSubmitted(false);
        setSelectedBuyer(null);
      }, 2000);
    } catch (err) {
      console.error("Error submitting request:", err);
      alert("Error submitting request: " + (err.message || "Failed to fetch"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      className="market-home-feed"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Control Panel */}
      <div className="intelligence-controls glass-card mb-6">
        <div className="control-group">
          <label>Selected Crop</label>
          <select value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value)}>
            {Object.keys(cropsData).map(crop => <option key={crop} value={crop}>{crop}</option>)}
          </select>
        </div>
        <div className="control-group">
          <label>Farm Size (Acres)</label>
          <input type="number" value={farmSize} onChange={(e) => setFarmSize(parseFloat(e.target.value) || 0)} />
        </div>
        <div className="control-group">
          <label>Location</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
      </div>

      {/* Top Export Opportunity Card */}
      <motion.div 
        className="premium-recommendation-card glass-card mb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="card-header-flex">
          <div className="header-text">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-white">Top Export Opportunity</h2>
              <span className="premium-tag">High Demand</span>
            </div>
            <p className="text-gray-400">
              {currentData.bestCountry} {currentData.flag} • {currentData.reason}
            </p>
          </div>
          <div className="header-actions">
            <button className="subtle-action-btn" onClick={() => setExpandedRisk(!expandedRisk)}>
              <Info size={16} />
              <span>Market Insights</span>
            </button>
          </div>
        </div>

        <div className="opportunity-stats mt-6">
          <div className="opp-stat">
            <span className="label">Potential Earnings</span>
            <strong className="value text-green-400">{currentData.netEarnings}</strong>
          </div>
          <div className="opp-stat">
            <span className="label">Export Price</span>
            <strong className="value">₹{currentData.exportPrice}/kg</strong>
          </div>
          <div className="opp-stat">
            <span className="label">Logistics</span>
            <strong className="value">{currentData.logisticsCost}</strong>
          </div>
          <div className="opp-stat">
            <span className="label">Demand Score</span>
            <strong className="value text-blue-400">{currentData.demandScore}/100</strong>
          </div>
        </div>

        <div className="card-footer-actions mt-8">
          <button className="premium-glow-btn" onClick={() => handleBuyerRequest(currentData.buyers[0])}>
            <ShieldCheck size={18} />
            <span>Request Connection</span>
          </button>
          <button className="secondary-glass-btn" onClick={handleDownloadReport}>
            <TrendingUp size={18} />
            <span>Market Report</span>
          </button>
          <button className="secondary-glass-btn" onClick={() => setShowLogisticsDrawer(true)}>
            <Truck size={18} />
            <span>Logistics Plan</span>
          </button>
        </div>

        <AnimatePresence>
          {expandedRisk && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="market-details-expand mt-6"
            >
              <div className="why-market-grid-premium">
                <div className="why-item-premium">
                  <span className="label">Risk Level</span>
                  <strong className={`value ${currentData.riskLevel === 'Low' ? 'text-green-400' : 'text-yellow-400'}`}>{currentData.riskLevel}</strong>
                </div>
                <div className="why-item-premium">
                  <span className="label">Competition</span>
                  <strong className="value text-blue-400">Low</strong>
                </div>
                <div className="why-item-premium">
                  <span className="label">Seasonality</span>
                  <strong className="value text-purple-400">Peak</strong>
                </div>
                <div className="why-item-premium">
                  <span className="label">Mandi Price</span>
                  <strong className="value">₹{currentData.domesticPrice}/kg</strong>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Logistics Side Drawer */}
      <AnimatePresence>
        {showLogisticsDrawer && (
          <>
            <motion.div 
              className="drawer-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogisticsDrawer(false)}
            />
            <motion.div 
              className="side-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="drawer-header">
                <div className="flex items-center gap-3">
                  <Truck className="text-green-500" />
                  <h2>Logistics Plan: {selectedCrop}</h2>
                </div>
                <button onClick={() => setShowLogisticsDrawer(false)} className="close-drawer"><X /></button>
              </div>
              <div className="drawer-content">
                <div className="logistics-stat-card">
                  <span className="label">Estimated Cost</span>
                  <strong>{currentData.logistics.cost}</strong>
                </div>
                <div className="logistics-stat-card mt-4">
                  <span className="label">Recommended Route</span>
                  <strong>{currentData.logistics.port}</strong>
                </div>
                <div className="logistics-stat-card mt-4">
                  <span className="label">Transit Timeline</span>
                  <strong>{currentData.logistics.timeline}</strong>
                </div>
                
                <div className="document-checklist mt-8">
                  <h3>Required Documentation</h3>
                  <div className="checklist-items">
                    {currentData.logistics.checklist.map((item, idx) => (
                      <div key={idx} className="checklist-item">
                        <CheckCircle size={16} className="text-green-500" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <button className="premium-cta-btn w-full mt-8">Book Logistics Partners</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="market-intelligence-grid-v2">
        {/* Left Column: Scores */}
        <div className="grid-left-col">
          <div className="score-card-v2 glass-card mb-4 group hover-scale">
            <div className="flex justify-between items-center mb-6">
              <h3>Export Readiness</h3>
              <div className="tooltip-container">
                <Info size={16} className="text-gray-500" />
                <div className="tooltip-content">
                  <p>Readiness Breakdown:</p>
                  <ul>
                    <li>Market Fit: 90%</li>
                    <li>Compliance: 85%</li>
                    <li>Capacity: 70%</li>
                    <li>Risk Alignment: 95%</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="readiness-display-v2">
              <div className="circular-progress-v2" style={{ '--percent': readinessScore }}>
                <div className="inner-circle-v2">
                  <AnimatedNumber value={readinessScore} suffix="/100" />
                </div>
              </div>
              <div className="status-badge-container-v2">
                <span className={`status-tag-v2 ${readinessScore > 85 ? 'excellent' : readinessScore > 70 ? 'good' : 'moderate'}`}>
                  {readinessScore > 85 ? 'Excellent' : readinessScore > 70 ? 'Good' : 'Moderate'}
                </span>
                <p className="text-sm text-gray-400 mt-2">Ready for international markets.</p>
              </div>
            </div>
          </div>

          <div className="demand-score-card-v2 glass-card hover-scale">
            <div className="flex justify-between items-center mb-6">
              <h3>Global Demand Score</h3>
              <div className="tooltip-container">
                <Info size={16} className="text-gray-500" />
                <div className="tooltip-content">
                  Based on global search volume, import growth & seasonal demand.
                </div>
              </div>
            </div>
            <div className="demand-display-v2">
              <div className="demand-num-v2">
                <AnimatedNumber value={currentData.demandScore} />
              </div>
              <div className={`demand-badge-v2 ${currentData.demandScore > 85 ? 'high' : 'medium'}`}>
                {currentData.demandScore > 85 ? 'HIGH' : 'MEDIUM'}
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-4 leading-relaxed">
              Growing interest in <strong>{selectedCrop}</strong> from {currentData.bestCountry} and other EU markets.
            </p>
          </div>
        </div>

        {/* Right Column: Chart */}
        <div className="chart-card-v2 glass-card flex-1">
          <div className="flex justify-between items-center mb-8">
            <div className="chart-title">
              <h3>Export Price Trends</h3>
              <p className="text-sm text-gray-500">Market benchmark for A-Grade quality</p>
            </div>
            <div className="time-filters-v2">
              {['7D', '30D', '6M'].map(filter => (
                <button 
                  key={filter} 
                  className={timeFilter === filter ? 'active' : ''}
                  onClick={() => setTimeFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          <div className="chart-wrapper-v2" style={{ height: '300px', minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={currentData.priceTrends[timeFilter]}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" hide={timeFilter === '30D'} stroke="#555" fontSize={12} />
                <YAxis stroke="#555" fontSize={12} orientation="right" />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px' }}
                  itemStyle={{ color: '#22c55e' }}
                  labelStyle={{ color: '#888' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#22c55e" 
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                  strokeWidth={3}
                  animationDuration={800}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Risk & Revenue Comparison */}
      <div className="market-intelligence-grid-v2 mt-6">
        <div className="risk-breakdown-card-v2 glass-card">
          <div className="flex justify-between items-center mb-6">
            <h3>Detailed Risk Intelligence</h3>
            <div className={`risk-tag-v2 ${currentData.riskLevel.toLowerCase()}`}>{currentData.riskLevel} Risk</div>
          </div>
          <div className="risk-details-list-v2">
            {Object.entries(currentData.riskBreakdown).map(([key, value]) => (
              <div key={key} className="risk-item-v2 group">
                <div className="flex justify-between items-center mb-2">
                  <span className="capitalize font-semibold text-gray-300">{key} Risk</span>
                  <span className={`risk-level-badge ${value.level.toLowerCase()}`}>{value.level}</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed group-hover:text-gray-300 transition-colors">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="revenue-calculator-v2 glass-card flex-1">
          <div className="flex justify-between items-center mb-8">
            <h3>Revenue Projection</h3>
            <div className="calc-inputs-v2">
              <div className="input-field">
                <label>Yield/Acre (Tons)</label>
                <input 
                  type="number" 
                  value={expectedYield} 
                  onChange={(e) => setExpectedYield(parseFloat(e.target.value) || 0)} 
                />
              </div>
            </div>
          </div>
          
          <div className="rev-comparison-v2">
            <div className="rev-card-v2 domestic">
              <div className="rev-icon"><Building2 size={24} /></div>
              <div className="rev-info">
                <span>Domestic Market</span>
                <strong>₹<AnimatedNumber value={domesticRev/100000} />L</strong>
              </div>
            </div>
            <div className="rev-card-v2 export">
              <div className="rev-icon"><Globe size={24} /></div>
              <div className="rev-info">
                <span>Export Market</span>
                <strong>₹<AnimatedNumber value={exportRev/100000} />L</strong>
              </div>
            </div>
          </div>
          
          <motion.div 
            className="profit-increase-premium mt-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            key={profitIncrease}
          >
            <div className="flex items-center gap-4">
              <div className="trending-icon-wrapper">
                <TrendingUp size={24} />
              </div>
              <div>
                <span className="label">Estimated Profit Increase</span>
                <strong className="value">
                  +<AnimatedNumber value={profitIncrease} />%
                </strong>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Verified Buyers */}
      <div className="verified-buyers-section-v2 glass-card mt-6">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="verified-icon-wrapper">
              <ShieldCheck className="text-green-500" />
            </div>
            <div>
              <h3>Verified Export Partners</h3>
              <p className="text-sm text-gray-500">Pre-vetted importers with active purchase mandates</p>
            </div>
          </div>
        </div>
        <div className="buyers-grid-v2">
          {currentData.buyers.map((buyer, idx) => (
            <motion.div 
              key={idx} 
              className="buyer-premium-card"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="buyer-header">
                <div className="buyer-country-v2">
                  <span className="flag-icon">{buyer.flag}</span>
                  <span className="country-name">{buyer.country}</span>
                </div>
                <div className="buyer-badge">Verified</div>
              </div>
              <div className="buyer-stats-grid">
                <div className="stat-item">
                  <span className="label">Importers</span>
                  <strong className="value">{buyer.importers}</strong>
                </div>
                <div className="stat-item">
                  <span className="label">Est. Volume</span>
                  <strong className="value">{buyer.volume}</strong>
                </div>
              </div>
              <div className="buyer-certs mt-4">
                <span className="label">Required Certs:</span>
                <p className="certs-list">{buyer.certs}</p>
              </div>
              <button className="view-details-btn mt-6" onClick={() => handleBuyerRequest(buyer)}>
                Request Connection
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Buyer Connection Modal */}
      <AnimatePresence>
        {showBuyerModal && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="buyer-modal glass-card"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <button className="modal-close" onClick={() => setShowBuyerModal(false)}><X /></button>
              
              {!isSubmitted ? (
                <>
                  <div className="modal-header">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <ShieldCheck size={24} className="text-green-500" />
                      </div>
                      <span className="text-xs font-bold text-green-500 uppercase tracking-wider">Secure Connection</span>
                    </div>
                    <h2>Request Connection: {selectedBuyer?.country}</h2>
                    <p>Connect with {selectedBuyer?.importers} verified importers in {selectedBuyer?.country}.</p>
                  </div>
                  
                  <form className="buyer-form mt-6" onSubmit={submitBuyerRequest}>
                    <div className="form-group">
                      <label>Your Available Quantity (Tons)</label>
                      <input type="number" required placeholder="e.g. 50" />
                    </div>
                    <div className="form-group">
                      <label>Expected Price per KG (₹)</label>
                      <input type="number" required placeholder={`e.g. ${currentData.exportPrice}`} />
                    </div>
                    <div className="form-group">
                      <label>Certifications You Have</label>
                      <input type="text" placeholder="e.g. Organic, GLOBALGAP" />
                    </div>
                    <button type="submit" className="submit-form-btn" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "Submit Connection Request"}
                    </button>
                    <p className="text-xs text-center text-gray-500 mt-4">
                      Our trade specialist will review your profile and match you with the best buyer within 24 hours.
                    </p>
                  </form>
                </>
              ) : (
                <div className="submission-success py-10 text-center">
                  <div className="success-icon-wrapper">
                    <CheckCircle size={40} className="text-green-500" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-white">Request Submitted!</h2>
                  <p className="text-gray-400 mb-8">Our trade desk has received your request for {selectedBuyer?.country}.</p>
                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-bold">Verification Code</p>
                    <p className="text-2xl font-mono text-green-400 font-bold tracking-tighter">AS-EXP-{Math.floor(Math.random()*9000)+1000}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};


const GlobalMarketPosts = ({ t }) => {
  const [interestedPosts, setInterestedPosts] = useState({});

  useEffect(() => {
    let isMounted = true;
    const fetchInterests = async () => {
      try {
        if (typeof navigator !== 'undefined' && !navigator.onLine) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (user && isMounted) {
          const { data } = await supabase
            .from('post_interest')
            .select('post_id')
            .eq('user_id', user.id);
          
          if (data && isMounted) {
            const interests = {};
            data.forEach(item => interests[item.post_id] = true);
            setInterestedPosts(interests);
          }
        }
      } catch (err) {
        if (isMounted) console.error("Error fetching interests:", err);
      }
    };
    fetchInterests();
    return () => { isMounted = false; };
  }, []);

  const handleInterest = async (postId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Update UI immediately for best UX
      setInterestedPosts(prev => ({ ...prev, [postId]: true }));
      alert("Your request has been sent! Our team will mediate the connection.");

      if (!user) return; // Stop here if guest, but UI is already updated

      if (typeof navigator !== 'undefined' && !navigator.onLine) return;

      // Attempt to save to database, but don't block UI if it fails (since these are mock posts)
      const { error } = await supabase
        .from('post_interest')
        .upsert(
          [{
            user_id: user.id,
            post_id: postId
          }],
          { onConflict: 'user_id,post_id' }
        );

      if (error) console.error("Database sync error (non-critical):", error);
    } catch (err) {
      console.error("Interest interaction error:", err);
    }
  };

  const posts = [
    {
      id: "00000000-0000-0000-0000-000000000001",
      company: "Indo-Euro Logistics",
      crop: "Dehydrated Onion Powder",
      quantity: "50 Metric Tons",
      destination: "Netherlands",
      flag: "🇳🇱",
      priceRange: "₹120 - ₹150 / kg",
      description: "Looking for verified farmers who can provide consistent quality onion powder. We handle all export documentation.",
      timestamp: "2 hours ago",
      verified: true
    },
    {
      id: "00000000-0000-0000-0000-000000000002",
      company: "Gulf Food Importers",
      crop: "Basmati Rice (Pusa 1121)",
      quantity: "200 Metric Tons",
      destination: "Dubai, UAE",
      flag: "🇦🇪",
      priceRange: "₹85 - ₹95 / kg",
      description: "Urgent requirement for premium Basmati Rice. Quality inspection at factory site required.",
      timestamp: "5 hours ago",
      verified: true
    },
    {
      id: "00000000-0000-0000-0000-000000000003",
      company: "Alpine Organic Spices",
      crop: "Organic Turmeric",
      quantity: "15 Metric Tons",
      destination: "Germany",
      flag: "🇩🇪",
      priceRange: "₹210 - ₹240 / kg",
      description: "Sourcing for EU market. Must have organic certification and lead test reports.",
      timestamp: "1 day ago",
      verified: true
    },
    {
      id: "00000000-0000-0000-0000-000000000004",
      company: "Tokyo Bio-Trade",
      crop: "Neem Powder",
      quantity: "10 Metric Tons",
      destination: "Japan",
      flag: "🇯🇵",
      priceRange: "₹420 - ₹450 / kg",
      description: "High purity neem powder required for bio-pesticide formulation. Long term contract possible.",
      timestamp: "2 days ago",
      verified: true
    }
  ];

  return (
    <motion.div 
      className="market-posts-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="posts-header-section mb-8 text-center">
        <h2 className="text-3xl font-extrabold text-white mb-2">Global Export Opportunities</h2>
        <p className="text-gray-400">Verified purchase mandates from international importers</p>
      </div>

      <div className="posts-list">
        {posts.map((post) => (
          <motion.div 
            key={post.id} 
            className="market-post-card glass-card-premium"
            whileHover={{ translateY: -4 }}
            transition={{ duration: 0.3 }}
          >
            <div className="post-header-top flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="company-logo-circle">
                  <Building2 size={24} className="text-green-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold m-0 p-0 text-lg">{post.company}</h3>
                    {post.verified && <ShieldCheck size={18} className="text-green-500" />}
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{post.timestamp}</span>
                </div>
              </div>
              <div className="post-destination-pill">
                <Globe size={14} />
                <span>{post.destination} {post.flag}</span>
              </div>
            </div>

            <div className="post-crop-highlight mb-6">
              <div className="crop-tag-pill">
                <Sprout size={16} />
                <span>{post.crop}</span>
              </div>
            </div>

            <p className="post-description text-gray-400 text-sm leading-relaxed mb-8">
              {post.description}
            </p>

            <div className="post-stats-row flex gap-4 mb-8">
              <div className="stat-data-block">
                <span className="label">Quantity Required</span>
                <strong className="value">{post.quantity}</strong>
              </div>
              <div className="stat-data-block">
                <span className="label">Target Price Range</span>
                <strong className="value">{post.priceRange}</strong>
              </div>
            </div>

            <div className="post-actions flex justify-end">
              <motion.button 
                className={`post-cta-btn ${interestedPosts[post.id] ? 'interested-active' : ''}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleInterest(post.id)}
                disabled={interestedPosts[post.id]}
              >
                {interestedPosts[post.id] ? (
                  <>
                    <CheckCircle size={18} />
                    <span>Request Sent</span>
                  </>
                ) : (
                  <>
                    <Handshake size={18} />
                    <span>Interested (Mediated)</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const GlobalMarketNotifications = ({ t }) => {
  const notifications = [
    { id: 1, text: "UAE me Haldi ki demand badh rahi hai", time: "10:30 AM", type: 'trend' },
    { id: 2, text: "Bangladesh ne onion import band kiya", time: "08:15 AM", type: 'news' },
    { id: 3, text: "Export price local mandi se 70% zyada hai", time: "Yesterday", type: 'insight' }
  ];

  return (
    <motion.div 
      className="market-notifications"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {notifications.map((notif) => (
        <div key={notif.id} className="notif-item glass-card">
          <div className="notif-icon">
            <Bell size={18} className="text-green-500" />
          </div>
          <div className="notif-content">
            <p>{notif.text}</p>
            <span>{notif.time}</span>
          </div>
          <ChevronRight size={16} className="text-gray-500" />
        </div>
      ))}
    </motion.div>
  );
};

const GlobalMarket = ({ onBack, t, currentLanguage, farmerName, locationData, globalMarketData }) => {
  const [globalRequests, setGlobalRequests] = useState([]);
  const [showRequestDropdown, setShowRequestDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    try {
      return sessionStorage.getItem('agriSetuGlobalMarketTab') || 'home';
    } catch (e) {
      return 'home';
    }
  });

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  useEffect(() => {
    try {
      sessionStorage.setItem('agriSetuGlobalMarketTab', activeTab);
    } catch (e) {
      // ignore
    }
  }, [activeTab]);

  const renderContent = useMemo(() => {
    switch (activeTab) {
      case 'home':
        return <GlobalMarketHome t={t} globalMarketData={globalMarketData} setGlobalRequests={setGlobalRequests} setShowRequestDropdown={setShowRequestDropdown} />;
      case 'posts':
        return <GlobalMarketPosts t={t} />;
      case 'notifications':
        return <GlobalMarketNotifications t={t} />;
      default:
        return <GlobalMarketHome t={t} globalMarketData={globalMarketData} setGlobalRequests={setGlobalRequests} setShowRequestDropdown={setShowRequestDropdown} />;
    }
  }, [activeTab, t, globalMarketData]);

  return (
    <div className="global-market-page dark-theme">
      {/* LinkedIn style top navigation */}
      <div className="market-header-tabs-pill-container sticky top-0 z-50 py-4 flex items-center justify-center">
        <div className="nav-tabs-pill glass-card-pill">
          <button className={`nav-tab-pill ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
            <Home size={18} />
            <span>Home</span>
          </button>
          <button className={`nav-tab-pill ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>
            <MessageSquare size={18} />
            <span>Posts</span>
          </button>

          {/* Global Request Viewer Navbar Section */}
          <div className="relative flex flex-col items-center">
            <button 
              className={`nav-tab-pill relative ${showRequestDropdown ? 'active' : ''}`} 
              onClick={() => setShowRequestDropdown(!showRequestDropdown)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
            >
              <div className="icon-badge-wrapper relative">
                <Globe2 size={18} />
                {globalRequests.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold px-1 rounded-full min-w-[16px] h-[16px] flex items-center justify-center border-2 border-[#141414]">
                    {globalRequests.length}
                  </span>
                )}
              </div>
              <span>Global Request Viewer</span>
            </button>

            {/* Dropdown Panel - Premium Agri-Tech UI */}
            <AnimatePresence>
              {showRequestDropdown && (
                <>
                  <div className="fixed inset-0 z-[90]" onClick={() => setShowRequestDropdown(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-85 overflow-hidden bg-[#0d1117]/95 backdrop-blur-2xl border border-white/10 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-[100] flex flex-col cursor-default"
                    style={{ minWidth: '340px' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-green-500/10 to-transparent">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-green-500/20 rounded-lg">
                          <Globe2 size={16} className="text-green-500" />
                        </div>
                        <h3 className="text-xs font-bold text-white uppercase tracking-widest m-0">Live Market Requests</h3>
                      </div>
                      <button 
                        onClick={() => {
                          if(window.confirm("Clear all active requests?")) setGlobalRequests([]);
                        }}
                        className="text-[10px] font-bold text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md border-none cursor-pointer"
                      >
                        <Trash2 size={12} /> Clear
                      </button>
                    </div>

                    {/* Content Area */}
                    <div className="overflow-y-auto max-h-[400px] p-4 custom-scrollbar flex-1">
                      {globalRequests.length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center">
                          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/5">
                            <Globe size={28} className="text-gray-700 animate-pulse" />
                          </div>
                          <p className="text-gray-300 text-sm font-semibold m-0">No Global Market Requests Yet</p>
                          <p className="text-gray-500 text-[11px] mt-2 max-w-[200px] mx-auto leading-relaxed">Your export connection requests will appear here for tracking.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {globalRequests.map((req) => (
                            <motion.div 
                              layout
                              key={req.id} 
                              initial={{ x: -10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              className="bg-white/5 border border-white/5 rounded-2xl p-4 hover:bg-white/10 hover:border-white/10 transition-all group relative overflow-hidden"
                            >
                              <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => setGlobalRequests(prev => prev.filter(r => r.id !== req.id))}
                                  className="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all border-none cursor-pointer"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>

                              <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-green-500/10 rounded-xl">
                                  <Sprout size={18} className="text-green-500" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-center pr-8">
                                    <span className="font-bold text-white text-[15px]">{req.cropName}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="bg-yellow-500/20 text-yellow-500 text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter border border-yellow-500/20">
                                      {req.status}
                                    </span>
                                    <span className="text-[10px] text-gray-500 italic">• {req.timestamp.split(',')[1]}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3 bg-black/20 rounded-xl p-3 border border-white/5">
                                <div className="flex flex-col gap-1">
                                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Destination</span>
                                  <div className="flex items-center gap-1.5">
                                    <Globe size={11} className="text-blue-500" />
                                    <span className="text-xs text-white font-medium">{req.country}</span>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Export Price</span>
                                  <div className="flex items-center gap-1.5">
                                    <TrendingUp size={11} className="text-green-500" />
                                    <span className="text-xs text-green-400 font-bold">₹{req.exportPrice}/kg</span>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4 flex gap-2">
                                <button className="flex-1 bg-green-600/10 hover:bg-green-600 text-green-500 hover:text-white text-[11px] py-2.5 rounded-xl transition-all font-bold border border-green-500/20 cursor-pointer">
                                  Track Details
                                </button>
                                <button className="px-3 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl transition-all border border-white/5 cursor-pointer">
                                  <ExternalLink size={14} />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer / CTA */}
                    {globalRequests.length > 0 && (
                      <div className="p-4 bg-white/5 border-t border-white/5">
                        <p className="text-[10px] text-center text-gray-500 m-0">Our trade specialists verify requests within 24 hours.</p>
                      </div>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <button className={`nav-tab-pill ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
            <div className="icon-badge-wrapper">
              <Bell size={18} />
              <span className="notif-badge">3</span>
            </div>
            <span>Alerts</span>
          </button>
        </div>
      </div>

      <main className="market-container">
        <div className="market-content-header">
          <motion.button 
            className="market-back-btn"
            onClick={handleBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <ArrowLeft size={20} />
          </motion.button>
        </div>
        <AnimatePresence mode="wait">
          {renderContent}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default GlobalMarket;
