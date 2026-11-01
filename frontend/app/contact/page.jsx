"use client";

import { useState } from "react";
import { Phone, Mail, MessageCircle, MapPin, Send, CheckCircle2, User, AlertCircle, FileText } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import { DISPLAY_PHONE_NUMBER, BRAND_EMAIL, createContactSubmissionUrl } from "@/lib/whatsapp";
import { contactAPI } from "@/lib/api";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const validateField = (field, value) => {
    switch (field) {
      case "name":
        if (!value.trim()) return "Full name is required.";
        if (value.trim().length < 3) return "Name must be at least 3 characters.";
        return "";
      case "phone":
        if (!value.trim()) return "Phone / WhatsApp number is required.";
        const clean = value.replace(/[\s-]/g, "");
        if (!/^[6-9]\d{9}$/.test(clean)) {
          return "Enter a valid 10-digit Indian mobile number.";
        }
        return "";
      case "email":
        if (value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return "Enter a valid email address.";
        }
        return "";
      case "subject":
        if (!value.trim()) return "Please specify the subject or project type.";
        return "";
      case "message":
        if (!value.trim()) return "Please describe your project or question.";
        if (value.trim().length < 10) return "Message must be at least 10 characters.";
        return "";
      default:
        return "";
    }
  };

  const errors = {
    name: validateField("name", form.name),
    phone: validateField("phone", form.phone),
    email: validateField("email", form.email),
    subject: validateField("subject", form.subject),
    message: validateField("message", form.message),
  };

  const isFormValid = !errors.name && !errors.phone && !errors.email && !errors.subject && !errors.message;

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setTouched({
      name: true,
      phone: true,
      email: true,
      subject: true,
      message: true,
    });

    if (!isFormValid) {
      return;
    }

    // Submit inquiry to backend Nodemailer email alert
    contactAPI.submit({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    }).catch((err) => console.warn("Contact email delivery warning:", err.message));

    const url = createContactSubmissionUrl({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    });

    window.open(url, "_blank", "noopener,noreferrer");
    setSubmitted(true);
  };

  const isFieldError = (field) => (touched[field] || submitAttempted) && Boolean(errors[field]);
  const isFieldValid = (field) => touched[field] && !errors[field] && Boolean(form[field]?.trim());

  return (
    <div className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <SectionHeading
        eyebrow="Get in Touch"
        title="We'd Love to Hear From You"
        description="Whether you have questions about custom 3D figurines, bulk orders, or custom design ideas, our studio team is here to assist."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left Column: Contact Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl bg-white border border-stone-200/90 p-6 sm:p-8 shadow-xs space-y-6">
            <h3 className="text-lg font-serif font-bold text-stone-900">
              Studio & Direct Inquiries
            </h3>

            <div className="space-y-4 text-xs sm:text-sm text-stone-600">
              {/* WhatsApp Card */}
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-stone-50 border border-stone-200/80">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                  <MessageCircle className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h4 className="font-semibold text-stone-900">WhatsApp Chat</h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Fastest way to share reference photos & get instant quotes
                  </p>
                  <a
                    href="https://wa.me/916376145171"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline"
                  >
                    Open WhatsApp Chat ({DISPLAY_PHONE_NUMBER}) →
                  </a>
                </div>
              </div>

              {/* Phone Call Card */}
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-stone-50 border border-stone-200/80">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-700 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-stone-900">Phone Support</h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Available for order queries & technical guidance
                  </p>
                  <a
                    href="tel:+916376145171"
                    className="inline-block mt-2 text-xs font-semibold text-stone-900 hover:text-amber-700 tabular-nums"
                  >
                    {DISPLAY_PHONE_NUMBER}
                  </a>
                </div>
              </div>

              {/* Email Card */}
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-stone-50 border border-stone-200/80">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-700 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-stone-900">Email Address</h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    For CAD file transfers (STL/OBJ/STEP) & detailed proposals
                  </p>
                  <a
                    href={`mailto:${BRAND_EMAIL}`}
                    className="inline-block mt-2 text-xs font-semibold text-stone-900 hover:text-amber-700 break-all"
                  >
                    {BRAND_EMAIL}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl bg-white border border-stone-200/90 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-serif font-bold text-stone-900">
                Send an Inquiry Message
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Submitting this form prepares your inquiry and opens WhatsApp with your pre-filled details.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="text-xs font-semibold text-stone-800 flex items-center justify-between mb-1">
                    <span>Your Name <span className="text-red-600">*</span></span>
                    {isFieldValid("name") && (
                      <span className="text-[11px] text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      onBlur={() => handleBlur("name")}
                      placeholder="e.g. Rahul Sharma"
                      className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border rounded-xl focus:outline-none transition-colors ${
                        isFieldError("name")
                          ? "border-red-500 bg-red-50/20"
                          : "border-stone-200 focus:border-amber-600 focus:bg-white"
                      }`}
                    />
                  </div>
                  {isFieldError("name") && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-semibold text-stone-800 flex items-center justify-between mb-1">
                    <span>Phone / WhatsApp <span className="text-red-600">*</span></span>
                    {isFieldValid("phone") && (
                      <span className="text-[11px] text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      maxLength={10}
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value.replace(/\D/g, ""))}
                      onBlur={() => handleBlur("phone")}
                      placeholder="10 digit mobile number"
                      className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border rounded-xl focus:outline-none transition-colors tabular-nums ${
                        isFieldError("phone")
                          ? "border-red-500 bg-red-50/20"
                          : "border-stone-200 focus:border-amber-600 focus:bg-white"
                      }`}
                    />
                  </div>
                  {isFieldError("phone") && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <label className="text-xs font-semibold text-stone-800 block mb-1">
                    Email Address <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      placeholder="e.g. rahul@example.com"
                      className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border rounded-xl focus:outline-none transition-colors ${
                        isFieldError("email")
                          ? "border-red-500 bg-red-50/20"
                          : "border-stone-200 focus:border-amber-600 focus:bg-white"
                      }`}
                    />
                  </div>
                  {isFieldError("email") && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label className="text-xs font-semibold text-stone-800 block mb-1">
                    Subject / Project Type <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) => handleChange("subject", e.target.value)}
                      onBlur={() => handleBlur("subject")}
                      placeholder="e.g. Custom 3D Figurine Inquiry"
                      className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border rounded-xl focus:outline-none transition-colors ${
                        isFieldError("subject")
                          ? "border-red-500 bg-red-50/20"
                          : "border-stone-200 focus:border-amber-600 focus:bg-white"
                      }`}
                    />
                  </div>
                  {isFieldError("subject") && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.subject}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="text-xs font-semibold text-stone-800 block mb-1">
                  Your Message & Requirements <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  onBlur={() => handleBlur("message")}
                  placeholder="Tell us what you'd like to create, desired dimensions, timeline, or any specific questions..."
                  className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border rounded-xl focus:outline-none transition-colors ${
                    isFieldError("message")
                      ? "border-red-500 bg-red-50/20"
                      : "border-stone-200 focus:border-amber-600 focus:bg-white"
                  }`}
                />
                {isFieldError("message") && (
                  <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.message}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition-colors active:scale-[0.99] cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry via WhatsApp</span>
              </button>

              {submitted && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Inquiry ready! WhatsApp should now open with your message.</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
