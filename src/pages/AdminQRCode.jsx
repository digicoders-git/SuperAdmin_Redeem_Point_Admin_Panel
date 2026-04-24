import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import api from "../api/axios";
import { ArrowLeft, Download, QrCode, Copy, Check } from "lucide-react";
import Swal from "sweetalert2";

export default function AdminQRCode() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef(null);

  useEffect(() => {
    // Get admin info from localStorage + fetch fresh shopId
    const info = JSON.parse(localStorage.getItem("adminInfo") || "{}");
    setAdmin(info);
    setLoading(false);
  }, []);

  const registerUrl = admin?.shopId
    ? `${window.location.origin}/user/login?shopId=${admin.shopId}`
    : "";

  const copyLink = () => {
    navigator.clipboard.writeText(registerUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${admin?.shopId || "shop"}-qr.png`;
    a.click();
  };

  if (loading) return null;

  if (!admin?.shopId) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] font-sans">
        <div className="flex items-center gap-3 px-4 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-600">
            <ArrowLeft size={20} />
          </button>
          <h2 className="font-bold text-lg text-gray-800">My QR Code</h2>
        </div>
        <div className="flex flex-col items-center justify-center p-10 text-center">
          <QrCode size={48} className="text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">Shop ID not assigned yet.</p>
          <p className="text-gray-400 text-sm mt-1">Please contact SuperAdmin to get your Shop ID.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans pb-10">
      <div className="flex items-center gap-3 px-4 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-bold text-lg text-gray-800">My QR Code</h2>
      </div>

      <div className="px-4 pt-6 flex flex-col items-center">
        {/* Header card */}
        <div className="w-full bg-[#800000] rounded-2xl p-5 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
            <QrCode size={24} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-base">{admin?.name || admin?.adminId}</p>
            <p className="text-white/70 text-xs mt-0.5">Shop ID: {admin?.shopId}</p>
          </div>
        </div>

        {/* QR Code */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center mb-6 w-full" ref={qrRef}>
          <p className="text-base font-extrabold text-gray-800 mb-1">{admin?.name || admin?.adminId}</p>
          <p className="text-xs text-gray-400 mb-5 uppercase tracking-wider">Scan to Register</p>
          <QRCodeCanvas
            value={registerUrl}
            size={220}
            bgColor="#ffffff"
            fgColor="#0f172a"
            level="H"
            includeMargin={true}
          />
          <p className="text-xs font-bold text-[#800000] mt-4 tracking-wide">⚡ Powered by Inaamify</p>
          <p className="text-xs text-gray-400 mt-1 text-center px-4 leading-relaxed">
            User scan kare aur directly register form par redirect ho jayega with Shop ID auto-filled
          </p>
        </div>

        {/* Shop ID */}
        <div className="w-full bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Shop ID</p>
          <div className="flex items-center justify-between gap-3">
            <p className="font-bold text-gray-900 text-lg tracking-widest">{admin.shopId}</p>
            <button onClick={copyLink} className="flex items-center gap-1.5 bg-[#ffe4e4] text-[#800000] px-3 py-2 rounded-xl text-xs font-bold active:scale-95 transition">
              {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Link</>}
            </button>
          </div>
        </div>

        {/* Register URL */}
        <div className="w-full bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Register URL</p>
          <p className="text-xs text-gray-600 break-all leading-relaxed">{registerUrl}</p>
        </div>

        {/* Download button */}
        <button onClick={downloadQR} className="w-full bg-[#800000] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-md">
          <Download size={18} /> Download QR Code
        </button>
      </div>
    </div>
  );
}
