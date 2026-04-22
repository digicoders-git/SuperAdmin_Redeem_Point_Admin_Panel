import { useState, useEffect, useMemo } from "react";
import api from "../api/axios";
import { Coins, Loader2, Users as UsersIcon, Search, X, Download, MoreVertical, Filter, ChevronDown, Plus } from "lucide-react";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default"); // default, topPurchase
  const [sortOrder, setSortOrder] = useState("desc"); // asc, desc
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [pointsModal, setPointsModal] = useState(null);
  const [pointsInput, setPointsInput] = useState("");
  const [pointsReason, setPointsReason] = useState("");
  const [addingPoints, setAddingPoints] = useState(false);

  const load = () => {
    setLoading(true);
    api.get("/users/admin/all")
      .then(({ data }) => setUsers(data.users || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let result = users.filter((u) => {
      const matchSearch =
        !search ||
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.mobile?.includes(search);
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && u.isActive) ||
        (statusFilter === "inactive" && !u.isActive);
      return matchSearch && matchStatus;
    });

    // Sort by top purchase
    if (sortBy === "topPurchase") {
      result = result.sort((a, b) => {
        const diff = (b.totalPurchase || 0) - (a.totalPurchase || 0);
        return sortOrder === "desc" ? diff : -diff;
      });
    } else {
      // Sort by registration date (default)
      result = result.sort((a, b) => {
        const diff = new Date(b.createdAt) - new Date(a.createdAt);
        return sortOrder === "desc" ? diff : -diff;
      });
    }

    return result;
  }, [users, search, statusFilter, sortBy, sortOrder]);

  const addPoints = async () => {
    if (!pointsInput || Number(pointsInput) <= 0) return;
    setAddingPoints(true);
    try {
      const { data } = await api.patch(`/users/admin/${pointsModal._id}/add-points`, { points: Number(pointsInput), reason: pointsReason || "Manual adjustment by admin" });
      setUsers((prev) => prev.map((u) => u._id === pointsModal._id ? { ...u, walletPoints: data.walletPoints } : u));
      setPointsModal(null);
      setPointsInput("");
      setPointsReason("");
      Swal.fire({ icon: "success", title: `${pointsInput} Points Added!`, text: `${pointsModal.name} ka wallet update ho gaya`, timer: 1800, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed", text: err.response?.data?.message || "Could not add points" });
    } finally {
      setAddingPoints(false);
    }
  };

  const toggle = async (user) => {
    setDropdownOpen(null);
    const action = user.isActive ? "Deactivate" : "Activate";
    const res = await Swal.fire({ title: `${action} User?`, icon: "question", showCancelButton: true, confirmButtonText: `Yes, ${action}`, confirmButtonColor: user.isActive ? "#ef4444" : "#22c55e" });
    if (!res.isConfirmed) return;
    setActionId(user._id);
    await api.patch(`/users/admin/${user._id}/status`, { isActive: !user.isActive });
    setActionId(null);
    Swal.fire({ icon: "success", title: `User ${action}d!`, timer: 1200, showConfirmButton: false });
    load();
  };

  const remove = async (id) => {
    setDropdownOpen(null);
    const res = await Swal.fire({ title: "Delete User?", text: "This cannot be undone!", icon: "warning", showCancelButton: true, confirmButtonText: "Yes, Delete", confirmButtonColor: "#ef4444" });
    if (!res.isConfirmed) return;
    setActionId(id);
    await api.delete(`/users/admin/${id}`);
    setActionId(null);
    Swal.fire({ icon: "success", title: "Deleted!", timer: 1200, showConfirmButton: false });
    load();
  };

  const statusTabs = [
    { id: "all", label: "All", count: users.length },
    { id: "active", label: "Active", count: users.filter((u) => u.isActive).length },
    { id: "inactive", label: "Inactive", count: users.filter((u) => !u.isActive).length },
  ];

  const getFilterLabel = () => {
    const statusLabel = statusFilter === "all" ? "All" : statusFilter === "active" ? "Active" : "Inactive";
    const sortLabel = sortBy === "default" ? "Registration" : "Top Purchase";
    const orderLabel = sortOrder === "desc" ? "↓" : "↑";
    return `${statusLabel} • ${sortLabel} ${orderLabel}`;
  };

  const exportToExcel = () => {
    const data = filtered.map((u) => ({
      Name: u.name,
      Mobile: u.mobile,
      "Wallet Points": u.walletPoints || 0,
      "Total Purchase": u.totalPurchase || 0,
      Status: u.isActive ? "Active" : "Inactive",
      "Registered On": new Date(u.createdAt).toLocaleDateString(),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, `Users_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-[#fff5f5] font-sans pb-24">
      {/* Header */}
      <div className="bg-[#800000] rounded-b-[40px] px-6 pt-10 pb-12 mb-6 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-2xl tracking-wide mb-1">Users List</h1>
            <p className="text-white/80 font-medium text-sm">
              Showing {filtered.length} of {users.length}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportToExcel}
              disabled={filtered.length === 0}
              className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/20 hover:bg-white/20 transition disabled:opacity-50"
            >
              <Download className="text-white" size={20} />
            </button>
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/20">
              <UsersIcon className="text-white" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="px-5">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-2xl pl-10 pr-10 py-3 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#800000]/20"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={15} />
            </button>
          )}
        </div>

        {/* Filter Dropdown Button */}
        <div className="relative mb-5">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="w-full bg-white border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-700 shadow-sm hover:border-[#800000]/30 transition flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-[#800000]" />
              <span>{getFilterLabel()}</span>
            </div>
            <ChevronDown size={16} className={`text-gray-400 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Filter Dropdown */}
          {filterOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-20 space-y-4">
                {/* Status Filter */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Status</p>
                  <div className="grid grid-cols-3 gap-2">
                    {statusTabs.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setStatusFilter(t.id)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all ${
                          statusFilter === t.id
                            ? "bg-[#800000] text-white shadow-md"
                            : "bg-gray-50 text-gray-500 border border-gray-200"
                        }`}
                      >
                        {t.label}
                        <span className={`ml-1 text-[10px] ${
                          statusFilter === t.id ? "opacity-70" : "opacity-50"
                        }`}>
                          ({t.count})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Sort By</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSortBy("default")}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                        sortBy === "default"
                          ? "bg-[#800000] text-white shadow-md"
                          : "bg-gray-50 text-gray-500 border border-gray-200"
                      }`}
                    >
                      Registration
                    </button>
                    <button
                      onClick={() => setSortBy("topPurchase")}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                        sortBy === "topPurchase"
                          ? "bg-[#800000] text-white shadow-md"
                          : "bg-gray-50 text-gray-500 border border-gray-200"
                      }`}
                    >
                      Top Purchase
                    </button>
                  </div>
                </div>

                {/* Order */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Order</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSortOrder("desc")}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                        sortOrder === "desc"
                          ? "bg-blue-500 text-white shadow-md"
                          : "bg-gray-50 text-gray-500 border border-gray-200"
                      }`}
                    >
                      ↓ Descending
                    </button>
                    <button
                      onClick={() => setSortOrder("asc")}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                        sortOrder === "asc"
                          ? "bg-blue-500 text-white shadow-md"
                          : "bg-gray-50 text-gray-500 border border-gray-200"
                      }`}
                    >
                      ↑ Ascending
                    </button>
                  </div>
                </div>

                {/* Apply Button */}
                <button
                  onClick={() => setFilterOpen(false)}
                  className="w-full bg-gradient-to-r from-[#800000] to-[#6b0000] text-white font-bold py-3 rounded-xl shadow-lg shadow-[#800000]/20 transition active:scale-[0.98]"
                >
                  Apply Filters
                </button>
              </div>
            </>
          )}
        </div>

        {/* Users List */}
        {loading ? (
          <div className="space-y-4 animate-in fade-in duration-500">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-[24px] shadow-sm border border-gray-100 px-5 py-5 animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="h-5 w-32 bg-gray-100 rounded-lg" />
                    <div className="h-4 w-48 bg-gray-50 rounded-lg" />
                    <div className="h-4 w-40 bg-gray-50 rounded-lg" />
                    <div className="h-6 w-24 bg-gray-100 rounded-xl mt-3" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="h-7 w-20 bg-gray-100 rounded-full" />
                    <div className="space-y-2 mt-2">
                    <div className="h-8 w-24 bg-gray-100 rounded-xl" />
                    <div className="h-8 w-24 bg-gray-100 rounded-xl" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.length === 0 && (
              <div className="bg-white rounded-[24px] p-10 text-center border border-gray-100 shadow-sm">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <UsersIcon size={28} className="text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">No users found</p>
              </div>
            )}

            {filtered.map((u) => (
              <div key={u._id} className="bg-white rounded-[24px] shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-gray-100 px-5 py-5 transition hover:shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-extrabold text-gray-900 text-[16px]">{u.name}</p>
                    <p className="text-[13px] text-gray-500 font-medium">{u.email}</p>
                    <p className="text-[13px] text-gray-500 font-medium mt-0.5">{u.mobile}</p>
                    {u.totalPurchase > 0 && (
                      <p className="text-[12px] text-blue-600 font-bold mt-1">₹{u.totalPurchase.toFixed(2)} Total Purchase</p>
                    )}
                    <div className="inline-flex mt-3 bg-[#ffe4e4] text-[#800000] px-3 py-1 rounded-xl text-[12px] font-bold items-center gap-1.5">
                      <Coins size={14} className="text-[#f97316]" /> {u.walletPoints || 0} Points
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full border ${u.isActive ? "bg-green-50 text-green-600 border-green-200" : "bg-red-50 text-red-500 border-red-200"}`}>
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                    <div className="relative">
                      <button
                        onClick={() => setDropdownOpen(dropdownOpen === u._id ? null : u._id)}
                        disabled={actionId === u._id}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition active:scale-95 disabled:opacity-60"
                      >
                        {actionId === u._id ? <Loader2 size={16} className="animate-spin text-gray-600" /> : <MoreVertical size={16} className="text-gray-600" />}
                      </button>
                      {dropdownOpen === u._id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(null)} />
                          <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 min-w-[140px] z-20">
                            <button
                              onClick={() => { setDropdownOpen(null); setPointsModal(u); setPointsInput(""); setPointsReason(""); }}
                              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 transition flex items-center gap-2"
                            >
                              <Plus size={14} /> Add Points
                            </button>
                            <button
                              onClick={() => toggle(u)}
                              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-amber-600 hover:bg-amber-50 transition flex items-center gap-2"
                            >
                              {u.isActive ? "Deactivate" : "Activate"}
                            </button>
                            <button
                              onClick={() => remove(u._id)}
                              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition flex items-center gap-2"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {pointsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 mb-12 flex items-end justify-center" onClick={() => setPointsModal(null)}>
          <div className="bg-white w-full max-w-lg rounded-t-3xl p-6 pb-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-black text-gray-900 text-lg">Add Points</h3>
                <p className="text-sm text-gray-400 font-medium">{pointsModal.name} • {pointsModal.walletPoints || 0} pts current</p>
              </div>
              <button onClick={() => setPointsModal(null)} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="number"
                  placeholder="Points to add (e.g. 50)"
                  value={pointsInput}
                  onChange={(e) => setPointsInput(e.target.value)}
                  className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-base font-bold focus:outline-none focus:border-emerald-400 pr-16"
                  autoFocus
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-300 uppercase">pts</span>
              </div>
              <input
                type="text"
                placeholder="Reason (e.g. Bill upload issue)"
                value={pointsReason}
                onChange={(e) => setPointsReason(e.target.value)}
                className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:border-emerald-400"
              />
              <button
                onClick={addPoints}
                disabled={addingPoints || !pointsInput || Number(pointsInput) <= 0}
                className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition"
              >
                {addingPoints ? <Loader2 size={18} className="animate-spin" /> : <><Plus size={18} /> Add {pointsInput || "0"} Points</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
