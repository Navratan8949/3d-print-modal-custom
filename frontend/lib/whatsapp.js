/**
 * Prime3Dworld WhatsApp Integration Utility
 * WhatsApp Business Number: +91 6376145171
 */

export const WHATSAPP_PHONE_NUMBER = "916376145171";
export const DISPLAY_PHONE_NUMBER = "+91 6376145171";
export const BRAND_EMAIL = "prime3dprintinglab@gmail.com";

/**
 * Generate a pre-filled WhatsApp link for a single product inquiry/order
 */
export function createProductWhatsAppUrl({
  productName,
  productUrl = "",
  quantity = 1,
  customerName = "",
  customerPhone = "",
  customizationDetails = {},
  notes = "",
  hasPhotoUpload = false,
}) {
  let message = `Hello Prime3Dworld!\n\n`;
  message += `I want to order the following 3D creation:\n\n`;
  message += `📦 *Product:* ${productName}\n`;
  if (productUrl) {
    message += `🔗 *Product Link:* ${productUrl}\n`;
  }
  message += `🔢 *Quantity:* ${quantity}\n`;

  if (customerName) {
    message += `👤 *Customer Name:* ${customerName}\n`;
  }
  if (customerPhone) {
    message += `📱 *Contact Number:* ${customerPhone}\n`;
  }

  // Format customization details
  const detailKeys = Object.keys(customizationDetails);
  if (detailKeys.length > 0) {
    message += `\n✨ *Customization Details:*\n`;
    detailKeys.forEach((key) => {
      const val = customizationDetails[key];
      if (val) {
        message += `  • ${key}: ${val}\n`;
      }
    });
  }

  if (notes) {
    message += `\n📝 *Special Instructions:* ${notes}\n`;
  }

  if (hasPhotoUpload) {
    message += `\n📸 *Reference Photo:* I am attaching my high-resolution reference photo right here in this chat.\n`;
  }

  message += `\nPlease confirm pricing quote, manufacturing time, and payment details.\n\nThank you!`;

  return `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate a WhatsApp order URL for an entire shopping cart
 */
export function createCartWhatsAppUrl(cartItems, customerInfo = {}) {
  let message = `Hello Prime3Dworld!\n\n`;
  message += `🛍️ *NEW 3D PRINTING ORDER INQUIRY*\n`;
  message += `==============================\n\n`;

  cartItems.forEach((item, index) => {
    message += `*Item ${index + 1}: ${item.name}*\n`;
    message += `• Quantity: ${item.quantity}\n`;
    message += `• Price: ${item.priceLabel || "Custom Quote"}\n`;

    if (item.customization && Object.keys(item.customization).length > 0) {
      const customLines = Object.entries(item.customization)
        .filter(([, v]) => Boolean(v))
        .map(([k, v]) => `  - ${k}: ${v}`)
        .join("\n");
      if (customLines) {
        message += `• Specs:\n${customLines}\n`;
      }
    }
    if (item.hasPhoto) {
      message += `• Photo: Will attach reference photo in chat\n`;
    }
    message += `\n`;
  });

  message += `==============================\n`;
  message += `📍 *DELIVERY & CUSTOMER DETAILS*\n`;
  message += `==============================\n`;

  if (customerInfo.name) {
    message += `👤 *Full Name:* ${customerInfo.name}\n`;
  }
  if (customerInfo.phone) {
    message += `📱 *Phone / WhatsApp:* ${customerInfo.phone}\n`;
  }
  if (customerInfo.email) {
    message += `📧 *Email:* ${customerInfo.email}\n`;
  }
  if (customerInfo.address) {
    message += `🏠 *Delivery Address:* ${customerInfo.address}\n`;
  }
  if (customerInfo.city || customerInfo.state || customerInfo.pincode) {
    const locParts = [
      customerInfo.city,
      customerInfo.state,
      customerInfo.pincode ? `PIN: ${customerInfo.pincode}` : ""
    ].filter(Boolean);
    message += `📍 *City / State / Pincode:* ${locParts.join(", ")}\n`;
  }
  if (customerInfo.notes) {
    message += `📝 *Order Instructions:* ${customerInfo.notes}\n`;
  }

  const anyPhoto = cartItems.some((item) => item.hasPhoto);
  if (anyPhoto) {
    message += `\n📸 *Important:* I have customized photo figurine(s) in this order and am uploading the original reference photos directly in this chat.\n`;
  }

  message += `\nPlease calculate the total amount including shipping and share the next steps.\n\nThank you!`;

  return `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate a general inquiry WhatsApp URL
 */
export function createGeneralInquiryUrl(topic = "General Inquiry") {
  const message = `Hello Prime3Dworld!\n\nI have a question regarding: ${topic}.\nPlease let me know how I can explore custom 3D printing with you.\n\nThank you!`;
  return `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate a contact form submission WhatsApp URL
 */
export function createContactSubmissionUrl({ name, email, phone, subject, message: userMsg }) {
  let message = `Hello Prime3Dworld!\n\n`;
  message += `📬 *NEW WEBSITE INQUIRY*\n`;
  message += `=====================\n`;
  message += `👤 *Name:* ${name}\n`;
  message += `📱 *Phone:* ${phone}\n`;
  message += `📧 *Email:* ${email || "Not provided"}\n`;
  message += `📌 *Subject:* ${subject || "General Inquiry"}\n`;
  message += `💬 *Message:* ${userMsg}\n\n`;
  message += `Looking forward to your swift response!`;

  return `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
}
