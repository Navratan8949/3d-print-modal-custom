const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const contactRoutes = require("./routes/contactRoutes");
const activityLogger = require("./middleware/activityLogger");

const app = express();

app.use(morgan("dev"));

// Dynamic CORS configuration allowing localhost and any frontend origin
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Static file servers for uploads & public assets
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use("/public", express.static(path.join(__dirname, "..", "public")));

// Activity logger
app.use(activityLogger);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/contact", contactRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Prime 3D Printing Lab API is healthy and operational",
    brand: "Prime 3D Printing Lab",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Prime 3D Printing Lab Backend API Server",
    version: "1.0.0",
  });
});

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint route not found",
    path: req.originalUrl,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled API Error:", err);

  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Uploaded file is too large"
        : err.message || "File upload failed";

    return res.status(400).json({
      success: false,
      message,
      code: err.code,
    });
  }

  return res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

module.exports = app;

