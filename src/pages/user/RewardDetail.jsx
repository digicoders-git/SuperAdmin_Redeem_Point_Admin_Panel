import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Gift, Coins, Loader2 } from "lucide-react";
import api from "../../api/axios";
import Swal from "sweetalert2";

export default function RewardDetail() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const r = state?.reward;
  const [activeImg, setActiveImg] = useState(0);
  const [fullScreen, setFullScreen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [wallet, setWallet] = useState(0);
  const [walletLoading, setWalletLoading] = useState(true);

  useEffect(() => {
    api.get("/users/profile").then(({ data }) => {
      setWallet(data.user?.walletPoints || 0);
    }).finally(() => setWalletLoading(false));
  }, []);

  if (!r) { navigate("/user/rewards", { replace: true }); return null; }

  const images = r.rewardImages?.length > 0 ? r.rewardImages : r.rewardImage ? [r.rewardImage] : [];

  const apply = async () => {
    const res = await Swal.fire({ title: "Redeem Reward?", text: "Are you sure?", icon: "question", showCancelButton: true, confirmButtonColor: "#0f4089", confirmButtonText: "Yes, Redeem!" });
    if (!res.isConfirmed) return;
    setApplying(true);
    try {
      await api.post("/rewards/user/apply", { rewardId: r._id });
      const { data } = await api.get("/users/profile");
      setWallet(data.user.walletPoints || 0);
      Swal.fire({ icon: "success", title: "Redemption Submitted!", timer: 1500, showConfirmButton: false });
      navigate(-1);
    } catch (e) {
      Swal.fire({ icon: "error", title: "Failed", text: e.response?.data?.message || "Failed to apply" });
    } finally {
      setApplying(false);
    }
  };

  if (walletLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] font-sans flex flex-col items-center">
        <div className="w-full bg-[#800000]/10 pt-12 pb-24 px-6 flex flex-col items-center text-center">
          <div className="h-8 w-40 bg-gray-200 rounded-lg animate-pulse mb-3" />
          <div className="h-4 w-48 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="w-full px-6 -mt-16 relative z-10 max-w-md">
          <div className="bg-white rounded-[32px] shadow-2xl p-6 flex flex-col items-center">
            <div className="h-3 w-20 bg-gray-100 rounded-full animate-pulse mb-2" />
            <div className="h-8 w-48 bg-gray-100 rounded-lg animate-pulse mb-6" />
            <div className="w-full aspect-[4/3] bg-gray-100 rounded-2xl animate-pulse mb-6" />
            <div className="w-full flex justify-between mb-8">
              <div className="h-10 w-20 bg-gray-50 rounded-xl animate-pulse" />
              <div className="h-10 w-20 bg-gray-50 rounded-xl animate-pulse" />
            </div>
            <div className="h-16 w-full bg-gray-100 rounded-2xl animate-pulse mb-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans flex flex-col items-center animate-in fade-in duration-500">
      {/* Red Header Section */}
      <div className="w-full bg-[#800000] pt-12 pb-24 px-6 flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <h1 className="text-white text-3xl font-extrabold mb-2 relative z-10">Claim Reward</h1>
        <p className="text-white/80 text-sm font-medium relative z-10 uppercase tracking-widest">Show this to the merchant</p>
      </div>

      {/* Main Reward Card */}
      <div className="w-full px-6 -mt-16 relative z-10 max-w-md">
        <div className="bg-white rounded-[32px] shadow-2xl p-6 flex flex-col items-center">
          {/* Shop Name */}
          <div className="mb-4 text-center">
            <p className="text-[#800000] text-[10px] font-black uppercase tracking-[0.2em]">
              {r.adminId?.name || "Premium Store"}
            </p>
            <h2 className="text-2xl font-black text-gray-900 mt-1 uppercase leading-tight">
              {r.rewardName}
            </h2>
          </div>

          {/* Reward Image Container */}
          <div className="w-full aspect-[4/3] bg-gray-50 rounded-2xl overflow-hidden mb-6 flex items-center justify-center relative shadow-inner border border-gray-100">
            {images.length > 0 ? (
              <>
                <img 
                  src={images[activeImg]} 
                  alt={r.rewardName} 
                  className="w-full h-full object-contain p-4 cursor-zoom-in active:scale-95 transition-transform" 
                  onClick={() => setFullScreen(true)} 
                  onError={(e) => { e.target.style.display = "none"; }} 
                />
                {images.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full">
                    {activeImg + 1} / {images.length}
                  </div>
                )}
              </>
            ) : (
              <Gift size={64} className="text-gray-200" />
            )}
          </div>

          {/* Points Info Row */}
          <div className="w-full flex justify-between items-center mb-6 px-2">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Required</p>
              <p className="text-xl font-black text-[#800000] flex items-center gap-1">
                {r.pointsRequired} <span className="text-[10px] font-bold text-gray-400 pt-1">PTS</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Your Balance</p>
              <p className={`text-xl font-black flex items-center gap-1 transition-colors ${wallet >= r.pointsRequired ? "text-emerald-500" : "text-red-500"}`}>
                {wallet} <span className="text-[10px] font-bold text-gray-400 pt-1">PTS</span>
              </p>
            </div>
          </div>

          {/* Claim Button */}
          {wallet >= r.pointsRequired ? (
            <button 
              onClick={apply} 
              disabled={applying} 
              className="w-full bg-gradient-to-r from-[#800000] to-[#6b0000] text-white font-black py-5 rounded-2xl flex justify-center items-center gap-2 active:scale-[0.97] transition-all shadow-xl shadow-[#800000]/30 disabled:opacity-60 mb-2 uppercase tracking-widest text-sm"
            >
              {applying ? <><Loader2 size={20} className="animate-spin" /> PROCESSING...</> : "Claim Reward"}
            </button>
          ) : (
            <button disabled className="w-full bg-red-50 text-red-500 font-black py-5 rounded-2xl flex justify-center items-center gap-2 border border-red-100 mb-2 uppercase tracking-wide text-xs">
              Need {r.pointsRequired - wallet} more pts
            </button>
          )}

          {/* Bottom Instructions */}
          <p className="text-[11px] text-gray-400 text-center mt-4 px-4 leading-relaxed font-medium">
            Show this screen to the merchant to and complete your redemption.
          </p>
        </div>

        {/* Cancel Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="w-full py-6 text-gray-400 font-black text-sm uppercase tracking-widest hover:text-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>

      {fullScreen && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 animate-in zoom-in duration-300" onClick={() => setFullScreen(false)}>
          <img src={images[activeImg]} alt="Full" className="w-full h-full object-contain" />
          <button className="absolute top-6 left-6 bg-white/10 p-3 rounded-full text-white" onClick={() => setFullScreen(false)}>
            <ArrowLeft size={22} />
          </button>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}.animate-pulse{animation:pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}` }} />
    </div>
  );
}
