// src/app/admin/logs/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Log {
  id: number;
  action: string;
  timestamp: string;
  user: {
    username: string;
    email: string;
    role: {
      name: string;
    };
  };
}

export default function ActivityLogsPage() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (session?.user.role !== "DEVELOPER") {
      window.location.href = "/admin";
      return;
    }
    fetchLogs();
  }, [session]);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/logs");
      const data = await res.json();
      setLogs(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(filter.toLowerCase()) ||
      log.user.username.toLowerCase().includes(filter.toLowerCase())
  );

  if (session?.user.role !== "DEVELOPER") {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Activity Logs</h1>
        <p className="text-gray-600 mt-1">
          Semua aktivitas admin tercatat di sini
        </p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <input
          type="text"
          placeholder="🔍 Cari aktivitas atau username..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full border rounded-lg p-3"
        />
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                  Timestamp
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                  User
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString("id-ID", {
                      dateStyle: "short",
                      timeStyle: "medium",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{log.user.username}</div>
                    <div className="text-sm text-gray-600">
                      {log.user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        log.user.role.name === "DEVELOPER"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {log.user.role.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{log.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            Tidak ada log yang ditemukan
          </div>
        )}
      </div>
    </div>
  );
}
