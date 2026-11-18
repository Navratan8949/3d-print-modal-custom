import SectionHeading from "@/components/common/SectionHeading";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Terms & Conditions | Prime 3D World",
  description:
    "Review our terms of service, bespoke 3D fabrication guidelines, and delivery conditions for Prime 3D World India.",
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

export default async function TermsPage() {
  const policies = await getPolicies();
  const content =
    policies?.termsAndConditions ||
    `## Terms & Conditions - Prime 3D World

Welcome to Prime 3D World (prime3dworld.in). By placing an order with us, you agree to the following terms:

1. **Custom 3D Printing & Fabrication:** All customized figurines, sacred idols, and personalized name models are printed on-order using high-density resin and eco-friendly polymers.
2. **Photo Likeness Guarantee:** For custom face miniatures, our digital artists sculpt models based on your uploaded photos. Production begins only after model verification.
3. **Turnaround & Dispatch:** Standard fabrication takes 2-4 working days. Express domestic courier delivery takes 3-6 business days across India.
4. **Accuracy of Information:** Customers are responsible for providing correct delivery addresses, phone numbers, and high-resolution reference photos.
5. **Pricing & Taxes:** All prices listed in INR include applicable GST. Courier delivery charges are displayed clearly at checkout.`;

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
        eyebrow="Legal & Governance"
        title="Terms & Conditions"
        description="Comprehensive terms governing customized 3D printing orders, fabrication standards, and customer agreements."
      />

      <div className="rounded-3xl bg-white border border-stone-200/90 p-6 sm:p-10 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-stone-100 text-stone-500 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Last Updated: November 2026 • Official Prime 3D World Policy</span>
        </div>

        <div className="prose prose-stone prose-sm sm:prose-base max-w-none text-stone-700 whitespace-pre-line leading-relaxed">
          {content}
        </div>
      </div>
    </div>
  );
}
