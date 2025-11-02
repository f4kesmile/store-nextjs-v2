// src/app/admin/transactions/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import TransactionExportButton from "@/components/TransactionExportButton"; // Tambahkan import ini

interface Transaction {
  id: number;
  productId: number;
  product: {
    name: string;
  };
  variant?: {
    name: string;
    value: string;
  };
  reseller?: {
    name: string;
  };
  customerName: string | null;
  customerPhone: string | null;
  quantity: number;
  totalPrice: number;
  status: string;
  notes: string | null;
  createdAt: string;
}

export default function TransactionsPage() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    status: "",
    notes: "",
    customerName: "",
    customerPhone: "",
  });

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter]);

  const fetchTransactions = async () => {
    try {
      let url = "/api/transactions";
      if (statusFilter !== "ALL") {
        url += `?status=${statusFilter}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      status: transaction.status,
      notes: transaction.notes || "",
      customerName: transaction.customerName || "",
      customerPhone: transaction.customerPhone || "",
    });
    setShowModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/transactions/${editingTransaction.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchTransactions();
        setShowModal(false);
        setEditingTransaction(null);
        alert("✅ Transaksi berhasil diupdate!");
      } else {
        alert("❌ Gagal update transaksi");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Gagal update transaksi");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) return;

    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchTransactions();
        alert("✅ Transaksi berhasil dihapus!");
      } else {
        alert("❌ Gagal menghapus transaksi");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Gagal menghapus transaksi");
    }
  };

  // HAPUS function handleExport yang lama - tidak dipakai lagi

  const filteredTransactions = transactions.filter(
    (t) =>
      t.product.name.toLowerCase().includes(filter.toLowerCase()) ||
      t.customerName?.toLowerCase().includes(filter.toLowerCase()) ||
      t.id.toString().includes(filter)
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: "bg-yellow-100 text-yellow-700",
      CONFIRMED: "bg-blue-100 text-blue-700",
      SHIPPED: "bg-purple-100 text-purple-700",
      COMPLETED: "bg-green-100 text-green-700",
      CANCELLED: "bg-red-100 text-red-700",
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-700";
  };

  const calculateStats = () => {
    const total = transactions.length;
    const totalRevenue = transactions
      .filter((t) => t.status !== "CANCELLED")
      .reduce((sum, t) => sum + parseFloat(t.totalPrice.toString()), 0);
    const pending = transactions.filter((t) => t.status === "PENDING").length;
    const completed = transactions.filter(
      (t) => t.status === "COMPLETED"
    ).length;

    return { total, totalRevenue, pending, completed };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Header dengan tombol export yang baru */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Manajemen Transaksi
          </h1>
          <p className="text-gray-600 mt-1">
            Kelola semua transaksi penjualan dengan filter dan export canggih
          </p>
        </div>
        {/* Ganti button export lama dengan TransactionExportButton */}
        <TransactionExportButton />
      </div>

      {/* Stats Cards - Enhanced */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-blue-600 mb-1 font-medium">
                Total Transaksi
              </div>
              <div className="text-3xl font-bold text-blue-800">
                {stats.total}
              </div>
            </div>
            <div className="text-3xl text-blue-500">📊</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-green-600 mb-1 font-medium">
                Total Revenue
              </div>
              <div className="text-2xl font-bold text-green-800">
                Rp {stats.totalRevenue.toLocaleString("id-ID")}
              </div>
            </div>
            <div className="text-3xl text-green-500">💰</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-lg p-6 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-yellow-600 mb-1 font-medium">
                Pending
              </div>
              <div className="text-3xl font-bold text-yellow-800">
                {stats.pending}
              </div>
            </div>
            <div className="text-3xl text-yellow-500">⏳</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-purple-600 mb-1 font-medium">
                Completed
              </div>
              <div className="text-3xl font-bold text-purple-800">
                {stats.completed}
              </div>
            </div>
            <div className="text-3xl text-purple-500">✅</div>
          </div>
        </div>
      </div>

      {/* Filters - Enhanced */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          🔍 Filter & Pencarian
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cari Transaksi
            </label>
            <input
              type="text"
              placeholder="🔍 Cari order ID, produk, atau customer..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">📋 Semua Status</option>
              <option value="PENDING">⏳ Pending</option>
              <option value="CONFIRMED">🔄 Confirmed</option>
              <option value="SHIPPED">🚚 Shipped</option>
              <option value="COMPLETED">✅ Completed</option>
              <option value="CANCELLED">❌ Cancelled</option>
            </select>
          </div>
        </div>

        {(filter || statusFilter !== "ALL") && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Menampilkan {filteredTransactions.length} dari{" "}
              {transactions.length} transaksi
            </span>
            {filter && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                Pencarian: "{filter}"
              </span>
            )}
            {statusFilter !== "ALL" && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                Status: {statusFilter}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat transaksi...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                    Tanggal & Waktu
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                    Produk
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                    Reseller
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                    Qty
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">
                        #{transaction.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-800">
                        {new Date(transaction.createdAt).toLocaleDateString(
                          "id-ID",
                          {
                            weekday: "short",
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(transaction.createdAt).toLocaleTimeString(
                          "id-ID",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          }
                        )}{" "}
                        WIB
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {transaction.product.name}
                      </div>
                      {transaction.variant && (
                        <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                          {transaction.variant.name}:{" "}
                          {transaction.variant.value}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.customerName || "-"}
                      </div>
                      <div className="text-xs text-gray-600">
                        {transaction.customerPhone || "-"}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          transaction.reseller
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {transaction.reseller?.name || "Direct"}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-semibold">
                      {transaction.quantity}
                    </td>

                    <td className="px-6 py-4 font-bold text-green-600">
                      Rp{" "}
                      {parseFloat(
                        transaction.totalPrice.toString()
                      ).toLocaleString("id-ID")}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(
                          transaction.status
                        )}`}
                      >
                        {transaction.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm transition-colors"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm transition-colors"
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredTransactions.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Tidak ada transaksi ditemukan
            </h3>
            <p className="text-gray-600">
              {filter || statusFilter !== "ALL"
                ? "Coba ubah filter pencarian Anda"
                : "Belum ada transaksi yang masuk"}
            </p>
          </div>
        )}
      </div>

      {/* Edit Modal - tetap sama */}
      {showModal && editingTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              ✏️ Edit Transaksi #{editingTransaction.id}
            </h2>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nama Customer
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  No. Telepon
                </label>
                <input
                  type="text"
                  value={formData.customerPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, customerPhone: e.target.value })
                  }
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="PENDING">⏳ Pending</option>
                  <option value="CONFIRMED">🔄 Confirmed</option>
                  <option value="SHIPPED">🚚 Shipped</option>
                  <option value="COMPLETED">✅ Completed</option>
                  <option value="CANCELLED">❌ Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Catatan
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tambahkan catatan untuk transaksi ini..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {loading ? "Saving..." : "💾 Update"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTransaction(null);
                  }}
                  className="px-6 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  ❌ Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
