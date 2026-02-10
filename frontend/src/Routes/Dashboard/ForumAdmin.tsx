import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import * as forumService from '../../services/forumService';
import { Category, PostWithDetails } from '../../services/forumService';
import './ForumAdmin.scss';

interface ForumStats {
  totalPosts: number;
  totalComments: number;
  totalCategories: number;
  totalUsers: number;
  postsToday: number;
  commentsToday: number;
  activeUsers: number;
}

const ForumAdmin: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'posts' | 'users' | 'analytics'>('overview');
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', slug: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<ForumStats>({
    totalPosts: 0,
    totalComments: 0,
    totalCategories: 0,
    totalUsers: 0,
    postsToday: 0,
    commentsToday: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [isAuthenticated, user, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesData, postsResponse] = await Promise.all([
        forumService.getCategories(),
        forumService.getPosts(),
      ]);
      setCategories(categoriesData);
      setPosts(postsResponse.items);
      calculateStats(postsResponse.items, categoriesData);
    } catch (error) {
      console.error('Failed to load forum data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (posts: PostWithDetails[], categories: Category[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const postsToday = posts.filter(p => new Date(p.created_at) >= today).length;
    const totalComments = posts.reduce((sum, p) => sum + p.comment_count, 0);
    
    setStats({
      totalPosts: posts.length,
      totalComments,
      totalCategories: categories.length,
      totalUsers: 0, // Would need a separate endpoint
      postsToday,
      commentsToday: 0, // Would need a separate endpoint
      activeUsers: 0, // Would need a separate endpoint
    });
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forumService.createCategory(categoryForm);
      setShowCategoryModal(false);
      setCategoryForm({ name: '', description: '', slug: '' });
      loadData();
    } catch (error: any) {
      console.error('Failed to create category:', error);
      const errorMessage = error.response?.data?.error 
        || error.response?.statusText 
        || error.message 
        || 'Unknown error';
      const statusCode = error.response?.status || 'N/A';
      alert(`Failed to create category\n\nStatus: ${statusCode}\nError: ${errorMessage}\n\nCheck if you're logged in as admin and try logging out/in again.`);
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    
    try {
      await forumService.updateCategory(editingCategory.id, categoryForm);
      setShowCategoryModal(false);
      setEditingCategory(null);
      setCategoryForm({ name: '', description: '', slug: '' });
      loadData();
    } catch (error: any) {
      console.error('Failed to update category:', error);
      const errorMessage = error.response?.data?.error 
        || error.response?.statusText 
        || error.message 
        || 'Unknown error';
      const statusCode = error.response?.status || 'N/A';
      alert(`Failed to update category\n\nStatus: ${statusCode}\nError: ${errorMessage}`);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category? All posts in this category will be affected.')) {
      return;
    }
    
    try {
      await forumService.deleteCategory(id);
      loadData();
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      const errorMessage = error.response?.data?.error 
        || error.response?.statusText 
        || error.message 
        || 'Unknown error';
      const statusCode = error.response?.status || 'N/A';
      alert(`Failed to delete category\n\nStatus: ${statusCode}\nError: ${errorMessage}`);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }
    
    try {
      await forumService.deletePost(postId);
      loadData();
    } catch (error: any) {
      console.error('Failed to delete post:', error);
      const errorMessage = error.response?.data?.error 
        || error.response?.statusText 
        || error.message 
        || 'Unknown error';
      const statusCode = error.response?.status || 'N/A';
      alert(`Failed to delete post\n\nStatus: ${statusCode}\nError: ${errorMessage}`);
    }
  };

  const openEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      slug: category.slug,
    });
    setShowCategoryModal(true);
  };

  const openCreateCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', description: '', slug: '' });
    setShowCategoryModal(true);
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="forum-admin-container">
        <div className="loading">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="forum-admin-container">
      <div className="admin-header">
        <h1>🛠️ Forum Administration</h1>
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`tab ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          📁 Categories
        </button>
        <button
          className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          📝 Posts
        </button>
        <button
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📈 Analytics
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="admin-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-info">
                <h3>{stats.totalPosts}</h3>
                <p>Total Posts</p>
                <span className="stat-badge">+{stats.postsToday} today</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💬</div>
              <div className="stat-info">
                <h3>{stats.totalComments}</h3>
                <p>Total Comments</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📁</div>
              <div className="stat-info">
                <h3>{stats.totalCategories}</h3>
                <p>Categories</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <h3>{stats.totalUsers || 'N/A'}</h3>
                <p>Total Users</p>
              </div>
            </div>
          </div>

          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="actions-grid">
              <button className="action-card" onClick={() => navigate('/forum/create-post')}>
                <span className="action-icon">➕</span>
                <span>Create Post</span>
              </button>
              <button className="action-card" onClick={() => setActiveTab('categories')}>
                <span className="action-icon">📁</span>
                <span>Manage Categories</span>
              </button>
              <button className="action-card" onClick={() => navigate('/dashboard/moderate')}>
                <span className="action-icon">🛡️</span>
                <span>Moderate Posts</span>
              </button>
              <button className="action-card" onClick={() => setActiveTab('analytics')}>
                <span className="action-icon">📊</span>
                <span>View Analytics</span>
              </button>
            </div>
          </div>

          <div className="recent-activity">
            <h2>Recent Posts</h2>
            <div className="activity-list">
              {posts.slice(0, 5).map(post => (
                <div key={post.id} className="activity-item">
                  <div className="activity-content">
                    <h4>{post.title}</h4>
                    <p>By {post.author_display_name || post.author_username} • {new Date(post.created_at).toLocaleDateString()}</p>
                  </div>
                  <button
                    className="view-button"
                    onClick={() => navigate(`/forum/post/${post.id}`)}
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="admin-content">
          <div className="content-header">
            <h2>📁 Manage Categories</h2>
            <button className="primary-button" onClick={openCreateCategory}>
              ➕ Create Category
            </button>
          </div>

          <div className="categories-list">
            {categories.map(category => (
              <div key={category.id} className="category-item">
                <div className="category-info">
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                  <span className="category-slug">Slug: {category.slug}</span>
                </div>
                <div className="category-actions">
                  <button
                    className="edit-button"
                    onClick={() => openEditCategory(category)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div className="admin-content">
          <div className="content-header">
            <h2>📝 Manage Posts</h2>
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="posts-table">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>Created</th>
                  <th>Stats</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map(post => (
                  <tr key={post.id}>
                    <td>
                      <div className="post-title">
                        {post.title}
                        {post.is_pinned && <span className="badge pinned">📌 Pinned</span>}
                        {post.is_locked && <span className="badge locked">🔒 Locked</span>}
                      </div>
                    </td>
                    <td>{post.author_display_name || post.author_username}</td>
                    <td>{post.category_name}</td>
                    <td>{new Date(post.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="post-stats">
                        <span>👍 {post.upvote_count}</span>
                        <span>💬 {post.comment_count}</span>
                        <span>👁 {post.view_count}</span>
                      </div>
                    </td>
                    <td>
                      <div className="post-actions">
                        <button
                          className="view-button"
                          onClick={() => navigate(`/forum/post/${post.id}`)}
                        >
                          View
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="admin-content">
          <h2>📈 Forum Analytics</h2>
          
          <div className="analytics-grid">
            <div className="analytics-card">
              <h3>Post Activity</h3>
              <div className="chart-placeholder">
                <p>📊 Posts per day chart would go here</p>
                <p className="chart-info">Total posts: {stats.totalPosts}</p>
                <p className="chart-info">Today: {stats.postsToday}</p>
              </div>
            </div>

            <div className="analytics-card">
              <h3>Category Distribution</h3>
              <div className="category-stats">
                {categories.map(category => {
                  const categoryPosts = posts.filter(p => p.category_id === category.id);
                  return (
                    <div key={category.id} className="category-stat">
                      <span>{category.name}</span>
                      <div className="stat-bar">
                        <div
                          className="stat-fill"
                          style={{ width: `${(categoryPosts.length / posts.length) * 100}%` }}
                        ></div>
                      </div>
                      <span>{categoryPosts.length} posts</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="analytics-card">
              <h3>Top Contributors</h3>
              <div className="chart-placeholder">
                <p>👥 User leaderboard would go here</p>
                <p className="chart-info">Requires user endpoint</p>
              </div>
            </div>

            <div className="analytics-card">
              <h3>Engagement Metrics</h3>
              <div className="metrics-list">
                <div className="metric-item">
                  <span>Average Comments per Post</span>
                  <strong>{posts.length > 0 ? (stats.totalComments / posts.length).toFixed(1) : 0}</strong>
                </div>
                <div className="metric-item">
                  <span>Total Upvotes</span>
                  <strong>{posts.reduce((sum, p) => sum + p.upvote_count, 0)}</strong>
                </div>
                <div className="metric-item">
                  <span>Total Views</span>
                  <strong>{posts.reduce((sum, p) => sum + p.view_count, 0)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingCategory ? 'Edit Category' : 'Create Category'}</h2>
            <form onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Slug (URL-friendly name)</label>
                <input
                  type="text"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  required
                  placeholder="e.g., general-discussion"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={() => setShowCategoryModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumAdmin;
