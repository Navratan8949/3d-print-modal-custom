const nodemailer = require("nodemailer");

/**
 * Singleton Nodemailer Transporter with Connection Pooling
 */
let cachedTransporter = null;

const getTransporter = () => {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = (process.env.SMTP_USER || "prime3dprintinglab@gmail.com").trim();
  const pass = (process.env.SMTP_PASS || "ordfiripqxfgclfk").replace(/\s+/g, "");

  cachedTransporter = nodemailer.createTransport({
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  return cachedTransporter;
};

const getSenderDetails = () => {
  const fromName = process.env.SMTP_FROM_NAME || "Prime 3D Printing Lab";
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "prime3dprintinglab@gmail.com";
  return `"${fromName}" <${fromEmail}>`;
};

/**
 * Non-blocking Background Email Dispatcher
 * Executes the email task via setImmediate without delaying HTTP responses
 */
const sendInBackground = (fn, label = "Email Task") => {
  setImmediate(async () => {
    try {
      const startTime = Date.now();
      await fn();
      console.log(`[EMAIL DISPATCHED] ${label} completed in ${Date.now() - startTime}ms.`);
    } catch (err) {
      console.error(`[EMAIL ERROR] ${label} encountered an issue:`, err.message);
    }
  });
};

exports.sendInBackground = sendInBackground;

/**
 * 1. Welcome Email on User Registration
 */
exports.sendWelcomeEmail = async (user) => {
  try {
    const transporter = getTransporter();
    const from = getSenderDetails();

    const html = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #faf8f5; border: 1px solid #e7e5e4; border-radius: 16px; overflow: hidden;">
        <div style="background-color: #1c1917; padding: 28px 24px; text-align: center;">
          <h1 style="color: #f59e0b; font-size: 24px; margin: 0; font-weight: 700; letter-spacing: 0.5px;">PRIME 3D PRINTING LAB</h1>
          <p style="color: #a8a29e; font-size: 13px; margin: 6px 0 0;">Precision Custom 3D Creations & Artisan Models</p>
        </div>
        <div style="padding: 32px 28px; color: #292524;">
          <h2 style="font-size: 20px; color: #1c1917; margin-top: 0;">Welcome, ${user.name}! 👋</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #57534e;">
            Thank you for creating an account with Prime 3D Printing Lab. You are now part of our community of custom 3D art enthusiasts, collectors, and creators.
          </p>
          <div style="background-color: #ffffff; border: 1px solid #e7e5e4; border-radius: 12px; padding: 18px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #44403c;">
              <strong>Account Email:</strong> ${user.email}<br/>
              <strong>Registered Mobile:</strong> ${user.phone || "Not specified"}
            </p>
          </div>
          <p style="font-size: 14px; line-height: 1.6; color: #57534e;">
            You can now view your custom orders, track manufacturing progress, and get quick WhatsApp assistance for your personalized 3D miniature figurines, sacred idols, and desk decors.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/shop" style="display: inline-block; background-color: #d97706; color: #ffffff; padding: 12px 28px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px;">
              Explore 3D Catalog
            </a>
          </div>
        </div>
        <div style="background-color: #f5f5f4; border-top: 1px solid #e7e5e4; padding: 18px; text-align: center; font-size: 12px; color: #78716c;">
          Prime 3D Printing Lab • WhatsApp: +91 6376145171 • Email: prime3dprintinglab@gmail.com
        </div>
      </div>
    `;

    return await transporter.sendMail({
      from,
      to: user.email,
      subject: "Welcome to Prime 3D Printing Lab!",
      html,
    });
  } catch (error) {
    console.error("Welcome email error:", error.message);
    throw error;
  }
};

/**
 * 2. Password Reset OTP Email
 */
exports.sendPasswordResetEmail = async (email, otp, resetToken, userName = "User") => {
  try {
    const transporter = getTransporter();
    const from = getSenderDetails();
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const html = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #faf8f5; border: 1px solid #e7e5e4; border-radius: 16px; overflow: hidden;">
        <div style="background-color: #1c1917; padding: 28px 24px; text-align: center;">
          <h1 style="color: #f59e0b; font-size: 24px; margin: 0; font-weight: 700;">PRIME 3D PRINTING LAB</h1>
          <p style="color: #a8a29e; font-size: 13px; margin: 6px 0 0;">Password Reset Request</p>
        </div>
        <div style="padding: 32px 28px; color: #292524;">
          <h2 style="font-size: 18px; color: #1c1917; margin-top: 0;">Hello ${userName},</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #57534e;">
            We received a request to reset your password for Prime 3D Printing Lab. Use the 6-digit verification code below to reset your password:
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <div style="display: inline-block; background-color: #fef3c7; border: 2px dashed #d97706; padding: 14px 32px; border-radius: 12px; font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #b45309;">
              ${otp}
            </div>
            <p style="font-size: 12px; color: #78716c; margin-top: 8px;">This code will expire in 15 minutes.</p>
          </div>
          <div style="text-align: center; margin: 24px 0;">
            <p style="font-size: 13px; color: #78716c; margin-bottom: 12px;">Or click the button below to reset directly:</p>
            <a href="${resetUrl}" style="display: inline-block; background-color: #1c1917; color: #ffffff; padding: 12px 24px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px;">
              Reset My Password
            </a>
          </div>
          <p style="font-size: 12px; line-height: 1.5; color: #a8a29e; margin-top: 24px; border-top: 1px solid #e7e5e4; padding-top: 16px;">
            If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
          </p>
        </div>
        <div style="background-color: #f5f5f4; border-top: 1px solid #e7e5e4; padding: 18px; text-align: center; font-size: 12px; color: #78716c;">
          Prime 3D Printing Lab • WhatsApp: +91 6376145171
        </div>
      </div>
    `;

    return await transporter.sendMail({
      from,
      to: email,
      subject: `Prime 3D: Your Password Reset Code is ${otp}`,
      html,
    });
  } catch (error) {
    console.error("Password reset email error:", error.message);
    throw error;
  }
};

/**
 * 3. Security Alert on Password Changed
 */
exports.sendPasswordChangedEmail = async (email, userName = "Customer") => {
  try {
    const transporter = getTransporter();
    const from = getSenderDetails();

    const html = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #faf8f5; border: 1px solid #e7e5e4; border-radius: 16px; overflow: hidden;">
        <div style="background-color: #1c1917; padding: 24px; text-align: center;">
          <h1 style="color: #f59e0b; font-size: 22px; margin: 0; font-weight: 700;">SECURITY NOTIFICATION</h1>
        </div>
        <div style="padding: 28px 24px; color: #292524;">
          <h2 style="font-size: 18px; color: #1c1917; margin-top: 0;">Hello ${userName},</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #57534e;">
            Your Prime 3D Printing Lab account password was successfully updated on <strong>${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</strong>.
          </p>
          <div style="background: #f0fdf4; border: 1px solid #86efac; padding: 14px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 13px; color: #15803d;">
              ✔ If you made this change, no further action is required.
            </p>
          </div>
          <p style="font-size: 13px; line-height: 1.5; color: #b91c1c;">
            If you did NOT change your password, please contact our support team immediately on WhatsApp (+91 6376145171) or email us at prime3dprintinglab@gmail.com.
          </p>
        </div>
      </div>
    `;

    return await transporter.sendMail({
      from,
      to: email,
      subject: "Security Alert: Your Prime 3D Password Has Been Changed",
      html,
    });
  } catch (error) {
    console.error("Password changed alert error:", error.message);
    throw error;
  }
};

/**
 * 4. New Order Alert (Admin) + Order Confirmation (Customer)
 */
exports.sendOrderEmails = async (order) => {
  try {
    const transporter = getTransporter();
    const from = getSenderDetails();
    const adminEmail = process.env.ADMIN_EMAIL || "prime3dprintinglab@gmail.com";

    const itemsHtml = (order.items || [])
      .map(
        (item) => `
        <tr style="border-bottom: 1px solid #e7e5e4;">
          <td style="padding: 12px 8px; font-size: 14px; color: #1c1917;">
            <strong>${item.name}</strong>
            ${
              item.customization && Object.keys(item.customization).length > 0
                ? `<div style="font-size: 12px; color: #78716c; margin-top: 4px;">
                    ${Object.entries(item.customization)
                      .map(([k, v]) => `• ${k}: ${v}`)
                      .join("<br/>")}
                   </div>`
                : ""
            }
            ${item.hasPhoto ? `<div style="font-size: 11px; color: #d97706; font-weight: bold; margin-top: 4px;">📸 Reference Photo Attached / Shared</div>` : ""}
          </td>
          <td style="padding: 12px 8px; font-size: 14px; text-align: center; color: #44403c;">${item.quantity}</td>
          <td style="padding: 12px 8px; font-size: 14px; text-align: right; color: #1c1917; font-weight: 600;">₹${item.price}</td>
        </tr>
      `
      )
      .join("");

    // 1. Admin Email
    const adminHtml = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e7e5e4; border-radius: 16px; overflow: hidden;">
        <div style="background-color: #d97706; padding: 24px; color: #ffffff; text-align: center;">
          <h1 style="font-size: 22px; margin: 0; font-weight: bold;">🚨 NEW 3D PRINTING ORDER!</h1>
          <p style="margin: 6px 0 0; font-size: 14px;">Order #${order.orderNumber}</p>
        </div>
        <div style="padding: 24px;">
          <h3 style="color: #1c1917; margin-top: 0;">Customer Information</h3>
          <p style="font-size: 14px; line-height: 1.6; color: #44403c; background: #faf8f5; padding: 14px; border-radius: 8px;">
            <strong>Name:</strong> ${order.customer.name}<br/>
            <strong>Phone / WhatsApp:</strong> <a href="https://wa.me/${order.customer.phone.replace(/[^0-9]/g, '')}">${order.customer.phone}</a><br/>
            <strong>Email:</strong> ${order.customer.email || "Not provided"}<br/>
            <strong>Delivery Address:</strong> ${order.customer.address}, ${order.customer.city}, ${order.customer.state} - ${order.customer.pincode}<br/>
            ${order.customer.notes ? `<strong>Notes:</strong> ${order.customer.notes}` : ""}
          </p>

          <h3 style="color: #1c1917; margin-top: 20px;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f5f5f4; text-align: left; font-size: 12px; color: #78716c;">
                <th style="padding: 8px;">Item</th>
                <th style="padding: 8px; text-align: center;">Qty</th>
                <th style="padding: 8px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 12px 8px; text-align: right; font-weight: bold; font-size: 15px;">Total Amount:</td>
                <td style="padding: 12px 8px; text-align: right; font-weight: bold; font-size: 16px; color: #d97706;">₹${order.totalAmount}</td>
              </tr>
            </tfoot>
          </table>

          <div style="margin-top: 24px; text-align: center;">
            <a href="https://wa.me/${order.customer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello ' + order.customer.name + '! Thank you for your Prime 3D order #' + order.orderNumber + '. We have received your order.')}" style="background-color: #25D366; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
              💬 Chat with Customer on WhatsApp
            </a>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from,
      to: adminEmail,
      subject: `🚨 New Order #${order.orderNumber} from ${order.customer.name} (₹${order.totalAmount})`,
      html: adminHtml,
    });

    // 2. Customer Email (if provided)
    if (order.customer && order.customer.email && order.customer.email.includes("@")) {
      const customerHtml = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #faf8f5; border: 1px solid #e7e5e4; border-radius: 16px; overflow: hidden;">
          <div style="background-color: #1c1917; padding: 28px 24px; text-align: center;">
            <h1 style="color: #f59e0b; font-size: 22px; margin: 0; font-weight: 700;">PRIME 3D PRINTING LAB</h1>
            <p style="color: #a8a29e; font-size: 13px; margin: 6px 0 0;">Order Confirmation #${order.orderNumber}</p>
          </div>
          <div style="padding: 28px 24px; color: #292524;">
            <h2 style="font-size: 18px; color: #1c1917; margin-top: 0;">Thank you for your order, ${order.customer.name}! 🎉</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #57534e;">
              We have received your custom 3D printing order. Our team will review your specifications, prepare the 3D print slicing, and reach out to you via WhatsApp to finalize print previews and dispatch.
            </p>
            <h3 style="color: #1c1917; font-size: 15px; margin-top: 20px;">Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr style="background-color: #f5f5f4; text-align: left; font-size: 12px; color: #78716c;">
                  <th style="padding: 8px;">Item</th>
                  <th style="padding: 8px; text-align: center;">Qty</th>
                  <th style="padding: 8px; text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 12px 8px; text-align: right; font-weight: bold;">Total Estimate:</td>
                  <td style="padding: 12px 8px; text-align: right; font-weight: bold; color: #d97706;">₹${order.totalAmount}</td>
                </tr>
              </tfoot>
            </table>

            <div style="margin-top: 24px; background: #ffffff; padding: 16px; border-radius: 8px; border: 1px solid #e7e5e4;">
              <p style="margin: 0; font-size: 13px; color: #57534e; line-height: 1.5;">
                <strong>Delivery Address:</strong><br/>
                ${order.customer.address}, ${order.customer.city}, ${order.customer.state} - ${order.customer.pincode}
              </p>
            </div>

            <div style="text-align: center; margin: 28px 0;">
              <a href="https://wa.me/916376145171?text=${encodeURIComponent('Hello Prime3D! Inquiring about my Order #' + order.orderNumber)}" style="background-color: #25D366; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
                💬 Track / Connect on WhatsApp
              </a>
            </div>
          </div>
          <div style="background-color: #f5f5f4; border-top: 1px solid #e7e5e4; padding: 16px; text-align: center; font-size: 12px; color: #78716c;">
            Prime 3D Printing Lab • +91 6376145171 • prime3dprintinglab@gmail.com
          </div>
        </div>
      `;

      await transporter.sendMail({
        from,
        to: order.customer.email,
        subject: `Your Prime 3D Order #${order.orderNumber} has been received!`,
        html: customerHtml,
      });
    }

    return true;
  } catch (error) {
    console.error("Order email error:", error.message);
    throw error;
  }
};

