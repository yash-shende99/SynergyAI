import { FC } from 'react';
import { Notification, NotificationType } from '../../../types';
import { FileText, MessageSquare, AlertTriangle, Download } from 'lucide-react';
import {Button} from '../../ui/button';


const getNotificationDetails = (type: NotificationType) => {
    switch (type) {
        case 'Deal Update': return { icon: FileText, color: 'text-blue-400' };
        case 'Risk Alert': return { icon: AlertTriangle, color: 'text-amber-400' };
        case 'Comment': return { icon: MessageSquare, color: 'text-purple-400' };
        case 'System': return { icon: Download, color: 'text-slate-400' };
    }
};

const NotificationCard: FC<{ notification: Notification }> = ({ notification }) => {
    const details = getNotificationDetails(notification.type);
    const isCritical = notification.priority === 'Critical';

    return (
        <div className={`flex items-center gap-4 p-4 rounded-xl border ${isCritical ? 'bg-red-500/10 border-red-500/30' : 'bg-surface/50 border-border'} ${!notification.isRead ? 'border-primary/50' : ''}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${isCritical ? 'bg-red-500/20' : 'bg-background/50'}`}>
                <details.icon size={18} className={isCritical ? 'text-red-400' : details.color} />
            </div>
            <div className="flex-1">
                <p className={`text-sm ${notification.isRead ? 'text-slate-400' : 'text-white font-semibold'}`}>{notification.title}</p>
                <p className="text-xs text-secondary">{notification.timestamp}</p>
            </div>
            {!notification.isRead && (
                 <Button variant="secondary" size="sm">View</Button>
            )}
        </div>
    );
};

export default NotificationCard;