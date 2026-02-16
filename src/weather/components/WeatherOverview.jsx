import React, { useMemo } from 'react';
import { Droplets, Wind, Umbrella, Sunrise, Sunset, Thermometer, Eye, Gauge, Navigation } from 'lucide-react';

const degToDir = (deg) => {
  if (typeof deg !== 'number') return '--';
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const idx = Math.round(deg / 45) % 8;
  return dirs[idx];
};

export default function WeatherOverview({ current, uvIndex, noCard }) {
  const fmtTemp = (n) => (typeof n === 'number' ? `${Math.round(n)}°C` : '--');
  const fmtPct = (n) => (typeof n === 'number' ? `${Math.round(n)}%` : '--');
  const fmtWind = (n) => (typeof n === 'number' ? `${Math.round(n)} m/s` : '--');

  const windDir = useMemo(() => degToDir(current?.windDeg), [current]);

  if (!current) return null;

  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-white text-lg font-black tracking-wide">{current.city}</div>
          <div className="mt-1 text-xs font-bold text-white/60">{current.description}</div>
          <div className="mt-3 text-4xl font-black text-white">{fmtTemp(current.temp)}</div>
          <div className="mt-1 text-xs font-bold text-green-400">Feels like: {fmtTemp(current.feelsLike)}</div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {current.iconUrl ? (
            <img src={current.iconUrl} alt={current.description} width={86} height={86} className="drop-shadow" />
          ) : null}
          <div className="text-xs font-extrabold text-white/60">Dew point: <span className="text-white">{fmtTemp(current.dewPoint)}</span></div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-3">
          <div className="text-xs font-extrabold text-white/60">Humidity</div>
          <div className="mt-1 text-sm font-black text-white flex items-center gap-2"><Droplets size={16} className="text-green-400" />{fmtPct(current.humidity)}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-3">
          <div className="text-xs font-extrabold text-white/60">Wind</div>
          <div className="mt-1 text-sm font-black text-white flex items-center gap-2"><Wind size={16} className="text-green-400" />{fmtWind(current.windSpeed)}</div>
          <div className="mt-1 text-xs font-bold text-white/60 flex items-center gap-2"><Navigation size={14} className="text-white/50" />{windDir}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-3">
          <div className="text-xs font-extrabold text-white/60">Rain Probability</div>
          <div className="mt-1 text-sm font-black text-white flex items-center gap-2"><Umbrella size={16} className="text-green-400" />{fmtPct(current.rainProbability)}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-3">
          <div className="text-xs font-extrabold text-white/60">UV Index</div>
          <div className="mt-1 text-sm font-black text-white flex items-center gap-2"><Gauge size={16} className="text-green-400" />{typeof uvIndex === 'number' ? uvIndex.toFixed(1) : '--'}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-3">
          <div className="text-xs font-extrabold text-white/60">Visibility</div>
          <div className="mt-1 text-sm font-black text-white flex items-center gap-2"><Eye size={16} className="text-green-400" />{typeof current.visibilityKm === 'number' ? `${current.visibilityKm.toFixed(1)} km` : '--'}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-3">
          <div className="text-xs font-extrabold text-white/60">Pressure</div>
          <div className="mt-1 text-sm font-black text-white flex items-center gap-2"><Thermometer size={16} className="text-green-400" />{typeof current.pressure === 'number' ? `${Math.round(current.pressure)} hPa` : '--'}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-3">
          <div className="text-xs font-extrabold text-white/60">Sunrise</div>
          <div className="mt-1 text-sm font-black text-white flex items-center gap-2"><Sunrise size={16} className="text-green-400" />{current.sunriseLabel || '--'}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-3">
          <div className="text-xs font-extrabold text-white/60">Sunset</div>
          <div className="mt-1 text-sm font-black text-white flex items-center gap-2"><Sunset size={16} className="text-green-400" />{current.sunsetLabel || '--'}</div>
        </div>
      </div>
    </>
  );

  if (noCard) return content;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-lg shadow-lg p-4">
      {content}
    </div>
  );
}
