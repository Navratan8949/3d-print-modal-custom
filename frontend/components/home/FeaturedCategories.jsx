"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import { categoriesAPI } from "@/lib/api";
import { resolveProductImage, handleImageError } from "@/lib/imageUtils";

export default function FeaturedCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoriesAPI
      .getAll()
      .then((res) => {
        if (res && res.categories && res.categories.length > 0) {
          setCategories(res.categories);
        } else {
          setCategories([]);
        }
      })
      .catch((err) => {
        console.warn("Categories fetch error:", err.message);
        setCategories([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (!loading && categories.length === 0) {
    return null;
  }

  return (
    <section className="pt-2 pb-10 sm:pt-4 sm:pb-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Curated Collections"
        title="Explore by Category"
        description="From sculpted emotional keepsakes to architectural living accents, browse our specialized 3D printing collections."
      />

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {categories.map((category) => {
          const catSlug = category.slug || category.id;

          return (
            <Link
              key={category.id || catSlug}
              href={`/shop?category=${catSlug}`}
              className="group relative flex flex-col justify-between rounded-2xl bg-white border border-stone-200 shadow-xs hover:shadow-xl hover:border-amber-400/80 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden"
            >
              {/* Visual Header: Strictly uses uploaded category image, never static public product mockups */}
              <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-100">
                {category.image_url ? (
                  <img
                    src={resolveProductImage(category.image_url)}
                    alt={category.name}
                    onError={(e) => handleImageError(e)}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                  />
                ) : (
                  <div
                    className="w-full h-full flex flex-col items-center justify-center p-6 text-center"
                    style={{
                      background: `linear-gradient(135deg, ${category.accentColor || "#D97706"}15 0%, ${category.accentColor || "#D97706"}35 100%)`,
                    }}
                  >
                    <span className="font-serif font-bold text-xl text-stone-800 drop-shadow-2xs">
                      {category.name}
                    </span>
                    {category.tagline && (
                      <span className="text-[11px] text-stone-600 mt-1 font-medium">
                        {category.tagline}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 block">
                    {category.itemCount || "Explore Collection"}
                  </span>
                  <h3 className="mt-1 text-lg font-serif font-bold text-stone-900 group-hover:text-amber-700 transition-colors">
                    {category.name}
                  </h3>
                  <p className="mt-1.5 text-xs text-stone-600 leading-relaxed line-clamp-2">
                    {category.shortDescription || category.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-800 group-hover:text-amber-700 transition-colors">
                    View in Catalog
                  </span>
                  <div className="p-1.5 rounded-full bg-stone-100 group-hover:bg-amber-600 text-stone-600 group-hover:text-white transition-all duration-200 shadow-2xs">
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 duration-200" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
