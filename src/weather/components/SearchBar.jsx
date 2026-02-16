import React, { useState } from 'react';
import { Loader2, LocateFixed } from 'lucide-react';

export default function SearchBar({ onSearch, onDetectLocation, isLoading }) {
  const [city, setCity] = useState('');

  const submit = () => {
    const cleaned = String(city || '').trim();
    if (!cleaned) return;
    onSearch(cleaned);
  };

  return (
    <div className="agri-search agri-card agri-fade-in">
      <div className="agri-search__row">
        <input
          className="agri-input"
          value={city}
          placeholder="Search city (e.g., Pune)"
          onChange={(e) => setCity(e.target.value)}
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              submit();
            }
          }}
        />
        <button type="button" className="agri-btn" onClick={submit} disabled={isLoading}>
          {isLoading ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Loader2 size={18} className="agri-spin" />
              Loading
            </span>
          ) : (
            'Search'
          )}
        </button>
        <button
          type="button"
          className="agri-btn agri-btn--ghost"
          onClick={onDetectLocation}
          disabled={isLoading}
          title="Use current location"
        >
          <LocateFixed size={18} />
        </button>
      </div>
    </div>
  );
}
