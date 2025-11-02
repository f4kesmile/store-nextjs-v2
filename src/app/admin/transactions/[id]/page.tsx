"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Package, User, MessageCircle, Download, Trash2, Save, Phone } from "lucide-react";

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

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  { value: "confirmed", label: "Confirmed", color: "bg-blue-100 text-blue-800" },
  { value: "processing", label: "Processing", color: "bg-purple-100 text-purple-800" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-800" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
  { value: "refunded", label: "Refunded", color: "bg-gray-100 text-gray-800" }
];

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
        setStatus(data.order.status);
        setNotes(data.order.notes || "");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      toast({ title: "Error", description: "Gagal memuat detail transaksi", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async () => {
    if (!order) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes })
      });
      
      if (res.ok) {
        setOrder({ ...order, status, notes });
        toast({ title: "Success", description: "Transaksi berhasil diupdate" });
      } else {
        toast({ title: "Error", description: "Gagal mengupdate transaksi", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Gagal mengupdate transaksi", variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  const deleteOrder = async () => {
    if (!order) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        toast({ title: "Success", description: "Transaksi berhasil dihapus" });
        router.push("/admin/transactions");
      } else {
        toast({ title: "Error", description: "Gagal menghapus transaksi", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Gagal menghapus transaksi", variant: "destructive" });
    } finally {
      setUpdating(false);
      setShowDeleteConfirm(false);
    }
  };

  const openWhatsApp = () => {
    if (!order) return;
    const message = `Halo ${order.customerName}, \n\nTerima kasih atas pesanan Anda!\n\n📋 *Detail Pesanan:*\n🆔 Order ID: #${order.id}\n💰 Total: Rp ${order.totalAmount?.toLocaleString("id-ID")}\n📦 Status: ${status.toUpperCase()}\n\n${order.items?.map(item => `• ${item.productName} (${item.quantity}x) - Rp ${item.totalPrice?.toLocaleString("id-ID")}`).join('\n')}\n\nJika ada pertanyaan, silakan hubungi kami.\nTerima kasih! 🙏`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`, '_blank');
  };

  const downloadInvoice = async () => {
    if (!order) return;
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/invoice`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${order.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast({ title: "Success", description: "Invoice berhasil didownload" });
      } else {
        toast({ title: "Error", description: "Gagal mendownload invoice", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Gagal mendownload invoice", variant: "destructive" });
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

  const currentStatus = STATUS_OPTIONS.find(s => s.value === status);

  return (
    <PageLayout>
      <div className="container py-8 space-y-6">
        {/* Header with Actions */}
        <div className="bg-white sticky top-0 z-10 pb-4 border-b">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Detail Transaksi #{order.id}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(order.createdAt).toLocaleDateString("id-ID", {
                    year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" onClick={openWhatsApp} size="sm">
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              <Button variant="outline" onClick={downloadInvoice} size="sm">
                <Download className="w-4 h-4 mr-2" />
                Invoice
              </Button>
              <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)} size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Informasi Pesanan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Status:</span>
                    <Badge className={`ml-2 capitalize ${currentStatus?.color}`}>
                      {currentStatus?.label}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Payment:</span>
                    <span className="ml-2">{order.paymentMethod}</span>
                  </div>
                  <div>
                    <span className="font-medium">Total Items:</span>
                    <span className="ml-2">{order.totalItems} item</span>
                  </div>
                  <div>
                    <span className="font-medium">Total Amount:</span>
                    <span className="ml-2 font-semibold text-brand-primary">
                      Rp {order.totalAmount?.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Nama:</span>
                    <p className="mt-1">{order.customerName}</p>
                  </div>
                  <div>
                    <span className="font-medium">Email:</span>
                    <p className="mt-1">{order.customerEmail}</p>
                  </div>
                  <div>
                    <span className="font-medium">Telepon:</span>
                    <p className="mt-1 flex items-center gap-2">
                      {order.customerPhone}
                      <Button variant="ghost" size="sm" onClick={openWhatsApp}>
                        <Phone className="w-3 h-3" />
                      </Button>
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Alamat:</span>
                    <p className="mt-1 text-sm text-gray-600">{order.customerAddress || '-'}</p>
                  </div>
                </div>
                
                {order.reseller && (
                  <div className="pt-4 border-t">
                    <span className="font-medium text-blue-600">Reseller:</span>
                    <div className="mt-2 bg-blue-50 p-3 rounded-lg">
                      <p className="font-semibold">{order.reseller.name}</p>
                      <p className="text-sm text-gray-600">ID: {order.reseller.uniqueId}</p>
                      <p className="text-sm text-gray-600">WA: {order.reseller.whatsappNumber}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

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
                          <Badge variant="secondary" className="text-xs mt-1">
                            {item.variantName}: {item.variantValue}
                          </Badge>
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

          {/* Actions Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Update Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Status Transaksi</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${option.color.split(' ')[0]}`}></span>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Catatan Internal</label>
                  <Textarea
                    placeholder="Tambahkan catatan untuk transaksi ini..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>
                
                <Button 
                  onClick={updateOrder} 
                  disabled={updating} 
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updating ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Konfirmasi Hapus Transaksi</h3>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus transaksi #{order.id}? 
                Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-3 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={updating}
                >
                  Batal
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={deleteOrder}
                  disabled={updating}
                >
                  {updating ? 'Menghapus...' : 'Hapus Transaksi'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}