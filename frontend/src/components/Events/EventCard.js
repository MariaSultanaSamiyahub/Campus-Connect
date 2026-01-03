import React, { useState } from 'react';
import './Events.css';

const API_BASE = 'http://localhost:5000/api';

const EventCard = ({ event, onUpdate, onViewDetails }) => {
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem('userId');

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  // Check if user has RSVP'd
  const userRSVP = event.attendees?.find(
    (attendee) => attendee.user === userId || attendee.user._id === userId
  );

  const formatDate = (date) => {
    const eventDate = new Date(date);
    return eventDate.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    const eventDate = new Date(date);
    return eventDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRSVP = async (status) => {
    if (!userId) {
      alert('Please login to RSVP');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/events/${event._id}/rsvp`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        onUpdate(); // Refresh events
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to RSVP');
      }
    } catch (error) {
      alert(error.message || 'Failed to RSVP');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRSVP = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/events/${event._id}/rsvp`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        onUpdate(); // Refresh events
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to cancel RSVP');
      }
    } catch (error) {
      alert(error.message || 'Failed to cancel RSVP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="event-card">
      <div className="event-card-header">
        <span className={`event-category ${event.category.toLowerCase()}`}>
          {event.category}
        </span>
        {event.capacity && (
          <span className="event-capacity">
            {event.attendees?.length || 0}/{event.capacity}
          </span>
        )}
      </div>

      <h3 
        className="event-title" 
        onClick={() => onViewDetails && onViewDetails(event)}
        style={{ cursor: onViewDetails ? 'pointer' : 'default' }}
      >
        {event.title}
      </h3>

      <div className="event-details">
        <div className="event-detail-item">
          <span className="icon">📅</span>
          <span>{formatDate(event.date)}</span>
        </div>
        <div className="event-detail-item">
          <span className="icon">🕐</span>
          <span>{formatTime(event.date)}</span>
        </div>
        <div className="event-detail-item">
          <span className="icon">📍</span>
          <span>{event.venue}</span>
        </div>
        <div className="event-detail-item">
          <span className="icon">👤</span>
          <span>{event.organizerName || event.organizer?.name || 'Organizer'}</span>
        </div>
      </div>

      <p className="event-description">
        {event.description.substring(0, 100)}
        {event.description.length > 100 && '...'}
      </p>

      <div className="event-footer">
        <div className="event-attendees">
          <span className="icon">👥</span>
          <span>{event.attendees?.length || 0} attending</span>
        </div>

        <div className="event-actions">
          {userRSVP ? (
            <>
              <span className="rsvp-status">
                {userRSVP.status === 'going' ? '✅ Going' : '⭐ Interested'}
              </span>
              <button
                className="btn-cancel"
                onClick={handleCancelRSVP}
                disabled={loading}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                className="btn-interested"
                onClick={() => handleRSVP('interested')}
                disabled={loading}
              >
                ⭐ Interested
              </button>
              <button
                className="btn-going"
                onClick={() => handleRSVP('going')}
                disabled={loading}
              >
                ✅ Going
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;