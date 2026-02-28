import React, { useState, useEffect, useRef } from 'react';
import { useShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const Chat = ({ preselect }) => {
    const { user, backendUrl, token } = useShopContext();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]); // List of users/sellers
    const [selectedConversation, setSelectedConversation] = useState(null); // { user, seller, product }
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    useEffect(() => {
        if (!user || !token) {
            toast.error('Please login to use the chat feature');
            navigate('/login');
        }
    }, [user, token, navigate]);

    // Connect to socket.io
    useEffect(() => {
        if (!user || !token) return;
        socketRef.current = io(backendUrl, { query: { token } });
        socketRef.current.on('newMessage', (msg) => {
            if (selectedConversation &&
                ((msg.sender === selectedConversation.id && msg.senderModel === selectedConversation.model) ||
                 (msg.receiver === selectedConversation.id && msg.receiverModel === selectedConversation.model))) {
                setMessages((prev) => [...prev, msg]);
            }
        });
        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [user, token, backendUrl, selectedConversation]);

    // Fetch conversations (users/sellers the user has chatted with)
    useEffect(() => {
        if (!user || !token) return;
        const fetchConversations = async () => {
            try {
                const res = await axios.get(`${backendUrl}/api/messages/conversations`, {
                    headers: { token }
                });
                setConversations(res.data.conversations);
            } catch (err) {
                setConversations([]);
            }
        };
        fetchConversations();
    }, [user, token, backendUrl]);

    // Preselect conversation if preselect prop is provided
    useEffect(() => {
        if (!preselect || !user) return;
        const sellerId = preselect.sellerId;
        const productId = preselect.productId;
        if (!sellerId || !productId) return;
        // Try to find the conversation in the list
        const model = 'seller';
        setSelectedConversation((prev) => {
            if (prev && prev.id === sellerId && prev.productId === productId) return prev;
            return {
                id: sellerId,
                model: model,
                productId: productId,
                name: preselect.productName || 'Seller',
                productName: preselect.productName || ''
            };
        });
    }, [preselect, user]);

    // Fetch messages for selected conversation
    useEffect(() => {
        if (!selectedConversation || !user || !token) return;
        const fetchMessages = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get(`${backendUrl}/api/messages`, {
                    headers: { token },
                    params: {
                        user1Id: user._id || user.id,
                        user1Model: user.role === 'seller' ? 'seller' : 'user',
                        user2Id: selectedConversation.id,
                        user2Model: selectedConversation.model,
                        product: selectedConversation.productId || undefined
                    }
                });
                setMessages(res.data.messages);
            } catch (err) {
                setMessages([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMessages();
    }, [selectedConversation, user, token, backendUrl]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;
        const senderId = user._id || user.id;
        const senderModel = user.role === 'seller' ? 'seller' : 'user';
        const receiverId = selectedConversation.id;
        const receiverModel = selectedConversation.model;
        try {
            setIsLoading(true);
            const res = await axios.post(
                `${backendUrl}/api/messages/send`,
                {
                    senderId,
                    senderModel,
                    receiverId,
                    receiverModel,
                    message: newMessage,
                    product: selectedConversation.productId || undefined
                },
                { headers: { token } }
            );
            setMessages((prev) => [...prev, res.data.message]);
            setNewMessage('');
            // Emit to socket for real-time
            if (socketRef.current) {
                socketRef.current.emit('sendMessage', res.data.message);
            }
        } catch (err) {
            toast.error('Failed to send message');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user || !token) {
        return null;
    }

    return (
        <div className="flex h-[600px] bg-white rounded-lg shadow-lg">
            {/* Conversation List */}
            <div className="w-1/3 border-r overflow-y-auto">
                <h3 className="p-4 font-semibold border-b">Conversations</h3>
                {conversations.length === 0 && <div className="p-4 text-gray-500">No conversations yet.</div>}
                {conversations.map((conv, idx) => (
                    <div
                        key={idx}
                        className={`p-4 cursor-pointer hover:bg-gray-100 ${selectedConversation && selectedConversation.id === conv.id ? 'bg-gray-200' : ''}`}
                        onClick={() => {
                            setSelectedConversation(conv);
                            // Mark conversation as read (current user is receiver)
                            axios.post(
                                `${backendUrl}/api/messages/mark-read`,
                                {
                                    user1Id: user._id || user.id, // receiver (current user)
                                    user1Model: user.role === 'seller' ? 'seller' : 'user',
                                    user2Id: conv.id, // sender (other user)
                                    user2Model: conv.model,
                                    product: conv.productId || undefined
                                },
                                { headers: { token } }
                            );
                            setConversations(prev => prev.map((c, i) => i === idx ? { ...c, unreadCount: 0 } : c));
                        }}
                    >
                        <div className="flex items-center gap-2 font-bold">
                            {(conv.name && conv.name.trim()) || (conv.model === 'seller' ? 'Seller' : 'User')}
                            {conv.unreadCount > 0 && (
                                <span className="inline-block bg-red-600 text-white text-xs rounded-full px-2 py-0.5 ml-2">
                                    {conv.unreadCount}
                                </span>
                            )}
                        </div>
                        {conv.productName && <div className="text-xs text-gray-500">Product: {conv.productName}</div>}
                    </div>
                ))}
            </div>
            {/* Chat Messages */}
            <div className="flex-1 flex flex-col">
                <div className="p-4 border-b flex items-center">
                    {(() => {
                        const lastMsg = messages[messages.length - 1];
                        return (
                    <h3 className="text-lg font-semibold">
                                {lastMsg && lastMsg.senderModel === 'admin'
                                    ? 'Admin'
                                    : selectedConversation
                                        ? selectedConversation.name
                                        : 'Select a conversation'}
                    </h3>
                        );
                    })()}
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    {isLoading && <div className="text-center text-gray-500">Loading...</div>}
                    {!isLoading && messages.length === 0 && (
                        <div className="text-center text-gray-500 mt-4">No messages yet.</div>
                    )}
                    {messages.map((message, idx) => {
                        let senderLabel;
                        if (message.senderModel === 'admin') {
                            senderLabel = 'Admin';
                        } else if (message.senderModel === 'seller') {
                            senderLabel = 'Seller';
                        } else {
                            senderLabel = 'User';
                        }
                        return (
                        <div
                            key={message._id || idx}
                            className={`mb-4 ${message.sender === (user._id || user.id) ? 'ml-auto' : 'mr-auto'}`}
                        >
                            <div
                                className={`max-w-[80%] p-3 rounded-lg ${message.sender === (user._id || user.id) ? 'bg-black text-white ml-auto' : 'bg-gray-200'}`}
                            >
                                    <div className="text-xs font-bold mb-1">{senderLabel}</div>
                                <div className="text-sm">{message.message}</div>
                                <div className="text-xs mt-1 opacity-70">
                                    {new Date(message.createdAt).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
                {selectedConversation && (
                    <form onSubmit={handleSendMessage} className="p-4 border-t">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                                disabled={isLoading}
                            >
                                Send
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Chat; 