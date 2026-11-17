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
          {/* Subtle Connecting Line on Desktop */}
          <div className="hidden lg:block absolute top-12 left-12 right-12 h-0.5 border-t-2 border-dashed border-amber-300/60 z-0 pointer-events-none" />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="group relative bg-white rounded-2xl p-6 border border-stone-200/90 shadow-2xs hover:shadow-xl hover:border-amber-400/80 hover:-translate-y-1.5 transition-all duration-300 space-y-4 z-10"
              >
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200/70 flex items-center justify-center text-amber-700 group-hover:bg-amber-600 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-2xs">
                    <Icon className="w-5 h-5 transition-transform" />
                  </div>
                  <span className="text-2xl font-serif font-extrabold text-stone-200 group-hover:text-amber-500/80 transition-colors duration-300 tabular-nums">
                    {step.num}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-stone-900 group-hover:text-amber-700 transition-colors duration-200">
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
