import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Loader2, Shield, ChevronLeft } from "lucide-react";

export default function AdminTerms() {
  const navigate = useNavigate();
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/terms/for-admin")
      .then(({ data }) => setTerms(data.terms || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#fff5f5] font-sans pb-24">
      <div className="bg-gradient-to-br from-[#800000] to-[#6b0000] rounded-b-[40px] px-6 pt-10 pb-12 mb-6 relative overflow-hidden shadow-lg shadow-[#800000]/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center mb-4">
            <ChevronLeft size={18} className="text-white" />
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white font-bold text-2xl tracking-wide mb-1">Terms & Conditions</h1>
              <p className="text-white/80 font-medium text-sm">Set by platform</p>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
              <Shield className="text-white" size={22} />
            </div>
          </div>
        </div>
      </div>

      <div className="px-5">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={30} className="animate-spin text-[#800000]" />
          </div>
        ) : terms.length === 0 ? (
          <div className="bg-white rounded-[24px] p-10 text-center border border-gray-100 shadow-sm">
            <Shield size={28} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No terms set by platform yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-[24px] shadow-sm border border-[#ffe4e4] p-5 space-y-4">
            {terms.map((t, i) => (
              <div key={t._id} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#ffe4e4] text-[#800000] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-sm text-gray-700 leading-relaxed">{t.text}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <p className="text-xs text-blue-700 leading-relaxed">
            <strong>Note:</strong> These terms & conditions are set by the platform and apply to all shops.
          </p>
        </div>
      </div>
    </div>
  );
}
