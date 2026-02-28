import React, { useEffect, useState } from 'react';
import axios from '../../config/axios';

const SavedPaymentMethods = ({ refresh }) => {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMethods = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/payment-methods', {
          headers: { token },
        });
        setMethods(res.data.paymentMethods || []);
      } catch (err) {
        setError('Failed to load payment methods');
      }
      setLoading(false);
    };
    fetchMethods();
  }, [refresh]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payment method?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/payment-methods/${id}`, {
        headers: { token },
      });
      setMethods((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      alert('Failed to delete payment method');
    }
  };

  if (loading) return <div>Loading payment methods...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 2px 8px #eee' }}>
      <h2 className="text-xl font-semibold mb-2">Saved Payment Methods</h2>
      {methods.length === 0 && <div>No saved payment methods yet.</div>}
      <ul>
        {methods.map((m) => (
          <li key={m._id} style={{ marginBottom: '1em', border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
            <div>
              <b>{m.brand?.toUpperCase()}</b> •••• {m.last4} <br />
              Expires: {m.expMonth}/{m.expYear} <br />
              Name: {m.cardholderName}
            </div>
            <button onClick={() => handleDelete(m._id)} style={{ marginTop: 8, color: 'red' }} className="text-red-600 hover:text-red-800 text-sm">
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SavedPaymentMethods; 