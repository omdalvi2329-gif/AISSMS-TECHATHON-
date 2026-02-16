import React from 'react';
import { ArrowLeft, MapPin } from 'lucide-react';

export default function WeatherHeader({ onBack, title, subtitle }) {
  return (
    <div className="agri-header agri-card agri-fade-in">
      <div className="agri-header__row">
        <button type="button" className="agri-header__back" onClick={onBack}>
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        <div className="agri-header__title">
          <div className="agri-header__h1">{title || 'Agri Weather'}</div>
          <div className="agri-header__sub">
            <MapPin size={14} />
            <span>{subtitle || 'Live farming forecast'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
