import React, { useState, useEffect } from 'react';
import { Package, MapPin, Eye, CheckCircle, Edit, Trash2, X, Clock } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' },
  header: { maxWidth: '1280px', margin: '0 auto', marginBottom: '2rem' },
  title: { fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' },
  subtitle: { color: '#6b7280' },
  itemsGrid: { maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' },
  itemCard: { backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', padding: '1.5rem' },
  statusBadge: { padding: '0.25rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: '600', display: 'inline-block', marginBottom: '0.5rem' },
  categoryBadge: { padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', backgroundColor: '#e5e7eb', color: '#4b5563', display: 'inline-block', marginBottom: '0.5rem' },
  modal: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 50 },
  modalContent: { backgroundColor: 'white', borderRadius: '0.5rem', maxWidth: '600px', width: '100%', padding: '1.5rem', maxHeight: '90vh', overflow: 'auto', position: 'relative' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  closeBtn: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#6b7280' },
  formInput: { width: '100%', border: '1px solid #d1d5db', borderRadius: '0.375rem', padding: '0.75rem', fontSize: '1rem', marginBottom: '1rem' },
  formSelect: { width: '100%', border: '1px solid #d1d5db', borderRadius: '0.375rem', padding: '0.75rem', fontSize: '1rem', backgroundColor: 'white', marginBottom: '1rem' },
  submitBtn: { backgroundColor: '#22c55e', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.375rem', border: 'none', fontWeight: '600', cursor: 'pointer', marginRight: '0.5rem' },
  cancelBtn: { backgroundColor: '#d1d5db', color: '#1f2937', padding: '0.75rem 1.5rem', borderRadius: '0.375rem', border: 'none', fontWeight: '600', cursor: 'pointer' },
  deleteBtn: { backgroundColor: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem' },
  editBtn: { backgroundColor: '#2563eb', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem', marginRight: '0.5rem' },
  successMessage: { backgroundColor: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1rem', border: '1px solid #86efac' },
  errorMessage: { backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1rem', border: '1px solid #fca5a5' },
  emptyState: { textAlign: 'center', padding: '3rem', color: '#6b7280' },
  detailSection: { marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' },
  detailLabel: { fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600', marginBottom: '0.25rem' },
  detailValue: { fontSize: '1rem', color: '#1f2937' }
};

const categories = ['Electronics', 'Books', 'Clothing', 'Accessories', 'Keys', 'ID Cards', 'Bags', 'Sports Equipment', 'Other'];

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) };
};

export default function MyLostAndFound() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingItem, setEditingItem] = useState(null);
  const [showItemDetails, setShowItemDetails] = useState(null);

  useEffect(() => {
    fetchMyItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const fetchMyItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/lost-and-found/my-items`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setItems(data.data || []);
      } else {
        showMessage('error', '❌ Failed to load your items');
      }
    } catch (error) {
      console.error(error);
      showMessage('error', '❌ Network error');
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
        setShowItemDetails(null);
        fetchMyItems();
      } else {
        showMessage('error', `❌ ${data.message || 'Error updating item'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('error', '❌ Network error');
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
        fetchMyItems();
      } else {
        showMessage('error', `❌ ${data.message || 'Error deleting item'}`);
      }
    } catch (error) {
      console.error('Error:', error);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Lost & Found Items</h1>
        <p style={styles.subtitle}>Manage your posted lost and found items</p>
      </div>

      {message.text && (
        <div style={{ maxWidth: '1280px', margin: '0 auto 2rem' }}>
          <div style={message.type === 'error' ? styles.errorMessage : styles.successMessage}>
            {message.text}
          </div>
        </div>
      )}

      {loading && items.length === 0 ? (
        <div style={styles.emptyState}>⏳ Loading your items...</div>
      ) : items.length === 0 ? (
        <div style={styles.emptyState}>
          <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>You haven't posted any items yet.</p>
        </div>
      ) : (
        <div style={styles.itemsGrid}>
          {items.map(item => (
            <div key={item._id} style={styles.itemCard}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem'}}>
                <div>
                  <div style={{...styles.statusBadge, backgroundColor: item.status==='active'?'#dbeafe':item.status==='claimed'?'#dcfce7':'#fee2e2', color: item.status==='active'?'#1e40af':item.status==='claimed'?'#166534':'#991b1b'}}>
                    {item.status.toUpperCase()}
                  </div>
                  <div style={styles.categoryBadge}>{item.category}</div>
                </div>
                <div style={{fontSize: '2rem'}}>{item.type === 'lost' ? '🔍' : '📦'}</div>
              </div>
              
              <h3 style={{fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '0.5rem'}}>{item.title}</h3>
              <p style={{color: '#6b7280', marginBottom: '1rem', fontSize: '0.875rem'}}>
                {item.description.length > 100 ? item.description.substring(0, 100) + '...' : item.description}
              </p>
              
              <div style={{fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                <MapPin size={14} /> {item.location}
              </div>
              
              {item.views !== undefined && (
                <div style={{fontSize: '0.75rem', color: '#9ca3af', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                  <Eye size={14} /> {item.views} views
                </div>
              )}

              {item.claimed_by && (
                <div style={{fontSize: '0.875rem', color: '#166534', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                  <CheckCircle size={14} /> Claimed by {item.claimed_by.name || 'Unknown'}
                </div>
              )}

              <div style={{display: 'flex', gap: '0.5rem', marginTop: '1rem'}}>
                <button 
                  onClick={() => openItemDetails(item._id)} 
                  style={{...styles.editBtn, flex: 1}}
                >
                  View Details
                </button>
                {item.status === 'active' && (
                  <>
                    <button onClick={() => setEditingItem({...item})} style={styles.editBtn}>
                      <Edit size={16} />
                    </button>
                    <button onClick={() => deleteItem(item._id)} style={styles.deleteBtn}>
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Item Details/Edit Modal */}
      {(showItemDetails || editingItem) && (
        <div style={styles.modal} onClick={(e) => e.target === e.currentTarget && (setShowItemDetails(null), setEditingItem(null))}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2>{editingItem ? 'Edit Item' : showItemDetails?.title}</h2>
              <button onClick={() => { setShowItemDetails(null); setEditingItem(null); }} style={styles.closeBtn}><X size={24} /></button>
            </div>

            {editingItem ? (
              <>
                <input 
                  placeholder="Title" 
                  value={editingItem.title} 
                  onChange={e => setEditingItem({...editingItem, title: e.target.value})}
                  style={styles.formInput}
                />
                <textarea 
                  placeholder="Description" 
                  value={editingItem.description} 
                  onChange={e => setEditingItem({...editingItem, description: e.target.value})}
                  rows="4"
                  style={styles.formInput}
                />
                <select
                  value={editingItem.category}
                  onChange={e => setEditingItem({...editingItem, category: e.target.value})}
                  style={styles.formSelect}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <input 
                  placeholder="Location" 
                  value={editingItem.location} 
                  onChange={e => setEditingItem({...editingItem, location: e.target.value})}
                  style={styles.formInput}
                />
                <input 
                  placeholder="Contact Info" 
                  value={editingItem.contact_info} 
                  onChange={e => setEditingItem({...editingItem, contact_info: e.target.value})}
                  style={styles.formInput}
                />
                <div style={{display: 'flex', gap: '1rem'}}>
                  <button onClick={updateItem} style={styles.submitBtn} disabled={loading}>
                    {loading ? '⏳ Updating...' : 'Save Changes'}
                  </button>
                  <button onClick={() => setEditingItem(null)} style={styles.cancelBtn}>Cancel</button>
                </div>
              </>
            ) : showItemDetails ? (
              <>
                <div style={styles.detailSection}>
                  <div style={styles.detailLabel}>Status</div>
                  <div style={{...styles.statusBadge, backgroundColor: showItemDetails.status==='active'?'#dbeafe':showItemDetails.status==='claimed'?'#dcfce7':'#fee2e2', color: showItemDetails.status==='active'?'#1e40af':showItemDetails.status==='claimed'?'#166534':'#991b1b'}}>
                    {showItemDetails.status.toUpperCase()}
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
                {showItemDetails.claimed_by && (
                  <div style={styles.detailSection}>
                    <div style={styles.detailLabel}>Claimed By</div>
                    <div style={styles.detailValue}><CheckCircle size={16} style={{display: 'inline', marginRight: '0.25rem', color: '#22c55e'}} /> {showItemDetails.claimed_by.name || 'Unknown'}</div>
                    {showItemDetails.claimed_at && (
                      <div style={{fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem'}}>
                        <Clock size={14} style={{display: 'inline', marginRight: '0.25rem'}} /> {formatDate(showItemDetails.claimed_at)}
                      </div>
                    )}
                  </div>
                )}
                {showItemDetails.status === 'active' && (
                  <div style={{display: 'flex', gap: '0.5rem', marginTop: '1.5rem'}}>
                    <button onClick={() => setEditingItem({...showItemDetails})} style={styles.editBtn}>
                      <Edit size={16} style={{display: 'inline', marginRight: '0.25rem'}} /> Edit
                    </button>
                    <button onClick={() => deleteItem(showItemDetails._id)} style={styles.deleteBtn}>
                      <Trash2 size={16} style={{display: 'inline', marginRight: '0.25rem'}} /> Delete
                    </button>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

