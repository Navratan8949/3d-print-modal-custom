"use client";

import { useState, useEffect, useMemo } from "react";
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
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  Flame,
  Snowflake,
  Sparkles,
  DollarSign,
  XCircle,
  ExternalLink,
  Layers,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { dashboardAPI } from "@/lib/api";
import { resolveProductImage } from "@/lib/imageUtils";

// All 15 Time Range Options requested by user
const TIME_RANGES = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "3d", label: "Last 3 Days" },
  { key: "7d", label: "Last 7 Days" },
  { key: "15d", label: "Last 15 Days" },
  { key: "1m", label: "1 Month (30 Days)" },
  { key: "3m", label: "3 Months" },
  { key: "6m", label: "6 Months" },
  { key: "1y", label: "1 Year" },
  { key: "2y", label: "2 Years" },
  { key: "3y", label: "3 Years" },
  { key: "4y", label: "4 Years" },
  { key: "5y", label: "5 Years" },
  { key: "10y", label: "10 Years" },
  { key: "all", label: "All Time" },
];

// Top N Options for Product Sales Rankings
const TOP_N_OPTIONS = [
  { value: 1, label: "Top 1" },
  { value: 3, label: "Top 3" },
  { value: 5, label: "Top 5" },
  { value: 10, label: "Top 10" },
  { value: 20, label: "Top 20" },
  { value: 9999, label: "All Products" },
];

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Interactive Filter States
  const [selectedRange, setSelectedRange] = useState("30d"); // for Sales Graph
  const [selectedStatusRange, setSelectedStatusRange] = useState("30d"); // for Status Analytics
  const [productViewMode, setProductViewMode] = useState("highest"); // "highest" or "least"
  const [topN, setTopN] = useState(5);
  const [hoveredBar, setHoveredBar] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await dashboardAPI.getStats();
      setData(res);
    } catch (err) {
      setError(err.message || "Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  const allOrders = data?.allOrders || [];
  const allProducts = data?.allProducts || [];

  // Helper: Filter orders by date range
  const filterOrdersByRange = (orders, rangeKey) => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return orders.filter((ord) => {
      const orderDate = new Date(ord.createdAt);
      if (isNaN(orderDate.getTime())) return false;

      switch (rangeKey) {
        case "today":
          return orderDate >= startOfToday;
        case "yesterday": {
          const startOfYesterday = new Date(startOfToday);
          startOfYesterday.setDate(startOfYesterday.getDate() - 1);
          return orderDate >= startOfYesterday && orderDate < startOfToday;
        }
        case "3d": {
          const d = new Date(startOfToday);
          d.setDate(d.getDate() - 3);
          return orderDate >= d;
        }
        case "7d": {
          const d = new Date(startOfToday);
          d.setDate(d.getDate() - 7);
          return orderDate >= d;
        }
        case "15d": {
          const d = new Date(startOfToday);
          d.setDate(d.getDate() - 15);
          return orderDate >= d;
        }
        case "1m":
        case "30d": {
          const d = new Date(startOfToday);
          d.setDate(d.getDate() - 30);
          return orderDate >= d;
        }
        case "3m": {
          const d = new Date(startOfToday);
          d.setDate(d.getDate() - 90);
          return orderDate >= d;
        }
        case "6m": {
          const d = new Date(startOfToday);
          d.setDate(d.getDate() - 180);
          return orderDate >= d;
        }
        case "1y": {
          const d = new Date(startOfToday);
          d.setFullYear(d.getFullYear() - 1);
          return orderDate >= d;
        }
        case "2y": {
          const d = new Date(startOfToday);
          d.setFullYear(d.getFullYear() - 2);
          return orderDate >= d;
        }
        case "3y": {
          const d = new Date(startOfToday);
          d.setFullYear(d.getFullYear() - 3);
          return orderDate >= d;
        }
        case "4y": {
          const d = new Date(startOfToday);
          d.setFullYear(d.getFullYear() - 4);
          return orderDate >= d;
        }
        case "5y": {
          const d = new Date(startOfToday);
          d.setFullYear(d.getFullYear() - 5);
          return orderDate >= d;
        }
        case "10y": {
          const d = new Date(startOfToday);
          d.setFullYear(d.getFullYear() - 10);
          return orderDate >= d;
        }
        case "all":
        default:
          return true;
      }
    });
  };

  // ==========================================
  // 1. SALES TIMELINE GRAPH COMPUTATION
  // ==========================================
  const salesTimelineData = useMemo(() => {
    const filtered = filterOrdersByRange(allOrders, selectedRange);

    // Grouping strategy based on range
    let bins = [];
    const now = new Date();

    if (selectedRange === "today" || selectedRange === "yesterday") {
      // 6 time blocks across the day (4h intervals)
      bins = [
        { label: "12 AM - 4 AM", revenue: 0, count: 0, range: [0, 4] },
        { label: "4 AM - 8 AM", revenue: 0, count: 0, range: [4, 8] },
        { label: "8 AM - 12 PM", revenue: 0, count: 0, range: [8, 12] },
        { label: "12 PM - 4 PM", revenue: 0, count: 0, range: [12, 16] },
        { label: "4 PM - 8 PM", revenue: 0, count: 0, range: [16, 20] },
        { label: "8 PM - 12 AM", revenue: 0, count: 0, range: [20, 24] },
      ];

      filtered.forEach((ord) => {
        if (ord.status === "cancelled") return;
        const hr = new Date(ord.createdAt).getHours();
        const bin = bins.find((b) => hr >= b.range[0] && hr < b.range[1]);
        if (bin) {
          bin.revenue += Number(ord.totalAmount) || 0;
          bin.count += 1;
        }
      });
    } else if (["3d", "7d", "15d"].includes(selectedRange)) {
      const daysCount = selectedRange === "3d" ? 3 : selectedRange === "7d" ? 7 : 15;
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayStr = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
        bins.push({ label: dayStr, dateObj: d, revenue: 0, count: 0 });
      }

      filtered.forEach((ord) => {
        if (ord.status === "cancelled") return;
        const ordDateStr = new Date(ord.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
        const bin = bins.find((b) => b.label === ordDateStr);
        if (bin) {
          bin.revenue += Number(ord.totalAmount) || 0;
          bin.count += 1;
        }
      });
    } else if (selectedRange === "1m" || selectedRange === "30d") {
      // 10 bins of 3-day intervals
      for (let i = 9; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i * 3);
        const label = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
        bins.push({ label, revenue: 0, count: 0, daysAgo: i * 3 });
      }

      filtered.forEach((ord) => {
        if (ord.status === "cancelled") return;
        const diffDays = Math.floor((now - new Date(ord.createdAt)) / (1000 * 60 * 60 * 24));
        const binIdx = Math.min(9, Math.floor(diffDays / 3));
        const targetBin = bins[9 - binIdx];
        if (targetBin) {
          targetBin.revenue += Number(ord.totalAmount) || 0;
          targetBin.count += 1;
        }
      });
    } else {
      // Monthly / Yearly bins for 3m, 6m, 1y, 2y, 3y, 4y, 5y, 10y, all
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const binCount = selectedRange === "3m" ? 3 : selectedRange === "6m" ? 6 : 12;

      for (let i = binCount - 1; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const label = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;
        bins.push({ label, month: d.getMonth(), year: d.getFullYear(), revenue: 0, count: 0 });
      }

      filtered.forEach((ord) => {
        if (ord.status === "cancelled") return;
        const d = new Date(ord.createdAt);
        const bin = bins.find((b) => b.month === d.getMonth() && b.year === d.getFullYear());
        if (bin) {
          bin.revenue += Number(ord.totalAmount) || 0;
          bin.count += 1;
        }
      });
    }

    const totalSales = filtered
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    const totalOrdersCount = filtered.length;
    const maxRevenue = Math.max(...bins.map((b) => b.revenue), 100);

    return {
      bins,
      totalSales,
      totalOrdersCount,
      avgOrderValue: totalOrdersCount > 0 ? Math.round(totalSales / totalOrdersCount) : 0,
      maxRevenue,
    };
  }, [allOrders, selectedRange]);

  // ==========================================
  // 2. ORDER STATUS BREAKDOWN (By Selected Status Range)
  // ==========================================
  const statusAnalytics = useMemo(() => {
    const filtered = filterOrdersByRange(allOrders, selectedStatusRange);
    const total = filtered.length || 1;

    const counts = {
      pending: 0,
      confirmed: 0,
      in_production: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    const amounts = {
      pending: 0,
      confirmed: 0,
      in_production: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    filtered.forEach((ord) => {
      const st = ord.status || "pending";
      if (counts[st] !== undefined) {
        counts[st] += 1;
        amounts[st] += Number(ord.totalAmount) || 0;
      }
    });

    return {
      totalCount: filtered.length,
      counts,
      amounts,
      percentages: {
        pending: Math.round((counts.pending / total) * 100),
        confirmed: Math.round((counts.confirmed / total) * 100),
        in_production: Math.round((counts.in_production / total) * 100),
        shipped: Math.round((counts.shipped / total) * 100),
        delivered: Math.round((counts.delivered / total) * 100),
        cancelled: Math.round((counts.cancelled / total) * 100),
      },
    };
  }, [allOrders, selectedStatusRange]);

  // ==========================================
  // 3. PRODUCT SALES PERFORMANCE (Highest vs Least)
  // ==========================================
  const productPerformance = useMemo(() => {
    const statsMap = {};

    // Initialize all existing catalog products with 0
    allProducts.forEach((p) => {
      const key = p.name?.toLowerCase().trim();
      statsMap[key] = {
        id: p.id || p._id,
        name: p.name,
        category: p.category || "3D Creation",
        price: p.price || 999,
        image_url: resolveProductImage(p.image_url),
        unitsSold: 0,
        revenue: 0,
      };
    });

    // Tally up items sold from all completed/active orders
    allOrders.forEach((ord) => {
      if (ord.status === "cancelled") return;
      ord.items?.forEach((item) => {
        const key = item.name?.toLowerCase().trim();
        const qty = Number(item.quantity) || 1;
        const price = Number(item.price) || 0;

        if (statsMap[key]) {
          statsMap[key].unitsSold += qty;
          statsMap[key].revenue += qty * price;
        } else {
          // If item is not in catalog products, add it
          statsMap[key] = {
            id: item.productId || item._id || key,
            name: item.name,
            category: item.category || "Custom 3D",
            price: price,
            image_url: resolveProductImage(item.image_url),
            unitsSold: qty,
            revenue: qty * price,
          };
        }
      });
    });

    const productsList = Object.values(statsMap);

    // Highest Selling (Sorted descending by unitsSold, then revenue)
    const highestSelling = [...productsList].sort((a, b) => b.unitsSold - a.unitsSold || b.revenue - a.revenue);

    // Least Selling (Sorted ascending by unitsSold, then revenue)
    const leastSelling = [...productsList].sort((a, b) => a.unitsSold - b.unitsSold || a.revenue - b.revenue);

    const maxUnits = Math.max(...productsList.map((p) => p.unitsSold), 1);

    return {
      highest: highestSelling.slice(0, topN),
      least: leastSelling.slice(0, topN),
      maxUnits,
      totalCatalogProducts: productsList.length,
    };
  }, [allOrders, allProducts, topN]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
        <p className="text-xs text-stone-500 font-mono">Compiling live studio intelligence & analytics...</p>
      </div>
    );
  }

  const stats = data?.stats || {
    totalOrders: allOrders.length,
    pendingOrders: allOrders.filter((o) => o.status === "pending").length,
    inProductionOrders: allOrders.filter((o) => o.status === "in_production").length,
    totalProducts: allProducts.length,
    totalRevenue: salesTimelineData.totalSales,
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-stone-900">Studio Analytics & Dashboard</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
              Live Data Intelligence
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-1 max-w-2xl">
            Real-time visual sales tracking, multi-year order trends, status fulfillment breakdowns, and product demand rankings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchStats}
            className="p-2.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs transition-colors shadow-2xs cursor-pointer"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-600" : ""}`} />
          </button>

          <Link
            href="/admin/categories"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-800 font-semibold text-xs transition-colors shadow-2xs"
          >
            <Layers className="w-4 h-4 text-amber-600" />
            <span>Categories ({allProducts.length} Prods)</span>
          </Link>

          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Order Manager ({allOrders.length})</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Top 4 KPI High-Level Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Total Gross Revenue
            </span>
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-stone-900 tabular-nums">
            ₹{stats.totalRevenue?.toLocaleString("en-IN") || "0"}
          </div>
          <p className="text-[11px] text-stone-500">All-time received paid & confirmed</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Total Order Volume
            </span>
            <div className="w-9 h-9 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-stone-900 tabular-nums">
            {allOrders.length}
          </div>
          <p className="text-[11px] text-stone-500">Inquiries and checkout orders</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-amber-200/90 bg-amber-50/20 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
              Pending / Action Needed
            </span>
            <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-amber-900 tabular-nums">
            {stats.pendingOrders}
          </div>
          <p className="text-[11px] text-amber-700">Awaiting specs confirmation or quote</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-purple-200/90 bg-purple-50/20 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-800 uppercase tracking-wider">
              Active In 3D Production
            </span>
            <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-purple-900 tabular-nums">
            {stats.inProductionOrders}
          </div>
          <p className="text-[11px] text-purple-700">Fabricating & post-processing now</p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: ANIMATED SALES REVENUE GRAPH WITH TIME FILTER */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-2xs p-5 sm:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-600" />
              <h2 className="font-serif font-bold text-base sm:text-lg text-stone-900">
                Sales Revenue Graph & Volume Analysis
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Interactive timeline visualizing sales ₹ and order flow across your selected time window.
            </p>
          </div>

          {/* Time Range Selector (Today, Yesterday, 3d, 7d, 15d, 1m, 3m, 6m, 1y, 2y, 3y, 4y, 5y, 10y, all) */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-stone-500 hidden sm:inline">Select Period:</span>
            <div className="relative">
              <select
                value={selectedRange}
                onChange={(e) => setSelectedRange(e.target.value)}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-stone-50 border border-stone-300 text-stone-800 focus:outline-hidden focus:border-amber-600 shadow-2xs cursor-pointer pr-8 appearance-none"
              >
                {TIME_RANGES.map((r) => (
                  <option key={r.key} value={r.key}>
                    {r.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-stone-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Selected Period Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-amber-50/40 border border-amber-200/70">
          <div>
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
              Period Sales (₹)
            </span>
            <span className="text-xl sm:text-2xl font-bold font-serif text-amber-950 tabular-nums">
              ₹{salesTimelineData.totalSales.toLocaleString("en-IN")}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider block">
              Orders In Period
            </span>
            <span className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tabular-nums">
              {salesTimelineData.totalOrdersCount}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider block">
              Average Order Value
            </span>
            <span className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tabular-nums">
              ₹{salesTimelineData.avgOrderValue.toLocaleString("en-IN")}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider block">
              Time Horizon
            </span>
            <span className="text-sm sm:text-base font-bold text-amber-900 mt-1 block">
              {TIME_RANGES.find((r) => r.key === selectedRange)?.label}
            </span>
          </div>
        </div>

        {/* Animated Visual SVG Bar Graph */}
        <div className="pt-2">
          {salesTimelineData.bins.length === 0 || salesTimelineData.totalSales === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-stone-50 border border-dashed border-stone-200 space-y-2">
              <BarChart3 className="w-8 h-8 text-stone-300 mx-auto" />
              <p className="text-xs font-semibold text-stone-600">
                No orders recorded for "{TIME_RANGES.find((r) => r.key === selectedRange)?.label}"
              </p>
              <p className="text-[11px] text-stone-400">
                Try selecting "30 Days", "1 Year", or "All Time" to view full lifetime sales data.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Dynamic Bar Chart with Hover Tooltip */}
              <div className="relative h-60 sm:h-72 w-full flex items-end justify-between gap-2 sm:gap-4 pt-8 pb-4 px-2 border-b border-stone-200">
                {salesTimelineData.bins.map((bin, idx) => {
                  const heightPercent = Math.max(8, Math.round((bin.revenue / salesTimelineData.maxRevenue) * 100));
                  const isHovered = hoveredBar === idx;

                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                      onMouseEnter={() => setHoveredBar(idx)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      {/* Floating Tooltip */}
                      {isHovered && (
                        <div className="absolute -top-12 z-30 px-3 py-1.5 rounded-xl bg-stone-900 text-white text-[11px] font-semibold shadow-xl whitespace-nowrap border border-stone-700 animate-in fade-in zoom-in-95 pointer-events-none">
                          <p className="font-bold text-amber-400">₹{bin.revenue.toLocaleString("en-IN")}</p>
                          <p className="text-[10px] text-stone-300">
                            {bin.count} order(s) • {bin.label}
                          </p>
                        </div>
                      )}

                      {/* Bar Value on Top on Desktop */}
                      {bin.revenue > 0 && (
                        <span className="text-[9px] font-bold text-stone-500 mb-1 hidden sm:block tabular-nums">
                          ₹{bin.revenue >= 1000 ? `${(bin.revenue / 1000).toFixed(1)}k` : bin.revenue}
                        </span>
                      )}

                      {/* Animated Bar Column */}
                      <div
                        className={`w-full max-w-[42px] rounded-t-xl transition-all duration-500 ease-out shadow-xs ${
                          bin.revenue > 0
                            ? "bg-linear-to-t from-amber-600 via-amber-500 to-orange-400 group-hover:from-amber-500 group-hover:to-orange-300 group-hover:shadow-lg group-hover:scale-105"
                            : "bg-stone-200/70"
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />

                      {/* X-Axis Label */}
                      <span className="text-[9px] sm:text-[10px] font-medium text-stone-500 mt-2 truncate max-w-full text-center">
                        {bin.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-400 px-2 pt-1">
                <span>← Older dates</span>
                <span className="font-semibold text-stone-600">
                  Peak period: ₹{salesTimelineData.maxRevenue.toLocaleString("en-IN")}
                </span>
                <span>Recent dates →</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 2: ORDER ANALYTICS BY STATUS & TIME PERIOD */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-2xs p-5 sm:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-amber-600" />
              <h2 className="font-serif font-bold text-base sm:text-lg text-stone-900">
                Order Status Counting & Fulfillment Breakdown
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Select any timeframe to view exact counts of Pending, In Production, Shipped, Delivered, and Cancelled orders.
            </p>
          </div>

          {/* Time Filter for Status Breakdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-500">Filter By Time:</span>
            <div className="relative">
              <select
                value={selectedStatusRange}
                onChange={(e) => setSelectedStatusRange(e.target.value)}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-stone-50 border border-stone-300 text-stone-800 focus:outline-hidden focus:border-amber-600 shadow-2xs cursor-pointer pr-8 appearance-none"
              >
                {TIME_RANGES.map((r) => (
                  <option key={r.key} value={r.key}>
                    {r.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-stone-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Animated Multi-Segment Distribution Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-stone-800">
            <span>Status Distribution ({statusAnalytics.totalCount} Orders in this period)</span>
            <span className="text-stone-500 font-normal">
              Period: <strong>{TIME_RANGES.find((r) => r.key === selectedStatusRange)?.label}</strong>
            </span>
          </div>

          <div className="h-4 w-full bg-stone-100 rounded-full overflow-hidden flex shadow-inner">
            {statusAnalytics.totalCount === 0 ? (
              <div className="w-full bg-stone-200" />
            ) : (
              <>
                <div
                  style={{ width: `${statusAnalytics.percentages.pending}%` }}
                  className="bg-amber-500 transition-all duration-500"
                  title={`Pending: ${statusAnalytics.counts.pending} (${statusAnalytics.percentages.pending}%)`}
                />
                <div
                  style={{ width: `${statusAnalytics.percentages.confirmed}%` }}
                  className="bg-blue-500 transition-all duration-500"
                  title={`Confirmed: ${statusAnalytics.counts.confirmed} (${statusAnalytics.percentages.confirmed}%)`}
                />
                <div
                  style={{ width: `${statusAnalytics.percentages.in_production}%` }}
                  className="bg-purple-600 transition-all duration-500"
                  title={`In Production: ${statusAnalytics.counts.in_production} (${statusAnalytics.percentages.in_production}%)`}
                />
                <div
                  style={{ width: `${statusAnalytics.percentages.shipped}%` }}
                  className="bg-indigo-500 transition-all duration-500"
                  title={`Shipped: ${statusAnalytics.counts.shipped} (${statusAnalytics.percentages.shipped}%)`}
                />
                <div
                  style={{ width: `${statusAnalytics.percentages.delivered}%` }}
                  className="bg-emerald-500 transition-all duration-500"
                  title={`Delivered: ${statusAnalytics.counts.delivered} (${statusAnalytics.percentages.delivered}%)`}
                />
                <div
                  style={{ width: `${statusAnalytics.percentages.cancelled}%` }}
                  className="bg-rose-500 transition-all duration-500"
                  title={`Cancelled: ${statusAnalytics.counts.cancelled} (${statusAnalytics.percentages.cancelled}%)`}
                />
              </>
            )}
          </div>
        </div>

        {/* 6 Status Analytics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          {/* 1. Pending */}
          <Link
            href="/admin/orders"
            className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 hover:border-amber-400 hover:shadow-md transition-all space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">Pending</span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </div>
            <div className="text-2xl font-bold font-serif text-amber-950 tabular-nums">
              {statusAnalytics.counts.pending}
            </div>
            <p className="text-[10px] text-amber-700">
              {statusAnalytics.percentages.pending}% • ₹{statusAnalytics.amounts.pending.toLocaleString("en-IN")}
            </p>
          </Link>

          {/* 2. Confirmed */}
          <Link
            href="/admin/orders"
            className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900">Confirmed</span>
              <CheckCircle className="w-3 h-3 text-blue-600" />
            </div>
            <div className="text-2xl font-bold font-serif text-blue-950 tabular-nums">
              {statusAnalytics.counts.confirmed}
            </div>
            <p className="text-[10px] text-blue-700">
              {statusAnalytics.percentages.confirmed}% • ₹{statusAnalytics.amounts.confirmed.toLocaleString("en-IN")}
            </p>
          </Link>

          {/* 3. In Production */}
          <Link
            href="/admin/orders"
            className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200 hover:border-purple-400 hover:shadow-md transition-all space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900">Printing ⚙️</span>
              <Package className="w-3 h-3 text-purple-600" />
            </div>
            <div className="text-2xl font-bold font-serif text-purple-950 tabular-nums">
              {statusAnalytics.counts.in_production}
            </div>
            <p className="text-[10px] text-purple-700">
              {statusAnalytics.percentages.in_production}% • ₹{statusAnalytics.amounts.in_production.toLocaleString("en-IN")}
            </p>
          </Link>

          {/* 4. Shipped */}
          <Link
            href="/admin/orders"
            className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200 hover:border-indigo-400 hover:shadow-md transition-all space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900">Shipped 📦</span>
              <Truck className="w-3 h-3 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold font-serif text-indigo-950 tabular-nums">
              {statusAnalytics.counts.shipped}
            </div>
            <p className="text-[10px] text-indigo-700">
              {statusAnalytics.percentages.shipped}% • ₹{statusAnalytics.amounts.shipped.toLocaleString("en-IN")}
            </p>
          </Link>

          {/* 5. Delivered */}
          <Link
            href="/admin/orders"
            className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 hover:border-emerald-400 hover:shadow-md transition-all space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900">Delivered 🎉</span>
              <CheckCircle className="w-3 h-3 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold font-serif text-emerald-950 tabular-nums">
              {statusAnalytics.counts.delivered}
            </div>
            <p className="text-[10px] text-emerald-700">
              {statusAnalytics.percentages.delivered}% • ₹{statusAnalytics.amounts.delivered.toLocaleString("en-IN")}
            </p>
          </Link>

          {/* 6. Cancelled */}
          <Link
            href="/admin/orders"
            className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200 hover:border-rose-400 hover:shadow-md transition-all space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-900">Cancelled ❌</span>
              <XCircle className="w-3 h-3 text-rose-600" />
            </div>
            <div className="text-2xl font-bold font-serif text-rose-950 tabular-nums">
              {statusAnalytics.counts.cancelled}
            </div>
            <p className="text-[10px] text-rose-700">
              {statusAnalytics.percentages.cancelled}% • ₹{statusAnalytics.amounts.cancelled.toLocaleString("en-IN")}
            </p>
          </Link>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 3: PRODUCT DEMAND RANKING (HIGHEST & LEAST SELLING) */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-2xs p-5 sm:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              {productViewMode === "highest" ? (
                <Flame className="w-5 h-5 text-orange-600" />
              ) : (
                <Snowflake className="w-5 h-5 text-blue-600" />
              )}
              <h2 className="font-serif font-bold text-base sm:text-lg text-stone-900">
                Product Sales Performance & Demand Ranking
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Identify your top revenue generating 3D models and least selling items that need price adjustments or marketing.
            </p>
          </div>

          {/* Controls: Mode Switcher + Top N Limit Selector */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Toggle: Highest vs Least */}
            <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
              <button
                type="button"
                onClick={() => setProductViewMode("highest")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  productViewMode === "highest"
                    ? "bg-white text-orange-700 shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-orange-600" />
                <span>🔥 Highest Selling</span>
              </button>

              <button
                type="button"
                onClick={() => setProductViewMode("least")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  productViewMode === "least"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <Snowflake className="w-3.5 h-3.5 text-blue-600" />
                <span>❄️ Least Selling</span>
              </button>
            </div>

            {/* Top N Selector (1, 3, 5, 10, 20, All) */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-stone-500">Show:</span>
              <div className="relative">
                <select
                  value={topN}
                  onChange={(e) => setTopN(Number(e.target.value))}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-stone-50 border border-stone-300 text-stone-800 focus:outline-hidden focus:border-amber-600 shadow-2xs cursor-pointer pr-7 appearance-none"
                >
                  {TOP_N_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-stone-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Product Rankings List */}
        {(() => {
          const list = productViewMode === "highest" ? productPerformance.highest : productPerformance.least;

          if (list.length === 0) {
            return (
              <div className="py-12 text-center text-xs text-stone-500">
                No product data available yet.
              </div>
            );
          }

          return (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-500 px-1">
                <span>
                  Showing {list.length} {productViewMode === "highest" ? "top performing" : "least ordered"} products
                </span>
                <span className="font-semibold text-stone-700">
                  Total Catalog: {productPerformance.totalCatalogProducts} Products
                </span>
              </div>

              <div className="divide-y divide-stone-100 border border-stone-200/90 rounded-2xl overflow-hidden bg-white">
                {list.map((prod, idx) => {
                  const rank = idx + 1;
                  const percentOfMax = Math.round((prod.unitsSold / productPerformance.maxUnits) * 100);

                  return (
                    <div
                      key={prod.id || idx}
                      className="p-4 hover:bg-stone-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      {/* Left: Rank Badge + Image + Name */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        {/* Rank Badge */}
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                            productViewMode === "highest"
                              ? rank === 1
                                ? "bg-amber-500 text-stone-950 font-black shadow-amber-500/30"
                                : rank === 2
                                ? "bg-stone-300 text-stone-900 font-extrabold"
                                : rank === 3
                                ? "bg-amber-200 text-amber-900 font-extrabold"
                                : "bg-stone-100 text-stone-600 font-semibold"
                              : "bg-blue-100 text-blue-900 font-semibold"
                          }`}
                        >
                          #{rank}
                        </div>

                        {/* Thumbnail */}
                        <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0">
                          <img
                            src={prod.image_url}
                            alt={prod.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/images/products/fullbody-figurine-hero.jpeg";
                            }}
                          />
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                              {prod.name}
                            </h4>
                            <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 shrink-0">
                              {prod.category}
                            </span>
                          </div>

                          {/* Progress Bar of Sales Volume */}
                          <div className="w-full max-w-xs bg-stone-100 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div
                              style={{ width: `${Math.max(5, percentOfMax)}%` }}
                              className={`h-full rounded-full transition-all duration-500 ${
                                productViewMode === "highest" ? "bg-amber-600" : "bg-blue-400"
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Right: Metrics & Actions */}
                      <div className="flex items-center gap-4 shrink-0 self-end sm:self-center">
                        <div className="text-right">
                          <div className="text-xs sm:text-sm font-black text-stone-900 tabular-nums">
                            {prod.unitsSold} Unit{prod.unitsSold === 1 ? "" : "s"} Sold
                          </div>
                          <div className="text-[11px] font-semibold text-amber-700 tabular-nums">
                            ₹{prod.revenue.toLocaleString("en-IN")} Total Rev.
                          </div>
                        </div>

                        <Link
                          href={`/products/${prod.id}`}
                          target="_blank"
                          className="p-2 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors"
                          title="View product page in store"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
