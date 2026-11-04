"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { productsAPI } from "@/lib/api";
import { CATEGORIES } from "@/data/categories";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal State for Adding / Editing Product
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
  };

  const [form, setForm] = useState(initialForm);
  const [imageFiles, setImageFiles] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter]);

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

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setForm(initialForm);
    setImageFiles([]);
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
      isCustomizable: prod.isCustomizable !== false,
      tags: Array.isArray(prod.tags) ? prod.tags.join(", ") : "",
      currentStock: prod.currentStock || 100,
    });
    setImageFiles([]);
    setIsModalOpen(true);
  };

  const handleToggleFeatured = async (productId) => {
    try {
      const res = await productsAPI.toggleFeatured(productId);
      setProducts((prev) =>
        prev.map((p) =>
          p._id === productId ? { ...p, is_featured: res.is_featured } : p
        )
      );
    } catch (err) {
      alert("Error toggling featured: " + err.message);
    }
  };

  const handleToggleSlider = async (productId) => {
    try {
      const res = await productsAPI.toggleSlider(productId);
      setProducts((prev) =>
        prev.map((p) =>
          p._id === productId ? { ...p, showInSlider: res.showInSlider } : p
        )
      );
    } catch (err) {
      alert("Error toggling slider status: " + err.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm("Are you sure you want to remove this product?")) return;
    try {
      await productsAPI.delete(productId);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      alert("Error deleting product: " + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.price || !form.category) {
      alert("Please fill in the product name, price, and category.");
      return;
    }

    setSubmitting(true);
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
      formData.append("showInSlider", form.showInSlider);
      formData.append("isCustomizable", form.isCustomizable);
      formData.append("tags", form.tags);
      formData.append("currentStock", form.currentStock);

      for (let i = 0; i < imageFiles.length; i++) {
        formData.append("images", imageFiles[i]);
      }

      if (editingProduct) {
        const res = await productsAPI.update(editingProduct._id, formData);
        setProducts((prev) =>
          prev.map((p) => (p._id === editingProduct._id ? res.product : p))
        );
        alert("Product updated successfully!");
      } else {
        const res = await productsAPI.create(formData);
        if (res && res.product) {
          setProducts((prev) => [res.product, ...prev]);
        }
        alert("Product added successfully!");
      }

      setIsModalOpen(false);
    } catch (err) {
      alert("Failed to save product: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Products Catalog</h1>
          <p className="text-xs text-stone-600">
            Add new 3D printed creations, update pricing, specifications, and featured showcase.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New 3D Product</span>
        </button>
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
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium text-stone-700 focus:bg-white focus:outline-hidden focus:border-amber-600"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
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
          {products.map((prod) => (
            <div
              key={prod._id || prod.id}
              className="bg-white rounded-3xl border border-stone-200/90 shadow-2xs overflow-hidden flex flex-col justify-between group transition-all hover:shadow-md"
            >
              <div>
                <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
                  <img
                    src={prod.image_url || prod.images?.[0] || "/images/products/placeholder.jpeg"}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start pointer-events-none">
                    {prod.is_featured && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white shadow-xs">
                        Featured
                      </span>
                    )}
                    {prod.showInSlider && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-600 text-white shadow-xs">
                        In Slide ✓
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleToggleFeatured(prod._id)}
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
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                    {prod.category}
                  </div>
                  <h3 className="font-semibold text-xs text-stone-900 line-clamp-1">
                    <Link
                      href={`/admin/products/${prod._id}`}
                      className="hover:text-amber-600 transition-colors"
                      title="Open full product detail page"
                    >
                      {prod.name}
                    </Link>
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

                  {/* Slider Toggle Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleToggleSlider(prod._id)}
                      className={`w-full py-1.5 px-3 rounded-xl text-xs font-semibold border flex items-center justify-between transition-colors cursor-pointer ${
                        prod.showInSlider
                          ? "bg-amber-500/10 text-amber-900 border-amber-300 hover:bg-amber-500/20"
                          : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                      }`}
                      title="Show or hide from homepage 3D slider"
                    >
                      <span className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            prod.showInSlider ? "bg-amber-600 animate-pulse" : "bg-stone-300"
                          }`}
                        />
                        <span>Show in 3D Slide</span>
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          prod.showInSlider
                            ? "bg-amber-600 text-white"
                            : "bg-stone-200 text-stone-600"
                        }`}
                      >
                        {prod.showInSlider ? "In Slide ✓" : "Off"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 border-t border-stone-100 flex items-center justify-between text-xs mt-3">
                <Link
                  href={`/admin/products/${prod._id}`}
                  className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-medium text-[11px] transition-colors"
                >
                  Full Specs ↗
                </Link>

                <div className="flex items-center gap-2">
                  <a
                    href={`/products/${prod.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-500 transition-colors"
                    title="Preview in Store"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handleOpenEditModal(prod)}
                    className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                    title="Quick Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(prod._id)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                    title="Delete Product"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900">
                  {editingProduct ? "Edit 3D Product" : "Add New 3D Product"}
                </h3>
                <p className="text-xs text-stone-500">
                  Fill in product information, pricing, specifications, and imagery.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Custom 3D Couple Miniature Figurine"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Category *</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => {
                      const selectedCat = CATEGORIES.find((c) => c.id === e.target.value);
                      setForm({
                        ...form,
                        categoryId: e.target.value,
                        category: selectedCat ? selectedCat.name : e.target.value,
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Stock Count</label>
                  <input
                    type="number"
                    value={form.currentStock}
                    onChange={(e) => setForm({ ...form, currentStock: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="1499"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Original / MRP Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="1999"
                    value={form.originalPrice}
                    onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Material</label>
                  <input
                    type="text"
                    value={form.material}
                    onChange={(e) => setForm({ ...form, material: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Dimensions</label>
                  <input
                    type="text"
                    value={form.dimensions}
                    onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Print Time</label>
                  <input
                    type="text"
                    value={form.print_time}
                    onChange={(e) => setForm({ ...form, print_time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Short Summary</label>
                <input
                  type="text"
                  placeholder="One sentence overview for product card"
                  value={form.shortDescription}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Full Description</label>
                <textarea
                  rows={3}
                  placeholder="Detailed artisanal craftsmanship, specifications, finishes..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600 resize-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-stone-700">Upload Product Images (Multiple Supported)</label>
                  {imageFiles.length > 0 && (
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                      {imageFiles.length} file(s) selected
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setImageFiles((prev) => [...prev, ...files]);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-700 text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200"
                />

                {/* Previews of Selected Multiple Files */}
                {imageFiles.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
                    {imageFiles.map((file, idx) => (
                      <div key={idx} className="relative rounded-xl overflow-hidden border border-stone-200 aspect-square bg-stone-100 group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Selected ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setImageFiles((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 w-5 h-5 bg-stone-900/80 hover:bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold transition-colors shadow-xs"
                          title="Remove image"
                        >
                          ✕
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-stone-950/80 text-white">
                            Main
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                    className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                  <span className="font-medium text-stone-700">Featured Showcase</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.showInSlider}
                    onChange={(e) => setForm({ ...form, showInSlider: e.target.checked })}
                    className="rounded border-amber-500 text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                  <span className="font-semibold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 text-xs">
                    Show in Slide (Hero 3D Slider)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isCustomizable}
                    onChange={(e) => setForm({ ...form, isCustomizable: e.target.checked })}
                    className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                  <span className="font-medium text-stone-700">Allow Photo / Customization</span>
                </label>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingProduct ? "Save Changes" : "Create Product"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

