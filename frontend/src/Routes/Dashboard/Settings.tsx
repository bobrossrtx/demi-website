import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Settings.scss';

const Settings: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  
  // Load settings from localStorage on mount
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('userSettings');
    return savedSettings ? JSON.parse(savedSettings) : {
      emailNotifications: true,
      postReplies: true,
      weeklyDigest: false,
      theme: 'dark',
      language: 'en',
    };
  });

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  // Save to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
  }, [settings]);

  // Apply theme to body
  useEffect(() => {
    document.body.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleToggle = (setting: string) => {
    setSettings((prev: any) => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof settings],
    }));
  };

  const handleSave = async () => {
    // Save appearance settings to localStorage (already done via useEffect)
    // Save notification preferences to database
    try {
      const token = localStorage.getItem('token');
      
      // Here you would make an API call to save notification preferences
      // For now, we'll just show a success message
      console.log('Saving settings:', settings);
      
      // TODO: Implement API endpoint for user preferences
      // const response = await fetch('http://localhost:8000/api/users/preferences', {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`,
      //   },
      //   body: JSON.stringify({
      //     emailNotifications: settings.emailNotifications,
      //     postReplies: settings.postReplies,
      //     weeklyDigest: settings.weeklyDigest,
      //   }),
      // });
      
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('An error occurred while saving settings');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="settings-container">
      <div className="settings-content">
        <div className="settings-header">
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            <i className="fas fa-arrow-left"></i> Back to Dashboard
          </button>
          <h1>Settings</h1>
          <p>Manage your account preferences</p>
        </div>

        <div className="settings-sections">
          {/* Notifications Section */}
          <div className="settings-section">
            <div className="section-header">
              <i className="fas fa-bell"></i>
              <h2>Notifications</h2>
            </div>
            <p className="section-description">
              Configure how you receive notifications
            </p>
            
            <div className="settings-items">
              <div className="setting-item">
                <div className="setting-info">
                  <label>Email Notifications</label>
                  <span className="setting-help">
                    Receive email notifications for important updates
                  </span>
                </div>
                <div className="toggle-wrapper">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={() => handleToggle('emailNotifications')}
                      disabled
                    />
                    <span className="slider"></span>
                  </label>
                  <span className="coming-soon-badge">Coming Soon</span>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <label>Post Replies</label>
                  <span className="setting-help">
                    Get notified when someone replies to your posts
                  </span>
                </div>
                <div className="toggle-wrapper">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.postReplies}
                      onChange={() => handleToggle('postReplies')}
                      disabled
                    />
                    <span className="slider"></span>
                  </label>
                  <span className="coming-soon-badge">Coming Soon</span>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <label>Weekly Digest</label>
                  <span className="setting-help">
                    Receive a weekly summary of community activity
                  </span>
                </div>
                <div className="toggle-wrapper">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.weeklyDigest}
                      onChange={() => handleToggle('weeklyDigest')}
                      disabled
                    />
                    <span className="slider"></span>
                  </label>
                  <span className="coming-soon-badge">Coming Soon</span>
                </div>
              </div>
            </div>
          </div>

          {/* Appearance Section */}
          <div className="settings-section">
            <div className="section-header">
              <i className="fas fa-palette"></i>
              <h2>Appearance</h2>
            </div>
            <p className="section-description">
              Customize how the site looks for you
            </p>
            
            <div className="settings-items">
              <div className="setting-item">
                <div className="setting-info">
                  <label>Theme</label>
                  <span className="setting-help">
                    Choose your preferred color scheme
                  </span>
                </div>
                <div className="theme-selector">
                  <button
                    className={`theme-button ${settings.theme === 'light' ? 'active' : ''}`}
                    onClick={() => setSettings({ ...settings, theme: 'light' })}
                  >
                    <i className="fas fa-sun"></i>
                    <span>Light</span>
                  </button>
                  <button
                    className={`theme-button ${settings.theme === 'dark' ? 'active' : ''}`}
                    onClick={() => setSettings({ ...settings, theme: 'dark' })}
                  >
                    <i className="fas fa-moon"></i>
                    <span>Dark</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Section */}
          <div className="settings-section">
            <div className="section-header">
              <i className="fas fa-shield-alt"></i>
              <h2>Privacy & Security</h2>
            </div>
            <p className="section-description">
              Manage your privacy and security settings
            </p>
            
            <div className="settings-items">
              <div className="setting-item clickable">
                <div className="setting-info">
                  <label>Change Password</label>
                  <span className="setting-help">
                    Update your account password
                  </span>
                </div>
                <i className="fas fa-chevron-right"></i>
              </div>

              <div className="setting-item clickable">
                <div className="setting-info">
                  <label>Two-Factor Authentication</label>
                  <span className="setting-help">
                    Add an extra layer of security
                  </span>
                </div>
                <i className="fas fa-chevron-right"></i>
              </div>

              <div className="setting-item clickable">
                <div className="setting-info">
                  <label>Active Sessions</label>
                  <span className="setting-help">
                    Manage devices where you're logged in
                  </span>
                </div>
                <i className="fas fa-chevron-right"></i>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="settings-section danger-zone">
            <div className="section-header">
              <i className="fas fa-exclamation-triangle"></i>
              <h2>Danger Zone</h2>
            </div>
            
            <div className="settings-items">
              <div className="setting-item clickable">
                <div className="setting-info">
                  <label>Delete Account</label>
                  <span className="setting-help">
                    Permanently delete your account and all data
                  </span>
                </div>
                <button className="danger-button">Delete</button>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-actions">
          <button className="save-button" onClick={handleSave}>
            <i className="fas fa-save"></i> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
