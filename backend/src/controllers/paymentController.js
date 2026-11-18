const crypto = require("crypto");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { razorpay, keyId, keySecret, webhookSecret } = require("../config/razorpay");
const { sendOrderEmails, sendInBackground } = require("../utils/sendMail");

const WHATSAPP_PHONE = process.env.WHATSAPP_PHONE || "916376145171";

// Helper to generate human-readable order number
const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `P3D-${dateStr}-${randomSuffix}`;
};

// Helper to generate WhatsApp order message
const generateWhatsAppUrl = (order) => {
  let msg = `Hello Prime3Dworld!\n\n`;
  msg += `🛍️ *3D PRINTING ORDER* #${order.orderNumber}\n`;
  msg += `💳 *Payment:* ${order.paymentStatus.toUpperCase()} via Razorpay\n`;
  if (order.razorpayPaymentId) msg += `🔑 *Payment ID:* ${order.razorpayPaymentId}\n`;
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
      msg += `• Photo: Reference photo attached\n`;
    }
    msg += `\n`;
  });

  msg += `==============================\n`;
  msg += `📍 *CUSTOMER & DELIVERY DETAILS*\n`;
  msg += `👤 *Name:* ${order.customer.name}\n`;
  msg += `📱 *Phone:* ${order.customer.phone}\n`;
  if (order.customer.email) msg += `📧 *Email:* ${order.customer.email}\n`;
  msg += `🏠 *Address:* ${order.customer.address}, ${order.customer.city}, ${order.customer.state} - ${order.customer.pincode}\n`;
  if (order.customer.notes) msg += `📝 *Notes:* ${order.customer.notes}\n`;

  msg += `\n💰 *Total Paid:* ₹${order.totalAmount}\n`;
  msg += `\nPayment confirmed via Razorpay. Please proceed with 3D manufacturing & dispatch updates.\nThank you!`;

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
};

/**
 * 1. CREATE RAZORPAY ORDER
 * POST /api/payment/create-order
 */
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { orderId, customer, items, totalAmount, notes } = req.body;

    let order = null;

    if (orderId) {
      // Existing order
      order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Existing order not found",
        });
      }
    } else {
      // Create new Order record in DB first
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

      // Calculate total amount
      const calculatedTotal =
        Number(totalAmount) ||
        parsedItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);

      const orderNumber = generateOrderNumber();

      order = new Order({
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
          notes: (customer.notes || notes || "").trim(),
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
        orderSource: "web",
        paymentMethod: "razorpay",
        status: "pending",
        paymentStatus: "pending",
      });

      await order.save();
    }

    // Razorpay amount is in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(Number(order.totalAmount) * 100);

    if (amountInPaise < 100) {
      return res.status(400).json({
        success: false,
        message: "Order amount must be at least ₹1.00 for online payment",
      });
    }

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: order.orderNumber,
      notes: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        customerName: order.customer.name,
        customerPhone: order.customer.phone,
      },
    };

    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: "Razorpay payment gateway is not initialized on the server. Please check credentials.",
      });
    }

    const razorpayOrder = await razorpay.orders.create(options);

    // Save razorpayOrderId to the Order in database
    order.razorpayOrderId = razorpayOrder.id;
    order.paymentMethod = "razorpay";
    await order.save();

    return res.status(200).json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: keyId,
      customer: order.customer,
      order,
    });
  } catch (error) {
    console.error("Create Razorpay Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to initialize Razorpay payment. Please try again.",
      error: error.message,
    });
  }
};

/**
 * 2. VERIFY RAZORPAY PAYMENT (CLIENT CALLBACK)
 * POST /api/payment/verify
 */
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing required Razorpay verification parameters",
      });
    }

    // Cryptographic signature check: HMAC SHA256 (order_id + "|" + payment_id, secret)
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isSignatureValid =
      expectedSignature.length === razorpay_signature.length &&
      crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpay_signature));

    if (!isSignatureValid) {
      console.error("❌ Invalid Razorpay Signature!");

      // Update order if found
      const failedOrder = await Order.findOne({
        $or: [{ _id: orderId }, { razorpayOrderId: razorpay_order_id }],
      });
      if (failedOrder) {
        failedOrder.paymentStatus = "failed";
        await failedOrder.save();
      }

      return res.status(400).json({
        success: false,
        message: "Payment verification failed: Invalid signature.",
      });
    }

    // Find order
    let order = null;
    if (orderId) {
      order = await Order.findById(orderId);
    }
    if (!order) {
      order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found for verification",
      });
    }

    // Fetch full payment details from Razorpay for auditing
    let paymentDetails = null;
    try {
      paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
    } catch (e) {
      console.warn("Could not fetch full payment details from Razorpay:", e.message);
    }

    // Update order status to paid & confirmed
    order.paymentStatus = "paid";
    order.status = "confirmed";
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    if (paymentDetails) {
      order.paymentDetails = {
        id: paymentDetails.id,
        method: paymentDetails.method,
        amount: paymentDetails.amount,
        status: paymentDetails.status,
        email: paymentDetails.email,
        contact: paymentDetails.contact,
        vpa: paymentDetails.vpa || null,
        bank: paymentDetails.bank || null,
        wallet: paymentDetails.wallet || null,
        fee: paymentDetails.fee,
        tax: paymentDetails.tax,
        created_at: paymentDetails.created_at,
      };
    }

    // Update WhatsApp URL with payment confirmed message
    order.whatsappUrl = generateWhatsAppUrl(order);

    await order.save();

    // Trigger emails in background
    sendInBackground(async () => {
      await sendOrderEmails(order);
    }, `Order #${order.orderNumber} Payment Verified Emails`);

    return res.status(200).json({
      success: true,
      message: "Payment verified and order confirmed successfully!",
      order,
      whatsappUrl: order.whatsappUrl,
    });
  } catch (error) {
    console.error("Verify Razorpay Payment Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while verifying the payment.",
      error: error.message,
    });
  }
};

