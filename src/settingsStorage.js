const SETTINGS_KEY = 'agrisetu_settings_v1';
const QUEUE_KEY = 'agrisetu_settings_queue_v1';
const SESSION_TOKEN_KEY = 'agrisetu_session_token';

export const loadSettingsFromStorage = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const saveSettingsToStorage = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    // ignore
  }
};

export const loadQueue = () => {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const saveQueue = (queue) => {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    // ignore
  }
};

export const enqueueMutation = (mutation) => {
  const queue = loadQueue();
  const next = [...queue, mutation];
  saveQueue(next);
  return next;
};

export const removeMutationById = (id) => {
  const queue = loadQueue();
  const next = queue.filter((m) => m.id !== id);
  saveQueue(next);
  return next;
};

export const getSessionToken = () => {
  try {
    return localStorage.getItem(SESSION_TOKEN_KEY) || '';
  } catch (e) {
    return '';
  }
};

export const clearSession = () => {
  try {
    localStorage.removeItem(SESSION_TOKEN_KEY);
  } catch (e) {
    // ignore
  }
};
