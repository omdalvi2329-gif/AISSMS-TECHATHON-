import React, { useState, useEffect } from 'react';
import './SeasonalAdvice.css';

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const topCrops = [
  "Wheat", "Rice", "Onion", "Potato", "Tomato", "Turmeric", 
  "Dry Chilli", "Sugarcane", "Soybean", "Maize", "Moong Dal", 
  "Urad Dal", "Chana", "Toor Dal", "Masoor Dal", "Coriander", 
  "Cumin / Jeera", "Garlic", "Dry Ginger", "Cotton"
];

const SeasonalAdvice = ({ onBack, locationData, t }) => {
  const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()]);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateAdvice = async (month, crop) => {
    setLoading(true);
    
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    
    if (apiKey) {
      try {
        const prompt = `You are an AI Seasonal Farming Advisor for Indian agriculture.

        CRITICAL RULE (VERY IMPORTANT):
        - Month is the PRIMARY decision factor.
        - The same crop MUST produce DIFFERENT advice for DIFFERENT months.
        - Never repeat the same response structure, wording, or recommendation for different months.

        INPUTS:
        - Month: ${month}
        - Crop Name: ${crop}
        - Farmer Location: ${locationData?.village}, ${locationData?.district}, ${locationData?.state}

        MONTH-WISE LOGIC (MANDATORY):
        Evaluate crop suitability based on:
        - Season type (Rabi / Kharif / Zaid / Off-season)
        - Temperature range of the selected month
        - Rainfall pattern of the month
        - Crop growth calendar

        CLASSIFY EACH SELECTION INTO ONE OF THESE:
        - Best month to sow
        - Average / manageable month
        - Not recommended month

        IF CROP IS NOT RECOMMENDED:
        - Clearly say: "Is mahine yeh crop lagana sahi nahi hai"
        - Give reason (weather / season mismatch)
        - Suggest better crops for that month

        PROFIT & LOSS RULE:
        - Profit estimation MUST change based on month
        - Off-season crops should show:
          - Higher risk
          - Lower success probability
          - Possible loss

        OUTPUT FORMAT (MANDATORY):
        1. Month Impact on Crop
        2. Crop Suitability Status ()
        3. Weather Match Explanation
        4. Month-wise Profit / Loss Estimate
        5. Month-specific Risks
        6. Better Crop Options for This Month

        LANGUAGE:
        - Simple Hinglish
        - Farmer-friendly
        - No technical terms

        IMPORTANT:
        - Never give same recommendation for same crop across all months
        - Always explain WHY month matters.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        const data = await response.json();
        const aiText = data.candidates[0].content.parts[0].text;
        
        setAdvice({
          isAI: true,
          content: aiText,
          suitability: "AI Generated Month-Specific Advice",
          suitabilityColor: "#10b981"
        });
        setLoading(false);
        return;
      } catch (error) {
        console.error("AI Advice Error:", error);
      }
    }

    // Fallback to simulated logic with improved month-based variations
    setTimeout(() => {
      const rabiMonths = ["October", "November", "December", "January"];
      const kharifMonths = ["June", "July", "August", "September"];
      const zaidMonths = ["March", "April", "May"];

      let suitability = "";
      let suitabilityColor = "#f59e0b";
      let statusIcon = "";

      if (["Wheat", "Chana", "Mustard"].includes(crop)) {
        if (["October", "November"].includes(month)) {
          suitability = "Best month to sow";
          suitabilityColor = "#10b981";
          statusIcon = "";
        } else if (!rabiMonths.includes(month)) {
          suitability = "Not recommended month";
          suitabilityColor = "#ef4444";
          statusIcon = "";
        }
      } else if (["Rice", "Soybean", "Maize", "Cotton"].includes(crop)) {
        if (["June", "July"].includes(month)) {
          suitability = "Best month to sow";
          suitabilityColor = "#10b981";
          statusIcon = "";
        } else if (!kharifMonths.includes(month)) {
          suitability = "Not recommended month";
          suitabilityColor = "#ef4444";
          statusIcon = "";
        }
      }

      setAdvice({
        suitability: suitability,
        suitabilityColor: suitabilityColor,
        isAI: false,
        monthImpact: `${month} ka samay ${crop} ke liye vishesh hai kyunki...`,
        statusIcon: statusIcon,
        weatherExplanation: suitabilityColor === "#ef4444" 
          ? `Is mahine ka tapman (${month}) ${crop} ke liye sahi nahi hai.`
          : `${month} me mausam ${crop} ke vikas ke liye anukul hai.`,
        economics: suitabilityColor === "#ef4444"
          ? { cost: "High Risk", yield: "Low", marketPrice: "Fluctuating", profit: "Loss Potential" }
          : { cost: "₹15,000", yield: "18 Quintal", marketPrice: "₹2,300", profit: "₹20,000+" },
        risks: suitabilityColor === "#ef4444"
          ? ["Mausam ki maar", "Kam pedawar", "Paise ka nuksan"]
          : ["Keede ka darr", "Sahi sinchai ki zarurat"],
        alternatives: suitabilityColor === "#ef4444" ? ["Moong Dal", "Vegetables", "Fodder"] : []
      });
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    if (selectedCrop) {
      generateAdvice(selectedMonth, selectedCrop);
    }
  }, [selectedMonth, selectedCrop]);

  return (
    <div className="seasonal-advice-container">
      <div className="advice-header">
        <button className="back-button" onClick={onBack}>← Back</button>
        <h1>🌾 Seasonal Farming Advice</h1>
      </div>

      <div className="advice-layout">
        {/* Left Panel: Selectors */}
        <div className="selectors-panel glass-card">
          <div className="selector-group">
            <label>Mahina Chune (Select Month)</label>
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="advice-select"
            >
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="selector-group">
            <label>Fasal Chune (Select Crop)</label>
            <select 
              value={selectedCrop} 
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="advice-select"
            >
              <option value="">-- Chune --</option>
              {topCrops.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {locationData && (
            <div className="location-info">
              <p>📍 {locationData.village}, {locationData.district}, {locationData.state}</p>
            </div>
          )}
        </div>

        {/* Right Panel: Advice Content */}
        <div className="content-panel">
          {!selectedCrop ? (
            <div className="empty-state glass-card">
              <p>Kripya ek fasal aur mahina chune taaki hum aapko sahi salah de sakein.</p>
            </div>
          ) : loading ? (
            <div className="loading-state glass-card">
              <div className="loader"></div>
              <p>AI Advisor aapke liye jankari juta raha hai...</p>
            </div>
          ) : advice && (
            <div className="advice-results fade-in">
              {advice.isAI ? (
                <div className="advice-card glass-card ai-content">
                  <div className="ai-badge">✨ AI Generated</div>
                  <div className="markdown-content">
                    {advice.content.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="advice-card glass-card">
                    <h3>📅 Month Impact on Crop</h3>
                    <p className="reason-text">{advice.monthImpact}</p>
                  </div>

                  <div className="advice-card glass-card">
                    <h3>🌱 Crop Suitability Status</h3>
                    <p className="suitability-tag" style={{ backgroundColor: advice.suitabilityColor }}>
                      {advice.statusIcon} {advice.suitability}
                    </p>
                  </div>

                  <div className="advice-card glass-card">
                    <h3>🌦️ Weather Match Explanation</h3>
                    <p className="reason-text">{advice.weatherExplanation}</p>
                  </div>

                  <div className="advice-card glass-card">
                    <h3>💰 Month-wise Profit / Loss Estimate</h3>
                    <div className="economics-list">
                      <div className="econ-item">
                        <span>Kharcha (Cost):</span>
                        <strong>{advice.economics.cost}</strong>
                      </div>
                      <div className="econ-item">
                        <span>Pedawar (Yield):</span>
                        <strong>{advice.economics.yield}</strong>
                      </div>
                      <div className="econ-item">
                        <span>Bhav (Market Price):</span>
                        <strong>{advice.economics.marketPrice}</strong>
                      </div>
                      <div className="econ-item highlight">
                        <span>Munafa (Profit):</span>
                        <strong>{advice.economics.profit}</strong>
                      </div>
                    </div>
                    <p className="disclaimer">* Yeh estimate hai, market badal sakta hai.</p>
                  </div>

                  <div className="advice-card glass-card">
                    <h3>⚠️ Month-specific Risks</h3>
                    <ul className="risk-list">
                      {advice.risks.map((risk, i) => <li key={i}>{risk}</li>)}
                    </ul>
                  </div>

                  {advice.alternatives.length > 0 && (
                    <div className="advice-card glass-card highlight-card">
                      <h3>🌾 Better Crop Options for This Month</h3>
                      <p>Is mahine ke liye ye behtar vikalp hain:</p>
                      <div className="alt-tags">
                        {advice.alternatives.map(alt => <span key={alt} className="alt-tag">{alt}</span>)}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeasonalAdvice;
