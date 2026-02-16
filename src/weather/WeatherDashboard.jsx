import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from 'framer-motion';
import './WeatherDashboard.css';
import { useWeather } from './useWeather';
import { getFarmingAdvisory } from './advisory';
import AnimatedBackground from './components/AnimatedBackground';
import WeatherHeader from './components/WeatherHeader';
import SearchBar from './components/SearchBar';
import WeatherOverview from './components/WeatherOverview';
import ForecastCharts from './components/ForecastCharts';
import CropAdvisor from './components/CropAdvisor';
import IrrigationPlanner from './components/IrrigationPlanner';
import PestAlert from './components/PestAlert';
import SoilHealthCard from './components/SoilHealthCard';
import FarmCalendar from './components/FarmCalendar';
import SmartScores from './components/SmartScores';

const formatClockTime = (tsSeconds) => {
  if (typeof tsSeconds !== 'number') return '--';
  const date = new Date(tsSeconds * 1000);
  try {
    return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date);
  } catch {
    return date.toLocaleTimeString();
  }
};

const formatDateTimeLabel = (date) => {
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
};

const uvMeta = (uvi) => {
  if (typeof uvi !== 'number') return { label: 'UV —', color: 'text-white/80', bar: 'bg-white/10' };
  if (uvi < 3) return { label: 'Low risk', color: 'text-emerald-300', bar: 'bg-emerald-400/60' };
  if (uvi < 6) return { label: 'Moderate', color: 'text-lime-300', bar: 'bg-lime-400/60' };
  if (uvi < 8) return { label: 'High', color: 'text-amber-300', bar: 'bg-amber-400/60' };
  if (uvi < 11) return { label: 'Very high', color: 'text-orange-300', bar: 'bg-orange-400/60' };
  return { label: 'Extreme', color: 'text-red-300', bar: 'bg-red-400/60' };
};

const cx = (...parts) => parts.filter(Boolean).join(' ');

const SkeletonBlock = ({ className }) => (
  <div className={cx('agri-skeleton', className)} />
);

const InsightTile = ({ icon, label, value, helper, accent = 'agri-accent' }) => (
  <div className={cx('agri-tile agri-card', accent)}>
    <div className="agri-tile__icon">{icon}</div>
    <div className="agri-tile__label">{label}</div>
    <div className="agri-tile__value">{value}</div>
    {helper ? <div className="agri-tile__helper">{helper}</div> : null}
  </div>
);

