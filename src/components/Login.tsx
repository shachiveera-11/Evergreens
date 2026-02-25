import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Lock, ArrowRight, Briefcase } from 'lucide-react';

interface LoginProps {
  onLogin: (user: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
    const body = isRegistering ? { email, password, name } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        if (isRegistering) {
          setIsRegistering(false);
          setError('Registration successful! Please login.');
        } else {
          onLogin(data.user);
        }
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (err) {
      setError('Failed to connect to server');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-beige">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-forest mb-2">EVERGREENS</h1>
          <p className="text-sage">Influencer Collaboration Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-sage" size={18} />
              <input
                type="text"
                placeholder="Full Name"
                className="input-field pl-12"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 text-sage" size={18} />
            <input
              type="email"
              placeholder="Email Address"
              className="input-field pl-12"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 text-sage" size={18} />
            <input
              type="password"
              placeholder="Password"
              className="input-field pl-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
            {isRegistering ? 'Create Account' : 'Sign In'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-sm text-forest font-medium hover:underline"
          >
            {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-sage/10 text-center">
          <p className="text-xs text-sage uppercase tracking-widest font-semibold">Mumbai, India</p>
        </div>
      </motion.div>
    </div>
  );
}
