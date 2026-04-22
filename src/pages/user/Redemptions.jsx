import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { CopyCheck, Info, Loader2 } from "lucide-react";

export default function Redemptions() {
  const navigate = useNavigate();
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/rewards/user/my-redemptions")
      .then(({ data }) => setRedemptions(data.redemptions || []))
      .finally(() => setLoading(false));
  }, []);

  const statusStyle = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    approved: "bg-green-100 text-green-700 border-green-200",
    rejected: "bg-red-100 text-red-600 border-red-200",
  delivered: "bg-[#ffe4e4] text-[#800000] border-[#ffe4e4]",
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans pb-24">
      <div className="bg-[#800000] rounded-b-[40px] px-6 pt-10 pb-12 mb-6 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/10 p-2.5 rounded-2xl border border-white/20">
            <CopyCheck className="text-white" size={24} />
          </div>
          <h1 className="text-white font-bold text-2xl tracking-wide">My Redemptions</h1>
        </div>
      </div>

      <div className="px-5 space-y-4">
        {loading && (
          <div className="space-y-4 animate-in fade-in duration-500">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-full bg-white rounded-[24px] shadow-sm border border-gray-100 p-5 flex justify-between items-center animate-pulse">
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-32 bg-gray-100 rounded-lg" />
                  <div className="h-4 w-40 bg-gray-50 rounded-lg" />
                </div>
                <div className="flex flex-col items-end gap-2 ml-4">
                  <div className="h-6 w-16 bg-gray-100 rounded-full" />
                  <div className="h-5 w-12 bg-gray-50 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && redemptions.length === 0 && (
          <div className="bg-white rounded-[24px] p-10 text-center border border-gray-100 shadow-sm">
            <CopyCheck size={28} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No redemptions yet</p>
          </div>
        )}

        {redemptions.map((r) => (
          <div key={r._id} onClick={() => navigate(`/user/redemptions/${r._id}`, { state: { redemption: r } })} className="w-full text-left bg-white rounded-[24px] shadow-sm border border-gray-100 p-5 flex justify-between items-center transition hover:shadow-md active:scale-[0.98] cursor-pointer">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-[15px] mb-0.5 truncate">{r.rewardId?.rewardName || "Reward"}</p>
              <p className="text-[12px] font-medium text-gray-400 mb-1">{new Date(r.createdAt).toLocaleDateString()}</p>
              {r.rejectionReason && (
                <p className="text-[11px] text-red-500 font-semibold mt-2 flex items-center gap-1.5 bg-red-50 p-2 rounded-lg border border-red-100">
                  <Info size={14} /> {r.rejectionReason}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2 pl-4 ml-2 shrink-0">
              <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full capitalize border ${statusStyle[r.status]}`}>{r.status}</span>
              <span className="text-[13px] text-[#f97316] font-extrabold bg-[#f97316]/10 px-2 py-0.5 rounded-lg">-{r.pointsUsed} pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
