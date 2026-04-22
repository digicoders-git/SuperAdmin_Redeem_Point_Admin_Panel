import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Coins, LogOut, Loader2, User, Camera, ChevronDown, ChevronUp, Shield, Download, Share, Share2, Phone } from "lucide-react";
import Swal from "sweetalert2";

const getTier = (points, tiers = null) => {
  const tierThresholds = tiers || {
    bronze: 0,
    silver: 500,
    gold: 2000,
    platinum: 5000
  };
  
  if (points >= tierThresholds.platinum) return { label: "Platinum", color: "bg-cyan-50 text-cyan-600 border-cyan-200", emoji: "💎" };
  if (points >= tierThresholds.gold) return { label: "Gold", color: "bg-yellow-50 text-yellow-600 border-yellow-200", emoji: "🥇" };
  if (points >= tierThresholds.silver) return { label: "Silver", color: "bg-gray-100 text-gray-600 border-gray-300", emoji: "🥈" };
  if (points > 0) return { label: "Bronze", color: "bg-orange-50 text-orange-500 border-orange-200", emoji: "🥉" };
  return null;
};

const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [tierConfig, setTierConfig] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [terms, setTerms] = useState([]);
  const [installPrompt, setInstallPrompt] = useState(() => window.__installPrompt || null);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [supportPhone, setSupportPhone] = useState("");

  useEffect(() => {
    api.get("/users/profile").then(({ data }) => {
      setProfile(data.user);
      setForm({ name: data.user.name, mobile: data.user.mobile, profilePhoto: data.user.profilePhoto || "" });
      
      // Fetch admin data based on user's shopId
      if (data.user.shopId) {
        api.get(`/admin/terms/${data.user.shopId}`)
          .then(({ data: termsData }) => setTerms(termsData.terms || []))
          .catch(() => setTerms([]));
        
        api.get(`/admin/shop/${data.user.shopId}`)
          .then(({ data: adminDataRes }) => setAdminData(adminDataRes.admin))
          .catch(() => setAdminData(null));
        
        api.get(`/bills/tier-config/${data.user.shopId}`)
          .then(({ data: tierRes }) => setTierConfig(tierRes.tiers || { bronze: 0, silver: 500, gold: 2000, platinum: 5000 }))
          .catch(() => setTierConfig({ bronze: 0, silver: 500, gold: 2000, platinum: 5000 }));
      }
      api.get("/subscriptions/settings/public")
        .then(({ data: s }) => setSupportPhone(s.settings?.supportPhone || ""))
        .catch(() => {});
    });
    // Listen for prompt in case it fires after mount
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); window.__installPrompt = e; };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstallPrompt(null));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleAndroidInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") { setInstallPrompt(null); window.__installPrompt = null; }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({ icon: "error", title: "File too large", text: "Image must be under 5MB" });
      return;
    }
    const formData = new FormData();
    formData.append("profilePhoto", file);
    try {
      const { data } = await api.post("/users/profile/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile(data.user);
      setForm((f) => ({ ...f, profilePhoto: data.user.profilePhoto }));
      Swal.fire({ icon: "success", title: "Photo Updated!", timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Upload Failed", text: err.response?.data?.message || "Could not upload photo" });
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/users/profile", form);
      setProfile(data.user);
      setEdit(false);
      Swal.fire({ icon: "success", title: "Profile Updated!", timer: 1500, showConfirmButton: false });
    } catch (e) {
      Swal.fire({ icon: "error", title: "Update Failed", text: e.response?.data?.message || "Update failed" });
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e63946",
      cancelButtonColor: "#d1d5db",
      confirmButtonText: "Yes, Logout",
    });
    if (!result.isConfirmed) return;
    await api.post("/users/logout").catch(() => {});
    localStorage.clear();
    await Swal.fire({ icon: "success", title: "Logged Out!", text: "You have been logged out successfully.", timer: 1500, showConfirmButton: false });
    navigate("/user/login", { replace: true });
  };

  const shareApp = async () => {
    const shareData = {
      title: profile?.shopName || "Redeem App",
      text: `Join ${profile?.shopName || "Redeem App"} to earn rewards and track your purchases!`,
      url: window.location.origin + "/user/login" + (profile?.shopId ? `?shopId=${profile.shopId}` : ""),
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(shareData.url);
        Swal.fire({
          icon: "success",
          title: "Link Copied!",
          text: "App link copied to clipboard",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Could not share app",
        });
      }
    }
  };

  if (!profile)
    return (
      <div className="min-h-screen bg-[#F5F7FA] font-sans pb-24 animate-in fade-in duration-500">
        <div className="bg-[#800000] rounded-b-[40px] px-6 pt-12 pb-24 relative overflow-hidden">
          <div className="flex justify-between items-center relative z-10">
            <div className="h-6 w-24 bg-white/20 rounded-lg animate-pulse" />
            <div className="w-10 h-10 bg-white/10 rounded-xl animate-pulse" />
          </div>
        </div>
        <div className="px-5 -mt-16 relative z-20 animate-pulse">
          <div className="bg-white rounded-[32px] p-6 flex flex-col items-center shadow-sm border border-gray-100 mb-6">
            <div className="w-24 h-24 rounded-full bg-gray-100 transform -translate-y-12 mb-0" />
            <div className="text-center -mt-8 w-full space-y-3">
              <div className="h-7 w-40 bg-gray-100 rounded-lg mx-auto" />
              <div className="h-4 w-56 bg-gray-50 rounded-lg mx-auto" />
              <div className="h-6 w-32 bg-gray-50 rounded-full mx-auto" />
              <div className="h-12 w-48 bg-gray-50 rounded-2xl mx-auto mt-4" />
            </div>
          </div>
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 mb-6 p-6 space-y-6">
            <div className="flex justify-between"><div className="h-4 w-16 bg-gray-100 rounded" /><div className="h-4 w-32 bg-gray-100 rounded" /></div>
            <div className="h-px bg-gray-50" />
            <div className="flex justify-between"><div className="h-4 w-24 bg-gray-100 rounded" /><div className="h-4 w-16 bg-gray-100 rounded" /></div>
          </div>
          <div className="h-14 w-full bg-white rounded-[24px] border border-gray-100 mb-4" />
          <div className="h-14 w-full bg-red-100/50 rounded-[20px]" />
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans pb-24">
      {/* Top Header Background */}
      <div className="bg-[#800000] rounded-b-[40px] px-6 pt-12 pb-24 relative overflow-hidden">
        {/* Abstract Background Waves */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3">
            {adminData?.profilePhoto && (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#800000] to-[#6b0000] overflow-hidden shadow-md border-2 border-white">
                <img src={adminData.profilePhoto} alt="Admin" className="w-full h-full object-cover" />
              </div>
            )}
            <h1 className="text-white font-bold text-xl tracking-wide">{profile?.shopName || "My Profile"}</h1>
          </div>
          <div className="w-10 h-10 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <User className="text-white" size={20} />
          </div>
        </div>
      </div>

      <div className="px-5 -mt-16 relative z-20">
        <div className="bg-white rounded-[32px] p-6 flex flex-col items-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 mb-6">
          <div className="relative transform -translate-y-12 mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#800000] to-[#6b0000] flex items-center justify-center text-white text-4xl font-extrabold shadow-lg shadow-[#800000]/20 border-4 border-white overflow-hidden">
              {(edit ? form.profilePhoto : profile.profilePhoto) ? (
                <img
                  src={edit ? form.profilePhoto : profile.profilePhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                profile.name?.[0]?.toUpperCase()
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-[#f97316] p-2 rounded-full text-white cursor-pointer shadow-md border-2 border-white hover:bg-[#eb6a10] transition-colors">
                <Camera size={16} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
          </div>
          
          <div className="text-center -mt-8 w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{profile.name}</h2>
            <p className="text-gray-500 font-medium text-[15px] mb-3">{profile.email}</p>

            {/* Tier badge — separate line */}
            {(() => { const tier = getTier(profile.walletPoints || 0, tierConfig); return tier ? (
              <div className="flex justify-center mb-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${tier.color}`}>
                  {tier.emoji} {tier.label} Member
                </span>
              </div>
            ) : null; })()}

            {/* Points — separate line */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 bg-[#fff5f5] text-[#800000] font-bold px-6 py-2.5 rounded-2xl border border-[#ffe4e4] shadow-inner">
                <Coins size={20} className="text-[#f97316]" />
                <span className="text-lg">{profile.walletPoints || 0}</span>
                <span className="text-gray-500 text-sm font-semibold">Points</span>
              </div>
            </div>
          </div>
        </div>

        {/* Points Breakdown Section */}
        <div className="bg-gradient-to-br from-[#800000]/5 to-orange-50 rounded-[24px] p-6 shadow-sm border border-[#800000]/10 mb-6">
          <h3 className="text-lg font-black text-gray-800 mb-4">Your Tier Progress</h3>
          
          {tierConfig && (
            <>
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-gray-600">Progress to Next Tier</span>
                  <span className="text-xs font-black text-[#800000]">{profile.walletPoints || 0} pts</span>
                </div>
                
                {/* Tier Progress Visualization */}
                <div className="space-y-3">
                  {/* Bronze */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-gray-600">🥉 Bronze</span>
                      <span className="text-xs font-bold text-gray-500">{tierConfig.bronze}+ pts</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all" 
                        style={{ width: `${Math.min((profile.walletPoints / tierConfig.silver) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Silver */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-gray-600">🥈 Silver</span>
                      <span className="text-xs font-bold text-gray-500">{tierConfig.silver}+ pts</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gray-400 h-2 rounded-full transition-all" 
                        style={{ width: `${Math.min(((profile.walletPoints - tierConfig.silver) / (tierConfig.gold - tierConfig.silver)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Gold */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-gray-600">🥇 Gold</span>
                      <span className="text-xs font-bold text-gray-500">{tierConfig.gold}+ pts</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full transition-all" 
                        style={{ width: `${Math.min(((profile.walletPoints - tierConfig.gold) / (tierConfig.platinum - tierConfig.gold)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Platinum */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-gray-600">💎 Platinum</span>
                      <span className="text-xs font-bold text-gray-500">{tierConfig.platinum}+ pts</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-cyan-400 h-2 rounded-full transition-all" 
                        style={{ width: `${Math.min(((profile.walletPoints - tierConfig.platinum) / tierConfig.platinum) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Next Tier Info */}
              {(() => {
                const currentTier = getTier(profile.walletPoints || 0, tierConfig);
                let nextTierPoints = 0;
                let nextTierLabel = "";
                
                if (profile.walletPoints < tierConfig.silver) {
                  nextTierPoints = tierConfig.silver - profile.walletPoints;
                  nextTierLabel = "Silver";
                } else if (profile.walletPoints < tierConfig.gold) {
                  nextTierPoints = tierConfig.gold - profile.walletPoints;
                  nextTierLabel = "Gold";
                } else if (profile.walletPoints < tierConfig.platinum) {
                  nextTierPoints = tierConfig.platinum - profile.walletPoints;
                  nextTierLabel = "Platinum";
                } else {
                  nextTierLabel = "Max Tier Reached!";
                }
                
                return (
                  <div className="bg-white rounded-2xl p-4 border border-[#800000]/10">
                    <p className="text-xs text-gray-500 font-bold mb-1">NEXT MILESTONE</p>
                    {nextTierPoints > 0 ? (
                      <p className="text-sm font-black text-[#800000]">
                        {nextTierPoints} more points to reach <span className="text-lg">{nextTierLabel}</span>
                      </p>
                    ) : (
                      <p className="text-sm font-black text-green-600">🎉 {nextTierLabel}</p>
                    )}
                  </div>
                );
              })()}
            </>
          )}
        </div>

        {edit ? (
          <form onSubmit={save} className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 mb-6 space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block ml-1">Full Name</label>
              <input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border-2 border-gray-100 bg-[#fff5f5] rounded-2xl px-5 py-3.5 text-[15px] font-semibold text-gray-800 focus:outline-none focus:border-[#800000]/30 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block ml-1">Phone Number</label>
              <input
                placeholder="Mobile"
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                className="w-full border-2 border-gray-100 bg-[#fff5f5] rounded-2xl px-5 py-3.5 text-[15px] font-semibold text-gray-800 focus:outline-none focus:border-[#800000]/30 transition-colors"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="flex-[2] bg-[#f97316] hover:bg-[#eb6a10] text-white py-4 rounded-xl font-bold text-[15px] disabled:opacity-60 shadow-[0_5px_15px_rgba(249,115,22,0.3)] transition active:scale-[0.98]">
                {saving ? <span className="flex justify-center"><Loader2 size={20} className="animate-spin" /></span> : "Save Changes"}
              </button>
              <button type="button" onClick={() => setEdit(false)} className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-xl font-bold text-[15px] hover:bg-gray-200 transition active:scale-[0.98]">Cancel</button>
            </div>
          </form>
        ) : (
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 mb-6 overflow-hidden">
            <div className="flex flex-col p-2">
              <div className="flex justify-between items-center px-4 py-4 rounded-2xl hover:bg-gray-50 transition">
                <span className="text-gray-500 font-medium text-[15px]">Mobile</span>
                <span className="font-bold text-gray-900">{profile.mobile}</span>
              </div>
              <div className="h-px bg-gray-100 mx-4"></div>
              <div className="flex justify-between items-center px-4 py-4 rounded-2xl hover:bg-gray-50 transition">
                <span className="text-gray-500 font-medium text-[15px]">Account Status</span>
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${profile.isActive ? "bg-green-50 text-green-600 border-green-200" : "bg-red-50 text-red-500 border-red-200"}`}>
                  {profile.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <div className="p-5 pt-0 mt-2">
              <button onClick={() => {
                setForm({
                  name: profile.name,
                  mobile: profile.mobile,
                  profilePhoto: profile.profilePhoto || "",
                });
                setEdit(true);
              }} className="w-full bg-[#ffe4e4] text-[#800000] border border-[#800000]/10 py-3.5 rounded-xl text-[15px] font-bold hover:bg-[#ffd0d0] transition active:scale-[0.98]">
                Edit Profile Info
              </button>
            </div>
          </div>
        )}

        {/* Terms & Conditions */}
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 mb-4 overflow-hidden">
          <button
            onClick={() => setShowTerms(!showTerms)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#ffe4e4] rounded-xl flex items-center justify-center">
                <Shield size={16} className="text-[#800000]" />
              </div>
              <span className="font-bold text-gray-800 text-[15px]">Terms & Conditions</span>
            </div>
            {showTerms ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          </button>
          {showTerms && (
            <div className="px-5 pb-5 space-y-3">
              {terms.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-2">No terms available</p>
              )}
              {terms.map((t, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#ffe4e4] text-[#800000] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-sm text-gray-600 leading-relaxed">{t}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Install App Button */}
        {!isStandalone() && (
          <div className="mb-4">
            {/* Android */}
            {installPrompt && (
              <button
                onClick={handleAndroidInstall}
                className="w-full bg-[#800000] text-white py-4 rounded-[20px] text-[15px] font-bold flex justify-center items-center gap-2 active:scale-[0.98] transition shadow-md mb-3"
              >
                <Download size={18} /> Install App
              </button>
            )}
            {/* iOS */}
            {isIOS() && (
              <>
                <button
                  onClick={() => setShowIOSGuide(!showIOSGuide)}
                  className="w-full bg-[#800000] text-white py-4 rounded-[20px] text-[15px] font-bold flex justify-center items-center gap-2 active:scale-[0.98] transition shadow-md"
                >
                  <Download size={18} /> Install App
                </button>
                {showIOSGuide && (
                  <div className="mt-3 bg-white rounded-[20px] border border-gray-100 shadow-sm p-5 space-y-3">
                    <p className="text-sm font-bold text-gray-700 mb-1">How to install on iPhone:</p>
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 bg-[#ffe4e4] rounded-lg flex items-center justify-center shrink-0">
                        <Share size={14} className="text-[#800000]" />
                      </div>
                      <p className="text-sm text-gray-600">Tap the <span className="font-bold">Share</span> button at the bottom of Safari</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 bg-[#ffe4e4] rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-[#800000] font-bold text-sm">+</span>
                      </div>
                      <p className="text-sm text-gray-600">Tap <span className="font-bold">"Add to Home Screen"</span></p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 bg-[#ffe4e4] rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-[#800000] font-bold text-sm">✓</span>
                      </div>
                      <p className="text-sm text-gray-600">Tap <span className="font-bold">"Add"</span> to install</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Share App Button */}
        {/* Share & Support Buttons */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={shareApp}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-[20px] text-[15px] font-bold flex justify-center items-center gap-2 active:scale-[0.98] transition shadow-lg shadow-green-500/30"
          >
            <Share2 size={18} /> Share
          </button>
          {supportPhone && (
            <button
              onClick={() => window.open(`https://wa.me/${supportPhone}`, "_blank")}
              className="flex-1 bg-emerald-500 text-white py-4 rounded-[20px] text-[15px] font-bold flex justify-center items-center gap-2 active:scale-[0.98] transition shadow-lg shadow-emerald-500/30"
            >
              <Phone size={18} /> Support
            </button>
          )}
        </div>
        <button onClick={logout} className="w-full bg-red-50 border border-red-100 text-red-600 py-4 rounded-[20px] text-[15px] font-bold hover:bg-red-100 transition flex justify-center items-center gap-2 active:scale-[0.98]">
          <LogOut size={18} strokeWidth={2.5} /> Log Out
        </button>
      </div>
    </div>
  );
}
