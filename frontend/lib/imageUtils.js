/**
 * Prime 3D World - Centralized Image URL & Error Handling Utilities
 */

export const DEFAULT_PLACEHOLDER_IMAGE = "/images/products/placeholder.jpeg";
export const BACKUP_HERO_IMAGE = "/images/products/fullbody-figurine-hero.jpeg";

/**
 * Resolves any image URL (local upload, absolute URL, relative asset)
 * to an accessible URL in the browser and SSR.
 */
export function resolveProductImage(src) {
  if (!src || typeof src !== "string") {
    return DEFAULT_PLACEHOLDER_IMAGE;
  }

  const trimmed = src.trim();
  if (!trimmed) {
    return DEFAULT_PLACEHOLDER_IMAGE;
  }

  // Already a full external URL or data URL
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }

  // Local backend uploads like /uploads/products/...
  if (trimmed.startsWith("/uploads/")) {
    const backendEnv = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (backendEnv && !backendEnv.includes("localhost:3000")) {
      return `${backendEnv.replace(/\/+$/, "")}${trimmed}`;
    }

    const apiEnv = process.env.NEXT_PUBLIC_API_URL;
    if (apiEnv) {
      const baseFromApi = apiEnv.replace(/\/api\/?$/, "");
      if (baseFromApi && !baseFromApi.includes("localhost:3000")) {
        return `${baseFromApi.replace(/\/+$/, "")}${trimmed}`;
      }
    }

    // In local development browser, point directly to Express backend
    if (typeof window !== "undefined") {
      const isLocal =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
      if (isLocal) {
        return `http://localhost:5001${trimmed}`;
      }
    }

    return trimmed;
  }

  // Normal frontend static asset (e.g. /images/products/...)
  return trimmed;
}

/**
 * Universal error handler for <img> elements to prevent broken image icons.
 */
export function handleImageError(e, fallbackSrc = DEFAULT_PLACEHOLDER_IMAGE) {
  if (!e || !e.target) return;
  const target = e.target;
  if (!target.dataset.fallbackApplied) {
    target.dataset.fallbackApplied = "true";
    target.src = fallbackSrc;
  }
}
