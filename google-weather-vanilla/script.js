const API_KEY = 'YOUR_OPENWEATHER_API_KEY';

const el = {
  form: document.getElementById('searchForm'),
  input: document.getElementById('cityInput'),
  status: document.getElementById('status'),
  currentCard: document.getElementById('currentCard'),
  forecastCard: document.getElementById('forecastCard'),
  cityName: document.getElementById('cityName'),
  temp: document.getElementById('temp'),
  icon: document.getElementById('icon'),
  condition: document.getElementById('condition'),
  meta: document.getElementById('meta'),
  feelsLike: document.getElementById('feelsLike'),
  humidity: document.getElementById('humidity'),
  wind: document.getElementById('wind'),
  forecastScroll: document.getElementById('forecastScroll')
};

function setStatus(type, message) {
  if (!message) {
    el.status.innerHTML = '';
    return;
  }

  if (type === 'loading') {
    el.status.innerHTML = `
      <div class="status__pill">
        <span class="spinner" aria-hidden="true"></span>
        <span>${message}</span>
      </div>
    `;
    return;
  }

  el.status.innerHTML = `
    <div class="status__pill">${message}</div>
  `;
}

function kphFromMps(mps) {
  const value = typeof mps === 'number' ? mps * 3.6 : NaN;
  return Number.isFinite(value) ? Math.round(value) : null;
}

function weatherIconUrl(iconCode) {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

function formatDayName(date) {
  try {
    return new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(date);
  } catch {
    return date.toDateString().slice(0, 3);
  }
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) throw new Error('City not found. Try another name.');
    if (res.status === 401) throw new Error('Invalid API key. Check your OpenWeatherMap key.');
    throw new Error(`Request failed (${res.status})`);
  }
  return res.json();
}

async function fetchWeatherByCity(city) {
  const encoded = encodeURIComponent(city);
  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encoded}&appid=${API_KEY}&units=metric`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encoded}&appid=${API_KEY}&units=metric`;

  const [current, forecast] = await Promise.all([
    fetchJson(currentUrl),
    fetchJson(forecastUrl)
  ]);

  return { current, forecast };
}

function buildDailyFromForecast(forecastJson) {
  const list = Array.isArray(forecastJson?.list) ? forecastJson.list : [];
  const byDate = new Map();

  for (const item of list) {
    const ts = typeof item?.dt === 'number' ? item.dt * 1000 : null;
    if (!ts) continue;
    const d = new Date(ts);
    const dateKey = d.toISOString().slice(0, 10);
    if (!byDate.has(dateKey)) byDate.set(dateKey, []);
    byDate.get(dateKey).push(item);
  }

  const keys = Array.from(byDate.keys()).sort();
  const todayKey = new Date().toISOString().slice(0, 10);
  const upcoming = keys.filter((k) => k >= todayKey).slice(0, 5);

  return upcoming.map((key) => {
    const entries = byDate.get(key) || [];

    let min = null;
    let max = null;
    let best = null;

    for (const e of entries) {
      const tMin = e?.main?.temp_min;
      const tMax = e?.main?.temp_max;

      if (typeof tMin === 'number') min = min == null ? tMin : Math.min(min, tMin);
      if (typeof tMax === 'number') max = max == null ? tMax : Math.max(max, tMax);

      const hour = typeof e?.dt === 'number' ? new Date(e.dt * 1000).getHours() : null;
      if (hour == null) continue;
      if (!best) best = e;
      else {
        const bestHour = new Date(best.dt * 1000).getHours();
        if (Math.abs(hour - 12) < Math.abs(bestHour - 12)) best = e;
      }
    }

    const icon = best?.weather?.[0]?.icon || entries[0]?.weather?.[0]?.icon || '01d';
    const date = new Date(key + 'T00:00:00');

    return {
      dayName: formatDayName(date),
      icon,
      min,
      max
    };
  });
}

function renderCurrent(current) {
  const name = current?.name || '--';
  const temp = current?.main?.temp;
  const feels = current?.main?.feels_like;
  const humidity = current?.main?.humidity;
  const windKph = kphFromMps(current?.wind?.speed);
  const condition = current?.weather?.[0]?.description || current?.weather?.[0]?.main || '--';
  const icon = current?.weather?.[0]?.icon || '01d';

  el.cityName.textContent = name;
  el.temp.textContent = Number.isFinite(temp) ? `${Math.round(temp)}°` : '--°';
  el.condition.textContent = condition;
  el.feelsLike.textContent = Number.isFinite(feels) ? `${Math.round(feels)}°C` : '--';
  el.humidity.textContent = typeof humidity === 'number' ? `${humidity}%` : '--';
  el.wind.textContent = windKph == null ? '--' : `${windKph} km/h`;

  el.icon.src = weatherIconUrl(icon);
  el.icon.alt = condition;

  const now = new Date();
  const dateStr = now.toLocaleString(undefined, { weekday: 'long', hour: 'numeric', minute: '2-digit' });
  el.meta.textContent = dateStr;
}

function renderForecast(daily) {
  el.forecastScroll.innerHTML = '';

  for (const day of daily) {
    const card = document.createElement('div');
    card.className = 'dayCard';

    const maxText = typeof day.max === 'number' ? `${Math.round(day.max)}°` : '--';
    const minText = typeof day.min === 'number' ? `${Math.round(day.min)}°` : '--';

    card.innerHTML = `
      <div class="dayCard__name">${day.dayName}</div>
      <div class="dayCard__icon">
        <img src="${weatherIconUrl(day.icon)}" alt="" />
      </div>
      <div class="dayCard__temps">
        <span class="dayCard__max">${maxText}</span>
        <span class="dayCard__min">${minText}</span>
      </div>
    `;

    el.forecastScroll.appendChild(card);
  }
}

function showCards(show) {
  el.currentCard.hidden = !show;
  el.forecastCard.hidden = !show;
}

async function run(city) {
  const safeCity = (city || '').trim();
  if (!safeCity) return;

  if (API_KEY === 'YOUR_OPENWEATHER_API_KEY') {
    setStatus('error', 'Add your OpenWeatherMap API key in script.js (API_KEY).');
    showCards(false);
    return;
  }

  try {
    setStatus('loading', 'Fetching weather...');
    showCards(false);

    const { current, forecast } = await fetchWeatherByCity(safeCity);
    const daily = buildDailyFromForecast(forecast);

    renderCurrent(current);
    renderForecast(daily);

    setStatus(null, null);
    showCards(true);
  } catch (err) {
    setStatus('error', err?.message || 'Something went wrong.');
    showCards(false);
  }
}

el.form.addEventListener('submit', (e) => {
  e.preventDefault();
  run(el.input.value);
});

run('Pune');
