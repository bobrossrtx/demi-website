import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Profile.scss';

const Profile: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    display_name: user?.display_name || '',
    bio: user?.bio || '',
    avatar_url: user?.avatar_url || '',
    hide_username: user?.hide_username || false,
  });

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  React.useEffect(() => {
    // Update form data when user data changes
    if (user) {
      setFormData({
        username: user.username || '',
        display_name: user.display_name || '',
        bio: user.bio || '',
        avatar_url: user.avatar_url || '',
        hide_username: user.hide_username || false,
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: formData.username || null,
          display_name: formData.display_name || null,
          bio: formData.bio || null,
          avatar_url: formData.avatar_url || null,
          hide_username: formData.hide_username,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        console.log('Profile updated successfully:', updatedUser);
        
        // Update localStorage with the new user data
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setIsEditing(false);
        alert('Profile updated successfully!');
        
        // Reload page to refresh all user data across the app
        window.location.reload();
      } else {
        const error = await response.json();
        console.error('Failed to update profile:', error);
        alert('Failed to update profile: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Network error: Could not connect to server. Please check your connection.');
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-content">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="profile-header">
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            <i className="fas fa-arrow-left"></i> Back to Dashboard
          </button>
          <h1>Profile Settings</h1>
        </div>

        <div className="profile-main">
          <div className="profile-sidebar">
            <div className="profile-avatar">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.username} />
              ) : (
                <div className="avatar-placeholder">
                  <i className="fas fa-user"></i>
                </div>
              )}
              <button className="change-avatar-btn">
                <i className="fas fa-camera"></i> Change Avatar
              </button>
            </div>
            
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-label">Member Since</span>
                <span className="stat-value">{new Date(user?.created_at || '').toLocaleDateString()}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Role</span>
                <span className="stat-value">{user?.role}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Status</span>
                <span className="stat-value active">Active</span>
              </div>
            </div>
          </div>

          <div className="profile-form-section">
            <div className="form-actions">
              <h2>Personal Information</h2>
              {!isEditing ? (
                <button className="edit-button" onClick={() => setIsEditing(true)}>
                  <i className="fas fa-edit"></i> Edit
                </button>
              ) : (
                <button className="cancel-button" onClick={() => setIsEditing(false)}>
                  <i className="fas fa-times"></i> Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={!isEditing ? 'disabled-input' : ''}
                  placeholder="Your unique username"
                />
                <small>Choose a unique username for your account</small>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="hide_username"
                    checked={formData.hide_username}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                  <span style={{ marginLeft: '8px' }}>Hide username (display name will be shown instead)</span>
                </label>
                <small>When enabled, others will see your display name instead of your username</small>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="disabled-input"
                />
                <small>Contact support to change your email</small>
              </div>

              <div className="form-group">
                <label>Display Name</label>
                <input
                  type="text"
                  name="display_name"
                  value={formData.display_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Your display name"
                />
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>Avatar URL</label>
                <input
                  type="url"
                  name="avatar_url"
                  value={formData.avatar_url}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              {isEditing && (
                <div className="form-actions-bottom">
                  <button type="submit" className="save-button">
                    <i className="fas fa-save"></i> Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
