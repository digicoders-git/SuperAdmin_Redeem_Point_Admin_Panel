import { useState, useEffect } from "react";
import { Bell, Trash2, Check, CheckCheck } from "lucide-react";
import api from "../api/axios";
import BottomNav from "../components/BottomNav";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    // Mark all as read when page opens
    const markAllRead = async () => {
      try {
        await api.patch("/notifications/admin/read-all");
      } catch (error) {}
    };
    markAllRead();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get("/notifications/admin");
      setNotifications(data.notifications || []);
      // Trigger storage event to update badge in BottomNav
      window.dispatchEvent(new Event('notificationsRead'));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      window.dispatchEvent(new Event('notificationsRead'));
    } catch (error) {
      console.error(error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/admin/read-all");
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      window.dispatchEvent(new Event('notificationsRead'));
    } catch (error) {
      console.error(error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
      window.dispatchEvent(new Event('notificationsRead'));
    } catch (error) {
      console.error(error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-gradient-to-br from-[#800000] to-[#6b0000] px-6 pt-12 pb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                <Bell size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-white font-extrabold text-2xl">Notifications</h1>
                <p className="text-white/70 text-sm">{unreadCount} unread</p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
                <CheckCheck size={16} />
                Mark All
              </button>
            )}
          </div>
        </div>

        <div className="px-5 py-6 space-y-3">
          {loading ? (
            <div className="text-center py-10 text-gray-400">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-10">
              <Bell size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400 font-semibold">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div key={notif._id} className={`bg-white rounded-2xl border p-4 ${notif.isRead ? "border-gray-200" : "border-[#800000] bg-[#fffafa]"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-800">{notif.title}</h3>
                      {!notif.isRead && <span className="w-2 h-2 bg-[#800000] rounded-full" />}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notif.message}</p>
                    <p className="text-xs text-gray-400">{new Date(notif.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    {!notif.isRead && (
                      <button onClick={() => markAsRead(notif._id)} className="text-green-600 hover:bg-green-50 p-2 rounded-lg">
                        <Check size={18} />
                      </button>
                    )}
                    <button onClick={() => deleteNotification(notif._id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <BottomNav />
    </>
  );
}
