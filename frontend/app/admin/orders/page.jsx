"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ShoppingBag,
  Search,
  Filter,
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
} from "lucide-react";
import { ordersAPI } from "@/lib/api";
import { getOrderItemImage } from "@/lib/orderImages";

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ pending: 0, in_production: 0, shipped: 0, delivered: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [activeFilter, setActiveFilter] = useState("all");

  // Selected Order Modal / Details
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [trackingForm, setTrackingForm] = useState({
    courierName: "",
    trackingNumber: "",
    trackingUrl: "",
    adminNotes: "",
  });

  useEffect(() => {
    fetchOrders();
  }, [activeFilter]);

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

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(true);
      await ordersAPI.updateStatus(orderId, { status: newStatus });
      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert("Error updating status: " + err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveTracking = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      setUpdatingStatus(true);
      const res = await ordersAPI.updateStatus(selectedOrder._id, {
        status: selectedOrder.status,
        courierName: trackingForm.courierName,
        trackingNumber: trackingForm.trackingNumber,
        trackingUrl: trackingForm.trackingUrl,
        adminNotes: trackingForm.adminNotes,
      });
      if (res && res.order) {
        setOrders((prev) =>
          prev.map((o) => (o._id === selectedOrder._id ? res.order : o))
        );
        setSelectedOrder(res.order);
      }
      alert("Tracking & Studio notes updated! Email notification sent to customer.");
    } catch (err) {
      alert("Error saving tracking: " + err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!confirm("Are you sure you want to delete this order record?")) return;
    try {
      await ordersAPI.delete(orderId);
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(null);
      }
    } catch (err) {
      alert("Error deleting order: " + err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-amber-50 text-amber-800 border border-amber-200">Pending Review</span>;
      case "confirmed":
        return <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-blue-50 text-blue-800 border border-blue-200">Confirmed</span>;
      case "in_production":
        return <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-purple-50 text-purple-800 border border-purple-200">Processing</span>;
      case "shipped":
        return <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">Shipped</span>;
      case "delivered":
        return <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">Delivered</span>;
      case "cancelled":
        return <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-rose-50 text-rose-800 border border-rose-200">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-stone-100 text-stone-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Manage 3D Orders</h1>
          <p className="text-xs text-stone-600">
            View orders, contact customers directly on WhatsApp, and update print/delivery statuses.
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Order #, Name, Phone..."
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
          { key: "pending", label: `Pending (${stats.pending || 0})` },
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
          {orders.map((ord) => (
            <div
              key={ord._id}
              className="bg-white rounded-3xl border border-stone-200/90 shadow-2xs overflow-hidden transition-all hover:shadow-xs"
            >
              {/* Order Card Header */}
              <div className="p-4 sm:p-5 bg-stone-50/80 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Link
                    href={`/admin/orders/${ord._id}`}
                    className="font-mono font-bold text-sm text-stone-900 hover:text-amber-600 transition-colors flex items-center gap-1.5"
                    title="Open dedicated order detail page"
                  >
                    <span>#{ord.orderNumber}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                  </Link>
                  {getStatusBadge(ord.status)}
                  <span className="text-[11px] text-stone-400">
                    {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status Dropdown */}
                  <select
                    value={ord.status}
                    disabled={updatingStatus}
                    onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-stone-200 text-stone-800 focus:outline-hidden focus:border-amber-600"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in_production">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  {/* WhatsApp Quick Link */}
                  <a
                    href={`https://wa.me/${ord.customer?.phone?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `Hello ${ord.customer?.name}! Prime 3D Lab here regarding your custom 3D printing Order #${ord.orderNumber}. We are processing your request.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/70 rounded-lg transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-current" />
                    <span>WhatsApp</span>
                  </a>

                  {/* Dedicated Detail Page Link */}
                  <Link
                    href={`/admin/orders/${ord._id}`}
                    className="px-3 py-1 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-500 transition-colors shadow-2xs"
                  >
                    Full Details ↗
                  </Link>

                  <button
                    onClick={() => {
                      setSelectedOrder(ord);
                      setTrackingForm({
                        courierName: ord.tracking?.courierName || "",
                        trackingNumber: ord.tracking?.trackingNumber || "",
                        trackingUrl: ord.tracking?.trackingUrl || "",
                        adminNotes: ord.adminNotes || "",
                      });
                    }}
                    className="px-3 py-1 text-xs font-semibold rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition-colors"
                  >
                    Quick Tracking
                  </button>
                </div>
              </div>

              {/* Order Card Body */}
              <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                {/* Customer Info (Left) */}
                <div className="md:col-span-4 space-y-1.5 text-xs text-stone-600 border-b md:border-b-0 md:border-r border-stone-100 pb-4 md:pb-0 md:pr-4">
                  <div className="flex items-center gap-2 font-semibold text-stone-900">
                    <User className="w-3.5 h-3.5 text-stone-400" />
                    <span>{ord.customer?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    <span className="font-mono">{ord.customer?.phone}</span>
                  </div>
                  {ord.customer?.email && (
                    <div className="text-[11px] text-stone-500 truncate">
                      {ord.customer?.email}
                    </div>
                  )}
                  <div className="flex items-start gap-2 pt-1 text-[11px] text-stone-500">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                    <span>
                      {ord.customer?.address}, {ord.customer?.city}, {ord.customer?.state} - {ord.customer?.pincode}
                    </span>
                  </div>
                  {ord.customer?.notes && (
                    <div className="pt-1.5 p-2 rounded-lg bg-amber-50/60 text-amber-900 text-[11px]">
                      <strong>Customer Note:</strong> {ord.customer.notes}
                    </div>
                  )}
                </div>

                {/* Items Info (Middle) */}
                <div className="md:col-span-6 space-y-2.5">
                  {ord.items?.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs">
                      {(() => {
                        const itemImg = getOrderItemImage(item);
                        return (
                          <div className="relative shrink-0">
                            <img
                              src={itemImg}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-lg border border-stone-200 bg-stone-100 shadow-2xs"
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
                                className="absolute -bottom-1 -right-1 bg-amber-600 text-white rounded-full p-0.5 shadow-xs"
                                title="View Customer Reference Photo"
                              >
                                <Camera className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        );
                      })()}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-stone-900 truncate">{item.name}</div>
                        <div className="text-[11px] text-stone-500">
                          Qty: {item.quantity} • ₹{item.price} each
                        </div>

                        {item.customization && Object.keys(item.customization).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(item.customization).map(([k, v]) =>
                              v ? (
                                <span
                                  key={k}
                                  className="px-1.5 py-0.5 text-[9px] bg-stone-100 text-stone-700 rounded border border-stone-200"
                                >
                                  <strong>{k}:</strong> {v}
                                </span>
                              ) : null
                            )}
                          </div>
                        )}

                        {item.hasPhoto && (
                          <span className="inline-block mt-0.5 text-[10px] text-amber-700 font-semibold">
                            📸 Custom reference photo shared via WhatsApp/upload
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Amount & Admin Tracking (Right) */}
                <div className="md:col-span-2 text-right space-y-2">
                  <div className="text-base font-serif font-bold text-stone-900">
                    ₹{ord.totalAmount}
                  </div>
                  <div className="text-[10px] text-stone-400">
                    {ord.itemCount || ord.items?.length} item(s)
                  </div>

                  {ord.tracking?.trackingNumber ? (
                    <div className="text-[10px] text-stone-500 space-y-0.5 text-right pt-2 border-t border-stone-100">
                      <div className="font-semibold text-stone-800">{ord.tracking.courierName || 'Courier'}</div>
                      <div className="font-mono text-stone-600">{ord.tracking.trackingNumber}</div>
                    </div>
                  ) : (
                    <span className="inline-block text-[10px] text-stone-400 italic pt-2">
                      No tracking yet
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details & Tracking Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900">
                  Order #{selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-stone-500">Update tracking and studio notes</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTracking} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Courier Partner Name</label>
                <input
                  type="text"
                  placeholder="e.g. DTDC, Delhivery, BlueDart, India Post"
                  value={trackingForm.courierName}
                  onChange={(e) => setTrackingForm({ ...trackingForm, courierName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Tracking / AWB Number</label>
                <input
                  type="text"
                  placeholder="e.g. D123456789"
                  value={trackingForm.trackingNumber}
                  onChange={(e) => setTrackingForm({ ...trackingForm, trackingNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 font-mono text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Courier Tracking URL</label>
                <input
                  type="url"
                  placeholder="https://track.courier.com/..."
                  value={trackingForm.trackingUrl}
                  onChange={(e) => setTrackingForm({ ...trackingForm, trackingUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Studio Internal / Customer Notes</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Resin curing done, layer height 0.05mm, hand paint gold finish in progress."
                  value={trackingForm.adminNotes}
                  onChange={(e) => setTrackingForm({ ...trackingForm, adminNotes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleDeleteOrder(selectedOrder._id)}
                  className="text-rose-600 hover:text-rose-700 font-semibold text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Order</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingStatus}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-1.5"
                  >
                    {updatingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save & Notify Customer</span>
                  </button>
                </div>
              </div>
            </form>
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
