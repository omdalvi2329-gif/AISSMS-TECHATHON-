import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Cloud, Sun, CloudRain, Wind, ArrowLeft, Mic, Loader2, ArrowUp, Gauge, Sunrise, Sunset } from 'lucide-react';
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

const PlanningAlerts = ({ analysis, t }) => {
  if (!analysis) return null;

  const rainTimes = Array.isArray(analysis.rainTimes) ? analysis.rainTimes : [];
  const sunTimes = Array.isArray(analysis.sunTimes) ? analysis.sunTimes : [];
  const coldWindTimes = Array.isArray(analysis.coldWindTimes) ? analysis.coldWindTimes : [];

  return (
    <motion.div
      className="planning-alerts"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="planning-alerts__title">{t?.planningAlertsTitle || 'Planning Alerts'}</div>
      <div className="planning-alerts__grid">
        <div className="planning-alerts__item">
          <div className="planning-alerts__label">{t?.rainExpected || 'Rain Expected'}</div>
          <div className="planning-alerts__value">{analysis.rain ? (t?.yes || 'Yes') : (t?.no || 'No')}</div>
        </div>
        {analysis.rain && (
          <div className="planning-alerts__times">
            {(rainTimes.length > 0 ? rainTimes : [t?.noData || 'No times available']).slice(0, 5).map((time, idx) => (
              <div key={`rain-${idx}`} className="planning-alerts__time">{time}</div>
            ))}
          </div>
        )}
        <div className="planning-alerts__item">
          <div className="planning-alerts__label">{t?.sunnyPeriods || 'Sunny Periods'}</div>
          <div className="planning-alerts__value">{analysis.sun ? (t?.yes || 'Yes') : (t?.no || 'No')}</div>
        </div>
        {analysis.sun && (
          <div className="planning-alerts__times">
            {(sunTimes.length > 0 ? sunTimes : [t?.noData || 'No times available']).slice(0, 5).map((time, idx) => (
              <div key={`sun-${idx}`} className="planning-alerts__time">{time}</div>
            ))}
          </div>
        )}
        <div className="planning-alerts__item">
          <div className="planning-alerts__label">{t?.coldWind || 'Cold Wind'}</div>
          <div className="planning-alerts__value">{analysis.coldWind ? (t?.possible || 'Possible') : (t?.no || 'No')}</div>
        </div>
        {analysis.coldWind && (
          <div className="planning-alerts__times">
            {(coldWindTimes.length > 0 ? coldWindTimes : [t?.noData || 'No times available']).slice(0, 5).map((time, idx) => (
              <div key={`wind-${idx}`} className="planning-alerts__time">{time}</div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const HourlyForecastSection = ({ isLoading, items, t }) => {
  if (isLoading) {
    return (
      <motion.div
        className="hourly-section"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="hourly-header">
          <h3 className="hourly-title">{t?.hourlyTitle || 'Hourly Forecast'}</h3>
        </div>
        <div className="hourly-scroll">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="hourly-card hourly-skeleton" />
          ))}
        </div>
      </motion.div>
    );
  }

  if (!items || items.length === 0) return null;

  return (
    <motion.div
      className="hourly-section"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="hourly-header">
        <h3 className="hourly-title">{t?.hourlyTitle || 'Hourly Forecast'}</h3>
      </div>
      <div className="hourly-scroll">
        {items.map((slot) => (
          <div key={slot.key} className="hourly-card">
            <div className="hourly-time">{slot.label}</div>
            <div className="hourly-icon">{slot.icon}</div>
            <div className="hourly-temp">{Math.round(slot.temp)}°C</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const getWeatherIconLarge = (iconCode) => {
  const code = (iconCode || '01d').slice(0, 2);
  switch (code) {
    case '01':
      return <Sun size={72} className="agri-icon agri-icon--sun" />;
    case '02':
    case '03':
    case '04':
      return <Cloud size={72} className="agri-icon agri-icon--cloud" />;
    case '09':
    case '10':
      return <CloudRain size={72} className="agri-icon agri-icon--rain" />;
    case '11':
      return <CloudRain size={72} className="agri-icon agri-icon--thunder" />;
    case '13':
      return <Cloud size={72} className="agri-icon agri-icon--snow" />;
    case '50':
      return <Wind size={72} className="agri-icon agri-icon--wind" />;
    default:
      return <Sun size={72} className="agri-icon agri-icon--sun" />;
  }
};

const clamp01 = (n) => Math.min(1, Math.max(0, n));

const formatClockTime = (tsSeconds) => {
  if (typeof tsSeconds !== 'number') return '--';
  const date = new Date(tsSeconds * 1000);
  try {
    return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date);
  } catch {
    return date.toLocaleTimeString();
  }
};

const WeatherTabs = ({ active, onChange, t }) => {
  const tabs = [
    { key: 'overview', label: t?.overview || 'Overview' },
    { key: 'precipitation', label: t?.precipitation || 'Precipitation' },
    { key: 'wind', label: t?.wind || 'Wind' },
    { key: 'humidity', label: t?.humidity || 'Humidity' }
  ];

  return (
    <div className="gw-tabs" role="tablist" aria-label="Weather tabs">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={active === tab.key}
          className={`gw-tab ${active === tab.key ? 'active' : ''}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

const WeatherHero = ({ data, t, precipPct, airQualityLabel }) => {
  if (!data) return null;

  return (
    <motion.section
      className="gw-hero gw-card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="gw-hero__top">
        <div className="gw-hero__location">
          <div className="gw-hero__city">{data.city}</div>
          <div className="gw-hero__meta">{t.liveForecast}</div>
        </div>
        <div className="gw-hero__icon" aria-hidden="true">{getWeatherIconLarge(data.icon)}</div>
      </div>

      <div className="gw-hero__main">
        <div className="gw-hero__temp">{Math.round(data.temp)}°</div>
        <div className="gw-hero__condition">{data.condition}</div>
        <div className="gw-hero__sub">
          <span>{t?.feelsLike || 'Feels like'} {typeof data.feelsLike === 'number' ? `${Math.round(data.feelsLike)}°C` : '--'}</span>
          <span className="gw-dot" aria-hidden="true" />
          <span>{t?.highLow || 'High/Low'} {typeof data.tempMax === 'number' ? `${Math.round(data.tempMax)}°` : '--'} / {typeof data.tempMin === 'number' ? `${Math.round(data.tempMin)}°` : '--'}</span>
        </div>
      </div>

      <div className="gw-hero__metrics">
        <div className="gw-metric">
          <div className="gw-metric__label">{t.humidity}</div>
          <div className="gw-metric__value">{data.humidity}%</div>
        </div>
        <div className="gw-metric">
          <div className="gw-metric__label">{t.wind}</div>
          <div className="gw-metric__value">{data.windSpeed} km/h</div>
        </div>
        <div className="gw-metric">
          <div className="gw-metric__label">{t?.precipitation || 'Precipitation'}</div>
          <div className="gw-metric__value">{Number.isFinite(precipPct) ? `${Math.round(precipPct)}%` : '--'}</div>
        </div>
        <div className="gw-metric">
          <div className="gw-metric__label">{t?.airQuality || 'Air quality'}</div>
          <div className="gw-metric__value">{airQualityLabel || '--'}</div>
        </div>
      </div>
    </motion.section>
  );
};

const WeeklyForecastList = ({ isLoading, items, t }) => {
  if (isLoading) {
    return (
      <div className="gw-card gw-weekly">
        <div className="gw-section-title">{t?.weeklyTitle || '7-Day Forecast'}</div>
        <div className="gw-weekly__list">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="gw-weekly__row gw-weekly__row--skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) return null;

  return (
    <div className="gw-card gw-weekly">
      <div className="gw-section-title">{t?.weeklyTitle || '7-Day Forecast'}</div>
      <div className="gw-weekly__list">
        {items.map((day) => (
          <div key={day.dateKey} className="gw-weekly__row">
            <div className="gw-weekly__day">{day.label}</div>
            <div className="gw-weekly__icon" aria-hidden="true">{day.icon}</div>
            <div className="gw-weekly__temps">
              <span className="gw-weekly__max">{Math.round((typeof day.tempMax === 'number' ? day.tempMax : day.temp))}°</span>
              <span className="gw-weekly__min">{Math.round((typeof day.tempMin === 'number' ? day.tempMin : day.temp))}°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DetailsGrid = ({ data, t }) => {
  if (!data) return null;

  const pressure = typeof data.pressure === 'number' ? data.pressure : null;
  const pressurePct = pressure == null ? null : clamp01((pressure - 980) / (1040 - 980));
  const pressureDeg = pressurePct == null ? 0 : Math.round(pressurePct * 180);

  const sunrise = typeof data.sunrise === 'number' ? data.sunrise : null;
  const sunset = typeof data.sunset === 'number' ? data.sunset : null;
  const now = Date.now() / 1000;
  const dayPct = sunrise && sunset && sunset > sunrise ? clamp01((now - sunrise) / (sunset - sunrise)) : null;
  const daySweep = dayPct == null ? 0 : Math.round(dayPct * 180);

  const windDeg = typeof data.windDeg === 'number' ? data.windDeg : null;

  return (
    <div className="gw-details">
      <div className="gw-section-title">{t?.detailsTitle || 'Details'}</div>
      <div className="gw-details__grid">
        <div className="gw-card gw-detail">
          <div className="gw-detail__label">{t?.uvIndex || 'UV Index'}</div>
          <div className="gw-detail__value">--</div>
        </div>

        <div className="gw-card gw-detail">
          <div className="gw-detail__label">{t?.pressure || 'Pressure'}</div>
          <div className="gw-detail__gauge">
            <div className="gw-gauge">
              <div className="gw-gauge__arc" />
              <div className="gw-gauge__needle" style={{ transform: `rotate(${pressureDeg}deg)` }} />
              <div className="gw-gauge__icon"><Gauge size={18} /></div>
            </div>
            <div className="gw-detail__value">{pressure == null ? '--' : `${pressure} hPa`}</div>
          </div>
        </div>

        <div className="gw-card gw-detail gw-detail--span">
          <div className="gw-detail__label">{t?.sunriseSunset || 'Sunrise & Sunset'}</div>
          <div className="gw-sun">
            <div className="gw-sun__arc">
              <div className="gw-sun__arc-bg" />
              <div className="gw-sun__arc-fg" style={{ transform: `rotate(${daySweep}deg)` }} />
            </div>
            <div className="gw-sun__times">
              <div className="gw-sun__time"><Sunrise size={18} /> <span>{formatClockTime(sunrise)}</span></div>
              <div className="gw-sun__time"><Sunset size={18} /> <span>{formatClockTime(sunset)}</span></div>
            </div>
          </div>
        </div>

        <div className="gw-card gw-detail">
          <div className="gw-detail__label">{t?.windDirection || 'Wind direction'}</div>
          <div className="gw-winddir">
            <div className="gw-winddir__dial">
              <div className="gw-winddir__arrow" style={{ transform: `rotate(${windDeg == null ? 0 : windDeg}deg)` }}>
                <ArrowUp size={20} />
              </div>
            </div>
            <div className="gw-detail__value">{windDeg == null ? '--' : `${windDeg}°`}</div>
          </div>
        </div>

        <div className="gw-card gw-detail">
          <div className="gw-detail__label">{t.humidity}</div>
          <div className="gw-humidity">
            <div className="gw-humidity__bar">
              <div className="gw-humidity__fill" style={{ width: `${Math.min(100, Math.max(0, Number(data.humidity) || 0))}%` }} />
            </div>
            <div className="gw-detail__value">{data.humidity}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Weather = ({ onBack, t, currentLanguage }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [forecast, setForecast] = useState([]);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [forecastAnalysis, setForecastAnalysis] = useState(null);
  const [isForecastLoading, setIsForecastLoading] = useState(false);
  const [backgroundClass, setBackgroundClass] = useState('');
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const lastQueryRef = useRef(null);
  const inFlightRef = useRef(null);
  const lastRequestKeyRef = useRef(null);

  const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;

  const getLangParam = useCallback(() => {
    if (!currentLanguage) return 'en';
    if (currentLanguage === 'hi') return 'hi';
    if (currentLanguage === 'mr') return 'mr';
    return 'en';
  }, [currentLanguage]);

  const getBackgroundClassFromCondition = useCallback((mainCondition) => {
    const cond = (mainCondition || '').toLowerCase();
    if (cond.includes('thunder')) return 'weather-bg-thunder';
    if (cond.includes('rain') || cond.includes('drizzle')) return 'weather-bg-rain';
    if (cond.includes('mist') || cond.includes('fog') || cond.includes('haze') || cond.includes('smoke')) return 'weather-bg-mist';
    if (cond.includes('cloud')) return 'weather-bg-clouds';
    if (cond.includes('clear')) return 'weather-bg-clear';
    return 'weather-bg-default';
  }, []);

  const formatTimeLabel = useCallback((date) => {
    try {
      return new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).format(date);
    } catch {
      const hours = date.getHours();
      const h = hours % 12 || 12;
      const suffix = hours >= 12 ? 'PM' : 'AM';
      return `${h} ${suffix}`;
    }
  }, []);

  const formatDayLabel = useCallback((date) => {
    try {
      return new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(date);
    } catch {
      return date.toDateString();
    }
  }, []);

  const mapForecastToDaily = useCallback((forecastJson) => {
    const list = Array.isArray(forecastJson?.list) ? forecastJson.list : [];
    if (list.length === 0) return [];

    const byDate = new Map();
    for (const item of list) {
      const dt = typeof item?.dt === 'number' ? new Date(item.dt * 1000) : null;
      if (!dt) continue;
      const dateKey = dt.toISOString().slice(0, 10);
      if (!byDate.has(dateKey)) byDate.set(dateKey, []);
      byDate.get(dateKey).push(item);
    }

    const dateKeys = Array.from(byDate.keys()).sort();
    const todayKey = new Date().toISOString().slice(0, 10);
    const upcoming = dateKeys.filter((k) => k >= todayKey).slice(0, 5);

    return upcoming.map((dateKey) => {
      const entries = byDate.get(dateKey) || [];
      const midday = entries.reduce((best, cur) => {
        if (!best) return cur;
        const bestHour = new Date(best.dt * 1000).getHours();
        const curHour = new Date(cur.dt * 1000).getHours();
        return Math.abs(curHour - 12) < Math.abs(bestHour - 12) ? cur : best;
      }, null);

      const temp = midday?.main?.temp ?? entries[0]?.main?.temp ?? 0;
      const tempMin = entries.reduce((min, e) => {
        const v = e?.main?.temp_min;
        if (typeof v !== 'number') return min;
        if (min == null) return v;
        return v < min ? v : min;
      }, null);
      const tempMax = entries.reduce((max, e) => {
        const v = e?.main?.temp_max;
        if (typeof v !== 'number') return max;
        if (max == null) return v;
        return v > max ? v : max;
      }, null);
      const iconCode = midday?.weather?.[0]?.icon ?? entries[0]?.weather?.[0]?.icon ?? '01d';
      const popAvg = entries.reduce((acc, e) => acc + (typeof e?.pop === 'number' ? e.pop : 0), 0) / Math.max(entries.length, 1);

      const code = iconCode.slice(0, 2);
      let icon = <Sun size={32} className="text-yellow-400" />;
      if (code === '09' || code === '10') icon = <CloudRain size={32} className="text-blue-400" />;
      else if (code === '11') icon = <CloudRain size={32} className="text-purple-400" />;
      else if (code === '02' || code === '03' || code === '04') icon = <Cloud size={32} className="text-gray-400" />;
      else if (code === '50') icon = <Wind size={32} className="text-gray-300" />;

      const date = new Date(dateKey + 'T00:00:00');

      return {
        dateKey,
        label: formatDayLabel(date),
        temp,
        tempMin: typeof tempMin === 'number' ? tempMin : undefined,
        tempMax: typeof tempMax === 'number' ? tempMax : undefined,
        rainChance: Number.isFinite(popAvg) ? popAvg : 0,
        icon
      };
    });
  }, [formatDayLabel]);

  const mapForecastToHourly = useCallback((forecastJson) => {
    const list = Array.isArray(forecastJson?.list) ? forecastJson.list : [];
    if (list.length === 0) return [];

    const next = list.slice(0, 8);
    return next.map((item) => {
      const dt = typeof item?.dt === 'number' ? new Date(item.dt * 1000) : new Date();
      const temp = item?.main?.temp ?? 0;
      const iconCode = item?.weather?.[0]?.icon ?? '01d';
      const code = iconCode.slice(0, 2);

      let icon = <Sun size={28} className="text-yellow-400" />;
      if (code === '09' || code === '10') icon = <CloudRain size={28} className="text-blue-400" />;
      else if (code === '11') icon = <CloudRain size={28} className="text-purple-400" />;
      else if (code === '02' || code === '03' || code === '04') icon = <Cloud size={28} className="text-gray-400" />;
      else if (code === '50') icon = <Wind size={28} className="text-gray-300" />;

      return {
        key: `${item.dt}-${iconCode}`,
        label: formatTimeLabel(dt),
        temp,
        icon
      };
    });
  }, [formatTimeLabel]);

  const analyzeForecast = useCallback((forecastJson) => {
    const list = Array.isArray(forecastJson?.list) ? forecastJson.list : [];
    if (list.length === 0) return null;

    let rain = false;
    let sun = false;
    let coldWind = false;

    const rainTimes = [];
    const sunTimes = [];
    const coldWindTimes = [];

    const nowTs = Date.now();
    const fmt = (date) => {
      try {
        return new Intl.DateTimeFormat(undefined, {
          weekday: 'short',
          hour: 'numeric',
          minute: '2-digit'
        }).format(date);
      } catch {
        return date.toLocaleString();
      }
    };

    for (const item of list) {
      const condition = (item?.weather?.[0]?.main || '').toLowerCase();
      const wind = item?.wind?.speed;
      const temp = item?.main?.temp;
      const dt = typeof item?.dt === 'number' ? new Date(item.dt * 1000) : null;
      if (dt && dt.getTime() < nowTs) continue;

      const isRain = condition.includes('rain') || condition.includes('drizzle') || condition.includes('thunder');
      const isSun = condition.includes('clear');
      const isColdWind = typeof wind === 'number' && typeof temp === 'number' && wind > 8 && temp < 20;

      if (isRain) {
        rain = true;
        if (dt && rainTimes.length < 5) rainTimes.push(fmt(dt));
      }

      if (isSun) {
        sun = true;
        if (dt && sunTimes.length < 5) sunTimes.push(fmt(dt));
      }

      if (isColdWind) {
        coldWind = true;
        if (dt && coldWindTimes.length < 5) coldWindTimes.push(fmt(dt));
      }

      if (rainTimes.length >= 5 && sunTimes.length >= 5 && coldWindTimes.length >= 5) break;
    }

    return { rain, sun, coldWind, rainTimes, sunTimes, coldWindTimes };
  }, []);

  const fetchJson = useCallback(async (url) => {
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 401) throw new Error('Unauthorized: invalid OpenWeather API key.');
      if (res.status === 404) throw new Error('City not found');
      throw new Error(`Weather request failed (${res.status})`);
    }
    return res.json();
  }, []);

  const buildWeatherUrl = useCallback(({ city, lat, lon }) => {
    const lang = getLangParam();
    if (typeof lat === 'number' && typeof lon === 'number') {
      return `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=${lang}`;
    }
    return `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=${lang}`;
  }, [API_KEY, getLangParam]);

  const buildForecastUrl = useCallback(({ city, lat, lon }) => {
    const lang = getLangParam();
    if (typeof lat === 'number' && typeof lon === 'number') {
      return `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=${lang}`;
    }
    return `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=${lang}`;
  }, [API_KEY, getLangParam]);

  const setWeatherFromApi = useCallback((data) => {
    if (!data?.weather?.[0] || !data?.main) throw new Error('Invalid weather response');

    let fieldWork = 'Suitable';
    let specificAdvice = '';
    const conditionMain = (data.weather[0].main || '').toLowerCase();
    const temp = data.main.temp;

    if (conditionMain.includes('rain')) {
      fieldWork = 'Avoid Field Work';
      specificAdvice = 'Wait for dry weather for spraying.';
    } else if (temp > 35) {
      fieldWork = 'Avoid Afternoon Work';
      specificAdvice = 'High heat detected. Ensure proper irrigation.';
    } else {
      specificAdvice = 'Ideal conditions for field operations.';
    }

    setBackgroundClass(getBackgroundClassFromCondition(data.weather[0].main));

    setWeatherData({
      city: data.name,
      temp,
      mainCondition: data.weather[0].main,
      feelsLike: typeof data.main.feels_like === 'number' ? data.main.feels_like : undefined,
      tempMin: typeof data.main.temp_min === 'number' ? data.main.temp_min : undefined,
      tempMax: typeof data.main.temp_max === 'number' ? data.main.temp_max : undefined,
      pressure: typeof data.main.pressure === 'number' ? data.main.pressure : undefined,
      condition: data.weather[0].description || data.weather[0].main,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      windDeg: typeof data.wind?.deg === 'number' ? data.wind.deg : undefined,
      sunrise: typeof data.sys?.sunrise === 'number' ? data.sys.sunrise : undefined,
      sunset: typeof data.sys?.sunset === 'number' ? data.sys.sunset : undefined,
      fieldWork,
      specificAdvice
    });
  }, [getBackgroundClassFromCondition]);

  const runWeatherFlow = useCallback(async (query, { showSearching = true } = {}) => {
    setError(null);

    if (!API_KEY) {
      setError('Missing weather API key. Set REACT_APP_WEATHER_API_KEY in your .env and restart the dev server.');
      setWeatherData(null);
      setForecast([]);
      setHourlyForecast([]);
      setForecastAnalysis(null);
      return;
    }

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setError('No internet connection. Please check your network and try again.');
      setWeatherData(null);
      setForecast([]);
      setHourlyForecast([]);
      setForecastAnalysis(null);
      return;
    }

    const key = query?.type === 'coords'
      ? `coords:${query.lat?.toFixed?.(3)}:${query.lon?.toFixed?.(3)}:${getLangParam()}`
      : `city:${(query.city || '').toLowerCase()}:${getLangParam()}`;

    if (lastRequestKeyRef.current === key) return;
    lastRequestKeyRef.current = key;

    inFlightRef.current = key;
    lastQueryRef.current = query;

    if (showSearching) setIsSearching(true);
    setIsForecastLoading(true);
    setForecast([]);
    setHourlyForecast([]);
    setForecastAnalysis(null);

    try {
      const weatherUrl = buildWeatherUrl(query.type === 'coords' ? { lat: query.lat, lon: query.lon } : { city: query.city });
      const forecastUrl = buildForecastUrl(query.type === 'coords' ? { lat: query.lat, lon: query.lon } : { city: query.city });

      const [weatherJson, forecastJson] = await Promise.all([
        fetchJson(weatherUrl),
        fetchJson(forecastUrl)
      ]);

      if (inFlightRef.current !== key) return;

      setWeatherFromApi(weatherJson);
      setForecast(mapForecastToDaily(forecastJson));
      setHourlyForecast(mapForecastToHourly(forecastJson));
      setForecastAnalysis(analyzeForecast(forecastJson));
    } catch (err) {
      if (inFlightRef.current !== key) return;
      setError(err?.message || t.unableToFetch);
      setWeatherData(null);
      setForecast([]);
      setHourlyForecast([]);
      setForecastAnalysis(null);
      setBackgroundClass('weather-bg-default');
    } finally {
      if (inFlightRef.current === key) {
        inFlightRef.current = null;
      }
      if (showSearching) setIsSearching(false);
      setIsForecastLoading(false);
    }
  }, [API_KEY, analyzeForecast, buildForecastUrl, buildWeatherUrl, fetchJson, getLangParam, mapForecastToDaily, mapForecastToHourly, setWeatherFromApi, t.unableToFetch]);

  const handleSearch = useCallback(async (city) => {
    await runWeatherFlow({ type: 'city', city }, { showSearching: true });
  }, [runWeatherFlow]);

  const fetchByCoords = useCallback(async (lat, lon, { showSearching = false } = {}) => {
    await runWeatherFlow({ type: 'coords', lat, lon }, { showSearching });
  }, [runWeatherFlow]);

  useEffect(() => {
    setBackgroundClass('weather-bg-default');
  }, []);

  useEffect(() => {
    if (!API_KEY) return;
    if (!navigator?.geolocation) return;
    if (lastQueryRef.current) return;

    setIsLocating(true);
    setError(null);

    const geoOptions = { enableHighAccuracy: false, timeout: 9000, maximumAge: 5 * 60 * 1000 };

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          await fetchByCoords(latitude, longitude, { showSearching: false });
        } finally {
          setIsLocating(false);
        }
      },
      (geoErr) => {
        setIsLocating(false);
        if (geoErr?.code === 1) {
          setError(null);
          return;
        }
        if (geoErr?.code === 3) {
          setError('Location request timed out. You can search by city instead.');
          return;
        }
        setError('Unable to access location. You can search by city instead.');
      },
      geoOptions
    );
  }, [API_KEY, fetchByCoords]);

  useEffect(() => {
    if (!lastQueryRef.current) return;
    if (!API_KEY) return;

    runWeatherFlow(lastQueryRef.current, { showSearching: false });
  }, [API_KEY, currentLanguage, runWeatherFlow]);

  const conditionMainLower = (weatherData?.mainCondition || '').toLowerCase();
  const agriFxClass = conditionMainLower.includes('rain') || conditionMainLower.includes('drizzle')
    ? 'agri-fx--rain'
    : conditionMainLower.includes('thunder')
      ? 'agri-fx--thunder'
      : conditionMainLower.includes('cloud')
        ? 'agri-fx--cloud'
        : conditionMainLower.includes('clear')
          ? 'agri-fx--clear'
          : 'agri-fx--default';

  return (
    <div className={`weather-page ${backgroundClass} ${agriFxClass}`}>
      <div className="agri-bg" aria-hidden="true">
        <div className="agri-bg__layer agri-bg__layer--a" />
        <div className="agri-bg__layer agri-bg__layer--b" />
        <div className="agri-cloud agri-cloud--1" />
        <div className="agri-cloud agri-cloud--2" />
        <div className="agri-rain" />
      </div>
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
          {isLocating && !weatherData && !error && (
            <motion.div
              key="locating"
              className="loading-spinner-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="loading-spinner"></div>
              <p>{t?.detectingLocation || 'Detecting your location...'}</p>
            </motion.div>
          )}

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
            <motion.div
              key="result"
              className="weather-result-wrapper"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <WeatherHero
                data={weatherData}
                t={t}
                precipPct={typeof forecast?.[0]?.rainChance === 'number' ? forecast[0].rainChance * 100 : null}
                airQualityLabel={null}
              />

              <WeatherTabs active={activeTab} onChange={setActiveTab} t={t} />

              {activeTab === 'overview' && (
                <>
                  <div className="gw-card gw-overview">
                    <div className="gw-overview__row">
                      <div className="gw-overview__label">{t?.farmerTip || 'Farmer tip'}</div>
                      <div className="gw-overview__value">{weatherData.temp > 30 ? t.tipHeat : weatherData.condition.toLowerCase().includes('rain') ? t.tipRain : t.tipIdeal}</div>
                    </div>
                    <div className="gw-overview__row">
                      <div className="gw-overview__label">{t?.fieldWork || 'Field work'}</div>
                      <div className="gw-overview__value">{weatherData.fieldWork}</div>
                    </div>
                    <div className="gw-overview__note">{weatherData.specificAdvice}</div>
                  </div>
                  <PlanningAlerts analysis={forecastAnalysis} t={t} />
                </>
              )}

              {activeTab === 'precipitation' && (
                <div className="gw-card gw-panel">
                  <div className="gw-section-title">{t?.precipitation || 'Precipitation'}</div>
                  <div className="gw-panel__metric">
                    <div className="gw-panel__label">{t?.precipitationChance || 'Chance'}</div>
                    <div className="gw-panel__value">{typeof forecast?.[0]?.rainChance === 'number' ? `${Math.round(forecast[0].rainChance * 100)}%` : '--'}</div>
                  </div>
                </div>
              )}

              {activeTab === 'wind' && (
                <div className="gw-card gw-panel">
                  <div className="gw-section-title">{t.wind}</div>
                  <div className="gw-panel__metric">
                    <div className="gw-panel__label">{t?.speed || 'Speed'}</div>
                    <div className="gw-panel__value">{weatherData.windSpeed} km/h</div>
                  </div>
                  <div className="gw-panel__metric">
                    <div className="gw-panel__label">{t?.direction || 'Direction'}</div>
                    <div className="gw-panel__value">{typeof weatherData.windDeg === 'number' ? `${weatherData.windDeg}°` : '--'}</div>
                  </div>
                </div>
              )}

              {activeTab === 'humidity' && (
                <div className="gw-card gw-panel">
                  <div className="gw-section-title">{t.humidity}</div>
                  <div className="gw-panel__metric">
                    <div className="gw-panel__label">{t.humidity}</div>
                    <div className="gw-panel__value">{weatherData.humidity}%</div>
                  </div>
                </div>
              )}

              <HourlyForecastSection isLoading={isForecastLoading} items={hourlyForecast} t={t} />
              <WeeklyForecastList isLoading={isForecastLoading} items={forecast} t={t} />
              <DetailsGrid data={weatherData} t={t} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Weather;
