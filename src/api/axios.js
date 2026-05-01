import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Strip /api suffix and any trailing slashes to get the server base URL
const serverBaseUrl = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "").replace(/\/$/, "");

const toAbsoluteUrl = (url) => {
  if (!url) return url;
  const normalized = url.replace(/\\/g, "/");
  if (normalized.startsWith("http")) return normalized;
  // Remove /uploads prefix if present
  const cleaned = normalized.replace(/^\/+/, "").replace(/^uploads\//, "");
  return serverBaseUrl + "/" + cleaned;
};

// Attach token to every request
api.interceptors.request.use((config) => {
  const isUserPath = window.location.pathname.startsWith("/user");
  const token = isUserPath
    ? localStorage.getItem("userToken")
    : localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto logout on 401 only for actual auth failures, not subscription checks
api.interceptors.response.use(
  (res) => {
    if (res.data?.admin?.profilePhoto)
      res.data.admin.profilePhoto = toAbsoluteUrl(res.data.admin.profilePhoto);
    if (res.data?.user?.profilePhoto)
      res.data.user.profilePhoto = toAbsoluteUrl(res.data.user.profilePhoto);
    return res;
  },
  (err) => {
    const status = err.response?.status;
    const url = err.config?.url || "";
    const currentPath = window.location.pathname;

    // Don't logout on these endpoints
    const isSubscriptionCheck = url.includes("/subscriptions/my");
    const isAuthEndpoint = url.includes("/login") || url.includes("/verify-otp") || url.includes("/send-otp") || url.includes("/complete-registration") || url.includes("/google-login") || url.includes("/update-fcm-token") || url.includes("/shop-info");
    // Don't logout if already on login page
    const isOnLoginPage = currentPath === "/user/login" || currentPath === "/admin/login" || currentPath === "/";

    if (status === 401 && !isSubscriptionCheck && !isAuthEndpoint && !isOnLoginPage) {
      const isUserPath = currentPath.startsWith("/user");
      if (isUserPath) {
        const token = localStorage.getItem("userToken");
        if (token) {
          localStorage.removeItem("userToken");
          localStorage.removeItem("userInfo");
          window.location.href = "/user/login";
        }
      } else {
        const token = localStorage.getItem("adminToken");
        if (token) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminInfo");
          window.location.href = "/admin/login";
        }
      }
    }
    return Promise.reject(err);
  }
);

export default api;
