import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";

const PRIVACY_POINTS = [
  {
    title: "Information We Collect",
    text: "We collect your name, mobile number, and bill information to operate the rewards program and ensure points are credited correctly.",
  },
  {
    title: "How We Use Your Data",
    text: "Your personal data is used solely for managing your account, processing reward points, verifying transactions, and improving our services.",
  },
  {
    title: "Data Sharing",
    text: "We do not sell, trade, or share your personal information with third parties. Your data is strictly used within the Inaamify ecosystem.",
  },
  {
    title: "Bill Images",
    text: "Bill images uploaded by you are stored securely and used only for verification purposes by authorized store admins.",
  },
  {
    title: "Data Security",
    text: "We use industry-standard encryption and security measures to protect your data from unauthorized access or disclosure.",
  },
  {
    title: "Account Management",
    text: "You have full control over your profile. You may update your information or request account deletion at any time.",
  },
  {
    title: "Cookies & Local Storage",
    text: "We use secure local storage to maintain your session and preferences. We do not track your activity outside of the Inaamify app.",
  },
  {
    title: "Service Updates",
    text: "Inaamify reserves the right to update this policy. Major changes will be notified via the app's notification system.",
  },
  {
    title: "Support",
    text: "For any privacy-related questions or concerns, please reach out through our official support channels.",
  },
];

export default function AdminPrivacyPage() {
  const navigate = useNavigate();

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
              <h1 className="text-white font-bold text-2xl tracking-wide mb-1">Privacy Policy</h1>
              <p className="text-white/80 font-medium text-sm">Last updated: April 2026</p>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
              <ShieldCheck className="text-white" size={22} />
            </div>
          </div>
        </div>
      </div>

      <div className="px-5">
        <div className="bg-white rounded-3xl p-5 mb-5 border border-[#ffe4e4] flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-[#fff5f5] rounded-xl flex items-center justify-center shrink-0">
            <Lock size={22} className="text-[#800000]" />
          </div>
          <div>
            <p className="text-[#1a0000] font-bold text-base">Your Privacy Matters</p>
            <p className="text-gray-500 text-xs mt-0.5">We protect your data like our own.</p>
          </div>
        </div>

        <div className="space-y-3">
          {PRIVACY_POINTS.map((p, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#fff5f5] text-[#800000] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-1">{p.title}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{p.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8 px-4">
          © 2026 Inaamify. All rights reserved.
        </p>
      </div>
    </div>
  );
}
