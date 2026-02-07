import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  X, 
  User, 
  Settings as SettingsIcon, 
  Globe, 
  LogOut, 
  Mic, 
  Send,
  Cloud,
  TrendingUp,
  Map,
  Calendar,
  ChevronRight,
  Languages,
  Image as ImageIcon,
  Camera,
  Loader2,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { languages } from './translations';
import './Dashboard.css';

const Dashboard = ({ onLogout, onNavigateToWeather, onNavigateToMarket, onNavigateToGlobalMarket, onNavigateToFarmMap, farmerName, currentLanguage, onLanguageChange, t }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = window.speechSynthesis;

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setChatMessage(transcript);
        setIsRecording(false);
        handleSendMessage(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const speak = (text) => {
    if (synthRef.speaking) synthRef.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLanguage === 'hi' ? 'hi-IN' : currentLanguage === 'mr' ? 'hi-IN' : 'en-IN';
    synthRef.speak(utterance);
  };

  const startRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(true);
      recognitionRef.current.lang = currentLanguage === 'hi' ? 'hi-IN' : currentLanguage === 'mr' ? 'hi-IN' : 'en-US';
      recognitionRef.current.start();
    } else {
      alert('Speech recognition not supported in this browser.');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (text = chatMessage) => {
    if (!text && !selectedImage) return;

    const newMessage = {
      id: Date.now(),
      text: text,
      image: imagePreview,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    setChatHistory(prev => [...prev, newMessage]);
    setChatMessage('');
    setSelectedImage(null);
    setImagePreview(null);
    setIsThinking(true);

    // Simulate AI Response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: selectedImage 
          ? "I have analyzed the image. It looks like a common pest issue. I recommend using Neem oil spray and maintaining proper drainage. Would you like more details?" 
          : `Namaste ${firstName}! How can I help you with your farm today?`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString()
      };
      setChatHistory(prev => [...prev, aiResponse]);
      setIsThinking(false);
      speak(aiResponse.text);
    }, 1500);
  };

  const firstName = farmerName ? farmerName.split(' ')[0] : '';
  const greetingTemplate = farmerName ? t.aiGreeting : t.aiDefaultGreeting;
  const greeting = greetingTemplate.replace('{name}', firstName || 'Farmer');

  const featureCards = [
    {
      id: 1,
      title: t.weather,
      description: t.weatherDesc,
      icon: <Cloud className="card-icon" />,
      color: "#3b82f6",
      onClick: onNavigateToWeather
    },
    {
      id: 2,
      title: t.marketPrice,
      description: t.marketPriceDesc,
      icon: <TrendingUp className="card-icon" />,
      color: "#10b981",
      onClick: onNavigateToMarket
    },
    {
      id: 3,
      title: t.globalMarket,
      description: t.globalMarketDesc,
      icon: <Globe className="card-icon" />,
      color: "#8b5cf6",
      onClick: onNavigateToGlobalMarket
    },
    {
      id: 4,
      title: t.seasonalAdvice,
      description: t.seasonalAdviceDesc,
      icon: <Calendar className="card-icon" />,
      color: "#f59e0b"
    },
    {
      id: 5,
      title: t.farmMap,
      description: t.farmMapDesc,
      icon: <Map className="card-icon" />,
      color: "#22c55e",
      onClick: onNavigateToFarmMap
    },
    {
      id: 6,
      title: t.settings,
      description: t.settings,
      icon: <SettingsIcon className="card-icon" />,
      color: "#64748b"
    }
  ];

  const sidebarItems = [
    { icon: <User size={20} />, label: t.profile },
    { icon: <SettingsIcon size={20} />, label: t.settings },
    { icon: <Globe size={20} />, label: t.language },
  ];

  return (
    <div className="dashboard-layout">
      {/* Top Navigation */}
      <nav className="top-nav">
        <button 
          className="icon-button menu-btn" 
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={28} />
        </button>
        
        <div className="app-logo">
          <span className="logo-text">AgriSetu</span>
          <div className="logo-dot"></div>
        </div>

        <div className="header-right">
          <div className="lang-selector-wrapper">
            <button 
              className="lang-pill"
              onClick={() => setIsLangOpen(!isLangOpen)}
            >
              <Languages size={18} />
              <span>{languages.find(l => l.code === currentLanguage)?.name}</span>
            </button>
            
            <AnimatePresence>
              {isLangOpen && (
                <motion.div 
                  className="lang-dropdown"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      className={`lang-option ${currentLanguage === lang.code ? 'active' : ''}`}
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setIsLangOpen(false);
                      }}
                    >
                      {lang.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* Sidebar Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              className="sidebar-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.aside 
              className="sidebar"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="sidebar-header">
                <div className="profile-section">
                  <div className="profile-avatar">
                    <User size={32} />
                  </div>
                  <div className="profile-info">
                    <h3>{farmerName || t.farmerLogin}</h3>
                    <p>{t.premiumFarmer}</p>
                  </div>
                </div>
                <button className="icon-button close-btn" onClick={() => setIsSidebarOpen(false)}>
                  <X size={24} />
                </button>
              </div>

              <div className="sidebar-content">
                {sidebarItems.map((item, index) => (
                  <button key={index} className="sidebar-item">
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
                <div className="sidebar-divider"></div>
                <button className="sidebar-item logout" onClick={onLogout}>
                  <LogOut size={20} />
                  <span>{t.logout}</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="dashboard-main">
        {/* AI Chatbot Hero Section */}
        <section className="hero-section">
          <motion.div 
            className="ai-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="ai-card-glow"></div>
            <div className="ai-header">
              <div className="ai-status">
                <div className="pulse-dot"></div>
                <span>{t.aiOnline}</span>
              </div>
              <h1 className="ai-title">{t.aiAssistant}</h1>
              <p className="ai-subtitle">{t.aiSubtitle}</p>
            </div>

            <div className="chat-container">
              <div className="chat-history">
                <AnimatePresence>
                  {chatHistory.map((msg) => (
                    <motion.div
                      key={msg.id}
                      className={`message-bubble ${msg.sender}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {msg.image && <img src={msg.image} alt="Upload" className="message-image" />}
                      <p>{msg.text}</p>
                      <span className="msg-time">{msg.timestamp}</span>
                    </motion.div>
                  ))}
                  {isThinking && (
                    <motion.div className="message-bubble ai thinking">
                      <Loader2 className="animate-spin" size={18} />
                      <span>AgriSetu AI is thinking...</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {imagePreview && (
                <div className="image-preview-bar">
                  <img src={imagePreview} alt="Preview" />
                  <button onClick={() => {setSelectedImage(null); setImagePreview(null);}}>
                    <X size={16} />
                  </button>
                </div>
              )}

              <div className="chat-input-container">
                <input 
                  type="text" 
                  placeholder={isRecording ? "Listening..." : t.chatPlaceholder} 
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className={`chat-input ${isRecording ? 'recording' : ''}`}
                />
                <div className="chat-actions">
                  <input 
                    type="file" 
                    hidden 
                    ref={fileInputRef} 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                  />
                  <button 
                    className="icon-btn image-btn" 
                    onClick={() => fileInputRef.current.click()}
                    title="Upload Image"
                  >
                    <ImageIcon size={22} />
                  </button>
                  <button 
                    className={`icon-btn voice-btn ${isRecording ? 'active' : ''}`} 
                    onClick={isRecording ? () => recognitionRef.current.stop() : startRecording}
                    title="Voice Input"
                  >
                    <Mic size={22} />
                    {isRecording && <div className="mic-pulse"></div>}
                  </button>
                  <button 
                    className="send-btn" 
                    onClick={() => handleSendMessage()}
                    disabled={!chatMessage && !selectedImage}
                  >
                    <Send size={22} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="features-section">
          <div className="grid-container">
            {featureCards.map((card, index) => (
              <motion.div
                key={card.id}
                className="feature-card"
                onClick={card.onClick}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1), duration: 0.5 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="card-inner">
                  <div className="card-icon-wrapper" style={{ '--icon-color': card.color }}>
                    {card.icon}
                  </div>
                  <div className="card-content">
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                  </div>
                  <ChevronRight className="card-arrow" size={20} />
                </div>
                <div className="card-glow"></div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* About Us Section (Footer) */}
        <section className="about-section footer-about">
          <motion.div 
            className="about-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="about-header">
              <h2 className="about-title">{t.aboutTitle}</h2>
              <p className="about-subtitle">{t.aboutSubtitle}</p>
            </div>

            <div className="about-content">
              <p>{t.aboutPara1}</p>
              <p>{t.aboutPara2}</p>
              <p>{t.aboutPara3}</p>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
