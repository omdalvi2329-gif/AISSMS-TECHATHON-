export const getFarmingAdvisory = ({ rainProbability, temp, humidity }) => {
  const rain = typeof rainProbability === 'number' ? rainProbability : null;
  const t = typeof temp === 'number' ? temp : null;
  const h = typeof humidity === 'number' ? humidity : null;

  if (rain != null && rain > 60) {
    return { level: 'warning', message: 'High chance of rain. Avoid irrigation today.' };
  }

  if (t != null && t > 35) {
    return { level: 'danger', message: 'Heat stress alert. Provide crop protection.' };
  }

  if (h != null && h > 80) {
    return { level: 'warning', message: 'High humidity. Pest risk increased.' };
  }

  return { level: 'success', message: 'Good day for farming activities.' };
};
