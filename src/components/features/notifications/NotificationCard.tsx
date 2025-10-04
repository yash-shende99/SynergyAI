import { FC } from 'react';
import { Notification, NotificationType } from '../../../types';
import { FileText, MessageSquare, AlertTriangle, Download, Check } from 'lucide-react';
import {Button} from '../../ui/button';

const getNotificationDetails = (type: NotificationType) => {
    switch (type) {
        case 'Deal Update': return { icon: FileText, color: 'text-blue-400' };
        case 'Risk Alert': return { icon: AlertTriangle, color: 'text-amber-400' };
        case 'Comment': return { icon: MessageSquare, color: 'text-purple-400' };
        case 'System': return { icon: Download, color: 'text-slate-400' };
    }
};

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

const NotificationCard: FC<NotificationCardProps> = ({ notification, onMarkAsRead }) => {
  const details = getNotificationDetails(notification.type);
  const isCritical = notification.priority === 'Critical';

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
      isCritical ? 'bg-red-500/10 border-red-500/30' : 'bg-surface/50 border-border'
    } ${!notification.isRead ? 'border-primary/50' : ''}`}>
      <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${isCritical ? 'bg-red-500/20' : 'bg-background/50'}`}>
        <details.icon size={18} className={isCritical ? 'text-red-400' : details.color} />
      </div>
      <div className="flex-1">
        <p className={`text-sm ${notification.isRead ? 'text-slate-400' : 'text-white font-semibold'}`}>{notification.title}</p>
        <p className="text-xs text-secondary">{new Date(notification.timestamp).toLocaleString()}</p>
      </div>
      
      {/* --- THIS IS THE DEFINITIVE FIX --- */}
      {/* The button is now fully functional and calls the handler passed down from the parent page. */}
      {!notification.isRead && (
        <Button onClick={() => onMarkAsRead(notification.id)} variant="secondary" size="sm">
          <Check size={16} className="mr-2"/> Mark as Read
        </Button>
      )}
    </div>
  );
};

export default NotificationCard;

