const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    productId: {
      type: String,
      default: null,
    },
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    image: {
      type: String,
      default: "",
    },
    customization: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    hasPhoto: {
      type: Boolean,
      default: false,
    },
    referencePhotoUrl: {
      type: String,
      default: null,
    },
  },
  { _id: true }
);

const customerInfoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    address: {
      type: String,
      required: [true, "Delivery address is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, "Pincode is required"],
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    customer: {
      type: customerInfoSchema,
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(v) => Array.isArray(v) && v.length > 0, "Order must have at least one item"],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    itemCount: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "in_production", "shipped", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "advance_paid", "paid", "cod"],
      default: "pending",
      index: true,
    },
    orderSource: {
      type: String,
      enum: ["whatsapp", "web"],
      default: "whatsapp",
    },
    whatsappUrl: {
      type: String,
      default: "",
    },
    tracking: {
      courierName: { type: String, default: "" },
      trackingNumber: { type: String, default: "" },
      trackingUrl: { type: String, default: "" },
    },
    adminNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ "customer.phone": 1 });
orderSchema.index({ "customer.email": 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);

