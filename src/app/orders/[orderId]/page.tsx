"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/contexts/SettingsContext";
import {
  CheckCircle,
  Package,
  Phone,
  Mail,
  ArrowLeft,
  Download,
  Clock,
  User,
  MapPin,
  Loader2
} from "lucide-react";
import Link from "next/link";

interface OrderDetails {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  totalAmount: number;
  totalItems: number;
  status: string;
  createdAt: string;
  paymentMethod: string;
  notes?: string;
  items: Array<{
    productName: string;
    variantName?: string;
    variantValue?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
  }>;
  reseller?: {
    name: string;
    whatsappNumber: string;
  };
}

export default function OrderSuccessPage() {
  const params = useParams();
  const { settings } = useSettings();
  const orderId = params.orderId as string;
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrderDetails(data.order);
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { variant: 'secondary' as const, text: 'Menunggu Konfirmasi', color: 'bg-yellow-100 text-yellow-800' };
      case 'confirmed':
        return { variant: 'default' as const, text: 'Dikonfirmasi', color: 'bg-blue-100 text-blue-800' };
      case 'processing':
        return { variant: 'default' as const, text: 'Diproses', color: 'bg-purple-100 text-purple-800' };
      case 'completed':
        return { variant: 'default' as const, text: 'Selesai', color: 'bg-green-100 text-green-800' };
      case 'cancelled':
        return { variant: 'destructive' as const, text: 'Dibatalkan', color: 'bg-red-100 text-red-800' };
      default:
        return { variant: 'secondary' as const, text: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="container py-20">
          <div className="flex items-center justify-center min-h-96">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-lg font-semibold">Loading order details...</p>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Success Hero */}
      <section className="py-12 sm:py-20 px-4 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6 sm:space-y-8">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">Pesanan Berhasil!</h1>
              <p className="text-lg sm:text-xl text-gray-600">
                Terima kasih telah berbelanja di <span className="font-semibold text-brand-primary">{settings.storeName}</span>
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border max-w-md mx-auto">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Order ID:</p>
                <p className="text-xl sm:text-2xl font-mono font-bold text-brand-primary break-all">{orderId}</p>
                {orderDetails && (
                  <div className="pt-2">
                    <Badge className={getStatusBadge(orderDetails.status).color}>
                      {getStatusBadge(orderDetails.status).text}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Order Details */}
      {orderDetails && (
        <section className="py-12 sm:py-16 px-4">
          <div className="container">
            <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
              
              {/* Order Summary */}
              <Card className="shadow-lg">
                <CardContent className="p-6 sm:p-8">
                  <SectionHeader
                    title="Detail Pesanan"
                    description={`Pesanan dibuat pada ${new Date(orderDetails.createdAt).toLocaleDateString('id-ID')}`}
                    icon={<Package className="w-6 h-6" />}
                    className="mb-6"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    {/* Customer Info */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Informasi Customer
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="text-gray-500">Nama:</span>
                          <p className="font-medium">{orderDetails.customerName}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Email:</span>
                          <p className="font-medium">{orderDetails.customerEmail}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Telepon:</span>
                          <p className="font-medium">{orderDetails.customerPhone}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Alamat:</span>
                          <p className="font-medium">{orderDetails.customerAddress}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Order Info */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Ringkasan Pesanan</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Total Item:</span>
                          <span className="font-medium">{orderDetails.totalItems} item</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Metode Pembayaran:</span>
                          <span className="font-medium capitalize">{orderDetails.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between text-lg">
                          <span className="font-semibold">Total:</span>
                          <span className="font-bold text-brand-primary">
                            Rp {orderDetails.totalAmount.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Order Items */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Item Pesanan</h3>
                    <div className="space-y-3">
                      {orderDetails.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{item.productName}</p>
                            {item.variantName && (
                              <p className="text-sm text-gray-600">{item.variantName}: {item.variantValue}</p>
                            )}
                            {item.notes && (
                              <p className="text-xs text-gray-500">Catatan: {item.notes}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">Rp {item.totalPrice.toLocaleString('id-ID')}</p>
                            <p className="text-sm text-gray-500">x{item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {orderDetails.notes && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Catatan Customer:</h4>
                      <p className="text-sm text-blue-800">{orderDetails.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* What's Next */}
              <Card className="shadow-lg">
                <CardContent className="p-6 sm:p-8">
                  <SectionHeader
                    title="Langkah Selanjutnya"
                    description="Berikut adalah yang akan terjadi dengan pesanan Anda"
                    icon={<Clock className="w-6 h-6" />}
                    className="mb-6"
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    <div className="text-center space-y-3 p-4 bg-blue-50 rounded-lg">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-blue-500 rounded-full flex items-center justify-center">
                        <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Konfirmasi Email</h3>
                        <p className="text-xs sm:text-sm text-gray-600">Detail pesanan dikirim ke email Anda</p>
                      </div>
                    </div>
                    
                    <div className="text-center space-y-3 p-4 bg-green-50 rounded-lg">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center">
                        <Phone className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Konfirmasi Pembayaran</h3>
                        <p className="text-xs sm:text-sm text-gray-600">Kami akan menghubungi dalam 1-2 jam</p>
                      </div>
                    </div>
                    
                    <div className="text-center space-y-3 p-4 bg-purple-50 rounded-lg">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-purple-500 rounded-full flex items-center justify-center">
                        <Download className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Akses Produk</h3>
                        <p className="text-xs sm:text-sm text-gray-600">Link download dikirim setelah pembayaran</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Contact Support */}
              <Card className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-xl">
                <CardContent className="p-6 sm:p-8 text-center space-y-4 sm:space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-xl sm:text-2xl font-bold">Butuh Bantuan?</h3>
                    <p className="text-white/90 text-sm sm:text-base">
                      Tim customer service kami siap membantu 24/7
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {settings.supportWhatsApp && (
                      <Button
                        size="lg"
                        className="bg-white text-brand-primary hover:bg-white/90 font-semibold"
                        asChild
                      >
                        <a
                          href={`https://wa.me/${settings.supportWhatsApp.replace(/[^0-9]/g, '')}?text=Halo, saya butuh bantuan dengan order ${orderId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          Chat WhatsApp
                        </a>
                      </Button>
                    )}
                    
                    {settings.supportEmail && (
                      <Button
                        variant="outline"
                        size="lg"
                        className="border-white text-white hover:bg-white/10 font-semibold"
                        asChild
                      >
                        <a href={`mailto:${settings.supportEmail}?subject=Bantuan Order ${orderId}`}>
                          <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          Kirim Email
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" size="lg" asChild className="font-semibold">
                  <Link href="/products">
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Lanjut Belanja
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => window.print()}
                  className="font-semibold"
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Print Order
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}
      
      {!loading && !orderDetails && (
        <section className="py-20 px-4">
          <div className="container">
            <div className="max-w-md mx-auto text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <Package className="w-10 h-10 text-red-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Pesanan Tidak Ditemukan</h2>
                <p className="text-gray-600">Order ID yang Anda cari tidak tersedia</p>
              </div>
              <Button asChild>
                <Link href="/products">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali Belanja
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </PageLayout>
  );
}