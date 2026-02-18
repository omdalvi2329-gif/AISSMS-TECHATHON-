import React, { useState, useEffect } from 'react';
import { locationData } from './locationData';
import './FarmerOnboarding.css';

const FarmerOnboarding = ({ onComplete, t }) => {
  const [onboardingData, setOnboardingData] = useState({
    state: '',
    district: '',
    taluka: '',
    village: '',
    pinCode: ''
  });

  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (onboardingData.state) {
      setDistricts(Object.keys(locationData[onboardingData.state] || {}));
    } else {
      setDistricts([]);
    }
  }, [onboardingData.state]);

  useEffect(() => {
    if (onboardingData.state && onboardingData.district) {
      setTalukas(locationData[onboardingData.state][onboardingData.district] || []);
    } else {
      setTalukas([]);
    }
  }, [onboardingData.state, onboardingData.district]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'state') {
      setOnboardingData({
        state: value,
        district: '',
        taluka: '',
        village: onboardingData.village,
        pinCode: onboardingData.pinCode
      });
    } else if (name === 'district') {
      setOnboardingData(prev => ({
        ...prev,
        district: value,
        taluka: ''
      }));
    } else if (name === 'pinCode') {
      const numericValue = value.replace(/\D/g, '').slice(0, 6);
      setOnboardingData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setOnboardingData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!onboardingData.state) newErrors.state = 'Please select a state';
    if (!onboardingData.district) newErrors.district = 'Please select a district';
    if (!onboardingData.taluka) newErrors.taluka = 'Please select a taluka';
    if (!onboardingData.village.trim()) newErrors.village = 'Please enter village';
    if (!onboardingData.pinCode || onboardingData.pinCode.length !== 6) {
      newErrors.pinCode = 'Please enter a valid 6-digit PIN code';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onComplete(onboardingData);
    }
  };

  const isFormValid = onboardingData.state && 
                    onboardingData.district && 
                    onboardingData.taluka && 
                    onboardingData.village.trim() && 
                    onboardingData.pinCode.length === 6;

  return (
    <div className="onboarding-container">
      <div className="onboarding-card fade-in">
        <div className="onboarding-header">
          <h1 className="onboarding-title">Farm Location Details</h1>
          <p className="onboarding-subtitle">Help us personalize seasonal advice for your region</p>
        </div>

        <form className="onboarding-form" onSubmit={handleSubmit}>
          {/* State Dropdown */}
          <div className="form-group">
            <label className="form-label">
              <span className="icon">📍</span> State
            </label>
            <select
              name="state"
              className={`form-input select-input ${errors.state ? 'error' : ''}`}
              value={onboardingData.state}
              onChange={handleInputChange}
            >
              <option value="">Select State</option>
              {Object.keys(locationData).map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            {errors.state && <span className="error-message">{errors.state}</span>}
          </div>

          {/* District Dropdown */}
          <div className="form-group">
            <label className="form-label">
              <span className="icon">🏙️</span> District
            </label>
            <select
              name="district"
              className={`form-input select-input ${errors.district ? 'error' : ''}`}
              value={onboardingData.district}
              onChange={handleInputChange}
              disabled={!onboardingData.state}
            >
              <option value="">Select District</option>
              {districts.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
            {errors.district && <span className="error-message">{errors.district}</span>}
          </div>

          {/* Taluka Dropdown */}
          <div className="form-group">
            <label className="form-label">
              <span className="icon">🏛️</span> Taluka / Tehsil
            </label>
            <select
              name="taluka"
              className={`form-input select-input ${errors.taluka ? 'error' : ''}`}
              value={onboardingData.taluka}
              onChange={handleInputChange}
              disabled={!onboardingData.district}
            >
              <option value="">Select Taluka</option>
              {talukas.map(taluka => (
                <option key={taluka} value={taluka}>{taluka}</option>
              ))}
            </select>
            {errors.taluka && <span className="error-message">{errors.taluka}</span>}
          </div>

          {/* Village Input */}
          <div className="form-group">
            <label className="form-label">
              <span className="icon">🏡</span> Village Name
            </label>
            <input
              type="text"
              name="village"
              className={`form-input ${errors.village ? 'error' : ''}`}
              placeholder="Enter Village Name"
              value={onboardingData.village}
              onChange={handleInputChange}
            />
            {errors.village && <span className="error-message">{errors.village}</span>}
          </div>

          {/* PIN Code Input */}
          <div className="form-group">
            <label className="form-label">
              <span className="icon">📮</span> PIN Code
            </label>
            <input
              type="text"
              name="pinCode"
              className={`form-input ${errors.pinCode ? 'error' : ''}`}
              placeholder="Enter PIN Code"
              value={onboardingData.pinCode}
              onChange={handleInputChange}
              maxLength="6"
            />
            {errors.pinCode && <span className="error-message">{errors.pinCode}</span>}
          </div>

          <button
            type="submit"
            className="login-button slide-up"
            disabled={!isFormValid}
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default FarmerOnboarding;
