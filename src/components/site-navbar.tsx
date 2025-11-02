"use client";
import Link from "next/link";
import { useSettings } from "@/contexts/SettingsContext";
import { ShoppingCart, User, Loader2 } from "lucide-react";

export function SiteNavbar(){
  const { settings, loading } = useSettings();
  
  return (
    <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          {loading ? (
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
          ) : settings.logoUrl ? (
            <img src={settings.logoUrl} alt="logo" className="h-8 object-contain" />
          ) : (
            <div 
              className="h-8 w-8 rounded grid place-items-center text-white font-bold text-sm"
              style={{ backgroundColor: settings.primaryColor }}
            >
              {settings.storeName?.charAt(0) || "S"}
            </div>
          )}
          <span className="font-bold text-lg">
            {loading ? (
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
            ) : (
              settings.storeName || "Store Saya"
            )}
          </span>
        </Link>
        
        <div className="ml-auto flex items-center gap-4">
          <Link 
            href="/products" 
            className="hidden sm:inline-flex px-3 py-2 text-sm font-medium hover:text-primary transition-colors"
          >
            Produk
          </Link>
          <Link 
            href="/contact" 
            className="hidden sm:inline-flex px-3 py-2 text-sm font-medium hover:text-primary transition-colors"
          >
            Kontak
          </Link>
          <Link 
            href="/cart" 
            className="p-2 hover:bg-accent rounded-md transition-colors relative"
            title="Keranjang"
          >
            <ShoppingCart className="h-5 w-5"/>
          </Link>
          <Link 
            href="/admin" 
            className="p-2 hover:bg-accent rounded-md transition-colors"
            title="Admin"
          >
            <User className="h-5 w-5"/>
          </Link>
        </div>
      </div>
    </nav>
  );
}