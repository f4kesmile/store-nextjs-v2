// src/components/TransactionExportButton.tsx
"use client";

import { useState, useEffect } from "react";

interface Reseller {
  id: number;
  name: string;
}

interface TransactionExportButtonProps {
  className?: string;
}

export default function TransactionExportButton({
  className = "",
}: TransactionExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [resellers, setResellers] = useState<Reseller[]>([]);

  // Filter states
  const [filters, setFilters] = useState({
    format: "xlsx",
    status: "all",
    dateFrom: "",
    dateTo: "",
    resellerId: "all",
  });

  useEffect(() => {
    if (showOptions) {
      fetchResellers();
    }
  }, [showOptions]);

  const fetchResellers = async () => {
    try {
      const res = await fetch("/api/resellers");
      if (res.ok) {
        const data = await res.json();
        setResellers(data);
      }
    } catch (error) {
      console.error("Error fetching resellers:", error);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setShowOptions(false);

    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") {
          params.append(key, value);
        }
      });

      console.log("🚀 Starting transaction export with filters:", filters);

      const response = await fetch(`/api/transactions/export?${params}`);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Export failed: ${response.status} ${error}`);
      }

      // Get filename from response headers
      const contentDisposition = response.headers.get("content-disposition");
      const filename =
        contentDisposition?.match(/filename="(.+)"/)?.[1] ||
        `transactions_export_${Date.now()}.${filters.format}`;

      console.log("📄 Downloading file:", filename);

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      console.log("✅ Export completed successfully");
      alert(`✅ File ${filename} berhasil didownload!`);
    } catch (error) {
      console.error("💥 Export error:", error);
      alert(
        `❌ Gagal export data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={exporting}
        className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold disabled:bg-gray-400 flex items-center gap-2 transition-all"
      >
        {exporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Exporting...
          </>
        ) : (
          <>📊 Export Transaksi</>
        )}
      </button>

      {showOptions && !exporting && (
        <div className="absolute top-12 right-0 bg-white rounded-lg shadow-xl border z-50 min-w-96">
          <div className="p-4 border-b bg-gradient-to-r from-emerald-50 to-green-50">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              📊 Export Transaksi
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Pilih filter dan format export
            </p>
          </div>

          <div className="p-4 space-y-4">
            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Format File
              </label>
              <select
                value={filters.format}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, format: e.target.value }))
                }
                className="w-full border rounded-lg p-2"
              >
                <option value="xlsx">📈 Excel (XLSX) - Recommended</option>
                <option value="csv">📄 CSV - Universal</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Status Transaksi
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full border rounded-lg p-2"
              >
                <option value="all">Semua Status</option>
                <option value="PENDING">⏳ Pending</option>
                <option value="COMPLETED">✅ Completed</option>
                <option value="CANCELLED">❌ Cancelled</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Dari Tanggal
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      dateFrom: e.target.value,
                    }))
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Sampai Tanggal
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>
            </div>

            {/* Reseller Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Reseller</label>
              <select
                value={filters.resellerId}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    resellerId: e.target.value,
                  }))
                }
                className="w-full border rounded-lg p-2"
              >
                <option value="all">Semua Reseller & Direct</option>
                <option value="direct">Direct Sales Only</option>
                {resellers.map((reseller) => (
                  <option key={reseller.id} value={reseller.id.toString()}>
                    {reseller.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 font-bold transition-all"
            >
              📊 Export Data
            </button>
          </div>

          <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 text-xs text-gray-600 rounded-b-lg border-t">
            <strong>💡 Export akan mencakup:</strong>
            <ul className="mt-1 space-y-1">
              <li>• Data transaksi dengan filter yang dipilih</li>
              <li>• Ringkasan statistik transaksi</li>
              <li>• Info metadata export</li>
              <li>• Color coding untuk status (Excel only)</li>
            </ul>
          </div>

          <button
            onClick={() => setShowOptions(false)}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Backdrop */}
      {showOptions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowOptions(false)}
        />
      )}
    </div>
  );
}
