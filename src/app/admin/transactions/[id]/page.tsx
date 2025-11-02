"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, User, Calendar, CreditCard } from "lucide-react";

interface OrderItem {
  productId: number;
  productName: string;
  variantName?: string;
  variantValue?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  totalAmount: number;
  totalItems: number;
  status: string;
  paymentMethod: string;
  notes?: string;
  createdAt: string;
  items: OrderItem[];
  reseller?: {
    name: string;
    uniqueId: string;
    whatsappNumber: string;
  } | null;
}

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchOrder(params.id as string);
    }
  }, [params.id]);

  const fetchOrder = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`);
      const data = await res.json();
      if (data.order) {
        setOrder(data.order);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="container py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat detail transaksi...</p>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!order) {
    return (
      <PageLayout>
        <div className="container py-8">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Transaksi Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-6">Transaksi yang Anda cari tidak ditemukan atau telah dihapus.</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <h1 className="text-2xl font-bold">Detail Transaksi #{order.id}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Informasi Pesanan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="font-medium">Status:</span>
                <Badge className="ml-2 capitalize">{order.status}</Badge>
              </div>
              <div>
                <span className="font-medium">Total Amount:</span>
                <span className="ml-2 font-semibold text-brand-primary">
                  Rp {order.totalAmount?.toLocaleString("id-ID")}
                </span>
              </div>
              <div>
                <span className="font-medium">Total Items:</span>
                <span className="ml-2">{order.totalItems} item</span>
              </div>
              <div>
                <span className="font-medium">Payment Method:</span>
                <span className="ml-2">{order.paymentMethod}</span>
              </div>
              <div>
                <span className="font-medium">Tanggal:</span>
                <span className="ml-2">
                  {new Date(order.createdAt).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
              </div>
              {order.notes && (
                <div>
                  <span className="font-medium">Catatan:</span>
                  <p className="mt-1 text-sm text-gray-600 bg-gray-50 p-2 rounded">{order.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informasi Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="font-medium">Nama:</span>
                <span className="ml-2">{order.customerName}</span>
              </div>
              <div>
                <span className="font-medium">Email:</span>
                <span className="ml-2">{order.customerEmail}</span>
              </div>
              <div>
                <span className="font-medium">Telepon:</span>
                <span className="ml-2">{order.customerPhone}</span>
              </div>
              {order.customerAddress && (
                <div>
                  <span className="font-medium">Alamat:</span>
                  <p className="mt-1 text-sm text-gray-600">{order.customerAddress}</p>
                </div>
              )}
              {order.reseller && (
                <div className="pt-2 border-t">
                  <span className="font-medium text-blue-600">Reseller:</span>
                  <div className="mt-1 text-sm">
                    <p><strong>{order.reseller.name}</strong></p>
                    <p className="text-gray-600">ID: {order.reseller.uniqueId}</p>
                    <p className="text-gray-600">WA: {order.reseller.whatsappNumber}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Item Pesanan ({order.items?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items?.map((item: OrderItem, index: number) => (
                <div key={index} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{item.productName}</h4>
                    {item.variantName && item.variantValue && (
                      <p className="text-sm text-gray-600 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {item.variantName}: {item.variantValue}
                        </Badge>
                      </p>
                    )}
                    {item.notes && (
                      <p className="text-xs text-gray-500 mt-2 bg-white p-2 rounded border-l-4 border-blue-200">
                        <strong>Catatan:</strong> {item.notes}
                      </p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-gray-900">
                      Rp {item.unitPrice?.toLocaleString("id-ID")} × {item.quantity}
                    </p>
                    <p className="text-sm font-bold text-brand-primary">
                      Total: Rp {item.totalPrice?.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              ))}
              
              {(!order.items || order.items.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Tidak ada item dalam pesanan ini</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}