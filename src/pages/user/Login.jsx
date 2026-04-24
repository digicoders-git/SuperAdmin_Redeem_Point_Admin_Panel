import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import { Gift, Phone, Loader2, User } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import Swal from "sweetalert2";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shopIdFromQR = searchParams.get("shopId") || "";
  
  const [step, setStep] = useState(1); // 1: mobile, 2: otp, 3: name+shopId (if new user)
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [shopId, setShopId] = useState(shopIdFromQR);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isNewUser, setIsNewUser] = useState(false);
  const [shopName, setShopName] = useState("");

  const handleGoogleSuccess = async (tokenResponse) => {
    setLoading(true);
    try {
      // Exchange access token for user info, then send to backend
      const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      const userInfo = await userInfoRes.json();
      const { data } = await api.post("/users/google-login", {
        idToken: tokenResponse.access_token,
        googleUserInfo: userInfo,
        shopId: shopIdFromQR,
      });
      localStorage.setItem("userToken", data.token);
      localStorage.setItem("userInfo", JSON.stringify(data.user));
      Swal.fire({ icon: "success", title: `Welcome, ${data.user.name}!`, timer: 800, showConfirmButton: false });
      setTimeout(() => { window.location.href = "/user/bills"; }, 300);
    } catch (e) {
      Swal.fire({ icon: "error", title: "Google Login Failed", text: e.response?.data?.message || "Try again" });
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({ onSuccess: handleGoogleSuccess, onError: () => Swal.fire({ icon: "error", title: "Google Login Failed" }) });

  useEffect(() => {
    if (shopIdFromQR) {
      api.get(`/users/shop-info/${shopIdFromQR}`)
        .then(({ data }) => setShopName(data.shopName))
        .catch(() => setShopName(""));
    }
  }, [shopIdFromQR]);

  const sendOTP = async (e) => {
    e.preventDefault();
    if (mobile.length !== 10) {
      Swal.fire({ icon: "error", title: "Invalid Mobile", text: "Enter valid 10-digit mobile number" });
      return;
    }
    setLoading(true);
    try {
      await api.post("/users/send-otp", { mobile });
      setStep(2);
      setTimer(60);
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      Swal.fire({ icon: "success", title: "OTP Sent", text: "Check your phone for OTP (1234)", timer: 2000, showConfirmButton: false });
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error", text: e.response?.data?.message || "Failed to send OTP" });
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 4) {
      Swal.fire({ icon: "error", title: "Invalid OTP", text: "Enter 4-digit OTP" });
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/users/verify-otp", { mobile, otp, shopId: shopIdFromQR });
      
      if (data.isNewUser) {
        // New user for this shop - ask for name
        setIsNewUser(true);
        // Pre-fill name if user has account with other shops
        if (data.existingName) {
          setName(data.existingName);
        }
        setStep(3);
      } else {
        // Existing user - login
        localStorage.setItem("userToken", data.token);
        localStorage.setItem("userInfo", JSON.stringify(data.user));
        
        Swal.fire({ icon: "success", title: "Welcome Back!", timer: 800, showConfirmButton: false });
        
        // Redirect after short delay
        setTimeout(() => {
          if (data.multipleShops) {
            window.location.href = "/user/shop-selection";
          } else {
            window.location.href = "/user/bills";
          }
        }, 300);
      }
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error", text: e.response?.data?.message || "Invalid OTP" });
    } finally {
      setLoading(false);
    }
  };

  const completeRegistration = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      Swal.fire({ icon: "error", title: "Name Required", text: "Please enter your name" });
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/users/complete-registration", { mobile, name, shopId });
      localStorage.setItem("userToken", data.token);
      localStorage.setItem("userInfo", JSON.stringify(data.user));
      
      Swal.fire({ icon: "success", title: "Welcome!", text: "Account created successfully", timer: 800, showConfirmButton: false });
      
      // Redirect after short delay
      setTimeout(() => {
        window.location.href = "/user/bills";
      }, 300);
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error", text: e.response?.data?.message || "Registration failed" });
    } finally {
      setLoading(false);
    }
  };

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
          <p className="text-sm text-gray-400 font-medium mt-1">
            {step === 1 && "Enter your mobile number"}
            {step === 2 && "Verify OTP"}
            {step === 3 && "Complete your profile"}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-[#800000]/10 border border-[#ffe4e4] p-7">
          {/* Step 1: Mobile Number */}
          {step === 1 && (
            <form onSubmit={sendOTP} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Mobile Number</label>
                <div className="flex items-center bg-[#fff5f5] border-2 border-[#ffe4e4] rounded-2xl px-4 py-3.5 gap-3">
                  <Phone size={18} className="text-[#800000] shrink-0" />
                  <input
                    type="tel"
                    placeholder="Enter 10-digit mobile"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    required
                    className="bg-transparent w-full text-sm text-gray-800 placeholder-gray-400 outline-none font-medium"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || mobile.length !== 10}
                className="w-full bg-gradient-to-r from-[#800000] to-[#6b0000] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#800000]/30 transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : "Send OTP"}
              </button>
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-semibold">OR</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <button
                type="button"
                onClick={() => googleLogin()}
                disabled={loading}
                className="w-full bg-white border-2 border-gray-200 text-gray-700 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-50 transition active:scale-[0.98] disabled:opacity-60"
              >
                <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                Continue with Google
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={verifyOTP} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Enter OTP</label>
                <input
                  type="text"
                  placeholder="Enter 4-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  required
                  maxLength={4}
                  className="w-full bg-[#fff5f5] border-2 border-[#ffe4e4] rounded-2xl px-4 py-3.5 text-center text-2xl font-bold tracking-widest text-gray-800 placeholder-gray-400 outline-none"
                />
                <div className="flex justify-between items-center text-xs px-1 mt-2">
                  <p className="text-gray-500">OTP sent to {mobile}</p>
                  {timer > 0 ? (
                    <p className="font-bold text-[#800000]">Resend in {timer}s</p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setStep(1); setOtp(""); }}
                      className="font-bold text-[#800000] hover:underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || otp.length !== 4}
                className="w-full bg-gradient-to-r from-[#800000] to-[#6b0000] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#800000]/30 transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? <><Loader2 size={18} className="animate-spin" /> Verifying...</> : "Verify OTP"}
              </button>
            </form>
          )}

          {/* Step 3: Name + Shop ID (New User) */}
          {step === 3 && (
            <form onSubmit={completeRegistration} className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
                <p className="text-sm font-bold text-green-700">✨ {name ? 'Register with New Shop!' : 'New Account Detected!'}</p>
                <p className="text-xs text-green-600 mt-1">{name ? 'You can register with multiple shops' : 'Please complete your profile'}</p>
              </div>
              {shopIdFromQR && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4">
                  <p className="text-sm font-bold text-blue-700">Shop Connected!</p>
                  <p className="text-xs text-blue-600 mt-1">Registering for <span className="font-bold">{shopName || shopIdFromQR}</span></p>
                </div>
              )}
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Your Name</label>
                <div className="flex items-center bg-[#fff5f5] border-2 border-[#ffe4e4] rounded-2xl px-4 py-3.5 gap-3">
                  <User size={18} className="text-[#800000] shrink-0" />
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-transparent w-full text-sm text-gray-800 placeholder-gray-400 outline-none font-medium"
                  />
                </div>
              </div>
              {!shopIdFromQR && (
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Shop ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="Enter shop ID if you have one"
                    value={shopId}
                    onChange={(e) => setShopId(e.target.value)}
                    className="w-full bg-[#fff5f5] border-2 border-[#ffe4e4] rounded-2xl px-4 py-3.5 text-sm text-gray-800 placeholder-gray-400 outline-none font-medium"
                  />
                </div>
              )}
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full bg-gradient-to-r from-[#800000] to-[#6b0000] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#800000]/30 transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? <><Loader2 size={18} className="animate-spin" /> Creating...</> : "🎁 Start Earning 🎁"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
