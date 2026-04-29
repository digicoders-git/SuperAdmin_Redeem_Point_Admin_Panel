import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Swal from "sweetalert2";
import { 
  ShieldCheck, 
  LogOut, 
  QrCode, 
  Store, 
  Shield, 
  CreditCard, 
  Bell, 
  Share2, 
  Settings, 
  ChevronRight,
  Sparkles,
  Camera,
  ExternalLink,
  Phone,
  Loader2,
  Trash2,
  Coins,
  Download
} from "lucide-react";

export default function AdminProfile() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(JSON.parse(localStorage.getItem("adminInfo") || "{}"));
  const adminMobile = localStorage.getItem("adminMobile") || admin.mobile || "";
  const [subscription, setSubscription] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [supportPhone, setSupportPhone] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", mobile: "", shopName: "" });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subRes, notiRes, settingsRes, adminRes] = await Promise.all([
          api.get("/subscriptions/my"),
          api.get("/notifications/admin"),
          api.get("/subscriptions/settings/public"),
          api.get("/admin/profile").catch(() => ({ data: { admin } })),
        ]);
        setSubscription(subRes.data.subscription);
        setUnreadCount(notiRes.data.notifications?.filter(n => !n.isRead).length || 0);
        setSupportPhone(settingsRes.data.settings?.supportPhone || "");
        if (adminRes.data.admin) {
          setAdmin(adminRes.data.admin);
          localStorage.setItem("adminInfo", JSON.stringify(adminRes.data.admin));
        }
      } catch (error) {
        console.error("Error fetching admin profile data:", error);
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
      const updatedAdmin = { ...admin, profilePhoto: data.admin.profilePhoto };
      setAdmin(updatedAdmin);
      localStorage.setItem("adminInfo", JSON.stringify(updatedAdmin));
      Swal.fire({ icon: "success", title: "Photo Updated!", timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Upload Failed", text: err.response?.data?.message || "Could not upload photo" });
    } finally {
      setUploadingPhoto(false);
    }
  };


  const startEditing = () => {
    setEditForm({
      name: admin.name || "",
      mobile: admin.mobile || "",
      shopName: admin.shopName || ""
    });
    setIsEditing(true);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const { data } = await api.put("/admin/profile", editForm);
      setAdmin(data.admin);
      localStorage.setItem("adminInfo", JSON.stringify(data.admin));
      setIsEditing(false);
      Swal.fire({ icon: "success", title: "Profile Updated!", timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Update Failed", text: err.response?.data?.message || "Failed to update profile" });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const shareApp = async () => {
    const shareData = {
      title: "Redeem Partner Panel",
      text: `Join ${admin.name || "us"} at Redeem to manage your shop and reward customers!`,
      url: window.location.origin + "/admin/login",
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        Swal.fire({
          icon: "success",
          title: "Link Copied!",
          text: "Login link copied to clipboard. Share it with your team!",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        Swal.fire({ icon: "error", title: "Failed", text: "Could not share link" });
      }
    }
  };
  
  const installApp = async () => {
    const prompt = window.__installPrompt;
    if (prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') {
        window.__installPrompt = null;
      }
    } else {
      Swal.fire({
        title: "Install App",
        html: `
          <div class="text-left space-y-3 text-sm">
            <p><b>For Android:</b> Tap the three dots (⋮) and select "Install app" or "Add to home screen".</p>
            <p><b>For iPhone:</b> Tap the Share button (󰀿) and select "Add to Home Screen".</p>
          </div>
        `,
        icon: "info",
        confirmButtonText: "Got it",
        confirmButtonColor: "#800000"
      });
    }
  };

  const serverBase = import.meta.env.VITE_IMAGE_URL || import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "").replace(/\/$/, "") || "";
  const getFullUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const cleanPath = path.replace(/\\/g, "/").replace(/^\/+/, "");
    return `${serverBase}/${cleanPath}`;
  };

  const MenuAction = ({ icon: Icon, label, onClick, badge, color = "text-gray-700", bgColor = "bg-gray-50" }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 mb-3 bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-[0.98] transition-all duration-200 group"
    >
      <div className="flex items-center gap-4">
        <div className={`${bgColor} ${color} p-2.5 rounded-xl transition-colors`}>
          <Icon size={20} />
        </div>
        <span className="font-bold text-[15px] text-gray-800">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge !== undefined && badge > 0 && (
          <span className="bg-[#800000] text-white text-[10px] font-black px-2 py-0.5 rounded-full min-w-[20px] h-5 flex items-center justify-center">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
        <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all" />
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans pb-28">
      {/* Hero Header */}
      <div className="relative bg-[#800000] pt-8 pb-22 px-6 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 w-full h-full bg-[radial-gradient(circle,white/5_1px,transparent_1px)] bg-[size:20px_20px] opacity-20 -translate-x-1/2 -translate-y-1/2" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-6 group">
            <div className="w-28 h-28 rounded-[35%] bg-white/10 backdrop-blur-md border border-white/20 p-1 shadow-2xl transition-transform duration-500 group-hover:rotate-6 overflow-hidden">
              <div className="w-full h-full rounded-[35%] bg-gradient-to-br from-white to-gray-100 flex items-center justify-center shadow-inner overflow-hidden">
                {admin.profilePhoto ? (
                  <img src={getFullUrl(admin.profilePhoto)} alt="Admin" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-black text-[#800000]">
                    {(admin.name || admin.adminId || "A")[0].toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <label className="absolute -bottom-1 -right-1 bg-amber-400 p-2 rounded-xl shadow-lg border-2 border-[#800000] cursor-pointer hover:bg-amber-500 transition-colors">
              {uploadingPhoto ? (
                <Loader2 className="text-white animate-spin" size={14} />
              ) : (
                <Camera className="text-white" size={14} />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
              />
            </label>
          </div>
          <h1 className="text-white text-2xl font-black mb-1">{admin.name || "Partner Admin"}</h1>
          <p className="text-white/70 text-xs font-bold uppercase tracking-[0.2em] mb-4">{admin.shopName || "Set Shop Name"}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              <ShieldCheck className="text-amber-400" size={13} />
              <span className="text-white/90 text-[11px] font-bold uppercase tracking-widest">{admin.adminId}</span>
            </div>
            {admin.mobile && (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                <Phone className="text-emerald-400" size={13} />
                <span className="text-white/90 text-[11px] font-bold uppercase tracking-widest">{admin.mobile}</span>
              </div>
            )}
          </div>
          
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-6 -mt-16 relative z-20">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => navigate("/admin/notifications")}
            className="bg-white rounded-[28px] p-5 shadow-xl shadow-gray-200/50 border border-gray-50 flex flex-col items-center gap-3 active:scale-[0.98] transition group"
          >
            <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl group-hover:scale-110 transition-transform relative">
              <Bell size={24} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Alerts</p>
              <p className="text-lg font-black text-gray-800">{unreadCount || '0'} New</p>
            </div>
          </button>
          <button
            onClick={() => navigate("/admin/plans")}
            className="bg-white rounded-[28px] p-5 shadow-xl shadow-gray-200/50 border border-gray-50 flex flex-col items-center gap-3 active:scale-[0.98] transition group"
          >
            <div className="bg-purple-50 text-purple-600 p-3 rounded-2xl group-hover:scale-110 transition-transform">
              <CreditCard size={24} />
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Plan</p>
              <p className="text-lg font-black text-gray-800">Explore</p>
            </div>
          </button>
        </div>

        <div className="bg-white rounded-[28px] p-2 shadow-xl shadow-gray-200/50 border border-gray-50 mb-8">
           <button 
             onClick={startEditing}
             className="w-full flex items-center justify-center gap-2 py-4 text-[#800000] font-bold text-sm hover:bg-red-50 transition-colors rounded-[20px]"
           >
             <Settings size={18} /> Edit Profile Info
           </button>
        </div>

        {/* Subscription Banner */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-[28px] p-6 mb-8 relative overflow-hidden shadow-2xl shadow-gray-900/20 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded ${
                  subscription?.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {subscription?.status || 'No Active Plan'}
                </span>
              </div>
              <h3 className="text-white text-xl font-bold mb-1">
                {subscription ? subscription.planId?.name : 'Start Pro Today'}
              </h3>
              <p className="text-white/40 text-xs font-medium">
                {subscription ? `Expires on ${new Date(subscription.endDate).toLocaleDateString()}` : 'Unlock advanced analytics & rewards'}
              </p>
            </div>
            <button 
              onClick={() => navigate("/admin/plans")}
              className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl border border-white/10 text-white transition-all active:scale-90"
            >
              <ExternalLink size={20} />
            </button>
          </div>
        </div>

        {/* Action Menu */}
        <div className="mb-8">
          <h4 className="text-gray-400 text-[11px] font-black uppercase tracking-[0.2em] mb-4 ml-2">General Settings</h4>
          <MenuAction 
            icon={QrCode} 
            label="Shop QR Code" 
            onClick={() => navigate("/admin/qr-code")}
            color="text-amber-600"
            bgColor="bg-amber-50"
          />
          <MenuAction 
            icon={Store} 
            label="Shop Configuration" 
            onClick={() => navigate("/admin/configuration")}
            color="text-[#800000]"
            bgColor="bg-[#800000]/5"
          />
          <MenuAction 
            icon={Shield} 
            label="Terms & Privacy" 
            onClick={() => navigate("/admin/terms")}
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <MenuAction 
            icon={Download} 
            label="Download App" 
            onClick={installApp} 
            color="text-indigo-600"
            bgColor="bg-indigo-50"
          />
          <MenuAction 
            icon={Share2} 
            label="Partner Dashboard Share" 
            onClick={shareApp} 
            color="text-green-600"
            bgColor="bg-green-50"
          />
          {supportPhone && (
            <MenuAction
              icon={() => (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              )}
              label="Contact Support"
              onClick={() => window.open(`https://wa.me/${supportPhone}?text=${encodeURIComponent("Hi, I need some help with Inaamify. Can you please assist me?")}`, "_blank")}
              color="text-emerald-600"
              bgColor="bg-emerald-50"
            />
          )}
        </div>

        {/* Logout Section */}
        <div className="space-y-3">
          <button
            onClick={() => {
              const res = Swal.fire({
                title: "Logout?",
                text: "Are you sure you want to logout?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, Logout",
                confirmButtonColor: "#800000",
                cancelButtonColor: "#d1d5db",
              }).then(r => {
                if(r.isConfirmed) {
                   api.post("/admin/logout-all").catch(() => {});
                   localStorage.clear();
                   sessionStorage.clear();
                   navigate("/", { replace: true });
                }
              })
            }}
            className="w-full bg-white text-gray-600 py-4 rounded-[20px] font-bold text-sm flex items-center justify-center gap-3 border border-gray-100 shadow-sm active:scale-[0.98] transition"
          >
            <LogOut size={18} /> Sign Out Account
          </button>
        </div>
        
        <p className="text-center text-gray-300 text-[10px] font-bold mt-8 uppercase tracking-[0.3em]">Redeem • v1.0.4</p>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center px-6 backdrop-blur-sm" onClick={() => setIsEditing(false)}>
          <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-gray-900 text-xl">Edit Profile</h3>
              <button onClick={() => setIsEditing(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={saveProfile} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">Admin Name</label>
                <input 
                  type="text" 
                  value={editForm.name} 
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})} 
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold focus:border-[#800000] focus:outline-none transition" 
                  required 
                />
              </div>
              
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">Mobile Number</label>
                <input 
                  type="text" 
                  value={editForm.mobile} 
                  onChange={(e) => setEditForm({...editForm, mobile: e.target.value})} 
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold focus:border-[#800000] focus:outline-none transition" 
                  required 
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">Shop Name</label>
                <input 
                  type="text" 
                  value={editForm.shopName} 
                  onChange={(e) => setEditForm({...editForm, shopName: e.target.value})} 
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold focus:border-[#800000] focus:outline-none transition" 
                  required 
                />
              </div>

              <button 
                type="submit" 
                disabled={updatingProfile}
                className="w-full bg-[#800000] text-white font-bold py-4 rounded-2xl text-sm shadow-lg shadow-red-200 transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
              >
                {updatingProfile ? <Loader2 size={18} className="animate-spin" /> : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite ease-in-out;
        }
      ` }} />
    </div>
  );
}
