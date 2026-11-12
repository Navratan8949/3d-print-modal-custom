const Product = require("../models/Product");
const path = require("path");
const fs = require("fs");

// Helper to create slug from title
const createSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
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

    let slug = createSlug(name);
    // ensure unique slug
    const count = await Product.countDocuments({ slug: new RegExp(`^${slug}`, "i") });
    if (count > 0) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    // Collect uploaded image paths if any
    let images = [];
    if (req.body.existingImages) {
      try {
        const parsed =
          typeof req.body.existingImages === "string"
            ? JSON.parse(req.body.existingImages)
            : req.body.existingImages;
        if (Array.isArray(parsed)) images.push(...parsed);
      } catch (e) {
        console.warn("Could not parse existingImages in createProduct:", e.message);
      }
    }
    if (req.files && req.files.length > 0) {
      const fileUrls = req.files.map((file) => `/uploads/products/${file.filename}`);
      images.push(...fileUrls);
    } else if (req.body.images) {
      const bodyImages = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
      images.push(...bodyImages);
    }
    images = images.filter((v, i, a) => a.indexOf(v) === i && v);

    const image_url =
      images.length > 0 ? images[0] : req.body.image_url || "/images/products/placeholder.jpeg";

    // Parse options & specifications if sent as strings (e.g. from multipart formData)
    let availableOptions = {};
    if (req.body.availableOptions) {
      availableOptions =
        typeof req.body.availableOptions === "string"
          ? JSON.parse(req.body.availableOptions)
          : req.body.availableOptions;
    }

    let specifications = [];
    if (req.body.specifications) {
      specifications =
        typeof req.body.specifications === "string"
          ? JSON.parse(req.body.specifications)
          : req.body.specifications;
    }

    let parsedTags = [];
    if (tags) {
      parsedTags = typeof tags === "string" ? tags.split(",").map((t) => t.trim()) : tags;
    }

    const lastProduct = await Product.findOne().sort({ id: -1 });
    const nextId = (lastProduct && lastProduct.id ? lastProduct.id : 100) + 1;

    const product = new Product({
      id: nextId,
      sku: req.body.sku || `3DVS-${nextId}`,
      slug,
      name: name.trim(),
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : 0,
      category: category.trim(),
      categoryId: categoryId ? categoryId.trim() : createSlug(category),
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
      currentStock: currentStock ? Number(currentStock) : 100,
      status: "active",
    });

    await product.save();

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create product",
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

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const updateData = { ...req.body };

    // Parse options & specs if passed as strings
    if (typeof updateData.availableOptions === "string") {
      updateData.availableOptions = JSON.parse(updateData.availableOptions);
    }
    if (typeof updateData.specifications === "string") {
      updateData.specifications = JSON.parse(updateData.specifications);
    }
    if (typeof updateData.tags === "string") {
      updateData.tags = updateData.tags.split(",").map((t) => t.trim());
    }
    if (updateData.showInSlider !== undefined) {
      updateData.showInSlider = updateData.showInSlider === "true" || updateData.showInSlider === true;
    }
    if (updateData.is_featured !== undefined) {
      updateData.is_featured = updateData.is_featured === "true" || updateData.is_featured === true;
    }

    // Handle existing images if provided (supports reordering or removing images)
    let currentImages = product.images || [];
    if (updateData.existingImages !== undefined) {
      try {
        currentImages =
          typeof updateData.existingImages === "string"
            ? JSON.parse(updateData.existingImages)
            : updateData.existingImages;
        if (!Array.isArray(currentImages)) currentImages = [];
      } catch (e) {
        console.warn("Could not parse existingImages:", e.message);
      }
      delete updateData.existingImages;
    }

    // Append new uploaded images if any
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/products/${file.filename}`);
      currentImages = [...currentImages, ...newImages];
    }

    updateData.images = currentImages;
    if (currentImages.length > 0) {
      if (
        !product.image_url ||
        !currentImages.includes(product.image_url) ||
        product.image_url.includes("placeholder")
      ) {
        updateData.image_url = currentImages[0];
      }
    } else if (!updateData.image_url) {
      updateData.image_url = "/images/products/placeholder.jpeg";
    }

    Object.assign(product, updateData);
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update product",
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
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
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
    const product = await Product.findById(id);

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
    const product = await Product.findById(id);

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

    const product = await Product.findById(id);
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

    // Optionally try to delete file from disk if local upload
    if (typeof imageUrl === "string" && imageUrl.startsWith("/uploads/")) {
      const filePath = path.join(__dirname, "..", "..", imageUrl);
      fs.unlink(filePath, (err) => {
        if (err && err.code !== "ENOENT") {
          console.warn("Could not delete file from disk:", filePath, err.message);
        }
      });
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

    const product = await Product.findById(id);
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


