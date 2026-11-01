import { Layers, MessageSquare, CheckCircle, Truck } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: Layers,
      title: "Choose Your Product",
      desc: "Browse our curated catalogue of custom figurines, sacred idols, name sculptures, or planters.",
    },
    {
      num: "02",
      icon: MessageSquare,
      title: "Share Your Customization",
      desc: "Enter your custom text, select colors, and upload your reference photographs for preview.",
    },
    {
      num: "03",
      icon: CheckCircle,
      title: "Confirm Your Design",
      desc: "Connect directly on WhatsApp to finalize 3D previews, exact dimensions, and custom pricing.",
    },
    {
      num: "04",
      icon: Truck,
      title: "Get Your Creation Delivered",
      desc: "Precision 3D printed with fine layer resolution and safely shipped to your doorstep across India.",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#FAF5EE] border-y border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Seamless Ordering"
          title="How It Works"
          description="From your initial spark of inspiration to a masterfully finished 3D object in your hands."
        />

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative bg-white rounded-2xl p-6 border border-stone-200/90 shadow-2xs hover:shadow-md transition-shadow space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xl font-serif font-bold text-stone-300 tabular-nums">
                    {step.num}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-stone-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
