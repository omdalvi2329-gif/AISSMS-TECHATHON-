import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const clamp01 = (n) => Math.min(1, Math.max(0, n));

const getLangParam = (currentLanguage) => {
  if (!currentLanguage) return 'en';
  if (currentLanguage === 'hi') return 'hi';
  if (currentLanguage === 'mr') return 'mr';
  return 'en';
};

const weatherCodeToFx = (mainCondition = '') => {
  const c = String(mainCondition).toLowerCase();
  if (c.includes('thunder')) return 'storm';
  if (c.includes('rain') || c.includes('drizzle')) return 'rain';
  if (c.includes('cloud')) return 'cloud';
  if (c.includes('clear')) return 'clear';
  return 'default';
};

const formatClockTime = (tsSeconds) => {
  if (typeof tsSeconds !== 'number') return '--';
  const date = new Date(tsSeconds * 1000);
  try {
    return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date);
  } catch {
    return date.toLocaleTimeString();
  }
};

const formatHourLabel = (tsSeconds) => {
  if (typeof tsSeconds !== 'number') return '--';
  const date = new Date(tsSeconds * 1000);
  try {
    return new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).format(date);
  } catch {
    return date.toLocaleTimeString();
  }
};

const formatDayLabel = (tsSeconds) => {
  if (typeof tsSeconds !== 'number') return '--';
  const date = new Date(tsSeconds * 1000);
  try {
    return new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(date);
  } catch {
    return date.toDateString();
  }
};

const buildIconUrl = (icon) => {
  if (!icon) return '';
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
};

const buildOneCallUrl = ({ lat, lon, apiKey, lang }) => {
  return `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=${lang}&exclude=minutely,alerts`;
};

const buildReverseGeocodeUrl = ({ lat, lon, apiKey, limit = 1 }) => {
  return `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=${limit}&appid=${apiKey}`;
};

const estimateDewPointC = ({ tempC, humidityPct }) => {
  if (typeof tempC !== 'number' || typeof humidityPct !== 'number') return null;
  // Magnus approximation. Good enough for advisory logic.
  const a = 17.62;
  const b = 243.12;
  const rh = Math.min(100, Math.max(1, humidityPct));
  const gamma = (a * tempC) / (b + tempC) + Math.log(rh / 100);
  const dp = (b * gamma) / (a - gamma);
  if (!Number.isFinite(dp)) return null;
  return dp;
};

