import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, IndianRupee, Gift, CheckCircle, CreditCard, UserCircle, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../api/axios";
import Swal from "sweetalert2";

const tabs = [
  { path: "/admin/dashboard", icon: LayoutDashboard, label: "Home" },
  { path: "/admin/users", icon: Users, label: "Users" },
  { path: "/admin/bills", icon: IndianRupee, label: "Bills" },
  { path: "/admin/redemptions", icon: CheckCircle, label: "Redeem" },
  { path: "/admin/rewards", icon: Gift, label: "Rewards" },
  { path: "/admin/profile", icon: UserCircle, label: "Profile" },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const { data } = await api.get("/notifications/admin");
        setUnreadCount(data.notifications?.filter(n => !n.isRead).length || 0);
      } catch (error) {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    
    // Listen for notification read events
    const handleNotificationRead = () => fetchUnread();
    window.addEventListener('notificationsRead', handleNotificationRead);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('notificationsRead', handleNotificationRead);
    };
  }, []);

  const logout = async () => {
    const res = await Swal.fire({ title: "Logout?", text: "Are you sure?", icon: "warning", showCancelButton: true, confirmButtonText: "Yes, Logout", confirmButtonColor: "#ef4444" });
    if (!res.isConfirmed) return;
    await api.post("/admin/logout-all").catch(() => {});
    localStorage.clear();
    navigate("/", { replace: true });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-lg mx-auto bg-white border-t border-[#ffe4e4] shadow-[0_-4px_20px_rgba(128,0,0,0.08)]">
        <div className="flex items-center px-2 py-1">
          {tabs.map(({ path, icon: Icon, label, badge }) => {
            const active = pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="flex-1 flex flex-col items-center py-2 gap-0.5 transition-all active:scale-95 relative"
              >
                <div className={`w-9 h-9 flex items-center justify-center rounded-2xl transition-all ${active ? "bg-[#800000]" : "bg-transparent"}`}>
                  <Icon size={18} className={active ? "text-white" : "text-gray-400"} />
                  {badge && unreadCount > 0 && (
                    <span className="absolute top-1 right-1/4 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                <span className={`text-[9px] font-bold ${active ? "text-[#800000]" : "text-gray-400"}`}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
