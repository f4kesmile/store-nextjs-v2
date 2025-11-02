"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, formatPrice } from "@/lib/utils";

interface Transaction {
  id: number;
  productId: number;
  product: { name: string };
  variant?: { name: string; value: string };
  reseller?: { name: string };
  customerName: string | null;
  customerPhone: string | null;
  quantity: number;
  totalPrice: number;
  status: string;
  notes: string | null;
  createdAt: string;
}

const Icons = {
  download: (p: any) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...p}><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M19 21H5"/></svg>),
  search: (p: any) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...p}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>),
  edit: (p: any) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>),
  trash: (p: any) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...p}><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>),
};

export default function TransactionsPage() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Toolbar
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal edit
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ status: "", notes: "", customerName: "", customerPhone: "" });

  useEffect(() => { fetchTransactions(); }, [statusFilter]);

  const fetchTransactions = async () => {
    try {
      let url = "/api/transactions";
      if (statusFilter !== "ALL") url += `?status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      setTransactions(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const filtered = useMemo(() => {
    return transactions.filter((t) =>
      t.product.name.toLowerCase().includes(filter.toLowerCase()) ||
      t.customerName?.toLowerCase().includes(filter.toLowerCase()) ||
      String(t.id).includes(filter)
    );
  }, [transactions, filter]);

  const stats = useMemo(() => {
    const total = transactions.length;
    const totalRevenue = transactions.filter((t) => t.status !== "CANCELLED").reduce((s, t) => s + Number(t.totalPrice), 0);
    const pending = transactions.filter((t) => t.status === "PENDING").length;
    const completed = transactions.filter((t) => t.status === "COMPLETED").length;
    return { total, totalRevenue, pending, completed };
  }, [transactions]);

  const openEdit = (t: Transaction) => { setEditingTransaction(t); setFormData({ status: t.status, notes: t.notes || "", customerName: t.customerName || "", customerPhone: t.customerPhone || "" }); setShowModal(true); };
  const handleDelete = async (id: number) => { if (!confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) return; try { const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" }); if (res.ok) { await fetchTransactions(); alert("✅ Transaksi berhasil dihapus!"); } else { alert("❌ Gagal menghapus transaksi"); } } catch (e) { console.error(e); alert("❌ Gagal menghapus transaksi"); } };
  const handleUpdate = async (e: React.FormEvent) => { e.preventDefault(); if (!editingTransaction) return; setLoading(true); try { const res = await fetch(`/api/transactions/${editingTransaction.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) }); if (res.ok) { await fetchTransactions(); setShowModal(false); setEditingTransaction(null); } else { alert("❌ Gagal update transaksi"); } } catch (e) { console.error(e); alert("❌ Gagal update transaksi"); } finally { setLoading(false); } };

  const badgeVariant = (status: string) => {
    if (status === "PENDING") return "warning" as const;
    if (status === "CONFIRMED" || status === "SHIPPED") return "secondary" as const;
    if (status === "COMPLETED") return "success" as const;
    if (status === "CANCELLED") return "destructive" as const;
    return "secondary" as const;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Manajemen Transaksi</CardTitle>
              <CardDescription>Kelola transaksi dengan filter dan ekspor</CardDescription>
            </div>
            <Button className="gap-2" onClick={() => window.location.assign("/api/transactions?export=excel")}> <Icons.download className="w-4 h-4"/> Export</Button>
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="relative">
              <Input placeholder="Cari order ID, produk, atau customer..." value={filter} onChange={(e) => setFilter(e.target.value)} className="pl-9"/>
              <Icons.search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
            </div>
            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger className="w-full sm:w-[220px]"><SelectValue placeholder="Filter status"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardDescription>Total</CardDescription><CardTitle className="text-2xl">{stats.total}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Revenue</CardDescription><CardTitle className="text-2xl">{formatPrice(stats.totalRevenue)}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Pending</CardDescription><CardTitle className="text-2xl">{stats.pending}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Completed</CardDescription><CardTitle className="text-2xl">{stats.completed}</CardTitle></CardHeader></Card>
      </div>

      <Card>
        <CardContent>
          {loading ? (
            <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div><p className="text-muted-foreground">Memuat transaksi...</p></div>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Reseller</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell><span className="font-mono font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded">#{t.id}</span></TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{formatDate(t.createdAt)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{t.product?.name}</div>
                        {t.variant && (<div className="text-xs text-muted-foreground">{t.variant.name}: {t.variant.value}</div>)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{t.customerName || "-"}</div>
                        <div className="text-xs text-muted-foreground">{t.customerPhone || "-"}</div>
                      </TableCell>
                      <TableCell><Badge variant={t.reseller ? "secondary" : "outline"}>{t.reseller?.name || "Direct"}</Badge></TableCell>
                      <TableCell className="font-medium">{t.quantity}</TableCell>
                      <TableCell className="font-semibold text-emerald-600">{formatPrice(Number(t.totalPrice))}</TableCell>
                      <TableCell><Badge variant={badgeVariant(t.status)}>{t.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button variant="outline" className="gap-2" onClick={() => openEdit(t)}><Icons.edit className="w-4 h-4"/>Edit</Button>
                          <Button variant="destructive" className="gap-2" onClick={() => handleDelete(t.id)}><Icons.trash className="w-4 h-4"/>Hapus</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">Tidak ada transaksi sesuai filter</div>
          )}
        </CardContent>
      </Card>

      {showModal && editingTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-6">Edit Transaksi #{editingTransaction.id}</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nama Customer</label>
                <Input type="text" value={formData.customerName} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">No. Telepon</label>
                <Input type="text" value={formData.customerPhone} onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Pilih status"/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="SHIPPED">Shipped</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Catatan</label>
                <textarea rows={3} className="w-full border rounded-lg p-3" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Tambahkan catatan..."/>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">{loading ? "Saving..." : "Simpan Perubahan"}</Button>
                <Button type="button" variant="secondary" onClick={() => { setShowModal(false); setEditingTransaction(null); }}>Batal</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
