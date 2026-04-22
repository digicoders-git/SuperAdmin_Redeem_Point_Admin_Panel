import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { CreditCard, AlertCircle, CheckCircle2, Clock } from "lucide-react";

export default function SubscriptionWidget() {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/subscriptions/my")
      .then(({ data }) => {
        setSubscription(data.subscription);
        setPendingCount(data.pendingSubscriptions?.length || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  const getDaysRemaining = (endDate) => {
    const days = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  if (!subscription) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl p-5 mb-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center">
            <AlertCircle size={20} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">No Active Subscription</h3>
            <p className="text-xs text-gray-500">Purchase a plan to continue</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/admin/plans")}
          className="w-full bg-red-600 text-white py-3 rounded-2xl text-sm font-bold active:scale-95 transition"
        >
          View Plans
        </button>
      </div>
    );
  }

  const daysLeft = getDaysRemaining(subscription.endDate);
  const isExpiringSoon = daysLeft <= 7;
  const isTrial = subscription.billingType === "free_trial";

  return (
    <div
      className={`rounded-3xl p-5 mb-5 border-2 cursor-pointer active:scale-[0.98] transition ${
        isExpiringSoon
          ? "bg-amber-50 border-amber-200"
          : "bg-white border-[#ffe4e4]"
      }`}
      onClick={() => navigate("/admin/plans")}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              isExpiringSoon ? "bg-amber-100" : "bg-green-100"
            }`}
          >
            {isExpiringSoon ? (
              <AlertCircle size={20} className="text-amber-600" />
            ) : (
              <CheckCircle2 size={20} className="text-green-600" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">
              {isTrial ? "Free Trial" : subscription.planId?.name || "Active Plan"}
            </h3>
            <p className="text-xs text-gray-500 capitalize">{subscription.billingType.replace("_", " ")}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-black ${isExpiringSoon ? "text-amber-600" : "text-green-600"}`}>
            {daysLeft}
          </p>
          <p className="text-[9px] text-gray-400 uppercase font-bold">Days Left</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">Expires: {formatDate(subscription.endDate)}</span>
        {pendingCount > 0 && (
          <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
            <Clock size={11} />
            <span className="font-bold">{pendingCount} Queued</span>
          </div>
        )}
      </div>

      {isExpiringSoon && (
        <div className="mt-3 pt-3 border-t border-amber-200">
          <button className="w-full bg-amber-600 text-white py-2.5 rounded-xl text-xs font-bold">
            Renew Now
          </button>
        </div>
      )}
    </div>
  );
}
