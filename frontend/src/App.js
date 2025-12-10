import React, { useState, useEffect } from 'react';
import { Search, Home, MessageCircle, User, LogOut, Plus, Heart, MapPin, Eye, Trash2, Edit } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f3f4f6' },
  navbar: { backgroundColor: '#ffffff', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 40, padding: '1rem' },
  navContent: { maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  navBrand: { fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' },
  navButtons: { display: 'flex', gap: '1rem' },
  navButton: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' },
  navButtonActive: { backgroundColor: '#dbeafe', color: '#2563eb' },
  navButtonInactive: { color: '#4b5563', backgroundColor: 'transparent' },
  hero: { background: 'linear-gradient(to right, #2563eb, #4f46e5)', color: 'white', padding: '3rem 1rem' },
  heroContent: { maxWidth: '1280px', margin: '0 auto' },
  heroTitle: { fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' },
  heroSubtitle: { fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.9 },
  searchBar: { display: 'flex', gap: '0.5rem', marginBottom: '1rem' },
  formInput: { width: '100%', border: '1px solid #d1d5db', borderRadius: '0.375rem', padding: '0.75rem', fontSize: '1rem', boxSizing: 'border-box' },
  createBtn: { backgroundColor: '#22c55e', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  categoryBtns: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  categoryBtn: { padding: '0.5rem 1rem', borderRadius: '9999px', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem' },
  categoryBtnActive: { backgroundColor: 'white', color: '#2563eb' },
  categoryBtnInactive: { backgroundColor: '#3b82f6', color: 'white' },
  listingsGrid: { maxWidth: '1280px', margin: '0 auto', padding: '3rem 1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' },
  listingCard: { backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', overflow: 'hidden' },
  listingImage: { backgroundColor: '#d1d5db', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '0.875rem' },
  listingContent: { padding: '1rem' },
  listingTitle: { fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' },
  listingDescription: { color: '#4b5563', fontSize: '0.875rem', marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  listingPrice: { fontSize: '1.875rem', fontWeight: 'bold', color: '#16a34a' },
  listingCondition: { fontSize: '0.875rem', backgroundColor: '#e5e7eb', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' },
  listingMeta: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#4b5563', marginTop: '0.75rem', marginBottom: '1rem' },
  listingActions: { display: 'flex', gap: '0.5rem' },
  messageBtn: { flex: 1, backgroundColor: '#2563eb', color: 'white', padding: '0.5rem', borderRadius: '0.375rem', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' },
  heartBtn: { padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', backgroundColor: 'white', cursor: 'pointer' },
  modal: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 50 },
  modalContent: { backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 20px 25px rgba(0,0,0,0.15)', maxWidth: '672px', width: '100%', maxHeight: '90vh', overflow: 'auto', padding: '1.5rem' },
  modalTitle: { fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' },
  formGroup: { marginBottom: '1rem' },
  formTextarea: { width: '100%', border: '1px solid #d1d5db', borderRadius: '0.375rem', padding: '0.75rem', fontSize: '1rem', boxSizing: 'border-box', minHeight: '96px', fontFamily: 'inherit' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  submitBtn: { flex: 1, backgroundColor: '#22c55e', color: 'white', padding: '0.75rem', borderRadius: '0.375rem', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' },
  cancelBtn: { flex: 1, backgroundColor: '#d1d5db', color: '#1f2937', padding: '0.75rem', borderRadius: '0.375rem', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' },
  pageContent: { minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2rem 1rem' },
  pageContainer: { maxWidth: '1280px', margin: '0 auto' },
  pageTitle: { fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '2rem' },
  emptyState: { textAlign: 'center', padding: '3rem 1rem', color: '#6b7280' },
  successMessage: { backgroundColor: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1rem', border: '1px solid #86efac' },
  errorMessage: { backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1rem', border: '1px solid #fca5a5' }
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [listings, setListings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Electronics',
    price: '',
    condition: 'Good',
    location: 'Campus'
  });

  const categories = ['Books', 'Electronics', 'Furniture', 'Clothing', 'Stationery', 'Sports', 'Other'];
  const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

  useEffect(() => {
    fetchListings();
  }, [searchQuery, category]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const fetchListings = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/listings?limit=12`;
      if (category) url += `&category=${category}`;
      if (searchQuery) url += `&search=${searchQuery}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch listings');
      const data = await response.json();
      setListings(data.data || []);
    } catch (error) {
      console.error('Error:', error);
      showMessage('error', '❌ Cannot connect to backend. Make sure it\'s running on http://localhost:5000');
    }
    setLoading(false);
  };

  const fetchMyListings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/listings/my-listings`);
      if (!response.ok) throw new Error('Failed to fetch listings');
      const data = await response.json();
      setMyListings(data.data || []);
    } catch (error) {
      console.error('Error:', error);
      showMessage('error', '❌ Cannot fetch your listings');
    }
    setLoading(false);
  };

  const createListing = async () => {
    if (!formData.title || !formData.description || !formData.price) {
      showMessage('error', '⚠️ Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/listings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        showMessage('success', '✅ Listing created successfully!');
        setFormData({ title: '', description: '', category: 'Electronics', price: '', condition: 'Good', location: 'Campus' });
        setShowCreateForm(false);
        fetchListings();
      } else {
        const error = await response.json();
        showMessage('error', `❌ ${error.message || 'Error creating listing'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('error', '❌ Error creating listing');
    }
    setLoading(false);
  };

  const deleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/listings/${listingId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        showMessage('success', '✅ Listing deleted');
        fetchMyListings();
      } else {
        showMessage('error', '❌ Error deleting listing');
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('error', '❌ Error deleting listing');
    }
  };

  const HomePage = () => (
    <div>
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Campus Connect Marketplace</h1>
          <p style={styles.heroSubtitle}>Buy and sell items within your campus community</p>
          
          <div style={styles.searchBar}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '12px', color: '#9ca3af' }} size={20} />
              <input
                type="text"
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{...styles.formInput, paddingLeft: '40px'}}
              />
            </div>
            <button onClick={() => setShowCreateForm(true)} style={styles.createBtn}>
              <Plus size={20} /> Create Listing
            </button>
          </div>

          <div style={styles.categoryBtns}>
            <button
              onClick={() => setCategory('')}
              style={{...styles.categoryBtn, ...(category === '' ? styles.categoryBtnActive : styles.categoryBtnInactive)}}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{...styles.categoryBtn, ...(category === cat ? styles.categoryBtnActive : styles.categoryBtnInactive)}}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {message.text && (
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem', marginTop: '1rem' }}>
          <div style={message.type === 'error' ? styles.errorMessage : styles.successMessage}>
            {message.text}
          </div>
        </div>
      )}

      <div style={styles.listingsGrid}>
        {loading ? (
          <div style={styles.emptyState}>⏳ Loading...</div>
        ) : listings.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: '1rem' }}>📭 No listings found</div>
            <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Be the first to create one!</div>
          </div>
        ) : (
          listings.map(listing => (
            <div key={listing.listing_id} style={styles.listingCard}>
              <div style={styles.listingImage}>[No Image]</div>
              <div style={styles.listingContent}>
                <div style={styles.listingTitle}>{listing.title}</div>
                <div style={styles.listingDescription}>{listing.description}</div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={styles.listingPrice}>${listing.price}</span>
                  <span style={styles.listingCondition}>{listing.condition}</span>
                </div>

                <div style={styles.listingMeta}>
                  <MapPin size={16} /> {listing.location}
                </div>

                <div style={styles.listingMeta}>
                  <Eye size={16} /> {listing.view_count || 0} views
                </div>

                <div style={styles.listingActions}>
                  <button style={styles.messageBtn}>
                    <MessageCircle size={16} /> Message
                  </button>
                  <button style={styles.heartBtn}>
                    <Heart size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateForm && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2 style={styles.modalTitle}>Create New Listing</h2>
            <div style={styles.formGroup}>
              <input
                type="text"
                placeholder="Title *"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                style={styles.formInput}
              />
            </div>
            <div style={styles.formGroup}>
              <textarea
                placeholder="Description *"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                style={styles.formTextarea}
              />
            </div>
            <div style={styles.formRow}>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                style={styles.formInput}
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <input
                type="number"
                placeholder="Price *"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                style={styles.formInput}
              />
            </div>
            <div style={styles.formRow}>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({...formData, condition: e.target.value})}
                style={styles.formInput}
              >
                {conditions.map(cond => <option key={cond} value={cond}>{cond}</option>)}
              </select>
              <input
                type="text"
                placeholder="Location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                style={styles.formInput}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button onClick={createListing} style={styles.submitBtn} disabled={loading}>
                {loading ? '⏳ Creating...' : '✅ Create Listing'}
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

  const MyListingsPage = () => (
    <div style={styles.pageContent}>
      <div style={styles.pageContainer}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={styles.pageTitle}>My Listings</h1>
          <button onClick={() => setShowCreateForm(true)} style={styles.createBtn}>
            <Plus size={20} /> New Listing
          </button>
        </div>
        
        {message.text && (
          <div style={message.type === 'error' ? styles.errorMessage : styles.successMessage}>
            {message.text}
          </div>
        )}

        {loading ? (
          <div style={styles.emptyState}>⏳ Loading...</div>
        ) : myListings.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: '1rem' }}>📭 No listings yet</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {myListings.map(listing => (
              <div key={listing.listing_id} style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '0.5rem' }}>{listing.title}</h3>
                <p style={{ color: '#4b5563', marginBottom: '1rem' }}>{listing.description}</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#16a34a', marginBottom: '0.5rem' }}>${listing.price}</p>
                <span style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  backgroundColor: listing.status === 'active' ? '#dcfce7' : '#fee2e2',
                  color: listing.status === 'active' ? '#166534' : '#991b1b'
                }}>
                  {listing.status.toUpperCase()}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button style={{...styles.messageBtn, backgroundColor: '#3b82f6'}}>
                    <Edit size={16} /> Edit
                  </button>
                  <button onClick={() => deleteListing(listing.listing_id)} style={{...styles.messageBtn, backgroundColor: '#ef4444'}}>
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const MessagesPage = () => (
    <div style={styles.pageContent}>
      <div style={styles.pageContainer}>
        <h1 style={styles.pageTitle}>Messages</h1>
        <div style={styles.emptyState}>
          <div style={{ fontSize: '1rem' }}>💬 Messages feature coming soon</div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <h1 style={styles.navBrand}>🏫 Campus Connect</h1>
          <div style={styles.navButtons}>
            <button onClick={() => { setCurrentPage('home'); fetchListings(); }} style={{...styles.navButton, ...(currentPage === 'home' ? styles.navButtonActive : styles.navButtonInactive)}}>
              <Home size={20} /> Home
            </button>
            <button onClick={() => { setCurrentPage('my-listings'); fetchMyListings(); }} style={{...styles.navButton, ...(currentPage === 'my-listings' ? styles.navButtonActive : styles.navButtonInactive)}}>
              <User size={20} /> My Listings
            </button>
            <button onClick={() => setCurrentPage('messages')} style={{...styles.navButton, ...(currentPage === 'messages' ? styles.navButtonActive : styles.navButtonInactive)}}>
              <MessageCircle size={20} /> Messages
            </button>
            <button style={{...styles.navButton, color: '#dc2626'}}>
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>
      </nav>

      {currentPage === 'home' && <HomePage />}
      {currentPage === 'my-listings' && <MyListingsPage />}
      {currentPage === 'messages' && <MessagesPage />}
    </div>
  );
}