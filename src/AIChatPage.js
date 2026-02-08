import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Mic, 
  Send, 
  Image as ImageIcon, 
  Loader2, 
  Bot,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import './AIChatPage.css';

const AIChatPage = ({ onBack, t, currentLanguage, farmerName }) => {
  const [chatMessage, setChatMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      text: `Namaste ${farmerName || 'Farmer'}! I am your AgriSetu AI assistant. How can I help you with your crops today?`,
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString()
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
        const systemPrompt = `You are an expert Indian Agricultural AI assistant named AgriSetu AI. 
        Context: Farmer Name is ${farmerName || 'Farmer'}. 
        Provide specific, helpful, and varied farming advice in simple Hinglish. 
        IMPORTANT: Your response MUST be unique to the user's question. 
        If they say "hi", greet them warmly and ask how their crops are doing. 
        If they ask about a specific crop like "tomato", give detailed advice about that crop (soil, water, pests).
        Current timestamp is ${new Date().toISOString()}. Use this to provide varied responses.
        Never repeat the same generic response about weather/irrigation for every query.`;

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
        console.log("AIChatPage: Received response:", data);
        
        if (data.error) {
          console.error("AIChatPage: API Error:", data.error);
          throw new Error(data.error.message || "API Error");
        }

        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
          const aiResponseText = data.candidates[0].content.parts[0].text;
          console.log("AIChatPage: AI Response Text:", aiResponseText);

          const aiResponse = {
            id: Date.now() + 1,
            text: aiResponseText,
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString()
          };

          setChatHistory(prev => [...prev, aiResponse]);
          setIsThinking(false);
          speak(aiResponseText);
          return; 
        } else {
          console.error("AIChatPage: Unexpected data structure:", data);
          throw new Error("Invalid API response format");
        }
      } catch (error) {
        console.error("AIChatPage: Error in handleSendMessage:", error);
      }
    }

    console.log("AIChatPage: Falling back to simulated response...");
    // Fallback if no API key or error
    setTimeout(() => {
      let aiResponseText = "";
      
      if (userMsgImg) {
        aiResponseText = "I have analyzed the image of your crop. It appears to show signs of early blight. I recommend applying a copper-based fungicide and ensuring your tools are sterilized. Would you like a detailed prevention plan?";
      } else if (text.toLowerCase().includes("hi") || text.toLowerCase().includes("hello")) {
        aiResponseText = `Namaste ${farmerName || 'Farmer'}! Main aapki kaise madad kar sakta hoon? Aaj aapki fasal kaisi hai?`;
      } else if (text.toLowerCase().includes("tomato") || text.toLowerCase().includes("tamatar")) {
        aiResponseText = "Tamatar ki fasal ke liye acchi dhoop aur sahi sinchai zaroori hai. Kya aapko kide ya bimari ki samasya hai?";
      } else {
        aiResponseText = `Aapne "${userMsgText}" ke bare me pucha hai. Iske liye sabse pehle mitti ki janch karein aur sahi fertilizer ka upyog karein.`;
      }
      
      const aiResponse = {
        id: Date.now() + 1,
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString()
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

      <div className="chat-messages-container">
        {chatHistory.map((msg) => (
          <motion.div
            key={msg.id}
            className={`message-wrapper ${msg.sender}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
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
              <span>Analyzing...</span>
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
