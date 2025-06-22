// src/components/NotificationList.tsx
import React from "react";
import { markAsRead } from "../firebase/notifications";
import type { Notification } from "../firebase/notifications";

interface Props {
  notifications: Notification[];
  userId: string;
  onUpdate: (updated: Notification[]) => void;
}

const NotificationList: React.FC<Props> = ({ notifications, userId, onUpdate }) => {
  const handleMarkAsRead = async (notifId: string) => {
    await markAsRead(notifId);
    onUpdate(notifications.map((n) => n.id === notifId ? { ...n, read: true } : n));
  };

  if (!notifications.length) {
    return (
      <div className="p-6 text-center text-gray-500 bg-white shadow rounded-xl">
        <p>🎉 You’re all caught up!</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto max-h-[30rem] divide-y divide-brown-100 bg-white rounded-xl shadow">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`flex items-start gap-3 p-4 ${!n.read ? "bg-yellow-50" : ""}`}
        >
          <div className="flex-1">
            <div className="font-semibold text-brown-700">{n.title}</div>
            <div className="text-sm text-gray-700">{n.body}</div>
            <div className="mt-1 text-xs text-gray-400">{formatTime(n.createdAt)}</div>
          </div>
          {!n.read && (
            <button
              className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded hover:bg-yellow-200"
              onClick={() => handleMarkAsRead(n.id)}
            >
              Mark as read
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

function formatTime(date: any) {
  if (!date) return "";
  const d = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
  return d.toLocaleString();
}

export default NotificationList;
