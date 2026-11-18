import SectionHeading from "@/components/common/SectionHeading";
import { ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Cancellation & Refund Policy | Prime 3D World",
  description:
    "Review our transparent cancellation, 100% transit damage guarantee, and refund policy for custom 3D printed products.",
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

export default async function RefundPolicyPage() {
  const policies = await getPolicies();
  const content =
    policies?.refundPolicy ||
    `## Cancellation & Refund Policy - Prime 3D World

Because each 3D print is uniquely personalized and custom-manufactured:

1. **Pre-Production Cancellation:** You may cancel your order within 6 hours of placement or before 3D digital sculpting/slicing has begun for a 100% full refund.
2. **Transit Damage Guarantee:** We pack all 3D sculptures with 5-layer shockproof protective cushioning. In the rare event your package arrives broken or damaged during transit, simply share an unboxing video or photo on WhatsApp within 48 hours. We will 3D print and dispatch a 100% free replacement immediately!
3. **Quality & Likeness:** If you have concerns about the finish or details, contact our artisan support team. We work with you to resolve any manufacturing defects.
4. **Non-Personalized Items:** For standard non-custom models, returns are accepted within 7 days of delivery in original packaging.`;

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
        eyebrow="Consumer Protection"
        title="Cancellation & Refund Policy"
        description="Transparent guidelines on pre-production cancellations, returns, and our 100% transit damage replacement guarantee."
      />

      <div className="rounded-3xl bg-white border border-stone-200/90 p-6 sm:p-10 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-stone-100 text-stone-500 text-xs">
          <RefreshCw className="w-4 h-4 text-emerald-600" />
          <span>100% Transit Damage Replacement Guarantee • Rapid Resolution</span>
        </div>

        <div className="prose prose-stone prose-sm sm:prose-base max-w-none text-stone-700 whitespace-pre-line leading-relaxed">
          {content}
        </div>
      </div>
    </div>
  );
}
