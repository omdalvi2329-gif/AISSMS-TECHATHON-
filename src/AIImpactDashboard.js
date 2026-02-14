import React, { useEffect, useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  TrendingUp, 
  Droplets, 
  Sprout, 
  BarChart3, 
  AlertTriangle, 
  Globe, 
  Zap,
  Info,
  ArrowUpRight,
  ShieldCheck,
  TrendingDown,
  ArrowRight,
  Activity,
  Bug,
  CloudRain,
  BarChart,
  Users,
  CheckCircle2,
  DollarSign,
  Quote,
  Cpu,
  RefreshCw,
  Leaf,
  Droplet,
  Download,
  X,
  FileText,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import './AIImpactDashboard.css';

const CountUp = ({ end, prefix = '', suffix = '', decimals = 0 }) => {
  const [value, setValue] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setValue(end);
        clearInterval(timer);
      } else {
        setValue(start);
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [end]);

  return (
    <span>
      {prefix}
      {decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString()}
      {suffix}
    </span>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div 
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div 
          className="modal-content"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
        >
          <div className="modal-header">
            <h3>{title}</h3>
            <button onClick={onClose} className="close-btn"><X size={20} /></button>
          </div>
          <div className="modal-body">
            {children}
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

const AIImpactDashboard = ({ onBack, t, farmerName, locationData }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [rainModifier, setRainModifier] = useState(0);
  const [priceModifier, setPriceModifier] = useState(0);
  const [showOptimizeModal, setShowOptimizeModal] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isDetailedView, setIsDetailedView] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Realistic Calculation Logic
  const farmSize = parseFloat(locationData?.farmSize || 3);
  const crop = locationData?.cropType || 'Cotton';
  
  const simulationResults = useMemo(() => {
    const baseIncomePerAcre = 62000;
    const historicalYield = 100; // base percentage
    
    // Rainfall effect: Optimal is 0. Too much or too little reduces yield.
    // Let's assume -30% to +30% range. -30% rain = -15% yield, +30% rain = -5% yield (too much rain)
    const yieldImpact = rainModifier < 0 ? rainModifier * 0.5 : -rainModifier * 0.2;
    const currentYield = historicalYield + yieldImpact + 18; // 18 is the base AI gain
    
    const basePrice = 5800;
    const currentPrice = basePrice * (1 + priceModifier / 100);
    
    const historicalIncome = farmSize * 52000;
    const currentIncome = farmSize * (baseIncomePerAcre * (currentYield / 100)) * (1 + priceModifier / 100);
    const netProfitIncrease = currentIncome - historicalIncome;
    const profitPercentage = ((netProfitIncrease / historicalIncome) * 100).toFixed(1);

    // Dynamic Risks
    const pestRisk = 12 + (rainModifier > 10 ? (rainModifier - 10) * 0.5 : 0);
    const rainRisk = Math.abs(rainModifier);
    const marketRisk = Math.abs(priceModifier) * 0.8 + 10;
    const totalRisk = (pestRisk + rainRisk + marketRisk) / 3;

    return {
      currentIncome,
      netProfitIncrease,
      profitPercentage,
      currentYield,
      yieldGrowth: (currentYield - 100).toFixed(1),
      waterSavings: 22 - (rainModifier < 0 ? rainModifier * 0.2 : 0),
      pestRisk,
      rainRisk,
      marketRisk,
      totalRisk,
      marketTrend: priceModifier >= 0 ? "Upward" : "Downward"
    };
  }, [rainModifier, priceModifier, farmSize]);

  const metrics = [
    {
      id: 1,
      title: "Expected Seasonal Income",
      value: simulationResults.currentIncome,
      prefix: "₹",
      subtext: `Based on ${farmSize} acres ${crop}`,
      icon: <TrendingUp className="text-green-500" />,
      delay: 0.1,
      logic: "Income = Farm Size × Predicted Yield × Current Market Price",
      trend: simulationResults.netProfitIncrease >= 0 ? <TrendingUp size={14} className="text-green-500" /> : <TrendingDown size={14} className="text-red-500" />
    },
    {
      id: 2,
      title: "Yield Growth Prediction",
      value: parseFloat(simulationResults.yieldGrowth),
      suffix: "%",
      subtext: "Compared to last season",
      icon: <Sprout className="text-emerald-500" />,
      delay: 0.2,
      logic: "Yield Growth = (AI Input Efficiency + Weather Alignment) - Baseline",
      trend: parseFloat(simulationResults.yieldGrowth) >= 0 ? <TrendingUp size={14} className="text-green-500" /> : <TrendingDown size={14} className="text-red-500" />
    },
    {
      id: 3,
      title: "Water Savings",
      value: parseFloat(simulationResults.waterSavings),
      suffix: "%",
      subtext: "AI irrigation impact",
      icon: <Droplets className="text-blue-500" />,
      delay: 0.3,
      logic: "Savings = Evapotranspiration Monitoring - Standard Irrigation",
      trend: <TrendingDown size={14} className="text-green-500" />
    },
    {
      id: 4,
      title: "Market Trend",
      value: simulationResults.marketTrend,
      isStatic: true,
      subtext: priceModifier >= 0 ? "Favorable demand" : "Market volatility",
      icon: <BarChart3 className="text-yellow-500" />,
      delay: 0.4,
      logic: "Trend = Real-time Mandi Data + Predictive Demand Modeling",
      trend: priceModifier >= 0 ? <TrendingUp size={14} className="text-green-500" /> : <TrendingDown size={14} className="text-red-500" />
    }
  ];

  // Dynamic Chart Data
  const marketData = useMemo(() => [
    { day: '1', price: 5800 * (1 + priceModifier/150) },
    { day: '5', price: 6000 * (1 + priceModifier/120) },
    { day: '10', price: 5900 * (1 + priceModifier/130) },
    { day: '15', price: 6200 * (1 + priceModifier/110) },
    { day: '20', price: 6500 * (1 + priceModifier/100) },
    { day: '25', price: 6400 * (1 + priceModifier/105) },
    { day: '30', price: 6800 * (1 + priceModifier/90) },
  ], [priceModifier]);

  const riskChartData = useMemo(() => [
    { day: 'Mon', risk: 20 + rainModifier/5 },
    { day: 'Tue', risk: 45 + rainModifier/4 },
    { day: 'Wed', risk: 30 + rainModifier/6 },
    { day: 'Thu', risk: 15 + rainModifier/8 },
    { day: 'Fri', risk: 10 + rainModifier/10 },
    { day: 'Sat', risk: 5 + rainModifier/12 },
    { day: 'Sun', risk: 25 + rainModifier/7 },
  ], [rainModifier]);

  const getRiskColor = (val) => {
    if (val < 15) return '#22C55E';
    if (val < 30) return '#EAB308';
    return '#EF4444';
  };

  const handleDownloadReport = () => {
    setIsGeneratingReport(true);
    setTimeout(() => {
      setIsGeneratingReport(false);
      alert("Report downloaded successfully! (Simulated PDF)");
    }, 2000);
  };

  return (
    <div className="impact-dashboard-container">
      <header className="dashboard-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={24} />
        </button>
        <div className="header-titles">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            AI Impact Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Data-driven insights for smarter farming
          </motion.p>
        </div>
        <div className="confidence-badge">
          <ShieldCheck size={18} />
          <span>AI Confidence: 89%</span>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="metrics-grid">
          {metrics.map((m) => (
            <motion.div 
              key={m.id}
              className="metric-card glass-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: m.delay }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="metric-icon">{m.icon}</div>
              <div className="metric-info">
                <div className="metric-title-row">
                  <h3>{m.title}</h3>
                  <div className="logic-tooltip">
                    <Info size={14} />
                    <span className="tooltip-text">{m.logic}</span>
                  </div>
                </div>
                <div className="metric-value-row">
                  <div className="metric-value">
                    {m.isStatic ? m.value : <CountUp end={m.value} prefix={m.prefix} suffix={m.suffix} decimals={m.id === 1 ? 0 : 1} />}
                  </div>
                  <div className="metric-trend-badge">{m.trend}</div>
                </div>
                <p>{m.subtext}</p>
              </div>
            </motion.div>
          ))}
        </section>

        <section className="impact-comparison-section">
          <motion.div 
            className="comparison-card glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <div className="comparison-header">
              <h2><Activity size={20} className="icon-green" /> Before AI vs With AgriSetu AI</h2>
              <div className="logic-tooltip">
                <Info size={16} />
                <span className="tooltip-text">Comparison based on historical farm data vs AI-optimized simulation results.</span>
              </div>
            </div>
            <div className="comparison-grid">
              <div className="comparison-row header">
                <div className="metric-label">Metric</div>
                <div className="before-val">Without AI</div>
                <div className="after-val">With AgriSetu AI</div>
              </div>
              <div className="comparison-row">
                <div className="metric-label">Expected Income</div>
                <div className="before-val">₹{(farmSize * 52000).toLocaleString()}</div>
                <div className="after-val">
                  ₹{Math.round(simulationResults.currentIncome).toLocaleString()}
                  <TrendingUp size={14} className="trend-up" />
                </div>
              </div>
              <div className="comparison-row">
                <div className="metric-label">Water Usage</div>
                <div className="before-val">100% (Standard)</div>
                <div className="after-val">
                  {Math.round(100 - simulationResults.waterSavings)}%
                  <TrendingDown size={14} className="trend-down" />
                </div>
              </div>
              <div className="comparison-row">
                <div className="metric-label">Risk Level</div>
                <div className="before-val text-yellow-500">Medium</div>
                <div className="after-val" style={{ color: getRiskColor(simulationResults.totalRisk) }}>
                  {simulationResults.totalRisk < 20 ? 'Low' : simulationResults.totalRisk < 40 ? 'Medium' : 'High'}
                  <TrendingDown size={14} className="trend-down" />
                </div>
              </div>
              <div className="comparison-row">
                <div className="metric-label">Yield Growth</div>
                <div className="before-val">Baseline</div>
                <div className="after-val">
                  +{simulationResults.yieldGrowth}%
                  <TrendingUp size={14} className="trend-up" />
                </div>
              </div>
              <div className="comparison-row profit-highlight">
                <div className="metric-label">Net Profit Increase</div>
                <div className="before-val">--</div>
                <div className="after-val text-green-400">
                  ₹{Math.round(simulationResults.netProfitIncrease).toLocaleString()} (+{simulationResults.profitPercentage}%)
                  <TrendingUp size={14} className="trend-up" />
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="advanced-metrics">
          <motion.div 
            className="impact-card risk-card glass-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="card-header">
              <h3><AlertTriangle size={18} /> Risk Breakdown</h3>
              <div className="logic-tooltip">
                <Info size={16} />
                <span className="tooltip-text">Calculated as a weighted average of environmental and market factors.</span>
              </div>
              <span className="risk-level-badge" style={{ backgroundColor: `${getRiskColor(simulationResults.totalRisk)}20`, color: getRiskColor(simulationResults.totalRisk) }}>
                {simulationResults.totalRisk < 20 ? 'LOW' : simulationResults.totalRisk < 40 ? 'MEDIUM' : 'CRITICAL'} ({Math.round(simulationResults.totalRisk)}%)
              </span>
            </div>
            
            <div className="risk-breakdown-list">
              <div className="risk-breakdown-item orange">
                <div className="risk-info">
                  <span><Bug size={14} /> Pest Risk</span>
                  <span>{Math.round(simulationResults.pestRisk)}%</span>
                </div>
                <div className="mini-progress-bg">
                  <motion.div 
                    className="mini-progress-fill" 
                    initial={{ width: 0 }}
                    animate={{ width: `${simulationResults.pestRisk}%` }}
                    transition={{ duration: 0.5 }}
                  ></motion.div>
                </div>
              </div>
              <div className="risk-breakdown-item blue">
                <div className="risk-info">
                  <span><CloudRain size={14} /> Rainfall Deviation</span>
                  <span>{Math.round(simulationResults.rainRisk)}%</span>
                </div>
                <div className="mini-progress-bg">
                  <motion.div 
                    className="mini-progress-fill" 
                    initial={{ width: 0 }}
                    animate={{ width: `${simulationResults.rainRisk}%` }}
                    transition={{ duration: 0.5 }}
                  ></motion.div>
                </div>
              </div>
              <div className="risk-breakdown-item yellow">
                <div className="risk-info">
                  <span><BarChart size={14} /> Market Volatility</span>
                  <span>{Math.round(simulationResults.marketRisk)}%</span>
                </div>
                <div className="mini-progress-bg">
                  <motion.div 
                    className="mini-progress-fill" 
                    initial={{ width: 0 }}
                    animate={{ width: `${simulationResults.marketRisk}%` }}
                    transition={{ duration: 0.5 }}
                  ></motion.div>
                </div>
              </div>
            </div>

            <div className="risk-bar-container">
              <div className="risk-bar-bg">
                <motion.div 
                  className="risk-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${simulationResults.totalRisk}%` }}
                  style={{ backgroundColor: getRiskColor(simulationResults.totalRisk) }}
                  transition={{ duration: 0.5 }}
                ></motion.div>
              </div>
              <div className="risk-labels">
                <span>Safe</span>
                <span>Moderate</span>
                <span>Critical</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="impact-card confidence-gauge-card glass-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="card-header">
              <h3><ShieldCheck size={18} /> Prediction Confidence</h3>
              <div className="logic-tooltip">
                <Info size={16} />
                <span className="tooltip-text">Based on sensor quality and historical model accuracy.</span>
              </div>
            </div>
            <div className="circular-progress">
              <svg viewBox="0 0 36 36" className="circular-chart green">
                <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <motion.path 
                  className="circle" 
                  strokeDasharray="89.4, 100"
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: "89.4, 100" }}
                  transition={{ duration: 1.5, delay: 0.2 }}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                />
              </svg>
              <div className="score-label">89.4%</div>
            </div>
            <p className="confidence-desc">High reliability based on current simulation parameters.</p>
          </motion.div>
        </section>

        <section className="simulation-section">
          <motion.div 
            className="simulation-card glass-card glow-yellow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
          >
            <div className="simulation-header">
              <div className="header-flex">
                <div>
                  <h2><Zap size={20} className="text-yellow-400" /> What-If Scenario Simulator</h2>
                  <p>Adjust variables to see real-time impact on your farm's success</p>
                </div>
                <button className="reset-btn" onClick={() => { setRainModifier(0); setPriceModifier(0); }}>
                  <RefreshCw size={14} /> Reset
                </button>
              </div>
            </div>
            <div className="simulation-controls">
              <div className="control-group">
                <div className="control-label">
                  <label><CloudRain size={16} /> Rainfall Deviation</label>
                  <span className={rainModifier === 0 ? '' : rainModifier > 0 ? 'text-blue-400' : 'text-orange-400'}>
                    {rainModifier > 0 ? `+${rainModifier}` : rainModifier}%
                  </span>
                </div>
                <input 
                  type="range" 
                  min="-30" 
                  max="30" 
                  value={rainModifier} 
                  onChange={(e) => setRainModifier(parseInt(e.target.value))}
                  className="slider rain-slider"
                />
                <div className="slider-hints">
                  <span>Drought</span>
                  <span>Normal</span>
                  <span>Excessive</span>
                </div>
              </div>
              <div className="control-group">
                <div className="control-label">
                  <label><DollarSign size={16} /> Market Price Change</label>
                  <span className={priceModifier === 0 ? '' : priceModifier > 0 ? 'text-green-400' : 'text-red-400'}>
                    {priceModifier > 0 ? `+${priceModifier}` : priceModifier}%
                  </span>
                </div>
                <input 
                  type="range" 
                  min="-20" 
                  max="20" 
                  value={priceModifier} 
                  onChange={(e) => setPriceModifier(parseInt(e.target.value))}
                  className="slider price-slider"
                />
                <div className="slider-hints">
                  <span>Crash</span>
                  <span>Stable</span>
                  <span>Boom</span>
                </div>
              </div>
            </div>
            <div className="simulation-result">
              <div className="result-label">Projected Seasonal Income</div>
              <div className="result-value-container">
                <motion.div 
                  key={simulationResults.currentIncome}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="result-value"
                >
                  ₹{Math.round(simulationResults.currentIncome).toLocaleString()}
                </motion.div>
                <motion.div 
                  key={simulationResults.netProfitIncrease}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`impact-indicator ${simulationResults.netProfitIncrease >= 0 ? 'positive' : 'negative'}`}
                >
                  {simulationResults.netProfitIncrease >= 0 ? '+' : '-'}₹{Math.round(Math.abs(simulationResults.netProfitIncrease)).toLocaleString()} Profit Impact
                </motion.div>
              </div>
              <div className="eco-badges">
                <span className="eco-badge">🌱 Carbon Efficient</span>
                <span className="eco-badge">💧 Water Optimized</span>
                <span className="eco-badge">♻ Organic Friendly</span>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="charts-section">
          <motion.div 
            className="chart-container glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="chart-header">
              <h3>7-Day Weather + Crop Risk</h3>
              <Info size={16} className="text-gray-500" />
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={riskChartData}>
                  <defs>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="day" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', padding: '12px' }}
                    itemStyle={{ color: '#22C55E' }}
                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                    formatter={(value) => [`${Math.round(value)}%`, 'Risk Level']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="risk" 
                    stroke="#22C55E" 
                    fillOpacity={1} 
                    fill="url(#colorRisk)" 
                    strokeWidth={3}
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div 
            className="chart-container glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="chart-header">
              <h3>30-Day Market Price Trend</h3>
              <ArrowUpRight size={16} className={priceModifier >= 0 ? "text-green-500" : "text-red-500"} />
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={marketData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="day" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', padding: '12px' }}
                    itemStyle={{ color: '#22C55E' }}
                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                    formatter={(value) => [`₹${Math.round(value)}`, 'Market Price']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke={priceModifier >= 0 ? "#22C55E" : "#EF4444"} 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: priceModifier >= 0 ? "#22C55E" : "#EF4444", strokeWidth: 0 }} 
                    activeDot={{ r: 6, fill: '#fff', stroke: priceModifier >= 0 ? "#22C55E" : "#EF4444", strokeWidth: 2 }}
                    animationDuration={1000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </section>

        {isDetailedView && (
          <motion.section 
            className="detailed-analysis-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="glass-card detailed-card">
              <h3>Deep Breakdown Analysis</h3>
              <div className="detailed-grid">
                <div className="detail-item">
                  <span className="detail-label">Yield per Acre</span>
                  <span className="detail-value">{Math.round(62000 * (simulationResults.currentYield/100) / 5800 * 10) / 10} Quintals</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Fertilizer Efficiency</span>
                  <span className="detail-value text-green-400">+24% Savings</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Soil Health Index</span>
                  <span className="detail-value">8.2/10</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Carbon Credits Earned</span>
                  <span className="detail-value">1.4 Units</span>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        <section className="ai-summary-section">
          <motion.div 
            className="ai-summary-card glass-card glow-green"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 }}
          >
            <div className="summary-header">
              <div className="header-left">
                <Zap size={20} className="text-yellow-400 fill-yellow-400" />
                <h3>AI Strategic Summary</h3>
              </div>
              <div className="ai-status">
                <div className="blinking-dot"></div>
                <span>Real-time AI Analysis Active</span>
              </div>
            </div>
            <div className="summary-list">
              <div className="summary-item">
                <span className="label">• Income Outlook:</span>
                <span className={`value strong ${simulationResults.netProfitIncrease > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {simulationResults.netProfitIncrease > 10000 ? 'Excellent' : simulationResults.netProfitIncrease > 0 ? 'Stable' : 'Challenging'}
                </span>
              </div>
              <div className="summary-item">
                <span className="label">• Risk Level:</span>
                <span className="value" style={{ color: getRiskColor(simulationResults.totalRisk) }}>
                  {simulationResults.totalRisk < 20 ? 'Low' : simulationResults.totalRisk < 40 ? 'Moderate' : 'Critical'}
                </span>
              </div>
              <div className="summary-item">
                <span className="label">• Suggested Action:</span>
                <span className="value">
                  {rainModifier < -15 ? 'Activate emergency irrigation optimization.' : 
                   rainModifier > 15 ? 'Ensure proper drainage to prevent waterlogging.' : 
                   priceModifier > 10 ? 'Market prices rising: Consider early harvest if possible.' :
                   simulationResults.totalRisk > 35 ? 'High risk detected: Review crop insurance options.' :
                   'Maintain current AI-optimized schedule.'}
                </span>
              </div>
              <div className="summary-item">
                <span className="label">• Market Outlook:</span>
                <span className={`value ${priceModifier >= 0 ? 'upward' : 'text-red-400'}`}>
                  {priceModifier > 10 ? 'Booming' : priceModifier >= 0 ? 'Steady' : 'Volatile'}
                </span>
              </div>
            </div>
            <div className="summary-footer">
              <div className="intelligence-meta">
                <div className="meta-chip">
                  <Cpu size={14} />
                  <span>Model: AgriSetu-v2.4</span>
                </div>
                <div className="meta-chip">
                  <CheckCircle2 size={14} />
                  <span>Accuracy: 89.4%</span>
                </div>
                <div className="meta-chip">
                  <RefreshCw size={14} />
                  <span>Last Sync: Just now</span>
                </div>
              </div>
              <div className="footer-actions">
                <button className="secondary-btn" onClick={() => setIsDetailedView(!isDetailedView)}>
                  {isDetailedView ? 'Hide Analysis' : 'View Detailed Analysis'}
                </button>
                <button className="report-btn" onClick={handleDownloadReport} disabled={isGeneratingReport}>
                  {isGeneratingReport ? <><RefreshCw size={16} className="animate-spin" /> Generating...</> : <><Download size={16} /> Download Report</>}
                </button>
                <button className="action-btn primary-glow" onClick={() => setShowOptimizeModal(true)}>
                  <Sparkles size={16} /> Optimize Farm Plan
                </button>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <Modal 
        isOpen={showOptimizeModal} 
        onClose={() => setShowOptimizeModal(false)}
        title="AI Farm Optimization Plan"
      >
        <div className="optimization-steps">
          <div className="opt-step">
            <div className="step-num">1</div>
            <div className="step-content">
              <h4>Irrigation Calibration</h4>
              <p>Adjust water flow to {Math.round(100 - simulationResults.waterSavings)}% based on current {rainModifier}% rainfall deviation.</p>
            </div>
          </div>
          <div className="opt-step">
            <div className="step-num">2</div>
            <div className="step-content">
              <h4>Nutrient Timing</h4>
              <p>Apply Nitrogen-rich fertilizers in the next 48 hours for maximum absorption before predicted light rain.</p>
            </div>
          </div>
          <div className="opt-step">
            <div className="step-num">3</div>
            <div className="step-content">
              <h4>Pest Alert</h4>
              <p>Increased humidity detected. Spray organic neem oil to prevent aphid infestation.</p>
            </div>
          </div>
          <div className="opt-step">
            <div className="step-num">4</div>
            <div className="step-content">
              <h4>Market Timing</h4>
              <p>Mandi prices are peaking. Schedule harvest for Day 25 to capture +{priceModifier}% price surge.</p>
            </div>
          </div>
          <div className="opt-step">
            <div className="step-num">5</div>
            <div className="step-content">
              <h4>Cost Reduction</h4>
              <p>AI suggests reducing labor hours by 10% by automating irrigation triggers.</p>
            </div>
          </div>
          <button className="apply-plan-btn" onClick={() => setShowOptimizeModal(false)}>Apply All Recommendations</button>
        </div>
      </Modal>
    </div>
  );
};

export default AIImpactDashboard;
