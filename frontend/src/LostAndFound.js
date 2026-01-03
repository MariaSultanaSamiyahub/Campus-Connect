import React, { useState, useEffect } from 'react';
import { Search, Plus, MapPin, Eye, Clock, CheckCircle, Filter, Package } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f3f4f6' },
  hero: { background: 'linear-gradient(to right, #f97316, #ea580c)', color: 'white', padding: '3rem 1rem' },
  heroContent: { maxWidth: '1280px', margin: '0 auto' },
  heroTitle: { fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' },
  searchBar: { display: 'flex', gap: '0.5rem', marginBottom: '1rem' },
  formInput: { width: '100%', border: '1px solid #d1d5db', borderRadius: '0.375rem', padding: '0.75rem', fontSize: '1rem' },
  createBtn: { backgroundColor: '#22c55e', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  itemsGrid: { maxWidth: '1280px', margin: '0 auto', padding: '3rem 1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' },
  itemCard: { backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden', position: 'relative' },
  itemImage: { backgroundColor: '#fed7aa', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' },
  itemContent: { padding: '1.25rem' },
  statusBadge: { padding: '0.25rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: '600', display: 'inline-block', marginBottom: '0.5rem' },
  modal: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 50 },
  modalContent: { backgroundColor: 'white', borderRadius: '0.5rem', maxWidth: '600px', width: '100%', padding: '1.5rem', maxHeight: '90vh', overflow: 'auto' },
  submitBtn: { flex: 1, backgroundColor: '#22c55e', color: 'white', padding: '0.75rem', borderRadius: '0.375rem', border: 'none', fontWeight: '600', cursor: 'pointer' },
  cancelBtn: { flex: 1, backgroundColor: '#d1d5db', color: '#1f2937', padding: '0.75rem', borderRadius: '0.375rem', border: 'none', fontWeight: '600', cursor: 'pointer' },
  // Added missing message styles
  successMessage: { backgroundColor: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1rem', border: '1px solid #86efac' },
  errorMessage: { backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1rem', border: '1px solid #fca5a5' }
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) };
};

export default function LostAndFound() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // --- ADDED MISSING STATES ---
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  // ----------------------------
  
  const [formData, setFormData] = useState({ type: 'lost', title: '', description: '', category: 'Electronics', location: '', contact_info: '' });

  useEffect(() => { fetchItems(); }, [searchQuery]);

  // --- ADDED MISSING HELPER FUNCTION ---
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };
  // -------------------------------------

  const fetchItems = async () => {
    try {
      const response = await fetch(`${API_BASE}/lost-and-found?search=${searchQuery}`);
      const data = await response.json();
      setItems(data.data || []);
    } catch (error) { console.error(error); }
  };

  const createItem = async () => {
    // 1. Basic Frontend Validation
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
        // Handle Backend Validation Errors
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

  const claimItem = async (itemId) => {
    if (!window.confirm('Claim this item?')) return;
    try {
      const response = await fetch(`${API_BASE}/lost-and-found/${itemId}/claim`, { method: 'POST', headers: getAuthHeaders() });
      if (response.ok) { fetchItems(); alert('✅ Claimed! Owner notified.'); }
      else { alert('❌ Could not claim item'); }
    } catch (error) { console.error(error); }
  };

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Lost & Found</h1>
          <div style={styles.searchBar}>
            <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={styles.formInput} />
            <button onClick={() => setShowCreateForm(true)} style={styles.createBtn}><Plus size={20} /> Post</button>
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

      <div style={styles.itemsGrid}>
        {items.map(item => (
          <div key={item._id} style={styles.itemCard}>
            <div style={styles.itemImage}>{item.type === 'lost' ? '🔍' : '📦'}</div>
            <div style={styles.itemContent}>
              <div style={{...styles.statusBadge, backgroundColor: item.status==='active'?'#dbeafe':'#dcfce7', color: item.status==='active'?'#1e40af':'#166534'}}>
                {item.status.toUpperCase()}
              </div>
              <h3 style={{fontWeight: 'bold', fontSize: '1.25rem'}}>{item.title}</h3>
              <p style={{color: '#6b7280', margin: '0.5rem 0'}}>{item.description}</p>
              <div style={{fontSize: '0.875rem', color: '#4b5563'}}><MapPin size={14} style={{display:'inline'}}/> {item.location}</div>
              
              {item.status === 'active' && (
                <button onClick={() => claimItem(item._id)} style={{marginTop: '1rem', width: '100%', padding: '0.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer'}}>
                  {item.type === 'lost' ? 'I Found This' : 'This Is Mine'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showCreateForm && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2>Post Item</h2>
            <div style={{margin: '1rem 0', display: 'flex', gap: '1rem'}}>
               <label><input type="radio" name="type" value="lost" checked={formData.type==='lost'} onChange={e=>setFormData({...formData, type: 'lost'})}/> I Lost Something</label>
               <label><input type="radio" name="type" value="found" checked={formData.type==='found'} onChange={e=>setFormData({...formData, type: 'found'})}/> I Found Something</label>
            </div>
            <input placeholder="Title" style={{...styles.formInput, marginBottom: '1rem'}} value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})}/>
            <textarea placeholder="Description" style={{...styles.formInput, marginBottom: '1rem'}} value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})}/>
            <input placeholder="Location" style={{...styles.formInput, marginBottom: '1rem'}} value={formData.location} onChange={e=>setFormData({...formData, location: e.target.value})}/>
            <input placeholder="Contact Info" style={{...styles.formInput, marginBottom: '1rem'}} value={formData.contact_info} onChange={e=>setFormData({...formData, contact_info: e.target.value})}/>
            
            <div style={{display: 'flex', gap: '1rem'}}>
              <button onClick={createItem} style={styles.submitBtn}>
                {loading ? '⏳ Posting...' : 'Post'}
              </button>
              <button onClick={() => setShowCreateForm(false)} style={styles.cancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}