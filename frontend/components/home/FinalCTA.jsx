import Link from "next/link";
import { MessageCircle, ArrowRight } from "lucide-react";
import { DISPLAY_PHONE_NUMBER } from "@/lib/whatsapp";

export default function FinalCTA() {
  return (
    <section className="py-20 sm:py-28 bg-stone-900 text-white relative overflow-hidden">
      {/* Background Accent Lines */}
      <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
          Start Your Custom Project
        </span>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-white [text-wrap:balance]">
          Have an Idea? Let&apos;s Create Something Extraordinary.
        </h2>

        <p className="text-sm sm:text-base text-stone-300 max-w-2xl mx-auto leading-relaxed [text-wrap:balance]">
          Whether you need a custom personalized human figurine, sacred temple sculpture, bespoke name model, or corporate gift, Prime3Dworld is ready to sculpt your vision.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold text-sm shadow-md transition-all active:scale-95"
          >
            <span>Explore Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="https://wa.me/916376145171?text=Hello%20Prime3Dworld!%20I%20have%20an%20idea%20for%20a%20custom%203D%20creation."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-semibold text-sm border border-stone-700 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400 fill-current" />
            <span>Chat on WhatsApp ({DISPLAY_PHONE_NUMBER})</span>
          </a>
        </div>
      </div>
    </section>
  );
}
