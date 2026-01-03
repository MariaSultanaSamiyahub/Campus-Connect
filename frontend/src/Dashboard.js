import React, { useState, useEffect } from 'react';
import { 
  Home, Bell, Flag, Users, ShoppingBag, Calendar, Package, 
  TrendingUp, MapPin, Eye, MessageSquare, CheckCircle, XCircle, 
  Search, LogOut 
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

// --- NEW STYLES (Matches your Top Bar) ---
const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f3f4f6' },
  navbar: { 
    backgroundColor: '#ffffff', 
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
    position: 'sticky', 
    top: 0, 
    zIndex: 40, 
    padding: '1rem 2rem' 
  },
  navContent: { 
    maxWidth: '1280px', 
    margin: '0 auto', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  navBrand: { fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' },
  navButtons: { display: 'flex', gap: '1rem', alignItems: 'center' },

  // --- NEW BUTTON STYLES ---
  navButton: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '0.5rem', 
    padding: '0.5rem 1rem', 
    borderRadius: '0.375rem', 
    border: 'none', 
    cursor: 'pointer', 
    fontSize: '0.95rem', 
    fontWeight: '600',
    transition: 'all 0.2s',
    color: 'white' // Default text for active
  },
  // Specific Colors
  btnDashboard: { backgroundColor: '#2563eb' }, // Blue
  btnNotifications: { backgroundColor: '#f59e0b' }, // Amber
  btnModeration: { backgroundColor: '#ef4444' }, // Red
  btnInactive: { backgroundColor: 'transparent', color: '#6b7280' }, // Gray text for inactive

  pageContent: { padding: '2rem 1rem' },
  pageContainer: { maxWidth: '1280px', margin: '0 auto' },
  pageTitle: { fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: '#1f2937' },
  
  statsGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
    gap: '1.5rem', 
    marginBottom: '2rem' 
  },
  statCard: { 
    backgroundColor: 'white', 
    borderRadius: '0.5rem', 
    padding: '1.5rem', 
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb'
  },
  statLabel: { fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: '500' },
  statValue: { fontSize: '2.25rem', fontWeight: 'bold', color: '#111827' },
  
  card: { 
    backgroundColor: 'white', 
    borderRadius: '0.5rem', 
    padding: '1.5rem', 
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)', 
    marginBottom: '1.5rem',
    border: '1px solid #e5e7eb'
  },
  cardTitle: { 
    fontSize: '1.25rem', 
    fontWeight: 'bold', 
    marginBottom: '1rem', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '0.5rem' 
  },
  notificationItem: { 
    padding: '1rem', 
    borderBottom: '1px solid #f3f4f6', 
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  notificationItemUnread: { backgroundColor: '#eff6ff' },
  
  badge: { padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600' },
  badgeUrgent: { backgroundColor: '#fee2e2', color: '#991b1b' },
  badgeHigh: { backgroundColor: '#fed7aa', color: '#9a3412' },
  badgeNormal: { backgroundColor: '#dbeafe', color: '#1e40af' },

  searchInput: { 
    width: '100%', 
    padding: '0.75rem', 
    paddingLeft: '2.5rem',
    border: '1px solid #d1d5db', 
    borderRadius: '0.375rem', 
    fontSize: '1rem' 
  },
  button: { 
    padding: '0.5rem 1rem', 
    borderRadius: '0.375rem', 
    border: 'none', 
    fontWeight: '600', 
    cursor: 'pointer', 
    fontSize: '0.875rem', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '0.5rem' 
  },
  buttonBlue: { backgroundColor: '#2563eb', color: 'white' },
  buttonGreen: { backgroundColor: '#22c55e', color: 'white' },
  buttonRed: { backgroundColor: '#ef4444', color: 'white' },
  
  listItem: { 
    padding: '1rem', 
    backgroundColor: '#f9fafb', 
    borderRadius: '0.5rem', 
    marginBottom: '0.75rem' 
  },
  emptyState: { textAlign: 'center', padding: '3rem', color: '#9ca3af' },
  successMessage: { backgroundColor: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1rem', border: '1px solid #86efac' },
  errorMessage: { backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1rem', border: '1px solid #fca5a5' }
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export default function Dashboard() {
  // --- KEEPING ALL YOUR ORIGINAL STATE LOGIC ---
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [stats, setStats] = useState({
    activeListings: 0,
    lostItems: 0,
    foundItems: 0,
    upcomingEvents: 0,
    unreadNotifications: 0,
    pendingFlags: 0
  });
  const [notifications, setNotifications] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [flaggedContent, setFlaggedContent] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fix: Check 'role' instead of 'userRole' based on your App.js
  const userRole = localStorage.getItem('role') || localStorage.getItem('userRole') || 'student'; 
  const isAdmin = userRole === 'admin';

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (currentTab === 'moderation' && isAdmin) {
      loadFlaggedContent();
    }
  }, [currentTab, filterStatus, searchQuery]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const statsRes = await fetch(`${API_BASE}/dashboard/stats`, { headers: getAuthHeaders() });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data || statsData);
      }
      const notifsRes = await fetch(`${API_BASE}/notifications`, { headers: getAuthHeaders() });
      if (notifsRes.ok) {
        const notifsData = await notifsRes.json();
        setNotifications(notifsData.data || []);
      }
      const activityRes = await fetch(`${API_BASE}/dashboard/recent-activity`, { headers: getAuthHeaders() });
      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setRecentActivity(activityData.data || []);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      // Fail silently or show message
    }
    setLoading(false);
  };

  const loadFlaggedContent = async () => {
    try {
      let url = `${API_BASE}/admin/flagged-content?status=${filterStatus}`;
      if (searchQuery) url += `&search=${searchQuery}`;
      const response = await fetch(url, { headers: getAuthHeaders() });
      if (response.ok) {
        const data = await response.json();
        setFlaggedContent(data.data || []);
      }
    } catch (error) {
      console.error('Error loading flagged content:', error);
    }
  };

  const markNotificationRead = async (notificationId) => {
    try {
      await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      setNotifications(prev => prev.map(n => 
        n.notification_id === notificationId ? { ...n, is_read: true } : n
      ));
      setStats(prev => ({ 
        ...prev, 
        unreadNotifications: Math.max(0, prev.unreadNotifications - 1) 
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleFlagAction = async (flagId, action) => {
    try {
      await fetch(`${API_BASE}/admin/flagged-content/${flagId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action })
      });
      showMessage('success', `✅ Flag ${action} successfully`);
      loadFlaggedContent();
    } catch (error) {
      console.error('Error handling flag:', error);
      showMessage('error', '❌ Failed to update flag');
    }
  };

  const getPriorityStyle = (priority) => {
    switch(priority) {
      case 'urgent': return styles.badgeUrgent;
      case 'high': return styles.badgeHigh;
      default: return styles.badgeNormal;
    }
  };

  return (
    <div style={styles.container}>
      {/* --- UPDATED NAVBAR STYLING --- */}
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <h1 style={styles.navBrand}>🎓 Dashboard</h1>
          <div style={styles.navButtons}>
            <button 
              onClick={() => setCurrentTab('dashboard')} 
              style={{
                ...styles.navButton, 
                ...(currentTab === 'dashboard' ? styles.btnDashboard : styles.btnInactive)
              }}
            >
              <Home size={18} /> Overview
            </button>
            <button 
              onClick={() => setCurrentTab('notifications')} 
              style={{
                ...styles.navButton, 
                ...(currentTab === 'notifications' ? styles.btnNotifications : styles.btnInactive)
              }}
            >
              <Bell size={18} /> Notifications
              {stats.unreadNotifications > 0 && (
                <span style={{ marginLeft: '0.5rem', backgroundColor: 'white', color: '#f59e0b', padding: '0.1rem 0.4rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  {stats.unreadNotifications}
                </span>
              )}
            </button>
            {isAdmin && (
              <button 
                onClick={() => setCurrentTab('moderation')} 
                style={{
                  ...styles.navButton, 
                  ...(currentTab === 'moderation' ? styles.btnModeration : styles.btnInactive)
                }}
              >
                <Flag size={18} /> Moderation
                {stats.pendingFlags > 0 && (
                  <span style={{ marginLeft: '0.5rem', backgroundColor: 'white', color: '#ef4444', padding: '0.1rem 0.4rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    {stats.pendingFlags}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={styles.pageContent}>
        <div style={styles.pageContainer}>
          {message.text && (
            <div style={message.type === 'error' ? styles.errorMessage : styles.successMessage}>
              {message.text}
            </div>
          )}

          {/* DASHBOARD TAB (Original Logic + New Styles) */}
          {currentTab === 'dashboard' && (
            <div>
              <h1 style={styles.pageTitle}>Dashboard Overview</h1>

              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>Active Listings</div>
                  <div style={styles.statValue}>{stats.activeListings}</div>
                  <ShoppingBag size={32} color="#2563eb" style={{ marginTop: '1rem', opacity: 0.8 }} />
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>Lost & Found</div>
                  <div style={styles.statValue}>{stats.lostItems + stats.foundItems}</div>
                  <Package size={32} color="#f97316" style={{ marginTop: '1rem', opacity: 0.8 }} />
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>Events</div>
                  <div style={styles.statValue}>{stats.upcomingEvents}</div>
                  <Calendar size={32} color="#22c55e" style={{ marginTop: '1rem', opacity: 0.8 }} />
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>User Rating</div>
                  <div style={styles.statValue}>4.8 ⭐</div>
                  <TrendingUp size={32} color="#eab308" style={{ marginTop: '1rem', opacity: 0.8 }} />
                </div>
              </div>

              <div style={styles.card}>
                <h2 style={styles.cardTitle}>
                  <TrendingUp size={20} color="#2563eb" />
                  Recent Activity
                </h2>
                {loading ? (
                  <div style={styles.emptyState}>⏳ Loading...</div>
                ) : recentActivity.length === 0 ? (
                  <div style={styles.emptyState}>📭 No recent activity</div>
                ) : (
                  recentActivity.map((item, idx) => (
                    <div key={idx} style={styles.listItem}>
                      <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{item.title}</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{item.description}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                        {new Date(item.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB (Original Logic + New Styles) */}
          {currentTab === 'notifications' && (
            <div>
              <h1 style={styles.pageTitle}>Notifications</h1>
              <div style={styles.card}>
                {loading ? (
                  <div style={styles.emptyState}>⏳ Loading...</div>
                ) : notifications.length === 0 ? (
                  <div style={styles.emptyState}>🔔 No notifications</div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.notification_id || notif._id} 
                      style={{
                        ...styles.notificationItem,
                        ...(!notif.is_read && styles.notificationItemUnread)
                      }}
                      onClick={() => !notif.is_read && markNotificationRead(notif.notification_id)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span style={{...styles.badge, ...getPriorityStyle(notif.priority)}}>
                              {notif.priority}
                            </span>
                            <span style={{...styles.badge, backgroundColor: '#e5e7eb', color: '#374151'}}>
                              {notif.type}
                            </span>
                            {!notif.is_read && (
                              <span style={{ width: '8px', height: '8px', backgroundColor: '#2563eb', borderRadius: '50%', marginTop: '0.25rem' }}></span>
                            )}
                          </div>
                          <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{notif.title}</div>
                          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{notif.message}</div>
                          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                            {new Date(notif.created_at || notif.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <MessageSquare size={20} color="#9ca3af" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* MODERATION TAB (Original Logic + New Styles) */}
          {currentTab === 'moderation' && isAdmin && (
            <div>
              <h1 style={styles.pageTitle}>Content Moderation</h1>
              
              <div style={styles.card}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '12px', top: '12px', color: '#9ca3af' }} size={20} />
                    <input 
                      type="text" 
                      placeholder="Search flagged content..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={styles.searchInput} 
                    />
                  </div>
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '1rem' }}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: '#fef3c7', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Flag size={20} color="#92400e" />
                  <span style={{ fontWeight: '600', color: '#92400e' }}>
                    {stats.pendingFlags} pending review
                  </span>
                </div>
              </div>

              {flaggedContent.length === 0 ? (
                <div style={styles.card}>
                  <div style={styles.emptyState}>
                    <CheckCircle size={48} color="#22c55e" />
                    <div style={{ marginTop: '1rem', fontSize: '1.125rem', fontWeight: '600' }}>All Clear!</div>
                    <div>No flagged content matches your filters</div>
                  </div>
                </div>
              ) : (
                flaggedContent.map(flag => (
                  <div key={flag._id} style={styles.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <span style={{...styles.badge, backgroundColor: '#fef3c7', color: '#92400e'}}>
                            {flag.status}
                          </span>
                          <span style={{...styles.badge, backgroundColor: '#e5e7eb', color: '#374151'}}>
                            {flag.content_type}
                          </span>
                          <span style={{...styles.badge, backgroundColor: '#fee2e2', color: '#991b1b'}}>
                            {flag.reason}
                          </span>
                        </div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                          {flag.title || 'Flagged Content'}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          Reported by <span style={{ fontWeight: '600' }}>{flag.reported_by}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                          {new Date(flag.created_at || flag.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <Flag size={24} color="#ef4444" />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleFlagAction(flag._id, 'reviewing')}
                        style={{...styles.button, ...styles.buttonBlue}}
                        disabled={flag.status === 'resolved'}
                      >
                        <Eye size={16} /> Review
                      </button>
                      <button 
                        onClick={() => handleFlagAction(flag._id, 'approved')}
                        style={{...styles.button, ...styles.buttonGreen}}
                        disabled={flag.status === 'resolved'}
                      >
                        <CheckCircle size={16} /> Approve
                      </button>
                      <button 
                        onClick={() => handleFlagAction(flag._id, 'removed')}
                        style={{...styles.button, ...styles.buttonRed}}
                        disabled={flag.status === 'resolved'}
                      >
                        <XCircle size={16} /> Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}