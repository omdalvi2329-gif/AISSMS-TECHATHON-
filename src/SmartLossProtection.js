import React, { useState, useEffect, useMemo, useReducer } from 'react';
import { 
  Shield, 
  Zap, 
  Activity, 
  ChevronLeft, 
  TrendingUp, 
  AlertTriangle, 
  Cpu, 
  BarChart3, 
  Droplets, 
  ShieldCheck, 
  Globe, 
  MapPin, 
  Trophy, 
  Lightbulb,
  ArrowUpRight,
  Clock,
  Wallet,
  CheckCircle2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import './SmartLossProtection.css';

// 1. Global Insurance AI State Engine Logic
const initialState = {
  payoutPotential: 15, // % of sum insured
  premiumStatus: 'Active',
  assetValuation: 850000,
  claimsProcessed: 2,
  riskScore: 35,
  riskLevel: 'SAFE',
  coverageLevel: 0.5,
  shieldActive: false,
  performanceScore: 85,
  savings: 12450,
  alerts: [
    { id: 1, type: 'INFO', msg: 'Insurance Engine Initialized', time: '10:00 AM' }
  ],
  aiEngineStatus: 'Monitoring',
  countdown: 172800 // Policy renewal in seconds
};

function aiReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_SENSORS':
      // Simulate insurance market/risk fluctuations
      const newPayoutPotential = Math.min(Math.max((state.payoutPotential || 15) + (Math.random() - 0.5) * 5, 5), 100);
      const newRiskScore = Math.min(Math.max((state.riskScore || 35) + (Math.random() - 0.5) * 4, 5), 100);
      
      let level = 'SAFE';
      if (newRiskScore >= 70) level = 'CRITICAL';
      else if (newRiskScore >= 40) level = 'CAUTION';

      const newAlerts = [...(state.alerts || [])];
      if (newRiskScore >= 70 && state.riskLevel !== 'CRITICAL') {
        newAlerts.unshift({
          id: Date.now(),
          type: 'CRITICAL',
          msg: `High Risk Detected: Potential Payout Increase to ${newPayoutPotential.toFixed(1)}%`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }

      return {
        ...state,
        payoutPotential: newPayoutPotential,
        riskScore: newRiskScore,
        riskLevel: level,
        alerts: newAlerts.slice(0, 10),
      };

    case 'DEPLOY_SHIELD':
      return {
        ...state,
        shieldActive: true,
        aiEngineStatus: 'Mitigating',
        riskScore: state.riskScore * 0.8,
        riskLevel: (state.riskScore * 0.8) >= 70 ? 'CRITICAL' : (state.riskScore * 0.8) >= 40 ? 'CAUTION' : 'SAFE'
      };

    case 'SET_COVERAGE':
      return {
        ...state,
        coverageLevel: action.payload,
        aiEngineStatus: 'Processing'
      };

    case 'TICK_COUNTDOWN':
      return {
        ...state,
        countdown: Math.max(state.countdown - 1, 0)
      };

    default:
      return state;
  }
}

const SmartLossProtection = ({ onBack, t, farmerName }) => {
  const [state, dispatch] = useReducer(aiReducer, initialState);
  const [activeTab, setActiveTab] = useState('insights');

  // 3. Live Sensor Simulation (8 seconds)
  useEffect(() => {
    const sensorInterval = setInterval(() => {
      dispatch({ type: 'UPDATE_SENSORS' });
    }, 8000);

    const timerInterval = setInterval(() => {
      dispatch({ type: 'TICK_COUNTDOWN' });
    }, 1000);

    return () => {
      clearInterval(sensorInterval);
      clearInterval(timerInterval);
    };
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const percentile = 69;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const renderInsights = () => {
    const riskData = [
      { name: 'Risk', value: state.riskScore, fill: state.riskLevel === 'CRITICAL' ? '#ef4444' : state.riskLevel === 'CAUTION' ? '#eab308' : '#3b82f6' },
      { name: 'Remaining', value: 100 - state.riskScore, fill: 'rgba(255,255,255,0.05)' }
    ];

    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="slp-view-container space-y-8 pb-32"
      >
        <AnimatePresence>
          {state.riskLevel === 'CRITICAL' && (
            <motion.div 
              initial={{ height: 0, opacity: 0, scale: 0.95 }}
              animate={{ height: 'auto', opacity: 1, scale: 1 }}
              exit={{ height: 0, opacity: 0, scale: 0.95 }}
              className="overflow-hidden"
            >
              <div className="bg-red-500/10 border-2 border-red-500/50 rounded-[32px] p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <AlertTriangle className="w-32 h-32 text-red-500 animate-pulse" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="space-y-4 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                      <span className="text-red-500 font-black uppercase tracking-[4px] text-sm premium-label">CRITICAL Risk Alert</span>
                    </div>
                    <motion.h3 
                      initial={{ x: -20 }}
                      animate={{ x: 0 }}
                      className="text-3xl font-black text-white premium-text-gradient"
                    >
                      High Exposure Detected
                    </motion.h3>
                    <div className="flex items-center justify-center md:justify-start gap-6 text-gray-400">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-bold uppercase tracking-widest premium-label">{formatTime(state.countdown)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(239, 68, 68, 0.4)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => dispatch({ type: 'DEPLOY_SHIELD' })}
                      disabled={state.shieldActive}
                      className={`px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                        state.shieldActive 
                        ? 'bg-gray-800 text-gray-500 border border-white/5' 
                        : 'bg-red-500 text-white shadow-2xl hover:bg-red-600'
                      }`}
                    >
                      {state.shieldActive ? 'SHIELD ACTIVE' : 'DEPLOY SHIELD'}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="slp-grid">
          <motion.div variants={itemVariants} className="slp-col-8 slp-glass-card p-10 space-y-10">
            <div className="flex justify-between items-center">
              <div className="card-header-group">
                <h3 className="text-2xl font-black text-white uppercase tracking-[2px] premium-text-gradient animate-text-glow">AI Predictive Engine</h3>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[3px] premium-label">
                  Status: <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} className={state.aiEngineStatus === 'Mitigating' ? 'text-green-400' : 'text-blue-400'}>{state.aiEngineStatus}</motion.span>
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 cursor-pointer relative" style={{ minWidth: '96px', minHeight: '96px' }}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <PieChart>
                      <Pie
                        data={riskData}
                        innerRadius={30}
                        outerRadius={40}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                        isAnimationActive={true}
                        animationBegin={0}
                        animationDuration={1500}
                      >
                        {riskData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <motion.span 
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-[10px] font-black text-white premium-text-gradient"
                    >
                      {(state.riskScore || 0).toFixed(0)}%
                    </motion.span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 font-black uppercase mb-1 premium-label">Risk Score</p>
                  <motion.p 
                    key={state.riskScore}
                    initial={{ scale: 1.2, color: '#fff' }}
                    animate={{ scale: 1, color: state.riskLevel === 'CRITICAL' ? '#ef4444' : state.riskLevel === 'CAUTION' ? '#eab308' : '#3b82f6' }}
                    className="text-2xl font-black premium-text-gradient"
                  >
                    {(state.riskScore || 0).toFixed(1)}%
                  </motion.p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-[11px] font-black text-gray-400 uppercase tracking-widest premium-label">
                <span>Risk Intensity</span>
                <span className={state.riskLevel === 'CRITICAL' ? 'text-red-500' : 'text-blue-400'}>{state.riskLevel}</span>
              </div>
              <div className="h-4 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${state.riskScore}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full shadow-[0_0_20px_rgba(59,130,246,0.5)] ${
                    state.riskLevel === 'CRITICAL' ? 'bg-red-500' : 
                    state.riskLevel === 'CAUTION' ? 'bg-yellow-500' : 
                    'bg-blue-500'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-6">
              {[/* ... */].map((sensor, idx) => (
                <motion.div 
                  key={sensor.label}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.05)" }}
                  className="p-6 bg-white/[0.03] rounded-3xl border border-white/5 cursor-pointer group"
                >
                  <sensor.icon className={`w-5 h-5 ${sensor.color} mb-4 group-hover:scale-110 transition-transform`} />
                  <p className="text-[10px] text-gray-500 font-black uppercase mb-1 premium-label">{sensor.label}</p>
                  <p className="text-lg font-black text-white premium-text-gradient">{(sensor.value || '').toString()}</p>
                </motion.div>
              ))}
            </div>

            <div className="space-y-4">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest premium-label">AI Engine Activity Feed</p>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence>
                  {state.alerts.map((alert, idx) => (
                    <motion.div 
                      key={alert.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${alert.type === 'CRITICAL' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-blue-500'}`} />
                        <span className="text-xs font-bold text-gray-300 premium-text-gradient">{alert.msg}</span>
                      </div>
                      <span className="text-[10px] font-black text-gray-600 uppercase premium-label">{(alert.time || '').toString()}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          <div className="slp-col-4 space-y-8">
            <motion.div variants={itemVariants} className="slp-glass-card p-10 coverage-booster-card relative overflow-hidden group">
              <div className="card-header-group relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-black text-white uppercase tracking-[2px] premium-text-gradient">Coverage Booster</h3>
                </div>
              </div>

              <div className="space-y-6 relative z-10">
                <div className="pill-selection-premium">
                  <button 
                    onClick={() => dispatch({ type: 'SET_COVERAGE', payload: 0.5 })}
                    className={`pill-item flex-1 ${state.coverageLevel === 0.5 ? 'active' : ''}`}
                  >
                    Standard (50%)
                  </button>
                  <button 
                    onClick={() => dispatch({ type: 'SET_COVERAGE', payload: 1.0 })}
                    className={`pill-item flex-1 ${state.coverageLevel === 1.0 ? 'active' : ''}`}
                  >
                    Elite Max (100%)
                  </button>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-5 premium-btn-action text-white rounded-2xl font-black text-sm uppercase tracking-[3px]"
                >
                  APPLY COVERAGE
                </motion.button>
                {state.coverageLevel === 1.0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Elite Partner Active</span>
                  </motion.div>
                )}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="slp-glass-card p-10 shadow-2xl savings-card-premium">
              <div className="card-header-group mb-8">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[3px] premium-label">Insurance Savings</p>
                <h3 className="text-xl font-black text-white uppercase tracking-[2px] premium-text-gradient">Savings Calculator</h3>
              </div>
              <div className="py-8 bg-white/[0.03] rounded-[32px] border border-white/5 text-center">
                <p className="text-[11px] text-gray-500 font-black uppercase tracking-[4px] mb-2 premium-label">Total Saved</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl font-black text-green-400">₹</span>
                  <motion.span 
                    key={state.savings} 
                    initial={{ y: 10, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    className="text-5xl font-black text-white premium-text-gradient counter-value"
                  >
                    {Math.floor(state.savings).toLocaleString()}
                  </motion.span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div 
          variants={itemVariants}
          className="slp-glass-card p-10 bg-gradient-to-br from-emerald-600/10 to-transparent border-emerald-500/20"
        >
          <div className="flex items-center gap-8">
            <div className="relative" style={{ minWidth: '128px', minHeight: '128px' }}>
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                <motion.circle 
                  cx="64" cy="64" r="58" 
                  stroke="#22c55e" 
                  strokeWidth="12" 
                  fill="transparent" 
                  strokeDasharray={364} 
                  initial={{ strokeDashoffset: 364 }}
                  animate={{ strokeDashoffset: 364 - (364 * 69) / 100 }} 
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  strokeLinecap="round"
                  className="text-emerald-500" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-black text-white premium-text-gradient"
                >
                  {percentile}%
                </motion.span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white uppercase tracking-[2px] premium-text-gradient">Regional Benchmark</h3>
              <p className="text-emerald-400 font-black uppercase tracking-[3px] text-sm premium-label">You are outperforming {percentile}% of elite farmers</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const renderEquity = () => {
    const assetData = [
      { name: 'Insured Assets', value: 850000, fill: '#3b82f6', icon: ShieldCheck },
      { name: 'Equipment', value: 320000, fill: '#8b5cf6', icon: Cpu },
      { name: 'Yield Value', value: 450000, fill: '#10b981', icon: TrendingUp },
      { name: 'Risk exposure', value: state.riskScore * 8500, fill: '#ef4444', icon: AlertTriangle }
    ];

    const growthData = [
      { month: 'Jan', equity: 720000, savings: 5000 },
      { month: 'Feb', equity: 750000, savings: 8000 },
      { month: 'Mar', equity: 780000, savings: 9500 },
      { month: 'Apr', equity: 810000, savings: 11000 },
      { month: 'May', equity: 835000, savings: 12450 },
    ];

    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="slp-view-container space-y-8 pb-32"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2 mb-10">
          <div className="card-header-group">
            <p className="text-[11px] font-black text-blue-400 uppercase tracking-[4px] premium-label">Financial & Assets Layer</p>
            <h2 className="text-4xl font-black text-white premium-text-gradient">Protected Equity</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-500/15 rounded-2xl border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
              <Wallet className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="slp-grid mb-10">
          {[
            { label: 'Total Sum Insured', value: '₹8,50,000', sub: '100% Asset Coverage', color: 'blue', icon: ShieldCheck },
            { label: 'Accrued Savings', value: `₹${Math.floor(state.savings).toLocaleString()}`, sub: 'AI Optimization Bonus', color: 'green', icon: TrendingUp },
            { label: 'Claimable Amount', value: `₹${Math.floor(state.riskScore * 8500).toLocaleString()}`, sub: 'Current Risk Valuation', color: 'red', icon: AlertTriangle }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }} 
              className={`slp-glass-card p-10 border border-${stat.color === 'green' ? 'emerald' : stat.color === 'red' ? 'red' : 'blue'}-500/20 slp-col-4 relative overflow-hidden group cursor-pointer`}
            >
              <div className={`absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity`}>
                <stat.icon className="w-24 h-24 text-white" />
              </div>
              <div className="text-aligned-box relative z-10">
                <p className="text-[11px] text-gray-500 font-black uppercase tracking-[3px] mb-3 premium-label">{stat.label}</p>
                <h3 className={`text-4xl font-black premium-text-gradient ${stat.color === 'green' ? 'text-emerald-400' : stat.color === 'red' ? 'text-red-400' : 'text-blue-400'}`}>{stat.value}</h3>
                <p className={`text-[10px] text-gray-500 font-black mt-4 uppercase tracking-widest premium-label`}>{stat.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="slp-grid gap-8">
          <motion.div variants={itemVariants} className="slp-col-8 slp-glass-card p-10 border border-white/5">
            <div className="flex justify-between items-center mb-10">
              <div className="card-header-group">
                <h3 className="text-xl font-black text-white uppercase tracking-[2px] premium-text-gradient">Equity Growth Projection</h3>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1 premium-label">Protected Value vs Savings</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-[9px] font-black text-gray-500 uppercase premium-label">Total Equity</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[9px] font-black text-gray-500 uppercase premium-label">Savings</span>
                </div>
              </div>
            </div>
            <div className="h-64 w-full" style={{ minHeight: '256px' }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="equity" stroke="#3b82f6" fillOpacity={1} fill="url(#colorEquity)" strokeWidth={3} />
                  <Area type="monotone" dataKey="savings" stroke="#10b981" fillOpacity={1} fill="url(#colorSavings)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="slp-col-4 slp-glass-card p-10 border border-white/5 flex flex-col">
            <h3 className="text-xl font-black text-white uppercase tracking-[2px] premium-text-gradient mb-8">Asset Portfolio</h3>
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="h-48 w-full relative mb-8" style={{ minHeight: '192px' }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <PieChart>
                    <Pie
                      data={assetData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                      isAnimationActive={true}
                    >
                      {assetData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Total Value</span>
                  <span className="text-lg font-black text-white premium-text-gradient">₹16.2L</span>
                </div>
              </div>
              <div className="w-full space-y-3">
                {assetData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/5 hover:bg-white/[0.06] transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-white/5">
                        <item.icon className="w-3.5 h-3.5" style={{ color: item.fill }} />
                      </div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest premium-label">{item.name}</span>
                    </div>
                    <span className="text-xs font-black text-white">₹{(item.value / 100000).toFixed(1)}L</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="slp-grid gap-8 mt-10">
          <motion.div variants={itemVariants} className="slp-col-12 slp-glass-card p-10 border border-emerald-500/20 bg-gradient-to-br from-emerald-600/5 to-transparent">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                  <TrendingUp className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-[2px] premium-text-gradient">Policy Maturity Schedule</h3>
                  <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mt-1 premium-label">Next cycle optimization rewards</p>
                </div>
              </div>
              <div className="flex gap-8">
                <div className="text-center">
                  <p className="text-[10px] text-gray-500 font-black uppercase mb-1 premium-label">Estimated Bonus</p>
                  <p className="text-2xl font-black text-emerald-400">₹45,200</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-500 font-black uppercase mb-1 premium-label">Maturity Date</p>
                  <p className="text-2xl font-black text-white">OCT 2026</p>
                </div>
                <button className="px-8 py-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-500/30 transition-all">
                  CLAIM PRE-REWARD
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  const renderSafety = () => (
    <div className="slp-view-container space-y-8 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2 mb-10">
        <div className="card-header-group">
          <p className="text-[11px] font-black text-purple-400 uppercase tracking-[4px] premium-label">Policy & Compliance Layer</p>
          <h2 className="text-4xl font-black text-white premium-text-gradient">Safety & Protocol</h2>
        </div>
        <div className="p-4 bg-purple-500/15 rounded-2xl border border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
          <ShieldCheck className="w-8 h-8 text-purple-400" />
        </div>
      </div>

      <div className="slp-grid mb-10">
        <div className="slp-col-4">
          <div className="slp-glass-card p-8 h-full border border-white/5 hover:border-purple-500/30 transition-all group">
            <div className="card-header-group mb-6">
              <h3 className="text-lg font-black premium-text-gradient uppercase tracking-wider flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" /> Digital Vault
              </h3>
              <p className="text-[10px] text-gray-500 font-black uppercase premium-label">Encrypted Documents</p>
            </div>
            <div className="space-y-4">
              {['Insurance_Policy_2026.pdf', 'Coverage_Terms.v2', 'Claim_Guide.pdf'].map(doc => (
                <motion.div 
                  key={doc} 
                  whileHover={{ x: 10 }}
                  className="flex justify-between items-center p-4 bg-white/[0.03] rounded-2xl border border-white/5 hover:bg-purple-500/10 hover:border-purple-500/30 cursor-pointer transition-all"
                >
                  <span className="text-xs font-black text-gray-400 premium-text-gradient">{doc}</span>
                  <ArrowUpRight className="w-4 h-4 text-purple-400" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="slp-col-8">
          <div className="slp-glass-card p-10 h-full border border-white/5 bg-gradient-to-br from-purple-600/5 to-transparent">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black premium-text-gradient uppercase tracking-[2px]">Field Verification</h3>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_#3b82f6]" />
                <span className="text-[11px] font-black text-blue-400 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20 premium-label">SATELLITE SYNC ACTIVE</span>
              </div>
            </div>
            <div className="space-y-12">
              <div className="space-y-4">
                <div className="flex justify-between text-[11px] font-black text-gray-400 uppercase tracking-widest premium-label">
                  <span>Field Asset Mapping</span>
                  <span className="text-white premium-text-gradient">85% SYNCED</span>
                </div>
                <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} className="h-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-[0_0_20px_rgba(59,130,246,0.3)]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/5">
                  <Cpu className="w-6 h-6 text-purple-400 mb-4" />
                  <p className="text-[10px] text-gray-500 font-black uppercase mb-1 premium-label">AI Compliance</p>
                  <p className="text-xl font-black premium-text-gradient">Verified 100%</p>
                </div>
                <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/5">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-4" />
                  <p className="text-[10px] text-gray-500 font-black uppercase mb-1 premium-label">Policy Status</p>
                  <p className="text-xl font-black text-emerald-400 premium-text-gradient">ACTIVE</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGlobal = () => (
    <div className="slp-view-container space-y-8 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2 mb-10">
        <div className="card-header-group">
          <p className="text-[11px] font-black text-emerald-400 uppercase tracking-[4px] premium-label">Community & Market Layer</p>
          <h2 className="text-4xl font-black text-white premium-text-gradient">Global AgriSync</h2>
        </div>
        <div className="p-4 bg-emerald-500/15 rounded-2xl border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
          <Globe className="w-8 h-8 text-emerald-400" />
        </div>
      </div>

      <div className="slp-grid">
        <div className="slp-col-8 slp-glass-card p-10 shadow-2xl border border-white/5 bg-gradient-to-br from-emerald-600/5 to-transparent">
          <div className="flex justify-between items-center mb-10">
            <div className="card-header-group">
              <h3 className="text-2xl font-black premium-text-gradient uppercase tracking-[2px]">Regional Insights</h3>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1 premium-label">Live market data from your region</p>
            </div>
            <div className="flex gap-3">
              <motion.span whileHover={{ scale: 1.05 }} className="text-[11px] font-black text-green-400 bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20 cursor-pointer premium-label">COTTON +4.2%</motion.span>
              <motion.span whileHover={{ scale: 1.05 }} className="text-[11px] font-black text-red-400 bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/20 cursor-pointer premium-label">WHEAT -1.8%</motion.span>
            </div>
          </div>
          <div className="h-72" style={{ minHeight: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Your Zone', savings: 12450 },
                { name: 'Zone B', savings: 8200 },
                { name: 'Zone C', savings: 9500 },
                { name: 'Zone D', savings: 15600 }
              ]}>
                <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                  contentStyle={{ background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                />
                <Bar dataKey="savings" radius={[8, 8, 0, 0]} isAnimationActive={false}>
                  {[12450, 8200, 9500, 15600].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : 'rgba(16, 185, 129, 0.3)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="slp-col-4 slp-glass-card p-10 border border-white/5 h-full relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/[0.02] blur-3xl" />
          <div className="card-header-group mb-10">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-yellow-500/15 rounded-3xl border border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-2xl font-black premium-text-gradient uppercase tracking-[2px]">Leaderboard</h3>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest premium-label">Regional Efficiency Rankings</p>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            {[
              { rank: 1, name: 'Farmer Vikram', score: 98, trend: 'up', color: 'from-yellow-400 to-amber-600' },
              { rank: 2, name: 'Agri Shield S.', score: 95, trend: 'stable', color: 'from-slate-300 to-slate-500' },
              { rank: 3, name: 'Elite Grow', score: 92, trend: 'up', color: 'from-orange-400 to-orange-700' }
            ].map((item, idx) => (
              <motion.div 
                key={item.rank} 
                variants={itemVariants}
                whileHover={{ x: 10, backgroundColor: "rgba(255,255,255,0.05)" }}
                className="flex justify-between items-center p-6 bg-white/[0.03] rounded-[32px] border border-white/5 transition-all cursor-pointer group relative overflow-hidden"
              >
                {item.rank === 1 && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 blur-3xl pointer-events-none" />
                )}
                <div className="flex items-center gap-6 relative z-10">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                    <span className="text-lg font-black text-slate-900">{item.rank}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-black premium-text-gradient uppercase tracking-wider">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] text-gray-500 font-black uppercase premium-label">Active Sync</span>
                    </div>
                  </div>
                </div>
                <div className="text-right relative z-10">
                  <p className="text-[10px] text-gray-500 font-black uppercase mb-1 premium-label">Score</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-black text-white premium-text-gradient">{item.score}</span>
                    <div className={`p-1.5 rounded-lg ${item.trend === 'up' ? 'bg-emerald-500/10' : 'bg-blue-500/10'}`}>
                      {item.trend === 'up' ? (
                        <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.button 
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-10 py-5 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black text-gray-400 uppercase tracking-[4px] hover:text-white transition-all premium-label"
          >
            EXPLORE FULL RANKINGS
          </motion.button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="slp-module">
      <div className="slp-premium-bg">
        <div className="grid-overlay" />
        <div className="cinematic-vignette" />
      </div>

      <header className="slp-header">
        <div className="flex items-center gap-4">
          <motion.button onClick={onBack} whileTap={{ scale: 0.9 }} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <div className="flex items-center gap-3">
            <Shield className="text-green-500 w-6 h-6" />
            <h1 className="text-base font-black tracking-tight text-white uppercase">AgriSetu <span className="text-green-500">Elite</span></h1>
          </div>
        </div>

        <nav className="slp-top-nav">
          {[
            { id: 'insights', label: 'Insights' },
            { id: 'equity', label: 'Equity' },
            { id: 'safety', label: 'Safety' },
            { id: 'global', label: 'Global' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-btn-premium ${activeTab === tab.id ? 'active' : ''}`}
            >
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="nav-glow"
                  className="absolute inset-0 bg-green-500/20 blur-xl"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest premium-label">Premium Status</span>
            <span className="text-xs font-black text-green-500 uppercase">Active Member</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-500 to-emerald-500 p-[2px]">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
              <span className="text-xs font-black text-white">{farmerName ? farmerName[0] : 'F'}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="slp-main pt-32 px-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'insights' && renderInsights()}
            {activeTab === 'equity' && renderEquity()}
            {activeTab === 'safety' && renderSafety()}
            {activeTab === 'global' && renderGlobal()}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-50 p-6 bg-slate-950/80 backdrop-blur-3xl border-t border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full animate-pulse ${state.aiEngineStatus === 'Mitigating' ? 'bg-green-500' : 'bg-blue-500'}`} />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] premium-label">AI ENGINE: <span className="text-white premium-text-gradient">{state.aiEngineStatus}</span></span>
          </div>
          <div className="flex items-center gap-6">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest premium-label">Total Savings</p>
            <p className="text-sm font-black text-green-400 premium-text-gradient">₹{Math.floor(state.savings).toLocaleString()}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SmartLossProtection;
