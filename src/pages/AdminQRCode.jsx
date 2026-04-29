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

    // Create a new canvas to add details
    const newCanvas = document.createElement("canvas");
    const ctx = newCanvas.getContext("2d");
    newCanvas.width = 400;
    newCanvas.height = 650; // Increased height for paragraph

    // White background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);

    // Add Shop Name
    ctx.fillStyle = "#1a0000";
    ctx.font = "bold 26px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(admin.shopName || "Our Shop", 200, 60);

    // Add "Scan to Register"
    ctx.fillStyle = "#9ca3af";
    ctx.font = "bold 12px Inter, sans-serif";
    ctx.fillText("SCAN TO REGISTER", 200, 90);

    // Draw QR Code
    ctx.drawImage(canvas, 50, 110, 300, 300);

    // Add Branding
    ctx.fillStyle = "#800000";
    ctx.font = "bold 16px Inter, sans-serif";
    ctx.fillText("⚡ Powered by Inaamify", 200, 460);
    
    ctx.fillStyle = "#6b7280";
    ctx.font = "bold 12px Inter, sans-serif";
    ctx.fillText("Har Bill Par Inaam!", 200, 485);

    // Add Paragraph Text (Wrapped)
    ctx.fillStyle = "#9ca3af";
    ctx.font = "12px Inter, sans-serif";
    const text = "User scan kare aur directly register form par redirect ho jayega with Shop ID auto-filled";
    const words = text.split(" ");
    let line = "";
    let y = 530;
    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + " ";
      let metrics = ctx.measureText(testLine);
      let testWidth = metrics.width;
      if (testWidth > 300 && n > 0) {
        ctx.fillText(line, 200, y);
        line = words[n] + " ";
        y += 20;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 200, y);

    const a = document.createElement("a");
    a.href = newCanvas.toDataURL("image/png");
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
            <p className="text-white font-bold text-base">{admin?.shopName || "Our Shop"}</p>
            <p className="text-white/70 text-xs mt-0.5">Shop ID: {admin?.shopId}</p>
          </div>
        </div>

        {/* QR Code */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center mb-6 w-full" ref={qrRef}>
          <p className="text-base font-extrabold text-gray-800 mb-1">{admin?.shopName || "Our Shop"}</p>
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
            <button onClick={() => {
              navigator.clipboard.writeText(admin.shopId);
              Swal.fire({ icon: 'success', title: 'Shop ID Copied!', timer: 1000, showConfirmButton: false });
            }} className="flex items-center gap-1.5 bg-gray-50 text-gray-600 px-3 py-2 rounded-xl text-xs font-bold active:scale-95 transition">
              <Copy size={14} /> Copy
            </button>
          </div>
        </div>

        {/* Register URL */}
        <div className="w-full bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Register URL</p>
            <button onClick={copyLink} className="flex items-center gap-1.5 bg-[#ffe4e4] text-[#800000] px-3 py-1.5 rounded-lg text-[10px] font-bold active:scale-95 transition">
              {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy Link</>}
            </button>
          </div>
          <p className="text-[11px] text-gray-600 break-all leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">{registerUrl}</p>
        </div>

        {/* Download button */}
        <button onClick={downloadQR} className="w-full bg-[#800000] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-md">
          <Download size={18} /> Download Branded QR
        </button>
      </div>
    </div>
  );
}
