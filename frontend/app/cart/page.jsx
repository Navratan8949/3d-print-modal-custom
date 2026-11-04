"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  ArrowRight,
  Trash2,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  Navigation,
  FileText,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ordersAPI } from "@/lib/api";
import { getOrderItemImage } from "@/lib/orderImages";
import CartItem from "@/components/cart/CartItem";
import SectionHeading from "@/components/common/SectionHeading";

import { INDIAN_STATES } from "@/data/states";

export default function CartPage() {
  const {
    cart,
    isLoaded,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItemCount,
    getCartWhatsAppUrl,
  } = useCart();
  const { user, isAuthenticated } = useAuth();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "Rajasthan",
    pincode: "",
    notes: "",
  });

  // Touched state for field validation
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [allowGuest, setAllowGuest] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
        address: prev.address || user.addresses?.[0]?.address || "",
        city: prev.city || user.addresses?.[0]?.city || "",
        state: prev.state || user.addresses?.[0]?.state || "Rajasthan",
        pincode: prev.pincode || user.addresses?.[0]?.pincode || "",
      }));
    }
  }, [user]);

  const hasPhotoItems = cart.some((item) => item.hasPhoto);

  // Field validation rules
  const validateField = (name, value) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Full name is required.";
        if (value.trim().length < 3) return "Name must be at least 3 characters.";
        return "";
      case "phone":
        if (!value.trim()) return "Mobile / WhatsApp number is required.";
        const cleanPhone = value.replace(/[\s-]/g, "");
        if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
          return "Enter a valid 10-digit Indian mobile number (e.g. 9876543210).";
        }
        return "";
      case "email":
        if (value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return "Please enter a valid email address.";
        }
        return "";
      case "address":
        if (!value.trim()) return "Complete street address is required for delivery.";
        if (value.trim().length < 8) return "Please enter house/flat no. and street name.";
        return "";
      case "city":
        if (!value.trim()) return "City name is required.";
        return "";
      case "state":
        if (!value.trim()) return "Please select your state.";
        return "";
      case "pincode":
        if (!value.trim()) return "6-digit PIN code is required.";
        if (!/^\d{6}$/.test(value.trim())) return "PIN code must be exactly 6 digits.";
        return "";
      default:
        return "";
    }
  };

  // Compute all errors
  const errors = {
    name: validateField("name", formData.name),
    phone: validateField("phone", formData.phone),
    email: validateField("email", formData.email),
    address: validateField("address", formData.address),
    city: validateField("city", formData.city),
    state: validateField("state", formData.state),
    pincode: validateField("pincode", formData.pincode),
  };

  const isFormValid = !errors.name && !errors.phone && !errors.email && !errors.address && !errors.city && !errors.state && !errors.pincode;

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleWhatsAppOrder = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setTouched({
      name: true,
      phone: true,
      email: true,
      address: true,
      city: true,
      state: true,
      pincode: true,
    });

    if (!isFormValid) {
      const firstErrorField = ["name", "phone", "address", "city", "pincode"].find((f) => errors[f]);
      if (firstErrorField) {
        const el = document.getElementById(`field-${firstErrorField}`);
        if (el) {
          el.focus();
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        customer: {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
          notes: formData.notes.trim(),
        },
        items: cart.map((item) => ({
          productId: String(item.id || item.sku || ""),
          name: item.name,
          slug: item.slug || "",
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          image: getOrderItemImage(item),
          customization: item.customization || {},
          hasPhoto: Boolean(item.hasPhoto),
        })),
        orderSource: "whatsapp",
      };

      const res = await ordersAPI.create(orderPayload);
      clearCart();

      const targetUrl = res?.whatsappUrl || getCartWhatsAppUrl({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        notes: formData.notes.trim(),
      });

      window.open(targetUrl, "_blank", "noopener,noreferrer");
      setOrderPlaced(res.order || { orderNumber: "P3D-SUCCESS", ...orderPayload });
    } catch (err) {
      console.warn("Backend order creation error, falling back to direct WhatsApp link:", err.message);
      const url = getCartWhatsAppUrl({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        notes: formData.notes.trim(),
      });
      window.open(url, "_blank", "noopener,noreferrer");
      clearCart();
    } finally {
      setSubmitting(false);
    }
  };

  const isFieldError = (field) => (touched[field] || submitAttempted) && Boolean(errors[field]);
  const isFieldValid = (field) => touched[field] && !errors[field] && Boolean(formData[field]?.trim());

  if (orderPlaced) {
    return (
      <div className="py-16 sm:py-24 max-w-2xl mx-auto px-4 text-center space-y-6">
        <div className="bg-white rounded-3xl border border-stone-200/90 p-8 sm:p-10 shadow-sm space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-800">
              Order Confirmed & Logged
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              Thank You For Your Order!
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
              Your order has been registered in our database with Order ID{" "}
              <strong className="font-mono text-stone-900 font-bold">#{orderPlaced.orderNumber}</strong>.
              Email confirmation has been dispatched.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 text-left text-xs space-y-2">
            <div className="flex justify-between pb-2 border-b border-stone-200">
              <span className="text-stone-500">Customer:</span>
              <span className="font-semibold text-stone-900">{orderPlaced.customer?.name} ({orderPlaced.customer?.phone})</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-stone-200">
              <span className="text-stone-500">Delivery To:</span>
              <span className="font-semibold text-stone-900 text-right">{orderPlaced.customer?.city}, {orderPlaced.customer?.state}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Total Estimate:</span>
              <span className="font-bold text-amber-700 text-sm">₹{orderPlaced.totalAmount}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href={orderPlaced.whatsappUrl || `https://wa.me/916376145171?text=${encodeURIComponent(`Hello Prime3D! Order #${orderPlaced.orderNumber}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Open WhatsApp Chat</span>
            </a>

            <Link
              href={isAuthenticated ? `/my-orders/${orderPlaced.orderNumber || orderPlaced._id}` : "/my-orders"}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              <span>{isAuthenticated ? "Track Live in My Orders" : "View in My Orders"}</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <SectionHeading
        eyebrow="Order Review & Checkout"
        title="Your 3D Printing Bag"
        description="Verify your customized items, fill in your delivery details with accurate phone & address, and place your order directly via WhatsApp."
      />

      {!isLoaded ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-stone-200 border-t-amber-600 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-stone-500">Loading your inquiry bag...</p>
        </div>
      ) : cart.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-white border border-stone-200/90 p-8 space-y-5 max-w-xl mx-auto shadow-xs">
          <div className="w-20 h-20 mx-auto rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-serif font-bold text-stone-900">Your bag is currently empty</h3>
          <p className="text-xs sm:text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
            Ready to bring your memories or ideas to life? Explore our custom 3D figurines, sacred idols, and bespoke name models.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-stone-900 text-white font-semibold text-xs hover:bg-stone-800 transition-colors shadow-sm"
            >
              <span>Browse Catalog</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Selected Creations ({totalItemCount})
              </span>
              <button
                type="button"
                onClick={clearCart}
                className="text-xs text-stone-500 hover:text-red-600 transition-colors flex items-center gap-1.5 font-medium px-2 py-1 rounded-md hover:bg-red-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Items</span>
              </button>
            </div>

            <div className="space-y-3.5">
              {cart.map((item) => (
                <CartItem
                  key={item.cartId}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <Link
                href="/shop"
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1.5 transition-colors"
              >
                <span>← Add more items from Catalog</span>
              </Link>
              <span className="text-xs text-stone-500">
                Total Units: <strong className="text-stone-900">{totalItemCount}</strong>
              </span>
            </div>

            {/* Photo Alert for Custom Items */}
            {hasPhotoItems && (
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950 text-xs flex items-start gap-3 shadow-2xs">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold block">Photo Figurine Included:</span>
                  <p className="text-stone-700 leading-relaxed">
                    Once WhatsApp opens with your order details, please attach your original, clear photographs directly into the WhatsApp chat so our 3D sculpting artists can start modeling immediately.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Verified Checkout Form or Auth Gate */}
          <div className="lg:col-span-5 space-y-6">
            {!isAuthenticated && !allowGuest ? (
              <div className="rounded-3xl bg-white border border-stone-200/90 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700 shadow-2xs">
                    <User className="w-8 h-8 text-amber-600" />
                  </div>
                  <span className="inline-block px-3 py-1 text-[11px] font-bold tracking-widest uppercase bg-amber-100 text-amber-900 rounded-full">
                    Account Recommended to Place Order
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-stone-900">
                    Sign in to Complete Your Order
                  </h3>
                  <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
                    Sign in or create an account so this custom 3D order is securely linked to your profile, accessible for live stage tracking in <strong>My Orders</strong>, and auto-dispatched.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <Link
                    href="/login?redirect=/cart"
                    className="w-full py-3.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>Sign In to Continue</span>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                  </Link>

                  <Link
                    href="/register?redirect=/cart"
                    className="w-full py-3.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 text-amber-900 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <span>Create Free Account</span>
                    <ArrowRight className="w-4 h-4 text-amber-700" />
                  </Link>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 text-stone-600 text-[11px] space-y-1">
                  <div className="font-semibold text-stone-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Your bag is preserved</span>
                  </div>
                  <p>Your {cart.length} item(s) will remain in your cart when you sign in or register.</p>
                </div>

                <div className="pt-2 border-t border-stone-100 text-center">
                  <button
                    type="button"
                    onClick={() => setAllowGuest(true)}
                    className="text-xs text-stone-500 hover:text-stone-800 underline font-medium transition-colors"
                  >
                    Or continue as Guest (Direct WhatsApp Order)
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl bg-white border border-stone-200/90 p-6 sm:p-7 shadow-xs space-y-6">
                {isAuthenticated ? (
                  <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                        {user?.name ? user.name[0] : "U"}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-stone-900 truncate">
                          Ordering as {user?.name}
                        </div>
                        <div className="text-[11px] text-emerald-800 truncate">
                          {user?.email} • Order linked to account
                        </div>
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 ml-2" />
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between text-xs text-amber-900">
                    <span>Checking out as Guest</span>
                    <Link href="/login?redirect=/cart" className="font-semibold underline text-amber-950">
                      Sign In instead
                    </Link>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                    <span>Shipping & Delivery Details</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    {isAuthenticated
                      ? "Your delivery details have been pre-filled from your profile."
                      : "All fields marked with * are required for dispatch."}
                  </p>
                </div>

                <form onSubmit={handleWhatsAppOrder} noValidate className="space-y-4">
                {/* 1. Full Name */}
                <div>
                  <label
                    htmlFor="field-name"
                    className="text-xs font-semibold text-stone-800 flex items-center justify-between mb-1"
                  >
                    <span>Full Name <span className="text-red-600">*</span></span>
                    {isFieldValid("name") && (
                      <span className="text-[11px] text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Valid
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="field-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      onBlur={() => handleBlur("name")}
                      placeholder="e.g. Rahul Sharma"
                      className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border rounded-xl focus:outline-none transition-colors ${
                        isFieldError("name")
                          ? "border-red-500 focus:border-red-600 bg-red-50/20"
                          : "border-stone-200 focus:border-amber-600 focus:bg-white"
                      }`}
                    />
                  </div>
                  {isFieldError("name") && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 animate-fade-in">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>

                {/* 2. Phone / WhatsApp Number */}
                <div>
                  <label
                    htmlFor="field-phone"
                    className="text-xs font-semibold text-stone-800 flex items-center justify-between mb-1"
                  >
                    <span>WhatsApp / Mobile Number <span className="text-red-600">*</span></span>
                    {isFieldValid("phone") && (
                      <span className="text-[11px] text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Valid
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <span className="absolute left-10 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-500 border-r border-stone-300 pr-2 pointer-events-none">
                      +91
                    </span>
                    <input
                      id="field-phone"
                      type="tel"
                      maxLength={10}
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value.replace(/\D/g, ""))}
                      onBlur={() => handleBlur("phone")}
                      placeholder="10 digit mobile number"
                      className={`w-full pl-22 pr-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border rounded-xl focus:outline-none transition-colors font-medium tabular-nums ${
                        isFieldError("phone")
                          ? "border-red-500 focus:border-red-600 bg-red-50/20"
                          : "border-stone-200 focus:border-amber-600 focus:bg-white"
                      }`}
                    />
                  </div>
                  {isFieldError("phone") && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 animate-fade-in">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>

                {/* 3. Email (Optional) */}
                <div>
                  <label
                    htmlFor="field-email"
                    className="text-xs font-semibold text-stone-800 flex items-center justify-between mb-1"
                  >
                    <span>Email Address <span className="text-stone-400 font-normal">(Optional for invoice)</span></span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="field-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      placeholder="e.g. rahul@example.com"
                      className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border rounded-xl focus:outline-none transition-colors ${
                        isFieldError("email")
                          ? "border-red-500 focus:border-red-600 bg-red-50/20"
                          : "border-stone-200 focus:border-amber-600 focus:bg-white"
                      }`}
                    />
                  </div>
                  {isFieldError("email") && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 animate-fade-in">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                {/* 4. Complete Delivery Address */}
                <div>
                  <label
                    htmlFor="field-address"
                    className="text-xs font-semibold text-stone-800 flex items-center justify-between mb-1"
                  >
                    <span>Complete Delivery Address <span className="text-red-600">*</span></span>
                    {isFieldValid("address") && (
                      <span className="text-[11px] text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Valid
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
                    <textarea
                      id="field-address"
                      rows={2}
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      onBlur={() => handleBlur("address")}
                      placeholder="House / Flat No., Building, Street Name, Landmark"
                      className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border rounded-xl focus:outline-none transition-colors ${
                        isFieldError("address")
                          ? "border-red-500 focus:border-red-600 bg-red-50/20"
                          : "border-stone-200 focus:border-amber-600 focus:bg-white"
                      }`}
                    />
                  </div>
                  {isFieldError("address") && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 animate-fade-in">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.address}</span>
                    </p>
                  )}
                </div>

                {/* 5. City, State & Pincode Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* City */}
                  <div>
                    <label
                      htmlFor="field-city"
                      className="text-xs font-semibold text-stone-800 block mb-1"
                    >
                      City <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <Building className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="field-city"
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                        onBlur={() => handleBlur("city")}
                        placeholder="e.g. Jaipur"
                        className={`w-full pl-8.5 pr-2.5 py-2 text-xs bg-stone-50 border rounded-xl focus:outline-none transition-colors ${
                          isFieldError("city")
                            ? "border-red-500 bg-red-50/20"
                            : "border-stone-200 focus:border-amber-600 focus:bg-white"
                        }`}
                      />
                    </div>
                    {isFieldError("city") && (
                      <p className="text-[10px] text-red-600 mt-0.5">{errors.city}</p>
                    )}
                  </div>

                  {/* State */}
                  <div>
                    <label
                      htmlFor="field-state"
                      className="text-xs font-semibold text-stone-800 block mb-1"
                    >
                      State <span className="text-red-600">*</span>
                    </label>
                    <select
                      id="field-state"
                      value={formData.state}
                      onChange={(e) => handleChange("state", e.target.value)}
                      className="w-full px-2.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white transition-colors"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pincode */}
                  <div>
                    <label
                      htmlFor="field-pincode"
                      className="text-xs font-semibold text-stone-800 block mb-1"
                    >
                      PIN Code <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <Navigation className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="field-pincode"
                        type="text"
                        maxLength={6}
                        value={formData.pincode}
                        onChange={(e) => handleChange("pincode", e.target.value.replace(/\D/g, ""))}
                        onBlur={() => handleBlur("pincode")}
                        placeholder="6 digits"
                        className={`w-full pl-8.5 pr-2.5 py-2 text-xs bg-stone-50 border rounded-xl focus:outline-none transition-colors tabular-nums ${
                          isFieldError("pincode")
                            ? "border-red-500 bg-red-50/20"
                            : "border-stone-200 focus:border-amber-600 focus:bg-white"
                        }`}
                      />
                    </div>
                    {isFieldError("pincode") && (
                      <p className="text-[10px] text-red-600 mt-0.5">{errors.pincode}</p>
                    )}
                  </div>
                </div>

                {/* 6. Order Instructions / Target Date */}
                <div>
                  <label
                    htmlFor="field-notes"
                    className="text-xs font-semibold text-stone-800 block mb-1"
                  >
                    Order Instructions / Required By Date <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
                    <textarea
                      id="field-notes"
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => handleChange("notes", e.target.value)}
                      placeholder="e.g. Birthday gift, need before 15th November. Please gift wrap."
                      className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                {/* Order Summary Strip */}
                <div className="pt-4 border-t border-stone-100 space-y-3">
                  <div className="flex items-center justify-between text-xs text-stone-600">
                    <span>Order Items Count</span>
                    <span className="font-bold text-stone-900">{totalItemCount} Units</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-stone-600">
                    <span>Payment & Pricing</span>
                    <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                      Verified Custom Quote via WhatsApp
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-stone-500 pt-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Safe direct chat with Prime3D studio team. No hidden charges.</span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:opacity-75"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Logging Order & Opening WhatsApp...</span>
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-4 h-4 fill-current" />
                        <span>Confirm & Send Order on WhatsApp</span>
                      </>
                    )}
                  </button>

                  {submitAttempted && !isFormValid && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>Please correct the highlighted fields above to proceed.</span>
                    </div>
                  )}
                </div>
              </form>
            </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
