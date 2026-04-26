import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Gift, User, Plus, FileText, IndianRupee, Loader2 } from "lucide-react";
import Swal from "sweetalert2";

export default function Bills() {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loadingBills, setLoadingBills] = useState(true);
  const [userPoints, setUserPoints] = useState(0);
  const [userName, setUserName] = useState("");
  const [shopName, setShopName] = useState("");
  const [rewards, setRewards] = useState([]);
  const [shopLogo, setShopLogo] = useState(null);
  const [hasShop, setHasShop] = useState(true);
  const serverBase = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "").replace(/\/$/, "") || "";

  const loadProfile = () =>
    api.get("/users/profile").then(({ data }) => {
      setUserPoints(data.user.walletPoints || 0);
      setUserName(data.user.name || "");
      setShopName(data.user.shopName || "");
      setHasShop(!!data.user.shopId);
      if (data.user.shopId) {
        api.get(`/admin/shop/${data.user.shopId}`).then(({ data: d }) => {
          if (d.admin?.profilePhoto) {
            const p = d.admin.profilePhoto.replace(/\\/g, "/").replace(/^\/+/, "/");
            setShopLogo(p.startsWith("http") ? p : serverBase + (p.startsWith("/") ? p : "/" + p));
          }
        }).catch(() => {});
      }
    });

  const load = () =>
    api.get("/bills/my-bills")
      .then(({ data }) => setBills(data.bills || []))
      .finally(() => setLoadingBills(false));

  useEffect(() => {
    loadProfile();
    load();
    api.get("/rewards/user/all").then(({ data }) => setRewards(data.rewards || []));
  }, []);

  const upload = async (e) => {
    e.preventDefault();
    if (!hasShop) {
      Swal.fire({ icon: "warning", title: "No Shop Linked", text: "Please register with a shop first to upload bills and earn points.", confirmButtonColor: "#800000" });
      return;
    }
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("billFile", file);
      fd.append("amount", amount);
      await api.post("/bills/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      Swal.fire({ icon: "success", title: "Bill Uploaded!", timer: 1500, showConfirmButton: false });
      setAmount(""); setFile(null); e.target.reset();
      load(); loadProfile();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Upload Failed", text: err.response?.data?.message || "Upload failed" });
    } finally {
      setUploading(false);
    }
  };

  const statusStyle = {
    pending: "bg-amber-100 text-amber-600",
    approved: "bg-green-100 text-green-600",
    rejected: "bg-red-100 text-red-500",
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans pb-24">
      <div className="bg-[#800000] rounded-b-[40px] px-6 pt-12 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl shadow-md flex justify-center items-center overflow-hidden">
              {shopLogo ? (
                <img src={shopLogo} alt="Shop" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#800000] font-extrabold text-xl">{shopName?.[0]?.toUpperCase() || "R"}</span>
              )}
            </div>
            <h1 className="text-white font-bold text-lg tracking-wide">{shopName || "Inaamify"}</h1>
          </div>
          <div onClick={() => navigate("/user/profile")} className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer">
            <User className="text-[#800000]" size={24} />
          </div>
        </div>
      </div>

      <div className="px-5 -mt-14 relative z-20">
        {/* No Shop Banner */}
        {!hasShop && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
            <span className="text-2xl">🏪</span>
            <div>
              <p className="font-bold text-amber-800 text-sm">No Shop Linked</p>
              <p className="text-amber-700 text-xs mt-0.5">Scan a shop's QR code or ask for a shop link to register and start earning points & rewards.</p>
            </div>
          </div>
        )}
        {/* Points Card */}
        <div className="bg-white rounded-3xl p-6 flex justify-between items-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] mb-6 border border-gray-100 relative overflow-hidden">
          <div className="absolute right-[-20px] top-[-20px] w-32 h-32 border-4 border-[#ffe4e4] rounded-full opacity-50 pointer-events-none" />
          <div className="z-10">
            <p className="text-gray-500 font-medium text-[15px] mb-1">Welcome, {userName || "Partner"}!</p>
            <h2 className="text-[#800000] text-[26px] font-bold">Your Points: {userPoints}</h2>
          </div>
          <div className="w-16 h-16 bg-[#800000] rounded-full flex justify-center items-center shadow-lg relative z-10">
            <IndianRupee className="text-white" size={26} strokeWidth={2} />
          </div>
        </div>

        {/* Upload Form */}
        <div className={`bg-white rounded-[24px] p-6 shadow-sm mb-8 border border-gray-100 flex flex-col gap-5 ${!hasShop ? "opacity-50 pointer-events-none" : ""}`}>
          <div className="flex gap-4 items-center">
            <div className="w-[70px] h-[90px] bg-[#ffe4e4] rounded-2xl p-[6px] shadow-inner flex-shrink-0">
              <div className="w-full h-full bg-white rounded-xl flex flex-col items-center justify-center border-2 border-[#800000] shadow-sm relative overflow-hidden">
                <div className="w-6 h-6 rounded bg-[#FBEED7] flex items-center justify-center text-[#f97316] font-bold text-sm">C</div>
                <div className="w-8 h-1 bg-gray-100 mt-2 rounded" />
                <div className="absolute -right-2 -bottom-2 w-6 h-6 bg-[#f97316] text-white rounded-full border-2 border-white flex items-center justify-center translate-x-[-12px] translate-y-[-10px]">
                  <Plus size={14} strokeWidth={4} />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Upload Purchase</h3>
              <p className="text-[13px] text-gray-500">Earn points for your bills!</p>
            </div>
          </div>
          <form onSubmit={upload} className="flex flex-col gap-4">
            <label className="border-2 border-dashed border-blue-400 bg-blue-50 rounded-xl cursor-pointer flex items-center justify-center py-3 px-4 min-h-[50px]">
              {file ? <span className="text-blue-600 font-bold text-[14px] truncate px-2">{file.name}</span> : <span className="text-blue-600 font-bold text-[14px]">📎 Select Purchase Slip</span>}
              <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
            </label>
            <div className="relative">
              <input type="number" placeholder="Total Amount Spent" value={amount} onChange={(e) => setAmount(e.target.value)} required className="w-full border-2 border-gray-100 rounded-[16px] px-5 py-3.5 text-[15px] font-medium text-gray-800 focus:outline-none focus:border-[#f97316]/50 bg-white pr-14" />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[#8c9fba] font-bold text-sm">INR</span>
            </div>
            <button type="submit" disabled={uploading || !file || !amount} className="w-full bg-[#f97316] text-white font-bold text-[16px] py-[14px] rounded-[16px] shadow-[0_5px_15px_rgba(249,115,22,0.3)] transition-all disabled:opacity-50">
              {uploading ? "Submitting..." : "Submit to earn points"}
            </button>
          </form>
        </div>

        {/* Rewards Carousel */}
        {hasShop && rewards.length > 0 && (
          <div className="mb-8">
            <h3 className="text-[#800000] text-xl font-bold mb-4 px-1">Redeem Your Points</h3>
            <div className="flex overflow-x-auto gap-4 pb-4 -mx-1 px-1 snap-x no-scrollbar">
              {rewards.map((r) => {
                const images = r.rewardImages?.length > 0 ? r.rewardImages : r.rewardImage ? [r.rewardImage] : [];
                return (
                  <button key={r._id} onClick={() => navigate(`/user/rewards/${r._id}`, { state: { reward: r } })} className="bg-white rounded-[20px] p-4 min-w-[170px] border border-gray-100 shadow-sm flex flex-col items-center flex-shrink-0 snap-start active:scale-[0.98] transition-all">
                    <div className="w-36 h-36 bg-gray-50 flex items-center justify-center rounded-xl mb-3 overflow-hidden relative">
                      {images.length > 0 ? <img src={images[0]} alt={r.rewardName} className="w-full h-full object-contain" onError={(e) => { e.target.style.display = "none"; }} /> : <Gift className="text-gray-300" size={60} />}
                      {images.length > 1 && <span className="absolute bottom-1 right-1 bg-black/50 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{images.length} pics</span>}
                    </div>
                    <h4 className="text-[14px] font-bold text-gray-800 mb-1 w-full truncate text-center">{r.rewardName}</h4>
                    <p className="text-[14px] font-bold"><span className="text-red-500">{r.pointsRequired}</span> <span className="text-gray-400 text-xs">Points</span></p>
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex justify-center">
              <button onClick={() => navigate("/user/rewards")} className="bg-[#800000] text-white text-sm font-bold py-3 px-8 rounded-full shadow-md w-[180px]">View All Gifts</button>
            </div>
          </div>
        )}

        {/* Bills List */}
        <div className="mt-4 pt-6 border-t border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 px-1 flex items-center gap-2">
            <FileText size={18} className="text-[#800000]" /> Recent Bills
          </h3>
          <div className="space-y-3">
            {loadingBills && (
              <div className="animate-in fade-in duration-500 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-full bg-white rounded-[16px] p-4 border border-gray-100 shadow-sm animate-pulse flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl" />
                      <div className="space-y-2">
                        <div className="h-4 w-16 bg-gray-100 rounded-lg" />
                        <div className="h-3 w-20 bg-gray-50 rounded-full" />
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="h-5 w-16 bg-gray-100 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!loadingBills && bills.length === 0 && <div className="bg-white rounded-[16px] p-6 text-center border border-gray-100"><p className="text-gray-400 text-sm">No bills uploaded yet</p></div>}
            {bills.map((b) => (
              <button key={b._id} onClick={() => navigate(`/user/bills/${b._id}`, { state: { bill: b } })} className="w-full bg-white rounded-[16px] p-4 border border-gray-100 shadow-sm hover:shadow-md transition flex items-center justify-between active:scale-[0.99]">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${b.billImage === "manual_adjustment" ? "bg-emerald-50" : "bg-gray-50"} rounded-xl flex items-center justify-center`}>
                    {b.billImage === "manual_adjustment" ? <Gift size={22} className="text-emerald-600" /> : <IndianRupee size={22} className="text-[#800000]" />}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-800">{b.billImage === "manual_adjustment" ? "Points Awarded" : `₹${b.amount}`}</p>
                    <p className="text-[11px] text-gray-400">{new Date(b.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${statusStyle[b.status]}`}>{b.status}</span>
                  {b.pointsEarned > 0 && <span className="text-[11px] text-[#800000] font-bold">+{b.pointsEarned} pts</span>}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}` }} />
    </div>
  );
}
