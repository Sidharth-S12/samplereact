import React, { createContext, useState, useEffect } from 'react';
import { userService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);

  const fetchAllUsers = async () => {
    if (!user) return [];
    setUsersLoading(true);
    setUsersError(null);
    try {
      const allUsers = await userService.getUsersExceptCurrent(user.uid);
      setUsers(allUsers);
      return allUsers;
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsersError(err.message);
      return [];
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllUsers();
    } else {
      setUsers([]);
    }
  }, [user]);

  const searchUsers = (query) => {
    if (!query.trim()) return users;
    
    const lowerQuery = query.toLowerCase();
    return users.filter(u => {
      const name = (u.name || '').toLowerCase();
      const offer = (u.offer || '').toLowerCase();
      const learn = (u.learn || '').toLowerCase();
      
      return name.includes(lowerQuery) || 
             offer.includes(lowerQuery) || 
             learn.includes(lowerQuery);
    });
  };

  const filterBySkills = (skillOffer = null, skillLearn = null) => {
    return users.filter(u => {
      let matchOffer = true;
      let matchLearn = true;

      if (skillOffer) {
        const offers = (u.offer || '').split(',').map(s => s.trim());
        matchOffer = offers.includes(skillOffer);
      }

      if (skillLearn) {
        const learns = (u.learn || '').split(',').map(s => s.trim());
        matchLearn = learns.includes(skillLearn);
      }

      return matchOffer && matchLearn;
    });
  };

  const value = {
    users,
    usersLoading,
    usersError,
    fetchAllUsers,
    searchUsers,
    filterBySkills
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
