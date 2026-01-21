import React, { useState, useEffect } from 'react';
import './Notification.scss';

interface NotificationProps {
  id: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  message: string;
  icon?: string;
  persistent?: boolean; // If true, uses localStorage for permanent close
}

export default function Notification({ 
  id, 
  type = 'info', 
  title,
  message, 
  icon,
  persistent = false 
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (persistent) {
      const isClosed = localStorage.getItem(`notification-${id}-closed`);
      if (isClosed === 'true') {
        setIsVisible(false);
      }
    }
  }, [id, persistent]);

  const handleClose = () => {
    setIsVisible(false);
    if (persistent) {
      localStorage.setItem(`notification-${id}-closed`, 'true');
    }
  };

  if (!isVisible) return null;

  const getIcon = () => {
    if (icon) return icon;
    switch (type) {
      case 'warning': return 'fa-exclamation-triangle';
      case 'error': return 'fa-times-circle';
      case 'success': return 'fa-check-circle';
      default: return 'fa-info-circle';
    }
  };

  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-content">
        <i className={`fas ${getIcon()} notification-icon`}></i>
        <div className="notification-text">
          {title && <strong className="notification-title">{title}</strong>}
          <div className="notification-message">{message}</div>
        </div>
      </div>
      <button 
        className="notification-close" 
        onClick={handleClose}
        aria-label="Close notification"
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
}
