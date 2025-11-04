"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import {
  DollarSign,
  Search,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  ArrowRight
} from "lucide-react";
import TransactionExportButton from "@/components/TransactionExportButton";

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  totalItems: number;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  createdAt: string;
  reseller?: { name: string } | null;
}

interface OrdersResponse {
  orders: Order[];
  pagination: { page: number; limit: number; total: number; hasMore: boolean };
  summary: { totalOrders: number; totalRevenue: number; pendingOrders: number; completedOrders: number };
}

export default function TransactionsPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [summary, setSummary] = useState({ totalOrders: 0, totalRevenue: 0, pendingOrders: 0, completedOrders: 0 });

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  async function fetchOrders(){
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/orders?status=${statusFilter}&limit=50`);
      const data: OrdersResponse = await res.json();
      setOrders(data.orders || []);
      setSummary(data.summary || summary);
    } finally { setLoading(false); }
  }

  const filtered = orders.filter(o =>
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return { variant: 'secondary' as const, icon: Clock, text: 'Pending' };
      case 'confirmed': return { variant: 'default' as const, icon: AlertCircle, text: 'Confirmed' };
      case 'processing': return { variant: 'default' as const, icon: ArrowRight, text: 'Processing' };
      case 'completed': return { variant: 'default' as const, icon: CheckCircle, text: 'Completed' };
      case 'cancelled': return { variant: 'destructive' as const, icon: XCircle, text: 'Cancelled' };
      case 'refunded': return { variant: 'secondary' as const, icon: AlertCircle, text: 'Refunded' };
      default: return { variant: 'secondary' as const, icon: Clock, text: status };
    }
  };

  return (
    <div className="space-y-8">
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-gradient-to-r from-primary to-secondary grid place-items-center text-white">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl">Manajemen Transaksi</CardTitle>
              <CardDescription className="text-base">Kelola semua pesanan dan transaksi dari customer</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Cari pesanan..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 items-center">
              <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <TransactionExportButton />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Sumber</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length > 0 ? filtered.map((order) => {
                  const statusInfo = getStatusBadge(order.status);
                  const StatusIcon = statusInfo.icon;
                  const source = order.reseller?.name ? `Reseller: ${order.reseller.name}` : 'Direct';
                  return (
                    <TableRow key={order.id}>
                      <TableCell><div className="font-mono text-sm">{order.id}</div></TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{order.customerName}</div>
                          <div className="text-xs text-gray-500">{order.customerEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell><div className="text-sm">{order.totalItems} item</div></TableCell>
                      <TableCell><div className="font-semibold text-primary">Rp {order.totalAmount.toLocaleString('id-ID')}</div></TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant} className="flex items-center gap-1 w-fit">
                          <StatusIcon className="w-3 h-3" />{statusInfo.text}
                        </Badge>
                      </TableCell>
                      <TableCell><div className="text-sm text-gray-600">{formatDate(order.createdAt)}</div></TableCell>
                      <TableCell><div className="text-sm">{source}</div></TableCell>
                      <TableCell>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/transactions/${order.id}`}>Lihat</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                }) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500 py-10">Belum ada transaksi</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
