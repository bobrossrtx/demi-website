import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as forumService from '../../services/forumService';
import './Categories.scss';

const Categories: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<forumService.Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    color: '#4F46E5',
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    loadCategories();
  }, [isAuthenticated, user, navigate]);

  const loadCategories = async () => {
    try {
      const data = await forumService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await forumService.updateCategory(editingId, formData);
      } else {
        await forumService.createCategory(formData);
      }
      setShowCreateForm(false);
      setEditingId(null);
      setFormData({ name: '', slug: '', description: '', icon: '', color: '#4F46E5' });
      loadCategories();
    } catch (error) {
      console.error('Failed to save category:', error);
      alert('Failed to save category');
    }
  };

  const handleEdit = (category: forumService.Category) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
      color: category.color || '#4F46E5',
    });
    setEditingId(category.id);
    setShowCreateForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category? All posts will be affected.')) {
      return;
    }
    try {
      await forumService.deleteCategory(id);
      loadCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Failed to delete category');
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  if (loading) {
    return <div className="categories-container"><p>Loading...</p></div>;
  }

  return (
    <div className="categories-container">
      <div className="categories-header">
        <h1>Manage Categories</h1>
        <button
          className="btn-primary"
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setEditingId(null);
            setFormData({ name: '', slug: '', description: '', icon: '', color: '#4F46E5' });
          }}
        >
          {showCreateForm ? 'Cancel' : 'Create Category'}
        </button>
      </div>

      {showCreateForm && (
        <div className="category-form-card">
          <h2>{editingId ? 'Edit Category' : 'Create New Category'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) });
                }}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="slug">Slug (URL-friendly)</label>
              <input
                type="text"
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="icon">Icon (emoji or icon class)</label>
                <input
                  type="text"
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="💬"
                />
              </div>

              <div className="form-group">
                <label htmlFor="color">Color</label>
                <input
                  type="color"
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingId(null);
                  setFormData({ name: '', slug: '', description: '', icon: '', color: '#4F46E5' });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="categories-list">
        {categories.map((category) => (
          <div key={category.id} className="category-card" style={{ borderLeftColor: category.color }}>
            <div className="category-header">
              <div className="category-info">
                <span className="category-icon">{category.icon}</span>
                <div>
                  <h3>{category.name}</h3>
                  <p className="category-slug">/{category.slug}</p>
                </div>
              </div>
              <div className="category-stats">
                <span className="post-count">{category.post_count} posts</span>
              </div>
            </div>
            
            {category.description && (
              <p className="category-description">{category.description}</p>
            )}
            
            <div className="category-actions">
              <button onClick={() => handleEdit(category)} className="btn-edit">
                Edit
              </button>
              <button onClick={() => handleDelete(category.id)} className="btn-delete">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
