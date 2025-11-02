"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatPrice } from "@/lib/utils";

interface Product {
  id: number;
  name: string;
  stock: number;
  status: string;
  price: number;
  variants: Array<{
    id: number;
    name: string;
    value: string;
    stock: number;
  }>;
}

interface Transaction {
  id: number;
  status: string;
  totalPrice: number;
  createdAt: string;
  product: {
    name: string;
  };
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalResellers: 0,
    totalUsers: 0,
    lowStockProducts: 0,
    totalRevenue: 0,
    pendingTransactions: 0,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [query, setQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<"ALL" | "LOW" | "CRITICAL" | "OUT">("ALL");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [productsRes, resellersRes, transactionsRes] = await Promise.all([
        fetch("/api/products?admin=true"),
        fetch("/api/resellers"),
        fetch("/api/transactions?limit=5"),
      ]);

      const productsData = await productsRes.json();
      const resellersData = await resellersRes.json();
      const transactionsData = await transactionsRes.json();

      const lowStockProducts = productsData.filter((product: Product) => {
        const mainStockLow = product.stock <= 5;
        const variantStockLow = product.variants?.some((v: any) => v.stock <= 3);
        return mainStockLow || variantStockLow;
      });

      const totalRevenue = transactionsData
        .filter((t: Transaction) => t.status === "COMPLETED")
        .reduce((sum: number, t: Transaction) => sum + Number(t.totalPrice), 0);

      const pendingTransactions = transactionsData.filter(
        (t: Transaction) => t.status === "PENDING"
      ).length;

      setStats({
        totalProducts: productsData.length,
        activeProducts: productsData.filter((p: Product) => p.status === "ACTIVE").length,
        totalResellers: resellersData.length,
        totalUsers: 0,
        lowStockProducts: lowStockProducts.length,
        totalRevenue,
        pendingTransactions,
      });

      setProducts(productsData);
      setRecentTransactions(transactionsData.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLowStockProducts = () => {
    const filtered = products.filter((product) => {
      const mainStockLow = product.stock <= 5;
      const variantStockLow = product.variants?.some((v) => v.stock <= 3);
      const low = mainStockLow || variantStockLow;

      if (stockFilter === "ALL") return low;
      if (stockFilter === "CRITICAL") return product.stock <= 3;
      if (stockFilter === "OUT") return product.stock === 0;
      if (stockFilter === "LOW") return product.stock > 3 && low;
      return low;
    });

    return filtered
      .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10);
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) return { variant: "destructive" as const, label: "Habis" };
    if (stock <= 3) return { variant: "destructive" as const, label: "Kritis" };
    if (stock <= 10) return { variant: "warning" as const, label: "Rendah" };
    return { variant: "success" as const, label: "Aman" };
  };

  const statCards = [
    {
      title: "Total Produk",
      value: stats.totalProducts.toLocaleString("id-ID"),
      hint: "Semua produk di katalog",
    },
    {
      title: "Produk Aktif",
      value: stats.activeProducts.toLocaleString("id-ID"),
      hint: "Produk yang visible",
    },
    {
      title: "Stock Rendah",
      value: stats.lowStockProducts.toLocaleString("id-ID"),
      hint: "Butuh restock",
    },
    {
      title: "Total Revenue",
      value: formatPrice(stats.totalRevenue),
      hint: "Transaksi sukses",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-primary/10">
        <CardHeader>
          <CardTitle className="text-2xl">🏪 Dashboard Overview</CardTitle>
          <CardDescription>
            Welcome back, <span className="font-medium">{session?.user.name}</span>. Here is your store status today.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardDescription>{s.title}</CardDescription>
              <CardTitle className="text-2xl">{s.value}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">
              {s.hint}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Low Stock */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">⚠️ Stock Alert</CardTitle>
                <CardDescription>Produk yang perlu perhatian</CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link href="/admin/products">Kelola Stock</Link>
              </Button>
            </div>
            <div className="flex gap-2 pt-2">
              <Input
                placeholder="Cari produk..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="max-w-xs"
              />
              <Select
                value={stockFilter}
                onValueChange={(v: any) => setStockFilter(v)}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua</SelectItem>
                  <SelectItem value="LOW">Rendah</SelectItem>
                  <SelectItem value="CRITICAL">Kritis</SelectItem>
                  <SelectItem value="OUT">Habis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {getLowStockProducts().length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="text-muted-foreground">Semua produk aman</p>
                </div>
              ) : (
                getLowStockProducts().map((product) => (
                  <div key={product.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{product.name}</h4>
                      <Badge variant={getStockBadge(product.stock).variant}>
                        {getStockBadge(product.stock).label}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Stock utama: {product.stock} unit
                    </div>
                    {product.variants && product.variants.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <div className="text-xs text-muted-foreground font-medium">
                          Variants
                        </div>
                        {product.variants.map((variant) => (
                          <div key={variant.id} className="flex justify-between text-xs">
                            <span>
                              {variant.name}: {variant.value}
                            </span>
                            <Badge variant={getStockBadge(variant.stock).variant}>
                              {variant.stock}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 text-xs text-muted-foreground">
                      Harga: {formatPrice(product.price)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">💳 Transaksi Terbaru</CardTitle>
                <CardDescription>5 transaksi terakhir</CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link href="/admin/transactions">Lihat Semua</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📭</div>
                <p className="text-muted-foreground">Belum ada transaksi</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Tanggal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs">#{t.id}</TableCell>
                      <TableCell>{t.product?.name ?? "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            t.status === "PENDING"
                              ? "warning"
                              : t.status === "COMPLETED"
                              ? "success"
                              : "secondary"
                          }
                        >
                          {t.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPrice(Number(t.totalPrice))}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatDate(t.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🚀 Quick Actions</CardTitle>
          <CardDescription>Aksi cepat yang sering digunakan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <Button asChild className="h-auto py-6">
              <Link href="/admin/products" className="w-full text-left">
                <div className="text-3xl mb-1">➕</div>
                <div className="font-semibold">Tambah Produk</div>
                <div className="text-sm text-muted-foreground">Kelola inventory</div>
              </Link>
            </Button>
            <Button asChild className="h-auto py-6">
              <Link href="/admin/resellers" className="w-full text-left">
                <div className="text-3xl mb-1">👥</div>
                <div className="font-semibold">Kelola Reseller</div>
                <div className="text-sm text-muted-foreground">Manage partners</div>
              </Link>
            </Button>
            <Button asChild className="h-auto py-6">
              <Link href="/admin/transactions" className="w-full text-left">
                <div className="text-3xl mb-1">💳</div>
                <div className="font-semibold">Lihat Transaksi</div>
                <div className="text-sm text-muted-foreground">Monitor sales</div>
              </Link>
            </Button>
            <Button asChild className="h-auto py-6">
              <Link href="/admin/settings" className="w-full text-left">
                <div className="text-3xl mb-1">⚙️</div>
                <div className="font-semibold">Pengaturan</div>
                <div className="text-sm text-muted-foreground">Store settings</div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">📊 System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-1">✅</div>
              <div className="font-semibold text-green-700">System Online</div>
              <div className="text-sm text-muted-foreground">All systems operational</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">🔄</div>
              <div className="font-semibold text-blue-700">Auto-Sync Active</div>
              <div className="text-sm text-muted-foreground">Data synchronized</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">🛡️</div>
              <div className="font-semibold text-purple-700">Secure Connection</div>
              <div className="text-sm text-muted-foreground">SSL encrypted</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
