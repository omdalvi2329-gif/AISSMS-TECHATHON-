import React, { useMemo } from 'react';

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

const soilAdvice = (ph) => {
  if (ph < 5.8) {
    return {
      tone: 'border-amber-400/30 bg-amber-500/10 text-amber-200',
      crops: 'Potato, Pineapple (acid tolerant)',
      fertilizer: 'Add lime / dolomite; avoid overuse of ammonium fertilizers.'
    };
  }
  if (ph > 7.8) {
    return {
      tone: 'border-amber-400/30 bg-amber-500/10 text-amber-200',
      crops: 'Barley, Cotton (alkaline tolerant)',
      fertilizer: 'Add gypsum; incorporate organic compost to improve micronutrients.'
    };
  }
  return {
    tone: 'border-green-400/25 bg-green-500/10 text-green-200',
    crops: 'Wheat, Rice, Maize, Pulses',
    fertilizer: 'Balanced NPK + organic compost; maintain regular soil testing.'
  };
};

export default function SoilHealthCard({ ph, onChangePh, noCard }) {
  const safePh = typeof ph === 'number' ? clamp(ph, 4.5, 9.0) : 6.8;
  const adv = useMemo(() => soilAdvice(safePh), [safePh]);

  const inner = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-sm font-semibold">pH</span>
        <span className="text-green-400 font-bold">{safePh.toFixed(1)}</span>
      </div>
      <input
        type="range"
        min={4.5}
        max={9.0}
        step={0.1}
        value={safePh}
        onChange={(e) => onChangePh?.(Number(e.target.value))}
        className="w-full accent-green-500"
      />

      <div className={`rounded-2xl border px-3 py-2 ${adv.tone}`}>
        <div className="text-xs font-extrabold">Suitable crops</div>
        <div className="mt-1 text-xs font-bold text-white/80">{adv.crops}</div>
        <div className="mt-2 text-xs font-extrabold">Fertilizer advice</div>
        <div className="mt-1 text-xs font-bold text-white/80">{adv.fertilizer}</div>
      </div>
    </>
  );

  if (noCard) return inner;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-lg shadow-lg p-4">
      <div className="text-white font-black tracking-wide">Soil Health</div>
      <div className="mt-4 space-y-3">{inner}</div>
    </div>
  );
}
