"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useToast } from "@/components/ui/toast";
import {
  CreditCard,
  Package,
  User,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  Shield
} from "lucide-react";
import Link from "next/link";

interface Reseller {
  id: number;
  name: string;
  uniqueId: string;
  whatsappNumber: string;
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resellerRef = searchParams.get("ref");
  const { settings } = useSettings();
  const toast = useToast();
  
  const { cart, getTotalPrice, getTotalItems, clearCart } = useCart();
  const [reseller, setReseller] = useState<Reseller | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    paymentMethod: "manual",
    notes: ""
  });

  useEffect(() => {
    if (cart.length === 0) {
      router.push(resellerRef ? `/products?ref=${resellerRef}` : "/products");
      return;
    }
    
    if (resellerRef) {
      fetchReseller(resellerRef);
    }
  }, [cart.length, resellerRef, router]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const orderData = {
        ...formData,
        items: cart,
        totalAmount: getTotalPrice(),
        totalItems: getTotalItems(),
        resellerId: reseller?.id,
        resellerRef: resellerRef
      };
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        clearCart();
        toast({ 
          title: "✅ Pesanan berhasil dibuat!", 
          description: "Kami akan menghubungi Anda segera",
          variant: "success" 
        });
        
        // Redirect to success page or WhatsApp
        if (reseller?.whatsappNumber) {
          const message = `Halo ${reseller.name}, saya ingin melanjutkan pesanan #${result.orderId}. Total: Rp ${getTotalPrice().toLocaleString('id-ID')}`;
          window.open(`https://wa.me/${reseller.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
        }
        
        router.push(`/orders/${result.orderId}`);
      } else {
        throw new Error(result.error || 'Gagal membuat pesanan');
      }
    } catch (error: any) {
      toast({ 
        title: "Gagal membuat pesanan", 
        description: error.message || "Silakan coba lagi",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return formData.customerName && 
           formData.customerEmail && 
           formData.customerPhone && 
           formData.customerAddress;
  };

  if (cart.length === 0) {
    return null; // Will redirect in useEffect
  }

  return (
    <PageLayout>
      {/* Header */}
      <section className="py-12 px-4 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="container">
          <SectionHeader
            title="Checkout"
            description="Lengkapi data pemesanan Anda"
            icon={<CreditCard className="w-6 h-6" />}
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
                Pesanan akan diproses oleh: <span className="font-bold text-yellow-300">{reseller.name}</span>
              </span>
            </div>
          </div>
        </section>
      )}

      <section className="py-12 px-4">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <div className="space-y-8">
              {/* Back to Cart */}
              <Button variant="outline" size="sm" asChild>
                <Link href={resellerRef ? `/cart?ref=${resellerRef}` : "/cart"}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali ke Keranjang
                </Link>
              </Button>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Customer Information */}
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-brand-primary" />
                      <h3 className="text-lg font-semibold">Informasi Pelanggan</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="customerName">Nama Lengkap *</Label>
                        <Input
                          id="customerName"
                          name="customerName"
                          value={formData.customerName}
                          onChange={handleInputChange}
                          placeholder="Masukkan nama lengkap"
                          required
                          disabled={loading}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="customerPhone">No. Telepon *</Label>
                        <Input
                          id="customerPhone"
                          name="customerPhone"
                          value={formData.customerPhone}
                          onChange={handleInputChange}
                          placeholder="Contoh: +6281234567890"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="customerEmail">Email *</Label>
                      <Input
                        id="customerEmail"
                        name="customerEmail"
                        type="email"
                        value={formData.customerEmail}
                        onChange={handleInputChange}
                        placeholder="email@example.com"
                        required
                        disabled={loading}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="customerAddress">Alamat Lengkap *</Label>
                      <textarea
                        id="customerAddress"
                        name="customerAddress"
                        value={formData.customerAddress}
                        onChange={handleInputChange}
                        placeholder="Masukkan alamat lengkap dengan kode pos"
                        required
                        disabled={loading}
                        rows={3}
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50"
                      />
                    </div>
                  </CardContent>
                </Card>
                
                {/* Additional Notes */}
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-3">
                      <Package className="w-5 h-5 text-brand-primary" />
                      Catatan Tambahan
                    </h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">Catatan untuk Penjual (Opsional)</Label>
                      <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Tambahkan catatan khusus untuk pesanan Anda..."
                        disabled={loading}
                        rows={3}
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50"
                      />
                    </div>
                  </CardContent>
                </Card>
                
                {/* Payment Method */}
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-brand-primary" />
                      Metode Pembayaran
                    </h3>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium mb-1">Transfer Manual</p>
                          <p>Kami akan mengirimkan detail pembayaran setelah pesanan dikonfirmasi</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={!isFormValid() || loading}
                  className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-lg py-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Memproses Pesanan...
                    </>
                  ) : (
                    <>
                      Buat Pesanan
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
                
                {!isFormValid() && (
                  <div className="flex items-center gap-2 text-orange-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Harap lengkapi semua field yang wajib diisi
                  </div>
                )}
              </form>
            </div>
            
            {/* Order Summary */}
            <div className="space-y-6">
              <Card className="sticky top-24">
                <CardContent className="p-6 space-y-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Ringkasan Pesanan
                  </h3>
                  
                  {/* Order Items */}
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={`${item.productId}-${item.variantId || 'no-variant'}`} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0">
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <Package className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.productName}</p>
                          {item.variantName && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {item.variantName}: {item.variantValue}
                            </Badge>
                          )}
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-gray-600">x{item.quantity}</span>
                            <span className="font-semibold text-sm">
                              Rp {(item.productPrice * item.quantity).toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  {/* Price Summary */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal ({getTotalItems()} item):</span>
                      <span className="font-medium">Rp {getTotalPrice().toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Biaya Admin:</span>
                      <span className="font-medium text-green-600">Gratis</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Biaya Pengiriman:</span>
                      <span className="font-medium text-blue-600">Ditanggung pembeli</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-brand-primary">
                      Rp {getTotalPrice().toLocaleString("id-ID")}
                    </span>
                  </div>
                  
                  {/* Security Badge */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Transaksi Aman & Terpercaya</span>
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

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <PageLayout>
          <div className="container py-20">
            <div className="flex items-center justify-center min-h-96">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin brand-primary" />
                <p className="text-lg font-semibold">Loading checkout...</p>
              </div>
            </div>
          </div>
        </PageLayout>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}