import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Loader2, Mail, Lock, Eye, EyeOff, Phone, ShieldCheck } from "lucide-react";
import Swal from "sweetalert2";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState("email"); // email, phone, otp

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(0);

  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("adminToken")) navigate("/admin/dashboard", { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/admin/login", { email, password });
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminInfo", JSON.stringify(data.admin));
      Swal.fire({ icon: "success", title: "Welcome!", timer: 800, showConfirmButton: false });
      setTimeout(() => navigate("/admin/dashboard", { replace: true }), 300);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed", text: err.response?.data?.message || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (phone.length !== 10) {
      Swal.fire({ icon: "error", title: "Invalid Number", text: "Enter a valid 10-digit mobile number" });
      return;
    }
    setLoading(true);
    try {
      await api.post("/admin/send-otp", { phone });
      setLoginMethod("otp");
      setTimer(60);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.response?.data?.message || "Failed to send OTP" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 4) {
      Swal.fire({ icon: "error", title: "Invalid OTP", text: "Enter the 4-digit OTP" });
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/admin/verify-otp", { phone, otp });
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminInfo", JSON.stringify(data.admin));
      Swal.fire({ icon: "success", title: `Welcome!`, timer: 800, showConfirmButton: false });
      setTimeout(() => navigate("/admin/dashboard", { replace: true }), 300);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.response?.data?.message || "Invalid OTP" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff5f5] font-sans flex flex-col items-center justify-center px-5 py-10">
      <div className="fixed top-0 left-0 w-72 h-72 bg-[#800000]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-72 h-72 bg-[#800000]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-3xl shadow-lg overflow-hidden mb-4">
            <img src="/logo.jpeg" alt="Inaamify" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1a0000] tracking-tight">Inaamify Admin</h1>
          <p className="text-sm text-gray-400 font-medium mt-1 text-center">
            {loginMethod === "email" ? "Enter your email & password to continue" : loginMethod === "phone" ? "Enter your mobile number to continue" : "Enter the OTP sent to your number"}
          </p>
        </div>

        <div className="bg-white rounded-[32px] shadow-xl shadow-[#800000]/10 border border-[#ffe4e4] p-6">
          {loginMethod === "email" ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">Email / Admin ID</label>
                <div className="flex items-center bg-[#fff5f5] border-2 border-[#ffe4e4] rounded-2xl px-4 py-3 gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#800000] shadow-sm">
                    <Mail size={16} />
                  </div>
                  <input type="text" placeholder="Enter email or ID" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-transparent w-full text-sm text-gray-800 placeholder-gray-400 outline-none font-medium" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">Password</label>
                <div className="flex items-center bg-[#fff5f5] border-2 border-[#ffe4e4] rounded-2xl px-4 py-3 gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#800000] shadow-sm">
                    <Lock size={16} />
                  </div>
                  <input type={showPwd ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-transparent w-full text-sm text-gray-800 placeholder-gray-400 outline-none font-medium" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-gray-400 shrink-0">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#800000] to-[#6b0000] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#800000]/30 transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
                {loading ? <><Loader2 size={18} className="animate-spin" /> Please wait...</> : "Continue"}
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-semibold">OR</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <button type="button" onClick={() => setLoginMethod("phone")} disabled={loading} className="w-full bg-white border-2 border-gray-200 text-gray-700 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-50 transition active:scale-[0.98] disabled:opacity-60">
                <Phone size={18} className="text-[#800000]" />
                Login with OTP
              </button>
            </form>
          ) : loginMethod === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">Mobile Number</label>
                <div className="flex items-center bg-[#fff5f5] border-2 border-[#ffe4e4] rounded-2xl px-4 py-3 gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#800000] shadow-sm">
                    <Phone size={16} />
                  </div>
                  <input
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    inputMode="numeric"
                    maxLength={10}
                    required
                    className="bg-transparent w-full text-sm text-gray-800 placeholder-gray-400 outline-none font-medium"
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#800000] to-[#6b0000] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#800000]/30 transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
                {loading ? <><Loader2 size={18} className="animate-spin" /> Sending OTP...</> : "Send OTP"}
              </button>
              
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-semibold">OR</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <button type="button" onClick={() => setLoginMethod("email")} disabled={loading} className="w-full bg-white border-2 border-gray-200 text-gray-700 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-50 transition active:scale-[0.98] disabled:opacity-60">
                <Mail size={18} className="text-[#800000]" />
                Login with Password
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">OTP</label>
                <div className="flex items-center bg-[#fff5f5] border-2 border-[#ffe4e4] rounded-2xl px-4 py-3 gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#800000] shadow-sm">
                    <ShieldCheck size={16} />
                  </div>
                  <input
                    type="tel"
                    placeholder="Enter 4-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    inputMode="numeric"
                    maxLength={4}
                    required
                    className="bg-transparent w-full text-sm text-gray-800 placeholder-gray-400 outline-none font-medium"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2 ml-1">OTP sent to <span className="font-bold text-gray-600">+91 {phone}</span></p>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#800000] to-[#6b0000] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#800000]/30 transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
                {loading ? <><Loader2 size={18} className="animate-spin" /> Verifying...</> : "Verify & Login"}
              </button>
              <div className="text-center">
                {timer > 0 ? (
                  <p className="text-xs text-gray-400">Resend OTP in <span className="font-bold text-[#800000]">{timer}s</span></p>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setLoginMethod("phone"); setOtp(""); }}
                    className="text-xs text-[#800000] font-bold hover:underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">New here? Just login — account will be created automatically.</p>
      </div>
    </div>
  );
}
