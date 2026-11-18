export default function robots() {
  const baseUrl = (
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.prime3dworld.in"
  ).replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/shop", "/products/", "/cart", "/contact"],
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/my-orders/",
          "/reset-password",
          "/forgot-password",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/shop", "/products/", "/cart", "/contact"],
        disallow: ["/admin", "/admin/", "/api/"],
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/", "/images/", "/uploads/", "/products/"],
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/image-sitemap.xml`,
    ],
  };
}
