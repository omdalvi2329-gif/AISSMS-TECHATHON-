import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Trophy, 
  Mic, 
  Image as ImageIcon, 
  Send, 
  Star, 
  ChevronLeft, 
  CheckCircle2,
  TrendingUp,
  Award,
  Leaf,
  Sparkles,
  ShieldCheck,
  TrendingDown,
  Info,
  Heart,
  Share2,
  X
} from 'lucide-react';
import './FarmerCommunity.css';

// Rich Mock Data for AI Rankings (15+ Farmers)
const RANKINGS_DATA = {
  today: [
    { id: 101, name: "Anita Deshmukh", score: 985, stars: 5.0, encouragements: 42, trend: 'up', badge: "Organic Champion", crop: "Soybean" },
    { id: 102, name: "Ramesh Pawar", score: 942, stars: 4.9, encouragements: 38, trend: 'up', badge: "Irrigation Expert", crop: "Wheat" },
    { id: 103, name: "Suresh Patil", score: 885, stars: 4.8, encouragements: 25, trend: 'down', badge: "Village Inspiration", crop: "Tomato" },
    { id: 104, name: "Meena Kulkarni", score: 856, stars: 4.7, encouragements: 22, trend: 'up', badge: "Consistent Farmer", crop: "Cotton" },
    { id: 105, name: "Sunil Shinde", score: 820, stars: 4.6, encouragements: 19, trend: 'up', badge: "Top Performer", crop: "Onion" },
    { id: 106, name: "Vikas More", score: 795, stars: 4.5, encouragements: 15, trend: 'down', badge: "", crop: "Rice" },
    { id: 107, name: "Priya Jadhav", score: 780, stars: 4.5, encouragements: 14, trend: 'up', badge: "", crop: "Sugarcane" },
    { id: 108, name: "Amol Gite", score: 750, stars: 4.4, encouragements: 12, trend: 'up', badge: "", crop: "Wheat" },
    { id: 109, name: "Sanjay Raut", score: 720, stars: 4.3, encouragements: 10, trend: 'down', badge: "", crop: "Tomato" },
    { id: 110, name: "Kavita Shah", score: 690, stars: 4.2, encouragements: 8, trend: 'up', badge: "", crop: "Soybean" },
    { id: 111, name: "Rahul Varma", score: 650, stars: 4.0, encouragements: 7, trend: 'up', badge: "", crop: "Onion" },
    { id: 112, name: "Deepak Kale", score: 620, stars: 3.9, encouragements: 6, trend: 'down', badge: "", crop: "Rice" },
    { id: 113, name: "Jyoti Patil", score: 580, stars: 3.8, encouragements: 5, trend: 'up', badge: "", crop: "Cotton" },
    { id: 114, name: "Nitin Desai", score: 540, stars: 3.7, encouragements: 4, trend: 'up', badge: "", crop: "Sugarcane" },
    { id: 115, name: "Seema Rao", score: 510, stars: 3.5, encouragements: 3, trend: 'down', badge: "", crop: "Wheat" }
  ],
  week: [
    { id: 101, name: "Anita Deshmukh", score: 4850, stars: 5.0, encouragements: 210, trend: 'up', badge: "Organic Champion", crop: "Soybean" },
    { id: 104, name: "Meena Kulkarni", score: 4520, stars: 4.9, encouragements: 195, trend: 'up', badge: "Seed Expert", crop: "Cotton" },
    { id: 102, name: "Ramesh Pawar", score: 4300, stars: 4.9, encouragements: 180, trend: 'up', badge: "Irrigation Expert", crop: "Wheat" },
    { id: 105, name: "Sunil Shinde", score: 3900, stars: 4.7, encouragements: 150, trend: 'down', badge: "Community Leader", crop: "Onion" },
    { id: 103, name: "Suresh Patil", score: 3750, stars: 4.6, encouragements: 140, trend: 'up', badge: "Village Inspiration", crop: "Tomato" },
    { id: 106, name: "Vikas More", score: 3500, stars: 4.5, encouragements: 120, trend: 'up', badge: "", crop: "Rice" },
    { id: 107, name: "Priya Jadhav", score: 3400, stars: 4.4, encouragements: 110, trend: 'down', badge: "", crop: "Sugarcane" },
    { id: 110, name: "Kavita Shah", score: 3200, stars: 4.3, encouragements: 100, trend: 'up', badge: "", crop: "Soybean" },
  ],
  month: [
    { id: 105, name: "Sunil Shinde", score: 18500, stars: 5.0, encouragements: 840, trend: 'up', badge: "Community Leader", crop: "Onion" },
    { id: 101, name: "Anita Deshmukh", score: 17200, stars: 4.9, encouragements: 790, trend: 'up', badge: "Organic Champion", crop: "Soybean" },
    { id: 102, name: "Ramesh Pawar", score: 16800, stars: 4.9, encouragements: 750, trend: 'up', badge: "Irrigation Expert", crop: "Wheat" },
  ]
};

