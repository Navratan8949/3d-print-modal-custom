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

  const apiUrl =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5001/api";

  // Dynamic Category Landing Pages from Server
  const categoryRoutes = [];
  try {
    const res = await fetch(`${apiUrl}/categories`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data && data.categories) {
        data.categories.forEach((cat) => {
          categoryRoutes.push({
            url: `${baseUrl}/shop?category=${cat.slug || cat.id}`,
            lastModified: currentDate,
            changeFrequency: "weekly",
            priority: 0.85,
          });
        });
      }
    }
  } catch {
    // API not reachable during sitemap build
  }

  // Dynamic Product Pages from Server
  const productRoutes = [];
  try {
    const res = await fetch(`${apiUrl}/products?limit=200`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data && data.products) {
        data.products.forEach((p) => {
          productRoutes.push({
            url: `${baseUrl}/products/${p.slug || p.id}`,
            lastModified: new Date(p.updatedAt || currentDate),
            changeFrequency: "weekly",
            priority: 0.9,
          });
        });
      }
    }
  } catch {
    // API not reachable during sitemap build
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
