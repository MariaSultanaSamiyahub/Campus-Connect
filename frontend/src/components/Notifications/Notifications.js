import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Trash2, Mail } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

const styles = {
  container: {
    position: 'fixed',
    top: '80px',
    right: '20px',
    width: '380px',
    maxHeight: '600px',
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    padding: '1rem',
    borderBottom: '2px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  badge: {
    backgroundColor: '#ef4444',
    color: 'white',
    borderRadius: '9999px',
    padding: '0.125rem 0.5rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    marginLeft: '0.5rem'
  },
  body: {
    overflowY: 'auto',
    flex: 1,
    maxHeight: '500px'
  },
  notificationItem: {
    padding: '1rem',
    borderBottom: '1px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  notificationItemUnread: {
    backgroundColor: '#eff6ff',
    borderLeft: '4px solid #2563eb'
  },
  notificationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.5rem'
  },
  notificationTitle: {
    fontWeight: '600',
    fontSize: '0.875rem',
    color: '#1f2937',
    flex: 1
  },
  notificationTime: {
    fontSize: '0.75rem',
    color: '#6b7280',
    marginLeft: '0.5rem'
  },
  notificationMessage: {
    fontSize: '0.875rem',
    color: '#4b5563',
    lineHeight: '1.5',
    marginBottom: '0.5rem'
  },
  notificationActions: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem'
  },
  actionButton: {
    padding: '0.25rem 0.5rem',
    border: 'none',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem'
  },
  emptyState: {
    padding: '3rem 1rem',
    textAlign: 'center',
    color: '#6b7280'
  },
  footer: {
    padding: '0.75rem',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  footerButton: {
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600'
  },
  markAllReadBtn: {
    backgroundColor: '#2563eb',
    color: 'white'
  },
  closeBtn: {
    backgroundColor: '#d1d5db',
    color: '#1f2937'
  }
};

export default function Notifications({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/notifications?limit=20`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
    setLoading(false);
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`${API_BASE}/notifications/unread-count`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        fetchNotifications();
        fetchUnreadCount();
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        fetchNotifications();
        fetchUnreadCount();
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    try {
      const response = await fetch(`${API_BASE}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        fetchNotifications();
        fetchUnreadCount();
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'normal': return '#2563eb';
      default: return '#6b7280';
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>
          <Bell size={20} />
          Notifications
          {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={20} />
        </button>
      </div>

      <div style={styles.body}>
        {loading ? (
          <div style={styles.emptyState}>⏳ Loading...</div>
        ) : notifications.length === 0 ? (
          <div style={styles.emptyState}>
            <Bell size={48} color="#d1d5db" style={{ marginBottom: '1rem' }} />
            <p>No notifications</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.notification_id}
              style={{
                ...styles.notificationItem,
                ...(!notification.is_read ? styles.notificationItemUnread : {})
              }}
              onClick={() => !notification.is_read && markAsRead(notification.notification_id)}
            >
              <div style={styles.notificationHeader}>
                <div style={styles.notificationTitle}>
                  {notification.title}
                  {notification.priority === 'urgent' && (
                    <span style={{ color: getPriorityColor(notification.priority), marginLeft: '0.5rem' }}>🔔</span>
                  )}
                </div>
                <span style={styles.notificationTime}>{formatTime(notification.created_at)}</span>
              </div>
              <div style={styles.notificationMessage}>{notification.message}</div>
              {notification.is_emailed && (
                <div style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Mail size={12} /> Email sent
                </div>
              )}
              <div style={styles.notificationActions}>
                {!notification.is_read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification.notification_id);
                    }}
                    style={{ ...styles.actionButton, backgroundColor: '#dbeafe', color: '#1e40af' }}
                  >
                    <Check size={14} /> Mark read
                  </button>
                )}
                <button
                  onClick={(e) => deleteNotification(notification.notification_id, e)}
                  style={{ ...styles.actionButton, backgroundColor: '#fee2e2', color: '#991b1b' }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {notifications.length > 0 && unreadCount > 0 && (
        <div style={styles.footer}>
          <button onClick={markAllAsRead} style={{ ...styles.footerButton, ...styles.markAllReadBtn }}>
            Mark all as read
          </button>
          <button onClick={onClose} style={{ ...styles.footerButton, ...styles.closeBtn }}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}

