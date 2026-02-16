import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

const fmtDay = (s) => (typeof s === 'string' && s.length ? s : '--');

const TooltipBox = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur px-3 py-2 text-white shadow-lg">
      <div className="text-xs font-extrabold tracking-wide text-green-400">{label}</div>
      <div className="mt-1 space-y-0.5">
        {payload.map((p) => (
          <div key={p.dataKey} className="text-xs font-bold" style={{ color: p.color }}>
            {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function ForecastCharts({ daily, noCard }) {
  const [mode, setMode] = useState('temp');

  const data = useMemo(() => {
    const list = Array.isArray(daily) ? daily : [];
    return list.slice(0, 7).map((d) => ({
      day: fmtDay(d.dayLabel),
      tempMax: typeof d.tempMax === 'number' ? d.tempMax : null,
      tempMin: typeof d.tempMin === 'number' ? d.tempMin : null,
      rain: typeof d.pop === 'number' ? d.pop * 100 : null,
      humidity: typeof d.humidity === 'number' ? d.humidity : null,
      wind: typeof d.windSpeed === 'number' ? d.windSpeed : null
    }));
  }, [daily]);

  const inner = (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="text-white font-black tracking-wide">Charts</div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode('temp')}
            className={`px-3 py-1.5 rounded-full text-xs font-extrabold border transition ${mode === 'temp' ? 'bg-green-500/20 border-green-400 text-green-300' : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'}`}
          >
            Temp
          </button>
          <button
            type="button"
            onClick={() => setMode('rain')}
            className={`px-3 py-1.5 rounded-full text-xs font-extrabold border transition ${mode === 'rain' ? 'bg-green-500/20 border-green-400 text-green-300' : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'}`}
          >
            Rain
          </button>
          <button
            type="button"
            onClick={() => setMode('humidity')}
            className={`px-3 py-1.5 rounded-full text-xs font-extrabold border transition ${mode === 'humidity' ? 'bg-green-500/20 border-green-400 text-green-300' : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'}`}
          >
            Humidity
          </button>
          <button
            type="button"
            onClick={() => setMode('wind')}
            className={`px-3 py-1.5 rounded-full text-xs font-extrabold border transition ${mode === 'wind' ? 'bg-green-500/20 border-green-400 text-green-300' : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'}`}
          >
            Wind
          </button>
        </div>
      </div>

      <div className="mt-4 w-full min-w-0" style={{ height: 288, minHeight: 288 }}>
        <ResponsiveContainer width="100%" height={288}>
          {mode === 'temp' ? (
            <LineChart data={data} margin={{ left: 6, right: 10, top: 10, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: 800 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 800 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TooltipBox />} />
              <Line type="monotone" dataKey="tempMax" name="Max (°C)" stroke="#22c55e" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="tempMin" name="Min (°C)" stroke="#86efac" strokeWidth={2} dot={false} />
            </LineChart>
          ) : null}

          {mode === 'rain' ? (
            <BarChart data={data} margin={{ left: 6, right: 10, top: 10, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: 800 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 800 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TooltipBox />} />
              <Bar dataKey="rain" name="Rain Prob (%)" fill="#22c55e" radius={[10, 10, 0, 0]} />
            </BarChart>
          ) : null}

          {mode === 'humidity' ? (
            <AreaChart data={data} margin={{ left: 6, right: 10, top: 10, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: 800 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 800 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TooltipBox />} />
              <Area type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#22c55e" fill="rgba(34,197,94,0.22)" strokeWidth={2.5} dot={false} />
            </AreaChart>
          ) : null}

          {mode === 'wind' ? (
            <LineChart data={data} margin={{ left: 6, right: 10, top: 10, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: 800 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 800 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TooltipBox />} />
              <Line type="monotone" dataKey="wind" name="Wind (m/s)" stroke="#22c55e" strokeWidth={3} dot={false} />
            </LineChart>
          ) : null}
        </ResponsiveContainer>
      </div>

      <div className="mt-3 text-xs font-bold text-white/60">
        Hover points/bars for tooltips. Charts use live forecast values.
      </div>
    </>
  );

  if (noCard) return inner;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-lg shadow-lg p-4">
      {inner}
    </div>
  );
}
