"use client";

import { usePathname } from "next/navigation";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import FloatingWhatsApp from "@/components/layout/FloatingWhatsApp";

export default function StorefrontShell({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  // For Admin portal, do NOT render any storefront header, announcement, footer or floating buttons!
  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen w-full max-w-full overflow-x-hidden">
      <AnnouncementBar />
      <Header />
      <main className="flex-1 w-full max-w-full min-w-0">{children}</main>
      <Footer />
      <CartDrawer />
      <FloatingWhatsApp />
    </div>
  );
}

