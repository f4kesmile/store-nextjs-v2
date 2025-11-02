"use client";

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
  Share2,
  Clock
} from "lucide-react";
import Link from "next/link";

export default function OrderSuccessPage() {
  const params = useParams();
  const { settings } = useSettings();
  const orderId = params.orderId as string;

  return (
    <PageLayout>
      {/* Success Hero */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="w-24 h-24 mx-auto bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-gray-900">Pesanan Berhasil!</h1>
              <p className="text-xl text-gray-600">
                Terima kasih telah berbelanja di <span className="font-semibold text-brand-primary">{settings.storeName}</span>
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-lg border">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Order ID:</p>
                <p className="text-2xl font-mono font-bold text-brand-primary">{orderId}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Order Details */}
      <section className="py-16 px-4">
        <div className="container">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* What's Next */}
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <SectionHeader
                  title="Langkah Selanjutnya"
                  description="Berikut adalah yang akan terjadi dengan pesanan Anda"
                  icon={<Clock className="w-6 h-6" />}
                  className="mb-8"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                      <Mail className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Konfirmasi Email</h3>
                      <p className="text-sm text-gray-600">Detail pesanan dikirim ke email Anda</p>
                    </div>
                  </div>
                  
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                      <Phone className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Konfirmasi Pembayaran</h3>
                      <p className="text-sm text-gray-600">Kami akan menghubungi dalam 1-2 jam</p>
                    </div>
                  </div>
                  
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Pengiriman</h3>
                      <p className="text-sm text-gray-600">Produk dikirim setelah pembayaran</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Contact Support */}
            <Card className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-xl">
              <CardContent className="p-8 text-center space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Butuh Bantuan?</h3>
                  <p className="text-white/90">
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
                        <Phone className="w-5 h-5 mr-2" />
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
                        <Mail className="w-5 h-5 mr-2" />
                        Kirim Email
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" size="lg" asChild>
                <Link href="/products">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Lanjut Belanja
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => window.print()}
              >
                <Download className="w-5 h-5 mr-2" />
                Print Order
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}