import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Swal from "sweetalert2";
import { 
  Store, 
  Phone, 
  Settings, 
  ChevronLeft, 
  Loader2, 
  Save, 
  ShieldCheck,
  Zap,
  HelpCircle,
  Camera,
  FileText,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function AdminConfiguration() {
  const navigate = useNavigate();
  const adminInfo = JSON.parse(localStorage.getItem("adminInfo") || "{}");
  const serverBase = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "").replace(/\/$/, "") || "";
  const getPhotoUrl = (path) => {
    if (!path) return null;
    const normalized = path.replace(/\\/g, "/").replace(/^\/+/, "/");
    if (normalized.startsWith("http")) return normalized;
    return serverBase + (normalized.startsWith("/") ? normalized : "/" + normalized);
  };
  
  const [profileForm, setProfileForm] = useState({
    name: adminInfo.name || "",
    mobile: adminInfo.mobile || localStorage.getItem("adminMobile") || "",
    shopName: adminInfo.shopName || ""
  });
  
  const [pointConfig, setPointConfig] = useState({
    amountPerPoint: ""
  });
  
  const [tierConfig, setTierConfig] = useState({
    bronze: 0,
    silver: 500,
    gold: 2000,
    platinum: 5000
  });
  
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPoints, setSavingPoints] = useState(false);
  const [savingTiers, setSavingTiers] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [shopTerms, setShopTerms] = useState([]);
  const [savingTerms, setSavingTerms] = useState(false);
  const [openSection, setOpenSection] = useState(null);
  const toggleSection = (s) => setOpenSection(prev => prev === s ? null : s);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pointRes, tierRes] = await Promise.all([
          api.get("/bills/admin/point-config"),
          api.get("/bills/admin/tier-config")
        ]);
        if (pointRes.data.pointSetting) {
          setPointConfig({ amountPerPoint: pointRes.data.pointSetting.amountPerPoint });
        }
        if (tierRes.data.tiers) {
          setTierConfig(tierRes.data.tiers);
        }
        const termsRes = await api.get("/admin/terms");
        setShopTerms(termsRes.data.terms || []);
      } catch (error) {
        console.error("Error fetching config:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

  }, []);


  
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({ icon: "error", title: "File too large", text: "Image must be under 5MB" });
      return;
    }
    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append("profilePhoto", file);
    try {
      const { data } = await api.post("/admin/profile/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updatedAdmin = { ...adminInfo, profilePhoto: data.admin.profilePhoto };
      localStorage.setItem("adminInfo", JSON.stringify(updatedAdmin));
      Swal.fire({ icon: "success", title: "Photo Updated!", timer: 1500, showConfirmButton: false });
      window.location.reload();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Upload Failed", text: err.response?.data?.message || "Could not upload photo" });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await api.put("/admin/profile", profileForm);
      localStorage.setItem("adminInfo", JSON.stringify(data.admin));
      localStorage.setItem("adminMobile", data.admin.mobile);
      Swal.fire({ icon: "success", title: "Profile Updated!", timer: 1500, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ icon: "error", title: "Update Failed", text: error.response?.data?.message || "Could not update profile" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePointsSubmit = async (e) => {
    e.preventDefault();
    setSavingPoints(true);
    try {
      await api.post("/bills/admin/point-config", { 
        amountPerPoint: Number(pointConfig.amountPerPoint) 
      });
      Swal.fire({ icon: "success", title: "Points Configured!", timer: 1500, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ icon: "error", title: "Update Failed", text: error.response?.data?.message || "Could not update points" });
    } finally {
      setSavingPoints(false);
    }
  };

  const handleTiersSubmit = async (e) => {
    e.preventDefault();
    setSavingTiers(true);
    try {
      await api.post("/bills/admin/tier-config", {
        bronzeThreshold: Number(tierConfig.bronze),
        silverThreshold: Number(tierConfig.silver),
        goldThreshold: Number(tierConfig.gold),
        platinumThreshold: Number(tierConfig.platinum)
      });
      Swal.fire({ icon: "success", title: "Tiers Configured!", timer: 1500, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ icon: "error", title: "Update Failed", text: error.response?.data?.message || "Could not update tiers" });
    } finally {
      setSavingTiers(false);
    }
  };

  const handleTermsSave = async () => {
    const filtered = shopTerms.filter(t => t.trim() !== "");
    setSavingTerms(true);
    try {
      await api.put("/admin/terms", { terms: filtered });
      setShopTerms(filtered);
      Swal.fire({ icon: "success", title: "Terms Saved!", timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed", text: err.response?.data?.message || "Could not save terms" });
    } finally {
      setSavingTerms(false);
    }
  };

  const inputCls = "w-full border-2 border-gray-100 bg-white rounded-2xl px-5 py-4 text-[15px] font-bold text-gray-800 focus:outline-none focus:border-[#800000]/50 focus:ring-4 focus:ring-[#800000]/5 transition-all outline-none mb-4";
  const labelCls = "text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-2 block";
  const btnCls = "w-full bg-[#800000] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-[0.15em] flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-lg shadow-[#800000]/20 disabled:opacity-50 mt-2";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#800000]" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans pb-24">
      <div className="bg-white px-6 pt-14 pb-6 flex items-center gap-4 sticky top-0 z-30 border-b border-gray-100 backdrop-blur-md bg-white/80">
        <button 
          onClick={() => navigate("/admin/profile")}
          className="p-2 bg-gray-50 rounded-xl text-gray-600 active:scale-95 transition-all hover:bg-gray-100 z-50"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-black text-gray-800 tracking-tight">Shop Configuration</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">Settings & Calibration</p>
        </div>
      </div>

      <div className="px-6 pt-6 space-y-3">

        {/* Section Helper */}
        {[  
          {
            key: "profile",
            icon: <Store size={18} />,
            iconBg: "bg-blue-50 text-blue-600",
            label: "Shop Profile",
            content: (
              <form onSubmit={handleProfileSubmit} className="p-5 space-y-1">
                <div className="mb-5 flex justify-center">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#800000] to-[#6b0000] flex items-center justify-center text-white text-2xl font-black shadow-lg overflow-hidden">
                      {adminInfo.profilePhoto ? (
                        <img src={getPhotoUrl(adminInfo.profilePhoto)} alt="Admin" className="w-full h-full object-cover" />
                      ) : (
                        (adminInfo.name || "A")[0].toUpperCase()
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-[#f97316] p-1.5 rounded-full text-white cursor-pointer shadow-md border-2 border-white">
                      {uploadingPhoto ? <Loader2 className="animate-spin" size={14} /> : <Camera size={14} />}
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
                    </label>
                  </div>
                </div>
                <label className={labelCls}>Shop Display Name</label>
                <input type="text" value={profileForm.shopName} onChange={(e) => setProfileForm({ ...profileForm, shopName: e.target.value })} className={inputCls} placeholder="e.g. Mohit Electronics" required />
                <label className={labelCls}>Owner Name</label>
                <div className="relative">
                  <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className={inputCls} placeholder="Enter Owner Name" required />
                  <Store size={18} className="absolute right-5 top-4 text-gray-300" />
                </div>
                <label className={labelCls}>Admin Mobile Number</label>
                <div className="relative">
                  <input type="tel" value={profileForm.mobile} onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })} className={inputCls} placeholder="10 Digit Number" required />
                  <Phone size={18} className="absolute right-5 top-4 text-gray-300" />
                </div>
                <button type="submit" disabled={savingProfile} className={btnCls}>
                  {savingProfile ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> Update Profile</>}
                </button>
              </form>
            )
          },
          {
            key: "points",
            icon: <Zap size={18} />,
            iconBg: "bg-amber-50 text-amber-600",
            label: "Points Per Rupee",
            content: (
              <div className="p-5">
                <div className="bg-[#800000] text-white p-5 rounded-2xl mb-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                  <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">Current Ratio</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black">₹{pointConfig.amountPerPoint || "0"}</span>
                    <span className="text-white/60 font-bold">= 1 Point</span>
                  </div>
                  <div className="mt-4 flex items-center gap-2 bg-white/10 p-3 rounded-xl border border-white/10">
                    <HelpCircle size={14} className="text-white/60 shrink-0" />
                    <p className="text-[11px] font-bold text-white/70">Customers earn 1 point for every ₹{pointConfig.amountPerPoint || "N/A"} spent.</p>
                  </div>
                </div>
                <form onSubmit={handlePointsSubmit}>
                  <label className={labelCls}>New Amount per Point</label>
                  <div className="relative">
                    <input type="number" value={pointConfig.amountPerPoint} onChange={(e) => setPointConfig({ amountPerPoint: e.target.value })} className={inputCls} placeholder="e.g. 100" required />
                    <span className="absolute right-5 top-4 font-black text-gray-400">₹</span>
                  </div>
                  <button type="submit" disabled={savingPoints} className={btnCls}>
                    {savingPoints ? <Loader2 className="animate-spin" size={20} /> : <><Settings size={18} /> Save Points Rule</>}
                  </button>
                </form>
              </div>
            )
          },
          {
            key: "tiers",
            icon: <Zap size={18} />,
            iconBg: "bg-purple-50 text-purple-600",
            label: "Member Tiers",
            content: (
              <div className="p-5">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[["🥉 Bronze", tierConfig.bronze],["🥈 Silver", tierConfig.silver],["🥇 Gold", tierConfig.gold],["💎 Platinum", tierConfig.platinum]].map(([label, val]) => (
                    <div key={label} className="bg-purple-50 p-3 rounded-xl">
                      <p className="text-[10px] text-gray-500 font-bold">{label}</p>
                      <p className="text-base font-black text-gray-800">{val}+ pts</p>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleTiersSubmit} className="space-y-1">
                  {[["🥉 Bronze", "bronze","0"],["🥈 Silver","silver","500"],["🥇 Gold","gold","2000"],["💎 Platinum","platinum","5000"]].map(([label, key, ph]) => (
                    <div key={key}>
                      <label className={labelCls}>{label} Threshold</label>
                      <input type="number" value={tierConfig[key]} onChange={(e) => setTierConfig({ ...tierConfig, [key]: e.target.value })} className={inputCls} placeholder={`e.g. ${ph}`} required />
                    </div>
                  ))}
                  <button type="submit" disabled={savingTiers} className={btnCls}>
                    {savingTiers ? <Loader2 className="animate-spin" size={20} /> : <><Settings size={18} /> Save Tier Settings</>}
                  </button>
                </form>
              </div>
            )
          },
          {
            key: "terms",
            icon: <FileText size={18} />,
            iconBg: "bg-green-50 text-green-600",
            label: "Shop Terms & Conditions",
            content: (
              <div className="p-5 space-y-3">
                {shopTerms.map((t, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#ffe4e4] text-[#800000] text-[11px] font-bold flex items-center justify-center shrink-0 mt-2">{i + 1}</span>
                    <textarea value={t} onChange={(e) => { const u = [...shopTerms]; u[i] = e.target.value; setShopTerms(u); }} placeholder="Enter term..." className="flex-1 border-2 border-gray-100 bg-[#fff5f5] rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#800000]/40 resize-none" rows={2} />
                    <button onClick={() => setShopTerms(shopTerms.filter((_, idx) => idx !== i))} className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center shrink-0 mt-2"><Trash2 size={14} /></button>
                  </div>
                ))}
                <button onClick={() => setShopTerms([...shopTerms, ""])} className="w-full border-2 border-dashed border-gray-200 text-gray-400 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:border-[#800000]/30 hover:text-[#800000] transition">
                  <Plus size={16} /> Add Term
                </button>
                <button onClick={handleTermsSave} disabled={savingTerms} className={btnCls}>
                  {savingTerms ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> Save Terms</>}
                </button>
              </div>
            )
          }
        ].map(({ key, icon, iconBg, label, content }) => (
          <div key={key} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <button onClick={() => toggleSection(key)} className="w-full flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>{icon}</div>
                <span className="font-bold text-gray-800 text-[15px]">{label}</span>
              </div>
              {openSection === key ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </button>
            {openSection === key && <div className="border-t border-gray-100">{content}</div>}
          </div>
        ))}

        {/* System Info */}
        <div className="bg-gray-100/50 p-5 rounded-2xl border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
            <ShieldCheck className="text-gray-400" size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Authenticated</p>
            <p className="text-xs font-bold text-gray-600 mt-0.5">Encrypted Configuration Panel</p>
          </div>
        </div>
        <p className="text-center text-gray-300 text-[10px] font-bold pb-8 uppercase tracking-[0.3em]">REDEEM CORE SECURITY</p>
      </div>
    </div>
  );
}
