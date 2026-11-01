"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Loader2,
  AlertTriangle,
  Menu,
  X,
  LogOut,
  PlusCircle,
  MessageCircle,
  Layers,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, isLoaded, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center text-amber-500">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-amber-500" />
          <p className="text-xs text-stone-400 font-mono">Loading Prime 3D Admin Console...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-bold text-white">Administrator Access Required</h2>
            <p className="text-xs text-stone-400 leading-relaxed">
              You must be logged in with an authorized Studio Admin account to view and manage this console.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/login?redirect=/admin"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-amber-600/20"
            >
              <span>Sign in as Admin</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navLinks = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      description: "Overview & studio metrics",
    },
    {
      label: "Orders Manager",
      href: "/admin/orders",
      icon: ShoppingBag,
      description: "Track fabrication & updates",
    },
    {
      label: "Products Catalog",
      href: "/admin/products",
      icon: Package,
      description: "Add & edit 3D creations",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-stone-900 flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-950/70 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ======================================================== */}
      {/* VERTICAL SIDEBAR (Desktop Fixed, Mobile Drawer) */}
      {/* ======================================================== */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 sm:w-72 bg-stone-950 text-stone-200 border-r border-stone-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top: Brand & Logo */}
        <div>
          <div className="p-6 border-b border-stone-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-lg shadow-amber-600/20">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-serif font-bold text-sm tracking-wide text-white">
                  Prime 3D Studio
                </h1>
                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Admin Console
                </span>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Section */}
          <div className="p-4 space-y-6">
            <div className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-stone-500">
                Studio Management
              </p>
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                        : "text-stone-400 hover:text-white hover:bg-stone-900"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-stone-400 group-hover:text-amber-400"}`} />
                    <div className="flex-1 truncate">
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Quick Links Section */}
            <div className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-stone-500">
                Quick Shortcuts
              </p>
              <Link
                href="/admin/products"
                className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-stone-400 hover:text-white hover:bg-stone-900 transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-amber-500" />
                <span>Add New Product</span>
              </Link>
              <a
                href="https://wa.me/916376145171"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-stone-400 hover:text-white hover:bg-stone-900 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-500" />
                <span>WhatsApp Support</span>
              </a>
              <Link
                href="/"
                target="_blank"
                className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-stone-400 hover:text-white hover:bg-stone-900 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ExternalLink className="w-4 h-4 text-stone-400" />
                  <span>View Live Store</span>
                </div>
                <span className="text-[10px] text-stone-600">↗</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom: Signed in User Profile Card & Logout */}
        <div className="p-4 border-t border-stone-800/80 bg-stone-950/80">
          <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name ? user.name[0].toUpperCase() : "A"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.name || "Studio Admin"}</p>
                <p className="text-[10px] text-stone-400 truncate">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* MAIN ADMIN WORKSPACE (Top Bar + Dynamic Content) */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        {/* Dedicated Admin Top Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/90 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Hamburger Trigger for Mobile */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Path */}
            <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
              <span className="hidden sm:inline">Admin</span>
              <span className="hidden sm:inline text-stone-300">/</span>
              <span className="text-stone-900 font-semibold capitalize">
                {pathname === "/admin"
                  ? "Dashboard"
                  : pathname.replace("/admin/", "").replace("-", " ")}
              </span>
            </div>
          </div>

          {/* Right Header Status Utilities */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Live API Health indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-[11px] font-semibold text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Backend Live (5001)</span>
            </div>

            {/* View Storefront Link */}
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition-colors"
            >
              <span>Storefront</span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
            </Link>
          </div>
        </header>

        {/* Dynamic Admin View Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
