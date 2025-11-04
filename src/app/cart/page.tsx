"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useSettings } from "@/contexts/SettingsContext";
import {
  ShoppingCart,
  Package,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShoppingBag,
  AlertCircle,
  Loader2,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";

interface Reseller {
  id: number;
  name: string;
  uniqueId: string;
  whatsappNumber: string;
}

function getStickyResellerRef(searchParams: URLSearchParams) {
  if (typeof window === "undefined") return null;
  // 1. from URL
  const urlRef = searchParams.get("ref");
  if (urlRef) return urlRef;
  // 2. from localStorage
  try { return localStorage.getItem("resellerRef") || null; } catch { return null; }
}

function CartContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const stickyRef = getStickyResellerRef(searchParams);
  const { cart, updateQuantity, removeFromCart, getCartTotal, getCartCount, clearCart } = useCart();
  const { settings } = useSettings();
  const [reseller, setReseller] = useState<Reseller | null>(null);

  useEffect(() => {
    if (stickyRef) {
      fetchReseller(stickyRef);
      // Sync to storage for next pages
      if (typeof window !== "undefined") {
        localStorage.setItem("resellerRef", stickyRef);
        document.cookie = `resellerRef=${stickyRef}; path=/; max-age=2592000`;
      }
    }
  }, [stickyRef]);

  const fetchReseller = async (refId: string) => {
    try {
      const res = await fetch(`/api/resellers/validate?ref=${refId}`);
      if (res.ok) {
        const data = await res.json();
        setReseller(data);
      } else {
        setReseller(null);
      }
    } catch {
      setReseller(null);
    }
  };

  const goToCheckout = () => {
    router.push(stickyRef ? `/checkout?ref=${stickyRef}` : "/checkout");
  };

  if (cart.length === 0) {
    return (
      <PageLayout>
        <section className="py-8 sm:py-12 px-4 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="container">
            <SectionHeader
              title="Keranjang Belanja"
              description="Keranjang Anda kosong"
              icon={<ShoppingCart className="w-6 h-6 text-gray-900" />}
              className="relative z-10 [&_.section-title]:text-gray-900 [&_.section-desc]:text-gray-600"
            />
          </div>
        </section>
        <section className="py-12 sm:py-20 px-4">
          <div className="container">
            <div className="max-w-md mx-auto text-center space-y-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Keranjang Kosong
                </h2>
                <p className="text-gray-600">Belum ada produk yang dipilih</p>
              </div>
              <div className="space-y-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 font-semibold"
                >
                  <Link href={stickyRef ? `/products?ref=${stickyRef}` : "/products"}>
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Mulai Belanja
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali ke Beranda
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <section className="py-8 sm:py-12 px-4 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="container">
          <SectionHeader
            title="Keranjang Belanja"
            description={`${getCartCount()} item dalam keranjang Anda`}
            icon={<ShoppingCart className="w-6 h-6 text-gray-900" />}
            className="relative z-10 [&_.section-title]:text-gray-900 [&_.section-desc]:text-gray-600"
          />
        </div>
      </section>
      {/* Reseller Banner */}
      {reseller && (
        <section className="py-3 sm:py-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="container">
            <div className="text-center space-y-2">
              <p className="text-sm sm:text-lg font-bold flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                Pesanan via reseller: <span className="text-yellow-300">{reseller.name}</span>
              </p>
            </div>
          </div>
        </section>
      )}
      <section className="py-8 sm:py-16 px-4">
        <div className="container">
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
            {/* ... cart items ... */}
            <Card className="bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5 border-brand-primary/20">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Ringkasan Pesanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-base">
                    <span className="text-gray-700">Subtotal ({getCartCount()} item):</span>
                    <span className="font-semibold">Rp {getCartTotal().toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-gray-700">Biaya Admin:</span>
                    <span className="font-semibold text-green-600">GRATIS</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between text-xl font-bold">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-brand-primary">Rp {getCartTotal().toLocaleString("id-ID")}</span>
                  </div>
                </div>
                <div className="space-y-3 pt-4">
                  <Button
                    onClick={goToCheckout}
                    className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 h-12 text-base font-bold"
                    size="lg"
                  >
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Lanjut ke Checkout
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full h-12 text-base font-semibold"
                    size="lg"
                  >
                    <Link href={stickyRef ? `/products?ref=${stickyRef}` : "/products"}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Lanjut Belanja
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={<PageLayout><div className="container py-20"><div className="flex items-center justify-center min-h-96"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></div></PageLayout>}>
      <CartContent />
    </Suspense>
  );
}
