// src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

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
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    []
  );
  const [loading, setLoading] = useState(true);

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

      // Calculate low stock products (stock <= 5 or any variant stock <= 3)
      const lowStockProducts = productsData.filter((product: Product) => {
        const mainStockLow = product.stock <= 5;
        const variantStockLow = product.variants?.some((v) => v.stock <= 3);
        return mainStockLow || variantStockLow;
      });

      // Calculate total revenue from completed transactions
      const totalRevenue = transactionsData
        .filter((t: Transaction) => t.status === "COMPLETED")
        .reduce((sum: number, t: Transaction) => sum + Number(t.totalPrice), 0);

      // Count pending transactions
      const pendingTransactions = transactionsData.filter(
        (t: Transaction) => t.status === "PENDING"
      ).length;

      setStats({
        totalProducts: productsData.length,
        activeProducts: productsData.filter(
          (p: Product) => p.status === "ACTIVE"
        ).length,
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
    return products
      .filter((product) => {
        const mainStockLow = product.stock <= 5;
        const variantStockLow = product.variants?.some((v) => v.stock <= 3);
        return mainStockLow || variantStockLow;
      })
      .slice(0, 10); // Show top 10 low stock products
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0)
      return { color: "text-red-600 bg-red-100", label: "Habis" };
    if (stock <= 3)
      return { color: "text-red-600 bg-red-100", label: "Kritis" };
    if (stock <= 10)
      return { color: "text-yellow-600 bg-yellow-100", label: "Rendah" };
    return { color: "text-green-600 bg-green-100", label: "Aman" };
  };

  const statCards = [
    {
      title: "Total Produk",
      value: stats.totalProducts,
      icon: "📦",
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      textColor: "text-blue-600",
    },
    {
      title: "Produk Aktif",
      value: stats.activeProducts,
      icon: "✅",
      color: "bg-gradient-to-r from-green-500 to-green-600",
      textColor: "text-green-600",
    },
    {
      title: "Stock Rendah",
      value: stats.lowStockProducts,
      icon: "⚠️",
      color: "bg-gradient-to-r from-red-500 to-red-600",
      textColor: "text-red-600",
    },
    {
      title: "Total Revenue",
      value: `Rp ${stats.totalRevenue.toLocaleString("id-ID")}`,
      icon: "💰",
      color: "bg-gradient-to-r from-emerald-500 to-emerald-600",
      textColor: "text-emerald-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🏪 Dashboard Overview
        </h1>
        <p className="text-gray-600">
          Welcome back, <strong>{session?.user.name}</strong>! Here's your store
          overview today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  {stat.title}
                </p>
                <h3 className={`text-2xl font-bold ${stat.textColor}`}>
                  {typeof stat.value === "string" && stat.value.includes("Rp")
                    ? stat.value
                    : stat.value.toLocaleString("id-ID")}
                </h3>
              </div>
              <div
                className={`${stat.color} text-white text-3xl p-3 rounded-full shadow-md`}
              >
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stock Monitor & Alerts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              ⚠️ Stock Alert
            </h2>
            <Link
              href="/admin/products"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Kelola Stock →
            </Link>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {getLowStockProducts().length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🎉</div>
                <p className="text-gray-600">Semua produk stock aman!</p>
              </div>
            ) : (
              getLowStockProducts().map((product) => (
                <div
                  key={product.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">
                      {product.name}
                    </h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        getStockStatus(product.stock).color
                      }`}
                    >
                      {getStockStatus(product.stock).label}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Stock Utama:</strong> {product.stock} unit
                  </div>

                  {product.variants && product.variants.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500 font-medium">
                        Variants:
                      </div>
                      {product.variants.map((variant) => (
                        <div
                          key={variant.id}
                          className="flex justify-between items-center text-xs"
                        >
                          <span className="text-gray-600">
                            {variant.name}: {variant.value}
                          </span>
                          <span
                            className={`px-2 py-1 rounded ${
                              getStockStatus(variant.stock).color
                            }`}
                          >
                            {variant.stock} unit
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 text-xs text-gray-500">
                    Harga: Rp {product.price.toLocaleString("id-ID")}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              💳 Transaksi Terbaru
            </h2>
            <Link
              href="/admin/transactions"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Lihat Semua →
            </Link>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📭</div>
                <p className="text-gray-600">Belum ada transaksi</p>
              </div>
            ) : (
              recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="border border-gray-200 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-semibold text-purple-600">
                      #{transaction.id}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : transaction.status === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </div>

                  <div className="text-sm text-gray-800 mb-1">
                    {transaction.product.name}
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-600">
                    <span>
                      Rp{" "}
                      {Number(transaction.totalPrice).toLocaleString("id-ID")}
                    </span>
                    <span>
                      {new Date(transaction.createdAt).toLocaleDateString(
                        "id-ID"
                      )}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-6 text-gray-800">
          🚀 Quick Actions
        </h2>
        <div className="grid md:grid-cols-4 gap-4">
          <Link
            href="/admin/products"
            className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 text-center block"
          >
            <div className="text-4xl mb-3">➕</div>
            <div className="font-bold">Tambah Produk</div>
            <div className="text-sm opacity-90 mt-1">Kelola inventory</div>
          </Link>

          <Link
            href="/admin/resellers"
            className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105 text-center block"
          >
            <div className="text-4xl mb-3">👥</div>
            <div className="font-bold">Kelola Reseller</div>
            <div className="text-sm opacity-90 mt-1">Manage partners</div>
          </Link>

          <Link
            href="/admin/transactions"
            className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 text-center block"
          >
            <div className="text-4xl mb-3">💳</div>
            <div className="font-bold">Lihat Transaksi</div>
            <div className="text-sm opacity-90 mt-1">Monitor sales</div>
          </Link>

          <Link
            href="/admin/settings"
            className="p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 text-center block"
          >
            <div className="text-4xl mb-3">⚙️</div>
            <div className="font-bold">Pengaturan</div>
            <div className="text-sm opacity-90 mt-1">Store settings</div>
          </Link>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-lg p-6 border border-green-200">
        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
          📊 System Status
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl mb-2">✅</div>
            <div className="font-semibold text-green-700">System Online</div>
            <div className="text-sm text-gray-600">All systems operational</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🔄</div>
            <div className="font-semibold text-blue-700">Auto-Sync Active</div>
            <div className="text-sm text-gray-600">Data synchronized</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🛡️</div>
            <div className="font-semibold text-purple-700">
              Secure Connection
            </div>
            <div className="text-sm text-gray-600">SSL encrypted</div>
          </div>
        </div>
      </div>
    </div>
  );
}
