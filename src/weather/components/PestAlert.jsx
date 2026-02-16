import React, { useMemo } from 'react';

const meter = (v) => {
  if (v >= 70) return { label: 'High', bar: 'bg-red-500', tone: 'text-red-200' };
  if (v >= 40) return { label: 'Medium', bar: 'bg-amber-500', tone: 'text-amber-200' };
  return { label: 'Low', bar: 'bg-green-500', tone: 'text-green-200' };
};

export default function PestAlert({ current, daily, noCard }) {
  const score = useMemo(() => {
    const h = typeof current?.humidity === 'number' ? current.humidity : null;
    const t = typeof current?.temp === 'number' ? current.temp : null;
    const rain = Array.isArray(daily) && daily[0] && typeof daily[0].pop === 'number' ? daily[0].pop * 100 : 0;

    let s = 20;
    if (h != null) s += Math.max(0, h - 55) * 0.9;
    if (t != null && t >= 22 && t <= 32) s += 12;
    if (rain >= 50) s += 18;
    return Math.max(0, Math.min(100, s));
  }, [current, daily]);

  const m = meter(score);

  const inner = (
    <>
      <div className="flex items-center justify-between">
        <div className="flex justify-between w-full">
          <span className="text-gray-400 text-sm font-semibold">Risk Level</span>
          <span className={`font-bold ${m.tone}`}>{m.label}</span>
        </div>
      </div>
      <div className="text-xs font-bold text-white/60">{Math.round(score)}/100</div>
      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full ${m.bar}`} style={{ width: `${Math.round(score)}%` }} />
      </div>
      <div className="text-xs font-bold text-white/65">
        Action: Monitor leaf spots and apply preventive spray if risk is Medium/High.
      </div>
    </>
  );

  if (noCard) return inner;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-lg shadow-lg p-4">
      <div className="text-white font-black tracking-wide">Pest Risk Alert</div>
      <div className="mt-4 space-y-3">{inner}</div>
    </div>
  );
}
