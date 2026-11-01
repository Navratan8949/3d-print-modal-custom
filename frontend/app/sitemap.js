import { PRODUCTS } from "@/data/products";

export default function sitemap() {
  const baseUrl = process.env.APP_URL || "https://prime3dworld.com";

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

  const productRoutes = PRODUCTS.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [...staticRoutes, ...productRoutes];
}
