// app/dashboard/settings/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../../../types';
import { Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import ProfileHeader from '../../../components/features/settings/ProfileHeader';
import ProfileInfoForm from '../../../components/features/settings/ProfileInfoForm';

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUserProfile = useCallback(async () => {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setIsLoading(false); return; }
    try {
      const response = await fetch('http://localhost:8000/api/users/me', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch user profile.");
      const data = await response.json();
      setUser(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleSave = async (updatedUser: Partial<UserProfile>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { alert("Please log in"); return; }
    try {
      const response = await fetch('http://localhost:8000/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify(updatedUser)
      });
      if (!response.ok) throw new Error("Failed to save profile.");
      alert("Profile saved successfully!");
      fetchUserProfile(); // Refresh data after saving
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
  }
  
  if (error || !user) {
    return <div className="flex flex-col justify-center items-center h-full text-red-400"><AlertTriangle className="h-8 w-8 mb-2"/><p>{error || "Could not load profile."}</p></div>;
  }

  return (
    <div className="space-y-6">
      <ProfileHeader user={user} />
      <ProfileInfoForm user={user} onSave={handleSave} />
    </div>
  );
}