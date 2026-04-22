import { useNavigate, useLocation } from "react-router-dom";
import { IndianRupee, Gift, CheckCircle, User, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../api/axios";

const tabs = [
  { path: "/user/bills", icon: IndianRupee, label: "Bills" },
  { path: "/user/rewards", icon: Gift, label: "Rewards" },
  { path: "/user/notifications", icon: Bell, label: "Notify", badge: true },
  { path: "/user/redemptions", icon: CheckCircle, label: "Redeem" },
  { path: "/user/profile", icon: User, label: "Profile" },
];

export default function UserBottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const { data } = await api.get("/notifications/user");
        setUnreadCount(data.notifications?.filter(n => !n.isRead).length || 0);
      } catch (error) {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    
    const handleNotificationRead = () => fetchUnread();
    window.addEventListener('notificationsRead', handleNotificationRead);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('notificationsRead', handleNotificationRead);
    };
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-50">
      <div className="flex max-w-lg mx-auto">
        {tabs.map((t) => {
          const active = pathname === t.path;
          const Icon = t.icon;
          return (
            <button
              key={t.path}
              onClick={() => navigate(t.path)}
              className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors relative ${active ? "text-[#800000]" : "text-gray-400"}`}
            >
              <span className="mb-0.5 relative">
                <Icon size={20} />
                {t.badge && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-semibold">{t.label}</span>
              {active && <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] mt-0.5" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
