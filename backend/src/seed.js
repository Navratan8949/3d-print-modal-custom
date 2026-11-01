require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Product = require("./models/Product");

// Import catalog products from frontend data
const frontendProductsPath = require("path").join(__dirname, "..", "..", "frontend", "data", "products.js");
const fs = require("fs");

const seedData = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB for database seeding...");

    // 1. Seed / Upsert Admin User
    const adminEmail = (process.env.ADMIN_EMAIL || "prime3dprintinglab@gmail.com").toLowerCase().trim();
    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      admin = new User({
        name: "Prime 3D Admin",
        email: adminEmail,
        phone: process.env.WHATSAPP_PHONE || "916376145171",
        password: "Admin@Prime3D2026!", // Default admin password
        role: "admin",
        status: "active",
      });
      await admin.save();
      console.log(`✅ Admin account created: ${adminEmail} / Admin@Prime3D2026!`);
    } else {
      admin.role = "admin";
      admin.status = "active";
      await admin.save();
      console.log(`ℹ️ Admin account already exists: ${adminEmail}`);
    }

    // 2. Seed / Upsert Demo Customer
    let demoCustomer = await User.findOne({ email: "customer@demo.com" });
    if (!demoCustomer) {
      demoCustomer = new User({
        name: "Ravi Sharma",
        email: "customer@demo.com",
        phone: "9876543210",
        password: "Customer@1234!",
        role: "customer",
        status: "active",
      });
      await demoCustomer.save();
      console.log(`✅ Demo customer created: customer@demo.com / Customer@1234!`);
    }

    // 3. Seed initial products if Product collection is empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log("Seeding initial products from frontend catalog data...");
      try {
        const fileContent = fs.readFileSync(frontendProductsPath, "utf-8");
        // extract the array using regex / JSON parse
        const match = fileContent.match(/export\s+const\s+PRODUCTS\s*=\s*(\[[\s\S]*?\]);/);
        if (match && match[1]) {
          const rawProducts = JSON.parse(match[1]);
          const formatted = rawProducts.map((p) => ({
            id: p.id,
            sku: p.sku || `3DVS-${p.id}`,
            slug: p.slug,
            name: p.name,
            price: p.price,
            originalPrice: p.originalPrice || 0,
            category: p.category,
            categoryId: p.categoryId,
            shortDescription: p.shortDescription || "",
            description: p.description || "",
            image_url: p.image_url || "",
            images: p.images || [p.image_url],
            material: p.material || "High-Density UV Resin & Eco-PLA+",
            print_time: p.print_time || "1-2 working days",
            dimensions: p.dimensions || "Customizable",
            weight_g: p.weight_g || 100,
            rating: p.rating || 5,
            review_count: p.review_count || 12,
            is_featured: Boolean(p.is_featured),
            isCustomizable: p.isCustomizable !== false,
            customizationType: p.customizationType || "generic",
            availableOptions: p.availableOptions || {},
            specifications: p.specifications || [],
            tags: p.tags || [],
            currentStock: 100,
            status: "active",
          }));

          await Product.insertMany(formatted);
          console.log(`✅ Successfully seeded ${formatted.length} products into MongoDB!`);
        }
      } catch (err) {
        console.warn("Could not auto-parse frontend products file:", err.message);
      }
    } else {
      console.log(`ℹ️ Products already exist in database (${productCount} found).`);
    }

    console.log("🎉 Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedData();

