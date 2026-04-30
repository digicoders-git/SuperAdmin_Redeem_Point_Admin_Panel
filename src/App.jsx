import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AdminLogin from "./pages/AdminLogin";
import AdminRegister from "./pages/AdminRegister";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import AdminBills from "./pages/AdminBills";
import AdminRewards from "./pages/AdminRewards";
import AdminRedemptions from "./pages/AdminRedemptions";
import AdminTerms from "./pages/AdminTerms";
import AdminPrivacy from "./pages/AdminPrivacy";
import AdminPrivacyPage from "./pages/AdminPrivacyPage";
import AdminQRCode from "./pages/AdminQRCode";
import AdminProfile from "./pages/AdminProfile";
import SubscriptionWall from "./pages/SubscriptionWall";
import Plans from "./pages/Plans";
import Notifications from "./pages/Notifications";
import BillDetail from "./pages/BillDetail";
import RedemptionDetail from "./pages/RedemptionDetail";
import AdminConfiguration from "./pages/AdminConfiguration";
import RoleSelection from "./pages/RoleSelection";
import MerchantPortal from "./pages/MerchantPortal";

// User Panel Pages
import UserLogin from "./pages/user/Login";
import UserRegister from "./pages/user/Register";
import UserBills from "./pages/user/Bills";
import UserRewards from "./pages/user/Rewards";
import UserRedemptions from "./pages/user/Redemptions";
import UserProfile from "./pages/user/Profile";
import UserNotifications from "./pages/user/Notifications";
import UserBillDetail from "./pages/user/BillDetail";
import UserRewardDetail from "./pages/user/RewardDetail";
import UserRedemptionDetail from "./pages/user/RedemptionDetail";
import ShopSelection from "./pages/user/ShopSelection";
import UserPrivacyPolicy from "./pages/user/PrivacyPolicy";
import UserTerms from "./pages/user/Terms";

import BottomNav from "./components/BottomNav";
import UserBottomNav from "./components/UserBottomNav";
import SubscriptionModal from "./components/SubscriptionModal";
import { Download } from "lucide-react";
import PullToRefresh from "./components/PullToRefresh";
import IOSInstallPrompt from "./components/IOSInstallPrompt";
import AdminProfileSetupModal from "./components/AdminProfileSetupModal";
import UserProfileSetupModal from "./components/UserProfileSetupModal";
import api from "./api/axios";
import { getFCMToken, onMessageListener } from "./firebase";

function AdminProtectedRoute({ children }) {
  const token = localStorage.getItem("adminToken");
  if (!token) return <Navigate to="/admin/login" replace />;
  return children;
}

function UserProtectedRoute({ children }) {
  const token = localStorage.getItem("userToken");
  if (!token) return <Navigate to="/user/login" replace />;
  return children;
}

function SubscriptionRoute({ children }) {
  const token = localStorage.getItem("adminToken");
  if (!token) return <Navigate to="/admin/login" replace />;
  return children;
}

const ADMIN_NAV_ROUTES = ["/admin/dashboard", "/admin/users", "/admin/bills", "/admin/rewards", "/admin/profile", "/admin/plans", "/admin/terms"];
const USER_NAV_ROUTES = ["/user/bills", "/user/rewards", "/user/profile", "/user/notifications", "/user/redemptions"];

