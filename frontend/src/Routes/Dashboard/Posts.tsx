import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as forumService from '../../services/forumService';
import './Posts.scss';

const Posts: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<forumService.PostWithDetails[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserPosts();
    }
  }, [isAuthenticated, user]);

  const loadUserPosts = async () => {
    try {
      const data = await forumService.getPosts();
      // Filter to show only user's posts
      const userPosts = data.items.filter(post => post.author_id === user?.id);
      setPosts(userPosts);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }
    try {
      await forumService.deletePost(id);
      loadUserPosts();
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post');
    }
  };

  if (loading || loadingPosts) {
    return (
      <div className="posts-container">
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const totalReplies = posts.reduce((sum, p) => sum + p.comment_count, 0);
  const totalViews = posts.reduce((sum, p) => sum + p.view_count, 0);
  const totalUpvotes = posts.reduce((sum, p) => sum + p.upvote_count, 0);

  return (
    <div className="posts-container">
      <div className="posts-content">
        <div className="posts-header">
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
          <h1>Your Posts</h1>
          <p>View and manage all your forum posts</p>
          <button 
            className="new-post-button"
            onClick={() => navigate('/forum/create-post')}
          >
            ➕ New Post
          </button>
        </div>

        <div className="posts-stats">
          <div className="stat-card">
            <div className="stat-icon">💬</div>
            <div className="stat-info">
              <span className="stat-label">Total Posts</span>
              <span className="stat-value">{posts.length}</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-info">
              <span className="stat-label">Total Replies</span>
              <span className="stat-value">{totalReplies}</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">👁</div>
            <div className="stat-info">
              <span className="stat-label">Total Views</span>
              <span className="stat-value">{totalViews}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👍</div>
            <div className="stat-info">
              <span className="stat-label">Total Upvotes</span>
              <span className="stat-value">{totalUpvotes}</span>
            </div>
          </div>
        </div>

        <div className="posts-list">
          <div className="posts-list-header">
            <h2>Your Posts</h2>
          </div>

          {posts.length > 0 ? (
            <div className="posts-table">
              {posts.map(post => (
                <div key={post.id} className="post-row">
                  <div className="post-main">
                    <h3 
                      className="post-title"
                      onClick={() => navigate(`/forum/post/${post.id}`)}
                    >
                      {post.title}
                    </h3>
                    <div className="post-meta">
                      <span className="post-category">
                        📁 {post.category_name}
                      </span>
                      <span className="post-date">
                        📅 {new Date(post.created_at).toLocaleDateString()}
                      </span>
                      {post.is_pinned && (
                        <span className="post-status pinned">
                          📌 Pinned
                        </span>
                      )}
                      {post.is_locked && (
                        <span className="post-status locked">
                          🔒 Locked
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="post-stats">
                    <div className="post-stat">
                      <span className="stat-icon">👍</span>
                      <span>{post.upvote_count}</span>
                    </div>
                    <div className="post-stat">
                      <span className="stat-icon">💬</span>
                      <span>{post.comment_count}</span>
                    </div>
                    <div className="post-stat">
                      <span className="stat-icon">👁</span>
                      <span>{post.view_count}</span>
                    </div>
                  </div>
                  
                  <div className="post-actions">
                    <button 
                      className="action-button view"
                      onClick={() => navigate(`/forum/post/${post.id}`)}
                      title="View post"
                    >
                      👁
                    </button>
                    <button 
                      className="action-button delete"
                      onClick={() => handleDelete(post.id)}
                      title="Delete post"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-posts">
              <p>💬 You haven't created any posts yet</p>
              <button 
                className="new-post-button"
                onClick={() => navigate('/forum/create-post')}
              >
                ➕ Create Your First Post
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Posts;
