import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { 
  MessageSquare, 
  Trophy, 
  Mic, 
  Send, 
  Star, 
  ChevronLeft, 
  Leaf, 
  Sparkles, 
  ShieldCheck, 
  Heart, 
  Share2,
  Image as ImageIcon
} from 'lucide-react';
import './FarmerCommunity.css';

const ENCOURAGE_OPTIONS = [
  { id: 'practice', label: 'Good Farming Practice', emoji: '🌱', weight: 1.5 },
  { id: 'irrigation', label: 'Proper Irrigation', emoji: '💧', weight: 1.2 },
  { id: 'crop', label: 'Healthy Crop', emoji: '🌿', weight: 1.3 },
  { id: 'consistent', label: 'Consistent Farmer', emoji: '🏆', weight: 2.0 }
];

const RANKINGS_DATA = {
  today: [
    { id: 101, name: "Anita Deshmukh", score: 985, stars: 5.0, encouragements: 45, trend: 'up', badge: "Organic Champion", crop: "Soybean" },
    { id: 102, name: "Ramesh Pawar", score: 942, stars: 4.9, encouragements: 38, trend: 'up', badge: "Irrigation Expert", crop: "Wheat" },
    { id: 103, name: "Suresh Patil", score: 885, stars: 4.8, encouragements: 25, trend: 'down', badge: "Village Inspiration", crop: "Tomato" },
    { id: 104, name: "Sunil Shinde", score: 850, stars: 4.7, encouragements: 22, trend: 'up', badge: "Pest Expert", crop: "Onion" },
    { id: 105, name: "Meena Kulkarni", score: 820, stars: 4.6, encouragements: 20, trend: 'up', badge: "Growth Guru", crop: "Cotton" },
    { id: 106, name: "Vikas More", score: 790, stars: 4.5, encouragements: 18, trend: 'down', badge: "Rice Master", crop: "Rice" },
    { id: 107, name: "Priya Jadhav", score: 765, stars: 4.4, encouragements: 15, trend: 'up', badge: "Water Wise", crop: "Sugarcane" },
    { id: 108, name: "Amol Gite", score: 740, stars: 4.3, encouragements: 12, trend: 'up', badge: "Newcomer", crop: "Wheat" },
    { id: 109, name: "Sanjay Raut", score: 715, stars: 4.2, encouragements: 10, trend: 'down', badge: "Hardworker", crop: "Tomato" },
    { id: 110, name: "Kavita Shah", score: 690, stars: 4.1, encouragements: 8, trend: 'up', badge: "Monitoring Ace", crop: "Soybean" }
  ],
  week: [
    { id: 101, name: "Anita Deshmukh", score: 4850, stars: 5.0, encouragements: 210, trend: 'up', badge: "Organic Champion", crop: "Soybean" },
    { id: 102, name: "Ramesh Pawar", score: 4620, stars: 4.9, encouragements: 195, trend: 'up', badge: "Irrigation Expert", crop: "Wheat" },
    { id: 105, name: "Meena Kulkarni", score: 4400, stars: 4.8, encouragements: 180, trend: 'up', badge: "Growth Guru", crop: "Cotton" },
    { id: 103, name: "Suresh Patil", score: 4250, stars: 4.7, encouragements: 165, trend: 'down', badge: "Village Inspiration", crop: "Tomato" },
    { id: 104, name: "Sunil Shinde", score: 4100, stars: 4.7, encouragements: 150, trend: 'up', badge: "Pest Expert", crop: "Onion" },
    { id: 110, name: "Kavita Shah", score: 3950, stars: 4.6, encouragements: 140, trend: 'up', badge: "Monitoring Ace", crop: "Soybean" },
    { id: 106, name: "Vikas More", score: 3800, stars: 4.5, encouragements: 130, trend: 'down', badge: "Rice Master", crop: "Rice" },
    { id: 107, name: "Priya Jadhav", score: 3650, stars: 4.4, encouragements: 120, trend: 'up', badge: "Water Wise", crop: "Sugarcane" },
    { id: 108, name: "Amol Gite", score: 3500, stars: 4.3, encouragements: 110, trend: 'up', badge: "Newcomer", crop: "Wheat" },
    { id: 109, name: "Sanjay Raut", score: 3350, stars: 4.2, encouragements: 100, trend: 'down', badge: "Hardworker", crop: "Tomato" }
  ],
  month: [
    { id: 105, name: "Meena Kulkarni", score: 19200, stars: 5.0, encouragements: 920, trend: 'up', badge: "Growth Guru", crop: "Cotton" },
    { id: 101, name: "Anita Deshmukh", score: 18500, stars: 5.0, encouragements: 840, trend: 'up', badge: "Organic Champion", crop: "Soybean" },
    { id: 104, name: "Sunil Shinde", score: 17800, stars: 4.9, encouragements: 790, trend: 'up', badge: "Pest Expert", crop: "Onion" },
    { id: 102, name: "Ramesh Pawar", score: 17100, stars: 4.9, encouragements: 750, trend: 'up', badge: "Irrigation Expert", crop: "Wheat" },
    { id: 110, name: "Kavita Shah", score: 16400, stars: 4.8, encouragements: 710, trend: 'up', badge: "Monitoring Ace", crop: "Soybean" },
    { id: 103, name: "Suresh Patil", score: 15700, stars: 4.7, encouragements: 680, trend: 'down', badge: "Village Inspiration", crop: "Tomato" },
    { id: 106, name: "Vikas More", score: 15000, stars: 4.6, encouragements: 650, trend: 'down', badge: "Rice Master", crop: "Rice" },
    { id: 107, name: "Priya Jadhav", score: 14300, stars: 4.5, encouragements: 620, trend: 'up', badge: "Water Wise", crop: "Sugarcane" },
    { id: 108, name: "Amol Gite", score: 13600, stars: 4.4, encouragements: 590, trend: 'up', badge: "Newcomer", crop: "Wheat" },
    { id: 109, name: "Sanjay Raut", score: 12900, stars: 4.3, encouragements: 560, trend: 'down', badge: "Hardworker", crop: "Tomato" }
  ]
};

