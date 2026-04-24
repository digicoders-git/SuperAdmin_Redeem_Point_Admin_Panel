import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import api from "../../api/axios";

export default function Terms() {
  const navigate = useNavigate();
  const [terms, setTerms] = useState([]);
  const [shopName, setShopName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/users/profile").then(({ data }) => {
      const shopId = data.user.shopId;
      setShopName(data.user.shopName || "");
      if (shopId) {
        api.get(`/admin/terms/${shopId}`)
          .then(({ data: t }) => setTerms(t.terms || []))
          .catch(() => setTerms([]))
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans pb-10">
      <div className="bg-[#800000] rounded-b-[32px] px-5 pt-10 pb-10 mb-5 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 border border-white/20 text-white">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-white font-bold text-xl">Terms & Conditions</h1>
            {shopName && <p className="text-white/70 text-sm">{shopName}</p>}
          </div>
        </div>
      </div>

      <div className="px-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : terms.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
            <Shield size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No terms available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {terms.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#ffe4e4] text-[#800000] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-sm text-gray-700 leading-relaxed">{t}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
