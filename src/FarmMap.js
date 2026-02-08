import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  CloudRain, 
  Leaf, 
  Droplets, 
  AlertTriangle, 
  Info,
  Navigation,
  Activity,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './FarmMap.css';

const FarmMap = ({ onBack, t, currentLanguage, farmerName }) => {
  const [activeOverlay, setActiveOverlay] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Prevent any automatic redirects and confirm stable load
    console.log("Farm Map component mounted");
    
    const timer = setTimeout(() => {
      setIsLoading(false);
      console.log("Farm Map Loaded Successfully");
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const farmZones = [
    {
      id: 'zone-a',
      name: 'Crop Area A',
      crop: 'Wheat (Sharbati)',
      soil: 'Black Cotton',
      water: 'Good',
      risk: 'Low',
      advice: 'Growth is optimal. Keep monitoring for aphids.',
      top: '25%',
      left: '15%',
      width: '35%',
      height: '40%',
      color: '#22c55e'
    },
    {
      id: 'zone-b',
      name: 'Crop Area B',
      crop: 'Cotton (BT)',
      soil: 'Red Loamy',
      water: 'Average',
      risk: 'Medium',
      advice: 'Needs light irrigation in next 3 days.',
      top: '15%',
      left: '55%',
      width: '30%',
      height: '35%',
      color: '#eab308'
    },
    {
      id: 'water-zone',
      name: 'Water Source Zone',
      crop: 'N/A (Borewell)',
      soil: 'Sandy',
      water: 'Excellent',
      risk: 'Low',
      advice: 'Water level is stable.',
      top: '60%',
      left: '60%',
      width: '25%',
      height: '25%',
      color: '#3b82f6'
    },
    {
      id: 'storage',
      name: 'Storage Area',
      crop: 'Warehouse',
      soil: 'Concrete',
      water: 'N/A',
      risk: 'Low',
      advice: 'Area is clear.',
      top: '65%',
      left: '10%',
      width: '20%',
      height: '20%',
      color: '#94a3b8'
    }
  ];

  // Stable interaction handler - prevents event bubbling that might cause redirects
  const handleZoneClick = (e, zone) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedZone(zone);
    console.log(`Zone selected: ${zone.name}`);
  };

  const toggleOverlay = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveOverlay(activeOverlay === type ? null : type);
  };

  if (isLoading) {
    return (
      <div className="farm-map-loading-screen">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="loading-content"
        >
          <Loader2 className="animate-spin text-green-500" size={48} />
          <h2>Loading Farm Overview...</h2>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="farm-map-page-v2">
      {/* Full-screen illustrated farm container */}
      <div className="map-fullscreen-container">
        
        {/* SVG/CSS Farm Layout */}
        <div className="farm-illustration-layer">
          {/* Paths (Light Brown) */}
          <div className="pathway horizontal-path" style={{ top: '55%' }}></div>
          <div className="pathway vertical-path" style={{ left: '50%' }}></div>
          
          {/* Water Canal (Blue Curved) */}
          <svg className="canal-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path 
              d="M 85,0 Q 80,50 85,100" 
              fill="none" 
              stroke="#3b82f6" 
              strokeWidth="2" 
              className="canal-path"
            />
          </svg>

          {/* Farm Zones */}
          {farmZones.map((zone) => (
            <motion.div
              key={zone.id}
              className={`farm-zone-rect ${selectedZone?.id === zone.id ? 'active-zone' : ''}`}
              style={{
                top: zone.top,
                left: zone.left,
                width: zone.width,
                height: zone.height,
                background: activeOverlay ? 'transparent' : 'rgba(34, 197, 94, 0.15)'
              }}
              onClick={(e) => handleZoneClick(e, zone)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Special highlight for Farmer Location (Zone A) */}
              {zone.id === 'zone-a' && (
                <div className="farmer-location-marker">
                  <div className="glowing-border"></div>
                  <span className="location-label">Your Farm Area</span>
                </div>
              )}

              {/* Overlay Effects */}
              <AnimatePresence>
                {activeOverlay && (
                  <motion.div 
                    className={`overlay-layer ${activeOverlay}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                    style={{
                      backgroundColor: 
                        activeOverlay === 'weather' ? (zone.id === 'zone-b' ? '#ef4444' : '#22c55e') :
                        activeOverlay === 'health' ? (zone.id === 'zone-b' ? '#eab308' : '#22c55e') :
                        activeOverlay === 'water' ? (zone.id === 'zone-b' ? '#eab308' : '#3b82f6') :
                        activeOverlay === 'risk' ? (zone.id === 'zone-b' ? '#ef4444' : '#22c55e') : 'transparent'
                    }}
                  />
                )}
              </AnimatePresence>

              <span className="zone-name-label">{zone.name}</span>
            </motion.div>
          ))}

          {/* Tree Clusters (Small Green Circles) */}
          <div className="trees-layer">
            <div className="tree-circle" style={{ top: '10%', left: '10%' }}></div>
            <div className="tree-circle" style={{ top: '12%', left: '14%' }}></div>
            <div className="tree-circle" style={{ top: '45%', right: '20%' }}></div>
            <div className="tree-circle" style={{ bottom: '15%', left: '40%' }}></div>
          </div>
        </div>

        {/* UI Elements (Floating) */}
        <div className="map-ui-overlay">
          <header className="map-header-top glass-panel">
            <button className="back-nav-btn" onClick={(e) => { e.stopPropagation(); onBack(); }}>
              <ArrowLeft size={24} />
              <span>Dashboard</span>
            </button>
            <div className="map-title-box">
              <h1>Farm Overview</h1>
              <div className="status-indicator">
                <div className="status-dot"></div>
                <span>Live Status</span>
              </div>
            </div>
          </header>

          <div className="map-toggle-bar glass-panel">
            <button className={`toggle-item ${activeOverlay === 'weather' ? 'active' : ''}`} onClick={(e) => toggleOverlay(e, 'weather')}>
              <CloudRain size={20} />
              <span>Weather</span>
            </button>
            <button className={`toggle-item ${activeOverlay === 'health' ? 'active' : ''}`} onClick={(e) => toggleOverlay(e, 'health')}>
              <Leaf size={20} />
              <span>Health</span>
            </button>
            <button className={`toggle-item ${activeOverlay === 'water' ? 'active' : ''}`} onClick={(e) => toggleOverlay(e, 'water')}>
              <Droplets size={20} />
              <span>Water</span>
            </button>
            <button className={`toggle-item ${activeOverlay === 'risk' ? 'active' : ''}`} onClick={(e) => toggleOverlay(e, 'risk')}>
              <AlertTriangle size={20} />
              <span>Risk</span>
            </button>
          </div>

          <AnimatePresence>
            {selectedZone && (
              <motion.aside 
                className="side-info-panel-v2 glass-panel"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              >
                <div className="panel-header">
                  <h3>{selectedZone.name}</h3>
                  <button className="close-panel-btn" onClick={(e) => { e.stopPropagation(); setSelectedZone(null); }}>×</button>
                </div>
                
                <div className="panel-body">
                  <div className="stat-card">
                    <Leaf size={18} className="text-green-500" />
                    <div>
                      <label>Current Crop</label>
                      <p>{selectedZone.crop}</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <Activity size={18} className="text-blue-500" />
                    <div>
                      <label>Soil Type</label>
                      <p>{selectedZone.soil}</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <Droplets size={18} className="text-cyan-500" />
                    <div>
                      <label>Water Status</label>
                      <p>{selectedZone.water}</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <AlertTriangle size={18} className={selectedZone.risk === 'Low' ? 'text-green-500' : 'text-yellow-500'} />
                    <div>
                      <label>Risk Level</label>
                      <p className={selectedZone.risk === 'Low' ? 'text-green-500' : 'text-yellow-500'}>{selectedZone.risk}</p>
                    </div>
                  </div>
                  
                  <div className="ai-insight-box">
                    <div className="insight-header">
                      <Info size={16} />
                      <span>AI Suggested Action</span>
                    </div>
                    <p>{selectedZone.advice}</p>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          <footer className="farm-bottom-summary glass-panel">
            <div className="summary-title">
              <Activity size={18} className="text-green-500" />
              <span>AI Farm Insights</span>
            </div>
            <p>"Is area me is mahine crop growth average se accha hai. Pani ki availability theek hai, lekin 15–20 din baad irrigation planning zaruri hogi."</p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default FarmMap;
