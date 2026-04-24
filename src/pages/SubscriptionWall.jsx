import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { CreditCard, Check, Loader2, LogOut, Zap, Shield, Star, Clock, CheckCircle2 } from "lucide-react";
import Swal from "sweetalert2";

export default function SubscriptionWall() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [billingType, setBillingType] = useState("monthly");
  const [subscription, setSubscription] = useState(null);
  const [pendingSubs, setPendingSubs] = useState([]);
  const [freeTrialDays, setFreeTrialDays] = useState(7);
  const [activatingTrial, setActivatingTrial] = useState(false);
  const admin = JSON.parse(localStorage.getItem("adminInfo") || "{}");

  useEffect(() => {
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
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const getDaysRemaining = (endDate) => {
    const days = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const showQueuedPlanDetails = (sub) => {
    const price = sub.billingType === "annual" ? sub.planId?.annualPrice : sub.planId?.monthlyPrice;
    Swal.fire({
      title: sub.planId?.name || "Plan Details",
      html: `
        <div class="text-left space-y-3">
          <div class="bg-gray-50 rounded-lg p-3">
            <p class="text-xs text-gray-500 mb-1">Plan Type</p>
            <p class="font-bold text-gray-900 capitalize">${sub.billingType}</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-3">
            <p class="text-xs text-gray-500 mb-1">Price</p>
            <p class="font-bold text-gray-900">₹${price} / ${sub.billingType === "annual" ? "year" : "month"}</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-3">
            <p class="text-xs text-gray-500 mb-1">Status</p>
            <p class="font-bold text-amber-600">Pending Activation</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-3">
            <p class="text-xs text-gray-500 mb-1">Purchased On</p>
            <p class="font-bold text-gray-900">${formatDate(sub.createdAt)}</p>
          </div>
          ${sub.planId?.description ? `
            <div class="bg-gray-50 rounded-lg p-3">
              <p class="text-xs text-gray-500 mb-1">Description</p>
              <p class="text-sm text-gray-700">${sub.planId.description}</p>
            </div>
          ` : ""}
          ${sub.planId?.features?.length > 0 ? `
            <div class="bg-gray-50 rounded-lg p-3">
              <p class="text-xs text-gray-500 mb-2">Features</p>
              <ul class="space-y-1">
                ${sub.planId.features.map(f => `<li class="text-sm text-gray-700 flex items-center gap-2"><span class="text-green-500">✓</span> ${f}</li>`).join("")}
              </ul>
            </div>
          ` : ""}
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <p class="text-xs text-blue-600">ℹ️ This plan will automatically activate when your current plan expires.</p>
          </div>
        </div>
      `,
      confirmButtonText: "Got it",
      confirmButtonColor: "#800000",
      width: "90%",
      customClass: {
        popup: "rounded-3xl",
      }
    });
  };

  const handleActivateFreeTrial = async () => {
    setActivatingTrial(true);
    try {
      await api.post("/subscriptions/claim-trial");
      await Swal.fire({
        icon: "success",
        title: "Free Trial Activated!",
        text: `Your ${freeTrialDays}-day free trial has been activated successfully.`,
        confirmButtonColor: "#800000",
      });
      
      // Refresh subscription data
      const subRes = await api.get("/subscriptions/my");
      setSubscription(subRes.data.subscription);
      setPendingSubs(subRes.data.pendingSubscriptions || []);
      
      // Redirect to dashboard
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Activation Failed",
        text: err.response?.data?.message || "Failed to activate free trial",
      });
    } finally {
      setActivatingTrial(false);
    }
  };

  const handlePurchase = async () => {
    if (!selected) {
      Swal.fire({ icon: "warning", title: "Select a Plan", text: "Please select a plan to continue" });
      return;
    }

    setPurchasing(true);
    try {
      // Create order
      const { data } = await api.post("/subscriptions/create-order", {
        planId: selected,
        billingType,
      });

      console.log("Order created:", data);

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded. Please refresh the page.");
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Redeem System",
        description: `${data.plan.name} - ${billingType === "annual" ? "Annual" : "Monthly"} Plan`,
        order_id: data.order.id,
        handler: async (response) => {
          try {
            console.log("Payment response:", response);
            const verifyRes = await api.post("/subscriptions/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: selected,
              billingType,
            });

            console.log("Verification response:", verifyRes.data);

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
                text: "Your plan has been activated. Redirecting to dashboard...",
                timer: 2000,
                showConfirmButton: false,
              });
              navigate("/admin/dashboard", { replace: true });
            }

            // Refresh subscription data
            const subRes = await api.get("/subscriptions/my");
            setSubscription(subRes.data.subscription);
            setPendingSubs(subRes.data.pendingSubscriptions || []);
          } catch (err) {
            console.error("Verification error:", err);
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
        modal: {
          ondismiss: () => {
            console.log("Payment modal dismissed");
            setPurchasing(false);
          }
        }
      };

      console.log("Opening Razorpay with options:", options);
      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", (response) => {
        console.error("Payment failed:", response);
        Swal.fire({
          icon: "error",
          title: "Payment Failed",
          text: response.error?.description || "Payment failed. Please try again.",
        });
        setPurchasing(false);
      });
      razorpay.open();
    } catch (err) {
      console.error("Order creation error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || err.message || "Failed to create order",
      });
      setPurchasing(false);
    }
  };

  const planIcons = [Zap, Star, Shield];
  const planColors = [
    { bg: "bg-[#800000]", light: "bg-[#ffe4e4]", text: "text-[#800000]", border: "border-[#800000]" },
    { bg: "bg-[#6b0000]", light: "bg-[#fff0e0]", text: "text-[#f97316]", border: "border-[#f97316]" },
    { bg: "bg-[#1a0000]", light: "bg-[#f0fff4]", text: "text-emerald-600", border: "border-emerald-500" },
  ];

  return (
    <div className="min-h-screen bg-[#fff5f5] font-sans pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#800000] to-[#6b0000] px-6 pt-12 pb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
              <CreditCard size={20} className="text-white" />
            </div>
            <button onClick={logout} className="flex items-center gap-1.5 bg-white/10 border border-white/20 text-white text-xs font-bold px-3 py-2 rounded-xl">
              <LogOut size={13} /> Logout
            </button>
          </div>
          <h1 className="text-white font-extrabold text-2xl mb-1">Subscription Plans</h1>
          <p className="text-white/70 text-sm">Hey {admin.name || admin.adminId}, choose a plan to continue.</p>
        </div>
      </div>

      <div className="px-5 py-6">
        {/* Current Subscription */}
        {subscription && (
          <div className="bg-white rounded-3xl border border-[#ffe4e4] p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={18} className="text-green-500" />
              <h3 className="font-bold text-gray-900">Current Plan</h3>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-extrabold text-[#800000]">
                  {subscription.billingType === "free_trial" ? "Free Trial" : subscription.planId?.name || "Active Plan"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Expires on {formatDate(subscription.endDate)}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-[#800000]">{getDaysRemaining(subscription.endDate)}</p>
                <p className="text-[10px] text-gray-400 uppercase font-bold">Days Left</p>
              </div>
            </div>
          </div>
        )}

        {/* Pending Subscriptions Queue */}
        {pendingSubs.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={18} className="text-amber-600" />
              <h3 className="font-bold text-gray-900">Queued Plans ({pendingSubs.length})</h3>
            </div>
            <div className="space-y-2">
              {pendingSubs.map((sub, idx) => (
                <button
                  key={sub._id}
                  onClick={() => showQueuedPlanDetails(sub)}
                  className="w-full flex items-center justify-between bg-white rounded-2xl p-3 hover:bg-gray-50 transition active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm text-gray-900">{sub.planId?.name || "Plan"}</p>
                      <p className="text-xs text-gray-400 capitalize">{sub.billingType} • ₹{sub.billingType === "annual" ? sub.planId?.annualPrice : sub.planId?.monthlyPrice}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-amber-600">Pending</p>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">These plans will activate automatically when your current plan expires</p>
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

        {/* Free Trial Info & Activation */}
        {!subscription && !loading && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-3xl p-5 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center shrink-0">
                <Zap size={24} className="text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                  🎉 Free Trial Available!
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Get <span className="font-bold text-green-600">{freeTrialDays} days</span> of free trial to explore all features.
                </p>
                <p className="text-xs text-gray-500">
                  No credit card required. Start using all features immediately!
                </p>
              </div>
            </div>
            <button
              onClick={handleActivateFreeTrial}
              disabled={activatingTrial}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-green-600/30 transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {activatingTrial ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Activating...
                </>
              ) : (
                <>
                  <Zap size={18} />
                  Activate Free Trial Now
                </>
              )}
            </button>
          </div>
        )}

        {/* Free Trial Info (when already active) */}
        {subscription && subscription.billingType === "free_trial" && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-3xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center shrink-0">
                <CheckCircle2 size={24} className="text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                  ✅ Free Trial Active!
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                  You have <span className="font-bold text-green-600">{getDaysRemaining(subscription.endDate)} days</span> remaining in your free trial.
                </p>
                <p className="text-xs text-gray-500">
                  Purchase a plan below to continue after trial expires.
                </p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={30} className="animate-spin text-[#800000]" />
          </div>
        ) : plans.length === 0 ? (
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

        {/* Contact note */}
        <div className="bg-white rounded-2xl border border-[#ffe4e4] p-4 text-center">
          <p className="text-sm text-gray-500">Need help? Contact your <span className="font-bold text-[#800000]">Super Admin</span></p>
          <p className="text-xs text-gray-400 mt-1">Plans can also be assigned by the administrator</p>
        </div>
      </div>
    </div>
  );
}
