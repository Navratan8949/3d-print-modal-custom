"use client";

import Link from "next/link";
import {
  MessageCircle,
  Phone,
  Mail,
  ArrowRight,
  User as UserIcon,
  LogOut,
  Package,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  Home,
  Layers,
  Send,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { DISPLAY_PHONE_NUMBER, BRAND_EMAIL } from "@/lib/whatsapp";

export default function MobileMenu({ isOpen, onClose, topOffset = 64 }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  if (!isOpen) return null;

  const mainLinks = [
    { label: "Home", href: "/", icon: Home, desc: "Explore prime 3D studio" },
    { label: "Catalog & All Products", href: "/shop", icon: Layers, desc: "39+ curated 3D creations" },
    { label: "Custom 3D Miniature", href: "/products/custom-3d-miniature", icon: Sparkles, desc: "Handcrafted from photo" },
    { label: "Shopping Cart", href: "/cart", icon: ShoppingBag, desc: "Review items & instant checkout" },
    { label: "Contact Us", href: "/contact", icon: Send, desc: "Custom quotes & studio inquiry" },
  ];

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 lg:hidden overflow-hidden"
      style={{ top: `${topOffset}px` }}
    >
      {/* Backdrop (Starts directly under the header bar) */}
      <div
        className="absolute inset-0 bg-stone-950/50 transition-opacity"
        onClick={onClose}
      />

      {/* Menu Modal Drawer - Slides smoothly from directly beneath the header */}
      <div
        className="relative z-10 w-full bg-white border-b border-stone-200 shadow-2xl overflow-y-auto animate-in slide-in-from-top-3 duration-200 ease-out"
        style={{ maxHeight: `calc(100vh - ${topOffset}px)` }}
      >
        {/* User Account / Sign In Banner */}
        <div className="p-4 bg-stone-50 border-b border-stone-200/90">
          {isAuthenticated ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-linear-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-stone-900 truncate">{user?.name}</p>
                  <p className="text-[11px] text-stone-500 truncate">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Link
                  href="/profile"
                  onClick={onClose}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors"
                >
                  My Profile
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={onClose}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-colors"
                  >
                    Admin ↗
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-stone-900">Welcome to Prime 3D World</p>
                <p className="text-[11px] text-stone-500">Sign in to track orders & live status</p>
              </div>
              <Link
                href="/login"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shadow-2xs shrink-0"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            </div>
          )}
        </div>

        {/* Primary Navigation Links */}
        <nav className="p-3 sm:p-4 space-y-1">
          {mainLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-stone-50 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-stone-100 group-hover:bg-amber-100 text-stone-700 group-hover:text-amber-800 flex items-center justify-center shrink-0 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-stone-900 group-hover:text-amber-700 block transition-colors">
                      {link.label}
                    </span>
                    <span className="text-[10px] text-stone-400 block truncate">
                      {link.desc}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
              </Link>
            );
          })}

          {/* Authenticated Extra Options */}
          {isAuthenticated && (
            <div className="pt-2 mt-2 border-t border-stone-100 space-y-1">
              {/* Universal Profile Link */}
              <Link
                href="/profile"
                onClick={onClose}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-stone-50 text-xs font-semibold text-stone-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <span>My Profile & Account</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
              </Link>

              <Link
                href="/my-orders"
                onClick={onClose}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-stone-50 text-xs font-semibold text-stone-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4" />
                  </div>
                  <span>My Orders & Live Tracking</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
              </Link>

              {isAdmin && (
                <>
                  <Link
                    href="/admin/orders"
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-stone-50 text-xs font-semibold text-stone-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4" />
                      </div>
                      <span>Manage All Orders</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                  </Link>
                  <Link
                    href="/admin/products"
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-stone-50 text-xs font-semibold text-stone-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <span>Manage Products & Categories</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                  </Link>
                </>
              )}

              <button
                type="button"
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span>Sign Out</span>
                </div>
              </button>
            </div>
          )}
        </nav>

        {/* WhatsApp & Quick Contact Strip */}
        <div className="p-4 bg-stone-50/80 border-t border-stone-200/90 space-y-3">
          <a
            href="https://wa.me/916376145171?text=Hi%20Prime3Dworld%2C%20I%20have%20an%20inquiry%20regarding%20custom%203D%20printing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all active:scale-[0.99]"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Chat on WhatsApp (+91 63761 45171)</span>
          </a>

          <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 px-1">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-amber-600" />
              <span>{DISPLAY_PHONE_NUMBER}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="w-3 h-3 text-amber-600" />
              <span className="truncate max-w-[140px]">{BRAND_EMAIL}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
