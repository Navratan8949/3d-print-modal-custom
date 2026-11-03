require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Product = require("./models/Product");
const path = require("path");

const frontendProductsPath = path.join(__dirname, "..", "..", "frontend", "data", "products.js");
const { PRODUCTS } = require(frontendProductsPath);

async function seedAll() {
  try {
    await connectDB();
    console.log("Connected to MongoDB Atlas for catalog upsert...");

    console.log(`Found ${PRODUCTS.length} products in frontend/data/products.js to sync.`);

    let inserted = 0;
    let updated = 0;

    for (const p of PRODUCTS) {
      const formatted = {
        id: p.id,
        sku: p.sku || `3DVS-${p.id}`,
        slug: p.slug,
        name: p.name,
        price: Number(p.price) || 0,
        originalPrice: Number(p.originalPrice) || 0,
        category: p.category,
        categoryId: p.categoryId,
        shortDescription: p.shortDescription || "",
        description: p.description || "",
        image_url: p.image_url || (p.images && p.images[0]) || "",
        images: p.images || (p.image_url ? [p.image_url] : []),
        material: p.material || "High-Density UV Resin & Eco-PLA+",
        print_time: p.print_time || "1-2 working days",
        dimensions: p.dimensions || "Customizable",
        weight_g: Number(p.weight_g) || 100,
        rating: Number(p.rating) || 5,
        review_count: Number(p.review_count) || 12,
        is_featured: Boolean(p.is_featured),
        isCustomizable: p.isCustomizable !== false,
        customizationType: p.customizationType || "generic",
        availableOptions: p.availableOptions || {},
        specifications: p.specifications || [],
        tags: p.tags || [],
        currentStock: p.currentStock || 100,
        status: "active",
      };

      const existing = await Product.findOne({ $or: [{ slug: p.slug }, { id: p.id }] });
      if (existing) {
        Object.assign(existing, formatted);
        await existing.save();
        updated++;
      } else {
        await Product.create(formatted);
        inserted++;
      }
    }

    const totalInDB = await Product.countDocuments();
    console.log(`✅ Sync complete: ${inserted} inserted, ${updated} updated. Total in Atlas DB: ${totalInDB}`);
    process.exit(0);
  } catch (error) {
    console.error("Sync error:", error);
    process.exit(1);
  }
}

seedAll();

