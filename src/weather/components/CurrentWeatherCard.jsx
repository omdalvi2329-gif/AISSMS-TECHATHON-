import React from 'react';
import { Droplets, Wind, Umbrella, Sunrise, Sunset, Gauge } from 'lucide-react';

export default function CurrentWeatherCard({ current, uvIndex }) {
  if (!current) return null;

  const fmtTemp = (n) => (typeof n === 'number' ? `${Math.round(n)}°C` : '--');
  const fmtPct = (n) => (typeof n === 'number' ? `${Math.round(n)}%` : '--');
  const fmtWind = (n) => (typeof n === 'number' ? `${Math.round(n)} m/s` : '--');

  return (
    <div className="agri-card agri-fade-in" style={{ padding: 18 }}>
      <div className="agri-current">
        <div className="agri-current__top">
          <div>
            <div className="agri-current__city">{current.city}</div>
            <div className="agri-muted" style={{ marginTop: 4 }}>{current.description}</div>
          </div>
          <div className="agri-current__icon">
            {current.iconUrl ? (
              <img src={current.iconUrl} alt={current.description} width={86} height={86} />
            ) : null}
          </div>
        </div>

        <div className="agri-current__temp">{fmtTemp(current.temp)}</div>

        <div className="agri-kpi">
          <div className="agri-kpi__item">
            <div className="agri-kpi__label">Humidity</div>
            <div className="agri-kpi__value"><Droplets size={16} style={{ marginRight: 6 }} />{fmtPct(current.humidity)}</div>
          </div>
          <div className="agri-kpi__item">
            <div className="agri-kpi__label">Wind</div>
            <div className="agri-kpi__value"><Wind size={16} style={{ marginRight: 6 }} />{fmtWind(current.windSpeed)}</div>
          </div>
          <div className="agri-kpi__item">
            <div className="agri-kpi__label">Rain Prob</div>
            <div className="agri-kpi__value"><Umbrella size={16} style={{ marginRight: 6 }} />{fmtPct(current.rainProbability)}</div>
          </div>
        </div>

        <div className="agri-kpi" style={{ marginTop: 10 }}>
          <div className="agri-kpi__item">
            <div className="agri-kpi__label">UV Index</div>
            <div className="agri-kpi__value"><Gauge size={16} style={{ marginRight: 6 }} />{typeof uvIndex === 'number' ? uvIndex.toFixed(1) : '--'}</div>
          </div>
          <div className="agri-kpi__item">
            <div className="agri-kpi__label">Sunrise</div>
            <div className="agri-kpi__value"><Sunrise size={16} style={{ marginRight: 6 }} />{current.sunriseLabel || '--'}</div>
          </div>
          <div className="agri-kpi__item">
            <div className="agri-kpi__label">Sunset</div>
            <div className="agri-kpi__value"><Sunset size={16} style={{ marginRight: 6 }} />{current.sunsetLabel || '--'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
