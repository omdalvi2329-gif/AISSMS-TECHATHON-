export const MANDIS = [
  // West & Maharashtra
  { id: 1, name: 'Lasalgaon', state: 'Maharashtra', region: 'West' },
  { id: 2, name: 'Pimpalgaon', state: 'Maharashtra', region: 'West' },
  { id: 3, name: 'Pune APMC', state: 'Maharashtra', region: 'West' },
  { id: 4, name: 'Mumbai APMC (Vashi)', state: 'Maharashtra', region: 'West' },
  { id: 5, name: 'Nagpur APMC', state: 'Maharashtra', region: 'West' },
  { id: 6, name: 'Nashik APMC', state: 'Maharashtra', region: 'West' },
  { id: 7, name: 'Kolhapur APMC', state: 'Maharashtra', region: 'West' },
  { id: 8, name: 'Sangli APMC', state: 'Maharashtra', region: 'West' },
  
  // Central India (MP)
  { id: 9, name: 'Indore APMC', state: 'Madhya Pradesh', region: 'Central' },
  { id: 10, name: 'Bhopal APMC', state: 'Madhya Pradesh', region: 'Central' },
  { id: 11, name: 'Ujjain APMC', state: 'Madhya Pradesh', region: 'Central' },
  { id: 12, name: 'Dewas APMC', state: 'Madhya Pradesh', region: 'Central' },
  { id: 13, name: 'Ratlam APMC', state: 'Madhya Pradesh', region: 'Central' },
  
  // Gujarat
  { id: 14, name: 'Rajkot APMC', state: 'Gujarat', region: 'West' },
  { id: 15, name: 'Ahmedabad APMC', state: 'Gujarat', region: 'West' },
  { id: 16, name: 'Gondal APMC', state: 'Gujarat', region: 'West' },
  { id: 17, name: 'Unjha APMC', state: 'Gujarat', region: 'West' },
  
  // Rajasthan
  { id: 18, name: 'Kota APMC', state: 'Rajasthan', region: 'North' },
  { id: 19, name: 'Jaipur APMC', state: 'Rajasthan', region: 'North' },
  { id: 20, name: 'Alwar APMC', state: 'Rajasthan', region: 'North' },
  
  // North India
  { id: 21, name: 'Azadpur Mandi (Delhi)', state: 'Delhi', region: 'North' },
  { id: 22, name: 'Kanpur APMC', state: 'Uttar Pradesh', region: 'North' },
  { id: 23, name: 'Lucknow APMC', state: 'Uttar Pradesh', region: 'North' },
  { id: 24, name: 'Meerut APMC', state: 'Uttar Pradesh', region: 'North' },
  
  // Punjab & Haryana
  { id: 25, name: 'Khanna Mandi', state: 'Punjab', region: 'North' },
  { id: 26, name: 'Ludhiana APMC', state: 'Punjab', region: 'North' },
  { id: 27, name: 'Karnal APMC', state: 'Haryana', region: 'North' },
  { id: 28, name: 'Kurukshetra APMC', state: 'Haryana', region: 'North' },
  
  // South India
  { id: 29, name: 'Bengaluru APMC', state: 'Karnataka', region: 'South' },
  { id: 30, name: 'Mysuru APMC', state: 'Karnataka', region: 'South' },
  { id: 31, name: 'Hyderabad APMC', state: 'Telangana', region: 'South' },
  { id: 32, name: 'Warangal APMC', state: 'Telangana', region: 'South' },
  { id: 33, name: 'Guntur APMC', state: 'Andhra Pradesh', region: 'South' },
  { id: 34, name: 'Vijayawada APMC', state: 'Andhra Pradesh', region: 'South' },
  { id: 35, name: 'Coimbatore APMC', state: 'Tamil Nadu', region: 'South' },
  { id: 36, name: 'Salem APMC', state: 'Tamil Nadu', region: 'South' },
  { id: 37, name: 'Madurai APMC', state: 'Tamil Nadu', region: 'South' },
  
  // East India
  { id: 38, name: 'Howrah APMC', state: 'West Bengal', region: 'East' },
  { id: 39, name: 'Siliguri APMC', state: 'West Bengal', region: 'East' },
  { id: 40, name: 'Patna APMC', state: 'Bihar', region: 'East' },
];

export const COMMODITIES_CONFIG = [
  // Staples & Vegetables
  { name: 'Wheat', min: 2200, max: 2600, category: 'Staples' },
  { name: 'Rice', min: 3000, max: 4200, category: 'Staples' },
  { name: 'Onion', min: 800, max: 1800, category: 'Vegetables' },
  { name: 'Potato', min: 700, max: 1500, category: 'Vegetables' },
  { name: 'Tomato', min: 600, max: 2000, category: 'Vegetables' },
  
  // Spices & Cash Crops
  { name: 'Turmeric', min: 9000, max: 13000, category: 'Spices' },
  { name: 'Dry Chilli', min: 8000, max: 15000, category: 'Spices' },
  { name: 'Sugarcane', min: 280, max: 350, category: 'Cash Crop' },
  { name: 'Soybean', min: 4200, max: 5200, category: 'Oilseeds' },
  { name: 'Maize', min: 1800, max: 2300, category: 'Staples' },
  
  // Pulses, Oilseeds & Export Crops
  { name: 'Moong Dal', min: 6500, max: 8200, category: 'Pulses' },
  { name: 'Urad Dal', min: 6000, max: 7800, category: 'Pulses' },
  { name: 'Chana', min: 5000, max: 6200, category: 'Pulses' },
  { name: 'Toor Dal', min: 6800, max: 9000, category: 'Pulses' },
  { name: 'Masoor Dal', min: 5200, max: 6800, category: 'Pulses' },
  { name: 'Coriander', min: 6000, max: 8500, category: 'Spices' },
  { name: 'Cumin / Jeera', min: 18000, max: 28000, category: 'Spices' },
  { name: 'Garlic', min: 4500, max: 9000, category: 'Vegetables' },
  { name: 'Dry Ginger', min: 12000, max: 20000, category: 'Spices' },
  { name: 'Cotton (Raw Kapas)', min: 5200, max: 7000, category: 'Export Crop' }
];

const generateMandiPrices = () => {
  const data = {};
  
  MANDIS.forEach(mandi => {
    data[mandi.name] = COMMODITIES_CONFIG.map((cropConfig, index) => {
      // Calculate realistic random price within specified range
      const priceRange = cropConfig.max - cropConfig.min;
      const basePrice = cropConfig.min + (Math.random() * priceRange);
      
      // Add slight mandi-to-mandi variation (±5-10%)
      const variation = (Math.random() * 0.15) - 0.075; 
      const finalPrice = Math.round(basePrice * (1 + variation));
      
      const trend = Math.random() > 0.4 ? (Math.random() > 0.5 ? 'up' : 'down') : 'steady';
      const percentage = (Math.random() * 4 + 1).toFixed(1);

      return {
        id: `${mandi.id}-${index}`,
        crop: cropConfig.name,
        price: finalPrice,
        trend,
        trendPercentage: trend === 'steady' ? '0%' : `${percentage}%`,
        unit: 'Quintal',
        category: cropConfig.category,
        mandi: mandi.name,
        state: mandi.state,
        lastUpdated: 'Today'
      };
    });
  });
  
  return data;
};

export const MARKET_DATA = generateMandiPrices();

