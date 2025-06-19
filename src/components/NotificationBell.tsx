import React, { useState, useEffect, useContext } from "react";
import { Bell } from "lucide-react";
import NotificationList from "./NotificationList";
import { UserContext } from "../contexts/UserContext";
import { getUserNotifications } from "../firebase/notifications";
import type { Notification } from "../firebase/notifications";
import localforage from "localforage";

const LOCAL_KEY_PREFIX = "notifications_cache_";

const NotificationBell: React.FC = () => {
  const { userId } = useContext(UserContext);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Load notifications from cache first (instant/offline display)
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

  // Then fetch from Firestore and update cache
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    const key = LOCAL_KEY_PREFIX + userId;
    getUserNotifications(userId)
      .then((notifs) => {
        const mapped = notifs.map((n) => ({
          id: n.id,
          userId: n.userId ?? userId,
          title: n.title ?? "",
          body: n.body ?? "",
          read: n.read ?? false,
          createdAt: n.createdAt ?? null,
        }));
        setNotifications(mapped);
        setUnreadCount(mapped.filter((n) => !n.read).length);
        localforage.setItem(key, mapped);
      })
      .catch(() => {
        // If Firestore fails (offline), keep local cache
      })
      .finally(() => setLoading(false));
  }, [userId, open]);

  return (
    <div className="relative">
      <button
        className="relative p-2 transition rounded-full hover:bg-brown-100"
        onClick={() => setOpen((o) => !o)}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full -top-1 -right-1">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 bg-white shadow-2xl w-80 max-h-96 rounded-2xl">
          {loading ? (
            <div className="p-6 text-center text-gray-400">Loading notifications...</div>
          ) : (
            <NotificationList
              notifications={notifications}
              userId={userId}
              onUpdate={(updated) => {
                // Ensure updated notifications have userId property
                const updatedWithUserId = updated.map((notification) => ({
                  ...notification,
                  userId: userId,
                }));
                setNotifications(updatedWithUserId);
                // Update cache instantly for offline consistency
                const key = LOCAL_KEY_PREFIX + userId;
                localforage.setItem(key, updatedWithUserId);
                setUnreadCount(updatedWithUserId.filter((n) => !n.read).length);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
