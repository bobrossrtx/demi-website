import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as forumService from '../../services/forumService';
import './ManagePosts.scss';

const ManagePosts: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<forumService.PostWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadPosts();
  }, [isAuthenticated, navigate]);

  const loadPosts = async () => {
    try {
      const data = await forumService.getPosts();
      setPosts(data.items);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }
    try {
      await forumService.deletePost(id);
      loadPosts();
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post');
    }
  };

  const handlePin = async (post: forumService.PostWithDetails) => {
    try {
      if (post.is_pinned) {
        await forumService.unpinPost(post.id);
      } else {
        await forumService.pinPost(post.id);
      }
      loadPosts();
    } catch (error) {
      console.error('Failed to toggle pin:', error);
      alert('Failed to toggle pin. You may not have permission.');
    }
  };

  const handleLock = async (post: forumService.PostWithDetails) => {
    try {
      if (post.is_locked) {
        await forumService.unlockPost(post.id);
      } else {
        await forumService.lockPost(post.id);
      }
      loadPosts();
    } catch (error) {
      console.error('Failed to toggle lock:', error);
      alert('Failed to toggle lock. You may not have permission.');
    }
  };

  const canModerate = user?.role === 'admin' || user?.role === 'moderator';

  if (loading) {
    return <div className="manage-posts-container"><p>Loading...</p></div>;
  }

  return (
    <div className="manage-posts-container">
      <div className="posts-header">
        <h1>Forum Posts</h1>
        <button className="btn-primary" onClick={() => navigate('/forum/create-post')}>
          Create New Post
        </button>
      </div>

      <div className="posts-list">
        {posts.length === 0 ? (
          <div className="no-posts">
            <p>No posts found. Be the first to create one!</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <div className="post-info">
                  {post.is_pinned && <span className="badge pinned">📌 Pinned</span>}
                  {post.is_locked && <span className="badge locked">🔒 Locked</span>}
                  <h3 onClick={() => navigate(`/forum/post/${post.id}`)}>{post.title}</h3>
                  <div className="post-meta">
                    <span className="category">{post.category_name}</span>
                    <span className="separator">•</span>
                    <span className="author">by {post.author_username}</span>
                    <span className="separator">•</span>
                    <span className="date">{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="post-stats">
                  <div className="stat">
                    <span className="icon">👍</span>
                    <span>{post.upvote_count}</span>
                  </div>
                  <div className="stat">
                    <span className="icon">💬</span>
                    <span>{post.comment_count}</span>
                  </div>
                  <div className="stat">
                    <span className="icon">👁</span>
                    <span>{post.view_count}</span>
                  </div>
                </div>
              </div>

              <div className="post-actions">
                {(post.author_id === user?.id || canModerate) && (
                  <>
                    {post.author_id === user?.id && (
                      <button onClick={() => navigate(`/forum/edit-post/${post.id}`)} className="btn-edit">
                        Edit
                      </button>
                    )}
                    {canModerate && (
                      <>
                        <button onClick={() => handlePin(post)} className="btn-secondary">
                          {post.is_pinned ? 'Unpin' : 'Pin'}
                        </button>
                        <button onClick={() => handleLock(post)} className="btn-secondary">
                          {post.is_locked ? 'Unlock' : 'Lock'}
                        </button>
                      </>
                    )}
                    <button onClick={() => handleDelete(post.id)} className="btn-delete">
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManagePosts;
