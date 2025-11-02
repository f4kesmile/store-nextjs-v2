"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Loader2
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
  
  const { cart, updateQuantity, removeFromCart, getTotalPrice, getTotalItems } = useCart();
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
    updateQuantity(productId, variantId, newQuantity);
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
        <section className="py-20 px-4">
          <div className="container">
            <div className="max-w-md mx-auto text-center space-y-6">
              <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-16 h-16 text-gray-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Keranjang Kosong</h2>
                <p className="text-gray-600">Belum ada produk yang ditambahkan ke keranjang</p>
              </div>
              <Button asChild className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90">
                <Link href={resellerRef ? `/products?ref=${resellerRef}` : "/products"}>
                  <Package className="w-4 h-4 mr-2" />
                  Mulai Belanja
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Header */}
      <section className="py-12 px-4 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="container">
          <SectionHeader
            title="Keranjang Belanja"
            description={`${getTotalItems()} item dalam keranjang Anda`}
            icon={<ShoppingCart className="w-6 h-6" />}
          />
        </div>
      </section>

      {/* Reseller Banner */}
      {reseller && (
        <section className="py-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="container">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">
                Pembelian melalui reseller: <span className="font-bold text-yellow-300">{reseller.name}</span>
              </span>
            </div>
          </div>
        </section>
      )}

      <section className="py-12 px-4">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Item dalam Keranjang</h3>
                <Button variant="outline" size="sm" asChild>
                  <Link href={resellerRef ? `/products?ref=${resellerRef}` : "/products"}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Lanjut Belanja
                  </Link>
                </Button>
              </div>
              
              <div className="space-y-4">
                {cart.map((item) => (
                  <Card key={`${item.productId}-${item.variantId || 'no-variant'}`} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-1 space-y-3">
                          <div className="space-y-1">
                            <h4 className="font-semibold text-gray-900">{item.productName}</h4>
                            {item.variantName && (
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {item.variantName}: {item.variantValue}
                                </Badge>
                              </div>
                            )}
                            {item.notes && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Catatan:</span> {item.notes}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="text-lg font-bold text-brand-primary">
                              Rp {item.productPrice.toLocaleString("id-ID")}
                            </div>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 border rounded-lg">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleQuantityUpdate(item.productId, item.variantId, item.quantity - 1, item.maxStock)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                <span className="w-12 text-center font-medium">{item.quantity}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleQuantityUpdate(item.productId, item.variantId, item.quantity + 1, item.maxStock)}
                                  disabled={item.quantity >= item.maxStock}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveItem(item.productId, item.variantId)}
                                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Stock Warning */}
                          {item.quantity >= item.maxStock * 0.8 && (
                            <div className="flex items-center gap-2 text-orange-600 text-sm">
                              <AlertTriangle className="w-4 h-4" />
                              Stok terbatas (tersisa {item.maxStock})
                            </div>
                          )}
                          
                          {/* Subtotal */}
                          <div className="pt-2 border-t">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Subtotal:</span>
                              <span className="font-semibold text-lg">
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
            <div className="space-y-6">
              <Card className="sticky top-24">
                <CardContent className="p-6 space-y-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Ringkasan Pesanan
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Jumlah Item:</span>
                        <span className="font-medium">{getTotalItems()} item</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">Rp {getTotalPrice().toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Biaya Admin:</span>
                        <span className="font-medium text-green-600">Gratis</span>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-2xl font-bold text-brand-primary">
                        Rp {getTotalPrice().toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-lg py-6"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        Lanjut ke Checkout
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                  
                  {/* Security Info */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-green-800">
                        <p className="font-medium mb-1">Transaksi Aman</p>
                        <p>Data Anda dilindungi dengan enkripsi SSL</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Contact Support */}
                  {settings.supportWhatsApp && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Butuh bantuan?</p>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="border-green-500 text-green-600 hover:bg-green-50"
                      >
                        <a
                          href={`https://wa.me/${settings.supportWhatsApp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Chat Customer Service
                        </a>
                      </Button>
                    </div>
                  )}
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
          <div className="container py-20">
            <div className="flex items-center justify-center min-h-96">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin brand-primary" />
                <p className="text-lg font-semibold">Loading cart...</p>
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