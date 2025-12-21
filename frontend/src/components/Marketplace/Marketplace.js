import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Search, Heart, MessageCircle, Eye, X, Edit, Trash2, DollarSign, MapPin, Package, Calendar, User, ArrowLeft, ShoppingCart, Star } from 'lucide-react';
import './Marketplace.css';

const API_BASE = 'http://localhost:5000/api/marketplace';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

export default function MarketplaceApp() {
  const [listings, setListings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [selectedListing, setSelectedListing] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [ratingData, setRatingData] = useState({ rating: 5, review: '' });
  const [reviews, setReviews] = useState([]);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Electronics',
    price: '',
    condition: 'Good',
    location: 'Campus',
    stock: 1,
    images: []
  });

  const categories = ['Books', 'Electronics', 'Furniture', 'Clothing', 'Stationery', 'Sports', 'Other'];
  const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const isOwnListing = (listing) => {
    return userId && listing.seller_id === userId;
  };

  const fetchListings = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/listings?limit=50`;
      if (category) url += `&category=${category}`;
      if (searchQuery) url += `&search=${searchQuery}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setListings(data.data || []);
      }
    } catch (error) {
      showMessage('error', '❌ Failed to load listings');
    }
    setLoading(false);
  };

  const fetchFavorites = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_BASE}/favorites`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        setFavorites(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    }
  };

  const fetchReviews = async (listingId) => {
    try {
      const response = await fetch(`${API_BASE}/listings/${listingId}/reviews`);
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.data.reviews || []);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const addToCart = async (listingId, e) => {
    if (e) e.stopPropagation();
    
    if (!token || !userId) {
      showMessage('error', '⚠️ Please login to add items to cart');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/cart`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ listingId, quantity: 1 })
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', '🛒 Added to cart!');
      } else {
        showMessage('error', data.message || '❌ Failed to add to cart');
      }
    } catch (error) {
      showMessage('error', '❌ Failed to add to cart');
    }
  };

  const toggleFavorite = async (listingId, e) => {
    e.stopPropagation();
    
    if (!token || !userId) {
      showMessage('error', '⚠️ Please login to add favorites');
      return;
    }

    const isFavorite = favorites.some(fav => fav.listing_id === listingId);

    try {
      if (isFavorite) {
        const response = await fetch(`${API_BASE}/listings/${listingId}/favorite`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        
        if (response.ok) {
          showMessage('success', '💔 Removed from favorites');
          fetchFavorites();
        }
      } else {
        const response = await fetch(`${API_BASE}/listings/${listingId}/favorite`, {
          method: 'POST',
          headers: getAuthHeaders()
        });
        
        if (response.ok) {
          showMessage('success', '❤️ Added to favorites');
          fetchFavorites();
        }
      }
    } catch (error) {
      showMessage('error', '❌ Failed to update favorites');
    }
  };

  const openDetailModal = async (listing) => {
    setSelectedListing(listing);
    setShowDetailModal(true);
    
    try {
      const response = await fetch(`${API_BASE}/listings/${listing.listing_id}`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedListing(data.data);
        fetchReviews(data.data.listing_id);
      }
    } catch (error) {
      console.error('Failed to fetch listing details');
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedListing(null);
    setReviews([]);
  };

  const openRatingModal = () => {
    setShowRatingModal(true);
    setRatingData({ rating: 5, review: '' });
  };

  const submitRating = async () => {
    if (!ratingData.rating || ratingData.rating < 1 || ratingData.rating > 5) {
      showMessage('error', '❌ Please select a valid rating (1-5 stars)');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/listings/${selectedListing.listing_id}/rate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(ratingData)
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', '⭐ Rating submitted successfully!');
        setShowRatingModal(false);
        fetchReviews(selectedListing.listing_id);
        openDetailModal(selectedListing); // Refresh listing
      } else {
        showMessage('error', data.message || '❌ Failed to submit rating');
      }
    } catch (error) {
      showMessage('error', '❌ Failed to submit rating');
    }
  };

  const startConversation = async (sellerId, listingId, e) => {
    if (e) e.stopPropagation();
    
    if (!token || !userId) {
      showMessage('error', '⚠️ Please login to message seller');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/conversations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          otherUserId: sellerId,
          listingId: listingId
        })
      });

      if (response.ok) {
        showMessage('success', '💬 Conversation started! Check your messages');
      }
    } catch (error) {
      showMessage('error', '❌ Failed to start conversation');
    }
  };

  const navigateToEdit = (listing, e) => {
    e.stopPropagation();
    showMessage('success', '📝 Redirecting to edit...');
  };

  const createListing = async () => {
    if (!token || !userId) {
      showMessage('error', '⚠️ Please login to create listing');
      return;
    }

    if (!formData.title || !formData.description || !formData.price) {
      showMessage('error', '⚠️ Please fill all required fields');
      return;
    }

    if (!formData.images || formData.images.length === 0) {
      showMessage('error', '⚠️ Please add at least one product image');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/listings`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', '✅ Listing created successfully!');
        setShowCreateModal(false);
        setFormData({
          title: '',
          description: '',
          category: 'Electronics',
          price: '',
          condition: 'Good',
          location: 'Campus',
          stock: 1,
          images: []
        });
        fetchListings();
      } else {
        showMessage('error', data.message || '❌ Failed to create listing');
      }
    } catch (error) {
      showMessage('error', '❌ Failed to create listing');
    }
  };

  const handleImageUrlAdd = () => {
    const url = prompt('Enter image URL:');
    if (url && url.trim()) {
      setFormData({...formData, images: [...formData.images, url.trim()]});
    }
  };

  useEffect(() => {
    fetchListings();
  }, [category, searchQuery]);

  useEffect(() => {
    if (userId && token) {
      fetchFavorites();
    }
  }, [userId, token]);

  const isFavorite = (listingId) => {
    return favorites.some(fav => fav.listing_id === listingId);
  };

  const renderStars = (rating) => {
    return Array.from({length: 5}, (_, i) => (
      <Star
        key={i}
        size={16}
        fill={i < rating ? '#f59e0b' : 'none'}
        color={i < rating ? '#f59e0b' : '#d1d5db'}
      />
    ));
  };

  return (
    <div className="page-container">
      <div className="content-wrapper">
        {/* Header */}
        <div className="page-header-flex">
          <div>
            <h1 className="page-title">🛍️ Campus Marketplace</h1>
            <p className="page-subtitle">Buy and sell items within your campus community</p>
            {!token && (
              <p className="warning-text">
                ⚠️ Please login to message sellers and add favorites
              </p>
            )}
          </div>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary">
            <Plus size={20} /> Create Listing
          </button>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`message-alert ${message.type === 'error' ? 'message-alert-error' : 'message-alert-success'}`}>
            {message.text}
          </div>
        )}

        {/* Search and Filters */}
        <div className="search-filter-container">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="loading-container">
            <p className="loading-text">⏳ Loading products...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="loading-container">
            <p className="loading-text">📦 No listings found</p>
            <p>Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="listings-grid">
            {listings.map(listing => (
              <div
                key={listing.listing_id}
                onClick={() => openDetailModal(listing)}
                className="listing-card"
              >
                {/* Image */}
                <div className="card-image-container">
                  {listing.images && listing.images[0] ? (
                    <img src={listing.images[0]} alt={listing.title} className="card-image" />
                  ) : (
                    '[Image]'
                  )}
                  <div className="category-badge">{listing.category}</div>
                  
                  {isOwnListing(listing) && (
                    <div className="status-badge status-badge-active" style={{ top: '0.75rem', left: 'auto', right: '0.75rem' }}>
                      YOUR LISTING
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="card-content">
                  <h3 className="card-title">{listing.title}</h3>
                  <div className="card-price">${listing.price}</div>

                  {/* Rating Display */}
                  {listing.rating > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {renderStars(Math.round(listing.rating))}
                      </div>
                      <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {listing.rating.toFixed(1)} ({listing.total_ratings})
                      </span>
                    </div>
                  )}

                  <div className="card-info">
                    <MapPin size={16} />
                    <span>{listing.location}</span>
                  </div>

                  <div className="card-info-last">
                    <Package size={16} />
                    <span>Stock: {listing.quantity || listing.stock || 0}</span>
                  </div>

                  {/* Buttons */}
                  <div className="card-buttons">
                    {isOwnListing(listing) ? (
                      <button
                        onClick={(e) => navigateToEdit(listing, e)}
                        className="btn-edit"
                        style={{ flex: 1 }}
                      >
                        <Edit size={16} /> Edit Listing
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={(e) => addToCart(listing.listing_id, e)}
                          className="btn-message"
                        >
                          <ShoppingCart size={16} /> Add to Cart
                        </button>
                        <button
                          onClick={(e) => toggleFavorite(listing.listing_id, e)}
                          className={`btn-favorite ${isFavorite(listing.listing_id) ? 'btn-favorite-active' : 'btn-favorite-inactive'}`}
                        >
                          <Heart size={16} fill={isFavorite(listing.listing_id) ? 'white' : 'none'} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedListing && (
          <div className="modal-overlay" onClick={closeDetailModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Product Details</h2>
                <button onClick={closeDetailModal} className="modal-close-btn">
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <div className="modal-image-container">
                  {selectedListing.images && selectedListing.images[0] ? (
                    <img src={selectedListing.images[0]} alt={selectedListing.title} className="modal-image" />
                  ) : (
                    <span className="modal-image-placeholder">[Product Image]</span>
                  )}
                </div>

                <h1 className="detail-title">{selectedListing.title}</h1>
                <div className="detail-price">${selectedListing.price}</div>

                {/* Product Rating */}
                {selectedListing.rating > 0 && (
                  <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {renderStars(Math.round(selectedListing.rating))}
                      </div>
                      <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                        {selectedListing.rating.toFixed(1)}
                      </span>
                      <span style={{ color: '#6b7280' }}>
                        ({selectedListing.total_ratings} rating{selectedListing.total_ratings !== 1 ? 's' : ''})
                      </span>
                    </div>
                  </div>
                )}

                <div className="info-grid">
                  <div>
                    <div className="info-item-label">Category</div>
                    <div className="info-item-value">{selectedListing.category}</div>
                  </div>
                  <div>
                    <div className="info-item-label">Condition</div>
                    <div className="info-item-value">{selectedListing.condition}</div>
                  </div>
                  <div>
                    <div className="info-item-label">Stock</div>
                    <div className="info-item-value">{selectedListing.quantity || selectedListing.stock || 0}</div>
                  </div>
                  <div>
                    <div className="info-item-label">Views</div>
                    <div className="info-item-value">{selectedListing.view_count || 0}</div>
                  </div>
                </div>

                <div className="description-section">
                  <h3 className="description-title">Description</h3>
                  <p className="description-text">{selectedListing.description}</p>
                </div>

                <div className="seller-info-box">
                  <h3 className="seller-info-title">Seller Information</h3>
                  <div className="seller-info-row">
                    <User size={18} color="#6b7280" />
                    <span className="seller-name">{selectedListing.seller?.name || 'Unknown'}</span>
                  </div>
                  
                  {isOwnListing(selectedListing) && (
                    <div style={{ 
                      marginTop: '0.75rem', 
                      padding: '0.5rem', 
                      backgroundColor: '#dbeafe', 
                      borderRadius: '0.5rem',
                      color: '#1e40af',
                      fontWeight: '600',
                      fontSize: '0.875rem'
                    }}>
                      👤 You are the seller of this listing
                    </div>
                  )}
                </div>

                {/* Reviews Section */}
                {reviews.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 className="description-title">Customer Reviews</h3>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {reviews.map((review, idx) => (
                        <div key={idx} style={{ 
                          padding: '1rem', 
                          backgroundColor: '#f9fafb', 
                          borderRadius: '0.5rem', 
                          marginBottom: '0.75rem' 
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', gap: '2px' }}>
                              {renderStars(review.rating)}
                            </div>
                            <span style={{ fontWeight: '600' }}>{review.user_name}</span>
                          </div>
                          {review.review && <p style={{ color: '#4b5563', fontSize: '0.875rem' }}>{review.review}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="modal-actions">
                  {isOwnListing(selectedListing) ? (
                    <button
                      onClick={(e) => {
                        navigateToEdit(selectedListing, e);
                        closeDetailModal();
                      }}
                      className="btn-edit"
                      style={{ flex: 1, padding: '1rem', fontSize: '1rem' }}
                    >
                      <Edit size={20} /> Edit This Listing
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => addToCart(selectedListing.listing_id)}
                        className="btn-submit"
                        style={{ flex: 1 }}
                      >
                        <ShoppingCart size={20} /> Add to Cart
                      </button>
                      <button
                        onClick={() => startConversation(selectedListing.seller_id, selectedListing.listing_id)}
                        className="btn-message-large"
                      >
                        <MessageCircle size={20} /> Message
                      </button>
                      <button
                        onClick={openRatingModal}
                        style={{
                          flex: 1,
                          padding: '1rem',
                          backgroundColor: '#f59e0b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <Star size={20} /> Rate Product
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rating Modal */}
        {showRatingModal && (
          <div className="modal-overlay" onClick={() => setShowRatingModal(false)}>
            <div className="modal-content-small" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Rate This Product</h2>
                <button onClick={() => setShowRatingModal(false)} className="modal-close-btn">
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Your Rating *</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    {[1,2,3,4,5].map(star => (
                      <button
                        key={star}
                        onClick={() => setRatingData({...ratingData, rating: star})}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.5rem'
                        }}
                      >
                        <Star
                          size={32}
                          fill={star <= ratingData.rating ? '#f59e0b' : 'none'}
                          color={star <= ratingData.rating ? '#f59e0b' : '#d1d5db'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group-last">
                  <label className="form-label">Review (Optional)</label>
                  <textarea
                    placeholder="Share your experience with this product..."
                    value={ratingData.review}
                    onChange={(e) => setRatingData({...ratingData, review: e.target.value})}
                    rows={4}
                    className="form-textarea"
                  />
                </div>

                <div className="modal-actions">
                  <button onClick={() => setShowRatingModal(false)} className="btn-cancel">
                    Cancel
                  </button>
                  <button onClick={submitRating} className="btn-submit">
                    Submit Rating
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Listing Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content-small" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Create New Listing</h2>
                <button onClick={() => setShowCreateModal(false)} className="modal-close-btn">
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    placeholder="e.g., iPhone 13 Pro - Like New"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea
                    placeholder="Describe your item in detail..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Images * (At least one required)</label>
                  <button
                    onClick={handleImageUrlAdd}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      marginBottom: '0.5rem'
                    }}
                  >
                    + Add Image URL
                  </button>
                  {formData.images.length > 0 && (
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {formData.images.length} image(s) added
                    </div>
                  )}
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
                      placeholder="0.00"
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
                      min="1"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group-last">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    placeholder="e.g., Campus Library, Dorm A"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="form-input"
                  />
                </div>

                <div className="modal-actions">
                  <button onClick={() => setShowCreateModal(false)} className="btn-cancel">
                    Cancel
                  </button>
                  <button onClick={createListing} className="btn-submit">
                    Create Listing
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