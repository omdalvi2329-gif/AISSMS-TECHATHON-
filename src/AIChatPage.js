import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Volume2,
  VolumeX,
  Zap,
  Info,
  RefreshCw,
  Copy,
  CheckCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateKrishiMitraResponse } from './krishiMitraDemoEngine';
import './AIChatPage.css';

// ─── Simple Markdown-to-JSX Renderer ──────────────────────────────────────────
// Converts Gemini's markdown-formatted responses into styled HTML elements.
const MarkdownMessage = ({ text }) => {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let listBuffer = [];

  const flushList = (key) => {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={`ul-${key}`} className="ai-list">
          {listBuffer.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
  };

  const renderInline = (str) => {
    // Bold
    str = str.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic
    str = str.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Code
    str = str.replace(/`(.*?)`/g, '<code>$1</code>');
    return <span dangerouslySetInnerHTML={{ __html: str }} />;
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Headings
    if (trimmed.startsWith('### ')) {
      flushList(idx);
      elements.push(<h4 key={idx} className="ai-h4">{trimmed.slice(4)}</h4>);
    } else if (trimmed.startsWith('## ')) {
      flushList(idx);
      elements.push(<h3 key={idx} className="ai-h3">{trimmed.slice(3)}</h3>);
    } else if (trimmed.startsWith('# ')) {
      flushList(idx);
      elements.push(<h2 key={idx} className="ai-h2">{trimmed.slice(2)}</h2>);
    }
    // Horizontal rule
    else if (trimmed === '---' || trimmed === '***') {
      flushList(idx);
      elements.push(<hr key={idx} className="ai-hr" />);
    }
    // Bullet list
    else if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      listBuffer.push(trimmed.slice(2));
    }
    // Numbered list
    else if (/^\d+\.\s/.test(trimmed)) {
      listBuffer.push(trimmed.replace(/^\d+\.\s/, ''));
    }
    // Empty line
    else if (trimmed === '') {
      flushList(idx);
    }
    // Regular paragraph
    else {
      flushList(idx);
      elements.push(
        <p key={idx} className="ai-para">
          {renderInline(trimmed)}
        </p>
      );
    }
  });

  flushList('end');
  return <div className="markdown-body">{elements}</div>;
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AIChatPage = ({ onBack, t, currentLanguage, farmerName }) => {
  // ── Chat State ──────────────────────────────────────────────────────────────
  const [chatMessage, setChatMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imagePreviewFallback, setImagePreviewFallback] = useState(null);
  const [imagePreviewFailed, setImagePreviewFailed] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isVoiceGenerating, setIsVoiceGenerating] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState(null);

  // ── API Status State ────────────────────────────────────────────────────────
  const [apiStatus, setApiStatus] = useState('ready'); // 'ready'
  const [apiStatusMsg, setApiStatusMsg] = useState('Offline demo mode: no external APIs required.');
  const [tokenUsage, setTokenUsage] = useState(null);

  // ── Debug State ─────────────────────────────────────────────────────────────
  const [showDebug, setShowDebug] = useState(false);
  const [debugData, setDebugData] = useState(null);

  // ── Farm Context ─────────────────────────────────────────────────────────────
  const [context, setContext] = useState({
    location: 'Nashik, Maharashtra',
    crop: 'Cotton',
    stage: 'Flowering',
    soil: 'Black',
    size: '5',
  });

  const [weatherData] = useState({
    temp: '28°C',
    humidity: '65%',
    rainProb: '70%',
    wind: '12 km/h',
    forecast: [
      { day: 'Mon', prob: 20 },
      { day: 'Tue', prob: 70 },
      { day: 'Wed', prob: 10 },
      { day: 'Thu', prob: 5 },
      { day: 'Fri', prob: 0 },
      { day: 'Sat', prob: 0 },
      { day: 'Sun', prob: 15 },
    ],
  });

  // ── Chat History ─────────────────────────────────────────────────────────────
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      text: t.aiGreeting
        ? t.aiGreeting.replace('{name}', farmerName || 'Farmer')
        : `Namaste ${farmerName || 'Farmer'}! 🌾 I'm KrishiMitra AI, your intelligent farming assistant. How can I help you with your ${context.crop} crop today?`,
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString(),
      isGreeting: true,
    },
  ]);

  // ── Refs ─────────────────────────────────────────────────────────────────────
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const imageObjectUrlRef = useRef(null);
  // audioRef kept for future OpenAI TTS integration
  // const audioRef = useRef(new Audio());
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (imageObjectUrlRef.current) {
        URL.revokeObjectURL(imageObjectUrlRef.current);
        imageObjectUrlRef.current = null;
      }
    };
  }, []);

  // ── Auto-scroll to bottom ────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isThinking, streamingText, scrollToBottom]);

  // ── Initialise Offline Demo Mode ───────────────────────────────────────────
  useEffect(() => {
    setApiStatus('ready');
    setApiStatusMsg('Offline demo mode: intelligent agriculture assistant ready.');
  }, []);

  // ── Speech Recognition Setup ─────────────────────────────────────────────────
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setChatMessage(transcript);
        setIsRecording(false);
        // Auto-send voice message
        setTimeout(() => handleSendMessage(transcript), 300);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);

        if (event?.error === 'not-allowed' || event?.error === 'service-not-allowed') {
          const aiResponse = {
            id: Date.now() + 1,
            text: 'Microphone permission is blocked. Please allow microphone access in browser settings and try again.',
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString(),
            isError: true,
          };
          setChatHistory((prev) => [...prev, aiResponse]);
          speak(aiResponse.text);
        }
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Text-to-Speech ────────────────────────────────────────────────────────────
  const speak = useCallback(
    async (text) => {
      if (!voiceEnabled) return;

      // Truncate for TTS (avoid speaking 1000-word responses)
      const ttsText = text.length > 400 ? text.slice(0, 400) + '...' : text;

      // Strip markdown symbols before speaking
      const cleanText = ttsText
        .replace(/#{1,6}\s/g, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/`(.*?)`/g, '$1')
        .replace(/- /g, '')
        .replace(/✅|⚠️|💡|🚨|📍|🌾|🌱|🪨|📐/g, '');

      if (!synthRef.current) return;
      if (synthRef.current.speaking) synthRef.current.cancel();

      setIsVoiceGenerating(true);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const voices = synthRef.current.getVoices();

      const langCode = 'hi-IN';
      const hindiVoices = voices.filter((v) => v.lang === langCode || v.lang?.toLowerCase() === 'hi-in');
      const selectedVoice =
        hindiVoices.find((v) => /female|महिला|woman/i.test(v.name)) ||
        hindiVoices.find((v) => /google/i.test(v.name)) ||
        hindiVoices[0] ||
        voices.find((v) => v.lang === langCode) ||
        voices.find((v) => v.lang?.startsWith('hi'));

      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.lang = langCode;
      utterance.onend = () => setIsVoiceGenerating(false);
      utterance.onerror = () => setIsVoiceGenerating(false);
      synthRef.current.speak(utterance);
    },
    [voiceEnabled]
  );

  // ── Voice Recording ───────────────────────────────────────────────────────────
  const startRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(true);
      recognitionRef.current.lang =
        currentLanguage === 'hi'
          ? 'hi-IN'
          : currentLanguage === 'mr'
            ? 'mr-IN'
            : 'en-US';
      recognitionRef.current.start();
    } else {
      alert('Speech recognition is not supported in this browser.');
    }
  };

  // ── Image Upload ──────────────────────────────────────────────────────────────
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedImage(file);
    setImagePreviewFailed(false);
    setImagePreviewFallback(null);

    setDebugData({
      type: 'image-upload',
      userMsg: `file=${file.name} (${file.type || 'unknown'}) ${file.size} bytes`,
      response: 'selectedImage set; creating preview...',
      usage: null,
    });

    if (imageObjectUrlRef.current) {
      URL.revokeObjectURL(imageObjectUrlRef.current);
      imageObjectUrlRef.current = null;
    }

    const objectUrl = URL.createObjectURL(file);
    imageObjectUrlRef.current = objectUrl;
    setImagePreview(objectUrl);

    // Base64 fallback (some environments fail to render blob: URLs reliably)
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setImagePreviewFallback(reader.result);
        setDebugData({
          type: 'image-upload',
          userMsg: `file=${file.name} (${file.type || 'unknown'}) ${file.size} bytes`,
          response: `preview ready: blob=${Boolean(objectUrl)} base64=${reader.result.length} chars`,
          usage: null,
        });
      }
    };
    reader.readAsDataURL(file);

    // Allow selecting the same file again (otherwise onChange may not fire)
    e.target.value = '';
  };

  // ── Copy message to clipboard ─────────────────────────────────────────────────
  const copyToClipboard = (text, msgId) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMsgId(msgId);
      setTimeout(() => setCopiedMsgId(null), 2000);
    });
  };

  const readFileAsDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => reject(reader.error || new Error('Failed to read image'));
      reader.readAsDataURL(file);
    });
  };

  // ── Main Send Message Handler ─────────────────────────────────────────────────
  const handleSendMessage = async (text = chatMessage) => {
    const trimmedText = text?.trim();
    if (!trimmedText && !selectedImage) return;
    if (isThinking || isStreaming) return;

    const userMsgText = trimmedText || '';
    let userMsgImg = null;
    if (selectedImage) {
      userMsgImg = imagePreviewFallback;
      if (!userMsgImg) {
        try {
          userMsgImg = await readFileAsDataUrl(selectedImage);
        } catch (e) {
          userMsgImg = imagePreviewFallback || imagePreview;
        }
      }
    }

    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      text: userMsgText,
      image: userMsgImg,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
    };

    setChatHistory((prev) => [...prev, userMessage]);
    setChatMessage('');
    setSelectedImage(null);
    setImagePreview(null);
    setImagePreviewFallback(null);
    setImagePreviewFailed(false);
    if (imageObjectUrlRef.current) {
      URL.revokeObjectURL(imageObjectUrlRef.current);
      imageObjectUrlRef.current = null;
    }
    setIsThinking(true);
    setStreamingText('');

    // ── Offline Intelligence Engine (Text + Image) ───────────────────────────
    setIsThinking(false);
    setIsStreaming(true);

    const streamingMsgId = Date.now() + 1;
    setChatHistory((prev) => [
      ...prev,
      {
        id: streamingMsgId,
        text: '',
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString(),
        isStreaming: true,
      },
    ]);

    const { text: aiText } = generateKrishiMitraResponse({
      message: userMsgText,
      context,
      farmerName,
      currentLanguage,
      hasImage: Boolean(userMsgImg),
    });

    setDebugData({
      type: userMsgImg ? 'offline-vision' : 'offline-text',
      userMsg: userMsgText,
      response: aiText,
      usage: null,
    });
    setTokenUsage(null);

    let idx = 0;
    const chunkSize = 22;
    const interval = setInterval(() => {
      idx += chunkSize;
      const partial = aiText.slice(0, idx);
      setStreamingText(partial);
      setChatHistory((prev) =>
        prev.map((msg) =>
          msg.id === streamingMsgId
            ? { ...msg, text: partial, isStreaming: idx < aiText.length }
            : msg
        )
      );

      if (idx >= aiText.length) {
        clearInterval(interval);
        setIsStreaming(false);
        setStreamingText('');
        speak(aiText);
      }
    }, 18);
  };

  // ── Clear Chat ────────────────────────────────────────────────────────────────
  const clearChat = () => {
    if (isThinking || isStreaming) return;
    if (imageObjectUrlRef.current) {
      URL.revokeObjectURL(imageObjectUrlRef.current);
      imageObjectUrlRef.current = null;
    }
    setSelectedImage(null);
    setImagePreview(null);
    setImagePreviewFallback(null);
    setImagePreviewFailed(false);
    setChatHistory([
      {
        id: Date.now(),
        text: t.aiGreeting
          ? t.aiGreeting.replace('{name}', farmerName || 'Farmer')
          : `Namaste ${farmerName || 'Farmer'}! 🌾 How can I help you today?`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString(),
        isGreeting: true,
      },
    ]);
    setTokenUsage(null);
    setDebugData(null);
  };

  // ── Status Badge Colour ───────────────────────────────────────────────────────
  const getStatusColor = () => {
    switch (apiStatus) {
      case 'ready': return '#22c55e';
      default: return '#64748b';
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="ai-chat-page">
      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <header className="chat-header">
        <div className="header-info">
          <div className="ai-avatar">
            <Bot size={24} color="#4ade80" />
            <div
              className="online-indicator"
              style={{ backgroundColor: getStatusColor() }}
              title={apiStatusMsg}
            />
          </div>
          <div>
            <h1>{t.aiAssistant || 'KrishiMitra AI'} 🌾</h1>
            <p className="ai-subtitle-status">
              <span
                className="status-dot"
                style={{ backgroundColor: getStatusColor() }}
              />
              {apiStatus === 'ready'
                ? 'Offline Demo Mode • KrishiMitra AI'
                : 'Connecting...'}
              {tokenUsage && (
                <span className="token-badge">
                  <Zap size={10} /> {tokenUsage.totalTokens} tokens
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="header-actions">
          {/* <button
            className={`icon-btn ${showDebug ? 'active-amber' : ''}`}
            onClick={() => setShowDebug(!showDebug)}
            title="Debug Panel"
          >
            <Activity size={18} />
          </button> */}
          <button
            className={`icon-btn ${voiceEnabled ? 'active-green' : ''}`}
            onClick={() => {
              if (voiceEnabled && synthRef.current?.speaking) synthRef.current.cancel();
              setVoiceEnabled(!voiceEnabled);
            }}
            title={voiceEnabled ? 'Voice On' : 'Voice Off'}
          >
            {isVoiceGenerating ? (
              <Loader2 size={18} className="spin" />
            ) : voiceEnabled ? (
              <Volume2 size={18} />
            ) : (
              <VolumeX size={18} />
            )}
          </button>
          <button
            className="icon-btn"
            onClick={clearChat}
            title="Clear Chat"
            disabled={isThinking || isStreaming}
          >
            <RefreshCw size={18} />
          </button>
          <button className="back-btn" onClick={onBack} title="Go Back">
            <ArrowLeft size={22} />
          </button>
        </div>
      </header>

      {/* ── MAIN LAYOUT ─────────────────────────────────────────────────────── */}
      <div className="chat-content-wrapper">
        {/* ── SIDEBAR ───────────────────────────────────────────────────────── */}
        <aside className="chat-sidebar">
          {/* Farm Context Card */}
          <div className="context-card">
            <h3><Activity size={16} className="icon-green" /> Farm Context</h3>
            <div className="input-group">
              <label><MapPin size={13} /> Location</label>
              <select
                value={context.location}
                onChange={(e) => setContext({ ...context, location: e.target.value })}
              >
                <option>Nashik, Maharashtra</option>
                <option>Pune, Maharashtra</option>
                <option>Nagpur, Maharashtra</option>
                <option>Aurangabad, Maharashtra</option>
                <option>Amravati, Maharashtra</option>
                <option>Kolhapur, Maharashtra</option>
                <option>Solapur, Maharashtra</option>
                <option>Latur, Maharashtra</option>
                <option>Jalgaon, Maharashtra</option>
                <option>Delhi NCR</option>
                <option>Ludhiana, Punjab</option>
                <option>Hyderabad, Telangana</option>
              </select>
            </div>
            <div className="input-group">
              <label><Sprout size={13} /> Crop</label>
              <select
                value={context.crop}
                onChange={(e) => setContext({ ...context, crop: e.target.value })}
              >
                <option>Cotton</option>
                <option>Wheat</option>
                <option>Soybean</option>
                <option>Onion</option>
                <option>Tomato</option>
                <option>Sugarcane</option>
                <option>Rice (Paddy)</option>
                <option>Maize</option>
                <option>Groundnut</option>
                <option>Tur (Pigeon Pea)</option>
                <option>Chickpea</option>
                <option>Grapes</option>
                <option>Pomegranate</option>
                <option>Banana</option>
              </select>
            </div>
            <div className="input-group">
              <label><Layers size={13} /> Growth Stage</label>
              <select
                value={context.stage}
                onChange={(e) => setContext({ ...context, stage: e.target.value })}
              >
                <option>Seedling</option>
                <option>Vegetative</option>
                <option>Flowering</option>
                <option>Fruiting</option>
                <option>Grain Filling</option>
                <option>Maturity</option>
                <option>Harvest</option>
                <option>Post-Harvest</option>
              </select>
            </div>
            <div className="input-row">
              <div className="input-group">
                <label>Soil Type</label>
                <select
                  value={context.soil}
                  onChange={(e) => setContext({ ...context, soil: e.target.value })}
                >
                  <option>Black</option>
                  <option>Red</option>
                  <option>Sandy</option>
                  <option>Clay</option>
                  <option>Loamy</option>
                  <option>Alluvial</option>
                </select>
              </div>
              <div className="input-group">
                <label>Size (Acres)</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={context.size}
                  onChange={(e) => setContext({ ...context, size: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Weather Card */}
          <div className="weather-card">
            <div className="weather-header">
              <h3><CloudRain size={16} className="icon-blue" /> Weather</h3>
              <span className="live-tag">LIVE</span>
            </div>
            <div className="weather-grid">
              <div className="weather-item">
                <Thermometer size={18} className="icon-orange" />
                <span>{weatherData.temp}</span>
                <small>Temp</small>
              </div>
              <div className="weather-item">
                <Droplets size={18} className="icon-blue" />
                <span>{weatherData.humidity}</span>
                <small>Humidity</small>
              </div>
              <div className="weather-item">
                <CloudRain size={18} className="icon-sky" />
                <span>{weatherData.rainProb}</span>
                <small>Rain</small>
              </div>
              <div className="weather-item">
                <Wind size={18} className="icon-purple" />
                <span>{weatherData.wind}</span>
                <small>Wind</small>
              </div>
            </div>
            <div className="forecast-mini">
              {weatherData.forecast.map((f, i) => (
                <div key={i} className="forecast-day">
                  <span className="day-name">{f.day}</span>
                  <div className="rain-bar-track">
                    <div
                      className="rain-bar-fill"
                      style={{ height: `${f.prob}%`, opacity: f.prob > 0 ? 1 : 0.2 }}
                    />
                  </div>
                  <span className="day-prob">{f.prob}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Suggestions */}
          <div className="quick-suggestions-card">
            <h3><Zap size={16} className="icon-yellow" /> Quick Ask</h3>
            <div className="quick-chips">
              {[
                `Best fertilizer for ${context.crop}?`,
                'Signs of pest attack?',
                `Irrigation advice for ${context.stage} stage`,
                'Market price today?',
                'Soil testing tips',
              ].map((q, i) => (
                <button
                  key={i}
                  className="quick-chip"
                  onClick={() => {
                    setChatMessage(q);
                    inputRef.current?.focus();
                  }}
                  disabled={isThinking || isStreaming}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── MAIN CHAT AREA ────────────────────────────────────────────────── */}
        <main className="chat-main-container">
          {/* API Key Missing Banner */}
          {apiStatus === 'missing' && (
            <div className="api-missing-banner">
              <Info size={18} />
              <div>
                <strong>Offline Demo Mode</strong>
                <p>This build runs fully offline and does not require any API keys.</p>
              </div>
            </div>
          )}

          {/* Debug Panel */}
          <AnimatePresence>
            {showDebug && debugData && (
              <motion.div
                className="debug-panel"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 20 }}
              >
                <div className="debug-header">
                  <h4><Activity size={14} /> Debug Monitor</h4>
                  <button onClick={() => setShowDebug(false)}><X size={14} /></button>
                </div>
                <div className="debug-scroll">
                  <div className="debug-item">
                    <strong>Type</strong>
                    <pre>{debugData.type}</pre>
                  </div>
                  <div className="debug-item">
                    <strong>User Message</strong>
                    <pre>{debugData.userMsg}</pre>
                  </div>
                  <div className="debug-item">
                    <strong>AI Response (first 500 chars)</strong>
                    <pre>{debugData.response?.slice(0, 500)}</pre>
                  </div>
                  {debugData.usage && (
                    <div className="debug-item">
                      <strong>Token Usage</strong>
                      <div className="usage-grid">
                        <span>Prompt: {debugData.usage.promptTokens}</span>
                        <span>Response: {debugData.usage.responseTokens}</span>
                        <span>Total: {debugData.usage.totalTokens}</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Message List ──────────────────────────────────────────────────── */}
          <div className="chat-messages-container">
            <AnimatePresence initial={false}>
              {chatHistory.map((msg) => (
                <motion.div
                  key={msg.id}
                  className={`message-wrapper ${msg.sender}`}
                  initial={{ opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  {/* AI Avatar */}
                  {msg.sender === 'ai' && (
                    <div className="msg-avatar">
                      <Bot size={16} color="#4ade80" />
                    </div>
                  )}

                  <div
                    className={`message-bubble${msg.isError ? ' error-bubble' : ''}${msg.isStreaming ? ' streaming-bubble' : ''}`}
                  >
                    {/* Uploaded image */}
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="Crop upload"
                        className="message-image"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}

                    {/* Message content */}
                    {msg.sender === 'ai' ? (
                      <div>
                        <MarkdownMessage text={msg.text} />
                        {msg.isError && (
                          <button
                            className="retry-inline-btn"
                            onClick={() => {
                              // Find the last user message before this error
                              const history = [...chatHistory];
                              const errorIdx = history.findIndex(m => m.id === msg.id);
                              let lastUserMsg = null;
                              for (let i = errorIdx - 1; i >= 0; i--) {
                                if (history[i].sender === 'user') {
                                  lastUserMsg = history[i];
                                  break;
                                }
                              }
                              if (lastUserMsg) {
                                // Remove the error message and re-send
                                setChatHistory(prev => prev.filter(m => m.id !== msg.id));
                                handleSendMessage(lastUserMsg.text);
                              }
                            }}
                          >
                            <RefreshCw size={12} /> Retry Now
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="user-text">{msg.text}</p>
                    )}

                    {/* Streaming cursor */}
                    {msg.isStreaming && (
                      <span className="streaming-cursor" aria-label="Typing" />
                    )}

                    {/* Footer row */}
                    <div className="msg-footer">
                      <span className="message-time">{msg.timestamp}</span>
                      {msg.sender === 'ai' && !msg.isStreaming && msg.text && (
                        <button
                          className="copy-btn"
                          onClick={() => copyToClipboard(msg.text, msg.id)}
                          title="Copy response"
                        >
                          {copiedMsgId === msg.id ? (
                            <CheckCheck size={13} color="#22c55e" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Thinking / Loading indicator */}
            {isThinking && (
              <motion.div
                className="message-wrapper ai"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="msg-avatar">
                  <Bot size={16} color="#4ade80" />
                </div>
                <div className="message-bubble thinking-bubble">
                  <div className="thinking-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className="thinking-label">Analyzing Farm Context...</span>
                </div>
              </motion.div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* ── INPUT FOOTER ─────────────────────────────────────────────────── */}
          <footer className="chat-footer">
            {/* Image Preview */}
            <AnimatePresence>
              {selectedImage && (
                <motion.div
                  className="image-preview-overlay"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  {(() => {
                    const previewSrc = imagePreviewFailed
                      ? (imagePreviewFallback || imagePreview)
                      : (imagePreview || imagePreviewFallback);
                    return previewSrc ? (
                      <img
                        src={previewSrc}
                        alt="Preview"
                        onLoad={() => setImagePreviewFailed(false)}
                        onError={() => setImagePreviewFailed(true)}
                      />
                    ) : (
                      <div
                        style={{
                          height: 52,
                          width: 52,
                          borderRadius: 9,
                          border: '1px solid rgba(255, 255, 255, 0.07)',
                          background: 'rgba(255, 255, 255, 0.04)',
                        }}
                      />
                    );
                  })()}
                  <div className="img-preview-label">
                    <ImageIcon size={12} /> Crop image ready for analysis
                  </div>
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                      setImagePreviewFallback(null);
                      setImagePreviewFailed(false);
                      if (imageObjectUrlRef.current) {
                        URL.revokeObjectURL(imageObjectUrlRef.current);
                        imageObjectUrlRef.current = null;
                      }
                    }}
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

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
                onClick={() => fileInputRef.current?.click()}
                title="Upload crop image"
                disabled={isThinking || isStreaming}
              >
                <ImageIcon size={21} />
              </button>

              <div className={`text-input-wrapper${isRecording ? ' recording' : ''}`}>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={
                    isRecording
                      ? '🎙️ Listening...'
                      : imagePreview
                        ? 'Describe the issue (optional)...'
                        : t.chatPlaceholder || 'Ask KrishiMitra AI about your crops...'
                  }
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isThinking || isStreaming}
                />
                <button
                  className={`mic-btn ${isRecording ? 'active' : ''}`}
                  onClick={
                    isRecording
                      ? () => recognitionRef.current?.stop()
                      : startRecording
                  }
                  title={isRecording ? 'Stop recording' : 'Voice input'}
                  disabled={isThinking || isStreaming}
                >
                  <Mic size={18} />
                  {isRecording && <span className="mic-pulse" />}
                </button>
              </div>

              <button
                id="krishimitra-send-btn"
                className="send-btn"
                onClick={() => handleSendMessage()}
                disabled={(!chatMessage.trim() && !selectedImage) || isThinking || isStreaming}
                title="Send message"
              >
                {isStreaming ? (
                  <Loader2 size={20} className="spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>

            <div className="input-helper-row">
              <span className="input-helper-text">
                🌾 Upload a crop photo for disease diagnosis · Press <kbd>Enter</kbd> to send
              </span>
              {isStreaming && (
                <span className="streaming-indicator">
                  <span className="stream-dot" /> KrishiMitra is typing...
                </span>
              )}
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default AIChatPage;
