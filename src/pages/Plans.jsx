import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { CreditCard, Check, Loader2, Zap, Shield, Star, Clock, CheckCircle2, AlertCircle, Calendar, TrendingUp } from "lucide-react";
import Swal from "sweetalert2";

export default function Plans() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [billingType, setBillingType] = useState("monthly");
  const [subscription, setSubscription] = useState(null);
  const [pendingSubs, setPendingSubs] = useState([]);
  const [freeTrialDays, setFreeTrialDays] = useState(7);
  const admin = JSON.parse(localStorage.getItem("adminInfo") || "{}");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get("/subscriptions/plans/public"),
      api.get("/subscriptions/my").catch(() => ({ data: { subscription: null, pendingSubscriptions: [] } })),
      api.get("/subscriptions/settings/public").catch(() => ({ data: { settings: { freeTrialDays: 7 } } }))
    ])
      .then(([plansRes, subRes, settingsRes]) => {
        setPlans(plansRes.data.plans || []);
        setSubscription(subRes.data.subscription);
        setPendingSubs(subRes.data.pendingSubscriptions || []);
        setFreeTrialDays(settingsRes.data.settings?.freeTrialDays || 7);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handlePurchase = async () => {
    if (!selected) {
      Swal.fire({ icon: "warning", title: "Select a Plan", text: "Please select a plan to continue" });
      return;
    }

    setPurchasing(true);
    try {
      const { data } = await api.post("/subscriptions/create-order", {
        planId: selected,
        billingType,
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_dummy",
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Redeem System",
        description: `${data.plan.name} - ${billingType === "annual" ? "Annual" : "Monthly"} Plan`,
        order_id: data.order.id,
        handler: async (response) => {
          try {
            const verifyRes = await api.post("/subscriptions/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: selected,
              billingType,
            });

            if (verifyRes.data.queued) {
              await Swal.fire({
                icon: "success",
                title: "Payment Successful!",
                text: "Your plan has been added to queue and will activate after your current plan expires.",
                confirmButtonColor: "#800000",
              });
            } else {
              await Swal.fire({
                icon: "success",
                title: "Payment Successful!",
                text: "Your plan has been activated successfully!",
                timer: 2000,
                showConfirmButton: false,
              });
            }

            loadData();
            setSelected(null);
          } catch (err) {
            Swal.fire({
              icon: "error",
              title: "Verification Failed",
              text: err.response?.data?.message || "Payment verification failed",
            });
          }
        },
        prefill: {
          name: admin.name || admin.adminId,
          email: `${admin.adminId}@redeem.com`,
        },
        theme: {
          color: "#800000",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", (response) => {
        Swal.fire({
          icon: "error",
          title: "Payment Failed",
          text: response.error.description || "Payment failed. Please try again.",
        });
      });
      razorpay.open();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to create order",
      });
    } finally {
      setPurchasing(false);
    }
  };

  const planIcons = [Zap, Star, Shield];
  const planColors = [
    { bg: "bg-[#800000]", light: "bg-[#ffe4e4]", text: "text-[#800000]", border: "border-[#800000]" },
    { bg: "bg-[#6b0000]", light: "bg-[#fff0e0]", text: "text-[#f97316]", border: "border-[#f97316]" },
    { bg: "bg-[#1a0000]", light: "bg-[#f0fff4]", text: "text-emerald-600", border: "border-emerald-500" },
  ];

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const getDaysRemaining = (endDate) => {
    const days = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const daysLeft = subscription ? getDaysRemaining(subscription.endDate) : 0;
  const isExpiringSoon = daysLeft <= 7 && daysLeft > 0;

  return (
    <div className="min-h-screen bg-[#fff5f5] font-sans pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#800000] to-[#6b0000] rounded-b-[40px] px-6 pt-10 pb-12 mb-6 relative overflow-hidden shadow-lg shadow-[#800000]/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-2xl tracking-wide mb-1">Subscription Plans</h1>
            <p className="text-white/80 font-medium text-sm">Choose the perfect plan for your business</p>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
            <CreditCard className="text-white" size={24} />
          </div>
        </div>
      </div>

      <div className="px-5">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="animate-spin text-[#800000]" />
          </div>
        ) : (
          <>
            {/* Current Subscription Card */}
            {subscription ? (
              <div className={`rounded-3xl p-5 mb-6 border-2 ${isExpiringSoon ? "bg-amber-50 border-amber-200" : "bg-white border-[#ffe4e4]"}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isExpiringSoon ? "bg-amber-100" : "bg-green-100"}`}>
                      {isExpiringSoon ? (
                        <AlertCircle size={24} className="text-amber-600" />
                      ) : (
                        <CheckCircle2 size={24} className="text-green-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {subscription.billingType === "free_trial" ? "Free Trial" : subscription.planId?.name || "Active Plan"}
                      </h3>
                      <p className="text-xs text-gray-500 capitalize">{subscription.billingType.replace("_", " ")}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-3xl font-black ${isExpiringSoon ? "text-amber-600" : "text-green-600"}`}>
                      {daysLeft}
                    </p>
                    <p className="text-[9px] text-gray-400 uppercase font-bold">Days Left</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs mb-3">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Calendar size={12} />
                    <span>Expires: {formatDate(subscription.endDate)}</span>
                  </div>
                  {pendingSubs.length > 0 && (
                    <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                      <Clock size={11} />
                      <span className="font-bold">{pendingSubs.length} Queued</span>
                    </div>
                  )}
                </div>

                {isExpiringSoon && (
                  <div className="pt-3 border-t border-amber-200">
                    <p className="text-xs text-amber-700 font-semibold mb-2 flex items-center gap-1.5">
                      <TrendingUp size={12} />
                      Your plan is expiring soon! Renew now to continue.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-5 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                    <AlertCircle size={24} className="text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">No Active Subscription</h3>
                    <p className="text-xs text-gray-500">Purchase a plan to continue using the app</p>
                  </div>
                </div>
              </div>
            )}

            {/* Pending Subscriptions Queue */}
            {pendingSubs.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-3xl p-5 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={18} className="text-blue-600" />
                  <h3 className="font-bold text-gray-900">Queued Plans ({pendingSubs.length})</h3>
                </div>
                <div className="space-y-2">
                  {pendingSubs.map((sub, idx) => (
                    <div key={sub._id} className="flex items-center justify-between bg-white rounded-2xl p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900">{sub.planId?.name || "Plan"}</p>
                          <p className="text-xs text-gray-400 capitalize">{sub.billingType}</p>
                        </div>
                      </div>
                      <p className="text-xs font-bold text-blue-600">Pending</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  These plans will activate automatically when your current plan expires
                </p>
              </div>
            )}

            {/* Billing Toggle */}
            <div className="flex items-center bg-white border border-[#ffe4e4] p-1 rounded-2xl mb-6">
              {["monthly", "annual"].map(t => (
                <button
                  key={t}
                  onClick={() => setBillingType(t)}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-xl capitalize transition ${billingType === t ? "bg-[#800000] text-white shadow" : "text-gray-400"}`}
                >
                  {t === "annual" ? "Annual (Save 20%)" : "Monthly"}
                </button>
              ))}
            </div>

            {/* Free Trial Info */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-3xl p-5 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center shrink-0">
                  <Zap size={24} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                    🎉 Free Trial Available!
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    New admins get <span className="font-bold text-green-600">{freeTrialDays} days</span> of free trial automatically upon registration.
                  </p>
                  {!subscription && (
                    <button
                      onClick={async () => {
                        try {
                          const { data } = await api.post("/subscriptions/claim-trial");
                          await Swal.fire({
                            icon: "success",
                            title: "Free Trial Activated!",
                            text: `You now have ${freeTrialDays} days of free access to all features.`,
                            confirmButtonColor: "#800000",
                          });
                          loadData();
                        } catch (err) {
                          if (err.response?.status === 400) {
                            Swal.fire({
                              icon: "info",
                              title: "Already Have Subscription",
                              text: err.response?.data?.message || "You already have a subscription",
                            });
                          } else {
                            Swal.fire({
                              icon: "error",
                              title: "Error",
                              text: "Failed to activate free trial",
                            });
                          }
                        }
                      }}
                      className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-2xl text-sm transition active:scale-[0.98] shadow-md"
                    >
                      ⚡ Activate Free Trial Now
                    </button>
                  )}
                  {subscription && subscription.billingType === "free_trial" && (
                    <p className="text-xs text-green-600 font-bold mt-2">
                      ✅ Free trial is currently active!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Plans List */}
            {plans.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-[#ffe4e4]">
                <CreditCard size={32} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No plans available</p>
                <p className="text-gray-400 text-sm mt-1">Contact your administrator</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {plans.map((plan, i) => {
                    const color = planColors[i % planColors.length];
                    const Icon = planIcons[i % planIcons.length];
                    const price = billingType === "annual" ? plan.annualPrice : plan.monthlyPrice;
                    const isSelected = selected === plan._id;

                    return (
                      <div
                        key={plan._id}
                        onClick={() => setSelected(plan._id)}
                        className={`bg-white rounded-3xl p-5 border-2 cursor-pointer transition-all active:scale-[0.98] ${isSelected ? color.border + " shadow-lg" : "border-[#ffe4e4]"}`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 ${isSelected ? color.bg : color.light} rounded-2xl flex items-center justify-center`}>
                              <Icon size={20} className={isSelected ? "text-white" : color.text} />
                            </div>
                            <div>
                              <p className="font-extrabold text-gray-900">{plan.name}</p>
                              {plan.description && <p className="text-xs text-gray-400 mt-0.5">{plan.description}</p>}
                            </div>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${isSelected ? color.border + " " + color.bg : "border-gray-200"}`}>
                            {isSelected && <Check size={13} className="text-white" />}
                          </div>
                        </div>

                        <div className="flex items-end gap-1 mb-4">
                          <span className={`text-3xl font-extrabold ${isSelected ? color.text : "text-gray-900"}`}>₹{price}</span>
                          <span className="text-gray-400 text-sm mb-1">/{billingType === "annual" ? "year" : "month"}</span>
                        </div>

                        {plan.features?.length > 0 && (
                          <div className="space-y-2">
                            {plan.features.map((f, fi) => (
                              <div key={fi} className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${isSelected ? color.bg : "bg-gray-100"}`}>
                                  <Check size={9} className={isSelected ? "text-white" : "text-gray-400"} />
                                </div>
                                <p className="text-sm text-gray-600">{f}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Purchase Button */}
                <button
                  onClick={handlePurchase}
                  disabled={!selected || purchasing}
                  className="w-full bg-gradient-to-r from-[#800000] to-[#6b0000] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#800000]/30 transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                >
                  {purchasing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard size={18} />
                      Purchase Plan
                    </>
                  )}
                </button>
              </>
            )}

            {/* Help Note */}
            <div className="bg-white rounded-2xl border border-[#ffe4e4] p-4 text-center">
              <p className="text-sm text-gray-500">
                Need help? Contact your <span className="font-bold text-[#800000]">Super Admin</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">Plans can also be assigned by the administrator</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
