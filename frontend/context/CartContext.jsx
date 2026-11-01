"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { createCartWhatsAppUrl } from "@/lib/whatsapp";

const CartContext = createContext(null);

const STORAGE_KEY = "prime3dworld_cart_v1";

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Load cart from localStorage once on client mount (prevents SSR hydration mismatch)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage only after initial client load is done
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to persist cart to localStorage", e);
    }
  }, [cart, isLoaded]);

  // Add item to cart
  const addToCart = (product, quantity = 1, customization = {}, hasPhoto = false) => {
    setCart((prevCart) => {
      const customString = JSON.stringify(customization);
      const existingIndex = prevCart.findIndex(
        (item) => item.id === product.id && JSON.stringify(item.customization || {}) === customString
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        const newItem = {
          cartId: `${product.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          id: product.id,
          slug: product.slug,
          name: product.name,
          category: product.category,
          priceLabel: product.priceLabel || "Request Price",
          imageKey: product.imageKey,
          quantity,
          customization,
          hasPhoto,
        };
        return [...prevCart, newItem];
      }
    });

    setIsDrawerOpen(true);
  };

  // Update item quantity
  const updateQuantity = (cartId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.cartId === cartId ? { ...item, quantity: newQuantity } : item))
    );
  };

  // Remove item
  const removeFromCart = (cartId) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

  // Total item count
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Generate WhatsApp order URL for entire cart
  const getCartWhatsAppUrl = (customerInfo = {}) => {
    return createCartWhatsAppUrl(cart, customerInfo);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoaded,
        isDrawerOpen,
        setIsDrawerOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItemCount,
        getCartWhatsAppUrl,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
