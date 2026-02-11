import { useMemo } from 'react';
import { useFarmerProfileContext } from './FarmerProfileContext';

const isValidIndianMobile = (value) => /^\d{10}$/.test(String(value || '').trim());

const monthKey = (d) => {
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

export const useFarmerProfile = () => {
  const { state, dispatch } = useFarmerProfileContext();

  const actions = useMemo(
    () => ({
      patchPersonalInfo: (patch) => dispatch({ type: 'PATCH_PERSONAL', payload: patch }),
      patchLocation: (patch) => dispatch({ type: 'PATCH_LOCATION', payload: patch }),
      patchFarmDetails: (patch) => dispatch({ type: 'PATCH_FARM_DETAILS', payload: patch }),
      upsertCrop: (crop) => dispatch({ type: 'UPSERT_CROP', payload: crop }),
      removeCrop: (cropId) => dispatch({ type: 'REMOVE_CROP', payload: cropId }),
      addExpense: (expense) => dispatch({ type: 'ADD_EXPENSE', payload: expense }),
      updateExpense: (expense) => dispatch({ type: 'UPDATE_EXPENSE', payload: expense }),
      removeExpense: (expenseId) => dispatch({ type: 'REMOVE_EXPENSE', payload: expenseId })
    }),
    [dispatch]
  );

  const derived = useMemo(() => {
    const crops = Array.isArray(state.crops) ? state.crops : [];
    const expenses = Array.isArray(state.expenses) ? state.expenses : [];

    const cropHealth = crops.reduce(
      (acc, c) => {
        const s = String(c.healthStatus || '').toLowerCase();
        if (s.includes('poor') || s.includes('bad') || s.includes('low')) acc.poor += 1;
        else if (s.includes('avg') || s.includes('average') || s.includes('medium')) acc.average += 1;
        else if (s) acc.good += 1;
        return acc;
      },
      { good: 0, average: 0, poor: 0 }
    );

    const expensesByCategory = expenses.reduce((acc, e) => {
      const cat = String(e.category || 'Other');
      const amt = Number(e.amount || 0);
      if (!acc[cat]) acc[cat] = 0;
      acc[cat] += Number.isFinite(amt) ? amt : 0;
      return acc;
    }, {});

    const totalExpense = Object.values(expensesByCategory).reduce((sum, v) => sum + (Number(v) || 0), 0);

    const analyticsBars = Object.entries(expensesByCategory)
      .map(([label, amount]) => ({ label, amount: Number(amount) || 0 }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6)
      .map((x) => ({
        label: x.label,
        value: totalExpense > 0 ? Math.round((x.amount / totalExpense) * 100) : 0
      }));

    const expenseByMonth = expenses.reduce((acc, e) => {
      const k = monthKey(e.date || e.createdAt || new Date());
      if (!k) return acc;
      const amt = Number(e.amount || 0);
      acc[k] = (acc[k] || 0) + (Number.isFinite(amt) ? amt : 0);
      return acc;
    }, {});

    const months = Object.keys(expenseByMonth).sort();
    const thisMonthKey = monthKey(new Date());
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    const lastMonthKey = monthKey(lastMonthDate);

    const thisMonthTotal = expenseByMonth[thisMonthKey] || 0;
    const lastMonthTotal = expenseByMonth[lastMonthKey] || 0;

    const timeline = [];

    crops.forEach((c) => {
      if (c.sowingMonth) timeline.push({ type: 'crop', label: `Sowing - ${c.name}`, date: c.sowingMonth });
      if (c.harvestMonth) timeline.push({ type: 'crop', label: `Harvest - ${c.name}`, date: c.harvestMonth });
    });

    expenses.forEach((e) => {
      const cat = e.category || 'Expense';
      const date = e.date || e.createdAt;
      timeline.push({ type: 'expense', label: `${cat} - ₹${Number(e.amount || 0)}`, date: date || '' });
    });

    const advisories = [];
    if (thisMonthTotal > lastMonthTotal && lastMonthTotal > 0) {
      advisories.push('Expenses increased compared to last month. Review category-wise spending.');
    }
    if (cropHealth.poor > 0) {
      advisories.push('Some crops show low health. Consider pest/disease checks and irrigation scheduling.');
    }
    if (!crops.length) {
      advisories.push('Add crop details to unlock crop insights and timeline events.');
    }

    return {
      crops,
      cropHealth,
      expenses,
      expensesByCategory,
      totalExpense,
      analyticsBars,
      thisMonthTotal,
      lastMonthTotal,
      timeline: timeline.filter((x) => x.date).sort((a, b) => String(a.date).localeCompare(String(b.date))),
      advisories
    };
  }, [state]);

  const validators = useMemo(
    () => ({
      validateMobile: (value) => {
        const v = String(value || '').trim();
        if (!v) return { ok: false, message: 'Mobile number is required.' };
        if (!isValidIndianMobile(v)) return { ok: false, message: 'Enter a valid 10-digit mobile number.' };
        return { ok: true, message: '' };
      }
    }),
    []
  );

  return { profile: state, actions, derived, validators };
};
