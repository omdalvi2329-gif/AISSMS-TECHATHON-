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
  CheckCircle2,
  Volume2,
  VolumeX,
  Headphones
} from 'lucide-react';
import { motion } from 'framer-motion';
import './AIChatPage.css';

const AIChatPage = ({ onBack, t, currentLanguage, farmerName }) => {
  const [chatMessage, setChatMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isVoiceGenerating, setIsVoiceGenerating] = useState(false);
  const [debugData, setDebugData] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  const audioRef = useRef(new Audio());

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
      text: t.aiGreeting.replace('{name}', farmerName || 'Farmer'),
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

  const speak = async (text) => {
    if (!voiceEnabled) return;
    
    const openAiApiKey = process.env.REACT_APP_OPENAI_API_KEY;
    
    // Fallback to browser TTS if OpenAI key is missing
    if (!openAiApiKey) {
      if (!synthRef) return;
      if (synthRef.speaking) synthRef.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const voices = synthRef.getVoices();
      const langCode = currentLanguage === 'hi' ? 'hi-IN' : currentLanguage === 'mr' ? 'hi-IN' : 'en-IN';
      
      let selectedVoice = voices.find(v => v.lang === langCode && v.name.includes('Google')) || 
                          voices.find(v => v.lang === langCode) ||
                          voices.find(v => v.lang.startsWith(langCode.split('-')[0]));

      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.lang = langCode;
      synthRef.speak(utterance);
      return;
    }

    // OpenAI TTS Integration
    try {
      setIsVoiceGenerating(true);
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: 'alloy', // Options: alloy, echo, fable, onyx, nova, shimmer
        })
      });

      if (!response.ok) throw new Error('TTS API failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = url;
        audioRef.current.play();
      }
    } catch (error) {
      console.error('OpenAI TTS Error:', error);
      // Final fallback to browser speech if OpenAI fails
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';
      synthRef.speak(utterance);
    } finally {
      setIsVoiceGenerating(false);
    }
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
    
    if (apiKey) {
      try {
        const userPrompt = userMsgText || "Analyze this crop image and provide advice.";
        
        const systemPrompt = `You are KrishiMitra AI.

Current Farm Context:
Location: ${context.location}
Crop: ${context.crop}
Growth Stage: ${context.stage}
Soil Type: ${context.soil}
Farm Size: ${context.size} acres

Provide personalized, context-aware agricultural advice.
Respond specifically based on this farm context.`;

        const debugInfo = {
          system: systemPrompt,
          user: userPrompt,
          hasImage: !!userMsgImg
        };
        console.log("KrishiMitra AI: Outgoing Request:", debugInfo);

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  { text: `System Instruction: ${systemPrompt}\n\nUser Question: ${userPrompt}` },
                  ...(userMsgImg ? [{ inline_data: { mime_type: "image/jpeg", data: userMsgImg.split(',')[1] } }] : [])
                ]
              }
            ]
          })
        });

        const data = await response.json();
        console.log("KrishiMitra AI: Incoming Response:", data);
        
        setDebugData({
          ...debugInfo,
          rawResponse: data,
          usage: data.usageMetadata || null
        });
        
        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
          const aiResponseFullText = data.candidates[0].content.parts[0].text;
          
          const aiResponse = {
            id: Date.now() + 1,
            text: aiResponseFullText,
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString()
          };

          setChatHistory(prev => [...prev, aiResponse]);
          setIsThinking(false);
          speak(aiResponseFullText);
          return; 
        } else if (data.error) {
          throw new Error(data.error.message || "API Error");
        }
      } catch (error) {
        console.error("KrishiMitra AI: API Error:", error);
        const errorResponse = {
          id: Date.now() + 1,
          text: `Sorry, I encountered an error while connecting to the AI service: ${error.message}. Please check your connection and try again.`,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString()
        };
        setChatHistory(prev => [...prev, errorResponse]);
        setIsThinking(false);
        return;
      }
    }

    // Fallback error if no API key is found
    const noApiKeyResponse = {
      id: Date.now() + 1,
      text: "KrishiMitra AI service is currently unavailable (API Key missing). Please contact support.",
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString()
    };
    setChatHistory(prev => [...prev, noApiKeyResponse]);
    setIsThinking(false);
  };

  return (
    <div className="ai-chat-page">
      <header className="chat-header">
          <div className="header-actions">
            {process.env.NODE_ENV === 'development' && (
              <button 
                className={`debug-toggle-btn ${showDebug ? 'active' : ''}`}
                onClick={() => setShowDebug(!showDebug)}
                title="Toggle Debug Mode"
              >
                <Activity size={20} />
              </button>
            )}
            <button 
              className={`voice-toggle-btn ${voiceEnabled ? 'active' : ''}`}
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              title={voiceEnabled ? "Voice On" : "Voice Off"}
            >
              {isVoiceGenerating ? (
                <Loader2 size={20} className="animate-spin text-yellow-500" />
              ) : voiceEnabled ? (
                <Volume2 size={20} className="text-green-500" />
              ) : (
                <VolumeX size={20} className="text-gray-500" />
              )}
              <span className="toggle-label">
                {isVoiceGenerating ? "Generating..." : voiceEnabled ? "Voice On" : "Voice Off"}
              </span>
            </button>
            <button className="back-btn" onClick={onBack}>
              <ArrowLeft size={24} />
            </button>
          </div>
        <div className="header-info">
          <div className="ai-avatar">
            <Bot size={24} color="#4ade80" />
            <div className="online-indicator"></div>
          </div>
          <div>
            <h1>{t.aiAssistant} 🌾</h1>
            <p>{t.aiSubtitle}</p>
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

        <main className="chat-main-container">
          {showDebug && debugData && (
            <div className="debug-panel">
              <div className="debug-header">
                <h4><Activity size={14} /> AI Debug Monitor</h4>
                <button onClick={() => setShowDebug(false)}><X size={14} /></button>
              </div>
              <div className="debug-scroll">
                <div className="debug-item">
                  <strong>System Prompt:</strong>
                  <pre>{debugData.system}</pre>
                </div>
                <div className="debug-item">
                  <strong>User Message:</strong>
                  <pre>{debugData.user}</pre>
                </div>
                <div className="debug-item">
                  <strong>Raw Response:</strong>
                  <pre>{JSON.stringify(debugData.rawResponse, null, 2)}</pre>
                </div>
                {debugData.usage && (
                  <div className="debug-item">
                    <strong>Token Usage:</strong>
                    <div className="usage-grid">
                      <span>Prompt: {debugData.usage.promptTokenCount}</span>
                      <span>Response: {debugData.usage.candidatesTokenCount}</span>
                      <span>Total: {debugData.usage.totalTokenCount}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
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
                  placeholder={isRecording ? "Listening..." : t.chatPlaceholder} 
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
            <div className="input-helper-text">
              Upload crop image or ask about farming problems.
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default AIChatPage;
