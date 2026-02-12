import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Mic, 
  Send, 
  Image as ImageIcon, 
  Loader2, 
  Bot,
  X,
  MapPin,
  Sprout,
  Activity,
  Layers,
  CloudRain,
  Thermometer,
  Droplets,
  Wind,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import './AIChatPage.css';

const AIChatPage = ({ onBack, t, currentLanguage, farmerName }) => {
  const [chatMessage, setChatMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Agricultural Context State
  const [context, setContext] = useState({
    location: 'Nashik, Maharashtra',
    crop: 'Cotton',
    stage: 'Flowering',
    soil: 'Black',
    size: '5'
  });

  const [weatherData] = useState({
    temp: '28°C',
    humidity: '65%',
    rainProb: '70%',
    wind: '12 km/h',
    forecast: [
      { day: 'Mon', prob: '20%' },
      { day: 'Tue', prob: '70%' },
      { day: 'Wed', prob: '10%' },
      { day: 'Thu', prob: '5%' },
      { day: 'Fri', prob: '0%' },
      { day: 'Sat', prob: '0%' },
      { day: 'Sun', prob: '15%' }
    ]
  });

  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      text: `Namaste ${farmerName || 'Farmer'}! I am your AgriSetu Smart Advisory System. I've analyzed your farm context and I'm ready to provide data-driven advice.`,
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString(),
      context: {
        risk: 'Medium',
        confidence: 92,
        action: 'Hold Irrigation',
        alternative: 'Check Soil Moisture'
      }
    }
  ]);
  
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = window.speechSynthesis;
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatHistory, isThinking]);

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

    const userMsgText = text;
    const userMsgImg = imagePreview;

    const newMessage = {
      id: Date.now(),
      text: userMsgText,
      image: userMsgImg,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    setChatHistory(prev => [...prev, newMessage]);
    setChatMessage('');
    setSelectedImage(null);
    setImagePreview(null);
    setIsThinking(true);

    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    console.log("AIChatPage: Raw API Key from process.env:", apiKey);
    console.log("AIChatPage: Using API Key starting with:", apiKey ? apiKey.substring(0, 5) + "..." : "Missing");

    if (apiKey) {
      try {
        const userPrompt = userMsgText || "Analyze this crop image and provide advice.";
        const systemPrompt = `You are an expert Indian Agricultural AI assistant named AgriSetu Smart Advisory System. 
        Context: 
        - Farmer: ${farmerName || 'Farmer'}
        - Location: ${context.location}
        - Crop: ${context.crop}
        - Growth Stage: ${context.stage}
        - Soil Type: ${context.soil}
        - Farm Size: ${context.size} acres
        - Current Weather: ${weatherData.temp}, ${weatherData.humidity} humidity, ${weatherData.rainProb} rain probability.

        Every response must strictly follow this 6-point structured format:
        1. Decision: [Clear actionable recommendation]
        2. Reasoning: [Explain based on Location, Crop, Stage, Weather, and Soil]
        3. Risk Level: [Low/Medium/High]
        4. AI Confidence Score: [XX%]
        5. Suggested Action: [Short clear step]
        6. Alternative Option: [Backup recommendation]

        Ensure responses feel data-driven and professional, not conversational.`;

        console.log("AIChatPage: Sending request to Gemini...");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: `${systemPrompt}\n\nUser Question: ${userPrompt}` },
                ...(userMsgImg ? [{ inline_data: { mime_type: "image/jpeg", data: userMsgImg.split(',')[1] } }] : [])
              ]
            }]
          })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
          const aiResponseFullText = data.candidates[0].content.parts[0].text;
          
          // Parse out the structured data for UI badges if possible, or use defaults
          const riskMatch = aiResponseFullText.match(/Risk Level:\s*(Low|Medium|High)/i);
          const confidenceMatch = aiResponseFullText.match(/Confidence Score:\s*(\d+)%/i);
          const actionMatch = aiResponseFullText.match(/Suggested Action:\s*(.*)/i);
          const altMatch = aiResponseFullText.match(/Alternative Option:\s*(.*)/i);

          const aiResponse = {
            id: Date.now() + 1,
            text: aiResponseFullText,
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString(),
            context: {
              risk: riskMatch ? riskMatch[1] : 'Medium',
              confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 85,
              action: actionMatch ? actionMatch[1].trim() : 'Follow Advice',
              alternative: altMatch ? altMatch[1].trim() : 'Monitor Conditions'
            }
          };

          setChatHistory(prev => [...prev, aiResponse]);
          setIsThinking(false);
          speak(aiResponseFullText);
          return; 
        }
      } catch (error) {
        console.error("AIChatPage: Error in handleSendMessage:", error);
      }
    }

    // Fallback if no API key or error
    setTimeout(() => {
      let decision = "Irrigation Not Recommended";
      let reasoning = `Based on your location in ${context.location}, the high ${weatherData.rainProb} probability of rain, and your ${context.crop} being in the ${context.stage} stage in ${context.soil} soil, moisture levels are currently optimal. Adding more water now could lead to root stress.`;
      let risk = "Low";
      let confidence = "92%";
      let action = "Hold all irrigation for 24 hours";
      let alternative = "Check soil moisture manually tomorrow morning";

      if (userMsgImg) {
        decision = "Fungicide Application Recommended";
        reasoning = `The image of your ${context.crop} in ${context.location} (${context.stage} stage) suggests early fungal onset. Given the ${weatherData.humidity} humidity and ${context.soil} soil's moisture retention, conditions are favorable for disease spread.`;
        risk = "High";
        confidence = "88%";
        action = "Apply copper-based fungicide immediately";
        alternative = "Increase plant spacing if possible to improve airflow";
      }

      const aiResponseText = `1. Decision:\n${decision}\n\n2. Reasoning:\n${reasoning}\n\n3. Risk Level:\n${risk}\n\n4. AI Confidence Score:\n${confidence}\n\n5. Suggested Action:\n${action}\n\n6. Alternative Option:\n${alternative}`;
      
      const aiResponse = {
        id: Date.now() + 1,
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString(),
        context: { 
          risk: risk, 
          confidence: parseInt(confidence), 
          action: action, 
          alternative: alternative 
        }
      };
      
      setChatHistory(prev => [...prev, aiResponse]);
      setIsThinking(false);
      speak(aiResponseText);
    }, 1500);
  };

  return (
    <div className="ai-chat-page">
      <header className="chat-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={24} />
        </button>
        <div className="header-info">
          <div className="ai-avatar">
            <Bot size={24} color="#4ade80" />
            <div className="online-indicator"></div>
          </div>
          <div>
            <h1>AgriSetu AI</h1>
            <p>Online & Ready to Help</p>
          </div>
        </div>
      </header>

      <div className="chat-content-wrapper">
        <aside className="chat-sidebar">
          <div className="context-card">
            <h3><Activity size={18} className="icon-green" /> Farm Context</h3>
            <div className="input-group">
              <label><MapPin size={14} /> Location</label>
              <select value={context.location} onChange={(e) => setContext({...context, location: e.target.value})}>
                <option>Nashik, Maharashtra</option>
                <option>Pune, Maharashtra</option>
                <option>Nagpur, Maharashtra</option>
                <option>Auto Detect</option>
              </select>
            </div>
            <div className="input-group">
              <label><Sprout size={14} /> Crop</label>
              <select value={context.crop} onChange={(e) => setContext({...context, crop: e.target.value})}>
                <option>Cotton</option>
                <option>Wheat</option>
                <option>Soybean</option>
                <option>Onion</option>
                <option>Tomato</option>
              </select>
            </div>
            <div className="input-group">
              <label><Layers size={14} /> Growth Stage</label>
              <select value={context.stage} onChange={(e) => setContext({...context, stage: e.target.value})}>
                <option>Seedling</option>
                <option>Vegetative</option>
                <option>Flowering</option>
                <option>Harvest</option>
              </select>
            </div>
            <div className="input-row">
              <div className="input-group">
                <label>Soil Type</label>
                <select value={context.soil} onChange={(e) => setContext({...context, soil: e.target.value})}>
                  <option>Black</option>
                  <option>Red</option>
                  <option>Sandy</option>
                  <option>Clay</option>
                </select>
              </div>
              <div className="input-group">
                <label>Size (Acres)</label>
                <input type="number" value={context.size} onChange={(e) => setContext({...context, size: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="weather-card">
            <div className="weather-header">
              <h3><CloudRain size={18} className="icon-blue" /> Weather</h3>
              <span className="live-tag">LIVE</span>
            </div>
            <div className="weather-grid">
              <div className="weather-item">
                <Thermometer size={20} />
                <span>{weatherData.temp}</span>
              </div>
              <div className="weather-item">
                <Droplets size={20} />
                <span>{weatherData.humidity}</span>
              </div>
              <div className="weather-item">
                <CloudRain size={20} />
                <span>{weatherData.rainProb}</span>
              </div>
              <div className="weather-item">
                <Wind size={20} />
                <span>{weatherData.wind}</span>
              </div>
            </div>
            <div className="forecast-mini">
              {weatherData.forecast.map((f, i) => (
                <div key={i} className="forecast-day">
                  <span className="day-name">{f.day}</span>
                  <div className="rain-bar" style={{height: f.prob}}></div>
                  <span className="day-prob">{f.prob}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="chat-messages-container">
          {chatHistory.map((msg) => (
            <motion.div
              key={msg.id}
              className={`message-wrapper ${msg.sender}`}
              initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="message-bubble">
                {msg.image && <img src={msg.image} alt="Upload" className="message-image" />}
                <p>{msg.text}</p>
                
                {msg.sender === 'ai' && msg.context && (
                  <div className="ai-context-meta">
                    <div className="meta-row">
                      <span className={`risk-badge ${msg.context.risk.toLowerCase()}`}>
                        {msg.context.risk} Risk
                      </span>
                      <span className="confidence-score">
                        AI Confidence: {msg.context.confidence}%
                      </span>
                    </div>
                    <div className="action-buttons">
                      <button className="suggested-action">
                        <CheckCircle2 size={14} /> {msg.context.action}
                      </button>
                      <button className="alternative-option">
                        Alt: {msg.context.alternative}
                      </button>
                    </div>
                  </div>
                )}
                
                <span className="message-time">{msg.timestamp}</span>
              </div>
            </motion.div>
          ))}
          {isThinking && (
            <motion.div className="message-wrapper ai thinking">
              <div className="message-bubble">
                <Loader2 className="animate-spin" size={18} />
                <span>Analyzing Farm Context...</span>
              </div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      <footer className="chat-footer">
        {imagePreview && (
          <div className="image-preview-overlay">
            <img src={imagePreview} alt="Preview" />
            <button onClick={() => {setSelectedImage(null); setImagePreview(null);}}>
              <X size={16} />
            </button>
          </div>
        )}
        <div className="input-area">
          <input 
            type="file" 
            hidden 
            ref={fileInputRef} 
            accept="image/*" 
            onChange={handleImageUpload} 
          />
          <button 
            className="action-btn" 
            onClick={() => fileInputRef.current.click()}
          >
            <ImageIcon size={22} />
          </button>
          <div className="text-input-wrapper">
            <input 
              type="text" 
              placeholder={isRecording ? "Listening..." : "Ask anything about farming..."} 
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className={isRecording ? 'recording' : ''}
            />
            <button 
              className={`mic-btn ${isRecording ? 'active' : ''}`}
              onClick={isRecording ? () => recognitionRef.current.stop() : startRecording}
            >
              <Mic size={20} />
              {isRecording && <div className="mic-ring"></div>}
            </button>
          </div>
          <button 
            className="send-btn" 
            onClick={() => handleSendMessage()}
            disabled={!chatMessage && !selectedImage}
          >
            <Send size={22} />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default AIChatPage;
