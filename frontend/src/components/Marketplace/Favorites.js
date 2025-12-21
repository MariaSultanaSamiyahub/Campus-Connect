import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Eye, X, MapPin, Package, DollarSign, Trash2 } from 'lucide-react';
import './Marketplace.css';

const API_BASE = 'http://localhost:5000/api/marketplace';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const fetchFavorites = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/favorites`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        setFavorites(data.data || []);
      }
    } catch (error) {
      showMessage('error', '❌ Failed to load favorites');
    }
    setLoading(false);
  };

  const removeFromFavorites = async (listingId, e) => {
    e.stopPropagation();
    
    try {
      const response = await fetch(`${API_BASE}/listings/${listingId}/favorite`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        showMessage('success', '💔 Removed from favorites');
        fetchFavorites();
      } else {
        showMessage('error', '❌ Failed to remove from favorites');
      }
    } catch (error) {
      showMessage('error', '❌ Failed to remove from favorites');
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
      }
    } catch (error) {
      console.error('Failed to fetch listing details');
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedListing(null);
  };

  const startConversation = async (sellerId, listingId) => {
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

  useEffect(() => {
    fetchFavorites();
  }, [token]);

  if (!token) {
    return (
      <div className="page-container center-content">
        <div className="login-required">
          <Heart size={64} color="#ef4444" />
          <h2>Please Login</h2>
          <p>You need to be logged in to view favorites</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-wrapper">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">
            <Heart size={32} color="#ef4444" fill="#ef4444" /> My Favorites
          </h1>
          <p className="page-subtitle">
            {favorites.length === 0 ? 'No favorites yet' : `${favorites.length} item${favorites.length !== 1 ? 's' : ''} saved`}
          </p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`message-alert ${message.type === 'error' ? 'message-alert-error' : 'message-alert-success'}`}>
            {message.text}
          </div>
        )}

        {/* Favorites Grid */}
        {loading ? (
          <div className="loading-container">
            <p className="loading-text">⏳ Loading favorites...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="empty-state">
            <Heart size={64} color="#ef4444" className="empty-state-icon" />
            <p className="empty-state-title">No favorites yet</p>
            <p>Start exploring the marketplace and save items you love!</p>
          </div>
        ) : (
          <div className="listings-grid">
            {favorites.map(listing => (
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
                  <div className="favorite-badge">
                    <Heart size={16} fill="white" />
                  </div>
                </div>

                {/* Content */}
                <div className="card-content">
                  <h3 className="card-title">{listing.title}</h3>
                  <div className="card-price">${listing.price}</div>

                  <div className="card-info">
                    <MapPin size={16} />
                    <span>{listing.location}</span>
                  </div>

                  <div className="card-info-last">
                    <Package size={16} />
                    <span>Condition: {listing.condition}</span>
                  </div>

                  {/* Buttons */}
                  <div className="card-buttons">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startConversation(listing.seller_id, listing.listing_id);
                      }}
                      className="btn-message"
                    >
                      <MessageCircle size={16} /> Message
                    </button>
                    <button
                      onClick={(e) => removeFromFavorites(listing.listing_id, e)}
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

        {/* Detail Modal */}
        {showDetailModal && selectedListing && (
          <div className="modal-overlay" onClick={closeDetailModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="modal-header">
                <h2 className="modal-title">Product Details</h2>
                <button onClick={closeDetailModal} className="modal-close-btn">
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                {/* Image */}
                <div className="modal-image-container">
                  {selectedListing.images && selectedListing.images[0] ? (
                    <img src={selectedListing.images[0]} alt={selectedListing.title} className="modal-image" />
                  ) : (
                    <span className="modal-image-placeholder">[Product Image]</span>
                  )}
                </div>

                {/* Title and Price */}
                <h1 className="detail-title">{selectedListing.title}</h1>
                <div className="detail-price">${selectedListing.price}</div>

                {/* Info Grid */}
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
                    <div className="info-item-label">Location</div>
                    <div className="info-item-value">{selectedListing.location}</div>
                  </div>
                  <div>
                    <div className="info-item-label">Views</div>
                    <div className="info-item-value">{selectedListing.view_count || 0}</div>
                  </div>
                </div>

                {/* Description */}
                <div className="description-section">
                  <h3 className="description-title">Description</h3>
                  <p className="description-text">{selectedListing.description}</p>
                </div>

                {/* Action Buttons */}
                <div className="modal-actions">
                  <button
                    onClick={() => startConversation(selectedListing.seller_id, selectedListing.listing_id)}
                    className="btn-message-large"
                  >
                    <MessageCircle size={20} /> Message Seller
                  </button>
                  <button
                    onClick={(e) => {
                      removeFromFavorites(selectedListing.listing_id, e);
                      closeDetailModal();
                    }}
                    className="btn-delete-large"
                  >
                    <Heart size={20} fill="#dc2626" /> Remove
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