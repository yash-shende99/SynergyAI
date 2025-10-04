// components/features/notifications/NotificationFeed.tsx
import { useMemo, FC } from 'react';
import { Notification, NotificationType } from '../../../types';
import NotificationCard from './NotificationCard';
import { Inbox, AlertTriangle } from 'lucide-react';

interface NotificationFeedProps {
  filterType: NotificationType | 'All';
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  error?: string;
}

const NotificationFeed: FC<NotificationFeedProps> = ({ filterType, notifications, onMarkAsRead, error }) => {
  const filteredNotifications = useMemo(() => {
    if (filterType === 'All') return notifications;
    return notifications.filter(n => n.type === filterType);
  }, [filterType, notifications]);

  if (error) {
    return <div className="text-center pt-16 text-red-400"><AlertTriangle className="mx-auto mb-2"/>{error}</div>;
  }

  return (
    <div className="space-y-2">
      {filteredNotifications.length > 0 ? (
        filteredNotifications.map(notif => 
          <NotificationCard key={notif.id} notification={notif} onMarkAsRead={onMarkAsRead} />)
      ) : (
        <div className="text-center pt-16 text-secondary">
          <Inbox size={48} className="mx-auto mb-4 opacity-30"/>
          <p className="font-semibold">No notifications of this type.</p>
        </div>
      )}
    </div>
  );
};
export default NotificationFeed;