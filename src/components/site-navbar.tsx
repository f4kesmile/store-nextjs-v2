"use client";
import Link from "next/link";
import { useSettings } from "@/lib/hooks/use-settings";
import { ShoppingCart, User } from "lucide-react";
import { ResellerBadge } from "@/components/ResellerBadge";
import { ResetResellerButton } from "@/components/ResetResellerButton";

export function SiteNavbar(){
  const settings = useSettings();
  return (
    <nav className="border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center gap-2">
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt="logo" className="h-8" />
          ) : (
            <div className="h-8 w-8 rounded bg-primary" />
          )}
          <span className="font-bold text-lg">{settings.storeName || "Store Saya"}</span>
        </Link>
        
        {/* Reseller Badge - hanya muncul saat ada locked ref */}
        <div className="ml-4">
          <ResellerBadge />
        </div>
        
        <div className="ml-auto flex items-center gap-4">
          {/* Reset Reseller Button - hanya muncul saat ada locked ref */}
          <ResetResellerButton />
          
          <Link href="/cart" className="p-2"><ShoppingCart className="h-5 w-5"/></Link>
          <Link href="/admin" className="p-2"><User className="h-5 w-5"/></Link>
        </div>
      </div>
    </nav>
  );
}