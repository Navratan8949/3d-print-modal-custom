"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShoppingBag,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  MessageCircle,
  Printer,
  Trash2,
  Save,
  ExternalLink,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  FileText,
  ShieldCheck,
  Sparkles,
  Camera,
  CreditCard,
  Send,
  Zap,
  ZoomIn,
  Download,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { ordersAPI } from "@/lib/api";
import { getOrderItemImage } from "@/lib/orderImages";
import { resolveProductImage } from "@/lib/imageUtils";

// Indian Courier Presets
const COURIER_PRESETS = [
  {
    name: "Delhivery",
    short: "Delhivery",
    url: (awb) => (awb ? `https://www.delhivery.com/track/package/${encodeURIComponent(awb)}` : "https://www.delhivery.com"),
  },
  {
    name: "Blue Dart",
    short: "Blue Dart",
    url: (awb) => (awb ? `https://www.bluedart.com/tracking?numbers=${encodeURIComponent(awb)}` : "https://www.bluedart.com"),
  },
  {
    name: "DTDC",
    short: "DTDC",
    url: (awb) => (awb ? `https://www.dtdc.in/tracking/shipment-tracking.asp?awbNo=${encodeURIComponent(awb)}` : "https://www.dtdc.in"),
  },
  {
    name: "India Post",
    short: "Speed Post",
    url: (awb) => (awb ? `https://www.indiapost.gov.in/_layouts/15/dpt.cept.tracking/trackconsignment.aspx` : "https://www.indiapost.gov.in"),
  },
  {
    name: "Trackon",
    short: "Trackon",
    url: (awb) => (awb ? `https://trackon.in/Tracking/TrackingResult?awbNo=${encodeURIComponent(awb)}` : "https://trackon.in"),
  },
  {
    name: "Xpressbees",
    short: "Xpressbees",
    url: (awb) => (awb ? `https://www.xpressbees.com/track?awb=${encodeURIComponent(awb)}` : "https://www.xpressbees.com"),
  },
  {
    name: "Shadowfax",
    short: "Shadowfax",
    url: (awb) => (awb ? `https://tracker.shadowfax.in/track?order_id=${encodeURIComponent(awb)}` : "https://tracker.shadowfax.in"),
  },
];

// Helper to generate context-aware WhatsApp templates
const getWhatsAppTemplates = (ord) => {
  const name = ord?.customer?.name || "Customer";
  const num = ord?.orderNumber || "";
  const courier = ord?.tracking?.courierName || "Express Courier";
  const awb = ord?.tracking?.trackingNumber || "";
  const trackUrl = ord?.tracking?.trackingUrl || "";

  return [
    {
      id: "stage_current",
      label: "Current Status Update",
      icon: "📢",
      text: `Hello ${name}! Prime 3D Lab here regarding your custom 3D printing Order #${num}. We are currently processing your order with status: ${ord?.status?.toUpperCase()}. Feel free to ask if you have any questions!`,
    },
    {
      id: "req_photo",
      label: "Request HD Reference Photo",
      icon: "📸",
      text: `Hello ${name}! Regarding your 3D custom Order #${num}, could you please share a high-resolution, well-lit front & side reference photo directly on this WhatsApp chat? This ensures our 3D artists capture accurate facial details and proportions!`,
    },
    {
      id: "prod_start",
      label: "3D Printing Started",
      icon: "⚙️",
      text: `Hello ${name}! Great news! Precision 3D printing for your Order #${num} has officially started. Our machines are printing layer-by-layer at 0.05mm ultra-fine resolution. We will update you once post-processing is complete.`,
    },
    {
      id: "shipped_awb",
      label: "Shipped & Tracking AWB",
      icon: "📦",
      text: `Hello ${name}! Your custom 3D print Order #${num} has been packed safely and dispatched via ${courier}! 📦\n\nTracking / AWB Number: ${awb || "Shared on dispatch"}\nTrack package: ${trackUrl || "Will update shortly"}\n\nThank you for choosing Prime 3D Lab!`,
    },
    {
      id: "delivery_feedback",
      label: "Delivered & Feedback",
      icon: "🎉",
      text: `Hello ${name}! Your custom 3D printed creation for Order #${num} has been delivered! 🎉 We hope it brings a big smile. Please share a photo of your printed model and your feedback with us! ⭐`,
    },
  ];
};

