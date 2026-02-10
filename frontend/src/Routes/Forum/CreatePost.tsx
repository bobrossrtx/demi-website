import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as forumService from '../../services/forumService';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './CreatePost.scss';

const CreatePost: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<forumService.Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category_id: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadCategories();
  }, [isAuthenticated, navigate]);

  const loadCategories = async () => {
    try {
      const data = await forumService.getCategories();
      setCategories(data);
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, category_id: data[0].id }));
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }
    if (!formData.content.trim()) {
      alert('Please enter content');
      return;
    }
    if (!formData.category_id) {
      alert('Please select a category');
      return;
    }

    setLoading(true);
    try {
      const post = await forumService.createPost(formData);
      navigate(`/forum/post/${post.id}`);
    } catch (error: any) {
      console.error('Failed to create post:', error);
      alert(error.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove),
    });
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'blockquote', 'code-block',
    'list', 'bullet', 'indent',
    'link', 'image'
  ];

  if (categories.length === 0) {
    return (
      <div className="create-post-container">
        <div className="no-categories">
          <h2>No Categories Available</h2>
          <p>Please ask an administrator to create forum categories first.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="create-post-container">
      <div className="create-post-header">
        <h1>Create New Post</h1>
        <button onClick={() => navigate('/discussions')} className="btn-secondary">
          Cancel
        </button>
      </div>

      <div className="editor-note">
        <strong>💡 Tip:</strong> Use the rich text toolbar below to format your post. Use the formatting buttons (B for bold, I for italic, etc.) instead of pasting HTML code!
      </div>

      <form onSubmit={handleSubmit} className="create-post-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="What's your question or topic?"
            maxLength={255}
            required
          />
          <span className="char-count">{formData.title.length}/255</span>
        </div>

        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            required
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="content">Content *</label>
          <ReactQuill
            theme="snow"
            value={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
            modules={modules}
            formats={formats}
            placeholder="Write your post content here... You can use rich text formatting!"
          />
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags (up to 5)</label>
          <div className="tag-input-wrapper">
            <input
              type="text"
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Add a tag and press Enter"
              disabled={formData.tags.length >= 5}
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="btn-add-tag"
              disabled={formData.tags.length >= 5}
            >
              Add
            </button>
          </div>
          <div className="tags-list">
            {formData.tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="tag-remove"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Post'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/discussions')}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>

      <div className="post-tips">
        <h3>📝 Tips for a great post</h3>
        <ul>
          <li>Be specific and clear in your title</li>
          <li>Use proper formatting to make your post readable</li>
          <li>Add relevant tags to help others find your post</li>
          <li>Be respectful and follow community guidelines</li>
        </ul>
      </div>
    </div>
  );
};

export default CreatePost;
