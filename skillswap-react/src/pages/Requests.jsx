import React, { useState, useEffect } from 'react';
import { Layout } from '../components/common/Layout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { useAuth } from '../hooks/useAuth';
import { requestService, userService, chatService } from '../services/authService';

const RequestCard = ({ request, type, onAccept, onReject, isProcessing }) => {
  const otherUid = type === 'incoming' ? request.fromUid : request.toUid;
  const otherName = type === 'incoming' ? request.fromName : request.toName;

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg">{otherName}</h3>
          <p className="text-gray-400 text-sm">
            {type === 'incoming' ? 'Wants to learn' : 'Wants to learn'}:{' '}
            <span className="text-accent">{request.requestedSkill}</span>
          </p>
          <p className="text-gray-400 text-sm">
            {type === 'incoming' ? 'Offers' : 'Offers'}:{' '}
            <span className="text-primary">{request.offeredSkill}</span>
          </p>
        </div>
        <div className="text-right text-sm text-gray-500">
          {new Date(request.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="flex gap-2">
        {type === 'incoming' && request.status === 'pending' && (
          <>
            <button
              onClick={() => onAccept(request.id)}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 bg-accent text-white rounded hover:bg-opacity-90 disabled:opacity-50 transition"
            >
              {isProcessing ? 'Processing...' : 'Accept'}
            </button>
            <button
              onClick={() => onReject(request.id)}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 border border-white/20 rounded hover:bg-white/10 disabled:opacity-50 transition"
            >
              Decline
            </button>
          </>
        )}
        {request.status === 'accepted' && (
          <div className="w-full px-4 py-2 bg-primary/20 text-primary rounded text-center">
            ✓ Connected
          </div>
        )}
        {request.status === 'rejected' && (
          <div className="w-full px-4 py-2 bg-red-500/20 text-red-200 rounded text-center">
            ✗ Declined
          </div>
        )}
      </div>
    </div>
  );
};

export const Requests = () => {
  const { userProfile } = useAuth();
  const [tab, setTab] = useState('incoming');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (!userProfile?.uid) return;
    loadRequests();
  }, [userProfile?.uid, tab]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      let data;
      
      if (tab === 'incoming') {
        data = await requestService.getIncomingRequests(userProfile.uid);
      } else {
        data = await requestService.getSentRequests(userProfile.uid);
      }
      
      setRequests(data);
    } catch (err) {
      setError('Failed to load requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    setProcessingId(requestId);
    try {
      const result = await requestService.acceptRequest(requestId, userProfile.uid);
      if (result.success) {
        setSuccessMessage('Request accepted! You can now start chatting.');
        setTimeout(() => setSuccessMessage(null), 3000);
        await loadRequests();
      } else {
        setError(result.error || 'Failed to accept request');
      }
    } catch (err) {
      setError('Error accepting request');
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId) => {
    setProcessingId(requestId);
    try {
      const result = await requestService.rejectRequest(requestId, userProfile.uid);
      if (result.success) {
        setSuccessMessage('Request declined');
        setTimeout(() => setSuccessMessage(null), 3000);
        await loadRequests();
      } else {
        setError(result.error || 'Failed to reject request');
      }
    } catch (err) {
      setError('Error rejecting request');
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-4xl mx-auto mb-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Connection Requests</h1>
            <p className="text-gray-400">
              Manage your incoming and sent learning/teaching requests
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-primary/20 border border-primary text-primary p-4 rounded-lg mb-6">
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-white/10">
            <button
              onClick={() => setTab('incoming')}
              className={`px-4 py-3 font-medium transition ${
                tab === 'incoming'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Incoming
              {requests.filter(r => r.toUid === userProfile?.uid && r.status === 'pending').length > 0 && (
                <span className="ml-2 bg-accent text-white px-2 py-1 rounded-full text-sm">
                  {requests.filter(r => r.toUid === userProfile?.uid && r.status === 'pending').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab('sent')}
              className={`px-4 py-3 font-medium transition ${
                tab === 'sent'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sent
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-accent"></div>
            </div>
          )}

          {/* Requests List */}
          {!loading && requests.length === 0 && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-12 text-center">
              <p className="text-gray-400 mb-4">
                {tab === 'incoming'
                  ? "You don't have any incoming requests yet"
                  : "You haven't sent any requests yet"}
              </p>
              {tab === 'sent' && (
                <p className="text-gray-500 text-sm">
                  Browse mentors and send requests to start learning
                </p>
              )}
            </div>
          )}

          {!loading && requests.length > 0 && (
            <div className="grid gap-4">
              {requests.map(request => (
                <RequestCard
                  key={request.id}
                  request={request}
                  type={tab}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  isProcessing={processingId === request.id}
                />
              ))}
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
};
