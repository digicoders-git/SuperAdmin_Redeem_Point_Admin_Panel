import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import { Loader2, Phone, ShieldCheck } from "lucide-react";
import Swal from "sweetalert2";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shopIdFromQR = searchParams.get("shopId") || "";

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone"); // "phone" | "otp"
  const [loading, setLoading] = useState(false);
  const [shopName, setShopName] = useState("");
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (shopIdFromQR) {
      api.get(`/users/shop-info/${shopIdFromQR}`)
        .then(({ data }) => setShopName(data.shopName))
        .catch(() => {});
    }
  }, [shopIdFromQR]);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (phone.length !== 10) {
      Swal.fire({ icon: "error", title: "Invalid Number", text: "Enter a valid 10-digit mobile number" });
      return;
    }
    setLoading(true);
    try {
      await api.post("/users/send-otp", { phone });
      setStep("otp");
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
      const { data } = await api.post("/users/verify-otp", { phone, otp, shopId: shopIdFromQR });
      localStorage.setItem("userToken", data.token);
      localStorage.setItem("userInfo", JSON.stringify(data.user));
      Swal.fire({ icon: "success", title: `Welcome!`, timer: 800, showConfirmButton: false });
      setTimeout(() => {
        if (data.multipleShops) {
          window.location.href = "/user/shop-selection";
        } else {
          window.location.href = "/user/bills";
        }
      }, 300);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.response?.data?.message || "Invalid OTP" });
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
            <img src="/logo.jpeg" alt="Inaamify" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1a0000] tracking-tight">{shopName || "Inaamify"}</h1>
          <p className="text-sm text-gray-400 font-medium mt-1">
            {step === "phone" ? "Enter your mobile number to continue" : "Enter the OTP sent to your number"}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-[#800000]/10 border border-[#ffe4e4] p-7">
          {step === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Mobile Number</label>
                <div className={inputWrap}>
                  <Phone size={18} className="text-[#800000] shrink-0" />
                  <input
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    inputMode="numeric"
                    maxLength={10}
                    required
                    className={inputCls}
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#800000] to-[#6b0000] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#800000]/30 transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? <><Loader2 size={18} className="animate-spin" /> Sending OTP...</> : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">OTP</label>
                <div className={inputWrap}>
                  <ShieldCheck size={18} className="text-[#800000] shrink-0" />
                  <input
                    type="tel"
                    placeholder="Enter 4-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    inputMode="numeric"
                    maxLength={4}
                    required
                    className={inputCls}
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">OTP sent to <span className="font-bold text-gray-600">+91 {phone}</span></p>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#800000] to-[#6b0000] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#800000]/30 transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? <><Loader2 size={18} className="animate-spin" /> Verifying...</> : "Verify & Login"}
              </button>
              <div className="text-center">
                {timer > 0 ? (
                  <p className="text-xs text-gray-400">Resend OTP in <span className="font-bold text-[#800000]">{timer}s</span></p>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setStep("phone"); setOtp(""); }}
                    className="text-xs text-[#800000] font-bold hover:underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">New user? Account will be created automatically on first login.</p>
      </div>
    </div>
  );
}
