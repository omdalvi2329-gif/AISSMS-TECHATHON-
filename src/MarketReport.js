import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3, Download, Share2, Filter, Loader2, FileText, Calendar, MapPin, Sprout } from 'lucide-react';
import { supabase } from './supabaseClient';
import './MarketPrice.css';

const MOCK_REPORTS = [
  {
    id: 'mock-r1',
    title: 'Post-Harvest Price Outlook: Wheat',
    crop_name: 'Wheat',
    price_trend: 'Up',
    region: 'Maharashtra',
    report_data: {
      summary: 'Wheat prices are expected to rise by 5-8% due to steady demand and controlled arrivals in mandis.',
      key_points: ['Low moisture content in fresh arrivals', 'Strong demand from South Indian millers', 'Inventory levels at 3-year lows']
    },
    created_at: new Date().toISOString()
  },
  {
    id: 'mock-r2',
    title: 'Tomato Market Glut Alert',
    crop_name: 'Tomato',
    price_trend: 'Down',
    region: 'Maharashtra',
    report_data: {
      summary: 'Heavy arrivals from Nashik and surrounding regions have led to a temporary price correction.',
      key_points: ['Daily arrivals exceeded 50,000 crates', 'Limited shelf life during high temperatures', 'Export demand remained sluggish']
    },
    created_at: new Date().toISOString()
  },
  {
    id: 'mock-r3',
    title: 'Soybean Export Demand Spike',
    crop_name: 'Soybean',
    price_trend: 'Up',
    region: 'Maharashtra',
    report_data: {
      summary: 'International demand for non-GMO soybean meal is driving local prices upwards.',
      key_points: ['New export orders from South East Asia', 'Crushing plants operating at 90% capacity', 'Farmer holding patterns observed']
    },
    created_at: new Date().toISOString()
  },
  {
    id: 'mock-r4',
    title: 'Cotton Quality Premium Analysis',
    crop_name: 'Cotton',
    price_trend: 'Up',
    region: 'Maharashtra',
    report_data: {
      summary: 'Superior long-staple cotton is fetching record premiums in the current market cycle.',
      key_points: ['Textile mills seeking quality fiber', 'Global production shortages reported', 'Local ginning yields are excellent']
    },
    created_at: new Date().toISOString()
  },
  {
    id: 'mock-r5',
    title: 'Onion Storage Advice & Price Trend',
    crop_name: 'Onion',
    price_trend: 'Down',
    region: 'Maharashtra',
    report_data: {
      summary: 'Price stability expected as stored rabi stocks enter the market in volume.',
      key_points: ['Good quality stored stocks available', 'Nafed procurement continues to support base price', 'Export curbs impacting top-end prices']
    },
    created_at: new Date().toISOString()
  }
];

const MarketReport = ({ onBack, t }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('market_reports')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        if (data && data.length > 0) {
          setReports(data);
        } else {
          setReports(MOCK_REPORTS);
        }
      } catch (err) {
        console.warn('Error fetching market reports, using mocks:', err.message);
        setReports(MOCK_REPORTS);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const filteredReports = filter === 'All' 
    ? reports 
    : reports.filter(r => r.region === filter || r.crop_name === filter);

  const regions = ['All', ...new Set(reports.map(r => r.region))];

  if (loading) {
    return (
      <div className="reports-loading">
        <Loader2 className="animate-spin text-green-500" size={48} />
        <p>Loading Market Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="market-reports-page">
      <header className="reports-header">
        <button className="back-btn" onClick={onBack}><ArrowLeft size={24} /></button>
        <h1>Market Intelligence Reports</h1>
      </header>

      <div className="reports-controls">
        <div className="filter-scroll">
          {regions.map(r => (
            <button 
              key={r} 
              className={`filter-pill ${filter === r ? 'active' : ''}`}
              onClick={() => setFilter(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="reports-grid">
        {filteredReports.length > 0 ? (
          filteredReports.map(report => (
            <div key={report.id} className="report-card" onClick={() => setSelectedReport(report)}>
              <div className="report-card-header">
                <span className="crop-badge">{report.crop_name}</span>
                <span className={`trend-badge ${report.price_trend === 'Up' ? 'trend-up' : 'trend-down'}`}>
                  {report.price_trend === 'Up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {report.price_trend}
                </span>
              </div>
              <h3>{report.title}</h3>
              <div className="report-meta">
                <span><MapPin size={14} /> {report.region}</span>
                <span><Calendar size={14} /> {new Date(report.created_at).toLocaleDateString()}</span>
              </div>
              <button className="view-report-btn">View Detailed Analysis</button>
            </div>
          ))
        ) : (
          <div className="no-reports">
            <FileText size={48} />
            <p>No reports found for the selected filter.</p>
          </div>
        )}
      </div>

      {selectedReport && (
        <div className="report-modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="report-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedReport.title}</h2>
              <button className="close-modal" onClick={() => setSelectedReport(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-summary">
                <div className="summary-item">
                  <label>Crop</label>
                  <strong>{selectedReport.crop_name}</strong>
                </div>
                <div className="summary-item">
                  <label>Region</label>
                  <strong>{selectedReport.region}</strong>
                </div>
                <div className="summary-item">
                  <label>Trend</label>
                  <strong className={selectedReport.price_trend === 'Up' ? 'text-green-500' : 'text-red-500'}>
                    {selectedReport.price_trend}
                  </strong>
                </div>
              </div>

              <div className="report-data-content">
                <h3>Analysis & Insights</h3>
                <p>{selectedReport.report_data?.summary || 'Detailed analysis not available.'}</p>
                
                {selectedReport.report_data?.key_points && (
                  <ul className="key-points">
                    {selectedReport.report_data.key_points.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="modal-actions">
                <button className="download-btn"><Download size={18} /> Download PDF</button>
                <button className="share-btn"><Share2 size={18} /> Share</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketReport;
