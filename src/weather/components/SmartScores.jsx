import React, { useMemo } from 'react';

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

const barTone = (score) => {
  if (score >= 75) return 'bg-green-500';
  if (score >= 45) return 'bg-amber-500';
  return 'bg-red-500';
};

const glow = (score) => {
  if (score >= 75) return 'border-green-400/30 shadow-[0_0_30px_rgba(34,197,94,0.18)]';
  if (score >= 45) return 'border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.14)]';
  return 'border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.12)]';
};

const computeScores = ({ current, daily, soilMoisture, ph }) => {
  const t = typeof current?.temp === 'number' ? current.temp : null;
  const h = typeof current?.humidity === 'number' ? current.humidity : null;
  const rain = Array.isArray(daily) && daily[0] && typeof daily[0].pop === 'number' ? daily[0].pop * 100 : 0;
  const wind = Array.isArray(daily) && daily[0] && typeof daily[0].windSpeed === 'number' ? daily[0].windSpeed : null;
  const sm = typeof soilMoisture === 'number' ? soilMoisture : 50;
  const p = typeof ph === 'number' ? ph : 6.8;

  let yieldScore = 70;
  if (t != null) yieldScore -= Math.max(0, t - 33) * 3;
  if (h != null) yieldScore -= Math.max(0, h - 85) * 1.2;
  yieldScore -= Math.max(0, (40 - sm) * 0.6);
  yieldScore -= Math.max(0, Math.abs(p - 6.8) * 10);
  yieldScore = clamp(yieldScore, 0, 100);

  let impact = 65;
  impact += rain >= 45 && rain <= 70 ? 10 : rain > 80 ? -10 : 0;
  impact += t != null && t >= 20 && t <= 32 ? 10 : t != null && t >= 38 ? -18 : 0;
  impact += wind != null && wind > 10 ? -8 : 0;
  impact = clamp(impact, 0, 100);

  let summary = 'Maintain regular monitoring.';
  if (t != null && t >= 35) summary = 'High heat today. Prioritize irrigation and shade protection.';
  else if (rain >= 60) summary = 'Rain likely. Avoid irrigation and plan spraying carefully.';
  else if (sm < 35) summary = 'Soil is dry. Increase irrigation and consider mulching.';

  return { yieldScore, impact, summary };
};

export default function SmartScores({ current, daily, soilMoisture, ph, noCard }) {
  const scores = useMemo(() => computeScores({ current, daily, soilMoisture, ph }), [current, daily, soilMoisture, ph]);

  const Row = ({ label, value }) => (
    <div className="flex justify-between items-center">
      <span className="text-gray-400 text-sm font-semibold">{label}</span>
      <span className="text-green-400 font-bold text-lg">{value}</span>
    </div>
  );

  const Meter = ({ value }) => (
    <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
      <div className={`h-full ${barTone(value)}`} style={{ width: `${Math.round(value)}%` }} />
    </div>
  );

  const inner = (
    <>
      <Row label="Yield Score" value={Math.round(scores.yieldScore)} />
      <Meter value={scores.yieldScore} />
      <div className="border-b border-green-500/10" />
      <Row label="Weather Impact Score" value={Math.round(scores.impact)} />
      <Meter value={scores.impact} />
      <div className="border-b border-green-500/10" />
      <div>
        <div className="text-gray-400 text-sm font-semibold">Daily Recommendation Summary</div>
        <div className="mt-1 text-white/80 text-sm font-bold">{scores.summary}</div>
      </div>
    </>
  );

  if (noCard) return inner;

  return (
    <div className={`rounded-2xl border bg-white/10 backdrop-blur-lg shadow-lg p-4 ${glow(scores.yieldScore)}`}>
      <div className="text-white font-black tracking-wide">Smart Scores</div>
      <div className="mt-1 text-xs font-bold text-white/60">Live farming condition scoring.</div>
      <div className="mt-4 space-y-3">
        {inner}
      </div>
    </div>
  );
}
