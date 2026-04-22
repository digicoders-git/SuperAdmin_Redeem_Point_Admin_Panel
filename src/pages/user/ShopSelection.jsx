import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Store, Loader2, ChevronRight, LogOut, Gift } from "lucide-react";
import Swal from "sweetalert2";

export default function ShopSelection() {
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

  useEffect(() => {
    api.get("/users/shops")
      .then(({ data }) => setShops(data.shops))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const selectShop = async (shop) => {
    try {
      // Call backend to switch shop and get new token
      const { data } = await api.post("/users/switch-shop", { userId: shop.userId });
      
      // Update localStorage with new token and user info
      localStorage.setItem("userToken", data.token);
      localStorage.setItem("userInfo", JSON.stringify(data.user));
      localStorage.setItem("selectedShop", JSON.stringify(shop));
      
      setTimeout(() => {
        window.location.href = "/user/bills";
      }, 100);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to switch shop",
      });
    }
  };

  const logout = async () => {
    const res = await Swal.fire({
      title: "Logout?",
      text: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout",
      confirmButtonColor: "#ef4444",
    });
    if (!res.isConfirmed) return;
    localStorage.clear();
    window.location.href = "/user/login";
  };

  return (
    <div className="min-h-screen bg-[#fff5f5] font-sans">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#800000] to-[#6b0000] px-6 pt-12 pb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
              <Store size={24} className="text-white" />
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 bg-white/10 border border-white/20 text-white text-xs font-bold px-3 py-2 rounded-xl"
            >
              <LogOut size={13} /> Logout
            </button>
          </div>
          <h1 className="text-white font-extrabold text-2xl mb-1">Select Shop</h1>
          <p className="text-white/70 text-sm">Hey {userInfo.name}, choose a shop to continue</p>
        </div>
      </div>

      <div className="px-5 py-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-5 border border-[#ffe4e4] shadow-sm animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-32 bg-gray-100 rounded-lg" />
                    <div className="h-3 w-24 bg-gray-50 rounded-full" />
                  </div>
                  <div className="w-8 h-8 bg-gray-100 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : shops.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="w-20 h-20 bg-[#ffe4e4] rounded-3xl flex items-center justify-center">
              <Store size={32} className="text-[#800000]" />
            </div>
            <div className="text-center">
              <p className="text-gray-900 font-bold text-lg mb-1">No Shops Found</p>
              <p className="text-gray-400 text-sm">You haven't registered with any shop yet</p>
            </div>
            <button
              onClick={() => window.location.href = "/user/login"}
              className="bg-gradient-to-r from-[#800000] to-[#6b0000] text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-[#800000]/30 transition active:scale-[0.98] flex items-center gap-2"
            >
              <Gift size={18} />
              Register with a Shop
            </button>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-5 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0">
                  <Store size={24} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">Multiple Shops Detected</h3>
                  <p className="text-sm text-gray-600">
                    You're registered with {shops.length} shop{shops.length > 1 ? "s" : ""}. Select one to view your bills and rewards.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {shops.map((shop) => (
                <button
                  key={shop.userId}
                  onClick={() => selectShop(shop)}
                  className="w-full bg-white rounded-3xl p-5 border-2 border-[#ffe4e4] shadow-sm transition-all active:scale-[0.98] hover:border-[#800000]/30 hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#800000] to-[#6b0000] rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-[#800000]/20">
                      <span className="text-white font-extrabold text-lg">
                        {(shop.adminName || shop.shopId)[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-extrabold text-gray-900 text-base">{shop.adminName || "Unknown Shop"}</p>
                      <p className="text-xs text-[#800000] font-semibold mt-0.5">{shop.shopId}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Registered on {new Date(shop.registeredAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-[#ffe4e4] rounded-full flex items-center justify-center shrink-0">
                      <ChevronRight size={20} className="text-[#800000]" />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-[#ffe4e4] p-4 text-center mt-6">
              <p className="text-sm text-gray-500">
                Want to register with another shop?{" "}
                <button onClick={() => window.location.href = "/user/login"} className="font-bold text-[#800000] hover:underline">
                  Register Now
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
