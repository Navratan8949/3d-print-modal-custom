const Category = require("../models/Category");
const Product = require("../models/Product");
const { deleteUnusedServerFile } = require("../utils/fileCleanup");

/**
 * 1. GET ALL ACTIVE CATEGORIES (PUBLIC)
 * GET /api/categories
 */
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ status: "active" }).sort({ order: 1, createdAt: 1 });

    // Aggregate real product counts for each category
    const productStats = await Product.aggregate([
      { $match: { status: "active" } },
      {
        $group: {
          _id: "$categoryId",
          count: { $sum: 1 },
          sampleImage: { $first: "$image_url" },
        },
      },
    ]);

    const statsMap = {};
    productStats.forEach((st) => {
      if (st._id) statsMap[st._id] = st;
    });

    const categoriesWithStats = categories.map((cat) => {
      const stat = statsMap[cat.slug] || statsMap[cat._id.toString()];
      const count = stat ? stat.count : 0;
      return {
        _id: cat._id,
        id: cat.slug,
        slug: cat.slug,
        name: cat.name,
        shortDescription: cat.shortDescription,
        description: cat.description,
        tagline: cat.tagline,
        accentColor: cat.accentColor,
        image_url: cat.image_url || (stat && stat.sampleImage) || "",
        itemCount: `${count} Item${count === 1 ? "" : "s"}`,
        actualProductCount: count,
        order: cat.order,
        status: cat.status,
      };
    });

    return res.status(200).json({
      success: true,
      categories: categoriesWithStats,
    });
  } catch (error) {
    console.error("Get all categories error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

/**
 * 2. GET ALL CATEGORIES FOR ADMIN (INCLUDES INACTIVE)
 * GET /api/categories/admin/all
 */
exports.getAdminCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1, createdAt: 1 });

    // Count products per category
    const productStats = await Product.aggregate([
      {
        $group: {
          _id: "$categoryId",
          count: { $sum: 1 },
        },
      },
    ]);

    const statsMap = {};
    productStats.forEach((st) => {
      if (st._id) statsMap[st._id] = st.count;
    });

    const enriched = categories.map((cat) => ({
      ...cat.toObject(),
      productCount: statsMap[cat.slug] || 0,
    }));

    return res.status(200).json({
      success: true,
      count: enriched.length,
      categories: enriched,
    });
  } catch (error) {
    console.error("Get admin categories error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin categories",
      error: error.message,
    });
  }
};

/**
 * 3. CREATE NEW CATEGORY (ADMIN)
 * POST /api/categories
 */
exports.createCategory = async (req, res) => {
  try {
    const {
      name,
      slug,
      shortDescription,
      description,
      tagline,
      accentColor,
      image_url,
      order,
      status,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    // Auto-generate clean slug if not explicitly passed
    const generatedSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check if category name or slug already exists
    const existing = await Category.findOne({
      $or: [{ name: name.trim() }, { slug: generatedSlug }],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Category with name "${name}" or slug "${generatedSlug}" already exists`,
      });
    }

    const highestOrder = await Category.findOne().sort({ order: -1 }).select("order");
    const nextOrder = order !== undefined ? Number(order) : (highestOrder?.order || 0) + 1;

    let finalImageUrl = "";
    if (req.file) {
      finalImageUrl = `/uploads/categories/${req.file.filename}`;
    } else if (image_url && typeof image_url === "string" && image_url.trim()) {
      finalImageUrl = image_url.trim();
    }

    const newCategory = new Category({
      name: name.trim(),
      slug: generatedSlug,
      shortDescription: (shortDescription || "").trim(),
      description: (description || "").trim(),
      tagline: (tagline || "").trim(),
      accentColor: (accentColor || "#D97706").trim(),
      image_url: finalImageUrl,
      order: nextOrder,
      status: status || "active",
      itemCount: "0+ Creations",
    });

    await newCategory.save();

    return res.status(201).json({
      success: true,
      message: `Category "${newCategory.name}" created successfully! It will now appear across storefront and product forms.`,
      category: newCategory,
    });
  } catch (error) {
    console.error("Create category error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: error.message,
    });
  }
};

/**
 * 4. UPDATE CATEGORY (ADMIN)
 * PUT /api/categories/:id
 */
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      shortDescription,
      description,
      tagline,
      accentColor,
      image_url,
      order,
      status,
    } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const prevSlug = category.slug;
    const prevName = category.name;
    const oldImageUrl = category.image_url;

    if (name) category.name = name.trim();
    if (slug) {
      category.slug = slug
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-");
    }
    if (shortDescription !== undefined) category.shortDescription = shortDescription.trim();
    if (description !== undefined) category.description = description.trim();
    if (tagline !== undefined) category.tagline = tagline.trim();
    if (accentColor !== undefined) category.accentColor = accentColor.trim();

    if (req.file) {
      category.image_url = `/uploads/categories/${req.file.filename}`;
    } else if (image_url !== undefined && typeof image_url === "string" && image_url.trim()) {
      category.image_url = image_url.trim();
    }

    if (order !== undefined) category.order = Number(order);
    if (status !== undefined) category.status = status;

    await category.save();

    // If slug or name changed, sync with existing products
    if (category.slug !== prevSlug || category.name !== prevName) {
      await Product.updateMany(
        { categoryId: prevSlug },
        { categoryId: category.slug, category: category.name }
      );
    }

    // Clean up old server image if it was replaced and is no longer referenced
    if (oldImageUrl && oldImageUrl !== category.image_url) {
      deleteUnusedServerFile(oldImageUrl).catch((e) =>
        console.warn("Cleanup old category image error:", e.message)
      );
    }

    return res.status(200).json({
      success: true,
      message: `Category "${category.name}" updated successfully`,
      category,
    });
  } catch (error) {
    console.error("Update category error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: error.message,
    });
  }
};

/**
 * 5. DELETE CATEGORY (ADMIN)
 * DELETE /api/categories/:id
 */
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if products exist in this category
    const productCount = await Product.countDocuments({
      $or: [{ categoryId: category.slug }, { category: category.name }],
    });

    if (productCount > 0) {
      // Soft-deactivate instead of breaking existing products
      category.status = "inactive";
      await category.save();
      return res.status(200).json({
        success: true,
        message: `Category "${category.name}" has ${productCount} assigned products. It was marked inactive rather than permanently deleted so products remain accessible.`,
        category,
      });
    }

    const oldImageUrl = category.image_url;
    await Category.findByIdAndDelete(id);

    // Clean up category image file from server if no longer used
    if (oldImageUrl) {
      deleteUnusedServerFile(oldImageUrl).catch((e) =>
        console.warn("Cleanup deleted category image error:", e.message)
      );
    }

    return res.status(200).json({
      success: true,
      message: `Category "${category.name}" deleted permanently`,
    });
  } catch (error) {
    console.error("Delete category error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: error.message,
    });
  }
};
