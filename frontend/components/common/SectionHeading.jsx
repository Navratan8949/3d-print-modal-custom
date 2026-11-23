import Link from "next/link";
import { UserIcon } from "lucide-react";

export default function SectionHeading({
  eyebrow,
  title,
  description,
  alignment = "center",
  className = "",
}) {
  const isCenter = alignment === "center";

  return (
    <div
      className={`space-y-3 ${isCenter ? "text-center max-w-2xl mx-auto" : "max-w-2xl"
        } ${className}`}
    >
      {eyebrow && (
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold shadow-2xs transition-colors shrink-0"
        >
          <UserIcon className="w-4 h-4 text-amber-600" />
          <span>{eyebrow}</span>
        </Link>
      )}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-stone-900 tracking-tight [text-wrap:balance]">
        {title}
      </h2>
      {description && (
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed [text-wrap:balance]">
          {description}
        </p>
      )}
    </div>
  );
}
