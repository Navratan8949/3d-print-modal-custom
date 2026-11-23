"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  User as UserIcon,
  Package,
  Clock,
  CheckCircle,
  Truck,
  Download,
  ExternalLink,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Save,
  X,
  Loader2,
  Sparkles,
  ArrowRight,
  ShoppingBag,
  AlertCircle,
  MessageCircle,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ordersAPI, authAPI } from "@/lib/api";
import { generateReceiptPdf } from "@/lib/generateReceiptPdf";
import { getOrderItemImage } from "@/lib/orderImages";

export default function UserProfilePage() {
  const { user, isAuthenticated, isLoaded, isAdmin, refreshUser, logout } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderError, setOrderError] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // "all" | "active" | "delivered" | "cancelled"
  const [downloadingId, setDownloadingId] = useState(null);

  // Profile Edit Mode
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null); // { type: "success" | "error", text: string }

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Populate form from user data
  useEffect(() => {
    if (user) {
      const defaultAddr = user.addresses && user.addresses.length > 0 ? user.addresses[0] : {};
      setFormData({
        name: user.name || "",
        phone: user.phone || defaultAddr.phone || "",
        address: defaultAddr.address || "",
        city: defaultAddr.city || "",
        state: defaultAddr.state || "",
        pincode: defaultAddr.pincode || "",
      });
    }
  }, [user]);

  // Load user orders
  useEffect(() => {
    if (isLoaded && isAuthenticated) {
      fetchOrders();
    } else if (isLoaded && !isAuthenticated) {
      setLoadingOrders(false);
    }
  }, [isLoaded, isAuthenticated]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    setOrderError("");
    try {
      const res = await ordersAPI.getMyOrders();
      if (res && res.orders) {
        setOrders(res.orders);
      }
    } catch (err) {
      setOrderError(err.message || "Failed to load orders");
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);

    try {
      const res = await authAPI.updateProfile(formData);
      if (res && res.success) {
        await refreshUser();
        setProfileMsg({
          type: "success",
          text: "Profile updated successfully!",
        });
        setIsEditingProfile(false);
        setTimeout(() => setProfileMsg(null), 4000);
      } else {
        throw new Error(res?.message || "Failed to update profile");
      }
    } catch (err) {
      setProfileMsg({
        type: "error",
        text: err.message || "Failed to save profile changes",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDownloadPdf = (order) => {
    if (!order) return;
    try {
      setDownloadingId(order._id);
      generateReceiptPdf(order);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to download receipt PDF. Please try again.");
    } finally {
      setTimeout(() => setDownloadingId(null), 800);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 rounded-full">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Order Under Review</span>
          </span>
        );
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200/80 rounded-full">
            <ShieldCheck className="w-3 h-3 text-blue-600" />
            <span>Confirmed</span>
          </span>
        );
      case "in_production":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200/80 rounded-full">
            <Package className="w-3 h-3 text-purple-600" />
            <span>3D Printing Active</span>
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200/80 rounded-full">
            <Truck className="w-3 h-3 text-indigo-600" />
            <span>Dispatched / In Transit</span>
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-full">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>Delivered Successfully</span>
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 rounded-full">
            <X className="w-3 h-3 text-rose-600" />
            <span>Cancelled</span>
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

  // Stats calculation
  const totalOrdersCount = orders.length;
  const activeOrders = orders.filter(
    (o) => o.status === "pending" || o.status === "confirmed" || o.status === "in_production" || o.status === "shipped"
  );
  const deliveredOrders = orders.filter((o) => o.status === "delivered");
  const cancelledOrders = orders.filter((o) => o.status === "cancelled");
  const totalSpent = deliveredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // Filtered orders for tab display
  const filteredOrders = orders.filter((o) => {
    if (activeTab === "active") {
      return ["pending", "confirmed", "in_production", "shipped"].includes(o.status);
    }
    if (activeTab === "delivered") return o.status === "delivered";
    if (activeTab === "cancelled") return o.status === "cancelled";
    return true; // "all"
  });

  if (!isLoaded) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
        <p className="text-xs text-stone-500">Loading your profile & studio history...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="py-20 max-w-md mx-auto px-4 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-50 border border-amber-200/70 flex items-center justify-center text-amber-600 shadow-sm">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-stone-900">Sign in to view your profile</h2>
        <p className="text-xs text-stone-600 leading-relaxed">
          Access your personal account, saved shipping addresses, and full history of handcrafted 3D prints.
        </p>
        <div className="pt-2">
          <Link
            href="/login?redirect=/profile"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs shadow-md transition-all active:scale-95"
          >
            <span>Sign In to Your Account</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </Link>
        </div>
      </div>
    );
  }

  const defaultAddr = user.addresses && user.addresses.length > 0 ? user.addresses[0] : null;

  return (
    <div className="py-8 sm:py-14 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* 1. TOP HERO ACCOUNT CARD */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 relative overflow-hidden">
        {/* Subtle Ambient Studio Glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-linear-to-br from-amber-500/10 to-orange-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          {/* User Avatar & Core Details */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-linear-to-tr from-amber-600 via-amber-500 to-amber-600 text-white flex items-center justify-center font-serif text-2xl sm:text-3xl font-bold shadow-md shadow-amber-600/25 ring-4 ring-amber-50 shrink-0">
              {user?.name ? user.name[0].toUpperCase() : "U"}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                  {user?.name || "Prime 3D Collector"}
                </h1>
                {isAdmin ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                    Studio Administrator
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700">
                    Bespoke Patron
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  <span>{user?.email}</span>
                </span>
                {user?.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    <span>{user.phone}</span>
                  </span>
                )}
              </div>

              <p className="text-[11px] text-stone-400">
                Member since{" "}
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                      month: "short",
                      year: "numeric",
                    })
                  : "2026"}
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-stone-600" />
              <span>{isEditingProfile ? "Close Edit" : "Edit Profile"}</span>
            </button>

            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-xs transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Portal</span>
              </Link>
            )}

            <button
              type="button"
              onClick={logout}
              className="p-2 rounded-xl bg-white border border-stone-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
              title="Sign Out"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-stone-100 relative z-10">
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
              Total Orders
            </span>
            <span className="text-xl font-serif font-bold text-stone-900 mt-0.5 block">
              {totalOrdersCount}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
              In Fabrication / Transit
            </span>
            <span className="text-xl font-serif font-bold text-amber-950 mt-0.5 block">
              {activeOrders.length}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
              Delivered Keepsakes
            </span>
            <span className="text-xl font-serif font-bold text-emerald-950 mt-0.5 block">
              {deliveredOrders.length}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
              Total Spent
            </span>
            <span className="text-xl font-serif font-bold text-stone-900 mt-0.5 block">
              ₹{totalSpent.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Feedback Toast */}
      {profileMsg && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm flex items-center justify-between gap-3 animate-fade-in ${
            profileMsg.type === "success"
              ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
              : "bg-red-50 text-red-900 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {profileMsg.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-medium">{profileMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setProfileMsg(null)}
            className="text-stone-400 hover:text-stone-700 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. PROFILE EDIT FORM (COLLAPSIBLE) */}
      {isEditingProfile && (
        <div className="bg-white rounded-3xl border border-amber-300 shadow-md p-6 sm:p-8 space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900">
                Update Account Information
              </h3>
              <p className="text-xs text-stone-500">
                Keep your shipping details and contact info up to date for seamless courier delivery.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingProfile(false)}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Your Name"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                  Phone Number (for Courier & Updates)
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="House / Flat No., Street, Landmark"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="State"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                  Postal Code / PIN
                </label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g. 302001"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-60"
              >
                {savingProfile ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save Profile Info</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. USER ORDERS SECTION (CORE REQUEST) */}
      <div className="space-y-4">
        {/* Section Header with Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-600" />
              <h2 className="text-xl font-serif font-bold text-stone-900">
                Your 3D Printing Orders ({orders.length})
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Live tracking, manufacturing milestones, and instant PDF invoice downloads.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl border border-stone-200/80">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "all"
                  ? "bg-white text-stone-900 shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              All ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("active")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "active"
                  ? "bg-white text-stone-900 shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              In Progress ({activeOrders.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("delivered")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "delivered"
                  ? "bg-white text-stone-900 shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Delivered ({deliveredOrders.length})
            </button>
          </div>
        </div>

        {orderError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{orderError}</span>
          </div>
        )}

        {/* Loading State */}
        {loadingOrders ? (
          <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-stone-200/90 shadow-2xs">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
            <p className="text-xs text-stone-500 font-mono">Loading your custom 3D orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Empty State */
          <div className="py-16 text-center bg-white rounded-3xl border border-stone-200/90 p-8 space-y-4 shadow-2xs">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-50 flex items-center justify-center text-amber-600">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-serif font-bold text-stone-900">
              {activeTab === "all"
                ? "No 3D print orders found"
                : `No ${activeTab} orders at the moment`}
            </h3>
            <p className="text-xs text-stone-600 max-w-sm mx-auto">
              Explore our handcrafted 3D miniatures, sacred idols, and illuminated name art to create your first bespoke keepsake.
            </p>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs shadow-sm transition-all"
              >
                <span>Browse 3D Catalog</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </Link>
            </div>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const items = order.items && order.items.length > 0 ? order.items : [];
              const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              const isPaid =
                order.paymentStatus === "completed" ||
                order.paymentStatus === "paid" ||
                order.status !== "pending";

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-3xl border border-stone-200/90 shadow-2xs hover:shadow-sm transition-all overflow-hidden space-y-4 p-5 sm:p-6"
                >
                  {/* Card Header Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-base text-stone-900">
                          Order #{order.orderNumber}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-[11px] text-stone-400">
                        Placed on {orderDate} • {items.length} Product(s)
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-500 font-medium">Total:</span>
                      <span className="text-base font-serif font-bold text-stone-950">
                        ₹{(order.totalAmount || 0).toLocaleString("en-IN")}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPaid
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200/80"
                            : "bg-amber-50 text-amber-800 border border-amber-200/80"
                        }`}
                      >
                        {isPaid ? "Paid ✓" : "Payment Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Items Preview List */}
                  <div className="space-y-2.5">
                    {items.map((item, idx) => {
                      const itemImg = getOrderItemImage(item);
                      const itemName = item.name || item.product?.name || "Custom 3D Print";
                      const itemQty = item.quantity || 1;
                      const itemPrice = item.price || 0;

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-stone-50 border border-stone-100"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={itemImg}
                              alt={itemName}
                              className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0 bg-white"
                              onError={(e) => {
                                e.target.src = "/images/products/3d-miniature.png";
                              }}
                            />
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-stone-900 truncate">
                                {itemName}
                              </h4>
                              <p className="text-[10px] text-stone-500">
                                Qty: {itemQty} × ₹{itemPrice.toLocaleString("en-IN")}
                              </p>
                            </div>
                          </div>

                          <span className="text-xs font-bold text-stone-900 shrink-0">
                            ₹{(itemQty * itemPrice).toLocaleString("en-IN")}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Card Footer: Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="text-xs text-stone-500">
                      {order.tracking?.trackingNumber ? (
                        <span className="inline-flex items-center gap-1.5 text-indigo-700 font-semibold text-[11px]">
                          <Truck className="w-3.5 h-3.5" />
                          <span>
                            {order.tracking.courierName || "Courier"}: {order.tracking.trackingNumber}
                          </span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-stone-400">
                          Fabricated with 0.05mm ultra-fine SLA precision
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* PDF Receipt Button */}
                      <button
                        type="button"
                        onClick={() => handleDownloadPdf(order)}
                        disabled={downloadingId === order._id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer disabled:opacity-60"
                        title="Download Tax Invoice (PDF)"
                      >
                        {downloadingId === order._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                        ) : (
                          <Download className="w-3.5 h-3.5 text-stone-500" />
                        )}
                        <span>Receipt (PDF)</span>
                      </button>

                      {/* WhatsApp Inquiry */}
                      <a
                        href={`https://wa.me/916376145171?text=${encodeURIComponent(
                          `Hello Prime 3D Lab! I am checking status on my Order #${order.orderNumber}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold shadow-2xs transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Support</span>
                      </a>

                      {/* Full Tracking Details Page */}
                      <Link
                        href={`/my-orders/${order._id}`}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-2xs transition-all active:scale-95"
                      >
                        <span>Track Specs & Photos</span>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
