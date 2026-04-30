import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Loader2, ShieldCheck, ArrowLeft } from "lucide-react";

export default function PublicTerms() {
  const navigate = useNavigate();
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt to fetch public terms, fallback to static if needed
    api.get("/terms/for-admin") // Using this as a common endpoint, if it fails we show default terms
      .then(({ data }) => setTerms(data.terms || []))
      .catch(() => {
        setTerms([
          { _id: '1', text: "By using Inaamify, you agree to provide accurate information and valid shopping bills." },
          { _id: '2', text: "Reward points are subject to verification and may be revoked if the bill is found to be invalid or fraudulent." },
          { _id: '3', text: "Points have no cash value and can only be redeemed for rewards offered within the app." },
          { _id: '4', text: "Inaamify reserves the right to suspend accounts found engaging in suspicious activity." },
          { _id: '5', text: "Platform terms and individual shop offers are subject to change without prior notice." }
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#fff5f5] font-sans pb-10">
      <div className="bg-gradient-to-br from-[#800000] to-[#6b0000] rounded-b-[40px] px-6 pt-10 pb-12 mb-6 relative overflow-hidden shadow-lg shadow-[#800000]/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center mb-4">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white font-bold text-2xl tracking-wide mb-1">Terms of Service</h1>
              <p className="text-white/80 font-medium text-sm">Rules of our platform</p>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
              <ShieldCheck className="text-white" size={22} />
            </div>
          </div>
        </div>
      </div>

      <div className="px-5">
        <div className="bg-white rounded-3xl p-5 mb-6 border border-[#ffe4e4] shadow-sm">
          <p className="text-sm text-gray-600 leading-relaxed">
            Welcome to **Inaamify**. Please read these terms carefully before using our services. By accessing or using the platform, you agree to be bound by these terms.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 size={30} className="animate-spin text-[#800000]" />
          </div>
        ) : (
          <div className="space-y-3">
            {terms.map((t, i) => (
              <div key={t._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-4">
                <span className="w-7 h-7 rounded-full bg-[#fff5f5] text-[#800000] text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-700 leading-relaxed">{t.text}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <p className="text-xs text-blue-700 leading-relaxed">
            <strong>Note:</strong> These terms are applicable to all users and merchants on the Inaamify platform. Individual stores may have additional terms for their specific rewards.
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8 px-4">
          © 2026 Inaamify. All rights reserved.
        </p>
      </div>
    </div>
  );
}
