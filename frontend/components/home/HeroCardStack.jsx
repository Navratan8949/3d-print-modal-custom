"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, useMotionValue } from "framer-motion";
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { productsAPI } from "@/lib/api";
import { resolveProductImage, handleImageError, DEFAULT_PLACEHOLDER_IMAGE } from "@/lib/imageUtils";

const formatCardProduct = (p) => ({
  id: p.id || p._id,
  slug: p.slug || String(p.id),
  name: p.name,
  category: p.category,
  price: typeof p.price === "number" ? `₹${p.price}` : p.price || "₹999",
  tag: p.showInSlider ? "Featured in Slider" : p.is_featured ? "Featured 3D" : p.category || "3D Creation",
  imageUrl: resolveProductImage(p.image_url || p.images?.[0]),
});

const ROTATIONS = [-4, 3.5, -2.5, 2];

function StackCard({ product, index, total, onSendToBack }) {
  const router = useRouter();
  const x = useMotionValue(0);
  const isFront = index === total - 1;
  const isDraggingRef = useRef(false);

  const handleAction = useCallback(() => {
    if (isFront) {
      x.set(0);
      onSendToBack(product.id);
    }
  }, [isFront, onSendToBack, product.id, x]);

  const handleCardClick = (e) => {
    if (!isFront) return;
    if (isDraggingRef.current) return;
    router.push(`/products/${product.slug || product.id}`);
  };

  const depth = total - 1 - index;

  return (
    <motion.div
      className={`${isFront ? "relative w-full h-auto cursor-pointer" : "absolute inset-0 pointer-events-none"
        } will-change-transform transform-gpu`}
      style={{
        x,
        zIndex: index + 1,
      }}
      drag={isFront ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.45}
      onDragStart={() => {
        isDraggingRef.current = true;
      }}
      onDragEnd={(_, info) => {
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 150);
        if (Math.abs(info.offset.x) > 60 || Math.abs(info.velocity.x) > 400) {
          handleAction();
        } else {
          x.set(0);
        }
      }}
      onClick={handleCardClick}
      animate={{
        rotateZ: ROTATIONS[index % ROTATIONS.length],
        scale: 1 - depth * 0.04,
        y: -depth * 6,
      }}
      transition={{
        type: "spring",
        stiffness: 320,
        damping: 28,
        mass: 0.8,
      }}
    >
      <div className={`relative w-full overflow-hidden rounded-2xl bg-white shadow-lg border border-stone-200/90 select-none flex flex-col ${isFront ? "h-auto" : "h-full justify-between"}`}>
        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-amber-800 shadow-xs border border-amber-200 uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>{product.tag}</span>
          </span>
          <span className="rounded-full bg-stone-900 px-2.5 py-1 text-[10px] font-extrabold text-white shadow-xs">
            {product.price}
          </span>
        </div>

        {/* Card Main Image - Auto height to fit image without blank space */}
        <Link
          href={`/products/${product.slug || product.id}`}
          onClick={(e) => {
            if (!isFront) e.preventDefault();
            e.stopPropagation();
          }}
          className={`relative w-full block overflow-hidden bg-stone-50 ${isFront ? "cursor-pointer" : "flex-1"}`}
          title={`View details for ${product.name}`}
        >
          <img
            src={product.imageUrl}
            alt={`${product.name} - Handcrafted 3D Print Figurine India`}
            onError={(e) => handleImageError(e)}
            className={`w-full block mx-auto transition-transform duration-500 hover:scale-105 pointer-events-none ${isFront ? "h-auto max-h-[460px] object-contain" : "h-full object-cover"}`}
            draggable={false}
          />
        </Link>

        {/* Card Bottom Meta Bar */}
        <div className="h-14 border-t border-stone-200 bg-white px-3.5 flex items-center justify-between gap-3 shrink-0">
          <Link
            href={`/products/${product.slug || product.id}`}
            onClick={(e) => {
              if (!isFront) e.preventDefault();
              e.stopPropagation();
            }}
            className="min-w-0 flex-1 hover:opacity-80 transition-opacity"
          >
            <h3 className="font-bold text-xs sm:text-sm text-stone-900 truncate">
              {product.name}
            </h3>
            <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block">
              {product.category}
            </span>
          </Link>

          <Link
            href={`/products/${product.slug || product.id}`}
            onClick={(e) => {
              if (!isFront) e.preventDefault();
              e.stopPropagation();
            }}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 hover:text-amber-900 px-3 py-1.5 rounded-lg border border-amber-200/90 shrink-0 transition-all z-20 cursor-pointer shadow-2xs active:scale-95 group/btn"
            aria-label={`View full details of ${product.name}`}
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-700 transition-transform group-hover/btn:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function HeroCardStack({ initialProducts = [] }) {
  const [items, setItems] = useState(() =>
    Array.isArray(initialProducts) && initialProducts.length > 0
      ? initialProducts.map(formatCardProduct)
      : []
  );
  const [isPaused, setIsPaused] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Sync initialProducts if provided or changed
  useEffect(() => {
    if (Array.isArray(initialProducts) && initialProducts.length > 0 && items.length === 0) {
      setItems(initialProducts.map(formatCardProduct));
    }
  }, [initialProducts, items.length]);

  useEffect(() => {
    setMounted(true);
    productsAPI
      .getAll({ slider: "true", limit: 12 })
      .then((res) => {
        if (res && res.products && res.products.length > 0) {
          setItems(res.products.map(formatCardProduct));
        } else if (items.length === 0) {
          return productsAPI.getAll({ featured: "true", limit: 8 }).then((fallbackRes) => {
            if (fallbackRes && fallbackRes.products && fallbackRes.products.length > 0) {
              setItems(fallbackRes.products.map(formatCardProduct));
            } else {
              return productsAPI.getAll({ limit: 8 }).then((allRes) => {
                if (allRes && allRes.products && allRes.products.length > 0) {
                  setItems(allRes.products.map(formatCardProduct));
                }
              });
            }
          });
        }
      })
      .catch((err) => {
        console.warn("Could not load dynamic hero products:", err.message);
      });
  }, [items.length]);

  const sendToBack = useCallback((id) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx < 0) return prev;
      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      return [item, ...copy];
    });
  }, []);

  const cycleNext = useCallback(() => {
    if (items.length < 2) return;
    const topItem = items[items.length - 1];
    sendToBack(topItem.id);
  }, [items, sendToBack]);

  const cyclePrev = useCallback(() => {
    if (items.length < 2) return;
    setItems((prev) => [prev[prev.length - 1], ...prev.slice(0, -1)]);
  }, [items.length]);

  // Autoplay rotation every 5s when not hovered
  useEffect(() => {
    if (isPaused || items.length < 2) return;
    const interval = window.setInterval(cycleNext, 5000);
    return () => clearInterval(interval);
  }, [isPaused, items.length, cycleNext]);

  // Performance optimization: Only render top 3 cards in DOM
  const visibleCards = useMemo(() => {
    const total = items.length;
    return items
      .map((prod, idx) => ({
        prod,
        idx,
        isVisible: idx >= total - 3,
      }))
      .filter((c) => c.isVisible);
  }, [items]);

  // Fast zero-waterfall: if items exist (e.g. from SSR initialProducts), render immediately without waiting for mounted!
  if (items.length === 0) {
    return (
      <div className="relative w-[270px] xs:w-[290px] sm:w-[320px] md:w-[340px] max-w-[calc(100vw-2.5rem)] min-h-[380px] flex items-center justify-center bg-stone-100/80 rounded-2xl border border-stone-200">
        <div className="w-8 h-8 border-2 border-stone-300 border-t-amber-600 rounded-full animate-spin" />
      </div>
    );
  }

  const currentTopProduct = items[items.length - 1];
  const currentIndex = items.findIndex((p) => p.id === currentTopProduct?.id);

  return (
    <div
      className="relative w-full flex flex-col items-center justify-center select-none py-2 px-2 sm:px-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 3D Card Stack Stage with Centered Layout & Non-Clipped Move Icon Buttons */}
      <div className="relative flex items-center justify-center w-full px-7 sm:px-9">
        <div className="relative w-[270px] xs:w-[290px] sm:w-[320px] md:w-[340px] max-w-[calc(100vw-5rem)]">
          {/* Previous Image Move Button (Left) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              cyclePrev();
            }}
            className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 z-40 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-stone-900 border-2 border-stone-200/90 shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer group/btn backdrop-blur-md ring-4 ring-amber-500/15 hover:ring-amber-500/35"
            aria-label="Previous 3D Creation Image"
            title="Previous Photo"
          >
            <ChevronLeft className="w-5 h-5 text-stone-800 group-hover/btn:text-amber-600 transition-colors shrink-0 stroke-[2.5]" />
          </button>

          {/* 3D Card Stack */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30, rotateY: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateY: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 20, delay: 0.25 }}
            style={{ perspective: 1000 }}
            className="relative w-full will-change-transform transform-gpu"
          >
            {visibleCards.map(({ prod, idx }) => (
              <StackCard
                key={prod.id}
                product={prod}
                index={idx}
                total={items.length}
                onSendToBack={sendToBack}
              />
            ))}
          </motion.div>

          {/* Next Image Move Button (Right) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              cycleNext();
            }}
            className="absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 z-40 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-stone-900 border-2 border-stone-200/90 shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer group/btn backdrop-blur-md ring-4 ring-amber-500/15 hover:ring-amber-500/35"
            aria-label="Next 3D Creation Image"
            title="Next Photo"
          >
            <ChevronRight className="w-5 h-5 text-stone-800 group-hover/btn:text-amber-600 transition-colors shrink-0 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Clean Centered Scroll Status Points / Indicator Dots with Move Buttons */}
      <div className="mt-5 flex items-center justify-center gap-2.5 w-full py-2">
        <button
          type="button"
          onClick={cyclePrev}
          className="p-1 rounded-full text-stone-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
          aria-label="Previous Image"
          title="Previous"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5">
          {items.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                if (idx !== currentIndex) {
                  setItems((prev) => {
                    const copy = [...prev];
                    const currentPos = copy.findIndex((item) => item.id === p.id);
                    if (currentPos !== -1) {
                      return [...copy.slice(currentPos + 1), ...copy.slice(0, currentPos + 1)];
                    }
                    return prev;
                  });
                }
              }}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${idx === currentIndex
                ? "w-6 bg-amber-600 shadow-xs shadow-amber-600/30"
                : "w-2 bg-stone-300 hover:bg-stone-400"
                }`}
              aria-label={`Go to creation ${idx + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={cycleNext}
          className="p-1 rounded-full text-stone-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
          aria-label="Next Image"
          title="Next"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
