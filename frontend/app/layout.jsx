import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import StorefrontShell from "@/components/layout/StorefrontShell";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://prime3dworld.com"),
  title: "Prime3Dworld – Premium 3D Printing E-Commerce",
  description:
    "Discover bespoke 3D printed figurines, personalized name models, sacred devotional idols, and creative home decor crafted just for you.",
  icons: {
    icon: "/images/logo/prime3dworld-logo.jpeg",
    apple: "/images/logo/prime3dworld-logo.jpeg",
  },
  openGraph: {
    title: "Prime3Dworld – Premium 3D Printing E-Commerce",
    description:
      "Discover bespoke 3D printed figurines, personalized name models, sacred devotional idols, and creative home decor crafted just for you.",
    images: ["/images/logo/prime3dworld-logo.jpeg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prime3Dworld – Premium 3D Printing E-Commerce",
    description:
      "Discover bespoke 3D printed figurines, personalized name models, sacred devotional idols, and creative home decor crafted just for you.",
    images: ["/images/logo/prime3dworld-logo.jpeg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#FAF8F5] text-stone-900 antialiased selection:bg-amber-200 selection:text-amber-900 min-h-screen flex flex-col justify-between w-full max-w-full overflow-x-hidden">
        <AuthProvider>
          <CartProvider>
            <StorefrontShell>{children}</StorefrontShell>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
