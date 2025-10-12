// components/AuthModal.jsx
'use client'

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import synergyLogo from '@/app/../../public/synergy-logo.png';
import { X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setLoading(false);
  };

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const url = isSignUp 
      ? 'http://localhost:8000/api/auth/signup' 
      : 'http://localhost:8000/api/auth/login';
      
    const body = isSignUp 
      ? { name, email, password, confirmPassword } 
      : { email, password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'An unknown error occurred.');
      }

      if (isSignUp) {
        alert(data.message);
        setIsSignUp(false);
        resetForm();
      } else {
        const sessionData = JSON.parse(data.session);
        const { error } = await supabase.auth.setSession({
          access_token: sessionData.access_token,
          refresh_token: sessionData.refresh_token,
        });
        if (error) throw error;
        
        onClose();
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md p-8 bg-surface border border-border rounded-2xl shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-8">
          <img src={synergyLogo.src} alt="SynergyAI Logo" className="h-16 w-16 mx-auto" />
          <h1 className="text-3xl font-bold mt-4 text-white">Welcome to SynergyAI</h1>
          <p className="text-secondary">
            {isSignUp ? 'Create your account to begin.' : 'Sign in to your workspace.'}
          </p>
        </div>
        
        <form onSubmit={handleAuthAction} className="space-y-4">
          {isSignUp && (
            <input 
              type="text" 
              placeholder="Full Name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder-gray-400"
            />
          )}
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder-gray-400"
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder-gray-400"
          />
          {isSignUp && (
            <input 
              type="password" 
              placeholder="Confirm Password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder-gray-400"
            />
          )}
          
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full mt-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors disabled:bg-primary/50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <p className="text-center text-sm text-secondary mt-6">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button 
            onClick={() => { 
              setIsSignUp(!isSignUp); 
              setError(''); 
            }} 
            className="font-semibold text-primary hover:underline ml-1"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}