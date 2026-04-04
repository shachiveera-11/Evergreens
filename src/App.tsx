import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import InfluencerDashboard from './components/InfluencerDashboard';
import AdminDashboard from './components/AdminDashboard';
import Chatbot from './components/Chatbot';
import { User } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for session (simplified for demo)
    const savedUser = localStorage.getItem('evergreens_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('evergreens_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('evergreens_user');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-beige">
        <div className="text-forest font-display font-bold text-2xl animate-pulse">EVERGREENS</div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="relative">
      {user.role === 'admin' ? (
        <AdminDashboard user={user} onLogout={handleLogout} />
      ) : (
        <>
          <InfluencerDashboard user={user} onLogout={handleLogout} />
          <Chatbot />
        </>
      )}
    </div>
  );
}
