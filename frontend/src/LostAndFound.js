import React, { useState, useEffect } from 'react';
import { Search, Plus, MapPin, Eye, Clock, CheckCircle, Filter, Package, Edit, Trash2, X, User } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const categories = ['Electronics', 'Books', 'Clothing', 'Accessories', 'Keys', 'ID Cards', 'Bags', 'Sports Equipment', 'Other'];

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f3f4f6' },
  hero: { background: 'linear-gradient(to right, #f97316, #ea580c)', color: 'white', padding: '3rem 1rem' },
  heroContent: { maxWidth: '1280px', margin: '0 auto' },
  heroTitle: { fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' },
  searchBar: { display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' },
  filterBar: { display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' },
  formInput: { width: '100%', border: '1px solid #d1d5db', borderRadius: '0.375rem', padding: '0.75rem', fontSize: '1rem' },
  formSelect: { width: '100%', border: '1px solid #d1d5db', borderRadius: '0.375rem', padding: '0.75rem', fontSize: '1rem', backgroundColor: 'white' },
  createBtn: { backgroundColor: '#22c55e', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  filterBtn: { backgroundColor: 'white', color: '#1f2937', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', fontWeight: '500', cursor: 'pointer', fontSize: '0.875rem' },
  filterBtnActive: { backgroundColor: '#2563eb', color: 'white', border: '1px solid #2563eb' },
  itemsGrid: { maxWidth: '1280px', margin: '0 auto', padding: '3rem 1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' },
  itemCard: { backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden', position: 'relative', cursor: 'pointer', transition: 'transform 0.2s' },
  itemImage: { backgroundColor: '#fed7aa', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' },
  itemContent: { padding: '1.25rem' },
  statusBadge: { padding: '0.25rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: '600', display: 'inline-block', marginBottom: '0.5rem' },
  categoryBadge: { padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', backgroundColor: '#e5e7eb', color: '#4b5563', display: 'inline-block', marginBottom: '0.5rem' },
  modal: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 50 },
  modalContent: { backgroundColor: 'white', borderRadius: '0.5rem', maxWidth: '600px', width: '100%', padding: '1.5rem', maxHeight: '90vh', overflow: 'auto', position: 'relative' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  closeBtn: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#6b7280' },
  submitBtn: { flex: 1, backgroundColor: '#22c55e', color: 'white', padding: '0.75rem', borderRadius: '0.375rem', border: 'none', fontWeight: '600', cursor: 'pointer' },
  cancelBtn: { flex: 1, backgroundColor: '#d1d5db', color: '#1f2937', padding: '0.75rem', borderRadius: '0.375rem', border: 'none', fontWeight: '600', cursor: 'pointer' },
  deleteBtn: { backgroundColor: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem' },
  editBtn: { backgroundColor: '#2563eb', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem', marginRight: '0.5rem' },
  successMessage: { backgroundColor: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1rem', border: '1px solid #86efac' },
  errorMessage: { backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1rem', border: '1px solid #fca5a5' },
  emptyState: { textAlign: 'center', padding: '3rem', color: '#6b7280' },
  loadingState: { textAlign: 'center', padding: '3rem', color: '#6b7280' },
  detailSection: { marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' },
  detailLabel: { fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600', marginBottom: '0.25rem' },
  detailValue: { fontSize: '1rem', color: '#1f2937' }
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) };
};

const getCurrentUserId = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.user_id;
  } catch {
    return null;
  }
};

export default function LostAndFound() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'lost', 'found'
  const [filterCategory, setFilterCategory] = useState('All');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showItemDetails, setShowItemDetails] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserMongoId, setCurrentUserMongoId] = useState(null);
  
  const [formData, setFormData] = useState({ 
    type: 'lost', 
    title: '', 
    description: '', 
    category: 'Electronics', 
    location: '', 
    contact_info: '' 
  });

  useEffect(() => {
    setCurrentUserId(getCurrentUserId());
    fetchCurrentUser();
    fetchItems();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, { headers: getAuthHeaders() });
      const data = await response.json();
      if (data.success && data.user) {
        // ✅ LOST & FOUND - Store user MongoDB _id for ownership checks
        setCurrentUserId(data.user.user_id);
        if (data.user._id) {
          setCurrentUserMongoId(data.user._id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  };

  // ✅ LOST & FOUND - Debounce search to avoid excessive API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchItems();
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filterType, filterCategory]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/lost-and-found?`;
      if (searchQuery.trim()) url += `search=${encodeURIComponent(searchQuery.trim())}&`;
      if (filterType !== 'all') url += `type=${filterType}&`;
      if (filterCategory !== 'All') url += `category=${encodeURIComponent(filterCategory)}&`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setItems(data.data || []);
      } else {
        showMessage('error', `❌ ${data.message || 'Failed to load items'}`);
        setItems([]);
      }
    } catch (error) {
      console.error('Fetch items error:', error);
      showMessage('error', '❌ Network error. Please check your connection.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const createItem = async () => {
    // ✅ LOST & FOUND - Enhanced validation with specific field checks
    if (!formData.title || formData.title.trim().length < 3) {
      showMessage('error', '⚠️ Title must be at least 3 characters');
      return;
    }
    if (!formData.description || formData.description.trim().length < 5) {
      showMessage('error', '⚠️ Description must be at least 5 characters');
      return;
    }
    if (!formData.location || formData.location.trim().length === 0) {
      showMessage('error', '⚠️ Location is required');
      return;
    }
    if (!formData.contact_info || formData.contact_info.trim().length === 0) {
      showMessage('error', '⚠️ Contact information is required');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      showMessage('error', '⚠️ Please log in to post an item');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/lost-and-found`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();

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
        if (data.errors && Array.isArray(data.errors)) {
          const errorMsg = data.errors.map(e => e.msg).join(', ');
          showMessage('error', `❌ ${errorMsg}`);
        } else {
          showMessage('error', `❌ ${data.message || 'Error creating post'}`);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('error', '❌ Network error. Check console.');
    }
    setLoading(false);
  };

  const updateItem = async () => {
    if (!editingItem.title || !editingItem.description || !editingItem.location || !editingItem.contact_info) {
      showMessage('error', '⚠️ Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/lost-and-found/${editingItem._id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: editingItem.title,
          description: editingItem.description,
          category: editingItem.category,
          location: editingItem.location,
          contact_info: editingItem.contact_info
        })
      });
      
      const data = await response.json();

      if (response.ok) {
        showMessage('success', '✅ Item updated successfully!');
        setEditingItem(null);
        fetchItems();
      } else {
        showMessage('error', `❌ ${data.message || 'Error updating item'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('error', '❌ Network error. Check console.');
    }
    setLoading(false);
  };

  const deleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/lost-and-found/${itemId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      const data = await response.json();

      if (response.ok) {
        showMessage('success', '✅ Item deleted successfully!');
        setShowItemDetails(null);
        fetchItems();
      } else {
        showMessage('error', `❌ ${data.message || 'Error deleting item'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('error', '❌ Network error. Check console.');
    }
    setLoading(false);
  };

  const claimItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to claim this item? The owner will be notified.')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/lost-and-found/${itemId}/claim`, { 
        method: 'POST', 
        headers: getAuthHeaders() 
      });
      const data = await response.json();
      
      if (response.ok) {
        showMessage('success', '✅ Claim submitted! The owner has been notified.');
        fetchItems();
        if (showItemDetails) {
          const updatedItem = await fetch(`${API_BASE}/lost-and-found/${itemId}`, { headers: getAuthHeaders() })
            .then(res => res.json());
          if (updatedItem.success) setShowItemDetails(updatedItem.data);
        }
      } else {
        showMessage('error', `❌ ${data.message || 'Could not claim item'}`);
      }
    } catch (error) {
      console.error(error);
      showMessage('error', '❌ Network error');
    }
    setLoading(false);
  };

  const openItemDetails = async (itemId) => {
    try {
      const response = await fetch(`${API_BASE}/lost-and-found/${itemId}`);
      const data = await response.json();
      if (data.success) {
        setShowItemDetails(data.data);
      }
    } catch (error) {
      console.error(error);
      showMessage('error', '❌ Failed to load item details');
    }
  };

  const isOwner = (item) => {
    if (!item.posted_by || !currentUserMongoId) return false;
    // ✅ LOST & FOUND - Check ownership by comparing MongoDB _id
    // posted_by is populated with user object containing _id
    if (typeof item.posted_by === 'string') {
      // If posted_by is just an ObjectId string, compare directly
      return item.posted_by === currentUserMongoId;
    }
    // If posted_by is populated object, compare _id
    return item.posted_by._id?.toString() === currentUserMongoId?.toString();
  };

  // ✅ LOST & FOUND - Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
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

  // ✅ LOST & FOUND - Check if item is expired
  const isExpired = (item) => {
    if (!item.expires_at) return false;
    return new Date(item.expires_at) < new Date();
  };

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Lost & Found</h1>
          <div style={styles.searchBar}>
            <input 
              type="text" 
              placeholder="Search items..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              style={{...styles.formInput, flex: 1, minWidth: '200px'}} 
            />
            <button 
              onClick={() => {
                const token = localStorage.getItem('token');
                if (!token) {
                  showMessage('error', '⚠️ Please log in to post an item');
                  return;
                }
                setShowCreateForm(true);
              }} 
              style={styles.createBtn}
            >
              <Plus size={20} /> Post Item
            </button>
          </div>
          
          {/* Filter Bar */}
          <div style={styles.filterBar}>
            <span style={{ color: 'white', fontWeight: '500' }}>Type:</span>
            <button 
              onClick={() => setFilterType('all')} 
              style={{...styles.filterBtn, ...(filterType === 'all' ? styles.filterBtnActive : {})}}
            >
              All
            </button>
            <button 
              onClick={() => setFilterType('lost')} 
              style={{...styles.filterBtn, ...(filterType === 'lost' ? styles.filterBtnActive : {})}}
            >
              🔍 Lost
            </button>
            <button 
              onClick={() => setFilterType('found')} 
              style={{...styles.filterBtn, ...(filterType === 'found' ? styles.filterBtnActive : {})}}
            >
              📦 Found
            </button>
            
            <span style={{ color: 'white', fontWeight: '500', marginLeft: '1rem' }}>Category:</span>
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{...styles.filterBtn, padding: '0.5rem 1rem', cursor: 'pointer'}}
            >
              <option value="All">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Message Display Area */}
      {message.text && (
        <div style={{ maxWidth: '1280px', margin: '1rem auto', padding: '0 1rem' }}>
          <div style={message.type === 'error' ? styles.errorMessage : styles.successMessage}>
            {message.text}
          </div>
        </div>
      )}

      {/* Items Grid */}
      {loading && items.length === 0 ? (
        <div style={styles.loadingState}>⏳ Loading items...</div>
      ) : items.length === 0 ? (
        <div style={styles.emptyState}>
          <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>No items found. Be the first to post!</p>
        </div>
      ) : (
        <div style={styles.itemsGrid}>
          {items.map(item => (
            <div 
              key={item._id} 
              style={styles.itemCard}
              onClick={() => openItemDetails(item._id)}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={styles.itemImage}>
                {item.type === 'lost' ? '🔍' : '📦'}
              </div>
              <div style={styles.itemContent}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem'}}>
                  <div style={{...styles.statusBadge, backgroundColor: item.status==='active'?'#dbeafe':item.status==='claimed'?'#dcfce7':'#fee2e2', color: item.status==='active'?'#1e40af':item.status==='claimed'?'#166534':'#991b1b'}}>
                    {item.status.toUpperCase()}
                  </div>
                  <div style={styles.categoryBadge}>{item.category}</div>
                </div>
                <h3 style={{fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '0.5rem'}}>{item.title}</h3>
                <p style={{color: '#6b7280', margin: '0.5rem 0', fontSize: '0.875rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
                  {item.description}
                </p>
                <div style={{fontSize: '0.875rem', color: '#4b5563', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                  <MapPin size={14} /> {item.location}
                </div>
                <div style={{fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  {item.posted_by && (
                    <span>Posted by {item.posted_by.name || 'Unknown'}</span>
                  )}
                  {item.created_at && (
                    <span style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                      <Clock size={12} /> {formatDate(item.created_at)}
                    </span>
                  )}
                </div>
                {isExpired(item) && item.status === 'active' && (
                  <div style={{fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', fontStyle: 'italic'}}>
                    ⚠️ This item has expired
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Item Modal */}
      {showCreateForm && (
        <div style={styles.modal} onClick={(e) => e.target === e.currentTarget && setShowCreateForm(false)}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2>Post Lost & Found Item</h2>
              <button onClick={() => setShowCreateForm(false)} style={styles.closeBtn}><X size={24} /></button>
            </div>
            
            <div style={{margin: '1rem 0', display: 'flex', gap: '1rem'}}>
              <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
                <input type="radio" name="type" value="lost" checked={formData.type==='lost'} onChange={e=>setFormData({...formData, type: 'lost'})}/>
                I Lost Something
              </label>
              <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
                <input type="radio" name="type" value="found" checked={formData.type==='found'} onChange={e=>setFormData({...formData, type: 'found'})}/>
                I Found Something
              </label>
            </div>
            
            <input 
              placeholder="Title (e.g., Lost iPhone 13)" 
              style={{...styles.formInput, marginBottom: '1rem'}} 
              value={formData.title} 
              onChange={e=>setFormData({...formData, title: e.target.value})}
            />
            <textarea 
              placeholder="Description (be specific about the item)" 
              rows="4"
              style={{...styles.formInput, marginBottom: '1rem', resize: 'vertical'}} 
              value={formData.description} 
              onChange={e=>setFormData({...formData, description: e.target.value})}
            />
            <select
              value={formData.category}
              onChange={e=>setFormData({...formData, category: e.target.value})}
              style={{...styles.formSelect, marginBottom: '1rem'}}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input 
              placeholder="Location (e.g., Library, Building A)" 
              style={{...styles.formInput, marginBottom: '1rem'}} 
              value={formData.location} 
              onChange={e=>setFormData({...formData, location: e.target.value})}
            />
            <input 
              placeholder="Contact Info (email or phone)" 
              style={{...styles.formInput, marginBottom: '1rem'}} 
              value={formData.contact_info} 
              onChange={e=>setFormData({...formData, contact_info: e.target.value})}
            />
            
            <div style={{display: 'flex', gap: '1rem'}}>
              <button onClick={createItem} style={styles.submitBtn} disabled={loading}>
                {loading ? '⏳ Posting...' : 'Post Item'}
              </button>
              <button onClick={() => setShowCreateForm(false)} style={styles.cancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Item Details Modal */}
      {(showItemDetails || editingItem) && (
        <div style={styles.modal} onClick={(e) => e.target === e.currentTarget && (setShowItemDetails(null), setEditingItem(null))}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2>{editingItem ? 'Edit Item' : showItemDetails?.title}</h2>
              <button onClick={() => { setShowItemDetails(null); setEditingItem(null); }} style={styles.closeBtn}><X size={24} /></button>
            </div>

            {!editingItem && showItemDetails ? (
              <>
                <div style={styles.detailSection}>
                  <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap'}}>
                    <div style={{...styles.statusBadge, backgroundColor: showItemDetails.status==='active'?'#dbeafe':showItemDetails.status==='claimed'?'#dcfce7':'#fee2e2', color: showItemDetails.status==='active'?'#1e40af':showItemDetails.status==='claimed'?'#166534':'#991b1b'}}>
                      {showItemDetails.status.toUpperCase()}
                    </div>
                    <div style={styles.categoryBadge}>{showItemDetails.category}</div>
                    <div style={{...styles.categoryBadge, backgroundColor: showItemDetails.type==='lost'?'#fef3c7':'#dbeafe', color: showItemDetails.type==='lost'?'#92400e':'#1e40af'}}>
                      {showItemDetails.type === 'lost' ? '🔍 Lost' : '📦 Found'}
                    </div>
                  </div>
                </div>
                  
                <div style={styles.detailSection}>
                    <div style={styles.detailLabel}>Description</div>
                    <div style={styles.detailValue}>{showItemDetails.description}</div>
                  </div>

                  <div style={styles.detailSection}>
                    <div style={styles.detailLabel}>Location</div>
                    <div style={styles.detailValue}><MapPin size={16} style={{display: 'inline', marginRight: '0.25rem'}} /> {showItemDetails.location}</div>
                  </div>

                  <div style={styles.detailSection}>
                    <div style={styles.detailLabel}>Contact Information</div>
                    <div style={styles.detailValue}>{showItemDetails.contact_info}</div>
                  </div>

                  {showItemDetails.posted_by && (
                    <div style={styles.detailSection}>
                      <div style={styles.detailLabel}>Posted By</div>
                      <div style={styles.detailValue}><User size={16} style={{display: 'inline', marginRight: '0.25rem'}} /> {showItemDetails.posted_by.name || 'Unknown'}</div>
                    </div>
                  )}

                  {showItemDetails.claimed_by && (
                    <div style={styles.detailSection}>
                      <div style={styles.detailLabel}>Claimed By</div>
                      <div style={styles.detailValue}><CheckCircle size={16} style={{display: 'inline', marginRight: '0.25rem', color: '#22c55e'}} /> {showItemDetails.claimed_by.name || 'Unknown'}</div>
                    </div>
                  )}

                  {showItemDetails.views !== undefined && (
                    <div style={styles.detailSection}>
                      <div style={styles.detailLabel}>Views</div>
                      <div style={styles.detailValue}><Eye size={16} style={{display: 'inline', marginRight: '0.25rem'}} /> {showItemDetails.views}</div>
                    </div>
                  )}

                  {showItemDetails.created_at && (
                    <div style={styles.detailSection}>
                      <div style={styles.detailLabel}>Posted On</div>
                      <div style={styles.detailValue}><Clock size={16} style={{display: 'inline', marginRight: '0.25rem'}} /> {formatDate(showItemDetails.created_at)}</div>
                    </div>
                  )}

                  {showItemDetails.expires_at && (
                    <div style={styles.detailSection}>
                      <div style={styles.detailLabel}>Expires On</div>
                      <div style={{...styles.detailValue, color: isExpired(showItemDetails) ? '#ef4444' : '#1f2937'}}>
                        {formatDate(showItemDetails.expires_at)}
                        {isExpired(showItemDetails) && ' (Expired)'}
                      </div>
                    </div>
                  )}

                  <div style={{display: 'flex', gap: '0.5rem', marginTop: '1.5rem', flexWrap: 'wrap'}}>
                    {isOwner(showItemDetails) && showItemDetails.status === 'active' && (
                      <>
                        <button onClick={() => setEditingItem({...showItemDetails})} style={styles.editBtn}>
                          <Edit size={16} style={{display: 'inline', marginRight: '0.25rem'}} /> Edit
                        </button>
                        <button onClick={() => deleteItem(showItemDetails._id)} style={styles.deleteBtn}>
                          <Trash2 size={16} style={{display: 'inline', marginRight: '0.25rem'}} /> Delete
                        </button>
                      </>
                    )}
                    {!isOwner(showItemDetails) && showItemDetails.status === 'active' && (
                      <button onClick={() => claimItem(showItemDetails._id)} style={styles.submitBtn}>
                        {showItemDetails.type === 'lost' ? 'I Found This' : 'This Is Mine'}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div style={{marginBottom: '1rem'}}>
                    <label style={styles.detailLabel}>Title</label>
                    <input 
                      value={editingItem.title} 
                      onChange={e => setEditingItem({...editingItem, title: e.target.value})}
                      style={styles.formInput}
                    />
                  </div>
                  <div style={{marginBottom: '1rem'}}>
                    <label style={styles.detailLabel}>Description</label>
                    <textarea 
                      value={editingItem.description} 
                      onChange={e => setEditingItem({...editingItem, description: e.target.value})}
                      rows="4"
                      style={styles.formInput}
                    />
                  </div>
                  <div style={{marginBottom: '1rem'}}>
                    <label style={styles.detailLabel}>Category</label>
                    <select
                      value={editingItem.category}
                      onChange={e => setEditingItem({...editingItem, category: e.target.value})}
                      style={styles.formSelect}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{marginBottom: '1rem'}}>
                    <label style={styles.detailLabel}>Location</label>
                    <input 
                      value={editingItem.location} 
                      onChange={e => setEditingItem({...editingItem, location: e.target.value})}
                      style={styles.formInput}
                    />
                  </div>
                  <div style={{marginBottom: '1rem'}}>
                    <label style={styles.detailLabel}>Contact Info</label>
                    <input 
                      value={editingItem.contact_info} 
                      onChange={e => setEditingItem({...editingItem, contact_info: e.target.value})}
                      style={styles.formInput}
                    />
                  </div>
                  <div style={{display: 'flex', gap: '1rem'}}>
                    <button onClick={updateItem} style={styles.submitBtn} disabled={loading}>
                      {loading ? '⏳ Updating...' : 'Save Changes'}
                    </button>
                    <button onClick={() => setEditingItem(null)} style={styles.cancelBtn}>Cancel</button>
                  </div>
                </>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
