import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/axios";
import { Loader2, User, ShoppingBag, Phone } from "lucide-react";
import Swal from "sweetalert2";

export default function AdminProfileSetupModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    shopName: "",
    mobile: "",
  });

  useEffect(() => {
    const adminInfoStr = localStorage.getItem("adminInfo");
    if (adminInfoStr) {
      const adminInfo = JSON.parse(adminInfoStr);
      if (adminInfo.needsProfileSetup && localStorage.getItem("adminToken")) {
        setIsOpen(true);
        setFormData({
          name: adminInfo.name || "",
          shopName: adminInfo.shopName || "",
          mobile: adminInfo.mobile || "",
        });
      } else {
        setIsOpen(false);
      }
    } else {
      setIsOpen(false);
    }
  }, [location.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.shopName || !formData.mobile) {
      return Swal.fire({ icon: "warning", title: "All fields are required" });
    }

    setLoading(true);
    try {
      const { data } = await api.put("/admin/update-profile", {
        ...formData,
        needsProfileSetup: false,
      });

      localStorage.setItem("adminInfo", JSON.stringify(data.admin));
      setIsOpen(false);
      
      Swal.fire({
        icon: "success",
        title: "Profile Setup Complete!",
        text: "Your shop is ready to go.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Setup Failed",
        text: err.response?.data?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-5">
      <div className="w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-gradient-to-r from-[#800000] to-[#6b0000] p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
            <ShoppingBag size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">Complete Setup</h2>
          <p className="text-white/70 text-xs font-medium mt-1 uppercase tracking-widest">First Time Login</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block px-1">Your Name</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#800000] transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full bg-[#fff5f5] border-2 border-[#ffe4e4] focus:border-[#800000] rounded-2xl pl-12 pr-4 py-3.5 text-sm text-gray-800 outline-none transition-all font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block px-1">Shop Name</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#800000] transition-colors">
                  <ShoppingBag size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Enter your shop name"
                  value={formData.shopName}
                  onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                  required
                  className="w-full bg-[#fff5f5] border-2 border-[#ffe4e4] focus:border-[#800000] rounded-2xl pl-12 pr-4 py-3.5 text-sm text-gray-800 outline-none transition-all font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block px-1">Mobile Number</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#800000] transition-colors">
                  <Phone size={18} />
                </div>
                <input
                  type="tel"
                  placeholder="Enter mobile number"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  required
                  className="w-full bg-[#fff5f5] border-2 border-[#ffe4e4] focus:border-[#800000] rounded-2xl pl-12 pr-4 py-3.5 text-sm text-gray-800 outline-none transition-all font-semibold"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#800000] to-[#6b0000] text-white font-black py-4 rounded-2xl shadow-lg shadow-[#800000]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>SAVING DETAILS...</span>
              </>
            ) : (
              "COMPLETE SETUP"
            )}
          </button>
          
          <p className="text-[10px] text-center text-gray-400 font-bold px-4">
            These details will be used for your shop profile and visible to the administration.
          </p>
        </form>
      </div>
    </div>
  );
}
