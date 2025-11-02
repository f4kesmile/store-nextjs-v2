"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Package, MessageCircle, Download, Trash2, Save, ArrowLeft } from "lucide-react";

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat detail transaksi...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Transaksi Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">Transaksi yang Anda cari tidak ditemukan atau telah dihapus.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  const currentStatus = STATUS_OPTIONS.find(s => s.value === status);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Actions Header */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => router.back()} size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
              <div>
                <h1 className="text-xl font-bold">Invoice #{order.id}</h1>
                <p className="text-sm text-gray-500">
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
                Download PDF
              </Button>
              <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)} size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Invoice */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border p-8 print:shadow-none print:border-none">
              {/* Invoice Header */}
              <div className="border-b pb-6 mb-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h2>
                    <p className="text-lg font-semibold text-blue-600">#{order.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Tanggal Invoice</p>
                    <p className="font-semibold">{new Date(order.createdAt).toLocaleDateString('id-ID')}</p>
                    <Badge className={`mt-2 ${currentStatus?.color}`}>
                      {currentStatus?.label}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Bill To</h3>
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900">{order.customerName}</p>
                    <p className="text-gray-600">{order.customerEmail}</p>
                    <p className="text-gray-600">{order.customerPhone}</p>
                    {order.customerAddress && (
                      <p className="text-gray-600 text-sm">{order.customerAddress}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Payment Info</h3>
                  <div className="space-y-1">
                    <p><span className="text-gray-600">Method:</span> <span className="font-semibold">{order.paymentMethod}</span></p>
                    <p><span className="text-gray-600">Total Items:</span> <span className="font-semibold">{order.totalItems}</span></p>
                    {order.reseller && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-semibold text-blue-800">Reseller</p>
                        <p className="text-sm text-blue-700">{order.reseller.name}</p>
                        <p className="text-xs text-blue-600">ID: {order.reseller.uniqueId}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-8">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">Item</th>
                        <th className="text-center py-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">Qty</th>
                        <th className="text-right py-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                        <th className="text-right py-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items?.map((item: OrderItem, index: number) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-4">
                            <div>
                              <p className="font-semibold text-gray-900">{item.productName}</p>
                              {item.variantName && item.variantValue && (
                                <p className="text-sm text-gray-500">{item.variantName}: {item.variantValue}</p>
                              )}
                              {item.notes && (
                                <p className="text-xs text-gray-400 mt-1 italic">{item.notes}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-4 text-center">
                            <span className="font-semibold">{item.quantity}</span>
                          </td>
                          <td className="py-4 text-right">
                            <span className="text-gray-600">Rp {item.unitPrice?.toLocaleString("id-ID")}</span>
                          </td>
                          <td className="py-4 text-right">
                            <span className="font-semibold">Rp {item.totalPrice?.toLocaleString("id-ID")}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-6">
                <div className="flex justify-end">
                  <div className="w-full max-w-sm">
                    <div className="flex justify-between py-2 text-lg font-bold">
                      <span>Total</span>
                      <span className="text-blue-600">Rp {order.totalAmount?.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="border-t pt-6 mt-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Notes</h3>
                  <p className="text-gray-600">{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Edit Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Edit Invoice</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center">
                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${option.color.split(' ')[0]}`}></span>
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <Textarea
                    placeholder="Catatan internal..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="text-sm"
                  />
                </div>
                
                <Button 
                  onClick={updateOrder} 
                  disabled={updating} 
                  className="w-full"
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updating ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Konfirmasi Hapus</h3>
              <p className="text-gray-600 mb-6">
                Yakin ingin menghapus invoice #{order.id}? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-3 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={updating}
                  size="sm"
                >
                  Batal
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={deleteOrder}
                  disabled={updating}
                  size="sm"
                >
                  {updating ? 'Menghapus...' : 'Hapus'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}