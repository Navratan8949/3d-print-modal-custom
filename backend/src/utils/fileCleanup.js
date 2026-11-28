const fs = require("fs");
const path = require("path");
const Product = require("../models/Product");
const Category = require("../models/Category");

/**
 * Checks if a file path belongs to our local server uploads folder (/uploads/...)
 * and if it is not referenced by any other Product or Category, removes it from disk.
 *
 * @param {string} rawPath - e.g. "/uploads/products/17949...jpg" or "uploads/categories/..."
 */
const deleteUnusedServerFile = async (rawPath) => {
  if (!rawPath || typeof rawPath !== "string") return;

  const normalized = rawPath.replace(/\\/g, "/").trim();

  // Safety check: Never touch placeholders, defaults, external URLs, or static assets
  if (
    normalized.includes("placeholder") ||
    normalized.includes("default") ||
    normalized.includes("/images/") ||
    normalized.startsWith("http://") ||
    normalized.startsWith("https://") ||
    normalized.startsWith("data:") ||
    normalized.startsWith("blob:")
  ) {
    return;
  }

  // We only touch files that live strictly under uploads/
  if (!normalized.startsWith("/uploads/") && !normalized.startsWith("uploads/")) {
    return;
  }

  // Ensure relative to project uploads dir safely
  const cleanRelative = normalized.startsWith("/") ? normalized.slice(1) : normalized;
  const projectRoot = path.resolve(__dirname, "..", "..");
  const absoluteFilePath = path.resolve(projectRoot, cleanRelative);

  // Security check: Must reside within projectRoot/uploads directory
  const uploadsDir = path.resolve(projectRoot, "uploads");
  if (!absoluteFilePath.startsWith(uploadsDir)) {
    console.warn(`[FileCleanup] Path traversal attempt blocked: ${rawPath}`);
    return;
  }

  try {
    // Both standard path format and leading slash variant
    const candidates = [
      normalized.startsWith("/") ? normalized : `/${normalized}`,
      normalized.startsWith("/") ? normalized.slice(1) : normalized,
    ];

    // Check references in Product (both image_url and images array)
    const productRef = await Product.countDocuments({
      $or: [
        { image_url: { $in: candidates } },
        { images: { $in: candidates } },
      ],
    });

    if (productRef > 0) {
      return; // Still in use by a product
    }

    // Check references in Category
    const categoryRef = await Category.countDocuments({
      image_url: { $in: candidates },
    });

    if (categoryRef > 0) {
      return; // Still in use by a category
    }

    // No references found in DB, safely delete the file from disk if it exists
    if (fs.existsSync(absoluteFilePath)) {
      await fs.promises.unlink(absoluteFilePath);
      console.log(`[FileCleanup] Deleted unreferenced image file: ${cleanRelative}`);
    }
  } catch (err) {
    console.warn(`[FileCleanup] Error checking/deleting file ${rawPath}:`, err.message);
  }
};

/**
 * Clean up multiple unused files
 * @param {string[]} paths
 */
const deleteUnusedServerFiles = async (paths) => {
  if (!Array.isArray(paths) || paths.length === 0) return;
  for (const p of paths) {
    if (p) await deleteUnusedServerFile(p);
  }
};

module.exports = {
  deleteUnusedServerFile,
  deleteUnusedServerFiles,
};
