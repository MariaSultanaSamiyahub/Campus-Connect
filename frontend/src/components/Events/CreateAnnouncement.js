import React, { useState } from 'react';
import { X } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const styles = {
  modal: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    zIndex: 50
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 20px 25px rgba(0,0,0,0.15)',
    maxWidth: '672px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    padding: '1.5rem',
    position: 'relative'
  },
  closeButton: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    color: '#6b7280'
  },
  title: { fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1.5rem' },
  formGroup: { marginBottom: '1rem' },
  label: { display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' },
  input: {
    width: '100%',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    padding: '0.75rem',
    fontSize: '1rem',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    padding: '0.75rem',
    fontSize: '1rem',
    boxSizing: 'border-box',
    minHeight: '150px',
    fontFamily: 'inherit',
    resize: 'vertical'
  },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '0.5rem'
  },
  checkbox: { width: '1rem', height: '1rem', cursor: 'pointer' },
  buttonGroup: { display: 'flex', gap: '0.5rem', marginTop: '1.5rem' },
  submitBtn: {
    flex: 1,
    backgroundColor: '#22c55e',
    color: 'white',
    padding: '0.75rem',
    borderRadius: '0.375rem',
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#d1d5db',
    color: '#1f2937',
    padding: '0.75rem',
    borderRadius: '0.375rem',
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '1rem'
  }
};

const CreateAnnouncement = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    department: '',
    is_pinned: false
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      alert('Please fill in title and content');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/announcements`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
      } else {
        alert(data.message || 'Error creating announcement');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating announcement');
    }
    setLoading(false);
  };

  const categories = ['Academic', 'General', 'Event', 'Important', 'Other'];
  const departments = ['', 'Computer Science', 'Engineering', 'Business', 'Science', 'Arts', 'Other'];

  return (
    <div style={styles.modal} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeButton} onClick={onClose}>
          <X size={24} />
        </button>

        <h2 style={styles.title}>Create Announcement</h2>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Title *</label>
            <input
              type="text"
              placeholder="Enter announcement title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Content *</label>
            <textarea
              placeholder="Enter announcement content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              style={styles.textarea}
              required
            />
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={styles.input}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Department (leave blank for all)</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                style={styles.input}
              >
                <option value="">All Departments</option>
                {departments.filter(d => d).map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.formGroup}>
            <div style={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="is_pinned"
                checked={formData.is_pinned}
                onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                style={styles.checkbox}
              />
              <label htmlFor="is_pinned" style={styles.label}>
                Pin this announcement (appears at top)
              </label>
            </div>
          </div>

          <div style={styles.buttonGroup}>
            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? '⏳ Creating...' : '✅ Create Announcement'}
            </button>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAnnouncement;

