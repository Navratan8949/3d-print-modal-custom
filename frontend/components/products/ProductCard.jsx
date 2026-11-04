"use client";

import Link from "next/link";
import { MessageCircle, ShoppingBag, ArrowRight, Sparkles, Star } from "lucide-react";
import ProductVisual from "./ProductVisual";
import { useCart } from "@/context/CartContext";
import { createProductWhatsAppUrl } from "@/lib/whatsapp";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, {
      Option: product.isCustomizable ? "Standard Custom" : "Standard",
    });
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
          alt={product.name}
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

          {/* Short Description */}
          <p className="mt-1 text-xs text-stone-500 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>
        </div>

        {/* Pricing & Order Actions */}
        <div className="pt-3 border-t border-stone-100 space-y-3">
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

            <Link
              href={`/products/${product.slug}`}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              <span>Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Action Button Row */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleQuickAdd}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors active:scale-95"
              title="Add to cart"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-stone-600" />
              <span>Add to Cart</span>
            </button>

            <button
              onClick={handleWhatsAppQuickInquiry}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors active:scale-95"
              title="Order on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>Order</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
