"use client";

import { useState } from "react";
import { Upload, X, Camera, MessageCircle, ShoppingBag, Check, AlertCircle, Phone, User, CheckCircle2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { createProductWhatsAppUrl } from "@/lib/whatsapp";

export default function CustomizationForm({ product }) {
  const { addToCart } = useCart();

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  // Figurine specific
  const [figurineType, setFigurineType] = useState(
    product.availableOptions?.types?.[0] || "Individual Portrait"
  );
  const [preferredSize, setPreferredSize] = useState(
    product.availableOptions?.sizes?.[0] || "Discuss with us"
  );
  const [baseStyle, setBaseStyle] = useState(
    product.availableOptions?.baseStyles?.[0] || "Natural Light Oak Base"
  );

  // Name model specific
  const [customText, setCustomText] = useState("");
  const [fontStyle, setFontStyle] = useState(
    product.availableOptions?.fontStyles?.[0] || "Modern Sans Block"
  );
  const [colorFinish, setColorFinish] = useState(
    product.availableOptions?.colorFinishes?.[0] || "Warm Ivory & Golden Amber"
  );

  // Decorative / Idols specific
  const [decorativeFinish, setDecorativeFinish] = useState(
    product.availableOptions?.finishes?.[0] || "Sacred Marble White"
  );

  // Photo uploads (Client-side object URLs for preview)
  const [primaryPhoto, setPrimaryPhoto] = useState(null);
  const [referencePhoto, setReferencePhoto] = useState(null);
  const [photoError, setPhotoError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [addedToast, setAddedToast] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const isFigurine = product.customizationType === "figurine";
  const isNameModel = product.customizationType === "nameModel";

  // Validate form
  const validateForm = (isDirectOrder = false) => {
    const errs = {};

    if (isNameModel) {
      if (!customText.trim()) {
        errs.customText = "Please enter the custom name or text you would like 3D printed.";
      } else if (customText.trim().length < 2) {
        errs.customText = "Name/Text must be at least 2 characters.";
      }
    }

    if (isDirectOrder) {
      if (!customerName.trim()) {
        errs.customerName = "Please enter your name.";
      }
      const cleanPhone = customerPhone.replace(/[\s-]/g, "");
      if (!cleanPhone) {
        errs.customerPhone = "Please enter your WhatsApp mobile number.";
      } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        errs.customerPhone = "Enter a valid 10-digit Indian mobile number.";
      }
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle local file selection
  const handlePhotoSelect = (e, isRef = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoError("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setPhotoError("File size exceeds 15MB. Please choose a smaller photo.");
      return;
    }

    setPhotoError("");
    const previewUrl = URL.createObjectURL(file);

    if (isRef) {
      setReferencePhoto({ file, previewUrl, name: file.name });
    } else {
      setPrimaryPhoto({ file, previewUrl, name: file.name });
    }
  };

  const removePhoto = (isRef = false) => {
    if (isRef) {
      if (referencePhoto?.previewUrl) URL.revokeObjectURL(referencePhoto.previewUrl);
      setReferencePhoto(null);
    } else {
      if (primaryPhoto?.previewUrl) URL.revokeObjectURL(primaryPhoto.previewUrl);
      setPrimaryPhoto(null);
    }
  };

  // Build customization payload
  const buildCustomizationDetails = () => {
    const details = {};

    if (isFigurine) {
      details["Figurine Type"] = figurineType;
      details["Preferred Size"] = preferredSize;
      details["Base Style"] = baseStyle;
      if (primaryPhoto) details["Primary Photo Attached"] = "Yes (Attaching in WhatsApp)";
      if (referencePhoto) details["Reference Photo"] = "Yes (Attaching in WhatsApp)";
    } else if (isNameModel) {
      details["Custom Name/Text"] = customText.trim() || "Not specified yet";
      details["Font Style"] = fontStyle;
      details["Color Finish"] = colorFinish;
      details["Size"] = preferredSize;
    } else {
      details["Finish / Style"] = decorativeFinish;
    }

    return details;
  };

  // Add to Bag handler
  const handleAddToBag = () => {
    if (!validateForm(false)) {
      return;
    }

    const customization = buildCustomizationDetails();
    addToCart(product, quantity, customization, Boolean(primaryPhoto || isFigurine));

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3500);
  };

  // WhatsApp Direct Order Handler
  const handleDirectWhatsApp = () => {
    if (!validateForm(true)) {
      return;
    }

    const customization = buildCustomizationDetails();
    const hasPhoto = Boolean(primaryPhoto || isFigurine);

    if (hasPhoto) {
      setShowPhotoModal(true);
    } else {
      proceedToWhatsApp(customization, false);
    }
  };

  const proceedToWhatsApp = (customization, hasPhoto) => {
    const url = createProductWhatsAppUrl({
      productName: product.name,
      quantity,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customizationDetails: customization || buildCustomizationDetails(),
      notes: notes.trim(),
      hasPhotoUpload: hasPhoto,
    });
    window.open(url, "_blank", "noopener,noreferrer");
    setShowPhotoModal(false);
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/90 shadow-xs space-y-6">
      <div className="border-b border-stone-100 pb-4">
        <h3 className="text-base font-semibold text-stone-900">
          Customize Your Creation
        </h3>
        <p className="text-xs text-stone-500 mt-0.5">
          Specify your preferences below. Final design and sizing are verified via WhatsApp.
        </p>
      </div>

      {/* Customer Contact Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="text-xs font-semibold text-stone-800 block mb-1">
            Your Name <span className="text-stone-400 font-normal">(Required for direct quote)</span>
          </label>
          <div className="relative">
            <User className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                if (formErrors.customerName) setFormErrors({ ...formErrors, customerName: "" });
              }}
              placeholder="e.g. Rahul Sharma"
              className={`w-full pl-8.5 pr-3 py-2 text-xs bg-stone-50 border rounded-lg focus:outline-none transition-colors ${
                formErrors.customerName
                  ? "border-red-500 bg-red-50/20"
                  : "border-stone-200 focus:border-amber-600 focus:bg-white"
              }`}
            />
          </div>
          {formErrors.customerName && (
            <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{formErrors.customerName}</span>
            </p>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold text-stone-800 block mb-1">
            WhatsApp Mobile No. <span className="text-stone-400 font-normal">(10 digits)</span>
          </label>
          <div className="relative">
            <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              maxLength={10}
              value={customerPhone}
              onChange={(e) => {
                setCustomerPhone(e.target.value.replace(/\D/g, ""));
                if (formErrors.customerPhone) setFormErrors({ ...formErrors, customerPhone: "" });
              }}
              placeholder="e.g. 9876543210"
              className={`w-full pl-8.5 pr-3 py-2 text-xs bg-stone-50 border rounded-lg focus:outline-none transition-colors tabular-nums ${
                formErrors.customerPhone
                  ? "border-red-500 bg-red-50/20"
                  : "border-stone-200 focus:border-amber-600 focus:bg-white"
              }`}
            />
          </div>
          {formErrors.customerPhone && (
            <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{formErrors.customerPhone}</span>
            </p>
          )}
        </div>
      </div>

      {/* Figurine Specific Options */}
      {isFigurine && (
        <div className="space-y-4 pt-2 border-t border-stone-100">
          <div>
            <label className="text-xs font-semibold text-stone-800 block mb-1.5">
              Figurine Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {product.availableOptions?.types?.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFigurineType(type)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg text-left transition-colors border ${
                    figurineType === type
                      ? "bg-amber-50 text-amber-900 border-amber-300 font-semibold shadow-2xs"
                      : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-800 block mb-1.5">
              Preferred Height / Scale
            </label>
            <select
              value={preferredSize}
              onChange={(e) => setPreferredSize(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600 focus:bg-white transition-colors"
            >
              {product.availableOptions?.sizes?.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-800 block mb-1.5">
              Base Pedestal Style
            </label>
            <select
              value={baseStyle}
              onChange={(e) => setBaseStyle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600 focus:bg-white transition-colors"
            >
              {product.availableOptions?.baseStyles?.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
          </div>

          {/* Photo Upload Section */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-stone-800">
                Reference Photograph
              </label>
              <span className="text-[11px] text-amber-700 font-medium">
                Preview stays local
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Primary Photo */}
              <div className="border-2 border-dashed border-stone-200 hover:border-amber-400 rounded-xl p-3 text-center transition-colors bg-stone-50">
                {primaryPhoto ? (
                  <div className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={primaryPhoto.previewUrl}
                      alt="Primary preview"
                      className="w-full h-28 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(false)}
                      className="absolute top-1.5 right-1.5 p-1 bg-stone-900/80 text-white rounded-full hover:bg-red-600 transition-colors"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <p className="text-[11px] text-stone-600 mt-1 truncate">
                      {primaryPhoto.name}
                    </p>
                  </div>
                ) : (
                  <label className="cursor-pointer block py-4">
                    <Upload className="w-6 h-6 text-stone-400 mx-auto mb-1.5" />
                    <span className="text-xs font-semibold text-stone-700 block">
                      Upload Main Photo
                    </span>
                    <span className="text-[10px] text-stone-500 block mt-0.5">
                      Front face / outfit reference
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoSelect(e, false)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Secondary Reference Photo */}
              <div className="border-2 border-dashed border-stone-200 hover:border-amber-400 rounded-xl p-3 text-center transition-colors bg-stone-50">
                {referencePhoto ? (
                  <div className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={referencePhoto.previewUrl}
                      alt="Secondary preview"
                      className="w-full h-28 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(true)}
                      className="absolute top-1.5 right-1.5 p-1 bg-stone-900/80 text-white rounded-full hover:bg-red-600 transition-colors"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <p className="text-[11px] text-stone-600 mt-1 truncate">
                      {referencePhoto.name}
                    </p>
                  </div>
                ) : (
                  <label className="cursor-pointer block py-4">
                    <Camera className="w-6 h-6 text-stone-400 mx-auto mb-1.5" />
                    <span className="text-xs font-semibold text-stone-700 block">
                      Optional Side View
                    </span>
                    <span className="text-[10px] text-stone-500 block mt-0.5">
                      Angle or hair detail
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoSelect(e, true)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {photoError && (
              <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{photoError}</span>
              </p>
            )}

            <div className="mt-2.5 flex items-start gap-2 text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded-lg border border-stone-200/70">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                To preserve raw image resolution, you will attach this original photograph directly into WhatsApp after the chat opens.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Name Model Specific Options */}
      {isNameModel && (
        <div className="space-y-4 pt-2 border-t border-stone-100">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-stone-800">
                Desired Name / Text <span className="text-red-600">*</span>
              </label>
              <span className="text-[10px] text-stone-400">
                {customText.length}/20 chars
              </span>
            </div>
            <input
              type="text"
              value={customText}
              onChange={(e) => {
                setCustomText(e.target.value);
                if (formErrors.customText) setFormErrors({ ...formErrors, customText: "" });
              }}
              placeholder="e.g. AARYAN, SHARMA, PRIME"
              maxLength={20}
              className={`w-full px-3.5 py-2 text-sm font-semibold tracking-wider uppercase bg-stone-50 border rounded-lg focus:outline-none transition-colors ${
                formErrors.customText
                  ? "border-red-500 bg-red-50/20"
                  : "border-stone-200 focus:border-amber-600 focus:bg-white"
              }`}
            />
            {formErrors.customText && (
              <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{formErrors.customText}</span>
              </p>
            )}
            <span className="text-[10px] text-stone-500 mt-1 block">
              Letters, numbers & symbols allowed
            </span>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-800 block mb-1.5">
              Typography Font Style
            </label>
            <select
              value={fontStyle}
              onChange={(e) => setFontStyle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600 focus:bg-white transition-colors"
            >
              {product.availableOptions?.fontStyles?.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-800 block mb-1.5">
              Color Palette / Finish
            </label>
            <select
              value={colorFinish}
              onChange={(e) => setColorFinish(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600 focus:bg-white transition-colors"
            >
              {product.availableOptions?.colorFinishes?.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Decorative / Idol Options */}
      {!isFigurine && !isNameModel && product.availableOptions?.finishes && (
        <div className="space-y-4 pt-2 border-t border-stone-100">
          <div>
            <label className="text-xs font-semibold text-stone-800 block mb-1.5">
              Sacred Finish / Material Option
            </label>
            <select
              value={decorativeFinish}
              onChange={(e) => setDecorativeFinish(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600 focus:bg-white transition-colors"
            >
              {product.availableOptions.finishes.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Quantity & Notes */}
      <div className="pt-2 border-t border-stone-100 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-stone-800">
            Quantity
          </label>
          <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-1.5 text-stone-600 hover:bg-stone-200/70 rounded-l text-sm font-semibold"
            >
              -
            </button>
            <span className="px-3 py-1 text-xs font-semibold text-stone-900 tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(50, q + 1))}
              className="px-3 py-1.5 text-stone-600 hover:bg-stone-200/70 rounded-r text-sm font-semibold"
            >
              +
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-stone-800 block">
            Special Instructions / Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Desired delivery deadline, packaging requests, or color adjustments"
            className="mt-1.5 w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 space-y-2.5">
        <button
          type="button"
          onClick={handleDirectWhatsApp}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition-all duration-200 active:scale-[0.99] cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          <span>Order This Creation on WhatsApp</span>
        </button>

        <button
          type="button"
          onClick={handleAddToBag}
          className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4 text-amber-400" />
          <span>Add Customization to Inquiry Bag</span>
        </button>
      </div>

      {/* Added to Bag Toast */}
      {addedToast && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Successfully added to your bag! Open bag above or go to Cart to checkout.</span>
        </div>
      )}

      {/* Photo Attachment Instruction Modal before WhatsApp launches */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-amber-50 text-amber-700">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-stone-900">
                  Ready to Chat on WhatsApp
                </h4>
                <p className="text-xs text-stone-500">
                  One quick step to ensure best figurine quality
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3.5 rounded-xl border border-stone-200">
              WhatsApp will open now with your order summary pre-filled. <strong>Please remember to attach your original photograph directly in the WhatsApp chat</strong> so our 3D sculpting artists have uncompressed reference detail.
            </p>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => proceedToWhatsApp(buildCustomizationDetails(), true)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Open WhatsApp Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
