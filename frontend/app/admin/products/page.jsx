"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  Star,
  Trash2,
  Edit2,
  Check,
  X,
  Upload,
  Loader2,
  AlertCircle,
  ExternalLink,
  Layers,
  Sparkles,
  Zap,
  FolderPlus,
  Tag,
  Palette,
  Maximize2,
  Minimize2,
  Image as ImageIcon,
  CheckCircle,
  ArrowRight,
  Eye,
  Info,
  DollarSign,
  Ruler,
  Clock,
  Box,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { productsAPI, categoriesAPI } from "@/lib/api";
import { resolveProductImage, handleImageError } from "@/lib/imageUtils";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [toastMessage, setToastMessage] = useState("");

  // Modal State for Adding / Editing Product
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Quick Add Category State (Inline in Product Modal)
  const [showQuickAddCategory, setShowQuickAddCategory] = useState(false);
  const [quickCategoryName, setQuickCategoryName] = useState("");

  // Form State
  const initialForm = {
    name: "",
    category: "Custom 3D Figurines",
    categoryId: "custom-3d-figurines",
    price: "",
    originalPrice: "",
    material: "High-Density UV Resin & Eco-PLA+",
    print_time: "1-2 working days",
    dimensions: "12-15 cm height",
    shortDescription: "",
    description: "",
    is_featured: false,
    showInSlider: false,
    isCustomizable: true,
    tags: "",
    currentStock: 100,
    status: "active",
    existingImages: [],
  };

  const [form, setForm] = useState(initialForm);

  // Image Management States
  const [selectedFiles, setSelectedFiles] = useState([]); // array of File objects
  const [newFilePreviews, setNewFilePreviews] = useState([]); // array of preview objects
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4500);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter]);

  // Generate and cleanup object URLs for newly selected files
  useEffect(() => {
    const previews = selectedFiles.map((file, idx) => ({
      id: `${file.name}-${file.lastModified}-${idx}`,
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
    }));

    setNewFilePreviews(previews);

    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [selectedFiles]);

  const loadCategories = async () => {
    try {
      const res = await categoriesAPI.getAll();
      if (res && res.categories && res.categories.length > 0) {
        setCategories(res.categories);
      }
    } catch (err) {
      console.warn("Using fallback categories:", err.message);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productsAPI.getAll({
        category: categoryFilter,
        search: searchTerm,
        limit: 100,
      });
      if (res && res.products) {
        setProducts(res.products);
      }
    } catch (err) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // Quick Add Category from inside Product Modal
  const handleQuickAddCategory = async () => {
    if (!quickCategoryName.trim()) return;
    setCategorySubmitting(true);
    try {
      const res = await categoriesAPI.create({ name: quickCategoryName.trim() });
      if (res && res.category) {
        await loadCategories();
        setForm((prev) => ({
          ...prev,
          categoryId: res.category.slug,
          category: res.category.name,
        }));
        setQuickCategoryName("");
        setShowQuickAddCategory(false);
        showToast(`Category "${res.category.name}" added and selected!`);
      }
    } catch (err) {
      alert("Failed to create category: " + err.message);
    } finally {
      setCategorySubmitting(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!confirm(`Are you sure you want to remove category "${name}"?`)) return;
    try {
      const res = await categoriesAPI.delete(id);
      showToast(res.message || "Category removed");
      loadCategories();
    } catch (err) {
      alert("Failed to delete category: " + err.message);
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    const defaultCat = categories[0] || { name: "", slug: "", id: "" };
    setForm({
      ...initialForm,
      category: defaultCat.name || "",
      categoryId: defaultCat.slug || defaultCat.id || "",
      existingImages: [],
    });
    setSelectedFiles([]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setForm({
      name: prod.name,
      category: prod.category,
      categoryId: prod.categoryId,
      price: prod.price,
      originalPrice: prod.originalPrice || "",
      material: prod.material || "High-Density UV Resin & Eco-PLA+",
      print_time: prod.print_time || "1-2 working days",
      dimensions: prod.dimensions || "12-15 cm height",
      shortDescription: prod.shortDescription || "",
      description: prod.description || "",
      is_featured: Boolean(prod.is_featured),
      showInSlider: Boolean(prod.showInSlider),
      isCustomizable: prod.isCustomizable !== undefined ? Boolean(prod.isCustomizable) : true,
      tags: prod.tags ? prod.tags.join(", ") : "",
      currentStock: prod.currentStock !== undefined ? prod.currentStock : 100,
      status: prod.status || "active",
      existingImages: prod.images && prod.images.length > 0 ? prod.images : (prod.image_url ? [prod.image_url] : []),
    });
    setSelectedFiles([]);
    setIsModalOpen(true);
  };

  // Image Selection Handler (Appends files instead of replacing)
  const handleFilesSelected = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const validImageFiles = files.filter((f) => f.type.startsWith("image/"));
      setSelectedFiles((prev) => [...prev, ...validImageFiles]);
      e.target.value = ""; // Reset input so same file can be re-selected if desired
    }
  };

  // Drag and Drop Handlers
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const validImageFiles = files.filter((f) => f.type.startsWith("image/"));
      setSelectedFiles((prev) => [...prev, ...validImageFiles]);
    }
  };

  // Remove Newly Selected File
  const handleRemoveNewFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove Existing Uploaded Image
  const handleRemoveExistingImage = (urlToRemove) => {
    setForm((prev) => ({
      ...prev,
      existingImages: prev.existingImages.filter((img) => img !== urlToRemove),
    }));
  };

  // Set Existing Image as Primary Cover Photo
  const handleSetPrimaryExisting = (url) => {
    setForm((prev) => {
      const filtered = prev.existingImages.filter((img) => img !== url);
      return {
        ...prev,
        existingImages: [url, ...filtered],
      };
    });
    showToast("Selected as primary cover image!");
  };

  // Set New File as Primary Cover Photo
  const handleSetPrimaryNew = (index) => {
    setSelectedFiles((prev) => {
      const target = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [target, ...rest];
    });
    showToast("Selected as primary cover image!");
  };

  const handleToggleFeatured = async (prodId) => {
    try {
      const res = await productsAPI.toggleFeatured(prodId);
      if (res && res.product) {
        setProducts((prev) =>
          prev.map((p) =>
            (p._id === prodId || p.id === prodId) ? { ...p, is_featured: res.product.is_featured } : p
          )
        );
        showToast(res.product.is_featured ? "Marked as Featured on Home" : "Removed from Featured");
      }
    } catch (err) {
      alert("Error toggling featured: " + err.message);
    }
  };

  const handleToggleSlider = async (prodId) => {
    try {
      const res = await productsAPI.toggleSlider(prodId);
      if (res && res.product) {
        setProducts((prev) =>
          prev.map((p) =>
            (p._id === prodId || p.id === prodId) ? { ...p, showInSlider: res.product.showInSlider } : p
          )
        );
        showToast(res.product.showInSlider ? "Added to Hero Banner Slider" : "Removed from Slider");
      }
    } catch (err) {
      alert("Error toggling slider: " + err.message);
    }
  };

  const handleToggleStock = async (prod) => {
    const isCurrentlyInStock = (prod.currentStock > 0 || prod.status === "active");
    const nextStock = isCurrentlyInStock ? 0 : 50;
    const nextStatus = isCurrentlyInStock ? "out_of_stock" : "active";

    try {
      await productsAPI.update(prod._id || prod.id, {
        currentStock: nextStock,
        status: nextStatus,
      });
      setProducts((prev) =>
        prev.map((p) =>
          (p._id === prod._id || p.id === prod.id)
            ? { ...p, currentStock: nextStock, status: nextStatus }
            : p
        )
      );
      showToast(nextStock > 0 ? "Marked IN STOCK (50 units)" : "Marked OUT OF STOCK");
    } catch (err) {
      alert("Failed to update stock: " + err.message);
    }
  };

  const handleDeleteProduct = async (prodId, name) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    try {
      await productsAPI.delete(prodId);
      setProducts((prev) => prev.filter((p) => p._id !== prodId && p.id !== prodId));
      showToast(`Product "${name}" deleted.`);
    } catch (err) {
      alert("Error deleting product: " + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("category", form.category);
      formData.append("categoryId", form.categoryId);
      formData.append("price", form.price);
      if (form.originalPrice) formData.append("originalPrice", form.originalPrice);
      formData.append("material", form.material);
      formData.append("print_time", form.print_time);
      formData.append("dimensions", form.dimensions);
      formData.append("shortDescription", form.shortDescription);
      formData.append("description", form.description);
      formData.append("is_featured", form.is_featured);
      formData.append("showInSlider", form.showInSlider);
      formData.append("isCustomizable", form.isCustomizable);
      formData.append("currentStock", form.currentStock);
      formData.append("status", form.status);

      if (form.tags) {
        const tagArr = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
        formData.append("tags", JSON.stringify(tagArr));
      }

      if (form.existingImages && form.existingImages.length > 0) {
        formData.append("existingImages", JSON.stringify(form.existingImages));
      }

      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      if (editingProduct) {
        const res = await productsAPI.update(editingProduct._id || editingProduct.id, formData);
        if (res && res.product) {
          setProducts((prev) =>
            prev.map((p) =>
              (p._id === editingProduct._id || p.id === editingProduct.id) ? res.product : p
            )
          );
        }
        showToast("3D Product updated successfully!");
      } else {
        const res = await productsAPI.create(formData);
        if (res && res.product) {
          setProducts((prev) => [res.product, ...prev]);
        }
        showToast("New 3D Product added to catalog!");
      }

      setIsModalOpen(false);
    } catch (err) {
      alert("Failed to save product: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Determine active cover image for spotlight preview
  const primaryCoverImage =
    form.existingImages && form.existingImages.length > 0
      ? resolveProductImage(form.existingImages[0])
      : newFilePreviews.length > 0
      ? newFilePreviews[0].url
      : null;

  const totalImageCount = (form.existingImages?.length || 0) + newFilePreviews.length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-stone-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Products & Categories Catalog</h1>
          <p className="text-xs text-stone-600">
            Create custom 3D products, manage dynamic store categories, toggle live inventory, and featured displays.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Manage Categories Link */}
          <Link
            href="/admin/categories"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-800 font-semibold text-xs transition-colors shadow-2xs"
          >
            <Layers className="w-4 h-4 text-amber-600" />
            <span>Manage Categories & Priority ({categories.length}) →</span>
          </Link>

          {/* Add New Product Button */}
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New 3D Product</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-2xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchProducts();
          }}
          className="relative flex-1 min-w-[200px]"
        >
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by title, SKU, or tags..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
        </form>

        <div className="flex items-center gap-2">
          {/* Dynamic Categories Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium text-stone-700 focus:bg-white focus:outline-hidden focus:border-amber-600 cursor-pointer"
          >
            <option value="all">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id || c.slug} value={c.slug || c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Product Grid */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
          <p className="text-xs text-stone-500">Loading catalog items...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-stone-200/90 p-8 space-y-3 shadow-2xs">
          <Package className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="text-base font-serif font-bold text-stone-900">No products found</h3>
          <p className="text-xs text-stone-500">
            Click "Add New 3D Product" to create your first creation in this catalog.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((prod) => {
            const inStock = prod.currentStock > 0 && prod.status !== "out_of_stock";
            return (
              <div
                key={prod._id || prod.id}
                className="bg-white rounded-3xl border border-stone-200/90 shadow-2xs overflow-hidden flex flex-col justify-between group transition-all hover:shadow-md"
              >
                <div>
                  <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
                    <img
                      src={resolveProductImage(prod.image_url || prod.images?.[0])}
                      alt={prod.name}
                      onError={(e) => handleImageError(e)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Top Left Badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start pointer-events-none">
                      {prod.is_featured && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white shadow-xs">
                          Featured
                        </span>
                      )}
                      {prod.showInSlider && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-600 text-white shadow-xs">
                          In Hero Slider ✓
                        </span>
                      )}
                    </div>

                    {/* Top Right Quick Star */}
                    <button
                      onClick={() => handleToggleFeatured(prod._id || prod.id)}
                      className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-xs transition-colors ${
                        prod.is_featured
                          ? "bg-amber-500 text-white"
                          : "bg-white/80 text-stone-400 hover:text-amber-500"
                      }`}
                      title="Toggle Featured on Homepage"
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 truncate max-w-[140px]">
                        {prod.category}
                      </span>

                      {/* 1-Click Stock Toggle Badge */}
                      <button
                        type="button"
                        onClick={() => handleToggleStock(prod)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                          inStock
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100"
                        }`}
                        title="Click to toggle Stock Status"
                      >
                        {inStock ? `In Stock (${prod.currentStock || "✓"})` : "Out of Stock"}
                      </button>
                    </div>

                    <h3 className="font-semibold text-xs text-stone-900 line-clamp-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(prod)}
                        className="hover:text-amber-600 transition-colors text-left"
                        title="Open full product modal"
                      >
                        {prod.name}
                      </button>
                    </h3>

                    <div className="flex items-baseline gap-2">
                      <span className="font-serif font-bold text-sm text-stone-900">
                        ₹{prod.price}
                      </span>
                      {prod.originalPrice > prod.price && (
                        <span className="text-[11px] text-stone-400 line-through">
                          ₹{prod.originalPrice}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-stone-500 line-clamp-2">
                      {prod.shortDescription || prod.description}
                    </p>

                    {/* 1-Click Slider Toggle Button */}
                    <div className="pt-2">
                      <button
                        onClick={() => handleToggleSlider(prod._id || prod.id)}
                        className={`w-full py-1 text-[11px] font-semibold rounded-lg border transition-colors flex items-center justify-center gap-1.5 ${
                          prod.showInSlider
                            ? "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                            : "bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100"
                        }`}
                      >
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span>{prod.showInSlider ? "Active in Hero Slider" : "Add to Hero Slider"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-3 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    {prod.slug && (
                      <Link
                        href={`/products/${prod.slug}`}
                        target="_blank"
                        className="p-1.5 text-stone-400 hover:text-amber-600 transition-colors"
                        title="View live on storefront"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(prod)}
                      className="p-1.5 text-stone-400 hover:text-stone-900 transition-colors"
                      title="Edit product in modal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(prod._id || prod.id, prod.name)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors"
                      title="Delete product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(prod)}
                    className="text-[11px] font-semibold text-amber-700 hover:underline cursor-pointer"
                  >
                    Quick Edit ↗
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* OPTIMIZED FULL-SCREEN / WIDE 3D PRODUCT MODAL */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className={`fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center ${isFullScreen ? "p-0" : "p-2 sm:p-4 md:p-6"}`}>
          <div
            className={`bg-white shadow-2xl flex flex-col overflow-hidden transition-all duration-300 animate-in zoom-in-95 ${
              isFullScreen
                ? "w-full h-full rounded-none"
                : "w-full h-full max-w-6xl max-h-[96vh] rounded-3xl border border-stone-200/90"
            }`}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                  <Box className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base sm:text-lg flex items-center gap-2">
                    <span>{editingProduct ? "Edit 3D Product" : "Add New 3D Creation"}</span>
                    {editingProduct && (
                      <span className="font-mono text-[10px] font-normal text-stone-400 bg-stone-800 px-2 py-0.5 rounded-md">
                        #{editingProduct.id || editingProduct.sku}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-stone-400">
                    High-res media preview, dynamic category tagging, fabrication specs, and live inventory.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Fullscreen Toggle */}
                <button
                  type="button"
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                  title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                  {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-rose-500/20 transition-colors"
                  title="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Scrollable Two-Column Layout */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col justify-between">
              <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                {/* ======================================================== */}
                {/* LEFT COLUMN: IMAGE STUDIO & MEDIA MANAGER (5 COLS) */}
                {/* ======================================================== */}
                <div className="lg:col-span-5 space-y-5">
                  <div className="space-y-1">
                    <span className="font-bold text-xs uppercase tracking-wider text-stone-700 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-amber-600" />
                        <span>Product Visual Gallery</span>
                      </span>
                      <span className="text-[11px] font-semibold text-stone-500">
                        {totalImageCount} photo(s)
                      </span>
                    </span>
                    <p className="text-[11px] text-stone-500">
                      Upload multi-angle photos or renders. The first image serves as the primary catalog cover.
                    </p>
                  </div>

                  {/* Spotlight Cover Photo Preview */}
                  <div className="relative aspect-4/3 w-full rounded-2xl bg-stone-100 border border-stone-200 overflow-hidden shadow-inner flex items-center justify-center group">
                    {primaryCoverImage ? (
                      <>
                        <img
                          src={primaryCoverImage}
                          alt="Cover Spotlight"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                          onError={(e) => handleImageError(e)}
                        />
                        <div className="absolute top-2.5 left-2.5 bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                          <Star className="w-3 h-3 text-amber-400 fill-current" />
                          <span>Primary Cover Photo</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-6 space-y-2 text-stone-400">
                        <ImageIcon className="w-12 h-12 mx-auto stroke-1" />
                        <span className="block text-xs font-semibold text-stone-500">
                          No images selected yet
                        </span>
                        <span className="block text-[11px] text-stone-400">
                          Upload photos below to set the primary product preview.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Upload Dropzone with Drag & Drop */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`p-4 rounded-2xl border-2 border-dashed transition-all text-center space-y-2 ${
                      isDragging
                        ? "border-amber-600 bg-amber-50/60 scale-[0.99]"
                        : "border-stone-300 bg-stone-50 hover:bg-stone-100/60"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFilesSelected}
                      className="hidden"
                    />

                    <div className="w-10 h-10 mx-auto rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline"
                      >
                        + Click to Add Photos
                      </button>
                      <span className="text-stone-500 text-xs"> or drag and drop here</span>
                      <p className="text-[10px] text-stone-400 mt-0.5">
                        JPG, PNG, WebP supported. You can select and append multiple files.
                      </p>
                    </div>
                  </div>

                  {/* Visual Thumbnails Gallery with Individual Remove & Set-Cover buttons */}
                  {totalImageCount > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600">
                        <span>Gallery Thumbnails ({totalImageCount})</span>
                        <span className="text-[10px] text-stone-400">★ Star icon sets cover photo</span>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1 border border-stone-200 rounded-2xl bg-stone-50/50">
                        {/* 1. Existing Uploaded Images (When Editing) */}
                        {form.existingImages?.map((url, idx) => {
                          const isCover = idx === 0;
                          return (
                            <div
                              key={`existing-${idx}`}
                              className={`relative aspect-square rounded-xl overflow-hidden border bg-white shadow-2xs group ${
                                isCover ? "border-amber-500 ring-2 ring-amber-500/20" : "border-stone-200"
                              }`}
                            >
                              <img
                                src={resolveProductImage(url)}
                                alt={`Existing ${idx + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => handleImageError(e)}
                              />

                              {/* Badges */}
                              {isCover && (
                                <span className="absolute bottom-1 left-1 bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded shadow-xs">
                                  Cover
                                </span>
                              )}

                              {/* Overlay Actions on Hover */}
                              <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                                {!isCover && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetPrimaryExisting(url)}
                                    className="p-1 rounded-md bg-white text-stone-800 hover:text-amber-600 shadow-xs"
                                    title="Set as Primary Cover Photo"
                                  >
                                    <Star className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveExistingImage(url)}
                                  className="p-1 rounded-md bg-rose-600 text-white hover:bg-rose-700 shadow-xs"
                                  title="Remove image"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {/* 2. Newly Selected Local File Previews */}
                        {newFilePreviews.map((preview, idx) => {
                          const isCover = !form.existingImages?.length && idx === 0;
                          return (
                            <div
                              key={preview.id}
                              className={`relative aspect-square rounded-xl overflow-hidden border bg-white shadow-2xs group ${
                                isCover ? "border-amber-500 ring-2 ring-amber-500/20" : "border-stone-200"
                              }`}
                            >
                              <img
                                src={preview.url}
                                alt={preview.name}
                                className="w-full h-full object-cover"
                              />

                              {/* New File Badge */}
                              <span className="absolute top-1 left-1 bg-blue-600 text-white text-[8px] font-bold px-1 py-0.2 rounded shadow-xs">
                                New
                              </span>

                              {isCover && (
                                <span className="absolute bottom-1 left-1 bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded shadow-xs">
                                  Cover
                                </span>
                              )}

                              {/* Overlay Actions on Hover */}
                              <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                                {!isCover && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetPrimaryNew(idx)}
                                    className="p-1 rounded-md bg-white text-stone-800 hover:text-amber-600 shadow-xs"
                                    title="Set as Primary Cover Photo"
                                  >
                                    <Star className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveNewFile(idx)}
                                  className="p-1 rounded-md bg-rose-600 text-white hover:bg-rose-700 shadow-xs"
                                  title="Remove file"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {/* Quick "+ Add More" Thumbnail Tile */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="aspect-square rounded-xl border-2 border-dashed border-stone-300 hover:border-amber-600 hover:bg-amber-50/40 transition-colors flex flex-col items-center justify-center text-stone-400 hover:text-amber-700 cursor-pointer"
                          title="Add more photos"
                        >
                          <Plus className="w-5 h-5 mb-0.5" />
                          <span className="text-[10px] font-bold">+ Add</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* ======================================================== */}
                {/* RIGHT COLUMN: SPECIFICATIONS, PRICING & OPTIONS (7 COLS) */}
                {/* ======================================================== */}
                <div className="lg:col-span-7 space-y-5 text-xs">
                  {/* 1. Core Title & Category */}
                  <div className="bg-stone-50/70 p-4 sm:p-5 rounded-2xl border border-stone-200/90 space-y-3.5">
                    <span className="font-bold text-xs uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-amber-600" />
                      <span>Product Title & Dynamic Category</span>
                    </span>

                    <div className="space-y-1">
                      <label className="font-semibold text-stone-700">Creation Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Personalized 3D Full-Body Couple Figurine (15cm)"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-900 focus:outline-hidden focus:border-amber-600 text-xs font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Dynamic Category Selector */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="font-semibold text-stone-700">Category *</label>
                          <button
                            type="button"
                            onClick={() => setShowQuickAddCategory(!showQuickAddCategory)}
                            className="text-[11px] font-semibold text-amber-700 hover:underline flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>+ New Category</span>
                          </button>
                        </div>

                        {showQuickAddCategory ? (
                          <div className="flex items-center gap-1.5 p-1 bg-amber-50 rounded-xl border border-amber-200">
                            <input
                              type="text"
                              placeholder="Type new category..."
                              value={quickCategoryName}
                              onChange={(e) => setQuickCategoryName(e.target.value)}
                              className="px-2 py-1 bg-white rounded-lg border border-stone-200 text-xs text-stone-900 flex-1 focus:outline-hidden focus:border-amber-600"
                            />
                            <button
                              type="button"
                              onClick={handleQuickAddCategory}
                              disabled={categorySubmitting}
                              className="px-2.5 py-1 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 cursor-pointer"
                            >
                              Add
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowQuickAddCategory(false)}
                              className="p-1 text-stone-400 hover:text-stone-700"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <select
                            value={form.categoryId}
                            onChange={(e) => {
                              const selectedCat = categories.find((c) => (c.slug || c.id) === e.target.value);
                              setForm({
                                ...form,
                                categoryId: e.target.value,
                                category: selectedCat ? selectedCat.name : e.target.value,
                              });
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-stone-900 focus:outline-hidden focus:border-amber-600 cursor-pointer"
                          >
                            {categories.map((c) => (
                              <option key={c.id || c.slug} value={c.slug || c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Stock Inventory */}
                      <div className="space-y-1">
                        <label className="font-semibold text-stone-700">Available Stock Units</label>
                        <input
                          type="number"
                          min={0}
                          value={form.currentStock}
                          onChange={(e) => setForm({ ...form, currentStock: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-stone-900 focus:outline-hidden focus:border-amber-600 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Pricing & Commercials */}
                  <div className="bg-stone-50/70 p-4 sm:p-5 rounded-2xl border border-stone-200/90 space-y-3">
                    <span className="font-bold text-xs uppercase tracking-wider text-stone-700 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        <span>Pricing & Value</span>
                      </span>
                      {Number(form.originalPrice) > Number(form.price) && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {Math.round(((Number(form.originalPrice) - Number(form.price)) / Number(form.originalPrice)) * 100)}% Discount
                        </span>
                      )}
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="font-semibold text-stone-700">Selling Price (₹) *</label>
                        <input
                          type="number"
                          required
                          min={0}
                          placeholder="1499"
                          value={form.price}
                          onChange={(e) => setForm({ ...form, price: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-stone-900 focus:outline-hidden focus:border-amber-600 font-bold text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-stone-700">Original / MRP (₹)</label>
                        <input
                          type="number"
                          min={0}
                          placeholder="1999"
                          value={form.originalPrice}
                          onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-stone-900 focus:outline-hidden focus:border-amber-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. 3D Fabrication Technical Specs */}
                  <div className="bg-stone-50/70 p-4 sm:p-5 rounded-2xl border border-stone-200/90 space-y-3">
                    <span className="font-bold text-xs uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                      <Ruler className="w-4 h-4 text-purple-600" />
                      <span>3D Fabrication Specifications</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="font-semibold text-stone-700">Material</label>
                        <input
                          type="text"
                          placeholder="e.g. UV Resin / PLA+"
                          value={form.material}
                          onChange={(e) => setForm({ ...form, material: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-stone-900 focus:outline-hidden focus:border-amber-600"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-stone-700">Dimensions</label>
                        <input
                          type="text"
                          placeholder="e.g. 15cm Height"
                          value={form.dimensions}
                          onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-stone-900 focus:outline-hidden focus:border-amber-600"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-stone-700">Fabrication Time</label>
                        <input
                          type="text"
                          placeholder="e.g. 1-2 Days"
                          value={form.print_time}
                          onChange={(e) => setForm({ ...form, print_time: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-stone-900 focus:outline-hidden focus:border-amber-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. Storytelling & Descriptions */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-stone-700">Short Card Hook Tagline</label>
                      <input
                        type="text"
                        placeholder="One-line hook shown on catalog cards (e.g. Turn your favorite memories into 3D miniatures)"
                        value={form.shortDescription}
                        onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-stone-700">Full Craftsmanship Description</label>
                      <textarea
                        rows={3}
                        placeholder="Describe the 3D sculpting process, material durability, packaging, and care details..."
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
                      />
                    </div>
                  </div>

                  {/* 5. Product Keywords & SEO Search Tags */}
                  <div className="space-y-2 bg-stone-50/70 p-4 rounded-2xl border border-stone-200/90">
                    <label className="font-bold text-xs uppercase tracking-wider text-stone-700 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Product Keywords &amp; SEO Search Tags</span>
                      </span>
                      <span className="text-[10px] text-stone-400 font-normal lowercase">comma separated</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 3d miniature, custom photo gift, couple statue, resin figurine"
                      value={form.tags || ""}
                      onChange={(e) => setForm({ ...form, tags: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-900 focus:outline-hidden focus:border-amber-600 text-xs font-medium"
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

                  {/* 6. Customization & Display Controls */}
                  <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/70 space-y-2.5">
                    <span className="font-bold text-xs text-amber-950 block">
                      Storefront Visibility & Customization
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-stone-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.is_featured}
                          onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                          className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                        />
                        <span className="font-semibold text-stone-800 text-[11px]">
                          Featured on Home
                        </span>
                      </label>

                      <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-stone-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.showInSlider}
                          onChange={(e) => setForm({ ...form, showInSlider: e.target.checked })}
                          className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                        />
                        <span className="font-semibold text-stone-800 text-[11px]">
                          In Banner Slider
                        </span>
                      </label>

                      <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-stone-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.isCustomizable}
                          onChange={(e) => setForm({ ...form, isCustomizable: e.target.checked })}
                          className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                        />
                        <span className="font-semibold text-stone-800 text-[11px]">
                          3D Customization
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Sticky Footer */}
              <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <span className="font-semibold text-stone-800">
                    {form.name || "Untitled Creation"}
                  </span>
                  <span>•</span>
                  <span>₹{form.price || "0"}</span>
                  <span>•</span>
                  <span>{totalImageCount} photo(s)</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{editingProduct ? "Save Changes" : "Create 3D Product"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
