"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  ExternalLink,
  Save,
  X,
  Check,
  Sparkles,
  Search,
  Loader2,
  AlertCircle,
  FolderPlus,
  Palette,
  Eye,
  RefreshCw,
  Hash,
  ShoppingBag,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { categoriesAPI } from "@/lib/api";
import { resolveProductImage, handleImageError } from "@/lib/imageUtils";

const COLOR_PRESETS = [
  "#D97706", // Amber
  "#EA580C", // Orange
  "#DC2626", // Red
  "#7C3AED", // Violet
  "#2563EB", // Blue
  "#059669", // Emerald
  "#0D9488", // Teal
  "#1C1917", // Black/Dark
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Create / Edit Drawer or Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // null = create mode
  const [submitting, setSubmitting] = useState(false);
  const [categoryImageFile, setCategoryImageFile] = useState(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState("");
  const categoryFileInputRef = useRef(null);

  // Form State
  const initialFormState = {
    name: "",
    slug: "",
    tagline: "",
    shortDescription: "",
    description: "",
    accentColor: "#D97706",
    image_url: "",
    order: 1,
    status: "active",
  };
  const [formData, setFormData] = useState(initialFormState);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4500);
  };

  const loadCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await categoriesAPI.getAllAdmin();
      if (res && res.categories) {
        setCategories(res.categories);
      } else {
        // Fallback to public categories
        const pub = await categoriesAPI.getAll();
        setCategories(pub?.categories || []);
      }
    } catch (err) {
      console.warn("Failed to load admin categories:", err.message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Open Create Form
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setCategoryImageFile(null);
    setCategoryImagePreview("");
    setFormData({
      ...initialFormState,
      order: (categories.length > 0 ? Math.max(...categories.map((c) => c.order || 0)) : 0) + 1,
    });
    setIsFormOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setCategoryImageFile(null);
    setCategoryImagePreview(cat.image_url || "");
    setFormData({
      name: cat.name || "",
      slug: cat.slug || "",
      tagline: cat.tagline || "",
      shortDescription: cat.shortDescription || "",
      description: cat.description || "",
      accentColor: cat.accentColor || "#D97706",
      image_url: cat.image_url || "",
      order: cat.order !== undefined ? cat.order : 1,
      status: cat.status || "active",
    });
    setIsFormOpen(true);
  };

  const handleCategoryFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file (JPG, PNG, WebP).");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert("File size exceeds 10MB limit.");
        return;
      }
      setCategoryImageFile(file);
      setCategoryImagePreview(URL.createObjectURL(file));
    }
  };

  // Submit Form (Create or Update)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      const dataToSend = new FormData();
      dataToSend.append("name", formData.name.trim());
      dataToSend.append("slug", formData.slug.trim());
      if (formData.tagline) dataToSend.append("tagline", formData.tagline.trim());
      if (formData.shortDescription) dataToSend.append("shortDescription", formData.shortDescription.trim());
      if (formData.description) dataToSend.append("description", formData.description.trim());
      if (formData.accentColor) dataToSend.append("accentColor", formData.accentColor.trim());
      dataToSend.append("order", formData.order);
      dataToSend.append("status", formData.status || "active");

      if (categoryImageFile) {
        dataToSend.append("image", categoryImageFile);
      } else if (formData.image_url && formData.image_url.trim()) {
        dataToSend.append("image_url", formData.image_url.trim());
      } else if (editingCategory && !formData.image_url) {
        dataToSend.append("image_url", "");
        dataToSend.append("removeImage", "true");
      }

      if (editingCategory) {
        // Update existing category
        const res = await categoriesAPI.update(editingCategory._id, dataToSend);
        showToast(`Category "${res.category?.name || formData.name}" updated successfully!`);
      } else {
        // Create new category
        const res = await categoriesAPI.create(dataToSend);
        showToast(`Category "${res.category?.name || formData.name}" created with priority #${formData.order}!`);
      }
      setIsFormOpen(false);
      await loadCategories();
    } catch (err) {
      alert("Failed to save category: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 1-Click Priority Update
  const handleUpdatePriority = async (catId, newOrder) => {
    if (!catId) return;
    const parsed = Number(newOrder);
    if (isNaN(parsed) || parsed < 1) return;

    try {
      await categoriesAPI.update(catId, { order: parsed });
      showToast(`Priority shifted to #${parsed}! Re-sorted live across storefront.`);
      await loadCategories();
    } catch (err) {
      alert("Failed to update priority: " + err.message);
    }
  };

  // Swap / Move Up (Increase Priority)
  const handleMoveUp = async (cat, index) => {
    if (index === 0) return; // already top
    const currentOrder = cat.order !== undefined ? cat.order : index + 1;
    const targetOrder = Math.max(1, currentOrder - 1);
    await handleUpdatePriority(cat._id, targetOrder);
  };

  // Move Down (Decrease Priority)
  const handleMoveDown = async (cat, index) => {
    const currentOrder = cat.order !== undefined ? cat.order : index + 1;
    const targetOrder = currentOrder + 1;
    await handleUpdatePriority(cat._id, targetOrder);
  };

  // Delete Category
  const handleDeleteCategory = async (cat) => {
    if (!confirm(`Are you sure you want to permanently delete category "${cat.name}"? Products assigned to it may need re-categorization.`)) {
      return;
    }
    try {
      await categoriesAPI.delete(cat._id);
      showToast(`Category "${cat.name}" deleted successfully.`);
      await loadCategories();
    } catch (err) {
      alert("Failed to delete category: " + err.message);
    }
  };

  // Filtered Categories
  const filteredCategories = categories.filter((cat) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      cat.name?.toLowerCase().includes(q) ||
      cat.slug?.toLowerCase().includes(q) ||
      cat.tagline?.toLowerCase().includes(q) ||
      cat.shortDescription?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-stone-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-stone-900">
              Categories & Storefront Priority
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
              Live Priority Control
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-1 max-w-2xl">
            Control which 3D categories appear first on the home page and /shop filter tabs. Reorder with 1-click arrows, adjust priority numbers, or customize descriptions and accent colors.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadCategories}
            className="p-2.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs transition-colors shadow-2xs cursor-pointer"
            title="Refresh Categories"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-600" : ""}`} />
          </button>

          <Link
            href="/shop"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-800 font-semibold text-xs transition-colors shadow-2xs"
          >
            <span>View Storefront Shop</span>
            <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
          </Link>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Category</span>
          </button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
            Total Categories
          </span>
          <span className="text-xl font-bold font-serif text-stone-900 mt-1 block">
            {categories.length}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
            Active on Storefront
          </span>
          <span className="text-xl font-bold font-serif text-emerald-700 mt-1 block">
            {categories.filter((c) => c.status !== "inactive").length}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
            Top #1 Priority Group
          </span>
          <span className="text-sm font-bold text-amber-900 truncate mt-1 block">
            {categories[0]?.name || "Custom 3D Figurines"}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
            Quick Action
          </span>
          <Link
            href="/admin/products"
            className="text-xs font-semibold text-amber-700 hover:underline mt-1 inline-flex items-center gap-1"
          >
            <span>Manage Products →</span>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search categories by name, slug, or keywords..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-600 text-stone-900"
          />
        </div>

        <span className="text-xs text-stone-500">
          Showing <strong>{filteredCategories.length}</strong> categories (Sorted by Priority)
        </span>
      </div>

      {/* Categories Priority Table & Cards */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-600" />
            <h2 className="font-bold text-sm text-stone-900">
              Active Category Hierarchy & Display Order
            </h2>
          </div>
          <span className="text-[11px] text-stone-500">
            Lower priority number (#1, #2) appears first on customer navigation
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
            <p className="text-xs text-stone-500">Loading categories and live order...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-sm font-semibold text-stone-800">No categories found matching &quot;{searchTerm}&quot;</p>
            <p className="text-xs text-stone-500">Try adjusting your search query.</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filteredCategories.map((cat, idx) => {
              const priorityNum = cat.order !== undefined ? cat.order : idx + 1;
              const isFirst = idx === 0;
              const isLast = idx === filteredCategories.length - 1;

              return (
                <div
                  key={cat._id || cat.slug || idx}
                  className="p-4 sm:p-5 hover:bg-stone-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Priority Ranker + Color Dot + Details */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                    {/* Priority Control Box */}
                    <div className="flex items-center bg-stone-100 border border-stone-300 rounded-xl p-1 shadow-2xs shrink-0">
                      <button
                        type="button"
                        disabled={isFirst}
                        onClick={() => handleMoveUp(cat, idx)}
                        className="p-1.5 hover:bg-white rounded-lg text-stone-600 hover:text-amber-700 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                        title="Move Up (Increase Priority - Appear Earlier)"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center px-1.5" title="Category Display Priority">
                        <span className="text-[10px] font-bold text-amber-700 mr-0.5">#</span>
                        <input
                          type="number"
                          min="1"
                          value={priorityNum}
                          onChange={(e) => handleUpdatePriority(cat._id, e.target.value)}
                          className="w-7 text-center text-xs font-black text-amber-950 bg-transparent focus:outline-hidden"
                          title="Directly edit priority number"
                        />
                      </div>

                      <button
                        type="button"
                        disabled={isLast}
                        onClick={() => handleMoveDown(cat, idx)}
                        className="p-1.5 hover:bg-white rounded-lg text-stone-600 hover:text-amber-700 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                        title="Move Down (Decrease Priority - Appear Later)"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Color Swatch */}
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs ring-2 ring-white"
                      style={{ backgroundColor: cat.accentColor || "#D97706" }}
                      title={`Accent Color: ${cat.accentColor || "#D97706"}`}
                    />

                    {/* Category Cover Photo Thumbnail */}
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0 shadow-2xs group">
                      <img
                        src={resolveProductImage(cat.image_url)}
                        alt={cat.name}
                        onError={(e) => handleImageError(e)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>

                    {/* Category Title & Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm text-stone-900">{cat.name}</h3>
                        <span className="font-mono text-[10px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                          {cat.slug || cat.id}
                        </span>
                        {cat.status === "inactive" && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-200 text-stone-700">
                            Inactive
                          </span>
                        )}
                      </div>

                      {cat.tagline && (
                        <p className="text-xs text-amber-800 font-medium mt-0.5">
                          {cat.tagline}
                        </p>
                      )}

                      {cat.shortDescription && (
                        <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5 max-w-xl">
                          {cat.shortDescription}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Item Count + Operations */}
                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-200">
                      {cat.itemCount || `${cat.productCount || 0} Products`}
                    </span>

                    {/* View in Shop */}
                    <Link
                      href={`/shop?category=${cat.slug || cat.id}`}
                      target="_blank"
                      className="p-2 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors"
                      title="View live category catalog in new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(cat)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition-colors cursor-pointer"
                      title="Edit Category Details & Specs"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-amber-700" />
                      <span>Edit</span>
                    </button>

                    {/* Delete Button */}
                    {cat._id && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat)}
                        className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete this category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* CREATE / EDIT CATEGORY DRAWER / MODAL */}
      {/* ======================================================== */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  {editingCategory ? `Edit Category: ${editingCategory.name}` : "Create New Storefront Category"}
                </h3>
                <p className="text-xs text-stone-500">
                  Configure storefront title, ordering priority, and accent styling.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-stone-700">Category Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3D Architectural Scale Models"
                    value={formData.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setFormData({
                        ...formData,
                        name: newName,
                        // Auto-generate slug if not editing
                        slug: editingCategory ? formData.slug : newName.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-"),
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Display Priority *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="1"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600 font-bold"
                  />
                  <span className="text-[10px] text-stone-400 block">1 = Shows first</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">URL Slug (Unique)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. architectural-models"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 font-mono text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Tagline / Catchphrase</label>
                  <input
                    type="text"
                    placeholder="e.g. Precision structural prototypes"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Short Description</label>
                <input
                  type="text"
                  placeholder="e.g. Fine detail structural scale models for builders, architects and collectors."
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
                />
              </div>

              {/* Category Cover Image Upload & Guidelines */}
              <div className="space-y-2 p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-stone-700 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                    <span>Category Cover Image</span>
                  </label>
                  <span className="text-[10px] text-stone-500 font-medium">Max 1 Image • Up to 10MB</span>
                </div>

                {/* Live Preview Box */}
                {(categoryImagePreview || formData.image_url) && (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 group">
                    <img
                      src={resolveProductImage(categoryImagePreview || formData.image_url)}
                      alt="Category Preview"
                      onError={(e) => handleImageError(e)}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => categoryFileInputRef.current?.click()}
                        className="px-3 py-1 bg-white text-stone-900 rounded-lg text-xs font-semibold hover:bg-stone-100 cursor-pointer"
                      >
                        Change Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCategoryImageFile(null);
                          setCategoryImagePreview("");
                          setFormData((prev) => ({ ...prev, image_url: "" }));
                          if (categoryFileInputRef.current) {
                            categoryFileInputRef.current.value = "";
                          }
                        }}
                        className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 cursor-pointer"
                        title="Remove Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <input
                  ref={categoryFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleCategoryFileChange}
                  className="hidden"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => categoryFileInputRef.current?.click()}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-amber-700" />
                    <span>{categoryImagePreview ? "Choose Different Image" : "Upload Category Image"}</span>
                  </button>
                </div>

                {/* Important Guidelines Note */}
                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed space-y-1">
                  <div className="font-bold flex items-center gap-1 text-amber-950">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Upload Guidelines:</span>
                  </div>
                  <p>
                    • <strong>Aspect Ratio:</strong> Recommended <strong>1:1</strong> (Square, 600×600px) or <strong>16:9</strong> (1200×675px) for crisp storefront display.
                  </p>
                  <p>
                    • <strong>Limits:</strong> Maximum <strong>1 photo</strong> per category, up to <strong>10MB</strong> each (JPG, PNG, WebP).
                  </p>
                  <p className="text-[10px] text-amber-800">
                    • When category is updated/deleted, unreferenced image files are automatically pruned from server storage.
                  </p>
                </div>
              </div>

              {/* Accent Color Palette */}
              <div className="space-y-1.5 pt-1">
                <label className="font-semibold text-stone-700 flex items-center justify-between">
                  <span>Category Accent Color:</span>
                  <span className="font-mono text-stone-500">{formData.accentColor}</span>
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, accentColor: color })}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${formData.accentColor === color ? "border-stone-900 scale-110 shadow-sm" : "border-transparent"
                        }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <input
                    type="color"
                    value={formData.accentColor}
                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    className="w-7 h-7 rounded-full border border-stone-200 cursor-pointer p-0"
                    title="Choose custom color"
                  />
                </div>
              </div>

              {/* Status Radio */}
              <div className="space-y-1.5 pt-1">
                <label className="font-semibold text-stone-700 block">Visibility Status</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formData.status === "active"}
                      onChange={() => setFormData({ ...formData, status: "active" })}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="font-medium text-stone-800">Active (Visible in Store)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={formData.status === "inactive"}
                      onChange={() => setFormData({ ...formData, status: "inactive" })}
                      className="text-stone-600 focus:ring-stone-500"
                    />
                    <span className="font-medium text-stone-500">Inactive (Hidden)</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-60 cursor-pointer"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingCategory ? "Save Changes" : "Create Category"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
