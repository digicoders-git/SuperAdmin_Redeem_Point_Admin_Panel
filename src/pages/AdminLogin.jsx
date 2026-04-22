import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { ShieldCheck, Loader2, Phone, User } from "lucide-react";
import Swal from "sweetalert2";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: mobile, 2: otp, 3: name (if new user)
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isNewUser, setIsNewUser] = useState(false);

  const sendOTP = async (e) => {
    e?.preventDefault();
    if (mobile.length !== 10) {
      Swal.fire({ icon: "error", title: "Invalid Mobile", text: "Enter valid 10-digit mobile number" });
      return;
    }
    setLoading(true);
    try {
      await api.post("/admin/send-otp", { mobile });
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
      Swal.fire({ icon: "success", title: "OTP Sent", text: "Check your phone for OTP", timer: 2000, showConfirmButton: false });
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
      const { data } = await api.post("/admin/verify-otp", { mobile, otp });
      
      if (data.isNewUser) {
        // New user - ask for name
        setIsNewUser(true);
        setStep(3);
      } else {
        // Existing user - login
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminInfo", JSON.stringify(data.admin));
        localStorage.setItem("adminMobile", mobile);
        
        Swal.fire({ icon: "success", title: "Welcome Back!", timer: 800, showConfirmButton: false });
        
        // Redirect after short delay
        setTimeout(() => {
          window.location.href = "/admin/dashboard";
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
      const { data } = await api.post("/admin/complete-registration", { mobile, name });
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminInfo", JSON.stringify(data.admin));
      localStorage.setItem("adminMobile", mobile);
      
      Swal.fire({ icon: "success", title: "Welcome!", text: "Account created successfully", timer: 800, showConfirmButton: false });
      
      // Redirect after short delay
      setTimeout(() => {
        window.location.href = "/admin/dashboard";
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
          <div className="w-20 h-20 bg-gradient-to-br from-[#800000] to-[#6b0000] rounded-3xl shadow-lg shadow-[#800000]/30 flex items-center justify-center mb-4">
            <ShieldCheck size={36} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1a0000] tracking-tight">Redeem Admin</h1>
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
                      onClick={() => { setOtp(""); sendOTP(); }}
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

          {/* Step 3: Name Input (New User) */}
          {step === 3 && (
            <form onSubmit={completeRegistration} className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
                <p className="text-sm font-bold text-green-700">✨ New Account Detected!</p>
                <p className="text-xs text-green-600 mt-1">Please enter your name to complete registration</p>
              </div>
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
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full bg-gradient-to-r from-[#800000] to-[#6b0000] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#800000]/30 transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? <><Loader2 size={18} className="animate-spin" /> Creating...</> : "Complete Registration"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
