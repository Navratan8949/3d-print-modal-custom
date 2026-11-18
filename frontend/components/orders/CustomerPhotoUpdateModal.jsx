"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  UploadCloud,
  Loader2,
  Trash2,
  Camera,
  AlertCircle,
  CheckCircle,
  Plus,
} from "lucide-react";
import { ordersAPI } from "@/lib/api";
import { getOrderReferencePhotos } from "@/lib/orderImages";

export default function CustomerPhotoUpdateModal({
  isOpen,
  onClose,
  order,
  onPhotosUpdated,
}) {
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [newFiles, setNewFiles] = useState([]); // [{ file, previewUrl }]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (order && isOpen) {
      const current = getOrderReferencePhotos(order);
      setExistingPhotos(current);
      setNewFiles([]);
      setError("");
      setSuccess(false);
    }
  }, [order, isOpen]);

  // Clean up blob preview URLs on unmount or file changes
  useEffect(() => {
    return () => {
      newFiles.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, [newFiles]);

  if (!isOpen || !order) return null;

  const totalPhotosCount = existingPhotos.length + newFiles.length;
  const maxPhotos = 5;
  const remainingAllowed = maxPhotos - totalPhotosCount;

  const handleFileSelect = (e) => {
    setError("");
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (totalPhotosCount + files.length > maxPhotos) {
      setError(`You can only upload up to ${maxPhotos} reference photos in total.`);
    }

    const availableSlots = Math.max(0, maxPhotos - totalPhotosCount);
    const filesToAdd = files.slice(0, availableSlots);

    const validItems = filesToAdd.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name,
    }));

    setNewFiles((prev) => [...prev, ...validItems]);
    e.target.value = "";
  };

  const handleRemoveExisting = (index) => {
    setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewFile = (index) => {
    setNewFiles((prev) => {
      const target = prev[index];
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (totalPhotosCount === 0) {
      setError("Please provide at least 1 reference photo.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();

      // Pass remaining existing photos to keep
      formData.append("existingPhotos", JSON.stringify(existingPhotos));

      // Append new files
      newFiles.forEach((item) => {
        formData.append("referencePhotos", item.file);
      });

      // Pass phone/email for guest verification if guest
      if (order.customer?.phone) {
        formData.append("phone", order.customer.phone);
      }
      if (order.customer?.email) {
        formData.append("email", order.customer.email);
      }

      const res = await ordersAPI.updatePhotos(order._id || order.id, formData);

      if (res && res.success && res.order) {
        setSuccess(true);
        if (onPhotosUpdated) {
          onPhotosUpdated(res.order);
        }
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        throw new Error(res?.message || "Failed to update photos.");
      }
    } catch (err) {
      setError(err.message || "Failed to save photos. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900">
                Update Reference Photos
              </h3>
              <p className="text-xs text-stone-500">
                Order #{order.orderNumber} • Up to 5 photos
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status notice */}
        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
          <strong>Tip:</strong> Upload clear front, left, and right side angle photos. This helps our 3D digital sculptors capture fine facial features, clothing, and accurate likeness.
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Reference photos updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photos Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
              <span>Attached Photos ({totalPhotosCount}/{maxPhotos})</span>
              <span className="text-stone-400 text-[11px]">
                {remainingAllowed > 0 ? `${remainingAllowed} slot(s) remaining` : "Max limit reached"}
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {/* Existing Photos */}
              {existingPhotos.map((url, idx) => (
                <div
                  key={`exist-${idx}`}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shadow-2xs"
                >
                  <img
                    src={url}
                    alt={`Existing photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExisting(idx)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white shadow-xs hover:bg-rose-700 transition-colors"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <span className="absolute bottom-1 left-1 bg-stone-900/80 text-[9px] text-white font-bold px-1 rounded">
                    Existing
                  </span>
                </div>
              ))}

              {/* Newly Selected Files */}
              {newFiles.map((item, idx) => (
                <div
                  key={`new-${idx}`}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-stone-100 border-2 border-emerald-400 shadow-2xs"
                >
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveNewFile(idx)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white shadow-xs hover:bg-rose-700 transition-colors"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <span className="absolute bottom-1 left-1 bg-emerald-700 text-[9px] text-white font-bold px-1 rounded">
                    New
                  </span>
                </div>
              ))}

              {/* Add More Button / File Input */}
              {remainingAllowed > 0 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50 flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-all">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={loading}
                  />
                  <Plus className="w-5 h-5 text-amber-600 mb-1" />
                  <span className="text-[10px] font-bold text-amber-900">Add Photo</span>
                  <span className="text-[9px] text-stone-400">JPG, PNG</span>
                </label>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 font-semibold text-xs hover:bg-stone-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || totalPhotosCount === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading & Saving...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Save Reference Photos</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
