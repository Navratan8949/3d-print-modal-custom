"use client";

import Link from "next/link";
import { Trash2, Plus, Minus, Camera } from "lucide-react";
import ProductVisual from "@/components/products/ProductVisual";

export default function CartItem({ item, onUpdateQuantity, onRemove, onClose }) {
  const customizationEntries = Object.entries(item.customization || {}).filter(
    ([, v]) => Boolean(v)
  );

  return (
    <div className="flex gap-4 p-4 border border-stone-200/80 rounded-xl bg-white shadow-2xs hover:border-amber-200 transition-colors">
      {/* Product Image / Visual */}
      <Link
        href={`/products/${item.slug}`}
        onClick={onClose}
        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-stone-100 group"
      >
        <ProductVisual
          src={item.image || item.image_url}
          imageKey={item.imageKey}
          alt={item.name}
          aspectRatio="1/1"
        />
      </Link>

      {/* Item Details */}
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/products/${item.slug}`}
              onClick={onClose}
              className="text-sm font-semibold text-stone-900 hover:text-amber-600 transition-colors line-clamp-1"
            >
              {item.name}
            </Link>
            <button
              onClick={() => onRemove(item.cartId)}
              className="text-stone-400 hover:text-red-500 transition-colors p-1"
              aria-label="Remove item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs text-stone-500 mt-0.5">{item.category}</div>

          {/* Customization Details */}
          {customizationEntries.length > 0 && (
            <div className="mt-1.5 space-y-0.5 text-[11px] text-stone-600 bg-stone-50 p-2 rounded border border-stone-100">
              {customizationEntries.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2 truncate">
                  <span className="font-medium text-stone-700">{k}:</span>
                  <span className="text-stone-500 truncate">{v}</span>
                </div>
              ))}
            </div>
          )}

          {/* Photo Indicator */}
          {item.hasPhoto && (
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
              <Camera className="w-3 h-3 text-amber-600" />
              <span>Reference photo to attach on WhatsApp</span>
            </div>
          )}
        </div>

        {/* Pricing & Quantity Controls */}
        <div className="mt-3 flex items-center justify-between pt-2 border-t border-stone-100">
          <span className="text-xs font-semibold text-stone-900 tabular-nums">
            {item.priceLabel}
          </span>

          <div className="flex items-center border border-stone-200 rounded-md bg-stone-50">
            <button
              onClick={() => onUpdateQuantity(item.cartId, item.quantity - 1)}
              className="p-1 hover:bg-stone-200/70 text-stone-600 rounded-l transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-2.5 py-0.5 text-xs font-semibold text-stone-800 tabular-nums">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.cartId, item.quantity + 1)}
              className="p-1 hover:bg-stone-200/70 text-stone-600 rounded-r transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
