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
  PanelLeftClose,
  PanelLeftOpen,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, isLoaded, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load saved preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin_sidebar_collapsed");
      if (saved === "true") {
        setIsCollapsed(true);
      }
    } catch (e) {
      // fallback
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("admin_sidebar_collapsed", String(next));
      } catch (e) {}
      return next;
    });
  };

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleCollapse();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center text-amber-500">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-amber-500" />
          <p className="text-xs text-stone-400 font-mono">
            Loading Prime 3D Admin Console...
          </p>
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
            <h2 className="text-2xl font-serif font-bold text-white">
              Administrator Access Required
            </h2>
            <p className="text-xs text-stone-400 leading-relaxed">
              You must be logged in with an authorized Studio Admin account to
              view and manage this console.
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
      {/* VERTICAL SIDEBAR (Desktop Fixed/Collapsible, Mobile Drawer) */}
      {/* ======================================================== */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-stone-950 text-stone-200 border-r border-stone-800/80 flex flex-col justify-between transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } ${isCollapsed ? "w-64 sm:w-72 lg:w-20" : "w-64 sm:w-72 lg:w-72"}`}
      >
        {/* Top: Brand & Logo */}
        <div>
          <div
            className={`p-4 sm:p-5 border-b border-stone-800/80 flex items-center transition-all ${
              isCollapsed ? "lg:justify-center" : "justify-between"
            }`}
          >
            {/* Full Logo when expanded or on mobile */}
            <div
              className={`flex items-center gap-3 min-w-0 ${
                isCollapsed ? "lg:hidden" : ""
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-lg shadow-amber-600/20 shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="font-serif font-bold text-sm tracking-wide text-white truncate">
                  Prime 3D Studio
                </h1>
                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Admin Console
                </span>
              </div>
            </div>

            {/* Collapsed Icon Only on Desktop */}
            {isCollapsed && (
              <button
                onClick={toggleCollapse}
                title="Expand Sidebar (Ctrl+B)"
                className="hidden lg:flex w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 items-center justify-center text-white shadow-lg shadow-amber-600/20 hover:scale-105 active:scale-95 transition-all group relative"
              >
                <Layers className="w-5 h-5" />
                <span className="sr-only">Expand Sidebar</span>
              </button>
            )}

            <div className="flex items-center gap-1">
              {/* Desktop Collapse Button when expanded */}
              {!isCollapsed && (
                <button
                  onClick={toggleCollapse}
                  className="hidden lg:flex p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-900 transition-colors"
                  title="Collapse Sidebar (Ctrl+B)"
                  aria-label="Collapse Sidebar"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              )}

              {/* Mobile Close Drawer Button */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 lg:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Section */}
          <div className={`p-3 sm:p-4 space-y-6 ${isCollapsed ? "lg:px-2.5" : ""}`}>
            <div className="space-y-1">
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-stone-500 hidden lg:block">
                  Studio Management
                </p>
              )}
              <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-stone-500 lg:hidden">
                Studio Management
              </p>

              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    className={`flex items-center rounded-xl text-xs font-semibold transition-all group relative ${
                      isCollapsed
                        ? "lg:justify-center lg:p-2.5 px-3.5 py-2.5 gap-3"
                        : "px-3.5 py-2.5 gap-3"
                    } ${
                      isActive
                        ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                        : "text-stone-400 hover:text-white hover:bg-stone-900"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive
                          ? "text-white"
                          : "text-stone-400 group-hover:text-amber-400"
                      }`}
                    />
                    <div
                      className={`flex-1 truncate ${
                        isCollapsed ? "lg:hidden" : ""
                      }`}
                    >
                      <span>{item.label}</span>
                    </div>

                    {/* Floating Tooltip when Collapsed on Desktop */}
                    {isCollapsed && (
                      <div className="hidden lg:group-hover:flex absolute left-full ml-3 px-3 py-1.5 bg-stone-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 border border-stone-800 pointer-events-none items-center gap-2 animate-in fade-in zoom-in-95 duration-150">
                        <span>{item.label}</span>
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Quick Links Section */}
            <div className="space-y-1">
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-stone-500 hidden lg:block">
                  Quick Shortcuts
                </p>
              )}
              <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-stone-500 lg:hidden">
                Quick Shortcuts
              </p>

              <Link
                href="/admin/products"
                title={isCollapsed ? "Add New Product" : undefined}
                className={`flex items-center rounded-xl text-xs font-medium text-stone-400 hover:text-white hover:bg-stone-900 transition-colors group relative ${
                  isCollapsed
                    ? "lg:justify-center lg:p-2.5 px-3.5 py-2 gap-3"
                    : "px-3.5 py-2 gap-3"
                }`}
              >
                <PlusCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span className={`truncate ${isCollapsed ? "lg:hidden" : ""}`}>
                  Add New Product
                </span>
                {isCollapsed && (
                  <div className="hidden lg:group-hover:block absolute left-full ml-3 px-3 py-1.5 bg-stone-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 border border-stone-800 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                    Add New Product
                  </div>
                )}
              </Link>

              <a
                href="https://wa.me/916376145171"
                target="_blank"
                rel="noopener noreferrer"
                title={isCollapsed ? "WhatsApp Support" : undefined}
                className={`flex items-center rounded-xl text-xs font-medium text-stone-400 hover:text-white hover:bg-stone-900 transition-colors group relative ${
                  isCollapsed
                    ? "lg:justify-center lg:p-2.5 px-3.5 py-2 gap-3"
                    : "px-3.5 py-2 gap-3"
                }`}
              >
                <MessageCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className={`truncate ${isCollapsed ? "lg:hidden" : ""}`}>
                  WhatsApp Support
                </span>
                {isCollapsed && (
                  <div className="hidden lg:group-hover:block absolute left-full ml-3 px-3 py-1.5 bg-stone-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 border border-stone-800 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                    WhatsApp Support
                  </div>
                )}
              </a>

              <Link
                href="/"
                target="_blank"
                title={isCollapsed ? "View Live Store" : undefined}
                className={`flex items-center rounded-xl text-xs font-medium text-stone-400 hover:text-white hover:bg-stone-900 transition-colors group relative ${
                  isCollapsed
                    ? "lg:justify-center lg:p-2.5 px-3.5 py-2 gap-3"
                    : "justify-between px-3.5 py-2 gap-3"
                }`}
              >
                <div className="flex items-center gap-3">
                  <ExternalLink className="w-4 h-4 text-stone-400 shrink-0" />
                  <span
                    className={`truncate ${isCollapsed ? "lg:hidden" : ""}`}
                  >
                    View Live Store
                  </span>
                </div>
                <span
                  className={`text-[10px] text-stone-600 ${
                    isCollapsed ? "lg:hidden" : ""
                  }`}
                >
                  ↗
                </span>
                {isCollapsed && (
                  <div className="hidden lg:group-hover:block absolute left-full ml-3 px-3 py-1.5 bg-stone-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 border border-stone-800 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                    View Live Store ↗
                  </div>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom: Signed in User Profile Card & Logout */}
        <div className="p-3 sm:p-4 border-t border-stone-800/80 bg-stone-950/80">
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              {/* Centered Avatar on desktop */}
              <div
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md cursor-pointer hover:ring-2 hover:ring-amber-500/50 transition-all"
                title={`${user?.name || "Studio Admin"} (${user?.email})`}
              >
                {user?.name ? user.name[0].toUpperCase() : "A"}
              </div>

              {/* Logout button */}
              <button
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="p-2 rounded-xl text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>

              {/* Expand trigger button at bottom */}
              <button
                onClick={toggleCollapse}
                className="hidden lg:flex items-center justify-center w-full py-1 text-stone-500 hover:text-amber-400 hover:bg-stone-900 rounded-lg transition-colors text-[10px] mt-1"
                title="Expand Sidebar (Ctrl+B)"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {user?.name ? user.name[0].toUpperCase() : "A"}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">
                    {user?.name || "Studio Admin"}
                  </p>
                  <p className="text-[10px] text-stone-400 truncate">
                    {user?.email}
                  </p>
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
          )}
        </div>
      </aside>

      {/* ======================================================== */}
      {/* MAIN ADMIN WORKSPACE (Top Bar + Dynamic Content) */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-hidden overflow-y-auto max-h-screen">
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

            {/* Desktop Collapse / Expand Toggle Button */}
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex items-center justify-center p-2 rounded-xl text-stone-600 hover:text-stone-950 hover:bg-stone-100 transition-colors"
              title={
                isCollapsed
                  ? "Expand Sidebar (Ctrl+B)"
                  : "Collapse Sidebar (Ctrl+B)"
              }
              aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-5 h-5 text-amber-600" />
              ) : (
                <PanelLeftClose className="w-5 h-5 text-stone-600 hover:text-stone-900" />
              )}
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
              {/* <span>Storefront</span> */}
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
