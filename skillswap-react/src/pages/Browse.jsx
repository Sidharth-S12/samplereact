import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/common/Layout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { useAuth } from '../hooks/useAuth';
import { useUsers } from '../hooks/useUsers';
import { validationService, requestService } from '../services/authService';

const UserCard = ({ user, onConnect }) => {
  const getInitial = () => {
    const name = user.name || user.email || 'U';
    return name[0].toUpperCase();
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-primary/50 transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-lg font-bold text-white">
            {getInitial()}
          </div>
          <div>
            <h3 className="font-bold text-lg">{user.name || 'Unnamed'}</h3>
            <p className="text-gray-400 text-sm">{user.email}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-accent">{user.avgRating || 'N/A'}</div>
          <div className="text-xs text-gray-500">
            {user.totalRatings || 0} {user.totalRatings === 1 ? 'review' : 'reviews'}
          </div>
        </div>
      </div>

      {/* Teaching Skills */}
      {user.offer && (
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">Can teach:</p>
          <div className="flex flex-wrap gap-1">
            {user.offer.split(',').map((skill, idx) => (
              <span key={idx} className="bg-primary/20 text-primary text-xs px-2 py-1 rounded">
                {skill.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Learning Skills */}
      {user.learn && (
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">Wants to learn:</p>
          <div className="flex flex-wrap gap-1">
            {user.learn.split(',').map((skill, idx) => (
              <span key={idx} className="bg-accent/20 text-accent text-xs px-2 py-1 rounded">
                {skill.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sessions */}
      <div className="text-sm text-gray-400 mb-4">
        {user.sessionsCompleted || 0} sessions completed
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          to={`/profile?uid=${user.uid}`}
          className="flex-1 px-3 py-2 border border-white/20 rounded text-center text-sm hover:bg-white/10 transition"
        >
          View Profile
        </Link>
        <button
          onClick={() => onConnect(user)}
          className="flex-1 px-3 py-2 bg-accent text-white rounded text-sm hover:bg-opacity-90 transition"
        >
          Connect
        </button>
      </div>
    </div>
  );
};

const RequestModal = ({ isOpen, user, onClose, onSubmit, isLoading }) => {
  const [requestedSkill, setRequestedSkill] = useState('');
  const [offeredSkill, setOfferedSkill] = useState('');
  const validSkills = validationService.getValidSkills();

  if (!isOpen || !user) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (requestedSkill && offeredSkill) {
      onSubmit(user.uid, requestedSkill, offeredSkill);
      setRequestedSkill('');
      setOfferedSkill('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0F172A] border border-white/20 rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Connect with {user.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* What you want to learn */}
          <div>
            <label className="block text-sm font-medium mb-2">
              What do you want to learn from {user.name}?
            </label>
            <select
              value={requestedSkill}
              onChange={(e) => setRequestedSkill(e.target.value)}
              className="w-full px-4 py-2 bg-[#020617] border border-white/20 rounded-lg focus:outline-none focus:border-accent"
              required
            >
              <option value="">Select a skill...</option>
              {user.offer?.split(',').map(skill => (
                <option key={skill.trim()} value={skill.trim()}>
                  {skill.trim()}
                </option>
              ))}
            </select>
          </div>

          {/* What you can teach */}
          <div>
            <label className="block text-sm font-medium mb-2">
              What can you teach them?
            </label>
            <select
              value={offeredSkill}
              onChange={(e) => setOfferedSkill(e.target.value)}
              className="w-full px-4 py-2 bg-[#020617] border border-white/20 rounded-lg focus:outline-none focus:border-accent"
              required
            >
              <option value="">Select a skill...</option>
              {validSkills.map(skill => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-white/20 rounded text-center hover:bg-white/10 disabled:opacity-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !requestedSkill || !offeredSkill}
              className="flex-1 px-4 py-2 bg-accent text-white rounded hover:bg-opacity-90 disabled:opacity-50 transition font-medium"
            >
              {isLoading ? 'Sending request...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const Browse = () => {
  const { userProfile } = useAuth();
  const { users, usersLoading, usersError } = useUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkillOffer, setSelectedSkillOffer] = useState('');
  const [selectedSkillLearn, setSelectedSkillLearn] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  
  const validSkills = validationService.getValidSkills();

  const handleConnect = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSendRequest = async (toUid, requestedSkill, offeredSkill) => {
    if (!userProfile?.uid) return;
    
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      const result = await requestService.createRequest(
        userProfile.uid,
        toUid,
        requestedSkill,
        offeredSkill
      );
      
      if (result.success) {
        setSuccessMessage(`Request sent to ${selectedUser.name}!`);
        setIsModalOpen(false);
        setSelectedUser(null);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage(result.error || 'Failed to send request');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Error sending request');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter and search users
  const filteredUsers = useMemo(() => {
    let result = [...users];

    // Filter by teaching skill
    if (selectedSkillOffer) {
      result = result.filter(u => {
        const offers = (u.offer || '').split(',').map(s => s.trim());
        return offers.includes(selectedSkillOffer);
      });
    }

    // Filter by learning skill
    if (selectedSkillLearn) {
      result = result.filter(u => {
        const learns = (u.learn || '').split(',').map(s => s.trim());
        return learns.includes(selectedSkillLearn);
      });
    }

    // Search by name or email
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(u => {
        const name = (u.name || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        return name.includes(query) || email.includes(query);
      });
    }

    return result;
  }, [users, searchQuery, selectedSkillOffer, selectedSkillLearn]);

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-7xl mx-auto mb-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Browse Mentors</h1>
            <p className="text-gray-400">
              Find skilled mentors to learn from or connect with learners interested in your expertise
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-primary/20 border border-primary text-primary p-4 rounded-lg mb-6">
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
              {errorMessage}
            </div>
          )}

          {/* Filters Section */}
          <div className="bg-[#0F172A]/80 border border-white/10 rounded-lg p-6 mb-8">
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium mb-2">Search</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full px-4 py-2 bg-[#020617] border border-white/20 rounded-lg focus:outline-none focus:border-accent"
                />
              </div>

              {/* Can Teach Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Can Teach</label>
                <select
                  value={selectedSkillOffer}
                  onChange={(e) => setSelectedSkillOffer(e.target.value)}
                  className="w-full px-4 py-2 bg-[#020617] border border-white/20 rounded-lg focus:outline-none focus:border-accent"
                >
                  <option value="">All skills</option>
                  {validSkills.map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>

              {/* Wants to Learn Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Wants to Learn</label>
                <select
                  value={selectedSkillLearn}
                  onChange={(e) => setSelectedSkillLearn(e.target.value)}
                  className="w-full px-4 py-2 bg-[#020617] border border-white/20 rounded-lg focus:outline-none focus:border-accent"
                >
                  <option value="">All skills</option>
                  {validSkills.map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filters Button */}
            {(searchQuery || selectedSkillOffer || selectedSkillLearn) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSkillOffer('');
                  setSelectedSkillLearn('');
                }}
                className="text-sm text-gray-400 hover:text-accent transition"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Results Info */}
          <div className="mb-6">
            <p className="text-gray-400">
              Showing <span className="font-bold text-white">{filteredUsers.length}</span> of{' '}
              <span className="font-bold text-white">{users.length}</span> mentors
            </p>
          </div>

          {/* Error State */}
          {usersError && !usersLoading && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-6 rounded-lg text-center mb-8">
              Failed to load mentors. Please try again.
            </div>
          )}

          {/* Loading State */}
          {usersLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-accent"></div>
            </div>
          )}

          {/* Empty State */}
          {!usersLoading && filteredUsers.length === 0 && users.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-12 text-center">
              <p className="text-gray-400 mb-4">No mentors match your filters</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSkillOffer('');
                  setSelectedSkillLearn('');
                }}
                className="text-accent hover:underline"
              >
                Clear filters and try again
              </button>
            </div>
          )}

          {/* No Users State */}
          {!usersLoading && users.length === 0 && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-12 text-center">
              <p className="text-gray-400">No mentors available yet</p>
            </div>
          )}

          {/* User Grid */}
          {!usersLoading && filteredUsers.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map(user => (
                <UserCard key={user.uid} user={user} onConnect={handleConnect} />
              ))}
            </div>
          )}

          {/* Request Modal */}
          <RequestModal
            isOpen={isModalOpen}
            user={selectedUser}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedUser(null);
            }}
            onSubmit={handleSendRequest}
            isLoading={isSubmitting}
          />
        </div>
      </Layout>
    </ProtectedRoute>
  );
};
