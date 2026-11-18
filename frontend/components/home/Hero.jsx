"use client";

import Link from "next/link";
import {
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  Star,
  Truck,
  Palette,
  Printer,
  HeartHandshake,
  Users,
  Home,
  Gift,
  Sparkles,
  Layers,
} from "lucide-react";
import { motion } from "framer-motion";
import HeroCardStack from "@/components/home/HeroCardStack";

const SPECIALTIES = [
  { icon: Palette, text: "Custom Designs", color: "text-amber-600" },
  { icon: Printer, text: "High-Quality 3D Prints", color: "text-stone-700" },
  { icon: HeartHandshake, text: "Personalized Gifts", color: "text-rose-500" },
  { icon: Users, text: "3D Miniature Couples", color: "text-indigo-600" },
  { icon: Home, text: "Stylish Décor", color: "text-emerald-600" },
  { icon: Gift, text: "Perfect for Every Occasion", color: "text-amber-700" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 260, damping: 22 },
  },
};

const pillsContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

const pillVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 320, damping: 20 },
  },
};

export default function Hero({ initialProducts = [] }) {
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden py-6 border-b border-stone-200/60"
      style={{
        background:
          "radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.08) 0%, transparent 45%), radial-gradient(circle at 10% 80%, rgba(249, 115, 22, 0.05) 0%, transparent 40%), linear-gradient(180deg, #FAF8F5 0%, #F5EFE6 55%, #FAF8F5 100%)",
      }}
    >
      {/* Ambient Animated Glows */}
      <div className="absolute -top-20 -left-20 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-amber-400/15 blur-3xl animate-pulse pointer-events-none duration-1000" />
      <div className="absolute top-1/3 -right-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-orange-400/10 blur-3xl animate-pulse pointer-events-none duration-1000" />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-8 lg:gap-x-8 items-center">
          {/* Left Column: Editorial Copy, Badges & CTAs */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7 lg:pr-6">
            {/* Live Eyebrow Badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3.5 py-1.5 border border-amber-500/25 text-xs font-semibold text-amber-950 shadow-2xs hover:scale-105 transition-transform duration-200 will-change-transform transform-gpu"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Welcome to Prime 3D World — where creativity meets technology!</span>
            </motion.div>

            {/* Main Headline with Smooth Text Shimmer */}
            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-5xl lg:text-5xl xl:text-[54px] font-serif font-bold tracking-tight text-stone-900 leading-[1.14] [text-wrap:balance] will-change-transform transform-gpu"
            >
              Turning Your Ideas Into Reality —{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 animate-gradient-shimmer">
                One Layer at a Time!
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={itemVariants}
              className="text-sm sm:text-base text-stone-600 max-w-xl leading-relaxed will-change-transform transform-gpu"
            >
              From custom 3D prints &amp; personalized names to 3D miniature couples, unique gifts, toys, models &amp; décor, we bring your imagination to life.
            </motion.p>

            {/* 6 Key Highlights - Professional Vector Tag Pills */}
            <motion.div
              variants={pillsContainerVariants}
              className="flex flex-wrap items-center gap-2 pt-1 max-w-xl"
            >
              {SPECIALTIES.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.span
                    key={item.text}
                    variants={pillVariants}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 border border-stone-200/90 text-xs font-semibold text-stone-800 shadow-2xs hover:border-amber-500 hover:bg-amber-50 hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200 cursor-default will-change-transform transform-gpu"
                  >
                    <Icon className={`w-3.5 h-3.5 ${item.color} shrink-0`} />
                    <span>{item.text}</span>
                  </motion.span>
                );
              })}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              variants={itemVariants}
              className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 will-change-transform transform-gpu"
            >
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.99] group cursor-pointer"
              >
                <span>Explore The Catalog</span>
                <ArrowRight className="w-4 h-4 text-amber-400 transition-transform group-hover:translate-x-1.5 duration-200" />
              </Link>

              <a
                href="https://wa.me/916376145171?text=Hi%20Prime3Dworld%2C%20I%20want%20to%20order%20a%20custom%203D%20print"
                target="_blank"
                rel="noopener noreferrer"
                className="relative inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-[0.99] group cursor-pointer"
              >
                {/* Subtle Pulse Badge */}
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-200"></span>
                </span>
                <MessageCircle className="w-4 h-4 fill-white group-hover:scale-110 transition-transform duration-200" />
                <span>Order on WhatsApp</span>
                <span className="ml-1 inline-flex items-center text-[10px] font-bold uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded-md text-white border border-white/20">
                  Instant
                </span>
              </a>

              <Link
                href="/products/custom-3d-miniature"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-amber-800 hover:text-amber-900 text-xs font-semibold sm:hidden hover:underline"
              >
                <span>Custom Figurine from Photo →</span>
              </Link>
            </motion.div>
          </div>

          {/* Interactive 3D Showcase Card Deck (Directly below buttons on mobile, right column on desktop) */}
          <div className="lg:col-span-5 lg:row-start-1 lg:row-span-2 flex flex-col items-center justify-center pt-2 lg:pt-0">
            {/* Mobile swipe helper tag with real vector icon */}
            <div className="sm:hidden mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-900/90 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 shadow-2xs">
              <Layers className="w-3 h-3 text-amber-700 shrink-0" />
              <span>Swipe cards to explore 3D creations</span>
            </div>
            <HeroCardStack initialProducts={initialProducts} />
          </div>

          {/* Trust Proof - Clean Inline Bar */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-7 pt-4 border-t border-stone-200/70 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-stone-600 lg:pr-6 will-change-transform transform-gpu"
          >
            <div className="flex items-center gap-2 group cursor-default">
              <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              </div>
              <div>
                <span className="font-semibold text-stone-900">4.9/5 Rating</span>
                <span className="text-stone-400 mx-1.5 hidden sm:inline">•</span>
                <span className="text-stone-500 hidden sm:inline">500+ Happy Orders</span>
              </div>
            </div>

            <div className="flex items-center gap-2 group cursor-default">
              <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div>
                <span className="font-semibold text-stone-900">100% Custom Made</span>
                <span className="text-stone-400 mx-1.5 hidden sm:inline">•</span>
                <span className="text-stone-500 hidden sm:inline">Photo to 3D Print</span>
              </div>
            </div>

            <div className="flex items-center gap-2 group cursor-default">
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div>
                <span className="font-semibold text-stone-900">Pan-India Delivery</span>
                <span className="text-stone-400 mx-1.5 hidden sm:inline">•</span>
                <span className="text-stone-500 hidden sm:inline">Safe Gift Packaged</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
