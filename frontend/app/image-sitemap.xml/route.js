export const dynamic = "force-dynamic";

function escapeXml(unsafe) {
  if (!unsafe) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toAbsoluteUrl(url, baseUrl) {
  if (!url) return null;
  const trimmed = String(url).trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    // If it's a localhost link in production, rewrite to baseUrl
    if (trimmed.includes("localhost") || trimmed.includes("127.0.0.1")) {
      const pathOnly = trimmed.replace(/^https?:\/\/[^/]+/, "");
      return `${baseUrl}${pathOnly}`;
    }
    return trimmed;
  }
  return `${baseUrl}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
}

export async function GET() {
  const baseUrl = (
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.prime3dworld.in"
  ).replace(/\/$/, "");

  const apiUrl =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5001/api";

  let products = [];
  try {
    const res = await fetch(`${apiUrl}/products?limit=500`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.products)) {
        products = data.products;
      }
    }
  } catch (err) {
    console.warn("Could not fetch dynamic products for image-sitemap:", err.message);
  }

  // Fallback core showcase images if database is empty or unreachable
  const coreLandingEntries = [
    {
      loc: `${baseUrl}/`,
      images: [
        {
          loc: `${baseUrl}/images/products/fullbody-figurine-hero.jpeg`,
          title: "Custom 3D Miniature From Photo in India - Prime 3D World",
          caption: "Handcrafted personalized full-body 3D miniature couple and family statues with 100% likeness guarantee.",
        },
        {
          loc: `${baseUrl}/images/products/miniature-female.jpeg`,
          title: "Personalized 3D Miniature Statue - Handcrafted Detailing",
          caption: "High precision artisan finished 3D miniature figurine rendered with realistic facial detailing.",
        },
        {
          loc: `${baseUrl}/images/products/khatu-shyam-hero.jpeg`,
          title: "Khatu Shyam Ji 3D Sacred Idol - Devotional Home Temple Art",
          caption: "Sacred 3D printed temple idol featuring exquisite spiritual iconography and marble white finish.",
        },
        {
          loc: `${baseUrl}/images/logo/prime3dworld-logo.jpeg`,
          title: "Prime 3D World Official Studio Logo",
          caption: "India's premier custom 3D printing lab & personalized gifting studio.",
        },
      ],
    },
    {
      loc: `${baseUrl}/shop`,
      images: [
        {
          loc: `${baseUrl}/images/products/flower-bouquet-hero.jpeg`,
          title: "Artisanal 3D Home & Desk Decor Collection",
          caption: "Contemporary sculptural flower bouquets, desk accessories, and modern living decor in India.",
        },
        {
          loc: `${baseUrl}/images/products/name-model-hero.jpeg`,
          title: "Personalized 3D Custom Nameplate & Typography Sculpture",
          caption: "Custom architectural typography sculpture for desks, corporate workspaces, and celebratory gifting.",
        },
      ],
    },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  // 1. Core Landing Pages with Rich Brand Images
  for (const page of coreLandingEntries) {
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(page.loc)}</loc>\n`;
    for (const img of page.images) {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${escapeXml(img.loc)}</image:loc>\n`;
      xml += `      <image:title>${escapeXml(img.title)}</image:title>\n`;
      xml += `      <image:caption>${escapeXml(img.caption)}</image:caption>\n`;
      xml += `    </image:image>\n`;
    }
    xml += `  </url>\n`;
  }

  // 2. Dynamic Product Pages with Every Angle & Perspective
  for (const product of products) {
    const slug = product.slug || String(product.id || product._id);
    const productPageUrl = `${baseUrl}/products/${slug}`;

    const rawImages = [];
    if (product.image_url) rawImages.push(product.image_url);
    if (Array.isArray(product.images)) {
      rawImages.push(...product.images);
    }

    // Deduplicate images
    const uniqueImages = Array.from(new Set(rawImages.filter(Boolean)));
    if (uniqueImages.length === 0) {
      uniqueImages.push("/images/products/fullbody-figurine-hero.jpeg");
    }

    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(productPageUrl)}</loc>\n`;

    uniqueImages.forEach((imgUrl, idx) => {
      const absoluteUrl = toAbsoluteUrl(imgUrl, baseUrl);
      if (!absoluteUrl) return;

      const angleText = uniqueImages.length > 1 ? ` (Perspective View ${idx + 1})` : "";
      const imageTitle = `${product.name}${angleText} - Prime 3D World India`;
      const imageCaption = `${product.name} handcrafted custom 3D print in India. Category: ${product.category || "3D Printing"}. Price: ₹${product.price}. High likeness guarantee with fast pan-India delivery.`;

      xml += `    <image:image>\n`;
      xml += `      <image:loc>${escapeXml(absoluteUrl)}</image:loc>\n`;
      xml += `      <image:title>${escapeXml(imageTitle)}</image:title>\n`;
      xml += `      <image:caption>${escapeXml(imageCaption)}</image:caption>\n`;
      xml += `    </image:image>\n`;
    });

    xml += `  </url>\n`;
  }

  xml += `</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
    },
  });
}
