import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.scss';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h1>Dashboard</h1>
        <div className="dashboard-welcome">
          <h2>Welcome back, {user?.display_name || user?.username}!</h2>
          <p>Member since: {new Date(user?.created_at || '').toLocaleDateString()}</p>
        </div>
        
        {/* User Section */}
        <div className="dashboard-section">
          <h2 className="section-title">👤 Your Account</h2>
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3>📝 Profile</h3>
              <p>Manage your account settings and preferences</p>
              <button className="dashboard-button" onClick={() => navigate('/dashboard/profile')}>Edit Profile</button>
            </div>

            <div className="dashboard-card">
              <h3>💬 Your Posts</h3>
              <p>View and manage your forum posts</p>
              <button className="dashboard-button" onClick={() => navigate('/dashboard/posts')}>View Posts</button>
            </div>

            <div className="dashboard-card">
              <h3>📊 Activity</h3>
              <p>Track your community engagement</p>
              <button className="dashboard-button" onClick={() => navigate('/dashboard/activity')}>View Activity</button>
            </div>

            <div className="dashboard-card">
              <h3>⚙️ Settings</h3>
              <p>Configure your account preferences</p>
              <button className="dashboard-button" onClick={() => navigate('/dashboard/settings')}>Go to Settings</button>
            </div>
          </div>
        </div>

        {/* Forum Section */}
        <div className="dashboard-section">
          <h2 className="section-title">💭 Forum</h2>
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3>➕ Create Post</h3>
              <p>Share your thoughts with the community</p>
              <button className="dashboard-button" onClick={() => navigate('/forum/create-post')}>New Post</button>
            </div>

            <div className="dashboard-card">
              <h3>🗨️ Discussions</h3>
              <p>Browse and participate in forum topics</p>
              <button className="dashboard-button" onClick={() => navigate('/discussions')}>View Discussions</button>
            </div>
          </div>
        </div>

        {/* Moderation Section */}
        {(user?.role === 'admin' || user?.role === 'moderator') && (
          <div className="dashboard-section admin-section">
            <h2 className="section-title">🛡️ Moderation Tools</h2>
            <div className="dashboard-grid">
              <div className="dashboard-card admin-card">
                <h3>🔍 Moderate Posts</h3>
                <p>Review and manage user posts</p>
                <button className="dashboard-button" onClick={() => navigate('/dashboard/moderate')}>Moderate</button>
              </div>

              <div className="dashboard-card admin-card">
                <h3>🚩 Reports</h3>
                <p>Review flagged content and reports</p>
                <button className="dashboard-button">View Reports</button>
              </div>

              <div className="dashboard-card admin-card">
                <h3>📋 Audit Log</h3>
                <p>Track moderation actions</p>
                <button className="dashboard-button">View Logs</button>
              </div>
            </div>
          </div>
        )}

        {/* Admin Section */}
        {user?.role === 'admin' && (
          <div className="dashboard-section admin-section">
            <h2 className="section-title">🔐 Administration</h2>
            <div className="dashboard-grid">
              <div className="dashboard-card admin-card highlight">
                <h3>🛠️ Forum Admin Panel</h3>
                <p>Comprehensive forum management dashboard</p>
                <button className="dashboard-button" onClick={() => navigate('/dashboard/forum-admin')}>Open Admin Panel</button>
              </div>

              <div className="dashboard-card admin-card">
                <h3>👥 User Management</h3>
                <p>Manage user accounts and roles</p>
                <button className="dashboard-button">Manage Users</button>
              </div>

              <div className="dashboard-card admin-card">
                <h3>🔔 Announcements</h3>
                <p>Create site-wide announcements</p>
                <button className="dashboard-button">Manage Announcements</button>
              </div>

              <div className="dashboard-card admin-card">
                <h3>🛠️ System Tools</h3>
                <p>Database and maintenance utilities</p>
                <button className="dashboard-button">System Tools</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
