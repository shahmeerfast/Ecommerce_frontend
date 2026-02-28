import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from '../../config/axios';

const AddPaymentMethodForm = ({ onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardholderName, setCardholderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!stripe || !elements) {
      setError('Stripe not loaded');
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: { name: cardholderName },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/payment-methods',
        {
          paymentMethodId: paymentMethod.id,
          cardholderName,
        },
        {
          headers: { token },
        }
      );
      setLoading(false);
      setCardholderName('');
      setSuccess('Card added successfully!');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save payment method');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
      <input
        type="text"
        placeholder="Cardholder Name"
        value={cardholderName}
        onChange={(e) => setCardholderName(e.target.value)}
        required
        style={{ marginBottom: 12, padding: 8, width: '100%' }}
      />
      <div style={{ margin: '1em 0', border: '1px solid #ccc', borderRadius: 4, padding: 8 }}>
        <CardElement />
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: 8 }}>{success}</div>}
      <button type="submit" disabled={!stripe || loading} className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors">
        {loading ? 'Saving...' : 'Add Card'}
      </button>
    </form>
  );
};

export default AddPaymentMethodForm; 