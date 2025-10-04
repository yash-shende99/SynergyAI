'use client';

import { useState, useEffect, useCallback } from 'react';
import { Notification } from '../../../types';
import { Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import NotificationFeed from '../../../components/features/notifications/NotificationFeed';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setIsLoading(false); return; }
    
    try {
      const response = await fetch(`http://localhost:8000/api/notifications`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch notifications.");
      const data = await response.json();
      setNotifications(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);
  
  const handleMarkAsRead = async (notificationId: string) => {
    // Optimistically update the UI for a snappy user experience
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
    
    // Call the backend to persist the change
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    try {
      await fetch(`http://localhost:8000/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
    } catch (error) {
      console.error("Failed to mark as read:", error);
      // If the API call fails, revert the UI change by refetching
      fetchNotifications(); 
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
  }

  if (error) {
    return <div className="flex flex-col justify-center items-center h-full text-red-400"><AlertTriangle className="h-8 w-8 mb-2"/><p>{error}</p></div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-4">Notifications</h2>
        <NotificationFeed 
            filterType="All" 
            notifications={notifications}
            onMarkAsRead={() => {}}
        />
    </div>
  );
}

