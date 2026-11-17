import Link from "next/link";
import { ArrowRight, MessageCircle, ShieldCheck, Star, Truck } from "lucide-react";
import HeroCardStack from "@/components/home/HeroCardStack";

const SPECIALTIES = [
  { icon: "🎨", text: "Custom Designs" },
  { icon: "🖨️", text: "High-Quality 3D Prints" },
  { icon: "💝", text: "Personalized Gifts" },
  { icon: "👫", text: "3D Miniature Couples" },
  { icon: "🏡", text: "Stylish Décor" },
  { icon: "🎁", text: "Perfect for Every Occasion" },
];

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden py-10 sm:py-14 lg:py-20 border-b border-stone-200/60"
      style={{
        background:
          "radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.08) 0%, transparent 45%), radial-gradient(circle at 10% 80%, rgba(249, 115, 22, 0.05) 0%, transparent 40%), linear-gradient(180deg, #FAF8F5 0%, #F5EFE6 55%, #FAF8F5 100%)",
      }}
    >
      {/* Ambient Animated Glows */}
      <div className="absolute -top-20 -left-20 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-amber-400/15 blur-3xl animate-pulse pointer-events-none duration-1000" />
      <div className="absolute top-1/3 -right-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-orange-400/10 blur-3xl animate-pulse pointer-events-none duration-1000" />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Editorial Copy, Badges & CTAs */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7 lg:pr-6">
            {/* Live Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3.5 py-1.5 border border-amber-500/25 text-xs font-semibold text-amber-950 shadow-2xs hover:scale-105 transition-transform duration-200">
              <span className="text-sm">🖨️✨</span>
              <span>Welcome to Prime 3D World — where creativity meets technology!</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-[54px] font-serif font-bold tracking-tight text-stone-900 leading-[1.14] [text-wrap:balance]">
              Turning Your Ideas Into Reality —{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 animate-gradient">
                One Layer at a Time!
              </span>{" "}
              <span className="inline-block text-2xl sm:text-3xl align-middle hover:rotate-12 transition-transform duration-300">🚀🧡💙</span>
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-base text-stone-600 max-w-xl leading-relaxed">
              From custom 3D prints &amp; personalized names to 3D miniature couples, unique gifts, toys, models &amp; décor, we bring your imagination to life.
            </p>

            {/* 6 Key Highlights - Sleek Tag Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 max-w-xl">
              {SPECIALTIES.map((item) => (
                <span
                  key={item.text}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 border border-stone-200/90 text-xs font-medium text-stone-800 shadow-2xs hover:border-amber-500 hover:bg-amber-50 hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200 cursor-default"
                >
                  <span className="text-xs">{item.icon}</span>
                  <span>{item.text}</span>
                </span>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
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
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-[0.99] group cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white group-hover:scale-110 transition-transform duration-200" />
                <span>Order on WhatsApp</span>
              </a>

              <Link
                href="/products/custom-3d-miniature"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-amber-800 hover:text-amber-900 text-xs font-semibold sm:hidden hover:underline"
              >
                <span>Custom Figurine from Photo →</span>
              </Link>
            </div>

            {/* Trust Proof - Clean Inline Bar */}
            <div className="pt-4 border-t border-stone-200/70 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-stone-600">
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
            </div>
          </div>

          {/* Right Column: Interactive 3D Showcase Card Deck */}
          <div className="lg:col-span-5 flex items-center justify-center pt-2 lg:pt-0">
            <HeroCardStack />
          </div>
        </div>
      </div>
    </section>
  );
}
