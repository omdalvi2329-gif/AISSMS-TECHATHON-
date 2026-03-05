const DEFAULT_TIMEOUT_MS = 15000;

const withTimeout = (promise, timeoutMs) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('REQUEST_TIMEOUT'));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
};

const readResponseBody = async (res) => {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await res.json();
    } catch (e) {
      return null;
    }
  }
  try {
    return await res.text();
  } catch (e) {
    return null;
  }
};

const mapError = (err) => {
  if (!err) return { code: 'UNKNOWN', message: 'Something went wrong.' };
  if (err.name === 'AbortError') return { code: 'ABORTED', message: 'Request cancelled.' };
  if (err.message === 'REQUEST_TIMEOUT') return { code: 'TIMEOUT', message: 'Network timeout. Please try again.' };
  if (err.message === 'FAILED_TO_FETCH') return { code: 'NETWORK', message: 'Network error. Check your connection.' };
  return { code: 'UNKNOWN', message: err.message || 'Something went wrong.' };
};

export const fetchGlobalMarketData = async ({ baseUrl = '', token, timeoutMs = DEFAULT_TIMEOUT_MS, signal } = {}) => {
  const url = `${baseUrl}/api/global-market-data`;
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  try {
    const res = await withTimeout(
      fetch(url, { method: 'GET', headers, signal }).catch((e) => {
        if (e && String(e.message || '').toLowerCase().includes('failed to fetch')) {
          const ne = new Error('FAILED_TO_FETCH');
          throw ne;
        }
        throw e;
      }),
      timeoutMs
    );

    const data = await readResponseBody(res);
    if (!res.ok) {
      const msg =
        (data && typeof data === 'object' && (data.message || data.error)) ||
        (typeof data === 'string' && data) ||
        `Request failed (${res.status})`;
      const error = new Error(msg);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return { ok: true, status: res.status, data };
  } catch (err) {
    const mapped = mapError(err);
    return { ok: false, status: err?.status || 0, error: mapped, raw: err };
  }
};
