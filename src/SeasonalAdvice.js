import React, { useState, useEffect } from 'react';
import { ChevronLeft, MapPin, Sprout, Calendar, TrendingUp, AlertTriangle, Lightbulb, Info } from 'lucide-react';
import './SeasonalAdvice.css';

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const cropsData = [
  { name: "Wheat", type: "Rabi" },
  { name: "Rice", type: "Kharif" },
  { name: "Soybean", type: "Kharif" },
  { name: "Cotton", type: "Kharif" },
  { name: "Onion", type: "Rabi/Kharif" },
  { name: "Tomato", type: "Year-round" },
  { name: "Maize", type: "Kharif" },
  { name: "Chana", type: "Rabi" },
  { name: "Mustard", type: "Rabi" },
  { name: "Moong", type: "Zaid/Kharif" }
];

const SeasonalAdvice = ({ onBack, locationData }) => {
  const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()]);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState(null);

  const getAdviceLogic = (month, cropName) => {
    const rabiMonths = ["October", "November", "December", "January", "February"];
    const kharifMonths = ["June", "July", "August", "September"];
    const zaidMonths = ["March", "April", "May"];

    const crop = cropsData.find(c => c.name === cropName);
    let suitability = 0;
    let profitRange = "₹15,000 - ₹25,000";
    let risk = "Low";
    let message = "";

    if (crop.type === "Rabi") {
      if (["October", "November"].includes(month)) {
        suitability = 95;
        message = `${month} is the ideal time for sowing ${cropName}. Cool weather helps in germination.`;
      } else if (rabiMonths.includes(month)) {
        suitability = 70;
        message = `${month} is manageable for ${cropName}, but late sowing might affect yield.`;
      } else {
        suitability = 20;
        profitRange = "Potential Loss";
        risk = "High (Temperature Mismatch)";
        message = `Not recommended. ${month} is too hot for ${cropName} development.`;
      }
    } else if (crop.type === "Kharif") {
      if (["June", "July"].includes(month)) {
        suitability = 90;
        message = `Monsoon start in ${month} is perfect for ${cropName} sowing.`;
      } else if (kharifMonths.includes(month)) {
        suitability = 60;
        message = `${month} is okay, but ensure proper drainage during heavy rains.`;
      } else {
        suitability = 15;
        profitRange = "Potential Loss";
        risk = "High (Water Scarcity/Heat)";
        message = `Off-season for ${cropName}. Requires heavy irrigation and pest control.`;
      }
    } else {
      suitability = 80;
      message = `${cropName} can be grown in ${month} with proper care.`;
    }

    return {
      suitability,
      profitRange,
      risk,
      message,
      hinglish: suitability > 50 
        ? `Is mahine me ${cropName} lagana kafi faydemand ho sakta hai.` 
        : `Abhi ${cropName} lagane me risk hai, behtar hoga ki aap rabi crops chune.`
    };
  };

  useEffect(() => {
    if (selectedCrop && selectedMonth) {
      setLoading(true);
      const timer = setTimeout(() => {
        setAdvice(getAdviceLogic(selectedMonth, selectedCrop));
        setLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [selectedMonth, selectedCrop]);

  return (
    <div className="seasonal-advice-wrapper">
      <header className="advice-top-bar">
        <button className="back-btn" onClick={onBack}>
          <ChevronLeft size={24} />
          <span>Back</span>
        </button>
        <div className="title-area">
          <Sprout className="header-icon" />
          <h1>Seasonal Farming Advice</h1>
        </div>
      </header>

      <main className="advice-content">
        <div className="left-panel">
          <div className="input-card glass-card">
            <div className="input-group">
              <label><Calendar size={18} /> Mahina Chune (Select Month)</label>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="input-group">
              <label><Sprout size={18} /> Fasal Chune (Select Crop)</label>
              <select value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value)}>
                <option value="">-- Choose Crop --</option>
                {cropsData.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <div className="location-footer">
              <MapPin size={16} />
              <span>{locationData?.village || "Amman"}, {locationData?.district || "Pune"}, {locationData?.state || "Maharashtra"}</span>
            </div>
          </div>
        </div>

        <div className="right-panel">
          {!selectedCrop ? (
            <div className="empty-output glass-card">
              <Info size={48} className="info-icon" />
              <p>Kripya ek fasal aur mahina chune taaki hum aapko sahi salah de saken.</p>
            </div>
          ) : loading ? (
            <div className="loading-output glass-card">
              <div className="pulse-loader"></div>
              <p>AI analyzing seasonal patterns...</p>
            </div>
          ) : advice && (
            <div className="advice-results">
              <div className="result-card glass-card fade-in">
                <div className="section-header">
                  <TrendingUp size={20} />
                  <h3>Crop Suitability</h3>
                </div>
                <div className="suitability-bar">
                  <div className="bar-fill" style={{ width: `${advice.suitability}%` }}></div>
                  <span className="bar-label">{advice.suitability}% Match</span>
                </div>
                <p className="description">{advice.message}</p>
              </div>

              <div className="result-card glass-card fade-in delay-1">
                <div className="section-header">
                  <TrendingUp size={20} />
                  <h3>Expected Profit</h3>
                </div>
                <p className="profit-value">{advice.profitRange}</p>
                <p className="unit">per acre estimate</p>
              </div>

              <div className="result-card glass-card fade-in delay-2">
                <div className="section-header">
                  <AlertTriangle size={20} />
                  <h3>Risk Factors</h3>
                </div>
                <p className="risk-value">{advice.risk}</p>
              </div>

              <div className="result-card glass-card highlight-card fade-in delay-3">
                <div className="section-header">
                  <Lightbulb size={20} />
                  <h3>AI Recommendation</h3>
                </div>
                <p className="hinglish-advice">{advice.hinglish}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SeasonalAdvice;
