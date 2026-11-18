const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { sendOrderEmails, sendOrderStatusEmail, sendInBackground } = require("../utils/sendMail");

const WHATSAPP_PHONE = process.env.WHATSAPP_PHONE || "916376145171";

// Helper to generate unique human-readable order number
const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `P3D-${dateStr}-${randomSuffix}`;
};

// Helper to generate WhatsApp URL from Order Details
const generateWhatsAppUrl = (order) => {
  let msg = `Hello Prime3Dworld!\n\n`;
  msg += `🛍️ *NEW 3D PRINTING ORDER* #${order.orderNumber}\n`;
  msg += `==============================\n\n`;

  (order.items || []).forEach((item, index) => {
    msg += `*Item ${index + 1}: ${item.name}*\n`;
    msg += `• Qty: ${item.quantity}\n`;
    msg += `• Price: ₹${item.price} each\n`;
    if (item.customization && Object.keys(item.customization).length > 0) {
      Object.entries(item.customization).forEach(([k, v]) => {
        if (v) msg += `  - ${k}: ${v}\n`;
      });
    }
    if (item.hasPhoto) {
      msg += `• Photo: Reference photo attached / shared\n`;
    }
    msg += `\n`;
  });

  msg += `==============================\n`;
  msg += `📍 *CUSTOMER & DELIVERY DETAILS*\n`;
  msg += `==============================\n`;
  msg += `👤 *Name:* ${order.customer.name}\n`;
  msg += `📱 *Phone:* ${order.customer.phone}\n`;
  if (order.customer.email) msg += `📧 *Email:* ${order.customer.email}\n`;
  msg += `🏠 *Address:* ${order.customer.address}, ${order.customer.city}, ${order.customer.state} - ${order.customer.pincode}\n`;
  if (order.customer.notes) msg += `📝 *Notes:* ${order.customer.notes}\n`;

  msg += `\n💰 *Total Order Value:* ₹${order.totalAmount}\n`;
  msg += `\nPlease confirm order manufacturing schedule and payment steps.\nThank you!`;

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
};

// ==========================================
// CREATE ORDER (PUBLIC OR AUTH USER)
// ==========================================
exports.createOrder = async (req, res) => {
  try {
    const { customer, items, totalAmount, orderSource = "whatsapp" } = req.body;

    if (!customer || !customer.name || !customer.phone || !customer.address || !customer.city || !customer.pincode) {
      return res.status(400).json({
        success: false,
        message: "Customer name, phone, address, city, and pincode are required",
      });
    }

    let parsedItems = items;
    if (typeof items === "string") {
      try {
        parsedItems = JSON.parse(items);
      } catch {
        return res.status(400).json({
          success: false,
          message: "Invalid items format",
        });
      }
    }

    if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item",
      });
    }

    // Attach uploaded reference photo if any
    if (req.files && req.files.length > 0) {
      const photoUrls = req.files.map((file) => `/uploads/orders/${file.filename}`);
      parsedItems = parsedItems.map((item, idx) => ({
        ...item,
        referencePhotoUrl: photoUrls[idx] || photoUrls[0] || null,
        hasPhoto: true,
      }));
    }

    // Calculate total if not provided
    const calculatedTotal =
      totalAmount ||
      parsedItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);

    const orderNumber = generateOrderNumber();

    const order = new Order({
      orderNumber,
      user: req.user ? req.user.userId : null,
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        email: customer.email ? customer.email.trim() : "",
        address: customer.address.trim(),
        city: customer.city.trim(),
        state: customer.state ? customer.state.trim() : "Rajasthan",
        pincode: customer.pincode.trim(),
        notes: customer.notes ? customer.notes.trim() : "",
      },
      items: await Promise.all(
        parsedItems.map(async (i) => {
          let img = i.image || i.image_url || "";
          let prodId = i.id || i.sku || i.productId || "";
          let slug = i.slug || "";

          if (!img) {
            const matchQueries = [];
            if (slug) matchQueries.push({ slug });
            if (prodId && !isNaN(Number(prodId))) matchQueries.push({ id: Number(prodId) });
            if (i.name) matchQueries.push({ name: i.name });

            if (matchQueries.length > 0) {
              const matchedProd = await Product.findOne({ $or: matchQueries });
              if (matchedProd) {
                img = matchedProd.image_url || (matchedProd.images && matchedProd.images[0]) || "";
                if (!slug) slug = matchedProd.slug || "";
                if (!prodId) prodId = matchedProd.id || matchedProd.sku || "";
              }
            }
          }

          if (!img) {
            img = "/images/products/fullbody-figurine-hero.jpeg";
          }

          const refPhotos =
            Array.isArray(i.referencePhotos) && i.referencePhotos.length > 0
              ? i.referencePhotos.filter(Boolean)
              : i.referencePhotoUrl
              ? [i.referencePhotoUrl]
              : i.customization?.referencePhotoUrl
              ? [i.customization.referencePhotoUrl]
              : [];
          const refUrl = refPhotos[0] || i.referencePhotoUrl || i.customization?.referencePhotoUrl || null;
          return {
            product: i.product || i._id || null,
            productId: String(prodId),
            name: i.name,
            slug,
            price: Number(i.price) || 0,
            quantity: Number(i.quantity) || 1,
            image: img,
            customization: i.customization || {},
            hasPhoto: Boolean(i.hasPhoto || refPhotos.length > 0 || refUrl),
            referencePhotoUrl: refUrl,
            referencePhotos: refPhotos,
          };
        })
      ),
      totalAmount: Number(calculatedTotal),
      itemCount: parsedItems.reduce((acc, i) => acc + (Number(i.quantity) || 1), 0),
      orderSource,
      status: "pending",
      paymentStatus: "pending",
    });

    // Generate WhatsApp order URL
    order.whatsappUrl = generateWhatsAppUrl(order);

    await order.save();

    // Send emails in background (Admin alert + Customer confirmation)
    sendInBackground(async () => {
      await sendOrderEmails(order);
    }, `New Order emails for #${order.orderNumber}`);

    return res.status(201).json({
      success: true,
      message: "Order placed successfully! Redirecting to WhatsApp.",
      order,
      whatsappUrl: order.whatsappUrl,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to place order. Please try again.",
      error: error.message,
    });
  }
};

