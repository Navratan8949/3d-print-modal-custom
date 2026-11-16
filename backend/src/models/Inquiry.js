const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      required: [true, "Customer phone number is required"],
      trim: true,
      index: true,
    },
    subject: {
      type: String,
      trim: true,
      default: "Custom 3D Printing Inquiry",
    },
    message: {
      type: String,
      required: [true, "Inquiry message is required"],
      trim: true,
    },
    productInterest: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["new", "contacted", "in_discussion", "resolved", "archived"],
      default: "new",
      index: true,
    },
    adminNotes: {
      type: String,
      trim: true,
      default: "",
    },
    source: {
      type: String,
      default: "contact_form",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Inquiry", inquirySchema);
