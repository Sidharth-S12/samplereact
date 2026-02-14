import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';

// Pages
import { Home } from './pages/Home';
import { Signin } from './pages/Signin';
import { Signup } from './pages/Signup';
import { Profile } from './pages/Profile';
import { Browse } from './pages/Browse';
import { Chat } from './pages/Chat';
import { Requests } from './pages/Requests';

function App() {
  return (
    <Router>
      <AuthProvider>
        <UserProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </UserProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
