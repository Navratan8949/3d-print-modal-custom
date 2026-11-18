const express = require("express");
const router = express.Router();
const { getPolicies, updatePolicies } = require("../controllers/policyController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Public route to view policies
router.get("/", getPolicies);

// Admin-protected route to update policies
router.put("/", authMiddleware, roleMiddleware("admin", "super_admin"), updatePolicies);

module.exports = router;
