const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalOrders,
      pendingOrders,
      inProductionOrders,
      shippedOrders,
      deliveredOrders,
      totalProducts,
      totalUsers,
      recentOrders,
      revenueAggregation,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: "pending" }),
      Order.countDocuments({ status: "in_production" }),
      Order.countDocuments({ status: "shipped" }),
      Order.countDocuments({ status: "delivered" }),
      Product.countDocuments({ status: "active" }),
      User.countDocuments({ role: "customer" }),
      Order.find().sort({ createdAt: -1 }).limit(8),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
      ]),
    ]);

    const totalRevenue =
      revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        inProductionOrders,
        shippedOrders,
        deliveredOrders,
        totalProducts,
        totalUsers,
        totalRevenue,
      },
      recentOrders,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
};

