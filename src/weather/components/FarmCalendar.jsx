import React, { useMemo } from 'react';

const pick = (daily, predicate) => {
  const list = Array.isArray(daily) ? daily.slice(0, 7) : [];
  for (const d of list) {
    if (predicate(d)) return d;
  }
  return null;
};

export default function FarmCalendar({ daily, noCard }) {
  const plan = useMemo(() => {
    const sow = pick(daily, (d) => {
      const pop = typeof d?.pop === 'number' ? d.pop * 100 : null;
      const maxT = typeof d?.tempMax === 'number' ? d.tempMax : null;
      return pop != null && pop >= 30 && pop <= 60 && maxT != null && maxT >= 20 && maxT <= 32;
    });

    const fert = pick(daily, (d) => {
      const pop = typeof d?.pop === 'number' ? d.pop * 100 : null;
      const wind = typeof d?.windSpeed === 'number' ? d.windSpeed : null;
      return pop != null && pop < 25 && (wind == null || wind < 7);
    });

    const irrig = pick(daily, (d) => {
      const pop = typeof d?.pop === 'number' ? d.pop * 100 : null;
      const maxT = typeof d?.tempMax === 'number' ? d.tempMax : null;
      return (pop == null || pop < 35) && maxT != null && maxT >= 30;
    });

    return {
      sow,
      fert,
      irrig
    };
  }, [daily]);

  const Row = ({ label, item, hint }) => (
    <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-3">
      <div className="text-xs font-extrabold text-white/60">{label}</div>
      <div className="mt-1 text-sm font-black text-white">{item?.dayLabel || '--'}</div>
      <div className="mt-1 text-xs font-bold text-white/60">{hint}</div>
    </div>
  );

  const inner = (
    <>
      <Row label="Best sowing day" item={plan.sow} hint="Moderate rain + mild temperature." />
      <Row label="Fertilizer day" item={plan.fert} hint="Low rain + lower wind reduces nutrient loss." />
      <Row label="Irrigation schedule" item={plan.irrig} hint="Hot day with low rain probability." />
    </>
  );

  if (noCard) return <div className="grid gap-3">{inner}</div>;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-lg shadow-lg p-4">
      <div className="text-white font-black tracking-wide">Farm Activity Calendar</div>
      <div className="mt-1 text-xs font-bold text-white/60">Suggested windows from the next 7‑day forecast.</div>
      <div className="mt-4 grid gap-3">{inner}</div>
    </div>
  );
}