export default function App() {
  const location = useLocation();
  const showAdminNav = ADMIN_NAV_ROUTES.includes(location.pathname);
  const showUserNav = USER_NAV_ROUTES.includes(location.pathname);
  const [installPrompt, setInstallPrompt] = useState(() => window.__installPrompt || null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(true);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const adminToken = localStorage.getItem("adminToken");
  const userToken = localStorage.getItem("userToken");

  // Handle Firebase Messaging
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const token = await getFCMToken();
        if (!token) return;
        if (userToken) await api.put("/users/update-fcm-token", { fcmToken: token }).catch(() => {});
        if (adminToken) await api.put("/admin/update-fcm-token", { fcmToken: token }).catch(() => {});
      } catch (_) {}
    };
    setupNotifications();

    onMessageListener().then((payload) => {
      if (payload.notification) {
        alert(`${payload.notification.title}\n${payload.notification.body}`);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstallPrompt(null));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!adminToken) {
        setCheckingSubscription(false);
        return;
      }
      try {
        const { data } = await api.get("/subscriptions/my");
        setHasActiveSubscription(!!data.subscription);
      } catch (error) {
        // Only mark no subscription on 403, not on network errors or 401
        if (error.response?.status === 403) {
          setHasActiveSubscription(false);
        }
      } finally {
        setCheckingSubscription(false);
      }
    };

    checkSubscription();
  }, [adminToken]);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setInstallPrompt(null);
  };

  const isLandingPage = location.pathname === "/";

  return (
    <PullToRefresh>
      <IOSInstallPrompt />
      <div className={`${isLandingPage ? "" : "max-w-lg mx-auto"} min-h-screen bg-[#fff5f5] font-sans relative pb-safe shadow-sm`}>
        <Routes>
          {/* Landing */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/selection" element={<RoleSelection />} />
          <Route path="/merchant-portal" element={<MerchantPortal />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin/dashboard" element={<AdminProtectedRoute><Dashboard /></AdminProtectedRoute>} />
          <Route path="/admin/users" element={<AdminProtectedRoute><Users /></AdminProtectedRoute>} />
          <Route path="/admin/bills" element={<AdminProtectedRoute><AdminBills /></AdminProtectedRoute>} />
          <Route path="/admin/rewards" element={<AdminProtectedRoute><AdminRewards /></AdminProtectedRoute>} />
          <Route path="/admin/redemptions" element={<AdminProtectedRoute><AdminRedemptions /></AdminProtectedRoute>} />
          <Route path="/admin/terms" element={<AdminProtectedRoute><AdminTerms /></AdminProtectedRoute>} />
          <Route path="/admin/bills/:id" element={<AdminProtectedRoute><BillDetail /></AdminProtectedRoute>} />
          <Route path="/admin/redemptions/:id" element={<AdminProtectedRoute><RedemptionDetail /></AdminProtectedRoute>} />
          <Route path="/admin/qr-code" element={<AdminProtectedRoute><AdminQRCode /></AdminProtectedRoute>} />
          <Route path="/admin/subscription" element={<SubscriptionRoute><SubscriptionWall /></SubscriptionRoute>} />
          <Route path="/admin/plans" element={<AdminProtectedRoute><Plans /></AdminProtectedRoute>} />
          <Route path="/admin/notifications" element={<AdminProtectedRoute><Notifications /></AdminProtectedRoute>} />
          <Route path="/admin/profile" element={<AdminProtectedRoute><AdminProfile /></AdminProtectedRoute>} />
          <Route path="/admin/configuration" element={<AdminProtectedRoute><AdminConfiguration /></AdminProtectedRoute>} />
          
          {/* User Routes */}
          <Route path="/user/login" element={<UserLogin />} />
          <Route path="/user/register" element={<UserRegister />} />
          <Route path="/user/shop-selection" element={<UserProtectedRoute><ShopSelection /></UserProtectedRoute>} />
          <Route path="/user/bills" element={<UserProtectedRoute><UserBills /></UserProtectedRoute>} />
          <Route path="/user/rewards" element={<UserProtectedRoute><UserRewards /></UserProtectedRoute>} />
          <Route path="/user/redemptions" element={<UserProtectedRoute><UserRedemptions /></UserProtectedRoute>} />
          <Route path="/user/profile" element={<UserProtectedRoute><UserProfile /></UserProtectedRoute>} />
          <Route path="/user/notifications" element={<UserProtectedRoute><UserNotifications /></UserProtectedRoute>} />
          <Route path="/user/bills/:id" element={<UserProtectedRoute><UserBillDetail /></UserProtectedRoute>} />
          <Route path="/user/rewards/:id" element={<UserProtectedRoute><UserRewardDetail /></UserProtectedRoute>} />
          <Route path="/user/redemptions/:id" element={<UserProtectedRoute><UserRedemptionDetail /></UserProtectedRoute>} />
          <Route path="/user/privacy-policy" element={<UserPrivacyPolicy />} />
          <Route path="/user/terms" element={<UserProtectedRoute><UserTerms /></UserProtectedRoute>} />
          
          {/* Common */}
          <Route path="/profile" element={<Navigate to="/user/profile" replace />} />
          <Route path="/bills" element={<Navigate to="/user/bills" replace />} />
          <Route path="/rewards" element={<Navigate to="/user/rewards" replace />} />
          <Route path="/terms" element={<Navigate to="/user/terms" replace />} />
          <Route path="/privacy-policy" element={<AdminPrivacyPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <AdminProfileSetupModal />
        <UserProfileSetupModal />

        {showAdminNav && <BottomNav />}
        {showUserNav && <UserBottomNav />}

        {/* Show subscription modal if no active subscription */}
        {!checkingSubscription && !hasActiveSubscription && adminToken && location.pathname.startsWith("/admin") && location.pathname !== "/admin/login" && location.pathname !== "/admin/register" && location.pathname !== "/admin/subscription" && (
          <SubscriptionModal />
        )}

        {installPrompt && (
          <button onClick={handleInstall} className="fixed bottom-20 right-4 z-50 flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-[13px] font-bold px-5 py-3 rounded-full shadow-lg transition active:scale-[0.98]">
            <Download size={14} /> Install App
          </button>
        )}
      </div>
    </PullToRefresh>
  );
}
