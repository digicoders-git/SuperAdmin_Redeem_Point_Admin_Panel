import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Strip /api suffix and any trailing slashes to get the server base URL
const serverBaseUrl = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "").replace(/\/$/, "");

const toAbsoluteUrl = (url) => {
  if (!url) return url;
  const normalized = url.replace(/\\/g, "/").replace(/^\/+/, "/");
  if (normalized.startsWith("http")) return normalized;
  return serverBaseUrl + (normalized.startsWith("/") ? normalized : "/" + normalized);
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

    // Don't logout on subscription check failures
    const isSubscriptionCheck = url.includes("/subscriptions/my");

    if (status === 401 && !isSubscriptionCheck) {
      const isUserPath = window.location.pathname.startsWith("/user");
      if (isUserPath) {
        localStorage.removeItem("userToken");
        localStorage.removeItem("userInfo");
        if (window.location.pathname !== "/user/login")
          window.location.href = "/user/login";
      } else {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminInfo");
        if (window.location.pathname !== "/admin/login" && window.location.pathname !== "/")
          window.location.href = "/admin/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
