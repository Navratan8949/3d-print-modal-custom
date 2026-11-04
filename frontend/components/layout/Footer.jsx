import Link from "next/link";
import { Phone, Mail, MessageCircle, MapPin } from "lucide-react";
import Logo from "@/components/common/Logo";
import { DISPLAY_PHONE_NUMBER, BRAND_EMAIL } from "@/lib/whatsapp";
import { CATEGORIES } from "@/data/categories";

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-12 sm:pt-16 pb-10 sm:pb-12 border-t border-stone-800 w-full max-w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-stone-800">
          {/* Col 1: Brand Profile */}
          <div className="space-y-4">
            <Logo isLight={true} />
            <p className="text-xs sm:text-sm text-stone-400 max-w-sm leading-relaxed">
              Prime3Dworld brings your imagination to life through premium customized 3D printing. From personalized human figurines and bespoke typography to sacred devotional idols.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://wa.me/916376145171"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-600/30 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Col 2: Catalog Collections */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Catalog Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              {CATEGORIES.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/shop?category=${cat.slug}`}
                    className="hover:text-amber-400 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/shop" className="text-amber-500 hover:text-amber-400 font-medium">
                  View Full Catalog →
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-amber-400 transition-colors">
                  Catalog
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-amber-400 transition-colors">
                  Inquiry Bag / Cart
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-400 transition-colors">
                  Contact Studio
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Direct Studio Contact */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Studio Contact
            </h4>
            <ul className="space-y-3 text-xs text-stone-400">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[11px] text-stone-500">Call / WhatsApp</span>
                  <a
                    href="https://wa.me/916376145171"
                    className="text-stone-200 hover:text-white font-medium tabular-nums"
                  >
                    {DISPLAY_PHONE_NUMBER}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[11px] text-stone-500">Email Inquiries</span>
                  <a
                    href={`mailto:${BRAND_EMAIL}`}
                    className="text-stone-200 hover:text-white font-medium break-all"
                  >
                    {BRAND_EMAIL}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[11px] text-stone-500">Manufacturing & Lab</span>
                  <span className="text-stone-300">Pan-India Express Delivery</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-500 text-center md:text-left">
          <div>
            © {new Date().getFullYear()} Prime3Dworld. All rights reserved.
          </div>

          <div>
            Design &amp; Developed by{" "}
            <a
              href="https://www.codepecharcha.in"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-amber-500 hover:text-amber-400 transition-colors underline underline-offset-2"
            >
              Code Pe Charcha
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link href="/shop" className="hover:text-stone-400 transition-colors">
              Catalog
            </Link>
            <Link href="/contact" className="hover:text-stone-400 transition-colors">
              Contact
            </Link>
            <a
              href="https://wa.me/916376145171"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-500 hover:text-emerald-400 transition-colors"
            >
              WhatsApp Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