/**
 * 5. Order Status Update Email (Customer)
 */
exports.sendOrderStatusEmail = async (order) => {
  try {
    if (!order.customer || !order.customer.email) return null;
    const transporter = getTransporter();
    const from = getSenderDetails();

    const statusLabels = {
      pending: "Received / Under Review",
      confirmed: "Confirmed & Scheduled",
      in_production: "Processing / In Production 📦",
      shipped: "Shipped & In Transit 📦",
      delivered: "Delivered Successfully 🎉",
      cancelled: "Order Cancelled",
    };

    const statusTitle = statusLabels[order.status] || order.status.toUpperCase();

    const html = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #faf8f5; border: 1px solid #e7e5e4; border-radius: 16px; overflow: hidden;">
        <div style="background-color: #1c1917; padding: 24px; text-align: center;">
          <h1 style="color: #f59e0b; font-size: 22px; margin: 0; font-weight: bold;">ORDER STATUS UPDATE</h1>
          <p style="color: #a8a29e; font-size: 13px; margin: 6px 0 0;">Order #${order.orderNumber}</p>
        </div>
        <div style="padding: 28px 24px; color: #292524;">
          <h2 style="font-size: 18px; color: #1c1917; margin-top: 0;">Hello ${order.customer.name},</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #57534e;">
            Your order status has been updated to:
          </p>
          <div style="background: #fef3c7; border: 1px solid #d97706; padding: 14px; border-radius: 8px; text-align: center; margin: 16px 0;">
            <strong style="color: #b45309; font-size: 18px;">${statusTitle}</strong>
          </div>
          ${
            order.tracking && order.tracking.trackingNumber
              ? `<div style="background: #ffffff; border: 1px solid #e7e5e4; padding: 14px; border-radius: 8px; margin: 16px 0;">
                  <strong style="color: #1c1917; font-size: 14px;">Courier Tracking Info:</strong><br/>
                  <span style="font-size: 13px; color: #57534e;">Courier: ${order.tracking.courierName || 'Standard Express'}</span><br/>
                  <span style="font-size: 13px; color: #57534e;">AWB / Tracking #: ${order.tracking.trackingNumber}</span><br/>
                  ${order.tracking.trackingUrl ? `<a href="${order.tracking.trackingUrl}" style="color: #d97706; font-size: 13px;">Click to Track Consignment &rarr;</a>` : ''}
                </div>`
              : ""
          }
          ${
            order.adminNotes
              ? `<p style="font-size: 13px; color: #78716c; background: #f5f5f4; padding: 12px; border-radius: 6px;">
                  <strong>Note from Studio:</strong> ${order.adminNotes}
                </p>`
              : ""
          }
          <div style="text-align: center; margin-top: 24px;">
            <a href="https://wa.me/916376145171?text=${encodeURIComponent('Hello! Checking update on Order #' + order.orderNumber)}" style="background-color: #25D366; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
              Contact Support on WhatsApp
            </a>
          </div>
        </div>
      </div>
    `;

    return await transporter.sendMail({
      from,
      to: order.customer.email,
      subject: `Order #${order.orderNumber} Update: ${statusTitle}`,
      html,
    });
  } catch (error) {
    console.error("Order status update email error:", error.message);
    throw error;
  }
};

