// src/contexts/CartContext.tsx - GANTI SELURUH ISI
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface CartItem {
  productId: number;
  productName: string;
  productPrice: number;
  productImage: string;
  variantId?: number;
  variantName?: string;
  variantValue?: string;
  quantity: number;
  notes?: string;
  maxStock: number;
  enableNotes?: boolean;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: number, variantId?: number) => void;
  updateQuantity: (
    productId: number,
    quantity: number,
    variantId?: number
  ) => void;
  updateNotes: (productId: number, notes: string, variantId?: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("shopping-cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem("shopping-cart", JSON.stringify(cart));
    } else {
      localStorage.removeItem("shopping-cart");
    }
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.productId === item.productId && i.variantId === item.variantId
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += item.quantity;
        updated[existingIndex].notes =
          item.notes || updated[existingIndex].notes;
        return updated;
      }

      return [...prev, item];
    });
  };

  const removeFromCart = (productId: number, variantId?: number) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(item.productId === productId && item.variantId === variantId)
      )
    );
  };

  const updateQuantity = (
    productId: number,
    quantity: number,
    variantId?: number
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId && item.variantId === variantId
          ? { ...item, quantity: Math.min(quantity, item.maxStock) }
          : item
      )
    );
  };

  const updateNotes = (
    productId: number,
    notes: string,
    variantId?: number
  ) => {
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId && item.variantId === variantId
          ? { ...item, notes }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("shopping-cart");
  };

  const getCartTotal = () => {
    return cart.reduce(
      (total, item) => total + item.productPrice * item.quantity,
      0
    );
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateNotes,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
