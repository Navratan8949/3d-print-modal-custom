import "./globals.css";
import ReduxProvider from "@/store/ReduxProvider";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import StorefrontShell from "@/components/layout/StorefrontShell";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.prime3dworld.in").replace(/\/$/, "");

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Prime 3D World – Custom 3D Miniatures, Sacred Idols & Name Models in India",
    template: "%s | Prime 3D World",
  },
  description:
    "India's premier custom 3D printing studio. Handcrafted 3D miniatures from photos, wedding couple figurines, sacred temple idols & personalized 3D gifts with 100% likeness guarantee and fast pan-India delivery.",
  keywords: [
    "3D miniature in India",
    "custom 3d couple figurine",
    "personalized 3d gifts online India",
    "photo to 3d miniature statue",
    "custom 3d printed idol",
    "custom name model 3d print",
    "3d miniature wedding couple statue",
    "3d printing service Delhi Mumbai Bangalore",
    "Prime 3D World",
  ],
  authors: [{ name: "Prime 3D World", url: siteUrl }],
  creator: "Prime 3D World",
  publisher: "Prime 3D World",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/images/logo/prime3dworld-logo.jpeg",
    apple: "/images/logo/prime3dworld-logo.jpeg",
  },
  openGraph: {
    title: "Prime 3D World – Custom 3D Miniatures, Sacred Idols & Gifts in India",
    description:
      "Handcrafted photo-to-3D miniatures with 100% likeness guarantee, sacred temple idols, and personalized 3D nameplates. Free 3D digital preview and pan-India safe delivery.",
    url: siteUrl,
    siteName: "Prime 3D World",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${siteUrl}/images/products/fullbody-figurine-hero.jpeg`,
        width: 1200,
        height: 630,
        alt: "Prime 3D World - Handcrafted 3D Miniatures & Personalized Gifts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prime 3D World – Custom 3D Miniatures & Personalized Gifts in India",
    description:
      "Handcrafted photo-to-3D miniatures, wedding couple figurines, sacred idols & personalized 3D gifts. 100% likeness guarantee with pan-India delivery.",
    images: [`${siteUrl}/images/products/fullbody-figurine-hero.jpeg`],
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "LocalBusiness"],
      "@id": `${siteUrl}/#organization`,
      name: "Prime 3D World",
      alternateName: ["Prime 3D Printing Lab", "Prime3DWorld"],
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        "@id": `${siteUrl}/#logo`,
        url: `${siteUrl}/images/logo/prime3dworld-logo.jpeg`,
        contentUrl: `${siteUrl}/images/logo/prime3dworld-logo.jpeg`,
        caption: "Prime 3D World Official Logo",
        width: "800",
        height: "800",
      },
      image: `${siteUrl}/images/products/fullbody-figurine-hero.jpeg`,
      description:
        "India's leading custom 3D printing lab specializing in handcrafted 3D miniatures from photos, sacred temple idols, and personalized name models.",
      telephone: "+916376145171",
      email: "prime3dprintinglab@gmail.com",
      priceRange: "₹499 - ₹4999",
      currenciesAccepted: "INR",
      paymentAccepted: "UPI, Credit Card, Debit Card, Net Banking, Cash on Delivery",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Jaipur",
        addressRegion: "Rajasthan",
        postalCode: "302029",
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: "26.9124",
        longitude: "75.7873",
      },
      areaServed: {
        "@type": "Country",
        name: "India",
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+916376145171",
        contactType: "customer service",
        availableLanguage: ["English", "Hindi"],
        contactOption: "WhatsAppSupport",
      },
      sameAs: [
        "https://www.instagram.com/prime3dworld",
        "https://wa.me/916376145171",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Prime 3D World",
      description: "Custom 3D Printing & Handcrafted Miniatures E-Commerce",
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/shop?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "ItemList",
      "@id": `${siteUrl}/#sitenavigation`,
      name: "Main Navigation",
      description: "Core e-commerce navigation destinations for Google Sitelinks",
      itemListElement: [
        {
          "@type": "SiteNavigationElement",
          position: 1,
          name: "Custom 3D Miniatures",
          description: "Handcrafted 3D sculpted miniature statues made directly from photographs in India.",
          url: `${siteUrl}/shop?category=3d-miniatures`,
        },
        {
          "@type": "SiteNavigationElement",
          position: 2,
          name: "Couple Figurines",
          description: "Bespoke 3D miniature couple statues for weddings, anniversaries, and romantic gifting.",
          url: `${siteUrl}/shop?category=couple-figurines`,
        },
        {
          "@type": "SiteNavigationElement",
          position: 3,
          name: "Sacred Idols",
          description: "Sacred temple devotional idols featuring spiritual precision and pristine finishes.",
          url: `${siteUrl}/shop?category=god-idols`,
        },
        {
          "@type": "SiteNavigationElement",
          position: 4,
          name: "Custom Nameplates",
          description: "Bespoke 3D printed typography, initials, and illuminated name art for modern desks.",
          url: `${siteUrl}/shop?category=name-models`,
        },
        {
          "@type": "SiteNavigationElement",
          position: 5,
          name: "Contact & WhatsApp Support",
          description: "Instant assistance, custom quotes, and order consultation with master 3D artisans.",
          url: `${siteUrl}/contact`,
        },
      ],
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="bg-[#FAF8F5] text-stone-900 antialiased selection:bg-amber-200 selection:text-amber-900 min-h-screen flex flex-col justify-between w-full max-w-full overflow-x-clip">
        <ReduxProvider>
          <AuthProvider>
            <CartProvider>
              <StorefrontShell>{children}</StorefrontShell>
            </CartProvider>
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
