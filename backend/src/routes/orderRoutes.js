const express = require("express");
const jwt = require("jsonwebtoken");
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { orderUpload } = require("../utils/multer");

const router = express.Router();

// Optional Auth middleware: if token present, decodes user, otherwise allows guest through
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next();
};

// Customer routes
router.post("/", optionalAuth, orderUpload.array("referencePhotos", 5), createOrder);
router.get("/my-orders", authMiddleware, getMyOrders);

// Admin routes
router.get("/admin/all", authMiddleware, roleMiddleware("admin", "super_admin"), getAllOrders);
router.patch("/:id/status", authMiddleware, roleMiddleware("admin", "super_admin"), updateOrderStatus);
router.delete("/:id", authMiddleware, roleMiddleware("admin", "super_admin"), deleteOrder);

// Order lookup (customer or admin)
router.get("/:id", optionalAuth, getOrderById);

module.exports = router;

