import React, { useMemo } from 'react';

const tone = (level) => {
  if (level === 'danger') return 'border-red-500/30 bg-red-500/10 text-red-200';
  if (level === 'warning') return 'border-amber-500/30 bg-amber-500/10 text-amber-200';
  return 'border-green-400/25 bg-green-500/10 text-green-200';
};

export default function AlertPanel({ current }) {
  const heat = useMemo(() => {
    const t = typeof current?.temp === 'number' ? current.temp : null;
    if (t == null) return null;
    if (t >= 38) return { level: 'danger', title: 'Heat Stress Alert', msg: 'Extreme heat. Use shade nets, irrigate early morning, and avoid mid‑day spraying.' };
    if (t >= 35) return { level: 'warning', title: 'Heat Stress Alert', msg: 'High heat risk. Increase irrigation frequency and add mulching to reduce soil evaporation.' };
    return { level: 'ok', title: 'Heat Stress', msg: 'No heat stress detected for today.' };
  }, [current]);

  const visibility = typeof current?.visibilityKm === 'number' ? `${current.visibilityKm.toFixed(1)} km` : '--';

  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-lg shadow-lg p-4">
      <div className="text-white font-black tracking-wide">Alerts & Intelligence</div>

      <div className={`mt-4 rounded-2xl border px-3 py-2 ${tone(heat?.level)}`}>
        <div className="text-sm font-black">{heat?.title || 'Heat Stress'}</div>
        <div className="mt-1 text-xs font-bold text-white/80">{heat?.msg || '--'}</div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-3">
          <div className="text-xs font-extrabold text-white/60">Visibility</div>
          <div className="mt-1 text-sm font-black text-white">{visibility}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-3">
          <div className="text-xs font-extrabold text-white/60">Pressure</div>
          <div className="mt-1 text-sm font-black text-white">{typeof current?.pressure === 'number' ? `${Math.round(current.pressure)} hPa` : '--'}</div>
        </div>
      </div>
    </div>
  );
}
