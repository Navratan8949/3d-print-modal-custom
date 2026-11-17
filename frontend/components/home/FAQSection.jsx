"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";

export const FAQ_DATA = [
  {
    question: "How is a custom 3D miniature made from photo in India?",
    answer:
      "Simply choose your preferred figurine scale (12cm to 25cm) and upload 1 to 3 clear front & side view photographs, or share them directly on WhatsApp (+91 6376145171). Our master 3D sculptors sculpt your facial likeness, clothing, and posture into a digital 3D model. We share a 3D digital likeness preview with you for approval before commencing additive 3D resin manufacturing.",
  },
  {
    question: "What material is used for Prime 3D miniatures and devotional idols?",
    answer:
      "We utilize ultra-high-definition 8K photopolymer UV resin for capturing intricate facial likeness and clothing folds in portrait miniatures. For devotional idols and desk nameplates, we use high-grade Silk PLA+, organic bio-polymers, and marble composite filaments finished with protective matte UV sealants for life-long durability.",
  },
  {
    question: "How long does manufacturing and delivery take across India?",
    answer:
      "3D digital sculpting and artisan printing takes 2 to 4 working days. After your likeness preview approval, our express courier partners deliver to major metros (Delhi NCR, Mumbai, Bengaluru, Hyderabad, Pune, Chennai, Kolkata, Jaipur) within 2 to 3 business days, and all other Indian pin codes within 4 to 6 days in multi-layer shockproof packaging.",
  },
  {
    question: "Can I preview and make adjustments to my 3D miniature before printing?",
    answer:
      "Yes, absolutely! We guarantee 100% likeness satisfaction. Before physical 3D printing starts, our team shares a digital 3D render on WhatsApp. You can review facial angles, hair, and attire details, and request revisions until you are completely delighted.",
  },
  {
    question: "What payment methods are supported? Is Razorpay payment secure?",
    answer:
      "We accept all digital payment methods via Razorpay's bank-grade 256-bit encrypted gateway, including UPI (Google Pay, PhonePe, Paytm, Cred), Debit/Credit Cards (Visa, MasterCard, RuPay), and NetBanking. Customers preferring direct communication can also place custom orders via WhatsApp.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleItem = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_DATA.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section className="py-16 sm:py-20 bg-stone-100/70 border-t border-stone-200/80">
      {/* JSON-LD Schema Script for Google Search Featured Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
            <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
            <span>Got Questions? We Have Answers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto">
            Everything you need to know about photo-to-3D miniatures, materials, digital previews, and pan-India doorstep delivery.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_DATA.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white border border-stone-200/90 overflow-hidden shadow-2xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-semibold text-stone-900 hover:text-amber-800 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-medium">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-amber-600" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-0 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100">
                    <p className="pt-3">{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
