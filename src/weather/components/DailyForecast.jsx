import React from 'react';

export default function DailyForecast({ daily }) {
  return (
    <div className="agri-card agri-fade-in" style={{ padding: 16 }}>
      <div className="agri-section-title">7 Day Forecast</div>
      <div className="agri-forecast-row">
        {(daily || []).map((d) => (
          <div key={d.key} className="agri-forecast-card">
            <div>
              <div className="agri-forecast-day">{d.dayLabel}</div>
              <div className="agri-muted" style={{ fontSize: 12, marginTop: 4 }}>
                {typeof d.pop === 'number' ? `Rain ${Math.round(d.pop * 100)}%` : ''}
              </div>
            </div>
            {d.iconUrl ? <img src={d.iconUrl} alt="" width={48} height={48} /> : null}
            <div className="agri-forecast-temps">
              <span>{typeof d.tempMax === 'number' ? `${Math.round(d.tempMax)}°` : '--'}</span>
              <span className="agri-forecast-min">{typeof d.tempMin === 'number' ? `${Math.round(d.tempMin)}°` : '--'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
