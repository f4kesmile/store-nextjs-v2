// src/app/admin/settings/page.tsx - GANTI SELURUH ISI
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    storeName: "",
    storeDescription: "",
    supportWhatsApp: "",
    supportEmail: "",
    storeLocation: "",
    aboutTitle: "",
    aboutDescription: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setFormData({
        storeName: data.storeName || "",
        storeDescription: data.storeDescription || "",
        supportWhatsApp: data.supportWhatsApp || "",
        supportEmail: data.supportEmail || "",
        storeLocation: data.storeLocation || "",
        aboutTitle: data.aboutTitle || "",
        aboutDescription: data.aboutDescription || "",
      });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("✅ Settings berhasil disimpan!");
      } else {
        alert("❌ Gagal menyimpan settings");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Gagal menyimpan settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">⚙️ Pengaturan Toko</h1>
        <p className="text-gray-600 mt-1">Kelola pengaturan dasar toko Anda</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">📋 Informasi Dasar</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nama Toko <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={(e) =>
                  setFormData({ ...formData, storeName: e.target.value })
                }
                className="w-full border rounded-lg p-3"
                placeholder="Devlog Store"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Deskripsi Toko
              </label>
              <textarea
                rows={3}
                value={formData.storeDescription}
                onChange={(e) =>
                  setFormData({ ...formData, storeDescription: e.target.value })
                }
                className="w-full border rounded-lg p-3"
                placeholder="Platform digital terpercaya Anda..."
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">📞 Informasi Kontak</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Email Support <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.supportEmail}
                onChange={(e) =>
                  setFormData({ ...formData, supportEmail: e.target.value })
                }
                className="w-full border rounded-lg p-3"
                placeholder="support@devlog.my.id"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email yang akan ditampilkan di halaman kontak
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                WhatsApp Support <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.supportWhatsApp}
                onChange={(e) =>
                  setFormData({ ...formData, supportWhatsApp: e.target.value })
                }
                className="w-full border rounded-lg p-3"
                placeholder="6285185031023"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: 628xxx (tanpa +). Nomor ini akan digunakan untuk
                checkout.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Lokasi Kantor
              </label>
              <textarea
                rows={2}
                value={formData.storeLocation}
                onChange={(e) =>
                  setFormData({ ...formData, storeLocation: e.target.value })
                }
                className="w-full border rounded-lg p-3"
                placeholder="Tegal, Jawa Tengah, Indonesia"
              />
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">ℹ️ Tentang Toko</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Judul Tentang
              </label>
              <input
                type="text"
                value={formData.aboutTitle}
                onChange={(e) =>
                  setFormData({ ...formData, aboutTitle: e.target.value })
                }
                className="w-full border rounded-lg p-3"
                placeholder="Tentang Devlog Store"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Deskripsi Tentang
              </label>
              <textarea
                rows={5}
                value={formData.aboutDescription}
                onChange={(e) =>
                  setFormData({ ...formData, aboutDescription: e.target.value })
                }
                className="w-full border rounded-lg p-3"
                placeholder="Devlog Store adalah platform digital terpercaya..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Teks ini akan ditampilkan di halaman kontak
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all"
          >
            {saving ? "💾 Menyimpan..." : "💾 Simpan Semua Pengaturan"}
          </button>
        </div>
      </form>

      {/* Preview Card */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-dashed border-purple-300">
        <h3 className="font-bold text-lg mb-3">👁️ Preview Kontak</h3>
        <div className="bg-white rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📧</span>
            <div>
              <p className="font-bold">Email</p>
              <p className="text-sm text-gray-600">
                {formData.supportEmail || "-"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">💬</span>
            <div>
              <p className="font-bold">WhatsApp</p>
              <p className="text-sm text-gray-600">
                {formData.supportWhatsApp || "-"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">📍</span>
            <div>
              <p className="font-bold">Lokasi</p>
              <p className="text-sm text-gray-600">
                {formData.storeLocation || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
