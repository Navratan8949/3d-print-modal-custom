import { Sparkles, Phone, ArrowRight } from "lucide-react";
import Link from "next/link";
import { DISPLAY_PHONE_NUMBER } from "@/lib/whatsapp";

export default function AnnouncementBar() {
  return (
    <div className="bg-stone-900 text-stone-200 text-xs py-2 px-4 border-b border-stone-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left Feature */}
        <div className="hidden sm:flex items-center gap-2 text-stone-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Handcrafted bespoke 3D manufacturing & digital sculpting</span>
        </div>

        {/* Center Main Message */}
        <div className="flex-1 text-center font-medium">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 hover:text-amber-300 transition-colors"
          >
            <span>Bring Your Imagination to Life with Custom 3D Printing</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
          </Link>
        </div>

        {/* Right WhatsApp Support Contact */}
        <div className="hidden md:flex items-center gap-2 text-stone-400">
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
