import { Sparkles, Phone, ArrowRight } from "lucide-react";
import Link from "next/link";
import { DISPLAY_PHONE_NUMBER } from "@/lib/whatsapp";

export default function AnnouncementBar() {
  return (
    <div className="bg-stone-900 text-stone-200 text-xs py-2 px-3 sm:px-4 border-b border-stone-800 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Feature */}
        <div className="hidden lg:flex items-center gap-2 text-stone-400 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Handcrafted bespoke 3D manufacturing & digital sculpting</span>
        </div>

        {/* Center Main Message */}
        <div className="flex-1 text-center font-medium min-w-0 overflow-hidden">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-1.5 hover:text-amber-300 transition-colors text-[11px] sm:text-xs max-w-full"
          >
            <span className="truncate block max-w-[250px] sm:max-w-none">
              Bring Imagination to Life with 3D Printing
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          </Link>
        </div>

        {/* Right WhatsApp Support Contact */}
        <div className="hidden md:flex items-center gap-2 text-stone-400 shrink-0">
          <Phone className="w-3 h-3 text-emerald-400" />
          <span>Direct Orders:</span>
          <a
            href="https://wa.me/916376145171"
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-300 font-semibold hover:text-white transition-colors tabular-nums"
          >
            {DISPLAY_PHONE_NUMBER}
          </a>
        </div>
      </div>
    </div>
  );
}
