// src/app/admin/roles/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PERMISSIONS } from "@/lib/permissions";

interface Role {
  id: number;
  name: string;
  permissions: string[];
  _count?: {
    users: number;
  };
  createdAt: string;
}

export default function RolesManagement() {
  const { data: session } = useSession();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    permissions: [] as string[],
  });

  useEffect(() => {
    if (session?.user.role !== "DEVELOPER") {
      window.location.href = "/admin";
      return;
    }
    fetchRoles();
  }, [session]);

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/roles");
      const data = await res.json();
      setRoles(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingRole ? `/api/roles/${editingRole.id}` : "/api/roles";
      const method = editingRole ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchRoles();
        setShowModal(false);
        resetForm();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to save role");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to save role");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, roleName: string) => {
    if (roleName === "DEVELOPER") {
      alert("Tidak dapat menghapus role DEVELOPER!");
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus role ${roleName}?`)) return;

    try {
      const res = await fetch(`/api/roles/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchRoles();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleEdit = (role: Role) => {
    if (role.name === "DEVELOPER") {
      alert("Role DEVELOPER tidak dapat diedit!");
      return;
    }

    setEditingRole(role);
    setFormData({
      name: role.name,
      permissions: role.permissions,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingRole(null);
    setFormData({
      name: "",
      permissions: [],
    });
  };

  const togglePermission = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const selectAllPermissions = () => {
    setFormData((prev) => ({
      ...prev,
      permissions: Object.values(PERMISSIONS),
    }));
  };

  const deselectAllPermissions = () => {
    setFormData((prev) => ({
      ...prev,
      permissions: [],
    }));
  };

  if (session?.user.role !== "DEVELOPER") {
    return null;
  }

  // Group permissions by category
  const permissionGroups = {
    Products: Object.entries(PERMISSIONS)
      .filter(([key]) => key.startsWith("PRODUCTS_"))
      .map(([, value]) => value),
    Resellers: Object.entries(PERMISSIONS)
      .filter(([key]) => key.startsWith("RESELLERS_"))
      .map(([, value]) => value),
    Users: Object.entries(PERMISSIONS)
      .filter(([key]) => key.startsWith("USERS_"))
      .map(([, value]) => value),
    Others: Object.entries(PERMISSIONS)
      .filter(
        ([key]) =>
          !key.startsWith("PRODUCTS_") &&
          !key.startsWith("RESELLERS_") &&
          !key.startsWith("USERS_")
      )
      .map(([, value]) => value),
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Manajemen Roles & Permissions
          </h1>
          <p className="text-gray-600 mt-1">
            Kelola roles dan hak akses pengguna
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold"
        >
          ➕ Tambah Role
        </button>
      </div>

      {/* Roles Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div
            key={role.id}
            className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all ${
              role.name === "DEVELOPER"
                ? "border-2 border-red-500"
                : "hover:scale-105"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-gray-800">
                    {role.name}
                  </h3>
                  {role.name === "DEVELOPER" && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">
                      PROTECTED
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {role._count?.users || 0} pengguna
                </p>
              </div>
              <div className="text-3xl">
                {role.name === "DEVELOPER" ? "👑" : "🔐"}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs font-bold text-gray-700 mb-2">
                Permissions ({role.permissions.length})
              </p>
              <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                {role.permissions.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 5).map((perm, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                      >
                        {perm.split(":")[1]}
                      </span>
                    ))}
                    {role.permissions.length > 5 && (
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                        +{role.permissions.length - 5} more
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">Tidak ada permission</p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(role)}
                disabled={role.name === "DEVELOPER"}
                className="flex-1 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => handleDelete(role.id, role.name)}
                disabled={role.name === "DEVELOPER"}
                className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                🗑️ Hapus
              </button>
            </div>

            <div className="mt-3 pt-3 border-t text-xs text-gray-500">
              Dibuat: {new Date(role.createdAt).toLocaleDateString("id-ID")}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 my-8">
            <h2 className="text-2xl font-bold mb-6">
              {editingRole ? "Edit Role" : "Tambah Role Baru"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nama Role
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border rounded-lg p-3"
                  placeholder="ADMIN, STAFF, dll"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium">
                    Permissions
                  </label>
                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={selectAllPermissions}
                      className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={deselectAllPermissions}
                      className="text-xs px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                <div className="border rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto">
                  {Object.entries(permissionGroups).map(
                    ([group, permissions]) => (
                      <div key={group} className="space-y-2">
                        <h4 className="font-bold text-sm text-gray-700 border-b pb-2">
                          {group}
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {permissions.map((permission) => (
                            <label
                              key={permission}
                              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={formData.permissions.includes(
                                  permission
                                )}
                                onChange={() => togglePermission(permission)}
                                className="w-4 h-4"
                              />
                              <span className="text-sm">{permission}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>

                <p className="text-xs text-gray-600 mt-2">
                  {formData.permissions.length} permissions dipilih
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? "Saving..." : editingRole ? "Update" : "Simpan"}
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
