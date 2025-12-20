import React, { useState, useEffect } from 'react';
import { getMyEvents } from '../../services/eventService';
import EventCard from './EventCard';
import './Events.css';

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const data = await getMyEvents();
      setEvents(data.data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch your events');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    const eventDate = new Date(date);
    return eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Group events by date
  const groupedEvents = events.reduce((groups, event) => {
    const date = formatDate(event.date);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {});

  return (
    <div className="my-events-container">
      <div className="my-events-header">
        <h1>📅 My Event Calendar</h1>
        <p>Your upcoming registered events</p>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="loading">
          <p>Loading your events...</p>
        </div>
      ) : (
        <>
          {events.length > 0 ? (
            <div className="calendar-view">
              {Object.entries(groupedEvents).map(([date, dateEvents]) => (
                <div key={date} className="calendar-day">
                  <h2 className="calendar-date">{date}</h2>
                  <div className="event-grid">
                    {dateEvents.map((event) => (
                      <EventCard key={event._id} event={event} onUpdate={fetchMyEvents} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-events">
              <p>📅 No upcoming events</p>
              <p>Browse events and RSVP to see them here!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyEvents;