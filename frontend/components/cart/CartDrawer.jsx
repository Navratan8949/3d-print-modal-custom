"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, ShoppingBag, ArrowRight, Trash2, ShieldCheck, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import CartItem from "./CartItem";

export default function CartDrawer() {
  const {
    cart,
    isDrawerOpen,
    setIsDrawerOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItemCount,
  } = useCart();

  const pathname = usePathname();

  // Automatically close drawer whenever user navigates to any new page/route
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname, setIsDrawerOpen]);

  // Handle Escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsDrawerOpen(false);
      }
    };
    if (isDrawerOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen, setIsDrawerOpen]);

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-stone-50 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 bg-white border-b border-stone-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-50 rounded-lg text-amber-700">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-stone-900">Your Cart</h2>
                <p className="text-xs text-stone-500">
                  {totalItemCount} {totalItemCount === 1 ? "item" : "items"} selected
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-stone-500 hover:text-red-600 transition-colors px-2 py-1 flex items-center gap-1"
                  title="Clear cart"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-lg transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-stone-900">Your cart is empty</h3>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    Explore our 3D figurines, sacred idols, and custom gifts to add items.
                  </p>
                </div>
                <Link
                  href="/shop"
                  onClick={() => setIsDrawerOpen(false)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors shadow-xs"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <>
                {/* Cart Items List */}
                <div className="space-y-3">
                  {cart.map((item) => (
                    <CartItem
                      key={item.cartId}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeFromCart}
                      onClose={() => setIsDrawerOpen(false)}
                    />
                  ))}
                </div>

                {/* Trust Assurance Strip */}
                <div className="p-3.5 rounded-xl bg-white border border-stone-200/80 space-y-2 text-xs text-stone-600">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-medium text-stone-800">Pan-India Express Delivery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Free 3D preview & approval before dispatch</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer & Proceed to Checkout Action */}
          {cart.length > 0 && (
            <div className="p-5 bg-white border-t border-stone-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-600 pb-1">
                <span>Selected Items</span>
                <span className="font-bold text-stone-900 text-sm">
                  {totalItemCount} {totalItemCount === 1 ? "Product" : "Products"}
                </span>
              </div>

              {/* Primary Action Button: Proceed to Checkout */}
              <Link
                href="/cart"
                onClick={() => setIsDrawerOpen(false)}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm shadow-md transition-all active:scale-[0.99] group"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 text-amber-400 transition-transform group-hover:translate-x-1" />
              </Link>

              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="w-full text-center py-1.5 text-xs font-medium text-stone-500 hover:text-stone-800 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
