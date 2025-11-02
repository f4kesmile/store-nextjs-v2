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
} from "lucide-react";

function CartContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const resellerRef = searchParams.get("ref");
  const { cart, updateQuantity, removeFromCart, getCartTotal, getCartCount } = useCart();
  const { settings } = useSettings();

  const goToCheckout = () => {
    router.push(resellerRef ? `/checkout?ref=${resellerRef}` : "/checkout");
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
                  <Link href={resellerRef ? `/products?ref=${resellerRef}` : "/products"}>
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

      <section className="py-8 sm:py-16 px-4">
        <div className="container">
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-blue-800">
                  <Package className="w-5 h-5" />
                  <span className="font-semibold">
                    Produk Digital - Tanpa Pengiriman Fisik
                  </span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  Akses produk langsung dikirim ke email setelah pembayaran dikonfirmasi
                </p>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {cart.map((item) => {
                const unitPrice =
                  typeof item.productPrice === "string"
                    ? parseFloat((item.productPrice as string).replace(/[^0-9.]/g, ""))
                    : Number(item.productPrice);
                const maxStock = Number(item.maxStock ?? 0) || 999;
                const variantId = item.variantId ?? 0;

                return (
                  <Card key={`${item.productId}-${item.variantId || "no-variant"}`} className="overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex gap-4 flex-1">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                            {item.productImage ? (
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Package className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <h3 className="font-semibold text-base sm:text-lg text-gray-900">
                              {item.productName}
                            </h3>
                            {item.variantName && item.variantValue && (
                              <Badge variant="secondary" className="text-xs">
                                {item.variantName}: {item.variantValue}
                              </Badge>
                            )}
                            {item.notes && (
                              <p className="text-xs sm:text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                <strong>Catatan:</strong> {item.notes}
                              </p>
                            )}
                            <div className="text-lg sm:text-xl font-bold text-brand-primary">
                              Rp {(unitPrice * item.quantity).toLocaleString("id-ID")}
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end gap-3 justify-between sm:justify-center">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  variantId ?? 0,
                                  Math.max(1, item.quantity - 1)
                                )
                              }
                              disabled={item.quantity <= 1}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>

                            <Input
                              type="number"
                              min="1"
                              max={maxStock}
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                const capped = Math.min(Math.max(1, val), maxStock);
                                updateQuantity(item.productId, variantId ?? 0, capped);
                              }}
                              className="w-16 text-center text-sm font-bold h-8"
                            />

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  variantId ?? 0,
                                  Math.min(maxStock, item.quantity + 1)
                                )
                              }
                              disabled={item.quantity >= maxStock}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeFromCart(item.productId, variantId ?? 0)}
                            className="h-8 px-3"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

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
                    <Link href={resellerRef ? `/products?ref=${resellerRef}` : "/products"}>
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
    <Suspense
      fallback={
        <PageLayout>
          <div className="container py-20">
            <div className="flex items-center justify-center min-h-96">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          </div>
        </PageLayout>
      }
    >
      <CartContent />
    </Suspense>
  );
}
