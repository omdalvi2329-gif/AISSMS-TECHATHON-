import React, { useMemo } from 'react';

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

export default function IrrigationPlanner({ current, daily, soilMoisture, noCard }) {
  const nextRain = useMemo(() => {
    const list = Array.isArray(daily) ? daily.slice(0, 2) : [];
    const pops = list.map((d) => (typeof d?.pop === 'number' ? d.pop * 100 : null)).filter((v) => typeof v === 'number');
    if (!pops.length) return null;
    return pops.reduce((a, b) => a + b, 0) / pops.length;
  }, [daily]);

  const plan = useMemo(() => {
    const t = typeof current?.temp === 'number' ? current.temp : null;
    const rain = typeof nextRain === 'number' ? nextRain : 0;
    const sm = typeof soilMoisture === 'number' ? soilMoisture : 50;

    const heatFactor = t == null ? 6 : clamp(4 + (t - 20) * 0.28, 3, 14);
    const moisturePenalty = sm < 35 ? 3 : sm < 55 ? 1.5 : 0;
    const rainOffset = clamp(rain / 20, 0, 4);

    const waterMm = clamp(heatFactor + moisturePenalty - rainOffset, 0, 16);
    const required = waterMm >= 6 && rain < 55;

    return {
      required,
      waterMm: Number.isFinite(waterMm) ? waterMm : 0,
      rain
    };
  }, [current, nextRain, soilMoisture]);

  const inner = (
    <>
      <div className={`rounded-2xl border p-3 ${plan.required ? 'border-amber-400/30 bg-amber-500/10' : 'border-green-400/25 bg-green-500/10'}`}>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm font-semibold">Irrigation Required Today</span>
          <span className={`font-bold ${plan.required ? 'text-amber-200' : 'text-green-300'}`}>{plan.required ? 'YES' : 'NO'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-3">
          <div className="text-xs font-extrabold text-white/60">Estimated Water Need</div>
          <div className="mt-1 text-lg font-black text-green-300">{plan.waterMm.toFixed(1)} mm</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-3">
          <div className="text-xs font-extrabold text-white/60">Next Rain (avg)</div>
          <div className="mt-1 text-lg font-black text-white">{typeof plan.rain === 'number' ? `${Math.round(plan.rain)}%` : '--'}</div>
        </div>
      </div>

      <div className="text-xs font-bold text-white/60">
        Tip: If irrigation is required, prefer early morning to reduce evaporation.
      </div>
    </>
  );

  if (noCard) return inner;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-lg shadow-lg p-4">
      <div className="text-white font-black tracking-wide">Irrigation Planner</div>
      <div className="mt-4 space-y-3">
        {inner}
      </div>
    </div>
  );
}
