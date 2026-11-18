"use client";

import React, { useState } from "react";
import {
  Camera,
  Maximize2,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  Lock,
  Sparkles,
} from "lucide-react";

export default function OrderReferenceGallery({
  photos = [],
  title = "Customer Reference Photos",
  allowUpdate = false,
  onOpenUpdate = null,
  isProductionLocked = false,
  maxPhotos = 5,
}) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(null);

  if (!photos || photos.length === 0) {
    if (!allowUpdate) return null;

    return (
      <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-900">No Reference Photos Attached Yet</h4>
            <p className="text-[11px] text-stone-600">
              {isProductionLocked
                ? "3D printing is already in progress without uploaded photos."
                : "You can upload up to 5 reference photos for face sculpting and proportioning."}
            </p>
          </div>
        </div>

        {allowUpdate && !isProductionLocked && onOpenUpdate && (
          <button
            type="button"
            onClick={onOpenUpdate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Reference Photos</span>
          </button>
        )}
      </div>
    );
  }

  const handlePrev = (e) => {
    e.stopPropagation();
    setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setActivePhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="bg-amber-50/40 border border-amber-200/70 rounded-2xl p-4 space-y-3">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-amber-700" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950">
            {title} ({photos.length}/{maxPhotos})
          </h4>
        </div>

        <div className="flex items-center gap-2">
          {allowUpdate && !isProductionLocked && onOpenUpdate && (
            <button
              type="button"
              onClick={onOpenUpdate}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-200/70 hover:bg-amber-300/80 px-2.5 py-1 rounded-lg border border-amber-300 transition-colors cursor-pointer"
              title="Add or update photos before 3D production starts"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Update Photos</span>
            </button>
          )}

          {isProductionLocked && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">
              <Lock className="w-3 h-3 text-stone-500" />
              <span>Locked (In Production)</span>
            </span>
          )}
        </div>
      </div>

      {/* Thumbnails Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
        {photos.map((url, idx) => (
          <div
            key={url + idx}
            onClick={() => setActivePhotoIndex(idx)}
            className="group relative aspect-square rounded-xl overflow-hidden bg-white border border-stone-200/90 shadow-2xs hover:shadow-md hover:border-amber-400 transition-all cursor-pointer"
          >
            <img
              src={url}
              alt={`Customer reference photo ${idx + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/images/products/fullbody-figurine-hero.jpeg";
              }}
            />

            {/* Hover overlay with zoom icon */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Maximize2 className="w-4 h-4 drop-shadow-xs" />
            </div>

            {/* Index Badge */}
            <span className="absolute bottom-1 right-1 bg-stone-900/80 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs">
              #{idx + 1}
            </span>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-stone-500 flex items-center gap-1">
        <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
        <span>Click any photo to view full-resolution zoom or download.</span>
      </p>

      {/* Lightbox Fullscreen Modal */}
      {activePhotoIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActivePhotoIndex(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Modal Controls */}
            <div className="absolute -top-12 left-0 right-0 flex items-center justify-between text-white px-2">
              <span className="text-xs font-semibold">
                Photo {activePhotoIndex + 1} of {photos.length}
              </span>

              <div className="flex items-center gap-2">
                <a
                  href={photos[activePhotoIndex]}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors flex items-center gap-1 text-xs"
                  title="Download Photo"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download</span>
                </a>

                <button
                  type="button"
                  onClick={() => setActivePhotoIndex(null)}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Photo Container */}
            <div className="relative w-full max-h-[80vh] flex items-center justify-center overflow-hidden rounded-2xl bg-stone-950 border border-stone-800 shadow-2xl">
              <img
                src={photos[activePhotoIndex]}
                alt={`Customer reference photo full size ${activePhotoIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain rounded-xl select-none"
              />

              {/* Prev Button */}
              {photos.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all shadow-md active:scale-95"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {/* Next Button */}
              {photos.length > 1 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all shadow-md active:scale-95"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Bottom Dots */}
            {photos.length > 1 && (
              <div className="mt-3 flex items-center justify-center gap-1.5">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActivePhotoIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === activePhotoIndex ? "w-6 bg-amber-500" : "w-1.5 bg-stone-500"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
