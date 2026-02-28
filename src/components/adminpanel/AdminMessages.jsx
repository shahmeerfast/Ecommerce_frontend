import React, { useEffect, useState, useRef } from 'react';
import axios from '../../config/axios';
import { toast } from 'react-toastify';

const AdminMessages = () => {
  // Remove buyerSellerConversations and tab state
  const [adminConversations, setAdminConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const messagesEndRef = useRef(null);

  // Fetch only admin conversations
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const adminRes = await axios.get('/api/messages/admin/conversations', { headers: { token } });
        setAdminConversations(adminRes.data);
      } catch (err) {
        toast.error('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (selected) {
      const userId = selected._id?.user;
      const sellerId = selected._id?.seller;
      const otherId = userId || sellerId;
      const otherModel = userId ? 'user' : 'seller';
      if (otherId) {
        axios.get(`/api/messages/admin/thread/${otherId}/${otherModel}`, {
          headers: { token }
        }).then(res => setMessages(res.data));
      }
    }
  }, [selected, token]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim() || !selected) return;
    const userId = selected._id?.user || selected.userId;
    const sellerId = selected._id?.seller || selected.sellerId;
    try {
      await axios.post('/api/messages/admin/send', {
        userId,
        sellerId,
        message
      }, {
        headers: { token }
      });
      setMessage('');
      toast.success('Message sent successfully!');
      // Refresh
      const targetId = userId || sellerId;
      const model = userId ? 'user' : 'seller';
      const res = await axios.get(`/api/messages/admin/thread/${targetId}/${model}`, {
        headers: { token }
      });
      setMessages(res.data);
    } catch (error) {
      toast.error('Failed to send message.');
    }
  };

  // Only admin conversations
  const conversations = adminConversations;

  return (
    <div style={{ padding: 24 }}>
      {/* Only Admin Chats title */}
      <div style={{ marginBottom: 20 }}>
        <span style={{ fontWeight: 'bold', fontSize: 18 }}>👨‍💼 Admin Chats</span>
      </div>

      <div style={{ display: 'flex', height: '80vh' }}>
        {/* Conversation List */}
        <div style={{ width: 350, overflowY: 'auto', borderRight: '1px solid #eee', paddingRight: 10 }}>
          <h3 style={{ fontSize: 18, marginBottom: 16 }}>Admin Conversations</h3>
          {loading ? (
            <div>Loading...</div>
          ) : conversations.length === 0 ? (
            <div>No conversations yet.</div>
          ) : (
            conversations.map((conv, index) => (
              <div
                key={index}
                onClick={() => setSelected(conv)}
                style={{
                  padding: 16,
                  marginBottom: 8,
                  backgroundColor: selected === conv ? '#eef4ff' : '#fff',
                  borderRadius: 8,
                  cursor: 'pointer',
                  boxShadow: '0 1px 4px #0001'
                }}
              >
                <div>
                  <strong>{conv._id?.user ? 'User:' : 'Seller:'}</strong> {conv.userName || conv.sellerName || conv._id?.user || conv._id?.seller}
                </div>
                <div style={{ fontSize: 13, color: '#888', marginTop: 6 }}>
                  {conv.lastMessage?.message}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Messages Panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: 20, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001' }}>
          <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ textAlign: msg.senderModel === 'admin' ? 'right' : 'left', marginBottom: 12 }}>
                <div style={{
                  display: 'inline-block',
                  padding: '10px 16px',
                  borderRadius: 12,
                  background: msg.senderModel === 'admin' ? '#ffe082' : (msg.senderModel === 'user' ? '#d0f0ff' : '#e0e0e0'),
                  boxShadow: '0 1px 4px #0001',
                  fontSize: 14
                }}>
                  <strong>{msg.senderModel === 'admin' ? 'Admin: ' : ''}</strong>{msg.message}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Send Message Box */}
          {selected && (
            <div style={{ padding: 20, borderTop: '1px solid #eee', background: '#fafafa', display: 'flex' }}>
              <input
                value={message}
                onChange={e => setMessage(e.target.value)}
                style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #ddd' }}
                placeholder="Type a message..."
                onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
              />
              <button
                onClick={sendMessage}
                style={{ marginLeft: 12, background: '#3C91E6', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: 8, cursor: 'pointer' }}
              >
                Send
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;
