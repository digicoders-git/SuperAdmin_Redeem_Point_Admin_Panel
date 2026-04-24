import { useNavigate } from "react-router-dom";
import { Shield, User } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#800000] to-[#6b0000] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 rounded-3xl mx-auto mb-4 overflow-hidden shadow-lg border-2 border-white/20">
            <img src="/WhatsApp Image 2026-04-23 at 17.37.03.jpeg" alt="Inaamify" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-white font-extrabold text-3xl mb-2">Inaamify</h1>
          <p className="text-white/70 text-sm font-medium">Choose how you want to continue</p>
        </div>

        {/* Selection Cards */}
        <div className="space-y-4">
          {/* Admin Card */}
          <button
            onClick={() => navigate("/admin/login")}
            className="w-full bg-white rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all active:scale-[0.98] group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#ffe4e4] rounded-2xl flex items-center justify-center group-hover:bg-[#800000] transition-colors">
                <Shield size={28} className="text-[#800000] group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1 text-left">
                <h2 className="text-gray-900 font-extrabold text-xl mb-1">Admin Panel</h2>
                <p className="text-gray-500 text-sm font-medium">Manage your shop & rewards</p>
              </div>
              <svg className="w-6 h-6 text-gray-300 group-hover:text-[#800000] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* User Card */}
          <button
            onClick={() => navigate("/user/login")}
            className="w-full bg-white rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all active:scale-[0.98] group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                <User size={28} className="text-emerald-500 group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1 text-left">
                <h2 className="text-gray-900 font-extrabold text-xl mb-1">User Panel</h2>
                <p className="text-gray-500 text-sm font-medium">Track bills & redeem rewards</p>
              </div>
              <svg className="w-6 h-6 text-gray-300 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/50 text-xs font-medium">© 2026 Inaamify. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
