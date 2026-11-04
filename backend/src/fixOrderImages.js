require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Order = require("./models/Order");
const Product = require("./models/Product");
const path = require("path");

const frontendProductsPath = path.join(__dirname, "..", "..", "frontend", "data", "products.js");
const { PRODUCTS } = require(frontendProductsPath);

async function fixOrderImages() {
  try {
    await connectDB();
    console.log("Connected to MongoDB Atlas to resolve order item images...");

    const orders = await Order.find({});
    console.log(`Found ${orders.length} orders in database.`);

    let updatedOrdersCount = 0;
    let updatedItemsCount = 0;

    for (const order of orders) {
      let modified = false;

      for (let i = 0; i < order.items.length; i++) {
        const item = order.items[i];
        if (!item.image || typeof item.image !== "string" || item.image.trim().length === 0) {
          // Resolve image
          let resolved = "";

          // Try DB Product first
          const dbProd = await Product.findOne({
            $or: [
              { slug: item.slug },
              { id: Number(item.productId) || -1 },
              { name: item.name },
            ].filter(Boolean),
          });

          if (dbProd) {
            resolved = dbProd.image_url || (dbProd.images && dbProd.images[0]) || "";
          }

          // Try static PRODUCTS catalog
          if (!resolved) {
            const staticProd = PRODUCTS.find(
              (p) =>
                (item.slug && p.slug === item.slug) ||
                (item.productId && String(p.id) === String(item.productId)) ||
                (item.name && p.name.toLowerCase() === item.name.toLowerCase()) ||
                (item.name && p.name.toLowerCase().includes(item.name.toLowerCase())) ||
                (item.name && item.name.toLowerCase().includes(p.name.toLowerCase()))
            );
            if (staticProd) {
              resolved = staticProd.image_url || (staticProd.images && staticProd.images[0]) || "";
            }
          }

          if (!resolved) {
            resolved = "/images/products/fullbody-figurine-hero.jpeg";
          }

          item.image = resolved;
          modified = true;
          updatedItemsCount++;
          console.log(`Updated Order #${order.orderNumber} Item: "${item.name}" -> ${resolved}`);
        }
      }

      if (modified) {
        order.markModified("items");
        await order.save();
        updatedOrdersCount++;
      }
    }

    console.log(`\nDONE! Updated ${updatedItemsCount} items across ${updatedOrdersCount} orders.`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

fixOrderImages();

