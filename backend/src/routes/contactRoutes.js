const express = require("express");
const { sendContactInquiryEmails, sendInBackground } = require("../utils/sendMail");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body || {};

    if (!name || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, phone number, and message are required",
      });
    }

    // Dispatch emails in background (non-blocking)
    sendInBackground(async () => {
      await sendContactInquiryEmails({ name, email, phone, subject, message });
    }, `Website inquiry from ${name}`);

    return res.status(200).json({
      success: true,
      message: "Inquiry received successfully! Our team will contact you shortly.",
    });
  } catch (error) {
    console.error("Contact inquiry error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process contact inquiry",
      error: error.message,
    });
  }
});

module.exports = router;
