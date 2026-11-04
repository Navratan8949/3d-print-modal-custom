import Hero from "@/components/home/Hero";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import HowItWorks from "@/components/home/HowItWorks";
import FinalCTA from "@/components/home/FinalCTA";

export const metadata = {
  title: "Prime3Dworld – Simple & Premium 3D Printing E-Commerce",
  description:
    "Explore 3D printed figurines, personalized name models, sacred idols, and modern home decor. High quality custom 3D printing with pan-India delivery.",
};

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section with Interactive Card Stack Animation */}
      <Hero />

      {/* Explore Catalog Categories */}
      <FeaturedCategories />

      {/* Trending & Best-Selling 3D Products */}
      <FeaturedProducts />

      {/* How It Works - 4 Step Ordering Flow */}
      <HowItWorks />

      {/* Direct WhatsApp / Custom Order CTA */}
      <FinalCTA />
    </div>
  );
}