const INITIAL_POSTS = [
  {
    id: 1,
    name: "Ramesh Pawar",
    location: "Amman, Pune",
    activity: "Irrigation",
    crop: "Wheat",
    text: "Started early morning drip irrigation for the wheat crop. Soil moisture levels are looking optimal. The system is working efficiently.",
    timestamp: "2 hours ago",
    stars: 4.9,
    encouragements: 45,
    verifiedCount: 12,
    hasVoice: true,
    images: ["/images/1.jpg"], // Using image from public folder
    qualityBadge: "Water Efficient",
    isPremium: true,
    likes: 45,
    comments: 12,
    shares: 5,
    liked: false
  },
  {
    id: 2,
    name: "Anita Deshmukh",
    location: "Amman, Pune",
    activity: "Sowing",
    crop: "Soybean",
    text: "Completed soybean sowing today using organic seed treatment. The soil preparation was done over 3 days for maximum aeration.",
    timestamp: "5 hours ago",
    stars: 5.0,
    encouragements: 82,
    verifiedCount: 24,
    hasVoice: false,
    images: ["/images/2.avif"], // 2. Farmer in field
    qualityBadge: "Sustainable Choice",
    isPremium: true,
    likes: 45,
    comments: 12,
    shares: 5,
    liked: false
  },
  {
    id: 3,
    name: "Suresh Patil",
    location: "Amman, Pune",
    activity: "Fertilizer",
    crop: "Tomato",
    text: "Applied secondary dose of organic fertilizer. Tomatoes are showing great color and size. Monitoring for any early signs of blight.",
    timestamp: "8 hours ago",
    stars: 4.8,
    encouragements: 34,
    verifiedCount: 9,
    hasVoice: true,
    images: ["/images/3.jpg"], // 3. Farmer carrying sugarcane
    qualityBadge: "Healthy Growth",
    isPremium: false
  },
  {
    id: 4,
    name: "Sunil Shinde",
    location: "Amman, Pune",
    activity: "Pest Control",
    crop: "Onion",
    text: "Natural neem oil spray application today. Seeing good results against thrips without using harsh chemicals. Maintaining the village's organic standards.",
    timestamp: "12 hours ago",
    stars: 4.7,
    encouragements: 29,
    verifiedCount: 7,
    hasVoice: false,
    images: ["/images/4.jpg"], // 4. Hand holding onions
    qualityBadge: "Eco Friendly",
    isPremium: false
  },
  {
    id: 5,
    name: "Meena Kulkarni",
    location: "Amman, Pune",
    activity: "Growth Update",
    crop: "Cotton",
    text: "Cotton plants are now 3 feet tall! The flowering stage has begun. Everything is on schedule for a mid-season harvest.",
    timestamp: "Yesterday",
    stars: 4.9,
    encouragements: 56,
    verifiedCount: 15,
    hasVoice: true,
    images: ["/images/5.jpg"], // 5. Farmer with cotton
    qualityBadge: "High Productivity",
    isPremium: true,
    likes: 45,
    comments: 12,
    shares: 5,
    liked: false
  },
  {
    id: 6,
    name: "Vikas More",
    location: "Amman, Pune",
    activity: "Harvest Prep",
    crop: "Rice",
    text: "Preparing the threshing floor for next week's rice harvest. The grains are hardening perfectly. Looking forward to a bumper crop!",
    timestamp: "Yesterday",
    stars: 4.6,
    encouragements: 41,
    verifiedCount: 11,
    hasVoice: false,
    images: ["/images/6.webp"], // 6. Lush rice paddy
    qualityBadge: "Quality Grains",
    isPremium: false
  },
  {
    id: 7,
    name: "Priya Jadhav",
    location: "Amman, Pune",
    activity: "Irrigation",
    crop: "Sugarcane",
    text: "Secondary canal water reached our fields today. Sugarcane height is already 6 feet. Consistency in watering is key this month.",
    timestamp: "2 days ago",
    stars: 4.7,
    encouragements: 38,
    verifiedCount: 10,
    hasVoice: true,
    images: ["/images/7.jpg"], // 7. Sugarcane harvest carry
    qualityBadge: "Resource Management",
    isPremium: false
  },
  {
    id: 8,
    name: "Amol Gite",
    location: "Amman, Pune",
    activity: "Sowing",
    crop: "Wheat",
    text: "Starting the second phase of wheat sowing. Using the new seed drill for uniform spacing. This should improve yield by 15%.",
    timestamp: "2 days ago",
    stars: 4.5,
    encouragements: 27,
    verifiedCount: 6,
    hasVoice: false,
    images: ["/images/8.jpg"], // 8. Wide wheat field
    qualityBadge: "Precision Sowing",
    isPremium: false
  },
  {
    id: 9,
    name: "Sanjay Raut",
    location: "Amman, Pune",
    activity: "Fertilizer",
    crop: "Tomato",
    text: "Organic compost mix applied. We've seen a 20% increase in fruit count compared to last year. Community-sourced manure works wonders.",
    timestamp: "3 days ago",
    stars: 4.6,
    encouragements: 31,
    verifiedCount: 8,
    hasVoice: true,
    images: ["/images/9.webp"], // 9. Tomatoes in crate
    qualityBadge: "Community Practice",
    isPremium: false
  },
  {
    id: 10,
    name: "Kavita Shah",
    location: "Amman, Pune",
    activity: "Pest Control",
    crop: "Soybean",
    text: "Installing pheromone traps today. A simple but effective way to monitor pest levels without immediate chemical use.",
    timestamp: "3 days ago",
    stars: 4.8,
    encouragements: 44,
    verifiedCount: 13,
    hasVoice: false,
    images: ["/images/10.jpg"], // 10. Soybean field rows
    qualityBadge: "Smart Farming",
    isPremium: true,
    likes: 45,
    comments: 12,
    shares: 5,
    liked: false
  }
];
const ENCOURAGE_OPTIONS = [
  { id: 'practice', label: 'Good Farming Practice', emoji: '🌱', weight: 1.5 },
  { id: 'irrigation', label: 'Proper Irrigation', emoji: '💧', weight: 1.2 },
  { id: 'crop', label: 'Healthy Crop', emoji: '🌿', weight: 1.3 },
  { id: 'consistent', label: 'Consistent Farmer', emoji: '🏆', weight: 2.0 }
];