const INITIAL_MOCK_POSTS = [
  {
    id: 'mock-1',
    name: "Ramesh Pawar",
    location: "Amman, Pune",
    activity: "Irrigation",
    crop: "Wheat",
    text: "Started early morning drip irrigation for the wheat crop. Soil moisture levels are looking optimal.",
    timestamp: "2 hours ago",
    images: ["/images/1.jpg"],
    likes: 45,
    comments: 12,
    shares: 5,
    liked: false,
    isPremium: true
  },
  {
    id: 'mock-2',
    name: "Anita Deshmukh",
    location: "Amman, Pune",
    activity: "Sowing",
    crop: "Soybean",
    text: "Completed soybean sowing today using organic seed treatment. Soil preparation was excellent.",
    timestamp: "5 hours ago",
    images: ["/images/2.avif"],
    likes: 82,
    comments: 24,
    shares: 8,
    liked: false,
    isPremium: true
  },
  {
    id: 'mock-3',
    name: "Suresh Patil",
    location: "Amman, Pune",
    activity: "Fertilizer",
    crop: "Tomato",
    text: "Applied secondary dose of organic fertilizer. Tomatoes are showing great color.",
    timestamp: "8 hours ago",
    images: ["/images/3.jpg"],
    likes: 34,
    comments: 9,
    shares: 2,
    liked: false,
    isPremium: false
  },
  {
    id: 'mock-4',
    name: "Sunil Shinde",
    location: "Amman, Pune",
    activity: "Pest Control",
    crop: "Onion",
    text: "Natural neem oil spray application today. Seeing good results against thrips.",
    timestamp: "12 hours ago",
    images: ["/images/4.jpg"],
    likes: 29,
    comments: 7,
    shares: 3,
    liked: false,
    isPremium: false
  },
  {
    id: 'mock-5',
    name: "Meena Kulkarni",
    location: "Amman, Pune",
    activity: "Growth Update",
    crop: "Cotton",
    text: "Cotton plants are now 3 feet tall! Flowering stage has begun.",
    timestamp: "Yesterday",
    images: ["/images/5.jpg"],
    likes: 56,
    comments: 15,
    shares: 6,
    liked: false,
    isPremium: true
  },
  {
    id: 'mock-6',
    name: "Vikas More",
    location: "Amman, Pune",
    activity: "Harvest Prep",
    crop: "Rice",
    text: "Preparing the threshing floor for next week's rice harvest. Grains are hardening perfectly.",
    timestamp: "Yesterday",
    images: ["/images/6.webp"],
    likes: 41,
    comments: 11,
    shares: 4,
    liked: false,
    isPremium: false
  },
  {
    id: 'mock-7',
    name: "Priya Jadhav",
    location: "Amman, Pune",
    activity: "Irrigation",
    crop: "Sugarcane",
    text: "Secondary canal water reached our fields today. Sugarcane height is already 6 feet.",
    timestamp: "2 days ago",
    images: ["/images/7.jpg"],
    likes: 38,
    comments: 10,
    shares: 3,
    liked: false,
    isPremium: false
  },
  {
    id: 'mock-8',
    name: "Amol Gite",
    location: "Amman, Pune",
    activity: "Sowing",
    crop: "Wheat",
    text: "Starting second phase of wheat sowing. Using new seed drill for uniform spacing.",
    timestamp: "2 days ago",
    images: ["/images/8.jpg"],
    likes: 27,
    comments: 6,
    shares: 1,
    liked: false,
    isPremium: false
  },
  {
    id: 'mock-9',
    name: "Sanjay Raut",
    location: "Amman, Pune",
    activity: "Fertilizer",
    crop: "Tomato",
    text: "Organic compost mix applied. Seeing 20% increase in fruit count.",
    timestamp: "3 days ago",
    images: ["/images/9.webp"],
    likes: 31,
    comments: 8,
    shares: 2,
    liked: false,
    isPremium: false
  },
  {
    id: 'mock-10',
    name: "Kavita Shah",
    location: "Amman, Pune",
    activity: "Pest Control",
    crop: "Soybean",
    text: "Installing pheromone traps today. Effective way to monitor pest levels.",
    timestamp: "3 days ago",
    images: ["/images/10.jpg"],
    likes: 44,
    comments: 13,
    shares: 5,
    liked: false,
    isPremium: true
  }
];

