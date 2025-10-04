// app/dashboard/project/[projectId]/notifications/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Notification } from '../../../../../../types';
import { Loader2, FileText } from 'lucide-react';
import { supabase } from '../../../../../../lib/supabaseClient';
import NotificationFeed from '../../../../../../components/features/notifications/NotificationFeed';
import {Button} from '../../../../../../components/ui/button';


export default function AllProjectNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const params = useParams();
  const projectId = params.projectId as string;

  const fetchNotifications = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setIsLoading(false); return; }
    try {
      const response = await fetch(`http://localhost:8000/api/projects/${projectId}/notifications`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch project notifications.");
      const data = await response.json();
      setNotifications(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId: string) => { /* ... */ };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-400"/>
                <div>
                    <h2 className="text-2xl font-bold text-white">Deal Updates</h2>
                    <p className="text-secondary">Project status changes and new documents for this deal.</p>
                </div>
            </div>
            <Button variant="secondary" size="sm">Mark All as Read</Button>
        </div>
        <NotificationFeed 
            filterType="Deal Update" 
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            error={error}
        />
    </div>
  );
}