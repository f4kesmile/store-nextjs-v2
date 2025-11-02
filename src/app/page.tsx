"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteNavbar } from "@/components/site-navbar";
import { useSettings } from "@/contexts/SettingsContext";
import { Loader2 } from "lucide-react";

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="h-16 bg-white border-b animate-pulse" />
      
      {/* Hero Section Skeleton */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="h-16 bg-gray-200 rounded-lg mx-auto mb-6 max-w-4xl animate-pulse" />
        <div className="h-6 bg-gray-200 rounded mx-auto mb-4 max-w-2xl animate-pulse" />
        <div className="h-6 bg-gray-200 rounded mx-auto mb-8 max-w-xl animate-pulse" />
        <div className="flex justify-center gap-4">
          <div className="h-14 w-40 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-14 w-40 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </section>
      
      {/* Features Section Skeleton */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg p-8 animate-pulse">
              <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto mb-4" />
              <div className="h-6 bg-gray-200 rounded mb-3" />
              <div className="h-4 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// Store header component with logo
function StoreHeader() {
  const { settings, loading } = useSettings();
  
  if (loading) {
    return (
      <div className="flex items-center gap-3 animate-pulse">
        <div className="w-10 h-10 bg-gray-200 rounded" />
        <div className="h-6 w-32 bg-gray-200 rounded" />
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded bg-muted overflow-hidden grid place-items-center border">
        {settings.logoUrl ? (
          <img src={settings.logoUrl} alt="logo" className="max-h-10 object-contain" />
        ) : (
          <div className="text-xs text-muted-foreground font-bold">
            {settings.storeName?.charAt(0) || "S"}
          </div>
        )}
      </div>
      <div className="text-lg font-semibold">{settings.storeName || "Store Saya"}</div>
    </div>
  );
}

export default function HomePage() {
  const { settings, loading } = useSettings();

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50"
      style={{
        background: `linear-gradient(to bottom right, color-mix(in srgb, ${settings.primaryColor} 5%, #faf5ff), color-mix(in srgb, ${settings.secondaryColor} 5%, #eff6ff))`
      }}
    >
      <SiteNavbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mb-8">
          <StoreHeader />
        </div>
        <h1 className="text-6xl font-bold mb-6 text-gray-800">
          Selamat Datang di{" "}
          <span 
            className="text-purple-600"
            style={{ color: settings.primaryColor }}
          >
            {settings?.storeName || "Store Saya"}
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          {settings?.storeDescription ||
            "Platform digital terpercaya untuk semua kebutuhan produk premium dan layanan sosial media."}
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/products"
            className="px-8 py-4 rounded-lg text-lg hover:opacity-90 font-bold transition-all text-white"
            style={{ 
              backgroundColor: settings.primaryColor,
              boxShadow: `0 4px 14px 0 ${settings.primaryColor}33`
            }}
          >
            🛍️ Belanja Sekarang
          </Link>
          <Link
            href="/contact"
            className="bg-white px-8 py-4 rounded-lg text-lg hover:bg-opacity-90 font-bold transition-all border-2"
            style={{ 
              color: settings.primaryColor,
              borderColor: settings.primaryColor
            }}
          >
            📞 Hubungi Kami
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-2xl transition-all group">
            <div 
              className="text-5xl mb-4 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center"
              style={{ backgroundColor: `${settings.primaryColor}15` }}
            >
              🚀
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-800">
              Cepat & Aman
            </h3>
            <p className="text-gray-600">
              Transaksi cepat dengan sistem keamanan terpercaya
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-2xl transition-all group">
            <div 
              className="text-5xl mb-4 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center"
              style={{ backgroundColor: `${settings.secondaryColor}15` }}
            >
              💎
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-800">
              Produk Premium
            </h3>
            <p className="text-gray-600">
              Koleksi produk digital berkualitas tinggi
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-2xl transition-all group">
            <div 
              className="text-5xl mb-4 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center"
              style={{ backgroundColor: `${settings.primaryColor}15` }}
            >
              🤝
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-800">
              Support 24/7
            </h3>
            <p className="text-gray-600">
              Tim support siap membantu kapan saja
            </p>
          </div>
        </div>
      </section>

      {/* About Section - Menggunakan data dari settings */}
      {settings?.aboutTitle && settings?.aboutDescription && (
        <section className="container mx-auto px-4 py-16">
          <div 
            className="text-white rounded-xl shadow-2xl p-8 md:p-12 text-center"
            style={{
              background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})`
            }}
          >
            <h2 className="text-4xl font-bold mb-6">{settings.aboutTitle}</h2>
            <p className="text-white/90 text-lg leading-relaxed max-w-4xl mx-auto whitespace-pre-line">
              {settings.aboutDescription}
            </p>

            {/* Quick Contact */}
            <div className="flex justify-center gap-4 mt-8">
              {settings.supportWhatsApp && (
                <a
                  href={`https://wa.me/${settings.supportWhatsApp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-bold transition-all"
                >
                  💬 Chat WhatsApp
                </a>
              )}
              {settings.supportEmail && (
                <a
                  href={`mailto:${settings.supportEmail}`}
                  className="bg-white/20 backdrop-blur text-white px-8 py-3 rounded-lg hover:bg-white/30 font-bold transition-all border border-white/30"
                >
                  📧 Kirim Email
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <StoreHeader />
          </div>
          <h3 className="text-2xl font-bold mb-2">
            {settings?.storeName || "Store Saya"}
          </h3>
          <p className="text-gray-400 mb-4">{settings?.storeDescription}</p>
          <div className="flex justify-center items-center gap-4 text-sm text-gray-400 flex-wrap">
            {settings?.storeLocation && (
              <>
                <span>📍 {settings.storeLocation}</span>
                <span className="hidden sm:inline">•</span>
              </>
            )}
            {settings?.supportEmail && (
              <>
                <span>📧 {settings.supportEmail}</span>
                <span className="hidden sm:inline">•</span>
              </>
            )}
            {settings?.supportWhatsApp && (
              <span>💬 {settings.supportWhatsApp}</span>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-500">
            © 2025 {settings?.storeName || "Store Saya"}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}