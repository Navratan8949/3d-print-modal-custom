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
  CreditCard,
  Lock,
  Sparkles,
  X,
  ExternalLink,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ordersAPI, paymentAPI, policiesAPI } from "@/lib/api";
import { loadRazorpayScript } from "@/lib/razorpay";
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

  // Payment Method: "razorpay" (online payment) or "whatsapp" (manual inquiry)
  const [paymentMethod, setPaymentMethod] = useState("razorpay");

  // Store Policies & Legal Modals State
  const [policies, setPolicies] = useState({
    printOnOrderTitle: "INCLUDES PRINT-ON-ORDER ITEMS",
    printOnOrderNotice:
      "Production begins after payment. Each item's staff-provided estimate is shown in your cart.",
    termsAndConditions: "",
    privacyPolicy: "",
    refundPolicy: "",
  });
  const [activePolicyModal, setActivePolicyModal] = useState(null); // "terms" | "privacy" | "refund" | null

  useEffect(() => {
    let isMounted = true;
    policiesAPI
      .get()
      .then((res) => {
        if (isMounted && res?.success && res.policies) {
          setPolicies((prev) => ({ ...prev, ...res.policies }));
        }
      })
      .catch((err) => {
        console.warn("Could not fetch store policies:", err?.message || err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Status & Validation States
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paymentStatusText, setPaymentStatusText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
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

  // Calculate cart subtotal
  const subtotal = cart.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );

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

  const isFormValid =
    !errors.name &&
    !errors.phone &&
    !errors.email &&
    !errors.address &&
    !errors.city &&
    !errors.state &&
    !errors.pincode;

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ========================================================
  // 1. ONLINE PAYMENT HANDLER (RAZORPAY)
  // ========================================================
  const handleRazorpayPayment = async () => {
    setSubmitAttempted(true);
    setErrorMessage("");
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
    setPaymentStatusText("Connecting to secure payment gateway...");

    try {
      // 1. Load Razorpay Checkout Script
      const scriptReady = await loadRazorpayScript();
      if (!scriptReady) {
        throw new Error("Razorpay payment gateway failed to load. Please verify your internet connection.");
      }

      setPaymentStatusText("Preparing order and payment invoice...");

      // 2. Prepare payload
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
        items: cart.map((item) => {
          const refPhotos = [
            ...(Array.isArray(item.referencePhotos) ? item.referencePhotos : []),
            ...(Array.isArray(item.customization?.referencePhotos)
              ? item.customization.referencePhotos
              : []),
            ...(item.referencePhotoUrl ? [item.referencePhotoUrl] : []),
            ...(item.customization?.referencePhotoUrl ? [item.customization.referencePhotoUrl] : []),
          ]
            .map((p) => (typeof p === "string" ? p : p?.url || p?.preview))
            .filter(Boolean);

          const uniquePhotos = Array.from(new Set(refPhotos));
          const primaryPhoto = uniquePhotos[0] || "";

          return {
            productId: String(item.id || item.sku || ""),
            name: item.name,
            slug: item.slug || "",
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 1,
            image: getOrderItemImage(item),
            customization: item.customization || {},
            hasPhoto: Boolean(item.hasPhoto || uniquePhotos.length > 0),
            referencePhotoUrl: primaryPhoto,
            referencePhotos: uniquePhotos,
          };
        }),
        totalAmount: subtotal,
      };

      // 3. Request backend to create Order & Razorpay Order
      const res = await paymentAPI.createOrder(orderPayload);
      if (!res.success || !res.razorpayOrderId) {
        throw new Error(res.message || "Failed to initialize Razorpay order.");
      }

      setPaymentStatusText("Waiting for payment authorization...");

      const razorpayKey = res.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      // 4. Open Razorpay modal
      const options = {
        key: razorpayKey,
        amount: res.amount,
        currency: res.currency || "INR",
        name: "Prime 3D Printing Lab",
        description: `Order #${res.orderNumber}`,
        image: "/logo.png",
        order_id: res.razorpayOrderId,
        handler: async function (response) {
          try {
            setSubmitting(true);
            setPaymentStatusText("Verifying payment with bank & Razorpay...");

            // 5. Send signatures to backend for HMAC verification
            const verifyRes = await paymentAPI.verifyPayment({
              orderId: res.orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.success && verifyRes.order) {
              clearCart();
              setOrderPlaced(verifyRes.order);
            } else {
              setErrorMessage(verifyRes.message || "Payment verification failed. Please contact studio support.");
            }
          } catch (verifyErr) {
            console.warn("Payment verification notice:", verifyErr?.message || verifyErr);
            setErrorMessage("Payment verification failed: " + (verifyErr?.message || "Please contact studio support."));
          } finally {
            setSubmitting(false);
            setPaymentStatusText("");
          }
        },
        prefill: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          contact: formData.phone.trim(),
        },
        notes: {
          orderNumber: res.orderNumber,
          customerCity: formData.city.trim(),
        },
        theme: {
          color: "#d97706",
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false);
            setPaymentStatusText("");
            setErrorMessage("Payment was not completed. You can try again or order directly via WhatsApp.");
          },
        },
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on("payment.failed", function (response) {
        const errorDetails = response?.error || {};
        const reason =
          errorDetails.description ||
          errorDetails.reason ||
          (errorDetails.code ? `Code: ${errorDetails.code}` : null) ||
          "Payment was declined or cancelled by bank.";

        console.warn("Razorpay Payment Notice:", reason);
        setErrorMessage(`Payment not completed: ${reason} You can try again or order directly via WhatsApp.`);
        setSubmitting(false);
        setPaymentStatusText("");
      });

      rzpInstance.open();
    } catch (err) {
      console.warn("Razorpay flow notice:", err?.message || err);
      setErrorMessage(err?.message || "Unable to proceed with payment. Please try again.");
      setSubmitting(false);
      setPaymentStatusText("");
    }
  };

  // ========================================================
  // 2. WHATSAPP INQUIRY ORDER HANDLER
  // ========================================================
  const handleWhatsAppOrder = async () => {
    setSubmitAttempted(true);
    setErrorMessage("");
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
        items: cart.map((item) => {
          const refPhotos = [
            ...(Array.isArray(item.referencePhotos) ? item.referencePhotos : []),
            ...(Array.isArray(item.customization?.referencePhotos)
              ? item.customization.referencePhotos
              : []),
            ...(item.referencePhotoUrl ? [item.referencePhotoUrl] : []),
            ...(item.customization?.referencePhotoUrl ? [item.customization.referencePhotoUrl] : []),
          ]
            .map((p) => (typeof p === "string" ? p : p?.url || p?.preview))
            .filter(Boolean);

          const uniquePhotos = Array.from(new Set(refPhotos));
          const primaryPhoto = uniquePhotos[0] || "";

          return {
            productId: String(item.id || item.sku || ""),
            name: item.name,
            slug: item.slug || "",
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 1,
            image: getOrderItemImage(item),
            customization: item.customization || {},
            hasPhoto: Boolean(item.hasPhoto || uniquePhotos.length > 0),
            referencePhotoUrl: primaryPhoto,
            referencePhotos: uniquePhotos,
          };
        }),
        orderSource: "whatsapp",
      };

      const res = await ordersAPI.create(orderPayload);
      clearCart();

      const targetUrl =
        res?.whatsappUrl ||
        getCartWhatsAppUrl({
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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (paymentMethod === "razorpay") {
      handleRazorpayPayment();
    } else {
      handleWhatsAppOrder();
    }
  };

  const isFieldError = (field) => (touched[field] || submitAttempted) && Boolean(errors[field]);
  const isFieldValid = (field) => touched[field] && !errors[field] && Boolean(formData[field]?.trim());

  // ========================================================
  // SUCCESS SCREEN
  // ========================================================
  if (orderPlaced) {
    const isPaidOnline = orderPlaced.paymentStatus === "paid";

    return (
      <div className="py-16 sm:py-24 max-w-2xl mx-auto px-4 text-center space-y-6">
        <div className="bg-white rounded-3xl border border-stone-200/90 p-8 sm:p-10 shadow-sm space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isPaidOnline ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-amber-50 text-amber-800"
              }`}
            >
              {isPaidOnline ? "Payment Verified • Order Confirmed" : "Order Confirmed & Logged"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              {isPaidOnline ? "Thank You! Payment Received 🎉" : "Thank You For Your Order!"}
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
              <span className="font-semibold text-stone-900">
                {orderPlaced.customer?.name} ({orderPlaced.customer?.phone})
              </span>
            </div>
            <div className="flex justify-between pb-2 border-b border-stone-200">
              <span className="text-stone-500">Delivery To:</span>
              <span className="font-semibold text-stone-900 text-right">
                {orderPlaced.customer?.city}, {orderPlaced.customer?.state} - {orderPlaced.customer?.pincode}
              </span>
            </div>
            {orderPlaced.razorpayPaymentId && (
              <div className="flex justify-between pb-2 border-b border-stone-200">
                <span className="text-stone-500">Payment Reference:</span>
                <span className="font-mono font-semibold text-emerald-700">{orderPlaced.razorpayPaymentId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-stone-500">Total Amount:</span>
              <span className="font-bold text-amber-700 text-sm">₹{orderPlaced.totalAmount}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href={
                orderPlaced.whatsappUrl ||
                `https://wa.me/916376145171?text=${encodeURIComponent(
                  `Hello Prime3D! Inquiring about Order #${orderPlaced.orderNumber} (Paid: ₹${orderPlaced.totalAmount})`
                )}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Connect on WhatsApp</span>
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
        description="Verify your customized items, fill in your delivery details, and pay securely via Razorpay (UPI / Cards) or place an inquiry via WhatsApp."
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
                    For custom figurines, you can pay directly online and upload/share your photos with our sculpting artists on WhatsApp with your Order ID for precision handcrafting.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Verified Checkout Form or Auth Gate */}
          <div className="lg:col-span-5 space-y-6">
            {!isAuthenticated && !allowGuest ? (
              <div className="rounded-3xl bg-white border border-stone-200/90 p-6 sm:p-8 shadow-xs space-y-6">
                {/* SUMMARY Header like Image 1 */}
                <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Order Summary
                  </span>
                  <span className="text-xs font-bold text-stone-900">{totalItemCount} Items</span>
                </div>

                {/* INCLUDES PRINT-ON-ORDER ITEMS Banner */}
                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950 space-y-1 text-left">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>{policies?.printOnOrderTitle || "INCLUDES PRINT-ON-ORDER ITEMS"}</span>
                  </div>
                  <p className="text-xs text-amber-900/90 leading-relaxed font-sans">
                    {policies?.printOnOrderNotice ||
                      "Production begins after payment. Each item's staff-provided estimate is shown in your cart."}
                  </p>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 text-xs text-stone-600 py-2 border-y border-stone-100 text-left">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-stone-900">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (0%)</span>
                    <span className="font-semibold text-stone-900">₹0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="font-semibold text-emerald-600">Free Express</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-stone-900 pt-1 border-t border-stone-100">
                    <span>TOTAL AMOUNT</span>
                    <span className="text-amber-900 font-serif">₹{subtotal}</span>
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <span className="inline-block px-3 py-1 text-[11px] font-bold tracking-widest uppercase bg-amber-100 text-amber-900 rounded-full">
                    Account Recommended
                  </span>
                  <h3 className="text-xl font-serif font-bold text-stone-900">
                    Sign in to Complete Order
                  </h3>
                  <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
                    Track live 3D print progress &amp; dispatch updates in your account.
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  <Link
                    href="/login?redirect=/cart"
                    className="w-full py-3.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>Sign In to Checkout</span>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                  </Link>

                  <Link
                    href="/register?redirect=/cart"
                    className="w-full py-3 px-4 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 text-amber-900 font-semibold text-xs transition-all flex items-center justify-center gap-2"
                  >
                    <span>Create Free Account</span>
                    <ArrowRight className="w-4 h-4 text-amber-700" />
                  </Link>
                </div>

                <div className="pt-2 border-t border-stone-100 text-center space-y-3">
                  <button
                    type="button"
                    onClick={() => setAllowGuest(true)}
                    className="text-xs text-amber-800 hover:text-amber-900 underline font-semibold transition-colors cursor-pointer"
                  >
                    ⚡ Or continue as Guest (Instant Checkout)
                  </button>

                  {/* Policy Agreement Disclaimer */}
                  <p className="text-[11px] text-stone-500 leading-relaxed text-center">
                    By continuing to Razorpay, you agree to the{" "}
                    <button
                      type="button"
                      onClick={() => setActivePolicyModal("terms")}
                      className="font-semibold text-amber-700 hover:text-amber-800 underline underline-offset-2 cursor-pointer"
                    >
                      Terms &amp; Conditions
                    </button>
                    , acknowledge the{" "}
                    <button
                      type="button"
                      onClick={() => setActivePolicyModal("refund")}
                      className="font-semibold text-amber-700 hover:text-amber-800 underline underline-offset-2 cursor-pointer"
                    >
                      Cancellation &amp; Refund Policy
                    </button>
                    , and understand the{" "}
                    <button
                      type="button"
                      onClick={() => setActivePolicyModal("privacy")}
                      className="font-semibold text-amber-700 hover:text-amber-800 underline underline-offset-2 cursor-pointer"
                    >
                      Privacy Policy
                    </button>
                    .
                  </p>
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

                <form onSubmit={handleFormSubmit} noValidate className="space-y-4">
                  {/* 1. Full Name */}
                  <div>
                    <label
                      htmlFor="field-name"
                      className="text-xs font-semibold text-stone-800 flex items-center justify-between mb-1"
                    >
                      <span>
                        Full Name <span className="text-red-600">*</span>
                      </span>
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
                      <span>
                        WhatsApp / Mobile Number <span className="text-red-600">*</span>
                      </span>
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
                      <span>
                        Email Address{" "}
                        <span className="text-stone-400 font-normal">(Optional for Razorpay receipt & invoice)</span>
                      </span>
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
                      <span>
                        Complete Delivery Address <span className="text-red-600">*</span>
                      </span>
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
                      <label htmlFor="field-city" className="text-xs font-semibold text-stone-800 block mb-1">
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
                      {isFieldError("city") && <p className="text-[10px] text-red-600 mt-0.5">{errors.city}</p>}
                    </div>

                    {/* State */}
                    <div>
                      <label htmlFor="field-state" className="text-xs font-semibold text-stone-800 block mb-1">
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
                      <label htmlFor="field-pincode" className="text-xs font-semibold text-stone-800 block mb-1">
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
                    <label htmlFor="field-notes" className="text-xs font-semibold text-stone-800 block mb-1">
                      Order Instructions / Required By Date <span className="text-stone-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
                      <textarea
                        id="field-notes"
                        rows={2}
                        value={formData.notes}
                        onChange={(e) => handleChange("notes", e.target.value)}
                        placeholder="e.g. Birthday gift, need before 25th November. Please gift wrap."
                        className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* ======================================================== */}
                  {/* 7. PAYMENT METHOD SELECTOR */}
                  {/* ======================================================== */}
                  <div className="space-y-2 pt-2 border-t border-stone-100">
                    <label className="text-xs font-semibold text-stone-800 flex items-center justify-between">
                      <span>Choose Payment Mode <span className="text-red-600">*</span></span>
                      <span className="text-[11px] text-stone-400 font-normal">Safe & Encrypted 256-bit</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Razorpay Online */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("razorpay")}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          paymentMethod === "razorpay"
                            ? "border-amber-600 bg-amber-50/70 shadow-xs ring-1 ring-amber-500/30"
                            : "border-stone-200 hover:border-stone-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                paymentMethod === "razorpay" ? "border-amber-600" : "border-stone-300"
                              }`}
                            >
                              {paymentMethod === "razorpay" && (
                                <div className="w-2 h-2 rounded-full bg-amber-600" />
                              )}
                            </div>
                            <span className="text-xs font-bold text-stone-900">Pay Online</span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Instant Verified
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 mt-2 pl-6 leading-relaxed">
                          UPI (GPay, PhonePe, Paytm), Debit/Credit Cards & NetBanking via Razorpay.
                        </p>
                      </button>

                      {/* WhatsApp Order */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("whatsapp")}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          paymentMethod === "whatsapp"
                            ? "border-emerald-600 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-500/30"
                            : "border-stone-200 hover:border-stone-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                paymentMethod === "whatsapp" ? "border-emerald-600" : "border-stone-300"
                              }`}
                            >
                              {paymentMethod === "whatsapp" && (
                                <div className="w-2 h-2 rounded-full bg-emerald-600" />
                              )}
                            </div>
                            <span className="text-xs font-bold text-stone-900">WhatsApp Order</span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                            Manual Chat
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 mt-2 pl-6 leading-relaxed">
                          Confirm specs directly with our studio artists on WhatsApp and pay later.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Order Summary Strip */}
                  <div className="pt-4 border-t border-stone-100 space-y-3">
                    {/* INCLUDES PRINT-ON-ORDER ITEMS Banner (from Image 1) */}
                    <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950 space-y-1 text-left">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>{policies?.printOnOrderTitle || "INCLUDES PRINT-ON-ORDER ITEMS"}</span>
                      </div>
                      <p className="text-xs text-amber-900/90 leading-relaxed font-sans">
                        {policies?.printOnOrderNotice ||
                          "Production begins after payment. Each item's staff-provided estimate is shown in your cart."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-stone-600">
                      <span>Order Items Count</span>
                      <span className="font-bold text-stone-900">{totalItemCount} Units</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-stone-600">
                      <span>Items Subtotal</span>
                      <span className="font-semibold text-stone-900">₹{subtotal}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-stone-600">
                      <span>Standard Express Shipping</span>
                      <span className="font-semibold text-emerald-700">Free</span>
                    </div>

                    <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between">
                      <span className="font-bold text-sm text-stone-900">Total Payable Amount</span>
                      <span className="font-serif font-bold text-lg text-amber-900">₹{subtotal}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-stone-500 pt-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        {paymentMethod === "razorpay"
                          ? "Secured by Razorpay. 100% Buyer Protection & Instant confirmation."
                          : "Safe direct chat with Prime3D studio team. No hidden charges."}
                      </span>
                    </div>

                    {/* Submit Button */}
                    {paymentMethod === "razorpay" ? (
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:opacity-75"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                            <span>{paymentStatusText || "Connecting to Razorpay..."}</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            <span>Pay ₹{subtotal} with Razorpay</span>
                          </>
                        )}
                      </button>
                    ) : (
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
                    )}

                    {/* Policy Agreement Disclaimer */}
                    <p className="text-center text-[11px] text-stone-500 leading-relaxed pt-1">
                      By continuing to Razorpay, you agree to the{" "}
                      <button
                        type="button"
                        onClick={() => setActivePolicyModal("terms")}
                        className="font-semibold text-amber-700 hover:text-amber-800 underline underline-offset-2 cursor-pointer"
                      >
                        Terms &amp; Conditions
                      </button>
                      , acknowledge the{" "}
                      <button
                        type="button"
                        onClick={() => setActivePolicyModal("refund")}
                        className="font-semibold text-amber-700 hover:text-amber-800 underline underline-offset-2 cursor-pointer"
                      >
                        Cancellation &amp; Refund Policy
                      </button>
                      , and understand the{" "}
                      <button
                        type="button"
                        onClick={() => setActivePolicyModal("privacy")}
                        className="font-semibold text-amber-700 hover:text-amber-800 underline underline-offset-2 cursor-pointer"
                      >
                        Privacy Policy
                      </button>
                      .
                    </p>

                    {errorMessage && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2 animate-fade-in">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {submitAttempted && !isFormValid && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                        <span>Please correct the highlighted delivery fields above to proceed.</span>
                      </div>
                    )}
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Policy Lightbox Modal */}
      {activePolicyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setActivePolicyModal(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <h3 className="font-serif font-bold text-stone-900 text-base sm:text-lg">
                  {activePolicyModal === "terms" && "Terms & Conditions"}
                  {activePolicyModal === "refund" && "Cancellation & Refund Policy"}
                  {activePolicyModal === "privacy" && "Privacy Policy"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActivePolicyModal(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="px-6 py-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed max-h-[60vh]">
              {activePolicyModal === "terms" && (
                <div className="whitespace-pre-line font-sans">
                  {policies?.termsAndConditions ||
                    "Terms & Conditions: Standard policies apply to all customized 3D printing orders. Full production begins after payment verification."}
                </div>
              )}
              {activePolicyModal === "refund" && (
                <div className="whitespace-pre-line font-sans">
                  {policies?.refundPolicy ||
                    "Cancellation & Refund Policy: Full refund if cancelled within 6 hours or prior to 3D sculpting. Free 100% replacement in case of transit damage."}
                </div>
              )}
              {activePolicyModal === "privacy" && (
                <div className="whitespace-pre-line font-sans">
                  {policies?.privacyPolicy ||
                    "Privacy Policy: All customer reference photos and identity files are used strictly for 3D modeling and never shared or sold."}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-stone-100 bg-stone-50 flex items-center justify-between">
              <span className="text-[11px] text-stone-500">
                Prime 3D World Official Store Policy
              </span>
              <button
                type="button"
                onClick={() => setActivePolicyModal(null)}
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                I Understand &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
