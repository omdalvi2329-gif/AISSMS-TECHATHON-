import React, { useEffect, useState } from 'react';
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
  Droplet
} from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import './AIImpactDashboard.css';

const AIImpactDashboard = ({ onBack, t, farmerName, locationData }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [rainModifier, setRainModifier] = useState(0);
  const [priceModifier, setPriceModifier] = useState(0);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Mock Data Logic
  const farmSize = parseFloat(locationData?.farmSize || 3);
  const crop = locationData?.cropType || 'Cotton';
  const location = locationData?.district || 'Nashik';

  const baseIncomePerAcre = 62000;
  const historicalIncome = farmSize * 52000;
  const currentIncome = farmSize * baseIncomePerAcre * (1 + (priceModifier / 100)) * (1 - (Math.abs(rainModifier) * 0.2 / 100));
  const netProfitIncrease = currentIncome - historicalIncome;
  const profitPercentage = ((netProfitIncrease / historicalIncome) * 100).toFixed(1);

  const metrics = [
    {
      id: 1,
      title: "Expected Seasonal Income",
      value: `₹${Math.round(currentIncome).toLocaleString()}`,
      subtext: `Based on ${farmSize} acres ${crop} + current rates`,
      icon: <TrendingUp className="text-green-500" />,
      delay: 0.1,
      logic: "Income = Farm Size × Predicted Yield × (Current Market Price + Price Change Modifier)",
      trend: <TrendingUp size={14} className="text-green-500" />
    },
    {
      id: 2,
      title: "Yield Growth Prediction",
      value: "+18%",
      subtext: "Compared to last season average",
      icon: <Sprout className="text-emerald-500" />,
      delay: 0.2,
      logic: "Yield Growth = (AI Optimized Input Efficiency + Weather Alignment) - Historical Baseline",
      trend: <TrendingUp size={14} className="text-green-500" />
    },
    {
      id: 3,
      title: "Water Savings",
      value: "22%",
      subtext: "Using AI irrigation recommendations",
      icon: <Droplets className="text-blue-500" />,
      delay: 0.3,
      logic: "Savings = Evapotranspiration Rate Monitoring - Standard Scheduled Irrigation Volume",
      trend: <TrendingDown size={14} className="text-green-500" />
    },
    {
      id: 4,
      title: "Market Trend Indicator",
      value: priceModifier >= 0 ? "Upward" : "Downward",
      subtext: "Stable demand for premium grades",
      icon: <BarChart3 className="text-yellow-500" />,
      delay: 0.4,
      logic: "Trend = Real-time Mandi API Data + Predictive Seasonal Demand Modeling",
      trend: priceModifier >= 0 ? <TrendingUp size={14} className="text-green-500" /> : <TrendingDown size={14} className="text-red-500" />
    }
  ];

  const marketData = [
    { day: '1', price: 5800 },
    { day: '5', price: 6000 },
    { day: '10', price: 5900 },
    { day: '15', price: 6200 },
    { day: '20', price: 6500 },
    { day: '25', price: 6400 },
    { day: '30', price: 6800 },
  ];

  const riskData = [
    { day: 'Mon', risk: 20 },
    { day: 'Tue', risk: 45 },
    { day: 'Wed', risk: 30 },
    { day: 'Thu', risk: 15 },
    { day: 'Fri', risk: 10 },
    { day: 'Sat', risk: 5 },
    { day: 'Sun', risk: 25 },
  ];

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
              className="metric-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: m.delay }}
              whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(34, 197, 94, 0.15)' }}
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
                  <div className="metric-value">{m.value}</div>
                  <div className="metric-trend-badge">{m.trend}</div>
                </div>
                <p>{m.subtext}</p>
              </div>
            </motion.div>
          ))}
        </section>

        <section className="impact-comparison-section">
          <motion.div 
            className="comparison-card"
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
                  ₹{Math.round(currentIncome).toLocaleString()}
                  <TrendingUp size={14} className="trend-up" />
                </div>
              </div>
              <div className="comparison-row">
                <div className="metric-label">Water Usage</div>
                <div className="before-val">100% (Standard)</div>
                <div className="after-val">
                  78%
                  <TrendingDown size={14} className="trend-down" />
                </div>
              </div>
              <div className="comparison-row">
                <div className="metric-label">Risk Level</div>
                <div className="before-val text-yellow-500">Medium</div>
                <div className="after-val text-green-500">
                  Low
                  <TrendingDown size={14} className="trend-down" />
                </div>
              </div>
              <div className="comparison-row">
                <div className="metric-label">Yield Growth</div>
                <div className="before-val">Baseline</div>
                <div className="after-val">
                  +18%
                  <TrendingUp size={14} className="trend-up" />
                </div>
              </div>
              <div className="comparison-row profit-highlight">
                <div className="metric-label">Net Profit Increase</div>
                <div className="before-val">--</div>
                <div className="after-val text-green-400">
                  ₹{Math.round(netProfitIncrease).toLocaleString()} (+{profitPercentage}%)
                  <TrendingUp size={14} className="trend-up" />
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="advanced-metrics">
          <motion.div 
            className="impact-card risk-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="card-header">
              <h3><AlertTriangle size={18} /> Risk Breakdown</h3>
              <div className="logic-tooltip">
                <Info size={16} />
                <span className="tooltip-text">Calculated as a weighted average of specific environmental and market factors.</span>
              </div>
              <span className="risk-level low">LOW (25%)</span>
            </div>
            
            <div className="risk-breakdown-list">
              <div className="risk-breakdown-item orange">
                <div className="risk-info">
                  <span><Bug size={14} /> Pest Risk</span>
                  <span>12%</span>
                </div>
                <div className="mini-progress-bg">
                  <motion.div 
                    className="mini-progress-fill" 
                    initial={{ width: 0 }}
                    animate={{ width: '12%' }}
                    transition={{ duration: 1, delay: 0.8 }}
                  ></motion.div>
                </div>
              </div>
              <div className="risk-breakdown-item blue">
                <div className="risk-info">
                  <span><CloudRain size={14} /> Rainfall Deviation</span>
                  <span>8%</span>
                </div>
                <div className="mini-progress-bg">
                  <motion.div 
                    className="mini-progress-fill" 
                    initial={{ width: 0 }}
                    animate={{ width: '8%' }}
                    transition={{ duration: 1, delay: 0.9 }}
                  ></motion.div>
                </div>
              </div>
              <div className="risk-breakdown-item yellow">
                <div className="risk-info">
                  <span><BarChart size={14} /> Market Volatility</span>
                  <span>15%</span>
                </div>
                <div className="mini-progress-bg">
                  <motion.div 
                    className="mini-progress-fill" 
                    initial={{ width: 0 }}
                    animate={{ width: '15%' }}
                    transition={{ duration: 1, delay: 1 }}
                  ></motion.div>
                </div>
              </div>
            </div>

            <div className="risk-bar-container">
              <div className="risk-bar-bg">
                <motion.div 
                  className="risk-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: '25%' }}
                  transition={{ duration: 1, delay: 1.1 }}
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
            className="impact-card confidence-gauge-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="card-header">
              <h3><ShieldCheck size={18} /> Prediction Confidence</h3>
              <div className="logic-tooltip">
                <Info size={16} />
                <span className="tooltip-text">Based on sensor data quality, weather reliability, and historical model accuracy.</span>
              </div>
            </div>
            <div className="circular-progress">
              <svg viewBox="0 0 36 36" className="circular-chart green">
                <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <motion.path 
                  className="circle" 
                  strokeDasharray="89, 100"
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: "89, 100" }}
                  transition={{ duration: 1.5, delay: 1 }}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                />
              </svg>
              <div className="score-label">89%</div>
            </div>
            <p className="confidence-desc">High reliability based on recent sensor calibrations.</p>
          </motion.div>

          <motion.div 
            className="impact-card benchmark-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="card-header">
              <h3><Users size={18} /> Village Performance Benchmark</h3>
              <div className="logic-tooltip">
                <Info size={16} />
                <span className="tooltip-text">Comparison of your farm's AI-optimized efficiency vs regional village average.</span>
              </div>
            </div>
            <div className="benchmark-content">
              <div className="benchmark-stat">
                <span className="benchmark-value">18% Above Average</span>
                <p>Your farm is outperforming the village average by 18% this season.</p>
              </div>
              <div className="benchmark-viz">
                <div className="viz-labels">
                  <span>Village Avg</span>
                  <span>Your Farm</span>
                </div>
                <div className="viz-bar-container">
                  <div className="viz-bar avg" style={{ width: '65%' }}></div>
                  <div className="viz-bar user" style={{ width: '83%' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="simulation-section">
          <motion.div 
            className="simulation-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
          >
            <div className="simulation-header">
              <h2><Zap size={20} className="text-yellow-400" /> What-If Scenario Simulator</h2>
              <p>Adjust variables to see real-time impact on your farm's success</p>
            </div>
            <div className="simulation-controls">
              <div className="control-group">
                <div className="control-label">
                  <label>Rainfall Deviation</label>
                  <span>{rainModifier > 0 ? `+${rainModifier}` : rainModifier}%</span>
                </div>
                <input 
                  type="range" 
                  min="-30" 
                  max="30" 
                  value={rainModifier} 
                  onChange={(e) => setRainModifier(parseInt(e.target.value))}
                  className="slider rain-slider"
                />
              </div>
              <div className="control-group">
                <div className="control-label">
                  <label>Market Price Change</label>
                  <span>{priceModifier > 0 ? `+${priceModifier}` : priceModifier}%</span>
                </div>
                <input 
                  type="range" 
                  min="-20" 
                  max="20" 
                  value={priceModifier} 
                  onChange={(e) => setPriceModifier(parseInt(e.target.value))}
                  className="slider price-slider"
                />
              </div>
            </div>
            <div className="simulation-result">
              <div className="result-label">Projected Seasonal Income</div>
              <div className="result-value-container">
                <motion.div 
                  key={currentIncome}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="result-value"
                >
                  ₹{Math.round(currentIncome).toLocaleString()}
                </motion.div>
                <motion.div 
                  key={netProfitIncrease}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`impact-indicator ${netProfitIncrease >= 0 ? 'positive' : 'negative'}`}
                >
                  {netProfitIncrease >= 0 ? '+' : ''}₹{Math.round(Math.abs(netProfitIncrease)).toLocaleString()} Profit Impact
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
            className="chart-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="chart-header">
              <h3>7-Day Weather + Crop Risk</h3>
              <Info size={16} className="text-gray-500" />
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={riskData}>
                  <defs>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="day" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                    itemStyle={{ color: '#22C55E' }}
                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="risk" 
                    stroke="#22C55E" 
                    fillOpacity={1} 
                    fill="url(#colorRisk)" 
                    strokeWidth={3}
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div 
            className="chart-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="chart-header">
              <h3>30-Day Market Price Trend</h3>
              <ArrowUpRight size={16} className="text-green-500" />
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={marketData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="day" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis hide domain={['dataMin - 500', 'dataMax + 500']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                    itemStyle={{ color: '#22C55E' }}
                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#22C55E" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#22C55E', strokeWidth: 0 }} 
                    activeDot={{ r: 6, fill: '#fff', stroke: '#22C55E', strokeWidth: 2 }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </section>

        <section className="farmer-story-section">
          <motion.div 
            className="story-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
          >
            <div className="story-header">
              <Quote size={20} className="text-green-500" />
              <h4>Real Farmer Impact</h4>
            </div>
            <p>
              “Last season, a farmer from Pune increased net profit by <strong>₹42,000</strong> using AI-driven irrigation and market insights provided by AgriSetu.”
            </p>
          </motion.div>
        </section>

        <section className="ai-summary-section">
          <motion.div 
            className="ai-summary-card"
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
                <span className="value strong">Strong</span>
              </div>
              <div className="summary-item">
                <span className="label">• Risk Level:</span>
                <span className="value low">Low</span>
              </div>
              <div className="summary-item">
                <span className="label">• Suggested Action:</span>
                <span className="value">Maintain irrigation schedule, monitor pest activity</span>
              </div>
              <div className="summary-item">
                <span className="label">• Market Outlook:</span>
                <span className="value upward">Upward</span>
              </div>
            </div>
            <div className="summary-footer">
              <div className="intelligence-meta">
                <div className="meta-chip">
                  <Cpu size={14} />
                  <span>Model: Multi-Source Fusion (Weather + Market + Soil)</span>
                </div>
                <div className="meta-chip">
                  <CheckCircle2 size={14} />
                  <span>Accuracy: 89.4%</span>
                </div>
                <div className="meta-chip">
                  <RefreshCw size={14} />
                  <span>Last Sync: 2 mins ago</span>
                </div>
              </div>
              <div className="footer-actions">
                <span className="last-updated">Real-time analysis active</span>
                <button className="action-btn">Optimize Farm Plan</button>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
};

export default AIImpactDashboard;
