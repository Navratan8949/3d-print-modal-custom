"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Search,
  Filter,
  Phone,
  Mail,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
  ExternalLink,
  Loader2,
  Sparkles,
  Send,
  MessageSquare,
  Check,
  RefreshCw,
} from "lucide-react";
import { inquiriesAPI } from "@/lib/api";

function AdminQueriesContent() {
  const [inquiries, setInquiries] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, contacted: 0, inDiscussion: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    fetchInquiries();
  }, [activeFilter]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const fetchInquiries = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await inquiriesAPI.getAllAdmin({
        status: activeFilter,
        search: searchTerm,
      });
      if (res && res.inquiries) {
        setInquiries(res.inquiries);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      setError(err.message || "Failed to load customer inquiries");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInquiries();
  };

  const handleStatusChange = async (id, newStatus, adminNotes) => {
    try {
      setUpdatingId(id);
      await inquiriesAPI.updateStatus(id, {
        status: newStatus,
        adminNotes: adminNotes !== undefined ? adminNotes : undefined,
      });
      setInquiries((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item))
      );
      showToast(`Inquiry status updated to ${newStatus.toUpperCase()}`);
    } catch (err) {
      alert("Failed to update status: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete inquiry from ${name}?`)) return;
    try {
      await inquiriesAPI.delete(id);
      setInquiries((prev) => prev.filter((item) => item._id !== id));
      showToast("Inquiry deleted successfully");
    } catch (err) {
      alert("Failed to delete inquiry: " + err.message);
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case "new":
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-amber-100 text-amber-900 border border-amber-300">
            ● New / Unread
          </span>
        );
      case "contacted":
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-blue-100 text-blue-900 border border-blue-300">
            Contacted
          </span>
        );
      case "in_discussion":
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-purple-100 text-purple-900 border border-purple-300">
            In Discussion
          </span>
        );
      case "resolved":
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
            ✓ Resolved
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-stone-100 text-stone-700">
            {st}
          </span>
        );
    }
  };

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
          <h1 className="text-2xl font-serif font-bold text-stone-900 flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-amber-600" />
            <span>Customer Inquiries & Custom Quotes</span>
          </h1>
          <p className="text-xs text-stone-600">
            Manage incoming inquiries, 1-click WhatsApp quote response, and track customer lead status.
          </p>
        </div>

        <button
          onClick={fetchInquiries}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition-colors shadow-2xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Counter Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
            Total Inquiries
          </span>
          <span className="font-serif font-bold text-2xl text-stone-900 mt-1 block">
            {stats.total || inquiries.length}
          </span>
        </div>
        <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/70 shadow-2xs">
          <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
            New / Needs Reply
          </span>
          <span className="font-serif font-bold text-2xl text-amber-900 mt-1 block">
            {stats.new || 0}
          </span>
        </div>
        <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-200/70 shadow-2xs">
          <span className="text-[11px] font-semibold text-purple-800 uppercase tracking-wider block">
            In Discussion
          </span>
          <span className="font-serif font-bold text-2xl text-purple-900 mt-1 block">
            {stats.inDiscussion || 0}
          </span>
        </div>
        <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/70 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
            Resolved & Converted
          </span>
          <span className="font-serif font-bold text-2xl text-emerald-900 mt-1 block">
            {stats.resolved || 0}
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-2xs">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[220px]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search inquiries by name, phone, email, topic..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { key: "all", label: "All" },
            { key: "new", label: `New (${stats.new || 0})` },
            { key: "contacted", label: "Contacted" },
            { key: "in_discussion", label: "In Discussion" },
            { key: "resolved", label: "Resolved" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === tab.key
                  ? "bg-amber-600 text-white shadow-2xs"
                  : "bg-stone-50 text-stone-600 hover:text-stone-900 border border-stone-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
          <p className="text-xs text-stone-500">Loading customer inquiries...</p>
        </div>
      ) : inquiries.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-stone-200/90 p-8 space-y-3 shadow-2xs">
          <MessageCircle className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="text-base font-serif font-bold text-stone-900">No inquiries match your filter</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            When users submit a question or request a custom 3D model quote from the website, it will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq) => {
            const isBusy = updatingId === inq._id;
            const cleanPhone = inq.phone ? inq.phone.replace(/[^0-9]/g, "") : "";
            const whatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
              `Hello ${inq.name}! Prime 3D Lab here regarding your custom 3D printing inquiry about "${inq.subject}". We received your message: "${inq.message.slice(0, 100)}..." How can we assist you with your personalized 3D creation?`
            )}`;

            return (
              <div
                key={inq._id}
                className="bg-white rounded-3xl border border-stone-200/90 shadow-2xs overflow-hidden transition-all hover:shadow-xs p-5 space-y-4"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-serif font-bold text-base text-stone-900">
                      {inq.name}
                    </span>
                    {getStatusBadge(inq.status)}
                    <span className="text-[11px] text-stone-400">
                      {new Date(inq.createdAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* 1-Click WhatsApp & Actions */}
                  <div className="flex items-center gap-2">
                    <a
                      href={whatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
                      title="Open WhatsApp Chat with pre-filled greeting"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-current" />
                      <span>WhatsApp Customer</span>
                    </a>

                    <select
                      value={inq.status}
                      disabled={isBusy}
                      onChange={(e) => handleStatusChange(inq._id, e.target.value)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-stone-200 text-stone-800 focus:outline-hidden focus:border-amber-600 cursor-pointer"
                    >
                      <option value="new">Mark New</option>
                      <option value="contacted">Mark Contacted</option>
                      <option value="in_discussion">In Discussion</option>
                      <option value="resolved">Mark Resolved ✓</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleDelete(inq._id, inq.name)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete inquiry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content Body */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start text-xs">
                  {/* Customer Contact Details (4 cols) */}
                  <div className="md:col-span-4 space-y-2 border-b md:border-b-0 md:border-r border-stone-100 pb-3 md:pb-0 md:pr-4 text-stone-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <a href={`tel:${inq.phone}`} className="font-mono text-stone-900 font-semibold hover:text-amber-600">
                        {inq.phone}
                      </a>
                    </div>
                    {inq.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <a href={`mailto:${inq.email}`} className="text-stone-700 hover:text-amber-600 truncate">
                          {inq.email}
                        </a>
                      </div>
                    )}
                    {inq.productInterest && (
                      <div className="p-2 rounded-xl bg-amber-50/60 border border-amber-200/60 text-amber-900 text-[11px]">
                        <strong>Product / Service Interest:</strong> {inq.productInterest}
                      </div>
                    )}
                  </div>

                  {/* Customer Message & Subject (8 cols) */}
                  <div className="md:col-span-8 space-y-2">
                    <div className="font-semibold text-stone-900 text-sm">
                      {inq.subject || "Customer Inquiry"}
                    </div>
                    <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 text-stone-700 leading-relaxed whitespace-pre-wrap">
                      {inq.message}
                    </div>

                    {inq.adminNotes && (
                      <div className="text-[11px] text-stone-500 italic bg-amber-50/30 p-2 rounded-xl">
                        <strong>Studio Follow-up Notes:</strong> {inq.adminNotes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminQueriesPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
        </div>
      }
    >
      <AdminQueriesContent />
    </Suspense>
  );
}
