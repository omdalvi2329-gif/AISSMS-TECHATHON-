import React, { useMemo } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Droplets, 
  Sprout, 
  Bug, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  CheckCircle2, 
  FileText,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import './OptimizePlanPage.css';

const OptimizePlanPage = ({ onBack, locationData }) => {
  const farmSize = parseFloat(locationData?.farmSize || 3);
  const crop = locationData?.cropType || 'Cotton';

  // Static mock data for demo, similar to AIImpactDashboard logic
  const simulationResults = useMemo(() => ({
    waterSavings: 22,
    profitPercentage: 18.5
  }), []);

  return (
    <motion.div 
      className="optimize-page-container"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <header className="optimize-header">
        <button className="back-btn-premium" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>
        <div className="optimize-title-section">
          <h1>AI Farm Optimization Plan</h1>
          <div className="ai-badge">
            <Sparkles size={14} />
            <span>AI Powered</span>
          </div>
        </div>
      </header>

      <main className="optimize-main">
        <section className="opt-hero-premium">
          <div className="opt-hero-content">
            <div className="opt-hero-icon-box">
              <Sparkles size={24} />
            </div>
            <div className="opt-hero-details">
              <h2>Premium Optimization Blueprint</h2>
              <p>Tailored for {crop} • {farmSize} acres • Real-time Environmental Sync Active</p>
            </div>
          </div>
          <div className="opt-hero-status">
            <ShieldCheck size={16} />
            <span>Actionable Now</span>
          </div>
        </section>

        <div className="optimize-grid-full">
          {/* Step 1 */}
          <motion.div 
            className="opt-card-premium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="opt-card-header">
              <div className="icon-wrapper green"><Droplets size={20} /></div>
              <div className="header-text">
                <h3>Irrigation Calibration</h3>
                <span className="kpi">Target: {Math.round(100 - simulationResults.waterSavings)}% Flow</span>
              </div>
              <div className="step-pill">Step 1</div>
            </div>
            <p>Adjust water flow to {Math.round(100 - simulationResults.waterSavings)}% based on current moisture levels and predictive rainfall data.</p>
          </motion.div>

          {/* Step 2 */}
          <motion.div 
            className="opt-card-premium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="opt-card-header">
              <div className="icon-wrapper blue"><Sprout size={20} /></div>
              <div className="header-text">
                <h3>Nutrient Timing</h3>
                <span className="kpi">Window: Next 48h</span>
              </div>
              <div className="step-pill">Step 2</div>
            </div>
            <p>Apply Nitrogen-rich fertilizers in the next 48 hours for maximum absorption before predicted light rain.</p>
          </motion.div>

          {/* Step 3 */}
          <motion.div 
            className="opt-card-premium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="opt-card-header">
              <div className="icon-wrapper amber"><Bug size={20} /></div>
              <div className="header-text">
                <h3>Pest Alert</h3>
                <span className="kpi">Humidity: High Risk</span>
              </div>
              <div className="step-pill">Step 3</div>
            </div>
            <p>Increased humidity detected. Spray organic neem oil proactively to prevent aphid infestation.</p>
          </motion.div>

          {/* Step 4 */}
          <motion.div 
            className="opt-card-premium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="opt-card-header">
              <div className="icon-wrapper purple"><TrendingUp size={20} /></div>
              <div className="header-text">
                <h3>Market Timing</h3>
                <span className="kpi">Gain: +12% Opportunity</span>
              </div>
              <div className="step-pill">Step 4</div>
            </div>
            <p>Mandi prices are peaking. Schedule harvest for early next week to capture projected price surge.</p>
          </motion.div>

          {/* Step 5 - Wide */}
          <motion.div 
            className="opt-card-premium wide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="opt-card-header">
              <div className="icon-wrapper rose"><DollarSign size={20} /></div>
              <div className="header-text">
                <h3>Cost Reduction Strategy</h3>
                <span className="kpi">Target: -10% Labor Hours</span>
              </div>
              <div className="step-pill">Step 5</div>
            </div>
            <p>AI suggests reducing labor hours by 10% by automating irrigation triggers based on real-time soil moisture sensors.</p>
          </motion.div>
        </div>

        <footer className="optimize-footer-sticky">
          <div className="footer-note">
            <Zap size={14} />
            <span>Apply these steps for the next 7 days for optimal results.</span>
          </div>
          <div className="footer-actions-premium">
            <button className="btn-secondary-premium" onClick={onBack}>
              <FileText size={18} />
              <span>Save to Dashboard</span>
            </button>
            <button className="btn-primary-premium" onClick={onBack}>
              <CheckCircle2 size={18} />
              <span>Apply All Recommendations</span>
            </button>
          </div>
        </footer>
      </main>
    </motion.div>
  );
};

export default OptimizePlanPage;