/**
 * 6. Contact Form Inquiries (Admin Alert + Customer Acknowledgment)
 */
exports.sendContactInquiryEmails = async ({ name, email, phone, subject, message }) => {
  try {
    const transporter = getTransporter();
    const from = getSenderDetails();
    const adminEmail = process.env.ADMIN_EMAIL || "prime3dprintinglab@gmail.com";

    const adminHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e7e5e4; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #1c1917; padding: 20px; color: #f59e0b; text-align: center;">
          <h2 style="margin: 0;">New Website Inquiry Received</h2>
        </div>
        <div style="padding: 24px; color: #292524;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Phone:</strong> <a href="https://wa.me/${phone.replace(/[^0-9]/g, '')}">${phone}</a></p>
          <p><strong>Email:</strong> ${email || "Not specified"}</p>
          <p><strong>Subject:</strong> ${subject || "General Inquiry"}</p>
          <p><strong>Message:</strong></p>
          <div style="background-color: #f5f5f4; padding: 16px; border-radius: 8px; margin-top: 8px;">
            ${message}
          </div>
          <div style="text-align: center; margin-top: 24px;">
            <a href="https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello ' + name + '! Prime 3D Lab here responding to your inquiry.')}" style="background-color: #25D366; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Reply on WhatsApp
            </a>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from,
      to: adminEmail,
      subject: `📬 New Website Inquiry: ${subject || "General Inquiry"} from ${name}`,
      html: adminHtml,
    });

    if (email && email.includes("@")) {
      const customerAckHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e7e5e4; border-radius: 12px; padding: 24px;">
          <h2 style="color: #d97706; margin-top: 0;">Inquiry Received!</h2>
          <p>Hello ${name},</p>
          <p>Thank you for reaching out to Prime 3D Printing Lab regarding <strong>"${subject || 'your inquiry'}"</strong>. Our engineering and artisan team has received your message and will get back to you shortly via WhatsApp or email.</p>
          <p style="font-size: 13px; color: #78716c;">Prime 3D Printing Lab • +91 6376145171</p>
        </div>
      `;
      await transporter.sendMail({
        from,
        to: email,
        subject: "We have received your message – Prime 3D Printing Lab",
        html: customerAckHtml,
      });
    }

    return true;
  } catch (error) {
    console.error("Contact inquiry email error:", error.message);
    throw error;
  }
};
