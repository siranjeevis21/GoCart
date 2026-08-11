import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const Checkout = () => {
  const { cart, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Step state: 1 = Delivery, 2 = Review, 3 = Payment, 4 = Confirmation
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    shipping_name: '',
    shipping_phone: '',
    shipping_address: '',
    shipping_city: '',
    shipping_state: '',
    shipping_zip_code: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        shipping_name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        shipping_phone: user.phone || '',
        shipping_address: user.address || '',
        shipping_city: '',
        shipping_state: '',
        shipping_zip_code: ''
      });
    }
  }, [user]);

  // If cart is empty, redirect back to cart
  useEffect(() => {
    if (!loading && (!cart.items || cart.items.length === 0)) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = () => {
    const { shipping_name, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_zip_code } = formData;
    if (step === 1) {
      if (!shipping_name || !shipping_phone || !shipping_address || !shipping_city || !shipping_state || !shipping_zip_code) {
        setError('Please fill in all shipping details before proceeding.');
        return;
      }
    }
    setError('');
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await API.post('orders/create/', {
        shipping_name: formData.shipping_name,
        shipping_phone: formData.shipping_phone,
        shipping_address: formData.shipping_address,
        shipping_city: formData.shipping_city,
        shipping_state: formData.shipping_state,
        shipping_zip_code: formData.shipping_zip_code
      });
      await clearCart();
      navigate(`/order-confirmation?orderId=${res.data.id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to place order. Please review stock levels.');
      setStep(1); // Reset back to first step to fix fields if needed
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="title-page" style={{ textAlign: 'center', marginBottom: '3rem' }}>Checkout</h1>

      {/* 4-Step Progress Indicator Bar */}
      <div className="checkout-steps-bar">
        <div className="checkout-steps-line" />
        <div 
          className="checkout-steps-progress" 
          style={{ width: `${((step - 1) / 3) * 100}%` }} 
        />
        
        <div className={`checkout-step-node ${step >= 1 ? 'completed' : ''} ${step === 1 ? 'active' : ''}`}>
          {step > 1 ? '✓' : '1'}
        </div>
        <div className={`checkout-step-node ${step >= 2 ? 'completed' : ''} ${step === 2 ? 'active' : ''}`}>
          {step > 2 ? '✓' : '2'}
        </div>
        <div className={`checkout-step-node ${step >= 3 ? 'completed' : ''} ${step === 3 ? 'active' : ''}`}>
          {step > 3 ? '✓' : '3'}
        </div>
        <div className={`checkout-step-node ${step >= 4 ? 'completed' : ''} ${step === 4 ? 'active' : ''}`}>
          {step > 4 ? '✓' : '4'}
        </div>
      </div>

      {/* Label names row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '640px', margin: '-2rem auto 3rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', padding: '0 0.5rem' }}>
        <span style={{ color: step >= 1 ? 'var(--primary)' : 'inherit' }}>DELIVERY</span>
        <span style={{ color: step >= 2 ? 'var(--primary)' : 'inherit' }}>REVIEW</span>
        <span style={{ color: step >= 3 ? 'var(--primary)' : 'inherit' }}>PAYMENT</span>
        <span style={{ color: step >= 4 ? 'var(--primary)' : 'inherit' }}>CONFIRM</span>
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: '2rem' }}>{error}</div>}

      {/* Form Steps Card Container */}
      <div className="card-glass">
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Step 1: Shipping Address</h2>
            <div className="form-group">
              <label className="form-label">FULL NAME *</label>
              <input
                type="text"
                name="shipping_name"
                className="form-control"
                placeholder="Recipient full name"
                value={formData.shipping_name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">PHONE NUMBER *</label>
              <input
                type="text"
                name="shipping_phone"
                className="form-control"
                placeholder="Recipient phone number"
                value={formData.shipping_phone}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">STREET ADDRESS *</label>
              <textarea
                name="shipping_address"
                className="form-control"
                placeholder="Building, street, suite"
                value={formData.shipping_address}
                onChange={handleChange}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">CITY *</label>
                <input
                  type="text"
                  name="shipping_city"
                  className="form-control"
                  placeholder="City"
                  value={formData.shipping_city}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">STATE / REGION *</label>
                <input
                  type="text"
                  name="shipping_state"
                  className="form-control"
                  placeholder="State"
                  value={formData.shipping_state}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label">POSTAL / ZIP CODE *</label>
              <input
                type="text"
                name="shipping_zip_code"
                className="form-control"
                placeholder="ZIP code"
                value={formData.shipping_zip_code}
                onChange={handleChange}
              />
            </div>
            <button type="button" className="btn btn-primary" onClick={handleNextStep}>
              Continue to Review →
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Step 2: Order Items Review</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
              {cart.items?.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: 'var(--text-main)' }}>{item.product_detail?.name}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Qty: {item.quantity} × ₹{item.product_detail?.discount_price || item.product_detail?.price}</div>
                  </div>
                  <span style={{ fontWeight: 800 }}>
                    ₹{((item.product_detail?.discount_price || item.product_detail?.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" className="btn btn-outline" onClick={handlePrevStep}>
                ← Back
              </button>
              <button type="button" className="btn btn-primary" onClick={handleNextStep}>
                Continue to Payment →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Step 3: Select Payment Method</h2>
            
            <div style={{ border: '2px solid var(--primary)', background: 'var(--pastel-purple)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '2rem' }}>💵</span>
              <div>
                <strong style={{ display: 'block', color: 'var(--primary-deep)', fontSize: '1.05rem' }}>Cash on Delivery (COD)</strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Pay in cash upon delivery of your packages. No extra fees.</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" className="btn btn-outline" onClick={handlePrevStep}>
                ← Back
              </button>
              <button type="button" className="btn btn-primary" onClick={handleNextStep}>
                Continue to Confirmation →
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Step 4: Final Confirmation</h2>
            
            <div style={{ background: 'var(--bg-soft)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.8rem', textTransform: 'uppercase' }}>Delivery Info</h3>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                <strong>{formData.shipping_name}</strong> ({formData.shipping_phone})<br />
                {formData.shipping_address}, {formData.shipping_city}, {formData.shipping_state} - {formData.shipping_zip_code}
              </div>

              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.8rem', textTransform: 'uppercase' }}>Billing Breakdown</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span>Subtotal:</span>
                <span>₹{cart.subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span>Delivery:</span>
                <span>₹{cart.delivery.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.8rem', marginTop: '0.8rem', fontWeight: 800, fontSize: '1.1rem' }}>
                <span>Total Amount Due:</span>
                <span style={{ color: 'var(--primary)' }}>₹{cart.total.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" className="btn btn-outline" onClick={handlePrevStep} disabled={loading}>
                ← Back
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Processing Order...' : 'Place COD Order 🛒'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
