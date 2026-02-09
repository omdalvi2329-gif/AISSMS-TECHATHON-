import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  MessageSquare, 
  Trophy, 
  Mic, 
  Image as ImageIcon, 
  Send, 
  Star, 
  ChevronLeft, 
  MoreVertical,
  Camera,
  Award,
  TrendingUp,
  Clock,
  CheckCircle2,
  Lightbulb
} from 'lucide-react';
import './FarmerCommunity.css';

const INITIAL_POSTS = [
  {
    id: 1,
    name: "Ramesh Pawar",
    village: "Amman, Pune",
    type: "Irrigation",
    text: "Wheat field watering started today. Water levels are good.",
    timestamp: "2 hours ago",
    stars: 5,
    likes: 12,
    hasVoice: true
  },
  {
    id: 2,
    name: "Suresh Patil",
    village: "Amman, Pune",
    type: "Fertilizer",
    text: "Applied organic fertilizer to Tomato crop. Progress looks healthy.",
    timestamp: "5 hours ago",
    stars: 4,
    likes: 8,
    hasVoice: false
  },
  {
    id: 3,
    name: "Anita Deshmukh",
    village: "Amman, Pune",
    type: "Sowing",
    text: "Completed Soybean sowing for the 5-acre block.",
    timestamp: "Yesterday",
    stars: 5,
    likes: 24,
    hasVoice: true
  }
];

const RANKINGS = [
  { rank: 1, name: "Anita Deshmukh", crop: "Soybean", score: 98, stars: 5, insight: "Consistent irrigation & healthy crop growth observed" },
  { rank: 2, name: "Ramesh Pawar", crop: "Wheat", score: 92, stars: 5, insight: "Excellent daily updates and timely watering" },
  { rank: 3, name: "Sunil Shinde", crop: "Onion", score: 85, stars: 4, insight: "Good progress, keep monitoring for pests" },
  { rank: 4, name: "Suresh Patil", crop: "Tomato", score: 78, stars: 4, insight: "Regular activity, crop stage looks optimal" },
  { rank: 5, name: "Meena Kulkarni", crop: "Cotton", score: 72, stars: 3, insight: "Increase update frequency for better ranking" }
];

const FarmerCommunity = ({ onBack, farmerName }) => {
  const [activeTab, setActiveTab] = useState('home'); // 'home' or 'rankings'
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [newPostText, setNewPostText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'hi-IN'; // Default to Hindi

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setNewPostText(prev => prev + ' ' + transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const handleToggleVoice = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!newPostText.trim() && !showImagePreview) return;

    const newPost = {
      id: posts.length + 1,
      name: farmerName || "You",
      village: "Amman, Pune",
      type: "Update",
      text: newPostText,
      timestamp: "Just now",
      stars: 4,
      likes: 0,
      hasVoice: isRecording
    };

    setPosts([newPost, ...posts]);
    setNewPostText('');
    setShowImagePreview(false);
  };

  return (
    <div className="community-wrapper">
      <header className="community-header">
        <div className="header-left">
          <button className="back-btn" onClick={onBack}>
            <ChevronLeft size={24} />
          </button>
          <div className="title-section">
            <Users className="header-icon" />
            <h1>Farmer Community</h1>
          </div>
        </div>
        <div className="header-tabs">
          <button 
            className={`tab-btn ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <MessageSquare size={18} />
            <span>Updates Feed</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'rankings' ? 'active' : ''}`}
            onClick={() => setActiveTab('rankings')}
          >
            <Trophy size={18} />
            <span>AI Rankings</span>
          </button>
        </div>
      </header>

      <main className="community-main">
        {activeTab === 'home' ? (
          <div className="feed-container">
            {/* Create Post Section */}
            <div className="create-post glass-card">
              <div className="user-avatar">
                {(farmerName?.[0] || 'Y').toUpperCase()}
              </div>
              <form className="post-form" onSubmit={handlePostSubmit}>
                <textarea 
                  placeholder="Aaj aapki kheti me kya naya hai? (What's new in your farm today?)"
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                />
                <div className="post-actions">
                  <div className="action-btns">
                    <button 
                      type="button" 
                      className={`action-btn ${isRecording ? 'recording' : ''}`}
                      onClick={handleToggleVoice}
                      title="Voice Input"
                    >
                      <Mic size={20} />
                      {isRecording && <span className="pulse"></span>}
                    </button>
                    <button 
                      type="button" 
                      className="action-btn"
                      onClick={() => setShowImagePreview(!showImagePreview)}
                      title="Add Photo"
                    >
                      <Camera size={20} />
                    </button>
                  </div>
                  <button type="submit" className="submit-btn" disabled={!newPostText.trim()}>
                    <Send size={18} />
                    <span>Post Update</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Posts List */}
            <div className="posts-list">
              {posts.map((post) => (
                <div key={post.id} className="post-card glass-card fade-in">
                  <div className="post-header">
                    <div className="farmer-info">
                      <div className="avatar">{(post.name?.[0] || 'F').toUpperCase()}</div>
                      <div className="info-text">
                        <h3>{post.name}</h3>
                        <p>📍 {post.village} • <Clock size={12} /> {post.timestamp}</p>
                      </div>
                    </div>
                    <div className="post-tag">{post.type}</div>
                  </div>
                  <div className="post-body">
                    {post.text && <p>{post.text}</p>}
                    {post.hasVoice && (
                      <div className="voice-tag">
                        <Mic size={14} />
                        <span>Voice Update Added</span>
                      </div>
                    )}
                  </div>
                  <div className="post-footer">
                    <div className="post-stats">
                      <div className="stat-item">
                        <Star size={16} className="star-icon" />
                        <span>{post.stars} Stars</span>
                      </div>
                      <div className="stat-item">
                        <CheckCircle2 size={16} className="check-icon" />
                        <span>{post.likes} Verified</span>
                      </div>
                    </div>
                    <button className="interact-btn">
                      <Award size={18} />
                      <span>Encourage</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rankings-container">
            <div className="ranking-header glass-card">
              <TrendingUp className="trending-icon" />
              <div className="header-text">
                <h2>AI Village Leaderboard</h2>
                <p>Top performers in Amman village based on farming activity and crop progress.</p>
              </div>
            </div>

            <div className="leaderboard">
              {RANKINGS.map((farmer, index) => (
                <div key={farmer.rank} className={`ranking-card glass-card fade-in delay-${index}`}>
                  <div className="rank-number">
                    {farmer.rank === 1 ? '🥇' : farmer.rank === 2 ? '🥈' : farmer.rank === 3 ? '🥉' : `#${farmer.rank}`}
                  </div>
                  <div className="farmer-details">
                    <div className="name-crop">
                      <h3>{farmer.name}</h3>
                      <p>Crop: <strong>{farmer.crop}</strong></p>
                    </div>
                    <div className="star-rating">
                      {Array(5).fill(0).map((_, i) => (
                        <Star 
                          key={i} 
                          size={16} 
                          fill={i < farmer.stars ? "#22c55e" : "transparent"} 
                          color={i < farmer.stars ? "#22c55e" : "#2d362d"} 
                        />
                      ))}
                    </div>
                  </div>
                  <div className="score-section">
                    <div className="score-val">{farmer.score}%</div>
                    <div className="score-label">AI Score</div>
                  </div>
                  <div className="ai-insight">
                    <Lightbulb size={14} />
                    <span>{farmer.insight}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FarmerCommunity;
