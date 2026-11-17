import Hero from "@/components/home/Hero";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import PromoMiniatureBanner from "@/components/common/PromoMiniatureBanner";
import HowItWorks from "@/components/home/HowItWorks";
import FAQSection from "@/components/home/FAQSection";
import FinalCTA from "@/components/home/FinalCTA";

export const metadata = {
  title: "Prime 3D World – Custom 3D Miniatures, Sacred Idols & Name Models in India",
  description:
    "Order custom 3D miniatures from photo in India with 100% likeness guarantee. Handcrafted couple wedding figurines, sacred temple idols, personalized 3D nameplates & bespoke 3D gifts with free 3D digital preview and pan-India safe delivery.",
  keywords: [
    "3D miniature in India",
    "custom 3d couple figurine",
    "photo to 3d miniature statue",
    "personalized 3d gifts online India",
    "custom 3d printed idol",
    "custom name model 3d print",
    "3d miniature wedding couple statue",
    "3d printing service Delhi Mumbai Bangalore",
    "Prime 3D World",
  ],
  alternates: {
    canonical: "https://www.prime3dworld.in",
  },
  openGraph: {
    title: "Prime 3D World – Handcrafted Custom 3D Miniatures & Gifts from Photo",
    description:
      "Turn your photos into lifelike 3D sculpted miniatures, couple figurines, sacred idols, and personalized nameplates. 100% likeness guarantee with pan-India delivery.",
    url: "https://www.prime3dworld.in",
    siteName: "Prime 3D World",
    images: [
      {
        url: "https://www.prime3dworld.in/images/products/fullbody-figurine-hero.jpeg",
        width: 1200,
        height: 630,
        alt: "Custom 3D Miniature Handcrafted From Photo - Prime3D World",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prime 3D World – Custom 3D Miniatures & Personalized Gifts in India",
    description:
      "Turn your photos into realistic 3D miniatures and sacred idols. Free 3D digital preview before manufacturing & insured doorstep delivery.",
    images: ["https://www.prime3dworld.in/images/products/fullbody-figurine-hero.jpeg"],
  },
};

export default function HomePage() {
  return (
    <div className="flex flex-col space-y-12 sm:space-y-16">
      {/* Hero Section with Interactive Card Stack Animation */}
      <Hero />

      {/* Explore Catalog Categories */}
      <FeaturedCategories />

      {/* Featured Promotional Custom 3D Miniature Spotlight Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <PromoMiniatureBanner />
      </div>

      {/* Trending & Best-Selling 3D Products */}
      <FeaturedProducts />

      {/* How It Works - 4 Step Ordering Flow */}
      <HowItWorks />

      {/* Frequently Asked Questions with JSON-LD FAQ Schema */}
      <FAQSection />

      {/* Direct WhatsApp / Custom Order CTA */}
      <FinalCTA />
    </div>
  );
}
