const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });
const Razorpay = require("razorpay");

const keyId = (process.env.RAZORPAY_KEY_ID);
const keySecret = (process.env.RAZORPAY_KEY_SECRET);
const webhookSecret = (process.env.RAZORPAY_WEBHOOK_SECRET || process.env.ROZERPAY_WEBHOOK_SECRET || "prime3d_razorpay_webhook_secret_2026").trim();

let razorpay = null;
try {
  if (keyId && keySecret) {
    razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  } else {
    console.warn("⚠️ [RAZORPAY WARNING] Razorpay key_id or key_secret is missing in environment variables!");
  }
} catch (err) {
  console.error("⚠️ [RAZORPAY INIT ERROR]:", err.message);
}

module.exports = {
  razorpay,
  keyId,
  keySecret,
  webhookSecret,
};
