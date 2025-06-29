import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import NotificationList from "./NotificationList";
import { getUserNotifications } from "../firebase/notifications";
import type { Notification } from "../firebase/notifications";
import localforage from "localforage";
import { useUserContext } from "../contexts/UserContext";

const LOCAL_KEY_PREFIX = "notifications_cache_";

const NotificationBell: React.FC = () => {
  const { userId } = useUserContext();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Load cached notifications on mount
  useEffect(() => {
    if (!userId) return;
    const key = LOCAL_KEY_PREFIX + userId;
    localforage.getItem<Notification[]>(key).then((cached) => {
      if (cached && Array.isArray(cached)) {
        setNotifications(cached);
        setUnreadCount(cached.filter((n) => !n.read).length);
      }
      setLoading(false);
    });
  }, [userId]);

  // Fetch fresh notifications when bell is opened or periodically
  useEffect(() => {
    if (!userId) return;
    
    const fetchNotifications = async () => {
      setLoading(true);
      const key = LOCAL_KEY_PREFIX + userId;
      try {
        const notifs = await getUserNotifications(userId);
        const mapped = notifs.map((n) => ({
          id: n.id,
          userId: n.userId ?? userId,
          title: n.title ?? "",
          body: n.body ?? "",
          read: n.read ?? false,
          createdAt: n.createdAt ?? null,
          metaType: n.metaType,
          role: n.role,
          expiryDate: n.expiryDate,
        }));
        
        // Sort by creation date (newest first)
        mapped.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });
        
        setNotifications(mapped);
        setUnreadCount(mapped.filter((n) => !n.read).length);
        await localforage.setItem(key, mapped);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately when opened
    if (open) {
      fetchNotifications();
    }

    // Set up periodic refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [userId, open]);

  // Handle notification updates from NotificationList
  const handleNotificationUpdate = (updatedNotifications: Notification[]) => {
    const updatedWithUserId = updatedNotifications.map((n) => ({ ...n, userId }));
    setNotifications(updatedWithUserId);
    setUnreadCount(updatedWithUserId.filter((n) => !n.read).length);
    
    // Update cache
    const key = LOCAL_KEY_PREFIX + userId;
    localforage.setItem(key, updatedWithUserId);
  };

  // Enhanced notification bell with better visual feedback
  return (
    <div className="relative">
      <button
        className={`relative p-2 transition-all duration-200 rounded-full hover:bg-brown-100 ${
          unreadCount > 0 ? 'animate-pulse' : ''
        }`}
        onClick={() => setOpen((o) => !o)}
        title={`${unreadCount} unread notifications`}
      >
        <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'text-red-600' : 'text-gray-600'}`} />
        {unreadCount > 0 && (
          <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full animate-bounce -top-1 -right-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      {open && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-25 md:hidden" 
            onClick={() => setOpen(false)} 
          />
          
          {/* Notification panel */}
          <div className="absolute right-0 z-50 mt-2 bg-white border border-gray-200 shadow-2xl w-80 max-h-96 rounded-2xl">
            {loading ? (
              <div className="p-6 text-center text-gray-400">
                <div className="inline-block w-4 h-4 border-2 border-gray-300 rounded-full border-t-blue-600 animate-spin"></div>
                <p className="mt-2 text-sm">Loading notifications...</p>
              </div>
            ) : (
              <NotificationList
                notifications={notifications}
                userId={userId}
                onUpdate={handleNotificationUpdate}
                onClose={() => setOpen(false)}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;