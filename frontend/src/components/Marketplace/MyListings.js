import React, { useState, useEffect } from 'react';
import { Package, Edit, Trash2, Eye, Plus, X, MapPin, DollarSign } from 'lucide-react';
import './Marketplace.css';

const API_BASE = 'http://localhost:5000/api/marketplace';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

export default function MyListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Electronics',
    price: '',
    condition: 'Good',
    location: 'Campus',
    stock: 1,
    status: 'active'
  });

  const categories = ['Books', 'Electronics', 'Furniture', 'Clothing', 'Stationery', 'Sports', 'Other'];
  const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
  const token = localStorage.getItem('token');

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const fetchMyListings = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/listings/my`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        setListings(data.data || []);
      }
    } catch (error) {
      showMessage('error', '❌ Failed to load listings');
    }
    setLoading(false);
  };

  const openEditModal = (listing) => {
    setSelectedListing(listing);
    setFormData({
      title: listing.title,
      description: listing.description,
      category: listing.category,
      price: listing.price,
      condition: listing.condition,
      location: listing.location,
      stock: listing.stock || 1,
      status: listing.status
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedListing(null);
  };

  const updateListing = async () => {
    if (!formData.title || !formData.description || !formData.price) {
      showMessage('error', '⚠️ Please fill all required fields');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/listings/${selectedListing.listing_id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', '✅ Listing updated successfully!');
        closeEditModal();
        fetchMyListings();
      } else {
        showMessage('error', data.message || '❌ Failed to update listing');
      }
    } catch (error) {
      showMessage('error', '❌ Failed to update listing');
    }
  };

  const deleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;

    try {
      const response = await fetch(`${API_BASE}/listings/${listingId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        showMessage('success', '✅ Listing deleted successfully!');
        fetchMyListings();
      } else {
        showMessage('error', '❌ Failed to delete listing');
      }
    } catch (error) {
      showMessage('error', '❌ Failed to delete listing');
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, [token]);

  if (!token) {
    return (
      <div className="page-container center-content">
        <div className="login-required">
          <Package size={64} color="#2563eb" />
          <h2>Please Login</h2>
          <p>You need to be logged in to view your listings</p>
        </div>
      </div>
    );
  }

  const activeListings = listings.filter(l => l.status === 'active');
  const soldListings = listings.filter(l => l.status === 'sold');
  const removedListings = listings.filter(l => l.status === 'removed');

  return (
    <div className="page-container">
      <div className="content-wrapper">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">
            <Package size={32} color="#2563eb" /> My Listings
          </h1>
          <div className="stats-container">
            <span>📦 Active: {activeListings.length}</span>
            <span>✅ Sold: {soldListings.length}</span>
            <span>🗑️ Removed: {removedListings.length}</span>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`message-alert ${message.type === 'error' ? 'message-alert-error' : 'message-alert-success'}`}>
            {message.text}
          </div>
        )}

        {/* Listings Grid */}
        {loading ? (
          <div className="loading-container">
            <p className="loading-text">⏳ Loading listings...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="empty-state">
            <Package size={64} color="#2563eb" className="empty-state-icon" />
            <p className="empty-state-title">No listings yet</p>
            <p>Create your first listing in the marketplace!</p>
          </div>
        ) : (
          <div className="listings-grid">
            {listings.map(listing => (
              <div
                key={listing.listing_id}
                className={`listing-card ${listing.status === 'removed' ? 'listing-card-faded' : ''}`}
              >
                {/* Image */}
                <div className="card-image-container">
                  {listing.images && listing.images[0] ? (
                    <img src={listing.images[0]} alt={listing.title} className="card-image" />
                  ) : (
                    '[Image]'
                  )}
                  <div className={`status-badge ${
                    listing.status === 'active' ? 'status-badge-active' :
                    listing.status === 'sold' ? 'status-badge-sold' :
                    'status-badge-removed'
                  }`}>
                    {listing.status}
                  </div>
                  <div className="category-badge">{listing.category}</div>
                </div>

                {/* Content */}
                <div className="card-content">
                  <h3 className="card-title">{listing.title}</h3>
                  <div className="card-price">${listing.price}</div>

                  <div className="card-info">
                    <MapPin size={16} />
                    <span>{listing.location}</span>
                  </div>

                  <div className="card-info">
                    <Package size={16} />
                    <span>Stock: {listing.stock || 1}</span>
                  </div>

                  <div className="card-info-last">
                    <Eye size={16} />
                    <span>{listing.view_count || 0} views</span>
                  </div>

                  {/* Buttons */}
                  <div className="card-buttons">
                    <button
                      onClick={() => openEditModal(listing)}
                      disabled={listing.status === 'removed'}
                      className={listing.status === 'removed' ? 'btn-edit-disabled' : 'btn-edit'}
                    >
                      <Edit size={16} /> Edit
                    </button>
                    <button
                      onClick={() => deleteListing(listing.listing_id)}
                      className="btn-delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedListing && (
          <div className="modal-overlay" onClick={closeEditModal}>
            <div className="modal-content-small" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Edit Listing</h2>
                <button onClick={closeEditModal} className="modal-close-btn">
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    className="form-textarea"
                  />
                </div>

                <div className="form-grid">
                  <div>
                    <label className="form-label">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="form-select"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Price ($) *</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      min="0"
                      step="0.01"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div>
                    <label className="form-label">Condition</label>
                    <select
                      value={formData.condition}
                      onChange={(e) => setFormData({...formData, condition: e.target.value})}
                      className="form-select"
                    >
                      {conditions.map(cond => (
                        <option key={cond} value={cond}>{cond}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Stock</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 1})}
                      min="0"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div>
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="form-select"
                    >
                      <option value="active">Active</option>
                      <option value="sold">Sold</option>
                      <option value="removed">Removed</option>
                    </select>
                  </div>
                </div>

                <div className="modal-actions">
                  <button onClick={closeEditModal} className="btn-cancel">
                    Cancel
                  </button>
                  <button onClick={updateListing} className="btn-submit-blue">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}