import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, MapPin, Home, Building } from 'lucide-react';
import './Marketplace.css';

const API_BASE = 'http://localhost:5000/api/marketplace';
const DELIVERY_CHARGE = 50;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    deliveryOption: 'campus',
    deliveryAddress: '',
    phoneNumber: '',
    paymentMethod: 'cash',
    notes: ''
  });

  const token = localStorage.getItem('token');

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const fetchCart = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/cart`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        setCart(data.data);
      }
    } catch (error) {
      showMessage('error', '❌ Failed to load cart');
    }
    setLoading(false);
  };

  const updateQuantity = async (listingId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      const response = await fetch(`${API_BASE}/cart`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ listingId, quantity: newQuantity })
      });

      const data = await response.json();

      if (response.ok) {
        setCart(data.data);
        showMessage('success', '✅ Cart updated');
      } else {
        showMessage('error', data.message || '❌ Failed to update cart');
      }
    } catch (error) {
      showMessage('error', '❌ Failed to update cart');
    }
  };

  const removeItem = async (listingId) => {
    try {
      const response = await fetch(`${API_BASE}/cart/${listingId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        showMessage('success', '🗑️ Item removed from cart');
        fetchCart();
      } else {
        showMessage('error', '❌ Failed to remove item');
      }
    } catch (error) {
      showMessage('error', '❌ Failed to remove item');
    }
  };

  const proceedToCheckout = () => {
    if (!cart || cart.items.length === 0) {
      showMessage('error', '❌ Cart is empty');
      return;
    }
    setShowCheckout(true);
  };

  const placeOrder = async () => {
    if (checkoutData.deliveryOption === 'home' && !checkoutData.deliveryAddress) {
      showMessage('error', '❌ Please provide delivery address');
      return;
    }

    if (!checkoutData.phoneNumber) {
      showMessage('error', '❌ Please provide phone number');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(checkoutData)
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', '🎉 Order placed successfully!');
        setShowCheckout(false);
        setCheckoutData({
          deliveryOption: 'campus',
          deliveryAddress: '',
          phoneNumber: '',
          paymentMethod: 'cash',
          notes: ''
        });
        fetchCart();
      } else {
        showMessage('error', data.message || '❌ Failed to place order');
      }
    } catch (error) {
      showMessage('error', '❌ Failed to place order');
    }
  };

  useEffect(() => {
    fetchCart();
  }, [token]);

  if (!token) {
    return (
      <div className="page-container center-content">
        <div className="login-required">
          <ShoppingCart size={64} color="#2563eb" />
          <h2>Please Login</h2>
          <p>You need to be logged in to view your cart</p>
        </div>
      </div>
    );
  }

  const subtotal = cart?.total_amount || 0;
  const deliveryCharge = checkoutData.deliveryOption === 'home' ? DELIVERY_CHARGE : 0;
  const total = subtotal + deliveryCharge;

  return (
    <div className="page-container">
      <div className="content-wrapper">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">
            <ShoppingCart size={32} color="#2563eb" /> Shopping Cart
          </h1>
          <p className="page-subtitle">
            {cart?.items?.length || 0} item{cart?.items?.length !== 1 ? 's' : ''} in cart
          </p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`message-alert ${message.type === 'error' ? 'message-alert-error' : 'message-alert-success'}`}>
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <p className="loading-text">⏳ Loading cart...</p>
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="empty-state">
            <ShoppingCart size={64} color="#2563eb" className="empty-state-icon" />
            <p className="empty-state-title">Your cart is empty</p>
            <p>Start shopping in the marketplace!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
            {/* Cart Items */}
            <div>
              {cart.items.map(item => (
                <div key={item.listing_id} style={{
                  backgroundColor: 'white',
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  marginBottom: '1rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {/* Image */}
                    <div style={{
                      width: '120px',
                      height: '120px',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '0.5rem',
                      overflow: 'hidden'
                    }}>
                      {item.images && item.images[0] ? (
                        <img src={item.images[0]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>
                          [Image]
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        {item.title}
                      </h3>
                      <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        Sold by: {item.seller_name}
                      </p>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#16a34a', marginBottom: '1rem' }}>
                        ${item.price}
                      </div>

                      {/* Quantity Controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            onClick={() => updateQuantity(item.listing_id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            style={{
                              padding: '0.5rem',
                              backgroundColor: item.quantity <= 1 ? '#f3f4f6' : '#2563eb',
                              color: item.quantity <= 1 ? '#9ca3af' : 'white',
                              border: 'none',
                              borderRadius: '0.375rem',
                              cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer'
                            }}
                          >
                            <Minus size={16} />
                          </button>
                          <span style={{ fontSize: '1.125rem', fontWeight: '600', minWidth: '40px', textAlign: 'center' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.listing_id, item.quantity + 1)}
                            style={{
                              padding: '0.5rem',
                              backgroundColor: '#2563eb',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.375rem',
                              cursor: 'pointer'
                            }}
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.listing_id)}
                          className="btn-delete"
                          style={{ marginLeft: 'auto' }}
                        >
                          <Trash2 size={16} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <div style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                position: 'sticky',
                top: '2rem'
              }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                  Order Summary
                </h2>

                {/* Delivery Options */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.75rem' }}>
                    Delivery Option
                  </label>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={() => setCheckoutData({...checkoutData, deliveryOption: 'campus', deliveryAddress: ''})}
                      style={{
                        flex: 1,
                        padding: '1rem',
                        border: checkoutData.deliveryOption === 'campus' ? '2px solid #2563eb' : '2px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        backgroundColor: checkoutData.deliveryOption === 'campus' ? '#eff6ff' : 'white',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      <Building size={24} style={{ margin: '0 auto 0.5rem', display: 'block' }} />
                      <div style={{ fontWeight: '600' }}>Campus Pickup</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Free</div>
                    </button>
                    <button
                      onClick={() => setCheckoutData({...checkoutData, deliveryOption: 'home'})}
                      style={{
                        flex: 1,
                        padding: '1rem',
                        border: checkoutData.deliveryOption === 'home' ? '2px solid #2563eb' : '2px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        backgroundColor: checkoutData.deliveryOption === 'home' ? '#eff6ff' : 'white',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      <Home size={24} style={{ margin: '0 auto 0.5rem', display: 'block' }} />
                      <div style={{ fontWeight: '600' }}>Home Delivery</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>${DELIVERY_CHARGE}</div>
                    </button>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div style={{ marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Subtotal:</span>
                    <span style={{ fontWeight: '600' }}>${subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Delivery:</span>
                    <span style={{ fontWeight: '600', color: deliveryCharge === 0 ? '#16a34a' : '#1f2937' }}>
                      {deliveryCharge === 0 ? 'FREE' : `$${deliveryCharge.toFixed(2)}`}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '2px solid #e5e7eb',
                    fontSize: '1.25rem',
                    fontWeight: 'bold'
                  }}>
                    <span>Total:</span>
                    <span style={{ color: '#16a34a' }}>${total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={proceedToCheckout}
                  className="btn-submit"
                  style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
                >
                  <CreditCard size={20} /> Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Checkout Modal */}
        {showCheckout && (
          <div className="modal-overlay" onClick={() => setShowCheckout(false)}>
            <div className="modal-content-small" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Checkout</h2>
                <button onClick={() => setShowCheckout(false)} className="modal-close-btn">✕</button>
              </div>

              <div className="modal-body">
                {/* Delivery Address (if home delivery) */}
                {checkoutData.deliveryOption === 'home' && (
                  <div className="form-group">
                    <label className="form-label">Delivery Address *</label>
                    <textarea
                      placeholder="Enter your full delivery address..."
                      value={checkoutData.deliveryAddress}
                      onChange={(e) => setCheckoutData({...checkoutData, deliveryAddress: e.target.value})}
                      rows={3}
                      className="form-textarea"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="Your contact number"
                    value={checkoutData.phoneNumber}
                    onChange={(e) => setCheckoutData({...checkoutData, phoneNumber: e.target.value})}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select
                    value={checkoutData.paymentMethod}
                    onChange={(e) => setCheckoutData({...checkoutData, paymentMethod: e.target.value})}
                    className="form-select"
                  >
                    <option value="cash">Cash on Delivery</option>
                    <option value="online">Online Payment</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>

                <div className="form-group-last">
                  <label className="form-label">Notes (Optional)</label>
                  <textarea
                    placeholder="Any special instructions..."
                    value={checkoutData.notes}
                    onChange={(e) => setCheckoutData({...checkoutData, notes: e.target.value})}
                    rows={2}
                    className="form-textarea"
                  />
                </div>

                {/* Summary */}
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '0.5rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Order Summary:</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    <div>Subtotal: ${subtotal.toFixed(2)}</div>
                    <div>Delivery: {deliveryCharge === 0 ? 'FREE' : `$${deliveryCharge.toFixed(2)}`}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#16a34a', marginTop: '0.5rem' }}>
                      Total: ${total.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="modal-actions">
                  <button onClick={() => setShowCheckout(false)} className="btn-cancel">
                    Cancel
                  </button>
                  <button onClick={placeOrder} className="btn-submit">
                    Place Order
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