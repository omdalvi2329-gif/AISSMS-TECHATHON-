import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Globe, 
  Bell, 
  User, 
  BookOpen, 
  LifeBuoy, 
  Info, 
  ChevronRight, 
  ChevronDown, 
  Languages, 
  Type, 
  WifiOff, 
  Smartphone, 
  ShieldCheck, 
  Mail, 
  Phone, 
  FileText,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Settings.css';

const Settings = ({ onBack, t, currentLanguage, onLanguageChange, farmerName, locationData }) => {
  const [activeSection, setActiveSection] = useState(null);
  const [textSize, setTextSize] = useState('medium');
  const [offlineMode, setOfflineMode] = useState(false);
  const [notifications, setNotifications] = useState({
    cropAdvisory: true,
    weatherAlerts: true,
    govSchemes: true,
    marketPrices: true
  });
  const [silentHours, setSilentHours] = useState(false);
  const [showSupportSuccess, setShowSupportSuccess] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');

  const sections = [
    { id: 'general', title: '🌐 General Settings', icon: <Globe size={24} /> },
    { id: 'notifications', title: '🔔 Notifications & Alerts', icon: <Bell size={24} /> },
    { id: 'privacy', title: '🔐 Privacy & Account', icon: <User size={24} /> },
    { id: 'guide', title: '📘 How to Use This App', icon: <BookOpen size={24} /> },
    { id: 'help', title: '🆘 Help & Support', icon: <LifeBuoy size={24} /> },
    { id: 'legal', title: '📜 Legal & Information', icon: <Info size={24} /> },
  ];

  const toggleSection = (id) => {
    setActiveSection(activeSection === id ? null : id);
  };

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    if (supportMessage.trim()) {
      setShowSupportSuccess(true);
      setSupportMessage('');
      setTimeout(() => setShowSupportSuccess(false), 3000);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const renderSectionContent = (id) => {
    switch (id) {
      case 'general':
        return (
          <div className="section-content">
            <div className="setting-item">
              <div className="item-label">
                <Languages size={20} />
                <span>Language selection</span>
              </div>
              <select 
                value={currentLanguage} 
                onChange={(e) => onLanguageChange(e.target.value)}
                className="setting-select"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
              </select>
            </div>
            <div className="setting-item">
              <div className="item-label">
                <Type size={20} />
                <span>Text size</span>
              </div>
              <div className="size-selector">
                {['small', 'medium', 'large'].map(size => (
                  <button 
                    key={size}
                    className={`size-btn ${textSize === size ? 'active' : ''}`}
                    onClick={() => setTextSize(size)}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="setting-item">
              <div className="item-label">
                <WifiOff size={20} />
                <span>Offline mode</span>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={offlineMode} 
                  onChange={() => setOfflineMode(!offlineMode)} 
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="section-content">
            {Object.entries(notifications).map(([key, value]) => (
              <div className="setting-item" key={key}>
                <div className="item-label">
                  <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={value} 
                    onChange={() => setNotifications(prev => ({ ...prev, [key]: !prev[key] }))} 
                  />
                  <span className="slider"></span>
                </label>
              </div>
            ))}
            <div className="setting-item">
              <div className="item-label">
                <span>Silent hours option</span>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={silentHours} 
                  onChange={() => setSilentHours(!silentHours)} 
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="section-content">
            <div className="info-card">
              <h4>Account Details</h4>
              <p><strong>Name:</strong> {farmerName || 'Rahul Sharma'}</p>
              <p><strong>Phone:</strong> +91 98765 43210</p>
              <p><strong>Location:</strong> {locationData?.district || 'Pune'}, {locationData?.state || 'Maharashtra'}</p>
            </div>
            <div className="setting-item clickable">
              <div className="item-label">
                <ShieldCheck size={20} />
                <span>Data usage summary</span>
              </div>
              <ChevronRight size={18} />
            </div>
            <div className="setting-item clickable" onClick={() => alert('Cache cleared successfully!')}>
              <div className="item-label danger">
                <Trash2 size={20} />
                <span>Clear local cached data</span>
              </div>
            </div>
          </div>
        );

      case 'guide':
        return (
          <div className="section-content">
            <div className="guide-card">
              <div className="guide-step">
                <div className="step-number">1</div>
                <div className="step-info">
                  <h5>Check Weather</h5>
                  <p>Get daily rain and temperature updates for your farm.</p>
                </div>
              </div>
              <div className="guide-step">
                <div className="step-number">2</div>
                <div className="step-info">
                  <h5>Market Prices</h5>
                  <p>See live Mandi rates for your crops nearby.</p>
                </div>
              </div>
              <div className="guide-step">
                <div className="step-number">3</div>
                <div className="step-info">
                  <h5>AI Assistant</h5>
                  <p>Ask any farming question by voice or text.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'help':
        return (
          <div className="section-content">
            <div className="faq-section">
              <h5>Frequently Asked Questions</h5>
              <div className="faq-item">
                <p className="faq-q">How do I change my location?</p>
                <p className="faq-a">Go to Privacy & Account details to update your registered farm location.</p>
              </div>
            </div>
            <form className="support-form" onSubmit={handleSupportSubmit}>
              <h5>How can we help you?</h5>
              <textarea 
                placeholder="Tell us about your issue..."
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                required
              ></textarea>
              <div className="auto-info">
                <p>App Version: 1.0.0</p>
                <p>OS: Android 13</p>
                <p>User ID: AGRI-{farmerName?.slice(0,3).toUpperCase() || 'USR'}-2024</p>
              </div>
              <button type="submit" className="send-btn">Send Message</button>
            </form>
            <div className="contact-methods">
              <p><Mail size={16} /> support@agrisetu.com</p>
              <p><Phone size={16} /> +91 1800-AGRI-SETU (Toll Free)</p>
            </div>
          </div>
        );

      case 'legal':
        return (
          <div className="section-content">
            <div className="legal-doc-container">
              <div className="legal-doc">
                <div className="item-label">
                  <FileText size={20} />
                  <h5>Terms & Conditions</h5>
                </div>
                <div className="legal-text-box">
                  <p><strong>1. Acceptance of Terms:</strong> By using AgriSetu, you agree to these terms. This app is designed to support farmers with crop advisory and market information.</p>
                  <p><strong>2. Accuracy of Information:</strong> While we strive for accuracy in weather and market prices, these are for guidance only. Farming decisions should consider local conditions.</p>
                  <p><strong>3. User Responsibilities:</strong> You agree to provide correct details during onboarding for better crop advice. Do not share illegal or harmful content in the community section.</p>
                  <p><strong>4. Service Availability:</strong> We aim for 24/7 service, but some features (like market data) depend on external government sources.</p>
                  <p><strong>5. Limitation of Liability:</strong> AgriSetu is not responsible for crop loss or financial decisions based solely on app data.</p>
                </div>
              </div>

              <div className="legal-doc">
                <div className="item-label">
                  <ShieldCheck size={20} />
                  <h5>Privacy Policy</h5>
                </div>
                <div className="legal-text-box">
                  <p><strong>1. Data Collection:</strong> We collect your name, phone number, and farm location to provide personalized weather alerts and mandi prices.</p>
                  <p><strong>2. Usage of Data:</strong> Your data helps our AI improve crop suggestions. We do not sell your personal information to third parties.</p>
                  <p><strong>3. Location Access:</strong> We use your GPS only to show weather and mandi data near your farm.</p>
                  <p><strong>4. Community Privacy:</strong> When you post in the community, other farmers can see your name and crop updates.</p>
                  <p><strong>5. Data Security:</strong> Your data is stored securely. You can clear your local cache anytime from the 'Privacy & Account' section.</p>
                </div>
              </div>
            </div>
            <div className="app-info-footer">
              <p>AgriSetu - Smart Farming Companion</p>
              <p>Version 1.0.0</p>
              <p>Last Update: Feb 09, 2026</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div 
      className={`settings-page text-${textSize}`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <header className="settings-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={24} />
        </button>
        <h1>Settings</h1>
      </header>

      <main className="settings-list">
        {sections.map(section => (
          <motion.div 
            key={section.id} 
            className={`settings-section ${activeSection === section.id ? 'active' : ''}`}
            variants={itemVariants}
          >
            <button 
              className="section-header"
              onClick={() => toggleSection(section.id)}
            >
              <div className="header-title">
                {section.icon}
                <span>{section.title}</span>
              </div>
              {activeSection === section.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
            
            <AnimatePresence>
              {activeSection === section.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="section-body"
                >
                  {renderSectionContent(section.id)}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </main>

      <AnimatePresence>
        {showSupportSuccess && (
          <motion.div 
            className="success-overlay"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="success-card">
              <CheckCircle2 size={48} color="#22c55e" />
              <h3>Message Sent!</h3>
              <p>Our support team will contact you shortly.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Settings;
