'use client';

import { useState, useEffect, useCallback } from 'react';
import { Notification } from '../../../../types';
import { Loader2, AlertTriangle, Download } from 'lucide-react';
import { supabase } from '../../../../lib/supabaseClient';
import NotificationFeed from '../../../../components/features/notifications/NotificationFeed';

export default function SystemNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setIsLoading(false); return; }
    try {
      const response = await fetch('http://localhost:8000/api/notifications', {
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
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    try {
      await fetch(`http://localhost:8000/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
    } catch (error) {
      console.error("Failed to mark as read:", error);
      fetchNotifications(); 
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
  }
  
  if (error) {
    return <div className="flex flex-col items-center justify-center h-full text-red-400"><AlertTriangle className="h-8 w-8 mb-2"/><p>{error}</p></div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="h-8 w-8 text-amber-400"/>
            <div>
                <h2 className="text-2xl font-bold text-white">Risk Alerts</h2>
                <p className="text-secondary">AI-identified risks and critical events requiring your attention.</p>
            </div>
        </div>
        <NotificationFeed 
            filterType="Risk Alert" 
            notifications={notifications}
            onMarkAsRead={() => {}} // Placeholder, would be implemented same as above
        />
    </div>
  );
}