const WeatherVisualBox = ({ current, fx }) => {
  const condition = String(current?.main || current?.description || '').toLowerCase();
  const mode = fx || (condition.includes('rain') || condition.includes('drizzle') ? 'rain' : condition.includes('cloud') ? 'cloud' : condition.includes('mist') || condition.includes('haze') || condition.includes('fog') ? 'haze' : condition.includes('clear') ? 'clear' : 'default');

  const windKmh = typeof current?.windSpeed === 'number' ? current.windSpeed * 3.6 : null;

  const Icon = () => {
    if (mode === 'clear') {
      return (
        <svg viewBox="0 0 120 120" className="agri-visual__svg" aria-hidden="true">
          <defs>
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="rgba(0,255,136,0.95)" />
              <stop offset="65%" stopColor="rgba(0,255,136,0.25)" />
              <stop offset="100%" stopColor="rgba(0,255,136,0)" />
            </radialGradient>
          </defs>
          <circle cx="60" cy="60" r="26" fill="url(#sunGlow)" className="agri-visual__sun" />
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (Math.PI * 2 * i) / 8;
            const x1 = 60 + Math.cos(a) * 38;
            const y1 = 60 + Math.sin(a) * 38;
            const x2 = 60 + Math.cos(a) * 50;
            const y2 = 60 + Math.sin(a) * 50;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(0,255,136,0.75)"
                strokeWidth="4"
                strokeLinecap="round"
                className="agri-visual__ray"
              />
            );
          })}
        </svg>
      );
    }

    if (mode === 'rain' || mode === 'storm') {
      return (
        <svg viewBox="0 0 120 120" className="agri-visual__svg" aria-hidden="true">
          <g className="agri-visual__cloud">
            <path
              d="M40 68c-10 0-18-7-18-16 0-8 6-15 14-16 3-11 13-19 26-19 14 0 25 9 28 22 10 1 18 9 18 19 0 11-10 20-22 20H40z"
              fill="rgba(255,255,255,0.16)"
              stroke="rgba(0,255,136,0.22)"
              strokeWidth="2"
            />
          </g>
          <g className="agri-visual__rain">
            {Array.from({ length: 7 }).map((_, i) => (
              <line
                key={i}
                x1={38 + i * 8}
                y1={76}
                x2={32 + i * 8}
                y2={96}
                stroke="rgba(0,255,136,0.75)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            ))}
          </g>
        </svg>
      );
    }

    if (mode === 'haze') {
      return (
        <svg viewBox="0 0 120 120" className="agri-visual__svg" aria-hidden="true">
          <g className="agri-visual__mist">
            <path d="M26 52h68" stroke="rgba(255,255,255,0.20)" strokeWidth="8" strokeLinecap="round" />
            <path d="M18 68h84" stroke="rgba(0,255,136,0.22)" strokeWidth="8" strokeLinecap="round" />
            <path d="M30 84h60" stroke="rgba(255,255,255,0.16)" strokeWidth="8" strokeLinecap="round" />
          </g>
        </svg>
      );
    }

    if (mode === 'cloud') {
      return (
        <svg viewBox="0 0 120 120" className="agri-visual__svg" aria-hidden="true">
          <g className="agri-visual__cloud agri-visual__cloud--float">
            <path
              d="M38 72c-12 0-22-8-22-18 0-9 7-16 16-18 4-12 15-20 29-20 15 0 28 10 31 24 11 1 20 10 20 21 0 12-10 21-24 21H38z"
              fill="rgba(255,255,255,0.15)"
              stroke="rgba(0,255,136,0.22)"
              strokeWidth="2"
            />
          </g>
        </svg>
      );
    }

    return (
      <svg viewBox="0 0 120 120" className="agri-visual__svg" aria-hidden="true">
        <circle cx="60" cy="60" r="28" fill="rgba(0,255,136,0.12)" stroke="rgba(0,255,136,0.28)" strokeWidth="3" />
        <path d="M44 62h32" stroke="rgba(255,255,255,0.55)" strokeWidth="6" strokeLinecap="round" />
        <path d="M52 48h16" stroke="rgba(255,255,255,0.35)" strokeWidth="6" strokeLinecap="round" />
        <path d="M52 76h16" stroke="rgba(255,255,255,0.35)" strokeWidth="6" strokeLinecap="round" />
      </svg>
    );
  };

  return (
    <div className={cx('agri-visual', `agri-visual--${mode}`)}>
      <div className="agri-visual__label">Now</div>
      <div className="agri-visual__icon">
        <Icon />
      </div>
      <div className="agri-visual__cond">{current?.description || current?.main || 'Live weather'}</div>
      <div className="agri-visual__wind">{typeof windKmh === 'number' ? `Wind ${Math.round(windKmh)} km/h` : 'Wind --'}</div>
    </div>
  );
};

const DashboardCard = ({ title, children }) => (
  <div className="agri-card agri-dashcard">
    <h2 className="agri-dashcard__title">{title}</h2>
    <div className="space-y-3">{children}</div>
  </div>
);

export default function WeatherDashboard({ onBack, t, currentLanguage }) {
  const apiKey = process.env.REACT_APP_WEATHER_API_KEY;

  const userRef = useRef(null);

  const didAutoLocateRef = useRef(false);

  const [now, setNow] = useState(() => new Date());
  const [soilMoisture, setSoilMoisture] = useState(52);
  const [soilPh, setSoilPh] = useState(6.8);

  const {
    status,
    error,
    current,
    daily,
    uvIndex,
    fx,
    searchCity,
    detectLocation
  } = useWeather({ apiKey, currentLanguage });

  const advisory = useMemo(() => {
    if (!current) return null;
    return getFarmingAdvisory({
      rainProbability: current.rainProbability,
      temp: current.temp,
      humidity: current.humidity
    });
  }, [current]);

  const currentWithTimes = useMemo(() => {
    if (!current) return null;
    return {
      ...current,
      sunriseLabel: formatClockTime(current.sunrise),
      sunsetLabel: formatClockTime(current.sunset)
    };
  }, [current]);

  const soilAdvisory = useMemo(() => {
    if (!current) return { label: '--', helper: 'Search a location to generate advice.' };

    const humidity = typeof current.humidity === 'number' ? current.humidity : null;
    const rain = typeof current.rainProbability === 'number' ? current.rainProbability : null;

    if (humidity == null || rain == null) {
      return { label: 'Soil advisory', helper: 'Waiting for full sensor estimate.' };
    }

    if (rain >= 60) return { label: 'Hold irrigation', helper: 'High rain probability — avoid overwatering.' };
    if (humidity >= 70) return { label: 'Moisture stable', helper: 'Good retention — monitor fungal risk.' };
    if (humidity <= 35) return { label: 'Soil drying', helper: 'Low humidity — schedule irrigation early.' };
    return { label: 'Balanced', helper: 'Conditions are stable for normal field work.' };
  }, [current]);

  useEffect(() => {
    if (didAutoLocateRef.current) return;
    if (status !== 'idle') return;
    if (current) return;
    didAutoLocateRef.current = true;
    detectLocation();
  }, [current, detectLocation, status]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000 * 30);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="agri-weather" ref={userRef}>
      <AnimatedBackground fx={fx} />

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <WeatherHeader onBack={onBack} title={t?.weatherTitle || 'Smart Farmer Dashboard'} subtitle={current?.city || 'Search your farm location'} />

          <SearchBar onSearch={searchCity} onDetectLocation={detectLocation} isLoading={status === 'loading'} />

          {status === 'idle' && (
            <div className="agri-card agri-fade-in" style={{ padding: 18, marginTop: 16 }}>
              <div style={{ fontWeight: 950, letterSpacing: 0.2 }}>{t?.howsWeather || 'How’s the weather at your farm?'}</div>
              <div className="agri-muted" style={{ marginTop: 8 }}>{t?.weatherSearchSubtitle || 'Search a city or use your current location to get live weather and farming tips.'}</div>
            </div>
          )}

          {status === 'idle' && error && (
            <div className="agri-card agri-fade-in agri-error" style={{ padding: 18, marginTop: 16 }}>
              <div className="agri-error__title">Location not available</div>
              <div className="agri-error__msg">{error}</div>
            </div>
          )}

          {status === 'error' && (
            <div className="agri-card agri-fade-in agri-error" style={{ padding: 18, marginTop: 16 }}>
              <div className="agri-error__title">Unable to load weather</div>
              <div className="agri-error__msg">{error}</div>
              {!apiKey && (
                <div className="agri-muted" style={{ marginTop: 10 }}>
                  Add your key in <code>.env</code>: <code>REACT_APP_WEATHER_API_KEY=YOUR_KEY</code> then restart.
                </div>
              )}
            </div>
          )}

          {status === 'loading' && (
            <div className="space-y-6">
              <div className="agri-card agri-hero">
                <div className="agri-hero__wave" aria-hidden="true" />
                <div className="agri-hero__inner">
                  <div className="agri-hero__top">
                    <div>
                      <SkeletonBlock className="h-5 w-56" />
                      <div className="mt-2"><SkeletonBlock className="h-4 w-44" /></div>
                    </div>
                    <SkeletonBlock className="h-20 w-20 rounded-2xl" />
                  </div>
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <SkeletonBlock className="h-20 w-60" />
                    <SkeletonBlock className="h-16 w-52" />
                    <SkeletonBlock className="h-10 w-44" />
                  </div>
                </div>
              </div>

              <div className="agri-insight-grid">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className="agri-card agri-tile">
                    <SkeletonBlock className="h-5 w-16" />
                    <div className="mt-3"><SkeletonBlock className="h-10 w-28" /></div>
                    <div className="mt-3"><SkeletonBlock className="h-4 w-32" /></div>
                  </div>
                ))}
              </div>

              <div className="agri-card" style={{ padding: 18 }}>
                <div className="agri-section-title">7 Day Forecast</div>
                <div className="agri-forecast-strip">
                  {Array.from({ length: 7 }).map((_, idx) => (
                    <div key={idx} className="agri-forecast-mini">
                      <SkeletonBlock className="h-4 w-16" />
                      <div className="mt-4"><SkeletonBlock className="h-10 w-10 rounded-xl" /></div>
                      <div className="mt-4"><SkeletonBlock className="h-4 w-24" /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {current && status === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              <div className="agri-card agri-hero">
                <div className="agri-hero__wave" aria-hidden="true" />
                <div className="agri-hero__inner">
                  <div className="agri-hero__top">
                    <div className="agri-hero__city">
                      <div className="agri-hero__cityline">
                        <span className="agri-hero__pin" aria-hidden="true">⟟</span>
                        <span>
                          {current.city}
                          {current.state ? `, ${current.state}` : ''}
                          {current.country ? `, ${current.country}` : ''}
                        </span>
                      </div>
                      <div className="agri-hero__datetime">{formatDateTimeLabel(now)}</div>
                    </div>

                    <WeatherVisualBox current={current} fx={fx} />
                  </div>

                  <div className="agri-hero__main">
                    <div className="agri-hero__temp">{typeof current.temp === 'number' ? `${Math.round(current.temp)}°` : '--'}</div>
                    <div className="agri-hero__meta">
                      <div className="agri-hero__condition">{current.description}</div>
                      <div className="agri-hero__feels">Feels like {typeof current.feelsLike === 'number' ? `${Math.round(current.feelsLike)}°C` : '--'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="agri-insight-grid">
                {(() => {
                  const uv = uvMeta(uvIndex);
                  const rainHelper = typeof current.rainProbability === 'number'
                    ? current.rainProbability >= 60 ? 'Rain likely — plan field work' : current.rainProbability >= 30 ? 'Scattered showers possible' : 'Low rain risk'
                    : '—';

                  const visibilityHelper = typeof current.visibilityKm === 'number'
                    ? current.visibilityKm < 2 ? 'Low visibility — use caution' : current.visibilityKm < 6 ? 'Hazy conditions' : 'Clear air'
                    : '—';

                  return (
                    <>
                      <InsightTile
                        icon={<span className="agri-ico">💧</span>}
                        label="Humidity"
                        value={typeof current.humidity === 'number' ? `${Math.round(current.humidity)}%` : '--'}
                        helper={typeof current.humidity === 'number' ? (current.humidity >= 75 ? 'High — fungal pressure risk' : current.humidity <= 35 ? 'Low — drying conditions' : 'Stable') : '—'}
                      />

                      <InsightTile
                        icon={<span className="agri-ico">🌬</span>}
                        label="Wind Speed"
                        value={typeof current.windSpeed === 'number' ? `${Math.round(current.windSpeed)} m/s` : '--'}
                        helper={typeof current.windSpeed === 'number' ? (current.windSpeed >= 8 ? 'Strong winds — avoid spraying' : 'Good for spraying') : '—'}
                      />

                      <InsightTile
                        icon={<span className="agri-ico">🌡</span>}
                        label="Feels Like"
                        value={typeof current.feelsLike === 'number' ? `${Math.round(current.feelsLike)}°C` : '--'}
                        helper={typeof current.feelsLike === 'number' ? (current.feelsLike >= 35 ? 'Heat stress risk' : current.feelsLike <= 10 ? 'Cold stress risk' : 'Comfortable') : '—'}
                      />

                      <div className="agri-card agri-tile">
                        <div className="agri-tile__icon"><span className="agri-ico">🌤</span></div>
                        <div className="agri-tile__label">UV Index</div>
                        <div className="agri-tile__value">{typeof uvIndex === 'number' ? uvIndex.toFixed(1) : '--'}</div>
                        <div className={cx('agri-tile__helper', uv.color)}>{uv.label}</div>
                        <div className="agri-uvbar" aria-hidden="true">
                          <div className={cx('agri-uvbar__fill', uv.bar)} style={{ width: `${typeof uvIndex === 'number' ? Math.min(100, Math.max(0, (uvIndex / 12) * 100)) : 0}%` }} />
                        </div>
                      </div>

                      <InsightTile
                        icon={<span className="agri-ico">🌧</span>}
                        label="Rain Probability"
                        value={typeof current.rainProbability === 'number' ? `${Math.round(current.rainProbability)}%` : '--'}
                        helper={rainHelper}
                      />

                      <InsightTile
                        icon={<span className="agri-ico">🌫</span>}
                        label="Visibility"
                        value={typeof current.visibilityKm === 'number' ? `${current.visibilityKm.toFixed(1)} km` : '--'}
                        helper={visibilityHelper}
                      />

                      <InsightTile
                        icon={<span className="agri-ico">💦</span>}
                        label="Dew Point"
                        value={typeof current.dewPoint === 'number' ? `${Math.round(current.dewPoint)}°C` : '--'}
                        helper={typeof current.dewPoint === 'number' ? (current.dewPoint >= 22 ? 'High moisture in air' : 'Lower moisture') : '—'}
                      />

                      <InsightTile
                        icon={<span className="agri-ico">🌱</span>}
                        label="Soil Advisory"
                        value={soilAdvisory.label}
                        helper={soilAdvisory.helper}
                        accent="agri-accent-gold"
                      />
                    </>
                  );
                })()}
              </div>

              <div className="agri-card" style={{ padding: 18 }}>
                <div className="agri-section-title">7 Day Forecast</div>
                <div className="agri-forecast-strip">
                  {(Array.isArray(daily) ? daily : []).slice(0, 7).map((d) => (
                    <div key={d.key || d.dayLabel} className="agri-forecast-mini">
                      <div className="agri-forecast-mini__day">{d.dayLabel}</div>
                      <div className="agri-forecast-mini__icon">
                        {d.iconUrl ? <img src={d.iconUrl} alt="" width={44} height={44} className="agri-miniicon" /> : null}
                      </div>
                      <div className="agri-forecast-mini__temps">
                        <span className="agri-forecast-mini__max">{typeof d.tempMax === 'number' ? `${Math.round(d.tempMax)}°` : '--'}</span>
                        <span className="agri-forecast-mini__min">{typeof d.tempMin === 'number' ? `${Math.round(d.tempMin)}°` : '--'}</span>
                      </div>
                      <div className="agri-forecast-mini__sub">
                        <span>🌧 {typeof d.pop === 'number' ? `${Math.round(d.pop * 100)}%` : '--'}</span>
                        <span className="agri-forecast-mini__wind">🌬 {typeof d.windSpeed === 'number' ? `${Math.round(d.windSpeed)} m/s` : '--'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {advisory ? (
                <div className="agri-card agri-advicebox" style={{ padding: 18 }}>
                  <div className="agri-advicebox__row">
                    <div className="agri-advicebox__pulse" aria-hidden="true" />
                    <div>
                      <div className="agri-advicebox__title">Farmer Advisory</div>
                      <div className="agri-advicebox__msg">{advisory.message}</div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-6">
                  <DashboardCard title="Current Weather">
                    <WeatherOverview current={currentWithTimes} uvIndex={uvIndex} noCard />
                  </DashboardCard>

                  <DashboardCard title="7-Day Forecast Intelligence">
                    <ForecastCharts daily={daily} noCard />
                  </DashboardCard>
                </div>

                <div className="space-y-6">
                  <DashboardCard title="Smart Crop Decision">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Soil Moisture</span>
                        <span className="text-green-400 font-bold">{Math.round(soilMoisture)}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={soilMoisture}
                        onChange={(e) => setSoilMoisture(Number(e.target.value))}
                        className="w-full accent-green-500"
                      />
                    </div>
                    <div className="border-b border-green-500/10" />
                    <CropAdvisor current={currentWithTimes} daily={daily} soilMoisture={soilMoisture} noCard />
                  </DashboardCard>

                  <DashboardCard title="Irrigation Planner">
                    <IrrigationPlanner current={currentWithTimes} daily={daily} soilMoisture={soilMoisture} noCard />
                  </DashboardCard>
                </div>

                <div className="space-y-6">
                  <DashboardCard title="Smart Scores">
                    <SmartScores current={currentWithTimes} daily={daily} soilMoisture={soilMoisture} ph={soilPh} noCard />
                  </DashboardCard>

                  <DashboardCard title="Pest Risk Alert">
                    <PestAlert current={currentWithTimes} daily={daily} noCard />
                  </DashboardCard>

                  <DashboardCard title="Soil Health">
                    <SoilHealthCard ph={soilPh} onChangePh={setSoilPh} noCard />
                  </DashboardCard>

                  <DashboardCard title="Farm Activity Calendar">
                    <FarmCalendar daily={daily} noCard />
                  </DashboardCard>

                  {advisory ? (
                    <DashboardCard title="Farming Advisory">
                      <div className="text-sm font-bold text-white/80">{advisory.message}</div>
                    </DashboardCard>
                  ) : null}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
