import axios from 'axios';

const API_URL = 'http://localhost:5000/api/events';

// Get auth token
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

// Get all events
export const getEvents = async (filters = {}) => {
  try {
    const { category, status, search } = filters;
    let queryParams = new URLSearchParams();
    
    if (category) queryParams.append('category', category);
    if (status) queryParams.append('status', status);
    if (search) queryParams.append('search', search);

    const response = await axios.get(`${API_URL}?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get single event
export const getEvent = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Create event
export const createEvent = async (eventData) => {
  try {
    const response = await axios.post(API_URL, eventData, getAuthToken());
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update event
export const updateEvent = async (id, eventData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, eventData, getAuthToken());
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete event
export const deleteEvent = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, getAuthToken());
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// RSVP to event
export const rsvpEvent = async (id, status = 'interested') => {
  try {
    const response = await axios.post(
      `${API_URL}/${id}/rsvp`,
      { status },
      getAuthToken()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Cancel RSVP
export const cancelRSVP = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}/rsvp`, getAuthToken());
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get my registered events (FIXED - removed /user/ from path)
export const getMyEvents = async () => {
  try {
    const response = await axios.get(`${API_URL}/my-events`, getAuthToken());
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};