const express = require("express");
const {
  getAllProducts,
  getProductBySlugOrId,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleFeatured,
} = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { productUpload } = require("../utils/multer");

const router = express.Router();

// Public routes
router.get("/", getAllProducts);
router.get("/categories", getCategories);
router.get("/:identifier", getProductBySlugOrId);

// Admin protected routes
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin", "super_admin"),
  productUpload.array("images", 8),
  createProduct
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "super_admin"),
  productUpload.array("images", 8),
  updateProduct
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "super_admin"),
  deleteProduct
);

router.patch(
  "/:id/toggle-featured",
  authMiddleware,
  roleMiddleware("admin", "super_admin"),
  toggleFeatured
);

module.exports = router;

