const express = require("express");
const jwt = require("jsonwebtoken");
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
  getRazorpayKey,
} = require("../controllers/paymentController");

const router = express.Router();

// Optional Auth middleware: if token present, sets req.user
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      req.user = decoded;
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next();
};

// 1. Initialize Razorpay payment & create order
router.post("/create-order", optionalAuth, createRazorpayOrder);

// 2. Client-side signature verification after payment success modal
router.post("/verify", optionalAuth, verifyRazorpayPayment);

// 3. Webhook listener from Razorpay
router.post("/webhook", handleRazorpayWebhook);

// 4. Get Razorpay public key ID
router.get("/key", getRazorpayKey);

module.exports = router;
