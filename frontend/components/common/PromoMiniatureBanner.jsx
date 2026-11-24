"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Truck,
  MessageCircle,
  Eye,
  Star,
  Flame,
} from "lucide-react";
import { WHATSAPP_CONSULTATION_URL } from "@/lib/whatsapp";

export default function PromoMiniatureBanner({ className = "" }) {
  const whatsAppUrl =
    WHATSAPP_CONSULTATION_URL ||
    "https://wa.me/916376145171?text=Hello%20Prime3Dworld!%20I%20want%20to%20order%20a%20Custom%203D%20Miniature%20from%20my%20photos.%20Please%20guide%20me%20with%20options%20and%20pricing.";

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-linear-to-br from-stone-950 via-stone-900 to-amber-950 text-white border border-amber-500/20 shadow-xl ${className}`}
    >
      {/* Decorative Ambient Background Blurs */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative p-6 sm:p-8 md:p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Value Proposition & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>#1 Custom 3D Studio in India</span>
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <Flame className="w-3 h-3 text-rose-400 fill-current" />
                <span>Popular for Weddings &amp; Gifts</span>
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4.5xl font-serif font-bold tracking-tight text-white leading-tight">
                Custom 3D Miniature Handcrafted From Your Photos
              </h2>
              <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-xl">
                Turn your wedding couple, family memories, graduation portraits, or beloved pets into realistic, sculpted 3D statues. Review your digital 3D likeness preview before printing!
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <Eye className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-medium text-stone-200">
                  Free 3D Digital Preview
                </span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-medium text-stone-200">
                  100% Likeness Guarantee
                </span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <Truck className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="text-xs font-medium text-stone-200">
                  5-7 Days Safe Delivery
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-[0.99] group"
              >
                <span>Customize Your Miniature Now</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white font-semibold text-sm border border-emerald-500/40 transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            {/* Social Proof Footer */}
            <div className="flex items-center gap-3 pt-2 text-xs text-stone-400">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span>
                <strong className="text-white">4.9/5</strong> from 500+ custom deliveries across India
              </span>
            </div>
          </div>

          {/* Right Column: Visual Product Showcase Carousel / Cards */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm">
              {/* Main Miniature Showcase Card */}
              <div className="relative rounded-2xl bg-stone-900/90 border border-white/15 overflow-hidden shadow-2xl p-3.5 space-y-3">
                <div className="relative aspect-4/5 w-full rounded-xl overflow-hidden bg-stone-950">
                  <Image
                    src="/images/products/placeholder.png"
                    alt="Custom 3D Couple Miniature Handcrafted From Photo - Prime3D World"
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover object-top hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-stone-950/80 backdrop-blur-md text-[11px] font-bold text-amber-400 border border-amber-400/30">
                    Ultra-HD Resin
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 p-2 rounded-lg bg-stone-950/80 backdrop-blur-md text-[11px] text-stone-300 flex items-center justify-between border border-white/10">
                    <span className="font-semibold text-white">Full-Body Artisan Detailing</span>
                    <span className="text-amber-400 font-bold">Starts ₹1,499</span>
                  </div>
                </div>

                {/* Sub Features Pills */}
                <div className="flex items-center justify-between text-[11px] text-stone-300 px-1 pt-1">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Real Face 3D Sculpting</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Natural Oak Base</span>
                  </span>
                </div>
              </div>

              {/* Floating Mini Badge */}
              <div className="absolute -bottom-4 -left-4 hidden sm:flex items-center gap-2 p-2.5 rounded-xl bg-stone-900/95 border border-amber-500/30 shadow-xl backdrop-blur-md text-xs text-stone-200">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Over 1,200+ Photo Miniatures Sculpted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
