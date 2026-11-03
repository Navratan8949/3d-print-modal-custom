import Link from "next/link";
import {
  Compass,
  ArrowRight,
  Home,
  ShoppingBag,
  MessageCircle,
  Search,
  Sparkles,
  Layers,
} from "lucide-react";

export const metadata = {
  title: "404 – Page Not Found | Prime 3D World",
  description:
    "The 3D model or page you are looking for does not exist. Browse our custom 3D figurines, sacred idols, and personalized creations.",
};

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Animated 3D Graphic Badge */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-amber-700/20 border border-amber-300/40 flex items-center justify-center shadow-lg shadow-amber-500/10 relative">
            <span className="font-serif font-black text-5xl sm:text-6xl text-amber-600 select-none">
              404
            </span>
            <span className="absolute -top-2 -right-2 px-2.5 py-0.5 rounded-full bg-stone-900 text-amber-300 text-[10px] font-bold tracking-widest uppercase border border-amber-500/40 shadow-xs">
              Layer Lost
            </span>
          </div>
        </div>

        {/* Headlines */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight [text-wrap:balance]">
            Oops! This 3D Layer Has Gone Missing.
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed [text-wrap:balance]">
            The model, creation, or link you are trying to view might have been moved, renamed, or hasn&apos;t been 3D printed yet!
          </p>
        </div>

        {/* Quick Search Redirect Box */}
        <form
          action="/shop"
          method="GET"
          className="max-w-md mx-auto relative flex items-center"
        >
          <Search className="w-4 h-4 text-stone-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            name="search"
            placeholder="Search custom figurines, idols, pen stands..."
            className="w-full pl-11 pr-24 py-3 rounded-2xl bg-white border border-stone-200/90 text-xs text-stone-900 placeholder:text-stone-400 shadow-2xs focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 transition-all"
          />
          <button
            type="submit"
            className="absolute right-1.5 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-[11px] transition-colors"
          >
            Search
          </button>
        </form>

        {/* Action Navigation Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors shadow-sm active:scale-95"
          >
            <Home className="w-4 h-4 text-amber-400" />
            <span>Return to Home</span>
          </Link>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors shadow-sm active:scale-95"
          >
            <ShoppingBag className="w-4 h-4 text-white" />
            <span>Browse 3D Catalog</span>
          </Link>

          <a
            href="https://wa.me/916376145171?text=Hi%20Prime3Dworld%2C%20I%20reached%20a%20404%20page%20and%20need%20help%20with%20a%20custom%203D%20order."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-emerald-700 font-semibold text-xs transition-colors shadow-2xs active:scale-95"
          >
            <MessageCircle className="w-4 h-4 fill-emerald-600 text-emerald-600" />
            <span>Ask on WhatsApp</span>
          </a>
        </div>

        {/* Curated Quick Link Pills */}
        <div className="pt-6 border-t border-stone-200/60 max-w-lg mx-auto space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
            Popular 3D Collections:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/products/custom-3d-miniature"
              className="px-3 py-1 rounded-full bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-700 text-xs font-medium transition-colors"
            >
              👫 Miniature Couples &amp; Figurines
            </Link>
            <Link
              href="/shop?category=3d-printed-idols"
              className="px-3 py-1 rounded-full bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-700 text-xs font-medium transition-colors"
            >
              🛕 Sacred Temple Idols
            </Link>
            <Link
              href="/shop?category=personalized-name-models"
              className="px-3 py-1 rounded-full bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-700 text-xs font-medium transition-colors"
            >
              🏷️ Personalized Names
            </Link>
            <Link
              href="/shop?category=home-decor"
              className="px-3 py-1 rounded-full bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-700 text-xs font-medium transition-colors"
            >
              🏡 Stylish Home Décor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

