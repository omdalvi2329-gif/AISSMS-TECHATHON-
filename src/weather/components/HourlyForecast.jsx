import React from 'react';

export default function HourlyForecast({ hourly }) {
  return (
    <div className="agri-card agri-fade-in" style={{ padding: 16 }}>
      <div className="agri-section-title">Hourly Forecast</div>
      <div className="agri-hourly">
        {(hourly || []).map((h) => (
          <div key={h.key} className="agri-hour">
            <div className="agri-hour__time">{h.timeLabel}</div>
            {h.iconUrl ? <img src={h.iconUrl} alt="" width={52} height={52} /> : null}
            <div className="agri-hour__temp">{typeof h.temp === 'number' ? `${Math.round(h.temp)}°` : '--'}</div>
            <div className="agri-muted" style={{ fontSize: 12, marginTop: 6 }}>
              {typeof h.pop === 'number' ? `Rain ${Math.round(h.pop * 100)}%` : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