/**
 * 3. RAZORPAY WEBHOOK HANDLER
 * POST /api/payment/webhook
 * Handles asynchronous server-to-server callbacks from Razorpay
 */
exports.handleRazorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];

    if (!signature) {
      console.warn("⚠️ Webhook received without x-razorpay-signature header");
      return res.status(400).json({ success: false, message: "Missing signature header" });
    }

    // Get raw body buffer for bit-perfect HMAC verification
    const rawPayload = req.rawBody || Buffer.from(JSON.stringify(req.body));

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawPayload)
      .digest("hex");

    const isWebhookValid =
      signature.length === expectedSignature.length &&
      crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));

    if (!isWebhookValid) {
      console.error("❌ Razorpay Webhook signature verification failed!");
      return res.status(400).json({ success: false, message: "Invalid webhook signature" });
    }

    const event = req.body.event;
    console.log(`🔔 [RAZORPAY WEBHOOK] Event received: ${event}`);

    if (event === "payment.captured" || event === "order.paid" || event === "payment.authorized") {
      const paymentEntity = req.body?.payload?.payment?.entity;
      const orderEntity = req.body?.payload?.order?.entity;
      const rzpOrderId = paymentEntity?.order_id || orderEntity?.id;
      const paymentId = paymentEntity?.id;

      if (rzpOrderId) {
        const order = await Order.findOne({
          $or: [
            { razorpayOrderId: rzpOrderId },
            { _id: paymentEntity?.notes?.orderId },
          ],
        });

        if (order) {
          const wasAlreadyPaid = order.paymentStatus === "paid";
          order.paymentStatus = "paid";
          order.status = "confirmed";
          if (paymentId) order.razorpayPaymentId = paymentId;
          if (paymentEntity) {
            order.paymentDetails = {
              id: paymentEntity.id,
              method: paymentEntity.method,
              amount: paymentEntity.amount,
              status: paymentEntity.status,
              email: paymentEntity.email,
              contact: paymentEntity.contact,
              vpa: paymentEntity.vpa || null,
              created_at: paymentEntity.created_at,
            };
          }
          order.whatsappUrl = generateWhatsAppUrl(order);
          await order.save();

          console.log(`✅ [WEBHOOK] Order #${order.orderNumber} marked as PAID via ${event}`);

          if (!wasAlreadyPaid) {
            sendInBackground(async () => {
              await sendOrderEmails(order);
            }, `Webhook confirmation for Order #${order.orderNumber}`);
          }
        } else {
          console.warn(`⚠️ [WEBHOOK] Order not found for Razorpay Order ID: ${rzpOrderId}`);
        }
      }
    } else if (event === "payment.failed") {
      const paymentEntity = req.body?.payload?.payment?.entity;
      const rzpOrderId = paymentEntity?.order_id;

      if (rzpOrderId) {
        const order = await Order.findOne({ razorpayOrderId: rzpOrderId });
        if (order && order.paymentStatus !== "paid") {
          order.paymentStatus = "failed";
          order.paymentDetails = paymentEntity;
          await order.save();
          console.log(`⚠️ [WEBHOOK] Order #${order.orderNumber} marked as payment FAILED`);
        }
      }
    }

    // Acknowledge webhook receipt to Razorpay with 200 OK
    return res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Razorpay Webhook Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 4. GET PUBLIC KEY ID
 * GET /api/payment/key
 */
exports.getRazorpayKey = async (req, res) => {
  return res.status(200).json({
    success: true,
    key: keyId,
  });
};
