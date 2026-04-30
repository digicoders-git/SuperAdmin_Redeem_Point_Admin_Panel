import { useNavigate } from "react-router-dom";
import { ArrowLeft, Store, TrendingUp, Users, Zap, ShieldCheck } from "lucide-react";

export default function MerchantPortal() {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: <Users className="text-blue-500" />,
      title: "Customer Loyalty",
      desc: "Turn one-time shoppers into regulars with our automated rewards system."
    },
    {
      icon: <TrendingUp className="text-emerald-500" />,
      title: "Boost Sales",
      desc: "Stores using Inaamify see an average 25% increase in repeat visits."
    },
    {
      icon: <Zap className="text-amber-500" />,
      title: "Instant Setup",
      desc: "Register your shop and start issuing points in less than 5 minutes."
    },
    {
      icon: <ShieldCheck className="text-[#800000]" />,
      title: "Fraud Protection",
      desc: "Our manual bill verification ensures every point issued is legitimate."
    }
  ];

  return (
    <div className="min-h-screen bg-[#fff5f5] font-sans pb-10">
      <div className="bg-gradient-to-br from-[#800000] to-[#6b0000] rounded-b-[40px] px-6 pt-10 pb-12 mb-6 relative overflow-hidden shadow-lg shadow-[#800000]/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <button onClick={() => navigate("/")} className="w-9 h-9 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center mb-4">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white font-bold text-2xl tracking-wide mb-1">Merchant Portal</h1>
              <p className="text-white/80 font-medium text-sm">Grow your business with us</p>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
              <Store className="text-white" size={22} />
            </div>
          </div>
        </div>
      </div>

      <div className="px-5">
        <div className="bg-white rounded-3xl p-6 mb-6 border border-[#ffe4e4] shadow-sm text-center">
          <h2 className="text-xl font-extrabold text-gray-900 mb-2">Ready to Join Inaamify?</h2>
          <p className="text-sm text-gray-500 mb-6">Manage your shop, verify customer bills, and track your business growth in one place.</p>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => navigate("/admin/login")}
              className="bg-[#800000] text-white font-bold py-3.5 rounded-2xl shadow-md active:scale-95 transition text-sm"
            >
              Admin Login
            </button>
            <button 
              onClick={() => navigate("/admin/register")}
              className="bg-white text-[#800000] border-2 border-[#ffe4e4] font-bold py-3.5 rounded-2xl active:scale-95 transition text-sm"
            >
              Register Shop
            </button>
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-4 px-1">Merchant Benefits</h3>
        <div className="grid grid-cols-1 gap-3">
          {benefits.map((b, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-4">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                {b.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 mb-0.5">{b.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-[#800000]/5 border border-[#800000]/10 rounded-3xl p-6 text-center">
          <p className="text-sm text-[#800000] font-bold mb-1">Need Enterprise Solutions?</p>
          <p className="text-xs text-gray-500 mb-4">For multi-chain stores and custom integration, contact our sales team.</p>
          <button className="text-[#800000] font-bold text-sm underline">Contact Sales</button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8 px-4">
          © 2026 Inaamify Merchant Services.
        </p>
      </div>
    </div>
  );
}
