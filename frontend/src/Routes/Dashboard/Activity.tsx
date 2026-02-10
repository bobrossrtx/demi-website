import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as forumService from '../../services/forumService';
import './Activity.scss';

interface Activity {
  id: string;
  type: 'account_created' | 'post' | 'comment' | 'edit' | 'vote' | 'bookmark';
  action: string;
  title?: string;
  postId?: string;
  timestamp: string;
  icon: string;
  color: string;
}

const Activity: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadActivities();
    }
  }, [isAuthenticated, user]);

  const loadActivities = async () => {
    try {
      setLoadingActivities(true);
      const activityList: Activity[] = [];

      // Add account creation
      if (user?.created_at) {
        activityList.push({
          id: 'account-created',
          type: 'account_created',
          action: 'Account created',
          timestamp: new Date(user.created_at).toISOString(),
          icon: 'fa-user-plus',
          color: '#10b981',
        });
      }

      // Fetch user's posts
      const postsResponse = await forumService.getPosts();
      const userPosts = postsResponse.items.filter(p => p.author_id === user?.id);

      userPosts.forEach(post => {
        activityList.push({
          id: `post-${post.id}`,
          type: 'post',
          action: 'Created a post',
          title: post.title,
          postId: post.id,
          timestamp: post.created_at,
          icon: 'fa-plus-circle',
          color: '#3b82f6',
        });
      });

      // Fetch user's comments (this would need a new endpoint)
      // For now, we'll just show posts

      // Sort by timestamp (newest first)
      activityList.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(activityList);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  const handleActivityClick = (activity: Activity) => {
    if (activity.postId) {
      navigate(`/forum/post/${activity.postId}`);
    }
  };

  if (loading || loadingActivities) {
    return (
      <div className="activity-container">
        <div className="activity-content">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-container">
      <div className="activity-content">
        <div className="activity-header">
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            <i className="fas fa-arrow-left"></i> Back to Dashboard
          </button>
          <h1>Activity</h1>
          <p>Track your recent activity and engagement</p>
        </div>

        <div className="activity-filters">
          <button className="filter-button active">All Activity</button>
          <button className="filter-button">Posts</button>
          <button className="filter-button">Replies</button>
          <button className="filter-button">Edits</button>
        </div>

        <div className="activity-timeline">
          {activities.map(activity => (
            <div 
              key={activity.id} 
              className={`activity-item ${activity.postId ? 'clickable' : ''}`}
              onClick={() => handleActivityClick(activity)}
            >
              <div className="activity-icon" style={{ background: activity.color }}>
                <i className={`fas ${activity.icon}`}></i>
              </div>
              <div className="activity-details">
                <div className="activity-action">
                  {activity.action}
                  {activity.title && (
                    <>
                      {' '}
                      <span className="activity-title">"{activity.title}"</span>
                    </>
                  )}
                </div>
                <div className="activity-timestamp">
                  <i className="fas fa-clock"></i> {formatTimestamp(activity.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {activities.length === 0 && (
          <div className="no-activity">
            <i className="fas fa-history"></i>
            <p>No recent activity</p>
            <button className="action-button" onClick={() => navigate('/discussions')}>
              <i className="fas fa-comments"></i> Start Engaging
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Activity;
