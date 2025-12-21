import React, { useState, useEffect } from 'react';
import { Search, Filter, Pin } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const styles = {
  container: { padding: '2rem 1rem' },
  header: { marginBottom: '2rem' },
  title: { fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' },
  filters: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '200px' },
  label: { fontSize: '0.875rem', fontWeight: '600', color: '#4b5563' },
  select: {
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '0.875rem'
  },
  input: {
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    flex: 1
  },
  searchContainer: { display: 'flex', gap: '0.5rem', alignItems: 'center', flex: 1 },
  announcementCard: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    marginBottom: '1rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderLeft: '4px solid #2563eb'
  },
  pinnedCard: {
    borderLeft: '4px solid #f59e0b',
    backgroundColor: '#fffbeb'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem'
  },
  cardTitle: { fontSize: '1.25rem', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '0.5rem' },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    marginRight: '0.5rem'
  },
  categoryBadge: { backgroundColor: '#dbeafe', color: '#1e40af' },
  departmentBadge: { backgroundColor: '#e0e7ff', color: '#4338ca' },
  pinnedBadge: { backgroundColor: '#fef3c7', color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.25rem' },
  cardContent: { color: '#4b5563', lineHeight: '1.6', marginBottom: '1rem', whiteSpace: 'pre-wrap' },
  cardMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.875rem',
    color: '#6b7280',
    paddingTop: '0.75rem',
    borderTop: '1px solid #e5e7eb'
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem 1rem',
    color: '#6b7280'
  },
  loading: {
    textAlign: 'center',
    padding: '3rem 1rem',
    color: '#6b7280'
  }
};

const AnnouncementsList = ({ announcements, setAnnouncements, user, setMessage }) => {
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    department: '',
    category: 'All',
    search: ''
  });

  useEffect(() => {
    fetchAnnouncements();
  }, [filters]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.department) params.append('department', filters.department);
      if (filters.category !== 'All') params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);

      const url = `${API_BASE}/announcements${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Failed to fetch announcements');
      
      const data = await response.json();
      setAnnouncements(data.data || []);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: '❌ Cannot fetch announcements' });
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const categories = ['All', 'Academic', 'General', 'Event', 'Important', 'Other'];
  const departments = ['', 'Computer Science', 'Engineering', 'Business', 'Science', 'Arts', 'Other'];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📢 Announcements</h1>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <div style={styles.searchContainer}>
          <Search size={20} color="#6b7280" />
          <input
            type="text"
            placeholder="Search announcements..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            style={styles.input}
          />
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.label}>
            <Filter size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
            Department
          </label>
          <select
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            style={styles.select}
          >
            <option value="">All Departments</option>
            {departments.filter(d => d).map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.label}>Category</label>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            style={styles.select}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div style={styles.loading}>⏳ Loading announcements...</div>
      ) : announcements.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📭</div>
          <div>No announcements found</div>
          {filters.department || filters.category !== 'All' || filters.search ? (
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
              Try adjusting your filters
            </div>
          ) : null}
        </div>
      ) : (
        announcements.map((announcement) => (
          <div
            key={announcement.announcement_id}
            style={{
              ...styles.announcementCard,
              ...(announcement.is_pinned ? styles.pinnedCard : {})
            }}
          >
            <div style={styles.cardHeader}>
              <div style={{ flex: 1 }}>
                <h3 style={styles.cardTitle}>
                  {announcement.is_pinned && (
                    <Pin size={16} style={{ display: 'inline', marginRight: '0.5rem', color: '#f59e0b' }} />
                  )}
                  {announcement.title}
                </h3>
                <div>
                  <span style={{ ...styles.badge, ...styles.categoryBadge }}>
                    {announcement.category}
                  </span>
                  {announcement.department && (
                    <span style={{ ...styles.badge, ...styles.departmentBadge }}>
                      {announcement.department}
                    </span>
                  )}
                  {announcement.is_pinned && (
                    <span style={{ ...styles.badge, ...styles.pinnedBadge }}>
                      <Pin size={12} /> Pinned
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div style={styles.cardContent}>{announcement.content}</div>
            
            <div style={styles.cardMeta}>
              <div>
                <span>👤 {announcement.author?.name || 'Admin'}</span>
                <span style={{ marginLeft: '1rem' }}>👁️ {announcement.view_count || 0} views</span>
              </div>
              <div>{formatDate(announcement.created_at)}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AnnouncementsList;