export default function AdminOrderDetailPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [uploadingPhotoIndex, setUploadingPhotoIndex] = useState(null);

  const handleAdminAttachPhoto = async (itemIndex, files) => {
    if (!files || files.length === 0) return;
    try {
      setUploadingPhotoIndex(itemIndex);
      const fd = new FormData();
      const fileList = Array.from(files);
      fileList.forEach((f) => fd.append("photos", f));
      fd.append("itemIndex", itemIndex);
      fd.append("action", "append");

      const res = await ordersAPI.updatePhotos(order._id || order.orderNumber, fd);
      if (res?.success && res.order) {
        setOrder(res.order);
        setSuccessMsg(`Attached ${fileList.length} photo(s) to order successfully!`);
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        throw new Error(res?.message || "Failed to upload photo(s)");
      }
    } catch (err) {
      console.error("Error attaching customer photo:", err);
      setError(err?.message || "Failed to upload customer photo");
      setTimeout(() => setError(""), 5000);
    } finally {
      setUploadingPhotoIndex(null);
    }
  };

  const handleAdminRemovePhoto = async (itemIndex, photoUrl) => {
    if (!confirm("Are you sure you want to remove this reference photo from order?")) return;
    try {
      setUploadingPhotoIndex(itemIndex);
      const res = await ordersAPI.updatePhotos(order._id || order.orderNumber, {
        itemIndex,
        action: "remove",
        removedUrl: photoUrl,
      });
      if (res?.success && res.order) {
        setOrder(res.order);
        setSuccessMsg("Reference photo removed successfully.");
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        throw new Error(res?.message || "Failed to remove photo");
      }
    } catch (err) {
      setError(err?.message || "Failed to remove photo");
      setTimeout(() => setError(""), 5000);
    } finally {
      setUploadingPhotoIndex(null);
    }
  };

  // Form editable states
  const [status, setStatus] = useState("pending");
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [courierName, setCourierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ordersAPI.getById(id);
      if (res && res.order) {
        setOrder(res.order);
        setStatus(res.order.status || "pending");
        setPaymentStatus(res.order.paymentStatus || "pending");
        setCourierName(res.order.tracking?.courierName || "");
        setTrackingNumber(res.order.tracking?.trackingNumber || "");
        setTrackingUrl(res.order.tracking?.trackingUrl || "");
        setAdminNotes(res.order.adminNotes || "");
      } else {
        setError("Order details could not be retrieved.");
      }
    } catch (err) {
      setError(err.message || "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyOrderNumber = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1-Click Fast Status Transition
  const handleQuickStatusTransition = async (newStatus) => {
    if (!order) return;
    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await ordersAPI.updateStatus(order._id, {
        status: newStatus,
        paymentStatus,
        courierName: courierName.trim(),
        trackingNumber: trackingNumber.trim(),
        trackingUrl: trackingUrl.trim(),
        adminNotes: adminNotes.trim(),
      });

      if (res && res.order) {
        setOrder(res.order);
        setStatus(newStatus);
        setSuccessMsg(`Order updated to "${newStatus.replace('_', ' ').toUpperCase()}"! Customer notification dispatched via Resend.`);
        setTimeout(() => setSuccessMsg(""), 5000);
      }
    } catch (err) {
      setError(err.message || "Failed to advance order status");
    } finally {
      setSaving(false);
    }
  };

  // 1-Click Fast Payment Status Toggle
  const handleTogglePaymentStatus = async () => {
    if (!order) return;
    const nextPay = paymentStatus === "paid" ? "pending" : "paid";
    setSaving(true);
    try {
      const res = await ordersAPI.updateStatus(order._id, { paymentStatus: nextPay });
      if (res && res.order) {
        setOrder(res.order);
        setPaymentStatus(nextPay);
        setSuccessMsg(nextPay === "paid" ? "Payment confirmed & recorded as PAID 💰" : "Payment reset to PENDING");
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err) {
      setError("Payment toggle failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Courier Preset Selection
  const handleSelectPreset = (preset) => {
    setCourierName(preset.name);
    const updatedUrl = preset.url(trackingNumber.trim());
    setTrackingUrl(updatedUrl);
  };

  // Tracking Number Input (auto updates URL if preset matches)
  const handleAwbChange = (awb) => {
    setTrackingNumber(awb);
    const matched = COURIER_PRESETS.find(
      (p) => p.name.toLowerCase() === courierName.toLowerCase()
    );
    if (matched) {
      setTrackingUrl(matched.url(awb.trim()));
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!order) return;
    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await ordersAPI.updateStatus(order._id, {
        status,
        paymentStatus,
        courierName: courierName.trim(),
        trackingNumber: trackingNumber.trim(),
        trackingUrl: trackingUrl.trim(),
        adminNotes: adminNotes.trim(),
      });

      if (res && res.order) {
        setOrder(res.order);
        setSuccessMsg("Order status & tracking updated! Customer email notification dispatched via Resend.");
        setTimeout(() => setSuccessMsg(""), 5000);
      }
    } catch (err) {
      setError(err.message || "Failed to save order updates");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!order) return;
    if (!confirm(`Are you sure you want to permanently delete Order #${order.orderNumber}?`)) {
      return;
    }

    try {
      await ordersAPI.delete(order._id);
      alert(`Order #${order.orderNumber} deleted successfully.`);
      router.push("/admin/orders");
    } catch (err) {
      alert("Failed to delete order: " + err.message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case "pending":
        return <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-amber-50 text-amber-800 border border-amber-200">Pending Review</span>;
      case "confirmed":
        return <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-blue-50 text-blue-800 border border-blue-200">Confirmed</span>;
      case "in_production":
        return <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-purple-50 text-purple-800 border border-purple-200">Processing</span>;
      case "shipped":
        return <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">Shipped / Dispatched</span>;
      case "delivered":
        return <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">Delivered</span>;
      case "cancelled":
        return <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-rose-50 text-rose-800 border border-rose-200">Cancelled</span>;
      default:
        return <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-stone-100 text-stone-800">{st}</span>;
    }
  };

  // Timeline Stepper
  const stages = [
    { key: "pending", label: "Received", icon: Clock },
    { key: "confirmed", label: "Confirmed", icon: ShieldCheck },
    { key: "in_production", label: "Processing", icon: Package },
    { key: "shipped", label: "Shipped", icon: Truck },
    { key: "delivered", label: "Delivered", icon: CheckCircle },
  ];

  const getStageIndex = (st) => {
    const idx = stages.findIndex((s) => s.key === st);
    return idx === -1 ? 0 : idx;
  };

  const currentStageIndex = getStageIndex(status);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
        <p className="text-xs text-stone-500 font-mono">Loading full order details...</p>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="py-16 max-w-lg mx-auto text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-serif font-bold text-stone-900">Order Not Found</h2>
        <p className="text-xs text-stone-600">{error}</p>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>
      </div>
    );
  }

  const cleanCustomerPhone = order?.customer?.phone ? order.customer.phone.replace(/[^0-9]/g, "") : "";

  // Dynamic tracking URL (from manual URL or computed from courier preset + AWB)
  const activeTrackingUrl =
    trackingUrl?.trim() ||
    order?.tracking?.trackingUrl?.trim() ||
    (() => {
      const awb = trackingNumber?.trim() || order?.tracking?.trackingNumber?.trim();
      const courier = courierName?.trim() || order?.tracking?.courierName?.trim();
      if (!awb) return null;
      const matched = COURIER_PRESETS.find(
        (p) => p.name.toLowerCase() === courier?.toLowerCase()
      );
      return matched ? matched.url(awb) : null;
    })();

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors shadow-2xs"
            title="Back to Orders List"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif font-bold text-stone-900">
                Order #{order.orderNumber}
              </h1>
              <button
                type="button"
                onClick={handleCopyOrderNumber}
                className="p-1 rounded-md text-stone-400 hover:text-stone-800 transition-colors"
                title="Copy Order ID"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-stone-500">
              Placed on {new Date(order.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {activeTrackingUrl && (
            <a
              href={activeTrackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-2xs transition-all active:scale-95 cursor-pointer"
              title="Open Live Shipment Tracking in New Tab"
            >
              <Truck className="w-4 h-4 text-stone-950" />
              <span>Track Order ↗</span>
            </a>
          )}

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Printer className="w-4 h-4 text-stone-500" />
            <span className="hidden sm:inline">Print Receipt / Slip</span>
            <span className="sm:hidden">Print</span>
          </button>

          <button
            type="button"
            onClick={() => setShowWhatsAppModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Smart WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleDeleteOrder}
            className="p-2 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs transition-colors shadow-2xs cursor-pointer"
            title="Delete Order"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-2xs">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 shadow-2xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1-CLICK RECOMMENDED NEXT ACTION HERO BANNER */}
      {/* ======================================================== */}
      <div className="bg-linear-to-r from-stone-900 via-stone-800 to-stone-900 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-stone-700 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30">
              Next Business Step
            </span>
            <span className="text-xs text-stone-400">Current: {status.toUpperCase()}</span>
          </div>

          <h3 className="font-serif font-bold text-base sm:text-lg">
            {status === "pending" && "New Order Received! Verify 3D Specs & Confirm"}
            {status === "confirmed" && "Order Confirmed! Queue for 3D Printing"}
            {status === "in_production" && "Printing in Progress! Ready to Pack & Dispatch"}
            {status === "shipped" && "Dispatched & In Transit! Awaiting Customer Receipt"}
            {status === "delivered" && "Order Fulfilled Successfully! Request Review"}
            {status === "cancelled" && "Order Cancelled"}
          </h3>
          <p className="text-xs text-stone-300 max-w-xl">
            {status === "pending" && "Review customer details and reference photo. Click below to approve and notify the customer via Resend."}
            {status === "confirmed" && "Model geometry verified. Click below to mark as Printing / In Production and send customer an update."}
            {status === "in_production" && "Post-processing complete. Enter tracking details below or click to mark as Shipped with courier."}
            {status === "shipped" && "Customer has live tracking. Once package is received, confirm delivery to complete the order."}
            {status === "delivered" && "Customer has received their custom 3D model. Send a thank-you note and request review on WhatsApp."}
            {status === "cancelled" && "This order was cancelled. You can change status back at any time using the form below."}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {activeTrackingUrl && (
            <a
              href={activeTrackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-stone-100 text-stone-900 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
              title="Open Live Carrier Tracking in New Tab"
            >
              <Truck className="w-4 h-4 text-amber-600" />
              <span>Track Shipment ↗</span>
            </a>
          )}

          {status === "pending" && (
            <button
              type="button"
              disabled={saving}
              onClick={() => handleQuickStatusTransition("confirmed")}
              className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              <span>Approve & Confirm Order ✓</span>
            </button>
          )}

          {status === "confirmed" && (
            <button
              type="button"
              disabled={saving}
              onClick={() => handleQuickStatusTransition("in_production")}
              className="px-5 py-2.5 rounded-2xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
              <span>Start 3D Production ⚙️</span>
            </button>
          )}

          {status === "in_production" && (
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setStatus("shipped");
                document.getElementById("courier-management-form")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-5 py-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>Ready to Ship & Track 📦</span>
            </button>
          )}

          {status === "shipped" && (
            <button
              type="button"
              disabled={saving}
              onClick={() => handleQuickStatusTransition("delivered")}
              className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>Mark Delivered 🎉</span>
            </button>
          )}

          {status === "delivered" && (
            <button
              type="button"
              onClick={() => setShowWhatsAppModal(true)}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Ask for Review / Feedback</span>
            </button>
          )}
        </div>
      </div>

      {/* Visual Stepper Timeline */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Order Fulfillment & Logistics Stage
          </span>
          <div>{getStatusBadge(status)}</div>
        </div>

        <div className="relative pt-2">
          {/* Progress Bar Line */}
          <div className="absolute top-7 left-6 right-6 h-1 bg-stone-200 rounded-full hidden sm:block">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{
                width: `${(currentStageIndex / (stages.length - 1)) * 100}%`,
              }}
            />
          </div>

          {/* Steps */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 relative z-10">
            {stages.map((stage, idx) => {
              const Icon = stage.icon;
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div
                  key={stage.key}
                  className={`flex flex-col items-center text-center p-3 rounded-2xl border transition-all ${
                    isCurrent
                      ? "bg-amber-500/10 border-amber-500 text-amber-900 font-bold shadow-2xs"
                      : isPast
                      ? "bg-emerald-50/60 border-emerald-300 text-emerald-800 font-semibold"
                      : "bg-stone-50 border-stone-200/80 text-stone-400"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 transition-colors ${
                      isCurrent
                        ? "bg-amber-500 text-white shadow-md shadow-amber-500/30"
                        : isPast
                        ? "bg-emerald-600 text-white"
                        : "bg-stone-200 text-stone-500"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs">{stage.label}</span>
                  <span className="text-[10px] opacity-70 mt-0.5">
                    {isCurrent ? "Active Stage" : isPast ? "Completed" : "Upcoming"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Ordered Items + Fabrication Controls (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* ======================================================== */}
          {/* ORDERED PRODUCTS CARD */}
          {/* ======================================================== */}
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h2 className="font-serif font-bold text-base text-stone-900">
                  Ordered 3D Products ({order.items?.length || 0})
                </h2>
                <p className="text-xs text-stone-500">
                  Detailed product specifications, custom engravings, and reference uploads
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">
                Total Qty: {order.itemCount || order.items?.reduce((a, b) => a + (b.quantity || 1), 0) || 1}
              </span>
            </div>

            <div className="divide-y divide-stone-100">
              {order.items?.map((item, idx) => {
                const itemImg = getOrderItemImage(item);
                return (
                  <div key={idx} className="p-5 space-y-4 hover:bg-stone-50/40 transition-colors">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {/* Product Image */}
                        <div className="relative shrink-0">
                          <img
                            src={itemImg}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-2xl border border-stone-200 bg-stone-100 shadow-2xs"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/images/products/fullbody-figurine-hero.jpeg";
                            }}
                          />
                          {item.referencePhotoUrl && (
                            <button
                              type="button"
                              onClick={() => setPreviewPhoto(item.referencePhotoUrl)}
                              className="absolute -bottom-1 -right-1 bg-amber-600 text-white rounded-full p-1 shadow-xs hover:bg-amber-700 transition-colors"
                              title="View Customer Reference Photo"
                            >
                              <Camera className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm text-stone-900">{item.name}</h3>
                            {item.slug && (
                              <Link
                                href={`/products/${item.slug}`}
                                target="_blank"
                                className="text-stone-400 hover:text-amber-600 transition-colors"
                                title="View in store"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            )}
                          </div>
                          <p className="text-xs text-stone-500 font-mono">
                            Product ID: {item.productId || `#${idx + 1}`}
                          </p>
                          <p className="text-xs font-semibold text-stone-800">
                            ₹{item.price} × {item.quantity} unit(s)
                          </p>
                        </div>
                      </div>

                      <div className="sm:text-right shrink-0">
                        <span className="text-xs text-stone-400 block">Item Subtotal</span>
                        <span className="text-base font-bold font-serif text-stone-900">
                          ₹{(Number(item.price) || 0) * (Number(item.quantity) || 1)}
                        </span>
                      </div>
                    </div>

                    {/* Customization Details Box & Customer Reference Photo Gallery */}
                    {(() => {
                      const nonPhotoSpecs = Object.entries(item.customization || {}).filter(
                        ([k, v]) => {
                          if (!v) return false;
                          const lk = k.toLowerCase();
                          return !lk.includes("photo") && !lk.includes("reference");
                        }
                      );

                      const photoList = [
                        ...(Array.isArray(item.referencePhotos) ? item.referencePhotos : []),
                        ...(Array.isArray(item.customization?.referencePhotos)
                          ? item.customization.referencePhotos
                          : []),
                        ...(item.referencePhotoUrl ? [item.referencePhotoUrl] : []),
                        ...(item.customization?.referencePhotoUrl
                          ? [item.customization.referencePhotoUrl]
                          : []),
                        ...(item.referencePhotos?.[0]?.url ? [item.referencePhotos[0].url] : []),
                        ...(item.referencePhotos?.[0]?.preview
                          ? [item.referencePhotos[0].preview]
                          : []),
                      ]
                        .map((p) => (typeof p === "string" ? p : p?.url || p?.preview))
                        .filter(Boolean);

                      const uniquePhotos = Array.from(new Set(photoList));

                      const photoEntry = Object.entries(item.customization || {}).find(([k]) => {
                        const lk = k.toLowerCase();
                        return lk.includes("photo") || lk.includes("reference");
                      });
                      const attachedFilename = photoEntry ? String(photoEntry[1]) : null;
                      const hasAttachedNotice =
                        item.hasPhoto || Boolean(attachedFilename) || uniquePhotos.length > 0;

                      return (
                        <div className="space-y-3">
                          {/* 1. Custom 3D Fabrication Specs */}
                          {nonPhotoSpecs.length > 0 && (
                            <div className="bg-amber-50/40 border border-amber-200/70 rounded-2xl p-3.5 space-y-1.5">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
                                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                <span>Custom 3D Fabrication Specs</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {nonPhotoSpecs.map(([k, v]) => (
                                  <div
                                    key={k}
                                    className="p-2 bg-white/90 rounded-xl border border-amber-100"
                                  >
                                    <span className="text-stone-500 block text-[10px] uppercase font-bold">
                                      {k}:
                                    </span>
                                    <span className="text-stone-900 font-medium">{String(v)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 2. Customer Reference Photos Gallery (Multiple Photos Display) */}
                          {hasAttachedNotice && (
                            <div className="rounded-2xl border border-amber-300 bg-amber-50/50 p-4 space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/70 pb-3">
                                <div className="flex items-center gap-2">
                                  <Camera className="w-4 h-4 text-amber-600 shrink-0" />
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950">
                                    Customer Reference Photos ({uniquePhotos.length})
                                  </h4>
                                </div>
                                <div className="flex items-center gap-2">
                                  {uniquePhotos.length > 0 ? (
                                    <>
                                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                        ✓ {uniquePhotos.length} Photo
                                        {uniquePhotos.length > 1 ? "s" : ""} Attached
                                      </span>
                                      {uniquePhotos.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            uniquePhotos.forEach((pUrl, pIdx) => {
                                              const a = document.createElement("a");
                                              a.href = resolveProductImage(pUrl);
                                              a.download = `order-${order.orderNumber}-ref-${
                                                pIdx + 1
                                              }.jpg`;
                                              a.target = "_blank";
                                              document.body.appendChild(a);
                                              a.click();
                                              document.body.removeChild(a);
                                            });
                                          }}
                                          className="text-[11px] font-semibold text-amber-800 hover:text-amber-950 underline cursor-pointer"
                                        >
                                          Download All HD
                                        </button>
                                      )}
                                    </>
                                  ) : (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                                      Action Required
                                    </span>
                                  )}
                                </div>
                              </div>

                              {uniquePhotos.length > 0 ? (
                                <div className="space-y-3">
                                  {/* Photo Grid */}
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {uniquePhotos.map((photoUrl, pIdx) => {
                                      const resolvedSrc = resolveProductImage(photoUrl);
                                      return (
                                        <div
                                          key={pIdx}
                                          className="relative group rounded-xl overflow-hidden border-2 border-stone-200 hover:border-amber-500 bg-white shadow-2xs transition-all flex flex-col"
                                        >
                                          <span className="absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 rounded-md bg-stone-900/80 text-white font-mono font-bold text-[9px] shadow-sm">
                                            #{pIdx + 1}
                                          </span>

                                          <div
                                            onClick={() => setPreviewPhoto(resolvedSrc)}
                                            className="relative aspect-square w-full bg-stone-100 overflow-hidden cursor-pointer"
                                            title="Click to zoom HD reference photo"
                                          >
                                            <img
                                              src={resolvedSrc}
                                              alt={`Customer reference ${pIdx + 1}`}
                                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                            />
                                            <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                              <ZoomIn className="w-5 h-5 drop-shadow-md" />
                                            </div>
                                          </div>

                                          <div className="p-1.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-1 text-[11px]">
                                            <button
                                              type="button"
                                              onClick={() => setPreviewPhoto(resolvedSrc)}
                                              className="p-1 text-stone-600 hover:text-amber-700 hover:bg-amber-100/50 rounded transition-colors cursor-pointer"
                                              title="Zoom Photo"
                                            >
                                              <ZoomIn className="w-3.5 h-3.5" />
                                            </button>
                                            <a
                                              href={resolvedSrc}
                                              download={`order-${order.orderNumber}-ref-${
                                                pIdx + 1
                                              }.jpg`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="p-1 text-stone-600 hover:text-amber-700 hover:bg-amber-100/50 rounded transition-colors"
                                              title="Download HD Photo"
                                            >
                                              <Download className="w-3.5 h-3.5" />
                                            </a>
                                            <button
                                              type="button"
                                              disabled={uploadingPhotoIndex === idx}
                                              onClick={() =>
                                                handleAdminRemovePhoto(idx, photoUrl)
                                              }
                                              className="p-1 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                              title="Remove this photo"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}

                                    {/* Upload More Card */}
                                    <label className="rounded-xl border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/50 hover:bg-amber-100/60 p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-colors aspect-square min-h-[120px]">
                                      {uploadingPhotoIndex === idx ? (
                                        <Loader2 className="w-6 h-6 animate-spin text-amber-600 mb-1" />
                                      ) : (
                                        <Upload className="w-6 h-6 text-amber-600 mb-1" />
                                      )}
                                      <span className="text-[11px] font-bold text-amber-900 block">
                                        {uploadingPhotoIndex === idx ? "Uploading..." : "+ Add More"}
                                      </span>
                                      <span className="text-[9px] text-amber-700 block">
                                        Upload extra angles
                                      </span>
                                      <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        disabled={uploadingPhotoIndex === idx}
                                        onChange={(e) =>
                                          handleAdminAttachPhoto(idx, e.target.files)
                                        }
                                      />
                                    </label>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2.5 p-3.5 bg-amber-100/60 rounded-xl border border-amber-300">
                                  <p className="text-xs text-stone-800 leading-relaxed">
                                    Customer attached reference file:{" "}
                                    <strong className="font-mono font-bold text-amber-950 bg-amber-200/80 px-1.5 py-0.5 rounded">
                                      {attachedFilename || "Attached file"}
                                    </strong>
                                    . Since this file was recorded before live image storage, please request it on WhatsApp or upload it below:
                                  </p>

                                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                                    <a
                                      href={`https://wa.me/91${order.customer?.phone?.replace(
                                        /\D/g,
                                        ""
                                      )}?text=${encodeURIComponent(
                                        `Hello ${order.customer?.name}! Prime 3D Studio is preparing your custom 3D printed Order #${order.orderNumber}. We see you attached reference photo "${
                                          attachedFilename || "1 photo"
                                        }". Could you please send it here on WhatsApp so our 3D artists can begin sculpt? 🎨`
                                      )}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5 fill-current" />
                                      <span>Request on WhatsApp</span>
                                    </a>

                                    <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-stone-300 hover:border-amber-500 text-stone-800 text-xs font-semibold shadow-xs cursor-pointer transition-colors">
                                      {uploadingPhotoIndex === idx ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                                      ) : (
                                        <Upload className="w-3.5 h-3.5 text-amber-600" />
                                      )}
                                      <span>
                                        {uploadingPhotoIndex === idx
                                          ? "Uploading & Attaching..."
                                          : "Upload Customer's Photo Here"}
                                      </span>
                                      <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        disabled={uploadingPhotoIndex === idx}
                                        onChange={(e) =>
                                          handleAdminAttachPhoto(idx, e.target.files)
                                        }
                                      />
                                    </label>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ======================================================== */}
          {/* FABRICATION & LOGISTICS MANAGER FORM */}
          {/* ======================================================== */}
          <form
            id="courier-management-form"
            onSubmit={handleSaveChanges}
            className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs space-y-5"
          >
            <div>
              <h2 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-600" />
                <span>Fabrication & Logistics Management</span>
              </h2>
              <p className="text-xs text-stone-500">
                Updating stage or tracking dispatches a background transactional notification to the customer via Resend.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Order Stage</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600 cursor-pointer"
                >
                  <option value="pending">Pending Review (Waiting confirmation)</option>
                  <option value="confirmed">Confirmed (Specs verified & scheduled)</option>
                  <option value="in_production">Processing (In 3D Print Queue)</option>
                  <option value="shipped">Shipped & In Transit</option>
                  <option value="delivered">Delivered Successfully</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600 cursor-pointer"
                >
                  <option value="pending">Pending (Unpaid / WhatsApp Cash)</option>
                  <option value="paid">Paid & Verified (Full Payment Received)</option>
                  <option value="partial">Partially Paid (Advance Deposit)</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>

            {/* Courier Presets Chips */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-stone-700 flex items-center justify-between">
                <span>Indian Courier Presets (1-Click Fill)</span>
                <span className="text-[10px] text-stone-400 font-normal">Auto-formats tracking link</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COURIER_PRESETS.map((p) => {
                  const isSelected = courierName.toLowerCase() === p.name.toLowerCase();
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-amber-600 text-white shadow-2xs"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      {p.short}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Courier Partner</label>
                <input
                  type="text"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="e.g. Delhivery, Blue Dart"
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">AWB / Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => handleAwbChange(e.target.value)}
                  placeholder="e.g. 14238719283"
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 font-mono text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Tracking Web URL</label>
                <input
                  type="url"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  placeholder="https://track.delhivery.com/..."
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
                />
              </div>
            </div>

            {/* Live Tracking Link Test Button for Admin */}
            {activeTrackingUrl && (
              <div className="p-3 bg-amber-50/90 border border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-amber-950 flex items-center gap-1.5">
                      <span>Live Tracking Link Ready:</span>
                      <span className="font-mono text-stone-800">{courierName || "Courier"} #{trackingNumber || order?.tracking?.trackingNumber}</span>
                    </div>
                    <p className="text-[11px] text-stone-600 truncate max-w-sm sm:max-w-md font-mono">
                      {activeTrackingUrl}
                    </p>
                  </div>
                </div>

                <a
                  href={activeTrackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-all shrink-0 cursor-pointer"
                >
                  <span>Test Tracking Link ↗</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">
                Studio Internal & Customer Note
              </label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g. Resin post-cured at 405nm. Primer coated, safely packed in double bubble wrap."
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-stone-400">
                Updates sync to MongoDB & triggers Resend transactional email automatically.
              </span>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Updates...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save & Notify Customer</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Customer Info & Financial Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Customer Profile Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif font-bold text-sm text-stone-900">Customer Details</h3>
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                {order.orderSource || "web"}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <User className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-stone-900 block">{order.customer?.name}</span>
                  <span className="text-[11px] text-stone-400">Customer Name</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                <div>
                  <a
                    href={`tel:${order.customer?.phone}`}
                    className="font-mono font-semibold text-stone-900 hover:text-amber-600 block"
                  >
                    {order.customer?.phone}
                  </a>
                  <span className="text-[11px] text-stone-400">Phone / WhatsApp</span>
                </div>
              </div>

              {order.customer?.email && (
                <div className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                  <div>
                    <a
                      href={`mailto:${order.customer.email}`}
                      className="text-stone-900 hover:text-amber-600 block truncate max-w-[200px]"
                    >
                      {order.customer.email}
                    </a>
                    <span className="text-[11px] text-stone-400">Email Address</span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2.5 pt-2 border-t border-stone-100">
                <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-stone-800 leading-relaxed block font-medium">
                    {order.customer?.address}
                  </span>
                  <span className="text-stone-500 block text-[11px]">
                    {order.customer?.city}, {order.customer?.state} - {order.customer?.pincode}
                  </span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${order.customer?.address}, ${order.customer?.city}, ${order.customer?.pincode}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-amber-700 hover:underline pt-1"
                  >
                    <span>View Address on Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {order.customer?.notes && (
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-950 text-[11px] space-y-1">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-amber-800 block">
                    Customer Instructions:
                  </span>
                  <p>{order.customer.notes}</p>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowWhatsAppModal(true)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 font-semibold text-xs transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600 fill-current" />
                <span>Message on WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Financial Breakdown & 1-Click Payment Confirmation */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif font-bold text-sm text-stone-900">
                Payment & Bill Summary
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  paymentStatus === "paid"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-amber-100 text-amber-800 border border-amber-300"
                }`}
              >
                {paymentStatus}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-stone-600">
                <span>Items Subtotal</span>
                <span>₹{order.totalAmount}</span>
              </div>

              <div className="flex items-center justify-between text-stone-600">
                <span>Custom 3D Finishing</span>
                <span className="text-emerald-700 font-medium">Included</span>
              </div>

              <div className="flex items-center justify-between text-stone-600">
                <span>Standard Express Shipping</span>
                <span className="text-emerald-700 font-medium">Free</span>
              </div>

              <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between">
                <span className="font-bold text-sm text-stone-900">Total Order Amount</span>
                <span className="font-serif font-bold text-lg text-amber-900">
                  ₹{order.totalAmount}
                </span>
              </div>

              {order.razorpayPaymentId && (
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-100">
                  <span className="text-stone-400">Razorpay Payment ID:</span>
                  <span className="font-mono font-semibold text-stone-800">{order.razorpayPaymentId}</span>
                </div>
              )}

              {order.razorpayOrderId && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-stone-400">Razorpay Order ID:</span>
                  <span className="font-mono text-stone-600">{order.razorpayOrderId}</span>
                </div>
              )}
            </div>

            {/* 1-Click Fast Payment Verification Button */}
            <div className="pt-2">
              {paymentStatus !== "paid" ? (
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleTogglePaymentStatus}
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Mark as Paid (₹{order.totalAmount}) 💰</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Payment Confirmed & Settled</span>
                  </div>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleTogglePaymentStatus}
                    className="w-full text-center text-[10px] text-stone-400 hover:text-stone-700 underline"
                  >
                    Reset back to Unpaid
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Uploaded Reference Photo */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="bg-white rounded-3xl p-5 max-w-lg w-full space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-600" />
                <h4 className="font-serif font-bold text-sm text-stone-900">
                  Customer Reference Photo
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[65vh] overflow-auto flex items-center justify-center p-2 bg-stone-50 rounded-2xl border border-stone-100">
              <img
                src={resolveProductImage(previewPhoto)}
                alt="Customer reference"
                className="max-h-[60vh] w-auto rounded-xl object-contain shadow-sm"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-stone-500 font-mono">
                Order #{order.orderNumber}
              </span>
              <a
                href={resolveProductImage(previewPhoto)}
                download={`order-${order.orderNumber}-customer-photo.jpg`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download HD Photo</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Smart WhatsApp Templates Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-600 fill-current" />
                  <span>Smart WhatsApp Message</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Select a pre-crafted template for #{order.orderNumber} ({order.customer?.name})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowWhatsAppModal(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto">
              {getWhatsAppTemplates(order).map((tpl) => {
                const url = `https://wa.me/${cleanCustomerPhone}?text=${encodeURIComponent(tpl.text)}`;

                return (
                  <a
                    key={tpl.id}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowWhatsAppModal(false)}
                    className="block p-3 rounded-2xl border border-stone-200/90 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left space-y-1 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-stone-900 group-hover:text-emerald-900 flex items-center gap-1.5">
                        <span>{tpl.icon}</span>
                        <span>{tpl.label}</span>
                      </span>
                      <Send className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-600 transition-colors" />
                    </div>
                    <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                      {tpl.text}
                    </p>
                  </a>
                );
              })}
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setShowWhatsAppModal(false)}
                className="w-full py-2 text-xs font-semibold rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
