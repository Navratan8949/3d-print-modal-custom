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
      className={`space-y-3 ${
        isCenter ? "text-center max-w-2xl mx-auto" : "max-w-2xl"
      } ${className}`}
    >
      {eyebrow && (
        <div className="text-xs font-semibold uppercase tracking-widest text-amber-700">
          {eyebrow}
        </div>
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
