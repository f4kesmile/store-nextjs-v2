"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import {
  Package,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Clock,
  Users,
  Settings,
  Plus,
  Eye,
  Activity
} from "lucide-react";

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalResellers: number;
  totalUsers: number;
  lowStockProducts: number;
  totalRevenue: number;
  pendingTransactions: number;
  todayOrders: number;
}

interface RecentOrder {
  id: string;
  customerName: string;
  totalAmount: number;
  totalItems: number;
  status: string;
  createdAt: string;
}

interface ActivityLog {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    totalResellers: 0,
    totalUsers: 0,
    lowStockProducts: 0,
    totalRevenue: 0,
    pendingTransactions: 0,
    todayOrders: 0
  });
  
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [productsRes, ordersRes, activityRes, resellersRes] = await Promise.all([
        fetch("/api/products?admin=true"),
        fetch("/api/admin/orders?limit=10"),
        fetch("/api/admin/activity?limit=10"),
        fetch("/api/resellers")
      ]);
      
      const productsData = await productsRes.json();
      const ordersData = await ordersRes.json();
      const activityData = await activityRes.json();
      const resellersData = await resellersRes.json();
      
      // Calculate stats
      const lowStockProducts = productsData.filter((product: any) => {
        const mainStockLow = product.stock <= 5;
        const variantStockLow = product.variants?.some((v: any) => v.stock <= 3);
        return mainStockLow || variantStockLow;
      });
      
      const today = new Date().toDateString();
      const todayOrders = ordersData.orders?.filter((order: any) => 
        new Date(order.createdAt).toDateString() === today
      ).length || 0;
      
      setStats({
        totalProducts: productsData.length || 0,
        activeProducts: productsData.filter((p: any) => p.status === "ACTIVE").length || 0,
        totalResellers: Array.isArray(resellersData) ? resellersData.length : 0,
        totalUsers: 1, // Placeholder
        lowStockProducts: lowStockProducts.length,
        totalRevenue: ordersData.summary?.totalRevenue || 0,
        pendingTransactions: ordersData.summary?.pendingOrders || 0,
        todayOrders
      });
      
      setRecentOrders(ordersData.orders || []);
      setRecentActivity(activityData.activities || []);
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      title: "Total Produk", 
      value: stats.totalProducts.toLocaleString("id-ID"), 
      hint: "Semua produk di katalog", 
      icon: Package, 
      accent: "from-blue-500/15 to-blue-500/5",
      color: "text-blue-600"
    },
    { 
      title: "Produk Aktif", 
      value: stats.activeProducts.toLocaleString("id-ID"), 
      hint: "Produk yang visible", 
      icon: CheckCircle, 
      accent: "from-green-500/15 to-green-500/5",
      color: "text-green-600"
    },
    { 
      title: "Stock Rendah", 
      value: stats.lowStockProducts.toLocaleString("id-ID"), 
      hint: "Butuh restock", 
      icon: AlertTriangle, 
      accent: "from-orange-500/15 to-orange-500/5",
      color: "text-orange-600"
    },
    { 
      title: "Total Revenue", 
      value: `Rp ${stats.totalRevenue.toLocaleString("id-ID")}`, 
      hint: "Transaksi sukses", 
      icon: DollarSign, 
      accent: "from-purple-500/15 to-purple-500/5",
      color: "text-purple-600"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <Card className="border-primary/10 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-gradient-to-r from-primary to-secondary grid place-items-center text-white">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl">Dashboard Overview</CardTitle>
              <CardDescription className="text-base">
                Selamat datang, <span className="font-medium">{session?.user?.name || 'Admin'}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-all duration-300 overflow-hidden group">
            <div className={`h-1 w-full bg-gradient-to-r ${stat.accent}`} />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="flex items-center gap-2">
                  <span className={`size-6 rounded-md bg-muted grid place-items-center ${stat.color}`}>
                    <stat.icon className="w-4 h-4" />
                  </span>
                  {stat.title}
                </CardDescription>
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-3xl font-bold group-hover:text-primary transition-colors">
                {stat.value}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">{stat.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Pesanan Terbaru</CardTitle>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/transactions">
                  <Eye className="w-4 h-4 mr-2" />
                  Lihat Semua
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{order.customerName}</p>
                      <p className="text-xs text-gray-500">Order #{order.id}</p>
                      <Badge variant={order.status === 'pending' ? 'secondary' : 'default'} className="text-xs">
                        {order.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">Rp {order.totalAmount.toLocaleString('id-ID')}</p>
                      <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">Belum ada pesanan</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Aktivitas Terbaru</CardTitle>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/logs">
                  <Eye className="w-4 h-4 mr-2" />
                  Lihat Semua
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-xs text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500">{formatDate(activity.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">Belum ada aktivitas</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - ALWAYS VISIBLE */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-md bg-gradient-to-r from-primary/10 to-secondary/10 grid place-items-center">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Aksi cepat yang sering digunakan</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                href: "/admin/products",
                title: "Tambah Produk",
                desc: "Kelola inventory",
                icon: Package,
                color: "from-blue-500 to-blue-600"
              },
              {
                href: "/admin/transactions",
                title: "Lihat Transaksi",
                desc: "Monitor penjualan",
                icon: DollarSign,
                color: "from-green-500 to-green-600"
              },
              {
                href: "/admin/resellers",
                title: "Kelola Reseller",
                desc: "Manage partners",
                icon: Users,
                color: "from-purple-500 to-purple-600"
              },
              {
                href: "/admin/settings",
                title: "Pengaturan",
                desc: "Store settings",
                icon: Settings,
                color: "from-orange-500 to-orange-600"
              }
            ].map(({ href, title, desc, icon: Icon, color }) => (
              <Button asChild className="w-full p-0 h-auto border-0" variant="outline" key={href}>
                <Link href={href}>
                  <div className={`w-full rounded-lg bg-gradient-to-r ${color} text-white p-4 min-h-[100px] flex items-center gap-3 hover:opacity-90 transition-opacity`}>
                    <div className="flex-shrink-0 size-10 rounded-lg bg-white/20 grid place-items-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm leading-tight">{title}</div>
                      <div className="text-xs opacity-90 leading-tight mt-1">{desc}</div>
                    </div>
                  </div>
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Today's Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Ringkasan Hari Ini
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.todayOrders}</div>
              <div className="text-sm text-blue-700">Pesanan Baru</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.pendingTransactions}</div>
              <div className="text-sm text-green-700">Menunggu Konfirmasi</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.lowStockProducts}</div>
              <div className="text-sm text-orange-700">Stok Rendah</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.activeProducts}</div>
              <div className="text-sm text-purple-700">Produk Aktif</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}