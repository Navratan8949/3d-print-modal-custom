const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required before role check",
      });
    }

    // super_admin always allowed
    if (req.user.role === "super_admin") {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access forbidden: You do not have permission for this action",
      });
    }

    next();
  };
};

module.exports = roleMiddleware;

