"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircle, ShoppingBag, ArrowRight, Zap, Star } from "lucide-react";
import ProductVisual from "./ProductVisual";
import { useCart } from "@/context/CartContext";
import { createProductWhatsAppUrl } from "@/lib/whatsapp";

export default function ProductCard({ product }) {
  const router = useRouter();
  const { addToCart } = useCart();

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, {
      Option: product.isCustomizable ? "Standard Custom" : "Standard",
    });
  };

  const handleQuickBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, {
      Option: product.isCustomizable ? "Standard Custom" : "Standard",
    });
    router.push("/cart");
  };

  const handleWhatsAppQuickInquiry = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const productUrl = `https://www.prime3dworld.in/products/${product.slug || product.id}`;
    const url = createProductWhatsAppUrl({
      productName: product.name,
      productUrl,
      quantity: 1,
      customizationDetails: {
        ProductID: `#${product.id}`,
        Price: `₹${product.price}`,
      },
      hasPhotoUpload: product.customizationType === "figurine",
    });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Top Image Container */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block w-full overflow-hidden bg-stone-100"
      >
        <ProductVisual
          src={product.image_url || product.images?.[0]}
          imageKey={product.imageKey}
          alt={`${product.name} - Custom 3D print in India`}
          aspectRatio="4/3"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <span className="bg-stone-900/85 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
            #{product.id}
          </span>
          {discountPercent > 0 && (
            <span className="bg-amber-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
        </div>
      </Link>

      {/* Product Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[11px] text-stone-500">
            <span className="uppercase tracking-wider font-semibold text-amber-700 truncate">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-stone-700 font-bold shrink-0">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>{product.rating || "4.9"}</span>
            </div>
          </div>

          {/* Product Title */}
          <h3 className="mt-1 text-sm sm:text-base font-bold text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-1">
            <Link href={`/products/${product.slug}`}>{product.name}</Link>
          </h3>

          {/* Short Description (Hook Tagline) with Side Details Button */}
          <div className="mt-1.5 flex items-start justify-between gap-2">
            <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed flex-1">
              {product.shortDescription}
            </p>
            <Link
              href={`/products/${product.slug}`}
              className="shrink-0 text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-0.5 pt-0.5 whitespace-nowrap transition-colors group/link"
              title="View Product Details"
            >
              <span className="group-hover/link:underline">Details</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Pricing & Order Actions */}
        <div className="pt-3 border-t border-stone-100 space-y-3">
          {/* Price Row */}
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-base sm:text-lg font-black text-stone-900 tabular-nums">
                ₹{product.price}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-stone-400 line-through tabular-nums">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>

            {discountPercent > 0 && (
              <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
                Save {discountPercent}%
              </span>
            )}
          </div>

          {/* 3 Action Buttons in 2:2:1 Ratio (Add to Cart : Buy Now : WhatsApp Icon) */}
          <div className="grid grid-cols-5 gap-1.5 items-center">
            {/* Add to Cart Button (Ratio 2 - col-span-2) */}
            <button
              type="button"
              onClick={handleQuickAdd}
              className="col-span-2 flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] sm:text-xs font-semibold transition-colors active:scale-95 cursor-pointer"
              title="Add to Cart"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-stone-600 shrink-0" />
              <span className="truncate">Add to Cart</span>
            </button>

            {/* Buy Now Button (Ratio 2 - col-span-2) */}
            <button
              type="button"
              onClick={handleQuickBuyNow}
              className="col-span-2 flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-[11px] sm:text-xs font-bold shadow-xs transition-colors active:scale-95 cursor-pointer"
              title="⚡ Buy Now (Instant Checkout)"
            >
              <Zap className="w-3.5 h-3.5 fill-current text-stone-950 shrink-0" />
              <span className="truncate">Buy Now</span>
            </button>

            {/* WhatsApp Button - Icon Only (Ratio 1 - col-span-1) */}
            <button
              type="button"
              onClick={handleWhatsAppQuickInquiry}
              className="col-span-1 flex items-center justify-center py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors active:scale-95 cursor-pointer"
              title="Order / Inquire on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
