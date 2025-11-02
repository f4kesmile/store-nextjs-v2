"use client";

import Link from "next/link";
import { useSettings } from "@/contexts/SettingsContext";
import { Mail, MapPin, Phone, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function SiteFooter() {
  const { settings, loading } = useSettings();

  if (loading) {
    return (
      <footer className="bg-muted/30 border-t">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 animate-pulse">
            <div className="space-y-4">
              <div className="h-8 w-32 bg-gray-200 rounded" />
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-3/4 bg-gray-200 rounded" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <div className="h-6 w-20 bg-gray-200 rounded" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded" />
                  <div className="h-4 w-2/3 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 grid place-items-center">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="logo" className="max-h-8 object-contain" />
                ) : (
                  <div className="text-white font-bold text-lg">
                    {settings.storeName?.charAt(0) || "S"}
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold">{settings.storeName || "Store Saya"}</h3>
            </div>
            <p className="text-gray-300 leading-relaxed">
              {settings.storeDescription || "Platform digital terpercaya untuk semua kebutuhan produk premium."}
            </p>
            <div className="flex gap-3">
              {settings.supportWhatsApp && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                  asChild
                >
                  <a
                    href={`https://wa.me/${settings.supportWhatsApp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    WhatsApp
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <nav className="flex flex-col space-y-3">
              <Link href="/products" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Produk
              </Link>
              <Link href="/contact" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Kontak
              </Link>
              <Link href="/cart" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Keranjang
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Kontak</h4>
            <div className="space-y-3">
              {settings.supportEmail && (
                <div className="flex items-center gap-3 text-gray-300">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <a href={`mailto:${settings.supportEmail}`} className="hover:text-white transition-colors">
                    {settings.supportEmail}
                  </a>
                </div>
              )}
              {settings.supportWhatsApp && (
                <div className="flex items-center gap-3 text-gray-300">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>{settings.supportWhatsApp}</span>
                </div>
              )}
              {settings.storeLocation && (
                <div className="flex items-center gap-3 text-gray-300">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>{settings.storeLocation}</span>
                </div>
              )}
            </div>
          </div>

          {/* Business Hours */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Jam Operasional</h4>
            <div className="space-y-2 text-gray-300">
              <div className="flex justify-between">
                <span>Senin - Jumat</span>
                <span>09:00 - 18:00</span>
              </div>
              <div className="flex justify-between">
                <span>Sabtu</span>
                <span>09:00 - 15:00</span>
              </div>
              <div className="flex justify-between">
                <span>Minggu</span>
                <span>Tutup</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-gray-700" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © 2025 {settings.storeName || "Store Saya"}. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}