const FarmerCommunity = ({ onBack, farmerName }) => {
  const [activeTab, setActiveTab] = useState('feed'); 
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [newPostText, setNewPostText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [showEncourageSheet, setShowEncourageSheet] = useState(false);
  const [activePostId, setActivePostId] = useState(null);
  const [rankFilter, setRankFilter] = useState('today'); 
  const [encouragedPosts, setEncouragedPosts] = useState(new Set());
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentText, setCommentText] = useState('');
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'hi-IN';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setNewPostText(prev => prev + ' ' + transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = () => setIsRecording(false);
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
    if (!newPostText.trim() && selectedImages.length === 0 && !isRecording) return;

    const newPost = {
      id: Date.now(),
      name: farmerName || "Suresh Patil",
      location: "Amman, Pune",
      activity: "Update",
      crop: "Mixed",
      text: newPostText,
      timestamp: "Just now",
      stars: 4.5,
      encouragements: 0,
      verifiedCount: 0,
      hasVoice: isRecording,
      images: selectedImages.length > 0 ? ["https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=800"] : [],
      qualityBadge: "New Update",
      isPremium: true
    };

    setPosts([newPost, ...posts]);
    setNewPostText('');
    setSelectedImages([]);
    setIsRecording(false);
  };

  const handleLike = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.liked ? post.likes - 1 : post.likes + 1,
          liked: !post.liked
        };
      }
      return post;
    }));
  };

  const handleShare = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          shares: (post.shares || 0) + 1
        };
      }
      return post;
    }));
    setShowShareModal(true);
  };

  const handleCommentSubmit = (postId) => {
    if (!commentText.trim()) return;
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: (post.comments || 0) + 1
        };
      }
      return post;
    }));
    setCommentText('');
    setActiveCommentPostId(null);
  };

  const calculateImpactScore = (post) => {
    const score = ((post.likes || 0) * 2) + ((post.comments || 0) * 3) + ((post.shares || 0) * 4);
    return Math.floor(score + 450);
  };

  const handleEncourageClick = (postId) => {
    if (encouragedPosts.has(postId)) return;
    setActivePostId(postId);
    setShowEncourageSheet(true);
  };

  const submitEncourage = (option) => {
    const updatedPosts = posts.map(post => {
      if (post.id === activePostId) {
        const weight = option.weight;
        return {
          ...post,
          encouragements: post.encouragements + 1,
          stars: Math.min(5, post.stars + (weight * 0.01))
        };
      }
      return post;
    });

    setPosts(updatedPosts);
    setEncouragedPosts(new Set([...encouragedPosts, activePostId]));
    setShowEncourageSheet(false);
  };

  return (
    <div className="community-wrapper">
      <header className="community-header">
        <div className="header-top">
          <div className="header-left">
            <button className="back-btn" onClick={onBack}>
              <ChevronLeft size={24} />
            </button>
            <div className="title-section">
              <span className="brand-text">AgriSetu Community</span>
              <h1>Farmer Network</h1>
            </div>
          </div>
          <div className="header-right">
            <div className="online-badge">
              <span className="pulse-dot"></span>
              <span>124 Active Today</span>
            </div>
          </div>
        </div>
        
        <div className="header-tabs">
          <button 
            className={`tab-btn ${activeTab === 'feed' ? 'active' : ''}`}
            onClick={() => setActiveTab('feed')}
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
        {activeTab === 'feed' ? (
          <div className="feed-container">
            {/* Post Input */}
            <div className="create-post glass-card">
              <div className="user-avatar-small">
                {(farmerName?.[0] || 'S').toUpperCase()}
              </div>
              <form className="post-form" onSubmit={handlePostSubmit}>
                <textarea 
                  placeholder="Share your farm's progress..."
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                />
                <div className="post-divider"></div>
                <div className="post-actions">
                  <div className="input-options">
                    <button 
                      type="button" 
                      className={`icon-btn ${isRecording ? 'active' : ''}`}
                      onClick={handleToggleVoice}
                    >
                      <Mic size={18} />
                    </button>
                    <button 
                      type="button" 
                      className="icon-btn"
                      onClick={() => setSelectedImages(['mock'])}
                    >
                      <ImageIcon size={18} />
                    </button>
                  </div>
                  <button type="submit" className="submit-btn-premium" disabled={!newPostText.trim() && !isRecording}>
                    <Send size={16} />
                    <span>Post Update</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Posts List */}
            <div className="posts-list">
              {posts.map((post) => (
                <div key={post.id} className="post-card-premium glass-card-premium scroll-reveal">
                  <div className="post-header-premium">
                    <div className="farmer-meta">
                      <div className="avatar-circle-premium">
                        {post.name[0]}
                      </div>
                      <div className="meta-text-premium">
                        <h3>{post.name} {post.isPremium && <ShieldCheck size={14} className="verified-icon" />}</h3>
                        <p className="location-time-premium">{post.location} • {post.timestamp}</p>
                      </div>
                    </div>
                    <div className="activity-pill">{post.activity}</div>
                  </div>
                  
                  <div className="post-content-premium">
                    <div className="post-divider-thin"></div>
                    <div className="crop-tag-premium">
                      <Leaf size={12} />
                      <span>{post.crop}</span>
                    </div>
                    {post.text && <p className="post-text-premium">{post.text}</p>}
                    
                    {post.images.length > 0 && (
                      <div className="post-media-premium">
                        {post.images.map((img, i) => (
                          <div key={i} className="image-wrapper-premium">
                            <img src={img} alt="Farm Update" className="post-img-premium" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Modern Social Interaction Bar */}
                    <div className="social-interaction-bar-premium">
                      <div className="interaction-left">
                        <button 
                          className={`interaction-btn-premium like ${post.liked ? 'active' : ''}`}
                          onClick={() => handleLike(post.id)}
                        >
                          <Heart size={18} fill={post.liked ? "#ff4b4b" : "transparent"} stroke={post.liked ? "#ff4b4b" : "currentColor"} />
                          <span className="interaction-count">{post.likes}</span>
                        </button>
                        
                        <button 
                          className={`interaction-btn-premium comment ${activeCommentPostId === post.id ? 'active' : ''}`}
                          onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                        >
                          <MessageSquare size={18} />
                          <span className="interaction-count">{post.comments}</span>
                        </button>

                        <button 
                          className="interaction-btn-premium share"
                          onClick={() => handleShare(post.id)}
                        >
                          <Share2 size={18} />
                          <span className="interaction-count">{post.shares}</span>
                        </button>
                      </div>

                      <div className="interaction-right">
                        <div className="ai-impact-badge-v2" title="Calculated based on real community engagement and farming impact.">
                          <Sparkles size={12} className="sparkle-icon" />
                          <span>Impact: {calculateImpactScore(post)}</span>
                          <div className="impact-glow-v2"></div>
                        </div>
                      </div>
                    </div>

                    <div className="social-controls-premium-secondary">
                      <button 
                        className={`encourage-pill-premium ${encouragedPosts.has(post.id) ? 'active' : ''}`}
                        onClick={() => handleEncourageClick(post.id)}
                      >
                        {encouragedPosts.has(post.id) ? (
                          <><CheckCircle2 size={16} /><span>Awarded</span></>
                        ) : (
                          <><Award size={16} /><span>Encourage</span></>
                        )}
                      </button>
                    </div>

                    {/* Sliding Comment Input */}
                    {activeCommentPostId === post.id && (
                      <div className="comment-input-area-premium">
                        <input 
                          type="text" 
                          placeholder="Write a thoughtful comment..." 
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit(post.id)}
                          autoFocus
                        />
                        <button 
                          className="send-comment-btn" 
                          disabled={!commentText.trim()}
                          onClick={() => handleCommentSubmit(post.id)}
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rankings-container">
            {/* Rankings Header */}
            <div className="rankings-hero glass-card-premium">
              <div className="hero-badge">AI Verified Excellence</div>
              <h2>Community Leaders</h2>
              <p>Top performing farmers based on impact, sustainability & engagement</p>
            </div>
            <div className="ranking-filters">
              {['today', 'week', 'month'].map(filter => (
                <button 
                  key={filter}
                  className={`filter-chip ${rankFilter === filter ? 'active' : ''}`}
                  onClick={() => setRankFilter(filter)}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            <div className="leaderboard-list">
              {(RANKINGS_DATA[rankFilter] || []).map((farmer, index) => (
                <div key={farmer.id} className={`leader-card-premium glass-card ${index < 3 ? 'top-rank-card' : ''}`}>
                  <div className={`rank-display rank-${index + 1}`}>
                    {index + 1}
                  </div>
                  <div className="leader-info">
                    <div className="leader-name">
                      {farmer.name}
                      {farmer.badge && <span className="activity-badge text-[10px] py-0.5 px-1.5">{farmer.badge}</span>}
                    </div>
                    <div className="leader-stats">
                      <span className="flex items-center gap-1"><Star size={12} fill="#22c55e" className="text-green-500" /> {farmer.stars}</span>
                      <span>• Crop: {farmer.crop}</span>
                      <span>• {farmer.encouragements} Encouragements</span>
                      <span className={`trend-indicator ${farmer.trend === 'up' ? 'trend-up' : 'trend-down'}`}>
                        {farmer.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      </span>
                    </div>
                  </div>
                  <div className="score-badge-premium">
                    <div className="score-num">{farmer.score}</div>
                    <div className="score-unit">AI Score</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="ai-disclaimer">
              <Info size={14} />
              <span>Ranking is AI-generated based on daily activity & community feedback.</span>
            </div>
          </div>
        )}
      </main>

      {/* Encourage Bottom Sheet */}
      {showEncourageSheet && (
        <div className="bottom-sheet-overlay" onClick={() => setShowEncourageSheet(false)}>
          <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle"></div>
            <h2 className="sheet-title">Encourage Farmer</h2>
            <p className="sheet-subtitle">Select why this update is helpful for the village</p>
            
            <div className="encourage-options">
              {ENCOURAGE_OPTIONS.map(option => (
                <div 
                  key={option.id} 
                  className="option-card"
                  onClick={() => submitEncourage(option)}
                >
                  <span className="option-emoji">{option.emoji}</span>
                  <span className="option-label">{option.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Share Modal */}
      {showShareModal && (
        <div className="modal-overlay-premium" onClick={() => setShowShareModal(false)}>
          <div className="share-modal glass-card-premium" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Share Post</h3>
              <button className="close-modal" onClick={() => setShowShareModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="share-options-grid">
              <button className="share-option-btn" onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setShowShareModal(false);
              }}>
                <div className="share-icon-circle"><Share2 size={20} /></div>
                <span>Copy Link</span>
              </button>
              <button className="share-option-btn">
                <div className="share-icon-circle"><MessageSquare size={20} /></div>
                <span>Share Internally</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerCommunity;
