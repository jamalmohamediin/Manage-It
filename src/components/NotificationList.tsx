import React, { useEffect, useState } from "react";
import { getUserNotifications, markAsRead } from "../firebase/notifications";
import type { Notification } from "../firebase/notifications";
import { Bell, X, Check, AlertTriangle, Activity, Stethoscope } from "lucide-react";

interface Props {
  notifications: Notification[];
  userId: string;
  onUpdate: (notifications: Notification[]) => void;
  onClose?: () => void;
}

const NotificationList: React.FC<Props> = ({ 
  notifications: propNotifications, 
  userId, 
  onUpdate,
  onClose 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>(propNotifications);

  // Update local state when props change
  useEffect(() => {
    setNotifications(propNotifications);
  }, [propNotifications]);

  const handleMarkAsRead = async (notifId: string) => {
    try {
      await markAsRead(notifId);
      const updatedNotifications = notifications.map((n) => 
        n.id === notifId ? { ...n, read: true } : n
      );
      setNotifications(updatedNotifications);
      onUpdate(updatedNotifications);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      
      // Mark all unread notifications as read
      await Promise.all(
        unreadNotifications.map(n => markAsRead(n.id))
      );
      
      const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
      setNotifications(updatedNotifications);
      onUpdate(updatedNotifications);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (notification: Notification) => {
    if (notification.metaType === 'vitals-alert' || notification.metaType === 'auto-escalation') {
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
    if (notification.metaType === 'triage-update') {
      return <Activity className="w-4 h-4 text-orange-500" />;
    }
    if (notification.role === 'healthcare-provider') {
      return <Stethoscope className="w-4 h-4 text-blue-500" />;
    }
    return <Bell className="w-4 h-4 text-gray-500" />;
  };

  // Get notification priority styling
  const getNotificationStyle = (notification: Notification) => {
    if (notification.metaType === 'auto-escalation' || notification.title.includes('🚨')) {
      return !notification.read ? "bg-red-50 border-l-4 border-red-500" : "bg-gray-50 border-l-4 border-gray-300";
    }
    if (notification.metaType === 'vitals-alert') {
      return !notification.read ? "bg-orange-50 border-l-4 border-orange-500" : "bg-gray-50 border-l-4 border-gray-300";
    }
    return !notification.read ? "bg-blue-50 border-l-4 border-blue-500" : "bg-gray-50 border-l-4 border-gray-300";
  };

  if (!notifications.length) {
    return (
      <div className="p-6 text-center text-gray-500 bg-white shadow rounded-xl">
        <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <h3 className="mb-2 font-medium text-gray-600">🎉 You're all caught up!</h3>
        <p className="text-sm text-gray-500">No new notifications at this time</p>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 mt-4 text-sm text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200"
          >
            Close
          </button>
        )}
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="overflow-hidden bg-white shadow-lg rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">
            Notifications ({notifications.length})
          </h3>
          {unreadCount > 0 && (
            <span className="px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded hover:bg-blue-200"
              title="Mark all as read"
            >
              <Check className="inline w-3 h-3 mr-1" />
              Mark all read
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-gray-400 rounded hover:text-gray-600"
              title="Close notifications"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto divide-y divide-gray-100 max-h-80">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 transition-colors hover:bg-gray-50 ${getNotificationStyle(n)}`}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 mt-1">
                {getNotificationIcon(n)}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className={`text-sm font-medium ${!n.read ? 'text-gray-900' : 'text-gray-600'}`}>
                      {n.title}
                    </h4>
                    <p className={`text-sm mt-1 ${!n.read ? 'text-gray-700' : 'text-gray-500'}`}>
                      {n.body}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-xs text-gray-400">
                        {formatTime(n.createdAt)}
                      </p>
                      {n.metaType && (
                        <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-200 rounded">
                          {formatMetaType(n.metaType)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Mark as read button */}
                  {!n.read && (
                    <button
                      className="px-2 py-1 text-xs font-medium text-blue-600 transition-colors bg-blue-100 rounded hover:bg-blue-200"
                      onClick={() => handleMarkAsRead(n.id)}
                      title="Mark as read"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer for large notification lists */}
      {notifications.length > 5 && (
        <div className="p-3 text-center border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500">
            Showing {notifications.length} notifications
          </p>
        </div>
      )}
    </div>
  );
};

// Helper function to format time
function formatTime(date: any): string {
  if (!date) return "Just now";
  
  const d = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return d.toLocaleDateString();
}

// Helper function to format meta type
function formatMetaType(metaType: string): string {
  switch (metaType) {
    case 'vitals-alert': return 'Vitals';
    case 'auto-escalation': return 'Critical';
    case 'triage-update': return 'Triage';
    case 'role-expiry': return 'Access';
    default: return 'System';
  }
}

export default NotificationList;