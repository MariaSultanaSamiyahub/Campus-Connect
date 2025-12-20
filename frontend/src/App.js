import React, { useState, useEffect } from 'react';
import { Search, Home, MessageCircle, User, LogOut, Plus, Heart, MapPin, Eye, Trash2, Edit, Calendar, CalendarDays } from 'lucide-react';

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
  createBtn: { backgroundColor: '#22c55e', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' },
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
  errorMessage: { backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1rem', border: '1px solid #fca5a5' },
  authCard: { backgroundColor: 'white', padding: '3rem', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxWidth: '450px', width: '100%' },
  authContainer: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' },
  linkBtn: { backgroundColor: 'transparent', color: '#2563eb', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.875rem', fontWeight: '600' },
  eventCard: { backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  eventCategory: { padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#dbeafe', color: '#1e40af', display: 'inline-block', marginBottom: '0.75rem' },
  eventTitle: { fontSize: '1.25rem', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '0.5rem' },
  eventDetail: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' },
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [authPage, setAuthPage] = useState('login');
  const [listings, setListings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [eventCategory, setEventCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Electronics',
    price: '',
    condition: 'Good',
    location: 'Campus'
  });
  const [eventFormData, setEventFormData] = useState({
    title: '',
    description: '',
    date: '',
    venue: '',
    category: 'Other',
    capacity: ''
  });

  const categories = ['Books', 'Electronics', 'Furniture', 'Clothing', 'Stationery', 'Sports', 'Other'];
  const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
  const eventCategories = ['All', 'Academic', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Social', 'Other'];

  useEffect(() => {
    fetchListings();
  }, [searchQuery, category]);

  useEffect(() => {
    if (currentPage === 'events') {
      fetchEvents();
    } else if (currentPage === 'my-calendar') {
      fetchMyEvents();
    }
  }, [currentPage, eventCategory]);

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
      showMessage('error', '❌ Cannot connect to backend');
    }
    setLoading(false);
  };

  const fetchMyListings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/listings/my-listings`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch listings');
      const data = await response.json();
      setMyListings(data.data || []);
    } catch (error) {
      console.error('Error:', error);
      showMessage('error', '❌ Cannot fetch your listings');
    }
    setLoading(false);
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/events`;
      if (eventCategory && eventCategory !== 'All') url += `?category=${eventCategory}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data.data || []);
    } catch (error) {
      console.error('Error:', error);
      showMessage('error', '❌ Cannot fetch events');
    }
    setLoading(false);
  };

  const fetchMyEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/events/my-events`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch your events');
      const data = await response.json();
      setMyEvents(data.data || []);
    } catch (error) {
      console.error('Error:', error);
      showMessage('error', '❌ Cannot fetch your events');
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
        headers: getAuthHeaders(),
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

  const createEvent = async () => {
    if (!eventFormData.title || !eventFormData.description || !eventFormData.date || !eventFormData.venue) {
      showMessage('error', '⚠️ Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...eventFormData,
        capacity: eventFormData.capacity ? parseInt(eventFormData.capacity) : null
      };

      const response = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        showMessage('success', '✅ Event created successfully!');
        setEventFormData({ title: '', description: '', date: '', venue: '', category: 'Other', capacity: '' });
        setShowCreateEvent(false);
        setCurrentPage('events');
        fetchEvents();
      } else {
        const error = await response.json();
        showMessage('error', `❌ ${error.message || 'Error creating event'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('error', '❌ Error creating event');
    }
    setLoading(false);
  };

  const rsvpEvent = async (eventId, status) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        showMessage('success', `✅ RSVP ${status}!`);
        fetchEvents();
        fetchMyEvents();
      } else {
        const error = await response.json();
        showMessage('error', `❌ ${error.message || 'Error with RSVP'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('error', '❌ Error with RSVP');
    }
    setLoading(false);
  };

  const cancelRSVP = async (eventId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/events/${eventId}/rsvp`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        showMessage('success', '✅ RSVP cancelled');
        fetchEvents();
        fetchMyEvents();
      } else {
        showMessage('error', '❌ Error cancelling RSVP');
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('error', '❌ Error cancelling RSVP');
    }
    setLoading(false);
  };

  const deleteListing = async (listingId) => {
    if (!window.confirm('Are you sure?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/listings/${listingId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
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

  const handleRegister = async () => {
    if (!registerName || !registerEmail || !registerPassword) {
      showMessage('error', '⚠️ Please fill all fields');
      return;
    }

    setIsRegistering(true);
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          password: registerPassword,
          role: 'buyer'
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('userId', data.user.id); // Store userId
        showMessage('success', '✅ Registration successful! Please login');
        setRegisterEmail('');
        setRegisterPassword('');
        setRegisterName('');
        setAuthPage('login');
      } else {
        showMessage('error', `❌ ${data.message || 'Registration failed'}`);
      }
    } catch (error) {
      console.error('Register error:', error);
      showMessage('error', '❌ Registration failed');
    }
    setIsRegistering(false);
  };

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      showMessage('error', '⚠️ Please fill all fields');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user.id); // Store userId
        setIsLoggedIn(true);
        setCurrentPage('home');
        setLoginEmail('');
        setLoginPassword('');
        showMessage('success', '✅ Login successful!');
      } else {
        showMessage('error', `❌ ${data.message || 'Login failed'}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      showMessage('error', '❌ Login failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    setAuthPage('login');
    showMessage('success', '✅ Logged out');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const checkUserRSVP = (event) => {
    const userId = localStorage.getItem('userId');
    return event.attendees?.find(
      (attendee) => attendee.user === userId || attendee.user._id === userId
    );
  };

  // LOGIN PAGE
  if (!isLoggedIn && authPage === 'login') {
    return (
      <div style={styles.authContainer}>
        <div style={styles.authCard}>
          <h1 style={styles.modalTitle}>🏫 Campus Connect</h1>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Login to your account</p>
          
          <div style={styles.formGroup}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Email</label>
            <input 
              type="email" 
              placeholder="your@email.com" 
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              style={styles.formInput} 
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              style={styles.formInput} 
            />
          </div>

          <button onClick={handleLogin} style={{...styles.submitBtn, width: '100%', marginBottom: '1rem'}}>
            Login
          </button>

          <div style={{ textAlign: 'center', color: '#6b7280' }}>
            Don't have an account?{' '}
            <button onClick={() => setAuthPage('register')} style={styles.linkBtn}>
              Register here
            </button>
          </div>

          {message.text && (
            <div style={{ marginTop: '1rem' }}>
              <div style={message.type === 'error' ? styles.errorMessage : styles.successMessage}>
                {message.text}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // REGISTER PAGE
  if (!isLoggedIn && authPage === 'register') {
    return (
      <div style={styles.authContainer}>
        <div style={styles.authCard}>
          <h1 style={styles.modalTitle}>Create Account</h1>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Join Campus Connect</p>
          
          <div style={styles.formGroup}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Full Name</label>
            <input 
              type="text" 
              placeholder="Your Name" 
              value={registerName}
              onChange={(e) => setRegisterName(e.target.value)}
              style={styles.formInput} 
            />
          </div>

          <div style={styles.formGroup}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Email</label>
            <input 
              type="email" 
              placeholder="your@email.com" 
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              style={styles.formInput} 
            />
          </div>

          <div style={styles.formGroup}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              style={styles.formInput} 
            />
          </div>

          <button onClick={handleRegister} disabled={isRegistering} style={{...styles.submitBtn, width: '100%', marginBottom: '1rem'}}>
            {isRegistering ? '⏳ Registering...' : '✅ Register'}
          </button>

          <div style={{ textAlign: 'center', color: '#6b7280' }}>
            Already have an account?{' '}
            <button onClick={() => setAuthPage('login')} style={styles.linkBtn}>
              Login here
            </button>
          </div>

          {message.text && (
            <div style={{ marginTop: '1rem' }}>
              <div style={message.type === 'error' ? styles.errorMessage : styles.successMessage}>
                {message.text}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // MAIN APP (Logged in)
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
            <button onClick={() => { setCurrentPage('events'); fetchEvents(); }} style={{...styles.navButton, ...(currentPage === 'events' ? styles.navButtonActive : styles.navButtonInactive)}}>
              <Calendar size={20} /> Events
            </button>
            <button onClick={() => { setCurrentPage('my-calendar'); fetchMyEvents(); }} style={{...styles.navButton, ...(currentPage === 'my-calendar' ? styles.navButtonActive : styles.navButtonInactive)}}>
              <CalendarDays size={20} /> My Calendar
            </button>
            <button onClick={() => setCurrentPage('messages')} style={{...styles.navButton, ...(currentPage === 'messages' ? styles.navButtonActive : styles.navButtonInactive)}}>
              <MessageCircle size={20} /> Messages
            </button>
            <button onClick={handleLogout} style={{...styles.navButton, color: '#dc2626'}}>
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>
      </nav>

      {/* HOME PAGE */}
      {currentPage === 'home' && (
        <div>
          <div style={styles.hero}>
            <div style={styles.heroContent}>
              <h1 style={styles.heroTitle}>Campus Connect Marketplace</h1>
              <p style={styles.heroSubtitle}>Buy and sell items within your campus</p>
              
              <div style={styles.searchBar}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <Search style={{ position: 'absolute', left: '12px', top: '12px', color: '#9ca3af' }} size={20} />
                  <input type="text" placeholder="Search listings..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{...styles.formInput, paddingLeft: '40px'}} />
                </div>
                <button onClick={() => setShowCreateForm(true)} style={styles.createBtn}>
                  <Plus size={20} /> Create Listing
                </button>
              </div>

              <div style={styles.categoryBtns}>
                <button onClick={() => setCategory('')} style={{...styles.categoryBtn, ...(category === '' ? styles.categoryBtnActive : styles.categoryBtnInactive)}}>
                  All Categories
                </button>
                {categories.map(cat => (
                  <button key={cat} onClick={() => setCategory(cat)} style={{...styles.categoryBtn, ...(category === cat ? styles.categoryBtnActive : styles.categoryBtnInactive)}}>
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
                  <input type="text" placeholder="Title *" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} style={styles.formInput} />
                </div>
                <div style={styles.formGroup}>
                  <textarea placeholder="Description *" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} style={styles.formTextarea} />
                </div>
                <div style={styles.formRow}>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} style={styles.formInput}>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <input type="number" placeholder="Price *" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} style={styles.formInput} />
                </div>
                <div style={styles.formRow}>
                  <select value={formData.condition} onChange={(e) => setFormData({...formData, condition: e.target.value})} style={styles.formInput}>
                    {conditions.map(cond => <option key={cond} value={cond}>{cond}</option>)}
                  </select>
                  <input type="text" placeholder="Location" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} style={styles.formInput} />
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
      )}

      {/* MY LISTINGS PAGE */}
      {currentPage === 'my-listings' && (
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
      )}

      {/* EVENTS PAGE */}
      {currentPage === 'events' && (
        <div>
          <div style={styles.hero}>
            <div style={styles.heroContent}>
              <h1 style={styles.heroTitle}>Campus Events</h1>
              <p style={styles.heroSubtitle}>Discover and join events happening on campus</p>
              
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={styles.categoryBtns}>
                  {eventCategories.map(cat => (
                    <button key={cat} onClick={() => setEventCategory(cat === 'All' ? '' : cat)} style={{...styles.categoryBtn, ...(eventCategory === (cat === 'All' ? '' : cat) ? styles.categoryBtnActive : styles.categoryBtnInactive)}}>
                      {cat}
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowCreateEvent(true)} style={styles.createBtn}>
                  <Plus size={20} /> Create Event
                </button>
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
            ) : events.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={{ fontSize: '1rem' }}>📅 No events found</div>
              </div>
            ) : (
              events.map(event => {
                const userRSVP = checkUserRSVP(event);
                return (
                  <div key={event._id} style={styles.eventCard}>
                    <div style={styles.eventCategory}>{event.category}</div>
                    <h3 style={styles.eventTitle}>{event.title}</h3>
                    <div style={styles.eventDetail}>📅 {formatDate(event.date)}</div>
                    <div style={styles.eventDetail}>🕐 {formatTime(event.date)}</div>
                    <div style={styles.eventDetail}>📍 {event.venue}</div>
                    <div style={styles.eventDetail}>👤 {event.organizerName}</div>
                    <p style={{ color: '#4b5563', marginTop: '0.75rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                      {event.description.substring(0, 100)}{event.description.length > 100 && '...'}
                    </p>
                    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                        👥 {event.attendees?.length || 0} attending
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {userRSVP ? (
                          <>
                            <span style={{ padding: '0.5rem 0.75rem', backgroundColor: '#f0fdf4', color: '#15803d', borderRadius: '0.375rem', fontSize: '0.85rem', fontWeight: '600' }}>
                              {userRSVP.status === 'going' ? '✅ Going' : '⭐ Interested'}
                            </span>
                            <button onClick={() => cancelRSVP(event._id)} style={{ padding: '0.5rem 0.75rem', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }} disabled={loading}>
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => rsvpEvent(event._id, 'interested')} style={{ padding: '0.5rem 0.75rem', backgroundColor: '#fef3c7', color: '#92400e', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }} disabled={loading}>
                              ⭐ Interested
                            </button>
                            <button onClick={() => rsvpEvent(event._id, 'going')} style={{ padding: '0.5rem 0.75rem', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }} disabled={loading}>
                              ✅ Going
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {showCreateEvent && (
            <div style={styles.modal}>
              <div style={styles.modalContent}>
                <h2 style={styles.modalTitle}>Create New Event</h2>
                <div style={styles.formGroup}>
                  <input type="text" placeholder="Event Title *" value={eventFormData.title} onChange={(e) => setEventFormData({...eventFormData, title: e.target.value})} style={styles.formInput} />
                </div>
                <div style={styles.formGroup}>
                  <textarea placeholder="Description *" value={eventFormData.description} onChange={(e) => setEventFormData({...eventFormData, description: e.target.value})} style={styles.formTextarea} />
                </div>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>Date & Time *</label>
                    <input type="datetime-local" value={eventFormData.date} onChange={(e) => setEventFormData({...eventFormData, date: e.target.value})} style={styles.formInput} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>Venue *</label>
                    <input type="text" placeholder="e.g., University Hall" value={eventFormData.venue} onChange={(e) => setEventFormData({...eventFormData, venue: e.target.value})} style={styles.formInput} />
                  </div>
                </div>
                <div style={styles.formRow}>
                  <select value={eventFormData.category} onChange={(e) => setEventFormData({...eventFormData, category: e.target.value})} style={styles.formInput}>
                    {eventCategories.filter(c => c !== 'All').map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <input type="number" placeholder="Capacity (optional)" value={eventFormData.capacity} onChange={(e) => setEventFormData({...eventFormData, capacity: e.target.value})} style={styles.formInput} min="1" />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                  <button onClick={createEvent} style={styles.submitBtn} disabled={loading}>
                    {loading ? '⏳ Creating...' : '✅ Create Event'}
                  </button>
                  <button onClick={() => setShowCreateEvent(false)} style={styles.cancelBtn}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MY CALENDAR PAGE */}
      {currentPage === 'my-calendar' && (
        <div style={styles.pageContent}>
          <div style={styles.pageContainer}>
            <h1 style={styles.pageTitle}>📅 My Event Calendar</h1>
            
            {message.text && (
              <div style={message.type === 'error' ? styles.errorMessage : styles.successMessage}>
                {message.text}
              </div>
            )}

            {loading ? (
              <div style={styles.emptyState}>⏳ Loading...</div>
            ) : myEvents.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📅</div>
                <div style={{ fontSize: '1rem' }}>No upcoming events</div>
                <p style={{ marginTop: '0.5rem' }}>Browse events and RSVP to see them here!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {myEvents.map(event => {
                  const userRSVP = checkUserRSVP(event);
                  return (
                    <div key={event._id} style={styles.eventCard}>
                      <div style={styles.eventCategory}>{event.category}</div>
                      <h3 style={styles.eventTitle}>{event.title}</h3>
                      <div style={styles.eventDetail}>📅 {formatDate(event.date)}</div>
                      <div style={styles.eventDetail}>🕐 {formatTime(event.date)}</div>
                      <div style={styles.eventDetail}>📍 {event.venue}</div>
                      <div style={styles.eventDetail}>👤 {event.organizerName}</div>
                      <p style={{ color: '#4b5563', marginTop: '0.75rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                        {event.description}
                      </p>
                      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ padding: '0.5rem 0.75rem', backgroundColor: '#f0fdf4', color: '#15803d', borderRadius: '0.375rem', fontSize: '0.85rem', fontWeight: '600' }}>
                          {userRSVP?.status === 'going' ? '✅ You are going' : '⭐ You are interested'}
                        </span>
                        <button onClick={() => cancelRSVP(event._id)} style={{ padding: '0.5rem 0.75rem', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }} disabled={loading}>
                          Cancel RSVP
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MESSAGES PAGE */}
      {currentPage === 'messages' && (
        <div style={styles.pageContent}>
          <div style={styles.pageContainer}>
            <h1 style={styles.pageTitle}>Messages</h1>
            <div style={styles.emptyState}>
              <div style={{ fontSize: '1rem' }}>💬 Messages feature coming soon</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}