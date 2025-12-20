import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { rsvpEvent, cancelRSVP } from '../../services/eventService';
import './Events.css';

const EventCard = ({ event, onUpdate }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem('userId');

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
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      await rsvpEvent(event._id, status);
      onUpdate(); // Refresh events
    } catch (error) {
      alert(error.message || 'Failed to RSVP');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRSVP = async () => {
    try {
      setLoading(true);
      await cancelRSVP(event._id);
      onUpdate(); // Refresh events
    } catch (error) {
      alert(error.message || 'Failed to cancel RSVP');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = () => {
    navigate(`/events/${event._id}`);
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

      <h3 className="event-title" onClick={handleViewDetails}>
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
          <span>{event.organizerName}</span>
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