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
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ordersAPI } from "@/lib/api";
import { getOrderItemImage } from "@/lib/orderImages";

export default function CustomerOrderDetailPage({ params }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  const { user, isAuthenticated, isLoaded } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const getStageIndex = (st) => {
    const idx = stages.findIndex((s) => s.key === st);
    return idx === -1 ? 0 : idx;
  };

  const currentStageIndex = order ? getStageIndex(order.status) : 0;

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
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Printer className="w-4 h-4 text-stone-500" />
            <span>Print Receipt</span>
          </button>

          <a
            href={whatsAppInquiryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>WhatsApp Support</span>
          </a>
        </div>
      </div>

      {/* Visual Stepper Timeline */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Fabrication & Delivery Status
          </span>
          <div>{getStatusBadge(order.status)}</div>
        </div>

        {/* Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
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
                  {isCurrent ? "In Progress" : isPast ? "Done" : "Pending"}
                </span>
              </div>
            );
          })}
        </div>

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
          {order.items?.map((item, idx) => (
            <div key={idx} className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  {(() => {
                    const itemImg = getOrderItemImage(item);
                    return (
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
                        {item.referencePhotoUrl && (
                          <a
                            href={item.referencePhotoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute -bottom-1 -right-1 bg-amber-600 text-white rounded-full p-1 shadow-xs"
                            title="Reference photo attached"
                          >
                            <Camera className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    );
                  })()}

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

              {/* Customization Details */}
              {item.customization && Object.keys(item.customization).length > 0 && (
                <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3 space-y-1 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    Customization Specs:
                  </span>
                  <div className="flex flex-wrap gap-2 pt-0.5">
                    {Object.entries(item.customization).map(([k, v]) =>
                      v ? (
                        <span
                          key={k}
                          className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-800 text-[11px]"
                        >
                          <strong>{k}:</strong> {String(v)}
                        </span>
                      ) : null
                    )}
                  </div>
                </div>
              )}

              {item.hasPhoto && (
                <p className="text-[11px] text-amber-800 font-semibold flex items-center gap-1 pt-1">
                  <span>📸 Reference photo shared with Studio</span>
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Pricing Summary Footer */}
        <div className="p-5 bg-stone-50/70 border-t border-stone-100 space-y-2 text-xs">
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
    </div>
  );
}

