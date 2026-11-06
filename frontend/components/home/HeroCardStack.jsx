"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, useMotionValue } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import { productsAPI } from "@/lib/api";

const formatCardProduct = (p) => ({
  id: p.id || p._id,
  slug: p.slug || String(p.id),
  name: p.name,
  category: p.category,
  price: typeof p.price === "number" ? `₹${p.price}` : p.price || "₹999",
  tag: p.showInSlider ? "Featured in Slider" : p.is_featured ? "Featured 3D" : p.category || "3D Creation",
  imageUrl: p.image_url || p.images?.[0] || "/images/products/fullbody-figurine-hero.jpeg",
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
      className={`absolute inset-0 will-change-transform transform-gpu ${
        isFront ? "cursor-pointer" : "pointer-events-none"
      }`}
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
      <div className="relative w-full h-full overflow-hidden rounded-2xl bg-white shadow-lg border border-stone-200/90 select-none flex flex-col justify-between">
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

        {/* Card Main Image */}
        <Link
          href={`/products/${product.slug || product.id}`}
          onClick={(e) => {
            if (!isFront) e.preventDefault();
            e.stopPropagation();
          }}
          className={`relative w-full flex-1 bg-stone-100 overflow-hidden block ${
            isFront ? "cursor-pointer" : ""
          }`}
          title={`View details for ${product.name}`}
        >
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            priority={isFront}
            loading={isFront ? "eager" : "lazy"}
            sizes="(max-width: 640px) 300px, 370px"
            className="object-cover pointer-events-none transition-transform duration-500 hover:scale-105"
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
            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 hover:text-amber-900 px-3 py-1.5 rounded-lg border border-amber-200/90 shrink-0 transition-colors z-20 cursor-pointer shadow-2xs active:scale-95"
            aria-label={`View full details of ${product.name}`}
          >
            <span>View Details</span>
            <span>→</span>
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

  useEffect(() => {
    setMounted(true);
    productsAPI
      .getAll({ slider: "true", limit: 12 })
      .then((res) => {
        if (res && res.products && res.products.length > 0) {
          setItems(res.products.map(formatCardProduct));
        } else {
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
  }, []);

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

  if (!mounted || items.length === 0) {
    return (
      <div className="relative w-[280px] xs:w-[300px] sm:w-[350px] max-w-[calc(100vw-2.5rem)] h-[420px] xs:h-[450px] sm:h-[480px] flex items-center justify-center bg-stone-100/80 rounded-2xl border border-stone-200">
        <div className="w-8 h-8 border-2 border-stone-300 border-t-amber-600 rounded-full animate-spin" />
      </div>
    );
  }

  const currentTopProduct = items[items.length - 1];
  const currentIndex = items.findIndex((p) => p.id === currentTopProduct?.id);

  return (
    <div
      className="relative w-full flex flex-col items-center justify-center select-none overflow-hidden py-2"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 3D Card Stack Stage with Left and Right Chevrons */}
      <div className="relative w-[280px] xs:w-[300px] sm:w-[350px] max-w-[calc(100vw-3rem)] h-[420px] xs:h-[450px] sm:h-[480px]">
        {visibleCards.map(({ prod, idx }) => (
          <StackCard
            key={prod.id}
            product={prod}
            index={idx}
            total={items.length}
            onSendToBack={sendToBack}
          />
        ))}

        {/* Floating Left Chevron */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            cyclePrev();
          }}
          className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-stone-50 text-stone-800 shadow-md border border-stone-200/90 flex items-center justify-center transition-all hover:scale-105 active:scale-90"
          aria-label="Previous creation"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-stone-700" />
        </button>

        {/* Floating Right Chevron */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            cycleNext();
          }}
          className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-stone-50 text-stone-800 shadow-md border border-stone-200/90 flex items-center justify-center transition-all hover:scale-105 active:scale-90"
          aria-label="Next creation"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-stone-700" />
        </button>
      </div>

      {/* Navigation Controls Bar */}
      <div className="mt-5 flex items-center justify-between w-[280px] xs:w-[300px] sm:w-[350px] max-w-[calc(100vw-3rem)] px-1">
        <div className="flex items-center gap-1.5">
          <button
            onClick={cyclePrev}
            className="p-1.5 rounded-full bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 shadow-xs transition-transform active:scale-90"
            aria-label="Previous card"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={cycleNext}
            className="p-1.5 rounded-full bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 shadow-xs transition-transform active:scale-90"
            aria-label="Next card"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[10px] font-bold text-stone-600 border border-stone-200 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
          <span>Swipe or click chevrons</span>
        </span>

        {/* Counter Dots */}
        <div className="flex items-center gap-1">
          {items.map((p, idx) => (
            <span
              key={p.id}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                idx === currentIndex ? "w-3.5 bg-amber-600" : "w-1.5 bg-stone-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
