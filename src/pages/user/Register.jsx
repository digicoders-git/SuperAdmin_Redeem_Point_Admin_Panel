import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import { Gift, User, Phone, Lock, Eye, EyeOff, Store, Loader2 } from "lucide-react";
import Swal from "sweetalert2";

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ name: "", mobile: "", password: "", shopId: searchParams.get("shopId") || "" });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const shopIdFromQR = !!searchParams.get("shopId");

  const submit = async (e) => {
    e.preventDefault();
    if (form.mobile.length !== 10) { Swal.fire({ icon: "error", title: "Invalid Mobile", text: "Mobile number must be exactly 10 digits" }); return; }
    setLoading(true);
    try {
      await api.post("/users/register", form);
      await Swal.fire({ icon: "success", title: "Registration Successful!", timer: 1500, showConfirmButton: false });
      navigate("/user/login", { replace: true });
    } catch (e) {
      Swal.fire({ icon: "error", title: "Registration Failed", text: e.response?.data?.message || "Registration failed" });
    } finally { setLoading(false); }
  };

  const inputCls = "flex items-center bg-[#fff5f5] border-2 border-[#ffe4e4] rounded-2xl px-4 py-3.5 gap-3";

  return (
    <div className="min-h-screen bg-[#fff5f5] font-sans flex flex-col items-center justify-center px-5">
      <div className="fixed top-0 left-0 w-72 h-72 bg-[#800000]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-72 h-72 bg-[#800000]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#800000] to-[#6b0000] rounded-3xl shadow-lg shadow-[#800000]/30 flex items-center justify-center mb-4">
            <Gift size={36} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1a0000] tracking-tight">Create Account</h1>
          <p className="text-sm text-gray-400 font-medium mt-1">Shop. Earn Points. Get Rewards.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-[#800000]/10 border border-[#ffe4e4] p-7">
          {shopIdFromQR && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4 mb-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                <Store size={20} className="text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">Shop Connected!</p>
                <p className="text-xs text-gray-600 mt-0.5">Registering for <span className="font-bold text-green-600">{form.shopId}</span></p>
              </div>
            </div>
          )}
          
          <form onSubmit={submit} className="space-y-3">
            <div className={inputCls}>
              <User size={18} className="text-[#800000] shrink-0" />
              <input placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="bg-transparent w-full text-sm text-gray-800 placeholder-gray-400 outline-none font-medium" />
            </div>
            <div className={inputCls}>
              <Phone size={18} className="text-[#800000] shrink-0" />
              <input placeholder="Mobile Number" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })} inputMode="numeric" maxLength={10} required className="bg-transparent w-full text-sm text-gray-800 placeholder-gray-400 outline-none font-medium" />
            </div>
            {!shopIdFromQR && (
              <div className={inputCls}>
                <Store size={18} className="text-[#800000] shrink-0" />
                <input placeholder="Shop ID (Optional)" value={form.shopId} onChange={(e) => setForm({ ...form, shopId: e.target.value })} className="bg-transparent w-full text-sm text-gray-800 placeholder-gray-400 outline-none font-medium" />
              </div>
            )}
            <div className={inputCls}>
              <Lock size={18} className="text-[#800000] shrink-0" />
              <input type={showPwd ? "text" : "password"} placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className="bg-transparent w-full text-sm text-gray-800 placeholder-gray-400 outline-none font-medium" />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-gray-400 shrink-0">{showPwd ? <EyeOff size={17} /> : <Eye size={17} />}</button>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#800000] to-[#6b0000] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#800000]/30 transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Registering...</> : "🎁 Start Earning 🎁"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-5">
            Already have account?{" "}
            <span onClick={() => navigate("/user/login")} className="text-[#800000] font-bold cursor-pointer hover:underline">Login</span>
          </p>
        </div>
      </div>
    </div>
  );
}
