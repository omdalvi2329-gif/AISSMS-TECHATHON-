import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { 
  ArrowLeft, 
  Globe, 
  Bell, 
  User, 
  BookOpen, 
  LifeBuoy, 
  Info, 
  ChevronRight, 
  ChevronDown, 
  Languages, 
  Type, 
  ShieldCheck, 
  Mail, 
  Phone, 
  FileText,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Settings.css';
import { createApiClient } from './settingsApi';
import {
  clearSession,
  enqueueMutation,
  getSessionToken,
  loadQueue,
  loadSettingsFromStorage,
  removeMutationById,
  saveSettingsToStorage
} from './settingsStorage';

const SETTINGS_DEFAULTS = {
  general: {
    theme: 'dark',
    language: 'en',
    autoUpdate: true,
    textSize: 'medium'
  },
  notifications: {
    enabled: true,
    cropAdvisory: true,
    weatherAlerts: true,
    marketPrices: true,
    smsAlerts: false,
    pushToken: ''
  },
  user: {
    name: '',
    phone: ''
  }
};

const nowId = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;

const mergeSettings = (base, patch) => {
  if (!patch) return base;
  return {
    ...base,
    general: { ...base.general, ...(patch.general || {}) },
    notifications: { ...base.notifications, ...(patch.notifications || {}) },
    user: { ...base.user, ...(patch.user || {}) }
  };
};

const isOnline = (offlineMode) => {
  if (offlineMode) return false;
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine !== false;
};

const compressImage = async (file, { maxW = 1280, maxH = 1280, quality = 0.7 } = {}) => {
  if (!file) return null;
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.readAsDataURL(file);
  });

  const img = await new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error('Invalid image'));
    i.src = dataUrl;
  });

  const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
  const w = Math.max(1, Math.round(img.width * ratio));
  const h = Math.max(1, Math.round(img.height * ratio));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);

  const blob = await new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/jpeg', quality);
  });

  if (!blob) throw new Error('Failed to compress image');
  return new File([blob], 'screenshot.jpg', { type: 'image/jpeg' });
};

const ToggleRow = ({ icon, label, checked, onChange, disabled, right }) => {
  return (
    <div className={`setting-item ${disabled ? 'disabled' : ''}`}>
      <div className="item-label">
        {icon}
        <span>{label}</span>
      </div>
      <div className="setting-right">
        {right}
        <label className="switch">
          <input type="checkbox" checked={checked} disabled={disabled} onChange={onChange} />
          <span className="slider"></span>
        </label>
      </div>
    </div>
  );
};

const StatusLine = ({ saving, error, ok }) => {
  if (!saving && !error && !ok) return null;
  return (
    <div className={`settings-status ${error ? 'error' : ok ? 'ok' : ''}`}>
      {saving ? 'Saving…' : error ? error : ok ? 'Saved' : ''}
    </div>
  );
};

const Settings = ({ onBack, t, currentLanguage, onLanguageChange, farmerName, locationData }) => {
  const [activeSection, setActiveSection] = useState(null);

  const [settings, setSettings] = useState(() => {
    const stored = loadSettingsFromStorage();
    const merged = mergeSettings(SETTINGS_DEFAULTS, stored);
    merged.general.language = stored?.general?.language || currentLanguage || merged.general.language;
    merged.user.name = stored?.user?.name || farmerName || merged.user.name;
    merged.user.phone = stored?.user?.phone || '';
    return merged;
  });

  const [offlineMode, setOfflineMode] = useState(false);

  const [saveState, setSaveState] = useState({
    general: { saving: false, error: '', ok: false },
    notifications: { saving: false, error: '', ok: false },
    privacy: { saving: false, error: '', ok: false },
    help: { saving: false, error: '', ok: false }
  });

  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const [supportForm, setSupportForm] = useState({
    category: 'App Bug',
    message: '',
    screenshotFile: null
  });
  const [supportResult, setSupportResult] = useState({ ticketId: '', lastError: '', canRetry: false, payload: null });

  const api = useMemo(
    () =>
      createApiClient({
        baseUrl: '',
        getAuthToken: () => getSessionToken()
      }),
    []
  );

  const appVersion = useMemo(() => {
    return process.env.REACT_APP_VERSION || process.env.npm_package_version || '1.0.0';
  }, []);

  const textSize = settings.general.textSize;

  const showToast = (type, message) => {
    setToast({ type, message });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    saveSettingsToStorage(settings);
  }, [settings]);

  useEffect(() => {
    const stored = loadSettingsFromStorage();
    if (!stored) return;
    const merged = mergeSettings(SETTINGS_DEFAULTS, stored);
    merged.general.language = stored?.general?.language || currentLanguage || merged.general.language;
    merged.user.name = stored?.user?.name || farmerName || merged.user.name;
    setSettings(merged);
  }, [currentLanguage, farmerName]);

  const flushQueue = useCallback(async () => {
    const queue = loadQueue();
    if (!queue.length) return;

    for (const m of queue) {
      if (!isOnline(offlineMode)) return;
      let res = null;

      if (m.kind === 'general') res = await api.putGeneralSettings(m.payload);
      if (m.kind === 'notifications') res = await api.putNotificationSettings(m.payload);
      if (m.kind === 'userUpdate') res = await api.putUserUpdate(m.payload);

      if (res && res.ok) {
        removeMutationById(m.id);
      } else {
        return;
      }
    }
  }, [api, offlineMode]);

  useEffect(() => {
    const onOnline = () => {
      if (!isOnline(offlineMode)) return;
      flushQueue();
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [offlineMode, flushQueue]);

  const setSectionSave = (section, patch) => {
    setSaveState((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...patch }
    }));
  };

  const saveOrQueue = async (section, kind, apiCall, payload) => {
    setSectionSave(section, { saving: true, error: '', ok: false });

    if (!isOnline(offlineMode)) {
      enqueueMutation({ id: nowId(), kind, payload, createdAt: new Date().toISOString() });
      setSectionSave(section, { saving: false, error: '', ok: true });
      showToast('info', 'Saved offline. Will sync when online.');
      return;
    }

    const res = await apiCall(payload);
    if (!res.ok) {
      if (res.error.code === 'NETWORK' || res.error.code === 'TIMEOUT') {
        enqueueMutation({ id: nowId(), kind, payload, createdAt: new Date().toISOString() });
        setSectionSave(section, { saving: false, error: '', ok: true });
        showToast('info', 'Saved locally. Will sync when network is back.');
        return;
      }
      setSectionSave(section, { saving: false, error: res.error.message || 'Failed to save.', ok: false });
      showToast('error', res.error.message || 'Failed');
      return;
    }

    setSectionSave(section, { saving: false, error: '', ok: true });
    showToast('success', 'Saved');
  };

  const sections = [
    { id: 'general', title: '🌐 General Settings', icon: <Globe size={24} /> },
    { id: 'notifications', title: '🔔 Notifications & Alerts', icon: <Bell size={24} /> },
    { id: 'privacy', title: '🔐 Privacy & Account', icon: <User size={24} /> },
    { id: 'guide', title: '📘 How to Use This App', icon: <BookOpen size={24} /> },
    { id: 'help', title: '🆘 Help & Support', icon: <LifeBuoy size={24} /> },
    { id: 'legal', title: '📜 Legal & Information', icon: <Info size={24} /> },
  ];

  const toggleSection = (id) => {
    setActiveSection(activeSection === id ? null : id);
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    setSupportResult({ ticketId: '', lastError: '', canRetry: false, payload: null });

    const message = String(supportForm.message || '').trim();
    if (!message) {
      showToast('error', 'Please enter your issue message.');
      return;
    }

    if (!isOnline(offlineMode)) {
      const payload = { ...supportForm, message, offlineSavedAt: new Date().toISOString() };
      setSupportResult({ ticketId: '', lastError: 'You are offline. Please retry when online.', canRetry: true, payload });
      showToast('error', 'Offline. Please retry when online.');
      return;
    }

    setSectionSave('help', { saving: true, error: '', ok: false });

    try {
      const screenshot = supportForm.screenshotFile
        ? await compressImage(supportForm.screenshotFile, { maxW: 1280, maxH: 1280, quality: 0.72 })
        : null;

      const fd = new FormData();
      fd.append('category', supportForm.category);
      fd.append('message', message);
      fd.append('appVersion', appVersion);
      fd.append('language', settings.general.language);
      if (screenshot) fd.append('screenshot', screenshot, screenshot.name);

      const res = await api.postSupportTicket(fd);
      if (!res.ok) {
        setSectionSave('help', { saving: false, error: res.error.message || 'Failed to submit.', ok: false });
        setSupportResult({ ticketId: '', lastError: res.error.message || 'Failed to submit.', canRetry: true, payload: null });
        showToast('error', res.error.message || 'Failed');
        return;
      }

      const ticketId =
        (res.data && typeof res.data === 'object' && (res.data.ticketId || res.data.id)) ||
        `TKT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

      setSectionSave('help', { saving: false, error: '', ok: true });
      setSupportResult({ ticketId, lastError: '', canRetry: false, payload: null });
      setSupportForm({ category: supportForm.category, message: '', screenshotFile: null });
      showToast('success', `Ticket submitted: ${ticketId}`);
    } catch (err) {
      const msg = err?.message || 'Failed to submit.';
      setSectionSave('help', { saving: false, error: msg, ok: false });
      setSupportResult({ ticketId: '', lastError: msg, canRetry: true, payload: null });
      showToast('error', msg);
    }
  };

  const retrySupport = async () => {
    if (!supportResult.canRetry) return;
    if (!isOnline(offlineMode)) {
      showToast('error', 'Still offline.');
      return;
    }
    if (supportResult.payload) {
      setSupportForm({
        category: supportResult.payload.category,
        message: supportResult.payload.message,
        screenshotFile: supportResult.payload.screenshotFile || null
      });
    }
    const fakeEvent = { preventDefault: () => {} };
    await handleSupportSubmit(fakeEvent);
  };

  const handleProfileUpdate = async () => {
    const name = String(settings.user.name || '').trim();
    const phone = String(settings.user.phone || '').trim();
    if (!name) {
      showToast('error', 'Name is required.');
      return;
    }
    if (phone && !/^\d{10}$/.test(phone)) {
      showToast('error', 'Enter a valid 10-digit phone number.');
      return;
    }

    await saveOrQueue('privacy', 'userUpdate', api.putUserUpdate, { name, phone });
  };

  const handleLogout = async () => {
    setSectionSave('privacy', { saving: true, error: '', ok: false });
    if (isOnline(offlineMode)) {
      await api.postLogout();
    }
    clearSession();
    setSectionSave('privacy', { saving: false, error: '', ok: true });
    showToast('success', 'Logged out');
    window.location.hash = '#/';
    window.location.reload();
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      showToast('error', 'Type DELETE to confirm.');
      return;
    }

    setSectionSave('privacy', { saving: true, error: '', ok: false });
    const res = await api.deleteUser({ confirm: 'DELETE' });
    if (!res.ok) {
      setSectionSave('privacy', { saving: false, error: res.error.message || 'Delete failed.', ok: false });
      showToast('error', res.error.message || 'Delete failed');
      return;
    }

    clearSession();
    setSectionSave('privacy', { saving: false, error: '', ok: true });
    showToast('success', 'Account deleted');
    window.location.hash = '#/';
    window.location.reload();
  };

  const fetchPushTokenIfPossible = async () => {
    try {
      if (!('serviceWorker' in navigator)) return '';
      const reg = await navigator.serviceWorker.ready;
      if (!reg.pushManager) return '';
      const sub = await reg.pushManager.getSubscription();
      if (!sub) return '';
      return sub.endpoint || '';
    } catch (e) {
      return '';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const renderSectionContent = (id) => {
    switch (id) {
      case 'general':
        return (
          <div className="section-content">
            <StatusLine saving={saveState.general.saving} error={saveState.general.error} ok={saveState.general.ok} />

            <ToggleRow
              icon={<Globe size={20} />}
              label="Dark mode"
              checked={settings.general.theme === 'dark'}
              onChange={async () => {
                const nextTheme = settings.general.theme === 'dark' ? 'light' : 'dark';
                const next = { ...settings, general: { ...settings.general, theme: nextTheme } };
                setSettings(next);
                await saveOrQueue('general', 'general', api.putGeneralSettings, next.general);
              }}
            />

            <ToggleRow
              icon={<ShieldCheck size={20} />}
              label="Offline mode"
              checked={offlineMode}
              onChange={() => {
                const next = !offlineMode;
                setOfflineMode(next);
                showToast('info', next ? 'Offline mode enabled.' : 'Offline mode disabled.');
                if (!next) flushQueue();
              }}
            />

            <div className="setting-item">
              <div className="item-label">
                <Languages size={20} />
                <span>Language selection</span>
              </div>
              <select 
                value={settings.general.language} 
                onChange={async (e) => {
                  const lang = e.target.value;
                  setSettings((prev) => ({ ...prev, general: { ...prev.general, language: lang } }));
                  onLanguageChange(lang);
                  await saveOrQueue('general', 'general', api.putGeneralSettings, { ...settings.general, language: lang });
                }}
                className="setting-select"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
              </select>
            </div>
            <div className="setting-item">
              <div className="item-label">
                <Type size={20} />
                <span>Text size</span>
              </div>
              <div className="size-selector">
                {['small', 'medium', 'large'].map(size => (
                  <button 
                    key={size}
                    className={`size-btn ${textSize === size ? 'active' : ''}`}
                    onClick={async () => {
                      const next = { ...settings, general: { ...settings.general, textSize: size } };
                      setSettings(next);
                      await saveOrQueue('general', 'general', api.putGeneralSettings, next.general);
                    }}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <ToggleRow
              icon={<ShieldCheck size={20} />}
              label="Auto-update"
              checked={Boolean(settings.general.autoUpdate)}
              onChange={async () => {
                const next = { ...settings, general: { ...settings.general, autoUpdate: !settings.general.autoUpdate } };
                setSettings(next);
                await saveOrQueue('general', 'general', api.putGeneralSettings, next.general);
              }}
            />

            <div className="setting-item">
              <div className="item-label">
                <ShieldCheck size={20} />
                <span>App version</span>
              </div>
              <div className="setting-readonly">v{appVersion}</div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="section-content">
            <StatusLine saving={saveState.notifications.saving} error={saveState.notifications.error} ok={saveState.notifications.ok} />

            <ToggleRow
              icon={<Bell size={20} />}
              label="Notifications (Master)"
              checked={Boolean(settings.notifications.enabled)}
              onChange={async () => {
                const nextEnabled = !settings.notifications.enabled;
                const next = {
                  ...settings,
                  notifications: { ...settings.notifications, enabled: nextEnabled }
                };
                setSettings(next);
                await saveOrQueue('notifications', 'notifications', api.putNotificationSettings, next.notifications);
              }}
            />

            <ToggleRow
              icon={null}
              label="Crop advisory alerts"
              checked={Boolean(settings.notifications.cropAdvisory)}
              disabled={!settings.notifications.enabled}
              onChange={async () => {
                const next = {
                  ...settings,
                  notifications: { ...settings.notifications, cropAdvisory: !settings.notifications.cropAdvisory }
                };
                setSettings(next);
                await saveOrQueue('notifications', 'notifications', api.putNotificationSettings, next.notifications);
              }}
            />

            <ToggleRow
              icon={null}
              label="Weather alerts"
              checked={Boolean(settings.notifications.weatherAlerts)}
              disabled={!settings.notifications.enabled}
              onChange={async () => {
                const next = {
                  ...settings,
                  notifications: { ...settings.notifications, weatherAlerts: !settings.notifications.weatherAlerts }
                };
                setSettings(next);
                await saveOrQueue('notifications', 'notifications', api.putNotificationSettings, next.notifications);
              }}
            />

            <ToggleRow
              icon={null}
              label="Market price alerts"
              checked={Boolean(settings.notifications.marketPrices)}
              disabled={!settings.notifications.enabled}
              onChange={async () => {
                const next = {
                  ...settings,
                  notifications: { ...settings.notifications, marketPrices: !settings.notifications.marketPrices }
                };
                setSettings(next);
                await saveOrQueue('notifications', 'notifications', api.putNotificationSettings, next.notifications);
              }}
            />

            <ToggleRow
              icon={null}
              label="SMS alerts"
              checked={Boolean(settings.notifications.smsAlerts)}
              disabled={!settings.notifications.enabled}
              onChange={async () => {
                const next = {
                  ...settings,
                  notifications: { ...settings.notifications, smsAlerts: !settings.notifications.smsAlerts }
                };
                setSettings(next);
                await saveOrQueue('notifications', 'notifications', api.putNotificationSettings, next.notifications);
              }}
            />

            <div className="setting-item">
              <div className="item-label">
                <ShieldCheck size={20} />
                <span>Push token</span>
              </div>
              <button
                type="button"
                className="size-btn"
                onClick={async () => {
                  const token = await fetchPushTokenIfPossible();
                  if (!token) {
                    showToast('error', 'Push token not available on this device/browser.');
                    return;
                  }
                  const next = { ...settings, notifications: { ...settings.notifications, pushToken: token } };
                  setSettings(next);
                  await saveOrQueue('notifications', 'notifications', api.putNotificationSettings, next.notifications);
                }}
              >
                Sync Token
              </button>
            </div>
          </div>

        );

      case 'privacy':
        return (
          <div className="section-content">
            <StatusLine saving={saveState.privacy.saving} error={saveState.privacy.error} ok={saveState.privacy.ok} />

            <div className="info-card">
              <h4>Account Details</h4>

              <div className="settings-form-row">
                <label className="settings-label">Name</label>
                <input
                  className="settings-input"
                  value={settings.user.name}
                  onChange={(e) => setSettings((prev) => ({ ...prev, user: { ...prev.user, name: e.target.value } }))}
                  placeholder="Enter your name"
                />
              </div>

              <div className="settings-form-row">
                <label className="settings-label">Phone (10 digits)</label>
                <input
                  className="settings-input"
                  value={settings.user.phone}
                  onChange={(e) => {
                    const digits = String(e.target.value || '').replace(/\D/g, '').slice(0, 10);
                    setSettings((prev) => ({ ...prev, user: { ...prev.user, phone: digits } }));
                  }}
                  placeholder="Mobile number"
                />
              </div>

              <button type="button" className="send-btn" onClick={handleProfileUpdate} disabled={saveState.privacy.saving}>
                Save Profile
              </button>

              <p>
                <strong>Location:</strong> {locationData?.district || 'Not Set'}, {locationData?.state || 'Not Set'}
              </p>
            </div>

            <div className="setting-item clickable" onClick={handleLogout}>
              <div className="item-label">
                <ShieldCheck size={20} />
                <span>Logout</span>
              </div>
              <ChevronRight size={18} />
            </div>

            <div className="setting-item clickable" onClick={() => setDeleteModalOpen(true)}>
              <div className="item-label danger">
                <Trash2 size={20} />
                <span>Delete account</span>
              </div>
              <ChevronRight size={18} />
            </div>
          </div>
        );

      case 'guide':
        return (
          <div className="section-content">
            <div className="guide-card">
              <details className="settings-accordion" open>
                <summary className="settings-accordion-title">1. Weather (मौसम)</summary>
                <div className="settings-accordion-body">
                  Check daily rain/temperature for your district. Enable Weather Alerts in Notifications.
                </div>
              </details>

              <details className="settings-accordion">
                <summary className="settings-accordion-title">2. Market Prices (बाजार भाव)</summary>
                <div className="settings-accordion-body">
                  View mandi rates and set Market Price Alerts to get updates.
                </div>
              </details>

              <details className="settings-accordion">
                <summary className="settings-accordion-title">3. Advisory (सलाह)</summary>
                <div className="settings-accordion-body">
                  Crop advisory alerts help with irrigation, fertilizer, and disease prevention tips.
                </div>
              </details>

              <div className="setting-item clickable" onClick={() => window.open('mailto:support@agrisetu.com', '_self')}>
                <div className="item-label">
                  <Mail size={20} />
                  <span>Contact Support</span>
                </div>
                <ChevronRight size={18} />
              </div>
            </div>
          </div>
        );

      case 'help':
        return (
          <div className="section-content">
            <StatusLine saving={saveState.help.saving} error={saveState.help.error} ok={saveState.help.ok} />

            <form className="support-form" onSubmit={handleSupportSubmit}>
              <h5>How can we help you?</h5>
              <div className="settings-form-row">
                <label className="settings-label">Issue Category</label>
                <select
                  className="setting-select"
                  value={supportForm.category}
                  onChange={(e) => setSupportForm((p) => ({ ...p, category: e.target.value }))}
                >
                  <option value="App Bug">App Bug</option>
                  <option value="Weather Alerts">Weather Alerts</option>
                  <option value="Market Prices">Market Prices</option>
                  <option value="Advisory">Crop Advisory</option>
                  <option value="Account">Account / Login</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <textarea 
                placeholder="Describe your issue (समस्या लिखें)..."
                value={supportForm.message}
                onChange={(e) => setSupportForm((p) => ({ ...p, message: e.target.value }))}
                required
              ></textarea>

              <div className="settings-form-row">
                <label className="settings-label">Screenshot (optional)</label>
                <input
                  className="settings-file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSupportForm((p) => ({ ...p, screenshotFile: e.target.files?.[0] || null }))}
                />
              </div>

              <div className="auto-info">
                <p>App Version: {appVersion}</p>
                <p>Language: {settings.general.language}</p>
                <p>Network: {isOnline(offlineMode) ? 'Online' : 'Offline'}</p>
              </div>

              <button type="submit" className="send-btn" disabled={saveState.help.saving}>
                {saveState.help.saving ? 'Sending…' : 'Submit Ticket'}
              </button>
            </form>

            {supportResult.ticketId ? (
              <div className="info-card">
                <h4>Ticket Submitted</h4>
                <p>Your ticket number is:</p>
                <p className="ticket-id">{supportResult.ticketId}</p>
              </div>
            ) : null}

            {supportResult.canRetry && supportResult.lastError ? (
              <div className="info-card">
                <h4>Submission Failed</h4>
                <p>{supportResult.lastError}</p>
                <button type="button" className="send-btn" onClick={retrySupport} disabled={saveState.help.saving}>
                  Retry
                </button>
              </div>
            ) : null}

            <div className="contact-methods">
              <p><Mail size={16} /> support@agrisetu.com</p>
              <p><Phone size={16} /> +91 1800-AGRI-SETU (Toll Free)</p>
            </div>
          </div>
        );

      case 'legal':
        return (
          <div className="section-content">
            <div className="legal-doc-container">
              <div className="legal-doc">
                <div className="item-label">
                  <FileText size={20} />
                  <h5>Terms & Conditions</h5>
                </div>
                <div className="legal-text-box">
                  <p><strong>1. Acceptance of Terms:</strong> By using AgriSetu, you agree to these terms. This app is designed to support farmers with crop advisory and market information.</p>
                  <p><strong>2. Accuracy of Information:</strong> While we strive for accuracy in weather and market prices, these are for guidance only. Farming decisions should consider local conditions.</p>
                  <p><strong>3. User Responsibilities:</strong> You agree to provide correct details during onboarding for better crop advice. Do not share illegal or harmful content in the community section.</p>
                  <p><strong>4. Service Availability:</strong> We aim for 24/7 service, but some features (like market data) depend on external government sources.</p>
                  <p><strong>5. Limitation of Liability:</strong> AgriSetu is not responsible for crop loss or financial decisions based solely on app data.</p>
                </div>
              </div>

              <div className="legal-doc">
                <div className="item-label">
                  <ShieldCheck size={20} />
                  <h5>Privacy Policy</h5>
                </div>
                <div className="legal-text-box">
                  <p><strong>1. Data Collection:</strong> We collect your name, phone number, and farm location to provide personalized weather alerts and mandi prices.</p>
                  <p><strong>2. Usage of Data:</strong> Your data helps our AI improve crop suggestions. We do not sell your personal information to third parties.</p>
                  <p><strong>3. Location Access:</strong> We use your GPS only to show weather and mandi data near your farm.</p>
                  <p><strong>4. Community Privacy:</strong> When you post in the community, other farmers can see your name and crop updates.</p>
                  <p><strong>5. Data Security:</strong> Your data is stored securely. You can clear your local cache anytime from the 'Privacy & Account' section.</p>
                </div>
              </div>
            </div>
            <div className="app-info-footer">
              <p>AgriSetu - Smart Farming Companion</p>
              <p>Version {appVersion}</p>
              <p>Last Update: Feb 09, 2026</p>
              <button
                type="button"
                className="size-btn"
                onClick={() => window.open('https://cra.link/deployment', '_blank', 'noopener,noreferrer')}
              >
                Open Developer Info
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div 
      className={`settings-page text-${textSize} theme-${settings.general.theme}`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <header className="settings-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={24} />
        </button>
        <h1>Settings</h1>
      </header>

      <main className="settings-list">
        {sections.map(section => (
          <motion.div 
            key={section.id} 
            className={`settings-section ${activeSection === section.id ? 'active' : ''}`}
            variants={itemVariants}
          >
            <button 
              className="section-header"
              onClick={() => toggleSection(section.id)}
            >
              <div className="header-title">
                {section.icon}
                <span>{section.title}</span>
              </div>
              {activeSection === section.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
            
            <AnimatePresence>
              {activeSection === section.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="section-body"
                >
                  {renderSectionContent(section.id)}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </main>

      <AnimatePresence>
        {toast && (
          <motion.div
            className={`settings-toast ${toast.type}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
          >
            <div className="settings-toast-inner">
              {toast.type === 'success' ? <CheckCircle2 size={18} /> : null}
              <span>{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteModalOpen && (
          <motion.div
            className="success-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="settings-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <h3>Delete Account</h3>
              <p className="settings-modal-sub">
                This will permanently delete your account and data. Type <strong>DELETE</strong> to confirm.
              </p>
              <input
                className="settings-input"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE"
              />
              <div className="settings-modal-actions">
                <button type="button" className="size-btn" onClick={() => { setDeleteModalOpen(false); setDeleteConfirmText(''); }}>
                  Cancel
                </button>
                <button type="button" className="send-btn" onClick={handleDeleteAccount} disabled={saveState.privacy.saving}>
                  {saveState.privacy.saving ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Settings;
