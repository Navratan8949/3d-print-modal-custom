"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Save,
  Trash2,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle,
  Upload,
  Star,
  Layers,
  Sparkles,
  Clock,
  Ruler,
  Weight,
  Plus,
} from "lucide-react";
import { productsAPI } from "@/lib/api";
import { CATEGORIES } from "@/data/categories";

export default function AdminProductDetailPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "Custom 3D Figurines",
    categoryId: "custom-3d-figurines",
    price: "",
    originalPrice: "",
    material: "",
    print_time: "",
    dimensions: "",
    shortDescription: "",
    description: "",
    is_featured: false,
    isCustomizable: true,
    currentStock: 100,
    status: "active",
  });

  const [newImageFiles, setNewImageFiles] = useState([]);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await productsAPI.getBySlugOrId(id);
      if (res && res.product) {
        const p = res.product;
        setProduct(p);
        setForm({
          name: p.name || "",
          category: p.category || "Custom 3D Figurines",
          categoryId: p.categoryId || "custom-3d-figurines",
          price: p.price || "",
          originalPrice: p.originalPrice || "",
          material: p.material || "High-Density UV Resin & Eco-PLA+",
          print_time: p.print_time || "1-2 working days",
          dimensions: p.dimensions || "12-15 cm height",
          shortDescription: p.shortDescription || "",
          description: p.description || "",
          is_featured: Boolean(p.is_featured),
          isCustomizable: p.isCustomizable !== false,
          currentStock: p.currentStock || 100,
          status: p.status || "active",
        });
      } else {
        setError("Product not found");
      }
    } catch (err) {
      setError(err.message || "Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    const selectedCat = CATEGORIES.find((c) => c.name === e.target.value);
    setForm((prev) => ({
      ...prev,
      category: e.target.value,
      categoryId: selectedCat ? selectedCat.id : e.target.value.toLowerCase().replace(/\s+/g, "-"),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!product) return;

    if (!form.name || !form.price || !form.category) {
      alert("Name, price, and category are required.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("category", form.category);
      formData.append("categoryId", form.categoryId);
      formData.append("price", form.price);
      formData.append("originalPrice", form.originalPrice || 0);
      formData.append("material", form.material);
      formData.append("print_time", form.print_time);
      formData.append("dimensions", form.dimensions);
      formData.append("shortDescription", form.shortDescription);
      formData.append("description", form.description);
      formData.append("is_featured", form.is_featured);
      formData.append("isCustomizable", form.isCustomizable);
      formData.append("currentStock", form.currentStock || 100);
      formData.append("status", form.status);

      if (newImageFiles.length > 0) {
        for (let i = 0; i < newImageFiles.length; i++) {
          formData.append("images", newImageFiles[i]);
        }
      }

      const res = await productsAPI.update(product._id, formData);
      if (res && res.product) {
        setProduct(res.product);
        setNewImageFiles([]);
        setSuccessMsg("Product updated successfully! Live in catalog.");
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err) {
      setError(err.message || "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    if (!confirm(`Are you sure you want to remove "${product.name}"?`)) return;

    try {
      await productsAPI.delete(product._id);
      alert("Product removed from catalog.");
      router.push("/admin/products");
    } catch (err) {
      alert("Failed to delete product: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
        <p className="text-xs text-stone-500 font-mono">Loading product specifications...</p>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="py-16 max-w-lg mx-auto text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-serif font-bold text-stone-900">Product Not Found</h2>
        <p className="text-xs text-stone-600">{error}</p>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>
      </div>
    );
  }

  const allImages = [
    ...(product.images || []),
    ...(product.image_url ? [product.image_url] : []),
  ].filter((v, i, a) => a.indexOf(v) === i && v);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors shadow-2xs"
            title="Back to Products List"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif font-bold text-stone-900">{product.name}</h1>
              {product.is_featured && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                  Featured
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 font-mono">
              SKU: {product.sku || product.id || "N/A"} • Slug: /{product.slug}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href={`/products/${product.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-stone-500" />
            <span>View in Storefront ↗</span>
          </Link>

          <button
            onClick={handleDelete}
            className="p-2 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs transition-colors shadow-2xs"
            title="Delete Product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-2xs">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 shadow-2xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Product Details & Specs (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs space-y-5">
            <h2 className="font-serif font-bold text-base text-stone-900 border-b border-stone-100 pb-3">
              General Product Information
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">Product Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Category *</label>
                <select
                  value={form.category}
                  onChange={handleCategoryChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
                >
                  <option value="active">Active (Visible in Store)</option>
                  <option value="draft">Draft (Hidden)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600 font-mono font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Original Price (₹ MRP)</label>
                <input
                  type="number"
                  min="0"
                  value={form.originalPrice}
                  onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">Short Summary</label>
              <input
                type="text"
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                placeholder="Brief one-line summary for shop cards"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">Full Description</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Detailed craft description, print resolution, and finish guidelines"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
              />
            </div>
          </div>

          {/* 3D Manufacturing Specs */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs space-y-5">
            <h2 className="font-serif font-bold text-base text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>3D Printing Specifications</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Material</label>
                <input
                  type="text"
                  value={form.material}
                  onChange={(e) => setForm({ ...form, material: e.target.value })}
                  placeholder="e.g. UV Resin / Eco-PLA"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Print Time</label>
                <input
                  type="text"
                  value={form.print_time}
                  onChange={(e) => setForm({ ...form, print_time: e.target.value })}
                  placeholder="e.g. 1-2 working days"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Dimensions</label>
                <input
                  type="text"
                  value={form.dimensions}
                  onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                  placeholder="e.g. 12-15 cm height"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-800">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Feature on Homepage Hero & Trends</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-800">
                <input
                  type="checkbox"
                  checked={form.isCustomizable}
                  onChange={(e) => setForm({ ...form, isCustomizable: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Enable Customization (Text, Photo upload)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Image Gallery & Save (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Images Gallery Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs space-y-4">
            <h3 className="font-serif font-bold text-sm text-stone-900 pb-3 border-b border-stone-100">
              Product Images Gallery
            </h3>

            {/* Current Images */}
            {allImages.length === 0 ? (
              <div className="p-8 text-center text-stone-400 text-xs bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                No images uploaded yet
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {allImages.map((img, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-stone-200 aspect-square bg-stone-100">
                    <img
                      src={img}
                      alt={`Product preview ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {idx === 0 && (
                      <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-stone-950/80 text-white backdrop-blur-xs">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add More Images */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-700 block">
                  Upload Additional Photos (Multiple)
                </label>
                {newImageFiles.length > 0 && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                    +{newImageFiles.length} new
                  </span>
                )}
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setNewImageFiles((prev) => [...prev, ...files]);
                }}
                className="w-full text-xs text-stone-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-stone-900 file:text-white hover:file:bg-stone-800"
              />

              {/* Live Preview of Newly Selected Photos */}
              {newImageFiles.length > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {newImageFiles.map((file, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden border border-amber-300 aspect-square bg-stone-100 group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`New ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setNewImageFiles((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold hover:bg-rose-700 transition-colors shadow-xs"
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Save Action Card */}
          <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-2xs space-y-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Product Changes</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-stone-400 text-center">
              Changes reflect immediately on the storefront.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

