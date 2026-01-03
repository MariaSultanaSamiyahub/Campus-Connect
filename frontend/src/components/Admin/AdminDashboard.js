import React, { useState, useEffect } from 'react';
import { Users, Flag, Shield, Ban, CheckCircle, XCircle, Eye, Search, TrendingUp, Package, Calendar, ShoppingBag, AlertCircle, Clock } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' },
  pageContainer: { maxWidth: '1280px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  pageTitle: { fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' },
  backBtn: { padding: '0.5rem 1rem', backgroundColor: '#6b7280', color: 'white', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', fontWeight: '600' },
  
  // Stats Grid
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' },
  statCard: { backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' },
  statLabel: { fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: '500' },
  statValue: { fontSize: '2.25rem', fontWeight: 'bold', color: '#111827' },
  
  // Feature Grid
  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '2rem' },
  featureCard: { backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.3s', border: '1px solid #e5e7eb' },
  featureTitle: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937' },
  
  // Table Styles
  card: { backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '1.5rem', border: '1px solid #e5e7eb' },
  table: { width: '100%', textAlign: 'left', borderCollapse: 'collapse' },
  tableHeader: { borderBottom: '2px solid #e5e7eb', padding: '1rem', fontWeight: '600', color: '#374151' },
  tableRow: { borderBottom: '1px solid #e5e7eb' },
  tableCell: { padding: '1rem' },
  
  // Badge Styles
  badge: { padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600', display: 'inline-block' },
  badgeAdmin: { backgroundColor: '#ede9fe', color: '#7c3aed' },
  badgeUser: { backgroundColor: '#dbeafe', color: '#1e40af' },
  badgePending: { backgroundColor: '#fef3c7', color: '#92400e' },
  badgeResolved: { backgroundColor: '#dcfce7', color: '#166534' },
  badgeUnderReview: { backgroundColor: '#dbeafe', color: '#1e40af' },
  
  // Button Styles
  button: { padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.5rem' },
  buttonBlue: { backgroundColor: '#2563eb', color: 'white' },
  buttonGreen: { backgroundColor: '#22c55e', color: 'white' },
  buttonRed: { backgroundColor: '#ef4444', color: 'white' },
  buttonGray: { backgroundColor: '#6b7280', color: 'white' },
  
  // Search and Filter
  searchBar: { display: 'flex', gap: '1rem', marginBottom: '1.5rem' },
  searchInput: { flex: 1, padding: '0.75rem', paddingLeft: '2.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '1rem' },
  select: { padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '1rem', backgroundColor: 'white' },
  
  // Messages
  successMessage: { backgroundColor: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1rem', border: '1px solid #86efac' },
  errorMessage: { backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1rem', border: '1px solid #fca5a5' },
  emptyState: { textAlign: 'center', padding: '3rem', color: '#9ca3af' },
  loadingState: { textAlign: 'center', padding: '3rem', color: '#6b7280' }
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) };
};

export default function AdminDashboard() {
  const [currentView, setCurrentView] = useState('main');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    totalEvents: 0,
    totalLostFound: 0,
    pendingFlags: 0
  });
  
  // Data
  const [users, setUsers] = useState([]);
  const [flaggedContent, setFlaggedContent] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  useEffect(() => {
    if (currentView === 'main') {
      loadAdminStats();
    } else if (currentView === 'users') {
      loadUsers();
    } else if (currentView === 'moderation') {
      loadFlaggedContent();
    }
  }, [currentView, filterStatus, searchQuery, userSearchQuery]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  // ✅ ADMIN - Load admin statistics
  const loadAdminStats = async () => {
    setLoading(true);
    try {
      // Fetch all stats in parallel
      const [usersRes, listingsRes, eventsRes, lostFoundRes, flagsRes] = await Promise.all([
        fetch(`${API_BASE}/auth/users`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/marketplace`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/events`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/lost-and-found`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/admin/flagged-content?status=pending`, { headers: getAuthHeaders() })
      ]);

      const usersData = await usersRes.json();
      const listingsData = await listingsRes.json();
      const eventsData = await eventsRes.json();
      const lostFoundData = await lostFoundRes.json();
      const flagsData = await flagsRes.json();

      setStats({
        totalUsers: Array.isArray(usersData) ? usersData.length : 0,
        totalListings: listingsData.count || listingsData.data?.length || 0,
        totalEvents: eventsData.count || eventsData.data?.length || 0,
        totalLostFound: lostFoundData.count || lostFoundData.data?.length || 0,
        pendingFlags: flagsData.data?.length || 0
      });
    } catch (error) {
      console.error('Error loading admin stats:', error);
      showMessage('error', '❌ Failed to load statistics');
    }
    setLoading(false);
  };

  // ✅ ADMIN - Load all users
  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/users`, { headers: getAuthHeaders() });
      const data = await response.json();
      
      let usersList = Array.isArray(data) ? data : [];
      
      // Filter by search query
      if (userSearchQuery.trim()) {
        usersList = usersList.filter(user => 
          user.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(userSearchQuery.toLowerCase())
        );
      }
      
      setUsers(usersList);
    } catch (error) {
      console.error('Error loading users:', error);
      showMessage('error', '❌ Failed to load users');
    }
    setLoading(false);
  };

  // ✅ ADMIN - Load flagged content
  const loadFlaggedContent = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/admin/flagged-content?status=${filterStatus}`;
      if (searchQuery.trim()) url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      
      const response = await fetch(url, { headers: getAuthHeaders() });
      const data = await response.json();
      
      if (data.success) {
        setFlaggedContent(data.data || []);
      } else {
        showMessage('error', `❌ ${data.message || 'Failed to load flagged content'}`);
        setFlaggedContent([]);
      }
    } catch (error) {
      console.error('Error loading flagged content:', error);
      showMessage('error', '❌ Network error');
      setFlaggedContent([]);
    }
    setLoading(false);
  };

  // ✅ ADMIN - Handle flag action
  const handleFlagAction = async (flagId, action) => {
    try {
      const response = await fetch(`${API_BASE}/admin/flagged-content/${flagId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action })
      });
      
      const data = await response.json();
      
      if (data.success) {
        showMessage('success', `✅ Flag ${action} successfully`);
        loadFlaggedContent();
        loadAdminStats(); // Refresh stats
      } else {
        showMessage('error', `❌ ${data.message || 'Failed to update flag'}`);
      }
    } catch (error) {
      console.error('Error handling flag:', error);
      showMessage('error', '❌ Network error');
    }
  };

  // ✅ ADMIN - Delete content
  const deleteContent = async (contentType, contentId) => {
    if (!window.confirm(`Are you sure you want to delete this ${contentType}? This action cannot be undone.`)) return;
    
    try {
      const response = await fetch(`${API_BASE}/admin/content/${contentType}/${contentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      
      if (data.success) {
        showMessage('success', `✅ ${contentType} deleted successfully`);
        loadFlaggedContent();
        loadAdminStats();
      } else {
        showMessage('error', `❌ ${data.message || 'Failed to delete content'}`);
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      showMessage('error', '❌ Network error');
    }
  };

  // ✅ ADMIN - Ban/Unban user
  const toggleUserBan = async (userId, currentStatus) => {
    const action = currentStatus === 'banned' ? 'unban' : 'ban';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    
    // Note: This would require a backend endpoint to ban/unban users
    // For now, we'll show a message
    showMessage('info', `⚠️ User ${action} functionality requires backend implementation`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.pageContainer}>
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>🛡️ Admin Dashboard</h1>
          {currentView !== 'main' && (
            <button onClick={() => setCurrentView('main')} style={styles.backBtn}>
              ⬅ Back to Dashboard
            </button>
          )}
        </div>

        {message.text && (
          <div style={message.type === 'error' ? styles.errorMessage : styles.successMessage}>
            {message.text}
          </div>
        )}

        {/* MAIN VIEW */}
        {currentView === 'main' && (
          <>
            {/* Stats Overview */}
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Total Users</div>
                <div style={styles.statValue}>{stats.totalUsers}</div>
                <Users size={32} color="#2563eb" style={{ marginTop: '1rem', opacity: 0.8 }} />
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Marketplace Listings</div>
                <div style={styles.statValue}>{stats.totalListings}</div>
                <ShoppingBag size={32} color="#22c55e" style={{ marginTop: '1rem', opacity: 0.8 }} />
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Events</div>
                <div style={styles.statValue}>{stats.totalEvents}</div>
                <Calendar size={32} color="#f97316" style={{ marginTop: '1rem', opacity: 0.8 }} />
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Lost & Found Items</div>
                <div style={styles.statValue}>{stats.totalLostFound}</div>
                <Package size={32} color="#8b5cf6" style={{ marginTop: '1rem', opacity: 0.8 }} />
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Pending Flags</div>
                <div style={styles.statValue}>{stats.pendingFlags}</div>
                <Flag size={32} color="#ef4444" style={{ marginTop: '1rem', opacity: 0.8 }} />
              </div>
            </div>

            {/* Feature Cards */}
            <div style={styles.featureGrid}>
              <div style={styles.featureCard} onClick={() => setCurrentView('users')}>
                <Users size={48} color="#2563eb" style={{ marginBottom: '1rem' }} />
                <h3 style={styles.featureTitle}>👥 Manage Users</h3>
                <p style={{ color: '#6b7280' }}>View and manage all registered users</p>
              </div>
              <div style={styles.featureCard} onClick={() => setCurrentView('moderation')}>
                <Flag size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
                <h3 style={styles.featureTitle}>⚠️ Content Moderation</h3>
                <p style={{ color: '#6b7280' }}>Review and manage flagged content</p>
                {stats.pendingFlags > 0 && (
                  <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: '#fee2e2', borderRadius: '0.375rem', color: '#991b1b', fontWeight: '600' }}>
                    {stats.pendingFlags} pending review
                  </div>
                )}
              </div>
              <div style={styles.featureCard}>
                <Shield size={48} color="#22c55e" style={{ marginBottom: '1rem' }} />
                <h3 style={styles.featureTitle}>🟢 System Status</h3>
                <p style={{ color: 'green', fontWeight: 'bold', fontSize: '1.125rem' }}>Online</p>
                <p style={{ color: '#6b7280', marginTop: '0.5rem', fontSize: '0.875rem' }}>All systems operational</p>
              </div>
            </div>
          </>
        )}

        {/* USERS VIEW */}
        {currentView === 'users' && (
          <div>
            <div style={styles.card}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>User Management</h2>
              
              <div style={styles.searchBar}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <Search style={{ position: 'absolute', left: '12px', top: '12px', color: '#9ca3af' }} size={20} />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    style={styles.searchInput}
                  />
                </div>
              </div>

              {loading ? (
                <div style={styles.loadingState}>⏳ Loading users...</div>
              ) : users.length === 0 ? (
                <div style={styles.emptyState}>
                  <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <p>No users found</p>
                </div>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.tableHeader}>Name</th>
                      <th style={styles.tableHeader}>Email</th>
                      <th style={styles.tableHeader}>Role</th>
                      <th style={styles.tableHeader}>Joined</th>
                      <th style={styles.tableHeader}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id || user.user_id} style={styles.tableRow}>
                        <td style={styles.tableCell}>{user.name || 'N/A'}</td>
                        <td style={styles.tableCell}>{user.email || 'N/A'}</td>
                        <td style={styles.tableCell}>
                          <span style={{...styles.badge, ...(user.role === 'admin' ? styles.badgeAdmin : styles.badgeUser)}}>
                            {user.role || 'user'}
                          </span>
                        </td>
                        <td style={styles.tableCell}>
                          {formatDate(user.created_at || user.createdAt)}
                        </td>
                        <td style={styles.tableCell}>
                          <button
                            onClick={() => toggleUserBan(user._id || user.user_id, user.status)}
                            style={{...styles.button, ...styles.buttonRed}}
                          >
                            <Ban size={16} /> {user.status === 'banned' ? 'Unban' : 'Ban'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* MODERATION VIEW */}
        {currentView === 'moderation' && (
          <div>
            <div style={styles.card}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Content Moderation</h2>
              
              <div style={styles.searchBar}>
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
                  style={styles.select}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              {stats.pendingFlags > 0 && filterStatus === 'all' && (
                <div style={{ padding: '0.75rem', backgroundColor: '#fef3c7', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <AlertCircle size={20} color="#92400e" />
                  <span style={{ fontWeight: '600', color: '#92400e' }}>
                    {stats.pendingFlags} items pending review
                  </span>
                </div>
              )}
            </div>

            {loading ? (
              <div style={styles.loadingState}>⏳ Loading flagged content...</div>
            ) : flaggedContent.length === 0 ? (
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
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                        <span style={{...styles.badge, ...(flag.status === 'pending' ? styles.badgePending : flag.status === 'resolved' ? styles.badgeResolved : styles.badgeUnderReview)}}>
                          {flag.status}
                        </span>
                        <span style={{...styles.badge, backgroundColor: '#e5e7eb', color: '#374151'}}>
                          {flag.content_type || 'Unknown'}
                        </span>
                        <span style={{...styles.badge, backgroundColor: '#fee2e2', color: '#991b1b'}}>
                          {flag.reason || 'Reported'}
                        </span>
                      </div>
                      <div style={{ fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                        {flag.title || 'Flagged Content'}
                      </div>
                      {flag.description && (
                        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                          {flag.description}
                        </div>
                      )}
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        Reported by <span style={{ fontWeight: '600' }}>{flag.reported_by?.name || flag.reported_by || 'Unknown'}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} /> {formatDate(flag.created_at || flag.createdAt)}
                      </div>
                    </div>
                    <Flag size={24} color="#ef4444" />
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
                      onClick={() => {
                        handleFlagAction(flag._id, 'removed');
                        if (flag.content_type && flag.content_id) {
                          deleteContent(flag.content_type.toLowerCase(), flag.content_id);
                        }
                      }}
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
  );
}

