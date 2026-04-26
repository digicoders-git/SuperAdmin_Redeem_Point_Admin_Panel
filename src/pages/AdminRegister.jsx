import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Loader2, Mail, Lock, Eye, EyeOff, User, Store, Phone } from "lucide-react";
import Swal from "sweetalert2";

export default function AdminRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", shopName: "", mobile: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      Swal.fire({ icon: "error", title: "Mismatch", text: "Passwords do not match" });
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/admin/register", { 
        email: form.email, 
        password: form.password, 
        name: form.name,
        shopName: form.shopName,
        mobile: form.mobile
      });
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminInfo", JSON.stringify(data.admin));
      await Swal.fire({
        icon: "success", title: "Account Created!",
        html: `<div style="text-align:left;font-size:14px;line-height:2"><b>Shop ID:</b> ${data.admin.shopId}</div>`,
        confirmButtonColor: "#800000", confirmButtonText: "Go to Dashboard",
      });
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed", text: err.response?.data?.message || "Registration failed" });
    } finally { setLoading(false); }
  };

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
          <h1 className="text-2xl font-extrabold text-[#1a0000] tracking-tight">Create Account</h1>
          <p className="text-sm text-gray-400 font-medium mt-1">Register as a new admin</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-[#800000]/10 border border-[#ffe4e4] p-7">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Full Name</label>
              <div className="flex items-center bg-[#fff5f5] border-2 border-[#ffe4e4] rounded-2xl px-4 py-3.5 gap-3">
                <User size={18} className="text-[#800000] shrink-0" />
                <input type="text" placeholder="Enter your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className={inputCls} />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Business / Shop Name</label>
              <div className="flex items-center bg-[#fff5f5] border-2 border-[#ffe4e4] rounded-2xl px-4 py-3.5 gap-3">
                <Store size={18} className="text-[#800000] shrink-0" />
                <input type="text" placeholder="e.g. Reliance Fresh" value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} required className={inputCls} />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Mobile Number</label>
              <div className="flex items-center bg-[#fff5f5] border-2 border-[#ffe4e4] rounded-2xl px-4 py-3.5 gap-3">
                <Phone size={18} className="text-[#800000] shrink-0" />
                <input type="tel" placeholder="10 Digit Number" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} required className={inputCls} />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Email</label>
              <div className="flex items-center bg-[#fff5f5] border-2 border-[#ffe4e4] rounded-2xl px-4 py-3.5 gap-3">
                <Mail size={18} className="text-[#800000] shrink-0" />
                <input type="email" placeholder="Enter your email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className={inputCls} />
              </div>
            </div>
            {[
              { key: "password", label: "Password", placeholder: "Min 6 characters", show: showPwd, setShow: setShowPwd },
              { key: "confirmPassword", label: "Confirm Password", placeholder: "Re-enter password", show: showConfirm, setShow: setShowConfirm },
            ].map(({ key, label, placeholder, show, setShow }) => (
              <div key={key}>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">{label}</label>
                <div className="flex items-center bg-[#fff5f5] border-2 border-[#ffe4e4] rounded-2xl px-4 py-3.5 gap-3">
                  <Lock size={18} className="text-[#800000] shrink-0" />
                  <input type={show ? "text" : "password"} placeholder={placeholder} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required className={inputCls} />
                  <button type="button" onClick={() => setShow(!show)} className="text-gray-400 shrink-0">
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#800000] to-[#6b0000] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#800000]/30 transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Creating...</> : "Create Account"}
            </button>
            <p className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <button type="button" onClick={() => navigate("/admin/login")} className="text-[#800000] font-bold hover:underline">Sign In</button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
