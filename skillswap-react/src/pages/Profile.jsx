import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../components/common/Layout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/authService';
import { validationService } from '../services/authService';

export const Profile = () => {
  const [searchParams] = useSearchParams();
  const profileUid = searchParams.get('uid');
  const { user, userProfile, updateProfile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState(null);
  const [isEditingOwn, setIsEditingOwn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    offer: '',
    learn: ''
  });
  const [editErrors, setEditErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const validSkills = validationService.getValidSkills();
  const viewingOwnProfile = !profileUid || (user && user.uid === profileUid);
  const displayUid = profileUid || user?.uid;

  useEffect(() => {
    const loadProfile = async () => {
      if (!displayUid) return;
      
      setIsLoading(true);
      setError('');
      
      try {
        const profile = await userService.getUser(displayUid);
        if (profile) {
          setProfileData(profile);
          if (viewingOwnProfile) {
            setEditForm({
              name: profile.name || '',
              bio: profile.bio || '',
              offer: profile.offer || '',
              learn: profile.learn || ''
            });
          }
        } else {
          setError('Profile not found');
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [displayUid, viewingOwnProfile]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (editErrors[name]) {
      setEditErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateEditForm = () => {
    const newErrors = {};

    const nameVal = validationService.validateName(editForm.name);
    if (!nameVal.valid) newErrors.name = nameVal.error;

    if (editForm.offer) {
      const offerVal = validationService.validateSkill(editForm.offer);
      if (!offerVal.valid) newErrors.offer = offerVal.error;
    }

    if (editForm.learn) {
      const learnVal = validationService.validateSkill(editForm.learn);
      if (!learnVal.valid) newErrors.learn = learnVal.error;
    }

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!validateEditForm()) {
      return;
    }

    setIsSaving(true);
    const result = await updateProfile({
      name: editForm.name.trim(),
      bio: editForm.bio.trim(),
      offer: editForm.offer.trim(),
      learn: editForm.learn.trim()
    });

    if (result.success) {
      setProfileData(prev => ({
        ...prev,
        name: editForm.name,
        bio: editForm.bio,
        offer: editForm.offer,
        learn: editForm.learn
      }));
      setSuccessMessage('Profile updated successfully!');
      setIsEditingOwn(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setError(result.error || 'Failed to save profile');
    }
    setIsSaving(false);
  };

  const getInitial = () => {
    const name = profileData?.name || user?.email || 'U';
    return name[0].toUpperCase();
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-accent"></div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (error && !profileData) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-6 rounded-lg text-center">
              {error}
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-3xl mx-auto mb-12">
          {/* Header */}
          <div className="bg-[#0F172A]/80 border border-white/10 rounded-lg p-8 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-4xl font-bold text-white">
                  {getInitial()}
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">{profileData?.name || 'User'}</h1>
                  <p className="text-gray-400">{profileData?.email}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {profileData?.sessionsCompleted || 0} sessions completed
                  </p>
                </div>
              </div>
              {viewingOwnProfile && (
                <button
                  onClick={() => setIsEditingOwn(!isEditingOwn)}
                  className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-opacity-90 transition"
                >
                  {isEditingOwn ? 'Cancel' : 'Edit Profile'}
                </button>
              )}
            </div>

            {/* Rating */}
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold">Rating:</span>
                <span className="text-2xl text-accent font-bold">
                  {profileData?.avgRating || 'N/A'}
                </span>
                {profileData?.totalRatings > 0 && (
                  <span className="text-gray-400">
                    ({profileData.totalRatings} {profileData.totalRatings === 1 ? 'review' : 'reviews'})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-500/20 border border-green-500 text-green-200 p-4 rounded mb-6">
              {successMessage}
            </div>
          )}

          {/* Edit Form */}
          {isEditingOwn && viewingOwnProfile && (
            <div className="bg-[#0F172A]/80 border border-white/10 rounded-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
              
              {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    className={`w-full px-4 py-2 bg-[#020617] rounded-lg focus:outline-none transition ${
                      editErrors.name
                        ? 'border-2 border-red-500'
                        : 'border border-white/20 focus:border-accent'
                    }`}
                    disabled={isSaving}
                  />
                  {editErrors.name && (
                    <p className="text-red-400 text-sm mt-1">{editErrors.name}</p>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <textarea
                    name="bio"
                    value={editForm.bio}
                    onChange={handleEditChange}
                    rows="4"
                    className="w-full px-4 py-2 bg-[#020617] border border-white/20 rounded-lg focus:outline-none focus:border-accent"
                    placeholder="Tell others about yourself..."
                    disabled={isSaving}
                  />
                </div>

                {/* Skill to Teach */}
                <div>
                  <label className="block text-sm font-medium mb-2">Skill You Can Teach</label>
                  <select
                    name="offer"
                    value={editForm.offer}
                    onChange={handleEditChange}
                    className={`w-full px-4 py-2 bg-[#020617] rounded-lg focus:outline-none transition ${
                      editErrors.offer
                        ? 'border-2 border-red-500'
                        : 'border border-white/20 focus:border-accent'
                    }`}
                    disabled={isSaving}
                  >
                    <option value="">Select a skill</option>
                    {validSkills.map(skill => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                  </select>
                  {editErrors.offer && (
                    <p className="text-red-400 text-sm mt-1">{editErrors.offer}</p>
                  )}
                </div>

                {/* Skill to Learn */}
                <div>
                  <label className="block text-sm font-medium mb-2">Skill You Want to Learn</label>
                  <select
                    name="learn"
                    value={editForm.learn}
                    onChange={handleEditChange}
                    className={`w-full px-4 py-2 bg-[#020617] rounded-lg focus:outline-none transition ${
                      editErrors.learn
                        ? 'border-2 border-red-500'
                        : 'border border-white/20 focus:border-accent'
                    }`}
                    disabled={isSaving}
                  >
                    <option value="">Select a skill</option>
                    {validSkills.map(skill => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                  </select>
                  {editErrors.learn && (
                    <p className="text-red-400 text-sm mt-1">{editErrors.learn}</p>
                  )}
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full px-4 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 font-medium"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* Profile Info */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Skills Teaching */}
            <div className="bg-[#0F172A]/80 border border-white/10 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Skills I Can Teach</h3>
              {profileData?.offer ? (
                <div className="flex flex-wrap gap-2">
                  {profileData.offer.split(',').map((skill, idx) => (
                    <span key={idx} className="bg-primary/20 border border-primary px-4 py-2 rounded-full text-sm">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No skills added yet</p>
              )}
            </div>

            {/* Skills Learning */}
            <div className="bg-[#0F172A]/80 border border-white/10 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Skills I Want to Learn</h3>
              {profileData?.learn ? (
                <div className="flex flex-wrap gap-2">
                  {profileData.learn.split(',').map((skill, idx) => (
                    <span key={idx} className="bg-accent/20 border border-accent px-4 py-2 rounded-full text-sm">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No skills added yet</p>
              )}
            </div>
          </div>

          {/* Bio Section */}
          {profileData?.bio && (
            <div className="bg-[#0F172A]/80 border border-white/10 rounded-lg p-6 mt-8">
              <h3 className="text-xl font-bold mb-4">About</h3>
              <p className="text-gray-300">{profileData.bio}</p>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
};
