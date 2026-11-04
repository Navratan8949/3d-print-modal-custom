"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  MessageCircle,
  Star,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Camera,
  X,
  Upload,
  ChevronLeft,
  ChevronRight,
  Flame,
  Clock,
  Sparkles,
  HelpCircle,
  RefreshCw,
  Gift,
  Heart,
  Share2,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { createProductWhatsAppUrl } from "@/lib/whatsapp";
import { PRODUCTS } from "@/data/products";

export default function ProductDetailView({ product }) {
  const { addToCart, setIsDrawerOpen } = useCart();

  // Images for gallery
  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.image_url || "/images/products/fullbody-figurine-hero.jpeg"];

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const selectedImage = images[selectedImageIndex] || images[0];

  const resolveImageUrl = (img) => {
    if (!img) return "/images/products/fullbody-figurine-hero.jpeg";
    if (typeof img === "string" && img.startsWith("/uploads/")) {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
      return `${backendUrl}${img}`;
    }
    return img;
  };

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  // Previous & Next product for top navigation
  const currentProdIndex = PRODUCTS.findIndex((p) => String(p.id) === String(product.id));
  const prevProduct = currentProdIndex > 0 ? PRODUCTS[currentProdIndex - 1] : PRODUCTS[PRODUCTS.length - 1];
  const nextProduct = currentProdIndex < PRODUCTS.length - 1 ? PRODUCTS[currentProdIndex + 1] : PRODUCTS[0];

  // Variations & Options
  const sizeOptions = product.availableOptions?.sizes || ["Standard Scale (12-15 cm)", "Large Display (18-20 cm)"];
  const finishOptions = product.availableOptions?.finishes ||
    product.availableOptions?.types || ["Matte Natural", "Artisan Hand-Detailed", "Gloss Finish"];

  const [selectedSize, setSelectedSize] = useState(sizeOptions[0]);
  const [selectedFinish, setSelectedFinish] = useState(finishOptions[0]);
  const [quantity, setQuantity] = useState(1);

  // Dynamic pricing: larger sizes add modest tiered pricing
  const basePrice = product.price || 999;
  const sizePriceMultiplier = selectedSize.includes("Large") || selectedSize.includes("Medium") || selectedSize.includes("18") || selectedSize.includes("20")
    ? 1.25
    : selectedSize.includes("Grand") || selectedSize.includes("25")
    ? 1.5
    : 1;

  const currentUnitPrice = Math.round(basePrice * sizePriceMultiplier);
  const currentOriginalUnitPrice = Math.round((product.originalPrice || basePrice * 1.35) * sizePriceMultiplier);
  const discountPercent = Math.round(((currentOriginalUnitPrice - currentUnitPrice) / currentOriginalUnitPrice) * 100);

  // Etsy Personalization Box state
  const [personalizationText, setPersonalizationText] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("description"); // description | howItWorks | specs | reviews

  const handlePhotosUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setUploadedPhotos((prev) => [...prev, ...files].slice(0, 5)); // up to 5 reference photos
    }
  };

  const handleRemovePhoto = (idx) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  // Add to Cart handler
  const handleAddToCart = () => {
    const customization = {
      Scale: selectedSize,
      Finish: selectedFinish,
      ...(personalizationText ? { "Personalization / Engraving": personalizationText } : {}),
      ...(uploadedPhotos.length > 0
        ? { "Reference Photos": `${uploadedPhotos.length} photo(s) attached (${uploadedPhotos.map((p) => p.name).join(", ")})` }
        : {}),
    };

    addToCart(
      {
        ...product,
        price: currentUnitPrice,
        hasPhoto: uploadedPhotos.length > 0,
      },
      quantity,
      customization
    );

    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 3000);
  };

  // Direct WhatsApp Order handler
  const handleDirectWhatsAppOrder = () => {
    const details = {
      ProductID: `#${product.id}`,
      SKU: product.sku || `3DVS-${product.id}`,
      Scale: selectedSize,
      Finish: selectedFinish,
      ...(personalizationText ? { Personalization: personalizationText } : {}),
      ...(uploadedPhotos.length > 0 ? { ReferencePhotos: `${uploadedPhotos.length} photo(s) selected` } : {}),
      Quantity: `${quantity} pcs`,
      UnitPrice: `₹${currentUnitPrice}`,
      TotalAmount: `₹${currentUnitPrice * quantity}`,
    };

    const productUrl = `https://www.prime3dworld.in/products/${product.slug}`;

    const url = createProductWhatsAppUrl({
      productName: product.name,
      productUrl,
      quantity,
      customizationDetails: details,
      hasPhotoUpload: uploadedPhotos.length > 0 || product.customizationType === "figurine",
    });

    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Share Product Link on WhatsApp with Product Image preview
  const handleShareOnWhatsApp = () => {
    const publicUrl = `https://www.prime3dworld.in/products/${product.slug}`;
    const shareText = `Check out this custom 3D creation: *${product.name}* (₹${currentUnitPrice}) on Prime 3D World!\n\n${publicUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-12">
      {/* Top Header: Breadcrumbs & Prev/Next Product Chevrons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-500 pb-4 border-b border-stone-200">
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-amber-700 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-amber-700 transition-colors">
            Catalog
          </Link>
          <span>/</span>
          <Link
            href={`/shop?category=${product.categoryId || ""}`}
            className="hover:text-amber-700 transition-colors capitalize"
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-stone-900 font-semibold truncate max-w-[200px]">
            {product.name}
          </span>
        </div>

        {/* Product Navigation Chevrons */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="bg-stone-100 text-stone-700 font-bold px-2.5 py-1 rounded-md text-[11px] tabular-nums">
            Item ID: #{product.id}
          </span>

          <div className="flex items-center border border-stone-200 rounded-lg p-0.5 bg-white shadow-2xs">
            <Link
              href={`/products/${prevProduct.slug}`}
              className="px-2 py-1 hover:bg-stone-100 rounded text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-1 text-[11px] font-semibold"
              title={`Previous: ${prevProduct.name}`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </Link>
            <span className="w-px h-3 bg-stone-200" />
            <Link
              href={`/products/${nextProduct.slug}`}
              className="px-2 py-1 hover:bg-stone-100 rounded text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-1 text-[11px] font-semibold"
              title={`Next: ${nextProduct.name}`}
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main 2-Column Product Detail Layout (Etsy Pattern) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Column: Multi-Image Showcase & Studio Trust */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Large Image with Floating Chevrons */}
          <div className="relative w-full rounded-3xl bg-stone-100/70 border border-stone-200/90 shadow-md overflow-hidden group flex items-center justify-center min-h-[320px]">
            <img
              src={resolveImageUrl(selectedImage)}
              alt={product.name}
              className="w-full h-auto max-h-[85vh] object-contain rounded-2xl transition-all duration-300"
            />

            {/* Etsy-Style Badges Overlay */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
              <span className="inline-flex items-center gap-1 bg-stone-900/90 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Prime3D Original #{product.id}</span>
              </span>
              {discountPercent > 0 && (
                <span className="bg-amber-600 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-sm">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Left Chevron */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-stone-800 shadow-md border border-stone-200 flex items-center justify-center transition-all hover:scale-105 active:scale-90 opacity-90 group-hover:opacity-100"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-5 h-5 text-stone-700" />
              </button>
            )}

            {/* Right Chevron */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-stone-800 shadow-md border border-stone-200 flex items-center justify-center transition-all hover:scale-105 active:scale-90 opacity-90 group-hover:opacity-100"
                aria-label="Next photo"
              >
                <ChevronRight className="w-5 h-5 text-stone-700" />
              </button>
            )}

            {/* Photo Index Counter */}
            {images.length > 1 && (
              <span className="absolute bottom-4 right-4 z-10 bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full tabular-nums shadow-sm">
                {selectedImageIndex + 1} / {images.length}
              </span>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative h-20 w-20 shrink-0 rounded-2xl overflow-hidden border-2 transition-all bg-stone-50 flex items-center justify-center p-1 ${
                    selectedImageIndex === idx
                      ? "border-amber-600 ring-2 ring-amber-600/20 scale-102 shadow-xs"
                      : "border-stone-200 hover:border-stone-400 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={resolveImageUrl(img)}
                    alt={`${product.name} perspective ${idx + 1}`}
                    className="w-full h-full object-contain rounded-xl"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Etsy Trust Badges Card */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-3 text-xs text-stone-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700 shrink-0">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <span className="font-bold text-stone-900 block">Prime3D Purchase Protection</span>
                <span className="text-stone-500 text-[11px]">
                  Shop with confidence. If item arrives broken or lost, we replace it 100% free.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-stone-100">
              <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700 shrink-0">
                <Truck className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <span className="font-bold text-stone-900 block">Dispatches from Jaipur, India</span>
                <span className="text-stone-500 text-[11px]">
                  Estimated delivery in 3-5 business days across all states.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-stone-100">
              <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-700 shrink-0">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <span className="font-bold text-stone-900 block">WhatsApp 3D Preview Approval</span>
                <span className="text-stone-500 text-[11px]">
                  You get digital photos/renders to approve before final dispatch.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Buy Box, Etsy Personalization & Customization */}
        <div className="lg:col-span-6 space-y-6">
          {/* Seller & Popularity Badge */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Prime3D Star Seller • {product.category}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                <Flame className="w-3 h-3 text-rose-600 fill-current" />
                <span>In high demand</span>
              </span>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-stone-950 tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Rating Stars & Verified Review Count */}
            <div className="flex items-center gap-2.5 pt-1 text-xs">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <span className="font-extrabold text-stone-900">{product.rating || "4.9"}</span>
              <span className="text-stone-400">|</span>
              <span className="text-stone-600 underline font-medium cursor-pointer" onClick={() => setActiveTab("reviews")}>
                {product.review_count || 142} shop reviews
              </span>
              <span className="text-stone-400">|</span>
              <span className="text-emerald-700 font-semibold">500+ successful orders</span>
            </div>
          </div>

          {/* Pricing Box (Etsy Style with Free Shipping Tag) */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-1.5">
            <div className="flex items-baseline justify-between gap-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-stone-900 tabular-nums">
                  ₹{currentUnitPrice * quantity}
                </span>
                {currentOriginalUnitPrice > currentUnitPrice && (
                  <span className="text-lg text-stone-400 line-through tabular-nums">
                    ₹{currentOriginalUnitPrice * quantity}
                  </span>
                )}
              </div>
              {discountPercent > 0 && (
                <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                  Save ₹{(currentOriginalUnitPrice - currentUnitPrice) * quantity} ({discountPercent}% OFF)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-600 pt-1 font-medium">
              <span className="text-emerald-700 font-bold">✓ Free Standard Delivery across India</span>
              <span>•</span>
              <span>Taxes included</span>
            </div>
          </div>

          {/* Variations: Dimensions / Scale Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-stone-900 uppercase tracking-wider">
                Select Scale / Dimensions <span className="text-red-500">*</span>
              </label>
              <span className="text-stone-500 font-medium">{selectedSize}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sizeOptions.map((sz) => {
                const isSelected = selectedSize === sz;
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? "bg-stone-900 text-white border-stone-900 shadow-xs"
                        : "bg-white text-stone-700 border-stone-200 hover:border-stone-400"
                    }`}
                  >
                    <span className="truncate">{sz}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Variations: Material Finish Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-stone-900 uppercase tracking-wider">
                Select Finish / Material <span className="text-red-500">*</span>
              </label>
              <span className="text-stone-500 font-medium">{selectedFinish}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {finishOptions.map((fin) => {
                const isSelected = selectedFinish === fin;
                return (
                  <button
                    key={fin}
                    type="button"
                    onClick={() => setSelectedFinish(fin)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                        : "bg-white text-stone-700 border-stone-200 hover:border-stone-400"
                    }`}
                  >
                    {fin}
                  </button>
                );
              })}
            </div>
          </div>

          {/* The Famous Etsy Personalization Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/50 border-2 border-dashed border-amber-300 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <label className="text-xs font-bold text-amber-950 uppercase tracking-wider block">
                  Add your personalization (Optional)
                </label>
                <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                  Enter custom name/text, base engraving, or special pose details (e.g., &quot;Rahul &amp; Priya, Date: 24.11.2024, Natural Oak Base&quot;).
                </p>
              </div>
              <span className="text-[10px] text-amber-700 font-mono shrink-0">
                {personalizationText.length}/250
              </span>
            </div>

            <textarea
              rows={2}
              maxLength={250}
              value={personalizationText}
              onChange={(e) => setPersonalizationText(e.target.value)}
              placeholder="Enter your custom text or instructions here..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200 bg-white text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-600 transition-colors resize-none shadow-2xs"
            />

            {/* Photo Attachment (For Figurines or Custom Keepsakes - Multiple Photos Supported) */}
            <div className="pt-2 border-t border-amber-200/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-amber-700" />
                  <span>Reference Photos for 3D Modeling (Front, Side, Pose):</span>
                </span>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-amber-100/60 border border-amber-300 rounded-lg cursor-pointer text-[11px] font-semibold text-amber-900 transition-colors shadow-2xs">
                  <Upload className="w-3 h-3 text-amber-700" />
                  <span>{uploadedPhotos.length > 0 ? "+ Add More Photos" : "Attach Photos (Up to 5)"}</span>
                  <input type="file" multiple accept="image/*" onChange={handlePhotosUpload} className="hidden" />
                </label>
              </div>

              {uploadedPhotos.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {uploadedPhotos.map((photo, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 p-1.5 bg-white rounded-lg border border-amber-200 text-xs shadow-2xs"
                    >
                      <div className="relative h-8 w-8 rounded overflow-hidden shrink-0 bg-stone-100">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Reference ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="max-w-[90px] truncate text-stone-700 font-medium text-[10px]">
                        {photo.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="p-1 text-stone-400 hover:text-red-600 transition-colors"
                        title="Remove photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quantity Selector & Action Buttons (Etsy PDP Buy Box) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Quantity:
              </span>
              <div className="flex items-center border border-stone-200 rounded-xl bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3.5 py-2 text-stone-600 hover:text-stone-900 font-bold transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-2 text-xs font-black text-stone-900 tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3.5 py-2 text-stone-600 hover:text-stone-900 font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] group"
              >
                <ShoppingBag className="w-4 h-4 text-amber-400 transition-transform group-hover:scale-110" />
                <span>Add to Cart</span>
              </button>

              <button
                type="button"
                onClick={handleDirectWhatsAppOrder}
                className="flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] group"
              >
                <MessageCircle className="w-4 h-4 fill-current transition-transform group-hover:scale-110" />
                <span>Buy Now on WhatsApp</span>
              </button>
            </div>

            {/* Share on WhatsApp Button with OG Product Image */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={handleShareOnWhatsApp}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                title="Share this product on WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5 text-stone-500" />
                <span>Share Link on WhatsApp</span>
              </button>
            </div>

            {/* Success Toast Notification */}
            {addedSuccess && (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold animate-fade-in shadow-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Added {quantity} item(s) to your cart!</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(true)}
                  className="underline font-bold hover:text-emerald-950"
                >
                  View Cart Bag →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Etsy-Style Deep Tabs: Description | How to Order | Specs | Reviews */}
      <div className="border-t border-stone-200 pt-10 space-y-8">
        {/* Tab Headers */}
        <div className="flex items-center gap-2 border-b border-stone-200 overflow-x-auto pb-px scrollbar-none">
          {[
            { id: "description", label: "Item Description" },
            { id: "howItWorks", label: "How Custom 3D Printing Works" },
            { id: "specs", label: "Specifications & Build Quality" },
            { id: "reviews", label: `Customer Reviews (${product.review_count || 142})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "border-amber-600 text-stone-950 font-black"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Item Description */}
        {activeTab === "description" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-stone-700 text-sm leading-relaxed">
            <div className="md:col-span-8 space-y-4 bg-white p-6 rounded-2xl border border-stone-200/90 shadow-2xs">
              <h3 className="font-serif font-bold text-lg text-stone-900">About this 3D Creation</h3>
              <p>{product.description}</p>
              <p className="text-xs text-stone-500 italic">
                *Note: As an authentic 3D printed creation, subtle microscopic layer lines showcase the genuine additive manufacturing process, giving each piece unique artisanal character.
              </p>

              <div className="pt-4 border-t border-stone-100 flex flex-wrap gap-4 text-xs font-semibold text-stone-600">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Handcrafted in India</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-amber-600" />
                  <span>Gift Box Packing Included</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                  <span>Free Transit Damage Replacement</span>
                </span>
              </div>
            </div>

            <div className="md:col-span-4 bg-stone-50 p-6 rounded-2xl border border-stone-200/80 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-stone-800">
                Meet Your 3D Maker
              </h4>
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-stone-300">
                  <Image src="/images/logo/prime3dworld-logo.jpeg" alt="Prime3Dworld" fill className="object-cover" />
                </div>
                <div>
                  <span className="font-bold text-sm text-stone-900 block">Prime3Dworld Studio</span>
                  <span className="text-[11px] text-stone-500">3D Design &amp; Print Lab, Jaipur</span>
                </div>
              </div>
              <p className="text-xs text-stone-600">
                Specialized in bespoke 3D sculpting, sacred temple idols, custom lithophanes, and durable personalized figurines.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: How It Works */}
        {activeTab === "howItWorks" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Choose & Personalize",
                desc: "Select your desired scale, material finish, and enter your custom text or attach reference photos.",
              },
              {
                step: "02",
                title: "Digital 3D Proofing",
                desc: "Our digital sculptors create the 3D model and share high-resolution renders on WhatsApp for your approval.",
              },
              {
                step: "03",
                title: "High-Precision 3D Print",
                desc: "Printed using 0.12mm micro-layer industrial deposition, hand-finished with artisan protective sealants.",
              },
              {
                step: "04",
                title: "Safely Delivered",
                desc: "Secured in shock-proof gift packaging and dispatched with live tracking right to your doorstep across India.",
              },
            ].map((s) => (
              <div key={s.step} className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-2">
                <span className="text-xs font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 inline-block">
                  STEP {s.step}
                </span>
                <h4 className="font-bold text-sm text-stone-900">{s.title}</h4>
                <p className="text-xs text-stone-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Specifications & Build Quality */}
        {activeTab === "specs" && (
          <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden">
            <div className="divide-y divide-stone-100">
              <div className="p-4 sm:p-5 flex justify-between text-xs sm:text-sm">
                <span className="font-semibold text-stone-900">Product ID &amp; SKU</span>
                <span className="text-stone-600 font-mono">#{product.id} • {product.sku}</span>
              </div>
              <div className="p-4 sm:p-5 flex justify-between text-xs sm:text-sm">
                <span className="font-semibold text-stone-900">Print Material</span>
                <span className="text-stone-600">{product.material || "Premium Industrial PLA+"}</span>
              </div>
              <div className="p-4 sm:p-5 flex justify-between text-xs sm:text-sm">
                <span className="font-semibold text-stone-900">Dimensions / Scale</span>
                <span className="text-stone-600">{product.dimensions}</span>
              </div>
              <div className="p-4 sm:p-5 flex justify-between text-xs sm:text-sm">
                <span className="font-semibold text-stone-900">Approximate Weight</span>
                <span className="text-stone-600">{product.weight_g} grams</span>
              </div>
              <div className="p-4 sm:p-5 flex justify-between text-xs sm:text-sm">
                <span className="font-semibold text-stone-900">Print Queue Time</span>
                <span className="text-stone-600">{product.print_time || "1-2 Business Days"}</span>
              </div>
              {product.specifications?.map((spec) => (
                <div key={spec.label} className="p-4 sm:p-5 flex justify-between text-xs sm:text-sm">
                  <span className="font-semibold text-stone-900">{spec.label}</span>
                  <span className="text-stone-600">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Customer Reviews (Etsy Style) */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <span className="text-4xl sm:text-5xl font-black text-stone-900 tabular-nums">4.9</span>
                <div className="flex items-center gap-1 text-amber-500 justify-center sm:justify-start my-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <span className="text-xs text-stone-500 font-medium">Based on 142 verified customer reviews</span>
              </div>

              <div className="w-full sm:max-w-xs space-y-1 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <span>5 star</span>
                  <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 w-[94%]" />
                  </div>
                  <span className="tabular-nums">94%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>4 star</span>
                  <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 w-[5%]" />
                  </div>
                  <span className="tabular-nums">5%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>3 star</span>
                  <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 w-[1%]" />
                  </div>
                  <span className="tabular-nums">1%</span>
                </div>
              </div>
            </div>

            {/* Individual Reviews Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  author: "Aditya V.",
                  city: "Mumbai",
                  date: "2 days ago",
                  rating: 5,
                  comment: "The 3D print quality is absolutely mind-blowing! Ordered the custom figurine for our 2nd anniversary. The WhatsApp team sent 3D previews and made all adjustments we asked for.",
                },
                {
                  author: "Pooja Sharma",
                  city: "Delhi NCR",
                  date: "1 week ago",
                  rating: 5,
                  comment: "Packaging was super secure and gift-ready. Every facial detail was captured so nicely. Best personalized gift I have ever purchased!",
                },
                {
                  author: "Rohan Patel",
                  city: "Ahmedabad",
                  date: "2 weeks ago",
                  rating: 5,
                  comment: "Fast dispatch and great communication. The finish is smooth and colors are vibrant. Highly recommended for custom 3D gifts.",
                },
                {
                  author: "Meenakshi K.",
                  city: "Bengaluru",
                  date: "3 weeks ago",
                  rating: 5,
                  comment: "The Khatu Shyam Ji idol has divine details. Mukut and feather carving are so intricate. Loved the quality!",
                },
              ].map((rev, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-stone-900 block">{rev.author}</span>
                      <span className="text-[10px] text-stone-500">{rev.city} • Verified Buyer</span>
                    </div>
                    <span className="text-[10px] text-stone-400">{rev.date}</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">&ldquo;{rev.comment}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
