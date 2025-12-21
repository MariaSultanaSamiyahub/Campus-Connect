import React, { useState, useEffect } from 'react';
import { Package, X, MapPin, Phone, CreditCard, Calendar, Truck, XCircle } from 'lucide-react';
import './Marketplace.css';

const API_BASE = 'http://localhost:5000/api/marketplace';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const token = localStorage.getItem('token');

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const fetchOrders = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/orders`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data || []);
      }
    } catch (error) {
      showMessage('error', '❌ Failed to load orders');
    }
    setLoading(false);
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', '✅ Order cancelled successfully');
        fetchOrders();
        if (selectedOrder && selectedOrder.order_id === orderId) {
          setShowDetailModal(false);
          setSelectedOrder(null);
        }
      } else {
        showMessage('error', data.message || '❌ Failed to cancel order');
      }
    } catch (error) {
      showMessage('error', '❌ Failed to cancel order');
    }
  };

  const openDetailModal = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedOrder(null);
  };

  const getStatusBadgeStyle = (status) => {
    const styles = {
      pending: { backgroundColor: '#fef3c7', color: '#92400e' },
      confirmed: { backgroundColor: '#dbeafe', color: '#1e40af' },
      processing: { backgroundColor: '#e0e7ff', color: '#3730a3' },
      shipped: { backgroundColor: '#ddd6fe', color: '#5b21b6' },
      delivered: { backgroundColor: '#dcfce7', color: '#166534' },
      completed: { backgroundColor: '#dcfce7', color: '#166534' },
      cancelled: { backgroundColor: '#fee2e2', color: '#991b1b' }
    };
    return styles[status] || styles.pending;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  if (!token) {
    return (
      <div className="page-container center-content">
        <div className="login-required">
          <Package size={64} color="#2563eb" />
          <h2>Please Login</h2>
          <p>You need to be logged in to view your orders</p>
        </div>
      </div>
    );
  }

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const activeOrders = orders.filter(o => ['confirmed', 'processing', 'shipped'].includes(o.status));
  const completedOrders = orders.filter(o => ['delivered', 'completed'].includes(o.status));
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');

  return (
    <div className="page-container">
      <div className="content-wrapper">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">
            <Package size={32} color="#2563eb" /> My Orders
          </h1>
          <div className="stats-container">
            <span>⏳ Pending: {pendingOrders.length}</span>
            <span>🚚 Active: {activeOrders.length}</span>
            <span>✅ Completed: {completedOrders.length}</span>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`message-alert ${message.type === 'error' ? 'message-alert-error' : 'message-alert-success'}`}>
            {message.text}
          </div>
        )}

        {/* Orders List */}
        {loading ? (
          <div className="loading-container">
            <p className="loading-text">⏳ Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <Package size={64} color="#2563eb" className="empty-state-icon" />
            <p className="empty-state-title">No orders yet</p>
            <p>Start shopping and your orders will appear here!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map(order => (
              <div
                key={order.order_id}
                onClick={() => openDetailModal(order)}
                style={{
                  backgroundColor: 'white',
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      Order #{order.order_id}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {formatDate(order.created_at)}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '0.375rem 0.875rem',
                      borderRadius: '1rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      ...getStatusBadgeStyle(order.status)
                    }}
                  >
                    {order.status}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      Items
                    </div>
                    <div style={{ fontWeight: '600' }}>
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      Delivery
                    </div>
                    <div style={{ fontWeight: '600', textTransform: 'capitalize' }}>
                      {order.delivery_option === 'campus' ? '🏫 Campus Pickup' : '🏠 Home Delivery'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      Total
                    </div>
                    <div style={{ fontWeight: '700', fontSize: '1.25rem', color: '#16a34a' }}>
                      ${order.total_amount.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {order.items.slice(0, 3).map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        fontSize: '0.875rem',
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '0.375rem',
                        color: '#4b5563'
                      }}
                    >
                      {item.title} x{item.quantity}
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      +{order.items.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Detail Modal */}
        {showDetailModal && selectedOrder && (
          <div className="modal-overlay" onClick={closeDetailModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Order Details</h2>
                <button onClick={closeDetailModal} className="modal-close-btn">
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                {/* Order Status */}
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '0.5rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      Order ID
                    </div>
                    <div style={{ fontWeight: '700', fontSize: '1.125rem' }}>
                      #{selectedOrder.order_id}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '1rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      ...getStatusBadgeStyle(selectedOrder.status)
                    }}
                  >
                    {selectedOrder.status}
                  </div>
                </div>

                {/* Items */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 className="description-title">Items Ordered</h3>
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        gap: '1rem',
                        padding: '1rem',
                        backgroundColor: '#f9fafb',
                        borderRadius: '0.5rem',
                        marginBottom: '0.75rem'
                      }}
                    >
                      <div style={{
                        width: '80px',
                        height: '80px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '0.375rem',
                        overflow: 'hidden'
                      }}>
                        {item.images && item.images[0] ? (
                          <img src={item.images[0]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '0.75rem', color: '#9ca3af' }}>
                            [Image]
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                          Sold by: {item.seller_name}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            Quantity: {item.quantity}
                          </span>
                          <span style={{ fontWeight: '700', color: '#16a34a' }}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Information */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 className="description-title">Delivery Information</h3>
                  <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <Truck size={18} color="#6b7280" />
                      <span style={{ fontWeight: '600' }}>
                        {selectedOrder.delivery_option === 'campus' ? 'Campus Pickup' : 'Home Delivery'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <MapPin size={18} color="#6b7280" style={{ marginTop: '2px' }} />
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                          Address
                        </div>
                        <div style={{ fontWeight: '500' }}>
                          {selectedOrder.delivery_address}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Phone size={18} color="#6b7280" />
                      <div>
                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Phone: </span>
                        <span style={{ fontWeight: '500' }}>{selectedOrder.phone_number}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 className="description-title">Payment Information</h3>
                  <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <CreditCard size={18} color="#6b7280" />
                      <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>
                        {selectedOrder.payment_method.replace('_', ' ')}
                      </span>
                      <span
                        style={{
                          marginLeft: 'auto',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          backgroundColor: selectedOrder.payment_status === 'paid' ? '#dcfce7' : '#fef3c7',
                          color: selectedOrder.payment_status === 'paid' ? '#166534' : '#92400e'
                        }}
                      >
                        {selectedOrder.payment_status}
                      </span>
                    </div>
                    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>Subtotal:</span>
                        <span>${selectedOrder.subtotal.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>Delivery Charge:</span>
                        <span>{selectedOrder.delivery_charge === 0 ? 'FREE' : `$${selectedOrder.delivery_charge.toFixed(2)}`}</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        paddingTop: '0.75rem',
                        borderTop: '2px solid #e5e7eb',
                        fontWeight: '700',
                        fontSize: '1.125rem'
                      }}>
                        <span>Total:</span>
                        <span style={{ color: '#16a34a' }}>${selectedOrder.total_amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 className="description-title">Notes</h3>
                    <p style={{ color: '#4b5563', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                      {selectedOrder.notes}
                    </p>
                  </div>
                )}

                {/* Actions */}
                {selectedOrder.status === 'pending' && (
                  <div className="modal-actions">
                    <button
                      onClick={() => cancelOrder(selectedOrder.order_id)}
                      className="btn-delete-large"
                      style={{ flex: 1 }}
                    >
                      <XCircle size={20} /> Cancel Order
                    </button>
                  </div>
                )}

                {/* Order Timeline */}
                <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    <Calendar size={16} />
                    <span>Order placed on {formatDate(selectedOrder.created_at)}</span>
                  </div>
                  {selectedOrder.completed_at && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                      <Calendar size={16} />
                      <span>Completed on {formatDate(selectedOrder.completed_at)}</span>
                    </div>
                  )}
                  {selectedOrder.cancelled_at && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#ef4444', marginTop: '0.5rem' }}>
                      <XCircle size={16} />
                      <span>Cancelled on {formatDate(selectedOrder.cancelled_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}