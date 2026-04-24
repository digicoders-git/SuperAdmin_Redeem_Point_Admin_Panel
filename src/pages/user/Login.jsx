import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import Swal from "sweetalert2";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shopIdFromQR = searchParams.get("shopId") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shopName, setShopName] = useState("");

  useEffect(() => {
    if (shopIdFromQR) {
      api.get(`/users/shop-info/${shopIdFromQR}`)
        .then(({ data }) => setShopName(data.shopName))
        .catch(() => {});
    }
  }, [shopIdFromQR]);

  const handleGoogleSuccess = async (tokenResponse) => {
    setLoading(true);
    try {
      const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      if (!userInfoRes.ok) throw new Error("Failed to fetch Google user info");
      const userInfo = await userInfoRes.json();
      if (!userInfo.email) throw new Error("No email from Google");
      const { data } = await api.post("/users/google-login", {
        googleUserInfo: userInfo,
        shopId: shopIdFromQR,
      });
      localStorage.setItem("userToken", data.token);
      localStorage.setItem("userInfo", JSON.stringify(data.user));
      Swal.fire({ icon: "success", title: `Welcome, ${data.user.name}!`, timer: 800, showConfirmButton: false });
      setTimeout(() => {
        if (data.multipleShops) {
          window.location.href = "/user/shop-selection";
        } else {
          window.location.href = "/user/bills";
        }
      }, 300);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Google Login Failed", text: err.response?.data?.message || err.message || "Try again" });
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => Swal.fire({ icon: "error", title: "Google Login Failed" }),
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/users/login", {
        email,
        password,
        shopId: shopIdFromQR,
      });
      localStorage.setItem("userToken", data.token);
      localStorage.setItem("userInfo", JSON.stringify(data.user));
      Swal.fire({ icon: "success", title: "Welcome!", timer: 800, showConfirmButton: false });
      setTimeout(() => {
        if (data.multipleShops) {
          window.location.href = "/user/shop-selection";
        } else {
          window.location.href = "/user/bills";
        }
      }, 300);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.response?.data?.message || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  const inputWrap = "flex items-center bg-[#fff5f5] border-2 border-[#ffe4e4] rounded-2xl px-4 py-3.5 gap-3";
  const inputCls = "bg-transparent w-full text-sm text-gray-800 placeholder-gray-400 outline-none font-medium";

  return (
    <div className="min-h-screen bg-[#fff5f5] font-sans flex flex-col items-center justify-center px-5">
      <div className="fixed top-0 left-0 w-72 h-72 bg-[#800000]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-72 h-72 bg-[#800000]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-3xl shadow-lg overflow-hidden mb-4">
            <img src="/WhatsApp Image 2026-04-23 at 17.37.03.jpeg" alt="Inaamify" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1a0000] tracking-tight">{shopName || "Inaamify"}</h1>
          <p className="text-sm text-gray-400 font-medium mt-1">Enter your email & password to continue</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-[#800000]/10 border border-[#ffe4e4] p-7">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Email</label>
              <div className={inputWrap}>
                <Mail size={18} className="text-[#800000] shrink-0" />
                <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputCls} />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Password</label>
              <div className={inputWrap}>
                <Lock size={18} className="text-[#800000] shrink-0" />
                <input type={showPwd ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputCls} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-gray-400 shrink-0">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#800000] to-[#6b0000] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#800000]/30 transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Please wait...</> : "Continue"}
            </button>

            {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-semibold">OR</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <button type="button" onClick={() => googleLogin()} disabled={loading} className="w-full bg-white border-2 border-gray-200 text-gray-700 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-50 transition active:scale-[0.98] disabled:opacity-60">
                  <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                  Continue with Google
                </button>
              </>
            )}
          </form>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">New here? Just enter your email & password — account will be created automatically.</p>
      </div>
    </div>
  );
}
