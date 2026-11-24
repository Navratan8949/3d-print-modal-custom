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
import { productsAPI, categoriesAPI } from "@/lib/api";
import { resolveProductImage, handleImageError } from "@/lib/imageUtils";

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
    finishes: "",
    print_time: "",
    dimensions: "",
    sizes: "",
    shortDescription: "",
    description: "",
    is_featured: false,
    showInSlider: false,
    isCustomizable: true,
    currentStock: 100,
    tags: "",
    status: "active",
  });

  const [categories, setCategories] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);

  useEffect(() => {
    fetchProduct();
    loadCategories();
  }, [id]);

  const loadCategories = async () => {
    try {
      const res = await categoriesAPI.getAll();
      if (res && res.categories) {
        setCategories(res.categories);
      }
    } catch (err) {
      console.warn("Failed to load categories:", err.message);
    }
  };

  const fetchProduct = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await productsAPI.getBySlugOrId(id);
      if (res && res.product) {
        const p = res.product;
        const sizesString =
          p.availableOptions?.sizes && Array.isArray(p.availableOptions.sizes) && p.availableOptions.sizes.length > 0
            ? p.availableOptions.sizes.join(", ")
            : p.dimensions || "Standard Scale (12-15 cm), Large Display (18-20 cm)";

        const finishesString =
          p.availableOptions?.finishes && Array.isArray(p.availableOptions.finishes) && p.availableOptions.finishes.length > 0
            ? p.availableOptions.finishes.join(", ")
            : p.availableOptions?.types && Array.isArray(p.availableOptions.types) && p.availableOptions.types.length > 0
            ? p.availableOptions.types.join(", ")
            : p.material || "Matte Natural, Artisan Hand-Detailed, Gloss Finish";

        setProduct(p);
        setForm({
          name: p.name || "",
          category: p.category || "Custom 3D Figurines",
          categoryId: p.categoryId || "custom-3d-figurines",
          price: p.price || "",
          originalPrice: p.originalPrice || "",
          material: p.material || "High-Density UV Resin & Eco-PLA+",
          finishes: finishesString,
          print_time: p.print_time || "1-2 working days",
          dimensions: p.dimensions || "12-15 cm height",
          sizes: sizesString,
          shortDescription: p.shortDescription || "",
          description: p.description || "",
          is_featured: Boolean(p.is_featured),
          showInSlider: Boolean(p.showInSlider),
          isCustomizable: p.isCustomizable !== false,
          currentStock: p.currentStock || 100,
          tags: Array.isArray(p.tags) ? p.tags.join(", ") : (p.tags || ""),
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
    const selectedCat = categories.find((c) => c.name === e.target.value);
    setForm((prev) => ({
      ...prev,
      category: e.target.value,
      categoryId: selectedCat ? (selectedCat.slug || selectedCat.id) : e.target.value.toLowerCase().replace(/\s+/g, "-"),
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
      const sizeArray = form.sizes
        ? form.sizes.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      const finishArray = form.finishes
        ? form.finishes.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      const availableOptions = {
        ...(product?.availableOptions || {}),
        sizes: sizeArray.length > 0 ? sizeArray : undefined,
        finishes: finishArray.length > 0 ? finishArray : undefined,
      };
      formData.append("availableOptions", JSON.stringify(availableOptions));
      formData.append("material", form.material || (finishArray[0] || "UV Resin & Eco-PLA"));
      formData.append("print_time", form.print_time);
      formData.append("dimensions", form.dimensions || (sizeArray[0] || "12-15 cm height"));
      formData.append("shortDescription", form.shortDescription);
      formData.append("description", form.description);
      formData.append("is_featured", form.is_featured);
      formData.append("showInSlider", form.showInSlider);
      formData.append("isCustomizable", form.isCustomizable);
      formData.append("currentStock", form.currentStock || 100);
      formData.append("status", form.status);
      if (form.tags) {
        const tagArr = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
        formData.append("tags", JSON.stringify(tagArr));
      } else {
        formData.append("tags", JSON.stringify([]));
      }
      const cleanExisting = (product.images || [])
        .map((item) => (typeof item === "string" ? item.trim() : (item?.url || item?.src || item?.image_url || "")))
        .filter((str) => typeof str === "string" && str.trim().length > 0 && str !== "{}" && str !== "[object Object]");
      formData.append("existingImages", JSON.stringify(cleanExisting));

      if (newImageFiles.length > 0) {
        for (let i = 0; i < newImageFiles.length; i++) {
          formData.append("images", newImageFiles[i]);
        }
      }

      const targetId = product._id || product.id;
      const res = await productsAPI.update(targetId, formData);
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

  const [deletingImage, setDeletingImage] = useState(null);
  const [settingPrimary, setSettingPrimary] = useState(null);
  const [externalImageUrl, setExternalImageUrl] = useState("");
  const [addingExternalUrl, setAddingExternalUrl] = useState(false);

  const handleDeleteImage = async (imgUrl) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;
    setDeletingImage(imgUrl);
    try {
      const targetId = product._id || product.id;
      const res = await productsAPI.deleteImage(targetId, imgUrl);
      if (res && res.product) {
        setProduct(res.product);
        setSuccessMsg("Photo deleted successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      alert("Failed to delete photo: " + err.message);
    } finally {
      setDeletingImage(null);
    }
  };

  const handleSetPrimaryImage = async (imgUrl) => {
    setSettingPrimary(imgUrl);
    try {
      const targetId = product._id || product.id;
      const res = await productsAPI.setPrimaryImage(targetId, imgUrl);
      if (res && res.product) {
        setProduct(res.product);
        setSuccessMsg("Primary photo updated!");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      alert("Failed to set primary image: " + err.message);
    } finally {
      setSettingPrimary(null);
    }
  };

  const handleAddExternalImageUrl = async () => {
    if (!externalImageUrl || !externalImageUrl.trim()) {
      alert("Please enter a valid image URL");
      return;
    }
    const cleanUrl = externalImageUrl.trim();
    setAddingExternalUrl(true);
    try {
      const currentList = product.images || [];
      const updatedList = [...currentList, cleanUrl];
      const formData = new FormData();
      formData.append("existingImages", JSON.stringify(updatedList));
      const res = await productsAPI.update(product._id, formData);
      if (res && res.product) {
        setProduct(res.product);
        setExternalImageUrl("");
        setSuccessMsg("External photo URL added successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      alert("Failed to add image URL: " + err.message);
    } finally {
      setAddingExternalUrl(false);
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

  const rawAllImages = [
    ...(product.images || []),
    ...(product.image_url ? [product.image_url] : []),
  ].filter((v, i, a) => a.indexOf(v) === i && v);
  const allImages = rawAllImages.length > 1
    ? rawAllImages.filter((img) => !img.includes("placeholder"))
    : rawAllImages;

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
                  {categories.map((cat) => (
                    <option key={cat.id || cat.slug} value={cat.name}>
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
                <label className="text-xs font-semibold text-stone-700">Selling Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 1499"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600 font-mono font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-700">Original Price (₹ MRP)</label>
                  {Number(form.originalPrice) > 0 &&
                    Number(form.price) > 0 &&
                    Number(form.originalPrice) > Number(form.price) && (
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {Math.round(
                          ((Number(form.originalPrice) - Number(form.price)) /
                            Number(form.originalPrice)) *
                          100
                        )}
                        % OFF
                      </span>
                    )}
                </div>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 2000"
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

            {/* Product Keywords & SEO Search Tags */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Product Keywords &amp; SEO Search Tags</span>
                </span>
                <span className="text-[10px] text-stone-400 font-normal lowercase">comma separated</span>
              </label>
              <input
                type="text"
                value={form.tags || ""}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="e.g. 3d miniature, custom photo gift, couple statue, resin figurine"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600 font-medium"
              />
              {form.tags && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {form.tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300"
                      >
                        #{tag}
                      </span>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* 3D Manufacturing Specs & Customer Dynamic Options */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-600" />
                <span>3D Printing Specs & Customer Dynamic Options</span>
              </h2>
              <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full font-semibold">
                Dynamic Dropdown Options
              </span>
            </div>

            {/* Scale / Dimensions String Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-700">
                  Select Scale / Dimensions Options (Comma-separated string input) <span className="text-amber-600">*</span>
                </label>
                <span className="text-[10px] text-stone-400">
                  Shown under &quot;Select Scale / Dimensions&quot;
                </span>
              </div>
              <input
                type="text"
                value={form.sizes}
                onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                placeholder="e.g. Standard Scale (12-15 cm), Large Display (18-20 cm), Grand 25 cm"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600 font-medium"
              />
              {form.sizes && (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] text-stone-500 font-semibold">Options Preview:</span>
                  {form.sizes
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-800 text-[10px] font-bold"
                      >
                        {s}
                      </span>
                    ))}
                </div>
              )}
            </div>

            {/* Finish / Material String Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-700">
                  Select Finish / Material Options (Comma-separated string input) <span className="text-amber-600">*</span>
                </label>
                <span className="text-[10px] text-stone-400">
                  Shown under &quot;Select Finish / Material&quot;
                </span>
              </div>
              <input
                type="text"
                value={form.finishes}
                onChange={(e) => setForm({ ...form, finishes: e.target.value })}
                placeholder="e.g. Matte Natural, Artisan Hand-Detailed, Gloss Finish, Metallic Bronze"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600 font-medium"
              />
              {form.finishes && (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] text-stone-500 font-semibold">Options Preview:</span>
                  {form.finishes
                    .split(",")
                    .map((f) => f.trim())
                    .filter(Boolean)
                    .map((f, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold"
                      >
                        {f}
                      </span>
                    ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
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
                <label className="text-xs font-semibold text-stone-700">Base Material Tag</label>
                <input
                  type="text"
                  value={form.material}
                  onChange={(e) => setForm({ ...form, material: e.target.value })}
                  placeholder="e.g. UV Resin / Eco-PLA"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200 hover:border-amber-400 cursor-pointer transition-colors shadow-2xs">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <div className="min-w-0">
                  <span className="font-bold text-stone-900 text-xs block">Featured on Home</span>
                  <span className="text-[10px] text-stone-500 leading-tight block mt-0.5">
                    Displays on Homepage Trending & Best-Sellers section
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200 hover:border-amber-400 cursor-pointer transition-colors shadow-2xs">
                <input
                  type="checkbox"
                  checked={form.showInSlider}
                  onChange={(e) => setForm({ ...form, showInSlider: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <div className="min-w-0">
                  <span className="font-bold text-stone-900 text-xs block">In Banner Slider</span>
                  <span className="text-[10px] text-stone-500 leading-tight block mt-0.5">
                    Appears in Top Hero 3D Card Stack banner slider
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200 hover:border-amber-400 cursor-pointer transition-colors shadow-2xs">
                <input
                  type="checkbox"
                  checked={form.isCustomizable}
                  onChange={(e) => setForm({ ...form, isCustomizable: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <div className="min-w-0">
                  <span className="font-bold text-stone-900 text-xs block">3D Customization</span>
                  <span className="text-[10px] text-stone-500 leading-tight block mt-0.5">
                    Allows user photo upload (up to 5 photos) for 3D modeling
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Image Gallery & Save (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Images Gallery Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs space-y-4">
            <h3 className="font-serif font-bold text-sm text-stone-900 pb-3 border-b border-stone-100 flex items-center justify-between">
              <span>Product Images Gallery</span>
              <span className="text-[10px] font-normal text-stone-400">Max 8 photos • 15MB</span>
            </h3>

            {/* Image Guidelines Note */}
            <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed space-y-1">
              <div className="font-bold flex items-center gap-1 text-amber-950">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Upload Guidelines:</span>
              </div>
              <p>• <strong>Aspect Ratio:</strong> 1:1 (Square, 1000×1000px) or 4:3 (1200×900px).</p>
              <p>• <strong>Limits:</strong> Up to 8 photos, max 15MB each (JPG, PNG, WebP).</p>
              <p className="text-[10px] text-amber-800">• Unreferenced server images are automatically pruned when updated/deleted.</p>
            </div>

            {/* Current Images */}
            {allImages.length === 0 ? (
              <div className="p-8 text-center text-stone-400 text-xs bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                No images uploaded yet. Upload below or paste an image link.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {allImages.map((img, idx) => {
                  const resolved = resolveProductImage(img);
                  const isPrimary = idx === 0 || img === product.image_url;
                  return (
                    <div
                      key={idx}
                      className="relative group rounded-xl overflow-hidden border border-stone-200 aspect-square bg-stone-100 shadow-2xs"
                    >
                      <img
                        src={resolved}
                        alt={`Product preview ${idx + 1}`}
                        onError={(e) => handleImageError(e)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Primary Badge */}
                      {isPrimary ? (
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-stone-950/85 text-white backdrop-blur-xs shadow-xs z-10">
                          Primary ★
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(img)}
                          disabled={settingPrimary === img}
                          className="absolute bottom-1.5 left-1.5 right-1.5 py-1 px-2 rounded-lg bg-white/95 hover:bg-white text-stone-800 text-[10px] font-bold backdrop-blur-xs shadow-sm opacity-90 group-hover:opacity-100 transition-opacity z-10 text-center cursor-pointer border border-stone-200"
                          title="Make this photo the main product image"
                        >
                          {settingPrimary === img ? "Setting..." : "Set as Primary"}
                        </button>
                      )}

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(img)}
                        disabled={deletingImage === img}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center text-xs shadow-md transition-all active:scale-90 z-20 cursor-pointer"
                        title="Delete this photo"
                      >
                        {deletingImage === img ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  );
                })}
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

            {/* Add Photo via URL */}
            <div className="space-y-1.5 pt-3 border-t border-stone-100">
              <label className="text-xs font-semibold text-stone-700 block">
                Add Photo via Direct Web Link
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={externalImageUrl}
                  onChange={(e) => setExternalImageUrl(e.target.value)}
                  placeholder="https://images.example.com/item.jpg"
                  className="flex-1 text-xs px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-hidden focus:border-amber-600"
                />
                <button
                  type="button"
                  onClick={handleAddExternalImageUrl}
                  disabled={addingExternalUrl || !externalImageUrl.trim()}
                  className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors shrink-0 cursor-pointer"
                >
                  {addingExternalUrl ? "Adding..." : "Add URL"}
                </button>
              </div>
              <p className="text-[10px] text-stone-400">
                Paste any direct HTTPS image link (Google Drive, Cloudinary, Imgur, etc.)
              </p>
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

