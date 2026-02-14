import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/common/Layout';
import { useAuth } from '../hooks/useAuth';

export const Home = () => {
  const { user, userProfile, isAuthenticated, loading } = useAuth();

  // Show loading while authenticating
  if (loading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto mb-12 py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading your dashboard...</p>
        </div>
      </Layout>
    );
  }

  if (isAuthenticated && userProfile) {
    // Dashboard view for logged-in users
    return (
      <Layout>
        <div className="max-w-6xl mx-auto mb-12">
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold mb-4">
              Welcome, <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{userProfile.name || 'User'}</span>
            </h1>
            <p className="text-xl text-gray-400">
              Ready to exchange skills with the community?
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid md:grid-cols-4 gap-4 mb-12">
            <div className="bg-[#0F172A]/80 border border-white/10 rounded-lg p-6">
              <div className="text-gray-400 text-sm mb-2">Rating</div>
              <div className="text-3xl font-bold text-accent">
                {userProfile.avgRating || 'N/A'}
              </div>
              <div className="text-gray-500 text-xs mt-1">
                {userProfile.totalRatings || 0} {userProfile.totalRatings === 1 ? 'review' : 'reviews'}
              </div>
            </div>

            <div className="bg-[#0F172A]/80 border border-white/10 rounded-lg p-6">
              <div className="text-gray-400 text-sm mb-2">Sessions</div>
              <div className="text-3xl font-bold text-primary">
                {userProfile.sessionsCompleted || 0}
              </div>
              <div className="text-gray-500 text-xs mt-1">Completed</div>
            </div>

            <div className="bg-[#0F172A]/80 border border-white/10 rounded-lg p-6">
              <div className="text-gray-400 text-sm mb-2">Skills Offered</div>
              <div className="text-3xl font-bold">
                {userProfile.offer ? userProfile.offer.split(',').length : 0}
              </div>
              <div className="text-gray-500 text-xs mt-1">
                {userProfile.offer || 'None added'}
              </div>
            </div>

            <div className="bg-[#0F172A]/80 border border-white/10 rounded-lg p-6">
              <div className="text-gray-400 text-sm mb-2">Learning</div>
              <div className="text-3xl font-bold">
                {userProfile.learn ? userProfile.learn.split(',').length : 0}
              </div>
              <div className="text-gray-500 text-xs mt-1">
                {userProfile.learn || 'None added'}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Link
              to="/browse"
              className="bg-gradient-to-r from-primary to-accent p-8 rounded-lg hover:opacity-90 transition transform hover:scale-105 duration-200"
            >
              <h3 className="text-2xl font-bold text-white mb-2">Browse Mentors</h3>
              <p className="text-white/80 mb-4">Find someone to learn from</p>
              <button className="px-6 py-2 bg-white text-primary rounded-lg font-medium hover:bg-opacity-90 transition">
                Start Browsing →
              </button>
            </Link>

            <Link
              to="/requests"
              className="bg-white/5 border border-white/20 p-8 rounded-lg hover:bg-white/10 transition transform hover:scale-105 duration-200"
            >
              <h3 className="text-2xl font-bold mb-2">View Requests</h3>
              <p className="text-gray-400 mb-4">Manage your skill exchange requests</p>
              <button className="px-6 py-2 border border-accent text-accent rounded-lg font-medium hover:bg-accent hover:text-white transition">
                Check Requests →
              </button>
            </Link>
          </div>

          {/* Skills Summary */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#0F172A]/80 border border-white/10 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Skills I Can Teach</h3>
              {userProfile.offer ? (
                <div className="flex flex-wrap gap-2">
                  {userProfile.offer.split(',').map((skill, idx) => (
                    <span key={idx} className="bg-primary/20 border border-primary px-4 py-2 rounded-full text-sm">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              ) : (
                <div>
                  <p className="text-gray-400 mb-4">No skills added yet</p>
                  <Link to="/profile" className="text-accent hover:underline">
                    Add skills →
                  </Link>
                </div>
              )}
            </div>

            <div className="bg-[#0F172A]/80 border border-white/10 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Skills I Want to Learn</h3>
              {userProfile.learn ? (
                <div className="flex flex-wrap gap-2">
                  {userProfile.learn.split(',').map((skill, idx) => (
                    <span key={idx} className="bg-accent/20 border border-accent px-4 py-2 rounded-full text-sm">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              ) : (
                <div>
                  <p className="text-gray-400 mb-4">No skills added yet</p>
                  <Link to="/profile" className="text-accent hover:underline">
                    Add skills →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Landing page for non-authenticated users
  return (
    <Layout>
      <div className="max-w-7xl mx-auto mb-20">
        {/* Hero Section */}
        <div className="text-center py-20">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Welcome to SkillSwap
          </h1>
          <p className="text-2xl text-gray-400 mb-8 max-w-3xl mx-auto">
            Learn from experts. Teach what you know. Grow together with a community of passionate learners.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:opacity-90 transition transform hover:scale-105 duration-200 font-medium text-lg"
            >
              Get Started
            </Link>
            <Link
              to="/signin"
              className="px-8 py-4 border-2 border-accent text-accent rounded-lg hover:bg-accent hover:text-white transition transform hover:scale-105 duration-200 font-medium text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 my-20">
          <div className="bg-white/5 border border-white/10 rounded-lg p-8 hover:border-primary/50 transition">
            <div className="w-12 h-12 rounded-lg bg-primary/20 mb-4 flex items-center justify-center">
              <span className="text-3xl">🎓</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Learn New Skills</h3>
            <p className="text-gray-400">
              Connect with experts and learn skills at your own pace through one-on-one sessions.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-8 hover:border-primary/50 transition">
            <div className="w-12 h-12 rounded-lg bg-primary/20 mb-4 flex items-center justify-center">
              <span className="text-3xl">👨‍🏫</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Share Your Knowledge</h3>
            <p className="text-gray-400">
              Help others learn your skills while building your reputation and earning through teaching.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-8 hover:border-primary/50 transition">
            <div className="w-12 h-12 rounded-lg bg-primary/20 mb-4 flex items-center justify-center">
              <span className="text-3xl">🎯</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Grow Together</h3>
            <p className="text-gray-400">
              Join a vibrant community of learners and teachers passionate about continuous growth.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-[#0F172A]/80 border border-white/10 rounded-lg p-12 mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-bold mb-2">Sign Up</h3>
              <p className="text-gray-400 text-sm">Create your account and fill in your skills</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-bold mb-2">Browse</h3>
              <p className="text-gray-400 text-sm">Find mentors with skills you want to learn</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-bold mb-2">Connect</h3>
              <p className="text-gray-400 text-sm">Send requests and start learning sessions</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="font-bold mb-2">Grow</h3>
              <p className="text-gray-400 text-sm">Learn, teach, and build your community</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to start your learning journey?</h2>
          <p className="text-gray-400 mb-8 text-lg">
            Join thousands of learners and teachers transforming their skills
          </p>
          <Link
            to="/signup"
            className="inline-block px-8 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:opacity-90 transition font-medium text-lg"
          >
            Get Started Today
          </Link>
        </div>
      </div>
    </Layout>
  );
};
