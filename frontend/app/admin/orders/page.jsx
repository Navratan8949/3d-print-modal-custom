"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ShoppingBag,
  Search,
  Filter,
  Calendar,
  MessageCircle,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  ExternalLink,
  ChevronDown,
  Loader2,
  AlertCircle,
  User,
  Phone,
  MapPin,
  FileText,
  Trash2,
  Camera,
  Check,
  CreditCard,
  Sparkles,
  ArrowRight,
  Send,
  Zap,
  Info,
  ZoomIn,
  Download,
  X,
} from "lucide-react";
import { ordersAPI } from "@/lib/api";
import { getOrderItemImage } from "@/lib/orderImages";
import { resolveProductImage } from "@/lib/imageUtils";

// ==========================================
// POPULAR INDIAN COURIER PRESETS
// ==========================================
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

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ pending: 0, in_production: 0, shipped: 0, delivered: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [activeFilter, setActiveFilter] = useState("all");
  const [toastMessage, setToastMessage] = useState("");

  // Selected Order for Quick Dispatch Modal
  const [dispatchOrder, setDispatchOrder] = useState(null);
  const [dispatchForm, setDispatchForm] = useState({
    courierName: "Delhivery",
    trackingNumber: "",
    trackingUrl: "",
    adminNotes: "",
    markAsShipped: true,
  });

  // WhatsApp Menu Drawer
  const [whatsAppMenuOrder, setWhatsAppMenuOrder] = useState(null);

  // Status updating indicator
  const [updatingId, setUpdatingId] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [activeFilter]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4500);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await ordersAPI.getAllAdmin({
        status: activeFilter,
        search: searchTerm,
      });
      if (res && res.orders) {
        setOrders(res.orders);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  // 1-Click Status Progress Action
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await ordersAPI.updateStatus(orderId, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      showToast(`Order status updated to "${newStatus.replace('_', ' ').toUpperCase()}"! Customer notification dispatched.`);
    } catch (err) {
      alert("Error updating status: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // 1-Click Payment Status Toggle
  const handleTogglePayment = async (ord) => {
    const nextPaymentStatus = ord.paymentStatus === "paid" ? "pending" : "paid";
    try {
      setUpdatingId(ord._id);
      await ordersAPI.updateStatus(ord._id, { paymentStatus: nextPaymentStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === ord._id ? { ...o, paymentStatus: nextPaymentStatus } : o))
      );
      showToast(
        nextPaymentStatus === "paid"
          ? `Order #${ord.orderNumber} marked as PAID 💰`
          : `Order #${ord.orderNumber} payment reset to PENDING`
      );
    } catch (err) {
      alert("Error updating payment: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Open Dispatch Modal
  const openDispatchModal = (ord) => {
    setDispatchOrder(ord);
    const existingCourier = ord.tracking?.courierName || "Delhivery";
    const existingAwb = ord.tracking?.trackingNumber || "";
    const matchedPreset = COURIER_PRESETS.find(
      (p) => p.name.toLowerCase() === existingCourier.toLowerCase()
    );
    const generatedUrl = ord.tracking?.trackingUrl || (matchedPreset ? matchedPreset.url(existingAwb) : "");

    setDispatchForm({
      courierName: existingCourier,
      trackingNumber: existingAwb,
      trackingUrl: generatedUrl,
      adminNotes: ord.adminNotes || "",
      markAsShipped: ord.status !== "shipped" && ord.status !== "delivered",
    });
  };

  // Handle Preset Click
  const handlePresetSelect = (preset) => {
    const newUrl = preset.url(dispatchForm.trackingNumber.trim());
    setDispatchForm((prev) => ({
      ...prev,
      courierName: preset.name,
      trackingUrl: newUrl,
    }));
  };

  // Handle Tracking Number Typing (Auto-updates URL if preset matches)
  const handleAwbChange = (awb) => {
    const matched = COURIER_PRESETS.find(
      (p) => p.name.toLowerCase() === dispatchForm.courierName.toLowerCase()
    );
    const updatedUrl = matched ? matched.url(awb.trim()) : dispatchForm.trackingUrl;
    setDispatchForm((prev) => ({
      ...prev,
      trackingNumber: awb,
      trackingUrl: updatedUrl,
    }));
  };

  // Save Dispatch & Tracking
  const handleSaveDispatch = async (e) => {
    e.preventDefault();
    if (!dispatchOrder) return;

    try {
      setUpdatingId(dispatchOrder._id);
      const targetStatus = dispatchForm.markAsShipped ? "shipped" : dispatchOrder.status;

      const res = await ordersAPI.updateStatus(dispatchOrder._id, {
        status: targetStatus,
        courierName: dispatchForm.courierName.trim(),
        trackingNumber: dispatchForm.trackingNumber.trim(),
        trackingUrl: dispatchForm.trackingUrl.trim(),
        adminNotes: dispatchForm.adminNotes.trim(),
      });

      if (res && res.order) {
        setOrders((prev) =>
          prev.map((o) => (o._id === dispatchOrder._id ? res.order : o))
        );
      }
      setDispatchOrder(null);
      showToast(`Tracking saved! Order #${dispatchOrder.orderNumber} ${dispatchForm.markAsShipped ? "marked as SHIPPED and" : ""} email sent via Resend.`);
    } catch (err) {
      alert("Error saving tracking: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (orderId, orderNum) => {
    if (!confirm(`Are you sure you want to permanently delete Order #${orderNum}?`)) return;
    try {
      await ordersAPI.delete(orderId);
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      if (dispatchOrder && dispatchOrder._id === orderId) setDispatchOrder(null);
      showToast(`Order #${orderNum} deleted.`);
    } catch (err) {
      alert("Error deleting order: " + err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase rounded-full bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Review</span>
          </span>
        );
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase rounded-full bg-blue-50 text-blue-800 border border-blue-300 shadow-2xs">
            <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>Confirmed</span>
          </span>
        );
      case "in_production":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase rounded-full bg-purple-50 text-purple-800 border border-purple-300 shadow-2xs">
            <Package className="w-3.5 h-3.5 text-purple-600" />
            <span>In Production</span>
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase rounded-full bg-indigo-50 text-indigo-800 border border-indigo-300 shadow-2xs">
            <Truck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Shipped</span>
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Delivered</span>
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase rounded-full bg-rose-50 text-rose-800 border border-rose-300 shadow-2xs">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-stone-100 text-stone-700 border border-stone-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-stone-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Manage 3D Orders</h1>
          <p className="text-xs text-stone-600">
            1-Click manufacturing lifecycle, instant Razorpay/Cash payment verification, and smart courier dispatch.
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Order #, Name, Phone, City..."
              className="pl-8 pr-3 py-2 rounded-xl bg-white border border-stone-200 text-xs w-60 sm:w-72 focus:outline-hidden focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-stone-900 text-white font-semibold text-xs hover:bg-stone-800 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: "all", label: "All Orders" },
          { key: "pending", label: `Pending Review (${stats.pending || 0})` },
          { key: "in_production", label: `Processing (${stats.in_production || 0})` },
          { key: "shipped", label: `Shipped (${stats.shipped || 0})` },
          { key: "delivered", label: `Delivered (${stats.delivered || 0})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeFilter === tab.key
                ? "bg-amber-600 text-white shadow-2xs"
                : "bg-white text-stone-600 hover:text-stone-900 border border-stone-200/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
          <p className="text-xs text-stone-500">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-stone-200/90 p-8 space-y-3 shadow-2xs">
          <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="text-base font-serif font-bold text-stone-900">No orders match your filter</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try resetting the search keyword or filter tab.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => {
            const isBusy = updatingId === ord._id;
            const isPaid = ord.paymentStatus === "paid";
            const cleanPhone = ord.customer?.phone?.replace(/[^0-9]/g, "") || "";

            return (
              <div
                key={ord._id}
                className="bg-white rounded-3xl border border-stone-200/90 shadow-2xs overflow-hidden transition-all hover:shadow-xs"
              >
                {/* 1. TOP HEADER: Order ID, Date & Distinct Status Display */}
                <div className="px-5 py-3.5 bg-stone-50/90 border-b border-stone-200/80 flex flex-wrap items-center justify-between gap-3">
                  {/* Left: Order ID, Creation Date/Time & Source */}
                  <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                    <Link
                      href={`/admin/orders/${ord._id}`}
                      className="font-mono font-bold text-sm text-stone-900 hover:text-amber-600 transition-colors flex items-center gap-1.5 group"
                      title="Open dedicated order detail page"
                    >
                      <span className="group-hover:underline">#{ord.orderNumber}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-600" />
                    </Link>

                    <span className="text-stone-300 hidden sm:inline">|</span>

                    {/* Order Date & Time */}
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-600">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span>
                        {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="text-stone-400">•</span>
                      <span className="text-stone-500 font-mono text-[11px]">
                        {new Date(ord.createdAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </span>
                    </div>

                    {ord.orderSource && (
                      <span className="px-2 py-0.5 rounded-full bg-stone-200/70 text-stone-600 text-[10px] font-semibold uppercase tracking-wider">
                        {ord.orderSource}
                      </span>
                    )}
                  </div>

                  {/* Right: STATUS SEPARATED & HIGHLY VISIBLE */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                    {/* Order Lifecycle Status */}
                    {getStatusBadge(ord.status)}

                    {/* Payment Status Badge & 1-Click Toggle */}
                    {isPaid ? (
                      <span
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold uppercase rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs"
                        title={ord.razorpayPaymentId ? `Razorpay: ${ord.razorpayPaymentId}` : "Paid via Razorpay / Verified"}
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Paid</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleTogglePayment(ord)}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold uppercase rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-colors cursor-pointer shadow-2xs"
                        title="Click to mark this order as Paid (Offline UPI / Cash)"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-amber-700" />
                        <span>Unpaid (Mark Paid 💰)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. MIDDLE CONTENT: 3-Column Structured Layout (Customer, Items, Logistics & Financials) */}
                <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Customer & Delivery Address (4 cols) */}
                  <div className="md:col-span-4 space-y-2.5 text-xs text-stone-600 border-b md:border-b-0 md:border-r border-stone-100 pb-4 md:pb-0 md:pr-6">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Customer & Delivery Details
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                        <User className="w-4 h-4 text-stone-400 shrink-0" />
                        <span>{ord.customer?.name || "Customer"}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <a
                          href={`tel:${ord.customer?.phone}`}
                          className="font-mono text-stone-800 hover:text-amber-600 font-semibold"
                        >
                          {ord.customer?.phone || "No phone"}
                        </a>
                      </div>

                      {ord.customer?.email && (
                        <div className="text-[11px] text-stone-500 truncate pl-5">
                          {ord.customer?.email}
                        </div>
                      )}

                      <div className="flex items-start gap-2 pt-1 text-[11px] text-stone-600 leading-relaxed">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                        <span>
                          {[
                            ord.customer?.address,
                            ord.customer?.city,
                            ord.customer?.state,
                            ord.customer?.pincode ? `- ${ord.customer?.pincode}` : "",
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>
                    </div>

                    {ord.customer?.notes && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-[11px]">
                        <strong className="block text-[10px] uppercase font-bold text-amber-800">Customer Note:</strong>
                        {ord.customer.notes}
                      </div>
                    )}
                  </div>

                  {/* Center Column: Ordered Products & Customizations (5 cols) */}
                  <div className="md:col-span-5 space-y-3 border-b md:border-b-0 md:border-r border-stone-100 pb-4 md:pb-0 md:pr-6">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Ordered Products ({ord.items?.length || 0})
                    </div>

                    <div className="space-y-3">
                      {ord.items?.map((item, idx) => {
                        const itemImg = getOrderItemImage(item);
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
                        const primaryPhoto = uniquePhotos[0]
                          ? resolveProductImage(uniquePhotos[0])
                          : null;

                        const nonPhotoSpecs = Object.entries(item.customization || {}).filter(
                          ([k, v]) => {
                            if (!v) return false;
                            const lk = k.toLowerCase();
                            return !lk.includes("photo") && !lk.includes("reference");
                          }
                        );

                        const photoEntry = Object.entries(item.customization || {}).find(([k]) => {
                          const lk = k.toLowerCase();
                          return lk.includes("photo") || lk.includes("reference");
                        });
                        const attachedFilename = photoEntry ? String(photoEntry[1]) : null;

                        return (
                          <div
                            key={idx}
                            className="flex items-start gap-3 text-xs bg-stone-50/60 p-2.5 rounded-2xl border border-stone-100"
                          >
                            <div className="relative shrink-0">
                              <img
                                src={itemImg}
                                alt={item.name}
                                className="w-14 h-14 object-cover rounded-xl border border-stone-200 bg-stone-100 shadow-2xs"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/images/products/fullbody-figurine-hero.jpeg";
                                }}
                              />
                              {primaryPhoto && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewPhoto(primaryPhoto)}
                                  className="absolute -bottom-1 -right-1 bg-amber-600 text-white rounded-full p-1 shadow-xs hover:bg-amber-700 transition-colors cursor-pointer"
                                  title={`View Customer Photo (${uniquePhotos.length})`}
                                >
                                  <Camera className="w-3 h-3" />
                                </button>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-stone-900 text-sm truncate">{item.name}</div>
                              <div className="text-[11px] text-stone-500 font-medium mt-0.5">
                                Qty: <span className="font-bold text-stone-800">{item.quantity}</span> • ₹{item.price} each
                              </div>

                              {nonPhotoSpecs.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {nonPhotoSpecs.map(([k, v]) => (
                                    <span
                                      key={k}
                                      className="px-2 py-0.5 text-[10px] bg-white text-stone-700 font-medium rounded-md border border-stone-200/90 shadow-2xs"
                                    >
                                      <strong className="text-stone-500 font-semibold">{k}:</strong> {String(v)}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {uniquePhotos.length > 0 ? (
                                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                  <button
                                    type="button"
                                    onClick={() => setPreviewPhoto(primaryPhoto)}
                                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-[10px] font-bold cursor-pointer transition-colors"
                                  >
                                    <Camera className="w-3 h-3 text-amber-600" />
                                    <span>
                                      View {uniquePhotos.length} Photo{uniquePhotos.length > 1 ? "s" : ""}
                                    </span>
                                    <ZoomIn className="w-2.5 h-2.5 text-amber-600" />
                                  </button>
                                </div>
                              ) : (item.hasPhoto || attachedFilename) ? (
                                <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-amber-700 font-semibold">
                                  <Camera className="w-3 h-3" /> Photo: {attachedFilename || "Attached by customer"}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Pricing & Courier Logistics (3 cols) */}
                  <div className="md:col-span-3 space-y-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Payment & Tracking
                    </div>

                    {/* Price Block */}
                    <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100 space-y-1">
                      <span className="text-[10px] font-semibold text-stone-500 block">Total Amount</span>
                      <div className="text-2xl font-serif font-black text-stone-900">
                        ₹{ord.totalAmount}
                      </div>
                      <div className="text-[10px] text-stone-500 flex items-center justify-between">
                        <span>{ord.itemCount || ord.items?.length} item(s)</span>
                        <span className="capitalize font-semibold text-stone-700">
                          {ord.paymentMethod || (isPaid ? "Razorpay" : "COD")}
                        </span>
                      </div>
                    </div>

                    {/* Courier / Tracking Block */}
                    <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100 space-y-1.5">
                      <span className="text-[10px] font-semibold text-stone-500 block">Logistics / Courier</span>
                      {ord.tracking?.trackingNumber ? (
                        <div className="space-y-1">
                          <div className="font-bold text-xs text-stone-800 flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-amber-600" />
                            <span>{ord.tracking.courierName || "Courier"}</span>
                          </div>
                          <div className="font-mono text-[11px] text-stone-600 bg-white px-2 py-0.5 rounded border border-stone-200">
                            {ord.tracking.trackingNumber}
                          </div>
                          {(() => {
                            const trackUrl =
                              ord.tracking.trackingUrl ||
                              COURIER_PRESETS.find(
                                (p) => p.name.toLowerCase() === ord.tracking.courierName?.toLowerCase()
                              )?.url(ord.tracking.trackingNumber);
                            return trackUrl ? (
                              <a
                                href={trackUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-amber-800 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg border border-amber-300 font-bold transition-colors cursor-pointer mt-1"
                                title="Open Live Courier Tracking in New Tab"
                              >
                                <Truck className="w-3 h-3 text-amber-700" />
                                <span>Track Live ↗</span>
                              </a>
                            ) : null;
                          })()}
                        </div>
                      ) : (
                        <div className="text-[11px] text-stone-400 italic py-1">
                          No tracking assigned yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. DEDICATED ACTIONS BAR AT THE BOTTOM (actions buttom me ho) */}
                <div className="px-5 py-3.5 bg-stone-50/90 border-t border-stone-200/80 flex flex-wrap items-center justify-between gap-3">
                  {/* Left: Quick Status Dropdown & Delete Action */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-stone-500">Status:</span>
                    <select
                      value={ord.status}
                      disabled={isBusy}
                      onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                      className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-white border border-stone-200 text-stone-800 focus:outline-hidden focus:border-amber-600 shadow-2xs cursor-pointer"
                      title="Directly update status"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="in_production">In Production</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleDeleteOrder(ord._id, ord.orderNumber)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title={`Delete Order #${ord.orderNumber}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Right: Primary Pipeline Transition & Quick Helper Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* 1-Click Primary Pipeline Action Button */}
                    {ord.status === "pending" && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleStatusChange(ord._id, "confirmed")}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
                        title="Approve specs & confirm order"
                      >
                        {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        <span>Approve & Confirm</span>
                      </button>
                    )}

                    {ord.status === "confirmed" && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleStatusChange(ord._id, "in_production")}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-colors cursor-pointer"
                        title="Start 3D Printing Process"
                      >
                        {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Package className="w-3.5 h-3.5" />}
                        <span>Start 3D Print</span>
                      </button>
                    )}

                    {ord.status === "in_production" && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => openDispatchModal(ord)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
                        title="3D printing complete! Assign tracking & ship"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Ready to Ship 📦</span>
                      </button>
                    )}

                    {ord.status === "shipped" && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleStatusChange(ord._id, "delivered")}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
                        title="Confirm package reached customer"
                      >
                        {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        <span>Mark Delivered 🎉</span>
                      </button>
                    )}

                    {ord.status === "delivered" && (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 rounded-xl">
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Fulfilled</span>
                      </span>
                    )}

                    {/* Logistics Dispatch Modal Button */}
                    <button
                      type="button"
                      onClick={() => openDispatchModal(ord)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 hover:border-stone-300 shadow-2xs transition-colors cursor-pointer"
                      title="Assign or Update Courier / AWB"
                    >
                      <Truck className="w-3.5 h-3.5 text-stone-500" />
                      <span>Logistics</span>
                    </button>

                    {/* WhatsApp Message Drawer Button */}
                    <button
                      type="button"
                      onClick={() => setWhatsAppMenuOrder(ord)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer shadow-2xs"
                      title="Open Smart WhatsApp Message Drawer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-current" />
                      <span>WhatsApp</span>
                    </button>

                    {/* View Detail Page Button */}
                    <Link
                      href={`/admin/orders/${ord._id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-stone-900 text-white hover:bg-stone-800 transition-colors shadow-2xs"
                    >
                      <span>View Order</span>
                      <ExternalLink className="w-3 h-3 text-stone-300" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* QUICK DISPATCH & COURIER LOGISTICS MODAL */}
      {/* ======================================================== */}
      {dispatchOrder && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-600" />
                  <span>Dispatch Order #{dispatchOrder.orderNumber}</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Assign courier partner, tracking AWB, and notify customer via Resend.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDispatchOrder(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDispatch} className="space-y-4 text-xs">
              {/* Courier Quick Presets */}
              <div className="space-y-1.5">
                <label className="font-semibold text-stone-700 flex items-center justify-between">
                  <span>Popular Courier Presets (1-Click)</span>
                  <span className="text-[10px] text-stone-400 font-normal">Auto-formats tracking link</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COURIER_PRESETS.map((p) => {
                    const isSelected = dispatchForm.courierName.toLowerCase() === p.name.toLowerCase();
                    return (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => handlePresetSelect(p)}
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

              {/* Courier Name */}
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Courier Partner Name</label>
                <input
                  type="text"
                  placeholder="e.g. Delhivery, Blue Dart, DTDC, India Post"
                  value={dispatchForm.courierName}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, courierName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
                  required
                />
              </div>

              {/* AWB Tracking Number */}
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">AWB / Consignment Tracking Number</label>
                <input
                  type="text"
                  placeholder="e.g. 14238719283"
                  value={dispatchForm.trackingNumber}
                  onChange={(e) => handleAwbChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 font-mono text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
                  required
                />
              </div>

              {/* Tracking Web URL */}
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Customer Tracking Web URL</label>
                <input
                  type="url"
                  placeholder="https://www.delhivery.com/track/package/..."
                  value={dispatchForm.trackingUrl}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, trackingUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
                />
                {dispatchForm.trackingUrl && (
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[10px] text-stone-400">
                      Live tracking link generated
                    </span>
                    <a
                      href={dispatchForm.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-900 hover:underline"
                    >
                      <Truck className="w-3 h-3" />
                      <span>Test Tracking Link ↗</span>
                    </a>
                  </div>
                )}
                {!dispatchForm.trackingUrl && (
                  <p className="text-[10px] text-stone-400">
                    This direct tracking link will be emailed to the customer and shown in their order status page.
                  </p>
                )}
              </div>

              {/* Internal / Studio Notes */}
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Studio Notes / Packaging Info</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Dual bubble wrap, fragile label applied. Weight: 250g."
                  value={dispatchForm.adminNotes}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, adminNotes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600 resize-none"
                />
              </div>

              {/* Mark as Shipped Checkbox */}
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dispatchForm.markAsShipped}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, markAsShipped: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="font-semibold text-stone-800">
                  Automatically change order status to "Shipped / In Transit"
                </span>
              </label>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleDeleteOrder(dispatchOrder._id, dispatchOrder.orderNumber)}
                  className="text-rose-600 hover:text-rose-700 font-semibold text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDispatchOrder(null)}
                    className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingId === dispatchOrder._id}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-1.5 shadow-2xs"
                  >
                    {updatingId === dispatchOrder._id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save & Notify Customer</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SMART WHATSAPP MESSAGE DRAWER */}
      {/* ======================================================== */}
      {whatsAppMenuOrder && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-600 fill-current" />
                  <span>WhatsApp Smart Messages</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Select a pre-crafted message for #{whatsAppMenuOrder.orderNumber} ({whatsAppMenuOrder.customer?.name})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setWhatsAppMenuOrder(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto">
              {getWhatsAppTemplates(whatsAppMenuOrder).map((tpl) => {
                const phone = whatsAppMenuOrder.customer?.phone?.replace(/[^0-9]/g, "") || "";
                const url = `https://wa.me/${phone}?text=${encodeURIComponent(tpl.text)}`;

                return (
                  <a
                    key={tpl.id}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setWhatsAppMenuOrder(null)}
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
                onClick={() => setWhatsAppMenuOrder(null)}
                className="w-full py-2 text-xs font-semibold rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
                src={previewPhoto}
                alt="Customer reference"
                className="max-h-[60vh] w-auto rounded-xl object-contain shadow-sm"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-stone-500 font-medium">Customer Upload</span>
              <a
                href={previewPhoto}
                download="customer-reference-photo.jpg"
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
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
        </div>
      }
    >
      <AdminOrdersContent />
    </Suspense>
  );
}
