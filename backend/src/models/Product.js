const mongoose = require("mongoose");

const specificationSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      index: true,
    },
    sku: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    slug: {
      type: String,
      required: [true, "Product slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      index: true,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
      default: 0,
    },
    category: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      index: true,
    },
    categoryId: {
      type: String,
      required: [true, "Category ID is required"],
      trim: true,
      index: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    image_url: {
      type: String,
      default: "",
    },
    images: {
      type: [String],
      default: [],
    },
    material: {
      type: String,
      trim: true,
      default: "Premium UV-Resin & Eco-PLA",
    },
    print_time: {
      type: String,
      trim: true,
      default: "1-2 working days",
    },
    dimensions: {
      type: String,
      trim: true,
      default: "Customizable",
    },
    weight_g: {
      type: Number,
      default: 100,
    },
    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },
    review_count: {
      type: Number,
      default: 1,
    },
    is_featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isCustomizable: {
      type: Boolean,
      default: true,
    },
    customizationType: {
      type: String,
      default: "generic",
    },
    availableOptions: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    specifications: {
      type: [specificationSchema],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    currentStock: {
      type: Number,
      default: 100,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ name: "text", description: "text", category: "text", tags: "text" });

module.exports = mongoose.model("Product", productSchema);

