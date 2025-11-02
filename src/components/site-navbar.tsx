"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSettings } from "@/contexts/SettingsContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Beranda", href: "/" },
  { name: "Produk", href: "/products" },
  { name: "Kontak", href: "/contact" },
];

export function SiteNavbar() {
  const { settings, loading } = useSettings();
  const { getCartCount } = useCart();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <nav className="border-b bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Brand */}
          <Link 
            href="/" 
            className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
            onClick={() => setMobileMenuOpen(false)}
          >
            {loading ? (
              <>
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-lg overflow-hidden border shadow-sm flex items-center justify-center">
                  {settings.logoUrl ? (
                    <img 
                      src={settings.logoUrl} 
                      alt="logo" 
                      className="max-h-10 max-w-10 object-contain" 
                    />
                  ) : (
                    <div 
                      className="w-full h-full grid place-items-center text-white font-bold text-sm"
                      style={{ backgroundColor: settings.primaryColor }}
                    >
                      {settings.storeName?.charAt(0) || "S"}
                    </div>
                  )}
                </div>
                <div className="hidden sm:block">
                  <span className="font-bold text-xl text-gray-900 group-hover:text-brand-primary transition-colors">
                    {settings.storeName || "Store Saya"}
                  </span>
                </div>
              </>
            )}
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors relative",
                  pathname === item.href
                    ? "text-brand-primary"
                    : "text-gray-700 hover:text-brand-primary"
                )}
              >
                {item.name}
                {pathname === item.href && (
                  <div 
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ backgroundColor: settings.primaryColor }}
                  />
                )}
              </Link>
            ))}
          </div>
          
          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <Button
              variant="outline"
              size="sm"
              className="relative border-gray-200 hover:border-brand-primary hover:text-brand-primary"
              asChild
            >
              <Link href="/cart">
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Keranjang</span>
                {getCartCount() > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    style={{ backgroundColor: settings.primaryColor }}
                  >
                    {getCartCount()}
                  </Badge>
                )}
              </Link>
            </Button>
            
            {/* Admin Button */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex hover:bg-brand-primary/10 hover:text-brand-primary"
              asChild
            >
              <Link href="/admin">
                <User className="w-4 h-4 mr-2" />
                Admin
              </Link>
            </Button>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white py-4 space-y-2 animate-in slide-in-from-top">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block px-4 py-3 text-sm font-medium transition-colors rounded-lg",
                  pathname === item.href
                    ? "bg-brand-primary/10 text-brand-primary"
                    : "text-gray-700 hover:bg-gray-50 hover:text-brand-primary"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            <div className="pt-2 border-t">
              <Link
                href="/admin"
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-primary transition-colors rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="w-4 h-4" />
                Admin Panel
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}