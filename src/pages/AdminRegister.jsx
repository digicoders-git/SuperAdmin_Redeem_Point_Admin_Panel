import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { UserPlus, Loader2, Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";

export default function AdminRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", adminId: "", password: "", confirmPassword: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (form.password !== form.confirmPassword) { setErr("Passwords do not match"); return; }
    if (form.password.length < 6) { setErr("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const { data } = await api.post("/admin/create", { adminId: form.adminId, password: form.password, name: form.name });
      await Swal.fire({
        icon: "success", title: "Account Created!",
        html: `<div style="text-align:left;font-size:14px;line-height:2"><b>Admin ID:</b> ${data.admin.adminId}<br/><b>Shop ID:</b> ${data.admin.shopId}<br/><b>Referral Code:</b> ${data.admin.referralCode}</div>`,
        confirmButtonColor: "#800000", confirmButtonText: "Go to Login",
      });
      navigate("/", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      setErr(msg);
    } finally { setLoading(false); }
  };

  const inputCls = "w-full bg-[#fff5f5] border-2 border-[#ffe4e4] rounded-2xl px-4 py-3.5 text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#800000]/50 transition-colors";

  return (
    <div className="min-h-screen bg-[#f8f7ff] font-sans flex flex-col items-center justify-center px-5">
      <div className="fixed top-0 left-0 w-72 h-72 bg-[#800000]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-72 h-72 bg-[#800000]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#800000] to-[#6b0000] rounded-3xl shadow-lg shadow-[#800000]/30 flex items-center justify-center mb-4">
            <UserPlus size={34} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1a0000] tracking-tight">Create Account</h1>
          <p className="text-sm text-gray-400 font-medium mt-1">Register as a new admin</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-[#800000]/10 border border-[#ffe4e4] p-7">
          {err && <div className="bg-red-50 text-red-600 text-sm font-semibold rounded-2xl px-4 py-3 mb-4 border border-red-100">{err}</div>}

          <form onSubmit={submit} className="space-y-4">
            {[
              { key: "name", label: "Full Name", placeholder: "Enter your name", required: false },
              { key: "adminId", label: "Admin ID", placeholder: "Choose an admin ID", required: true },
            ].map(({ key, label, placeholder, required }) => (
              <div key={key}>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">{label}</label>
                <input placeholder={placeholder} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required={required} className={inputCls} />
              </div>
            ))}
            {[
              { key: "password", label: "Password", placeholder: "Min 6 characters", show: showPwd, setShow: setShowPwd },
              { key: "confirmPassword", label: "Confirm Password", placeholder: "Re-enter password", show: showConfirm, setShow: setShowConfirm },
            ].map(({ key, label, placeholder, show, setShow }) => (
              <div key={key}>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">{label}</label>
                <div className="relative">
                  <input type={show ? "text" : "password"} placeholder={placeholder} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required className={inputCls + " pr-12"} />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{show ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#800000] to-[#6b0000] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#800000]/30 transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Creating...</> : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-5">
            Already have an account?{" "}
            <button onClick={() => navigate("/")} className="text-[#800000] font-bold hover:underline">Sign In</button>
          </p>
        </div>
      </div>
    </div>
  );
}
