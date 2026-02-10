import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as forumService from '../../services/forumService';
import './Discussions.scss';

const Discussions: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<forumService.Category[]>([]);
  const [posts, setPosts] = useState<forumService.PostWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
    loadPosts();
  }, []);

  useEffect(() => {
    loadPosts();
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const data = await forumService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await forumService.getPosts();
      let filteredPosts = data.items;
      
      if (selectedCategory !== 'all') {
        filteredPosts = filteredPosts.filter(post => post.category_id === selectedCategory);
      }

      setPosts(filteredPosts);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const allCategoriesOption = {
    id: 'all',
    name: 'All Discussions',
    slug: 'all',
    icon: '💬',
    post_count: posts.length,
    description: null,
    color: null,
    created_at: '',
    updated_at: '',
    created_by: null,
  };
  return (
    <div className="discussions-container">
      <div className="discussions-content">
        <div className="discussions-header">
          <h1>Discussions</h1>
          <p>Join the conversation and connect with the Demi community</p>
          {isAuthenticated ? (
            <button 
              className="new-discussion-button"
              onClick={() => navigate('/forum/create-post')}
            >
              ➕ New Discussion
            </button>
          ) : (
            <button 
              className="login-prompt-button"
              onClick={() => navigate('/login')}
            >
              🔐 Login to Post
            </button>
          )}
        </div>

        <div className="discussions-layout">
          <aside className="discussions-sidebar">
            <h3>Categories</h3>
            <ul className="category-list">
              <li 
                className={selectedCategory === 'all' ? 'active' : ''}
                onClick={() => setSelectedCategory('all')}
              >
                <span className="category-icon">{allCategoriesOption.icon}</span>
                <span className="category-name">{allCategoriesOption.name}</span>
                <span className="category-count">{posts.length}</span>
              </li>
              {categories.map(category => (
                <li 
                  key={category.id}
                  className={selectedCategory === category.id ? 'active' : ''}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <span className="category-icon">{category.icon || '📁'}</span>
                  <span className="category-name">{category.name}</span>
                  <span className="category-count">{category.post_count}</span>
                </li>
              ))}
            </ul>
            {categories.length === 0 && !loading && (
              <div className="no-categories">
                <p>No categories yet. Ask an admin to create some!</p>
              </div>
            )}
          </aside>

          <main className="discussions-main">
            {loading ? (
              <div className="loading">Loading discussions...</div>
            ) : posts.length === 0 ? (
              <div className="no-discussions">
                <h3>No discussions yet</h3>
                <p>Be the first to start a discussion!</p>
                {isAuthenticated && (
                  <button 
                    className="new-discussion-button"
                    onClick={() => navigate('/forum/create-post')}
                  >
                    ➕ Create First Post
                  </button>
                )}
              </div>
            ) : (
              <div className="discussions-list">
                {posts.map(post => (
                  <div 
                    key={post.id} 
                    className={`discussion-item ${post.is_pinned ? 'pinned' : ''}`}
                    onClick={() => navigate(`/forum/post/${post.id}`)}
                  >
                    {post.is_pinned && (
                      <div className="pinned-badge">
                        📌 Pinned
                      </div>
                    )}
                    {post.is_locked && (
                      <div className="locked-badge">
                        🔒 Locked
                      </div>
                    )}
                    <div className="discussion-content">
                      <h3 className="discussion-title">{post.title}</h3>
                      <div className="discussion-meta">
                        <span className="discussion-author">
                          👤 {post.author_display_name || post.author_username}
                        </span>
                        <span className="discussion-category">
                          📁 {post.category_name}
                        </span>
                      </div>
                    </div>
                    <div className="discussion-stats">
                      <div className="stat">
                        <span className="stat-icon">👍</span>
                        <span>{post.upvote_count}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-icon">💬</span>
                        <span>{post.comment_count}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-icon">👁</span>
                        <span>{post.view_count}</span>
                      </div>
                      <div className="stat last-activity">
                        <span className="stat-icon">🕐</span>
                        <span>{formatDate(post.last_activity_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Discussions;
