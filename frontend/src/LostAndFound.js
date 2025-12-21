// frontend/src/LostAndFound.js
import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, MapPin, Eye, Clock, CheckCircle, 
  Filter, AlertCircle, Package, Calendar 
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f3f4f6' },
  hero: { 
    background: 'linear-gradient(to right, #f97316, #ea580c)', 
    color: 'white', 
    padding: '3rem 1rem' 
  },
  heroContent: { maxWidth: '1280px', margin: '0 auto' },
  heroTitle: { fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' },
  heroSubtitle: { 
    fontSize: '1.25rem', 
    marginBottom: '2rem', 
    opacity: 0.9 
  },
  searchBar: { display: 'flex', gap: '0.5rem', marginBottom: '1rem' },
  formInput: { 
    width: '100%', 
    border: '1px solid #d1d5db', 
    borderRadius: '0.375rem', 
    padding: '0.75rem', 
    fontSize: '1rem', 
    boxSizing: 'border-box' 
  },
  createBtn: { 
    backgroundColor: '#22c55e', 
    color: 'white', 
    padding: '0.75rem 1.5rem', 
    borderRadius: '0.5rem', 
    border: 'none', 
    fontWeight: '600', 
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '0.5rem', 
    whiteSpace: 'nowrap' 
  },
  categoryBtns: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  categoryBtn: { 
    padding: '0.5rem 1rem', 
    borderRadius: '9999px', 
    border: 'none', 
    fontWeight: '600', 
    cursor: 'pointer', 
    fontSize: '0.875rem' 
  },
  categoryBtnActive: { backgroundColor: 'white', color: '#f97316' },
  categoryBtnInactive: { backgroundColor: '#fb923c', color: 'white' },
  itemsGrid: { 
    maxWidth: '1280px', 
    margin: '0 auto', 
    padding: '3rem 1rem', 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
    gap: '1.5rem' 
  },
  itemCard: { 
    backgroundColor: 'white', 
    borderRadius: '0.5rem', 
    boxShadow: '0 10px 15px rgba(0,0,0,0.1)', 
    overflow: 'hidden',
    position: 'relative'
  },
  itemImage: { 
    backgroundColor: '#fed7aa', 
    height: '180px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    color: '#9a3412', 
    fontSize: '4rem',
    fontWeight: 'bold'
  },
  itemContent: { padding: '1.25rem' },
  itemBadge: {
    position: 'absolute',
    top: '1rem',
    left: '1rem',
    padding: '0.5rem 1rem',
    borderRadius: '9999px',
    fontWeight: '700',
    fontSize: '0.875rem',
    textTransform: 'uppercase',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  lostBadge: { backgroundColor: '#fee2e2', color: '#991b1b' },
  foundBadge: { backgroundColor: '#dcfce7', color: '#166534' },
  itemTitle: { 
    fontWeight: 'bold', 
    fontSize: '1.25rem', 
    marginBottom: '0.5rem',
    color: '#1f2937'
  },
  itemDescription: { 
    color: '#4b5563', 
    fontSize: '0.875rem', 
    marginBottom: '0.75rem', 
    display: '-webkit-box', 
    WebkitLineClamp: 2, 
    WebkitBoxOrient: 'vertical', 
    overflow: 'hidden' 
  },
  itemMeta: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '0.5rem', 
    fontSize: '0.875rem', 
    color: '#6b7280', 
    marginBottom: '0.5rem' 
  },
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '0.375rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    display: 'inline-block'
  },
  statusActive: { backgroundColor: '#dbeafe', color: '#1e40af' },
  statusClaimed: { backgroundColor: '#dcfce7', color: '#166534' },
  claimBtn: { 
    width: '100%',
    backgroundColor: '#2563eb', 
    color: 'white', 
    padding: '0.75rem', 
    borderRadius: '0.375rem', 
    border: 'none', 
    fontWeight: '600', 
    cursor: 'pointer', 
    fontSize: '0.875rem', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: '0.5rem',
    marginTop: '1rem'
  },
  modal: { 
    position: 'fixed', 
    inset: 0, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: '1rem', 
    zIndex: 50 
  },
  modalContent: { 
    backgroundColor: 'white', 
    borderRadius: '0.5rem', 
    boxShadow: '0 20px 25px rgba(0,0,0,0.15)', 
    maxWidth: '600px', 
    width: '100%', 
    maxHeight: '90vh', 
    overflow: 'auto', 
    padding: '1.5rem' 
  },
  modalTitle: { fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' },
  formGroup: { marginBottom: '1rem' },
  formLabel: { 
    display: 'block', 
    marginBottom: '0.5rem', 
    fontWeight: '600', 
    fontSize: '0.875rem' 
  },
  formTextarea: { 
    width: '100%', 
    border: '1px solid #d1d5db', 
    borderRadius: '0.375rem', 
    padding: '0.75rem', 
    fontSize: '1rem', 
    boxSizing: 'border-box', 
    minHeight: '96px', 
    fontFamily: 'inherit' 
  },
  submitBtn: { 
    flex: 1, 
    backgroundColor: '#22c55e', 
    color: 'white', 
    padding: '0.75rem', 
    borderRadius: '0.375rem', 
    border: 'none', 
    fontWeight: '600', 
    cursor: 'pointer', 
    fontSize: '1rem' 
  },
  cancelBtn: { 
    flex: 1, 
    backgroundColor: '#d1d5db', 
    color: '#1f2937', 
    padding: '0.75rem', 
    borderRadius: '0.375rem', 
    border: 'none', 
    fontWeight: '600', 
    cursor: 'pointer', 
    fontSize: '1rem' 
  },
  emptyState: { 
    textAlign: 'center', 
    padding: '3rem 1rem', 
    color: '#6b7280',
    gridColumn: '1 / -1'
  },
  successMessage: { 
    backgroundColor: '#dcfce7', 
    color: '#166534', 
    padding: '1rem', 
    borderRadius: '0.375rem', 
    marginBottom: '1rem', 
    border: '1px solid #86efac' 
  },
  errorMessage: { 
    backgroundColor: '#fee2e2', 
    color: '#991b1b', 
    padding: '1rem', 
    borderRadius: '0.375rem', 
    marginBottom: '1rem', 
    border: '1px solid #fca5a5' 
  },
  filterSection: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    marginTop: '1rem'
  }
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export default function LostAndFound() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // all, lost, found
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    type: 'lost',
    title: '',
    description: '',
    category: 'Electronics',
    location: '',
    contact_info: ''
  });

  const categories = [
    'Electronics', 'Books', 'Clothing', 'Accessories', 
    'Keys', 'ID Cards', 'Bags', 'Sports Equipment', 'Other'
  ];

  useEffect(() => {
    fetchItems();
  }, [searchQuery, typeFilter, categoryFilter]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/lost-and-found`;
      const params = new URLSearchParams();
      
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      if (searchQuery) params.append('search', searchQuery);
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      setItems(data.data || []);
    } catch (error) {
      console.error('Error:', error);
      showMessage('error', '❌ Cannot connect to backend');
    }
    setLoading(false);
  };

  const createItem = async () => {
    if (!formData.title || !formData.description || !formData.location || !formData.contact_info) {
      showMessage('error', '⚠️ Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/lost-and-found`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        showMessage('success', '✅ Item posted successfully!');
        setFormData({ 
          type: 'lost', 
          title: '', 
          description: '', 
          category: 'Electronics', 
          location: '', 
          contact_info: '' 
        });
        setShowCreateForm(false);
        fetchItems();
      } else {
        const error = await response.json();
        showMessage('error', `❌ ${error.message || 'Error creating post'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('error', '❌ Error creating post');
    }
    setLoading(false);
  };

  const claimItem = async (itemId) => {
    if (!window.confirm('Do you want to claim this item? The poster will be notified.')) return;

    try {
      const response = await fetch(`${API_BASE}/lost-and-found/${itemId}/claim`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        showMessage('success', '✅ Claim submitted! The poster will contact you.');
        fetchItems();
      } else {
        const error = await response.json();
        showMessage('error', `❌ ${error.message || 'Error claiming item'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('error', '❌ Error claiming item');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getItemIcon = (category) => {
    const icons = {
      'Electronics': '📱',
      'Books': '📚',
      'Clothing': '👕',
      'Accessories': '⌚',
      'Keys': '🔑',
      'ID Cards': '🪪',
      'Bags': '🎒',
      'Sports Equipment': '⚽',
      'Other': '📦'
    };
    return icons[category] || '📦';
  };

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Lost & Found</h1>
          <p style={styles.heroSubtitle}>
            Help reunite lost items with their owners
          </p>
          
          <div style={styles.searchBar}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '12px', 
                  color: '#9ca3af' 
                }} 
                size={20} 
              />
              <input 
                type="text" 
                placeholder="Search items..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                style={{...styles.formInput, paddingLeft: '40px'}} 
              />
            </div>
            <button onClick={() => setShowCreateForm(true)} style={styles.createBtn}>
              <Plus size={20} /> Post Item
            </button>
          </div>

          {/* Type Filter */}
          <div style={styles.categoryBtns}>
            <button 
              onClick={() => setTypeFilter('all')} 
              style={{
                ...styles.categoryBtn, 
                ...(typeFilter === 'all' ? styles.categoryBtnActive : styles.categoryBtnInactive)
              }}
            >
              All Items
            </button>
            <button 
              onClick={() => setTypeFilter('lost')} 
              style={{
                ...styles.categoryBtn, 
                ...(typeFilter === 'lost' ? styles.categoryBtnActive : styles.categoryBtnInactive)
              }}
            >
              Lost Items
            </button>
            <button 
              onClick={() => setTypeFilter('found')} 
              style={{
                ...styles.categoryBtn, 
                ...(typeFilter === 'found' ? styles.categoryBtnActive : styles.categoryBtnInactive)
              }}
            >
              Found Items
            </button>
          </div>

          {/* Category Filter */}
          <div style={styles.filterSection}>
            <Filter size={16} />
            <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Category:</span>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: '1px solid rgba(255,255,255,0.3)',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: '600',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat} style={{ color: '#1f2937' }}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Messages */}
      {message.text && (
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem', marginTop: '1rem' }}>
          <div style={message.type === 'error' ? styles.errorMessage : styles.successMessage}>
            {message.text}
          </div>
        </div>
      )}

      {/* Items Grid */}
      <div style={styles.itemsGrid}>
        {loading ? (
          <div style={styles.emptyState}>⏳ Loading...</div>
        ) : items.length === 0 ? (
          <div style={styles.emptyState}>
            <Package size={64} color="#9ca3af" />
            <div style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '1rem' }}>
              No items found
            </div>
            <p style={{ marginTop: '0.5rem' }}>
              Try adjusting your filters or be the first to post an item!
            </p>
          </div>
        ) : (
          items.map(item => (
            <div key={item._id} style={styles.itemCard}>
              <div style={styles.itemImage}>
                {getItemIcon(item.category)}
              </div>
              
              <div 
                style={{
                  ...styles.itemBadge,
                  ...(item.type === 'lost' ? styles.lostBadge : styles.foundBadge)
                }}
              >
                {item.type === 'lost' ? '❌ Lost' : '✅ Found'}
              </div>

              <div style={styles.itemContent}>
                <div style={styles.itemTitle}>{item.title}</div>
                
                <div style={{
                  ...styles.statusBadge,
                  ...(item.status === 'active' ? styles.statusActive : styles.statusClaimed),
                  marginBottom: '0.75rem'
                }}>
                  {item.status === 'active' ? '🟢 Active' : '✅ Claimed'}
                </div>

                <div style={styles.itemDescription}>{item.description}</div>
                
                <div style={styles.itemMeta}>
                  <MapPin size={16} />
                  {item.location}
                </div>

                <div style={styles.itemMeta}>
                  <Package size={16} />
                  {item.category}
                </div>

                <div style={styles.itemMeta}>
                  <Clock size={16} />
                  {formatDate(item.created_at || item.createdAt)}
                </div>

                <div style={styles.itemMeta}>
                  <Eye size={16} />
                  {item.views || 0} views
                </div>

                {item.status === 'active' && (
                  <button 
                    onClick={() => claimItem(item._id)} 
                    style={styles.claimBtn}
                  >
                    <CheckCircle size={18} />
                    {item.type === 'lost' ? 'I Found This' : 'This is Mine'}
                  </button>
                )}

                {item.status === 'claimed' && (
                  <div style={{
                    padding: '0.75rem',
                    backgroundColor: '#f0fdf4',
                    borderRadius: '0.375rem',
                    marginTop: '1rem',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    color: '#166534',
                    fontWeight: '600'
                  }}>
                    ✅ Item has been claimed
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Item Modal */}
      {showCreateForm && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2 style={styles.modalTitle}>Post Lost/Found Item</h2>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Item Type *</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="type" 
                    value="lost" 
                    checked={formData.type === 'lost'}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  />
                  <span>I Lost This</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="type" 
                    value="found" 
                    checked={formData.type === 'found'}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  />
                  <span>I Found This</span>
                </label>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Item Title *</label>
              <input 
                type="text" 
                placeholder="e.g., Black iPhone 13" 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                style={styles.formInput} 
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Description *</label>
              <textarea 
                placeholder="Describe the item in detail..." 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                style={styles.formTextarea} 
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Category *</label>
              <select 
                value={formData.category} 
                onChange={(e) => setFormData({...formData, category: e.target.value})} 
                style={styles.formInput}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>
                {formData.type === 'lost' ? 'Last Seen Location *' : 'Found Location *'}
              </label>
              <input 
                type="text" 
                placeholder="e.g., Library 2nd Floor" 
                value={formData.location} 
                onChange={(e) => setFormData({...formData, location: e.target.value})} 
                style={styles.formInput} 
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Contact Information *</label>
              <input 
                type="text" 
                placeholder="Email or phone number" 
                value={formData.contact_info} 
                onChange={(e) => setFormData({...formData, contact_info: e.target.value})} 
                style={styles.formInput} 
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                This will be shared with people who claim the item
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button onClick={createItem} style={styles.submitBtn} disabled={loading}>
                {loading ? '⏳ Posting...' : '✅ Post Item'}
              </button>
              <button onClick={() => setShowCreateForm(false)} style={styles.cancelBtn}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
