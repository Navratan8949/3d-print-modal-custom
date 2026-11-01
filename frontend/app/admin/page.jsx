"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Package,
  Clock,
  TrendingUp,
  MessageCircle,
  ArrowRight,
  PlusCircle,
  Loader2,
  AlertCircle,
  CheckCircle,
  Truck,
} from "lucide-react";
import { dashboardAPI } from "@/lib/api";

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await dashboardAPI.getStats();
      setData(res);
    } catch (err) {
      setError(err.message || "Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            Pending
          </span>
        );
      case "in_production":
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-purple-50 text-purple-800 border border-purple-200">
            Processing
          </span>
        );
      case "shipped":
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-blue-50 text-blue-800 border border-blue-200">
            Shipped
          </span>
        );
      case "delivered":
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            Delivered
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-stone-100 text-stone-700">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
        <p className="text-xs text-stone-500">Loading studio metrics...</p>
      </div>
    );
  }

  const stats = data?.stats || {
    totalOrders: 0,
    pendingOrders: 0,
    inProductionOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
  };
  const recentOrders = data?.recentOrders || [];

  return (
    <div className="space-y-8">
      {/* Top Banner / Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Studio Dashboard</h1>
          <p className="text-xs text-stone-600">
            Live overview of custom 3D printing orders, fabrication stages, and product inventory.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Manage Orders</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-700">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-stone-900">{stats.totalOrders}</div>
          <p className="text-[11px] text-stone-500">All-time received inquiries</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-amber-200/90 bg-amber-50/20 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
              Pending Review
            </span>
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-amber-900">{stats.pendingOrders}</div>
          <p className="text-[11px] text-amber-700">Requires quote or WhatsApp confirmation</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-purple-200/90 bg-purple-50/20 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-800 uppercase tracking-wider">
              In Processing
            </span>
            <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-purple-900">{stats.inProductionOrders}</div>
          <p className="text-[11px] text-purple-700">Active order preparation & packaging</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Est. Order Value
            </span>
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-stone-900">₹{stats.totalRevenue}</div>
          <p className="text-[11px] text-stone-500">Gross customized pipeline</p>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-2xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-base text-stone-900">Recent Customer Orders</h3>
            <p className="text-xs text-stone-500">Latest orders submitted via web & WhatsApp</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            <span>View All ({stats.totalOrders})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center text-stone-500 text-xs">
            No orders received yet. Once users place orders on the web or WhatsApp, they will appear here instantly!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 text-[11px] font-semibold uppercase tracking-wider text-stone-500 border-b border-stone-200/60">
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Value</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {recentOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-stone-900">
                      <Link
                        href={`/admin/orders/${ord._id}`}
                        className="text-amber-700 hover:text-amber-800 hover:underline"
                        title="View Full Order Details"
                      >
                        {ord.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-stone-900">{ord.customer?.name}</div>
                      <div className="text-[11px] text-stone-500">{ord.customer?.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      {ord.items?.length} item(s)
                      <span className="block text-[11px] text-stone-400 truncate max-w-[180px]">
                        {ord.items?.map((i) => i.name).join(", ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-stone-900">
                      ₹{ord.totalAmount}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(ord.status)}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/${ord.customer?.phone?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hello ${ord.customer?.name}! Prime 3D Lab here regarding your Order #${ord.orderNumber}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                          title="Chat on WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                        <Link
                          href={`/admin/orders/${ord._id}`}
                          className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-[11px] transition-colors"
                        >
                          Manage ↗
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

