"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useToast } from "@/components/ui/toast";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Package,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  Phone,
  Download
} from "lucide-react";
import Link from "next/link";

interface Reseller {
  id: number;
  name: string;
  uniqueId: string;
  whatsappNumber: string;
}

function CartContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resellerRef = searchParams.get("ref");
  const { settings } = useSettings();
  const toast = useToast();
  
  const { cart, updateQuantity, removeFromCart, getCartTotal, getCartCount } = useCart();
  const [reseller, setReseller] = useState<Reseller | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (resellerRef) {
      fetchReseller(resellerRef);
    }
  }, [resellerRef]);

  const fetchReseller = async (refId: string) => {
    try {
      const res = await fetch(`/api/resellers/validate?ref=${refId}`);
      if (res.ok) {
        const data = await res.json();
        setReseller(data);
      }
    } catch (error) {
      console.error("Reseller tidak ditemukan");
    }
  };

  const handleQuantityUpdate = (productId: number, variantId: number | undefined, newQuantity: number, maxStock: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > maxStock) {
      toast({ 
        title: "Stok tidak mencukupi", 
        description: `Maksimal pembelian: ${maxStock}`,
        variant: "destructive" 
      });
      return;
    }
    updateQuantity(productId, newQuantity, variantId);
  };

  const handleRemoveItem = (productId: number, variantId: number | undefined) => {
    removeFromCart(productId, variantId);
    toast({ 
      title: "Item dihapus", 
      description: "Produk telah dihapus dari keranjang",
      variant: "success" 
    });
  };

  const handleCheckout = () => {
    setLoading(true);
    const checkoutUrl = resellerRef ? `/checkout?ref=${resellerRef}` : "/checkout";
    router.push(checkoutUrl);
  };

  if (cart.length === 0) {
    return (
      <PageLayout>
        <section className="py-12 sm:py-20 px-4">
          <div className="container">
            <div className="max-w-md mx-auto text-center space-y-6 sm:space-y-8">
              <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
              </div>
              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Keranjang Kosong</h2>
                <p className="text-base sm:text-lg text-gray-600">Belum ada produk yang ditambahkan ke keranjang Anda</p>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <Button 
                  asChild 
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 px-6 sm:px-8 text-base font-semibold"
                >
                  <Link href={resellerRef ? `/products?ref=${resellerRef}` : "/products"}>
                    <Package className="w-5 h-5 mr-2" />
                    Mulai Belanja
                  </Link>
                </Button>
                <div className="text-sm text-gray-500">
                  Atau <Link href="/contact" className="text-brand-primary hover:underline font-medium">hubungi kami</Link> jika butuh bantuan
                </div>
              </div>
            </div>
          </div>
        </section>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Header */}
      <section className="py-8 sm:py-12 px-4 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="container">
          <SectionHeader
            title="Keranjang Belanja"
            description={`${getCartCount()} item dalam keranjang Anda`}
            icon={<ShoppingCart className="w-6 h-6" />}
          />
        </div>
      </section>

      {/* Reseller Banner */}
      {reseller && (
        <section className="py-3 sm:py-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="container">
            <div className="flex items-center justify-center gap-2 text-sm sm:text-base">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="font-medium text-center">
                Pembelian melalui reseller: <span className="font-bold text-yellow-300">{reseller.name}</span>
              </span>
            </div>
          </div>
        </section>
      )}

      <section className="py-8 sm:py-12 px-4">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-lg sm:text-xl font-semibold">Item dalam Keranjang</h3>
                <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                  <Link href={resellerRef ? `/products?ref=${resellerRef}` : "/products"}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Lanjut Belanja
                  </Link>
                </Button>
              </div>
              
              <div className="space-y-4">
                {cart.map((item) => (
                  <Card key={`${item.productId}-${item.variantId || 'no-variant'}`} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex gap-3 sm:gap-4">
                        {/* Product Image */}
                        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                          )}
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-1 space-y-3">
                          <div className="space-y-1 sm:space-y-2">
                            <h4 className="font-semibold text-gray-900 text-base sm:text-lg line-clamp-2">{item.productName}</h4>
                            {item.variantName && (
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {item.variantName}: {item.variantValue}
                                </Badge>
                              </div>
                            )}
                            {item.notes && (
                              <p className="text-xs sm:text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                <span className="font-medium">Catatan:</span> {item.notes}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="text-lg sm:text-xl font-bold text-brand-primary">
                              Rp {item.productPrice.toLocaleString("id-ID")}
                              <span className="text-xs sm:text-sm text-gray-500 font-normal ml-2">per item</span>
                            </div>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3 sm:gap-4">
                              <div className="flex items-center gap-1 sm:gap-2 border rounded-lg bg-white">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleQuantityUpdate(item.productId, item.variantId, item.quantity - 1, item.maxStock)}
                                  disabled={item.quantity <= 1}
                                  className="h-8 w-8 sm:h-10 sm:w-10 p-0"
                                >
                                  <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                                <div className="w-12 sm:w-16 text-center font-semibold text-sm sm:text-lg">
                                  {item.quantity}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleQuantityUpdate(item.productId, item.variantId, item.quantity + 1, item.maxStock)}
                                  disabled={item.quantity >= item.maxStock}
                                  className="h-8 w-8 sm:h-10 sm:w-10 p-0"
                                >
                                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                              </div>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveItem(item.productId, item.variantId)}
                                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 h-8 w-8 sm:h-10 sm:w-10 p-0"
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Stock Warning */}
                          {item.quantity >= item.maxStock * 0.8 && (
                            <div className="flex items-center gap-2 text-orange-600 text-xs sm:text-sm bg-orange-50 p-2 rounded">
                              <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              Stok terbatas (tersisa {item.maxStock})
                            </div>
                          )}
                          
                          {/* Subtotal */}
                          <div className="pt-3 border-t">
                            <div className="flex justify-between items-center">
                              <span className="text-xs sm:text-sm text-gray-600">Subtotal:</span>
                              <span className="font-bold text-lg sm:text-xl text-brand-primary">
                                Rp {(item.productPrice * item.quantity).toLocaleString("id-ID")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="space-y-4 sm:space-y-6">
              <Card className="sticky top-20 sm:top-24 shadow-xl">
                <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                    <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary" />
                    Ringkasan Pesanan
                  </h3>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-gray-600">Jumlah Item:</span>
                        <span className="font-semibold">{getCartCount()} item</span>
                      </div>
                      <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-semibold">Rp {getCartTotal().toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-gray-600">Biaya Admin:</span>
                        <span className="font-semibold text-green-600">Gratis</span>
                      </div>
                      {/* Removed shipping costs */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Download className="w-4 h-4 text-blue-600" />
                          <span className="text-xs sm:text-sm font-medium text-blue-800">
                            Produk Digital - Tanpa Pengiriman Fisik
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center py-2">
                      <span className="text-lg sm:text-xl font-bold">Total:</span>
                      <span className="text-2xl sm:text-3xl font-bold text-brand-primary">
                        Rp {getCartTotal().toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleCheckout}
                    disabled={loading || cart.length === 0}
                    className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-base sm:text-lg py-4 sm:py-6 shadow-lg font-semibold"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        Lanjut ke Checkout
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                      </>
                    )}
                  </Button>
                  
                  {/* Security Info */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs sm:text-sm text-green-800">
                        <p className="font-semibold mb-1">Transaksi Aman & Terpercaya</p>
                        <p className="text-xs">Data Anda dilindungi dengan enkripsi SSL</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Contact Support */}
                  {settings.supportWhatsApp && (
                    <div className="text-center pt-3 sm:pt-4 border-t">
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">Butuh bantuan dengan pesanan?</p>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="w-full sm:w-auto border-green-500 text-green-600 hover:bg-green-50 text-xs sm:text-sm"
                      >
                        <a
                          href={`https://wa.me/${settings.supportWhatsApp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                          Chat Customer Service
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Trust Badges */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 block lg:block">
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 text-xs sm:text-sm">Garansi Uang Kembali</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 text-xs sm:text-sm">Support 24/7</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 text-xs sm:text-sm">Produk Original</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 text-xs sm:text-sm">Proses Instant</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
          <div className="container py-12 sm:py-20">
            <div className="flex items-center justify-center min-h-96">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin brand-primary" />
                <p className="text-base sm:text-lg font-semibold">Loading cart...</p>
              </div>
            </div>
          </div>
        </PageLayout>
      }
    >
      <CartContent />
    </Suspense>
  );
}