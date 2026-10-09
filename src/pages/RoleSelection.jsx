import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, User, ArrowRight } from "lucide-react";

export default function RoleSelection() {
  const navigate = useNavigate();
  const [role, setRole] = useState("user"); // "user" or "admin"

  const handleContinue = () => {
    if (role === "admin") {
      navigate("/admin/login");
    } else {
      navigate("/user/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#800000] to-[#6b0000] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-10">
          <div className="w-24 h-24 rounded-3xl mx-auto mb-4 overflow-hidden shadow-lg border-2 border-white/20">
            <img src="/logo.jpeg" alt="Inaamify" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-white font-extrabold text-3xl mb-2">Inaamify</h1>
          <p className="text-white/70 text-sm font-medium">Choose how you want to continue</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl p-6 shadow-2xl">
          
          {/* Toggle Switch */}
          <div className="flex p-1 bg-gray-100 rounded-2xl mb-8">
            <button
              onClick={() => setRole("user")}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                role === "user" 
                  ? "bg-white text-emerald-500 shadow-sm" 
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              User
            </button>
            <button
              onClick={() => setRole("admin")}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                role === "admin" 
                  ? "bg-white text-[#800000] shadow-sm" 
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Admin
            </button>
          </div>

          {/* Role Info Display */}
          <div className="text-center mb-8">
            <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-4 transition-colors ${
              role === "admin" ? "bg-[#ffe4e4]" : "bg-emerald-50"
            }`}>
              {role === "admin" ? (
                <Shield size={40} className="text-[#800000]" />
              ) : (
                <User size={40} className="text-emerald-500" />
              )}
            </div>
            <h2 className="text-gray-900 font-extrabold text-2xl mb-2">
              {role === "admin" ? "Admin Panel" : "User Panel"}
            </h2>
            <p className="text-gray-500 text-sm font-medium">
              {role === "admin" 
                ? "Manage your shop & rewards" 
                : "Track bills & redeem rewards"
              }
            </p>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            className={`w-full text-white font-bold py-4 rounded-2xl shadow-lg transition active:scale-[0.98] flex items-center justify-center gap-2 ${
              role === "admin"
                ? "bg-gradient-to-r from-[#800000] to-[#6b0000] shadow-[#800000]/30"
                : "bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-emerald-500/30"
            }`}
          >
            Continue <ArrowRight size={20} />
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
