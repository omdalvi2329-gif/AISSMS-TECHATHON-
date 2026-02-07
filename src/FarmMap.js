import React, { useState, useEffect, useCallback } from 'react';
import ReactMapGL, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Navigation, Map as MapIcon, Loader2, ArrowLeft } from 'lucide-react';
import './FarmMap.css';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const FarmMap = ({ onBack, t }) => {
  const [viewport, setViewport] = useState({
    latitude: 20.5937,
    longitude: 78.9629,
    zoom: 4,
    width: '100%',
    height: '100%'
  });
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLocationDetection = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setViewport(prev => ({
          ...prev,
          latitude,
          longitude,
          zoom: 16,
          transitionDuration: 2000
        }));
        setLoading(false);
      },
      (err) => {
        setError('Please enable location access to see your farm');
        setLoading(false);
        console.error('Geolocation error:', err);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    handleLocationDetection();
  }, [handleLocationDetection]);

  if (loading) {
    return (
      <div className="farm-map-loading">
        <Loader2 className="animate-spin" size={48} />
        <p>Locating your farm...</p>
      </div>
    );
  }

  return (
    <div className="farm-map-container">
      <div className="farm-map-header">
        <div className="header-left">
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft size={24} />
          </button>
          <div className="title-group">
            <h2><MapIcon size={24} /> {t.farmMap}</h2>
            <p>{t.farmMapDesc}</p>
          </div>
        </div>
      </div>

      <div className="map-wrapper">
        <ReactMapGL
          {...viewport}
          onViewportChange={nextViewport => setViewport(nextViewport)}
          mapStyle="mapbox://styles/mapbox/satellite-v9"
          mapboxApiAccessToken={MAPBOX_TOKEN}
        >
          {userLocation && (
            <Marker
              latitude={userLocation.latitude}
              longitude={userLocation.longitude}
              anchor="bottom"
            >
              <div className="farm-marker">
                <div className="marker-pulse"></div>
                <MapPin size={32} color="#4ade80" fill="#166534" />
              </div>
            </Marker>
          )}
          <div className="map-controls">
            <NavigationControl />
          </div>
          <button 
            className="recenter-btn" 
            onClick={handleLocationDetection}
            title="Recenter Location"
          >
            <Navigation size={20} />
          </button>
        </ReactMapGL>
      </div>

      {error && (
        <div className="map-error-overlay">
          <p>{error}</p>
          <button onClick={handleLocationDetection}>Try Again</button>
        </div>
      )}

      <div className="farm-map-footer">
        <div className="coord-info">
          {userLocation && (
            <>
              <span>Lat: {userLocation.latitude.toFixed(6)}</span>
              <span>Long: {userLocation.longitude.toFixed(6)}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmMap;
