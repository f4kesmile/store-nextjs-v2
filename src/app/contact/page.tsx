// src/app/contact/page.tsx - GANTI SELURUH ISI
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Settings {
  storeName: string;
  storeDescription: string;
  supportWhatsApp: string;
  supportEmail: string;
  storeLocation: string;
  aboutTitle: string;
  aboutDescription: string;
}

export default function ContactPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-purple-600">
            {settings?.storeName || "Store Saya"}
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-700 hover:text-purple-600">
              Beranda
            </Link>
            <Link
              href="/products"
              className="text-gray-700 hover:text-purple-600"
            >
              Produk
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-purple-600 font-bold"
            >
              Kontak
            </Link>
          </div>
        </div>
      </nav>

      {/* Contact Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4 text-gray-800">
            Hubungi Kami
          </h1>
          <p className="text-center text-gray-600 mb-12">
            Kami siap membantu Anda! Silakan hubungi kami melalui kontak di
            bawah ini.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Contact Info Cards */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📧</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2 text-gray-800">
                    Email
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Hubungi kami melalui email untuk pertanyaan umum.
                  </p>
                  <a
                    href={`mailto:${settings?.supportEmail}`}
                    className="text-blue-600 hover:text-blue-700 font-medium break-all"
                  >
                    {settings?.supportEmail}
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💬</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2 text-gray-800">
                    WhatsApp
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Klik untuk memulai percakapan dengan kami.
                  </p>
                  <a
                    href={`https://wa.me/${settings?.supportWhatsApp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    {settings?.supportWhatsApp}
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all md:col-span-2">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📍</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2 text-gray-800">
                    Lokasi
                  </h3>
                  <p className="text-gray-600 mb-3">Kantor kami berpusat di:</p>
                  <p className="text-gray-800 font-medium">
                    {settings?.storeLocation}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-xl shadow-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-4">
              {settings?.aboutTitle || "Tentang Kami"}
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-line">
              {settings?.aboutDescription}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                href="/products"
                className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 font-bold transition-all"
              >
                🛍️ Lihat Produk
              </Link>
              <a
                href={`https://wa.me/${settings?.supportWhatsApp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-bold transition-all"
              >
                💬 Chat WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
