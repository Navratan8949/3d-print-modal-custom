const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is required",
      });
    }

    const parts = authHeader.trim().split(/\s+/);

    if (parts.length !== 2 || parts[0] !== "Bearer" || !parts[1]) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization header format (Bearer <token> required)",
      });
    }

    let decoded;
    const accessSecret = process.env.JWT_ACCESS_SECRET;
    try {
      decoded = jwt.verify(parts[1], accessSecret);
    } catch (verifyErr) {
      if (process.env.JWT_ACCESS_SECRET) {
        decoded = jwt.verify(parts[1], process.env.JWT_ACCESS_SECRET);
      } else {
        throw verifyErr;
      }
    }

    if (!decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user || user.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "User account not found or is inactive",
      });
    }

    // Verify tokenVersion for instant server-side revocation on password change or logout-all
    if (
      decoded.tokenVersion !== undefined &&
      decoded.tokenVersion !== (user.tokenVersion || 0)
    ) {
      return res.status(401).json({
        success: false,
        message: "Session has been revoked. Please log in again.",
      });
    }

    req.user = {
      userId: user._id.toString(),
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profileImage: user.profileImage,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Authentication token has expired. Please log in again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication check failed.",
    });
  }
};

module.exports = authMiddleware;

