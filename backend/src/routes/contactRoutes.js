const express = require("express");
const Inquiry = require("../models/Inquiry");
const { sendContactInquiryEmails, sendInBackground } = require("../utils/sendMail");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

/**
 * 1. SUBMIT CONTACT / CUSTOM 3D INQUIRY (PUBLIC)
 * POST /api/contact
 */
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, subject, message, productInterest } = req.body || {};

    if (!name || !name.trim() || !phone || !phone.trim() || !message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name, phone number, and message are required",
      });
    }

    // Save inquiry to MongoDB database
    const inquiry = new Inquiry({
      name: name.trim(),
      email: email ? email.trim() : "",
      phone: phone.trim(),
      subject: (subject || "Custom 3D Printing Inquiry").trim(),
      message: message.trim(),
      productInterest: (productInterest || "").trim(),
      status: "new",
      source: "website_contact_form",
    });

    await inquiry.save();

    // Dispatch emails via Resend in background
    sendInBackground(async () => {
      await sendContactInquiryEmails({
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        subject: inquiry.subject,
        message: inquiry.message,
      });
    }, `Inquiry from ${inquiry.name} (#${inquiry._id})`);

    return res.status(201).json({
      success: true,
      message: "Thank you! Your custom 3D printing inquiry has been received. Our team will contact you via WhatsApp / phone shortly.",
      inquiryId: inquiry._id,
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

/**
 * 2. GET ALL INQUIRIES / QUERIES (ADMIN)
 * GET /api/contact/admin/all
 */
router.get(
  "/admin/all",
  authMiddleware,
  roleMiddleware("admin", "super_admin"),
  async (req, res) => {
    try {
      const { status, search, page = 1, limit = 50 } = req.query;
      const query = {};

      if (status && status !== "all") {
        query.status = status;
      }

      if (search && search.trim()) {
        const term = search.trim();
        query.$or = [
          { name: { $regex: term, $options: "i" } },
          { phone: { $regex: term, $options: "i" } },
          { email: { $regex: term, $options: "i" } },
          { subject: { $regex: term, $options: "i" } },
          { message: { $regex: term, $options: "i" } },
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [inquiries, total, newCount, contactedCount, inDiscussionCount, resolvedCount] =
        await Promise.all([
          Inquiry.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
          Inquiry.countDocuments(query),
          Inquiry.countDocuments({ status: "new" }),
          Inquiry.countDocuments({ status: "contacted" }),
          Inquiry.countDocuments({ status: "in_discussion" }),
          Inquiry.countDocuments({ status: "resolved" }),
        ]);

      return res.status(200).json({
        success: true,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        stats: {
          total,
          new: newCount,
          contacted: contactedCount,
          inDiscussion: inDiscussionCount,
          resolved: resolvedCount,
        },
        inquiries,
      });
    } catch (error) {
      console.error("Get admin inquiries error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch inquiries",
        error: error.message,
      });
    }
  }
);

/**
 * 3. UPDATE INQUIRY STATUS & ADMIN NOTES (ADMIN)
 * PATCH /api/contact/admin/:id/status
 */
router.patch(
  "/admin/:id/status",
  authMiddleware,
  roleMiddleware("admin", "super_admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;

      const inquiry = await Inquiry.findById(id);
      if (!inquiry) {
        return res.status(404).json({
          success: false,
          message: "Inquiry not found",
        });
      }

      if (status) inquiry.status = status;
      if (adminNotes !== undefined) inquiry.adminNotes = adminNotes;

      await inquiry.save();

      return res.status(200).json({
        success: true,
        message: `Inquiry status updated to ${inquiry.status}`,
        inquiry,
      });
    } catch (error) {
      console.error("Update inquiry status error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update inquiry status",
        error: error.message,
      });
    }
  }
);

/**
 * 4. DELETE INQUIRY (ADMIN)
 * DELETE /api/contact/admin/:id
 */
router.delete(
  "/admin/:id",
  authMiddleware,
  roleMiddleware("admin", "super_admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const inquiry = await Inquiry.findByIdAndDelete(id);

      if (!inquiry) {
        return res.status(404).json({
          success: false,
          message: "Inquiry not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Inquiry record deleted successfully",
      });
    } catch (error) {
      console.error("Delete inquiry error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete inquiry",
        error: error.message,
      });
    }
  }
);

module.exports = router;
