"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Search, X, ArrowRight, Sparkles } from "lucide-react";
import { productsAPI } from "@/lib/api";
import ProductVisual from "@/components/products/ProductVisual";

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    if (isOpen) {
      productsAPI
        .getAll({ limit: 100 })
        .then((res) => {
          if (res && res.products) {
            setAllProducts(res.products);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.shortDescription && p.shortDescription.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }, [query, allProducts]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative mx-auto max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all border border-stone-200">
        {/* Input Bar */}
        <div className="relative flex items-center border-b border-stone-200 px-4 py-3">
          <Search className="w-5 h-5 text-stone-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search custom figurines, idols, name models, planters..."
            className="w-full border-0 bg-transparent px-3 text-stone-900 placeholder:text-stone-400 focus:outline-none text-sm"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-stone-400 hover:text-stone-600 mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-xs font-semibold text-stone-500 hover:bg-stone-100 transition-colors"
          >
            Esc
          </button>
        </div>

        {/* Results / Suggestions */}
        <div className="max-h-96 overflow-y-auto p-4">
          {!query.trim() ? (
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Popular Searches
              </div>
              <div className="flex flex-wrap gap-2">
                {["Custom 3D Miniature", "Khatu Shyam Ji Idol", "Name Model", "Cat Planter", "Flower Bouquet"].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 text-xs font-medium text-stone-700 hover:bg-amber-50 hover:text-amber-800 transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-sm font-semibold text-stone-900">No matching creations found</p>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Try searching for figurines, idols, desk organizers, or personalized gifts.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                Found {filteredProducts.length} Results
              </div>
              {filteredProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-amber-50/70 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-lg bg-stone-100 overflow-hidden shrink-0">
                    <ProductVisual imageKey={p.imageKey} alt={p.name} aspectRatio="1/1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-stone-900 group-hover:text-amber-700 transition-colors truncate">
                      {p.name}
                    </h4>
                    <p className="text-xs text-stone-500 truncate">{p.category}</p>
                  </div>
                  <span className="text-xs font-semibold text-stone-900 tabular-nums">
                    {p.priceLabel}
                  </span>
                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-amber-600 transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
