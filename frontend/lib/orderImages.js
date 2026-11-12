import { PRODUCTS } from "@/data/products";
import { resolveProductImage, DEFAULT_PLACEHOLDER_IMAGE } from "./imageUtils";

/**
 * Robust helper to resolve product photo for any order item,
 * preventing any fallback to text badges like "3D".
 */
export function getOrderItemImage(item) {
  if (item?.image && typeof item.image === "string" && item.image.trim().length > 0) {
    return resolveProductImage(item.image);
  }
  if (item?.image_url && typeof item.image_url === "string" && item.image_url.trim().length > 0) {
    return resolveProductImage(item.image_url);
  }
  if (item?.referencePhotoUrl && typeof item.referencePhotoUrl === "string" && item.referencePhotoUrl.trim().length > 0) {
    return resolveProductImage(item.referencePhotoUrl);
  }

  // Lookup in master catalog by slug, id, sku, or name
  const found = PRODUCTS.find((p) => {
    if (item?.slug && p.slug === item.slug) return true;
    if (item?.productId && String(p.id) === String(item.productId)) return true;
    if (item?.id && String(p.id) === String(item.id)) return true;
    if (item?.sku && p.sku === item.sku) return true;
    if (item?.name && p.name.toLowerCase() === item.name.toLowerCase()) return true;
    if (item?.name && p.name.toLowerCase().includes(item.name.toLowerCase())) return true;
    if (item?.name && item.name.toLowerCase().includes(p.name.toLowerCase())) return true;
    return false;
  });

  if (found) {
    return resolveProductImage(
      found.image_url || (found.images && found.images[0]) || DEFAULT_PLACEHOLDER_IMAGE
    );
  }

  return DEFAULT_PLACEHOLDER_IMAGE;
}

