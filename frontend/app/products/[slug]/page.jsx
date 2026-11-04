import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PRODUCTS, getProductBySlugOrId } from "@/data/products";
import ProductDetailView from "@/components/products/ProductDetailView";
import ProductCard from "@/components/products/ProductCard";

export function generateStaticParams() {
  const params = [];
  PRODUCTS.forEach((product) => {
    params.push({ slug: product.slug });
    params.push({ slug: String(product.id) });
  });
  return params;
}

export const dynamicParams = true;

async function fetchProduct(slug) {
  try {
    const apiUrl =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5001/api";
    const res = await fetch(`${apiUrl}/products/${slug}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.product) return data;
    }
  } catch {
    // fallback
  }
  const fallback = getProductBySlugOrId(slug);
  return fallback ? { product: fallback, related: [] } : null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await fetchProduct(slug);
  const product = data?.product;

  if (!product) {
    return {
      title: "Product Not Found – Prime3Dworld",
    };
  }

  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.prime3dworld.in"
  ).replace(/\/$/, "");

  let rawImage =
    product.image_url ||
    (product.images && product.images[0]) ||
    "/images/products/fullbody-figurine-hero.jpeg";

  if (typeof rawImage === "string" && rawImage.startsWith("/uploads/")) {
    const backendUrl = (
      process.env.NEXT_PUBLIC_BACKEND_URL || siteUrl
    ).replace(/\/$/, "");
    rawImage = `${backendUrl}${rawImage}`;
  }

  const absoluteImageUrl = rawImage.startsWith("http")
    ? rawImage
    : `${siteUrl}${rawImage.startsWith("/") ? "" : "/"}${rawImage}`;

  const pageTitle = `${product.name} (₹${product.price}) – Prime 3D World`;
  const pageDescription =
    product.shortDescription ||
    (product.description ? product.description.slice(0, 160) : "") ||
    "Custom 3D printed creation sculpted with precision. Order directly on WhatsApp.";

  const isPng = absoluteImageUrl.toLowerCase().endsWith(".png");

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: `${siteUrl}/products/${product.slug}`,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: `${siteUrl}/products/${product.slug}`,
      siteName: "Prime 3D World",
      images: [
        {
          url: absoluteImageUrl,
          secureUrl: absoluteImageUrl,
          width: 1024,
          height: 1536,
          alt: product.name,
          type: isPng ? "image/png" : "image/jpeg",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [absoluteImageUrl],
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const data = await fetchProduct(slug);
  const product = data?.product;

  if (!product) {
    notFound();
  }

  // Complementary creations
  const relatedProducts =
    data?.related && data.related.length > 0
      ? data.related
      : PRODUCTS.filter((p) => String(p.id) !== String(product.id)).slice(0, 4);

  return (
    <div className="py-8 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Interactive Product Details Showcase */}
      <ProductDetailView product={product} />

      {/* Complementary & Related Products */}
      <div className="border-t border-stone-200/80 pt-12 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
              More Creations
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mt-1">
              You May Also Like
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs sm:text-sm font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            <span>View All ({PRODUCTS.length} items)</span>
            <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts.map((p) => (
            <ProductCard key={p.id || p._id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
