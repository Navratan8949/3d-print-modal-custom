const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalOrders,
      pendingOrders,
      confirmedOrders,
      inProductionOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalProducts,
      totalUsers,
      revenueAggregation,
      allOrders,
      allProducts,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: "pending" }),
      Order.countDocuments({ status: "confirmed" }),
      Order.countDocuments({ status: "in_production" }),
      Order.countDocuments({ status: "shipped" }),
      Order.countDocuments({ status: "delivered" }),
      Order.countDocuments({ status: "cancelled" }),
      Product.countDocuments({ status: "active" }),
      User.countDocuments({ role: "customer" }),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
      ]),
      Order.find()
        .select("orderNumber status totalAmount items createdAt paymentStatus customer.name")
        .sort({ createdAt: -1 })
        .lean(),
      Product.find({ status: "active" })
        .select("name id slug category categoryId price image_url")
        .lean(),
    ]);

    const totalRevenue =
      revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        confirmedOrders,
        inProductionOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalProducts,
        totalUsers,
        totalRevenue,
      },
      allOrders,
      allProducts,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
};

