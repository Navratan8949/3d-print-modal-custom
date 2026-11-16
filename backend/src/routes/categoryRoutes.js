const express = require("express");
const {
  getAllCategories,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Public routes
router.get("/", getAllCategories);

// Admin protected routes
router.get("/admin/all", authMiddleware, roleMiddleware("admin", "super_admin"), getAdminCategories);
router.post("/", authMiddleware, roleMiddleware("admin", "super_admin"), createCategory);
router.put("/:id", authMiddleware, roleMiddleware("admin", "super_admin"), updateCategory);
router.delete("/:id", authMiddleware, roleMiddleware("admin", "super_admin"), deleteCategory);

module.exports = router;