const safeJson = async (res) => {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

export const useWeather = ({ apiKey, currentLanguage }) => {
  const [state, setState] = useState({
    status: 'idle',
    error: null,
    query: null,
    current: null,
    hourly: [],
    daily: [],
    uvIndex: null,
    fx: 'default'
  });

  const inFlightRef = useRef(null);

  const lang = useMemo(() => getLangParam(currentLanguage), [currentLanguage]);
  const enableOneCall = useMemo(() => {
    return String(process.env.REACT_APP_OPENWEATHER_ONECALL || '').trim() === '1';
  }, []);

  const fetchJson = useCallback(async (url) => {
    const res = await fetch(url);
    if (!res.ok) {
      const body = await safeJson(res);
      const msg = body?.message || `Request failed (${res.status})`;
      throw new Error(msg);
    }
    return res.json();
  }, []);

  const getCoordsForCity = useCallback(async (city) => {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`;
    const list = await fetchJson(url);
    const hit = Array.isArray(list) ? list[0] : null;
    if (!hit || typeof hit.lat !== 'number' || typeof hit.lon !== 'number') {
      throw new Error('City not found');
    }
    return { lat: hit.lat, lon: hit.lon, name: hit.name || city, country: hit.country };
  }, [apiKey, fetchJson]);

  const getPlaceForCoords = useCallback(async ({ lat, lon }) => {
    const url = buildReverseGeocodeUrl({ lat, lon, apiKey, limit: 1 });
    const list = await fetchJson(url);
    const hit = Array.isArray(list) ? list[0] : null;
    if (!hit) return { name: undefined, state: undefined, country: undefined };
    return {
      name: hit.name,
      state: hit.state,
      country: hit.country
    };
  }, [apiKey, fetchJson]);

  const getWeatherByCoords = useCallback(async ({ lat, lon, name, state, country }) => {
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=${lang}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=${lang}`;

    const oneCallUrl = enableOneCall ? buildOneCallUrl({ lat, lon, apiKey, lang }) : null;

    const [currentJson, forecastJson, oneCallJson] = await Promise.all([
      fetchJson(currentUrl),
      fetchJson(forecastUrl),
      oneCallUrl ? fetchJson(oneCallUrl).catch(() => null) : Promise.resolve(null)
    ]);

    const weather0 = currentJson?.weather?.[0];
    const main = currentJson?.main;
    if (!weather0 || !main) throw new Error('Invalid weather response');

    const fx = weatherCodeToFx(weather0.main);

    const hourly = (Array.isArray(forecastJson?.list) ? forecastJson.list : [])
      .slice(0, 12)
      .map((item) => ({
        key: String(item?.dt ?? Math.random()),
        timeLabel: formatHourLabel(item?.dt),
        temp: typeof item?.main?.temp === 'number' ? item.main.temp : null,
        pop: typeof item?.pop === 'number' ? clamp01(item.pop) : null,
        icon: item?.weather?.[0]?.icon,
        iconUrl: buildIconUrl(item?.weather?.[0]?.icon)
      }));

    let daily = [];
    let uvIndex = null;

    const oneCallDaily = Array.isArray(oneCallJson?.daily) ? oneCallJson.daily : null;
    const oneCallHourly = Array.isArray(oneCallJson?.hourly) ? oneCallJson.hourly : null;

    if (oneCallDaily && oneCallDaily.length) {
      daily = oneCallDaily.slice(0, 7).map((d) => {
        const icon = d?.weather?.[0]?.icon;
        const pop = typeof d?.pop === 'number' ? clamp01(d.pop) : null;
        return {
          key: String(d.dt),
          dayLabel: formatDayLabel(d.dt),
          tempMin: typeof d?.temp?.min === 'number' ? d.temp.min : null,
          tempMax: typeof d?.temp?.max === 'number' ? d.temp.max : null,
          pop,
          humidity: typeof d?.humidity === 'number' ? d.humidity : null,
          windSpeed: typeof d?.wind_speed === 'number' ? d.wind_speed : null,
          icon,
          iconUrl: buildIconUrl(icon)
        };
      });

      if (typeof oneCallJson?.current?.uvi === 'number') {
        uvIndex = oneCallJson.current.uvi;
      }
    } else {
      const dailyByDate = new Map();
      for (const item of (Array.isArray(forecastJson?.list) ? forecastJson.list : [])) {
        if (typeof item?.dt !== 'number') continue;
        const dateKey = new Date(item.dt * 1000).toISOString().slice(0, 10);
        if (!dailyByDate.has(dateKey)) dailyByDate.set(dateKey, []);
        dailyByDate.get(dateKey).push(item);
      }

      const dailyKeys = Array.from(dailyByDate.keys()).sort().slice(0, 7);
      daily = dailyKeys.map((k) => {
        const entries = dailyByDate.get(k) || [];
        const temps = entries.map((e) => e?.main?.temp).filter((v) => typeof v === 'number');
        const tempMin = temps.length ? Math.min(...temps) : null;
        const tempMax = temps.length ? Math.max(...temps) : null;

        const midday = entries.reduce((best, cur) => {
          if (!best) return cur;
          const bh = new Date(best.dt * 1000).getHours();
          const ch = new Date(cur.dt * 1000).getHours();
          return Math.abs(ch - 12) < Math.abs(bh - 12) ? cur : best;
        }, null);

        const icon = midday?.weather?.[0]?.icon || entries[0]?.weather?.[0]?.icon;
        const popAvg = entries.reduce((acc, e) => acc + (typeof e?.pop === 'number' ? e.pop : 0), 0) / Math.max(entries.length, 1);

        const humidityAvg = entries.reduce((acc, e) => acc + (typeof e?.main?.humidity === 'number' ? e.main.humidity : 0), 0) / Math.max(entries.length, 1);
        const windAvg = entries.reduce((acc, e) => acc + (typeof e?.wind?.speed === 'number' ? e.wind.speed : 0), 0) / Math.max(entries.length, 1);

        const ts = entries[0]?.dt;
        return {
          key: k,
          dayLabel: typeof ts === 'number' ? formatDayLabel(ts) : k,
          tempMin,
          tempMax,
          pop: Number.isFinite(popAvg) ? clamp01(popAvg) : null,
          humidity: Number.isFinite(humidityAvg) ? humidityAvg : null,
          windSpeed: Number.isFinite(windAvg) ? windAvg : null,
          icon,
          iconUrl: buildIconUrl(icon)
        };
      });
    }

    if (oneCallHourly && oneCallHourly.length) {
      const ocHourly = oneCallHourly.slice(0, 12).map((h) => ({
        key: String(h.dt),
        timeLabel: formatHourLabel(h.dt),
        temp: typeof h?.temp === 'number' ? h.temp : null,
        pop: typeof h?.pop === 'number' ? clamp01(h.pop) : null,
        icon: h?.weather?.[0]?.icon,
        iconUrl: buildIconUrl(h?.weather?.[0]?.icon)
      }));

      for (let i = 0; i < Math.min(ocHourly.length, hourly.length); i += 1) {
        hourly[i] = ocHourly[i];
      }
    }

    const rainProbNow = hourly?.[0]?.pop;

    const feelsLike = typeof main.feels_like === 'number' ? main.feels_like : null;
    const pressure = typeof main.pressure === 'number' ? main.pressure : null;
    const visibilityKm = typeof currentJson?.visibility === 'number' ? currentJson.visibility / 1000 : null;
    const windDeg = typeof currentJson?.wind?.deg === 'number' ? currentJson.wind.deg : null;

    const dewPoint = typeof oneCallJson?.current?.dew_point === 'number'
      ? oneCallJson.current.dew_point
      : estimateDewPointC({ tempC: typeof main.temp === 'number' ? main.temp : null, humidityPct: typeof main.humidity === 'number' ? main.humidity : null });

    return {
      fx,
      current: {
        city: name || currentJson?.name,
        country: country || currentJson?.sys?.country,
        state,
        lat,
        lon,
        temp: typeof main.temp === 'number' ? main.temp : null,
        description: weather0.description || weather0.main,
        main: weather0.main,
        icon: weather0.icon,
        iconUrl: buildIconUrl(weather0.icon),
        humidity: typeof main.humidity === 'number' ? main.humidity : null,
        windSpeed: typeof currentJson?.wind?.speed === 'number' ? currentJson.wind.speed : null,
        windDeg,
        rainProbability: typeof rainProbNow === 'number' ? Math.round(rainProbNow * 100) : null,
        feelsLike,
        pressure,
        visibilityKm,
        dewPoint,
        sunrise: typeof currentJson?.sys?.sunrise === 'number' ? currentJson.sys.sunrise : null,
        sunset: typeof currentJson?.sys?.sunset === 'number' ? currentJson.sys.sunset : null
      },
      hourly,
      daily,
      uvIndex
    };
  }, [apiKey, enableOneCall, fetchJson, lang]);

  const run = useCallback(async (query) => {
    if (!apiKey) {
      setState((s) => ({ ...s, status: 'error', error: 'Missing weather API key. Set REACT_APP_WEATHER_API_KEY in .env and restart.', query }));
      return;
    }

    const requestKey = JSON.stringify({ query, lang });
    inFlightRef.current = requestKey;

    setState((s) => ({ ...s, status: 'loading', error: null, query }));

    try {
      let coords;
      if (query?.type === 'city') {
        coords = await getCoordsForCity(query.city);
      } else if (query?.type === 'coords') {
        coords = { lat: query.lat, lon: query.lon, name: query.name, state: query.state, country: query.country };
      } else {
        throw new Error('Invalid query');
      }

      const result = await getWeatherByCoords(coords);

      if (inFlightRef.current !== requestKey) return;

      setState({
        status: 'success',
        error: null,
        query,
        current: result.current,
        hourly: result.hourly,
        daily: result.daily,
        uvIndex: result.uvIndex,
        fx: result.fx
      });
    } catch (err) {
      if (inFlightRef.current !== requestKey) return;
      setState((s) => ({ ...s, status: 'error', error: err?.message || 'Unable to fetch weather', query }));
    }
  }, [apiKey, getCoordsForCity, getWeatherByCoords, lang]);

  const searchCity = useCallback(async (city) => {
    const cleaned = String(city || '').trim();
    if (!cleaned) return;
    await run({ type: 'city', city: cleaned });
  }, [run]);

  const detectLocation = useCallback(async () => {
    if (!navigator?.geolocation) {
      setState((s) => ({ ...s, status: 'error', error: 'Geolocation not supported in this browser.' }));
      return;
    }

    setState((s) => ({ ...s, status: 'loading', error: null, query: { type: 'coords' } }));

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const place = await getPlaceForCoords({ lat: latitude, lon: longitude }).catch(() => null);
          await run({
            type: 'coords',
            lat: latitude,
            lon: longitude,
            name: place?.name,
            state: place?.state,
            country: place?.country
          });
        } catch {
          await run({ type: 'coords', lat: latitude, lon: longitude });
        }
      },
      (geoErr) => {
        if (geoErr?.code === 1) {
          setState((s) => ({ ...s, status: 'idle', error: 'Location permission denied. Search by city instead.' }));
          return;
        }
        setState((s) => ({ ...s, status: 'error', error: 'Unable to access location. Search by city instead.' }));
      },
      { enableHighAccuracy: false, timeout: 9000, maximumAge: 5 * 60 * 1000 }
    );
  }, [getPlaceForCoords, run]);

  useEffect(() => {
    inFlightRef.current = null;
  }, [lang]);

  return {
    ...state,
    searchCity,
    detectLocation
  };
};