// ==========================================
// GET MY ORDERS (AUTH CUSTOMER)
// ==========================================
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ user: req.user.userId }, { "customer.email": req.user.email }],
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get my orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your orders",
    });
  }
};

// ==========================================
// GET ORDER BY ID (USER OR ADMIN)
// ==========================================
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    let order = null;
    if (id.startsWith("P3D-")) {
      order = await Order.findOne({ orderNumber: id });
    } else {
      order = await Order.findById(id);
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // If authenticated user is customer, ensure they own this order
    if (req.user && req.user.role === "customer") {
      const isOwner =
        (order.user && order.user.toString() === req.user.userId) ||
        (order.customer && order.customer.email === req.user.email);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to view this order",
        });
      }
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

// ==========================================
// GET ALL ORDERS (ADMIN)
// ==========================================
exports.getAllOrders = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;

    const query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { orderNumber: { $regex: term, $options: "i" } },
        { "customer.name": { $regex: term, $options: "i" } },
        { "customer.phone": { $regex: term, $options: "i" } },
        { "customer.email": { $regex: term, $options: "i" } },
        { "customer.city": { $regex: term, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total, pendingCount, inProductionCount, shippedCount, deliveredCount] =
      await Promise.all([
        Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
        Order.countDocuments(query),
        Order.countDocuments({ status: "pending" }),
        Order.countDocuments({ status: "in_production" }),
        Order.countDocuments({ status: "shipped" }),
        Order.countDocuments({ status: "delivered" }),
      ]);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      stats: {
        pending: pendingCount,
        in_production: inProductionCount,
        shipped: shippedCount,
        delivered: deliveredCount,
      },
      orders,
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE ORDER STATUS (ADMIN)
// ==========================================
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, courierName, trackingNumber, trackingUrl, adminNotes, items } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const prevStatus = order.status;

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (adminNotes !== undefined) order.adminNotes = adminNotes;
    if (items && Array.isArray(items)) {
      order.items = items;
    }

    const trackingObj = req.body.tracking || {};
    const effectiveCourier = courierName !== undefined ? courierName : trackingObj.courierName;
    const effectiveTrackingNum = trackingNumber !== undefined ? trackingNumber : trackingObj.trackingNumber;
    const effectiveTrackingUrl = trackingUrl !== undefined ? trackingUrl : trackingObj.trackingUrl;

    if (effectiveCourier || effectiveTrackingNum || effectiveTrackingUrl) {
      order.tracking = {
        courierName: effectiveCourier !== undefined ? effectiveCourier : (order.tracking?.courierName || ""),
        trackingNumber: effectiveTrackingNum !== undefined ? effectiveTrackingNum : (order.tracking?.trackingNumber || ""),
        trackingUrl: effectiveTrackingUrl !== undefined ? effectiveTrackingUrl : (order.tracking?.trackingUrl || ""),
      };
    }

    await order.save();

    // Send email notification to customer in background if status changed or tracking updated
    if ((status && status !== prevStatus) || effectiveCourier || effectiveTrackingNum) {
      sendInBackground(async () => {
        await sendOrderStatusEmail(order);
      }, `Order #${order.orderNumber} status/tracking update`);
    }

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${order.status}`,
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE ORDER (ADMIN)
// ==========================================
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Delete order error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete order",
    });
  }
};

// POST /api/orders/upload-photo - Upload customer reference photo for 3D modeling
exports.uploadReferencePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No photo file provided",
      });
    }

    const photoUrl = `/uploads/orders/${req.file.filename}`;
    return res.status(200).json({
      success: true,
      photoUrl,
      fileName: req.file.originalname,
      size: req.file.size,
    });
  } catch (error) {
    console.error("Error uploading reference photo:", error);
    return res.status(500).json({
      success: false,
      message: "Photo upload failed",
      error: error.message,
    });
  }
};

// POST /api/orders/upload-photos - Upload multiple customer reference photos
exports.uploadReferencePhotos = async (req, res) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No photo files provided",
      });
    }

    const uploaded = files.map((file) => ({
      photoUrl: `/uploads/orders/${file.filename}`,
      fileName: file.originalname,
      size: file.size,
    }));

    return res.status(200).json({
      success: true,
      photoUrls: uploaded.map((u) => u.photoUrl),
      photos: uploaded,
    });
  } catch (error) {
    console.error("Error uploading reference photos:", error);
    return res.status(500).json({
      success: false,
      message: "Multiple photos upload failed",
      error: error.message,
    });
  }
};

// PATCH /api/orders/:id/photos - Update/add/delete photos on an order item (Customer or Admin)
exports.updateOrderPhotos = async (req, res) => {
  try {
    const { id } = req.params;
    const { itemIndex = 0, action = "update", removedUrl } = req.body;

    // Look up by _id or orderNumber
    let order = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id);
    }
    if (!order) {
      order = await Order.findOne({ orderNumber: id });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Role check: Admin can update anytime.
    // Customer can only update if 3D printing/fabrication has NOT started.
    const isAdmin = req.user && ["admin", "super_admin"].includes(req.user.role);
    const lockedStatuses = ["in_production", "shipped", "delivered", "cancelled"];

    if (!isAdmin && lockedStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "Reference photos are locked because 3D print fabrication is already in progress.",
        status: order.status,
      });
    }

    const idx = Number(itemIndex) || 0;
    if (!order.items || !order.items[idx]) {
      return res.status(400).json({
        success: false,
        message: `Order item index ${idx} does not exist`,
      });
    }

    const currentItem = order.items[idx];
    let existingPhotos = Array.isArray(currentItem.referencePhotos)
      ? [...currentItem.referencePhotos]
      : currentItem.referencePhotoUrl
      ? [currentItem.referencePhotoUrl]
      : [];

    // If new files were uploaded with this multipart request:
    const newFiles = req.files || (req.file ? [req.file] : []);
    const newPhotoUrls = newFiles.map((file) => `/uploads/orders/${file.filename}`);

    // If client sent an array or string of photos in body:
    let bodyPhotos = [];
    if (req.body.photos) {
      if (typeof req.body.photos === "string") {
        try {
          bodyPhotos = JSON.parse(req.body.photos);
        } catch {
          bodyPhotos = [req.body.photos];
        }
      } else if (Array.isArray(req.body.photos)) {
        bodyPhotos = req.body.photos;
      }
    }

    if (action === "remove" && removedUrl) {
      existingPhotos = existingPhotos.filter((p) => p !== removedUrl);
    } else if (action === "replace" && (bodyPhotos.length > 0 || newPhotoUrls.length > 0)) {
      existingPhotos = [...bodyPhotos, ...newPhotoUrls];
    } else {
      // Default: append / merge
      existingPhotos = Array.from(
        new Set([...existingPhotos, ...bodyPhotos, ...newPhotoUrls])
      ).filter(Boolean);
    }

    // Update item
    currentItem.referencePhotos = existingPhotos;
    currentItem.referencePhotoUrl = existingPhotos[0] || null;
    currentItem.hasPhoto = existingPhotos.length > 0;

    order.markModified("items");
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order reference photos updated successfully",
      order,
      item: currentItem,
    });
  } catch (error) {
    console.error("Error updating order photos:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update order photos",
      error: error.message,
    });
  }
};

