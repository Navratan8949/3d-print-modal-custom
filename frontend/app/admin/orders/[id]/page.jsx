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
} from "lucide-react";
import { ordersAPI } from "@/lib/api";

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
        setSuccessMsg("Order status & tracking updated! Customer email notification dispatched in background.");
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
        return <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-purple-50 text-purple-800 border border-purple-200">3D Printing In Progress</span>;
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
    { key: "in_production", label: "3D Printing", icon: Package },
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
  const whatsAppDirectUrl = `https://wa.me/${cleanCustomerPhone}?text=${encodeURIComponent(
    `Hello ${order?.customer?.name || "Customer"}! Prime 3D Lab here regarding your custom 3D printing Order #${order?.orderNumber}. Current status: ${status.toUpperCase()}.`
  )}`;

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
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Printer className="w-4 h-4 text-stone-500" />
            <span className="hidden sm:inline">Print Receipt / Invoice</span>
            <span className="sm:hidden">Print</span>
          </button>

          <a
            href={whatsAppDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Chat on WhatsApp</span>
          </a>

          <button
            onClick={handleDeleteOrder}
            className="p-2 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs transition-colors shadow-2xs"
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

      {/* Visual Stepper Timeline */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
            3D Fabrication & Logistics Stage
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
          {/* ORDERED PRODUCTS CARD (Supports MULTIPLE PRODUCTS) */}
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
              {order.items?.map((item, idx) => (
                <div key={idx} className="p-5 space-y-4 hover:bg-stone-50/40 transition-colors">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Product Image */}
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-2xl border border-stone-200 bg-stone-100 shrink-0 shadow-2xs"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex flex-col items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          <Package className="w-6 h-6 mb-1 text-amber-600" />
                          <span>3D</span>
                        </div>
                      )}

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
                          Product ID / SKU: {item.productId || `#${idx + 1}`}
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

                  {/* Customization Details Box */}
                  {item.customization && Object.keys(item.customization).length > 0 && (
                    <div className="bg-amber-50/40 border border-amber-200/70 rounded-2xl p-3.5 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Custom 3D Fabrication Specs</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {Object.entries(item.customization).map(([k, v]) =>
                          v ? (
                            <div key={k} className="p-2 bg-white/90 rounded-xl border border-amber-100">
                              <span className="text-stone-500 block text-[10px] uppercase font-bold">{k}:</span>
                              <span className="text-stone-900 font-medium">{String(v)}</span>
                            </div>
                          ) : null
                        )}
                      </div>
                    </div>
                  )}

                  {/* Attached Reference Photo */}
                  {(item.hasPhoto || item.referencePhotoUrl) && (
                    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                          📸
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-stone-900">
                            Reference Photo Attached by Customer
                          </p>
                          <p className="text-[11px] text-stone-500">
                            Used for face sculpting, figurine proportioning, or custom 3D model geometry
                          </p>
                        </div>
                      </div>

                      {item.referencePhotoUrl && (
                        <button
                          type="button"
                          onClick={() => setPreviewPhoto(item.referencePhotoUrl)}
                          className="px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition-colors shrink-0"
                        >
                          View Photo
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ======================================================== */}
          {/* FABRICATION & LOGISTICS MANAGER FORM */}
          {/* ======================================================== */}
          <form
            onSubmit={handleSaveChanges}
            className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs space-y-5"
          >
            <div>
              <h2 className="font-serif font-bold text-base text-stone-900">
                Fabrication & Courier Management
              </h2>
              <p className="text-xs text-stone-500">
                Updating stage or tracking dispatches a background Nodemailer notification to the customer.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Order Stage</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
                >
                  <option value="pending">Pending Review (Waiting confirmation)</option>
                  <option value="confirmed">Confirmed (Scheduled for print)</option>
                  <option value="in_production">3D Printing In Progress (Slicing/Resin)</option>
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
                >
                  <option value="pending">Pending (WhatsApp / UPI not received)</option>
                  <option value="paid">Paid & Verified (Full Payment)</option>
                  <option value="partial">Partially Paid (Advance Deposit)</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Courier Partner</label>
                <input
                  type="text"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="e.g. Delhivery / Blue Dart"
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">AWB / Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. 14238719283"
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
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
                Changes will be saved to MongoDB instantly.
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
              <a
                href={whatsAppDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 font-semibold text-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600 fill-current" />
                <span>Message on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Financial Breakdown Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs space-y-4">
            <h3 className="font-serif font-bold text-sm text-stone-900 pb-3 border-b border-stone-100">
              Payment & Bill Summary
            </h3>

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

              <div className="pt-2 flex items-center justify-between text-[11px]">
                <span className="text-stone-400">Payment Status:</span>
                <span
                  className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                    paymentStatus === "paid"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Uploaded Reference Photo */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="bg-white rounded-3xl p-4 max-w-lg w-full space-y-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h4 className="font-serif font-bold text-sm text-stone-900">Customer Reference Photo</h4>
              <button
                onClick={() => setPreviewPhoto(null)}
                className="text-stone-400 hover:text-stone-900 text-xs px-2 py-1 rounded-lg"
              >
                ✕ Close
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto flex items-center justify-center">
              <img
                src={previewPhoto}
                alt="Customer reference"
                className="max-h-[65vh] w-auto rounded-xl object-contain shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

