export default function robots() {
  const baseUrl = process.env.APP_URL || "https://prime3dworld.com";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
