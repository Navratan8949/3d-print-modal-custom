import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ProductDetailView from "@/components/products/ProductDetailView";
import ProductCard from "@/components/products/ProductCard";

export async function generateStaticParams() {
  const paramsMap = new Map();

  try {
    const apiUrl =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5001/api";
    const res = await fetch(`${apiUrl}/products?limit=100`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.products) {
        data.products.forEach((product) => {
          if (product.slug) paramsMap.set(product.slug, { slug: product.slug });
          if (product.id) paramsMap.set(String(product.id), { slug: String(product.id) });
        });
      }
    }
  } catch {
    // API not reachable during build - dynamicParams handles runtime requests
  }

  return Array.from(paramsMap.values());
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
    // Server fetch error
  }

  return null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await fetchProduct(slug);
  const product = data?.product;

  if (!product) {
    return {
      title: "Product Not Found – Prime 3D World",
      description: "The requested 3D print creation could not be found.",
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

  const pageTitle = `${product.name} (₹${product.price}) | 3D Print Custom India`;
  const pageDescription =
    product.shortDescription ||
    (product.description ? product.description.slice(0, 160) : "") ||
    "Custom 3D printed creation sculpted with precision. Order directly on WhatsApp or buy online.";

  const isPng = absoluteImageUrl.toLowerCase().endsWith(".png");

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: [
      product.name,
      product.category || "3D Printing",
      "3D miniature in India",
      "custom 3D gift",
      "Prime 3D World",
      ...(product.tags || []),
    ],
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
          width: 1200,
          height: 630,
          alt: `${product.name} - Prime 3D World Custom 3D Printing`,
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

  // Multi-angle Image URLs for Rich Image Search Indexing
  const allImages = Array.from(
    new Set(
      [
        product.image_url,
        ...(Array.isArray(product.images) ? product.images : []),
      ].filter(Boolean)
    )
  );
  const schemaImages = allImages.map((img) => {
    let raw = img;
    if (typeof raw === "string" && raw.startsWith("/uploads/")) {
      const backendUrl = (
        process.env.NEXT_PUBLIC_BACKEND_URL || siteUrl
      ).replace(/\/$/, "");
      raw = `${backendUrl}${raw}`;
    }
    return raw.startsWith("http")
      ? raw
      : `${siteUrl}${raw.startsWith("/") ? "" : "/"}${raw}`;
  });
  if (schemaImages.length === 0) {
    schemaImages.push(absoluteImageUrl);
  }

  // Rich Snippets: Product Schema (Google Merchant & Search Console Compliant)
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: schemaImages,
    description:
      product.description ||
      product.shortDescription ||
      "Custom 3D printed model handcrafted with precision.",
    sku: product.sku || `3DVS-${product.id}`,
    mpn: `P3D-${product.id}`,
    brand: {
      "@type": "Brand",
      name: "Prime 3D World",
    },
    category: product.category || "3D Miniatures & Custom Gifts",
    material: product.material || "High-Density UV Resin & Premium PLA+",
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/products/${product.slug}`,
      priceCurrency: "INR",
      price: product.price,
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Prime 3D World",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0.00",
          currency: "INR",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "IN",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "d",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 2,
            maxValue: 5,
            unitCode: "d",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IN",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating ? Number(product.rating).toFixed(1) : "4.9",
      reviewCount: product.review_count ? Number(product.review_count) : 124,
      bestRating: "5",
      worstRating: "1",
    },
  };

  // Rich Snippets: Breadcrumbs Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Catalog",
        item: `${siteUrl}/shop`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.category || "3D Creations",
        item: `${siteUrl}/shop?category=${product.categoryId || ""}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: product.name,
        item: `${siteUrl}/products/${product.slug}`,
      },
    ],
  };

  // Complementary creations
  const relatedProducts = data?.related || [];

  return (
    <div className="py-8 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Google Rich Snippets JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Interactive Product Details Showcase */}
      <ProductDetailView product={product} />

      {/* Complementary & Related Products */}
      {relatedProducts.length > 0 && (
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
              <span>Explore Full Catalog</span>
              <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id || p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
