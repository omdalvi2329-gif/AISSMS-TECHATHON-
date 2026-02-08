import React, { useState, useRef, useEffect } from 'react';
import { 
  Home, 
  MessageSquare, 
  Bell, 
  ArrowLeft, 
  CheckCircle, 
  Globe, 
  BarChart3, 
  MapPin, 
  Building2,
  Mic,
  Send,
  Loader2,
  AlertTriangle,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './GlobalMarket.css';

const GlobalMarketHome = ({ t }) => {
  const demandInsights = [
    {
      id: 1,
      crop: "Organic Turmeric",
      bestCountry: "Germany",
      demandLevel: "High",
      exportPrice: "₹280 - ₹350 / kg",
      risk: "Low",
      verified: true
    },
    {
      id: 2,
      crop: "Basmati Rice",
      bestCountry: "UAE",
      demandLevel: "High",
      exportPrice: "₹110 - ₹145 / kg",
      risk: "Medium",
      verified: true
    },
    {
      id: 3,
      crop: "Alphonso Mango",
      bestCountry: "USA",
      demandLevel: "Medium",
      exportPrice: "₹1800 - ₹2500 / box",
      risk: "High",
      verified: true
    },
    {
      id: 4,
      crop: "Onion",
      bestCountry: "Malaysia",
      demandLevel: "High",
      exportPrice: "₹45 - ₹60 / kg",
      risk: "Low",
      verified: true
    }
  ];

  return (
    <motion.div 
      className="market-home-feed"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="insights-header">
        <TrendingUp size={20} className="text-green-500" />
        <h2>Live AI Demand Insights</h2>
      </div>
      
      <div className="crop-insights-grid">
        {demandInsights.map((item, index) => (
          <motion.div 
            key={item.id}
            className="crop-insight-card glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="insight-card-top">
              <h3>{item.crop}</h3>
              <div className={`demand-indicator ${item.demandLevel.toLowerCase()}`}>
                {item.demandLevel} Demand
              </div>
            </div>
            
            <div className="insight-details">
              <div className="detail-row">
                <Globe size={14} />
                <span>Best Market: <strong>{item.bestCountry}</strong></span>
              </div>
              <div className="detail-row">
                <TrendingUp size={14} />
                <span>Est. Price: <strong className="price-text">{item.exportPrice}</strong></span>
              </div>
              <div className="detail-row">
                <AlertTriangle size={14} />
                <span>Risk: <strong className={`risk-${item.risk.toLowerCase()}`}>{item.risk}</strong></span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const GlobalMarketPosts = ({ t }) => {
  const posts = [
    {
      id: 1,
      company: "Indo-Euro Logistics",
      crop: "Dehydrated Onion Powder",
      quantity: "50 Metric Tons",
      destination: "Netherlands",
      priceRange: "₹120 - ₹150 / kg",
      description: "Looking for verified farmers who can provide consistent quality onion powder. We handle all export documentation.",
      time: "2h ago"
    },
    {
      id: 2,
      company: "Gulf Food Partners",
      crop: "Green Chilies (G4 Variety)",
      quantity: "10 Tons / Weekly",
      destination: "Dubai, UAE",
      priceRange: "₹85 - ₹110 / kg",
      description: "Immediate requirement for export-grade green chilies. Weekly procurement cycle. Premium rates for GLOBALGAP certified farms.",
      time: "5h ago"
    }
  ];

  return (
    <motion.div 
      className="market-posts-feed"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {posts.map((post, index) => (
        <motion.div 
          key={post.id}
          className="post-card glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="post-header">
            <div className="company-info">
              <Building2 size={24} className="text-green-500" />
              <div>
                <h4>{post.company}</h4>
                <span className="post-time">{post.time}</span>
              </div>
            </div>
            <CheckCircle size={18} className="text-green-500" />
          </div>
          
          <div className="post-body">
            <div className="post-meta">
              <div className="meta-tag">📦 {post.crop}</div>
              <div className="meta-tag">🌍 {post.destination}</div>
            </div>
            <p className="post-desc">{post.description}</p>
            <div className="post-economics">
              <div>
                <span className="label">Quantity:</span>
                <span className="value">{post.quantity}</span>
              </div>
              <div>
                <span className="label">Expected Price:</span>
                <span className="value text-green-400">{post.priceRange}</span>
              </div>
            </div>
          </div>
          
          <button className="interest-btn">Interested (Mediated)</button>
        </motion.div>
      ))}
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

const GlobalMarket = ({ onBack, t, currentLanguage, farmerName, locationData }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [voiceResult, setVoiceResult] = useState(null);
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
        console.log("Voice captured:", transcript);
        handleVoiceQuery(transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };
      
      recognitionRef.current.onend = () => {
        console.log("Speech recognition ended");
        setIsRecording(false);
      };
    }
  }, [currentLanguage, locationData]); // Added locationData as dependency

  const speak = (text) => {
    if (synthRef.speaking) synthRef.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';
    synthRef.speak(utterance);
  };

  const startRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(true);
      recognitionRef.current.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-US';
      recognitionRef.current.start();
    }
  };

  const handleVoiceQuery = async (query) => {
    console.log("Processing voice query:", query);
    setIsThinking(true);
    setVoiceResult(null);

    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    console.log("API Key present:", !!apiKey);

    if (apiKey) {
      try {
        const prompt = `You are a Global Market Access AI Assistant for Indian farmers.
        User Query: "${query}"
        Location: ${locationData?.village || 'Unknown'}, ${locationData?.district || 'Unknown'}, ${locationData?.state || 'Unknown'}
        Month: ${new Date().toLocaleString('default', { month: 'long' })}

        Respond in simple Hinglish. 
        MANDATORY STRUCTURE:
        1. 🌍 Best Market Recommendation (Country & Reason)
        2. 💰 Price Comparison (Local vs Export)
        3. 🚚 Selling Method (Mandi vs Partner)
        4. ⚠️ Risk Level (Low/Medium/High + Short explanation)
        5. 🧭 Final Advice

        Speak like a trusted advisor. No business jargon. Keep it concise but detailed.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        });

        const data = await response.json();
        console.log("API Response data:", data);

        if (data.error) {
          throw new Error(data.error.message || "API Error");
        }

        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text) {
          const aiText = data.candidates[0].content.parts[0].text;
          setVoiceResult({ text: aiText });
          speak(aiText);
        } else {
          console.error("Unexpected API structure:", data);
          throw new Error("Invalid API response structure");
        }
      } catch (error) {
        console.error("Voice AI Error:", error);
        const errorText = `Maaf kijiye, AI response me kuch takleef ho rahi hai: ${error.message}. Kripya thodi der baad koshish karein.`;
        setVoiceResult({ text: errorText });
        speak(errorText);
      }
    } else {
      console.log("No API Key, using fallback");
      const fallbackText = "Abhi Haldi ke liye UAE market bahut accha hai. Local mandi me ₹80 hai, export me ₹140 tak mil sakta hai. Aap hamare export partners ke zariye bech sakte hain. Risk Medium hai quality check ki wajah se. Advice: Agle 10 din me bechna behtar rahega.";
      setVoiceResult({ text: fallbackText });
      speak(fallbackText);
    }
    setIsThinking(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <GlobalMarketHome t={t} />;
      case 'posts': return <GlobalMarketPosts t={t} />;
      case 'notifications': return <GlobalMarketNotifications t={t} />;
      default: return <GlobalMarketHome t={t} />;
    }
  };

  return (
    <div className="global-market-page dark-theme">
      {/* LinkedIn style top navigation */}
      <div className="market-header-tabs glass-card">
        <button className="back-btn" onClick={onBack}><ArrowLeft size={20} /></button>
        <div className="nav-tabs">
          <button className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
            <Home size={20} />
            <span>Home</span>
          </button>
          <button className={`nav-tab ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>
            <MessageSquare size={20} />
            <span>Posts</span>
          </button>
          <button className={`nav-tab ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
            <div className="icon-badge-wrapper">
              <Bell size={20} />
              <span className="notif-badge">3</span>
            </div>
            <span>Alerts</span>
          </button>
        </div>
      </div>

      <main className="market-container">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </main>

      {/* Floating AI Voice Assistant */}
      <div className="voice-assistant-container">
        <AnimatePresence>
          {voiceResult && (
            <motion.div 
              className="ai-response-overlay glass-card"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
            >
              <div className="overlay-header">
                <h3>AI Assistant Advice</h3>
                <button onClick={() => setVoiceResult(null)} className="close-btn"><X size={20} /></button>
              </div>
              <div className="ai-text-output">
                {voiceResult.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button 
          className={`floating-mic-btn ${isRecording ? 'recording' : ''}`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={isRecording ? () => recognitionRef.current.stop() : startRecording}
        >
          {isThinking ? <Loader2 className="animate-spin" /> : <Mic size={28} />}
          {isRecording && <div className="mic-pulse"></div>}
        </motion.button>
      </div>
    </div>
  );
};

export default GlobalMarket;
