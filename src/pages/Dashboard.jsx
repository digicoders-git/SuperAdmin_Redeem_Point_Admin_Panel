import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Users, Receipt, Clock, Gift, Settings, Loader2, LayoutDashboard, QrCode, Copy, Check, Download, Bell } from "lucide-react";
import Swal from "sweetalert2";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { QRCodeCanvas } from "qrcode.react";
import SubscriptionWidget from "../components/SubscriptionWidget";

const P = "#800000";
const A = "#f97316";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, bills: 0, pendingBills: 0, approvedBills: 0, repeatedToday: 0, pointsRedeemed: 0, pendingRedemptions: 0, billsToday: 0, totalSale: 0, totalPointsIssued: 0 });
  const [chartData, setChartData] = useState({ users: [], repeated: [] });
  const [config, setConfig] = useState({ amountPerPoint: "" });
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [qrCopied, setQrCopied] = useState(false);
  const [billsHistoryOpen, setBillsHistoryOpen] = useState(false);
  const [billsByDate, setBillsByDate] = useState([]);
  const qrRef = useRef(null);
  const [admin, setAdmin] = useState(JSON.parse(localStorage.getItem("adminInfo") || "{}"));

  const registerUrl = admin?.shopId
    ? `${window.location.origin}/user/login?shopId=${admin.shopId}`
    : "";

  const copyQrLink = () => {
    navigator.clipboard.writeText(registerUrl);
    setQrCopied(true);
    setTimeout(() => setQrCopied(false), 2000);
  };

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;

    // Create a new canvas to add details
    const newCanvas = document.createElement("canvas");
    const ctx = newCanvas.getContext("2d");
    newCanvas.width = 400;
    newCanvas.height = 550;

    // White background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);

    // Add Shop Name
    ctx.fillStyle = "#1a0000";
    ctx.font = "bold 24px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(admin.shopName || "Our Shop", 200, 50);

    // Add Shop ID
    ctx.fillStyle = "#800000";
    ctx.font = "bold 14px Inter, sans-serif";
    ctx.fillText(admin.shopId || "", 200, 75);

    // Draw QR Code
    ctx.drawImage(canvas, 50, 100, 300, 300);

    // Add CTA
    ctx.fillStyle = "#666666";
    ctx.font = "medium 14px Inter, sans-serif";
    ctx.fillText("SCAN TO REGISTER & EARN POINTS", 200, 430);

    // Add Branding
    ctx.fillStyle = "#800000";
    ctx.font = "bold 16px Inter, sans-serif";
    ctx.fillText("Powered by Inaamify", 200, 480);
    
    ctx.fillStyle = "#aaaaaa";
    ctx.font = "12px Inter, sans-serif";
    ctx.fillText("Har Bill Par Inaam!", 200, 500);

    const a = document.createElement("a");
    a.href = newCanvas.toDataURL("image/png");
    a.download = `${admin?.shopId || "shop"}-qr.png`;
    a.click();
  };

  useEffect(() => {
    Promise.all([
      api.get("/users/admin/all"),
      api.get("/bills/admin/all"),
      api.get("/bills/admin/repeated-customers"),
      api.get("/bills/admin/point-config").catch(() => ({ data: {} })),
      api.get("/rewards/admin/redemptions").catch(() => ({ data: {} })),
    ]).then(([u, b, r, c, red]) => {
      const repeatedStats = r.data.dailyStats || [];
      const users = u.data.users || [];
      const bills = b.data.bills || [];
      const redemptions = red.data.redemptions || [];
      const pointsRedeemed = redemptions.filter(r => r.status !== "rejected").reduce((s, r) => s + (r.pointsUsed || 0), 0);
      const pendingRedemptions = redemptions.filter(r => r.status === "pending").length;
      
      const today = new Date().toDateString();
      const billsToday = bills.filter(b => new Date(b.createdAt).toDateString() === today).length;
      
      // Update admin info from localStorage in case it changed
      setAdmin(JSON.parse(localStorage.getItem("adminInfo") || "{}"));

      // Calculate bills by date
      const dateMap = {};
      bills.forEach(b => {
        const d = new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        dateMap[d] = (dateMap[d] || 0) + 1;
      });
      const sortedDates = Object.entries(dateMap).sort((a,b) => new Date(b[0]) - new Date(a[0])).map(([date, count]) => ({ date, count }));
      setBillsByDate(sortedDates);
      
      const totalSale = bills.filter(b => b.status === "approved").reduce((s, b) => s + (b.amount || 0), 0);
      const totalPointsIssued = bills.filter(b => b.status === "approved").reduce((s, b) => s + (b.pointsEarned || 0), 0);

      setStats({ 
        users: users.length, 
        bills: bills.length, 
        pendingBills: bills.filter((x) => x.status === "pending").length,
        approvedBills: bills.filter((x) => x.status === "approved").length,
        repeatedToday: r.data.repeatedCustomersToday || 0,
        pointsRedeemed,
        pendingRedemptions,
        billsToday,
        totalSale,
        totalPointsIssued
      });

      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const last7Days = [];
      for (let i = 6; i >= 0; i--) { 
        const d = new Date(); 
        d.setDate(d.getDate() - i); 
        last7Days.push({ date: d, name: days[d.getDay()] }); 
      }

      setChartData({
        users: last7Days.map(day => { 
          const e = new Date(day.date); 
          e.setHours(23,59,59,999); 
          return { name: day.name, value: users.filter(u => new Date(u.createdAt) <= e).length }; 
        }),
        repeated: repeatedStats.map(s => ({ name: s.name, value: s.value })),
      });
      if (c.data.pointSetting) setConfig({ amountPerPoint: c.data.pointSetting.amountPerPoint });
    }).catch(() => {}).finally(() => setPageLoading(false));
  }, []);

  const saveConfig = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await api.post("/bills/admin/point-config", { amountPerPoint: Number(config.amountPerPoint) }); Swal.fire({ icon: "success", title: "Saved!", timer: 1500, showConfirmButton: false }); }
    catch { Swal.fire({ icon: "error", title: "Failed", text: "Could not save config" }); }
    finally { setSaving(false); }
  };

  const cards = [
    { label: "Total Users", value: stats.users, icon: <Users size={22} />, bg: "bg-[#800000]/10", text: "text-[#800000]", border: "border-[#800000]/20", path: "/admin/users" },
    { label: "Total Sale", value: `₹${stats.totalSale}`, icon: <IndianRupee size={22} />, bg: "bg-blue-100", text: "text-blue-600", border: "border-blue-200", path: "/admin/bills" },
    { label: "Total Bills", value: stats.bills, icon: <Receipt size={22} />, bg: "bg-[#6b0000]/10", text: "text-[#6b0000]", border: "border-[#6b0000]/20", path: "/admin/bills" },
    { label: "Points Given", value: stats.totalPointsIssued, icon: <Coins size={22} />, bg: "bg-emerald-100", text: "text-emerald-600", border: "border-emerald-200", path: "/admin/users" },
    { label: "Pending Bills", value: stats.pendingBills, icon: <Clock size={22} />, bg: "bg-amber-100", text: "text-amber-600", border: "border-amber-200", path: "/admin/bills" },
    { label: "Points Redeemed", value: stats.pointsRedeemed, icon: <Gift size={22} />, bg: "bg-purple-100", text: "text-purple-600", border: "border-purple-200", path: "/admin/redemptions" },
    { label: "Pending Redeem", value: stats.pendingRedemptions, icon: <Clock size={22} />, bg: "bg-rose-100", text: "text-rose-600", border: "border-rose-200", path: "/admin/redemptions" },
  ];

  const inputCls = "w-full border-2 border-[#ffe4e4] bg-[#fff5f5] rounded-2xl px-5 py-3.5 text-[15px] font-semibold text-gray-800 focus:outline-none focus:border-[#800000]/50 transition-colors";
  const btnCls = "w-full bg-gradient-to-r from-[#800000] to-[#6b0000] text-white py-3.5 rounded-2xl text-[15px] font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition active:scale-[0.98] shadow-lg shadow-[#800000]/20";

  return (
    <div className="min-h-screen bg-[#fff5f5] font-sans pb-24">
      <div className="bg-gradient-to-br from-[#800000] to-[#6b0000] rounded-b-[40px] px-6 pt-10 pb-12 mb-6 relative overflow-hidden shadow-lg shadow-[#800000]/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-2xl tracking-wide mb-1">{admin.shopName || "Dashboard"}</h1>
            <p className="text-white/80 font-medium text-sm">Welcome, {admin.name || admin.adminId}</p>
          </div>
          <div className="flex gap-2">
            <div onClick={() => navigate("/admin/notifications")} className="bg-white/10 p-3 rounded-2xl border border-white/20 cursor-pointer active:scale-90 transition">
              <Bell className="text-white" size={24} />
            </div>
            <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
              <LayoutDashboard className="text-white" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="px-5">
        {pageLoading ? (
          <div className="flex justify-center items-center py-40">
            <Loader2 size={32} className="animate-spin text-[#800000]" />
          </div>
        ) : (
          <>
            {/* Subscription Widget */}
            <SubscriptionWidget />

            <div className="grid grid-cols-2 gap-4 mb-6">
              {cards.map((c) => (
                <div key={c.label} onClick={c.onClick || (() => navigate(c.path))} className={`rounded-3xl p-5 shadow-sm flex flex-col items-center justify-center text-center bg-white border ${c.border} cursor-pointer active:scale-[0.97] transition-transform`}>
                  <div className={`mb-3 w-12 h-12 rounded-2xl flex items-center justify-center ${c.bg} ${c.text}`}>{c.icon}</div>
                  <div className="text-2xl font-extrabold text-gray-900 leading-none mb-1">{c.value}</div>
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{c.label}</div>
                </div>
              ))}
            </div>

            {/* Customer Growth Chart */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#ffe4e4] p-6 mb-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-gray-900 font-bold text-base">Customer Growth</h3>
                  <p className="text-gray-400 text-xs mt-0.5">Users over last 7 days</p>
                </div>
                <span className="text-[#800000] font-black text-2xl">{stats.users}</span>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData.users} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} itemStyle={{ color: P, fontWeight: 700 }} />
                  <Line type="monotone" dataKey="value" stroke={P} strokeWidth={3} dot={{ r: 4, fill: P, stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Repeated Customers Chart */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#ffe4e4] p-6 mb-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-gray-900 font-bold text-base">Repeated Customers</h3>
                  <p className="text-gray-400 text-xs mt-0.5">Daily repeated visits last 7 days</p>
                </div>
                <span className="text-[#f97316] font-black text-2xl">{stats.repeatedToday}</span>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={chartData.repeated} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="repeated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={A} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={A} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} itemStyle={{ color: A, fontWeight: 700 }} />
                  <Area type="monotone" dataKey="value" stroke={A} strokeWidth={3} fill="url(#repeated)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* QR Code Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#ffe4e4] p-6 mb-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-[#ffe4e4] text-[#800000] p-1.5 rounded-xl"><QrCode size={17} /></div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{admin.shopName || "Your QR Code"}</h3>
                  <p className="text-[10px] text-[#800000] font-black uppercase tracking-widest">{admin.name}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{admin.shopId}</p>
                </div>
              </div>
              {admin?.shopId ? (
                <>
                  <div className="flex flex-col items-center bg-[#fff5f5] rounded-2xl p-5 mb-4" ref={qrRef}>
                    <QRCodeCanvas value={registerUrl} size={180} bgColor="#fff5f5" fgColor="#1a0000" level="H" includeMargin={false} />
                  </div>
                  <p className="text-xs text-gray-400 text-center mb-4">Display at your shop — customers scan to register &amp; earn points</p>
                  <div className="flex gap-3">
                    <button onClick={copyQrLink} className="flex-1 flex items-center justify-center gap-1.5 bg-[#ffe4e4] text-[#800000] py-3 rounded-2xl text-sm font-bold active:scale-95 transition">
                      {qrCopied ? <><Check size={15} /> Copied!</> : <><Copy size={15} /> Copy Link</>}
                    </button>
                    <button onClick={downloadQR} className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#800000] to-[#6b0000] text-white py-3 rounded-2xl text-sm font-bold active:scale-95 transition shadow-md shadow-[#800000]/20">
                      <Download size={15} /> Download
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center py-6 text-center">
                  <QrCode size={40} className="text-gray-200 mb-3" />
                  <p className="text-gray-500 text-sm font-medium">Shop ID not assigned yet</p>
                  <p className="text-gray-400 text-xs mt-1">Contact SuperAdmin to get your Shop ID</p>
                </div>
              )}
            </div>

            {/* Point Config */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#ffe4e4] p-6 mb-4">
              <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                <div className="bg-[#ffe4e4] text-[#800000] p-1.5 rounded-xl"><Settings size={17} /></div>
                Point Configuration
              </h3>
              <p className="text-xs text-gray-400 mb-4 ml-9">Set how many ₹ = 1 Point</p>
              <form onSubmit={saveConfig} className="flex flex-col gap-3">
                <input type="number" placeholder="e.g. 100" value={config.amountPerPoint} onChange={(e) => setConfig({ amountPerPoint: e.target.value })} required className={inputCls} />
                <button type="submit" disabled={saving} className={btnCls}>{saving && <Loader2 size={16} className="animate-spin" />} Save</button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* Date-wise Bills Modal */}
      {billsHistoryOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6 backdrop-blur-sm" onClick={() => setBillsHistoryOpen(false)}>
          <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-[#800000] to-[#6b0000] p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">Bill History</h3>
                <p className="text-white/60 text-xs">Total {stats.bills} uploads</p>
              </div>
              <button onClick={() => setBillsHistoryOpen(false)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
                <LayoutDashboard size={20} />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
              {billsByDate.length === 0 ? (
                <p className="text-center text-gray-400 py-8 text-sm">No bills yet</p>
              ) : (
                billsByDate.map((item) => (
                  <div key={item.date} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-sm font-bold text-gray-700">{item.date}</span>
                    <span className="bg-[#ffe4e4] text-[#800000] px-3 py-1 rounded-full text-xs font-black">{item.count} Bills</span>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-gray-100">
              <button onClick={() => setBillsHistoryOpen(false)} className="w-full py-3.5 rounded-2xl bg-gray-100 text-gray-600 font-bold text-sm active:scale-95 transition">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
