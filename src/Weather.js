import React, { useState, useRef, useEffect } from 'react';
import { Search, Cloud, Sun, CloudRain, Wind, Droplets, ArrowLeft, Mic, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Weather.css';

const WeatherSearch = ({ onSearch, t, currentLanguage }) => {
  const [city, setCity] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        // Basic cleaning to extract city name from sentences like "Nagpur ka weather batao"
        const cleanCity = transcript.replace(/[^\w\s]/gi, '').split(' ').pop();
        setCity(cleanCity);
        setIsRecording(false);
        onSearch(cleanCity);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        alert(t.micError || 'Speech recognition failed. Please try again.');
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, [onSearch, t.micError]);

  const startRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(true);
      recognitionRef.current.lang = currentLanguage === 'hi' ? 'hi-IN' : currentLanguage === 'mr' ? 'hi-IN' : 'en-US';
      recognitionRef.current.start();
    } else {
      alert('Speech recognition not supported in this browser.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (city.trim()) {
      onSearch(city);
    }
  };

  return (
    <motion.div 
      className="weather-search-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          <button 
            type="button" 
            className={`mic-search-btn ${isRecording ? 'active' : ''}`}
            onClick={isRecording ? () => recognitionRef.current.stop() : startRecording}
            title="Voice Search"
          >
            {isRecording ? <Loader2 className="animate-spin" size={24} /> : <Mic size={24} />}
            {isRecording && <div className="mic-pulse"></div>}
          </button>
          <input
            type="text"
            className="weather-input"
            placeholder={isRecording ? "Listening for city..." : t.weatherPlaceholder}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            autoFocus
          />
          <button type="submit" className="search-submit-btn">
            {t.search}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

const WeatherResult = ({ data, t }) => {
  // Map OpenWeatherMap icon codes to Lucide icons
  const getWeatherIcon = (iconCode) => {
    const code = iconCode.slice(0, 2);
    switch (code) {
      case '01': return <Sun size={80} className="text-yellow-400" />;
      case '02':
      case '03':
      case '04': return <Cloud size={80} className="text-gray-400" />;
      case '09':
      case '10': return <CloudRain size={80} className="text-blue-400" />;
      case '11': return <CloudRain size={80} className="text-purple-400" />; // Thunderstorm
      case '13': return <Cloud size={80} className="text-white" />; // Snow
      case '50': return <Wind size={80} className="text-gray-300" />; // Mist
      default: return <Sun size={80} className="text-yellow-400" />;
    }
  };

  return (
    <motion.div 
      className="weather-result-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="weather-main-info">
        <div className="city-header">
          <h2 className="city-name">{data.city}</h2>
          <p className="weather-date">{t.liveForecast}</p>
        </div>
        
        <div className="temp-section">
          <div className="weather-icon-large">
            {getWeatherIcon(data.icon)}
          </div>
          <div className="temp-display">
            <span className="temp-value">{Math.round(data.temp)}°C</span>
            <span className="condition-text">{data.condition}</span>
          </div>
        </div>
      </div>

      <div className="weather-details-grid">
        <div className="detail-item">
          <div className="detail-icon-wrapper">
            <Droplets size={24} />
          </div>
          <div className="detail-text">
            <span className="detail-label">{t.humidity}</span>
            <span className="detail-value">{data.humidity}%</span>
          </div>
        </div>
        
        <div className="detail-item">
          <div className="detail-icon-wrapper">
            <Wind size={24} />
          </div>
          <div className="detail-text">
            <span className="detail-label">{t.wind}</span>
            <span className="detail-value">{data.windSpeed} km/h</span>
          </div>
        </div>
      </div>
      
      <div className="farmer-advice">
        <p>💡 <strong>{t.farmerTip}:</strong> {data.temp > 30 ? t.tipHeat : data.condition.toLowerCase().includes('rain') ? t.tipRain : t.tipIdeal}</p>
        <div className="advisory-badges">
          <span className={`advisory-badge ${data.fieldWork.toLowerCase().replace(/ /g, '-')}`}>
            {data.fieldWork}
          </span>
          <span className="advisory-text">
            {data.specificAdvice}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const Weather = ({ onBack, t, currentLanguage }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;

  const handleSearch = async (city) => {
    setIsSearching(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error('City not found');
      }
      
      const data = await response.json();
      
      // Determine field work suitability and specific advice
      let fieldWork = "Suitable";
      let specificAdvice = "";
      const condition = data.weather[0].main.toLowerCase();
      
      if (condition.includes('rain')) {
        fieldWork = "Avoid Field Work";
        specificAdvice = "Wait for dry weather for spraying.";
      } else if (data.main.temp > 35) {
        fieldWork = "Avoid Afternoon Work";
        specificAdvice = "High heat detected. Ensure proper irrigation.";
      } else {
        specificAdvice = "Ideal conditions for field operations.";
      }

      setWeatherData({
        city: data.name,
        temp: data.main.temp,
        condition: data.weather[0].main,
        icon: data.weather[0].icon,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        fieldWork,
        specificAdvice
      });
    } catch (err) {
      setError(t.unableToFetch);
      setWeatherData(null);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="weather-page">
      <nav className="weather-nav">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={24} />
          <span>{t.backToDashboard}</span>
        </button>
        <h1 className="nav-title">{t.weatherTitle}</h1>
      </nav>

      <main className="weather-content">
        {!weatherData && !isSearching && !error && (
          <div className="search-hero">
            <h2 className="search-title">{t.howsWeather}</h2>
            <p className="search-subtitle">{t.weatherSearchSubtitle}</p>
          </div>
        )}

        <WeatherSearch onSearch={handleSearch} t={t} currentLanguage={currentLanguage} />

        <AnimatePresence mode="wait">
          {isSearching && (
            <motion.div 
              key="loading"
              className="loading-spinner-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="loading-spinner"></div>
              <p>{t.fetchingWeather}</p>
            </motion.div>
          )}

          {error && !isSearching && (
            <motion.div 
              key="error"
              className="error-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <p>{error}</p>
            </motion.div>
          )}

          {weatherData && !isSearching && !error && (
            <WeatherResult key="result" data={weatherData} t={t} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Weather;