const FarmerCommunity = ({ onBack, farmerName }) => {
  const [activeTab, setActiveTab] = useState('feed'); 
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostText, setNewPostText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showEncourageSheet, setShowEncourageSheet] = useState(false);
  const [activePostId, setActivePostId] = useState(null);
  const [rankFilter, setRankFilter] = useState('today');
  const [encouragedPosts, setEncouragedPosts] = useState(new Set());
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentText, setCommentText] = useState('');

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          user_profiles!inner (full_name, village),
          likes (user_id),
          comments (id, comment_text, user_id, created_at),
          shares (user_id)
        `)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      const { data: { user } } = await supabase.auth.getUser();
      
      const formattedPosts = postsData.map(post => ({
        id: post.id,
        name: post.user_profiles?.full_name || 'Unknown Farmer',
        location: post.user_profiles?.village || 'Unknown',
        activity: 'Update', 
        crop: 'General', 
        text: post.content,
        timestamp: new Date(post.created_at).toLocaleString(),
        images: post.image_url ? [post.image_url] : [],
        likes: post.likes?.length || 0,
        comments: post.comments?.length || 0,
        shares: post.shares?.length || 0,
        liked: post.likes?.some(l => l.user_id === user?.id),
        user_id: post.user_id,
        isPremium: true
      }));

      // Merge with mock posts to ensure there are always 10+ posts
      setPosts([...formattedPosts, ...INITIAL_MOCK_POSTS]);
    } catch (err) {
      console.warn('Supabase fetch failed, showing mock posts only:', err.message);
      setPosts(INITIAL_MOCK_POSTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    
    const channel = supabase
      .channel('public:posts_realtime')
      .on('postgres_changes', { event: '*', table: 'posts' }, fetchPosts)
      .on('postgres_changes', { event: '*', table: 'likes' }, fetchPosts)
      .on('postgres_changes', { event: '*', table: 'comments' }, fetchPosts)
      .on('postgres_changes', { event: '*', table: 'shares' }, fetchPosts)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handlePostSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!newPostText.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('posts').insert([{
        user_id: user.id,
        content: newPostText,
        image_url: null 
      }]);

      if (error) throw error;
      setNewPostText('');
      setIsRecording(false);
    } catch (err) {
      alert("Error posting: " + err.message);
    }
  };

  const handleLike = async (postId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Please login to like posts");
        return;
      }

      const post = posts.find(p => p.id === postId);
      if (!post) return;

      // Optimistic Update
      const isMockPost = postId.toString().startsWith('mock-');
      setPosts(prevPosts => prevPosts.map(p => {
        if (p.id === postId) {
          const newLiked = !p.liked;
          return {
            ...p,
            liked: newLiked,
            likes: newLiked ? (p.likes + 1) : Math.max(0, p.likes - 1)
          };
        }
        return p;
      }));

      if (isMockPost) return;

      if (post.liked) {
        await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', user.id);
      } else {
        await supabase.from('likes').insert([{ post_id: postId, user_id: user.id }]);
      }
    } catch (err) {
      console.error('Error liking post:', err);
      // Revert on error could be added here
    }
  };

  const handleCommentSubmit = async (postId) => {
    if (!commentText.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('comments').insert([{
        post_id: postId,
        user_id: user.id,
        comment_text: commentText
      }]);

      if (error) throw error;
      setCommentText('');
      setActiveCommentPostId(null);
    } catch (err) {
      alert("Error commenting: " + err.message);
    }
  };

  const handleShare = async (postId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('shares').insert([{ post_id: postId, user_id: user.id }]);
      alert("Shared successfully!");
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const calculateImpactScore = (post) => {
    const score = ((post.likes || 0) * 2) + ((post.comments || 0) * 3) + ((post.shares || 0) * 4);
    return Math.floor(score + 450);
  };

  const submitEncourage = (option) => {
    setEncouragedPosts(new Set([...encouragedPosts, activePostId]));
    setShowEncourageSheet(false);
  };

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
          <button className={`tab-btn ${activeTab === 'feed' ? 'active' : ''}`} onClick={() => setActiveTab('feed')}>
            <MessageSquare size={18} />
            <span>Updates Feed</span>
          </button>
          <button className={`tab-btn ${activeTab === 'rankings' ? 'active' : ''}`} onClick={() => setActiveTab('rankings')}>
            <Trophy size={18} />
            <span>AI Rankings</span>
          </button>
        </div>
      </header>

      <main className="community-main">
        {activeTab === 'feed' ? (
          <div className="feed-container">
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
                    <button type="button" className={`icon-btn ${isRecording ? 'active' : ''}`} onClick={handleToggleVoice}>
                      <Mic size={18} />
                    </button>
                    <button type="button" className="icon-btn">
                      <ImageIcon size={18} />
                    </button>
                  </div>
                  <button type="submit" className="submit-btn-premium" disabled={!newPostText.trim()}>
                    <Send size={16} />
                    <span>Post Update</span>
                  </button>
                </div>
              </form>
            </div>

            <div className="posts-list">
              {loading ? (
                <div className="loading-state">Loading posts...</div>
              ) : posts.map((post) => (
                <div key={post.id} className="post-card-premium glass-card-premium scroll-reveal">
                  <div className="post-header-premium">
                    <div className="farmer-meta">
                      <div className="avatar-circle-premium">{post.name[0]}</div>
                      <div className="meta-text-premium">
                        <h3>{post.name} {post.isPremium && <ShieldCheck size={14} className="verified-icon" />}</h3>
                        <p className="location-time-premium">{post.location} • {post.timestamp}</p>
                      </div>
                    </div>
                    <div className="activity-pill">{post.activity}</div>
                  </div>
                  
                  <div className="post-content-premium">
                    <div className="post-divider-thin"></div>
                    <div className="crop-tag-premium"><Leaf size={12} /><span>{post.crop}</span></div>
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

                    <div className="social-interaction-bar-premium">
                      <div className="interaction-left">
                        <button className={`interaction-btn-premium like ${post.liked ? 'active' : ''}`} onClick={() => handleLike(post.id)}>
                          <Heart size={18} fill={post.liked ? "#ff4b4b" : "transparent"} stroke={post.liked ? "#ff4b4b" : "currentColor"} />
                          <span className="interaction-count">{post.likes}</span>
                        </button>
                        
                        <button className={`interaction-btn-premium comment ${activeCommentPostId === post.id ? 'active' : ''}`} onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}>
                          <MessageSquare size={18} />
                          <span className="interaction-count">{post.comments}</span>
                        </button>

                        <button 
                          className={`interaction-btn-premium share`} 
                          onClick={() => handleShare(post.id)}
                        >
                          <Share2 size={18} />
                        </button>
                        <div className="social-controls-premium-secondary">
                          <button 
                            className={`encourage-pill-premium ${encouragedPosts.has(post.id) ? 'active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!encouragedPosts.has(post.id)) {
                                setActivePostId(post.id);
                                setShowEncourageSheet(true);
                              }
                            }}
                          >
                            {encouragedPosts.has(post.id) ? (
                              <span>Awarded</span>
                            ) : (
                              <span>Encourage</span>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="interaction-right">
                        <div className="ai-impact-badge-v2">
                          <Sparkles size={12} className="sparkle-icon" />
                          <span>Impact: {calculateImpactScore(post)}</span>
                        </div>
                      </div>
                    </div>

                    {activeCommentPostId === post.id && (
                      <div className="comment-input-area-premium">
                        <input 
                          type="text" 
                          placeholder="Write a comment..." 
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit(post.id)}
                          autoFocus
                        />
                        <button className="send-comment-btn" disabled={!commentText.trim()} onClick={() => handleCommentSubmit(post.id)}>
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
            <div className="rankings-hero glass-card-premium">
              <div className="hero-badge">AI Verified Excellence</div>
              <h2>Community Leaders</h2>
              <p>Top performing farmers based on impact & sustainability</p>
            </div>
            <div className="ranking-filters">
              {['today', 'week', 'month'].map(filter => (
                <button key={filter} className={`filter-chip ${rankFilter === filter ? 'active' : ''}`} onClick={() => setRankFilter(filter)}>
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            <div className="leaderboard-list">
              {(RANKINGS_DATA[rankFilter] || []).map((farmer, index) => (
                <div key={farmer.id} className={`leader-card-premium glass-card ${index < 3 ? 'top-rank-card' : ''}`}>
                  <div className={`rank-display rank-${index + 1}`}>{index + 1}</div>
                  <div className="leader-info">
                    <div className="leader-name">
                      {farmer.name}
                      {farmer.badge && <span className="activity-badge">{farmer.badge}</span>}
                    </div>
                    <div className="leader-stats">
                      <span className="flex items-center gap-1"><Star size={12} fill="#22c55e" className="text-green-500" /> {farmer.stars}</span>
                      <span>• Crop: {farmer.crop}</span>
                    </div>
                  </div>
                  <div className="score-badge-premium">
                    <div className="score-num">{farmer.score}</div>
                    <div className="score-unit">AI Score</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {showEncourageSheet && (
        <div className="bottom-sheet-overlay" onClick={() => setShowEncourageSheet(false)}>
          <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle"></div>
            <h2 className="sheet-title">Encourage Farmer</h2>
            <div className="encourage-options">
              {ENCOURAGE_OPTIONS.map(option => (
                <div key={option.id} className="option-card" onClick={() => submitEncourage(option)}>
                  <span className="option-emoji">{option.emoji}</span>
                  <span className="option-label">{option.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerCommunity;
