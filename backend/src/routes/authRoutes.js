const express = require("express");
const {
  register,
  login,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const { userUpload } = require("../utils/multer");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getCurrentUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/update-profile", authMiddleware, userUpload.single("profileImage"), updateProfile);
router.post("/change-password", authMiddleware, changePassword);

module.exports = router;

