"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X, SlidersHorizontal, Sparkles } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import ProductGrid from "@/components/products/ProductGrid";
import { PRODUCTS } from "@/data/products";
import { CATEGORIES } from "@/data/categories";
import { productsAPI } from "@/lib/api";

function ShopContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [productsList, setProductsList] = useState(PRODUCTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    productsAPI
      .getAll({ limit: 100 })
      .then((res) => {
        if (res && res.products && res.products.length > 0) {
          setProductsList(res.products);
        }
      })
      .catch((err) => {
        console.warn("Using fallback products catalog:", err.message);
      });
  }, []);

  // Filtering and Sorting logic
  const filteredProducts = useMemo(() => {
    let result = Array.isArray(productsList) ? [...productsList] : [];

    // Category filter
    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter((p) => {
        const catId = (p.categoryId || "").toLowerCase();
        const catName = (p.category || "").toLowerCase();
        const target = selectedCategory.toLowerCase();
        return catId === target || catName === target || catName.includes(target) || catId.includes(target);
      });
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          String(p.id) === q ||
          p.name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.shortDescription?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t?.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === "price-low") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price-high") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === "name-asc") {
      result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortBy === "name-desc") {
      result.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    } else if (sortBy === "featured") {
      result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    }

    return result;
  }, [productsList, selectedCategory, searchQuery, sortBy]);

  const clearAllFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setSortBy("featured");
  };

  const isFiltered = selectedCategory !== "all" || Boolean(searchQuery.trim());

  return (
    <div className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Editorial Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-700">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Curated 3D Creations Catalog</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 tracking-tight">
          Explore All Products
        </h1>
        <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
          Browse our complete catalog of personalized 3D figurines, sacred temple idols, collectible models, and modern home decor with real-time pricing and doorstep delivery across India.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-stone-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, ID (#101), or category..."
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort & Reset */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-stone-500" />
              <span className="text-xs font-medium text-stone-600 hidden sm:inline">
                Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3.5 py-2.5 text-xs font-semibold bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-600 text-stone-800 transition-colors"
              >
                <option value="featured">Featured First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Alphabetical (A - Z)</option>
                <option value="name-desc">Alphabetical (Z - A)</option>
              </select>
            </div>

            {isFiltered && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-2 text-xs font-semibold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
              selectedCategory === "all"
                ? "bg-stone-900 text-white shadow-xs"
                : "bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100"
            }`}
          >
            All Products ({productsList.length})
          </button>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs text-stone-500 px-1">
        <span>
          Showing{" "}
          <strong className="text-stone-900">{filteredProducts.length}</strong> of{" "}
          {productsList.length} 3D creations
        </span>
        {isFiltered && <span>Active filters applied</span>}
      </div>

      {/* Products Grid or Skeleton Loading (Zero Layout Shift) */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-white border border-stone-200/90 overflow-hidden animate-pulse shadow-2xs"
            >
              <div className="aspect-4/3 w-full bg-stone-200" />
              <div className="p-4 sm:p-5 space-y-3">
                <div className="h-3 w-20 bg-stone-200 rounded" />
                <div className="h-5 w-4/5 bg-stone-200 rounded" />
                <div className="h-3 w-full bg-stone-100 rounded" />
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div className="h-5 w-16 bg-stone-200 rounded" />
                  <div className="h-8 w-24 bg-stone-200 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ProductGrid products={filteredProducts} />
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
