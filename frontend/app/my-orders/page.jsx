"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  ExternalLink,
  MessageCircle,
  ArrowRight,
  Loader2,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ordersAPI } from "@/lib/api";
import SectionHeading from "@/components/common/SectionHeading";

export default function MyOrdersPage() {
  const { user, isAuthenticated, isLoaded } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoaded) {
      if (isAuthenticated) {
        fetchMyOrders();
      } else {
        setLoading(false);
      }
    }
  }, [isLoaded, isAuthenticated]);

  const fetchMyOrders = async () => {
    setLoading(true);
    try {
      const res = await ordersAPI.getMyOrders();
      if (res && res.orders) {
        setOrders(res.orders);
      }
    } catch (err) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/60 rounded-full">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Order Under Review</span>
          </span>
        );
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200/60 rounded-full">
            <CheckCircle className="w-3 h-3 text-blue-600" />
            <span>Confirmed</span>
          </span>
        );
      case "in_production":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200/60 rounded-full">
            <Package className="w-3 h-3 text-purple-600" />
            <span>Processing</span>
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200/60 rounded-full">
            <Truck className="w-3 h-3 text-indigo-600" />
            <span>Shipped / Dispatched</span>
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60 rounded-full">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>Delivered</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-stone-100 text-stone-700 rounded-full">
            <span>{status}</span>
          </span>
        );
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
        <p className="text-xs text-stone-500">Loading your custom 3D orders...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="py-16 max-w-md mx-auto px-4 text-center">
        <div className="bg-white rounded-3xl border border-stone-200/90 p-8 space-y-4 shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-serif font-bold text-stone-900">Sign in to view your orders</h2>
          <p className="text-xs text-stone-600">
            Please log in to your account to view your past orders, customization history, and real-time fabrication updates.
          </p>
          <div className="pt-2">
            <Link
              href="/login?redirect=/my-orders"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-stone-900 text-white font-semibold text-xs hover:bg-stone-800 transition-colors shadow-sm"
            >
              <span>Sign In to Account</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <SectionHeading
        eyebrow="My Account"
        title="Your 3D Printing Orders"
        description="Track fabrication stages, view customization specifications, and message our artisans on WhatsApp."
      />

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-stone-200/90 p-8 space-y-4 shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-serif font-bold text-stone-900">No orders placed yet</h3>
          <p className="text-xs text-stone-600 max-w-sm mx-auto">
            You haven't placed any 3D print orders under this account. Explore our bespoke catalog to create your first keepsake.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 text-white font-semibold text-xs hover:bg-amber-700 transition-colors shadow-sm"
            >
              <span>Explore Creations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id || order.orderNumber}
              className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden transition-all hover:shadow-md"
            >
              {/* Order Header */}
              <div className="p-5 sm:p-6 bg-stone-50/70 border-b border-stone-100 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/my-orders/${order._id || order.orderNumber}`}
                      className="font-mono font-bold text-sm text-stone-900 hover:text-amber-600 transition-colors flex items-center gap-1"
                      title="View live stage tracking & details"
                    >
                      <span>#{order.orderNumber}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                    </Link>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <Link
                    href={`/my-orders/${order._id || order.orderNumber}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-full transition-colors"
                  >
                    <span>Track Stage ↗</span>
                  </Link>

                  <a
                    href={order.whatsappUrl || `https://wa.me/916376145171?text=${encodeURIComponent(`Hello Prime3D! Checking update for Order #${order.orderNumber}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/70 rounded-full transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-current" />
                    <span>WhatsApp Chat</span>
                  </a>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-5 sm:p-6 space-y-4">
                <div className="divide-y divide-stone-100">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-4">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-xl border border-stone-200/80 bg-stone-100 shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
                          3D
                        </div>
                      )}

                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="text-sm font-semibold text-stone-900 truncate">{item.name}</h4>
                        <div className="text-[11px] text-stone-500">
                          Qty: {item.quantity} • ₹{item.price} each
                        </div>

                        {item.customization && Object.keys(item.customization).length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {Object.entries(item.customization).map(([k, v]) =>
                              v ? (
                                <span
                                  key={k}
                                  className="px-2 py-0.5 rounded text-[10px] bg-stone-100 text-stone-700 border border-stone-200"
                                >
                                  <strong>{k}:</strong> {v}
                                </span>
                              ) : null
                            )}
                          </div>
                        )}

                        {item.hasPhoto && (
                          <p className="text-[10px] text-amber-700 font-semibold pt-0.5">
                            📸 Reference photo shared
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0 font-semibold text-sm text-stone-900">
                        ₹{(Number(item.price) || 0) * (Number(item.quantity) || 1)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Address & Tracking */}
                <div className="pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-600">
                  <div className="space-y-1">
                    <p className="font-semibold text-stone-800">Delivery Address:</p>
                    <p className="leading-relaxed">
                      {order.customer.name} ({order.customer.phone})<br />
                      {order.customer.address}, {order.customer.city}, {order.customer.state} - {order.customer.pincode}
                    </p>
                  </div>

                  <div className="space-y-1 sm:text-right">
                    <p className="font-semibold text-stone-800">Total Order Amount:</p>
                    <p className="text-lg font-serif font-bold text-amber-700">₹{order.totalAmount}</p>

                    {order.tracking && order.tracking.trackingNumber && (
                      <div className="pt-1.5">
                        <span className="text-stone-500">Tracking: </span>
                        <span className="font-mono font-semibold text-stone-800">
                          {order.tracking.trackingNumber}
                        </span>
                        {order.tracking.trackingUrl && (
                          <a
                            href={order.tracking.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-800 ml-2"
                          >
                            <span>Track</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

