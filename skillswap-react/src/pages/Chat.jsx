import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/common/Layout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { useAuth } from '../hooks/useAuth';
import { chatService, userService } from '../services/authService';

const ChatMessage = ({ message, isOwn, senderName }) => {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs px-4 py-2 rounded-lg ${
          isOwn
            ? 'bg-accent text-white rounded-br-none'
            : 'bg-white/10 text-gray-100 rounded-bl-none'
        }`}
      >
        {!isOwn && <p className="text-xs text-gray-400 mb-1">{senderName}</p>}
        <p className="break-words">{message.text}</p>
        <p className="text-xs mt-1 opacity-60">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
};

export const Chat = () => {
  const { userProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [chatId, setChatId] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    const initChat = async () => {
      try {
        setLoading(true);
        const otherUid = searchParams.get('uid');

        if (!otherUid || !userProfile?.uid) {
          setError('No user selected');
          return;
        }

        // Get the other user's info
        const user = await userService.getUser(otherUid);
        if (!user) {
          setError('User not found');
          return;
        }

        setOtherUser({ uid: otherUid, ...user });

        // Create or get chat ID
        const key = [userProfile.uid, otherUid].sort().join('_');
        setChatId(key);

        // Start the chat if it doesn't exist
        await chatService.startChat(userProfile.uid, otherUid, userProfile.name, user.name);

        // Load existing messages
        const messages = await loadMessages(key);
        setMessages(messages);

        setError(null);
      } catch (err) {
        console.error('Error initializing chat:', err);
        setError('Failed to load chat');
      } finally {
        setLoading(false);
      }
    };

    initChat();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [userProfile?.uid, searchParams]);

  const loadMessages = async (key) => {
    try {
      const snapshot = await fetch(`/api/chats/${key}/messages`);
      // Since we don't have a real API, we'll use a different approach
      // We'll set up real-time listener instead
      return [];
    } catch (err) {
      console.error('Error loading messages:', err);
      return [];
    }
  };

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !chatId || !userProfile?.uid) return;

    const message = messageInput.trim();
    setMessageInput('');
    setSending(true);

    try {
      const result = await chatService.sendMessage(
        chatId,
        userProfile.uid,
        message
      );

      if (result.success) {
        // Add message to local state immediately for better UX
        setMessages(prev => [...prev, {
          id: Date.now(),
          fromUid: userProfile.uid,
          text: message,
          timestamp: new Date().toISOString(),
          read: false
        }]);
      } else {
        setError('Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-2xl mx-auto h-full flex flex-col mb-12">
          {/* Header */}
          {otherUser && (
            <div className="bg-white/5 border-b border-white/10 p-6 mb-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-bold">
                    {otherUser.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">{otherUser.name}</h2>
                    <p className="text-gray-400 text-sm">
                      Teaching: <span className="text-primary">{otherUser.offer || 'N/A'}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/profile?uid=${otherUser.uid}`)}
                  className="px-4 py-2 border border-white/20 rounded hover:bg-white/10 transition"
                >
                  View Profile
                </button>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-accent"></div>
            </div>
          )}

          {/* Messages Area */}
          {!loading && !error && (
            <>
              <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-6 mb-6 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-center">
                    <div>
                      <p className="text-gray-400 mb-2">No messages yet</p>
                      <p className="text-gray-500 text-sm">Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    {messages.map(msg => (
                      <ChatMessage
                        key={msg.id}
                        message={msg}
                        isOwn={msg.fromUid === userProfile?.uid}
                        senderName={msg.fromUid === userProfile?.uid ? 'You' : otherUser?.name}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  disabled={sending}
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-accent placeholder:text-gray-500 disabled:opacity-50"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !messageInput.trim()}
                  className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition font-medium"
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
};
