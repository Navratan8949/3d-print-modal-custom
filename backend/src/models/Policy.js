const mongoose = require("mongoose");

const policySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "default_policies",
    },
    termsAndConditions: {
      type: String,
      default: `## Terms & Conditions - Prime 3D World

Welcome to Prime 3D World (prime3dworld.in). By placing an order with us, you agree to the following terms:

1. **Custom 3D Printing & Fabrication:** All customized figurines, sacred idols, and personalized name models are printed on-order using high-density resin and eco-friendly polymers.
2. **Photo Likeness Guarantee:** For custom face miniatures, our digital artists sculpt models based on your uploaded photos. Production begins only after model verification.
3. **Turnaround & Dispatch:** Standard fabrication takes 2-4 working days. Express domestic courier delivery takes 3-6 business days across India.
4. **Accuracy of Information:** Customers are responsible for providing correct delivery addresses, phone numbers, and high-resolution reference photos.
5. **Pricing & Taxes:** All prices listed in INR include applicable GST. Courier delivery charges are displayed clearly at checkout.`,
    },
    privacyPolicy: {
      type: String,
      default: `## Privacy Policy - Prime 3D World

At Prime 3D World, your privacy and trust are our top priorities:

1. **Customer Photos & Files:** Any personal photographs, face references, or 3D files uploaded by customers are used EXCLUSIVELY for the purpose of 3D modeling, sculpting, and printing your order. We NEVER sell, share, or publish customer personal photos without explicit written consent.
2. **Personal Data:** We collect your name, phone number, shipping address, and email solely to fulfill orders, send automated courier tracking updates via SMS/Email/WhatsApp, and provide customer support.
3. **Secure Payment Processing:** We do not store your credit card, debit card, or UPI credentials. All digital transactions are securely processed by Razorpay with bank-grade 128-bit encryption.
4. **Data Retention:** Reference photos are archived safely in encrypted storage during production and can be deleted upon customer request after successful delivery.`,
    },
    refundPolicy: {
      type: String,
      default: `## Cancellation & Refund Policy - Prime 3D World

Because each 3D print is uniquely personalized and custom-manufactured:

1. **Pre-Production Cancellation:** You may cancel your order within 6 hours of placement or before 3D digital sculpting/slicing has begun for a 100% full refund.
2. **Transit Damage Guarantee:** We pack all 3D sculptures with 5-layer shockproof protective cushioning. In the rare event your package arrives broken or damaged during transit, simply share an unboxing video or photo on WhatsApp within 48 hours. We will 3D print and dispatch a 100% free replacement immediately!
3. **Quality & Likeness:** If you have concerns about the finish or details, contact our artisan support team. We work with you to resolve any manufacturing defects.
4. **Non-Personalized Items:** For standard non-custom models, returns are accepted within 7 days of delivery in original packaging.`,
    },
    printOnOrderTitle: {
      type: String,
      default: "INCLUDES PRINT-ON-ORDER ITEMS",
    },
    printOnOrderNotice: {
      type: String,
      default: "Production begins after payment. Each item's staff-provided estimate is shown in your cart.",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Policy", policySchema);
