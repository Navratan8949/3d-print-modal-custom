import Image from "next/image";

const IMAGE_MAP = {
  "figurine-couple": "/images/products/miniature-female.jpeg",
  "miniature-female": "/images/products/miniature-female.jpeg",
  "miniature-male": "/images/products/miniature-male.jpeg",
  "figurine-solo": "/images/products/miniature-male.jpeg",
  "figurine-fullbody": "/images/products/fullbody-figurine-hero.jpeg",
  "khatu-shyam": "/images/products/khatu-shyam-detail.jpeg",
  "faith-idol": "/images/products/khatu-shyam-faith.jpeg",
  "kanhaiya-ji": "/images/products/kanha-ji-idol.jpeg",
  "flower-bouquet": "/images/products/flower-bouquet.jpeg",
  "cat-planter": "/images/products/cat-pen-stand.jpeg",
  "pen-stand": "/images/products/muscular-pen-stand.jpeg",
};

export default function ProductVisual({
  src = null,
  imageKey = "figurine-couple",
  alt = "Prime3Dworld 3D Printed Creation",
  className = "",
  aspectRatio = "4/3",
  priority = false,
}) {
  let imageSrc = src || IMAGE_MAP[imageKey] || "/images/products/fullbody-figurine-hero.jpeg";
  if (imageSrc && imageSrc.startsWith("/uploads/")) {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
    imageSrc = `${backendUrl}${imageSrc}`;
  }

  const isLocalBackend = imageSrc.startsWith("http://localhost") || imageSrc.startsWith("http://127.0.0.1");

  return (
    <div
      className={`relative w-full overflow-hidden bg-stone-100 flex items-center justify-center group ${className}`}
      style={{ aspectRatio }}
      role="img"
      aria-label={alt}
    >
      <div className="relative w-full h-full">
        <Image
          src={imageSrc}
          alt={alt}
          fill
          unoptimized={isLocalBackend}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
          priority={priority}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/15 via-transparent to-transparent pointer-events-none opacity-40 group-hover:opacity-20 transition-opacity" />
      </div>
    </div>
  );
}
