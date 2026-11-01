"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingBag, MessageCircle, Menu, User as UserIcon, LogOut, Package, ShieldCheck } from "lucide-react";
import Logo from "@/components/common/Logo";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import SearchModal from "./SearchModal";
import MobileMenu from "./MobileMenu";

export default function Header() {
  const pathname = usePathname();
  const { totalItemCount, setIsDrawerOpen } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Catalog", href: "/shop" },
    { label: "Cart", href: "/cart" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-[#FAF8F5]/95 backdrop-blur-md shadow-xs border-b border-stone-200/80 py-3"
            : "bg-[#FAF8F5] border-b border-stone-200/50 py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-8">
            {/* Zone 1: Single element brand mark */}
            <div className="shrink-0 flex items-center gap-1.5 sm:gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-1.5 text-stone-600 hover:text-stone-900 rounded-lg lg:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <Logo />
            </div>

            {/* Zone 2: Clean single-line text nav links */}
            <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-stone-700">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`whitespace-nowrap shrink-0 transition-colors relative py-1 ${
                      isActive
                        ? "text-stone-950 font-semibold"
                        : "text-stone-600 hover:text-amber-700"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Zone 3: Actions & utilities */}
            <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
              {/* Search Trigger */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-full transition-colors"
                aria-label="Search creations"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Shopping Bag Trigger with Tabular Badge (Hydration-safe) */}
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="relative p-2 text-stone-700 hover:text-stone-950 hover:bg-stone-200/60 rounded-full transition-colors"
                aria-label="Open inquiry bag"
              >
                <ShoppingBag className="w-4 h-4" />
                {mounted && totalItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-600 px-1 text-[10px] font-bold text-white tabular-nums shadow-xs">
                    {totalItemCount}
                  </span>
                )}
              </button>

              {/* User Account / Auth Dropdown */}
              <div className="relative" ref={userMenuRef}>
                {mounted && isAuthenticated ? (
                  <div>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-stone-800 bg-stone-100 hover:bg-stone-200/70 border border-stone-200/80 rounded-full transition-colors"
                      title={user?.name || "My Account"}
                    >
                      <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold uppercase">
                        {user?.name ? user.name[0] : "U"}
                      </div>
                      <span className="hidden sm:inline max-w-[90px] truncate">{user?.name?.split(" ")[0]}</span>
                      {isAdmin && (
                        <span className="hidden md:inline px-1.5 py-0.2 text-[9px] font-semibold bg-amber-100 text-amber-800 rounded">
                          Admin
                        </span>
                      )}
                    </button>

                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-stone-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-4 py-2 border-b border-stone-100">
                          <p className="text-xs font-semibold text-stone-900 truncate">{user?.name}</p>
                          <p className="text-[11px] text-stone-500 truncate">{user?.email}</p>
                          {isAdmin && (
                            <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 rounded">
                              Studio Administrator
                            </span>
                          )}
                        </div>

                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-amber-900 bg-amber-50/70 hover:bg-amber-100/70 transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4 text-amber-700" />
                            <span>Admin Portal</span>
                          </Link>
                        )}

                        <Link
                          href="/my-orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors"
                        >
                          <Package className="w-4 h-4 text-stone-500" />
                          <span>My Orders & Tracking</span>
                        </Link>

                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors border-t border-stone-100 mt-1"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-full transition-colors"
                    title="Sign In / Register"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span className="hidden sm:inline text-xs font-medium text-stone-700">Sign In</span>
                  </Link>
                )}
              </div>

              {/* WhatsApp Express Action */}
              <a
                href="https://wa.me/916376145171"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/70 rounded-full transition-colors whitespace-nowrap shadow-2xs"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-current" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
}
