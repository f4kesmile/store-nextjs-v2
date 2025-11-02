"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface CartItem {
  productId: number;
  productName: string;
  productPrice: number | string;
  productImage?: string;
  variantId?: number;
  variantName?: string;
  variantValue?: string;
  quantity: number;
  maxStock?: number;
  notes?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  updateQuantity: (productId: number, variantId: number | undefined, quantity: number) => void;
  removeFromCart: (productId: number, variantId?: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(
        cartItem => 
          cartItem.productId === item.productId && 
          (cartItem.variantId || 0) === (item.variantId || 0)
      );

      if (existingItemIndex !== -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        return updatedCart;
      } else {
        return [...prevCart, { ...item, quantity }];
      }
    });
  };

  const updateQuantity = (productId: number, variantId: number | undefined, quantity: number) => {
    setCart(prevCart => 
      prevCart.map(item => 
        item.productId === productId && (item.variantId || 0) === (variantId || 0)
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  const removeFromCart = (productId: number, variantId?: number) => {
    setCart(prevCart => 
      prevCart.filter(item => 
        !(item.productId === productId && (item.variantId || 0) === (variantId || 0))
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = typeof item.productPrice === 'string' 
        ? parseFloat(item.productPrice.replace(/[^0-9.]/g, ''))
        : Number(item.productPrice);
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const value: CartContextType = {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};