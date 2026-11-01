"use client";

import Link from "next/link";
import {
  X,
  MessageCircle,
  Phone,
  Mail,
  ArrowRight,
  User as UserIcon,
  LogOut,
  Package,
  ShieldCheck,
} from "lucide-react";
import Logo from "@/components/common/Logo";
import { useAuth } from "@/context/AuthContext";
import { DISPLAY_PHONE_NUMBER, BRAND_EMAIL } from "@/lib/whatsapp";

export default function MobileMenu({ isOpen, onClose }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  if (!isOpen) return null;

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Catalog", href: "/shop" },
    { label: "Cart", href: "/cart" },
    { label: "Contact Us", href: "/contact" },
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-stone-50 shadow-2xl flex flex-col justify-between overflow-y-auto">
        {/* Header & Nav */}
        <div>
          <div className="p-5 flex items-center justify-between border-b border-stone-200 bg-white">
            <Logo />
            <button
              onClick={onClose}
              className="p-2 text-stone-500 hover:text-stone-900 rounded-lg"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Account Strip */}
          <div className="p-4 bg-stone-100/70 border-b border-stone-200">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                    {user?.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-stone-900 truncate">{user?.name}</p>
                    <p className="text-[11px] text-stone-500 truncate">{user?.email}</p>
                  </div>
                </div>
                {isAdmin && (
                  <span className="inline-block px-2 py-0.5 text-[9px] font-bold uppercase bg-amber-100 text-amber-800 rounded">
                    Studio Administrator
                  </span>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                onClick={onClose}
                className="flex items-center justify-between p-2 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-stone-800"
              >
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-amber-600" />
                  <span>Sign In / Register</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
              </Link>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-stone-800 hover:bg-amber-50 hover:text-amber-800 transition-colors"
              >
                <span>{link.label}</span>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </Link>
            ))}

            {isAuthenticated && (
              <>
                <div className="pt-2 pb-1">
                  <div className="h-px bg-stone-200" />
                </div>

                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={onClose}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                      <span>Admin Portal</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-amber-600" />
                  </Link>
                )}

                <Link
                  href="/my-orders"
                  onClick={onClose}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-stone-800 hover:bg-stone-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-stone-500" />
                    <span>My Orders</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-400" />
                </Link>

                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </div>
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Footer Contact & WhatsApp CTA */}
        <div className="p-5 bg-white border-t border-stone-200 space-y-4">
          <a
            href="https://wa.me/916376145171"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-md hover:bg-emerald-700 transition-colors"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Chat on WhatsApp</span>
          </a>

          <div className="space-y-1.5 text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-amber-600" />
              <span>{DISPLAY_PHONE_NUMBER}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-amber-600" />
              <span className="truncate">{BRAND_EMAIL}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
