import { PRODUCTS } from "@/data/products";
import { CATEGORIES } from "@/data/categories";

export default async function sitemap() {
  const baseUrl = (
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.prime3dworld.in"
  ).replace(/\/$/, "");

  const currentDate = new Date();

  // Core Static Landing Pages
  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  // High-Intent Category Landing Pages
  const categoryRoutes = CATEGORIES.map((cat) => ({
    url: `${baseUrl}/shop?category=${cat.slug || cat.id}`,
    lastModified: currentDate,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  // Dynamic Product Pages with Fallback to Master Catalog
  const productMap = new Map();

  // Initialize with master catalog products
  PRODUCTS.forEach((p) => {
    productMap.set(p.slug || String(p.id), {
      url: `${baseUrl}/products/${p.slug || p.id}`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    });
  });

  // Supplement / update with API products if available
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
        data.products.forEach((p) => {
          productMap.set(p.slug || String(p.id), {
            url: `${baseUrl}/products/${p.slug || p.id}`,
            lastModified: new Date(p.updatedAt || currentDate),
            changeFrequency: "weekly",
            priority: 0.9,
          });
        });
      }
    }
  } catch {
    // master catalog products already populated
  }

  const productRoutes = Array.from(productMap.values());

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
