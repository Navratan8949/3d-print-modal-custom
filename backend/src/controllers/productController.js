const Product = require("../models/Product");
const path = require("path");
const fs = require("fs");
const { deleteUnusedServerFile, deleteUnusedServerFiles } = require("../utils/fileCleanup");

// Helper to strictly sanitize image URLs to plain strings
const sanitizeImageUrl = (img) => {
  if (!img) return null;
  if (typeof img === "string") {
    const trimmed = img.trim();
    if (
      !trimmed ||
      trimmed === "{}" ||
      trimmed === "[object Object]" ||
      trimmed.replace(/\s+/g, "") === "{}"
    ) {
      return null;
    }
    return trimmed;
  }
  if (typeof img === "object") {
    const candidate = img.url || img.src || img.image_url || img.path;
    if (typeof candidate === "string") {
      const trimmed = candidate.trim();
      if (
        trimmed &&
        trimmed !== "{}" &&
        trimmed !== "[object Object]" &&
        trimmed.replace(/\s+/g, "") !== "{}"
      ) {
        return trimmed;
      }
    }
  }
  return null;
};

// Helper to create slug from title
const createSlug = (text) => {
  if (!text) return `prod-${Date.now().toString(36)}`;
  let s = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!s || s === "-") {
    s = `prod-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  }
  return s;
};

// Helper to look up a product by MongoDB _id, numeric id, or slug
const findProductByIdOrNum = async (identifier) => {
  if (!identifier) return null;
  const strId = String(identifier).trim();
  if (strId.match(/^[0-9a-fA-F]{24}$/)) {
    const p = await Product.findById(strId);
    if (p) return p;
  }
  if (!isNaN(Number(strId))) {
    const p = await Product.findOne({ id: Number(strId) });
    if (p) return p;
  }
  return await Product.findOne({ slug: strId });
};

// ==========================================
// GET ALL PRODUCTS (PUBLIC)
// ==========================================
exports.getAllProducts = async (req, res) => {
  try {
    const {
      category,
      search,
      featured,
      slider,
      sort,
      minPrice,
      maxPrice,
      page = 1,
      limit = 50,
      status = "active",
    } = req.query;

    const query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (category && category !== "all") {
      query.$or = [
        { categoryId: category },
        { category: new RegExp(`^${category}$`, "i") },
      ];
    }

    if (featured === "true" || featured === true) {
      query.is_featured = true;
    }

    if (slider === "true" || slider === true) {
      query.showInSlider = true;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { name: { $regex: term, $options: "i" } },
        { category: { $regex: term, $options: "i" } },
        { shortDescription: { $regex: term, $options: "i" } },
        { tags: { $in: [new RegExp(term, "i")] } },
      ];
    }

    let sortQuery = { createdAt: -1 };
    if (sort === "price_asc") sortQuery = { price: 1 };
    if (sort === "price_desc") sortQuery = { price: -1 };
    if (sort === "rating") sortQuery = { rating: -1, review_count: -1 };
    if (sort === "popular") sortQuery = { review_count: -1, rating: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortQuery).skip(skip).limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      products,
    });
  } catch (error) {
    console.error("Get all products error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// ==========================================
// GET PRODUCT BY SLUG OR ID (PUBLIC)
// ==========================================
exports.getProductBySlugOrId = async (req, res) => {
  try {
    const { identifier } = req.params;

    let product = null;

    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(identifier);
    } else if (!isNaN(Number(identifier))) {
      product = await Product.findOne({ id: Number(identifier) });
    }

    if (!product) {
      product = await Product.findOne({ slug: identifier });
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Also fetch 4 related products from the same category
    const related = await Product.find({
      categoryId: product.categoryId,
      _id: { $ne: product._id },
      status: "active",
    })
      .limit(4)
      .select("id sku slug name price originalPrice image_url images category rating review_count");

    return res.status(200).json({
      success: true,
      product,
      related,
    });
  } catch (error) {
    console.error("Get product error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product details",
    });
  }
};

// ==========================================
// GET CATEGORIES (PUBLIC)
// ==========================================
exports.getCategories = async (req, res) => {
  try {
    const categoryStats = await Product.aggregate([
      { $match: { status: "active" } },
      {
        $group: {
          _id: "$categoryId",
          categoryName: { $first: "$category" },
          count: { $sum: 1 },
          sampleImage: { $first: "$image_url" },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      categories: categoryStats,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

// ==========================================
// CREATE PRODUCT (ADMIN)
// ==========================================
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      originalPrice,
      category,
      categoryId,
      shortDescription,
      description,
      material,
      print_time,
      dimensions,
      weight_g,
      is_featured,
      isCustomizable,
      customizationType,
      tags,
      currentStock,
    } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Product name, price, and category are required",
      });
    }

    const baseSlug = createSlug(name);
    let slug = baseSlug;
    const existingSlug = await Product.findOne({ slug });
    if (existingSlug) {
      slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    }

    // Collect uploaded image paths if any
    let existingList = [];
    if (req.body.existingImages) {
      try {
        const parsed =
          typeof req.body.existingImages === "string"
            ? JSON.parse(req.body.existingImages)
            : req.body.existingImages;
        if (Array.isArray(parsed)) {
          parsed.forEach((item) => {
            const clean = sanitizeImageUrl(item);
            if (clean) existingList.push(clean);
          });
        }
      } catch (e) {
        console.warn("Could not parse existingImages in createProduct:", e.message);
      }
    }

    const uploadedList = (req.files && req.files.length > 0)
      ? req.files.map((file) => `/uploads/products/${file.filename}`)
      : [];

    const primaryCoverSource = req.body.primaryCoverSource; // "new" | "existing"

    let images = [];
    if (primaryCoverSource === "new" && uploadedList.length > 0) {
      images = [...uploadedList, ...existingList];
    } else if (uploadedList.length > 0) {
      images = [...uploadedList, ...existingList];
    } else {
      images = [...existingList];
    }

    images = images
      .map(sanitizeImageUrl)
      .filter((v, i, a) => typeof v === "string" && v && a.indexOf(v) === i);

    const fallbackUrl = sanitizeImageUrl(req.body.image_url) || "/images/products/placeholder.jpeg";
    const image_url = images.length > 0 ? images[0] : fallbackUrl;

    // Parse options & specifications if sent as strings (e.g. from multipart formData)
    let availableOptions = {};
    if (req.body.availableOptions) {
      try {
        availableOptions =
          typeof req.body.availableOptions === "string"
            ? JSON.parse(req.body.availableOptions)
            : req.body.availableOptions;
      } catch {
        availableOptions = {};
      }
    }

    let specifications = [];
    if (req.body.specifications) {
      try {
        specifications =
          typeof req.body.specifications === "string"
            ? JSON.parse(req.body.specifications)
            : req.body.specifications;
      } catch {
        specifications = [];
      }
    }

    let parsedTags = [];
    if (tags) {
      if (typeof tags === "string") {
        try {
          const parsed = JSON.parse(tags);
          parsedTags = Array.isArray(parsed) ? parsed : tags.split(",").map((t) => t.trim());
        } catch {
          parsedTags = tags.split(",").map((t) => t.trim());
        }
      } else if (Array.isArray(tags)) {
        parsedTags = tags;
      }
      parsedTags = parsedTags.filter(Boolean);
    }

    const lastProduct = await Product.findOne({ id: { $exists: true, $ne: null } }).sort({ id: -1 });
    const nextId = (lastProduct && typeof lastProduct.id === "number" ? lastProduct.id : 100) + 1;

    let sku = req.body.sku ? req.body.sku.trim() : `3DVS-${nextId}`;
    const existingSku = await Product.findOne({ sku });
    if (existingSku) {
      sku = `3DVS-${nextId}-${Date.now().toString().slice(-4)}`;
    }

    const resolvedCategoryId = categoryId && categoryId.trim() ? categoryId.trim() : createSlug(category);

    const product = new Product({
      id: nextId,
      sku,
      slug,
      name: name.trim(),
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : 0,
      category: category.trim(),
      categoryId: resolvedCategoryId,
      shortDescription: shortDescription || "",
      description: description || "",
      image_url,
      images,
      material: material || "High-Density UV Resin & Eco-PLA+",
      print_time: print_time || "1-2 working days",
      dimensions: dimensions || "Customizable",
      weight_g: weight_g ? Number(weight_g) : 100,
      is_featured: is_featured === "true" || is_featured === true,
      showInSlider: req.body.showInSlider === "true" || req.body.showInSlider === true,
      isCustomizable: isCustomizable === "false" || isCustomizable === false ? false : true,
      customizationType: customizationType || "generic",
      availableOptions,
      specifications,
      tags: parsedTags,
      currentStock: currentStock !== undefined && !isNaN(Number(currentStock)) ? Number(currentStock) : 100,
      status: req.body.status || "active",
    });

    await product.save();

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    const errorDetails = error.errors
      ? Object.values(error.errors).map((e) => e.message).join(", ")
      : error.message;
    return res.status(400).json({
      success: false,
      message: errorDetails || error.message || "Failed to create product",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE PRODUCT (ADMIN)
// ==========================================
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await findProductByIdOrNum(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const updateData = { ...req.body };

    // Parse options & specs if passed as strings
    if (typeof updateData.availableOptions === "string") {
      try {
        updateData.availableOptions = JSON.parse(updateData.availableOptions);
      } catch {
        updateData.availableOptions = {};
      }
    }
    if (typeof updateData.specifications === "string") {
      try {
        updateData.specifications = JSON.parse(updateData.specifications);
      } catch {
        updateData.specifications = [];
      }
    }
    if (updateData.tags !== undefined) {
      if (typeof updateData.tags === "string") {
        try {
          const parsed = JSON.parse(updateData.tags);
          updateData.tags = Array.isArray(parsed) ? parsed : updateData.tags.split(",").map((t) => t.trim());
        } catch {
          updateData.tags = updateData.tags.split(",").map((t) => t.trim());
        }
      }
      if (Array.isArray(updateData.tags)) {
        updateData.tags = updateData.tags.filter(Boolean);
      }
    }
    if (updateData.showInSlider !== undefined) {
      updateData.showInSlider = updateData.showInSlider === "true" || updateData.showInSlider === true;
    }
    if (updateData.is_featured !== undefined) {
      updateData.is_featured = updateData.is_featured === "true" || updateData.is_featured === true;
    }
    if (updateData.isCustomizable !== undefined) {
      updateData.isCustomizable = updateData.isCustomizable === "false" || updateData.isCustomizable === false ? false : true;
    }
    if (updateData.price !== undefined) {
      updateData.price = Number(updateData.price);
    }
    if (updateData.originalPrice !== undefined) {
      updateData.originalPrice = Number(updateData.originalPrice);
    }
    if (updateData.currentStock !== undefined) {
      updateData.currentStock = Number(updateData.currentStock);
    }

    // Handle existing images if provided (supports reordering or removing images)
    const oldImages = [...(product.images || [])];
    if (product.image_url && !oldImages.includes(product.image_url)) {
      oldImages.push(product.image_url);
    }

    let currentImages = (product.images || [])
      .map(sanitizeImageUrl)
      .filter((v) => typeof v === "string" && v);

    if (updateData.existingImages !== undefined) {
      try {
        const parsed =
          typeof updateData.existingImages === "string"
            ? JSON.parse(updateData.existingImages)
            : updateData.existingImages;
        if (Array.isArray(parsed)) {
          currentImages = parsed
            .map(sanitizeImageUrl)
            .filter((v) => typeof v === "string" && v);
        } else {
          currentImages = [];
        }
      } catch (e) {
        currentImages = [];
      }
      delete updateData.existingImages;
    }

    // Uploaded new images from req.files
    const newUploadedImages = (req.files && req.files.length > 0)
      ? req.files.map((file) => `/uploads/products/${file.filename}`)
      : [];

    const primaryCoverSource = req.body.primaryCoverSource; // "new" | "existing"

    let combinedImages = [];
    if (primaryCoverSource === "new" && newUploadedImages.length > 0) {
      combinedImages = [...newUploadedImages, ...currentImages];
    } else {
      combinedImages = [...currentImages, ...newUploadedImages];
    }

    // Filter duplicates, sanitize, and remove placeholder if real images exist
    combinedImages = combinedImages
      .map(sanitizeImageUrl)
      .filter((v, i, a) => typeof v === "string" && v && a.indexOf(v) === i);

    if (combinedImages.length > 1) {
      combinedImages = combinedImages.filter((img) => !img.includes("placeholder"));
    }

    updateData.images = combinedImages;
    if (combinedImages.length > 0) {
      updateData.image_url = combinedImages[0];
    } else {
      updateData.image_url = sanitizeImageUrl(updateData.image_url) || "/images/products/placeholder.jpeg";
    }

    Object.assign(product, updateData);
    await product.save();

    // Clean up removed images that are no longer used by any product or category
    const activeImages = new Set([product.image_url, ...(product.images || [])]);
    const removedImages = oldImages.filter((img) => !activeImages.has(img));
    if (removedImages.length > 0) {
      deleteUnusedServerFiles(removedImages).catch((e) =>
        console.warn("Cleanup unused product images error:", e.message)
      );
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);
    const errorDetails = error.errors
      ? Object.values(error.errors).map((e) => e.message).join(", ")
      : error.message;
    return res.status(400).json({
      success: false,
      message: errorDetails || error.message || "Failed to update product",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE PRODUCT (ADMIN)
// ==========================================
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await findProductByIdOrNum(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const productImages = [...(product.images || [])];
    if (product.image_url && !productImages.includes(product.image_url)) {
      productImages.push(product.image_url);
    }

    await Product.findByIdAndDelete(product._id);

    // Clean up server images if no other product/category uses them
    if (productImages.length > 0) {
      deleteUnusedServerFiles(productImages).catch((e) =>
        console.warn("Cleanup deleted product images error:", e.message)
      );
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};

// ==========================================
// TOGGLE FEATURED (ADMIN)
// ==========================================
exports.toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await findProductByIdOrNum(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.is_featured = !product.is_featured;
    await product.save();

    return res.status(200).json({
      success: true,
      message: `Product is now ${product.is_featured ? "featured" : "unfeatured"}`,
      is_featured: product.is_featured,
    });
  } catch (error) {
    console.error("Toggle featured error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle featured status",
    });
  }
};

// ==========================================
// TOGGLE SHOW IN SLIDER (ADMIN)
// ==========================================
exports.toggleShowInSlider = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await findProductByIdOrNum(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.showInSlider = !product.showInSlider;
    await product.save();

    return res.status(200).json({
      success: true,
      message: `Product is now ${product.showInSlider ? "shown in slider" : "hidden from slider"}`,
      showInSlider: product.showInSlider,
    });
  } catch (error) {
    console.error("Toggle show in slider error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle slider status",
    });
  }
};

// ==========================================
// DELETE PRODUCT IMAGE (ADMIN)
// ==========================================
exports.deleteProductImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "imageUrl is required",
      });
    }

    const product = await findProductByIdOrNum(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Filter out the image from images array
    product.images = (product.images || []).filter((img) => img !== imageUrl);

    // If the deleted image was the primary image_url, update image_url
    if (product.image_url === imageUrl) {
      product.image_url =
        product.images.length > 0 ? product.images[0] : "/images/products/placeholder.jpeg";
    }

    await product.save();

    // Check if any other product/category uses this image before unlinking
    if (typeof imageUrl === "string") {
      deleteUnusedServerFile(imageUrl).catch((e) =>
        console.warn("Cleanup deleted product image error:", e.message)
      );
    }

    return res.status(200).json({
      success: true,
      message: "Image deleted successfully",
      product,
    });
  } catch (error) {
    console.error("Delete product image error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete product image",
      error: error.message,
    });
  }
};

// ==========================================
// SET PRIMARY PRODUCT IMAGE (ADMIN)
// ==========================================
exports.setPrimaryProductImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "imageUrl is required",
      });
    }

    const product = await findProductByIdOrNum(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.image_url = imageUrl;

    // Ensure image is at the first position in images array
    const otherImages = (product.images || []).filter((img) => img !== imageUrl);
    product.images = [imageUrl, ...otherImages];

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Primary image updated successfully",
      product,
    });
  } catch (error) {
    console.error("Set primary image error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to set primary image",
      error: error.message,
    });
  }
};


