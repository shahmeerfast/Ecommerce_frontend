import React from 'react';
import Chat from '../components/Chat';
import { useLocation } from 'react-router-dom';

const Messages = () => {
    const location = useLocation();
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Messages</h1>
            <Chat preselect={location.state} />
        </div>
    );
};

export default Messages; 