import React, { useMemo } from 'react';

const monthToSeason = (monthIndex) => {
  if (monthIndex >= 2 && monthIndex <= 4) return 'Summer';
  if (monthIndex >= 5 && monthIndex <= 8) return 'Monsoon';
  if (monthIndex >= 9 && monthIndex <= 10) return 'Post-Monsoon';
  return 'Winter';
};

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

const riskLabel = (n) => {
  if (n >= 70) return { label: 'High', tone: 'text-red-300 border-red-500/30 bg-red-500/10' };
  if (n >= 40) return { label: 'Medium', tone: 'text-amber-300 border-amber-500/30 bg-amber-500/10' };
  return { label: 'Low', tone: 'text-green-300 border-green-400/30 bg-green-500/10' };
};

const computeRecommendations = ({ temp, humidity, rainAvg, soilMoisture, season }) => {
  const list = [];

  const heat = typeof temp === 'number' ? temp : null;
  const hum = typeof humidity === 'number' ? humidity : null;
  const rain = typeof rainAvg === 'number' ? rainAvg : null;
  const sm = typeof soilMoisture === 'number' ? soilMoisture : 50;

  if (heat != null && heat >= 35 && (rain == null || rain < 35)) {
    list.push({
      crop: 'Bajra / Millets',
      why: 'Heat tolerant and performs better with low rainfall conditions.',
      risk: clamp(55 + (rain == null ? 0 : (35 - rain)), 35, 85),
      yield: 'Stable yield under high heat with efficient irrigation.'
    });
  }

  if (heat != null && heat >= 20 && heat <= 30 && (rain == null || (rain >= 30 && rain <= 65)) && (hum == null || (hum >= 45 && hum <= 75))) {
    list.push({
      crop: 'Wheat / Gram',
      why: 'Balanced temperature, moderate rainfall and humidity support good establishment.',
      risk: clamp(35 + Math.abs((heat ?? 25) - 25) * 2, 15, 70),
      yield: 'High yield potential with timely sowing and fertilizer schedule.'
    });
  }

  if ((hum != null && hum >= 78) && (rain != null && rain >= 55)) {
    list.push({
      crop: 'Rice',
      why: 'High humidity with consistent rain supports rice water demand.',
      risk: clamp(45 + (sm < 40 ? 15 : 0), 20, 80),
      yield: 'Best with good drainage management and pest monitoring.'
    });
  }

  if (!list.length) {
    const defaultCrop = season === 'Monsoon' ? 'Soybean / Maize' : season === 'Winter' ? 'Mustard / Chickpea' : 'Sorghum / Pulses';
    list.push({
      crop: defaultCrop,
      why: 'Recommended based on season and current moisture balance.',
      risk: clamp(45 + (sm < 35 ? 10 : 0) + (rain != null && rain > 70 ? 10 : 0), 20, 80),
      yield: 'Maintain soil nutrition and monitor weekly weather changes.'
    });
  }

  return list.slice(0, 3);
};

export default function CropAdvisor({ current, daily, soilMoisture, noCard }) {
  const now = new Date();
  const season = monthToSeason(now.getMonth());

  const rainAvg = useMemo(() => {
    const list = Array.isArray(daily) ? daily.slice(0, 7) : [];
    const pops = list.map((d) => (typeof d?.pop === 'number' ? d.pop * 100 : null)).filter((v) => typeof v === 'number');
    if (!pops.length) return null;
    return pops.reduce((a, b) => a + b, 0) / pops.length;
  }, [daily]);

  const recommendations = useMemo(() => {
    return computeRecommendations({
      temp: current?.temp,
      humidity: current?.humidity,
      rainAvg,
      soilMoisture,
      season
    });
  }, [current, rainAvg, soilMoisture, season]);

  const inner = (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-bold text-white/60">Season: <span className="text-green-400">{season}</span></div>
        <div className="text-xs font-extrabold text-white/60">Soil Moisture: <span className="text-green-400">{Math.round(soilMoisture)}%</span></div>
      </div>

      <div className="mt-3 grid gap-3">
        {recommendations.map((r) => {
          const risk = riskLabel(r.risk);
          return (
            <div key={r.crop} className="rounded-2xl border border-white/10 bg-slate-950/30 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="text-white font-extrabold">{r.crop}</div>
                <div className={`px-2.5 py-1 rounded-full border text-xs font-extrabold ${risk.tone}`}>Risk: {risk.label}</div>
              </div>
              <div className="mt-2 text-sm font-bold text-white/75">{r.why}</div>
              <div className="mt-2 text-xs font-bold text-white/60">Expected conditions: <span className="text-green-300">{r.yield}</span></div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 rounded-2xl border border-green-400/15 bg-green-500/10 px-3 py-2 text-xs font-bold text-green-200">
        Recommendation uses live weather + 7‑day rain trend + your soil moisture.
      </div>
    </>
  );

  if (noCard) return inner;

  return (
    <div className="rounded-2xl border border-green-400/20 bg-white/10 backdrop-blur-lg shadow-lg p-4">
      <div className="text-white font-black tracking-wide">Smart Crop Decision</div>
      {inner}
    </div>
  );
}
