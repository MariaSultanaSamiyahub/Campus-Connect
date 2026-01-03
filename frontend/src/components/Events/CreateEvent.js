import React, { useState } from 'react';
import './Events.css';

const API_BASE = 'http://localhost:5000/api';

const CreateEvent = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    venue: '',
    category: 'Other',
    capacity: ''
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  const categories = ['Academic', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Social', 'Other'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.description || !formData.date || !formData.venue) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const eventData = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : null
      };
      
      const response = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(eventData)
      });

      if (response.ok) {
        alert('Event created successfully!');
        onSuccess();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to create event');
      }
    } catch (error) {
      alert(error.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-event-container">
      <div className="create-event-header">
        <h1>Create New Event</h1>
        <p>Organize an event for your campus community</p>
      </div>

      <form className="create-event-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Event Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Annual Tech Fest 2025"
            required
          />
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your event..."
            rows="4"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Date & Time *</label>
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Venue *</label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              placeholder="e.g., University Auditorium"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Capacity (Optional)</label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="Leave empty for unlimited"
              min="1"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;