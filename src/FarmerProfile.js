import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, User, MapPin, Phone, Settings, CheckCircle } from 'lucide-react';
import { supabase } from './supabaseClient';
import './FarmerProfile.css';
import { FarmerProfileProvider } from './FarmerProfileContext';
import { useFarmerProfile } from './useFarmerProfile';

const FarmerProfileInner = ({ onBack, t }) => {
  const fileInputRef = useRef(null);
  const [photoDataUrl, setPhotoDataUrl] = useState(() => {
    try {
      return localStorage.getItem('agrisetu_profile_photo') || '';
    } catch (e) {
      return '';
    }
  });

  const [dbProfile, setDbProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (data) setDbProfile(data);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    try {
      if (photoDataUrl) {
        localStorage.setItem('agrisetu_profile_photo', photoDataUrl);
      } else {
        localStorage.removeItem('agrisetu_profile_photo');
      }
    } catch (e) {
      // ignore
    }
  }, [photoDataUrl]);

  const { profile, actions, derived, validators } = useFarmerProfile();

  const fullName = dbProfile?.full_name || profile.personalInfo.fullName || 'Farmer';
  const mobileNumber = dbProfile?.phone_number || profile.personalInfo.mobileNumber || '+91 XXXXX XXXXX';
  const farmerType = profile.farmDetails.farmerType || 'Premium Farmer';
  const landSize = profile.farmDetails.landSize || 'Not Set';
  const village = dbProfile?.village || profile.location.village || '';
  const district = profile.location.district || '';
  const state = dbProfile?.state || profile.location.state || '';
  const soilType = profile.farmDetails.soilType || 'Not Set';
  const irrigation = profile.farmDetails.irrigation || 'Not Set';

  const primaryCrop = derived.crops[0]?.name || 'Not Set';

  const locationLine = useMemo(() => {
    const parts = [village, district, state].filter(Boolean);
    return parts.length ? parts.join(', ') : 'Not Set';
  }, [district, state, village]);

  const analyticsBars = derived.analyticsBars;

  const editText = (label, currentValue) => {
    const next = window.prompt(`Edit ${label}`, currentValue ?? '');
    if (next === null) return null;
    return String(next).trim();
  };

  const onEditIdentity = async () => {
    const nextName = editText('Full Name', fullName);
    const nextVillage = editText('Village', village);
    const nextState = editText('State', state);

    const updates = {};
    if (nextName !== null && nextName !== '') updates.full_name = nextName;
    if (nextVillage !== null) updates.village = nextVillage;
    if (nextState !== null) updates.state = nextState;

    if (Object.keys(updates).length > 0) {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (!error) {
        setDbProfile(prev => ({ ...prev, ...updates }));
        if (updates.full_name) actions.patchPersonalInfo({ fullName: updates.full_name });
        if (updates.village) actions.patchLocation({ village: updates.village });
        if (updates.state) actions.patchLocation({ state: updates.state });
      }
    }

    const nextType = editText('Farmer Type', farmerType);
    if (nextType !== null && nextType !== '') {
      actions.patchFarmDetails({ farmerType: nextType });
    }

    const nextDistrict = editText('District', district);
    if (nextDistrict !== null) actions.patchLocation({ district: nextDistrict });

    const nextLand = editText('Land Size', landSize);
    if (nextLand !== null) actions.patchFarmDetails({ landSize: nextLand });
  };

  const onEditMobile = () => {
    window.alert("Phone number is verified and cannot be edited manually.");
  };

  const onEditFarm = () => {
    const crop = editText('Primary Crop', primaryCrop);
    if (crop !== null) {
      const existing = derived.crops[0];
      actions.upsertCrop({
        id: existing?.id,
        name: crop,
        sowingMonth: existing?.sowingMonth || '',
        harvestMonth: existing?.harvestMonth || '',
        healthStatus: existing?.healthStatus || 'Good'
      });
    }

    const nextSoil = editText('Soil Type', soilType);
    if (nextSoil !== null) actions.patchFarmDetails({ soilType: nextSoil });

    const nextIrr = editText('Irrigation Type', irrigation);
    if (nextIrr !== null) actions.patchFarmDetails({ irrigation: nextIrr });
  };

  const onAddExpense = () => {
    const category = editText('Expense Category', 'Seeds');
    if (category === null || category === '') return;
    const amountRaw = editText('Expense Amount (₹)', '0');
    if (amountRaw === null) return;
    const amount = Number(String(amountRaw).replace(/[^0-9.]/g, ''));
    if (!Number.isFinite(amount) || amount < 0) {
      window.alert('Enter a valid amount.');
      return;
    }
    actions.addExpense({ category, amount, date: new Date().toISOString() });
  };

  const onPickPhoto = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const onPhotoChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setPhotoDataUrl(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fp-page">
      <div className="fp-container">
        <header className="fp-header">
          <button className="fp-back" onClick={onBack} aria-label="Back">
            <ArrowLeft size={24} />
          </button>
          <h1 className="fp-title">{t.profile || 'Farmer Profile'}</h1>
        </header>

        <section className="fp-card fp-identity fp-section">
          <div className="fp-card-inner">
            <div className="fp-identity-content">
              <div className="fp-avatar-block">
                <div className="fp-avatar">
                  {photoDataUrl ? (
                    <img src={photoDataUrl} alt="Farmer" />
                  ) : (
                    <User size={54} color="#86efac" />
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onPhotoChange}
                  style={{ display: 'none' }}
                />
                <button type="button" className="fp-upload-btn" onClick={onPickPhoto}>
                  Upload / Change Photo
                </button>
              </div>

              <div className="fp-identity-meta">
                <div className="fp-name-row">
                  <h2 className="fp-name" onDoubleClick={onEditIdentity}>{fullName}</h2>
                  <span className="fp-badge" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={14} /> Verified
                  </span>
                </div>
                <p className="fp-sub" onDoubleClick={onEditIdentity}>{farmerType}</p>
                <div className="fp-kv">
                  <span className="fp-pill" onDoubleClick={onEditIdentity}>
                    <MapPin size={18} color="#86efac" />
                    {locationLine}
                  </span>
                  <span className="fp-pill" onDoubleClick={onEditIdentity}>
                    <Settings size={18} color="#86efac" />
                    Land Size: {landSize}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="fp-card fp-section">
          <div className="fp-card-inner">
            <h3 className="fp-section-title">Personal Information</h3>
            <div className="fp-grid">
              <div className="fp-mini">
                <div className="fp-mini-icon">
                  <User size={18} color="#86efac" />
                </div>
                <div>
                  <p className="fp-mini-label">Full Name</p>
                  <p className="fp-mini-value" onDoubleClick={onEditIdentity}>{fullName || 'Not Set'}</p>
                </div>
              </div>
              <div className="fp-mini">
                <div className="fp-mini-icon">
                  <Phone size={18} color="#86efac" />
                </div>
                <div>
                  <p className="fp-mini-label">Mobile Number</p>
                  <p className="fp-mini-value" style={{ cursor: 'not-allowed', color: '#9ca3af' }} onClick={onEditMobile}>
                    {mobileNumber} <span style={{ fontSize: '10px', color: '#22c55e' }}>(Verified)</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="fp-card fp-section">
          <div className="fp-card-inner">
            <h3 className="fp-section-title">Farm Details</h3>
            <div className="fp-grid">
              <div className="fp-mini">
                <div className="fp-mini-icon">
                  <Settings size={18} color="#86efac" />
                </div>
                <div>
                  <p className="fp-mini-label">Primary Crop</p>
                  <p className="fp-mini-value" onDoubleClick={onEditFarm}>{primaryCrop}</p>
                  <div className="fp-tags">
                    <span className="fp-tag">Crop</span>
                    <span className="fp-tag" onDoubleClick={onEditFarm}>Soil: {soilType}</span>
                    <span className="fp-tag" onDoubleClick={onEditFarm}>Irrigation: {irrigation}</span>
                  </div>
                </div>
              </div>
              <div className="fp-mini">
                <div className="fp-mini-icon">
                  <MapPin size={18} color="#86efac" />
                </div>
                <div>
                  <p className="fp-mini-label">District / State</p>
                  <p className="fp-mini-value">{locationLine}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="fp-card fp-section">
          <div className="fp-card-inner">
            <h3 className="fp-section-title" onDoubleClick={onAddExpense}>Expense & Analytics</h3>

            {analyticsBars.length ? (
              <div className="fp-analytics">
                <div className="fp-bars">
                  {analyticsBars.map((item) => (
                    <div key={item.label}>
                      <div className="fp-bar" style={{ '--h': `${item.value}%` }}>
                        <div className="fp-bar-fill" style={{ '--h': `${item.value}%` }} />
                      </div>
                      <div className="fp-bar-label">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="fp-empty">
                <p className="fp-empty-title">No data available yet</p>
                <p className="fp-empty-sub">Double-click the title to add an expense.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const FarmerProfile = ({ onBack, t, farmerName, locationData }) => {
  return (
    <FarmerProfileProvider initialProfile={{ farmerName, locationData }}>
      <FarmerProfileInner onBack={onBack} t={t} />
    </FarmerProfileProvider>
  );
};

export default FarmerProfile;
