export default async function sitemap() {
  const baseUrl =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.prime3dworld.in";

  const staticRoutes = [
    "",
    "/shop",
    "/cart",
    "/contact",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));

  let productRoutes = [];
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
        productRoutes = data.products.map((p) => ({
          url: `${baseUrl}/products/${p.slug || p.id}`,
          lastModified: new Date(p.updatedAt || Date.now()),
          changeFrequency: "weekly",
          priority: 0.9,
        }));
      }
    }
  } catch {
    // fallback
  }

  return [...staticRoutes, ...productRoutes];
}
