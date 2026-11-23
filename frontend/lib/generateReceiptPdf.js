import { jsPDF } from "jspdf";

/**
 * Generates and downloads a clean, professional PDF receipt/invoice for an order.
 * @param {Object} order - Full order object from MongoDB/API
 */
export function generateReceiptPdf(order) {
  if (!order) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm
  let y = 14;

  // Colors
  const primaryColor = [24, 24, 27]; // stone-900
  const secondaryColor = [87, 83, 78]; // stone-600
  const accentAmber = [217, 119, 6]; // amber-600
  const emeraldColor = [16, 185, 129]; // emerald-500
  const lightBg = [249, 250, 251]; // stone-50
  const borderColor = [229, 231, 235]; // stone-200

  // 1. BRAND HEADER
  doc.setFillColor(...lightBg);
  doc.rect(margin, y, contentWidth, 24, "F");
  doc.setDrawColor(...borderColor);
  doc.rect(margin, y, contentWidth, 24, "D");

  // Studio Name & Tagline
  doc.setTextColor(...primaryColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("PRIME 3D STUDIO", margin + 6, y + 9);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...secondaryColor);
  doc.text(
    "Handcrafted Custom 3D Miniatures, Idols & Precision Fabrication",
    margin + 6,
    y + 14
  );
  doc.text(
    "Email: prime3dprintinglab@gmail.com  |  WhatsApp: +91 63761 45171",
    margin + 6,
    y + 19
  );

  // Document Badge on Right
  doc.setFillColor(...primaryColor);
  doc.roundedRect(pageWidth - margin - 54, y + 4, 48, 16, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("TAX INVOICE / RECEIPT", pageWidth - margin - 30, y + 10, {
    align: "center",
  });
  doc.setFontSize(7.5);
  doc.setTextColor(...accentAmber);
  doc.text(`ORIGINAL FOR RECIPIENT`, pageWidth - margin - 30, y + 16, {
    align: "center",
  });

  y += 30;

  // 2. ORDER META SUMMARY BAR
  doc.setDrawColor(...borderColor);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, "FD");

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      })
    : "N/A";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...secondaryColor);
  doc.text("ORDER #:", margin + 4, y + 6);
  doc.setTextColor(...primaryColor);
  doc.text(`${order.orderNumber || order._id}`, margin + 22, y + 6);

  doc.setTextColor(...secondaryColor);
  doc.text("DATE:", margin + 68, y + 6);
  doc.setTextColor(...primaryColor);
  doc.text(orderDate, margin + 79, y + 6);

  doc.setTextColor(...secondaryColor);
  doc.text("PAYMENT:", margin + 118, y + 6);
  const isPaid =
    order.paymentStatus === "completed" ||
    order.paymentStatus === "paid" ||
    order.status !== "pending";
  if (isPaid) {
    doc.setTextColor(...emeraldColor);
    doc.text("PAID (VERIFIED)", margin + 138, y + 6);
  } else {
    doc.setTextColor(...accentAmber);
    doc.text("PENDING / COD", margin + 138, y + 6);
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...secondaryColor);
  doc.text(
    `Payment Method: ${order.paymentMethod ? order.paymentMethod.toUpperCase() : "RAZORPAY / ONLINE"}`,
    margin + 4,
    y + 11
  );
  doc.text(
    `Fulfillment Status: ${(order.status || "CONFIRMED").toUpperCase()}`,
    margin + 118,
    y + 11
  );

  y += 20;

  // 3. TWO COLUMNS: CUSTOMER DETAILS & SHIPPING DETAILS
  const colWidth = (contentWidth - 6) / 2;

  // Left Box: Customer Info
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, y, colWidth, 32, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryColor);
  doc.text("BILLED TO / CUSTOMER", margin + 5, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...secondaryColor);
  doc.text(`Name: ${order.customer?.name || "Valued Customer"}`, margin + 5, y + 12);
  doc.text(`Phone: ${order.customer?.phone || "N/A"}`, margin + 5, y + 17);
  doc.text(`Email: ${order.customer?.email || "N/A"}`, margin + 5, y + 22);

  // Right Box: Shipping Address
  const rightX = margin + colWidth + 6;
  doc.setFillColor(...lightBg);
  doc.roundedRect(rightX, y, colWidth, 32, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryColor);
  doc.text("DELIVERY ADDRESS", rightX + 5, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...secondaryColor);

  const address = order.shippingAddress || {};
  const street = address.streetAddress || address.address || "Studio Dispatch";
  const cityState = `${address.city || ""} ${address.state ? ", " + address.state : ""}`.trim();
  const postal = address.postalCode ? `PIN: ${address.postalCode}` : "";

  doc.text(doc.splitTextToSize(`Street: ${street}`, colWidth - 10), rightX + 5, y + 12);
  doc.text(`${cityState} ${postal}`, rightX + 5, y + 22);
  if (address.country) {
    doc.text(`Country: ${address.country}`, rightX + 5, y + 27);
  }

  y += 38;

  // 4. ITEMS TABLE
  doc.setFillColor(...primaryColor);
  doc.rect(margin, y, contentWidth, 7, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("#", margin + 3, y + 5);
  doc.text("ITEM & CUSTOM 3D FABRICATION DETAILS", margin + 12, y + 5);
  doc.text("QTY", margin + 115, y + 5, { align: "center" });
  doc.text("UNIT PRICE (Rs.)", margin + 145, y + 5, { align: "right" });
  doc.text("TOTAL (Rs.)", margin + contentWidth - 3, y + 5, { align: "right" });

  y += 7;

  const items = order.items && order.items.length > 0
    ? order.items
    : [
        {
          name: order.productName || "Custom 3D Print Model",
          quantity: order.quantity || 1,
          price: order.totalAmount || 0,
        },
      ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  items.forEach((item, index) => {
    const isEven = index % 2 === 0;
    const itemQty = item.quantity || 1;
    const itemPrice = Number(item.price) || 0;
    const lineTotal = itemPrice * itemQty;

    // Item height depends on specifications text
    const itemName = item.name || item.product?.name || "Bespoke 3D Creation";
    const specsList = [];
    if (item.customizations) {
      Object.entries(item.customizations).forEach(([k, v]) => {
        if (v && typeof v === "string" && !v.startsWith("http")) {
          specsList.push(`${k}: ${v}`);
        }
      });
    }
    const specsText = specsList.length > 0 ? specsList.join(" | ") : "";

    const rowHeight = specsText ? 12 : 8;

    if (isEven) {
      doc.setFillColor(252, 252, 252);
      doc.rect(margin, y, contentWidth, rowHeight, "F");
    }
    doc.setDrawColor(...borderColor);
    doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

    // Number
    doc.setTextColor(...secondaryColor);
    doc.text(`${index + 1}`, margin + 3, y + 5);

    // Name & Specs
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text(doc.splitTextToSize(itemName, 95)[0], margin + 12, y + 5);

    if (specsText) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.8);
      doc.setTextColor(...secondaryColor);
      doc.text(doc.splitTextToSize(`Specs: ${specsText}`, 95)[0], margin + 12, y + 9.5);
      doc.setFontSize(8);
    }

    // Qty
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...primaryColor);
    doc.text(`${itemQty}`, margin + 115, y + 5, { align: "center" });

    // Unit Price
    doc.text(`Rs. ${itemPrice.toLocaleString("en-IN")}`, margin + 145, y + 5, { align: "right" });

    // Total
    doc.setFont("helvetica", "bold");
    doc.text(`Rs. ${lineTotal.toLocaleString("en-IN")}`, margin + contentWidth - 3, y + 5, {
      align: "right",
    });

    y += rowHeight;
  });

  // 5. FINANCIAL TOTALS BLOCK
  y += 4;
  const totalsX = margin + 105;
  const totalsWidth = contentWidth - 105;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...secondaryColor);
  doc.text("Subtotal:", totalsX + 4, y + 4);
  doc.setTextColor(...primaryColor);
  doc.text(
    `Rs. ${(order.subtotal || order.totalAmount || 0).toLocaleString("en-IN")}`,
    margin + contentWidth - 3,
    y + 4,
    { align: "right" }
  );

  y += 6;
  doc.setTextColor(...secondaryColor);
  doc.text("Pan-India Insured Packaging & Shipping:", totalsX + 4, y + 4);
  doc.setTextColor(...emeraldColor);
  doc.setFont("helvetica", "bold");
  doc.text(
    order.shippingCost && order.shippingCost > 0 ? `Rs. ${order.shippingCost}` : "FREE",
    margin + contentWidth - 3,
    y + 4,
    { align: "right" }
  );

  y += 7;
  // Total Highlight Box
  doc.setFillColor(...primaryColor);
  doc.roundedRect(totalsX, y, totalsWidth, 10, 1.5, 1.5, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("TOTAL PAID / INVOICED:", totalsX + 4, y + 6.5);
  doc.setTextColor(...accentAmber);
  doc.setFontSize(10);
  doc.text(
    `Rs. ${(order.totalAmount || 0).toLocaleString("en-IN")}`,
    margin + contentWidth - 4,
    y + 6.5,
    { align: "right" }
  );

  y += 18;

  // 6. COURIER TRACKING (IF AVAILABLE)
  if (order.tracking && order.tracking.trackingNumber) {
    doc.setFillColor(243, 244, 246);
    doc.roundedRect(margin, y, contentWidth, 11, 1.5, 1.5, "F");
    doc.setDrawColor(...borderColor);
    doc.roundedRect(margin, y, contentWidth, 11, 1.5, 1.5, "D");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...primaryColor);
    doc.text(
      `DISPATCH LOGISTICS:  Courier: ${order.tracking.courierName || "Express Courier"}   |   AWB / Tracking #: ${order.tracking.trackingNumber}`,
      margin + 4,
      y + 7
    );
    y += 16;
  }

  // 7. FOOTER & POLICIES
  doc.setDrawColor(...borderColor);
  doc.line(margin, y, margin + contentWidth, y);
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryColor);
  doc.text("100% TRANSIT DAMAGE REPLACEMENT GUARANTEE", margin, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(...secondaryColor);
  y += 4;
  doc.text(
    "All Prime 3D bespoke sculptures are packaged with 5-layer shockproof protective cushioning.",
    margin,
    y
  );
  y += 3.5;
  doc.text(
    "If your creation arrives damaged, share an unboxing video on WhatsApp (+91 63761 45171) within 48 hours for a free replacement.",
    margin,
    y
  );

  y += 6;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(6.5);
  doc.text(
    "This is a computer-generated invoice from Prime 3D Studio and does not require an ink signature.",
    margin,
    y
  );

  // Trigger Save / Download
  const filename = `Receipt-Prime3D-${order.orderNumber || "Order"}.pdf`;
  doc.save(filename);
}
