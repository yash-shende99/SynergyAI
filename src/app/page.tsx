'use client'

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient'; // We still need this for setting the session
import { useRouter } from 'next/navigation';
import synergyLogo from '@/app/../../public/synergy-logo.png';


export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // The URL now points to our secure Python backend API
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
        // Display the specific error message sent from our FastAPI backend
        throw new Error(data.detail || 'An unknown error occurred.');
      }

      if (isSignUp) {
        alert(data.message); // Show the success message from the backend
        setIsSignUp(false);   // Switch the form back to login view
      } else {
        // For login, the backend returns a session. We MUST set it in the
        // browser's Supabase client so the rest of the app knows we're logged in.
        const sessionData = JSON.parse(data.session);
        const { error } = await supabase.auth.setSession({
            access_token: sessionData.access_token,
            refresh_token: sessionData.refresh_token,
        });
        if (error) throw error;
        
        // Navigate to the main dashboard upon successful login
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-white p-4">
      <div className="w-full max-w-md p-8 bg-surface/80 border border-border rounded-2xl shadow-2xl backdrop-blur-lg">
        <div className="text-center mb-8">
          <img src={synergyLogo.src} alt="SynergyAI Logo"  className="h-16 w-16 mx-auto" />
          <h1 className="text-3xl font-bold mt-4 text-white">Welcome to SynergyAI</h1>
          <p className="text-secondary">{isSignUp ? 'Create your account to begin.' : 'Sign in to your workspace.'}</p>
        </div>
        
        <form onSubmit={handleAuthAction} className="space-y-4">
          {isSignUp && (
            <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"/>
          )}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"/>
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"/>
          {isSignUp && (
            <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"/>
          )}
          
          {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}

          <button type="submit" disabled={loading} className="w-full mt-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors disabled:bg-primary/50">
            {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <p className="text-center text-sm text-secondary mt-6">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="font-semibold text-primary hover:underline ml-1">
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}