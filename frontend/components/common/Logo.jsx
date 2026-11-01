import Link from "next/link";
import Image from "next/image";

export default function Logo({ className = "", isLight = false, size = "default" }) {
  // Sizing variants
  const isLarge = size === "lg";

  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2 sm:gap-3 transition-opacity hover:opacity-95 ${className}`}
      aria-label="Prime3Dworld Home"
    >
      {/* Official Circular 3D Logo (Responsive & Crisp) */}
      <div className="relative flex h-10 w-10 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-full overflow-hidden shadow-md ring-2 ring-stone-900/10 bg-white">
        <Image
          src="/images/logo/prime3dworld-logo.jpeg"
          alt="Prime3Dworld Official Logo"
          width={56}
          height={56}
          className="h-full w-full object-cover transform transition-transform duration-300 group-hover:scale-105"
          priority
        />
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1 sm:gap-1.5 font-serif text-xl sm:text-2xl tracking-tight font-bold">
          <span className={isLight ? "text-white" : "text-stone-950"}>Prime</span>
          <span className="rounded-md bg-blue-600/15 px-1 sm:px-1.5 py-0.5 text-[11px] sm:text-xs font-sans font-extrabold tracking-wider text-blue-600">
            3D
          </span>
          <span
            className={
              isLight
                ? "text-stone-300 font-sans text-sm sm:text-base font-semibold tracking-wide"
                : "text-stone-700 font-sans text-sm sm:text-base font-semibold tracking-wide"
            }
          >
            world
          </span>
        </div>
        <span className="hidden sm:inline-block text-[10px] uppercase tracking-widest text-stone-500 font-sans font-medium mt-1">
          Custom 3D Printing Lab
        </span>
      </div>
    </Link>
  );
}
