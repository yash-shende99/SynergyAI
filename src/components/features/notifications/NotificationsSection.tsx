'use client';

import { FC, useState } from 'react';
import { Notification, NotificationType } from '../../../types';
import NotificationFeed from './NotificationFeed';
import { Bell } from 'lucide-react';
import {Button} from '../../ui/button';

interface NotificationsSectionProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
}

const tabs: (NotificationType | 'All')[] = ['All', 'Deal Update', 'Risk Alert', 'Comment', 'System'];

const NotificationsSection: FC<NotificationsSectionProps> = ({ notifications, onMarkAsRead }) => {
  const [activeTab, setActiveTab] = useState<NotificationType | 'All'>('All');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-primary"/>
          <div>
            <h2 className="text-2xl font-bold text-white">Notifications</h2>
            <p className="text-secondary">Your central hub for all project and system alerts.</p>
          </div>
        </div>
        <Button variant="secondary" size="sm">Mark All as Read</Button>
      </div>
      
      <div className="flex border-b border-border mb-4">
        {tabs.map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-secondary'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <NotificationFeed 
        filterType={activeTab} 
        notifications={notifications}
        onMarkAsRead={onMarkAsRead}
      />
    </div>
  );
};
export default NotificationsSection;

