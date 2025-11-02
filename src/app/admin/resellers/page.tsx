// src/app/admin/resellers/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Reseller {
  id: number;
  name: string;
  whatsappNumber: string;
  uniqueId: string;
  createdAt: string;
}

export default function ResellersManagement() {
  const { data: session } = useSession();
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReseller, setEditingReseller] = useState<Reseller | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    whatsappNumber: "",
    uniqueId: "",
  });

  useEffect(() => {
    fetchResellers();
  }, []);

  const fetchResellers = async () => {
    try {
      const res = await fetch("/api/resellers");
      const data = await res.json();
      setResellers(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateUniqueId = () => {
    const prefix = "RESELLER";
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingReseller
        ? `/api/resellers/${editingReseller.id}`
        : "/api/resellers";
      const method = editingReseller ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchResellers();
        setShowModal(false);
        resetForm();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to save reseller");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to save reseller");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus reseller ini?")) return;

    try {
      const res = await fetch(`/api/resellers/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchResellers();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleEdit = (reseller: Reseller) => {
    setEditingReseller(reseller);
    setFormData({
      name: reseller.name,
      whatsappNumber: reseller.whatsappNumber,
      uniqueId: reseller.uniqueId,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingReseller(null);
    setFormData({
      name: "",
      whatsappNumber: "",
      uniqueId: "",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("ID berhasil disalin!");
  };

  // ✨ NEW FUNCTION: Copy Reseller Link
  const copyResellerLink = (uniqueId: string) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/products?ref=${uniqueId}`;
    navigator.clipboard.writeText(link);
    alert("Link reseller berhasil disalin!\n\n" + link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Manajemen Reseller
          </h1>
          <p className="text-gray-600 mt-1">
            Kelola reseller dan ID unik mereka
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setFormData({ ...formData, uniqueId: generateUniqueId() });
            setShowModal(true);
          }}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold"
        >
          ➕ Tambah Reseller
        </button>
      </div>

      {/* Resellers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resellers.map((reseller) => (
          <div
            key={reseller.id}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:scale-105"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {reseller.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{reseller.name}</h3>
                  <p className="text-sm text-gray-600">
                    📱 {reseller.whatsappNumber}
                  </p>
                </div>
              </div>
            </div>

            {/* ID Unik Section */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 font-medium">ID Unik</p>
                  <p className="font-mono font-bold text-purple-600">
                    {reseller.uniqueId}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(reseller.uniqueId)}
                  className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                >
                  📋 Copy
                </button>
              </div>
            </div>

            {/* ✨ NEW: Reseller Link Section */}
            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-600 font-medium mb-2">
                Link Reseller
              </p>
              <button
                onClick={() => copyResellerLink(reseller.uniqueId)}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
              >
                🔗 Copy Link Produk
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(reseller)}
                className="flex-1 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => handleDelete(reseller.id)}
                className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
              >
                🗑️ Hapus
              </button>
            </div>

            {/* Created Date */}
            <div className="mt-3 pt-3 border-t text-xs text-gray-500">
              Dibuat: {new Date(reseller.createdAt).toLocaleDateString("id-ID")}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {resellers.length === 0 && !loading && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Belum Ada Reseller
          </h3>
          <p className="text-gray-600">
            Klik tombol "Tambah Reseller" untuk mulai menambahkan reseller
          </p>
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-6">
              {editingReseller ? "Edit Reseller" : "Tambah Reseller"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nama Reseller
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border rounded-lg p-3"
                  placeholder="Nama Lengkap"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Nomor WhatsApp
                </label>
                <input
                  type="text"
                  required
                  value={formData.whatsappNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, whatsappNumber: e.target.value })
                  }
                  className="w-full border rounded-lg p-3"
                  placeholder="628123456789"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Format: 628xxx (tanpa +)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  ID Unik
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.uniqueId}
                    onChange={(e) =>
                      setFormData({ ...formData, uniqueId: e.target.value })
                    }
                    className="flex-1 border rounded-lg p-3 font-mono"
                    placeholder="RESELLER-XXX"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, uniqueId: generateUniqueId() })
                    }
                    className="px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    🔄
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 disabled:bg-gray-400"
                >
                  {loading
                    ? "Saving..."
                    : editingReseller
                    ? "Update"
                    : "Simpan"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
