import React from 'react';
import { ArrowLeft, User, MapPin, Phone, Settings, LogOut, Edit2 } from 'lucide-react';
import './Settings.css'; // Reusing some styles or we can create FarmerProfile.css

const FarmerProfile = ({ onBack, t, farmerName, locationData }) => {
  return (
    <div className="settings-page">
      <header className="settings-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={24} />
        </button>
        <h1>{t.profile || 'Farmer Profile'}</h1>
      </header>

      <div className="settings-content">
        <div className="profile-section">
          <div className="profile-avatar-large">
            <User size={64} color="#4ade80" />
            <button className="edit-avatar-btn">
              <Edit2 size={16} />
            </button>
          </div>
          <h2 className="profile-name">{farmerName}</h2>
          <p className="profile-status">Verified Farmer</p>
        </div>

        <div className="settings-group">
          <h3 className="group-title">Personal Information</h3>
          <div className="setting-item">
            <div className="setting-info">
              <User size={20} className="setting-icon" />
              <div>
                <p className="setting-label">Full Name</p>
                <p className="setting-value">{farmerName}</p>
              </div>
            </div>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <Phone size={20} className="setting-icon" />
              <div>
                <p className="setting-label">Mobile Number</p>
                <p className="setting-value">+91 XXXXX XXXXX</p>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-group">
          <h3 className="group-title">Location Details</h3>
          <div className="setting-item">
            <div className="setting-info">
              <MapPin size={20} className="setting-icon" />
              <div>
                <p className="setting-label">State</p>
                <p className="setting-value">{locationData?.state || 'Not Set'}</p>
              </div>
            </div>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <MapPin size={20} className="setting-icon" />
              <div>
                <p className="setting-label">District</p>
                <p className="setting-value">{locationData?.district || 'Not Set'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-group">
          <h3 className="group-title">Farm Details</h3>
          <div className="setting-item">
            <div className="setting-info">
              <Settings size={20} className="setting-icon" />
              <div>
                <p className="setting-label">Primary Crop</p>
                <p className="setting-value">{locationData?.crop || 'Not Set'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerProfile;
