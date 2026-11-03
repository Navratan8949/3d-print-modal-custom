import Link from "next/link";
import { ArrowRight, Sparkles, MessageCircle, ShieldCheck, Star, Truck } from "lucide-react";
import HeroCardStack from "@/components/home/HeroCardStack";

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden py-12 lg:py-20 border-b border-stone-200/60"
      style={{
        background:
          "radial-gradient(circle at 75% 25%, rgba(245, 158, 11, 0.09) 0%, transparent 45%), radial-gradient(circle at 15% 75%, rgba(249, 115, 22, 0.06) 0%, transparent 40%), linear-gradient(180deg, #FAF8F5 0%, #F6F1EA 60%, #FAF8F5 100%)",
      }}
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Editorial Copy, CTAs & Proof */}
          <div className="lg:col-span-7 space-y-7 lg:pr-6">
            {/* Live Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3.5 py-1.5 border border-amber-500/25 text-xs font-semibold text-amber-900">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600" />
              </span>
              <span>Welcome to Prime 3D World — where creativity meets technology! 🖨️✨</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-serif font-bold tracking-tight text-stone-900 leading-[1.12] [text-wrap:balance]">
              🚀 Turning Your Ideas Into Reality —{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-orange-600 to-blue-700">
                One Layer at a Time! 🧡💙
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-base text-stone-600 max-w-xl leading-relaxed [text-wrap:balance]">
              From custom 3D prints &amp; personalized names to 3D miniature couples, unique gifts, toys, models &amp; décor, we bring your imagination to life.
            </p>

            {/* 6 Key Highlights Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 border border-stone-200/80 shadow-2xs text-xs font-semibold text-stone-800">
                <span className="text-base">🎨</span>
                <span className="truncate">Custom Designs</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 border border-stone-200/80 shadow-2xs text-xs font-semibold text-stone-800">
                <span className="text-base">🖨️</span>
                <span className="truncate">High-Quality Prints</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 border border-stone-200/80 shadow-2xs text-xs font-semibold text-stone-800">
                <span className="text-base">💝</span>
                <span className="truncate">Personalized Gifts</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 border border-stone-200/80 shadow-2xs text-xs font-semibold text-stone-800">
                <span className="text-base">👫</span>
                <span className="truncate">Miniature Couples</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 border border-stone-200/80 shadow-2xs text-xs font-semibold text-stone-800">
                <span className="text-base">🏡</span>
                <span className="truncate">Stylish Décor</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 border border-stone-200/80 shadow-2xs text-xs font-semibold text-stone-800">
                <span className="text-base">🎁</span>
                <span className="truncate">Every Occasion</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm shadow-md transition-all active:scale-[0.99] group"
              >
                <span>Explore The Catalog</span>
                <ArrowRight className="w-4 h-4 text-amber-400 transition-transform group-hover:translate-x-1" />
              </Link>

              <a
                href="https://wa.me/916376145171?text=Hi%20Prime3Dworld%2C%20I%20want%20to%20order%20a%20custom%203D%20print"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 font-semibold text-sm shadow-xs transition-all active:scale-[0.99]"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                <span>Order on WhatsApp</span>
              </a>

              <Link
                href="/products/custom-3d-miniature"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-amber-800 hover:text-amber-900 text-xs font-semibold sm:hidden"
              >
                <span>Custom Figurine from Photo →</span>
              </Link>
            </div>

            {/* Micro Feature Highlights */}
            <div className="pt-6 border-t border-stone-200/70 grid grid-cols-3 gap-3 sm:gap-4 text-stone-700">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 rounded-xl bg-white/80 p-3 border border-stone-200/60 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700 shrink-0">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <span className="block font-bold text-xs text-stone-900">4.9 / 5 Rating</span>
                  <span className="block text-[11px] text-stone-500">500+ Happy Orders</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 rounded-xl bg-white/80 p-3 border border-stone-200/60 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700 shrink-0">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <span className="block font-bold text-xs text-stone-900">100% Custom</span>
                  <span className="block text-[11px] text-stone-500">Photo to 3D Print</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 rounded-xl bg-white/80 p-3 border border-stone-200/60 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700 shrink-0">
                  <Truck className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <span className="block font-bold text-xs text-stone-900">Pan-India Ship</span>
                  <span className="block text-[11px] text-stone-500">Gift Packaging</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: High-Performance GPU Accelerated Card Deck */}
          <div className="lg:col-span-5 flex items-center justify-center pt-2 lg:pt-0">
            <HeroCardStack />
          </div>
        </div>
      </div>
    </section>
  );
}
