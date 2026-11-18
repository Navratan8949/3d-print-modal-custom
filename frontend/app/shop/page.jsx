"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X, SlidersHorizontal, Sparkles } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import ProductGrid from "@/components/products/ProductGrid";
import PromoMiniatureBanner from "@/components/common/PromoMiniatureBanner";
import { productsAPI, categoriesAPI } from "@/lib/api";

function ShopContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [productsList, setProductsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoriesAPI
      .getAll()
      .then((res) => {
        if (res && res.categories) {
          setCategoriesList(res.categories);
        }
      })
      .catch((e) => console.warn("Categories fetch error:", e.message));
  }, []);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    setLoading(true);
    productsAPI
      .getAll({ limit: 100 })
      .then((res) => {
        if (res && res.products) {
          setProductsList(res.products);
        } else {
          setProductsList([]);
        }
      })
      .catch((err) => {
        console.warn("Failed to load products from server:", err.message);
        setProductsList([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Filtering and Sorting logic
  const filteredProducts = useMemo(() => {
    let result = Array.isArray(productsList) ? [...productsList] : [];

    // Robust category filter matching slug, id, and normalized name
    if (selectedCategory && selectedCategory !== "all") {
      const target = selectedCategory.toLowerCase().trim();
      const normalizedTarget = target.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

      result = result.filter((p) => {
        const catId = (p.categoryId || "").toLowerCase().trim();
        const catName = (p.category || "").toLowerCase().trim();
        const catSlug = (p.categorySlug || catId).toLowerCase().trim();
        const normalizedCatId = catId.replace(/[^a-z0-9]+/g, "-");
        const normalizedCatName = catName.replace(/[^a-z0-9]+/g, "-");

        // Exact match
        if (catId === target || catName === target || catSlug === target) return true;

        // Normalized slug match (e.g. "personalized-name-models" vs "Personalized Name Models")
        if (
          normalizedCatId === normalizedTarget ||
          normalizedCatName === normalizedTarget ||
          normalizedCatId.includes(normalizedTarget) ||
          normalizedTarget.includes(normalizedCatId)
        ) {
          return true;
        }

        // Substring / keyword fallbacks
        if (target.includes("name") && (catId.includes("name") || catName.includes("name"))) return true;
        if (
          (target.includes("figurin") || target.includes("miniature")) &&
          (catId.includes("figurin") || catName.includes("figurin") || catId.includes("miniature"))
        ) {
          return true;
        }
        if (target.includes("idol") && (catId.includes("idol") || catName.includes("idol"))) return true;
        if (target.includes("decor") && (catId.includes("decor") || catName.includes("decor"))) return true;
        if (target.includes("planter") && (catId.includes("planter") || catName.includes("planter"))) return true;

        return catName.includes(target) || catId.includes(target);
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
      <div className="p-4 sm:p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
          {/* Search Box with High Visibility */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, ID (#101), or category..."
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm font-medium bg-stone-50 hover:bg-white focus:bg-white border border-stone-300 focus:border-amber-600 rounded-xl focus:outline-hidden transition-all text-stone-900 placeholder:text-stone-400 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 rounded-md transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort & Reset */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-stone-600" />
              <span className="text-xs font-semibold text-stone-700 hidden sm:inline">
                Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3.5 py-2.5 text-xs font-bold bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-600 text-stone-800 transition-colors shadow-2xs cursor-pointer"
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
                type="button"
                onClick={clearAllFilters}
                className="px-3.5 py-2.5 text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-100/80 hover:bg-amber-200 border border-amber-300 rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Tabs - Pure Scrollbar-Free with High Visibility */}
        <div className="flex items-center gap-2.5 overflow-x-auto py-1.5 px-0.5 no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-4 sm:px-5 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer shrink-0 ${selectedCategory === "all"
                ? "bg-stone-900 text-white shadow-md shadow-stone-900/20 ring-2 ring-stone-900"
                : "bg-white text-stone-800 border-2 border-stone-200 hover:border-amber-500 hover:bg-stone-50 shadow-2xs"
              }`}
          >
            All Products ({productsList.length})
          </button>
          {categoriesList.map((cat) => {
            const isSelected = selectedCategory === (cat.slug || cat.id);
            return (
              <button
                key={cat.id || cat.slug}
                type="button"
                onClick={() => setSelectedCategory(cat.slug || cat.id)}
                className={`px-4 sm:px-5 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer shrink-0 ${isSelected
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/25 ring-2 ring-amber-600"
                    : "bg-white text-stone-800 border-2 border-stone-200 hover:border-amber-500 hover:bg-stone-50 shadow-2xs"
                  }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Promotional Custom 3D Miniature Spotlight Banner */}
      <PromoMiniatureBanner />

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
