import SectionHeading from "@/components/common/SectionHeading";
import { ShieldCheck, ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Prime 3D World",
  description:
    "Learn how Prime 3D World protects customer reference photos, 3D likeness files, and personal data with 256-bit encryption.",
};

async function getPolicies() {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
    const res = await fetch(`${apiBase}/policies`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.policies;
  } catch (err) {
    return null;
  }
}

export default async function PrivacyPage() {
  const policies = await getPolicies();
  const content =
    policies?.privacyPolicy ||
    `## Privacy Policy - Prime 3D World

At Prime 3D World, your privacy and trust are our top priorities:

1. **Customer Photos & Files:** Any personal photographs, face references, or 3D files uploaded by customers are used EXCLUSIVELY for the purpose of 3D modeling, sculpting, and printing your order. We NEVER sell, share, or publish customer personal photos without explicit written consent.
2. **Personal Data:** We collect your name, phone number, shipping address, and email solely to fulfill orders, send automated courier tracking updates via SMS/Email/WhatsApp, and provide customer support.
3. **Secure Payment Processing:** We do not store your credit card, debit card, or UPI credentials. All digital transactions are securely processed by Razorpay with bank-grade 128-bit encryption.
4. **Data Retention:** Reference photos are archived safely in encrypted storage during production and can be deleted upon customer request after successful delivery.`;

  return (
    <div className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <Link
        href="/cart"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Checkout / Cart</span>
      </Link>

      <SectionHeading
        eyebrow="Data Protection & Confidentiality"
        title="Privacy Policy"
        description="Our commitment to safeguarding your photos, custom 3D model files, and payment confidentiality."
      />

      <div className="rounded-3xl bg-white border border-stone-200/90 p-6 sm:p-10 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-stone-100 text-stone-500 text-xs">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span>Customer Photo Confidentiality Guarantee • Bank-Grade 256-bit Security</span>
        </div>

        <div className="prose prose-stone prose-sm sm:prose-base max-w-none text-stone-700 whitespace-pre-line leading-relaxed">
          {content}
        </div>
      </div>
    </div>
  );
}
