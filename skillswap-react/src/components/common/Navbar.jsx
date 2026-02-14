import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-[#020617]/80 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center font-bold text-white text-lg">
            S
          </div>
          <span className="text-xl font-semibold">SkillSwap</span>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="hover:text-accent transition">Home</Link>
          <Link to="/browse" className="hover:text-accent transition">Browse</Link>
          <Link to="/chat" className="hover:text-accent transition">Chat</Link>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link to="/profile" className="hover:text-accent transition">Profile</Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-opacity-90 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="hover:text-accent transition">Sign In</Link>
              <Link
                to="/signup"
                className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:opacity-90 transition glow-btn"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
