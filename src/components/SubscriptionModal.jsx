import { useNavigate } from "react-router-dom";
import { CreditCard, Zap } from "lucide-react";

export default function SubscriptionModal() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-5">
      {/* Translucent backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal content */}
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 animate-in zoom-in duration-300">
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-[#800000] to-[#6b0000] rounded-full flex items-center justify-center mb-5 shadow-lg shadow-[#800000]/30">
            <CreditCard size={36} className="text-white" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-extrabold text-gray-900 mb-3">
            Subscription Required
          </h2>

          {/* Message */}
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            Please purchase a subscription plan to access all features and continue using the software.
          </p>

          {/* Button */}
          <button
            onClick={() => navigate("/subscription")}
            className="w-full bg-gradient-to-r from-[#800000] to-[#6b0000] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#800000]/30 transition active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Zap size={18} />
            View Plans
          </button>

          {/* Info text */}
          <p className="text-xs text-gray-400 mt-4">
            Choose from our flexible plans to get started
          </p>
        </div>
      </div>
    </div>
  );
}
