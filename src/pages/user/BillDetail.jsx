import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const statusStyle = {
  pending: "bg-amber-100 text-amber-600 border-amber-200",
  approved: "bg-green-100 text-green-600 border-green-200",
  rejected: "bg-red-100 text-red-500 border-red-200",
};

export default function BillDetail() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const b = state?.bill;
  if (!b) { navigate("/user/bills", { replace: true }); return null; }

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans">
      <div className="flex items-center gap-3 px-4 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-bold text-lg text-gray-800">Bill Details</h2>
      </div>

      <div className="p-5 space-y-4 pb-10">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-[#0f4089] to-[#1a4187] rounded-2xl p-4 text-white">
            <p className="text-xs text-white/70 uppercase tracking-wider mb-1">Amount</p>
            <p className="text-3xl font-extrabold">₹{b.amount}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Status</p>
            <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold capitalize border ${statusStyle[b.status]}`}>{b.status}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-3">
          {[
            ["Bill Name", b.billName],
            ["Bill Number", `#${b.billNumber}`],
            ["Date", new Date(b.date || b.createdAt).toLocaleDateString()],
            ["Points Earned", b.pointsEarned > 0 ? `+${b.pointsEarned} pts` : "—"],
          ].map(([label, val], i, arr) => (
            <div key={label} className={`flex justify-between items-center ${i !== arr.length - 1 ? "border-b border-gray-100 pb-3" : ""}`}>
              <span className="text-sm text-gray-500 font-medium">{label}</span>
              <span className={`text-sm font-bold ${label === "Points Earned" && b.pointsEarned > 0 ? "text-green-600" : "text-gray-900"}`}>{val}</span>
            </div>
          ))}
        </div>

        {b.rejectionReason && (
          <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
            <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Rejection Reason</p>
            <p className="text-sm text-red-600 font-medium">{b.rejectionReason}</p>
          </div>
        )}
      </div>
    </div>
  );
}
