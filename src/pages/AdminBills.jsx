import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Info, CheckCircle, XCircle, Loader2, FileText, IndianRupee, ChevronDown, ChevronUp, Download } from "lucide-react";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

export default function AdminBills() {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [reason, setReason] = useState({});
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [editBill, setEditBill] = useState(null);
  const [editForm, setEditForm] = useState({ amount: "", pointsEarned: "", editReason: "" });
  const [updating, setUpdating] = useState(false);
  const serverBase = import.meta.env.VITE_IMAGE_URL || import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "").replace(/\/$/, "") || "";
  const getBillUrl = (path) => {
    if (!path || path === "manual_adjustment") return null;
    if (path.startsWith("http")) return path;

    // Normalize slashes
    let cleanPath = path.replace(/\\/g, "/");

    // Aggressively find the 'uploads' part and take everything after it
    const uploadsIndex = cleanPath.toLowerCase().indexOf("uploads/");
    if (uploadsIndex !== -1) {
      cleanPath = cleanPath.substring(uploadsIndex + 8); // Skip 'uploads/'
    } else {
      cleanPath = cleanPath.replace(/^\/+/, "");
    }

    return `${serverBase}/uploads/${cleanPath}`;
  };

  const load = () => {
    setLoading(true);
    api.get("/bills/admin/all", { params: filter !== "all" ? { status: filter } : {} })
      .then(({ data }) => setBills(data.bills || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const isPdf = (url) => url?.toLowerCase().includes(".pdf");

  const users = useMemo(() => {
    const map = {};
    bills.forEach((b) => { if (b.userId?._id) map[b.userId._id] = b.userId; });
    return Object.values(map);
  }, [bills]);

  const filtered = bills.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch = !q || b.billName?.toLowerCase().includes(q) || b.billNumber?.toLowerCase().includes(q) || b.userId?.name?.toLowerCase().includes(q) || b.userId?.mobile?.includes(q);
    const billDate = new Date(b.date || b.createdAt);
    const matchFrom = !dateFrom || billDate >= new Date(dateFrom);
    const matchTo = !dateTo || billDate <= new Date(dateTo + "T23:59:59");
    const matchUser = !selectedUser || b.userId?._id === selectedUser;
    const matchMin = !minAmount || b.amount >= Number(minAmount);
    const matchMax = !maxAmount || b.amount <= Number(maxAmount);
    return matchSearch && matchFrom && matchTo && matchUser && matchMin && matchMax;
  });

  const approve = async (id, e) => {
    e.stopPropagation();
    const res = await Swal.fire({ title: "Approve Bill?", icon: "question", showCancelButton: true, confirmButtonText: "Yes, Approve", confirmButtonColor: "#22c55e" });
    if (!res.isConfirmed) return;
    setActionId(id);
    await api.patch(`/bills/admin/${id}/approve`);
    setActionId(null);
    Swal.fire({ icon: "success", title: "Approved!", timer: 1200, showConfirmButton: false });
    load();
  };

  const reject = async (id, e) => {
    e.stopPropagation();
    const res = await Swal.fire({ title: "Reject Bill?", icon: "warning", showCancelButton: true, confirmButtonText: "Yes, Reject", confirmButtonColor: "#ef4444" });
    if (!res.isConfirmed) return;
    setActionId(id);
    await api.patch(`/bills/admin/${id}/reject`, { rejectionReason: reason[id] || "Not specified" });
    setActionId(null);
    Swal.fire({ icon: "info", title: "Rejected", timer: 1200, showConfirmButton: false });
    load();
  };

  const handleEdit = (bill, e) => {
    e.stopPropagation();
    setEditBill(bill);
    setEditForm({ 
      amount: bill.amount, 
      pointsEarned: bill.pointsEarned, 
      editReason: bill.adminNote || "" 
    });
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editForm.editReason.trim()) {
      Swal.fire({ icon: "error", title: "Reason Required", text: "Please provide a reason for editing the bill." });
      return;
    }
    setUpdating(true);
    try {
      await api.patch(`/bills/admin/${editBill._id}/edit-amount`, editForm);
      Swal.fire({ icon: "success", title: "Bill Updated!", timer: 1500, showConfirmButton: false });
      setEditBill(null);
      load();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Update Failed", text: err.response?.data?.message || "Failed to update bill" });
    } finally {
      setUpdating(false);
    }
  };

  const statusStyle = {
    pending: "bg-amber-100 text-amber-600 border-amber-200",
    approved: "bg-green-100 text-green-600 border-green-200",
    rejected: "bg-red-100 text-red-500 border-red-200",
  };

  const exportToExcel = () => {
    const data = filtered.map((b) => ({
      "Bill Number": b.billNumber,
      "Bill Name": b.billName,
      Amount: b.amount,
      Status: b.status,
      "User Name": b.userId?.name || "N/A",
      "User Mobile": b.userId?.mobile || "N/A",
      "Points Earned": b.pointsEarned || 0,
      Date: new Date(b.date || b.createdAt).toLocaleDateString(),
      "Rejection Reason": b.rejectionReason || "N/A",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bills");
    XLSX.writeFile(wb, `Bills_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-[#fff5f5] font-sans pb-24">
      <div className="bg-[#800000] rounded-b-[32px] px-5 pt-10 pb-10 mb-5 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-xl tracking-wide mb-0.5">Bills Log</h1>
            <p className="text-white/70 text-sm">Review Uploads</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportToExcel}
              disabled={filtered.length === 0}
              className="bg-white/10 p-3 rounded-2xl border border-white/20 hover:bg-white/20 transition disabled:opacity-50"
            >
              <Download className="text-white" size={20} />
            </button>
            <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
              <IndianRupee className="text-white" size={22} />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
          <input placeholder="Search by name, bill no, user..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full border-2 border-gray-100 bg-[#fff5f5] rounded-xl px-4 py-2.5 text-sm mb-3 focus:outline-none focus:border-[#800000]/30" />
          <button onClick={() => setShowFilters(!showFilters)} className="w-full flex items-center justify-between px-4 py-2.5 bg-[#fff5f5] rounded-xl text-sm font-semibold text-gray-600 border-2 border-gray-100">
            <span>Advanced Filters</span>
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showFilters && (
            <div className="mt-3 space-y-3">
              <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="w-full border-2 border-gray-100 bg-[#F5F7FA] rounded-xl px-4 py-2.5 text-sm focus:outline-none">
                <option value="">All Users</option>
                {users.map((u) => <option key={u._id} value={u._id}>{u.name || u.mobile}{u.mobile ? ` • ${u.mobile}` : ""}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="Min ₹" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} className="border-2 border-gray-100 bg-[#F5F7FA] rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
                <input type="number" placeholder="Max ₹" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} className="border-2 border-gray-100 bg-[#F5F7FA] rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border-2 border-gray-100 bg-[#F5F7FA] rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border-2 border-gray-100 bg-[#F5F7FA] rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
          {["all", "pending", "approved", "rejected"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-xs font-bold capitalize whitespace-nowrap shrink-0 transition-colors ${filter === f ? "bg-[#800000] text-white shadow-md" : "bg-white text-gray-500 border border-gray-200"}`}>{f}</button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3 animate-in fade-in duration-500">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 animate-pulse">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="space-y-2 flex-1">
                    <div className="h-6 w-16 bg-gray-100 rounded-lg" />
                    <div className="h-4 w-32 bg-gray-100 rounded-lg" />
                    <div className="h-3 w-24 bg-gray-50 rounded-full" />
                  </div>
                  <div className="h-6 w-16 bg-gray-100 rounded-full" />
                </div>
                <div className="h-[128px] w-full bg-gray-50 rounded-xl mt-3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No bills found</p>}
            {filtered.map((b) => (
              <div key={b._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 cursor-pointer active:scale-[0.99] transition-transform" onClick={() => navigate(`/admin/bills/${b._id}`, { state: { bill: b } })}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-[#800000] text-lg leading-tight">₹{b.amount}</p>
                    <p className="text-sm text-gray-800 font-semibold truncate mt-0.5">{b.billName}</p>
                    <p className="text-xs text-gray-400 truncate">#{b.billNumber}</p>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize border shrink-0 ${statusStyle[b.status]}`}>{b.status}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span className="font-medium truncate max-w-[60%]">{b.userId?.name || "User"} • {b.userId?.mobile}</span>
                  <span className="text-gray-400 shrink-0">{new Date(b.date || b.createdAt).toLocaleDateString()}</span>
                </div>

                {b.billImage && !isPdf(b.billImage) && b.billImage !== "manual_adjustment" && <img src={getBillUrl(b.billImage)} alt="bill" className="w-full h-32 object-cover rounded-xl mb-3 border border-gray-100" onError={(e) => { e.target.style.display = "none"; }} />}
                {b.billImage === "manual_adjustment" && (
                  <div className="flex items-center gap-2 bg-emerald-50 rounded-xl px-3 py-2.5 mb-3 border border-emerald-100">
                    <Coins size={18} className="text-emerald-500 shrink-0" />
                    <span className="text-xs font-semibold text-emerald-700">Manual Points Adjustment</span>
                  </div>
                )}
                {b.billImage && isPdf(b.billImage) && (
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 mb-3 border border-gray-100">
                    <FileText size={18} className="text-red-400 shrink-0" />
                    <span className="text-xs font-semibold text-gray-600">PDF Document</span>
                  </div>
                )}

                {b.rejectionReason && (
                  <p className="text-xs text-red-500 mb-3 flex items-start gap-1.5 bg-red-50 px-3 py-2 rounded-xl border border-red-100 font-medium">
                    <Info size={13} className="shrink-0 mt-0.5" /> <span className="break-words">{b.rejectionReason}</span>
                  </p>
                )}

                {b.status === "pending" && (
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 mt-1" onClick={(e) => e.stopPropagation()}>
                    <input placeholder="Rejection reason (optional)" value={reason[b._id] || ""} onChange={(e) => setReason({ ...reason, [b._id]: e.target.value })} className="w-full border-2 border-white bg-white rounded-xl px-3 py-2.5 text-xs mb-2.5 focus:outline-none focus:border-red-200" />
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={(e) => approve(b._id, e)} disabled={actionId === b._id} className="bg-green-500 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-60 active:scale-95">
                        {actionId === b._id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} Approve
                      </button>
                      <button onClick={(e) => reject(b._id, e)} disabled={actionId === b._id} className="bg-red-500 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-60 active:scale-95">
                        {actionId === b._id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />} Reject
                      </button>
                    </div>
                  </div>
                )}

                {b.pointsEarned > 0 && <div className="inline-flex items-center gap-1 bg-orange-50 text-orange-500 font-bold px-3 py-1.5 rounded-lg text-xs mt-3">+{b.pointsEarned} points awarded</div>}
                
                <div className="flex justify-end mt-3 border-t border-gray-50 pt-3">
                  <button 
                    onClick={(e) => handleEdit(b, e)} 
                    className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-100 transition"
                  >
                    Edit Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editBill && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center px-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="font-black text-gray-900 text-xl mb-1">Edit Bill Details</h3>
            <p className="text-xs text-gray-400 font-medium mb-6">User: {editBill.userId?.name || "Customer"}</p>
            
            <form onSubmit={submitEdit} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">Bill Amount (₹)</label>
                <input 
                  type="number" 
                  value={editForm.amount} 
                  onChange={(e) => setEditForm({...editForm, amount: e.target.value})} 
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold focus:border-blue-400 focus:outline-none transition" 
                  required 
                />
              </div>
              
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">Points Earned</label>
                <input 
                  type="number" 
                  value={editForm.pointsEarned} 
                  onChange={(e) => setEditForm({...editForm, pointsEarned: e.target.value})} 
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold focus:border-blue-400 focus:outline-none transition" 
                  required 
                />
                <p className="text-[10px] text-gray-400 mt-1.5 ml-1 italic">* Updating points will adjust user's wallet automatically</p>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">Reason for Edit</label>
                <textarea 
                  placeholder="e.g. Corrected amount, manual bonus..."
                  value={editForm.editReason} 
                  onChange={(e) => setEditForm({...editForm, editReason: e.target.value})} 
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-medium focus:border-blue-400 focus:outline-none transition h-24 resize-none" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setEditBill(null)} 
                  className="bg-gray-100 text-gray-600 font-bold py-3.5 rounded-2xl text-sm transition active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={updating}
                  className="bg-blue-600 text-white font-bold py-3.5 rounded-2xl text-sm shadow-lg shadow-blue-200 transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {updating ? <Loader2 size={18} className="animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}` }} />
    </div>
  );
}
