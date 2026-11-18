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

  return DEFAULT_PLACEHOLDER_IMAGE;
}

/**
 * Extracts and resolves all customer reference photos (up to 5)
 * from an order and/or specific item.
 */
export function getOrderReferencePhotos(order, item = null) {
  const photoSet = new Set();

  const addPhoto = (raw) => {
    if (!raw) return;
    if (Array.isArray(raw)) {
      raw.forEach(addPhoto);
      return;
    }
    if (typeof raw === "string") {
      // Could be comma-separated list of URLs
      const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
      parts.forEach((p) => {
        if (p.startsWith("/uploads/") || p.startsWith("http://") || p.startsWith("https://") || p.startsWith("data:")) {
          photoSet.add(resolveProductImage(p));
        }
      });
    }
  };

  // 1. Check target item if provided
  if (item) {
    addPhoto(item.referencePhotos);
    addPhoto(item.referencePhotoUrl);
    if (item.customization) {
      addPhoto(item.customization.referencePhotos);
      addPhoto(item.customization.referencePhotoUrl);
    }
  }

  // 2. Check root order referencePhotos
  if (order) {
    addPhoto(order.referencePhotos);

    // 3. Scan all items in the order
    if (Array.isArray(order.items)) {
      order.items.forEach((it) => {
        addPhoto(it.referencePhotos);
        addPhoto(it.referencePhotoUrl);
        if (it.customization) {
          addPhoto(it.customization.referencePhotos);
          addPhoto(it.customization.referencePhotoUrl);
        }
      });
    }
  }

  return Array.from(photoSet).slice(0, 5);
}

/**
 * Filter out internal reference photo paths from customer customization specs
 * so they don't display as raw technical text strings.
 */
export function filterCustomizationSpecs(customization) {
  if (!customization || typeof customization !== "object") return [];

  const internalKeys = [
    "referencephotos",
    "referencephotourl",
    "referencephotonames",
    "reference photos",
    "reference photo",
    "custom photo uploaded",
  ];

  return Object.entries(customization).filter(([key, val]) => {
    if (!val) return false;
    const lower = key.trim().toLowerCase();
    if (internalKeys.includes(lower)) return false;
    if (typeof val === "string" && val.includes("/uploads/orders/")) return false;
    return true;
  });
}

/**
 * Checks whether customer is allowed to update/upload reference photos:
 * Allowed as long as order is NOT in_production, shipped, delivered, or cancelled.
 */
export function isPhotoEditingAllowed(order) {
  if (!order || !order.status) return false;
  const lockedStatuses = ["in_production", "shipped", "delivered", "cancelled"];
  return !lockedStatuses.includes(order.status);
}
