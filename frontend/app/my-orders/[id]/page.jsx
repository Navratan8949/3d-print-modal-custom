"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  Truck,
  ExternalLink,
  MessageCircle,
  Loader2,
  AlertCircle,
  Printer,
  ShieldCheck,
  MapPin,
  Sparkles,
  Phone,
  Mail,
  ShoppingBag,
  Camera,
  ZoomIn,
  Download,
  Upload,
  Trash2,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ordersAPI, paymentAPI } from "@/lib/api";
import { loadRazorpayScript } from "@/lib/razorpay";
import {
  getOrderItemImage,
  getOrderReferencePhotos,
  filterCustomizationSpecs,
  isPhotoEditingAllowed,
} from "@/lib/orderImages";
import { generateReceiptPdf } from "@/lib/generateReceiptPdf";
import OrderReferenceGallery from "@/components/orders/OrderReferenceGallery";
import CustomerPhotoUpdateModal from "@/components/orders/CustomerPhotoUpdateModal";

export default function CustomerOrderDetailPage({ params }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  const { user, isAuthenticated, isLoaded } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoFeedback, setPhotoFeedback] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleDownloadReceipt = () => {
    if (!order) return;
    try {
      setDownloadingPdf(true);
      generateReceiptPdf(order);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to download PDF receipt. Please try again.");
    } finally {
      setTimeout(() => setDownloadingPdf(false), 800);
    }
  };

  const handlePayNow = async () => {
    if (!order) return;
    setPaying(true);
    setPayError("");
    try {
      const scriptReady = await loadRazorpayScript();
      if (!scriptReady) {
        throw new Error("Razorpay failed to load. Please check your internet connection.");
      }

      const res = await paymentAPI.createOrder({ orderId: order._id });
      if (!res.success || !res.razorpayOrderId) {
        throw new Error(res.message || "Failed to initialize payment");
      }

      const razorpayKey = res.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      const options = {
        key: razorpayKey,
        amount: res.amount,
        currency: res.currency || "INR",
        name: "Prime 3D Printing Lab",
        description: `Order #${order.orderNumber}`,
        order_id: res.razorpayOrderId,
        handler: async function (response) {
          try {
            const verifyRes = await paymentAPI.verifyPayment({
              orderId: order._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verifyRes.success && verifyRes.order) {
              setOrder(verifyRes.order);
            }
          } catch (e) {
            setPayError(e.message);
          } finally {
            setPaying(false);
          }
        },
        prefill: {
          name: order.customer?.name,
          email: order.customer?.email,
          contact: order.customer?.phone,
        },
        theme: {
          color: "#d97706",
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        const errObj = response?.error || {};
        const reason = errObj.description || errObj.reason || "Payment declined or cancelled.";
        setPayError(`Payment not completed: ${reason}`);
        setPaying(false);
      });
      rzp.open();
    } catch (e) {
      setPayError(e?.message || "Could not initialize payment.");
      setPaying(false);
    }
  };

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
      } else {
        setError("Order details could not be found.");
      }
    } catch (err) {
      setError(err.message || "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 rounded-full">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Order Under Review</span>
          </span>
        );
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200/80 rounded-full">
            <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>Confirmed & Scheduled</span>
          </span>
        );
      case "in_production":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200/80 rounded-full">
            <Package className="w-3.5 h-3.5 text-purple-600" />
            <span>Processing</span>
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200/80 rounded-full">
            <Truck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Shipped / Dispatched</span>
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-full">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Delivered Successfully</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-stone-100 text-stone-700 rounded-full">
            <span>{status}</span>
          </span>
        );
    }
  };

  const stages = [
    { key: "pending", label: "Received", icon: Clock },
    { key: "confirmed", label: "Confirmed", icon: ShieldCheck },
    { key: "in_production", label: "Processing", icon: Package },
    { key: "shipped", label: "Dispatched", icon: Truck },
    { key: "delivered", label: "Delivered", icon: CheckCircle },
  ];

  // Precise milestone progression mapping:
  // - pending: Received is Done; Confirmed is In Progress (under review).
  // - confirmed: Received & Confirmed are Done; Processing is In Progress (in print queue).
  // - in_production: Received & Confirmed are Done; Processing is In Progress (active 3D printing).
  // - shipped: Received, Confirmed & Processing are Done; Dispatched is In Transit.
  // - delivered: ALL 5 stages are Done.
  const getStageMeta = (stageIndex, currentStatus) => {
    if (currentStatus === "cancelled") {
      if (stageIndex === 0) return { state: "done", text: "Done" };
      return { state: "cancelled", text: "Cancelled" };
    }

    if (currentStatus === "delivered") {
      return { state: "done", text: "Done" };
    }

    if (currentStatus === "shipped") {
      if (stageIndex < 3) return { state: "done", text: "Done" };
      if (stageIndex === 3) return { state: "current", text: "In Transit" };
      return { state: "pending", text: "Pending" };
    }

    if (currentStatus === "in_production") {
      if (stageIndex < 2) return { state: "done", text: "Done" };
      if (stageIndex === 2) return { state: "current", text: "In Progress" };
      return { state: "pending", text: "Pending" };
    }

    if (currentStatus === "confirmed") {
      if (stageIndex < 2) return { state: "done", text: "Done" };
      if (stageIndex === 2) return { state: "current", text: "In Progress" };
      return { state: "pending", text: "Pending" };
    }

    // Default: "pending"
    if (stageIndex === 0) return { state: "done", text: "Done" };
    if (stageIndex === 1) return { state: "current", text: "In Progress" };
    return { state: "pending", text: "Pending" };
  };

  const getProgressPercent = (currentStatus) => {
    switch (currentStatus) {
      case "pending":
        return 0;
      case "confirmed":
        return 25;
      case "in_production":
        return 50;
      case "shipped":
        return 75;
      case "delivered":
        return 100;
      case "cancelled":
        return 0;
      default:
        return 0;
    }
  };

  const getStageInsight = (st) => {
    switch (st) {
      case "delivered":
        return {
          title: "Order Fulfilled & Delivered Successfully 🎉",
          desc: "Your bespoke 3D creation has arrived safely. Thank you for trusting Prime 3D Lab with your keepsake!",
          badge: "bg-emerald-50 text-emerald-900 border-emerald-200/80",
          iconColor: "text-emerald-600 bg-emerald-100",
        };
      case "shipped":
        return {
          title: "Dispatched & In Transit with Courier 🚚",
          desc: "Your model has passed quality inspection and is safely packaged with 5-layer shockproof cushioning. Live courier tracking details are active below.",
          badge: "bg-indigo-50 text-indigo-950 border-indigo-200/80",
          iconColor: "text-indigo-600 bg-indigo-100",
        };
      case "in_production":
        return {
          title: "Precision 3D Printing & Additive Fabrication Active ⚡",
          desc: "High-resolution SLA/DLP printing is actively running layer-by-layer at 0.05mm precision, followed by ultrasonic alcohol curing and hand finishing.",
          badge: "bg-amber-50 text-amber-950 border-amber-200/80",
          iconColor: "text-amber-600 bg-amber-100",
        };
      case "confirmed":
        return {
          title: "Order Confirmed & Fabrication Queued ✓",
          desc: "Reference images and 3D geometry parameters have been verified. Your job has been scheduled in our printing laboratory queue.",
          badge: "bg-emerald-50 text-emerald-900 border-emerald-200/80",
          iconColor: "text-emerald-600 bg-emerald-100",
        };
      case "cancelled":
        return {
          title: "Order Cancelled",
          desc: "This order has been cancelled. For refunds or re-ordering support, feel free to chat with our WhatsApp support team.",
          badge: "bg-rose-50 text-rose-950 border-rose-200/80",
          iconColor: "text-rose-600 bg-rose-100",
        };
      default:
        return {
          title: "Order Received & Awaiting Verification ⏳",
          desc: "We have received your custom order request. Our digital sculptors are reviewing your uploaded reference photos and fabrication specifications.",
          badge: "bg-stone-50 text-stone-900 border-stone-200/80",
          iconColor: "text-stone-600 bg-stone-200",
        };
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
        <p className="text-xs text-stone-500">Loading order fabrication progress...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-16 max-w-md mx-auto px-4 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-serif font-bold text-stone-900">Order Not Found</h2>
        <p className="text-xs text-stone-600">{error || "Could not retrieve order details."}</p>
        <Link
          href="/my-orders"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white font-semibold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Orders</span>
        </Link>
      </div>
    );
  }

  const whatsAppInquiryUrl = `https://wa.me/916376145171?text=${encodeURIComponent(
    `Hello Prime 3D Lab! I am checking status on my Order #${order.orderNumber} placed for ₹${order.totalAmount}.`
  )}`;

  return (
    <div className="py-8 sm:py-14 max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/my-orders"
            className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-stone-900 transition-colors shadow-2xs"
            title="Back to Orders"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-stone-900">
              Order #{order.orderNumber}
            </h1>
            <p className="text-xs text-stone-500">
              Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadReceipt}
            disabled={downloadingPdf}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-60"
            title="Download Tax Invoice & Order Receipt (PDF)"
          >
            {downloadingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            ) : (
              <Download className="w-4 h-4 text-amber-400" />
            )}
            <span>{downloadingPdf ? "Generating PDF..." : "Download Receipt (PDF)"}</span>
          </button>

          <a
            href={whatsAppInquiryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">WhatsApp Support</span>
            <span className="sm:hidden">Help</span>
          </a>
        </div>
      </div>

      {/* Photo Update Feedback Toast / Banner */}
      {photoFeedback && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm flex items-center justify-between gap-3 animate-fade-in ${
            photoFeedback.type === "success"
              ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
              : "bg-red-50 text-red-900 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {photoFeedback.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-medium">{photoFeedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setPhotoFeedback(null)}
            className="text-stone-400 hover:text-stone-700 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Visual Stepper Timeline - Ultra-Premium Luxury Studio Tracker */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6 relative overflow-hidden">
        {/* Subtle Luxury Ambient Background Glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  order.status === "delivered" ? "bg-emerald-500" : "bg-amber-500 animate-ping"
                }`}
              />
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                Studio Fabrication & Logistics
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900 mt-0.5">
              Live Order Fulfillment Pipeline
            </h2>
          </div>
          <div>{getStatusBadge(order.status)}</div>
        </div>

        {/* Stepper with Connected Rail */}
        <div className="relative py-3 sm:py-5">
          {/* Base Track Line */}
          <div className="absolute top-8 sm:top-10 left-[10%] right-[10%] h-1 sm:h-1.5 bg-stone-100 rounded-full border border-stone-200/50 z-0">
            {/* Active Filled Track Line */}
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                order.status === "delivered"
                  ? "bg-linear-to-r from-emerald-500 via-teal-500 to-emerald-600 shadow-xs shadow-emerald-500/30"
                  : "bg-linear-to-r from-emerald-500 via-amber-500 to-amber-500 shadow-xs shadow-amber-500/30"
              }`}
              style={{
                width: `${getProgressPercent(order.status)}%`,
              }}
            />
          </div>

          {/* 5 Milestone Nodes */}
          <div className="flex items-start justify-between relative z-10">
            {stages.map((stage, idx) => {
              const Icon = stage.icon;
              const meta = getStageMeta(idx, order.status);
              const isDone = meta.state === "done";
              const isCurrent = meta.state === "current";
              const isCancelled = meta.state === "cancelled";

              return (
                <div
                  key={stage.key}
                  className="w-1/5 flex flex-col items-center text-center px-0.5 sm:px-2 group"
                >
                  {/* Station Node */}
                  <div
                    className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl sm:rounded-3xl flex items-center justify-center transition-all duration-300 relative ${
                      isCurrent
                        ? "bg-linear-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/35 ring-4 ring-amber-100 sm:scale-105"
                        : isDone
                        ? "bg-linear-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-600/25 ring-4 ring-white"
                        : isCancelled
                        ? "bg-rose-100 text-rose-500 ring-4 ring-white"
                        : "bg-white border-2 border-stone-200 text-stone-400 ring-4 ring-white shadow-2xs"
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" />

                    {/* Floating Done Badge */}
                    {isDone && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white text-emerald-700 flex items-center justify-center shadow-xs border border-emerald-100 text-[9px] font-extrabold">
                        ✓
                      </span>
                    )}

                    {/* Pulsing Active Indicator */}
                    {isCurrent && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-300 border-2 border-white animate-ping" />
                    )}
                  </div>

                  {/* Stage Label */}
                  <span
                    className={`text-[11px] sm:text-xs mt-2.5 transition-colors leading-tight ${
                      isCurrent
                        ? "text-stone-950 font-bold"
                        : isDone
                        ? "text-stone-900 font-bold"
                        : "text-stone-400 font-medium"
                    }`}
                  >
                    {stage.label}
                  </span>

                  {/* Status Micro-Pill */}
                  <span
                    className={`text-[9px] sm:text-[10px] mt-1 px-2 py-0.5 rounded-full font-semibold transition-all ${
                      isCurrent
                        ? "bg-amber-100 text-amber-900 border border-amber-300/80 shadow-2xs animate-pulse"
                        : isDone
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200/70"
                        : isCancelled
                        ? "bg-rose-50 text-rose-600"
                        : "bg-stone-100 text-stone-400"
                    }`}
                  >
                    {meta.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Stage Intelligence / Insight Card */}
        {(() => {
          const insight = getStageInsight(order.status);
          return (
            <div
              className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-start gap-3.5 transition-all ${insight.badge}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${insight.iconColor}`}
              >
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold">{insight.title}</h4>
                <p className="text-xs opacity-90 leading-relaxed">{insight.desc}</p>
              </div>
            </div>
          );
        })()}

        {/* Courier Tracking Box (if active) */}
        {order.tracking && order.tracking.trackingNumber && (
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-900 font-semibold text-xs">
                <Truck className="w-4 h-4 text-indigo-600" />
                <span>Courier Tracking Details</span>
              </div>
              {order.tracking.trackingUrl && (
                <a
                  href={order.tracking.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:underline"
                >
                  <span>Track Consignment Online</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-indigo-950 pt-1">
              <div>
                <span className="text-indigo-600/80 text-[10px] uppercase font-bold block">Courier:</span>
                <span className="font-medium">{order.tracking.courierName || "Standard Express"}</span>
              </div>
              <div>
                <span className="text-indigo-600/80 text-[10px] uppercase font-bold block">Tracking / AWB #:</span>
                <span className="font-mono font-semibold">{order.tracking.trackingNumber}</span>
              </div>
            </div>
          </div>
        )}

        {/* Studio Notes (if any) */}
        {order.adminNotes && (
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700 space-y-1">
            <span className="font-bold text-[10px] uppercase tracking-wider text-stone-500 block">
              Studio Artisan Note:
            </span>
            <p className="leading-relaxed">{order.adminNotes}</p>
          </div>
        )}
      </div>

      {/* Ordered Products (Multiple Products Support!) */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <h2 className="font-serif font-bold text-base text-stone-900">
            Items in this Order ({order.items?.length || 0})
          </h2>
          <span className="text-xs font-semibold text-stone-500">
            {order.itemCount || order.items?.reduce((a, b) => a + (b.quantity || 1), 0) || 1} Total Unit(s)
          </span>
        </div>

        <div className="divide-y divide-stone-100">
          {order.items?.map((item, idx) => {
            const itemImg = getOrderItemImage(item);
            const refPhotos = getOrderReferencePhotos(order, item);
            const cleanSpecs = filterCustomizationSpecs(item.customization);
            const canEditPhotos = isPhotoEditingAllowed(order);

            return (
              <div key={idx} className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <img
                        src={itemImg}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-2xl border border-stone-200 bg-stone-100 shadow-2xs"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/images/products/fullbody-figurine-hero.jpeg";
                        }}
                      />
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-semibold text-sm text-stone-900">{item.name}</h3>
                      <p className="text-xs text-stone-500">
                        ₹{item.price} × {item.quantity} unit(s)
                      </p>
                      {item.slug && (
                        <Link
                          href={`/products/${item.slug}`}
                          className="inline-flex items-center gap-1 text-[11px] text-amber-700 hover:underline"
                        >
                          <span>View Product Page</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-serif font-bold text-sm text-stone-900">
                      ₹{(Number(item.price) || 0) * (Number(item.quantity) || 1)}
                    </span>
                  </div>
                </div>

                {/* Customization Details (Clean specs only, no raw technical paths) */}
                {cleanSpecs.length > 0 && (
                  <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3 space-y-1 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                      Customization Specs:
                    </span>
                    <div className="flex flex-wrap gap-2 pt-0.5">
                      {cleanSpecs.map(([k, v]) => (
                        <span
                          key={k}
                          className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-800 text-[11px]"
                        >
                          <strong>{k}:</strong> {String(v)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Customer Reference Photos Gallery with Update Option */}
                {(refPhotos.length > 0 || item.hasPhoto) && (
                  <div className="pt-2">
                    <OrderReferenceGallery
                      photos={refPhotos}
                      title="Your Reference Photos"
                      allowUpdate={canEditPhotos}
                      isProductionLocked={!canEditPhotos}
                      onOpenUpdate={() => setIsPhotoModalOpen(true)}
                      maxPhotos={5}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pricing & Payment Summary Footer */}
        <div className="p-5 bg-stone-50/70 border-t border-stone-100 space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-stone-600">
            <span>Items Subtotal</span>
            <span>₹{order.totalAmount}</span>
          </div>
          <div className="flex items-center justify-between text-stone-600">
            <span>Standard Express Shipping</span>
            <span className="text-emerald-700 font-medium">Free</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-stone-200/80">
            <span className="font-bold text-sm text-stone-900">Total Order Amount</span>
            <span className="font-serif font-bold text-lg text-stone-900">₹{order.totalAmount}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-stone-100">
            <span className="text-stone-500 font-medium">Payment Status:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                order.paymentStatus === "paid"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-amber-100 text-amber-800 border border-amber-300"
              }`}
            >
              {order.paymentStatus === "paid" ? "Paid via Razorpay" : order.paymentStatus || "Pending"}
            </span>
          </div>

          {order.razorpayPaymentId && (
            <div className="flex items-center justify-between text-[11px] text-stone-500">
              <span>Razorpay Payment ID:</span>
              <span className="font-mono text-stone-800 font-semibold">{order.razorpayPaymentId}</span>
            </div>
          )}

          {/* Pay Now Button if payment is pending and order not cancelled */}
          {order.paymentStatus !== "paid" && order.status !== "cancelled" && (
            <div className="pt-3">
              <button
                type="button"
                onClick={handlePayNow}
                disabled={paying}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer disabled:opacity-60"
              >
                {paying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Opening Razorpay Gateway...</span>
                  </>
                ) : (
                  <>
                    <span>Pay ₹{order.totalAmount} Online via Razorpay</span>
                  </>
                )}
              </button>
              {payError && (
                <p className="text-[11px] text-red-600 mt-2 text-center">{payError}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delivery & Customer Info Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs space-y-4">
        <h3 className="font-serif font-bold text-sm text-stone-900 pb-3 border-b border-stone-100">
          Delivery Address & Contact
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-stone-400 text-[10px] uppercase font-bold block">Customer:</span>
            <span className="font-semibold text-stone-900 block">{order.customer?.name}</span>
            <span className="text-stone-600 block">{order.customer?.phone}</span>
            {order.customer?.email && <span className="text-stone-500 block">{order.customer.email}</span>}
          </div>

          <div className="space-y-1">
            <span className="text-stone-400 text-[10px] uppercase font-bold block">Shipping To:</span>
            <span className="text-stone-800 font-medium block leading-relaxed">{order.customer?.address}</span>
            <span className="text-stone-600 block">
              {order.customer?.city}, {order.customer?.state} - {order.customer?.pincode}
            </span>
          </div>
        </div>
      </div>

      {/* Customer Reference Photo Upload / Update Modal */}
      <CustomerPhotoUpdateModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        order={order}
        onPhotosUpdated={(updatedOrder) => {
          setOrder(updatedOrder);
          setPhotoFeedback({
            type: "success",
            text: "Reference photos updated successfully! Live in your 3D fabrication specs.",
          });
          setTimeout(() => setPhotoFeedback(null), 5000);
        }}
      />
    </div>
  );
}

