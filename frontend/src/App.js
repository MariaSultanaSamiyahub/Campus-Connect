import React, { useState, useEffect } from 'react';
import { Home, LogOut, Megaphone, ShoppingBag,ShoppingCart , AlertCircle, Calendar, MessageCircle, Plus, Heart, Package } from 'lucide-react';
import Marketplace from './components/Marketplace/Marketplace';
import MessagesPage from './components/Marketplace/Messages';
import FavoritesPage from './components/Marketplace/Favorites';
import MyListingsPage from './components/Marketplace/MyListings';
import Cart from './components/Marketplace/Cart';
import Orders from './components/Marketplace/Orders';


const API_BASE = 'http://localhost:5000/api';

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex' },
  sidebar: { width: '280px', backgroundColor: '#ffffff', boxShadow: '2px 0 8px rgba(0,0,0,0.1)', height: '100vh', overflowY: 'auto', position: 'sticky', top: 0 },
  sidebarBrand: { padding: '1.5rem', borderBottom: '2px solid #e5e7eb', fontSize: '1.25rem', fontWeight: 'bold', color: '#2563eb' },
  sidebarItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', margin: '0.5rem', borderRadius: '0.375rem', cursor: 'pointer', color: '#4b5563', fontWeight: '500', border: 'none', backgroundColor: 'transparent', width: 'calc(100% - 1rem)', textAlign: 'left', fontSize: '0.95rem' },
  sidebarItemActive: { backgroundColor: '#dbeafe', color: '#2563eb' },
  mainContent: { flex: 1, display: 'flex', flexDirection: 'column' },
  topBar: { backgroundColor: '#ffffff', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 20 },
  topBarBrand: { fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' },
  topBarButtons: { display: 'flex', gap: '1rem', alignItems: 'center' },
  logoutBtn: { padding: '0.5rem 1rem', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  pageContent: { flex: 1, backgroundColor: '#f9fafb', padding: '2rem', overflowY: 'auto' },
  pageContainer: { maxWidth: '1280px', margin: '0 auto' },
  hero: { background: 'linear-gradient(to right, #2563eb, #4f46e5)', color: 'white', padding: '3rem 2rem', borderRadius: '0.5rem', marginBottom: '2rem' },
  heroTitle: { fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' },
  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' },
  featureCard: { backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.3s' },
  featureIcon: { fontSize: '3rem', marginBottom: '1rem' },
  featureTitle: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937' },
  authContainer: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' },
  authCard: { backgroundColor: 'white', padding: '3rem', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxWidth: '450px', width: '100%' },
  formInput: { width: '100%', border: '1px solid #d1d5db', borderRadius: '0.375rem', padding: '0.75rem', fontSize: '1rem', boxSizing: 'border-box', marginBottom: '1rem' },
  submitBtn: { width: '100%', backgroundColor: '#22c55e', color: 'white', padding: '0.75rem', borderRadius: '0.375rem', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '1rem', marginBottom: '1rem' },
  pageTitle: { fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' },
  emptyState: { textAlign: 'center', padding: '3rem', color: '#6b7280' },
  successMessage: { backgroundColor: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1rem', border: '1px solid #86efac' },
  errorMessage: { backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1rem' },
  listingsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' },
  listingCard: { backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden' },
  listingImage: { backgroundColor: '#d1d5db', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' },
  listingContent: { padding: '1rem' },
  listingTitle: { fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem' },
  listingPrice: { fontSize: '1.875rem', fontWeight: 'bold', color: '#16a34a', marginBottom: '1rem' },
  eventCard: { backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '1.5rem' },
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) };
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [authPage, setAuthPage] = useState('login');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // Auth
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  // Marketplace
  // //const [listings, setListings] = useState([]);
  // const [searchQuery, setSearchQuery] = useState('');
  // const [category, setCategory] = useState('');
  // const [showCreateForm, setShowCreateForm] = useState(false);
  // const [formData, setFormData] = useState({ title: '', description: '', category: 'Electronics', price: '', condition: 'Good', location: 'Campus' });//

  // Events
  const [events, setEvents] = useState([]);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [eventFormData, setEventFormData] = useState({ title: '', description: '', date: '', venue: '', category: 'Other', capacity: '' });

  // const categories = ['Books', 'Electronics', 'Furniture', 'Clothing', 'Stationery', 'Sports', 'Other'];
  // const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };


  // const fetchListings = async () => {
  //   setLoading(true);
  //   try {
  //     let url = `${API_BASE}/marketplace/listings?limit=12`;
  //     if (category) url += `&category=${category}`;
  //     if (searchQuery) url += `&search=${searchQuery}`;
  //     const response = await fetch(url);
  //     const data = await response.json();
  //     setListings(data.data || []);
  //   } catch (error) {
  //     showMessage('error', '❌ Cannot connect to backend');
  //   }
  //   setLoading(false);
  // };

  // const createListing = async () => {
  //   if (!formData.title || !formData.description || !formData.price) {
  //     showMessage('error', '⚠️ Please fill all required fields');
  //     return;
  //   }
  //   try {
  //     const response = await fetch(`${API_BASE}/marketplace/listings`, {
  //       method: 'POST',
  //       headers: getAuthHeaders(),
  //       body: JSON.stringify(formData)
  //     });
  //     if (response.ok) {
  //       showMessage('success', '✅ Listing created!');
  //       setShowCreateForm(false);
  //       setFormData({ title: '', description: '', category: 'Electronics', price: '', condition: 'Good', location: 'Campus' });
  //       fetchListings();
  //     } else {
  //       showMessage('error', '❌ Error creating listing');
  //     }
  //   } catch (error) {
  //     showMessage('error', '❌ Error creating listing');
  //   }
  // };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/events`);
      const data = await response.json();
      setEvents(data.data || []);
    } catch (error) {
      showMessage('error', '❌ Cannot fetch events');
    }
    setLoading(false);
  };

  const createEvent = async () => {
    if (!eventFormData.title || !eventFormData.description || !eventFormData.date || !eventFormData.venue) {
      showMessage('error', '⚠️ Please fill all required fields');
      return;
    }
    try {
      const payload = { ...eventFormData, capacity: eventFormData.capacity ? parseInt(eventFormData.capacity) : null };
      const response = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        showMessage('success', '✅ Event created!');
        setShowCreateEvent(false);
        setEventFormData({ title: '', description: '', date: '', venue: '', category: 'Other', capacity: '' });
        fetchEvents();
      } else {
        showMessage('error', '❌ Error creating event');
      }
    } catch (error) {
      showMessage('error', '❌ Error creating event');
    }
  };

  const rsvpEvent = async (eventId, status) => {
    try {
      const response = await fetch(`${API_BASE}/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        showMessage('success', `✅ RSVP ${status}!`);
        fetchEvents();
      }
    } catch (error) {
      showMessage('error', '❌ Error with RSVP');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const handleRegister = async () => {
    if (!registerName || !registerEmail || !registerPassword) {
      showMessage('error', '⚠️ Please fill all fields');
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: registerName, email: registerEmail, password: registerPassword, role: 'buyer' })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('userId', data.user.user_id);
        showMessage('success', '✅ Registration successful!');
        setAuthPage('login');
      } else {
        showMessage('error', `❌ ${data.message}`);
      }
    } catch (error) {
      showMessage('error', '❌ Registration failed');
    }
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
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user.user_id);
        setIsLoggedIn(true);
        setCurrentPage('home');
        showMessage('success', '✅ Login successful!');
      } else {
        showMessage('error', `❌ ${data.message}`);
      }
    } catch (error) {
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

  // useEffect(() => {
  //   if (isLoggedIn && currentPage === 'marketplace') fetchListings();
  // }, [currentPage, category, searchQuery, isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && currentPage === 'events') fetchEvents();
  }, [currentPage, isLoggedIn]);

  // LOGIN
  if (!isLoggedIn && authPage === 'login') {
    return (
      <div style={styles.authContainer}>
        <div style={styles.authCard}>
          <h1 style={styles.pageTitle}>🏫 Campus Connect</h1>
          <input type="email" placeholder="your@email.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} style={styles.formInput} />
          <input type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} style={styles.formInput} />
          <button onClick={handleLogin} style={styles.submitBtn}>Login</button>
          <div style={{ textAlign: 'center', color: '#6b7280' }}>
            Don't have an account? <button onClick={() => setAuthPage('register')} style={{ backgroundColor: 'transparent', color: '#2563eb', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontWeight: '600' }}>Register</button>
          </div>
          {message.text && <div style={message.type === 'error' ? styles.errorMessage : styles.successMessage}>{message.text}</div>}
        </div>
      </div>
    );
  }

  // REGISTER
  if (!isLoggedIn && authPage === 'register') {
    return (
      <div style={styles.authContainer}>
        <div style={styles.authCard}>
          <h1 style={styles.pageTitle}>Create Account</h1>
          <input type="text" placeholder="Your Name" value={registerName} onChange={(e) => setRegisterName(e.target.value)} style={styles.formInput} />
          <input type="email" placeholder="your@email.com" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} style={styles.formInput} />
          <input type="password" placeholder="••••••••" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} style={styles.formInput} />
          <button onClick={handleRegister} style={styles.submitBtn}>✅ Register</button>
          <div style={{ textAlign: 'center', color: '#6b7280' }}>
            Already have an account? <button onClick={() => setAuthPage('login')} style={{ backgroundColor: 'transparent', color: '#2563eb', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontWeight: '600' }}>Login</button>
          </div>
          {message.text && <div style={message.type === 'error' ? styles.errorMessage : styles.successMessage}>{message.text}</div>}
        </div>
      </div>
    );
  }

  // MAIN APP
  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarBrand}>🏫 Campus</div>
        <div>
          <button onClick={() => setCurrentPage('announcements')} style={{...styles.sidebarItem, ...(currentPage === 'announcements' ? styles.sidebarItemActive : {})}}><Megaphone size={20} /> Announcements</button>
          <button onClick={() => setCurrentPage('marketplace')} style={{...styles.sidebarItem, ...(currentPage === 'marketplace' ? styles.sidebarItemActive : {})}}><ShoppingBag size={20} /> Marketplace</button>
          <button onClick={() => setCurrentPage('lost-found')} style={{...styles.sidebarItem, ...(currentPage === 'lost-found' ? styles.sidebarItemActive : {})}}><AlertCircle size={20} /> Lost & Found</button>
          <button onClick={() => setCurrentPage('events')} style={{...styles.sidebarItem, ...(currentPage === 'events' ? styles.sidebarItemActive : {})}}><Calendar size={20} /> Events</button>
          <button onClick={() => setCurrentPage('messages')} style={{...styles.sidebarItem, ...(currentPage === 'messages' ? styles.sidebarItemActive : {})}}><MessageCircle size={20} /> Messages</button>
          <button onClick={() => setCurrentPage('favorites')} style={{...styles.sidebarItem, ...(currentPage === 'favorites' ? styles.sidebarItemActive : {})}}><Heart size={20} /> My Favorites</button>
          <button onClick={() => setCurrentPage('mylistings')} style={{...styles.sidebarItem, ...(currentPage === 'mylistings' ? styles.sidebarItemActive : {})}}><Package size={20} /> My Listings</button>
          <button onClick={() => setCurrentPage('cart')} style={{...styles.sidebarItem, ...(currentPage === 'cart' ? styles.sidebarItemActive : {})}}><ShoppingCart size={20} /> Cart</button>
          <button onClick={() => setCurrentPage('orders')} style={{...styles.sidebarItem, ...(currentPage === 'orders' ? styles.sidebarItemActive : {})}}><Package size={20} /> Orders</button>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.mainContent}>
        {/* TOP BAR */}
        <div style={styles.topBar}>
          <div style={styles.topBarBrand}>🏫 Campus Connect</div>
          <div style={styles.topBarButtons}>
            <button onClick={() => setCurrentPage('home')} style={{...styles.submitBtn, width: 'auto', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem'}}><Home size={20} /> Home</button>
            <button onClick={() => setCurrentPage('admin')} style={{...styles.submitBtn, width: 'auto', margin: 0, backgroundColor: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>⚙️ Admin</button>
            <button onClick={handleLogout} style={styles.logoutBtn}><LogOut size={20} /> Logout</button>
          </div>
        </div>

        {/* PAGES */}
        <div style={styles.pageContent}>
          {currentPage === 'home' && (
            <div style={styles.pageContainer}>
              <div style={styles.hero}>
                <h1 style={styles.heroTitle}>Welcome to Campus Connect</h1>
                <p style={{ fontSize: '1.25rem', opacity: 0.9 }}>Your all-in-one platform for campus life</p>
              </div>
              <div style={styles.featureGrid}>
                {[
                  { icon: '📢', title: 'Announcements', desc: 'Stay updated', page: 'announcements' },
                  { icon: '🛒', title: 'Marketplace', desc: 'Buy and sell items', page: 'marketplace' },
                  { icon: '🔍', title: 'Lost & Found', desc: 'Search for lost items', page: 'lost-found' },
                  { icon: '📅', title: 'Events', desc: 'Join campus events', page: 'events' },
                  { icon: '💬', title: 'Messages', desc: 'Connect with others', page: 'messages' },
                  { icon: '⚙️', title: 'Admin', desc: 'Manage content', page: 'admin' }
                ].map((feature, i) => (
                  <div key={i} style={styles.featureCard} onClick={() => setCurrentPage(feature.page)} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={styles.featureIcon}>{feature.icon}</div>
                    <h3 style={styles.featureTitle}>{feature.title}</h3>
                    <p style={{ color: '#6b7280' }}>{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        {/* {currentPage === 'marketplace' && (
            <div style={styles.pageContainer}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={styles.pageTitle}>🛒 Marketplace</h1>
                <button onClick={() => setShowCreateForm(true)} style={{...styles.submitBtn, width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0}}><Plus size={20} /> Create</button>
              </div>
              {message.text && <div style={message.type === 'error' ? styles.errorMessage : styles.successMessage}>{message.text}</div>}
              <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                <input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{...styles.formInput, flex: 1, marginBottom: 0}} />
                <select value={category} onChange={(e) => setCategory(e.target.value)} style={{...styles.formInput, flex: 1, marginBottom: 0}}>
                  <option value="">All Categories</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              {loading ? <div style={styles.emptyState}>⏳ Loading...</div> : listings.length === 0 ? <div style={styles.emptyState}>No listings found</div> : (
                <div style={styles.listingsGrid}>
                  {listings.map(listing => (
                    <div key={listing.listing_id} style={styles.listingCard}>
                      <div style={styles.listingImage}>[Image]</div>
                      <div style={styles.listingContent}>
                        <div style={styles.listingTitle}>{listing.title}</div>
                        <div style={styles.listingPrice}>${listing.price}</div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button style={{...styles.submitBtn, flex: 1, padding: '0.5rem', margin: 0, fontSize: '0.85rem'}}>💬 Message</button>
                          <button style={{...styles.submitBtn, flex: 1, padding: '0.5rem', margin: 0, fontSize: '0.85rem', backgroundColor: '#ef4444'}}>❤️</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {showCreateForm && (
                <div style={styles.authContainer}>
                  <div style={styles.authCard}>
                    <h2 style={styles.pageTitle}>Create Listing</h2>
                    <input placeholder="Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} style={styles.formInput} />
                    <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} style={{...styles.formInput, minHeight: '100px'}} />
                    <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} style={styles.formInput}>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <input placeholder="Price" type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} style={styles.formInput} />
                    <select value={formData.condition} onChange={(e) => setFormData({...formData, condition: e.target.value})} style={styles.formInput}>
                      {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input placeholder="Location" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} style={styles.formInput} />
                    <button onClick={createListing} style={styles.submitBtn}>Create</button>
                    <button onClick={() => setShowCreateForm(false)} style={{...styles.submitBtn, backgroundColor: '#9ca3af', marginBottom: 0}}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )} */} 
          {currentPage === 'marketplace' && <Marketplace />}
          {currentPage === 'cart' && <Cart />}
          {currentPage === 'orders' && <Orders />}
          {currentPage === 'messages' && <MessagesPage />}
          {currentPage === 'favorites' && <FavoritesPage />}
          {currentPage === 'mylistings' && <MyListingsPage />}

          {currentPage === 'events' && (
            <div style={styles.pageContainer}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={styles.pageTitle}>📅 Events</h1>
                <button onClick={() => setShowCreateEvent(true)} style={{...styles.submitBtn, width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0}}><Plus size={20} /> Create</button>
              </div>
              {message.text && <div style={message.type === 'error' ? styles.errorMessage : styles.successMessage}>{message.text}</div>}
              {loading ? <div style={styles.emptyState}>⏳ Loading...</div> : events.length === 0 ? <div style={styles.emptyState}>No events found</div> : (
                events.map(event => (
                  <div key={event._id} style={styles.eventCard}>
                    <span style={{ display: 'inline-block', backgroundColor: '#dbeafe', color: '#1e40af', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.75rem' }}>{event.category}</span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{event.title}</h3>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.5rem' }}>📅 {formatDate(event.date)} | 📍 {event.venue}</p>
                    <p style={{ color: '#4b5563', marginBottom: '1rem' }}>{event.description.substring(0, 150)}...</p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => rsvpEvent(event._id, 'interested')} style={{...styles.submitBtn, flex: 1, padding: '0.5rem', margin: 0, fontSize: '0.85rem', backgroundColor: '#fef3c7', color: '#92400e'}}>⭐ Interested</button>
                      <button onClick={() => rsvpEvent(event._id, 'going')} style={{...styles.submitBtn, flex: 1, padding: '0.5rem', margin: 0, fontSize: '0.85rem'}}>✅ Going</button>
                    </div>
                  </div>
                ))
              )}
              {showCreateEvent && (
                <div style={styles.authContainer}>
                  <div style={styles.authCard}>
                    <h2 style={styles.pageTitle}>Create Event</h2>
                    <input placeholder="Title" value={eventFormData.title} onChange={(e) => setEventFormData({...eventFormData, title: e.target.value})} style={styles.formInput} />
                    <textarea placeholder="Description" value={eventFormData.description} onChange={(e) => setEventFormData({...eventFormData, description: e.target.value})} style={{...styles.formInput, minHeight: '100px'}} />
                    <input placeholder="Date & Time" type="datetime-local" value={eventFormData.date} onChange={(e) => setEventFormData({...eventFormData, date: e.target.value})} style={styles.formInput} />
                    <input placeholder="Venue" value={eventFormData.venue} onChange={(e) => setEventFormData({...eventFormData, venue: e.target.value})} style={styles.formInput} />
                    <select value={eventFormData.category} onChange={(e) => setEventFormData({...eventFormData, category: e.target.value})} style={styles.formInput}>
                      <option value="Other">Other</option>
                      <option value="Academic">Academic</option>
                      <option value="Sports">Sports</option>
                      <option value="Cultural">Cultural</option>
                    </select>
                    <input placeholder="Capacity (optional)" type="number" value={eventFormData.capacity} onChange={(e) => setEventFormData({...eventFormData, capacity: e.target.value})} style={styles.formInput} />
                    <button onClick={createEvent} style={styles.submitBtn}>Create</button>
                    <button onClick={() => setShowCreateEvent(false)} style={{...styles.submitBtn, backgroundColor: '#9ca3af', marginBottom: 0}}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {['announcements', 'lost-found', 'admin'].includes(currentPage) && (
            <div style={styles.pageContainer}>
              <h1 style={styles.pageTitle}>{currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}</h1>
              <div style={styles.emptyState}>
                <p style={{ fontSize: '1.25rem', fontWeight: '600' }}>Coming Soon</p>
              </div>
            </div>
          )}
         </div>
      </div>
    </div>
  );
}