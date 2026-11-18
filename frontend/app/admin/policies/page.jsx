"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Save,
  Loader2,
  Sparkles,
  FileText,
  Lock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  ExternalLink,
} from "lucide-react";
import { policiesAPI } from "@/lib/api";
import Link from "next/link";

export default function AdminPoliciesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', text: '' }
  const [activeTab, setActiveTab] = useState("printNotice"); // "printNotice" | "terms" | "privacy" | "refund"

  const [formData, setFormData] = useState({
    printOnOrderTitle: "INCLUDES PRINT-ON-ORDER ITEMS",
    printOnOrderNotice:
      "Production begins after payment. Each item's staff-provided estimate is shown in your cart.",
    termsAndConditions: "",
    privacyPolicy: "",
    refundPolicy: "",
  });

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const res = await policiesAPI.get();
      if (res?.success && res.policies) {
        setFormData({
          printOnOrderTitle:
            res.policies.printOnOrderTitle || "INCLUDES PRINT-ON-ORDER ITEMS",
          printOnOrderNotice:
            res.policies.printOnOrderNotice ||
            "Production begins after payment. Each item's staff-provided estimate is shown in your cart.",
          termsAndConditions: res.policies.termsAndConditions || "",
          privacyPolicy: res.policies.privacyPolicy || "",
          refundPolicy: res.policies.refundPolicy || "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch policies:", err);
      setFeedback({
        type: "error",
        text: "Could not load policies from server. Default values loaded.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      setFeedback(null);
      const res = await policiesAPI.update(formData);
      if (res?.success) {
        setFeedback({
          type: "success",
          text: "All policies, print-on-order notices, and legal terms updated successfully!",
        });
        setTimeout(() => setFeedback(null), 5000);
      } else {
        throw new Error(res?.message || "Failed to update policies");
      }
    } catch (err) {
      console.error("Save policies error:", err);
      setFeedback({
        type: "error",
        text: err?.message || "Failed to save policies. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-600" />
        <p className="text-xs text-stone-500 font-mono">Loading store policies &amp; notices...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <ShieldCheck className="w-5 h-5 text-amber-700" />
            </span>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
              Policies &amp; Legal Terms Manager
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Configure the checkout print-on-order banner, customer photo usage policies, and consumer terms.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:opacity-75"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save All Policies</span>
            </>
          )}
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm flex items-center justify-between gap-3 animate-fade-in ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
              : "bg-red-50 text-red-900 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-medium">{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-stone-400 hover:text-stone-700 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Policy Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("printNotice")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "printNotice"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Checkout Print-on-Order Banner</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("terms")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "terms"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Terms &amp; Conditions</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("privacy")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "privacy"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Privacy Policy</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("refund")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "refund"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Cancellation &amp; Refund Policy</span>
        </button>
      </div>

      {/* Tab 1: Checkout Notice Banner */}
      {activeTab === "printNotice" && (
        <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-stone-900 text-base">
              Cart &amp; Checkout Production Notice Banner
            </h3>
            <p className="text-xs text-stone-500">
              This banner informs customers that custom 3D printing begins immediately after payment authorization.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Banner Headline Title
              </label>
              <input
                type="text"
                value={formData.printOnOrderTitle}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, printOnOrderTitle: e.target.value }))
                }
                placeholder="e.g. INCLUDES PRINT-ON-ORDER ITEMS"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm font-semibold focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Notice Explanation Text
              </label>
              <textarea
                rows={3}
                value={formData.printOnOrderNotice}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, printOnOrderNotice: e.target.value }))
                }
                placeholder="e.g. Production begins after payment. Each item's staff-provided estimate is shown in your cart."
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm leading-relaxed focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
              />
            </div>
          </div>

          {/* Live Preview of Banner */}
          <div className="pt-4 border-t border-stone-100 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>Customer Cart Preview:</span>
            </span>

            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>{formData.printOnOrderTitle || "INCLUDES PRINT-ON-ORDER ITEMS"}</span>
              </div>
              <p className="text-xs text-amber-900/90 leading-relaxed font-sans">
                {formData.printOnOrderNotice ||
                  "Production begins after payment. Each item's staff-provided estimate is shown in your cart."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Terms & Conditions */}
      {activeTab === "terms" && (
        <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-stone-900 text-base">
                Terms &amp; Conditions
              </h3>
              <p className="text-xs text-stone-500">
                Shown to users at checkout and published at{" "}
                <Link href="/terms" target="_blank" className="text-amber-700 underline inline-flex items-center gap-1">
                  /terms <ExternalLink className="w-3 h-3" />
                </Link>
              </p>
            </div>
          </div>

          <div>
            <textarea
              rows={14}
              value={formData.termsAndConditions}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, termsAndConditions: e.target.value }))
              }
              className="w-full p-4 rounded-xl border border-stone-200 text-xs sm:text-sm font-mono leading-relaxed focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 bg-stone-50/50"
            />
          </div>
        </div>
      )}

      {/* Tab 3: Privacy Policy */}
      {activeTab === "privacy" && (
        <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-stone-900 text-base">
                Privacy Policy &amp; Customer Photo Confidentiality
              </h3>
              <p className="text-xs text-stone-500">
                Guarantees customer reference photos are confidential and published at{" "}
                <Link href="/privacy" target="_blank" className="text-amber-700 underline inline-flex items-center gap-1">
                  /privacy <ExternalLink className="w-3 h-3" />
                </Link>
              </p>
            </div>
          </div>

          <div>
            <textarea
              rows={14}
              value={formData.privacyPolicy}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, privacyPolicy: e.target.value }))
              }
              className="w-full p-4 rounded-xl border border-stone-200 text-xs sm:text-sm font-mono leading-relaxed focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 bg-stone-50/50"
            />
          </div>
        </div>
      )}

      {/* Tab 4: Refund Policy */}
      {activeTab === "refund" && (
        <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-stone-900 text-base">
                Cancellation &amp; Refund Policy
              </h3>
              <p className="text-xs text-stone-500">
                Covers transit damage free replacement and pre-production cancellation rules, published at{" "}
                <Link href="/refund-policy" target="_blank" className="text-amber-700 underline inline-flex items-center gap-1">
                  /refund-policy <ExternalLink className="w-3 h-3" />
                </Link>
              </p>
            </div>
          </div>

          <div>
            <textarea
              rows={14}
              value={formData.refundPolicy}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, refundPolicy: e.target.value }))
              }
              className="w-full p-4 rounded-xl border border-stone-200 text-xs sm:text-sm font-mono leading-relaxed focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 bg-stone-50/50"
            />
          </div>
        </div>
      )}

      {/* Bottom Save Trigger */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:opacity-75"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save All Policies</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
