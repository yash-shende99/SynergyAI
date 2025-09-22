'use client';

import { useMemo, FC } from 'react';
import { Notification, NotificationType } from '../../../types';
import NotificationCard from './NotificationCard';

// This is our master list of all notifications
const mockAllNotifications: Notification[] = [
    { id: 'n1', type: 'Risk Alert', title: 'Critical risk: CEO Resignation at SolarTech.', timestamp: '1h ago', isRead: false, priority: 'Critical'},
    { id: 'n2', type: 'Comment', title: 'Priya mentioned you in "MSA.docx".', timestamp: '3h ago', isRead: false },
    { id: 'n3', type: 'Deal Update', title: 'New financials for Project Neptune.', timestamp: '5h ago', isRead: true },
    { id: 'n4', type: 'Risk Alert', title: 'High legal risk: Competitor lawsuit.', timestamp: 'Yesterday', isRead: false, priority: 'High'},
    { id: 'n5', type: 'System', title: 'Your export of "Valuation Report" is complete.', timestamp: 'Yesterday', isRead: true },
    { id: 'n6', type: 'Deal Update', title: 'Project Helios moved to "Negotiation".', timestamp: 'Yesterday', isRead: true },
];

interface NotificationFeedProps {
  // This prop tells the component which primary filter to apply
  filterType: NotificationType | 'All';
}

const NotificationFeed: FC<NotificationFeedProps> = ({ filterType }) => {
  const filteredNotifications = useMemo(() => {
    if (filterType === 'All') return mockAllNotifications;
    return mockAllNotifications.filter(n => n.type === filterType);
  }, [filterType]);

  return (
    <div className="max-w-3xl mx-auto space-y-2">
      {filteredNotifications.length > 0 ? (
        filteredNotifications.map(notif => <NotificationCard key={notif.id} notification={notif} />)
      ) : (
        <div className="text-center pt-16 text-secondary">No notifications of this type.</div>
      )}
    </div>
  );
};

export default NotificationFeed;