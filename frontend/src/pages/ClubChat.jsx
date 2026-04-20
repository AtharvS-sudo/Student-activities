import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import api from '../services/api';

const ClubChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState(0);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const clubId = user?.club?._id;
  const clubName = user?.club?.name;

  useEffect(() => {
    if (!clubId) {
      setLoading(false);
      return;
    }

    // Fetch initial messages
    fetchMessages();

    // Initialize Socket.IO connection
    const token = localStorage.getItem('token');
    // Remove /api from the URL for Socket.IO connection
    const socketUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '');
    const newSocket = io(socketUrl, {
      auth: { token },
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to chat server');
      setIsConnected(true);
      newSocket.emit('join_club', clubId);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from chat server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
      setIsConnected(false);
    });

    newSocket.on('new_message', (message) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    });

    newSocket.on('active_users', ({ count }) => {
      setActiveUsers(count);
    });

    newSocket.on('user_typing', ({ userId, userName }) => {
      if (userId !== user.id) {
        setTypingUsers((prev) => new Set(prev).add(userName));
      }
    });

    newSocket.on('user_stop_typing', ({ userId }) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        // Remove by userId (we'll need to track userId->userName mapping)
        return newSet;
      });
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      alert(error.message);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.emit('leave_club', clubId);
        newSocket.disconnect();
      }
    };
  }, [clubId]);

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/chat/club/${clubId}`);
      setMessages(response.data.messages);
      scrollToBottom();
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !socket) return;

    socket.emit('send_message', {
      clubId,
      message: newMessage.trim(),
    });

    setNewMessage('');
    handleStopTyping();
  };

  const handleTyping = () => {
    if (!socket) return;

    socket.emit('typing', { clubId });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 2000);
  };

  const handleStopTyping = () => {
    if (!socket) return;
    socket.emit('stop_typing', { clubId });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  if (!user?.club) {
    return (
      <div className="container" style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ color: '#666' }}>You are not a member of any club</h2>
        <p style={{ color: '#999' }}>Join a club to access the chat feature</p>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading chat...</div>;
  }

  return (
    <div className="container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        height: 'calc(100vh - 140px)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h2 style={{ margin: 0, color: '#1e3c72', fontSize: '24px' }}>
              {clubName} Chat
            </h2>
            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
              {activeUsers} member{activeUsers !== 1 ? 's' : ''} online
            </p>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: isConnected ? '#28a745' : '#dc3545',
            }} />
            <span style={{ fontSize: '14px', color: '#666' }}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
        }}>
          {messages.map((message) => {
            const isOwnMessage = message.sender._id === user.id;
            
            return (
              <div
                key={message._id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
                }}
              >
                <span style={{
                  fontSize: '12px',
                  color: '#666',
                  marginBottom: '4px',
                  fontWeight: '600',
                }}>
                  {isOwnMessage ? 'You' : message.sender.name}
                  {message.sender.additionalRoles?.includes('club_head') && (
                    <span style={{
                      marginLeft: '6px',
                      padding: '2px 6px',
                      background: '#ffc107',
                      color: '#000',
                      borderRadius: '4px',
                      fontSize: '10px',
                    }}>
                      HEAD
                    </span>
                  )}
                </span>
                
                <div style={{
                  position: 'relative',
                  maxWidth: '70%',
                }}>
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: isOwnMessage ? '#2a5298' : '#f0f0f0',
                    color: isOwnMessage ? 'white' : '#333',
                    wordWrap: 'break-word',
                  }}>
                    {message.message}
                  </div>
                  
                  <div style={{
                    marginTop: '4px',
                    fontSize: '11px',
                    color: '#999',
                  }}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            );
          })}
          
          {typingUsers.size > 0 && (
            <div style={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
              {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} style={{
          padding: '20px',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          gap: '12px',
        }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onBlur={handleStopTyping}
            placeholder="Type a message..."
            disabled={!isConnected}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid #e0e0e0',
              borderRadius: '24px',
              fontSize: '14px',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            style={{
              padding: '12px 32px',
              background: isConnected && newMessage.trim() ? '#2a5298' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '24px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isConnected && newMessage.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ClubChat;
