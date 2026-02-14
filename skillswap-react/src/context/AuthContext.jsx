import React, { createContext, useState, useEffect } from 'react';
import { authService, userService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      
      // Fetch user profile if user exists
      if (currentUser) {
        try {
          let profile = await userService.getUser(currentUser.uid);
          
          // If profile doesn't exist, create a default one
          if (!profile) {
            console.log('Profile not found. Creating default profile for:', currentUser.uid);
            const defaultProfile = {
              uid: currentUser.uid,
              name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
              email: currentUser.email,
              offer: '',
              learn: '',
              avgRating: 0,
              totalRatings: 0,
              sessionsCompleted: 0,
              bio: '',
              createdAt: new Date().toISOString()
            };
            
            // Save the default profile to database
            await userService.updateUser(currentUser.uid, defaultProfile);
            profile = defaultProfile;
          }
          
          setUserProfile(profile);
        } catch (err) {
          console.error('Error fetching/creating user profile:', err);
          setError(err.message);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email, password, name, skillOffer, skillLearn) => {
    setError(null);
    const result = await authService.signup(email, password, name, skillOffer, skillLearn);
    if (!result.success) {
      setError(result.error);
    }
    return result;
  };

  const login = async (email, password) => {
    setError(null);
    const result = await authService.login(email, password);
    if (!result.success) {
      setError(result.error);
    }
    return result;
  };

  const logout = async () => {
    setError(null);
    const result = await authService.logout();
    setUser(null);
    setUserProfile(null);
    return result;
  };

  const updateProfile = async (updates) => {
    if (!user) return { success: false, error: 'No user logged in' };
    const result = await userService.updateUser(user.uid, updates);
    if (result.success) {
      setUserProfile(prev => ({ ...prev, ...updates }));
    }
    return result;
  };

  const value = {
    user,
    userProfile,
    loading,
    error,
    signup,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
