import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { notificationApi } from '../api/notificationApi';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import './NotificationBell.css';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await notificationApi.getUnreadCount();
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch unread count', error);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationApi.getNotifications(0, 10);
      setNotifications(data.content || []);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Polling every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Fetch full list when opening dropdown
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      try {
        await notificationApi.markAsRead(notif.id);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
      } catch (error) {
        console.error('Failed to mark as read', error);
      }
    }
    setIsOpen(false);
    if (notif.trackingNumber) {
      navigate(`/tracking/${notif.trackingNumber}`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button 
        className="bell-button" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="bell-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="mark-all-btn">
                <CheckCheck size={16} /> Mark all read
              </button>
            )}
          </div>

          <div className="dropdown-body">
            {loading && notifications.length === 0 ? (
              <div className="notif-loading">
                <Loader2 className="spinner" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="notif-empty">No notifications yet</div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`notif-item ${!notif.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="notif-content">
                    <p className="notif-title">{notif.title}</p>
                    <p className="notif-message">{notif.message}</p>
                    <span className="notif-time">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  {!notif.read && <div className="unread-dot" />}
                </div>
              ))
            )}
          </div>
          
          <div className="dropdown-footer">
             <button onClick={() => { setIsOpen(false); navigate('/profile'); }}>View All</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(NotificationBell);
