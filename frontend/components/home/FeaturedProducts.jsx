"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import ProductCard from "@/components/products/ProductCard";
import { productsAPI } from "@/lib/api";

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsAPI
      .getAll({ featured: "true", limit: 6 })
      .then((res) => {
        if (res && res.products && res.products.length > 0) {
          setProducts(res.products.slice(0, 6));
        } else {
          return productsAPI.getAll({ limit: 6 }).then((fallbackRes) => {
            if (fallbackRes && fallbackRes.products && fallbackRes.products.length > 0) {
              setProducts(fallbackRes.products.slice(0, 6));
            }
          });
        }
      })
      .catch((err) => {
        console.warn("FeaturedProducts API fetch failed:", err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 border-t border-stone-200/60">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <SectionHeading
          eyebrow="Trending Creations"
          title="Best-Selling 3D Prints"
          description="Handcrafted personalized figurines, sacred temple idols, and artisanal home accents loved by our customers."
        />
        <Link
          href="/shop"
          className="hidden sm:inline-flex items-center gap-2 text-xs font-bold text-amber-700 hover:text-amber-800 shrink-0 group py-1"
        >
          <span>Explore Full Catalog</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* 6 Grid Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {loading
          ? [...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-stone-100 animate-pulse border border-stone-200/80"
              />
            ))
          : products.map((product) => (
              <ProductCard key={product.id || product._id} product={product} />
            ))}
      </div>

      {/* Prominent Bottom View All in Catalog Button */}
      <div className="pt-4 text-center">
        <Link
          href="/shop"
          className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] group"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Explore All Products in Catalog</span>
          <ArrowRight className="w-4 h-4 text-amber-400 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}

